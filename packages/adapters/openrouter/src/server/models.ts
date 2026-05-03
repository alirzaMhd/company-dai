import type { AdapterModel } from "@paperclipai/adapter-utils";
import { asString, parseObject } from "@paperclipai/adapter-utils/server-utils";

const OPENROUTER_API_BASE = "https://openrouter.ai/api/v1";

interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
}

interface OpenRouterModelsResponse {
  data: OpenRouterModel[];
}

interface OpenRouterConfig {
  apiKey?: string;
}

export async function listOpenRouterModels(config: Record<string, unknown> = {}): Promise<AdapterModel[]> {
  const parsed = parseObject(config) as OpenRouterConfig;
  const apiKey = asString(parsed.apiKey, "").trim();

  if (!apiKey) {
    throw new Error("OpenRouter model listing requires an API key");
  }

  const response = await fetch(`${OPENROUTER_API_BASE}/models`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://paperclip.ai",
      "X-Title": "Paperclip",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch OpenRouter models: ${errorText.slice(0, 500)}`);
  }

  const data = (await response.json()) as OpenRouterModelsResponse;
  const models = data.data ?? [];

  return models
    .map((m) => ({
      id: m.id,
      label: m.name ?? m.id,
    }))
    .sort((a, b) => a.id.localeCompare(b.id, "en", { numeric: true, sensitivity: "base" }));
}