import { Router } from 'express';

const router = Router();

const AdapterCapabilitiesSchema = {
  supportsInstructionsBundle: false,
  supportsSkills: false,
  supportsLocalAgentJwt: false,
  requiresMaterializedRuntimeSkills: false,
};

interface AdapterInfo {
  type: string;
  label: string;
  source: "builtin" | "external";
  modelsCount: number;
  loaded: boolean;
  disabled: boolean;
  capabilities: typeof AdapterCapabilitiesSchema;
  version?: string;
  packageName?: string;
  isLocalPath?: boolean;
  overriddenBuiltin?: boolean;
  overridePaused?: boolean;
}

const mockAdapters: AdapterInfo[] = [
  {
    type: 'opencode-local',
    label: 'OpenCode Local',
    source: 'builtin',
    modelsCount: 1,
    loaded: true,
    disabled: false,
    capabilities: {
      supportsInstructionsBundle: true,
      supportsSkills: true,
      supportsLocalAgentJwt: true,
      requiresMaterializedRuntimeSkills: false,
    },
  },
];

router.get('/', async (req, res) => {
  try {
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    res.json(mockAdapters);
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

// Test adapter environment: /companies/:companyId/adapters/:type/test-environment
router.post('/:companyId/adapters/:type/test-environment', async (req, res) => {
  try {
    const { companyId, type } = req.params;
    console.log("[DEBUG] test-environment:", { companyId, type, body: req.body });
    // Return mock success for now - mock the test
    res.json({
      success: true,
      companyId,
      adapterType: type,
      output: "Test environment check: adapter configured correctly",
      configured: true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;