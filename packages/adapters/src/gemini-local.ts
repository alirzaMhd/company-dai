import { spawn, ChildProcess } from 'child_process';
import { AgentAdapter, RunContext, RunResult, AgentConfig } from './types.js';

export class GeminiLocalAdapter implements AgentAdapter {
  type = 'gemini-local';
  private process: ChildProcess | null = null;

  constructor(public config: AgentConfig) {}

  async listModels(): Promise<{ id: string; label: string }[]> {
    return [
      { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
      { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
      { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
      { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
      { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
      { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
    ];
  }

  async execute(context: RunContext): Promise<RunResult> {
    const startTime = Date.now();
    
    try {
      const args = ['--verbose'];

      if (this.config.model && this.config.model !== 'auto') {
        args.push('--model', this.config.model);
      }

      if (this.config.args) {
        args.push(...this.config.args);
      }

      const prompt = this.buildPrompt(context);
      args.push(prompt);

      const child = spawn(this.config.command || 'gemini', args, {
        cwd: context.workingDirectory,
        env: { ...process.env, ...this.config.env },
        timeout: this.config.timeout || 300000
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

  private buildPrompt(context: RunContext): string {
    let prompt = '';
    
    if (context.heartbeatContext) {
      const { issue, ancestors, project, goal } = context.heartbeatContext;
      
      if (ancestors.length > 0) {
        prompt += `## Goal Hierarchy\n\n`;
        for (const ancestor of ancestors) {
          prompt += `- ${ancestor.identifier}: ${ancestor.title} (${ancestor.status})\n`;
        }
        prompt += '\n';
      }

      if (goal) {
        prompt += `## Current Goal\n\n${goal.title}\n\n`;
      }

      if (project) {
        prompt += `## Project\n\n${project.name}\n\n`;
      }

      prompt += `## Current Task\n\n`;
      prompt += `**${issue.identifier}: ${issue.title}**\n`;
      prompt += `Priority: ${issue.priority}\n`;
      prompt += `Status: ${issue.status}\n\n`;
    }

    if (context.issueDescription) {
      prompt += `## Description\n\n${context.issueDescription}\n\n`;
    }

    prompt += `## Instructions\n\n${context.instructions}\n\n`;

    return prompt;
  }

  async detectModel(): Promise<string> {
    try {
      const child = spawn(this.config.command || 'gemini', ['--version'], {
        timeout: 10000
      });

      return new Promise((resolve) => {
        let output = '';
        child.stdout?.on('data', (data) => {
          output += data.toString();
        });
        child.on('close', () => {
          const match = output.match(/gemini-[\w.-]+/i);
          resolve(match ? match[0] : 'gemini-2.5-flash');
        });
        child.on('error', () => {
          resolve('gemini-2.5-flash');
        });
      });
    } catch {
      return 'gemini-2.5-flash';
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