import { Router } from "express";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { db } from "../lib/db.js";
import { agents as agentsTable, companies } from "@company-dai/db/schema";
import { eq } from "drizzle-orm";
import { assertCompanyAccess } from "./authz.js";

interface AdapterEnvironmentCheck {
  code: string;
  level: "info" | "warn" | "error";
  message: string;
  detail?: string;
  hint?: string;
}

interface AdapterEnvironmentTestResult {
  status: "pass" | "warn" | "fail";
  testedAt: string;
  checks: AdapterEnvironmentCheck[];
}

function summarizeStatus(checks: AdapterEnvironmentCheck[]): "pass" | "warn" | "fail" {
  if (checks.some((c) => c.level === "error")) return "fail";
  if (checks.some((c) => c.level === "warn")) return "warn";
  return "pass";
}

function runChildProcess(
  name: string,
  command: string,
  args: string[],
  opts: {
    cwd?: string;
    env?: Record<string, string>;
    timeoutSec?: number;
    graceSec?: number;
    stdin?: string;
  }
): Promise<{ stdout: string; stderr: string; exitCode: number | null; timedOut: boolean }> {
  return new Promise((resolve) => {
    const timeoutSec = opts.timeoutSec || 30;
    const graceSec = opts.graceSec || 3;
    const timeoutMs = (timeoutSec + graceSec) * 1000;

    const child = spawn(command, args, {
      cwd: opts.cwd || process.cwd(),
      env: { ...process.env, ...opts.env },
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
    }, timeoutMs);

    if (opts.stdin) {
      child.stdin.write(opts.stdin);
      child.stdin.end();
    }

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ stdout, stderr, exitCode: code, timedOut });
    });

    child.on("error", () => {
      clearTimeout(timer);
      resolve({ stdout, stderr, exitCode: null, timedOut });
    });
  });
}

function parseOpenCodeModelsOutput(stdout: string): Array<{ id: string; label: string }> {
  const models: Array<{ id: string; label: string }> = [];
  const seen = new Set<string>();
  for (const line of stdout.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const firstToken = trimmed.split(/\s+/)[0] || "";
    if (!firstToken.includes("/")) continue;
    const provider = firstToken.slice(0, firstToken.indexOf("/"));
    const model = firstToken.slice(firstToken.indexOf("/") + 1);
    if (!provider || !model) continue;
    const id = `${provider}/${model}`;
    if (seen.has(id)) continue;
    seen.add(id);
    models.push({ id, label: id });
  }
  return models.sort((a, b) => a.id.localeCompare(b.id));
}

async function discoverOpenCodeModels(cwd?: string, env?: Record<string, string>): Promise<Array<{ id: string; label: string }>> {
  const result = await runChildProcess(
    "opencode-models",
    "opencode",
    ["models"],
    { cwd, env, timeoutSec: 20, graceSec: 3 }
  );
  if (result.timedOut || (result.exitCode ?? 1) !== 0) {
    return [];
  }
  return parseOpenCodeModelsOutput(result.stdout);
}

const CLAUDE_LOCAL_MODELS = [
  { id: "claude-opus-4-7", label: "Claude Opus 4.7" },
  { id: "claude-opus-4-6", label: "Claude Opus 4.6" },
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
  { id: "claude-haiku-4-6", label: "Claude Haiku 4.6" },
  { id: "claude-sonnet-4-5-20250929", label: "Claude Sonnet 4.5" },
  { id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5" },
];

const CODEX_LOCAL_MODELS = [
  { id: "claude-opus-4-7", label: "Claude Opus 4.7" },
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
];

const CURSOR_MODELS = [
  { id: "claude-opus-4-7", label: "Claude Opus 4.7" },
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
];

const GEMINI_LOCAL_MODELS = [
  { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { id: "gemini-2.0-flash-exp", label: "Gemini 2.0 Flash" },
  { id: "gemini-1.5-pro-002", label: "Gemini 1.5 Pro" },
  { id: "gemini-1.5-flash-002", label: "Gemini 1.5 Flash" },
];

export function createAgentsRouter() {
  const router = Router();

  router.get("/:companyId/agents", async (req, res) => {
    const companyId = req.params.companyId;
    assertCompanyAccess(req, companyId);
    
    const result = await db
      .select()
      .from(agentsTable)
      .where(eq(agentsTable.companyId, companyId));
    
    res.json(result);
  });

  router.post("/:companyId/agent-hires", async (req, res) => {
    const companyId = req.params.companyId;
    assertCompanyAccess(req, companyId);
    
    const { name, role, adapterType, adapterConfig, runtimeConfig } = req.body;
    
    const [newAgent] = await db
      .insert(agentsTable)
      .values({
        id: randomUUID(),
        companyId,
        name: name || "Agent",
        role: role || "ceo",
        adapterType: adapterType || "opencode_local",
        adapterConfig: adapterConfig || {},
        runtimeConfig: runtimeConfig || {},
        status: "active",
      })
      .returning();
    
    res.json({
      agent: newAgent,
      approval: null
    });
  });

  router.get("/agents/:id", async (req, res) => {
    const id = req.params.id;
    const [agent] = await db
      .select()
      .from(agentsTable)
      .where(eq(agentsTable.id, id))
      .limit(1);
    
    if (!agent) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }
    
    assertCompanyAccess(req, agent.companyId);
    res.json(agent);
  });

  router.patch("/agents/:id", async (req, res) => {
    const id = req.params.id;
    const [existing] = await db
      .select()
      .from(agentsTable)
      .where(eq(agentsTable.id, id))
      .limit(1);
    
    if (!existing) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }
    
    assertCompanyAccess(req, existing.companyId);
    
    const { adapterConfig, ...rest } = req.body;
    
    const [updated] = await db
      .update(agentsTable)
      .set({
        ...rest,
        ...(adapterConfig ? { adapterConfig } : {}),
        updatedAt: new Date(),
      })
      .where(eq(agentsTable.id, id))
      .returning();
    
    res.json(updated);
  });

  router.get("/:companyId/adapters/:type/models", async (req, res) => {
    const companyId = req.params.companyId;
    assertCompanyAccess(req, companyId);
    const type = req.params.type;
    const adapterConfig = typeof req.query.adapterConfig === "string" ? JSON.parse(req.query.adapterConfig) : {};
    
    const models: Array<{ id: string; label: string }> = [];
    
    if (type === "opencode_local") {
      try {
        const command = adapterConfig.command || "opencode";
        const cwd = adapterConfig.cwd || process.cwd();
        const discovered = await discoverOpenCodeModels(cwd, adapterConfig.env);
        if (discovered.length > 0) {
          models.push(...discovered);
        } else {
          models.push(
            { id: "openai/gpt-4o", label: "GPT-4o" },
            { id: "anthropic/claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
            { id: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" }
          );
        }
      } catch {
        models.push(
          { id: "openai/gpt-4o", label: "GPT-4o" },
          { id: "anthropic/claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
          { id: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" }
        );
      }
    } else if (type === "claude_local") {
      models.push(...CLAUDE_LOCAL_MODELS);
    } else if (type === "codex_local") {
      models.push(...CODEX_LOCAL_MODELS);
    } else if (type === "gemini_local") {
      models.push(...GEMINI_LOCAL_MODELS);
    } else if (type === "cursor") {
      models.push(...CURSOR_MODELS);
    } else if (type === "opencode_remote") {
      models.push(
        { id: "openai/gpt-4o", label: "GPT-4o" },
        { id: "openai/gpt-4o-mini", label: "GPT-4o Mini" },
        { id: "anthropic/claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
        { id: "anthropic/claude-haiku-4-6", label: "Claude Haiku 4.6" },
        { id: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" },
        { id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" }
      );
    }
    
    res.json(models);
  });

  router.post("/:companyId/adapters/:type/test-environment", async (req, res) => {
    const companyId = req.params.companyId;
    assertCompanyAccess(req, companyId);
    const type = req.params.type;
    const adapterConfig = req.body.adapterConfig || {};
    
    const checks: AdapterEnvironmentCheck[] = [];
    const command = adapterConfig.command || (type === "claude_local" ? "claude" : "opencode");
    const cwd = adapterConfig.cwd || process.cwd();
    const runtimeEnv = { ...process.env, ...adapterConfig.env };
    
    if (type === "opencode_local" || type === "claude_local") {
      const fs = await import("node:fs");
      const isValidDir = fs.existsSync(cwd);
      
      if (isValidDir) {
        checks.push({
          code: `${type}_cwd_valid`,
          level: "info",
          message: `Working directory is valid: ${cwd}`,
        });
      } else {
        checks.push({
          code: `${type}_cwd_invalid`,
          level: "error",
          message: "Working directory is invalid",
          detail: cwd,
        });
      }
      
      const canRunProbe = !checks.some((c) => c.level === "error");
      
      if (canRunProbe) {
        const args = type === "claude_local"
          ? ["--print", "-", "--output-format", "stream-json", "--verbose"]
          : ["run", "--format", "json"];
        
        const model = adapterConfig.model;
        if (model) {
          args.push(type === "claude_local" ? "--model" : "--model", model);
        }
        
        const dangerouslySkipPermissions = adapterConfig.dangerouslySkipPermissions !== false;
        if (dangerouslySkipPermissions && type === "claude_local") {
          args.push("--dangerously-skip-permissions");
        }
        if (dangerouslySkipPermissions && type === "opencode_local") {
          args.push("--dangerously-skip-permissions");
        }
        
        const probeResult = await runChildProcess(
          `${type}-test-${Date.now()}`,
          command,
          args,
          {
            cwd,
            env: runtimeEnv,
            timeoutSec: 60,
            graceSec: 5,
            stdin: "Respond with hello.",
          }
        );
        
        if (probeResult.timedOut) {
          checks.push({
            code: `${type}_hello_probe_timed_out`,
            level: "warn",
            message: "Hello probe timed out.",
            hint: "Retry the probe. If this persists, run the command manually.",
          });
        } else if ((probeResult.exitCode ?? 1) === 0) {
          const hasHello = /hello/i.test(probeResult.stdout);
          checks.push({
            code: hasHello ? `${type}_hello_probe_passed` : `${type}_hello_probe_unexpected_output`,
            level: hasHello ? "info" : "warn",
            message: hasHello
              ? "Hello probe succeeded."
              : "Probe ran but did not return expected output.",
            detail: probeResult.stdout.slice(0, 240),
          });
        } else {
          const authRequired = /auth(?:entication)?\s*required|api\s*key|not\s+logged\s+in/i.test(probeResult.stderr + probeResult.stdout);
          checks.push({
            code: authRequired ? `${type}_hello_probe_auth_required` : `${type}_hello_probe_failed`,
            level: authRequired ? "warn" : "error",
            message: authRequired
              ? "CLI is installed but login/authentication is required."
              : "Hello probe failed.",
            detail: probeResult.stderr.slice(0, 240) || probeResult.stdout.slice(0, 240),
            hint: authRequired
              ? `Run \`${command} login\` and complete sign-in, then retry.`
              : `Run \`${command} --print -\` manually to debug.`,
          });
        }
      }
    } else {
      checks.push({
        code: "test_not_implemented",
        level: "info",
        message: `Test environment not implemented for adapter type: ${type}`,
      });
    }
    
    const result: AdapterEnvironmentTestResult = {
      status: summarizeStatus(checks),
      testedAt: new Date().toISOString(),
      checks,
    };
    
    res.json(result);
  });

  router.post("/agents/:id/pause", async (req, res) => {
    const id = req.params.id;
    const [agent] = await db
      .select()
      .from(agentsTable)
      .where(eq(agentsTable.id, id))
      .limit(1);
    
    if (!agent) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }
    
    assertCompanyAccess(req, agent.companyId);
    
    const [updated] = await db
      .update(agentsTable)
      .set({ status: "paused", updatedAt: new Date() })
      .where(eq(agentsTable.id, id))
      .returning();
    
    res.json(updated);
  });

  router.post("/agents/:id/resume", async (req, res) => {
    const id = req.params.id;
    const [agent] = await db
      .select()
      .from(agentsTable)
      .where(eq(agentsTable.id, id))
      .limit(1);
    
    if (!agent) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }
    
    assertCompanyAccess(req, agent.companyId);
    
    const [updated] = await db
      .update(agentsTable)
      .set({ status: "active", updatedAt: new Date() })
      .where(eq(agentsTable.id, id))
      .returning();
    
    res.json(updated);
  });

  router.post("/agents/:id/approve", async (req, res) => {
    const id = req.params.id;
    const [agent] = await db
      .select()
      .from(agentsTable)
      .where(eq(agentsTable.id, id))
      .limit(1);
    
    if (!agent) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }
    
    assertCompanyAccess(req, agent.companyId);
    
    const [updated] = await db
      .update(agentsTable)
      .set({ status: "active", updatedAt: new Date() })
      .where(eq(agentsTable.id, id))
      .returning();
    
    res.json(updated);
  });

  router.delete("/agents/:id", async (req, res) => {
    const id = req.params.id;
    const [agent] = await db
      .select()
      .from(agentsTable)
      .where(eq(agentsTable.id, id))
      .limit(1);
    
    if (!agent) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }
    
    assertCompanyAccess(req, agent.companyId);
    
    await db
      .delete(agentsTable)
      .where(eq(agentsTable.id, id));
    
    res.json({ ok: true });
  });

  router.get("/:companyId/org", async (req, res) => {
    const companyId = req.params.companyId;
    assertCompanyAccess(req, companyId);
    
    const companyAgents = await db
      .select()
      .from(agentsTable)
      .where(eq(agentsTable.companyId, companyId));
    
    res.json(companyAgents);
  });

  return router;
}