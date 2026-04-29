export const inboxDismissalService = {
  async list(_userId: string, _companyId: string) {
    return [];
  },

  async dismiss(_userId: string, _companyId: string, _itemKey: string) {
    return { ok: true };
  },

  async undismiss(_userId: string, _companyId: string, _itemKey: string) {
    return { ok: true };
  },
};