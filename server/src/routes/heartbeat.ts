import { Router } from 'express';

const router = Router();

router.post('/invoke', async (req, res) => {
  try {
    const { agentId, issueId } = req.body;
    res.json({ success: true, runId: 'new-run-id' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/runs', async (req, res) => {
  try {
    const { companyId, agentId, status } = req.query;
    res.json({ runs: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/runs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({ id, status: 'queued' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/status', async (req, res) => {
  try {
    const { companyId } = req.query;
    res.json({ status: 'idle' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;