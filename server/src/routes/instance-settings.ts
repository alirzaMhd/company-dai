import { Router } from "express";

const router = Router();

router.get("/", async (req, res) => {
  res.json({ settings: {} });
});

router.get("/general", async (req, res) => {
  res.json({
    censorUsernameInLogs: false,
    keyboardShortcuts: false,
    feedbackDataSharingPreference: "DISALLOWED",
    backupRetention: 30,
  });
});

router.get("/experimental", async (req, res) => {
  res.json({
    enableIsolatedWorkspaces: false,
    autoRestartDevServerWhenIdle: false,
  });
});

router.patch("/general", async (req, res) => {
  res.json(req.body);
});

router.patch("/experimental", async (req, res) => {
  res.json(req.body);
});

export default router;