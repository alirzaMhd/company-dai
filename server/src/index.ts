import express from 'express';
import cors from 'cors';

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

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;