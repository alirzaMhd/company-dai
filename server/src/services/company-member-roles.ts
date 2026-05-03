import type { HumanCompanyMembershipRole } from "@company-dai/shared";
import { HUMAN_COMPANY_MEMBERSHIP_ROLES } from "@company-dai/shared";
import type { PermissionKey } from "@company-dai/shared";
import { PERMISSION_KEYS } from "@company-dai/shared";

const ROLE_GRANTS: Record<HumanCompanyMembershipRole, PermissionKey[]> = {
  owner: [...PERMISSION_KEYS],
  admin: [
    "agents:create",
    "users:invite",
    "users:manage_permissions",
    "tasks:assign",
    "tasks:assign_scope",
    "tasks:manage_active_checkouts",
    "joins:approve",
  ],
  operator: [
    "agents:create",
    "tasks:assign",
    "tasks:assign_scope",
  ],
  viewer: [],
};

export function grantsForHumanRole(humanRole: HumanCompanyMembershipRole | null | undefined): PermissionKey[] {
  if (!humanRole) return [];
  return ROLE_GRANTS[humanRole] ?? [];
}

export function normalizeHumanRole(
  role: string | HumanCompanyMembershipRole | null | undefined,
  defaultRole: HumanCompanyMembershipRole = "operator"
): HumanCompanyMembershipRole {
  if (!role) return defaultRole;
  const normalized = typeof role === "string" ? role.trim() : role;
  if (HUMAN_COMPANY_MEMBERSHIP_ROLES.includes(normalized as HumanCompanyMembershipRole)) {
    return normalized as HumanCompanyMembershipRole;
  }
  return defaultRole;
}

export function resolveHumanInviteRole(
  defaultsPayload: Record<string, unknown> | null | undefined
): HumanCompanyMembershipRole {
  if (!defaultsPayload) return "operator";
  const human = defaultsPayload.human;
  if (human && typeof human === "object" && human !== null) {
    const humanObj = human as Record<string, unknown>;
    const role = humanObj.role;
    if (typeof role === "string") {
      return normalizeHumanRole(role, "operator");
    }
  }
  return "operator";
}