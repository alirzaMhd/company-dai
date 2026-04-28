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
const projectRoutes = require('./routes/projects');
const chatRoutes = require('./routes/chat');
const issuesRoutes = require('./routes/issues');
const taskRoutes = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 3100;

app.use(express.json());

// API routes
app.use('/api/agents', agentRoutes);
app.use('/api/mcp', mcpRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/plugins', pluginRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/issues', issuesRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/api', (req, res) => {
  res.json({ 
    name: 'OpenCode Manager API', 
    version: '2.0.0',
    endpoints: [
      '/api/agents', '/api/mcp', '/api/skills', 
      '/api/plugins', '/api/sessions', '/api/sync', '/api/status',
      '/api/projects', '/api/chat', '/api/issues'
    ]
  });
});

// Serve React SPA build in production
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(distPath, 'index.html'));
  }
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
