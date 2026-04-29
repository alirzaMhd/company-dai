import { exec } from 'child_process';
import { promisify } from 'util';
import type { AdapterModel } from '../../../src/types.js';

const execAsync = promisify(exec);

const staticModels: AdapterModel[] = [
  { id: "openai/o1", label: "OpenAI O1" },
  { id: "openai/o3", label: "OpenAI O3" },
  { id: "anthropic/claude-sonnet-4", label: "Anthropic Claude Sonnet 4" },
  { id: "anthropic/claude-opus-4", label: "Anthropic Claude Opus 4" },
  { id: "google/gemini-2.5-pro", label: "Google Gemini 2.5 Pro" },
  { id: "google/gemini-2.5-flash", label: "Google Gemini 2.5 Flash" },
  { id: "xai/grok-2", label: "xAI Grok 2" },
  { id: "deepseek/deepseek-chat", label: "DeepSeek Chat" },
];

export async function listOpenCodeModels(_config?: Record<string, unknown>): Promise<AdapterModel[]> {
  try {
    const { stdout } = await execAsync('opencode models', { timeout: 30000 });
    const models: AdapterModel[] = [];
    for (const line of stdout.trim().split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (trimmed.includes('/')) {
        const modelId = trimmed;
        const label = modelId.split('/').pop() || modelId;
        models.push({ id: modelId, label });
      }
    }
    return models.length > 0 ? models : staticModels;
  } catch {
    return staticModels;
  }
}
