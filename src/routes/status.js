const express = require('express');
const router = express.Router();
const { getDataPath, readJSON } = require('../lib/storage');
const { getStatus } = require('../lib/git-sync');

router.get('/', async (req, res) => {
  try {
    const agents = await readJSON(getDataPath('agents.json')) || [];
    const mcp = await readJSON(getDataPath('mcp-servers.json')) || [];
    const skills = await readJSON(getDataPath('skills.json')) || [];
    const plugins = await readJSON(getDataPath('plugins.json')) || [];
    const sessionsMeta = await readJSON(getDataPath('sessions', 'metadata.json')) || { sessions: [] };
    const syncStatus = await getStatus();
    
    res.json({
      agents: agents.length,
      mcpServers: mcp.length,
      skills: skills.length,
      plugins: plugins.length,
      sessions: sessionsMeta.sessions.length,
      sync: syncStatus
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;