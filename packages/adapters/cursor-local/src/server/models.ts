import type { AdapterModel } from '../../../src/types.js';

const staticModels: AdapterModel[] = [
  { id: "cursor-pro", label: "Cursor Pro" },
];

export async function listCursorModels(_config?: Record<string, unknown>): Promise<AdapterModel[]> {
  return staticModels;
}
