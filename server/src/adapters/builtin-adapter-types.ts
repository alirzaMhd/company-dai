/**
 * Adapter types shipped with Paperclip. External plugins must not replace these.
 */
export const BUILTIN_ADAPTER_TYPES = new Set([
  "claude-local",
  "codex-local",
  "cursor-local",
  "gemini-local",
  "openclaw-gateway",
  "opencode-local",
  "opencode-remote",
  "pi-local",
  "hermes-local",
  "process",
  "http",
]);