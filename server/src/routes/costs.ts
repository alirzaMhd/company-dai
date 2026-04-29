import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const CreateCostEventSchema = z.object({
  companyId: z.string().uuid(),
  agentId: z.string().uuid(),
  provider: z.string(),
  model: z.string(),
  inputTokens: z.number().default(0),
  outputTokens: z.number().default(0),
  costCents: z.number().default(0)
});

router.get('/events', async (req, res) => {
  try {
    const { companyId, agentId, runId, startDate, endDate } = req.query;
    res.json({ events: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/events', async (req, res) => {
  try {
    const data = CreateCostEventSchema.parse(req.body);
    res.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

router.get('/rollups', async (req, res) => {
  try {
    const { companyId, agentId, period, groupBy } = req.query;
    res.json({
      totalCost: 0,
      byAgent: [],
      byProvider: [],
      byModel: []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/budgets', async (req, res) => {
  try {
    const { companyId, agentId } = req.query;
    res.json({ budgets: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/budgets', async (req, res) => {
  try {
    const { companyId, agentId, monthlyLimit, alertAt } = req.body;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/alerts', async (req, res) => {
  try {
    const { companyId, agentId } = req.query;
    res.json({ alerts: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;