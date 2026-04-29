import { Router } from "express";

const router = Router();

router.get("/", async (req, res) => {
  res.json({ dismissals: [] });
});

router.post("/", async (req, res) => {
  res.json({ itemKey: req.body.itemKey });
});

router.delete("/:itemKey", async (req, res) => {
  res.json({ ok: true });
});

export default router;