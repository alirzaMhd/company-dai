import type { UIAdapterModule } from "../types";
import { parseStdoutLine } from "@paperclipai/opencode-remote/ui";
import { OpenCodeRemoteConfigFields } from "./config-fields";
import { buildOpenCodeRemoteConfig } from "@paperclipai/opencode-remote/ui";

export const openCodeRemoteUIAdapter: UIAdapterModule = {
  type: "opencode_remote",
  label: "OpenCode Remote",
  parseStdoutLine: parseStdoutLine as (line: string, ts: string) => ReturnType<UIAdapterModule["parseStdoutLine"]>,
  ConfigFields: OpenCodeRemoteConfigFields,
  buildAdapterConfig: buildOpenCodeRemoteConfig,
};