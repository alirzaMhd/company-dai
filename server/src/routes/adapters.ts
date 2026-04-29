import { Router } from 'express';
import { listAdapterModels } from '@company-dai/adapters';

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
  {
    type: 'claude-local',
    label: 'Claude Local',
    source: 'builtin',
    modelsCount: 3,
    loaded: true,
    disabled: false,
    capabilities: {
      supportsInstructionsBundle: true,
      supportsSkills: true,
      supportsLocalAgentJwt: true,
      requiresMaterializedRuntimeSkills: false,
    },
  },
  {
    type: 'gemini-local',
    label: 'Gemini Local',
    source: 'builtin',
    modelsCount: 1,
    loaded: true,
    disabled: false,
    capabilities: {
      supportsInstructionsBundle: false,
      supportsSkills: false,
      supportsLocalAgentJwt: false,
      requiresMaterializedRuntimeSkills: false,
    },
  },
  {
    type: 'codex-local',
    label: 'Codex Local',
    source: 'builtin',
    modelsCount: 1,
    loaded: true,
    disabled: false,
    capabilities: {
      supportsInstructionsBundle: true,
      supportsSkills: true,
      supportsLocalAgentJwt: false,
      requiresMaterializedRuntimeSkills: false,
    },
  },
  {
    type: 'cursor-local',
    label: 'Cursor Local',
    source: 'builtin',
    modelsCount: 1,
    loaded: true,
    disabled: false,
    capabilities: {
      supportsInstructionsBundle: false,
      supportsSkills: false,
      supportsLocalAgentJwt: false,
      requiresMaterializedRuntimeSkills: false,
    },
  },
];

interface ModelInfo {
  id: string;
  label: string;
}

function getMockModelsByType(type: string): ModelInfo[] {
  const modelsByType: Record<string, ModelInfo[]> = {
    'opencode-local': [
      { id: 'openai/o1', label: 'OpenAI O1' },
      { id: 'openai/o3', label: 'OpenAI O3' },
      { id: 'anthropic/claude-4-sonnet', label: 'Anthropic Claude 4 Sonnet' },
      { id: 'anthropic/claude-4-opus', label: 'Anthropic Claude 4 Opus' },
      { id: 'google/gemini-2.5-pro', label: 'Google Gemini 2.5 Pro' },
      { id: 'google/gemini-2.5-flash', label: 'Google Gemini 2.5 Flash' },
      { id: 'xai/grok-2', label: 'xAI Grok 2' },
      { id: 'deepseek/deepseek-chat', label: 'DeepSeek Chat' },
    ],
    'claude-local': [
      { id: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4 (May 14, 2025)' },
      { id: 'claude-opus-4-20250514', label: 'Claude Opus 4 (May 14, 2025)' },
      { id: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (Oct 22, 2024)' },
    ],
    'gemini-local': [
      { id: 'gemini-2.5-pro-preview-05-20', label: 'Gemini 2.5 Pro Preview (May 20)' },
    ],
    'codex-local': [
      { id: 'codex', label: 'Codex' },
    ],
    'cursor-local': [
      { id: 'cursor-pro', label: 'Cursor Pro' },
    ],
  };
  return modelsByType[type] ?? [];
}

// IMPORTANT: Specific routes with params must come BEFORE catch-all routes
// Route order matters in Express - first match wins

// Get adapter models: /companies/:companyId/adapters/:type/models
router.get('/:companyId/adapters/:type/models', async (req, res) => {
  try {
    const { companyId, type } = req.params;
    console.log("[DEBUG] adapter-models:", { companyId, type });
    const normalizedType = type.replace(/_/g, '-');
    const models = await listAdapterModels(normalizedType, req.body);
    res.json(models);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test adapter environment: /companies/:companyId/adapters/:type/test-environment
router.post('/:companyId/adapters/:type/test-environment', async (req, res) => {
  try {
    const { companyId, type } = req.params;
    console.log("[DEBUG] test-environment:", { companyId, type, body: req.body });
    res.json({
      adapterType: type,
      status: "pass",
      checks: [
        {
          code: "adapter_configured",
          level: "info",
          message: "Test environment check: adapter configured correctly"
        }
      ],
      testedAt: new Date().toISOString()
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

// Catch-all route - MUST be last
router.get('/', async (req, res) => {
  try {
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    res.json(mockAdapters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;