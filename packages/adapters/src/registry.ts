import { OpenCodeLocalAdapter } from './opencode-local.js';
import { OpenCodeRemoteAdapter } from './opencode-remote.js';
import { ClaudeLocalAdapter } from './claude-local.js';
import { GeminiLocalAdapter } from './gemini-local.js';
import type { AgentAdapter, AgentConfig } from './types.js';

function createAdapter(type: string, config?: Record<string, unknown>): AgentAdapter {
  const adapterConfig: AgentConfig = {
    adapterType: type,
    command: config?.command as string | undefined,
    env: config?.env as Record<string, string> | undefined,
  };

  switch (type) {
    case 'opencode-local':
    case 'opencode-local':
      return new OpenCodeLocalAdapter(adapterConfig);
    case 'opencode-remote':
      return new OpenCodeRemoteAdapter(adapterConfig);
    case 'claude-local':
      return new ClaudeLocalAdapter(adapterConfig);
    case 'gemini-local':
      return new GeminiLocalAdapter(adapterConfig);
    default:
      return new OpenCodeLocalAdapter(adapterConfig);
  }
}

export async function listAdapterModels(
  type: string,
  config?: Record<string, unknown>
): Promise<{ id: string; label: string }[]> {
  const adapter = createAdapter(type, config);
  
  if ('listModels' in adapter && typeof adapter.listModels === 'function') {
    return adapter.listModels();
  }
  
  return [];
}

export function getAdapter(type: string): AgentAdapter | undefined {
  return createAdapter(type);
}