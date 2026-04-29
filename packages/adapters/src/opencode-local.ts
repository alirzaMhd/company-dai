import { spawn, ChildProcess } from 'child_process';
import { AgentAdapter, RunContext, RunResult, AgentConfig } from './types.js';

export class OpenCodeLocalAdapter implements AgentAdapter {
  type = 'opencode-local';
  private process: ChildProcess | null = null;

  constructor(public config: AgentConfig) {}

  async execute(context: RunContext): Promise<RunResult> {
    const startTime = Date.now();
    
    try {
      const args = [
        '--agent',
        context.agentNameKey,
        '--task',
        context.instructions,
        '--context',
        JSON.stringify(context)
      ];

      const child = spawn(this.config.command || 'opencode', args, {
        cwd: context.workingDirectory,
        env: { ...process.env, ...this.config.env },
        timeout: this.config.timeout || 120000
      });

      let output = '';
      let errorOutput = '';

      child.stdout?.on('data', (data) => {
        output += data.toString();
      });

      child.stderr?.on('data', (data) => {
        errorOutput += data.toString();
      });

      return new Promise((resolve) => {
        child.on('close', (exitCode) => {
          resolve({
            success: exitCode === 0,
            exitCode: exitCode || 0,
            output,
            error: errorOutput || undefined,
            duration: Date.now() - startTime
          });
        });

        child.on('error', (err) => {
          resolve({
            success: false,
            exitCode: 1,
            output,
            error: err.message,
            duration: Date.now() - startTime
          });
        });
      });
    } catch (error) {
      return {
        success: false,
        exitCode: 1,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      };
    }
  }

  async detectModel(): Promise<string> {
    try {
      return 'opencode';
    } catch {
      return 'unknown';
    }
  }

  async getCapabilities(): Promise<string[]> {
    return [
      'code-execution',
      'file-operations',
      'git-operations',
      'terminal-commands',
      'web-browsing'
    ];
  }
}