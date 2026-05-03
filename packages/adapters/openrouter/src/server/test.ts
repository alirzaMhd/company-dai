import type {
  AdapterEnvironmentCheck,
  AdapterEnvironmentTestContext,
  AdapterEnvironmentTestResult,
} from "@paperclipai/adapter-utils";
import {
  asString,
  asStringArray,
  parseObject,
} from "@paperclipai/adapter-utils/server-utils";
import { listOpenRouterModels } from "./models.js";

function summarizeStatus(checks: AdapterEnvironmentCheck[]): AdapterEnvironmentTestResult["status"] {
  if (checks.some((check) => check.level === "error")) return "fail";
  if (checks.some((check) => check.level === "warn")) return "warn";
  return "pass";
}

export async function testEnvironment(
  ctx: AdapterEnvironmentTestContext,
): Promise<AdapterEnvironmentTestResult> {
  const checks: AdapterEnvironmentCheck[] = [];
  const config = parseObject(ctx.config);

  const apiKeyFromConfig = asString(config.apiKey, "").trim();
  const apiKeysFromConfig = asStringArray(config.apiKeys ?? []);
  const allApiKeys = apiKeyFromConfig
    ? [apiKeyFromConfig, ...apiKeysFromConfig].filter((k: string) => k && k.trim())
    : apiKeysFromConfig.filter((k: string) => k && k.trim());

  if (allApiKeys.length === 0) {
    checks.push({
      code: "openrouter_api_key_missing",
      level: "error",
      message: "No API keys configured",
      hint: "Add at least one OpenRouter API key in adapterConfig.apiKeys",
    });

    return {
      adapterType: ctx.adapterType,
      status: "fail",
      checks,
      testedAt: new Date().toISOString(),
    };
  }

  const model = asString(config.model, "").trim();
  if (!model) {
    checks.push({
      code: "openrouter_model_missing",
      level: "warn",
      message: "No model configured",
      hint: "Select an OpenRouter model in adapterConfig.model",
    });
  }

  const firstKey = allApiKeys[0];
  try {
    const models = await listOpenRouterModels({ apiKey: firstKey });
    checks.push({
      code: "openrouter_api_key_valid",
      level: "info",
      message: `API key valid, discovered ${models.length} models`,
    });
  } catch (err) {
    checks.push({
      code: "openrouter_api_key_invalid",
      level: "error",
      message: "Failed to validate API key",
      detail: err instanceof Error ? err.message : String(err),
      hint: "Verify the API key is valid and has not expired",
    });
  }

  if (model) {
    checks.push({
      code: "openrouter_model_configured",
      level: "info",
      message: `Model configured: ${model}`,
    });
  }

  return {
    adapterType: ctx.adapterType,
    status: summarizeStatus(checks),
    checks,
    testedAt: new Date().toISOString(),
  };
}