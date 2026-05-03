import { Router } from "express";
import type { Db } from "@company-dai/db";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Placeholder route - accessRoutes needs full implementation
export function accessRoutes(
  db: Db,
  opts: {
    deploymentMode: "local_trusted" | "authenticated";
    deploymentExposure: "public" | "private";
    bindHost: string;
    allowedHostnames: string[];
  }
) {
  return router;
}

export { router as accessRouter };
export default router;