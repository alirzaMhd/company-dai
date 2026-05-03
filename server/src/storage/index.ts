import { config } from "../config.js";
import { createStorageProviderFromConfig } from "./provider-registry.js";
import { createStorageService } from "./service.js";
import type { StorageService } from "./types.js";

let cachedStorageService: StorageService | null = null;
let cachedSignature: string | null = null;

function signatureForConfig(cfg: typeof config): string {
  return JSON.stringify({
    provider: cfg.storageProvider,
    localDisk: cfg.storageLocalDiskBaseDir,
    s3Bucket: cfg.storageS3Bucket,
    s3Region: cfg.storageS3Region,
    s3Endpoint: cfg.storageS3Endpoint,
    s3Prefix: cfg.storageS3Prefix,
    s3ForcePathStyle: cfg.storageS3ForcePathStyle,
  });
}

export function createStorageServiceFromConfig(cfg: typeof config): StorageService {
  return createStorageService(createStorageProviderFromConfig(cfg));
}

export function getStorageService(): StorageService {
  const cfg = config;
  const signature = signatureForConfig(cfg);
  if (!cachedStorageService || cachedSignature !== signature) {
    cachedStorageService = createStorageServiceFromConfig(cfg);
    cachedSignature = signature;
  }
  return cachedStorageService;
}

export type { StorageService, PutFileResult } from "./types.js";