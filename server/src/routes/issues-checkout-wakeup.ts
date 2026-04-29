import { Router } from "express";

const router = Router();

router.post("/wakeup", async (req, res) => {
  res.json({ woken: [] });
});

export default router;