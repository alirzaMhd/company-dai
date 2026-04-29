export const adapters = {
  list: () => [],
  get: (id: string) => null,
  create: (config: any) => config,
  update: (id: string, config: any) => config,
  delete: (id: string) => true,
  invoke: (id: string, input: any) => ({}),
};