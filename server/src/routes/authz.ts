import { Response, NextFunction } from "express";

export function assertCompanyAccess(req: { params: { companyId?: string }; actor?: { companyId?: string } }, companyId: string): void {
  if (!req.actor?.companyId || req.actor.companyId !== companyId) {
    throw new Error("Access denied");
  }
}

export function assertBoard(req: { actor?: { type?: string } }): void {
  if (req.actor?.type !== "board") {
    throw new Error("Board access required");
  }
}