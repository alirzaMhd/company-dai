import { asString, asNumber, asStringArray, parseObject, DEFAULT_PAPERCLIP_AGENT_PROMPT_TEMPLATE, } from "../../adapter-utils/dist/server-utils.js";
import WebSocket from "ws";
const MODELS_CACHE = new Map();
export { MODELS_CACHE };
class OpenCodeRemoteClient {
    ws = null;
    url;
    sessionId = null;
    onLog = null;
    constructor(url) {
        this.url = url;
    }
    async connect() {
        return new Promise((resolve, reject) => {
            this.ws = new WebSocket(this.url);
            this.ws.on("open", () => resolve());
            this.ws.on("error", (err) => reject(err));
            this.ws.on("message", (data) => this.handleMessage(data.toString()));
        });
    }
    handleMessage(raw) {
        const msg = JSON.parse(raw);
        const { type } = msg;
        if (type === "stream") {
            const { stream, data } = msg;
            if (this.onLog) {
                this.onLog(stream, data);
            }
        }
        else if (type === "result") {
            this.sessionId = msg.session_id;
        }
    }
    setLogger(fn) {
        this.onLog = fn;
    }
    async listModels() {
        if (!this.ws) {
            await this.connect();
        }
        return new Promise((resolve, reject) => {
            if (!this.ws) {
                reject(new Error("Not connected"));
                return;
            }
            this.ws.send(JSON.stringify({ type: "models" }));
            const handleMessage = (data) => {
                const msg = JSON.parse(data);
                if (msg.type === "models") {
                    resolve(msg.models || []);
                    this.ws?.off("message", handleMessage);
                }
            };
            this.ws?.on("message", handleMessage);
        });
    }
    async execute(prompt, model, variant, cwd, sessionId, extraArgs = [], timeoutSec = 0) {
        if (!this.ws) {
            await this.connect();
        }
        return new Promise((resolve, reject) => {
            if (!this.ws) {
                reject(new Error("Not connected"));
                return;
            }
            this.ws.send(JSON.stringify({
                prompt,
                model,
                variant,
                cwd: cwd || process.cwd(),
                session_id: sessionId,
                extra_args: extraArgs,
                timeout_sec: timeoutSec,
            }));
            let stdout = "";
            let stderr = "";
            let result = null;
            const handleMessage = (data) => {
                const msg = JSON.parse(data);
                if (msg.type === "stream") {
                    if (msg.stream === "stdout")
                        stdout += msg.data;
                    else if (msg.stream === "stderr")
                        stderr += msg.data;
                    if (this.onLog) {
                        this.onLog(msg.stream, msg.data);
                    }
                }
                else if (msg.type === "result") {
                    result = msg;
                    resolve(msg);
                    this.ws?.off("message", handleMessage);
                }
            };
            this.ws?.on("message", handleMessage);
        });
    }
    getSessionId() {
        return this.sessionId;
    }
    async close() {
        this.ws?.close();
        this.ws = null;
    }
}
function asStringValue(value, fallback = "") {
    const result = asString(value, fallback);
    return result ?? fallback;
}
export const sessionCodec = {
    deserialize(raw) {
        if (typeof raw !== "object" || raw === null || Array.isArray(raw))
            return null;
        const record = raw;
        const sessionId = asStringValue(record.sessionId, "");
        if (!sessionId)
            return null;
        return {
            sessionId,
            cwd: asStringValue(record.cwd, ""),
            workspaceId: asStringValue(record.workspaceId, ""),
            repoUrl: asStringValue(record.repoUrl, ""),
            repoRef: asStringValue(record.repoRef, ""),
        };
    },
    serialize(params) {
        if (!params)
            return null;
        const sessionId = asStringValue(params.sessionId, "");
        if (!sessionId)
            return null;
        return {
            sessionId,
            cwd: asStringValue(params.cwd, ""),
            workspaceId: asStringValue(params.workspaceId, ""),
            repoUrl: asStringValue(params.repoUrl, ""),
            repoRef: asStringValue(params.repoRef, ""),
        };
    },
    getDisplayId(params) {
        if (!params)
            return null;
        return asStringValue(params.sessionId, "") || null;
    },
};
function summarizeStatus(checks) {
    if (checks.some((check) => check.level === "error"))
        return "fail";
    if (checks.some((check) => check.level === "warn"))
        return "warn";
    return "pass";
}
async function fetchAndCacheModels(tunnelUrl) {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(tunnelUrl);
        const timeout = setTimeout(() => {
            ws.close();
            reject(new Error("Models request timeout"));
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
export async function testEnvironment(ctx) {
    const checks = [];
    const config = parseObject(ctx.config);
    const tunnelUrl = asString(config.tunnelUrl, "");
    if (!tunnelUrl) {
        checks.push({
            code: "opencode_remote_tunnel_url_missing",
            level: "error",
            message: "WebSocket tunnel URL is required",
            hint: "Enter your wss:// URL from Colab (e.g., wss://xxx.trycloudflare.com)",
        });
    }
    else if (!tunnelUrl.startsWith("wss://")) {
        checks.push({
            code: "opencode_remote_tunnel_url_invalid",
            level: "error",
            message: "Tunnel URL must use wss:// protocol",
        });
    }
    else {
        try {
            const ws = new WebSocket(tunnelUrl);
            await new Promise((resolve, reject) => {
                ws.on("open", () => resolve());
                ws.on("error", (err) => reject(err));
                setTimeout(() => reject(new Error("Connection timeout")), 5000);
            });
            ws.close();
            checks.push({
                code: "opencode_remote_connection_ok",
                level: "info",
                message: "Successfully connected to remote OpenCode server",
            });
            try {
                const models = await fetchAndCacheModels(tunnelUrl);
                if (models.length > 0) {
                    checks.push({
                        code: "opencode_remote_models",
                        level: "info",
                        message: `Found ${models.length} models`,
                        detail: models.map((m) => m.id).join(", "),
                    });
                }
            }
            catch {
                // Models fetch failed, ignore
            }
        }
        catch (err) {
            checks.push({
                code: "opencode_remote_connection_failed",
                level: "error",
                message: "Failed to connect to remote OpenCode server",
                detail: err instanceof Error ? err.message : String(err),
                hint: "Make sure the Colab server is running and the tunnel URL is correct",
            });
        }
    }
    return {
        adapterType: ctx.adapterType,
        status: summarizeStatus(checks),
        checks,
        testedAt: new Date().toISOString(),
    };
}
export async function execute(ctx) {
    const { runId, agent, runtime, config, context, onLog, onMeta } = ctx;
    const adapterConfig = parseObject(config);
    const tunnelUrl = adapterConfig.tunnelUrl;
    const model = adapterConfig.model || "";
    const variant = adapterConfig.variant || "";
    const timeoutSec = asNumber(adapterConfig.timeoutSec, 0);
    const workspaceContext = parseObject(context.paperclipWorkspace);
    const workspaceCwd = asString(workspaceContext.cwd, "");
    const workspaceId = asString(workspaceContext.workspaceId, "");
    const workspaceRepoUrl = asString(workspaceContext.repoUrl, "");
    const workspaceRepoRef = asString(workspaceContext.repoRef, "");
    const cwd = workspaceCwd || process.cwd();
    const runtimeSessionParams = parseObject(runtime.sessionParams);
    const runtimeSessionId = asString(runtimeSessionParams.sessionId, runtime.sessionId ?? "");
    const runtimeSessionCwd = asString(runtimeSessionParams.cwd, "");
    const canResumeSession = runtimeSessionId.length > 0 &&
        (runtimeSessionCwd.length === 0 || runtimeSessionCwd === cwd);
    const sessionId = canResumeSession ? runtimeSessionId : null;
    const promptTemplate = asString(config.promptTemplate, DEFAULT_PAPERCLIP_AGENT_PROMPT_TEMPLATE);
    const templateData = {
        agentId: agent.id,
        companyId: agent.companyId,
        runId,
        company: { id: agent.companyId },
        agent,
        run: { id: runId, source: "on_demand" },
        context,
    };
    const renderedPrompt = promptTemplate
        .replace(/\{\{(\w+)\}\}/g, (_, key) => {
        const value = templateData[key];
        return typeof value === "object" ? JSON.stringify(value) : String(value ?? "");
    })
        .replace(/\{\{(\w+)\.(\w+)\}\}/g, (_, path, field) => {
        const obj = templateData[path];
        return obj?.[field] ?? "";
    });
    if (onMeta) {
        await onMeta({
            adapterType: "opencode_remote",
            command: `wss://... (${tunnelUrl})`,
            cwd,
            commandNotes: [`Remote OpenCode at ${tunnelUrl}`],
            commandArgs: [],
            prompt: renderedPrompt,
            context,
        });
    }
    const client = new OpenCodeRemoteClient(tunnelUrl || "");
    const logFn = async (streamType, data) => {
        await onLog(streamType, data);
    };
    client.setLogger(logFn);
    try {
        await client.connect();
        const result = await client.execute(renderedPrompt, model, variant, cwd, sessionId, asStringArray(config.extraArgs), timeoutSec);
        const resolvedSessionId = result.session_id;
        return {
            exitCode: result.exit_code,
            signal: null,
            timedOut: result.timed_out,
            errorMessage: result.error_message || null,
            sessionId: resolvedSessionId,
            sessionParams: resolvedSessionId
                ? {
                    sessionId: resolvedSessionId,
                    cwd,
                    ...(workspaceId ? { workspaceId } : {}),
                    ...(workspaceRepoUrl ? { repoUrl: workspaceRepoUrl } : {}),
                    ...(workspaceRepoRef ? { repoRef: workspaceRepoRef } : {}),
                }
                : null,
            sessionDisplayId: resolvedSessionId,
            provider: model ? model.split("/")[0] : null,
            biller: model ? model.split("/")[0] : null,
            model: model || null,
            billingType: "unknown",
            costUsd: 0,
            resultJson: {
                stdout: result.stdout,
                stderr: result.stderr,
            },
            summary: result.summary,
        };
    }
    finally {
        await client.close();
    }
}
//# sourceMappingURL=execute.js.map