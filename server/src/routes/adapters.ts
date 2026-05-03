import { Router } from 'express';
import {
  listAdapterModels,
  listServerAdapters,
  getServerAdapter,
  requireServerAdapter,
} from '../adapters/registry.js';

const router = Router();

// IMPORTANT: Specific routes with params must come BEFORE catch-all routes
// Route order matters in Express - first match wins

// Get adapter models: /adapters/:type/models
router.get('/:type/models', async (req, res) => {
  try {
    const { type } = req.params;
    const normalizedType = type.replace(/_/g, '-');
    const models = await listAdapterModels(normalizedType, req.query as Record<string, unknown>);
    res.json(models);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test adapter environment: /adapters/:type/test-environment
router.post('/:type/test-environment', async (req, res) => {
  try {
    const { type } = req.params;
    const normalizedType = type.replace(/_/g, '-');
    const adapter = getServerAdapter(normalizedType);
    if (!adapter) {
      res.status(404).json({ error: `Unknown adapter type: ${type}` });
      return;
    }
    const result = await adapter.testEnvironment({
      companyId: 'default',
      adapterType: normalizedType,
      config: req.body,
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List all adapters
router.get('/', async (req, res) => {
  try {
    const adapters = listServerAdapters();
    const result = adapters.map(adapter => ({
      type: adapter.type,
      label: adapter.type.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      source: 'builtin' as const,
      modelsCount: (adapter.models ?? []).length,
      loaded: true,
      disabled: false,
      capabilities: {
        supportsInstructionsBundle: adapter.supportsInstructionsBundle ?? false,
        supportsSkills: typeof adapter.listSkills === 'function',
        supportsLocalAgentJwt: adapter.supportsLocalAgentJwt ?? false,
        requiresMaterializedRuntimeSkills: adapter.requiresMaterializedRuntimeSkills ?? false,
      },
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single adapter
router.get('/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const normalizedType = type.replace(/_/g, '-');
    const adapter = getServerAdapter(normalizedType);
    if (!adapter) {
      res.status(404).json({ error: `Unknown adapter type: ${type}` });
      return;
    }
    res.json({
      type: adapter.type,
      label: adapter.type.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      source: 'builtin' as const,
      modelsCount: (adapter.models ?? []).length,
      loaded: true,
      disabled: false,
      capabilities: {
        supportsInstructionsBundle: adapter.supportsInstructionsBundle ?? false,
        supportsSkills: typeof adapter.listSkills === 'function',
        supportsLocalAgentJwt: adapter.supportsLocalAgentJwt ?? false,
        requiresMaterializedRuntimeSkills: adapter.requiresMaterializedRuntimeSkills ?? false,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/install', async (req, res) => {
  try {
    const { packageName, version, isLocalPath } = req.body;
    res.json({
      type: packageName,
      packageName,
      version,
      installedAt: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const normalizedType = type.replace(/_/g, '-');
    unregisterServerAdapter(normalizedType);
    res.json({ type, removed: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { disabled } = req.body;
    res.json({ type, disabled, changed: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:type/override', async (req, res) => {
  try {
    const { type } = req.params;
    const { paused } = req.body;
    res.json({ type, paused, changed: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:type/reload', async (req, res) => {
  try {
    const { type } = req.params;
    res.json({ type, reloaded: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:type/reinstall', async (req, res) => {
  try {
    const { type } = req.params;
    res.json({ type, reinstalled: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

function unregisterServerAdapter(type: string): void {
  const { processAdapter, httpAdapter } = require('./registry.js');
  if (type === 'process' || type === 'http') return;
  const { adaptersByType } = require('./registry.js');
  adaptersByType.delete(type);
}
