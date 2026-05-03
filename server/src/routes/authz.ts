import { Router, Response, NextFunction } from "express";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", (req, res) => {
  res.json({ 
    message: "Authz endpoint",
    assertCompanyAccess: "Use assertCompanyAccess function for authorization checks",
    assertBoard: "Use assertBoard function for board authorization"
  });
});

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

export default router;