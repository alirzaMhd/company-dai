import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const CreateAgentSchema = z.object({
  name: z.string().min(1),
  nameKey: z.string().min(1),
  adapterType: z.string().default('opencode-local'),
  adapterConfig: z.record(z.unknown()).optional(),
  reportsTo: z.string().uuid().optional(),
  monthlyBudget: z.number().default(0),
  heartbeatSchedule: z.string().optional(),
  role: z.string().optional()
});

const UpdateAgentSchema = CreateAgentSchema.partial();

router.get('/', async (req, res) => {
  try {
    const { companyId } = req.query;
    res.json({ agents: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = CreateAgentSchema.parse(req.body);
    res.json({ success: true, agent: data });
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
    res.json({ id, name: 'Agent', status: 'active', adapterType: 'opencode-local' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = UpdateAgentSchema.parse(req.body);
    res.json({ success: true, agent: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
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

router.post('/:id/heartbeat', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({ success: true, runId: 'new-run-id' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/runs', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({ runs: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/skills', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({ skills: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/skills/sync', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/config', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;