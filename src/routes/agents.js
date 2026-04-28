const express = require('express');
const router = express.Router();
const { getAgents, createAgent } = require('../lib/opencode-cli');
const { getDataPath, readJSON, writeJSON } = require('../lib/storage');
const { syncNow } = require('../lib/git-sync');

router.get('/', async (req, res) => {
  try {
    const stored = await readJSON(getDataPath('agents.json')) || [];
    res.json(stored);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, description, mode, tools, model } = req.body;
    const result = await createAgent({ path: name, description, mode, tools, model });
    
    const agents = await getAgents();
    await writeJSON(getDataPath('agents.json'), agents);
    
    await syncNow();
    res.json({ success: true, result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const stored = await readJSON(getDataPath('agents.json')) || [];
    const filtered = stored.filter(a => a.name !== name);
    await writeJSON(getDataPath('agents.json'), filtered);
    
    await syncNow();
    res.json({ success: true, message: `Agent ${name} marked for deletion` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const { permissions } = req.body;
    
    const stored = await readJSON(getDataPath('agents.json')) || [];
    const idx = stored.findIndex(a => a.name === name);
    
    if (idx >= 0) {
      stored[idx].permissions = permissions;
    } else {
      stored.push({ name, permissions });
    }
    
    await writeJSON(getDataPath('agents.json'), stored);
    await syncNow();
    
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;