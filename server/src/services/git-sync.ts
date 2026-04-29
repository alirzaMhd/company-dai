import { simpleGit, type SimpleGit } from "simple-git";
import fs from "node:fs";
import fsPath from "node:path";
import { logger } from "../middleware/logger.js";

const DEBOUNCE_MS = 5000;

interface GitSyncConfig {
  cwd: string;
  watchPath: string;
  remote?: string;
  branch?: string;
  authToken?: string;
  gitUserName?: string;
  gitUserEmail?: string;
}

let watcher: fs.FSWatcher | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let pendingSync = false;
let git: SimpleGit | null = null;
let syncConfig: GitSyncConfig | null = null;

function getGit(cwd?: string): SimpleGit | null {
  if (git) return git;
  try {
    const gitInstance = simpleGit(cwd);
    gitInstance.silent(true);
    git = gitInstance;
    return git;
  } catch {
    return null;
  }
}

async function findGitRoot(startPath: string): Promise<string | null> {
  let current = startPath;
  const root = fsPath.parse(process.cwd()).root;
  while (current !== root) {
    const gitPath = fsPath.join(current, ".git");
    if (fs.existsSync(gitPath)) {
      return current;
    }
    current = fsPath.dirname(current);
  }
  return null;
}

async function detectRemote(gitInstance: SimpleGit, cwd: string): Promise<string | null> {
  try {
    const remotes = await gitInstance.getRemotes(true);
    const origin = remotes.find((r) => r.name === "origin");
    if (origin?.refs.fetch) return "origin";
    if (remotes.length > 0) return remotes[0].name;
    return null;
  } catch {
    return null;
  }
}

async function detectBranch(gitInstance: SimpleGit, cwd: string): Promise<string> {
  try {
    const currentBranch = await gitInstance.branch();
    if (currentBranch.current) return currentBranch.current;
  } catch {
    // fall through
  }
  for (const branch of ["main", "master"]) {
    try {
      await gitInstance.branch(["--verify", branch]);
      return branch;
    } catch {
      // not found, continue
    }
  }
  return "main";
}

async function pullWithRebase(gitInstance: SimpleGit, remote: string, branch: string): Promise<boolean> {
  try {
    await gitInstance.pull(remote, branch, ["--rebase"]);
    return true;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn({ err: msg }, "[git-sync] pull --rebase failed, retrying with merge");
    try {
      await gitInstance.pull(remote, branch);
      return true;
    } catch (pullErr: unknown) {
      const pullMsg = pullErr instanceof Error ? pullErr.message : String(pullErr);
      logger.warn({ err: pullMsg }, "[git-sync] pull failed");
      return false;
    }
  }
}

async function syncCompanyData(): Promise<void> {
  if (pendingSync) return;
  pendingSync = true;

  if (!syncConfig) {
    logger.warn("[git-sync] not configured, skipping sync");
    pendingSync = false;
    return;
  }

  const instance = getGit(syncConfig.cwd);
  if (!instance) {
    logger.warn("[git-sync] simple-git not available, skipping sync");
    pendingSync = false;
    return;
  }

  try {
    const cwd = syncConfig.cwd;

    const remote = syncConfig.remote ?? (await detectRemote(instance, cwd));
    if (!remote) {
      logger.warn("[git-sync] no remote configured, skipping sync");
      pendingSync = false;
      return;
    }

    const branch = syncConfig.branch ?? (await detectBranch(instance, cwd));

    if (syncConfig.authToken) {
      try {
        instance.addConfig("credential.helper", "store");
      } catch {
        // continue without credential helper
      }
    }

    const status = await instance.status();
    const companyDataChanged = status.files.filter((f) => f.path.startsWith("company_data/"));
    if (companyDataChanged.length > 0) {
      await instance.raw(["add", "-A", "company_data/"]);
      const stagedOutput = await instance.diff(["--cached", "--name-only"]);
      const stagedFiles = stagedOutput.split("\n").filter(Boolean);
      const nonCompanyData = stagedFiles.filter((f) => !f.startsWith("company_data/"));
      if (nonCompanyData.length > 0) {
        await instance.raw(["reset", "HEAD", "--", ...nonCompanyData]);
        logger.warn({ nonCompanyData }, "[git-sync] reset non-company_data staged files");
      }
      if (stagedFiles.filter((f) => f.startsWith("company_data/")).length > 0) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const commitMessage = `auto-sync: ${stagedFiles.length} file(s) changed (${timestamp})`;
        await instance.commit(commitMessage);
        logger.info({ files: stagedFiles, commitMessage }, "[git-sync] committed company_data changes");
      } else {
        logger.info("[git-sync] no company_data changes to commit");
      }
    } else {
      logger.info("[git-sync] no company_data changes to commit");
    }

    const pullOk = await pullWithRebase(instance, remote, branch);
    if (!pullOk) {
      logger.warn("[git-sync] pull failed, proceeding with push");
    }

    try {
      await instance.push(remote, branch, ["--force-with-lease"]);
      logger.info("[git-sync] pushed company_data to remote");
    } catch (pushErr: unknown) {
      const msg = pushErr instanceof Error ? pushErr.message : String(pushErr);
      logger.error({ err: pushErr }, `[git-sync] push failed: ${msg}`);
      try {
        await instance.push(remote, branch, ["--force"]);
        logger.info("[git-sync] pushed company_data to remote (force)");
      } catch (forceErr: unknown) {
        const fmsg = forceErr instanceof Error ? forceErr.message : String(forceErr);
        logger.error({ err: forceErr }, `[git-sync] force push failed: ${fmsg}`);
      }
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error({ err }, `[git-sync] sync failed: ${msg}`);
  } finally {
    pendingSync = false;
  }
}

function scheduleSync(): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(syncCompanyData, DEBOUNCE_MS);
}

export async function initCompanyDataGitSync(): Promise<void> {
  const enabled = process.env.PAPERCLIP_COMPANY_DATA_GIT_SYNC === "true";
  if (!enabled) {
    logger.info("[git-sync] disabled via PAPERCLIP_COMPANY_DATA_GIT_SYNC");
    return;
  }

  const homePath = process.env.PAPERCLIP_HOME ?? "/content/custom-paperclip/company_data";
  const absPath = fsPath.isAbsolute(homePath) ? homePath : fsPath.resolve(process.cwd(), homePath);

  if (!fs.existsSync(absPath)) {
    logger.warn(`[git-sync] disabled — company_data path does not exist: ${absPath}`);
    return;
  }

  const gitRoot = await findGitRoot(absPath);
  if (!gitRoot) {
    logger.warn("[git-sync] disabled — no git repository found in ancestor paths");
    return;
  }

  const gitInstance = getGit(gitRoot);
  if (!gitInstance) {
    logger.warn("[git-sync] disabled — simple-git unavailable");
    return;
  }

  const gitUserName = process.env.GIT_SYNC_USER_NAME;
  const gitUserEmail = process.env.GIT_SYNC_USER_EMAIL;

  if (gitUserName || gitUserEmail) {
    try {
      if (gitUserName) {
        await gitInstance.addConfig("user.name", gitUserName);
      }
      if (gitUserEmail) {
        await gitInstance.addConfig("user.email", gitUserEmail);
      }
      logger.info({ gitUserName, gitUserEmail }, "[git-sync] configured git user");
    } catch (err) {
      logger.warn({ err }, "[git-sync] failed to set git user config");
    }
  }

  const remote = await detectRemote(gitInstance, gitRoot);
  const branch = await detectBranch(gitInstance, gitRoot);
  const authToken = process.env.GIT_SYNC_AUTH_TOKEN ?? undefined;

  syncConfig = {
    cwd: gitRoot,
    watchPath: absPath,
    remote: remote ?? undefined,
    branch,
    authToken,
    gitUserName,
    gitUserEmail,
  };

  logger.info({ gitRoot, watchPath: absPath, remote, branch }, "[git-sync] configured");

  watcher = fs.watch(absPath, { recursive: true }, (eventType, filename) => {
    if (!filename) return;
    if (filename.includes(".git")) return;
    if (fsPath.isAbsolute(filename) && filename.includes(".git")) return;
    scheduleSync();
  });

  logger.info({ path: absPath }, "[git-sync] enabled — watching company_data for changes");

  await syncCompanyData();
}

export async function stopCompanyDataGitSync(): Promise<void> {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  if (watcher) {
    watcher.close();
    watcher = null;
  }
  logger.info("[git-sync] stopped");
}