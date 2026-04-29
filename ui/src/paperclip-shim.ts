// Shim to re-export @paperclipai/* packages from local @company-dai/* packages
// This allows the UI to use @paperclipai/* imports while using local packages

export * from "@company-dai/shared";
export * from "@company-dai/adapter-utils";

// Re-export adapter packages (stub for UI)
export const DEFAULT_CURSOR_LOCAL_MODEL = "cursor-small";
export const DEFAULT_GEMINI_LOCAL_MODEL = "gemini-2.0-flash";

export function redactHomePathUserSegments(path: string): string {
  return path;
}

export function redactHomePathUserSegmentsInValue(value: unknown): unknown {
  return value;
}