import { exec } from 'child_process';
import { promisify } from 'util';
import type { AdapterModel } from '../../../src/types.js';

const execAsync = promisify(exec);

const staticModels: AdapterModel[] = [
  { id: "claude-sonnet-4-20250514", label: "Claude Sonnet 4 (May 14, 2025)" },
  { id: "claude-opus-4-20250514", label: "Claude Opus 4 (May 14, 2025)" },
  { id: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet (Oct 22, 2024)" },
];

export async function listClaudeModels(_config?: Record<string, unknown>): Promise<AdapterModel[]> {
  return staticModels;
}
