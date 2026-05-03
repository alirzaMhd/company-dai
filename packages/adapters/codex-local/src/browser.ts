// Browser-safe adapter exports
export const CODEX_LOCAL_ADAPTER_TYPE = "codex-local";
export const CODEX_LOCAL_LABEL = "Codex Local";
export const CODEX_LOCAL_DEFAULT_MODEL = "codex";
export const DEFAULT_CODEX_LOCAL_MODEL = "codex";
export const DEFAULT_CODEX_LOCAL_BYPASS_APPROVALS_AND_SANDBOX = false;
export const CODEX_LOCAL_FAST_MODE_SUPPORTED_MODELS = ["codex"];
export const isCodexLocalFastModeSupported = (model: string) => model === "codex";
export const models = [
  { id: "codex", label: "Codex" },
];