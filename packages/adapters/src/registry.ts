import { OpenCodeLocalAdapter } from './opencode-local.js';
import type { AgentAdapter } from './types.js';

const adapters: Record<string, AgentAdapter> = {
  'opencode-local': new OpenCodeLocalAdapter({ adapterType: 'opencode-local' }),
  'opencode-remote': new OpenCodeLocalAdapter({ adapterType: 'opencode-remote' }),
  'claude-local': new OpenCodeLocalAdapter({ adapterType: 'claude-local' }),
  'gemini-local': new OpenCodeLocalAdapter({ adapterType: 'gemini-local' }),
};

export function getAdapter(type: string): AgentAdapter | undefined {
  return adapters[type];
}

export async function listAdapterModels(
  type: string,
  config?: Record<string, unknown>
): Promise<{ id: string; label: string }[]> {
  const adapter = getAdapter(type);
  if (!adapter) return [];
  
  if ('listModels' in adapter && typeof adapter.listModels === 'function') {
    return adapter.listModels();
  }
  
  return [];
}