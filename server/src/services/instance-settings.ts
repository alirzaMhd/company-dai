// Stub instance settings service

function normalizeInstanceSettings(raw: unknown) {
  return {
    censorUsernameInLogs: false,
    keyboardShortcuts: false,
    feedbackDataSharingPreference: "DISALLOWED",
    backupRetention: 30,
  };
}

export const instanceSettingsService = {
  async getGeneral() {
    return normalizeInstanceSettings({});
  },

  async getExperimental() {
    return {
      enableIsolatedWorkspaces: false,
      autoRestartDevServerWhenIdle: false,
    };
  },

  async updateGeneral(_data: any) {
    return normalizeInstanceSettings(_data);
  },

  async updateExperimental(_data: any) {
    return {
      enableIsolatedWorkspaces: _data.enableIsolatedWorkspaces ?? false,
      autoRestartDevServerWhenIdle: _data.autoRestartDevServerWhenIdle ?? false,
    };
  },
};