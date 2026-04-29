export const sidebarPreferenceService = {
  async get(_userId: string, _companyId: string) {
    return {
      order: [],
      collapsed: {},
    };
  },

  async set(_userId: string, _companyId: string, preferences: any) {
    return preferences;
  },
};