import { Router } from "express";
import type { Db } from "@company-dai/db";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { accounts, contacts, interactions } from "@company-dai/db";
import { badRequest, forbidden, notFound } from "../errors.js";

export function crmRoutes(db: Db) {
  const router = Router();

  function requireCrmAccess(req: any, res: any, next: any) {
    if (!req.actor) {
      throw forbidden("Authentication required");
    }
    next();
  }

  // Accounts
  router.get("/companies/:companyId/crm/accounts", requireCrmAccess, async (req, res) => {
    const { companyId } = req.params;
    const { q, status, limit = "50", offset = "0" } = req.query;

    let filters = [eq(accounts.companyId, companyId)];
    if (status) {
      filters.push(eq(accounts.status, status as string));
    }
    if (q) {
      filters.push(ilike(accounts.name, `%${q}%`));
    }

    const results = await db
      .select()
      .from(accounts)
      .where(and(...filters))
      .limit(Number(limit))
      .offset(Number(offset))
      .orderBy(desc(accounts.createdAt));

    res.json(results);
  });

  router.get("/companies/:companyId/crm/accounts/:id", requireCrmAccess, async (req, res) => {
    const { id } = req.params;
    const result = await db.select().from(accounts).where(eq(accounts.id, id)).limit(1);
    if (!result[0]) throw notFound("Account not found");
    res.json(result[0]);
  });

  router.post("/companies/:companyId/crm/accounts", requireCrmAccess, async (req, res) => {
    const { companyId } = req.params;
    const { name, domain, industry } = req.body;

    if (!name) throw badRequest("name is required");

    const result = await db
      .insert(accounts)
      .values({
        companyId,
        name,
        domain,
        industry,
        status: "active",
      })
      .returning();

    res.json(result[0]);
  });

  router.patch("/companies/:companyId/crm/accounts/:id", requireCrmAccess, async (req, res) => {
    const { id } = req.params;
    const { name, domain, industry, status } = req.body;

    const result = await db
      .update(accounts)
      .set({ name, domain, industry, status, updatedAt: new Date() })
      .where(eq(accounts.id, id))
      .returning();

    if (!result[0]) throw notFound("Account not found");
    res.json(result[0]);
  });

  router.delete("/companies/:companyId/crm/accounts/:id", requireCrmAccess, async (req, res) => {
    const { id } = req.params;
    await db.update(accounts).set({ status: "deleted" }).where(eq(accounts.id, id)).returning();
    res.json({ success: true });
  });

  // Contacts
  router.get("/companies/:companyId/crm/contacts", requireCrmAccess, async (req, res) => {
    const { companyId } = req.params;
    const { q, status, accountId, limit = "50", offset = "0" } = req.query;

    let filters = [eq(contacts.companyId, companyId)];
    if (status) {
      filters.push(eq(contacts.status, status as string));
    }
    if (accountId) {
      filters.push(eq(contacts.accountId, accountId as string));
    }
    if (q) {
      filters.push(
        or(
          ilike(contacts.firstName, `%${q}%`),
          ilike(contacts.lastName, `%${q}%`),
          ilike(contacts.email, `%${q}%`),
        )!,
      );
    }

    const results = await db
      .select()
      .from(contacts)
      .where(and(...filters))
      .limit(Number(limit))
      .offset(Number(offset))
      .orderBy(desc(contacts.createdAt));

    res.json(results);
  });

  router.get("/companies/:companyId/crm/contacts/:id", requireCrmAccess, async (req, res) => {
    const { id } = req.params;
    const result = await db.select().from(contacts).where(eq(contacts.id, id)).limit(1);
    if (!result[0]) throw notFound("Contact not found");
    res.json(result[0]);
  });

  router.post("/companies/:companyId/crm/contacts", requireCrmAccess, async (req, res) => {
    const { companyId } = req.params;
    const { accountId, firstName, lastName, email, phone, title } = req.body;

    if (!firstName) throw badRequest("firstName is required");

    const result = await db
      .insert(contacts)
      .values({
        companyId,
        accountId,
        firstName,
        lastName,
        email,
        phone,
        title,
        status: "active",
      })
      .returning();

    res.json(result[0]);
  });

  router.patch("/companies/:companyId/crm/contacts/:id", requireCrmAccess, async (req, res) => {
    const { id } = req.params;
    const { accountId, firstName, lastName, email, phone, title, status } = req.body;

    const result = await db
      .update(contacts)
      .set({ accountId, firstName, lastName, email, phone, title, status, updatedAt: new Date() })
      .where(eq(contacts.id, id))
      .returning();

    if (!result[0]) throw notFound("Contact not found");
    res.json(result[0]);
  });

  router.delete("/companies/:companyId/crm/contacts/:id", requireCrmAccess, async (req, res) => {
    const { id } = req.params;
    await db.update(contacts).set({ status: "deleted" }).where(eq(contacts.id, id)).returning();
    res.json({ success: true });
  });

  // Interactions
  router.get("/companies/:companyId/crm/interactions", requireCrmAccess, async (req, res) => {
    const { companyId } = req.params;
    const { contactId, accountId, type, limit = "50", offset = "0" } = req.query;

    let filters = [eq(interactions.companyId, companyId)];
    if (contactId) {
      filters.push(eq(interactions.contactId, contactId as string));
    }
    if (accountId) {
      filters.push(eq(interactions.accountId, accountId as string));
    }
    if (type) {
      filters.push(eq(interactions.type, type as string));
    }

    const results = await db
      .select()
      .from(interactions)
      .where(and(...filters))
      .limit(Number(limit))
      .offset(Number(offset))
      .orderBy(desc(interactions.occurredAt));

    res.json(results);
  });

  router.get("/companies/:companyId/crm/interactions/:id", requireCrmAccess, async (req, res) => {
    const { id } = req.params;
    const result = await db
      .select()
      .from(interactions)
      .where(eq(interactions.id, id))
      .limit(1);
    if (!result[0]) throw notFound("Interaction not found");
    res.json(result[0]);
  });

  router.post("/companies/:companyId/crm/interactions", requireCrmAccess, async (req, res) => {
    const { companyId } = req.params;
    const { contactId, accountId, type, subject, content, direction, occurredAt, durationMinutes } =
      req.body;

    if (!contactId) throw badRequest("contactId is required");
    if (!type) throw badRequest("type is required");
    if (!subject) throw badRequest("subject is required");

    const result = await db
      .insert(interactions)
      .values({
        companyId,
        contactId,
        accountId,
        type,
        subject,
        content,
        direction,
        occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
        durationMinutes,
      })
      .returning();

    res.json(result[0]);
  });

  router.patch("/companies/:companyId/crm/interactions/:id", requireCrmAccess, async (req, res) => {
    const { id } = req.params;
    const { contactId, accountId, type, subject, content, direction, occurredAt, durationMinutes } =
      req.body;

    const result = await db
      .update(interactions)
      .set({
        contactId,
        accountId,
        type,
        subject,
        content,
        direction,
        occurredAt: occurredAt ? new Date(occurredAt) : undefined,
        durationMinutes,
        updatedAt: new Date(),
      })
      .where(eq(interactions.id, id))
      .returning();

    if (!result[0]) throw notFound("Interaction not found");
    res.json(result[0]);
  });

  router.delete(
    "/companies/:companyId/crm/interactions/:id",
    requireCrmAccess,
    async (req, res) => {
      const { id } = req.params;
      await db.delete(interactions).where(eq(interactions.id, id)).returning();
      res.json({ success: true });
    },
  );

  // Timeline: interactions for a contact with full details
  router.get(
    "/companies/:companyId/crm/contacts/:contactId/timeline",
    requireCrmAccess,
    async (req, res) => {
      const { contactId } = req.params;
      const { limit = "20", offset = "0" } = req.query;

      const results = await db
        .select()
        .from(interactions)
        .where(eq(interactions.contactId, contactId))
        .limit(Number(limit))
        .offset(Number(offset))
        .orderBy(desc(interactions.occurredAt));

      res.json(results);
    },
  );

  // Search interactions
  router.get(
    "/companies/:companyId/crm/search",
    requireCrmAccess,
    async (req, res) => {
      const { companyId } = req.params;
      const { q, type, limit = "50", offset = "0" } = req.query;

      let filters = [eq(interactions.companyId, companyId)];
      if (q) {
        filters.push(
          or(
            ilike(interactions.subject, `%${q}%`),
            ilike(interactions.content, `%${q}%`),
          )!,
        );
      }
      if (type) {
        filters.push(eq(interactions.type, type as string));
      }

      const results = await db
        .select()
        .from(interactions)
        .where(and(...filters))
        .limit(Number(limit))
        .offset(Number(offset))
        .orderBy(desc(interactions.occurredAt));

      res.json(results);
    },
  );

  return router;
}