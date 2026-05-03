# Adapter Modernization Plan

Copy files and implementations from `/content/custom-paperclip` to `/content/company-dai`.

---

## Phase 1: Core Infrastructure

### Step 1.1: Create Adapter Plugin Store
**Action**: Copy from custom-paperclip
**Source**: `server/src/services/adapter-plugin-store.ts`
**Destination**: `server/src/services/adapter-plugin-store.ts`

Copy the entire file. This provides:
- JSON-file-backed store at `~/.paperclip/adapter-plugins.json`
- Functions: `listAdapterPlugins`, `addAdapterPlugin`, `removeAdapterPlugin`, `getAdapterPluginByType`
- Settings: `getDisabledAdapterTypes`, `setAdapterDisabled`

### Step 1.2: Create Builtin Adapter Types
**Action**: Copy from custom-paperclip
**Source**: `server/src/adapters/builtin-adapter-types.ts`
**Destination**: `server/src/adapters/builtin-adapter-types.ts`

Copy the entire file. This defines protected builtin types:
```typescript
export const BUILTIN_ADAPTER_TYPES = new Set([
  "claude_local",
  "codex_local",
  "cursor",
  "gemini_local",
  "openclaw_gateway",
  "opencode_local",
  "opencode_remote",
  "pi_local",
  "hermes_local",
  "process",
  "http",
]);
```

### Step 1.3: Create Plugin Loader
**Action**: Copy from custom-paperclip
**Source**: `server/src/adapters/plugin-loader.ts`
**Destination**: `server/src/adapters/plugin-loader.ts`

Copy the entire file. This provides:
- `loadExternalAdapterPackage(packageName, localPath?)` - Load adapter from npm or local path
- `reloadExternalAdapter(type)` - Runtime reload with ESM cache busting
- `buildExternalAdapters()` - Load all external adapters from plugin store
- UI parser extraction from `./ui-parser` export

---

## Phase 2: Registry Enhancement

### Step 2.1: Upgrade Adapter Registry
**Action**: Replace with custom-paperclip version
**Source**: `server/src/adapters/registry.ts`
**Destination**: `server/src/adapters/registry.ts`

Replace the entire file. This provides:
- External adapter loading at startup via `buildExternalAdapters()`
- `findActiveServerAdapter(type)` - returns builtin fallback if override paused
- Builtin fallbacks map for override functionality
- `registerServerAdapter(adapter)` with builtin fallback preservation
- `unregisterServerAdapter(type)` with fallback restoration
- Override pause/resume: `setOverridePaused(type, paused)`, `isOverridePaused(type)`
- Disabled adapter tracking via adapter-plugin-store
- New exports: `waitForExternalAdapters()`, `findActiveServerAdapter()`, `setOverridePaused()`, `getPausedOverrides()`

---

## Phase 3: API Routes

### Step 3.1: Complete Adapter Routes Implementation
**Action**: Replace with custom-paperclip version
**Source**: `server/src/routes/adapters.ts`
**Destination**: `server/src/routes/adapters.ts`

Replace the entire file. This provides:

| Endpoint | Method | Description |
|----------|--------|-------------|
| GET | `/adapters` | List all adapters (builtin + external) with full metadata |
| POST | `/adapters/install` | Install external adapter (npm or local path) |
| DELETE | `/adapters/:type` | Uninstall external adapter |
| PATCH | `/adapters/:type` | Enable/disable adapter |
| PATCH | `/adapters/:type/override` | Pause/resume builtin override |
| POST | `/adapters/:type/reload` | Runtime reload external adapter |
| POST | `/adapters/:type/reinstall` | Reinstall npm adapter (pull latest) |
| GET | `/adapters/:type/config-schema` | Get adapter's UI config schema |
| GET | `/adapters/:type/ui-parser.js` | Get adapter's custom run-log parser |

---

## Phase 4: Shared Types

### Step 4.1: Check Adapter Type Constants
**Action**: Verify completeness
**Source**: `packages/shared/src/constants.ts`
**Destination**: `packages/shared/src/constants.ts`

Check that `AGENT_ADAPTER_TYPES` includes all builtin types from custom-paperclip:
- "process"
- "http"
- "claude_local"
- "codex_local"
- "gemini_local"
- "opencode_local"
- "opencode_remote"
- "pi_local"
- "cursor"
- "openrouter"
- "openclaw_gateway"
- Add "hermes_local" if missing

---

## Phase 5: UI Integration

### Step 5.1: Adapter Display Registry
**Action**: Copy from custom-paperclip if exists, or ensure completeness
**Source**: `ui/src/adapters/adapter-display-registry.ts`
**Destination**: `ui/src/adapters/adapter-display-registry.ts`

### Step 5.2: Adapter Capabilities Hook
**Action**: Copy from custom-paperclip if exists, or ensure completeness
**Source**: `ui/src/adapters/use-adapter-capabilities.ts`
**Destination**: `ui/src/adapters/use-adapter-capabilities.ts`

### Step 5.3: Disabled Adapters Hook
**Action**: Copy from custom-paperclip if exists, or ensure completeness
**Source**: `ui/src/adapters/use-disabled-adapters.ts`
**Destination**: `ui/src/adapters/use-disabled-adapters.ts`

---

## Summary of Files to Copy

| # | Source Path | Destination Path |
|---|-------------|------------------|
| 1 | `server/src/services/adapter-plugin-store.ts` | `server/src/services/adapter-plugin-store.ts` |
| 2 | `server/src/adapters/builtin-adapter-types.ts` | `server/src/adapters/builtin-adapter-types.ts` |
| 3 | `server/src/adapters/plugin-loader.ts` | `server/src/adapters/plugin-loader.ts` |
| 4 | `server/src/adapters/registry.ts` | `server/src/adapters/registry.ts` |
| 5 | `server/src/routes/adapters.ts` | `server/src/routes/adapters.ts` |
| 6 | `ui/src/adapters/adapter-display-registry.ts` | `ui/src/adapters/adapter-display-registry.ts` |
| 7 | `ui/src/adapters/use-adapter-capabilities.ts` | `ui/src/adapters/use-adapter-capabilities.ts` |
| 8 | `ui/src/adapters/use-disabled-adapters.ts` | `ui/src/adapters/use-disabled-adapters.ts` |