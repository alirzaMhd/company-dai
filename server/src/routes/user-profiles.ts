import { Router } from "express";

const router = Router();

router.get("/", async (req, res) => {
  res.json({ profiles: [] });
});

router.get("/:userId", async (req, res) => {
  res.json({ id: req.params.userId, name: null, email: null });
});

router.patch("/:userId", async (req, res) => {
  res.json(req.body);
});

export default router;