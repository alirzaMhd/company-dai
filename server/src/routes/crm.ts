import { Router } from "express";

const router = Router();

router.get("/accounts", async (req, res) => {
  res.json({ accounts: [] });
});

router.post("/accounts", async (req, res) => {
  res.json(req.body);
});

router.get("/accounts/:id/contacts", async (req, res) => {
  res.json({ contacts: [] });
});

router.post("/accounts/:id/contacts", async (req, res) => {
  res.json(req.body);
});

export default router;