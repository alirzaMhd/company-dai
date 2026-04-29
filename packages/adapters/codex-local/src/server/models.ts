import type { AdapterModel } from '../../../src/types.js';

const staticModels: AdapterModel[] = [
  { id: "codex", label: "Codex" },
];

export async function listCodexModels(_config?: Record<string, unknown>): Promise<AdapterModel[]> {
  return staticModels;
}
