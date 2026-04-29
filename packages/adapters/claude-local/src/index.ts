// Adapter: claude-local
export const CLAUDE_LOCAL_ADAPTER_TYPE = "claude-local";
export const CLAUDE_LOCAL_LABEL = "Claude Local";

export const models = [
  { id: "claude-sonnet-4-20250514", label: "Claude Sonnet 4 (May 14, 2025)" },
  { id: "claude-opus-4-20250514", label: "Claude Opus 4 (May 14, 2025)" },
  { id: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet (Oct 22, 2024)" },
];

export { listClaudeModels as listModels } from './server/models.js';
export { execute } from './server/execute.js';
export { testEnvironment } from './server/test-environment.js';
