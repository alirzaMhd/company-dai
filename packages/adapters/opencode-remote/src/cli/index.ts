export const type = "opencode_remote";
export const label = "OpenCode Remote";

export function formatEvent(event: Record<string, unknown>): string {
  if (event.stream === "stdout") return event.data as string;
  if (event.stream === "stderr") return event.data as string;
  if (event.stream === "system") return event.data as string;
  return "";
}