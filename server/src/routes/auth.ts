import { Router } from "express";
import { z } from "zod";
import { auth } from "../auth/better-auth.js";
import { authMiddleware, requireAuth } from "../middleware/auth.js";
import { isLocalTrusted } from "../config.js";
import { db } from "../lib/db.js";
import { authUsers } from "@company-dai/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.use(authMiddleware);

router.get("/get-session", async (req, res) => {
  if (isLocalTrusted()) {
    return res.json({
      user: {
        id: "local-board",
        name: "Local Admin",
        email: "admin@local.dev",
        image: null,
        emailVerified: true,
      },
      session: null,
    });
  }

  try {
    const session = await auth.api.getSession({
      headers: { cookie: req.headers.cookie || "" },
    });

    if (!session?.user) {
      return res.status(401).json({ user: null, session: null });
    }

    return res.json({
      user: session.user,
      session: session.session,
    });
  } catch (error) {
    console.error("Get session error:", error);
    return res.status(401).json({ user: null, session: null });
  }
});

const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post("/sign-in/email", async (req, res) => {
  if (isLocalTrusted()) {
    return res.json({
      user: {
        id: "local-board",
        name: "Local Admin",
        email: "admin@local.dev",
      },
    });
  }

  try {
    const data = SignInSchema.parse(req.body);

    const result = await auth.api.signIn.email(
      {
        email: data.email,
        password: data.password,
      },
      {
        headers: {
          cookie: req.headers.cookie || "",
        },
      }
    );

    return res.json(result);
  } catch (error: any) {
    console.error("Sign in error:", error);
    return res.status(400).json({
      error: error.message || "Sign in failed",
    });
  }
});

const SignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

router.post("/sign-up/email", async (req, res) => {
  if (isLocalTrusted()) {
    return res.json({
      user: {
        id: "local-board",
        name: "Local Admin",
        email: "admin@local.dev",
      },
    });
  }

  try {
    const data = SignUpSchema.parse(req.body);

    const result = await auth.api.signUp.email(
      {
        email: data.email,
        password: data.password,
        name: data.name,
      },
      {
        headers: {
          cookie: req.headers.cookie || "",
        },
      }
    );

    return res.json(result);
  } catch (error: any) {
    console.error("Sign up error:", error);
    return res.status(400).json({
      error: error.message || "Sign up failed",
    });
  }
});

router.post("/sign-out", async (req, res) => {
  if (isLocalTrusted()) {
    return res.json({ success: true });
  }

  try {
    await auth.api.signOut({
      headers: {
        cookie: req.headers.cookie || "",
      },
    });

    return res.json({ success: true });
  } catch (error: any) {
    console.error("Sign out error:", error);
    return res.status(400).json({
      error: error.message || "Sign out failed",
    });
  }
});

router.get("/profile", requireAuth, async (req, res) => {
  if (isLocalTrusted() || req.actor?.userId === "local-board") {
    return res.json({
      id: "local-board",
      name: "Local Admin",
      email: "admin@local.dev",
      image: null,
      emailVerified: true,
    });
  }

  if (!req.actor?.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const [user] = await db
      .select({
        id: authUsers.id,
        name: authUsers.name,
        email: authUsers.email,
        image: authUsers.image,
        emailVerified: authUsers.emailVerified,
      })
      .from(authUsers)
      .where(eq(authUsers.id, req.actor.userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(user);
  } catch (error: any) {
    console.error("Get profile error:", error);
    return res.status(500).json({ error: "Failed to get profile" });
  }
});

const UpdateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  image: z.string().url().optional().nullable(),
});

router.patch("/profile", requireAuth, async (req, res) => {
  if (isLocalTrusted() || req.actor?.userId === "local-board") {
    return res.json({
      id: "local-board",
      name: "Local Admin",
      email: "admin@local.dev",
      image: null,
      emailVerified: true,
    });
  }

  if (!req.actor?.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const data = UpdateProfileSchema.parse(req.body);

    const [updated] = await db
      .update(authUsers)
      .set({
        ...(data.name && { name: data.name }),
        ...(data.image !== undefined && { image: data.image }),
        updatedAt: new Date(),
      })
      .where(eq(authUsers.id, req.actor.userId))
      .returning({
        id: authUsers.id,
        name: authUsers.name,
        email: authUsers.email,
        image: authUsers.image,
        emailVerified: authUsers.emailVerified,
      });

    if (!updated) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(updated);
  } catch (error: any) {
    console.error("Update profile error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Failed to update profile" });
  }
});

router.get("/session", async (req, res) => {
  if (isLocalTrusted()) {
    return res.json({
      user: {
        id: "local-board",
        name: "Local Admin",
        email: "admin@local.dev",
      },
    });
  }

  try {
    const session = await auth.api.getSession({
      headers: { cookie: req.headers.cookie || "" },
    });

    if (!session?.user) {
      return res.status(401).json({ user: null });
    }

    return res.json({ user: session.user });
  } catch (error) {
    console.error("Session error:", error);
    return res.status(401).json({ user: null });
  }
});

export default router;