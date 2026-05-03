import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import type { ServerAdapterModule, AdapterModel, AdapterEnvironmentTestResult, AdapterEnvironmentCheck } from '@company-dai/adapters';

const openCodeRemoteExecute = async function(_ctx: any) {
  return { exitCode: 0, signal: null, timedOut: false, usage: { inputTokens: 0, outputTokens: 0 }, sessionId: null, sessionParams: null, sessionDisplayId: null, model: null, costUsd: 0, resultJson: null, runtimeServices: [], summary: "opencode-remote stub", clearSession: false };
};

const openCodeRemoteTestEnvironment = async function(_ctx: any) {
  return { adapterType: 'opencode-remote', status: 'pass', checks: [{ code: 'stub', level: 'info', message: 'stub' }], testedAt: new Date().toISOString() };
};

const openCodeRemoteSessionCodec = { deserialize: () => null, serialize: () => null, getDisplayId: () => null };

const listOpenCodeRemoteModels = async function(_tunnelUrl: string) { return []; };
const listOpenCodeRemoteSkills = async function() { return []; };

const execAsync = promisify(exec);

// ---------------------------------------------------------------------------
// Helper to create test result
// ---------------------------------------------------------------------------

function createTestResult(
  adapterType: string,
  checks: AdapterEnvironmentCheck[],
): AdapterEnvironmentTestResult {
  return {
    adapterType,
    status: checks.some(c => c.level === 'error') ? 'fail' : 'pass',
    checks,
    testedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// OpenCode Local Adapter
// ---------------------------------------------------------------------------

const opencodeLocalModels: AdapterModel[] = [
  { id: 'openai/o1', label: 'OpenAI O1' },
  { id: 'openai/o3', label: 'OpenAI O3' },
  { id: 'anthropic/claude-4-sonnet', label: 'Anthropic Claude 4 Sonnet' },
  { id: 'anthropic/claude-4-opus', label: 'Anthropic Claude 4 Opus' },
  { id: 'google/gemini-2.5-pro', label: 'Google Gemini 2.5 Pro' },
  { id: 'google/gemini-2.5-flash', label: 'Google Gemini 2.5 Flash' },
  { id: 'xai/grok-2', label: 'xAI Grok 2' },
  { id: 'deepseek/deepseek-chat', label: 'DeepSeek Chat' },
];

async function listOpenCodeModels(_config?: Record<string, unknown>): Promise<AdapterModel[]> {
  // Return static models immediately without calling external CLI
  // This avoids the 30s timeout issue
  return opencodeLocalModels;
}

async function testOpenCodeEnvironment(ctx: { companyId: string; adapterType: string; config: Record<string, unknown> }): Promise<AdapterEnvironmentTestResult> {
  const checks: AdapterEnvironmentCheck[] = [];
  
  try {
    await execAsync('which opencode', { timeout: 5000 });
    checks.push({
      code: 'opencode_found',
      level: 'info',
      message: 'OpenCode CLI found in PATH',
    });
  } catch {
    checks.push({
      code: 'opencode_not_found',
      level: 'error',
      message: 'OpenCode CLI not found in PATH',
      hint: 'Install OpenCode CLI to use this adapter',
    });
  }

  return createTestResult('opencode-local', checks);
}

const opencodeLocalAdapter: ServerAdapterModule = {
  type: 'opencode-local',
  async execute(ctx) {
    return new Promise((resolve) => {
      const args: string[] = [
        '--agent',
        ctx.agent.name,
        '--task',
        JSON.stringify(ctx.context),
        '--config',
        JSON.stringify(ctx.config),
      ];

      const child = spawn('opencode', args, {
        cwd: (ctx.config.cwd as string) || process.cwd(),
        env: { ...process.env, ...(ctx.config.env as Record<string, string>) },
        timeout: (ctx.config.timeout as number) || 120000,
      });

      let output = '';
      let errorOutput = '';

      child.stdout?.on('data', (data: Buffer) => {
        const text = data.toString();
        output += text;
        ctx.onLog('stdout', text);
      });

      child.stderr?.on('data', (data: Buffer) => {
        const text = data.toString();
        errorOutput += text;
        ctx.onLog('stderr', text);
      });

      child.on('close', (exitCode) => {
        resolve({
          exitCode: exitCode || 0,
          signal: null,
          timedOut: false,
          errorMessage: errorOutput || null,
          usage: { inputTokens: 0, outputTokens: 0 },
          sessionId: null,
          sessionParams: null,
          sessionDisplayId: null,
          model: (ctx.config.model as string) || null,
          costUsd: 0,
          resultJson: null,
          runtimeServices: [],
          summary: output || null,
          clearSession: false,
        });
      });

      child.on('error', (err) => {
        resolve({
          exitCode: 1,
          signal: null,
          timedOut: false,
          errorMessage: err.message,
          usage: { inputTokens: 0, outputTokens: 0 },
          sessionId: null,
          sessionParams: null,
          sessionDisplayId: null,
          model: null,
          costUsd: 0,
          resultJson: null,
          runtimeServices: [],
          summary: null,
          clearSession: false,
        });
      });
    });
  },
  testEnvironment: testOpenCodeEnvironment,
  models: opencodeLocalModels,
  listModels: listOpenCodeModels,
  supportsLocalAgentJwt: true,
  supportsInstructionsBundle: true,
  instructionsPathKey: 'instructionsFilePath',
  requiresMaterializedRuntimeSkills: true,
};

// ---------------------------------------------------------------------------
// Claude Local Adapter
// ---------------------------------------------------------------------------

const claudeLocalModels: AdapterModel[] = [
  { id: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4 (May 14, 2025)' },
  { id: 'claude-opus-4-20250514', label: 'Claude Opus 4 (May 14, 2025)' },
  { id: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (Oct 22, 2024)' },
];

async function testClaudeEnvironment(_ctx: { companyId: string; adapterType: string; config: Record<string, unknown> }): Promise<AdapterEnvironmentTestResult> {
  const checks: AdapterEnvironmentCheck[] = [];
  
  try {
    await execAsync('which claude', { timeout: 5000 });
    checks.push({
      code: 'claude_found',
      level: 'info',
      message: 'Claude Code CLI found in PATH',
    });
  } catch {
    checks.push({
      code: 'claude_not_found',
      level: 'error',
      message: 'Claude Code CLI not found in PATH',
      hint: 'Install Claude Code CLI to use this adapter',
    });
  }

  return createTestResult('claude-local', checks);
}

const claudeLocalAdapter: ServerAdapterModule = {
  type: 'claude-local',
  async execute(ctx) {
    return new Promise((resolve) => {
      const args: string[] = [
        '--print',
        String(ctx.context?.task || ''),
        '--model',
        String((ctx.config.model as string) || 'claude-sonnet-4-20250514'),
      ];

      const child = spawn('claude', args, {
        cwd: (ctx.config.cwd as string) || process.cwd(),
        env: { ...process.env, ...(ctx.config.env as Record<string, string>) },
        timeout: (ctx.config.timeout as number) || 120000,
      });

      let output = '';
      let errorOutput = '';

      child.stdout?.on('data', (data: Buffer) => {
        const text = data.toString();
        output += text;
        ctx.onLog('stdout', text);
      });

      child.stderr?.on('data', (data: Buffer) => {
        const text = data.toString();
        errorOutput += text;
        ctx.onLog('stderr', text);
      });

      child.on('close', (exitCode) => {
        resolve({
          exitCode: exitCode || 0,
          signal: null,
          timedOut: false,
          errorMessage: errorOutput || null,
          usage: { inputTokens: 0, outputTokens: 0 },
          sessionId: null,
          sessionParams: null,
          sessionDisplayId: null,
          model: (ctx.config.model as string) || null,
          costUsd: 0,
          resultJson: null,
          runtimeServices: [],
          summary: output || null,
          clearSession: false,
        });
      });

      child.on('error', (err) => {
        resolve({
          exitCode: 1,
          signal: null,
          timedOut: false,
          errorMessage: err.message,
          usage: { inputTokens: 0, outputTokens: 0 },
          sessionId: null,
          sessionParams: null,
          sessionDisplayId: null,
          model: null,
          costUsd: 0,
          resultJson: null,
          runtimeServices: [],
          summary: null,
          clearSession: false,
        });
      });
    });
  },
  testEnvironment: testClaudeEnvironment,
  models: claudeLocalModels,
  listModels: async () => claudeLocalModels,
  supportsLocalAgentJwt: true,
  supportsInstructionsBundle: true,
  instructionsPathKey: 'instructionsFilePath',
  requiresMaterializedRuntimeSkills: false,
};

// ---------------------------------------------------------------------------
// Gemini Local Adapter
// ---------------------------------------------------------------------------

const geminiLocalModels: AdapterModel[] = [
  { id: 'gemini-2.5-pro-preview-05-20', label: 'Gemini 2.5 Pro Preview (May 20)' },
];

async function testGeminiEnvironment(_ctx: { companyId: string; adapterType: string; config: Record<string, unknown> }): Promise<AdapterEnvironmentTestResult> {
  const checks: AdapterEnvironmentCheck[] = [];
  
  try {
    await execAsync('which gemini', { timeout: 5000 });
    checks.push({
      code: 'gemini_found',
      level: 'info',
      message: 'Gemini CLI found in PATH',
    });
  } catch {
    checks.push({
      code: 'gemini_not_found',
      level: 'error',
      message: 'Gemini CLI not found in PATH',
      hint: 'Install Gemini CLI to use this adapter',
    });
  }

  return createTestResult('gemini-local', checks);
}

const geminiLocalAdapter: ServerAdapterModule = {
  type: 'gemini-local',
  async execute(ctx) {
    return new Promise((resolve) => {
      const args: string[] = [
        '--prompt',
        String(ctx.context?.task || ''),
        '--model',
        String((ctx.config.model as string) || 'gemini-2.5-pro-preview-05-20'),
      ];

      const child = spawn('gemini', args, {
        cwd: (ctx.config.cwd as string) || process.cwd(),
        env: { ...process.env, ...(ctx.config.env as Record<string, string>) },
        timeout: (ctx.config.timeout as number) || 120000,
      });

      let output = '';
      let errorOutput = '';

      child.stdout?.on('data', (data: Buffer) => {
        const text = data.toString();
        output += text;
        ctx.onLog('stdout', text);
      });

      child.stderr?.on('data', (data: Buffer) => {
        const text = data.toString();
        errorOutput += text;
        ctx.onLog('stderr', text);
      });

      child.on('close', (exitCode) => {
        resolve({
          exitCode: exitCode || 0,
          signal: null,
          timedOut: false,
          errorMessage: errorOutput || null,
          usage: { inputTokens: 0, outputTokens: 0 },
          sessionId: null,
          sessionParams: null,
          sessionDisplayId: null,
          model: (ctx.config.model as string) || null,
          costUsd: 0,
          resultJson: null,
          runtimeServices: [],
          summary: output || null,
          clearSession: false,
        });
      });

      child.on('error', (err) => {
        resolve({
          exitCode: 1,
          signal: null,
          timedOut: false,
          errorMessage: err.message,
          usage: { inputTokens: 0, outputTokens: 0 },
          sessionId: null,
          sessionParams: null,
          sessionDisplayId: null,
          model: null,
          costUsd: 0,
          resultJson: null,
          runtimeServices: [],
          summary: null,
          clearSession: false,
        });
      });
    });
  },
  testEnvironment: testGeminiEnvironment,
  models: geminiLocalModels,
  supportsLocalAgentJwt: false,
  supportsInstructionsBundle: false,
  requiresMaterializedRuntimeSkills: false,
};

// ---------------------------------------------------------------------------
// Codex Local Adapter
// ---------------------------------------------------------------------------

const codexLocalModels: AdapterModel[] = [
  { id: 'codex', label: 'Codex' },
];

async function testCodexEnvironment(_ctx: { companyId: string; adapterType: string; config: Record<string, unknown> }): Promise<AdapterEnvironmentTestResult> {
  const checks: AdapterEnvironmentCheck[] = [];
  
  try {
    await execAsync('which codex', { timeout: 5000 });
    checks.push({
      code: 'codex_found',
      level: 'info',
      message: 'Codex CLI found in PATH',
    });
  } catch {
    checks.push({
      code: 'codex_not_found',
      level: 'error',
      message: 'Codex CLI not found in PATH',
      hint: 'Install Codex CLI to use this adapter',
    });
  }

  return createTestResult('codex-local', checks);
}

const codexLocalAdapter: ServerAdapterModule = {
  type: 'codex-local',
  async execute(ctx) {
    return new Promise((resolve) => {
      const args: string[] = [
        '--task',
        String(ctx.context?.task || ''),
        '--model',
        String((ctx.config.model as string) || 'codex'),
      ];

      const child = spawn('codex', args, {
        cwd: (ctx.config.cwd as string) || process.cwd(),
        env: { ...process.env, ...(ctx.config.env as Record<string, string>) },
        timeout: (ctx.config.timeout as number) || 120000,
      });

      let output = '';
      let errorOutput = '';

      child.stdout?.on('data', (data: Buffer) => {
        const text = data.toString();
        output += text;
        ctx.onLog('stdout', text);
      });

      child.stderr?.on('data', (data: Buffer) => {
        const text = data.toString();
        errorOutput += text;
        ctx.onLog('stderr', text);
      });

      child.on('close', (exitCode) => {
        resolve({
          exitCode: exitCode || 0,
          signal: null,
          timedOut: false,
          errorMessage: errorOutput || null,
          usage: { inputTokens: 0, outputTokens: 0 },
          sessionId: null,
          sessionParams: null,
          sessionDisplayId: null,
          model: (ctx.config.model as string) || null,
          costUsd: 0,
          resultJson: null,
          runtimeServices: [],
          summary: output || null,
          clearSession: false,
        });
      });

      child.on('error', (err) => {
        resolve({
          exitCode: 1,
          signal: null,
          timedOut: false,
          errorMessage: err.message,
          usage: { inputTokens: 0, outputTokens: 0 },
          sessionId: null,
          sessionParams: null,
          sessionDisplayId: null,
          model: null,
          costUsd: 0,
          resultJson: null,
          runtimeServices: [],
          summary: null,
          clearSession: false,
        });
      });
    });
  },
  testEnvironment: testCodexEnvironment,
  models: codexLocalModels,
  listModels: async () => codexLocalModels,
  supportsLocalAgentJwt: false,
  supportsInstructionsBundle: true,
  requiresMaterializedRuntimeSkills: false,
};

// ---------------------------------------------------------------------------
// Cursor Local Adapter
// ---------------------------------------------------------------------------

const cursorLocalModels: AdapterModel[] = [
  { id: 'cursor-pro', label: 'Cursor Pro' },
];

async function testCursorEnvironment(_ctx: { companyId: string; adapterType: string; config: Record<string, unknown> }): Promise<AdapterEnvironmentTestResult> {
  const checks: AdapterEnvironmentCheck[] = [];  
  checks.push({
    code: 'cursor_info',
    level: 'info',
    message: 'Cursor adapter uses the Cursor IDE integration',
  });

  return createTestResult('cursor-local', checks);
}

const cursorLocalAdapter: ServerAdapterModule = {
  type: 'cursor-local',
  async execute(ctx) {
    return {
      exitCode: 0,
      signal: null,
      timedOut: false,
      usage: { inputTokens: 0, outputTokens: 0 },
      sessionId: null,
      sessionParams: null,
      sessionDisplayId: null,
      model: (ctx.config.model as string) || null,
      costUsd: 0,
      resultJson: null,
      runtimeServices: [],
      summary: 'Cursor adapter execution (mock)',
      clearSession: false,
    };
  },
  testEnvironment: testCursorEnvironment,
  models: cursorLocalModels,
  listModels: async () => cursorLocalModels,
  supportsLocalAgentJwt: false,
  supportsInstructionsBundle: false,
  requiresMaterializedRuntimeSkills: true,
};

// ---------------------------------------------------------------------------
// Process Adapter (built-in)
// ---------------------------------------------------------------------------

const processAdapter: ServerAdapterModule = {
  type: 'process',
  async execute(ctx) {
    const command = (ctx.config.command as string) || 'echo';
    const args = (ctx.config.args as string[]) || [];
    
    return new Promise((resolve) => {
      const child = spawn(command, args, {
        cwd: (ctx.config.cwd as string) || process.cwd(),
        env: { ...process.env, ...(ctx.config.env as Record<string, string>) },
        timeout: (ctx.config.timeout as number) || 120000,
      });

      let output = '';
      let errorOutput = '';

      child.stdout?.on('data', (data: Buffer) => {
        const text = data.toString();
        output += text;
        ctx.onLog('stdout', text);
      });

      child.stderr?.on('data', (data: Buffer) => {
        const text = data.toString();
        errorOutput += text;
        ctx.onLog('stderr', text);
      });

      child.on('close', (exitCode) => {
        resolve({
          exitCode: exitCode || 0,
          signal: null,
          timedOut: false,
          errorMessage: errorOutput || null,
          usage: { inputTokens: 0, outputTokens: 0 },
          sessionId: null,
          sessionParams: null,
          sessionDisplayId: null,
          model: null,
          costUsd: 0,
          resultJson: null,
          runtimeServices: [],
          summary: output || null,
          clearSession: false,
        });
      });

      child.on('error', (err) => {
        resolve({
          exitCode: 1,
          signal: null,
          timedOut: false,
          errorMessage: err.message,
          usage: { inputTokens: 0, outputTokens: 0 },
          sessionId: null,
          sessionParams: null,
          sessionDisplayId: null,
          model: null,
          costUsd: 0,
          resultJson: null,
          runtimeServices: [],
          summary: null,
          clearSession: false,
        });
      });
    });
  },
  testEnvironment: async () => ({
    adapterType: 'process',
    status: 'pass',
    checks: [{ code: 'process_ok', level: 'info', message: 'Process adapter is always available' }],
    testedAt: new Date().toISOString(),
  }),
  models: [],
  supportsLocalAgentJwt: false,
  supportsInstructionsBundle: false,
  requiresMaterializedRuntimeSkills: false,
};

// ---------------------------------------------------------------------------
// HTTP Adapter (built-in)
// ---------------------------------------------------------------------------

const httpAdapter: ServerAdapterModule = {
  type: 'http',
  async execute(ctx) {
    try {
      const url = ctx.config.url as string;
      const method = (ctx.config.method as string) || 'POST';
      const body = ctx.config.body as string || JSON.stringify(ctx.context);
      
      const { stdout, stderr } = await execAsync(`curl -X ${method} -H "Content-Type: application/json" -d '${body}' ${url}`, {
        timeout: (ctx.config.timeout as number) || 120000,
      });
      
      return {
        exitCode: 0,
        signal: null,
        timedOut: false,
        usage: { inputTokens: 0, outputTokens: 0 },
        sessionId: null,
        sessionParams: null,
        sessionDisplayId: null,
        model: null,
        costUsd: 0,
        resultJson: null,
        runtimeServices: [],
        summary: stdout || null,
        clearSession: false,
      };
    } catch (err: unknown) {
      return {
        exitCode: 1,
        signal: null,
        timedOut: false,
        errorMessage: err instanceof Error ? err.message : String(err),
        usage: { inputTokens: 0, outputTokens: 0 },
        sessionId: null,
        sessionParams: null,
        sessionDisplayId: null,
        model: null,
        costUsd: 0,
        resultJson: null,
        runtimeServices: [],
        summary: null,
        clearSession: false,
      };
    }
  },
  testEnvironment: async () => ({
    adapterType: 'http',
    status: 'pass',
    checks: [{ code: 'http_ok', level: 'info', message: 'HTTP adapter is always available' }],
    testedAt: new Date().toISOString(),
  }),
  models: [],
  supportsLocalAgentJwt: false,
  supportsInstructionsBundle: false,
  requiresMaterializedRuntimeSkills: false,
};

// ---------------------------------------------------------------------------
// OpenCode Remote Adapter
// ---------------------------------------------------------------------------

const openCodeRemoteAdapter: ServerAdapterModule = {
  type: 'opencode-remote',
  execute: openCodeRemoteExecute,
  testEnvironment: openCodeRemoteTestEnvironment,
  sessionCodec: openCodeRemoteSessionCodec,
  models: [],
  listModels: async (config) => {
    if (!config?.tunnelUrl) return [];
    return listOpenCodeRemoteModels(config.tunnelUrl);
  },
  skills: listOpenCodeRemoteSkills,
  supportsLocalAgentJwt: false,
  supportsInstructionsBundle: false,
  requiresMaterializedRuntimeSkills: true,
};

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

const adaptersByType = new Map<string, ServerAdapterModule>();

function registerBuiltInAdapters() {
  for (const adapter of [
    opencodeLocalAdapter,
    claudeLocalAdapter,
    geminiLocalAdapter,
    codexLocalAdapter,
    cursorLocalAdapter,
    processAdapter,
    httpAdapter,
    openCodeRemoteAdapter,
  ]) {
    adaptersByType.set(adapter.type, adapter);
  }
}

registerBuiltInAdapters();

// Simple in-memory cache for adapter models
const modelCache = new Map<string, { models: { id: string; label: string }[]; expiresAt: number }>();
const MODEL_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function getServerAdapter(type: string): ServerAdapterModule | undefined {
  return adaptersByType.get(type);
}

export function requireServerAdapter(type: string): ServerAdapterModule {
  const adapter = adaptersByType.get(type);
  if (!adapter) {
    throw new Error(`Unknown adapter type: ${type}`);
  }
  return adapter;
}

export async function listAdapterModels(
  type: string,
  config?: Record<string, unknown>,
): Promise<{ id: string; label: string }[]> {
  const cacheKey = type;
  const cached = modelCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.models;
  }

  const adapter = adaptersByType.get(type);
  if (!adapter) return [];

  // Try dynamic model listing first (runs CLI to discover real models)
  if (adapter.listModels) {
    try {
      const discovered = await Promise.resolve(adapter.listModels(config));
      if (discovered.length > 0) {
        modelCache.set(cacheKey, {
          models: discovered,
          expiresAt: Date.now() + MODEL_CACHE_TTL_MS,
        });
        return discovered;
      }
    } catch {
      // Fall through to static models
    }
  }

  // Fall back to static models if dynamic listing failed or isn't available
  const staticModels = adapter.models ?? [];
  if (staticModels.length > 0) {
    modelCache.set(cacheKey, {
      models: staticModels,
      expiresAt: Date.now() + MODEL_CACHE_TTL_MS,
    });
    return staticModels;
  }

  return [];
}

export function listServerAdapters(): ServerAdapterModule[] {
  return Array.from(adaptersByType.values());
}

export function registerServerAdapter(adapter: ServerAdapterModule): void {
  adaptersByType.set(adapter.type, adapter);
}

export function unregisterServerAdapter(type: string): void {
  if (type === processAdapter.type || type === httpAdapter.type) return;
  adaptersByType.delete(type);
}

export function findServerAdapter(type: string): ServerAdapterModule | null {
  return adaptersByType.get(type) ?? null;
}
