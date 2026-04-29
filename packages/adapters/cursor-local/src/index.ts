// Adapter: cursor-local
export const CURSOR_LOCAL_ADAPTER_TYPE = "cursor-local";
export const CURSOR_LOCAL_LABEL = "Cursor Local";

export const models = [
  { id: "cursor-pro", label: "Cursor Pro" },
];

export { listCursorModels as listModels } from './server/models.js';
export { execute } from './server/execute.js';
export { testEnvironment } from './server/test-environment.js';
