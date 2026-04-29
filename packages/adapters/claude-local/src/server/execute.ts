import { spawn } from 'child_process';
import type { AdapterExecutionContext, AdapterExecutionResult } from '../../../src/types.js';

export async function execute(ctx: AdapterExecutionContext): Promise<AdapterExecutionResult> {
  return new Promise((resolve) => {
    const args = [
      '--print',
      ctx.context?.task || '',
      '--model',
      (ctx.config.model as string) || 'claude-sonnet-4-20250514',
    ];

    const child = spawn('claude', args, {
      cwd: (ctx.config.cwd as string) || process.cwd(),
      env: { ...process.env, ...(ctx.config.env as Record<string, string>) },
      timeout: (ctx.config.timeout as number) || 120000,
    });

    let output = '';
    let errorOutput = '';

    child.stdout?.on('data', (data: Buffer) => {
      output += data.toString();
      ctx.onLog('stdout', data.toString());
    });

    child.stderr?.on('data', (data: Buffer) => {
      errorOutput += data.toString();
      ctx.onLog('stderr', data.toString());
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
}
