const express = require('express');
const router = express.Router();
const { getSessions, exportSession } = require('../lib/opencode-cli');
const { getDataPath, readJSON, writeJSON } = require('../lib/storage');
const { syncNow } = require('../lib/git-sync');
const fs = require('fs').promises;
const { exec } = require('child_process');

router.get('/', async (req, res) => {
  try {
    const output = await getSessions();
    
    const metadataPath = getDataPath('sessions', 'metadata.json');
    const metadata = await readJSON(metadataPath) || { sessions: [] };
    
    res.json({ output, sessions: metadata.sessions });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/export/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await exportSession(id);
    
    const exportsDir = getDataPath('sessions', 'exports');
    await fs.mkdir(exportsDir, { recursive: true });
    
    const exportPath = getDataPath('sessions', 'exports', `${id}.json`);
    await writeJSON(exportPath, { 
      sessionId: id, 
      exported: new Date().toISOString(),
      data: result 
    });
    
    await syncNow();
    res.json({ success: true, result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/export/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const exportPath = getDataPath('sessions', 'exports', `${id}.json`);
    const data = await readJSON(exportPath);
    
    if (!data) {
      return res.status(404).json({ error: 'Export not found' });
    }
    
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/import', async (req, res) => {
  try {
    const { sessionData } = req.body;
    
    const tempFile = `/tmp/opencode-import-${Date.now()}.json`;
    await fs.writeFile(tempFile, JSON.stringify(sessionData));
    
    await new Promise((resolve, reject) => {
      exec(`opencode import ${tempFile}`, (err, stdout, stderr) => {
        if (err) reject(new Error(stderr));
        else resolve(stdout);
      });
    });
    
    await fs.unlink(tempFile);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/exports', async (req, res) => {
  try {
    const exportsDir = getDataPath('sessions', 'exports');
    const files = await fs.readdir(exportsDir);
    res.json({ exports: files.map(f => f.replace('.json', '')) });
  } catch (e) {
    res.json({ exports: [] });
  }
});

router.post('/sync-all', async (req, res) => {
  try {
    const output = await getSessions();
    
    const sessionList = output.split('\n').filter(line => 
      line.includes('ses_')
    );
    
    const sessions = [];
    for (const line of sessionList) {
      const match = line.match(/(ses_\w+)\s+(.+)/);
      if (match) {
        sessions.push({
          id: match[1],
          title: match[2].trim(),
          syncedAt: new Date().toISOString()
        });
      }
    }
    
    const metadataPath = getDataPath('sessions', 'metadata.json');
    await writeJSON(metadataPath, { sessions });
    
    await syncNow();
    res.json({ success: true, count: sessions.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;