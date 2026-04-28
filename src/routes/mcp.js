const express = require('express');
const router = express.Router();
const { getMCPServers, addMCPServer, removeMCPServer } = require('../lib/opencode-cli');
const { getDataPath, readJSON, writeJSON } = require('../lib/storage');
const { syncNow } = require('../lib/git-sync');

router.get('/', async (req, res) => {
  try {
    const output = await getMCPServers();
    const stored = await readJSON(getDataPath('mcp-servers.json')) || [];
    res.json({ output, stored });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, type, command } = req.body;
    const result = await addMCPServer(name, type, command);
    
    const stored = await readJSON(getDataPath('mcp-servers.json')) || [];
    stored.push({ name, type, command, addedAt: new Date().toISOString() });
    await writeJSON(getDataPath('mcp-servers.json'), stored);
    
    await syncNow();
    res.json({ success: true, result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const result = await removeMCPServer(name);
    
    const stored = await readJSON(getDataPath('mcp-servers.json')) || [];
    const filtered = stored.filter(s => s.name !== name);
    await writeJSON(getDataPath('mcp-servers.json'), filtered);
    
    await syncNow();
    res.json({ success: true, result: result || `Removed ${name}` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;