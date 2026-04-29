import { Router } from "express";

const router = Router();

router.get("/me", async (req, res) => {
  res.json({ order: [], collapsed: {} });
});

router.put("/me", async (req, res) => {
  res.json(req.body);
});

export default router;