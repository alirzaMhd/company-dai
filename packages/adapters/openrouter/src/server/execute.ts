import { createHash } from "node:crypto";
import type {
  AdapterExecutionContext,
  AdapterExecutionResult,
  AdapterModel,
} from "@paperclipai/adapter-utils";
import {
  asString,
  asNumber,
  asStringArray,
  renderTemplate,
} from "@paperclipai/adapter-utils/server-utils";

const OPENROUTER_API_BASE = "https://openrouter.ai/api/v1";
const MAX_RETRIES = 3;

interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
}

interface OpenRouterChoice {
  message: {
    role: "assistant";
    content: string;
  };
  finish_reason: string;
}

interface OpenRouterResponse {
  choices: OpenRouterChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  provider?: string;
}

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

function redactKey(key: string): string {
  return key.slice(0, 4) + "****" + key.slice(-4);
}

function parseRateLimitHeaders(
  headers: Record<string, string>,
): { remaining: number; reset: number } | null {
  const remainingHeader = Object.entries(headers).find(
    ([k]) => k.toLowerCase() === "x-ratelimit-remaining",
  );
  const resetHeader = Object.entries(headers).find(
    ([k]) => k.toLowerCase() === "x-ratelimit-reset",
  );

  if (!remainingHeader) return null;
  const remaining = parseInt(remainingHeader[1], 10);
  const reset = resetHeader ? parseInt(resetHeader[1], 10) : 0;

  return { remaining: isNaN(remaining) ? -1 : remaining, reset: isNaN(reset) ? -1 : reset };
}

function buildMessages(prompt: string): OpenRouterMessage[] {
  return [{ role: "user", content: prompt }];
}

async function makeRequest(
  ctx: AdapterExecutionContext,
  apiKey: string,
  model: string,
  prompt: string,
  params: {
    temperature?: number;
    maxTokens?: number;
  },
): Promise<{
  response: OpenRouterResponse;
  headers: Record<string, string>;
}> {
  const url = `${OPENROUTER_API_BASE}/chat/completions`;
  const body: OpenRouterRequest = {
    model,
    messages: buildMessages(prompt),
    ...(params.temperature !== undefined && { temperature: params.temperature }),
    ...(params.maxTokens !== undefined && { max_tokens: params.maxTokens }),
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://paperclip.ai",
      "X-Title": "Paperclip",
    },
    body: JSON.stringify(body),
  });

  const responseHeaders: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    responseHeaders[key] = value;
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `OpenRouter API error (${response.status}): ${errorText.slice(0, 500)}`,
    );
  }

  const data = (await response.json()) as OpenRouterResponse;
  return { response: data, headers: responseHeaders };
}

function extractRateLimitError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("rate limit") ||
    lower.includes("429") ||
    lower.includes("too many requests")
  );
}

export async function execute(
  ctx: AdapterExecutionContext,
): Promise<AdapterExecutionResult> {
  const { runId, agent, context, onLog } = ctx;

  const model = asString(ctx.config.model, "").trim();
  if (!model) {
    return {
      exitCode: 1,
      signal: null,
      timedOut: false,
      errorMessage: "OpenRouter adapter requires adapterConfig.model",
      errorCode: "openrouter_model_missing",
    };
  }

  const apiKeyFromConfig = asString(ctx.config.apiKey, "").trim();
  const apiKeysFromConfig = asStringArray(ctx.config.apiKeys ?? []);
  const allApiKeys = apiKeyFromConfig
    ? [apiKeyFromConfig, ...apiKeysFromConfig].filter((k: string) => k && k.trim())
    : apiKeysFromConfig.filter((k: string) => k && k.trim());
  if (allApiKeys.length === 0) {
    return {
      exitCode: 1,
      signal: null,
      timedOut: false,
      errorMessage: "OpenRouter adapter requires at least one API key in adapterConfig.apiKeys",
      errorCode: "openrouter_api_key_missing",
    };
  }

  const promptTemplate = asString(
    ctx.config.promptTemplate,
    "You are agent {{agent.name}}. Continue your work.",
  );
  const prompt = renderTemplate(promptTemplate, {
    agent: { id: agent.id, name: agent.name },
    context,
  });

  const temperature = asNumber(ctx.config.temperature, 0.7);
  const maxTokens = asNumber(ctx.config.maxTokens, 4096);

  let currentKeyIndex = 0;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const currentKey = allApiKeys[currentKeyIndex];

    if (!currentKey || !currentKey.trim()) {
      currentKeyIndex = (currentKeyIndex + 1) % allApiKeys.length;
      attempt--;
      continue;
    }

    await onLog(
      "stdout",
      `[openrouter] request attempt ${attempt + 1}/${MAX_RETRIES} with key ${redactKey(currentKey)}\n`,
    );

    try {
      const { response, headers } = await makeRequest(
        ctx,
        currentKey,
        model,
        prompt,
        { temperature, maxTokens },
      );

      const choice = response.choices?.[0];
      if (!choice) {
        throw new Error("OpenRouter returned no choices");
      }

      const content = choice.message?.content ?? "";
      const usage = response.usage;
      const provider = response.provider ?? "openrouter";

      const rateLimit = parseRateLimitHeaders(headers);
      if (rateLimit && rateLimit.remaining >= 0) {
        await onLog(
          "stdout",
          `[openrouter] rate limit: ${rateLimit.remaining} remaining, resets in ${rateLimit.reset}s\n`,
        );
      }

      await onLog(
        "stdout",
        `[openrouter] response received (${content.length} chars, ${usage?.total_tokens ?? "?"} tokens)\n`,
      );

      return {
        exitCode: 0,
        signal: null,
        timedOut: false,
        provider,
        model,
        ...(usage
          ? {
              usage: {
                inputTokens: usage.prompt_tokens,
                outputTokens: usage.completion_tokens,
              },
            }
          : {}),
        summary: content,
      };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      const message = lastError.message;

      await onLog(
        "stderr",
        `[openrouter] request failed: ${message}\n`,
      );

      if (extractRateLimitError(message)) {
        await onLog(
          "stderr",
          `[openrouter] key ${redactKey(currentKey)} hit rate limit, rotating to next key\n`,
        );
        currentKeyIndex = (currentKeyIndex + 1) % allApiKeys.length;

        if (currentKeyIndex === 0) {
          await onLog(
            "stderr",
            `[openrouter] all keys exhausted, giving up\n`,
          );
          break;
        }

        continue;
      }

      if (!message.includes("429")) {
        throw lastError;
      }
    }
  }

  return {
    exitCode: 1,
    signal: null,
    timedOut: false,
    errorMessage: lastError?.message ?? "OpenRouter request failed after all retries",
    errorCode: "openrouter_request_failed",
  };
}