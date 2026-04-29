import { z } from 'zod';

export const AgentConfigSchema = z.object({
  adapterType: z.enum([
    'opencode-local',
    'opencode-remote',
    'claude-local',
    'gemini-local',
    'codex-local',
    'cursor-local'
  ]),
  command: z.string().optional(),
  args: z.array(z.string()).optional(),
  env: z.record(z.string()).optional(),
  model: z.string().optional(),
  timeout: z.number().optional(),
  maxRetries: z.number().optional()
});

export interface AgentAdapter {
  type: string;
  config: AgentConfig;
  execute(context: RunContext): Promise<RunResult>;
  detectModel?(): Promise<string>;
  getCapabilities?(): Promise<string[]>;
}

export interface AgentConfig {
  adapterType: string;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  model?: string;
  timeout?: number;
  maxRetries?: number;
}

export interface RunContext {
  issueId: string;
  issueTitle: string;
  issueDescription?: string;
  instructions: string;
  workingDirectory: string;
  companyId: string;
  agentId: string;
  agentNameKey: string;
  heartbeatContext?: HeartbeatContext;
}

export interface HeartbeatContext {
  issue: {
    id: string;
    identifier: string;
    title: string;
    status: string;
    priority: string;
  };
  ancestors: Array<{ id: string; identifier: string; title: string; status: string }>;
  project: { id: string; name: string } | null;
  goal: { id: string; title: string } | null;
  comments: Array<{ id: string; body: string; createdAt: string }>;
}

export interface RunResult {
  success: boolean;
  exitCode: number;
  output: string;
  error?: string;
  duration: number;
  costCents?: number;
  model?: string;
}

export interface AdapterCapability {
  name: string;
  description: string;
}

export const ADAPTERS = {
  'opencode-local': {
    name: 'OpenCode Local',
    description: 'Execute OpenCode CLI locally',
  },
  'opencode-remote': {
    name: 'OpenCode Remote',
    description: 'Execute via remote Colab connection',
  },
  'claude-local': {
    name: 'Claude Local',
    description: 'Execute Claude Code CLI locally',
  },
  'gemini-local': {
    name: 'Gemini Local',
    description: 'Execute Gemini CLI locally',
  },
} as const;

export type AdapterType = keyof typeof ADAPTERS;