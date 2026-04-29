import type { Plugin, PluginContext, ValidationResult, JobHandler, JobSchedule, StreamEvent, HttpOptions, HttpResponse } from './types.js';

export interface PluginDefinitionOptions {
  key: string;
  name: string;
  version: string;
  description?: string;
  capabilities?: string[];
  setup?: (ctx: PluginContext) => Promise<void>;
  onHealth?: () => Promise<void>;
  onConfigChanged?: (config: unknown) => void;
  onShutdown?: () => Promise<void>;
  onValidateConfig?: (config: unknown) => ValidationResult;
}

export function definePlugin(options: PluginDefinitionOptions): Plugin {
  const {
    key,
    name,
    version,
    description,
    capabilities = [],
    setup,
    onHealth,
    onConfigChanged,
    onShutdown,
    onValidateConfig
  } = options;

  const plugin: Plugin = {
    key,
    name,
    version,
    description,
    capabilities,
    setup: setup || (async () => {}),
    ...(onHealth && { onHealth }),
    ...(onConfigChanged && { onConfigChanged }),
    ...(onShutdown && { onShutdown }),
    ...(onValidateConfig && { onValidateConfig })
  };

  return plugin;
}

export function createPluginContext(config: {
  companyId: string;
  instanceId: string;
  getSecrets: (keys: string[]) => Promise<Record<string, string>>;
  httpClient: {
    get: (url: string, options?: unknown) => Promise<unknown>;
    post: (url: string, options?: unknown) => Promise<unknown>;
  };
}): PluginContext {
  const { companyId, instanceId, getSecrets, httpClient } = config;

  return {
    events: {
      subscribe: async (event: string, handler: (data: unknown) => Promise<void>) => {
        console.log(`[Plugin:${companyId}] Subscribed to event: ${event}`);
        return async () => {
          console.log(`[Plugin:${companyId}] Unsubscribed from event: ${event}`);
        };
      },
      emit: async (event: string, data: unknown) => {
        console.log(`[Plugin:${companyId}] Emitted event: ${event}`, data);
      }
    },
    jobs: {
      register: async (name: string, handler: JobHandler, schedule?: JobSchedule) => {
        console.log(`[Plugin:${companyId}] Registered job: ${name}`);
      },
      unregister: async (name: string) => {
        console.log(`[Plugin:${companyId}] Unregistered job: ${name}`);
      },
      list: async () => []
    },
    data: {
      registerProvider: async (key: string, provider: unknown) => {
        console.log(`[Plugin:${companyId}] Registered data provider: ${key}`);
      },
      unregisterProvider: async (key: string) => {
        console.log(`[Plugin:${companyId}] Unregistered data provider: ${key}`);
      },
      query: async (provider: string, query: unknown) => {
        console.log(`[Plugin:${companyId}] Querying provider: ${provider}`, query);
        return null;
      }
    },
    actions: {
      register: async (action: unknown) => {
        console.log(`[Plugin:${companyId}] Registered action: ${(action as { key: string }).key}`);
      },
      unregister: async (actionKey: string) => {
        console.log(`[Plugin:${companyId}] Unregistered action: ${actionKey}`);
      },
      list: async () => [],
      execute: async (actionKey: string, params: unknown) => {
        console.log(`[Plugin:${companyId}] Executing action: ${actionKey}`, params);
        return { success: true };
      }
    },
    tools: {
      register: async (tool: unknown) => {
        console.log(`[Plugin:${companyId}] Registered tool: ${(tool as { name: string }).name}`);
      },
      unregister: async (toolKey: string) => {
        console.log(`[Plugin:${companyId}] Unregistered tool: ${toolKey}`);
      },
      list: async () => []
    },
    streams: {
      publish: async (channel: string, event: StreamEvent) => {
        console.log(`[Plugin:${companyId}] Published to channel: ${channel}`, event);
      },
      subscribe: async (channel: string, handler: (event: StreamEvent) => Promise<void>) => {
        console.log(`[Plugin:${companyId}] Subscribed to channel: ${channel}`);
        return async () => {
          console.log(`[Plugin:${companyId}] Unsubscribed from channel: ${channel}`);
        };
      }
    },
    http: {
      get: async (url: string, options?: HttpOptions): Promise<HttpResponse> => {
        console.log(`[Plugin:${companyId}] HTTP GET: ${url}`);
        return { status: 200, statusText: 'OK', headers: {}, data: null };
      },
      post: async (url: string, options?: HttpOptions): Promise<HttpResponse> => {
        console.log(`[Plugin:${companyId}] HTTP POST: ${url}`);
        return { status: 200, statusText: 'OK', headers: {}, data: null };
      },
      put: async (url: string, options?: HttpOptions): Promise<HttpResponse> => {
        console.log(`[Plugin:${companyId}] HTTP PUT: ${url}`);
        return { status: 200, statusText: 'OK', headers: {}, data: null };
      },
      delete: async (url: string, options?: HttpOptions): Promise<HttpResponse> => {
        console.log(`[Plugin:${companyId}] HTTP DELETE: ${url}`);
        return { status: 200, statusText: 'OK', headers: {}, data: null };
      }
    },
    secrets: {
      get: async (key: string) => {
        const secrets = await getSecrets([key]);
        return secrets[key] || null;
      },
      set: async (key: string, value: string) => {
        console.log(`[Plugin:${companyId}] Set secret: ${key}`);
      },
      delete: async (key: string) => {
        console.log(`[Plugin:${companyId}] Deleted secret: ${key}`);
      },
      list: async () => []
    },
    state: {
      get: async (key: string) => null,
      set: async (key: string, value: unknown) => {
        console.log(`[Plugin:${companyId}] Set state: ${key}`);
      },
      delete: async (key: string) => {
        console.log(`[Plugin:${companyId}] Deleted state: ${key}`);
      },
      clear: async () => {
        console.log(`[Plugin:${companyId}] Cleared state`);
      }
    },
    entities: {
      companies: {
        list: async () => ({ items: [], total: 0, hasMore: false }),
        get: async () => null,
        create: async () => null,
        update: async () => null,
        delete: async () => {}
      },
      agents: {
        list: async () => ({ items: [], total: 0, hasMore: false }),
        get: async () => null,
        create: async () => null,
        update: async () => null,
        delete: async () => {}
      },
      issues: {
        list: async () => ({ items: [], total: 0, hasMore: false }),
        get: async () => null,
        create: async () => null,
        update: async () => null,
        delete: async () => {}
      },
      projects: {
        list: async () => ({ items: [], total: 0, hasMore: false }),
        get: async () => null,
        create: async () => null,
        update: async () => null,
        delete: async () => {}
      },
      goals: {
        list: async () => ({ items: [], total: 0, hasMore: false }),
        get: async () => null,
        create: async () => null,
        update: async () => null,
        delete: async () => {}
      },
      documents: {
        list: async () => ({ items: [], total: 0, hasMore: false }),
        get: async () => null,
        create: async () => null,
        update: async () => null,
        delete: async () => {}
      },
      assets: {
        list: async () => ({ items: [], total: 0, hasMore: false }),
        get: async () => null,
        create: async () => null,
        update: async () => null,
        delete: async () => {}
      }
    },
    agents: {
      invoke: async (agentId: string, instructions: string, context?: Record<string, unknown>) => {
        console.log(`[Plugin:${companyId}] Invoking agent: ${agentId}`, { instructions, context });
        return { success: true };
      },
      createSession: async (agentId: string) => {
        console.log(`[Plugin:${companyId}] Creating session for agent: ${agentId}`);
        return {
          id: `session-${Date.now()}`,
          agentId,
          createdAt: new Date(),
          lastActivityAt: new Date()
        };
      },
      getSession: async (sessionId: string) => {
        console.log(`[Plugin:${companyId}] Getting session: ${sessionId}`);
        return null;
      }
    }
  };
}