import { Router } from "express";

const router = Router();

router.get("/", async (req, res) => {
  res.json({ badges: { inbox: 0, issues: 0, approvals: 0, goals: 0 } });
});

export default router;