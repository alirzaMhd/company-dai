import type { AdapterModel } from '../../../src/types.js';

const staticModels: AdapterModel[] = [
  { id: "gemini-2.5-pro-preview-05-20", label: "Gemini 2.5 Pro Preview (May 20)" },
];

export async function listGeminiModels(_config?: Record<string, unknown>): Promise<AdapterModel[]> {
  return staticModels;
}
