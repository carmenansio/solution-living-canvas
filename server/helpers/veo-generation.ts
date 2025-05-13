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

import { getGoogleCloudConfig } from "../config";
import { GoogleGenAI } from "@google/genai";
import { spawn } from "child_process";
import sharp from "sharp";
import fs from "fs";
import path from "path";

import util from "util";
import { applyRoundedCornersAndBorder, resizeImage } from "./image-processing";
import { generateImageBuffer } from "./imagen-generation";
import ffmpeg from "ffmpeg-static";
import { config as aiConfig } from "./ai-config-helper";

const { apiKey } = getGoogleCloudConfig();

// Initialize the Google Generative AI client with API key
const ai = new GoogleGenAI({
  apiKey: apiKey,
});

interface GenerateStaticImageResult {
  hash: string;
  processedImage: string;
  filepathOriginal: string;
}

// Generate only the static image (for immediate placeholder)
export async function generateStaticImage(
  objectType: string,
  visualStyle: string,
  filepath: string,
  filepathSmall: string,
  filepathOriginal: string
): Promise<GenerateStaticImageResult> {
  try {
    // Generate the base64 image using your existing logic
    let base64Image = await generateImageBuffer(objectType, visualStyle);
    const imageBuffer = Buffer.from(base64Image, "base64");
    const writeFile = util.promisify(fs.writeFile);

    // Save the original model output
    if (filepathOriginal) {
      await writeFile(filepathOriginal, imageBuffer);
    }

    // Save the temporary image
    const tempFilePath = filepath + "_temp.png";
    await writeFile(tempFilePath, imageBuffer);

    // Process the image (rounded corners, etc.)
    await applyRoundedCornersAndBorder(tempFilePath, filepath);
    await resizeImage(filepath, filepathSmall);

    fs.readFileSync(filepathSmall);

    // Clean up the temp file
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);

    // Extract hash from filepathSmall
    const match = filepathSmall.match(/output_(.+?)_small\.png$/);
    const hash = match ? match[1] : "";

    // Read the resized image and return as base64
    const resizedBuffer = fs.readFileSync(filepathSmall);
    const resizedBase64 = resizedBuffer.toString("base64");

    return { hash, processedImage: resizedBase64, filepathOriginal };
  } catch (error) {
    console.error("Error in generateStaticImage:", error);
    throw error;
  }
}

// [START video_generation]
// Generate the video and frames in the background
export async function generateVideoAndFrames(
  hash: string,
  filepath: string
): Promise<void> {
  try {
    // "veo_generation": "veo-2.0-generate-001"
    const modelId = aiConfig.models["veo_generation"];

    // "veo_generation": "Show the subject gently moving or
    // floating in place, always fully visible and centered,
    // with no zoom, no cropping, and no added borders. The
    // background should remain clean and consistent.
    // The animation should be subtle and natural, preserving
    // the original composition of the image."
    const prompt = aiConfig.prompts["veo_generation"];
    const imageBuffer = fs.readFileSync(filepath);

    // Pad to 9:16 aspect ratio (e.g., 1080x1920)
    const paddedBuffer = await sharp(imageBuffer)
      .resize({
        width: 1080,
        height: 1920,
        fit: "contain",
      })
      .toBuffer();

    const image = paddedBuffer.toString("base64");

    // Generate the video
    let operation = await ai.models.generateVideos({
      model: modelId,
      image: {
        imageBytes: image,
        mimeType: "image/png",
      },
      config: {
        aspectRatio: "9:16",
        numberOfVideos: 1,
        durationSeconds: 5,
        // @ts-ignore
        prompt: prompt,
      },
    });

    // ...
    // [END video_generation]

    // Poll for operation completion
    while (!operation.done) {
      console.log("Polling video generation status...");
      await new Promise((resolve) => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation });
    }

    if (!operation.response?.generatedVideos?.length) {
      throw new Error("No videos generated in response");
    }

    const generatedVideo = operation.response.generatedVideos[0];
    if (!generatedVideo.video?.uri) {
      throw new Error("No video URI in response");
    }

    // Download the video
    const generatedDir = "generated";
    if (!fs.existsSync(generatedDir))
      fs.mkdirSync(generatedDir, { recursive: true });
    const videoPath = path.join(generatedDir, `output_${hash}.mp4`);
    const resp = await fetch(`${generatedVideo.video.uri}&key=${apiKey}`);
    if (!resp.ok) {
      throw new Error(`Failed to download video: ${resp.statusText}`);
    }
    const buffer = await resp.arrayBuffer();
    await fs.promises.writeFile(videoPath, Buffer.from(buffer));

    // Extract frames from the video
    await extractFrames(videoPath, null, hash);

    console.log("Video and frames generated successfully for hash:", hash);
  } catch (error) {
    console.error("Error in background video/frame generation:", error);
    // Create an error file to signal the frontend
    const errorFile = path.join("generated", `error_${hash}.json`);
    await fs.promises.writeFile(
      errorFile,
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "Failed to generate video",
        timestamp: new Date().toISOString(),
      })
    );
    throw error; // Re-throw the error to be handled by the route handler
  }
}

// Function to extract frames from video using ffmpeg-static
async function extractFrames(
  videoPath: string,
  _: any,
  hash: string
): Promise<string> {
  // Use only the 'generated' directory for all outputs
  const generatedDir = "generated";
  if (!fs.existsSync(generatedDir)) {
    fs.mkdirSync(generatedDir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    const frameCount = 4;
    const videoDuration = 5; // 5 seconds minimum duration
    // Distribute frames evenly: 0s, 1.66s, 3.33s, 5s
    const epsilon = 0.05; // 50ms before the end
    const timestamps = Array.from({ length: frameCount }, (_, i) =>
      i === frameCount - 1
        ? videoDuration - epsilon
        : parseFloat(((i * videoDuration) / (frameCount - 1)).toFixed(2))
    );
    const framePromises = timestamps.map((timestamp, i) => {
      // [START frame_extraction]
      const framePath = path.join(generatedDir, `output_${hash}_frame${i}.png`);

      return new Promise((resolveFrame, rejectFrame) => {
        console.log(`Extracting frame ${i} at ${timestamp}s`);
        const frameProcess = spawn(ffmpeg as string, [
          "-ss",
          timestamp.toString(),
          "-i",
          videoPath,
          "-frames:v",
          "1",
          "-vf",
          "crop=min(iw\\,ih):min(iw\\,ih):(iw-min(iw\\,ih))/2:(ih-min(iw\\,ih))/2,scale=1080:1080:force_original_aspect_ratio=decrease,pad=1080:1080:(ow-iw)/2:(oh-ih)/2",
          "-q:v",
          "2",
          "-y",
          framePath,
        ]);

        frameProcess.stderr?.on("data", (data) => {
          console.log(`ffmpeg frame ${i} extraction: ${data.toString()}`);
        });

        frameProcess.on("close", async (code) => {
          if (code === 0) {
            if (fs.existsSync(framePath)) {
              const frameStats = fs.statSync(framePath);
              if (frameStats.size > 0) {
                console.log(
                  `Frame ${i} extracted successfully (${frameStats.size} bytes)`
                );
                // Process the frame to add rounded corners and border
                try {
                  const processedFramePath = framePath + "_rounded.png";
                  await applyRoundedCornersAndBorder(
                    framePath,
                    processedFramePath
                  );
                  fs.renameSync(processedFramePath, framePath);
                  console.log(
                    `Frame ${i} processed with rounded corners and border.`
                  );
                  resolveFrame(framePath);
                } catch (err) {
                  console.error(`Error processing frame ${i}:`, err);
                  rejectFrame(err);
                }
              } else {
                rejectFrame(new Error(`Extracted frame ${i} is empty`));
              }
            } else {
              rejectFrame(new Error(`Frame ${i} file not created`));
            }
          } else {
            rejectFrame(
              new Error(
                `FFmpeg frame extraction for frame ${i} exited with code ${code}`
              )
            );
          }
        });

        // ...
        // [END frame_extraction]

        frameProcess.on("error", (err) => {
          console.error(`Error extracting frame ${i}:`, err);
          rejectFrame(err);
        });
      });
    });

    Promise.all(framePromises)
      .then(() => {
        console.log("All frames extracted and processed successfully");
        resolve(hash);
      })
      .catch((err) => {
        console.error("Error extracting or processing frames:", err);
        reject(err);
      });
  });
}
