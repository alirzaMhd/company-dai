import { Router } from 'express';

const router = Router();

router.get('/:token', async (req, res) => {
  try {
    const { token } = req.params;
    res.json({
      id: token,
      inviteType: 'company_join',
      companyId: 'company-id',
      companyName: 'Company',
      status: 'active',
      allowedJoinTypes: 'both',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:token/onboarding', async (req, res) => {
  try {
    const { token } = req.params;
    res.json({
      onboarding: null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:token/accept', async (req, res) => {
  try {
    const { token } = req.params;
    res.json({ success: true, bootstrapAccepted: true, userId: 'new-user-id' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:inviteId/revoke', async (req, res) => {
  try {
    const { inviteId } = req.params;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;