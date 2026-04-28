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

Create tables matching Paperclip's V1 spec:

```typescript
// companies - first-order entity
// agents - with org structure (reports_to)
// goals - hierarchical (company → team → agent → task)
// projects - workspace for tasks
// issues - tasks with parent/child hierarchy
// issue_comments - threaded conversations
// heartbeat_runs - agent execution history
// cost_events - token/cost tracking
// approvals - board governance
// activity_log - audit trail
// users - human operators
// sessions - auth sessions
// agent_api_keys - agent authentication
```

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
| companies | CRUD |
| agents | CRUD, org tree, heartbeat |
| goals | CRUD, hierarchy |
| projects | CRUD |
| issues | CRUD, checkout, comments |
| heartbeat | invoke, status |
| costs | events, rollups |
| approvals | request, decide |
| auth | login, logout, sessions |

### 3.2 Services

Business logic services:
- CompaniesService
- AgentsService (org tree, heartbeat)
- IssuesService (checkout, status)
- GoalsService (hierarchy)
- CostsService (budgets, rollups)
- HeartbeatService (scheduling)
- ApprovalsService

### 3.3 Middleware

- Company access enforcement
- Auth (session + API keys)
- Activity logging

---

## Phase 4: UI (ui/)

### 4.1 Pages

Create Paperclip-style pages:

| Page | Description |
|------|------------|
| Dashboard | Company overview, metrics, agent activity |
| Companies | Company list/management |
| Org Chart | Visual agent hierarchy |
| Agents | Agent list, create, manage |
| Goals | Goal hierarchy view |
| Projects | Project management |
| Issues | Task board/list |
| Issue Detail | Task view, comments, runs |
| Approvals | Pending approvals |
| Costs | Budget tracking |
| Routines | Scheduled tasks |
| Settings | Instance/company settings |

### 4.2 Components

Build reusable UI:
- AgentCard, GoalCard, IssueCard
- OrgChartTree
- IssueBoard (kanban)
- CommentThread
- RunTranscript
- BudgetMeter
- ApprovalCard

### 4.3 Routing

```
/                     → Dashboard
/companies            → Companies list
/companies/:id        → Company detail
/org                 → Org chart
/agents               → Agents list
/agents/:id           → Agent detail
/goals               → Goals tree
/projects            → Projects
/projects/:id         → Project detail
/issues               → Issues list/board
/issues/:id           → Issue detail
/approvals           → Approvals
/costs               → Cost tracking
/routines            → Scheduled routines
/settings            → Settings
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
```

### 5.2 Built-in Adapters

Implement:

| Adapter | Type | Description |
|---------|------|------------|
| opencode-local | process | Local OpenCode process |
| claude-local | process | Claude Code CLI |
| codex-local | process | Codex CLI |
| http | webhook | External HTTP agent |

### 5.3 Adapter Configuration

UI for configuring adapters per agent type with env injection.

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

## Phase 9: Plugins (packages/plugins)

### 9.1 Plugin System

Add plugin framework:
- Plugin SDK
- Lifecycle hooks
- Scoped API access

---

## Phase 10: Skills System

### 10.1 Company Skills

Add skill management:
- Skill registry
- Runtime skill injection
- Skill sync

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
3. Add UI config

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

- This is a full rewrite, not incremental changes
- Keep existing data/ agents.json format for initial seed
- Adapt specific paths and imports from Paperclip to company-dai
- Use Paperclip's doc/SPEC-implementation.md as reference for exact field definitions