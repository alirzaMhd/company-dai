// Adapter: gemini-local
export const GEMINI_LOCAL_ADAPTER_TYPE = "gemini-local";
export const GEMINI_LOCAL_LABEL = "Gemini Local";

export const models = [
  { id: "gemini-2.5-pro-preview-05-20", label: "Gemini 2.5 Pro Preview (May 20)" },
];

export { listGeminiModels as listModels } from './server/models.js';
export { execute } from './server/execute.js';
export { testEnvironment } from './server/test-environment.js';
