import { Router } from "express";

const router = Router();

router.get("/", async (req, res) => {
  res.json({ authorized: true });
});

export default router;