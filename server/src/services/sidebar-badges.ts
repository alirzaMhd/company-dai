export const sidebarBadgeService = {
  async listBadges(_userId: string, _companyId: string) {
    return {
      inbox: 0,
      issues: 0,
      approvals: 0,
      goals: 0,
    };
  },
};