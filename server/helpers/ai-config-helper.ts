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

import fs from "fs";

interface AIConfig {
  prompts: {
    [key: string]: string;
  };
  models: {
    [key: string]: string;
  };
  types: Array<{
    is: string;
    attributes: string[];
  }>;
  attributes: Array<{
    key: string;
    mapsTo?: string;
  }>;
  verbs: Array<{
    key: string;
  }>;
  visualStyles: Array<{
    id: string;
    prompt: string;
  }>;
  buildPrompt: (
    promptKey: string,
    valueObj: { [key: string]: string }
  ) => string;
  stringTemplateParser: (
    expression: string,
    valueObj: { [key: string]: string }
  ) => string;
}

const aiConfig: AIConfig = JSON.parse(
  fs.readFileSync("./ai-config.json", "utf8")
);

function stringTemplateParser(
  expression: string,
  valueObj: { [key: string]: string }
): string {
  const templateMatcher = /{{\s?([^{}\s]*)\s?}}/g;
  let text = expression.replace(templateMatcher, (substring, value, index) => {
    value = valueObj[value];
    return value;
  });
  return text;
}

function buildPrompt(
  promptKey: string,
  valueObj: { [key: string]: string }
): string {
  if (promptKey && promptKey.length > 0 && aiConfig.prompts[promptKey]) {
    return stringTemplateParser(aiConfig.prompts[promptKey], valueObj);
  }
  return "";
}

// Add the functions to the config object
const config = {
  ...aiConfig,
  buildPrompt,
  stringTemplateParser,
};

export { config };
