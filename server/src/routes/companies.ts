import { Router } from "express";
import { randomUUID } from "crypto";
import { db } from "../lib/db.js";
import { companies } from "@company-dai/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const result = await db.select().from(companies);
    res.set("Cache-Control", "public, max-age=30, stale-while-revalidate=300");
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, description } = req.body;
    const id = randomUUID();
    const now = new Date();
    const nameUpper = name.toUpperCase();
    const basePrefix = nameUpper.slice(0, 3) || "CMP";
    
    const allCompanies = await db.select({ issuePrefix: companies.issuePrefix }).from(companies);
    const existingPrefixes = allCompanies.map(c => c.issuePrefix);
    
    let counter = 1;
    let issuePrefix = `${basePrefix}${counter}`;
    while (existingPrefixes.includes(issuePrefix)) {
      counter++;
      issuePrefix = `${basePrefix}${counter}`;
    }

    const [newCompany] = await db
      .insert(companies)
      .values({
        id,
        name,
        description: description || null,
        status: "active",
        issuePrefix,
        issueCounter: 0,
        budgetMonthlyCents: 0,
        spentMonthlyCents: 0,
        requireBoardApprovalForNewAgents: true,
        feedbackDataSharingEnabled: false,
      })
      .returning();

    res.status(201).json(newCompany);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.id, id))
      .limit(1);

    if (!company) {
      res.status(404).json({ error: "Company not found" });
      return;
    }

    res.json(company);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;