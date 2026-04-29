import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const CreateApprovalSchema = z.object({
  type: z.string(),
  targetAgentId: z.string().uuid().optional()
});

router.get('/', async (req, res) => {
  try {
    const { companyId, status } = req.query;
    res.json({ approvals: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = CreateApprovalSchema.parse(req.body);
    res.json({ success: true, approval: data });
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
    res.json({ id, type: 'hire_agent', status: 'pending' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/decide', async (req, res) => {
  try {
    const { id } = req.params;
    const { decision } = req.body;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;