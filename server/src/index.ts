import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// UI builds to ui/dist, so we need to point there
const distPath = path.join(__dirname, '..', 'ui', 'dist');

import companiesRouter from './routes/companies.js';
import agentsRouter from './routes/agents.js';
import issuesRouter from './routes/issues.js';
import projectsRouter from './routes/projects.js';
import goalsRouter from './routes/goals.js';
import heartbeatRouter from './routes/heartbeat.js';
import costsRouter from './routes/costs.js';
import approvalsRouter from './routes/approvals.js';
import authRouter from './routes/auth.js';
import routinesRouter from './routes/routines.js';
import companySkillsRouter from './routes/company-skills.js';
import filesRouter from './routes/files.js';
import pluginsRouter from './routes/plugins.js';
import secretsRouter from './routes/secrets.js';
import mcpRouter from './routes/mcp.js';
import activityRouter from './routes/activity.js';
import settingsRouter from './routes/settings.js';
import dashboardRouter from './routes/dashboard.js';
import skillsRouter from './routes/skills.js';
import labelsRouter from './routes/labels.js';
import joinRequestsRouter from './routes/join-requests.js';
import assetsRouter from './routes/assets.js';
import inboxRouter from './routes/inbox.js';
import preferencesRouter from './routes/preferences.js';
import eventsRouter from './routes/events.js';
import interactionsRouter from './routes/interactions.js';
import companyPortabilityRouter from './routes/company-portability.js';
import documentsRouter from './routes/documents.js';
import githubRouter from './routes/github.js';
import executionWorkspacesRouter from './routes/execution-workspaces.js';
import cliAuthRouter from './routes/cli-auth.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/companies', companiesRouter);
app.use('/api/agents', agentsRouter);
app.use('/api/issues', issuesRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/heartbeat', heartbeatRouter);
app.use('/api/costs', costsRouter);
app.use('/api/approvals', approvalsRouter);
app.use('/api/auth', authRouter);
app.use('/api/routines', routinesRouter);
app.use('/api/company-skills', companySkillsRouter);
app.use('/api/files', filesRouter);
app.use('/api/plugins', pluginsRouter);
app.use('/api/secrets', secretsRouter);
app.use('/api/mcp', mcpRouter);
app.use('/api/activity', activityRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/skills', skillsRouter);
app.use('/api/labels', labelsRouter);
app.use('/api/join-requests', joinRequestsRouter);
app.use('/api/assets', assetsRouter);
app.use('/api/inbox', inboxRouter);
app.use('/api/preferences', preferencesRouter);
app.use('/api/events', eventsRouter);
app.use('/api/interactions', interactionsRouter);
app.use('/api/companies/:id/export', companyPortabilityRouter);
app.use('/api/companies/:id/import', companyPortabilityRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/github', githubRouter);
app.use('/api/execution-workspaces', executionWorkspacesRouter);
app.use('/api/cli-auth', cliAuthRouter);

// Serve static files from dist
app.use(express.static(distPath));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(distPath, 'index.html'));
  }
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;