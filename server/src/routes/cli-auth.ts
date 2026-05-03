import { Router } from 'express';
import { requireAuth, requireBoard } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.use(requireBoard);

router.get('/me', async (req, res) => {
  if (!req.actor?.userId) {
    return res.status(401).json({ error: "Board authentication required" });
  }
  res.json({
    user: {
      id: req.actor.userId,
      name: req.actor.name ?? "Unknown",
    },
    userId: req.actor.userId,
    isInstanceAdmin: req.actor.isInstanceAdmin ?? false,
    companyIds: [],
    source: "session",
    keyId: null,
  });
});

router.get('/challenge', async (req, res) => {
  try {
    res.json({ challenge: crypto.randomUUID(), expiresAt: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const { challenge, signature } = req.body;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/status', async (req, res) => {
  try {
    const { challengeId } = req.body;
    res.json({ status: 'unverified' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;