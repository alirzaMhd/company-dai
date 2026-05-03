import { eq, and, isNull, or } from "drizzle-orm";
import { db } from "../lib/db.js";
import { boardApiKeys, agentApiKeys, companyMemberships, instanceUserRoles } from "@company-dai/db/schema";
import { createHash } from "crypto";

export interface BoardApiKeyResult {
  valid: boolean;
  userId?: string;
  name?: string;
  companyId?: string;
  isInstanceAdmin?: boolean;
  error?: string;
}

export interface AgentApiKeyResult {
  valid: boolean;
  agentId?: string;
  companyId?: string;
  name?: string;
  error?: string;
}

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export async function verifyBoardApiKey(key: string): Promise<BoardApiKeyResult> {
  try {
    const keyHash = hashKey(key);

    const [apiKey] = await db
      .select()
      .from(boardApiKeys)
      .where(
        and(
          eq(boardApiKeys.keyHash, keyHash),
          isNull(boardApiKeys.revokedAt)
        )
      )
      .limit(1);

    if (!apiKey) {
      return { valid: false, error: "Invalid API key" };
    }

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return { valid: false, error: "API key expired" };
    }

    await db
      .update(boardApiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(boardApiKeys.id, apiKey.id));

    const memberships = await db
      .select()
      .from(companyMemberships)
      .where(or(
        eq(companyMemberships.principalId, apiKey.userId),
        eq(companyMemberships.principalId, apiKey.userId)
      ))
      .limit(1);

    const userCompanyId = memberships[0]?.companyId;
    const isInstanceAdmin = memberships.length === 0 || memberships[0]?.membershipRole === "admin" || memberships[0]?.membershipRole === "owner";

    const instanceAdminRole = await db
      .select()
      .from(instanceUserRoles)
      .where(eq(instanceUserRoles.userId, apiKey.userId))
      .limit(1);

    return {
      valid: true,
      userId: apiKey.userId,
      name: apiKey.name,
      companyId: userCompanyId,
      isInstanceAdmin: isInstanceAdmin || instanceAdminRole.length > 0,
    };
  } catch (error) {
    return { valid: false, error: "Failed to verify API key" };
  }
}

export async function verifyAgentApiKey(key: string): Promise<AgentApiKeyResult> {
  try {
    const keyHash = hashKey(key);

    const [apiKey] = await db
      .select()
      .from(agentApiKeys)
      .where(
        and(
          eq(agentApiKeys.keyHash, keyHash),
          isNull(agentApiKeys.revokedAt)
        )
      )
      .limit(1);

    if (!apiKey) {
      return { valid: false, error: "Invalid API key" };
    }

    await db
      .update(agentApiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(agentApiKeys.id, apiKey.id));

    return {
      valid: true,
      agentId: apiKey.agentId,
      companyId: apiKey.companyId,
      name: apiKey.name,
    };
  } catch (error) {
    return { valid: false, error: "Failed to verify API key" };
  }
}

export async function createBoardApiKey(
  userId: string,
  name: string,
  expiresAt?: Date
): Promise<{ key: string; id: string }> {
  const key = `bkey_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  const keyHash = hashKey(key);

  const [created] = await db
    .insert(boardApiKeys)
    .values({
      userId,
      name,
      keyHash,
      expiresAt: expiresAt || null,
    })
    .returning();

  return { key, id: created.id };
}

export async function revokeBoardApiKey(id: string): Promise<boolean> {
  await db
    .update(boardApiKeys)
    .set({ revokedAt: new Date() })
    .where(eq(boardApiKeys.id, id));

  return true;
}

export async function listBoardApiKeys(userId: string) {
  return db
    .select({
      id: boardApiKeys.id,
      name: boardApiKeys.name,
      lastUsedAt: boardApiKeys.lastUsedAt,
      expiresAt: boardApiKeys.expiresAt,
      createdAt: boardApiKeys.createdAt,
    })
    .from(boardApiKeys)
    .where(eq(boardApiKeys.userId, userId));
}