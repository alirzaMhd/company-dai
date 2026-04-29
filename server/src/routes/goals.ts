import { Router } from 'express';
import { z } from 'zod';
import { randomUUID } from 'crypto';

const router = Router();

const goals: Map<string, {
  id: string;
  title: string;
  description: string | null;
  level: string;
  status: string;
  companyId: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}> = new Map();

const CreateGoalSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  parentId: z.string().uuid().optional(),
  level: z.enum(['company', 'team', 'agent', 'task']).default('team'),
  status: z.enum(['planned', 'active', 'completed', 'blocked']).default('planned'),
  targetDate: z.string().datetime().optional()
});

// List goals for a company: /companies/:companyId/goals
router.get('/:companyId/goals', async (req, res) => {
  try {
    const { companyId } = req.params;
    const companyGoals = Array.from(goals.values()).filter(g => g.companyId === companyId);
    res.json({ goals: companyGoals, companyId });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get goal by ID: /goals/:id
router.get('/goals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const goal = goals.get(id);
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    res.json(goal);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Create goal for company: /companies/:companyId/goals
router.post('/:companyId/goals', async (req, res) => {
  try {
    const { companyId } = req.params;
    const data = CreateGoalSchema.parse(req.body);
    const id = randomUUID();
    const now = new Date().toISOString();
    const goal = {
      id,
      title: data.title,
      description: data.description || null,
      level: data.level,
      status: data.status || 'planned',
      companyId,
      parentId: data.parentId || null,
      createdAt: now,
      updatedAt: now
    };
    goals.set(id, goal);
    console.log("[DEBUG] Created goal:", JSON.stringify(goal));
    res.status(201).json(goal);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: (error as Error).message });
  }
});

// Update goal: /goals/:id
router.patch('/goals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete goal: /goals/:id
router.delete('/goals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;