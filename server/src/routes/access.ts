import { Router } from "express";

const router = Router();

router.get("/summary", async (req, res) => {
  res.json({
    currentUserRole: null,
    canManageMembers: false,
    canInviteUsers: false,
    canApproveJoinRequests: false,
  });
});

router.get("/companies/:companyId/members", async (req, res) => {
  res.json({ members: [], nextOffset: null });
});

router.get("/companies/:companyId/invites", async (req, res) => {
  res.json({ invites: [], nextOffset: null });
});

router.get("/companies/:companyId/join-requests", async (req, res) => {
  res.json({ requests: [] });
});

router.get("/user/:userId/access", async (req, res) => {
  res.json({ user: null, companyAccess: [] });
});

router.post("/invites/:token/accept", async (req, res) => {
  res.json({ ok: true });
});

export default router;