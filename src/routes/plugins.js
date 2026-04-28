const express = require('express');
const router = express.Router();
const { getPlugins, addPlugin, removePlugin } = require('../lib/opencode-cli');
const { getDataPath, readJSON, writeJSON } = require('../lib/storage');
const { syncNow } = require('../lib/git-sync');

router.get('/', async (req, res) => {
  try {
    const output = await getPlugins();
    const stored = await readJSON(getDataPath('plugins.json')) || [];
    res.json({ output, stored });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { module, global } = req.body;
    const result = await addPlugin(module, global);
    
    const stored = await readJSON(getDataPath('plugins.json')) || [];
    stored.push({ module, global: global || false, addedAt: new Date().toISOString() });
    await writeJSON(getDataPath('plugins.json'), stored);
    
    await syncNow();
    res.json({ success: true, result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:module', async (req, res) => {
  try {
    const { module } = req.params;
    const result = await removePlugin(module);
    
    const stored = await readJSON(getDataPath('plugins.json')) || [];
    const filtered = stored.filter(p => p.module !== module);
    await writeJSON(getDataPath('plugins.json'), filtered);
    
    await syncNow();
    res.json({ success: true, result: result || `Removed ${module}` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;