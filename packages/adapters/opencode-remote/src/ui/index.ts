export { parseStdoutLine } from "./parse-stdout.js";
export { buildOpenCodeRemoteConfig } from "./build-config.js";

export const parseStdoutLine: StdoutLineParser = (line: string, ts: string) => {
  const entryTs = parseTimestamp(line) || ts;
  return [{ kind: "stdout" as const, ts: entryTs, text: line }];
};

const OPENCODE_REMOTE_CONFIG_FIELDS: ConfigFieldSchema[] = [
  {
    key: "tunnelUrl",
    label: "WebSocket Tunnel URL",
    type: "text",
    required: true,
    hint: "wss://xxx.trycloudflare.com from Colab",
  },
  {
    key: "model",
    label: "Model",
    type: "text",
    hint: "e.g., opencode/sonnet",
  },
  {
    key: "variant",
    label: "Variant",
    type: "text",
    hint: "Model variant (optional)",
  },
  {
    key: "timeoutSec",
    label: "Timeout (seconds)",
    type: "number",
    default: 0,
    hint: "0 = no timeout",
  },
];

export function buildOpenCodeRemoteConfig(): ConfigFieldSchema[] {
  return OPENCODE_REMOTE_CONFIG_FIELDS;
}