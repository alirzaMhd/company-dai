import { Router } from 'express';

const router = Router();

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