import { Router } from 'express';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { userId, companyId } = req.query;
    res.json({ preferences: {} });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/', async (req, res) => {
  try {
    const { key, value } = req.body;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/company', async (req, res) => {
  try {
    const { userId, companyId } = req.query;
    res.json({ preferences: {} });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/company', async (req, res) => {
  try {
    const { userId, companyId, key, value } = req.body;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;