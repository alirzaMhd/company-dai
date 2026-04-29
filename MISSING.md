# Comprehensive Comparison: custom-paperclip vs company-dai

This document lists all capabilities, routes, packages, services, and features in `/content/custom-paperclip` that are NOT implemented in `/content/company-dai`.

---

## 1. API ROUTES MISSING IN COMPANY-DAI

### Auth Routes (Different Structure)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/auth/get-session` | Get current session (different from company-dai's `/session`) |
| GET | `/api/auth/profile` | Get user profile |
| PATCH | `/api/auth/profile` | Update user profile |

### Company Routes
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/companies/stats` | Company statistics |
| GET | `/api/companies/:companyId/feedback-traces` | List feedback traces |
| PATCH | `/api/companies/:companyId/branding` | Update company branding |
| POST | `/api/companies/:companyId/archive` | Archive company |
| GET | `/api/companies/:companyId/agent-api-keys` | List agent API keys |
| POST | `/api/companies/:companyId/agent-api-keys` | Create agent API key |
| DELETE | `/api/companies/:companyId/agent-api-keys/:keyId` | Revoke API key |
| POST | `/api/companies/import/preview` | Preview import (global) |
| POST | `/api/companies/import` | Import company (global) |
| POST | `/api/companies/:companyId/exports/preview` | Preview export |
| POST | `/api/companies/:companyId/exports` | Export bundle |
| POST | `/api/companies/:companyId/imports/preview` | Preview import (safe mode) |
| POST | `/api/companies/:companyId/imports/apply` | Apply import (safe mode) |

### Agent Routes
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/agents/me` | Get current agent details |
| GET | `/api/agents/me/inbox-lite` | Agent inbox (lite) |
| GET | `/api/agents/me/inbox/mine` | My inbox items |
| GET | `/api/agents/:id/configuration` | Get agent configuration |
| GET | `/api/agents/:id/config-revisions` | List config revisions |
| GET | `/api/agents/:id/config-revisions/:revId` | Get config revision |
| POST | `/api/agents/:id/config-revisions/:revId/rollback` | Rollback config |
| GET | `/api/agents/:id/runtime-state` | Get runtime state |
| GET | `/api/agents/:id/task-sessions` | List task sessions |
| POST | `/api/agents/:id/runtime-state/reset-session` | Reset session |
| POST | `/api/companies/:companyId/agent-hires` | Hire agent (with approval) |
| GET | `/api/companies/:companyId/org` | Get org chart (JSON) |
| GET | `/api/companies/:companyId/org.svg` | Get org chart SVG |
| GET | `/api/companies/:companyId/org.png` | Get org chart PNG |
| GET | `/api/companies/:companyId/agent-configurations` | Get agent configs (redacted) |
| GET | `/api/instance/scheduler-heartbeats` | Scheduler heartbeats |
| GET | `/api/companies/:companyId/adapters/:type/models` | Get adapter models |
| GET | `/api/companies/:companyId/adapters/:type/detect-model` | Detect adapter model |
| POST | `/api/companies/:companyId/adapters/:type/test-environment` | Test adapter environment |

### Plugin Routes (Advanced Features Missing)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/plugins/examples` | List example plugins |
| GET | `/api/plugins/tools` | List plugin tools |
| POST | `/api/plugins/tools/execute` | Execute plugin tool |
| POST | `/api/plugins/:pluginId/bridge/data` | Bridge getData proxy |
| POST | `/api/plugins/:pluginId/bridge/action` | Bridge performAction proxy |
| POST | `/api/plugins/:pluginId/data/:key` | Bridge getData (URL key) |
| POST | `/api/plugins/:pluginId/actions/:key` | Bridge performAction (URL key) |
| GET | `/api/plugins/:pluginId/bridge/stream/:channel` | SSE stream from worker |
| ALL | `/api/plugins/:pluginId/api/*` | Scoped API routes |
| GET | `/api/plugins/:pluginId/jobs` | List plugin jobs |
| GET | `/api/plugins/:pluginId/jobs/:jobId/runs` | List job runs |
| POST | `/api/plugins/:pluginId/jobs/:jobId/trigger` | Trigger job |
| POST | `/api/plugins/:pluginId/webhooks/:endpointKey` | Webhook ingestion |
| GET | `/api/plugins/:pluginId/config` | Get plugin config |
| POST | `/api/plugins/:pluginId/config` | Save plugin config |
| POST | `/api/plugins/:pluginId/config/test` | Test plugin config |

---

## 2. PACKAGES MISSING IN COMPANY-DAI

| Package | Description |
|---------|-------------|
| `packages/mcp-server/` | MCP server package for Model Context Protocol |
| `packages/plugins/sdk/` | Plugin SDK for developing plugins |
| `packages/plugins/examples/*` | Example plugins (hello-world, file-browser, kitchen-sink, orchestration-smoke) |

---

## 3. SKILLS MISSING IN COMPANY-DAI

| Skill | Description |
|-------|-------------|
| `skills/paperclip-create-plugin/` | Skill for creating plugins |
| `skills/para-memory-files/` | Para memory files skill |
| `.claude/skills/design-guide/` | Design guide skill |

---

## 4. ADAPTERS MISSING IN COMPANY-DAI

| Adapter | Description |
|---------|-------------|
| `openrouter` | OpenRouter adapter (supports multiple LLM providers) |

---

## 5. SERVICES MISSING IN COMPANY-DAI

| Service | Description |
|---------|-------------|
| `git-sync.ts` | Git synchronization service |
| `cron.ts` | Cron job service for scheduling |
| `board-auth.ts` | Board authentication service |
| `issue-approval.ts` | Issue-specific approval workflow |
| `issue-execution-policy.ts` | Issue execution policy service |
| `feedback.ts` | Feedback traces and voting system |
| `plugin-lifecycle.ts` | Plugin lifecycle management |
| `plugin-loader.ts` | Plugin loader with dynamic imports |
| `plugin-registry.ts` | Plugin registry service |
| `plugin-tool-dispatcher.ts` | Plugin tool dispatcher |
| `plugin-job-scheduler.ts` | Plugin job scheduler |
| `plugin-job-store.ts` | Plugin job persistence |
| `plugin-worker-manager.ts` | Plugin worker manager |
| `plugin-stream-bus.ts` | Plugin SSE stream bus |
| `plugin-config-validator.ts` | Plugin config validation |

---

## 6. DATABASE TABLES MISSING (Inferred)

Based on the routes and services, these tables are likely missing:

| Table | Description |
|-------|-------------|
| `agent_api_keys` | Agent API keys for external services (OpenRouter, etc.) |
| `feedback_traces` | Feedback traces from agent interactions |
| `plugin_logs` | Plugin execution logs |
| `plugin_webhook_deliveries` | Webhook delivery tracking |

---

## 7. UI PAGES/FEATURES MISSING

| Feature | Description |
|---------|-------------|
| Agent config revisions UI | View/rollback agent configuration revisions |
| Company branding editor | Update company logo, colors, etc. |
| Feedback traces viewer | View user/agent feedback |
| Plugin bridge UI | Plugin data/actions via bridge |
| Plugin tools browser | Browse/execute plugin tools |
| Plugin scoped API docs | Documentation for plugin APIs |
| Org chart SVG/PNG export | Export org chart as image |
| Scheduler heartbeat management | Manage agent heartbeat schedules |
| Agent runtime state viewer | View agent runtime state |
| Task sessions viewer | View agent task sessions |

---

## 8. SUMMARY STATISTICS

| Category | custom-paperclip | company-dai | Missing in company-dai |
|----------|------------------|-------------|----------------------|
| API Routes | ~180+ | ~180+ | ~30+ unique routes |
| Packages | 6 | 5 | 1 (mcp-server) + plugin SDK |
| Skills | 5+ | 1-2 | 3+ skills |
| Adapters | 9+ | 9 | 1 (openrouter) |
| Services | 50+ | 50+ | ~15 unique services |
| Plugin Features | Full (bridge, tools, jobs, webhooks) | Basic | Most advanced features |

---

## 9. KEY ARCHITECTURAL DIFFERENCES

### Plugin System (Major Gap)
- **custom-paperclip**: Full plugin system with worker isolation, bridge proxy, tool dispatch, job scheduling, webhook ingestion, scoped API routes, SSE streams
- **company-dai**: Basic plugin CRUD only (install, enable/disable, health check)

### Agent Configuration Management
- **custom-paperclip**: Full config revision history with rollback capability
- **company-dai**: No config revision tracking

### Company Portability
- **custom-paperclip**: Multiple import/export modes (global, safe agent-mode, preview)
- **company-dai**: Basic export/import only

### Feedback System
- **custom-paperclip**: Complete feedback trace system with voting
- **company-dai**: No feedback system

### Adapter Features
- **custom-paperclip**: Model detection, adapter testing, OpenRouter support
- **company-dai**: Basic adapter management only

---

Generated from comprehensive codebase analysis on 2026-04-29.
