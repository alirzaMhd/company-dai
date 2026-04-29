import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const CreateRoutineSchema = z.object({
  name: z.string().min(1),
  cronExpression: z.string(),
  issueId: z.string().uuid().optional(),
  agentId: z.string().uuid().optional(),
  enabled: z.boolean().default(true)
});

router.get('/', async (req, res) => {
  try {
    const { companyId } = req.query;
    res.json({ routines: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = CreateRoutineSchema.parse(req.body);
    res.json({ success: true, routine: data });
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
    res.json({ id, name: 'Routine', enabled: true });
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

router.post('/:id/trigger', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;