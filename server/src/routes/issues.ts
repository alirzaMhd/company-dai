import { Router } from 'express';
import { randomUUID } from 'crypto';
import { db } from '../lib/db.js';
import { issues, projects } from '@company-dai/db/schema';
import { eq, and } from 'drizzle-orm';

const router = Router();

router.get('/:companyId/issues', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { status, projectId, assigneeAgentId } = req.query;

    let query = db.select().from(issues).where(eq(issues.companyId, companyId));

    const result = await query;
    res.json({ issues: result });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/:companyId/issues', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { title, description, projectId, goalId, parentId, priority, assigneeAgentId, status } = req.body;
    const id = randomUUID();

    const identifier = `ISS-${Date.now()}`;

    const [newIssue] = await db
      .insert(issues)
      .values({
        id,
        companyId,
        projectId: projectId || null,
        goalId: goalId || null,
        parentId: parentId || null,
        title,
        description: description || null,
        status: status || 'todo',
        priority: priority || 'medium',
        assigneeAgentId: assigneeAgentId || null,
        identifier,
      })
      .returning();

    res.status(201).json(newIssue);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/:companyId/issues/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [issue] = await db
      .select()
      .from(issues)
      .where(eq(issues.id, id))
      .limit(1);

    if (!issue) {
      res.status(404).json({ error: 'Issue not found' });
      return;
    }

    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.patch('/:companyId/issues/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, assigneeAgentId, projectId, goalId } = req.body;

    const [updated] = await db
      .update(issues)
      .set({
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(assigneeAgentId !== undefined && { assigneeAgentId }),
        ...(projectId !== undefined && { projectId }),
        ...(goalId !== undefined && { goalId }),
      })
      .where(eq(issues.id, id))
      .returning();

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.patch('/:companyId/issues/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const [updated] = await db
      .update(issues)
      .set({ status })
      .where(eq(issues.id, id))
      .returning();

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/:companyId/issues/:id/checkout', async (req, res) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;

    const [updated] = await db
      .update(issues)
      .set({ 
        status: 'in_progress',
        assigneeAgentId: agentId,
      })
      .where(eq(issues.id, id))
      .returning();

    res.json({ success: true, issue: updated });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/:companyId/issues/:id/release', async (req, res) => {
  try {
    const { id } = req.params;

    const [updated] = await db
      .update(issues)
      .set({ status: 'backlog' })
      .where(eq(issues.id, id))
      .returning();

    res.json({ success: true, issue: updated });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;