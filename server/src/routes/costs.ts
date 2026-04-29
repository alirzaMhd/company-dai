import { Router } from 'express';

const router = Router();

router.get('/events', async (req, res) => {
  try {
    const { companyId } = req.query;
    res.json({ events: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/events', async (req, res) => {
  try {
    const { companyId, agentId, provider, model, inputTokens, outputTokens, costCents } = req.body;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/rollups', async (req, res) => {
  try {
    const { companyId, agentId, period } = req.query;
    res.json({ totalCost: 0, byAgent: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;