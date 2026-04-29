import { Router } from "express";

const router = Router();

router.get("/", async (req, res) => {
  res.json({ status: "ok" });
});

router.get("/ready", async (req, res) => {
  res.json({ ready: true });
});

export default router;