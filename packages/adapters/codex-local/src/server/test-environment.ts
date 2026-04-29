import { exec } from 'child_process';
import { promisify } from 'util';
import type { AdapterEnvironmentTestContext, AdapterEnvironmentTestResult } from '../../../src/types.js';

const execAsync = promisify(exec);

export async function testEnvironment(ctx: AdapterEnvironmentTestContext): Promise<AdapterEnvironmentTestResult> {
  const checks: import('../../../src/types.js').AdapterEnvironmentCheck[] = [];  
  
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

  return {
    adapterType: 'codex-local',
    status: checks.some(c => c.level === 'error') ? 'fail' : 'pass',
    checks,
    testedAt: new Date().toISOString(),
  };
}
