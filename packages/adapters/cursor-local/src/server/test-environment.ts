import type { AdapterEnvironmentTestContext, AdapterEnvironmentTestResult } from '../../../src/types.js';

export async function testEnvironment(ctx: AdapterEnvironmentTestContext): Promise<AdapterEnvironmentTestResult> {
  const checks: import('../../../src/types.js').AdapterEnvironmentCheck[] = [];  
  
  checks.push({
    code: 'cursor_info',
    level: 'info' as const,
    message: 'Cursor adapter uses the Cursor IDE integration',
  });

  return {
    adapterType: 'cursor-local',
    status: 'pass' as const,
    checks,
    testedAt: new Date().toISOString(),
  };
}
