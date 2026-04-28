const express = require('express');
const router = express.Router();
const { getSkills, addSkill, removeSkill } = require('../lib/opencode-cli');
const { getDataPath, readJSON, writeJSON } = require('../lib/storage');
const { syncNow } = require('../lib/git-sync');

router.get('/', async (req, res) => {
  try {
    const skills = await getSkills();
    const stored = await readJSON(getDataPath('skills.json')) || [];
    res.json({ skills, stored });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const skill = req.body;
    const result = await addSkill(skill);
    
    const stored = await readJSON(getDataPath('skills.json')) || [];
    stored.push({ ...skill, addedAt: new Date().toISOString() });
    await writeJSON(getDataPath('skills.json'), stored);
    
    await syncNow();
    res.json({ success: true, result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const result = await removeSkill(name);
    
    const stored = await readJSON(getDataPath('skills.json')) || [];
    const filtered = stored.filter(s => (typeof s === 'string' ? s : s.name) !== name);
    await writeJSON(getDataPath('skills.json'), filtered);
    
    await syncNow();
    res.json({ success: true, result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;