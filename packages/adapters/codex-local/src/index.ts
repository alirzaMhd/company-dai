// Adapter: codex-local
export const DEFAULT_CODEX_LOCAL_MODEL = "codex-1";
export const CODEX_LOCAL_ADAPTER_TYPE = "codex-local";
export const CODEX_LOCAL_MODELS = ["codex-1", "codex-1-lite"];
export const CODEX_LOCAL_FAST_MODE_SUPPORTED_MODELS = ["codex-1-lite"];
export const DEFAULT_CODEX_LOCAL_BYPASS_APPROVALS_AND_SANDBOX = false;
export function getCodexLocalModels() { return CODEX_LOCAL_MODELS; }
export function isCodexLocalFastModeSupported(model: string) { return CODEX_LOCAL_FAST_MODE_SUPPORTED_MODELS.includes(model); }