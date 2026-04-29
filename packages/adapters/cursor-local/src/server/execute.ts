import type { AdapterExecutionContext, AdapterExecutionResult } from '../../../src/types.js';

export async function execute(ctx: AdapterExecutionContext): Promise<AdapterExecutionResult> {
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
}
