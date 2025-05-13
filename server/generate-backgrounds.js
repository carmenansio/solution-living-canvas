/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const aiHelper = require("./helpers/ai-config-helper.js");
const geminiWrapper = require("./helpers/gemini-generation.js");

const readFile = promisify(fs.readFile);

// Rate limiting configuration
const RATE_LIMIT_DELAY = 15000; // 15 seconds between requests
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 10000; // 10 seconds
const MAX_RETRY_DELAY = 120000; // 2 minutes

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const getRetryDelay = (attempt) => {
  const delay = Math.min(
    INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1),
    MAX_RETRY_DELAY
  );
  return delay;
};

const puzzleBackgrounds = {
  sandbox: {
    filename: "io_sandbox.png",
    promptId: "gemini_background_sandbox",
    maskFile: "sandbox.png",
  },
  puzzle1: {
    filename: "io_puzzle_fire.png",
    promptId: "gemini_background_puzzle1",
    maskFile: "puzzle1.png",
  },
  puzzle2: {
    filename: "io_puzzle_windy.png",
    promptId: "gemini_background_puzzle2",
    maskFile: "puzzle2.png",
  },
  puzzle3: {
    filename: "io_puzzle_ice.png",
    promptId: "gemini_background_puzzle3",
    maskFile: "puzzle3.png",
  },
  puzzle4: {
    filename: "io_puzzle_metal.png",
    promptId: "gemini_background_puzzle4",
    maskFile: "puzzle4.png",
  },
  puzzle5: {
    filename: "io_puzzle_rain.png",
    promptId: "gemini_background_puzzle5",
    maskFile: "puzzle5.png",
  },
  puzzle6: {
    filename: "io_puzzle_earth.png",
    promptId: "gemini_background_puzzle6",
    maskFile: "puzzle6.png",
  },
  puzzle7: {
    filename: "io_puzzle_lightning.png",
    promptId: "gemini_background_puzzle7",
    maskFile: "puzzle7.png",
  },
  puzzle8: {
    filename: "io_puzzle_balance.png",
    promptId: "gemini_background_puzzle8",
    maskFile: "puzzle8.png",
  },
};

async function generateBackgrounds() {
  for (const visualStyle of aiHelper.config.visualStyles) {
    const visualStyleId = visualStyle.id;
    const visualStylePrompt = visualStyle.prompt;

    // Create directory for visual style if it doesn't exist
    const styleDir = path.join(
      __dirname,
      "../client/public/assets/generated/",
      visualStyleId
    );
    if (!fs.existsSync(styleDir)) {
      fs.mkdirSync(styleDir, { recursive: true });
    }

    const { filename, promptId, maskFile } = puzzleBackgrounds.sandbox;
    console.log(
      "Generating background for: sandbox ->",
      filename,
      "using prompt:",
      promptId
    );

    const inputFilePath = path.join(
      __dirname,
      "../client/public/assets/puzzle_masks",
      maskFile
    );

    const outputFilePath = path.join(
      __dirname,
      "../client/public/assets/generated/",
      visualStyleId,
      filename
    );

    let success = false;
    let retryCount = 0;

    while (!success && retryCount < MAX_RETRIES) {
      try {
        const imageBuffer = await readFile(inputFilePath);
        const base64Image = imageBuffer.toString("base64");

        await geminiWrapper.generateImageWithGemini(
          promptId,
          "Level background",
          base64Image,
          visualStylePrompt,
          outputFilePath
        );

        console.log(
          `Successfully generated background for sandbox in ${visualStyleId} style`
        );
        success = true;

        console.log(
          `Waiting ${RATE_LIMIT_DELAY / 1000} seconds before next generation...`
        );
        await sleep(RATE_LIMIT_DELAY);
      } catch (error) {
        retryCount++;

        if (
          error.message.includes("quota exceeded") ||
          error.message.includes("RESOURCE_EXHAUSTED")
        ) {
          const retryDelay = getRetryDelay(retryCount);
          console.error(
            `Rate limit exceeded for sandbox (${visualStyleId}) - Attempt ${retryCount}/${MAX_RETRIES}`
          );
          console.log(
            `Waiting ${retryDelay / 1000} seconds before retrying...`
          );
          await sleep(retryDelay);
        } else {
          console.error(
            `Error generating background for sandbox (${visualStyleId}) - Attempt ${retryCount}/${MAX_RETRIES}:`,
            error.message
          );
          if (retryCount < MAX_RETRIES) {
            const retryDelay = getRetryDelay(retryCount);
            console.log(`Retrying in ${retryDelay / 1000} seconds...`);
            await sleep(retryDelay);
          } else {
            console.error(
              `Failed to generate background for sandbox after ${MAX_RETRIES} attempts`
            );
            throw new Error(
              `Failed to generate background for sandbox after ${MAX_RETRIES} attempts`
            );
          }
        }
      }
    }
  }

  // Process puzzles 1-8
  for (const visualStyle of aiHelper.config.visualStyles) {
    const visualStyleId = visualStyle.id;
    const visualStylePrompt = visualStyle.prompt;

    for (let i = 1; i <= 8; i++) {
      const puzzleId = `puzzle${i}`;
      const { filename, promptId, maskFile } = puzzleBackgrounds[puzzleId];
      console.log(
        "Generating background for:",
        puzzleId,
        "->",
        filename,
        "using prompt:",
        promptId
      );

      const inputFilePath = path.join(
        __dirname,
        "../client/public/assets/puzzle_masks",
        maskFile
      );

      const outputFilePath = path.join(
        __dirname,
        "../client/public/assets/generated/",
        visualStyleId,
        filename
      );

      let success = false;
      let retryCount = 0;

      while (!success && retryCount < MAX_RETRIES) {
        try {
          const imageBuffer = await readFile(inputFilePath);
          const base64Image = imageBuffer.toString("base64");

          await geminiWrapper.generateImageWithGemini(
            promptId,
            "Level background",
            base64Image,
            visualStylePrompt,
            outputFilePath
          );

          console.log(
            `Successfully generated background for ${puzzleId} in ${visualStyleId} style`
          );
          success = true;

          // Rate limiting delay between successful generations
          console.log(
            `Waiting ${
              RATE_LIMIT_DELAY / 1000
            } seconds before next generation...`
          );
          await sleep(RATE_LIMIT_DELAY);
        } catch (error) {
          retryCount++;

          if (
            error.message.includes("quota exceeded") ||
            error.message.includes("RESOURCE_EXHAUSTED")
          ) {
            const retryDelay = getRetryDelay(retryCount);
            console.error(
              `Rate limit exceeded for ${puzzleId} (${visualStyleId}) - Attempt ${retryCount}/${MAX_RETRIES}`
            );
            console.log(
              `Waiting ${retryDelay / 1000} seconds before retrying...`
            );
            await sleep(retryDelay);
          } else {
            console.error(
              `Error generating background for ${puzzleId} (${visualStyleId}) - Attempt ${retryCount}/${MAX_RETRIES}:`,
              error.message
            );
            if (retryCount < MAX_RETRIES) {
              const retryDelay = getRetryDelay(retryCount);
              console.log(`Retrying in ${retryDelay / 1000} seconds...`);
              await sleep(retryDelay);
            } else {
              console.error(
                `Failed to generate background for ${puzzleId} after ${MAX_RETRIES} attempts`
              );
              throw new Error(
                `Failed to generate background for ${puzzleId} after ${MAX_RETRIES} attempts`
              );
            }
          }
        }
      }
    }
  }
}

// Run the generation script
generateBackgrounds()
  .then(() => {
    console.log("Background generation completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Background generation failed:", error);
    process.exit(1);
  });
