# Plan: Remaking company-dai into Paperclip

Date: 2026-04-28

## Overview

This document specifies the complete transformation of `company-dai` (an OpenCode Manager) into a Paperclip-style autonomous AI company control plane. The target is to replicate the full architecture, features, and concepts from `/content/custom-paperclip`.

## Source Concept: Paperclip

**Paperclip** is the control plane for AI-agent companies. It orchestrates a team of AI agents to run a business with:
- Company/goal hierarchy
- Org charts with agents reporting to each other
- Task/issue management with hierarchical parentage
- Heartbeat scheduling for agent wake-ups
- Budget/cost tracking per agent
- Board governance and approvals
- Multi-company isolation

## Current State

**company-dai** is a simple React Express app with:
- Basic UI pages: Agents, MCPServers, Skills, Plugins, Sessions, GitSync, Status
- JSON data files: agents.json, skills.json, projects.json, issues.json, etc.
- Simple permissions system for OpenCode agents
- No real company/organization concept

---

## Phase 1: Architecture & Infrastructure

### 1.1 Monorepo Structure

Create the Paperclip-style structure:

```
company-dai/
├── server/                    # Express REST API + services
│   ├── src/
│   │   ├── index.ts        # Main entry
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── __tests__/    # Tests
├── ui/                      # React + Vite UI
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # Shared components
│   │   └── App.tsx
├── packages/
│   ├── db/               # Drizzle schema + migrations
│   │   └── src/schema/
│   ├── shared/            # Shared types, constants
│   └── adapters/          # Agent adapters (OpenCode, Claude, etc.)
├── data/                  # (keep existing JSON data)
├── doc/                  # Documentation
└── skills/              # Paperclip skills
```

### 1.2 Package.json Updates

Update root `package.json` with pnpm workspaces:

```json
{
  "name": "company-dai",
  "private": true,
  "scripts": {
    "dev": "concurrently \"pnpm -F server dev\" \"pnpm -F ui dev\"",
    "build": "pnpm -r build",
    "typecheck": "pnpm -r typecheck",
    "test": "vitest",
    "db:generate": "pnpm -F db db:generate",
    "db:migrate": "pnpm -F db db:migrate"
  }
}
```

### 1.3 Dependencies

Migrate from npm to pnpm and add Paperclip dependencies:
- express, drizzle-orm, pg
- react, react-router-dom, @tanstack/react-query
- zod for validation
- vitest, @vitest/ui

---

## Phase 2: Database Schema (packages/db)

### 2.1 Core Tables

**All data stored in PostgreSQL - complete sync across devices**

```typescript
// ========== IDENTITY & AUTH ==========
// auth_users - human users
// auth_accounts - OAuth/credential accounts
// auth_sessions - active login sessions
// auth_verifications - email verification, password reset
// auth_credentials - password hashes

// companies - first-order entity with budget, status, branding
// company_memberships - user/agent membership in companies
// company_logos - company branding (stored in DB)

// agents - AI agents with org hierarchy (reportsTo), adapter config
// agent_config_revisions - agent configuration versioning
// agent_runtime_state - agent runtime state persistence
// agent_api_keys - agent API key authentication

// ========== WORKSPACE & FILES ==========
// projects - workspace containers
// project_workspaces - development environments
// execution_workspaces - runtime execution environments
// workspace_operations - workspace operations tracking
// workspace_runtime_services - runtime services per workspace
// environment_leases - environment lease/booking system
// environments - environment configurations
// file_contents - ALL file content stored in DB (not filesystem)
// file_versions - version history for all files
// file_metadata - path, size, mime type, etc.

// ========== TASKS & WORK ==========
// goals - hierarchical goal structure (company → team → agent)
// projects - workspace containers
// issues - tasks with parent/child hierarchy, status, priority
// issue_comments - threaded conversations
// issue_documents - issue-attached documents
// issue_labels, labels - labeling system
// issue_relations - issue relationships (blockers)
// issue_approvals - approval requests linked to issues
// issue_thread_interactions - questions, confirmations, suggestions
// issue_interaction_answers - human responses
// issue_interaction_results - final outcomes
// issue_work_products - external work products (PRs, commits)

// ========== EXECUTION ==========
// heartbeat_runs - agent execution history with events
// heartbeat_run_events - heartbeat run events/logs
// cost_events - token/cost tracking per agent
// budget_policies, budget_incidents - budget management

// ========== GOVERNANCE ==========
// approvals - board governance
// approval_comments - comments on approvals

// ========== OPERATIONS ==========
// activities_log - audit trail (all actions logged)
// activity_log - comprehensive activity

// ========== CONFIGURATION ==========
// instance_settings - instance-level configuration
// principal_permission_grants - fine-grained permissions
// routines - scheduled recurring tasks
// company_skills - company-specific skills
// secrets - encrypted secret storage

// ========== PLUGINS ==========
// plugins - plugin registry
// plugin_state, plugin_database - plugin data
// plugin_jobs, plugin_webhooks - plugin scheduled jobs/webhooks
// plugin_entities - plugin entity definitions
// plugin_logs - plugin logging
// plugin_company_settings - per-company plugin settings

// ========== USER FEATURES ==========
// assets - file/asset management
// inbox_dismissals - inbox notification dismissals
// issue_inbox_archives - issue inbox archiving
// join_requests - company join requests
// cli_auth_challenges - CLI authentication challenges
// user_sidebar_preferences - user preferences
// company_user_sidebar_preferences - company-level user preferences

// ========== AGENT SESSIONS ==========
// agent_sessions - multi-turn conversational sessions
// agent_instructions - managed instruction bundles
```

**File Storage Strategy:**
- ALL file content stored in PostgreSQL (bytea or TEXT)
- Version history for every file change
- Sync on login: download all changes since last login
- No local filesystem for project files
- Same account on any computer = exact same state

### 2.2 Migrations

Set up Drizzle migrations:
- `packages/db/src/schema/index.ts` - export all tables
- Migration generation workflow
- Seed data for initial company

---

## Phase 3: Server & API (server/)

### 3.1 Routes

Create REST endpoints per domain:

| Domain | Endpoints |
|--------|----------|
| companies | CRUD, memberships |
| agents | CRUD, org tree, heartbeat, skills/sync, instructions |
| goals | CRUD, hierarchy |
| projects | CRUD, workspaces |
| issues | CRUD, checkout, comments, documents, relations, labels, heartbeat-context |
| heartbeat | invoke, status, runs |
| costs | events, rollups |
| approvals | request, decide |
| auth | login, logout, sessions, register |
| routines | CRUD, triggers |
| company-skills | CRUD, sync |
| plugins | CRUD, enable, config, api routes |
| secrets | CRUD, inject |
| documents | upload, download, revisions |
| execution-workspaces | CRUD, operations |
| dashboard | metrics |
| activity | log, search, export |
| github | fetch, sync |
| mcp | tools, resources, prompts |
| assets | upload, download, library |
| inbox | notifications, dismissals |
| join-requests | submit, review, approve |
| cli-auth | challenges, verify |
| preferences | user, company |
| backups | create, restore, list |
| llms | config, pricing |
| events | realtime, sse |
| interactions | questions, confirmations, answers |
| transcripts | live, history |
| files | CRUD, content, versions, sync |

### 3.2 Services

Business logic services:
- CompaniesService
- AgentsService (org tree, heartbeat)
- IssuesService (checkout, status)
- GoalsService (hierarchy)
- CostsService (budgets, rollups)
- HeartbeatService (scheduling)
- ApprovalsService
- LiveEventsService (real-time streaming)
- InteractionsService (questions, confirmations)
- RoutinesService (scheduled tasks)
- FileService (file content, versions, sync)
- SyncService (login sync, delta sync)
- SessionService (session persistence)

### 3.3 Middleware

- Company access enforcement
- Auth (session + API keys)
- Activity logging
- File sync on login

### 3.4 File Sync Flow (Critical)

**On Login:**
1. Client sends `lastSyncTimestamp`
2. Server returns ALL changes since that timestamp
3. Client applies changes
4. Full state restored

**On File Change:**
1. Agent makes change
2. Save to DB immediately
3. Activity logged with timestamp
4. Other clients can poll/diff

---

## Phase 4: UI (ui/)

### 4.1 Styling

**Match custom-paperclip UI exactly**

Copy from `/content/custom-paperclip/ui/`:
- All UI components
- All styling (CSS, Tailwind)
- Layout structure
- Routes
- Page components

### 4.2 Pages

Create Paperclip-style pages (copy from Paperclip):

| Page | Description |
|------|------------|
| Dashboard | Company overview, metrics, agent activity |
| Companies | Company list/management |
| Org Chart | Visual agent hierarchy |
| Agents | Agent list, create, manage |
| Agent Detail | Agent config, runs, settings |
| Goals | Goal hierarchy view |
| Projects | Project management |
| Issues | Task board/list |
| Issue Detail | Task view, comments, runs |
| Approvals | Pending approvals |
| Costs | Budget tracking |
| Routines | Scheduled tasks |
| Settings | Instance settings |
| Settings → Adapters | Global adapter configuration |
| Settings → Agents | All agents management |
| Assets | Asset library |
| Inbox | Notifications |
| Join Requests | Join request queue |
| Preferences | User preferences |
| Backups | Database backups |
| LLMs | LLM configuration |
| Live | Real-time run view |

### 4.2 Components

Build reusable UI:
- AgentCard, GoalCard, IssueCard
- OrgChartTree
  - OrgChartPage (full page with pan/zoom)
  - OrgNodeCard (individual node)
  - OrgConnector (SVG lines)
  - OrgControls (zoom, fit)
- IssueBoard (kanban)
  - Drag-and-drop between columns
  - Swimlanes (by assignee, priority, project)
  - WIP limits per column
  - Quick filters
  - Quick search
  - Column customization
  - Card actions (assign, set priority, add label)
  - Bulk selection
  - Keyboard shortcuts
- CommentThread
- RunTranscript
- BudgetMeter
- ApprovalCard
- AssetCard, AssetUploader
- NotificationItem
- JoinRequestCard
- PreferenceToggle
- BackupCard
- LLMConfigCard

### 4.3 Routing

```
/                     → Dashboard
/companies            → Companies list
/companies/:id        → Company detail
/org                 → Org chart
/agents               → Agents list
/agents/:id           → Agent detail
/agents/:id/config    → Agent configuration
/goals               → Goals tree
/projects            → Projects
/projects/:id         → Project detail
/issues               → Issues list/board
/issues/:id           → Issue detail
/approvals           → Approvals
/costs               → Cost tracking
/routines            → Scheduled routines
/assets              → Asset library
/inbox               → User inbox
/join-requests      → Join requests queue
/preferences        → User preferences
/backups            → Database backups
/llms               → LLM configuration
/settings           → Settings (general)
/settings/adapters   → Adapter settings (global)
/settings/agents     → All agents management
/live               → Live run view
```

---

## Phase 5: Agent Adapters (packages/adapters)

### 5.1 Adapter Interface

Standard adapter contract:

```typescript
interface AgentAdapter {
  type: string;
  config: AgentConfig;
  execute(context: RunContext): Promise<RunResult>;
  detectModel?(): string;
  getCapabilities?(): string[];
}

interface AgentConfig {
  adapterType: string;           // "opencode-local", "claude-local", etc.
  command?: string;             // CLI command/path
  args?: string[];             // CLI arguments
  env?: Record<string, string>; // Environment variables
  model?: string;              // Model to use
  timeout?: number;            // Execution timeout
  maxRetries?: number;         // Retry count
}
```

### 5.2 Adapters

Only these 4 adapters:

| Adapter | Type | Source | Description |
|---------|------|--------|-------------|
| opencode-local | process | **New implementation** | Local OpenCode process |
| opencode-remote | websocket | **Use `/content/company-dai/colab-opencode-api`** | Colab remote via cloudflared |
| claude-local | process | **Use Paperclip's `/content/custom-paperclip/packages/adapters/claude-local`** | Claude Code CLI |
| gemini-local | process | **Use Paperclip's `/content/custom-paperclip/packages/adapters/gemini-local`** | Gemini CLI |

### 5.2.1 OpenCode Local

Implementation from scratch:
- Execute OpenCode CLI locally
- Session management
- Model detection via `--version`

### 5.2.2 OpenCode Remote

**Use existing code from `/content/company-dai/colab-opencode-api`:**
- Copy `server.py` to adapter
- WebSocket communication with Colab
- Path translation (local → Colab `/content`)
- Session fallback handling

**Colab Setup:**
1. Upload files to Colab
2. Run `run_colab.py`
3. Get tunnel URL (wss://xxx.trycloudflare.com)
4. Configure agent with URL

### 5.2.3 Claude Local

**Copy from Paperclip:** `/content/custom-paperclip/packages/adapters/claude-local/`
- Full implementation already exists
- Copy to this project

### 5.2.4 Gemini Local

**Copy from Paperclip:** `/content/custom-paperclip/packages/adapters/gemini-local/`
- Full implementation already exists
- Copy to this project

### 5.3 Global Adapter Settings

**Settings Page: `/settings` → Adapter Settings Tab**

```
Global Adapter Configuration:
├── OpenCode Settings
│   ├── Remote URL (default: "wss://api.opencode.com")
│   ├── API Key / Auth Token
│   ├── WebSocket Timeout
│   └── Apply to All Agents button
├── Claude CLI Settings
│   ├── CLI Path (auto-detect or custom)
│   ├── Default Model (claude-3-5-sonnet)
│   └── Apply to All Agents button
├── Codex CLI Settings
│   ├── CLI Path
│   └── Apply to All Agents button
└── [other adapters...]
```

**Features:**
- Change setting once, applies to ALL agents across ALL companies
- Per-agent overrides still work
- Export/import global settings
- Settings migration on change

### 5.4 Per-Agent Adapter Configuration

**Agent Page: `/agents/:id` → Configuration Tab**

```
Agent Adapter Settings:
├── Adapter Type: [dropdown]
│   ├── opencode-local
│   ├── opencode-remote
│   ├── claude-local
│   └── ...
├── Configuration (varies by type)
│   ├── Command/Path
│   ├── Arguments
│   ├── Environment Variables
│   └── Model (if applicable)
├── Advanced
│   ├── Timeout (ms)
│   ├── Max Retries
│   └── Custom env vars
└── [Override Global] checkbox
   - When checked, uses these values instead of global
```

### 5.5 Agent Management in Settings

**Settings Page: `/settings` → Agents Tab**

```
All Agents Management:
├── Filters
│   ├── Company dropdown
│   ├── Status (active, paused, terminated)
│   └── Search by name/key
├── Agent List Table
│   ├── Name
│   ├── Key
│   ├── Company
│   ├── Status
│   ├── Current Cost
│   ├── Last Run
│   └── Actions
├── Bulk Actions
│   ├── Pause Selected
│   ├── Resume Selected
│   ├── Update Adapter
│   └── Delete Selected
├── Create Agent button
└── Export/Import agents
```

**Features:**
- View all agents across all companies
- Filter by company, status
- Bulk pause/resume/update
- Agent health monitoring
- Cost tracking per agent
- Create new agent inline

### 5.6 Adapter Configuration

UI for configuring adapters per agent type with env injection.

### 5.7 Adapter Plugins

Support plugin-based adapters:
- External adapter discovery
- Adapter configuration UI
- Runtime adapter loading

---

## Phase 6: Heartbeat & Scheduling

### 6.1 Heartbeat System

Implement scheduled agent wake-ups:
- Cron-style scheduling per agent
- Manual trigger API
- Run status tracking

### 6.2 Run Context

Pass to agents:
- Current task context
- Goal ancestry
- Project env
- Session persistence

---

## Phase 7: Budget & Costs

### 7.1 Cost Events

Track per agent:
- Provider (OpenAI, Anthropic, etc.)
- Model used
- Input/output tokens
- Cost in cents

### 7.2 Budget Enforcement

- Monthly budget per agent
- Soft alerts at 80%
- Hard stop at 100%

---

## Phase 8: Governance

### 8.1 Approvals

Approval types:
- hire_agent: New agent hire
- approve_ceo_strategy: Strategy proposals

### 8.2 Board Actions

- Pause/resume agents
- Override task assignment
- Terminate agents
- Force-complete tasks

---

## Phase 9: Execution Workspaces

### 9.1 Execution Workspace System

Implement isolated runtime environments for agent execution:

```
packages/execution-workspace/
├── src/
│   ├── index.ts           # Entry point
│   ├── workspace-runtime.ts  # Runtime service supervisor
│   ├── operations.ts     # File ops, port management
│   └── types.ts         # Workspace types
```

Key features:
- Isolated execution environments per workspace
- Service supervisor management
- File operations and port management
- Environment leasing/locking
- Runtime persistence

---

## Phase 10: Plugins (packages/plugins)

### 10.1 Plugin System

Add comprehensive plugin framework:

```
packages/plugins/
├── sdk/
│   ├── src/
│   │   ├── define-plugin.ts    # Plugin definition
│   │   ├── context.ts        # Context API
│   │   ├── capabilities.ts  # Capability system
│   │   ├── types.ts         # Plugin types
│   └── ui/
│       ├── slots.tsx       # UI slot system
│       ├── launchers.ts     # Action launchers
│       └── hooks.ts         # Plugin hooks
```

**Plugin Definition**:
```typescript
interface Plugin {
  key: string;
  name: string;
  version: string;
  capabilities: string[];
  setup(ctx: PluginContext): Promise<void>;
  onHealth?: () => Promise<void>;
  onConfigChanged?: (config: any) => void;
  onShutdown?: () => Promise<void>;
  onValidateConfig?: (config: any) => ValidationResult;
}
```

**Lifecycle Hooks**:
- `setup`: Plugin initialization
- `onHealth`: Health check
- `onConfigChanged`: Config update handler
- `onShutdown`: Cleanup on disable
- `onValidateConfig`: Config validation

**Context APIs**:
- `events`: Subscribe/emit domain events
- `jobs`: Register scheduled jobs
- `data`: Register data providers
- `actions`: Register actions
- `tools`: Register tools
- `streams`: Real-time streaming (SSE)
- `http`: Outbound HTTP
- `secrets`: Secret access
- `state`: Plugin state storage
- `entities`: CRUD on domain entities
- `agents`: Invoke agents, manage sessions

**UI Integration**:

Slots:
- `page`, `sidebar`, `sidebarPanel`, `settingsPage`
- `dashboardWidget`, `detailTab`, `taskDetailView`
- `toolbarButton`, `commentAnnotation`

Launchers:
- `navigate`, `openModal`, `openDrawer`

### 10.2 Plugin Database Namespaces

Plugins can have their own PostgreSQL namespace:
- Migration support per plugin
- Isolated data storage
- Schema management

### 10.3 Scoped API Routes

Custom API routes under `/api/plugins/:pluginId/api/*`

---

## Phase 11: Skills System

### 11.1 Company Skills

```
packages/company-skills/
├── src/
│   ├── registry.ts       # Skill registry
│   ├── sync.ts         # Skill sync to agents
│   └── types.ts        # Skill types
```

```
skills/
├── paperclip/          # Core Paperclip skill
├── para-memory-files/  # Memory skill
└── ...
```

Skill structure:
- `key`: Unique identifier
- `slug`: URL-friendly slug
- `name`: Display name
- `description`: What the skill does
- `markdown`: Skill instructions
- `sourceType`: local_path | git | npm
- `trustLevel`: markdown_only | full_access
- `fileInventory`: Asset tracking

Skill sync: `POST /api/agents/:id/skills/sync`

### 11.2 Agent Instructions

Managed instructions bundle system for agents:
- Instruction versions
- Instruction templates
- Runtime instruction injection

---

## Phase 12: Company Portability

### 12.1 Import/Export System

Full company data export/import:
- Company entity
- Goals hierarchy
- Projects
- Issues with history
- Agents configuration
- Settings

Export format:
```typescript
interface CompanyExport {
  version: string;
  exportedAt: Date;
  company: Company;
  goals: Goal[];
  projects: Project[];
  issues: Issue[];
  agents: Agent[];
  settings: Settings;
}
```

### 12.2 Data Redaction

Support for redacting sensitive data on export:
- Mask API keys
- Redact secrets
- Filter user data

---

## Phase 13: Secrets Management

### 13.1 Encrypted Secret Storage

```
packages/secrets/
├── src/
│   ├── provider.ts      # Secret provider interface
│   ├── local.ts        # Local encrypted provider
│   └── types.ts        # Secret types
```

Features:
- Master key encryption
- Encrypted at rest
- Per-company isolation
- Secret versioning

### 13.2 Secret Injection

Runtime secret injection into:
- Agent execution contexts
- Execution workspaces
- Plugin environments

---

## Phase 14: Documents & Revisions

### 14.1 Issue Documents

Documents attached to issues:
- Plans, specs, design docs
- Revision history
- Version tracking

### 14.2 Document Management

```
packages/documents/
├── src/
│   ├── storage.ts      # Document storage
│   ├── revisions.ts   # Revision tracking
│   └── types.ts        # Document types
```

Features:
- Upload/download
- Revision history
- Diff viewing
- Access control

---

## Phase 15: Issue Enhancements

### 15.1 Labels System

```
services/labels/
├── src/
│   ├── labels.ts       # Label CRUD
│   └── types.ts       # Label types
```

- Issue labels
- Global labels
- Label colors
- Label filtering

### 15.2 Issue Relations

Issue relationships:
- Blockers
- Relates to
- Duplicates
- Hierarchy visualization

### 15.3 Thread Interactions

Sophisticated issue interactions:
- Activity stream
- Status change tracking
- Assignment history

---

## Phase 16: Routines (Expanded)

### 16.1 Scheduled Recurring Tasks

```
services/routines/
├── src/
│   ├── scheduler.ts    # Cron scheduler
│   ├── triggers.ts    # Trigger handlers
│   └── concurrency.ts # Concurrency policies
```

Features:
- Cron-based scheduling
- Multiple triggers (webhook, schedule, event)
- Concurrency policies (prevent, allow, queue)
- Routine templates
- Full task context passing

### 16.2 Wake-up Requests

Formal agent wake-up scheduling:
- Request queue
- Priority handling
- Scheduling policies

---

## Phase 17: Feedback System

### 17.1 Voting & Reactions

```
services/feedback/
├── src/
│   ├── voting.ts      # Vote system
│   ├── reactions.ts   # Reaction system
│   └── types.ts       # Feedback types
```

- Upvote/downvote
- Reactions
- Vote aggregation

### 17.2 Export & Sharing

- Export feedback data
- Share links with access control
- Redaction tools

---

## Phase 18: CRM System

### 18.1 Basic CRM

```
services/crm/
├── src/
│   ├── accounts.ts    # Account management
│   ├── contacts.ts    # Contact management
│   └── interactions.ts # Interaction tracking
```

- Accounts
- Contacts
- Interaction history
- Activity tracking

---

## Phase 19: Finance Events

### 19.1 Financial Tracking

```
services/finance/
├── src/
│   ├── events.ts      # Financial events
│   ├── reporting.ts   # Financial reports
│   └── types.ts       # Finance types
```

- Revenue tracking
- Expense tracking
- Financial reports
- Budget vs actual

---

## Phase 20: GitHub Integration

### 20.1 GitHub Fetch

```
services/github/
├── src/
│   ├── fetch.ts      # GitHub fetch
│   ├── sync.ts       # Repository sync
│   └── types.ts      # GitHub types
```

- Repository listing
- Issue sync
- PR sync
- Commit tracking

---

## Phase 21: MCP Server

### 21.1 Model Context Protocol

Implement MCP server support:
- MCP protocol handler
- Tool definitions
- Resource handlers
- Prompt templates

---

## Phase 22: Instance Settings

### 22.1 Global Configuration

```
services/instance/
├── src/
│   ├── settings.ts   # Instance settings
│   ├── config.ts     # Configuration
│   └── types.ts      # Instance types
```

- Instance ID
- Deployment mode
- Exposure settings
- Branding
- Default permissions

---

## Phase 23: Activity Log

### 23.1 Audit Trail

Comprehensive activity logging:
- User actions
- Agent actions
- System events
- Search/filter
- Export

---

## Phase 24: Company Memberships

### 24.1 User/Agent Membership

```
services/membership/
├── src/
│   ├── memberships.ts # Membership management
│   ├── roles.ts      # Role management
│   └── types.ts      # Membership types
```

- Company memberships
- Role-based access
- Permission grants
- Invite system

---

## Phase 25: Assets System

### 25.1 File/Asset Management

```
services/assets/
├── src/
│   ├── storage.ts    # Asset storage
│   ├── upload.ts     # Upload handling
│   ├── types.ts     # Asset types
```

- File upload/download
- Asset categorization
- Asset library
- Asset usage tracking
- Separate from issue attachments

---

## Phase 26: Inbox System

### 26.1 User Inbox

```
services/inbox/
├── src/
│   ├── notifications.ts # Notification handling
│   ├── dismissals.ts   # Dismissal management
│   ├── archives.ts   # Archive management
│   └── types.ts     # Inbox types
```

- User notifications
- Inbox dismissals
- Issue inbox archiving
- Notification preferences

---

## Phase 27: Join Request Queue

### 27.1 Company Join Requests

```
services/join-requests/
├── src/
│   ├── requests.ts   # Join request management
│   └── types.ts     # Join request types
```

- Agent application process
- Join request review
- Approval workflow
- Invitation system

---

## Phase 28: CLI Authentication

### 28.1 CLI-based Auth

```
services/cli-auth/
├── src/
│   ├── challenges.ts # Authentication challenges
│   ├── verify.ts   # Challenge verification
│   └── types.ts    # CLI auth types
```

- CLI authentication challenges
- Board access via CLI
- Session management
- Device verification

---

## Phase 29: User Preferences

### 29.1 Sidebar Preferences

```
services/preferences/
├── src/
│   ├── user.ts     # User-level preferences
│   ├── company.ts  # Company-level user preferences
│   └── types.ts    # Preference types
```

- User sidebar preferences
- Company user preferences
- UI customization per user
- Layout persistence

---

## Phase 30: Instance Database Backups

### 30.1 Automated Backups

```
services/backups/
├── src/
│   ├── scheduler.ts # Backup scheduler
│   ├── storage.ts  # Backup storage
│   └── types.ts    # Backup types
```

- Automated database backups
- Backup scheduling
- Backup retention policies
- Restore functionality

---

## Phase 31: LLMs Management

### 31.1 LLM Configuration

```
services/llms/
├── src/
│   ├── config.ts    # LLM configuration
│   ├── pricing.ts  # Model pricing
│   └── types.ts    # LLM types
```

- Model selection
- Pricing configuration
- Provider management
- Usage tracking per model

---

## Phase 32: Real-time Streaming

### 32.1 WebSocket Events

```
server/src/realtime/
├── src/
│   ├── live-events-ws.ts   # WebSocket handler
│   ├── live-events.ts     # Pub/sub service
│   └── types.ts          # Event types
```

- WebSocket endpoint: `/api/companies/:companyId/events/ws`
- Real-time event publishing
- Company-specific event channels
- Client connection management

### 32.2 Event Types

```
heartbeat.run.queued     # Run queued for execution
heartbeat.run.status    # Run state changed
heartbeat.run.event     # Run event (errors, etc)
heartbeat.run.log      # Streaming log output
agent.status          # Agent status changes
activity.logged       # New activity
plugin.ui.updated     # Plugin UI update
plugin.worker.crashed # Plugin crash
```

### 32.3 SSE for Plugins

Endpoint: `/api/plugins/:pluginId/bridge/stream/:channel`
- Text/event-stream content type
- PluginStreamBus for plugin streaming

---

## Phase 33: Human-in-the-Loop Interactions

### 33.1 Interaction Types

```
services/interactions/
├── src/
│   ├── types.ts          # Interaction types
│   ├── questions.ts      # Question handling
│   ├── confirmations.ts # Confirmation handling
│   └── suggestions.ts   # Task suggestions
```

Three interaction types:

1. **`ask_user_questions`** - Multi-question forms
   - Single/multi selection options
   - Required questions
   - Help text per question

2. **`request_confirmation`** - Approval requests
   - Accept/reject buttons
   - Optional reject reason
   - Target context (e.g., document revision)

3. **`suggest_tasks`** - Task suggestions
   - Agent-suggested tasks
   - Board/agent targets

### 33.2 Continuation Policies

Controls agent behavior after human responds:
- `wake_assignee` - Resume agent after response
- `await_approval` - Wait for explicit approval
- Custom policies

### 33.3 UI Components

```
ui/src/components/
├── AskUserQuestionsCard.tsx
├── RequestConfirmationCard.tsx
├── InteractionThread.tsx
└── QuestionOptionButton.tsx
```

- Inline in issue thread
- Real-time updates via WebSocket
- Submit handlers via REST API

### 33.4 Database Schema

```typescript
// issue_thread_interactions - questions, confirmations, suggestions
// issue_interaction_answers - human responses
// issue_interaction_results - final outcomes
```

---

## Phase 34: Run Transcripts

### 34.1 Live Run Transcripts

```
ui/src/components/transcript/
├── useLiveRunTranscripts.ts   # WebSocket hook
├── RunTranscript.tsx        # Transcript display
└── types.ts                 # Transcript types
```

- Real-time log streaming
- Run state display
- Event handling (queued, running, completed, failed)

### 34.2 Transcript Persistence

- Stored in heartbeat_runs table
- Full log history
- Searchable/filterable

---

## Phase 36: Org Chart

### 36.1 Org Chart API

**Server Routes:**

| Endpoint | Method | Description |
|----------|--------|-------------|
| /companies/:companyId/org | GET | JSON tree of org hierarchy |
| /companies/:companyId/org.svg | GET | SVG render of org chart |
| /companies/:companyId/org.png | GET | PNG export |

**Query Parameters:**
```
?style=monochrome|nebula|circuit|warmth|schematic
```

### 36.2 Data Structure

```typescript
interface OrgNode {
  id: string;
  name: string;
  role: string;
  status: "running" | "active" | "paused" | "idle" | "error" | "terminated";
  reports: OrgNode[];  // Children in hierarchy
}
```

**Agent Display in Node:**
```
- Avatar: 36px circle (from agent.icon)
- Status dot: 12px colored (bottom-right of avatar)
- Name: bold 14px
- Job title: 11px muted
- Adapter type: 10px monospace (e.g., claude_local)
- Capabilities: 10px, line-clamped to 2 lines
```

**Status Colors:**
```
running    → cyan (#22d3ee)
active    → green (#4ade80)
paused    → yellow (#facc15)
idle     → yellow (#facc15)
error    → red (#f87171)
terminated → gray (#a3a3a3)
```

### 36.3 Org Chart UI Component

**Page:** `ui/src/pages/OrgChart.tsx`

**Layout:**
- Card dimensions: 200x100px
- Horizontal gap: 32px
- Vertical gap: 80px
- Hybrid: SVG for connectors + HTML/CSS for cards

**Rendering:**
- Top-down tree with dynamic width
- Starts from `reportsTo: null` (CEO/root)
- Recursively groups by manager ID

**Interactivity:**
- Click node → Navigate to `/agents/:id`
- Mouse drag → Pan viewport
- Scroll wheel → Zoom
- Touch pinch → Zoom
- Touch drag → Pan
- Drag suppression on cards to prevent navigation errors

**Controls:**
- Zoom in (+) button
- Zoom out (-) button
- Fit-to-screen button

### 36.4 Visual Styles (5 themes)

```
monochrome  - Dark minimal (Vercel-inspired)
nebula     - Glassmorphism with cosmic gradient
circuit    - Indigo traces (Linear/Raycast style)
warmth     - Light with soft shadows (Airbnb-inspired)
schematic  - Blueprint with grid and monospace
```

### 36.5 Database Schema

```typescript
// agents table
reportsTo: uuid("reports_to").references(() => agents.id)
// Self-referential FK for org hierarchy
// null = CEO/root level
// Non-null = reports to that agent
```

### 36.6 Service Logic

```typescript
// agents.service.ts
orgForCompany(companyId: string): OrgNode[]
- Query all non-terminated agents for company
- Group by reportsTo (manager ID)
- Recursively build tree starting from null
```

---

## Phase 35: Issues (Full Implementation)

### 35.1 Issue Schema (Complete)

```
packages/db/src/schema/issues.ts
```

All 40+ fields:

```typescript
{
  // Identity
  id: uuid (PK)
  companyId: uuid (required, FK)
  issueNumber: integer (auto-incrementing)
  identifier: text (e.g., "PAP-123")

  // Hierarchy
  projectId: uuid (FK, optional)
  projectWorkspaceId: uuid (optional)
  goalId: uuid (FK, optional)
  parentId: uuid (self-ref, for child issues)

  // Content
  title: text (required)
  description: text (optional)

  // Status & Priority
  status: text (default: "backlog")
  priority: text (default: "medium")

  // Assignees (ONE assignee - either agent OR user)
  assigneeAgentId: uuid (optional, FK)
  assigneeUserId: text (optional, company user)

  // Execution
  checkoutRunId: uuid (FK, optional)
  executionRunId: uuid (FK, optional)
  executionAgentNameKey: text
  executionLockedAt: timestamp
  executionPolicy: jsonb (execution stages/policy)
  executionState: jsonb (current execution state)
  executionWorkspaceId: uuid (optional)
  executionWorkspacePreference: text
  executionWorkspaceSettings: jsonb

  // Origin tracking
  originKind: text (default: "manual")
  originId: text
  originRunId: text
  originFingerprint: text (default: "default")
  requestDepth: integer

  // Adapter config
  assigneeAdapterOverrides: jsonb

  // Billing
  billingCode: text

  // Timestamps
  startedAt: timestamp
  completedAt: timestamp
  cancelledAt: timestamp
  hiddenAt: timestamp (soft delete)

  // Creators
  createdByAgentId: uuid (optional)
  createdByUserId: text (optional)

  createdAt: timestamp
  updatedAt: timestamp
}
```

### 35.2 Issue Lifecycle (7 States)

**Status Values:**
```
backlog      # Default initial state
todo        # Ready to work
in_progress # Actively being worked on
in_review   # Under review
blocked    # Blocked by dependencies
done       # Completed
cancelled  # Cancelled
```

**Automatic Side Effects:**
```
in_progress → sets startedAt
done      → sets completedAt
cancelled → sets cancelledAt
```

**State Transitions:**
- Validated via assertTransition()
- Automatic timestamp management

### 35.3 Checkout System

**Checkout Endpoint:** `POST /issues/:id/checkout`

```typescript
// Request
{
  agentId: string
  expectedStatuses: string[]  // ["todo", "in_progress"]
}

// Validation
- Assignee must be assignable
- No unresolved blockers
- Optimistic locking: issue must be in expected status
- Either unassigned OR same assignee with matching checkoutRunId

// On Success
- Sets assigneeAgentId
- Clears assigneeUserId
- Sets checkoutRunId
- Sets executionRunId
- Sets status = "in_progress"
- Sets startedAt
```

**Stale Checkout Adoption:**
```
adoptStaleCheckoutRun()  # When run terminated
adoptUnownedCheckoutRun()  # No checkoutRunId but in_progress
```

**Release:** `POST /issues/:id/release`
- Clears assignee
- Clears checkoutRunId/executionRunId
- Sets status = "todo"

### 35.4 Priority System

**Priority Values:**
```
critical  # Highest
high
medium   # Default
low       # Lowest
```

**Ordering:** critical > high > medium > low

### 35.5 Issue Relations (Blockers)

**Table:** `issue_relations`

```typescript
{
  id: uuid
  companyId: uuid
  issueId: uuid  // The issue
  relatedIssueId: uuid  // The related issue
  type: "blocks" | "relates_to" | "duplicates"
  createdByAgentId: uuid
  createdByUserId: text
  createdAt: timestamp
}
```

**Blocker Rules:**
- Cannot checkout issue with unresolved blockers
- Auto-wakeup when blocker marked done
- Cycle prevention (assertNoBlockingCycles())

### 35.6 Enhanced Comments

**Table:** `issue_comments`

```typescript
{
  id: uuid
  companyId: uuid
  issueId: uuid (required)
  authorAgentId: uuid (optional)
  authorUserId: text (optional)
  createdByRunId: uuid (optional)
  body: text (required)  // Markdown support
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Features:**
- Read state tracking per user
- Mentions: `@agent`, `@project`
- Auto-reopen on comment (from done/cancelled to todo)
- Timestamp on edit

### 35.7 Issue Documents

**Table:** `issue_documents`

```typescript
{
  id: uuid
  companyId: uuid
  issueId: uuid
  documentId: uuid (FK)
  key: text (unique per issue, e.g., "plan", "spec")
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Special Documents:**
- `continuation-summary` - Auto-generated for issue continuation
- Supports revision history
- Restore to previous revisions

### 35.8 Labels System

**Tables:** `labels`, `issue_labels`

```typescript
// labels
{
  id: uuid
  companyId: uuid
  name: text
  color: text (6-digit hex)
  createdAt: timestamp
}

// issue_labels (junction)
{
  issueId: uuid
  labelId: uuid
}
```

### 35.9 Heartbeat Context

**Endpoint:** `GET /issues/:id/heartbeat-context`

**Response:**

```typescript
{
  issue: {
    id, identifier, title, description,
    status, priority,
    projectId, goalId, parentId,
    blockedBy: IssueRelationIssueSummary[],
    blocks: IssueRelationIssueSummary[],
    assigneeAgentId, assigneeUserId,
    updatedAt
  },
  ancestors: [{ id, identifier, title, status, priority }],
  project: { id, name, status, targetDate } | null,
  goal: { id, title, status, level, parentId } | null,
  commentCursor: string | null,
  wakeComment: IssueComment | null,
  attachments: [...],
  continuationSummary: {...} | null,
  currentExecutionWorkspace: ExecutionWorkspace | null
}
```

**Wakeup Reasons (triggers):**
```
issue_assigned
issue_checked_out
issue_status_changed
issue_commented
issue_reopened_via_comment
issue_blockers_resolved
issue_children_completed
issue_comment_mentioned
```

### 35.10 Run Tracking

**Execution Fields:**
- `checkoutRunId` - Run that checked out
- `executionRunId` - Active execution
- `executionAgentNameKey` - Agent identifier
- `executionLockedAt` - Lock timestamp
- `executionPolicy` - Execution stages
- `executionState` - Current state

**Work Products:** `issue_work_products`

```typescript
{
  id: uuid
  companyId: uuid
  issueId: uuid
  type: "pull_request" | "commit" | "issue" | "doc" | "other"
  provider: "github" | "gitlab" | "jira" | ...
  externalId: text
  title: text
  url: text
  status: text
  reviewState: text
  healthStatus: text
  summary: text
}
```

### 35.11 Search & Filtering

**List Endpoint:** `GET /companies/:companyId/issues`

**Filters:**
```
status              # Comma-separated
assigneeAgentId    # By agent
assigneeUserId     # "me" for current user
participantAgentId # Creator, assignee, commenter
projectId
workspaceId
executionWorkspaceId
parentId
labelId
originKind         # "routine_execution"
originId
q                  # Full-text search
```

**Quick Filters (Kanban UI):**
```
My Issues          # Assigned to me
Due Soon          # Near target date
Blocked           # Blocked status
Needs Review      # in_review status
High Priority     # critical/high priority
Recently Updated # Last 24h activity
```

**Search Ordering:**
1. Priority (critical > high > medium > low)
2. Most recent activity

**WIP Limits (per column):**
```
todo_col_limit: 10      # Max 10 in todo
in_progress_limit: 5     # Max 5 in progress
in_review_limit: 3       # Max 3 in review
```

### 35.12 Sequential Tasks / Triggers

**Triggers Between Issues:**

1. **Blocker Trigger** - "Start X when Y is done"
   - Issue X has blocker relationship to Y
   - When Y.status → done, X gets wakeup

2. **Parent-Child Trigger**
   - When all children done, parent gets wakeup
   - Specify `blockParentUntilDone`

3. **Trigger Configuration:**

```typescript
// On child issue creation
{
  acceptanceCriteria: text
  blockParentUntilDone: boolean
}

// On issue relations
{
  type: "blocks"
  trigger: {
    when: "issue_completed" | "issue_status_changed"
    thenWake: "dependent_issues"
  }
}
```

**Auto-Wakeup Triggers:**
```
- Blocker resolution → wake blocked issues
- Children completion → wake parent
- Status change → wake assignee
- Comment mention → wake agent
```

### 35.13 Issue Components (UI)

```
ui/src/components/issues/
├── IssueCard.tsx
├── IssueBoard.tsx         # Kanban board
│   ├── KanbanColumn.tsx    # Column (backlog, todo, etc.)
│   ├── KanbanCard.tsx    # Issue card in board
│   ├── KanbanSwimlane.tsx # Swimlane component
│   └── DragDropContext.tsx
├── IssueList.tsx
├── IssueDetail.tsx
├── IssueCreate.tsx
├── IssueCommentThread.tsx
├── IssueDocuments.tsx
├── IssueLabels.tsx
├── IssueRelations.tsx
├── IssuePriority.tsx
├── IssueFilters.tsx       # Quick filters
├── IssueSearch.tsx
├── IssueBulkActions.tsx  # Bulk operations
├── CheckoutButton.tsx
├── ReleaseButton.tsx
├── InlineAssignee.tsx    # Quick assignee
└── InlinePriority.tsx   # Quick priority
```

### 35.14 Issue API Routes

| Endpoint | Method | Description |
|----------|--------|------------|
| /companies/:id/issues | GET | List with filters |
| /companies/:id/issues | POST | Create |
| /issues/:id | GET | Detail |
| /issues/:id | PATCH | Update |
| /issues/:id/checkout | POST | Checkout |
| /issues/:id/release | POST | Release |
| /issues/:id/status | PATCH | Quick status update (Kanban) |
| /issues/:id/bulk | POST | Bulk update |
| /issues/:id/move | POST | Move to column (drag-drop) |
| /issues/:id/comments | GET/POST | Comments |
| /issues/:id/documents | GET/POST | Documents |
| /issues/:id/labels | GET/POST/DELETE | Labels |
| /issues/:id/relations | GET/POST | Relations |
| /issues/:id/children | GET/POST | Child issues |
| /issues/:id/heartbeat-context | GET | Agent context |
| /issues/:id/work-products | GET/POST | Work products |

---

## Migration Steps

### Step 1: Setup

1. Initialize pnpm workspace
2. Add monorepo structure
3. Install dependencies

### Step 2: Database

1. Create Drizzle schema
2. Generate migrations
3. Set up DB client

### Step 3: Server

1. Create routes
2. Implement services
3. Add auth

### Step 4: UI

1. Build pages
2. Add components
3. Wire up API

### Step 5: Adapters

1. Create adapter interface
2. Implement OpenCode adapter
3. Implement additional adapters (Claude, Codex, Cursor, Gemini, etc.)
4. Add adapter plugins support
5. Add UI config

### Step 6: Heartbeat

1. Implement scheduling
2. Add run tracking
3. Context injection

### Step 7: Costs

1. Cost event ingestion
2. Budget enforcement
3. UI displays

### Step 8: Governance

1. Approval system
2. Board actions
3. Activity logging

### Step 9: Execution Workspaces

1. Implement workspace runtime
2. Add environment management
3. Add workspace leasing

### Step 10: Plugins

1. Create plugin SDK
2. Implement lifecycle hooks
3. Add UI slot system
4. Add capabilities system
5. Implement database namespaces
6. Add scoped API routes

### Step 11: Skills

1. Create skill registry
2. Implement skill sync
3. Add agent instructions system

### Step 12: Secrets

1. Implement encrypted secret storage
2. Add secret injection

### Step 13: Documents

1. Implement document management
2. Add revision tracking

### Step 14: Issue Enhancements

1. Add labels system
2. Add issue relations
3. Add thread interactions

### Step 15: Routines (Expanded)

1. Implement cron scheduler
2. Add wake-up requests

### Step 16: Feedback

1. Add voting system
2. Add export/sharing

### Step 17: CRM

1. Add accounts/contacts management
2. Add interaction tracking

### Step 18: Finance

1. Add financial event tracking

### Step 19: GitHub Integration

1. Add GitHub fetch
2. Add repo sync

### Step 20: MCP Server

1. Implement MCP protocol

### Step 21: Instance Settings

1. Add global configuration

### Step 22: Activity Log

1. Implement audit trail

### Step 23: Company Memberships

1. Add membership management
2. Add invite system

### Step 24: Assets

1. Add file/asset management
2. Add asset library

### Step 25: Inbox

1. Add notification system
2. Add dismissals/archive

### Step 26: Join Requests

1. Add join request queue
2. Add approval workflow

### Step 27: CLI Authentication

1. Add CLI auth challenges
2. Add verification system

### Step 28: User Preferences

1. Add sidebar preferences
2. Add company preferences

### Step 29: Instance Backups

1. Add backup scheduler
2. Add restore functionality

### Step 30: LLMs Management

1. Add LLM configuration
2. Add pricing management

### Step 31: Real-time Streaming

1. Add WebSocket infrastructure
2. Add event pub/sub system
3. Add SSE for plugins

### Step 32: Human Interactions

1. Add interaction types (questions, confirmations)
2. Add UI components
3. Add continuation policies

### Step 33: Run Transcripts

1. Add live transcript hook
2. Add transcript display

### Step 34: Issues (Full)

1. Add complete issue schema (40+ fields)
2. Add issue lifecycle (7 states)
3. Add checkout system
4. Add priority system
5. Add issue relations (blockers)
6. Add enhanced comments
7. Add issue documents
8. Add labels system
9. Add heartbeat context
10. Add run tracking + work products
11. Add search/filtering
12. Add sequential task triggers

### Step 35: Org Chart

1. Add org chart API endpoints (JSON, SVG, PNG)
2. Add OrgNode data structure
3. Add OrgChart UI component
4. Add 5 visual styles
5. Add pan/zoom controls
6. Add database schema (reportsTo FK)

---

## Verification

Run these commands after implementation:

```bash
pnpm -r typecheck    # TypeScript
pnpm test           # Unit tests
pnpm build          # Full build
```

---

## Notes

- Full rewrite with ALL data in PostgreSQL (files, sessions, everything)
- Login from any computer → exact same state
- UI copied from custom-paperclip
- Adapters: opencode-local, opencode-remote (Colab), claude-local (Paperclip), gemini-local (Paperclip)
- File sync: all changes logged with timestamps, delta sync on login