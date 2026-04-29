import { exec } from 'child_process';
import { promisify } from 'util';
import type { AdapterEnvironmentTestContext, AdapterEnvironmentTestResult } from '../../../src/types.js';

const execAsync = promisify(exec);

export async function testEnvironment(ctx: AdapterEnvironmentTestContext): Promise<AdapterEnvironmentTestResult> {
  const checks: import('../../../src/types.js').AdapterEnvironmentCheck[] = [];
  
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

  return {
    adapterType: 'opencode-local',
    status: checks.some(c => c.level === 'error') ? 'fail' : 'pass',
    checks,
    testedAt: new Date().toISOString(),
  };
}
