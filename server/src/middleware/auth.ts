import { Request, Response, NextFunction } from "express";
import { config, isLocalTrusted } from "../config.js";
import { auth } from "../auth/better-auth.js";
import { verifyAgentJwt } from "../auth/agent-auth-jwt.js";
import { verifyBoardApiKey, verifyAgentApiKey } from "../services/board-auth.js";
import { db } from "../lib/db.js";
import { companyMemberships } from "@company-dai/db/schema";
import { eq, or } from "drizzle-orm";

export type ActorType = "board" | "agent" | "none";

export interface Actor {
  type: ActorType;
  userId?: string;
  agentId?: string;
  companyId?: string;
  isInstanceAdmin?: boolean;
  name?: string;
}

declare global {
  namespace Express {
    interface Request {
      actor?: Actor;
    }
  }
}

function parseAuthHeader(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  if (!authHeader.startsWith("Bearer ")) return null;
  return authHeader.substring(7);
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (isLocalTrusted()) {
    req.actor = {
      type: "board",
      userId: "local-board",
      isInstanceAdmin: true,
    };
    return next();
  }

  const cookie = req.headers.cookie;
  const authHeader = parseAuthHeader(req.headers.authorization);

  if (cookie) {
    try {
      const session = await auth.api.getSession({
        headers: { cookie },
      });

      if (session?.user) {
        const memberships = await db
          .select()
          .from(companyMemberships)
          .where(or(
            eq(companyMemberships.principalId, session.user.id),
            eq(companyMemberships.principalId, session.user.email)
          ))
          .limit(1);

        console.log("[DEBUG] auth session user:", session.user.id, "memberships found:", memberships.length);

        const userCompanyId = memberships[0]?.companyId;
        const isInstanceAdmin = memberships.length === 0 || memberships[0]?.membershipRole === "admin" || memberships[0]?.membershipRole === "owner";

        req.actor = {
          type: "board",
          userId: session.user.id,
          name: session.user.name,
          companyId: userCompanyId,
          isInstanceAdmin: isInstanceAdmin,
        };
        return next();
      }
    } catch (error) {
      console.error("Session verification failed:", error);
    }
  }

  if (authHeader) {
    const boardKeyResult = await verifyBoardApiKey(authHeader);
    if (boardKeyResult.valid) {
      req.actor = {
        type: "board",
        userId: boardKeyResult.userId,
        name: boardKeyResult.name,
        companyId: boardKeyResult.companyId,
        isInstanceAdmin: boardKeyResult.isInstanceAdmin,
      };
      return next();
    }

    const agentKeyResult = await verifyAgentApiKey(authHeader);
    if (agentKeyResult.valid) {
      req.actor = {
        type: "agent",
        agentId: agentKeyResult.agentId,
        companyId: agentKeyResult.companyId,
        name: agentKeyResult.name,
      };
      return next();
    }

    const jwtResult = verifyAgentJwt(authHeader);
    if (jwtResult.valid && jwtResult.payload) {
      req.actor = {
        type: "agent",
        agentId: jwtResult.payload.agentId,
        companyId: jwtResult.payload.companyId,
      };
      return next();
    }
  }

  req.actor = {
    type: "none",
  };

  return next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.actor || req.actor.type === "none") {
    return res.status(401).json({ error: "Authentication required" });
  }
  return next();
}

export function requireBoard(req: Request, res: Response, next: NextFunction) {
  if (!req.actor || req.actor.type !== "board") {
    return res.status(403).json({ error: "Board access required" });
  }
  return next();
}

export function requireAgent(req: Request, res: Response, next: NextFunction) {
  if (!req.actor || req.actor.type !== "agent") {
    return res.status(403).json({ error: "Agent access required" });
  }
  return next();
}

export function requireInstanceAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.actor || !req.actor.isInstanceAdmin) {
    return res.status(403).json({ error: "Instance admin access required" });
  }
  return next();
}