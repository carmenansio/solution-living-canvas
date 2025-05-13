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

import { GenerateContentConfig, GoogleGenAI } from "@google/genai";
import fs from "fs";
import { getGoogleCloudConfig } from "../config";
import { config as aiConfig } from "./ai-config-helper";

const { projectId, location } = getGoogleCloudConfig();

interface GenerationConfig {
  maxOutputTokens: number;
  temperature: number;
  topP: number;
  seed: number;
  responseModalities: string[];
  safetySettings: Array<{
    category: string;
    threshold: string;
  }>;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        inlineData: {
          data: string;
        };
      }>;
    };
  }>;
}

// Initialize Vertex with your Cloud project and location
const ai = new GoogleGenAI({
  vertexai: true,
  project: projectId,
  location: location || "us-central1",
});

// Set up generation config
const generationConfig: GenerationConfig = {
  maxOutputTokens: 8192,
  temperature: 1,
  topP: 0.95,
  seed: 0,
  responseModalities: ["TEXT", "IMAGE"],
  safetySettings: [
    {
      category: "HARM_CATEGORY_HATE_SPEECH",
      threshold: "OFF",
    },
    {
      category: "HARM_CATEGORY_DANGEROUS_CONTENT",
      threshold: "OFF",
    },
    {
      category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      threshold: "OFF",
    },
    {
      category: "HARM_CATEGORY_HARASSMENT",
      threshold: "OFF",
    },
  ],
};

// [START image_generation]
export async function generateImageWithGemini(
  promptId: string,
  objectType: string,
  inputImageData: string,
  visualStyle: string,
  filepath: string
): Promise<string> {
  try {
    // "generation_gemini": "gemini-2.0-flash-exp",
    const model = aiConfig.models["generation_gemini"];
    if (!model) {
      throw new Error("Gemini model configuration not found");
    }

    // "gemini_generation": "Generate an image of a {{type}},
    // centered on a coloured background in a similar 2D
    // side-on view with the following visual style:
    // {{visualStyle}}.",
    const textPrompt = aiConfig.buildPrompt(promptId, {
      type: objectType,
      visualStyle: visualStyle,
    });

    const vertexChat = ai.chats.create({
      model: model,
      config: generationConfig as GenerateContentConfig,
    });

    if (inputImageData.startsWith("data:image/png;base64,")) {
      // Remove the data:image/png;base64, prefix if present
      inputImageData = inputImageData.slice(22);
    }

    const response = await sendGeminiMessage(
      vertexChat,
      textPrompt,
      inputImageData
    );

    if (!response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) {
      throw new Error("Invalid response format from Gemini API");
    }

    // ...
    // [END image_generation]

    console.log("result", response);

    fs.writeFileSync(
      filepath,
      response.candidates[0].content.parts[0].inlineData.data,
      "base64"
    );

    if (!fs.existsSync(filepath)) {
      throw new Error("Failed to save generated image");
    }

    console.log(`Saved image ${filepath}`);
    return filepath;
  } catch (error) {
    console.error("Error in generateImageWithGemini:", error);
    throw error;
  }
}

async function sendGeminiMessage(
  vertexChat: any,
  textData: string,
  inputImageData: string
): Promise<GeminiResponse> {
  try {
    const response = await vertexChat.sendMessage({
      message: [
        {
          text: textData,
        },
        {
          inlineData: {
            mimeType: "image/png",
            data: inputImageData,
          },
        },
      ],
    });

    if (!response) {
      throw new Error("No response received from Gemini API");
    }

    return response;
  } catch (error) {
    console.error("Error in sendGeminiMessage:", error);
    throw error;
  }
}
