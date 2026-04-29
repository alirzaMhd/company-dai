import { Router } from 'express';

const router = Router();

router.get('/dashboard', async (req, res) => {
  try {
    const { companyId } = req.query;
    res.json({
      companyCount: 0,
      agentCount: 0,
      issueCount: 0,
      activeRuns: 0,
      totalCost: 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/live', async (req, res) => {
  try {
    const { companyId } = req.query;
    res.json({ runs: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/live/:runId', async (req, res) => {
  try {
    const { runId } = req.params;
    res.json({ id: runId, status: 'running', events: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;