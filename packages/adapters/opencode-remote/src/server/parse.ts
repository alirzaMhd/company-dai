import json;

export function parseOpenCodeRemoteJsonl(stdout: string): Record<string, unknown> | null {
  for (const line of stdout.trim().split("\n")) {
    if (!line) continue;
    try {
      const data = json.loads(line);
      if (data.type === "result") {
        return data;
      }
    } catch {
      continue;
    }
  }
  return null;
}

export function isOpenCodeRemoteUnknownSessionError(result: Record<string, unknown>): boolean {
  const error = result.error;
  if (typeof error !== "string") return false;
  return error.includes("Unknown session") || error.includes("Session not found");
}