const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');

const STRUCTURE = {
  'agents.json': [],
  'mcp-servers.json': [],
  'skills.json': [],
  'plugins.json': [],
  'providers.json': { credentials: [] },
  'sessions': {
    'metadata.json': { sessions: [] },
    'exports': {}
  },
  'database': {},
  'projects': {}
};

async function initStorage() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  
  for (const [name, defaultValue] of Object.entries(STRUCTURE)) {
    const fullPath = path.join(DATA_DIR, name);
    const dir = path.dirname(fullPath);
    
    if (name.includes('/')) {
      await fs.mkdir(dir, { recursive: true });
    }
    
    try {
      await fs.access(fullPath);
    } catch {
      if (typeof defaultValue === 'object' && !Object.keys(defaultValue).length) {
        await fs.mkdir(fullPath, { recursive: true });
      } else if (typeof defaultValue === 'object') {
        await fs.writeFile(fullPath, JSON.stringify(defaultValue, null, 2));
      }
    }
  }
  
  const exportsDir = path.join(DATA_DIR, 'sessions', 'exports');
  await fs.mkdir(exportsDir, { recursive: true });
  
  console.log('Data directory:', DATA_DIR);
}

function getDataPath(...parts) {
  return path.join(DATA_DIR, ...parts);
}

async function readJSON(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

async function writeJSON(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

module.exports = { initStorage, getDataPath, readJSON, writeJSON, DATA_DIR };