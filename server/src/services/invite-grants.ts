import type { PermissionKey } from "@company-dai/shared";
import { grantsForHumanRole } from "./company-member-roles.js";

export function humanJoinGrantsFromDefaults(
  defaultsPayload: Record<string, unknown> | null,
  membershipRole: string | null | undefined
): PermissionKey[] {
  if (!defaultsPayload) {
    return grantsForHumanRole(membershipRole as any);
  }
  const human = defaultsPayload.human;
  if (human && typeof human === "object" && human !== null) {
    const humanObj = human as Record<string, unknown>;
    if ("grants" in humanObj && Array.isArray(humanObj.grants)) {
      return humanObj.grants as PermissionKey[];
    }
  }
  return grantsForHumanRole(membershipRole as any);
}