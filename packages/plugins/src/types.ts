import { z } from 'zod';

export interface Plugin {
  key: string;
  name: string;
  version: string;
  description?: string;
  capabilities: string[];
  setup(ctx: PluginContext): Promise<void>;
  onHealth?: () => Promise<void>;
  onConfigChanged?: (config: unknown) => void;
  onShutdown?: () => Promise<void>;
  onValidateConfig?: (config: unknown) => ValidationResult;
}

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

export interface PluginContext {
  events: PluginEvents;
  jobs: PluginJobs;
  data: PluginData;
  actions: PluginActions;
  tools: PluginTools;
  streams: PluginStreams;
  http: PluginHttp;
  secrets: PluginSecrets;
  state: PluginState;
  entities: PluginEntities;
  agents: PluginAgents;
}

export interface PluginEvents {
  subscribe(event: string, handler: EventHandler): Promise<Unsubscribe>;
  emit(event: string, data: unknown): Promise<void>;
}

export type EventHandler = (data: unknown) => Promise<void>;
export type Unsubscribe = () => Promise<void>;

export interface PluginJobs {
  register(name: string, handler: JobHandler, schedule?: JobSchedule): Promise<void>;
  unregister(name: string): Promise<void>;
  list(): Promise<RegisteredJob[]>;
}

export type JobHandler = (context: JobContext) => Promise<JobResult>;
export interface JobContext {
  companyId: string;
  userId?: string;
  params: Record<string, unknown>;
}
export interface JobResult {
  success: boolean;
  output?: unknown;
  error?: string;
}
export interface JobSchedule {
  cron?: string;
  interval?: number;
  timezone?: string;
}
export interface RegisteredJob {
  name: string;
  schedule?: JobSchedule;
  lastRun?: Date;
  nextRun?: Date;
}

export interface PluginData {
  registerProvider(key: string, provider: DataProvider): Promise<void>;
  unregisterProvider(key: string): Promise<void>;
  query(provider: string, query: unknown): Promise<unknown>;
}

export interface DataProvider {
  name: string;
  schema?: z.ZodType;
  list(params?: ListParams): Promise<ListResult>;
  get(id: string): Promise<unknown>;
  create(data: unknown): Promise<unknown>;
  update(id: string, data: unknown): Promise<unknown>;
  delete(id: string): Promise<void>;
}

export interface ListParams {
  companyId?: string;
  limit?: number;
  offset?: number;
  sort?: string;
  filter?: Record<string, unknown>;
}
export interface ListResult {
  items: unknown[];
  total: number;
  hasMore: boolean;
}

export interface PluginActions {
  register(action: PluginAction): Promise<void>;
  unregister(actionKey: string): Promise<void>;
  list(): Promise<PluginAction[]>;
  execute(actionKey: string, params: ActionParams): Promise<ActionResult>;
}

export interface PluginAction {
  key: string;
  label: string;
  description?: string;
  icon?: string;
  inputs?: ActionInput[];
}
export interface ActionInput {
  name: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'file';
  required?: boolean;
  options?: { label: string; value: string }[];
}
export interface ActionParams {
  companyId: string;
  userId?: string;
  values: Record<string, unknown>;
}
export interface ActionResult {
  success: boolean;
  output?: unknown;
  error?: string;
}

export interface PluginTools {
  register(tool: ToolDefinition): Promise<void>;
  unregister(toolKey: string): Promise<void>;
  list(): Promise<ToolDefinition[]>;
}

export interface ToolDefinition {
  name: string;
  description?: string;
  inputSchema: Record<string, unknown>;
  handler: ToolHandler;
}
export type ToolHandler = (input: unknown, context: ToolContext) => Promise<ToolResult>;
export interface ToolContext {
  companyId: string;
  userId?: string;
}
export interface ToolResult {
  success: boolean;
  output?: unknown;
  error?: string;
}

export interface PluginStreams {
  publish(channel: string, event: StreamEvent): Promise<void>;
  subscribe(channel: string, handler: StreamHandler): Promise<Unsubscribe>;
}

export type StreamEvent = {
  type: string;
  data: unknown;
};
export type StreamHandler = (event: StreamEvent) => Promise<void>;

export interface PluginHttp {
  get(url: string, options?: HttpOptions): Promise<HttpResponse>;
  post(url: string, options?: HttpOptions): Promise<HttpResponse>;
  put(url: string, options?: HttpOptions): Promise<HttpResponse>;
  delete(url: string, options?: HttpOptions): Promise<HttpResponse>;
}

export interface HttpOptions {
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

export interface HttpResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: unknown;
}

export interface PluginSecrets {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  list(): Promise<string[]>;
}

export interface PluginState {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

export interface PluginEntities {
  companies: EntityOperations;
  agents: EntityOperations;
  issues: EntityOperations;
  projects: EntityOperations;
  goals: EntityOperations;
  documents: EntityOperations;
  assets: EntityOperations;
}

export interface EntityOperations {
  list(params?: ListParams): Promise<ListResult>;
  get(id: string): Promise<unknown>;
  create(data: unknown): Promise<unknown>;
  update(id: string, data: unknown): Promise<unknown>;
  delete(id: string): Promise<void>;
}

export interface PluginAgents {
  invoke(agentId: string, instructions: string, context?: Record<string, unknown>): Promise<AgentInvocationResult>;
  createSession(agentId: string): Promise<AgentSession>;
  getSession(sessionId: string): Promise<AgentSession | null>;
}

export interface AgentInvocationResult {
  success: boolean;
  runId?: string;
  output?: string;
  error?: string;
}

export interface AgentSession {
  id: string;
  agentId: string;
  createdAt: Date;
  lastActivityAt: Date;
}

export interface PluginCapabilities {
  'api:read'?: boolean;
  'api:write'?: boolean;
  'ui:pages'?: boolean;
  'ui:slots'?: boolean;
  'ui:actions'?: boolean;
  'jobs:scheduled'?: boolean;
  'jobs:webhook'?: boolean;
  'secrets:read'?: boolean;
  'secrets:write'?: boolean;
  'http:outbound'?: boolean;
  'agents:invoke'?: boolean;
  'agents:manage'?: boolean;
}

export const PluginConfigSchema = z.object({
  key: z.string(),
  name: z.string(),
  version: z.string(),
  description: z.string().optional(),
  capabilities: z.array(z.string()),
  config: z.record(z.unknown()).optional()
});

export type PluginConfig = z.infer<typeof PluginConfigSchema>;