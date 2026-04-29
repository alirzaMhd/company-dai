import { Router } from "express";

const router = Router();

router.get("/", async (req, res) => {
  res.json({ plugins: [] });
});

router.get("/:pluginId/static/*", async (req, res) => {
  res.send("");
});

export default router;