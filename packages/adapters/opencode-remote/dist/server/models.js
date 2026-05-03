import { asString, parseObject } from "../../adapter-utils/dist/server-utils.js";
import WebSocket from "ws";
import { MODELS_CACHE } from "./execute.js";
const MODELS_CACHE_TTL_MS = 5 * 60 * 1000;
async function fetchModelsFromServer(tunnelUrl) {
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
            }
            catch (e) {
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
export async function listOpenCodeRemoteModels(config = {}) {
    const parsed = parseObject(config);
    const tunnelUrl = asString(parsed.tunnelUrl, "").trim();
    if (!tunnelUrl) {
        return [];
    }
    try {
        const models = await fetchModelsFromServer(tunnelUrl);
        return models;
    }
    catch {
        return [];
    }
}
export async function ensureOpenCodeRemoteModelConfigured(config) {
    const parsed = parseObject(config);
    const tunnelUrl = asString(parsed.tunnelUrl, "").trim();
    const model = asString(parsed.model, "").trim();
    if (!tunnelUrl) {
        return [];
    }
    if (!model) {
        return [];
    }
    try {
        const models = await fetchModelsFromServer(tunnelUrl);
        const found = models.find((m) => m.id === model);
        if (found) {
            return [found];
        }
        return [{ id: model, label: model }];
    }
    catch {
        return [{ id: model, label: model }];
    }
}
export function resetOpenCodeRemoteModelsCacheForTests() {
    MODELS_CACHE.clear();
}
//# sourceMappingURL=models.js.map