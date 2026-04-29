// Simplified join request deduplication utilities

export function normalizeJoinRequestEmail(
  email: string | null | undefined
): string | null {
  if (!email) return null;
  const trimmed = email.trim();
  return trimmed ? trimmed.toLowerCase() : null;
}

export function humanJoinRequestIdentity(
  requestType: string,
  requestingUserId: string | null,
  requestEmail: string | null
): string {
  const email = normalizeJoinRequestEmail(requestEmail);
  if (email) return email;
  if (requestType === "human" && requestingUserId) return `user:${requestingUserId}`;
  return `anon:${Date.now()}`;
}

export function collapseDuplicatePendingHumanJoinRequests<T extends { id: string; requestingUserId: string | null; requestEmailSnapshot: string | null; createdAt: Date }>(
  requests: T[]
): T[] {
  const seen = new Map<string, T>();
  for (const req of requests) {
    const key = humanJoinRequestIdentity(
      "human",
      req.requestingUserId, 
      req.requestEmailSnapshot
    );
    const existing = seen.get(key);
    if (!existing || req.createdAt < existing.createdAt) {
      seen.set(key, req);
    }
  }
  return Array.from(seen.values());
}

export function findReusableHumanJoinRequest<T extends { id: string; status: string; requestEmailSnapshot: string | null }>(
  requests: T[],
  email: string
): T | null {
  const normalized = normalizeJoinRequestEmail(email);
  if (!normalized) return null;
  return requests.find(r => 
    r.status === "pending_approval" && 
    normalizeJoinRequestEmail(r.requestEmailSnapshot) === normalized
  ) ?? null;
}