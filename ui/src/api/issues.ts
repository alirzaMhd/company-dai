import type {
  AskUserQuestionsAnswer,
  Approval,
  DocumentRevision,
  FeedbackTargetType,
  FeedbackTrace,
  FeedbackVote,
  Issue,
  IssueAttachment,
  IssueComment,
  IssueDocument,
  IssueLabel,
  IssueThreadInteraction,
  IssueWorkProduct,
  UpsertIssueDocument,
} from "@paperclipai/shared";
import { api } from "./client";

export type IssueUpdateResponse = Issue & {
  comment?: IssueComment | null;
};

export const issuesApi = {
  list: (
    companyId: string,
    filters?: {
      status?: string;
      projectId?: string;
      parentId?: string;
      assigneeAgentId?: string;
      participantAgentId?: string;
      assigneeUserId?: string;
      touchedByUserId?: string;
      inboxArchivedByUserId?: string;
      unreadForUserId?: string;
      labelId?: string;
      workspaceId?: string;
      executionWorkspaceId?: string;
      originKind?: string;
      originId?: string;
      includeRoutineExecutions?: boolean;
      q?: string;
      limit?: number;
    },
  ) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.projectId) params.set("projectId", filters.projectId);
    if (filters?.parentId) params.set("parentId", filters.parentId);
    if (filters?.assigneeAgentId) params.set("assigneeAgentId", filters.assigneeAgentId);
    if (filters?.participantAgentId) params.set("participantAgentId", filters.participantAgentId);
    if (filters?.assigneeUserId) params.set("assigneeUserId", filters.assigneeUserId);
    if (filters?.touchedByUserId) params.set("touchedByUserId", filters.touchedByUserId);
    if (filters?.inboxArchivedByUserId) params.set("inboxArchivedByUserId", filters.inboxArchivedByUserId);
    if (filters?.unreadForUserId) params.set("unreadForUserId", filters.unreadForUserId);
    if (filters?.labelId) params.set("labelId", filters.labelId);
    if (filters?.workspaceId) params.set("workspaceId", filters.workspaceId);
    if (filters?.executionWorkspaceId) params.set("executionWorkspaceId", filters.executionWorkspaceId);
    if (filters?.originKind) params.set("originKind", filters.originKind);
    if (filters?.originId) params.set("originId", filters.originId);
    if (filters?.includeRoutineExecutions) params.set("includeRoutineExecutions", "true");
    if (filters?.q) params.set("q", filters.q);
    if (filters?.limit) params.set("limit", String(filters.limit));
    const qs = params.toString();
    return api.get<Issue[]>(`/companies/${companyId}/issues${qs ? `?${qs}` : ""}`);
  },
  listLabels: (companyId: string) => api.get<IssueLabel[]>(`/companies/${companyId}/labels`),
  createLabel: (companyId: string, data: { name: string; color: string }) =>
    api.post<IssueLabel>(`/companies/${companyId}/labels`, data),
  deleteLabel: (companyId: string, id: string) => api.delete<IssueLabel>(`/companies/${companyId}/labels/${id}`),
  get: (companyId: string, id: string) => api.get<Issue>(`/companies/${companyId}/issues/${id}`),
  markRead: (companyId: string, id: string) => api.post<{ id: string; lastReadAt: Date }>(`/companies/${companyId}/issues/${id}/read`, {}),
  markUnread: (companyId: string, id: string) => api.delete<{ id: string; removed: boolean }>(`/companies/${companyId}/issues/${id}/read`),
  archiveFromInbox: (companyId: string, id: string) =>
    api.post<{ id: string; archivedAt: Date }>(`/companies/${companyId}/issues/${id}/inbox-archive`, {}),
  unarchiveFromInbox: (companyId: string, id: string) =>
    api.delete<{ id: string; archivedAt: Date } | { ok: true }>(`/companies/${companyId}/issues/${id}/inbox-archive`),
  create: (companyId: string, data: Record<string, unknown>) =>
    api.post<Issue>(`/companies/${companyId}/issues`, data),
  update: (companyId: string, id: string, data: Record<string, unknown>) =>
    api.patch<IssueUpdateResponse>(`/companies/${companyId}/issues/${id}`, data),
  remove: (companyId: string, id: string) => api.delete<Issue>(`/companies/${companyId}/issues/${id}`),
  checkout: (companyId: string, id: string, agentId: string) =>
    api.post<Issue>(`/companies/${companyId}/issues/${id}/checkout`, {
      agentId,
      expectedStatuses: ["todo", "backlog", "blocked", "in_review"],
    }),
  release: (companyId: string, id: string) => api.post<Issue>(`/companies/${companyId}/issues/${id}/release`, {}),
  listComments: (
    companyId: string,
    id: string,
    filters?: {
      after?: string;
      order?: "asc" | "desc";
      limit?: number;
    },
  ) => {
    const params = new URLSearchParams();
    if (filters?.after) params.set("after", filters.after);
    if (filters?.order) params.set("order", filters.order);
    if (filters?.limit) params.set("limit", String(filters.limit));
    const qs = params.toString();
    return api.get<IssueComment[]>(`/companies/${companyId}/issues/${id}/comments${qs ? `?${qs}` : ""}`);
  },
  listInteractions: (companyId: string, id: string) =>
    api.get<IssueThreadInteraction[]>(`/companies/${companyId}/issues/${id}/interactions`),
  createInteraction: (companyId: string, id: string, data: Record<string, unknown>) =>
    api.post<IssueThreadInteraction>(`/companies/${companyId}/issues/${id}/interactions`, data),
  acceptInteraction: (
    companyId: string,
    id: string,
    interactionId: string,
    data?: { selectedClientKeys?: string[] },
  ) =>
    api.post<IssueThreadInteraction>(`/companies/${companyId}/issues/${id}/interactions/${interactionId}/accept`, data ?? {}),
  rejectInteraction: (companyId: string, id: string, interactionId: string, reason?: string) =>
    api.post<IssueThreadInteraction>(`/companies/${companyId}/issues/${id}/interactions/${interactionId}/reject`, reason ? { reason } : {}),
  respondToInteraction: (
    companyId: string,
    id: string,
    interactionId: string,
    data: { answers: AskUserQuestionsAnswer[]; summaryMarkdown?: string | null },
  ) =>
    api.post<IssueThreadInteraction>(`/companies/${companyId}/issues/${id}/interactions/${interactionId}/respond`, data),
  getComment: (companyId: string, id: string, commentId: string) =>
    api.get<IssueComment>(`/companies/${companyId}/issues/${id}/comments/${commentId}`),
  listFeedbackVotes: (companyId: string, id: string) => api.get<FeedbackVote[]>(`/companies/${companyId}/issues/${id}/feedback-votes`),
  listFeedbackTraces: (companyId: string, id: string, filters?: Record<string, string | boolean | undefined>) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters ?? {})) {
      if (value === undefined) continue;
      params.set(key, String(value));
    }
    const qs = params.toString();
    return api.get<FeedbackTrace[]>(`/companies/${companyId}/issues/${id}/feedback-traces${qs ? `?${qs}` : ""}`);
  },
  upsertFeedbackVote: (
    companyId: string,
    id: string,
    data: {
      targetType: FeedbackTargetType;
      targetId: string;
      vote: "up" | "down";
      reason?: string;
      allowSharing?: boolean;
    },
  ) => api.post<FeedbackVote>(`/companies/${companyId}/issues/${id}/feedback-votes`, data),
  addComment: (companyId: string, id: string, body: string, reopen?: boolean, interrupt?: boolean) =>
    api.post<IssueComment>(
      `/companies/${companyId}/issues/${id}/comments`,
      {
        body,
        ...(reopen === undefined ? {} : { reopen }),
        ...(interrupt === undefined ? {} : { interrupt }),
      },
    ),
  cancelComment: (companyId: string, id: string, commentId: string) =>
    api.delete<IssueComment>(`/companies/${companyId}/issues/${id}/comments/${commentId}`),
  listDocuments: (companyId: string, id: string, options?: { includeSystem?: boolean }) =>
    api.get<IssueDocument[]>(
      `/companies/${companyId}/issues/${id}/documents${options?.includeSystem ? "?includeSystem=true" : ""}`,
    ),
  getDocument: (companyId: string, id: string, key: string) => api.get<IssueDocument>(`/companies/${companyId}/issues/${id}/documents/${encodeURIComponent(key)}`),
  upsertDocument: (companyId: string, id: string, key: string, data: UpsertIssueDocument) =>
    api.put<IssueDocument>(`/companies/${companyId}/issues/${id}/documents/${encodeURIComponent(key)}`, data),
  listDocumentRevisions: (companyId: string, id: string, key: string) =>
    api.get<DocumentRevision[]>(`/companies/${companyId}/issues/${id}/documents/${encodeURIComponent(key)}/revisions`),
  restoreDocumentRevision: (companyId: string, id: string, key: string, revisionId: string) =>
    api.post<IssueDocument>(`/companies/${companyId}/issues/${id}/documents/${encodeURIComponent(key)}/revisions/${revisionId}/restore`, {}),
  deleteDocument: (companyId: string, id: string, key: string) =>
    api.delete<{ ok: true }>(`/companies/${companyId}/issues/${id}/documents/${encodeURIComponent(key)}`),
  listAttachments: (companyId: string, id: string) => api.get<IssueAttachment[]>(`/companies/${companyId}/issues/${id}/attachments`),
  uploadAttachment: (
    companyId: string,
    issueId: string,
    file: File,
    issueCommentId?: string | null,
  ) => {
    const form = new FormData();
    form.append("file", file);
    if (issueCommentId) {
      form.append("issueCommentId", issueCommentId);
    }
    return api.postForm<IssueAttachment>(`/companies/${companyId}/issues/${issueId}/attachments`, form);
  },
  deleteAttachment: (companyId: string, id: string) => api.delete<{ ok: true }>(`/companies/${companyId}/attachments/${id}`),
  listApprovals: (companyId: string, id: string) => api.get<Approval[]>(`/companies/${companyId}/issues/${id}/approvals`),
  linkApproval: (companyId: string, id: string, approvalId: string) =>
    api.post<Approval[]>(`/companies/${companyId}/issues/${id}/approvals`, { approvalId }),
  unlinkApproval: (companyId: string, id: string, approvalId: string) =>
    api.delete<{ ok: true }>(`/companies/${companyId}/issues/${id}/approvals/${approvalId}`),
  listWorkProducts: (companyId: string, id: string) => api.get<IssueWorkProduct[]>(`/companies/${companyId}/issues/${id}/work-products`),
  createWorkProduct: (companyId: string, id: string, data: Record<string, unknown>) =>
    api.post<IssueWorkProduct>(`/companies/${companyId}/issues/${id}/work-products`, data),
  updateWorkProduct: (companyId: string, id: string, data: Record<string, unknown>) =>
    api.patch<IssueWorkProduct>(`/companies/${companyId}/work-products/${id}`, data),
  deleteWorkProduct: (companyId: string, id: string) => api.delete<IssueWorkProduct>(`/companies/${companyId}/work-products/${id}`),
};
