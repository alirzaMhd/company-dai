import type { PluginCapabilities } from './types.js';

export const CAPABILITY_DEFINITIONS: Record<string, { description: string; requires: string[] }> = {
  'api:read': {
    description: 'Read access to API resources',
    requires: []
  },
  'api:write': {
    description: 'Write access to API resources',
    requires: ['api:read']
  },
  'ui:pages': {
    description: 'Can register custom pages',
    requires: []
  },
  'ui:slots': {
    description: 'Can inject UI into existing slots',
    requires: ['ui:pages']
  },
  'ui:actions': {
    description: 'Can register action buttons',
    requires: []
  },
  'jobs:scheduled': {
    description: 'Can register scheduled jobs',
    requires: []
  },
  'jobs:webhook': {
    description: 'Can register webhook handlers',
    requires: []
  },
  'secrets:read': {
    description: 'Read access to secrets',
    requires: []
  },
  'secrets:write': {
    description: 'Write access to secrets',
    requires: ['secrets:read']
  },
  'http:outbound': {
    description: 'Can make HTTP requests to external services',
    requires: []
  },
  'agents:invoke': {
    description: 'Can invoke agents',
    requires: []
  },
  'agents:manage': {
    description: 'Can create and manage agents',
    requires: ['agents:invoke']
  }
};

export function validateCapabilities(capabilities: string[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const seen = new Set<string>();

  for (const cap of capabilities) {
    if (!CAPABILITY_DEFINITIONS[cap]) {
      errors.push(`Unknown capability: ${cap}`);
      continue;
    }

    const def = CAPABILITY_DEFINITIONS[cap];
    for (const required of def.requires) {
      if (!capabilities.includes(required)) {
        errors.push(`Capability "${cap}" requires "${required}" which is not present`);
      }
    }

    if (seen.has(cap)) {
      errors.push(`Duplicate capability: ${cap}`);
    }
    seen.add(cap);
  }

  return { valid: errors.length === 0, errors };
}

export function expandCapabilities(capabilities: string[]): string[] {
  const expanded = new Set<string>(capabilities);

  let changed = true;
  while (changed) {
    changed = false;
    for (const cap of expanded) {
      const def = CAPABILITY_DEFINITIONS[cap];
      if (def) {
        for (const required of def.requires) {
          if (!expanded.has(required)) {
            expanded.add(required);
            changed = true;
          }
        }
      }
    }
  }

  return Array.from(expanded);
}

export function hasCapability(capabilities: PluginCapabilities, required: string): boolean {
  return Boolean(capabilities[required as keyof PluginCapabilities]);
}