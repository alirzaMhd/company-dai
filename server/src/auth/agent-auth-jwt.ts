import jwt from "jsonwebtoken";
import { config } from "../config.js";

export interface AgentJwtPayload {
  agentId: string;
  companyId: string;
  role: string;
  iat: number;
  exp: number;
}

export interface AgentJwtResult {
  valid: boolean;
  payload?: AgentJwtPayload;
  error?: string;
}

export function verifyAgentJwt(token: string): AgentJwtResult {
  try {
    const payload = jwt.verify(token, config.authSecret) as AgentJwtPayload;

    if (!payload.agentId || !payload.companyId) {
      return { valid: false, error: "Invalid token payload" };
    }

    return { valid: true, payload };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { valid: false, error: "Token expired" };
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return { valid: false, error: "Invalid token" };
    }
    return { valid: false, error: "Token verification failed" };
  }
}

export function createAgentJwt(agentId: string, companyId: string, role: string = "agent"): string {
  return jwt.sign(
    { agentId, companyId, role },
    config.authSecret,
    { expiresIn: "7d" }
  );
}