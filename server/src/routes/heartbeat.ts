import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const InvokeHeartbeatSchema = z.object({
  agentId: z.string().uuid(),
  issueId: z.string().uuid().optional(),
  manual: z.boolean().default(false)
});

router.post('/invoke', async (req, res) => {
  try {
    const data = InvokeHeartbeatSchema.parse(req.body);
    const runId = crypto.randomUUID();
    res.json({ success: true, runId, status: 'queued' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

router.get('/runs', async (req, res) => {
  try {
    const { companyId, agentId, status, limit } = req.query;
    res.json({ runs: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/runs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({
      id,
      status: 'running',
      agentId: 'agent-id',
      startedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/runs/:id/events', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({ events: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/runs/:id/transcript', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({ transcript: '' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/runs/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/schedule/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    res.json({ schedule: null, nextRun: null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/schedule/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { cronExpression, enabled } = req.body;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/status', async (req, res) => {
  try {
    res.json({ status: 'idle', activeRuns: 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;