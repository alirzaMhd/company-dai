// Adapter: opencode-local
export const OPENCODE_LOCAL_ADAPTER_TYPE = "opencode-local";
export const OPENCODE_LOCAL_LABEL = "OpenCode Local";

export const models = [
  { id: "openai/o1", label: "OpenAI O1" },
  { id: "openai/o3", label: "OpenAI O3" },
  { id: "anthropic/claude-sonnet-4", label: "Anthropic Claude Sonnet 4" },
  { id: "anthropic/claude-opus-4", label: "Anthropic Claude Opus 4" },
  { id: "google/gemini-2.5-pro", label: "Google Gemini 2.5 Pro" },
  { id: "google/gemini-2.5-flash", label: "Google Gemini 2.5 Flash" },
  { id: "xai/grok-2", label: "xAI Grok 2" },
  { id: "deepseek/deepseek-chat", label: "DeepSeek Chat" },
];

export { listOpenCodeModels as listModels } from './server/models.js';
export { execute } from './server/execute.js';
export { testEnvironment } from './server/test-environment.js';
