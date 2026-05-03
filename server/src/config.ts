export type DeploymentMode = "local_trusted" | "authenticated";

export interface Config {
  deploymentMode: DeploymentMode;
  host: string;
  port: number;
  authSecret: string;
  databaseUrl: string;
}

function getDeploymentMode(): DeploymentMode {
  const mode = process.env.COMPANY_DAI_DEPLOYMENT_MODE;
  if (mode === "local_trusted" || mode === "authenticated") {
    return mode;
  }
  if (process.env.NODE_ENV === "production") {
    return "authenticated";
  }
  return "local_trusted";
}

export const config: Config = {
  deploymentMode: getDeploymentMode(),
  host: process.env.COMPANY_DAI_HOST || "localhost:3001",
  port: parseInt(process.env.PORT || "3001", 10),
  authSecret: process.env.COMPANY_DAI_AUTH_SECRET || "development-secret-change-in-production",
  databaseUrl: process.env.DATABASE_URL || "postgres://localhost:5432/company_dai",
};

export function isLocalTrusted(): boolean {
  return config.deploymentMode === "local_trusted";
}

export function isAuthenticated(): boolean {
  return config.deploymentMode === "authenticated";
}