import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { toNodeHandler } from "better-auth/node";
import { db } from "../lib/db.js";
import { config } from "../config.js";
import {
  authUsers,
  authSessions,
  authAccounts,
  authVerifications,
} from "@company-dai/db/schema";

const baseUrl = process.env.BETTER_AUTH_URL || `http://${config.host}`;

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: authUsers,
      session: authSessions,
      account: authAccounts,
      verification: authVerifications,
    },
  }),
  baseURL: baseUrl,
  secret: config.authSecret,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  trustedOrigins: [
    baseUrl,
    `http://localhost:${config.port}`,
    `https://localhost:${config.port}`,
    "https://*.trycloudflare.com",
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
});

export const authHandler = toNodeHandler(auth);

export type Auth = typeof auth;