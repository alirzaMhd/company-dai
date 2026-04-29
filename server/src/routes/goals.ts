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

router.get('/', async (req, res) => {
  try {
    const { companyId, parentId } = req.query;
    res.json({ goals: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
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

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({ id, title: 'Goal', status: 'active', level: 'team' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;