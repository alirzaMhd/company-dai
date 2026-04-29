import type { UIAdapterModule, TranscriptEntry } from "../types";
import type { CreateConfigValues } from "@paperclipai/adapter-utils";
import { OpenRouterConfigFields } from "./config-fields";

export const openRouterUIAdapter: UIAdapterModule = {
  type: "openrouter",
  label: "OpenRouter",
  parseStdoutLine: (line: string, ts: string): TranscriptEntry[] => {
    return [{ kind: "stdout", ts, text: line }];
  },
  ConfigFields: OpenRouterConfigFields,
  buildAdapterConfig: buildOpenRouterConfig,
};

function buildOpenRouterConfig(values: CreateConfigValues): Record<string, unknown> {
  const config: Record<string, unknown> = {};
  const model = values.model;
  if (typeof model === "string" && model.trim()) {
    config.model = model.trim();
  }

  const apiKeys = values.apiKeys;
  if (Array.isArray(apiKeys)) {
    config.apiKeys = apiKeys.filter((k) => typeof k === "string" && k.trim());
  }

  const promptTemplate = values.promptTemplate;
  if (typeof promptTemplate === "string" && promptTemplate.trim()) {
    config.promptTemplate = promptTemplate.trim();
  }

  return config;
}