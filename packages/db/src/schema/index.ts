import { pgTable, text, timestamp, uuid, boolean, integer, jsonb, real } from 'drizzle-orm/pg-core';

export const companies = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  status: text('status').notNull().default('active'),
  budget: real('budget').notNull().default(0),
  branding: jsonb('branding'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const authUsers = pgTable('auth_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const authSessions = pgTable('auth_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => authUsers.id),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const companyMemberships = pgTable('company_memberships', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  userId: uuid('user_id').references(() => authUsers.id),
  agentId: uuid('agent_id'),
  role: text('role').notNull().default('member'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const agents = pgTable('agents', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  name: text('name').notNull(),
  nameKey: text('name_key').notNull(),
  status: text('status').notNull().default('active'),
  icon: text('icon'),
  role: text('role'),
  adapterType: text('adapter_type').notNull().default('opencode-local'),
  adapterConfig: jsonb('adapter_config'),
  reportsTo: uuid('reports_to'),
  monthlyBudget: real('monthly_budget').notNull().default(0),
  currentCost: real('current_cost').notNull().default(0),
  heartbeatSchedule: text('heartbeat_schedule'),
  lastHeartbeatAt: timestamp('last_heartbeat_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status').notNull().default('active'),
  targetDate: timestamp('target_date'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const goals = pgTable('goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  parentId: uuid('parent_id'),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').notNull().default('active'),
  level: text('level').notNull().default('team'),
  targetDate: timestamp('target_date'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const issues = pgTable('issues', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  issueNumber: integer('issue_number').notNull(),
  identifier: text('identifier').notNull(),
  projectId: uuid('project_id').references(() => projects.id),
  goalId: uuid('goal_id').references(() => goals.id),
  parentId: uuid('parent_id'),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').notNull().default('backlog'),
  priority: text('priority').notNull().default('medium'),
  assigneeAgentId: uuid('assignee_agent_id').references(() => agents.id),
  assigneeUserId: uuid('assignee_user_id').references(() => authUsers.id),
  checkoutRunId: uuid('checkout_run_id'),
  executionRunId: uuid('execution_run_id'),
  executionAgentNameKey: text('execution_agent_name_key'),
  executionLockedAt: timestamp('execution_locked_at'),
  executionPolicy: jsonb('execution_policy'),
  executionState: jsonb('execution_state'),
  originKind: text('origin_kind').default('manual'),
  originId: text('origin_id'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  cancelledAt: timestamp('cancelled_at'),
  createdByAgentId: uuid('created_by_agent_id').references(() => agents.id),
  createdByUserId: uuid('created_by_user_id').references(() => authUsers.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const issueComments = pgTable('issue_comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  issueId: uuid('issue_id').notNull().references(() => issues.id),
  authorAgentId: uuid('author_agent_id').references(() => agents.id),
  authorUserId: uuid('author_user_id').references(() => authUsers.id),
  body: text('body').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const issueRelations = pgTable('issue_relations', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  issueId: uuid('issue_id').notNull().references(() => issues.id),
  relatedIssueId: uuid('related_issue_id').notNull().references(() => issues.id),
  type: text('type').notNull().default('relates_to'),
  createdByAgentId: uuid('created_by_agent_id').references(() => agents.id),
  createdByUserId: uuid('created_by_user_id').references(() => authUsers.id),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const labels = pgTable('labels', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  name: text('name').notNull(),
  color: text('color').notNull().default('#6b7280'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const issueLabels = pgTable('issue_labels', {
  issueId: uuid('issue_id').notNull().references(() => issues.id),
  labelId: uuid('label_id').notNull().references(() => labels.id)
});

export const heartbeatRuns = pgTable('heartbeat_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  agentId: uuid('agent_id').notNull().references(() => agents.id),
  issueId: uuid('issue_id').references(() => issues.id),
  status: text('status').notNull().default('queued'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  error: text('error'),
  transcript: text('transcript'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const costEvents = pgTable('cost_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  agentId: uuid('agent_id').notNull().references(() => agents.id),
  provider: text('provider').notNull(),
  model: text('model').notNull(),
  inputTokens: integer('input_tokens').notNull().default(0),
  outputTokens: integer('output_tokens').notNull().default(0),
  costCents: real('cost_cents').notNull().default(0),
  runId: uuid('run_id').references(() => heartbeatRuns.id),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const fileContents = pgTable('file_contents', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  path: text('path').notNull(),
  content: text('content'),
  mimeType: text('mime_type').default('text/plain'),
  size: integer('size').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const fileVersions = pgTable('file_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  fileId: uuid('file_id').notNull().references(() => fileContents.id),
  version: integer('version').notNull(),
  content: text('content').notNull(),
  createdByAgentId: uuid('created_by_agent_id').references(() => agents.id),
  createdByUserId: uuid('created_by_user_id').references(() => authUsers.id),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const activitiesLog = pgTable('activities_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id),
  userId: uuid('user_id').references(() => authUsers.id),
  agentId: uuid('agent_id').references(() => agents.id),
  action: text('action').notNull(),
  entityType: text('entity_type'),
  entityId: uuid('entity_id'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const approvals = pgTable('approvals', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  type: text('type').notNull(),
  status: text('status').notNull().default('pending'),
  requestedByAgentId: uuid('requested_by_agent_id').references(() => agents.id),
  requestedByUserId: uuid('requested_by_user_id').references(() => authUsers.id),
  targetAgentId: uuid('target_agent_id').references(() => agents.id),
  decision: text('decision'),
  decidedByUserId: uuid('decided_by_user_id').references(() => authUsers.id),
  decidedAt: timestamp('decided_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const instanceSettings = pgTable('instance_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(),
  value: jsonb('value').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const plugins = pgTable('plugins', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(),
  name: text('name').notNull(),
  version: text('version').notNull(),
  enabled: boolean('enabled').notNull().default(false),
  config: jsonb('config'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const routines = pgTable('routines', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  name: text('name').notNull(),
  cronExpression: text('cron_expression').notNull(),
  issueId: uuid('issue_id').references(() => issues.id),
  agentId: uuid('agent_id').references(() => agents.id),
  enabled: boolean('enabled').notNull().default(true),
  lastRunAt: timestamp('last_run_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});