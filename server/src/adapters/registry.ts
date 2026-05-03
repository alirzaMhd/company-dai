import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import type { ServerAdapterModule, AdapterModel, AdapterEnvironmentTestResult, AdapterEnvironmentCheck, AdapterExecutionContext, AdapterSessionCodec } from '@company-dai/adapters';
import { BUILTIN_ADAPTER_TYPES } from './builtin-adapter-types.js';
import { buildExternalAdapters } from './plugin-loader.js';
import { getDisabledAdapterTypes, setAdapterDisabled, getAdapterPluginByType } from '../services/adapter-plugin-store.js';

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

const openCodeRemoteExecute = async function(_ctx: any) {
  return { exitCode: 0, signal: null, timedOut: false, usage: { inputTokens: 0, outputTokens: 0 }, sessionId: null, sessionParams: null, sessionDisplayId: null, model: null, costUsd: 0, resultJson: null, runtimeServices: [], summary: "opencode-remote stub", clearSession: false };
};

const openCodeRemoteTestEnvironment = async function(_ctx: any) {
  return { adapterType: 'opencode-remote', status: 'pass', checks: [{ code: 'stub', level: 'info', message: 'stub' }], testedAt: new Date().toISOString() };
};

const openCodeRemoteSessionCodec: AdapterSessionCodec = { deserialize: () => null, serialize: () => null, getDisplayId: () => null };

const listOpenCodeRemoteModels = async function(_tunnelUrl: string) { return []; };
const listOpenCodeRemoteSkills = async function() { return []; };

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
// Registry with External Adapter Support
// ---------------------------------------------------------------------------

const adaptersByType = new Map<string, ServerAdapterModule>();

// For builtin types that are overridden by an external adapter, we keep the
// original builtin so it can be restored when the override is deactivated.
const builtinFallbacks = new Map<string, ServerAdapterModule>();

// Tracks which override types are currently deactivated (paused).  When
// paused, `getServerAdapter()` returns the builtin fallback instead of the
// external.  Persisted across reloads via the same disabled-adapters store.
const pausedOverrides = new Set<string>();

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

// ---------------------------------------------------------------------------
// Load external adapter plugins
// ---------------------------------------------------------------------------

/** Cached sync wrapper — the store is a simple JSON file read, safe to call frequently. */
function getDisabledAdapterTypesFromStore(): string[] {
  return getDisabledAdapterTypes();
}

/**
 * Load external adapters from the plugin store and hardcoded sources.
 * Called once at module initialization. The promise is exported so that
 * callers (e.g. assertKnownAdapterType, app startup) can await completion
 * and avoid racing against the loading window.
 */
const externalAdaptersReady: Promise<void> = (async () => {
  try {
    const externalAdapters = await buildExternalAdapters();
    for (const externalAdapter of externalAdapters) {
      const overriding = BUILTIN_ADAPTER_TYPES.has(externalAdapter.type);
      if (overriding) {
        console.log(
          `[company-dai] External adapter "${externalAdapter.type}" overrides built-in adapter`,
        );
        // Save the original builtin for later restoration.
        const existing = adaptersByType.get(externalAdapter.type);
        if (existing && !builtinFallbacks.has(externalAdapter.type)) {
          builtinFallbacks.set(externalAdapter.type, existing);
        }
      }
      adaptersByType.set(externalAdapter.type, externalAdapter);
    }
  } catch (err) {
    console.error("[company-dai] Failed to load external adapters:", err);
  }
})();

/**
 * Await this before validating adapter types to avoid race conditions
 * during server startup. External adapters are loaded asynchronously;
 * calling assertKnownAdapterType before this resolves will reject
 * valid external adapter types.
 */
export function waitForExternalAdapters(): Promise<void> {
  return externalAdaptersReady;
}

export function registerServerAdapter(adapter: ServerAdapterModule): void {
  if (BUILTIN_ADAPTER_TYPES.has(adapter.type) && !builtinFallbacks.has(adapter.type)) {
    const existing = adaptersByType.get(adapter.type);
    if (existing) {
      builtinFallbacks.set(adapter.type, existing);
    }
  }
  adaptersByType.set(adapter.type, adapter);
}

export function unregisterServerAdapter(type: string): void {
  if (type === processAdapter.type || type === httpAdapter.type) return;
  if (builtinFallbacks.has(type)) {
    pausedOverrides.delete(type);
    const fallback = builtinFallbacks.get(type);
    if (fallback) {
      adaptersByType.set(type, fallback);
    }
    return;
  }
  if (BUILTIN_ADAPTER_TYPES.has(type)) {
    return;
  }
  adaptersByType.delete(type);
}

export function requireServerAdapter(type: string): ServerAdapterModule {
  const adapter = findActiveServerAdapter(type);
  if (!adapter) {
    throw new Error(`Unknown adapter type: ${type}`);
  }
  return adapter;
}

export function getServerAdapter(type: string): ServerAdapterModule {
  return findActiveServerAdapter(type) ?? processAdapter;
}

export async function listAdapterModels(
  type: string,
  config?: Record<string, unknown>,
): Promise<{ id: string; label: string }[]> {
  const adapter = findActiveServerAdapter(type);
  if (!adapter) return [];
  if (adapter.listModels) {
    const discovered = await adapter.listModels(config);
    if (discovered.length > 0) return discovered;
  }
  return adapter.models ?? [];
}

export function listServerAdapters(): ServerAdapterModule[] {
  return Array.from(adaptersByType.values());
}

/**
 * List adapters excluding those that are disabled in settings.
 * Used for menus and agent creation flows — disabled adapters remain
 * functional for existing agents but hidden from selection.
 */
export function listEnabledServerAdapters(): ServerAdapterModule[] {
  const disabled = getDisabledAdapterTypesFromStore();
  const disabledSet = disabled.length > 0 ? new Set(disabled) : null;
  return disabledSet
    ? Array.from(adaptersByType.values()).filter((a) => !disabledSet.has(a.type))
    : Array.from(adaptersByType.values());
}

export async function detectAdapterModel(
  type: string,
): Promise<{ model: string; provider: string; source: string; candidates?: string[] } | null> {
  const adapter = findActiveServerAdapter(type);
  if (!adapter?.detectModel) return null;
  const detected = await adapter.detectModel();
  if (!detected) return null;
  return {
    model: detected.model,
    provider: detected.provider,
    source: detected.source,
    ...(detected.candidates?.length ? { candidates: detected.candidates } : {}),
  };
}

// ---------------------------------------------------------------------------
// Override pause / resume
// ---------------------------------------------------------------------------

/**
 * Pause or resume an external override for a builtin adapter type.
 *
 * - `paused = true`  → subsequent calls to `getServerAdapter(type)` return
 *   the builtin fallback instead of the external adapter.  Already-running
 *   agent sessions are unaffected (they hold a reference to the module they
 *   started with).
 *
 * - `paused = false` → the external adapter is active again.
 *
 * Returns `true` if the state actually changed, `false` if the type is not
 * an override or was already in the requested state.
 */
export function setOverridePaused(type: string, paused: boolean): boolean {
  if (!builtinFallbacks.has(type)) return false;
  const wasPaused = pausedOverrides.has(type);
  if (paused && !wasPaused) {
    pausedOverrides.add(type);
    console.log(`[company-dai] Override paused for "${type}" — builtin adapter restored`);
    return true;
  }
  if (!paused && wasPaused) {
    pausedOverrides.delete(type);
    console.log(`[company-dai] Override resumed for "${type}" — external adapter active`);
    return true;
  }
  return false;
}

/** Check whether the external override for a builtin type is currently paused. */
export function isOverridePaused(type: string): boolean {
  return pausedOverrides.has(type);
}

/** Get the set of types whose overrides are currently paused. */
export function getPausedOverrides(): Set<string> {
  return pausedOverrides;
}

export function findServerAdapter(type: string): ServerAdapterModule | null {
  return adaptersByType.get(type) ?? null;
}

export function findActiveServerAdapter(type: string): ServerAdapterModule | null {
  if (pausedOverrides.has(type)) {
    const fallback = builtinFallbacks.get(type);
    if (fallback) return fallback;
  }
  return adaptersByType.get(type) ?? null;
}