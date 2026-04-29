import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const CreateInteractionSchema = z.object({
  issueId: z.string().uuid(),
  type: z.enum(['ask_user_questions', 'request_confirmation', 'suggest_tasks']),
  questions: z.array(z.object({
    id: z.string(),
    text: z.string(),
    required: z.boolean().default(false),
    options: z.array(z.object({
      id: z.string(),
      label: z.string()
    })).optional()
  })).optional(),
  context: z.record(z.unknown()).optional()
});

router.get('/', async (req, res) => {
  try {
    const { issueId, runId } = req.query;
    res.json({ interactions: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = CreateInteractionSchema.parse(req.body);
    res.json({ success: true });
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
    res.json({ id, type: 'ask_user_questions', status: 'pending' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/answer', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({ answers: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/answer', async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;