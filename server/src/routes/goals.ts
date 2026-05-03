import { Router } from 'express';
import { randomUUID } from 'crypto';
import { db } from '../lib/db.js';
import { goals } from '@company-dai/db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

router.get('/:companyId/goals', async (req, res) => {
  try {
    const { companyId } = req.params;
    const result = await db
      .select()
      .from(goals)
      .where(eq(goals.companyId, companyId));
    res.json({ goals: result, companyId });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/goals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [goal] = await db
      .select()
      .from(goals)
      .where(eq(goals.id, id))
      .limit(1);
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    res.json(goal);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/:companyId/goals', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { title, description, level, status, parentId } = req.body;
    const id = randomUUID();
    const now = new Date();

    const [newGoal] = await db
      .insert(goals)
      .values({
        id,
        companyId,
        title,
        description: description || null,
        level: level || 'team',
        status: status || 'planned',
        parentId: parentId || null,
      })
      .returning();

    res.status(201).json(newGoal);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.patch('/goals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, level } = req.body;

    const [updated] = await db
      .update(goals)
      .set({
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(level && { level }),
      })
      .where(eq(goals.id, id))
      .returning();

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.delete('/goals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(goals).where(eq(goals.id, id));
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;