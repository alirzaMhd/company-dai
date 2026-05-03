import { Router } from 'express';
import { randomUUID } from 'crypto';
import { db } from '../lib/db.js';
import { projects } from '@company-dai/db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

router.get('/:companyId/projects', async (req, res) => {
  try {
    const { companyId } = req.params;
    const result = await db
      .select()
      .from(projects)
      .where(eq(projects.companyId, companyId));
    res.json({ projects: result });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/:companyId/projects', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { name, description, status, goalIds } = req.body;
    const id = randomUUID();

    const [newProject] = await db
      .insert(projects)
      .values({
        id,
        companyId,
        name,
        description: description || null,
        status: status || 'active',
      })
      .returning();

    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/:companyId/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.patch('/:companyId/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    const [updated] = await db
      .update(projects)
      .set({
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
      })
      .where(eq(projects.id, id))
      .returning();

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.delete('/:companyId/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(projects).where(eq(projects.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;