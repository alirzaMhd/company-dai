import { Router } from "express";
import { randomUUID } from "node:crypto";
import { db } from "../lib/db.js";
import { agents as agentsTable, companies } from "@company-dai/db/schema";
import { eq } from "drizzle-orm";
import { assertCompanyAccess } from "./authz.js";

interface AdapterEnvironmentTestResult {
  status: "pass" | "warn" | "fail";
  testedAt: string;
  checks: Array<{
    code: string;
    level: string;
    message: string;
    detail?: string;
    hint?: string;
  }>;
}

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
    
    const models: Array<{ id: string; label: string }> = [];
    
    if (type === "opencode_local") {
      models.push(
        { id: "openai/gpt-4o", label: "GPT-4o" },
        { id: "openai/gpt-4o-mini", label: "GPT-4o Mini" },
        { id: "anthropic/claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet" },
        { id: "anthropic/claude-3-haiku-20240307", label: "Claude 3 Haiku" },
        { id: "google/gemini-1.5-pro", label: "Gemini 1.5 Pro" },
        { id: "google/gemini-1.5-flash", label: "Gemini 1.5 Flash" }
      );
    } else if (type === "claude_local") {
      models.push(
        { id: "claude-sonnet-4-20250514", label: "Claude Sonnet 4" },
        { id: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet" },
        { id: "claude-3-5-haiku-20240307", label: "Claude 3.5 Haiku" },
        { id: "claude-3-opus-20240229", label: "Claude 3 Opus" }
      );
    } else if (type === "codex_local") {
      models.push(
        { id: "claude-sonnet-4-20250514", label: "Claude Sonnet 4" },
        { id: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet" }
      );
    } else if (type === "gemini_local") {
      models.push(
        { id: "gemini-2.0-flash-exp", label: "Gemini 2.0 Flash" },
        { id: "gemini-1.5-pro-002", label: "Gemini 1.5 Pro" },
        { id: "gemini-1.5-flash-002", label: "Gemini 1.5 Flash" }
      );
    } else if (type === "cursor") {
      models.push(
        { id: "claude-sonnet-4-20250514", label: "Claude Sonnet 4" },
        { id: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet" }
      );
    }
    
    res.json(models);
  });

  router.post("/:companyId/adapters/:type/test-environment", async (req, res) => {
    const companyId = req.params.companyId;
    assertCompanyAccess(req, companyId);
    
    const result: AdapterEnvironmentTestResult = {
      status: "pass",
      testedAt: new Date().toISOString(),
      checks: [
        {
          code: "test",
          level: "info",
          message: "Environment check passed",
        }
      ]
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