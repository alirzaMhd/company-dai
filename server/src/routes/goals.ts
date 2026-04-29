import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const CreateGoalSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  parentId: z.string().uuid().optional(),
  level: z.enum(['company', 'team', 'agent']).default('team'),
  targetDate: z.string().datetime().optional()
});

// List goals for a company: /companies/:companyId/goals
router.get('/companies/:companyId/goals', async (req, res) => {
  try {
    const { companyId } = req.params;
    res.json({ goals: [], companyId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get goal by ID: /goals/:id
router.get('/goals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({ id, title: 'Goal', status: 'active', level: 'team', companyId: '' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create goal for company: /companies/:companyId/goals
router.post('/companies/:companyId/goals', async (req, res) => {
  try {
    const data = CreateGoalSchema.parse(req.body);
    res.json({ success: true, goal: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: error.message });
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