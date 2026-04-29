import { z } from 'zod';

export const CompanySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  status: z.enum(['active', 'paused', 'terminated']).default('active'),
  budget: z.number().default(0),
  branding: z.record(z.unknown()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const AgentSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  name: z.string(),
  nameKey: z.string(),
  status: z.enum(['running', 'active', 'paused', 'idle', 'error', 'terminated']).default('active'),
  icon: z.string().optional(),
  role: z.string().optional(),
  adapterType: z.string().default('opencode-local'),
  adapterConfig: z.record(z.unknown()).optional(),
  reportsTo: z.string().uuid().optional(),
  monthlyBudget: z.number().default(0),
  currentCost: z.number().default(0),
  heartbeatSchedule: z.string().optional(),
  lastHeartbeatAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const IssueSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  issueNumber: z.number(),
  identifier: z.string(),
  projectId: z.string().uuid().optional(),
  goalId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(['backlog', 'todo', 'in_progress', 'in_review', 'blocked', 'done', 'cancelled']).default('backlog'),
  priority: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
  assigneeAgentId: z.string().uuid().optional(),
  assigneeUserId: z.string().uuid().optional(),
  checkoutRunId: z.string().uuid().optional(),
  executionRunId: z.string().uuid().optional(),
  executionAgentNameKey: z.string().optional(),
  executionLockedAt: z.string().datetime().optional(),
  executionPolicy: z.record(z.unknown()).optional(),
  executionState: z.record(z.unknown()).optional(),
  originKind: z.string().default('manual'),
  originId: z.string().optional(),
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  cancelledAt: z.string().datetime().optional(),
  createdByAgentId: z.string().uuid().optional(),
  createdByUserId: z.string().uuid().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const IssueCommentSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  issueId: z.string().uuid(),
  authorAgentId: z.string().uuid().optional(),
  authorUserId: z.string().uuid().optional(),
  body: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const HeartbeatRunSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  agentId: z.string().uuid(),
  issueId: z.string().uuid().optional(),
  status: z.enum(['queued', 'running', 'completed', 'failed', 'cancelled']).default('queued'),
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  error: z.string().optional(),
  transcript: z.string().optional(),
  createdAt: z.string().datetime()
});

export const CostEventSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  agentId: z.string().uuid(),
  provider: z.string(),
  model: z.string(),
  inputTokens: z.number().default(0),
  outputTokens: z.number().default(0),
  costCents: z.number().default(0),
  runId: z.string().uuid().optional(),
  createdAt: z.string().datetime()
});

export const ApprovalSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  type: z.string(),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  requestedByAgentId: z.string().uuid().optional(),
  requestedByUserId: z.string().uuid().optional(),
  targetAgentId: z.string().uuid().optional(),
  decision: z.string().optional(),
  decidedByUserId: z.string().uuid().optional(),
  decidedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const OrgNodeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  role: z.string().optional(),
  status: z.enum(['running', 'active', 'paused', 'idle', 'error', 'terminated']),
  reports: z.array(z.lazySchema(() => OrgNodeSchema)).default([])
});

export type Company = z.infer<typeof CompanySchema>;
export type Agent = z.infer<typeof AgentSchema>;
export type Issue = z.infer<typeof IssueSchema>;
export type IssueComment = z.infer<typeof IssueCommentSchema>;
export type HeartbeatRun = z.infer<typeof HeartbeatRunSchema>;
export type CostEvent = z.infer<typeof CostEventSchema>;
export type Approval = z.infer<typeof ApprovalSchema>;
export type OrgNode = z.infer<typeof OrgNodeSchema>;