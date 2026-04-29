import { exec } from 'child_process';
import { promisify } from 'util';
import type { AdapterEnvironmentTestContext, AdapterEnvironmentTestResult } from '../../../src/types.js';

const execAsync = promisify(exec);

export async function testEnvironment(ctx: AdapterEnvironmentTestContext): Promise<AdapterEnvironmentTestResult> {
  const checks: import('../../../src/types.js').AdapterEnvironmentCheck[] = [];
  
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

  return {
    adapterType: 'gemini-local',
    status: checks.some(c => c.level === 'error') ? 'fail' : 'pass',
    checks,
    testedAt: new Date().toISOString(),
  };
}
