import type { AdapterModel } from "@paperclipai/adapter-utils";
import { asString, parseObject } from "@paperclipai/adapter-utils/server-utils";
import WebSocket from "ws";
import { MODELS_CACHE } from "./execute.js";

interface OpenCodeRemoteConfig {
  tunnelUrl?: string;
  model?: string;
}

const MODELS_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function fetchModelsFromServer(tunnelUrl: string): Promise<{ id: string; label: string }[]> {
  const cached = MODELS_CACHE.get(tunnelUrl);
  if (cached) {
    return cached;
  }

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(tunnelUrl);
    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error("Connection timeout"));
    }, 10000);

    ws.on("open", () => {
      ws.send(JSON.stringify({ type: "models" }));
    });

    ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === "models") {
          clearTimeout(timeout);
          const models = msg.models || [];
          MODELS_CACHE.set(tunnelUrl, models);
          ws.close();
          resolve(models);
        }
      } catch (e) {
        clearTimeout(timeout);
        ws.close();
        reject(e);
      }
    });

    ws.on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

export async function listOpenCodeRemoteModels(config: Record<string, unknown> = {}): Promise<AdapterModel[]> {
  const parsed = parseObject(config) as OpenCodeRemoteConfig;
  const tunnelUrl = asString(parsed.tunnelUrl, "").trim();

  if (!tunnelUrl) {
    return [];
  }

  try {
    const models = await fetchModelsFromServer(tunnelUrl);
    return models;
  } catch {
    return [];
  }
}

export async function ensureOpenCodeRemoteModelConfigured(
  config: Record<string, unknown>,
): Promise<AdapterModel[]> {
  const parsed = parseObject(config) as OpenCodeRemoteConfig;
  const tunnelUrl = asString(parsed.tunnelUrl, "").trim();
  const model = asString(parsed.model, "").trim();

  if (!tunnelUrl) {
    return [];
  }

  if (!model) {
    return [];
  }

  // Validate by fetching models
  try {
    const models = await fetchModelsFromServer(tunnelUrl);
    const found = models.find((m) => m.id === model);
    if (found) {
      return [found];
    }
    // Return even if not in list (could be valid on server but not cached)
    return [{ id: model, label: model }];
  } catch {
    // On error, just return the user-specified model
    return [{ id: model, label: model }];
  }
}

export function resetOpenCodeRemoteModelsCacheForTests() {
  MODELS_CACHE.clear();
}