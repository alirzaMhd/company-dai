import WebSocket from 'ws';
import { AgentAdapter, RunContext, RunResult, AgentConfig } from './types.js';

export class OpenCodeRemoteAdapter implements AgentAdapter {
  type = 'opencode-remote';
  private ws: WebSocket | null = null;

  constructor(public config: AgentConfig) {}

  async execute(context: RunContext): Promise<RunResult> {
    const startTime = Date.now();

    if (!this.config.command) {
      return {
        success: false,
        exitCode: 1,
        output: '',
        error: 'WebSocket URL not configured',
        duration: Date.now() - startTime
      };
    }

    return new Promise((resolve) => {
      try {
        const ws = new WebSocket(this.config.command!, {
          headers: {
            'Authorization': `Bearer ${this.config.env?.['API_KEY'] || ''}`
          }
        });

        let output = '';
        let errorOutput = '';
        let resolved = false;

        const timeout = setTimeout(() => {
          if (!resolved) {
            ws.close();
            resolve({
              success: false,
              exitCode: 1,
              output,
              error: 'Connection timeout',
              duration: Date.now() - startTime
            });
            resolved = true;
          }
        }, this.config.timeout || 120000);

        ws.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString());
            if (message.type === 'output') {
              output += message.content;
            } else if (message.type === 'error') {
              errorOutput += message.content;
            } else if (message.type === 'done') {
              clearTimeout(timeout);
              ws.close();
              if (!resolved) {
                resolve({
                  success: message.exitCode === 0,
                  exitCode: message.exitCode || 0,
                  output,
                  error: errorOutput || undefined,
                  duration: Date.now() - startTime,
                  costCents: message.costCents,
                  model: message.model
                });
                resolved = true;
              }
            }
          } catch {
            output += data.toString();
          }
        });

        ws.on('error', (err) => {
          clearTimeout(timeout);
          if (!resolved) {
            resolve({
              success: false,
              exitCode: 1,
              output,
              error: err.message,
              duration: Date.now() - startTime
            });
            resolved = true;
          }
        });

        ws.on('open', () => {
          ws.send(JSON.stringify({
            type: 'execute',
            context
          }));
        });
      } catch (error) {
        resolve({
          success: false,
          exitCode: 1,
          output: '',
          error: error instanceof Error ? error.message : 'Unknown error',
          duration: Date.now() - startTime
        });
      }
    });
  }

  async detectModel(): Promise<string> {
    return 'remote-opencode';
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