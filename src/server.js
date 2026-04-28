const express = require('express');
const path = require('path');
const { initStorage, getDataPath } = require('./lib/storage');
const { initGitSync } = require('./lib/git-sync');
const agentRoutes = require('./routes/agents');
const mcpRoutes = require('./routes/mcp');
const skillRoutes = require('./routes/skills');
const pluginRoutes = require('./routes/plugins');
const sessionRoutes = require('./routes/sessions');
const syncRoutes = require('./routes/sync');
const statusRoutes = require('./routes/status');

const app = express();
const PORT = process.env.PORT || 3100;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/agents', agentRoutes);
app.use('/api/mcp', mcpRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/plugins', pluginRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/status', statusRoutes);

app.get('/api', (req, res) => {
  res.json({ 
    name: 'OpenCode Manager API', 
    version: '1.0.0',
    endpoints: [
      '/api/agents', '/api/mcp', '/api/skills', 
      '/api/plugins', '/api/sessions', '/api/sync', '/api/status'
    ]
  });
});

async function start() {
  console.log('Initializing OpenCode Manager...');
  
  await initStorage();
  console.log('✓ Storage initialized');
  
  await initGitSync();
  console.log('✓ Git sync initialized');
  
  app.listen(PORT, () => {
    console.log(`\n🚀 OpenCode Manager running at http://localhost:${PORT}\n`);
  });
}

start().catch(console.error);