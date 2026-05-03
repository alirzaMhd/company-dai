import { existsSync } from "fs";
import { resolve } from "path";

export type DeploymentMode = "local_trusted" | "authenticated";

export interface Config {
  deploymentMode: DeploymentMode;
  host: string;
  port: number;
  authSecret: string;
  databaseUrl: string;
  storageProvider: "local_disk" | "s3";
  storageLocalDiskBaseDir: string;
  storageS3Bucket: string;
  storageS3Region: string;
  storageS3Endpoint?: string;
  storageS3Prefix?: string;
  storageS3ForcePathStyle?: boolean;
}

function getDeploymentMode(): DeploymentMode {
  const mode = process.env.COMPANY_DAI_DEPLOYMENT_MODE;
  if (mode === "local_trusted" || mode === "authenticated") {
    return mode;
  }
  if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "development") {
    return "authenticated";
  }
  return "local_trusted";
}

function isLocalDevelopment(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.VERCEL !== "1";
}

function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  if (isLocalDevelopment()) {
    const envPath = resolve(process.cwd(), ".env");
    const customPaperclipEnv = "/content/custom-paperclip/.env";

    if (existsSync(envPath)) {
      try {
        const envContent = require("fs").readFileSync(envPath, "utf-8");
        const dbMatch = envContent.match(/DATABASE_URL=(.+)/);
        if (dbMatch) {
          return dbMatch[1].trim();
        }
      } catch {}
    }

    if (existsSync(customPaperclipEnv)) {
      try {
        const envContent = require("fs").readFileSync(customPaperclipEnv, "utf-8");
        const dbMatch = envContent.match(/DATABASE_URL=(.+)/);
        if (dbMatch) {
          return dbMatch[1].trim();
        }
      } catch {}
    }
  }

  return "postgres://localhost:5432/company_dai";
}

export const config: Config = {
  deploymentMode: getDeploymentMode(),
  host: process.env.COMPANY_DAI_HOST || "localhost:3001",
  port: parseInt(process.env.PORT || "3001", 10),
  authSecret: process.env.COMPANY_DAI_AUTH_SECRET || "development-secret-change-in-production",
  databaseUrl: getDatabaseUrl(),
  storageProvider: (process.env.STORAGE_PROVIDER as "local_disk" | "s3") || "local_disk",
  storageLocalDiskBaseDir: process.env.STORAGE_LOCAL_DISK_BASE_DIR || resolve(process.cwd(), "storage"),
  storageS3Bucket: process.env.STORAGE_S3_BUCKET || "",
  storageS3Region: process.env.STORAGE_S3_REGION || "us-east-1",
  storageS3Endpoint: process.env.STORAGE_S3_ENDPOINT,
  storageS3Prefix: process.env.STORAGE_S3_PREFIX,
  storageS3ForcePathStyle: process.env.STORAGE_S3_FORCE_PATH_STYLE === "true",
};

export function isLocalTrusted(): boolean {
  return config.deploymentMode === "local_trusted";
}

export function isAuthenticated(): boolean {
  return config.deploymentMode === "authenticated";
}