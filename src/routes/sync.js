const express = require('express');
const router = express.Router();
const { enable, disable, syncNow, pullChanges, pushChanges, setRemote, getStatus } = require('../lib/git-sync');

router.get('/status', async (req, res) => {
  try {
    const status = await getStatus();
    res.json(status);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/enable', async (req, res) => {
  try {
    const { remote } = req.body;
    const result = await enable(remote);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/disable', async (req, res) => {
  try {
    const result = await disable();
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/remote', async (req, res) => {
  try {
    const { url } = req.body;
    const result = await setRemote(url);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/sync', async (req, res) => {
  try {
    const result = await syncNow();
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/pull', async (req, res) => {
  try {
    const result = await pullChanges();
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/push', async (req, res) => {
  try {
    const result = await pushChanges();
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;