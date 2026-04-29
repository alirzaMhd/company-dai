import { exec } from 'child_process';
import { promisify } from 'util';
import type { AdapterEnvironmentTestContext, AdapterEnvironmentTestResult } from '../../../src/types.js';

const execAsync = promisify(exec);

export async function testEnvironment(ctx: AdapterEnvironmentTestContext): Promise<AdapterEnvironmentTestResult> {
  const checks: import('../../../src/types.js').AdapterEnvironmentCheck[] = [];
  
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

  return {
    adapterType: 'claude-local',
    status: checks.some(c => c.level === 'error') ? 'fail' : 'pass',
    checks,
    testedAt: new Date().toISOString(),
  };
}
