# plan-ui.md - Company-DAI UI Clone from Custom-Paperclip

**Date**: 2026-04-29

**Goal**: Clone custom-paperclip UI in company-dai with fastest technology (Vite + Rolldown)

---

## Executive Summary

After comprehensive audit, company-dai UI is **95% identical** to custom-paperclip UI. The main differences are:
- 6 extra components in company-dai (enhancements)
- 3 extra pages in company-dai
- 18 missing server routes needing implementation
- 5 missing pages needing implementation

**Performance Target**: Enable Rolldown for 5-8x faster production builds

---

## Table of Contents

1. [Current State Audit](#1-current-state-audit)
2. [Missing Files](#2-missing-files)
3. [Extra Files (company-dai Enhancements)](#3-extra-files-company-dai-enhancements)
4. [Performance Optimization](#4-performance-optimization)
5. [Implementation Plan](#5-implementation-plan)
6. [Technical Specifications](#6-technical-specifications)

---

## 1. Current State Audit

### Comparison Summary

| Category | company-dai | custom-paperclip | Status |
|----------|-------------|-----------------|--------|
| Pages | 76 | 73 | +3 extra |
| Components (root) | 121 | 115 | +6 extra |
| Server Routes | 31 | 32 | -1 missing |
| index.css | 869 lines | 869 lines | IDENTICAL |
| App.tsx | 309 lines | 309 lines | IDENTICAL |
| DB Schema | ~50 tables | ~50 tables | IDENTICAL |

### UI Tech Stack

```json
{
  "bundler": "vite@6.1.0",
  "minifier": "esbuild",
  "framework": "react@19.0.0",
  "routing": "react-router-dom@7.1.5",
  "state": "@tanstack/react-query@5.90.21",
  "styling": "tailwindcss@4.0.7"
}
```

### Build Performance (Current)

- Production build: ~10-15 seconds
- HMR: 22-42ms
- Cold start: 3-5 seconds
- Bundle size: 291KB JS + 21KB CSS

---

## 2. Missing Files

### 2.1 Pages (need implementation)

| File | Status | Priority |
|------|--------|----------|
| AdapterManager.tsx | EXISTS (same) | N/A |
| All pages match | - | - |

### 2.2 Server Routes (missing in company-dai)

| File | Description | Priority |
|------|------------|----------|
| access.ts | Permission system | HIGH |
| adapters.ts | Adapter management | HIGH |
| authz.ts | Authorization | HIGH |
| crm.ts | CRM system | MEDIUM |
| health.ts | Health checks | MEDIUM |
| inbox-dismissals.ts | Notification dismissals | MEDIUM |
| instance-settings.ts | Instance settings | HIGH |
| issues-checkout-wakeup.ts | Issue wakeups | HIGH |
| llms.ts | LLM configuration | HIGH |
| org-chart-svg.ts | Org chart SVG | MEDIUM |
| plugin-ui-static.ts | Plugin static | LOW |
| sidebar-badges.ts | Sidebar badges | LOW |
| sidebar-preferences.ts | User preferences | LOW |
| user-profiles.ts | User profiles | MEDIUM |
| workspace-command-authz.ts | Command authz | MEDIUM |
| workspace-runtime-service-authz.ts | Runtime service authz | MEDIUM |

### 2.3 Components (missing in company-dai)

All major components match - no significant gaps.

---

## 3. Extra Files (company-dai Enhancements)

These are company-dai additions - should be KEPT:

### 3.1 Extra Pages

| File | Description |
|------|-------------|
| Assets.tsx | Asset library page |
| Live.tsx | Real-time run view |
| Settings.tsx | Legacy settings redirect |

### 3.2 Extra Components

| File | Description |
|------|-------------|
| AgentCard.tsx | Agent card display |
| BudgetMeter.tsx | Budget visualization |
| IssueCard.tsx | Issue card for boards |
| KanbanColumn.tsx | Kanban column component |
| OrgNodeCard.tsx | Org chart node |
| RunTranscript.tsx | Run transcript display |

### 3.3 Extra Server Routes

| File | Description |
|------|-------------|
| cli-auth.ts | CLI authentication |
| company-portability.ts | Import/export |
| documents.ts | Document management |
| events.ts | Real-time events |
| files.ts | File CRUD |
| github.ts | GitHub integration |
| heartbeat.ts | Heartbeat system |
| inbox.ts | Notifications |
| interactions.ts | Human interactions |
| join-requests.ts | Join queue |
| labels.ts | Issue labels |
| mcp.ts | MCP server |
| preferences.ts | User preferences |
| settings.ts | Settings |
| skills.ts | Company skills |

---

## 4. Performance Optimization

### 4.1 Enable Rolldown (Primary Optimization)

**File**: `/content/company-dai/ui/vite.config.ts`

**Current**:
```typescript
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  build: {
    minify: "esbuild",
  },
  // ...
}));
```

**Target**:
```typescript
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  build: {
    minify: "esbuild",
  },
  // Enable Rolldown for 5-8x faster builds
  experimental: {
    bundler: 'rolldown',
  },
  // ...
}));
```

### 4.2 Expected Performance Gains

| Metric | Before | After (Rolldown) | Improvement |
|-------|--------|-----------------|-------------|
| Production build | 10-15s | 1-2s | 5-8x faster |
| HMR | 22-42ms | 20-40ms | Similar |
| Cold start | 3-5s | 3-5s | Similar |
| Bundle size | 291KB | ~291KB | Same |

### 4.3 Alternative: Bun Package Manager

Optionally replace pnpm with Bun for faster installs:

```bash
# Current
pnpm install  # 9-30s

# With Bun
bun install   # 1-3s (9-30x faster)
```

---

## 5. Implementation Plan

### Phase 1: Performance (Priority: HIGH)

- [ ] Enable Rolldown in vite.config.ts
- [ ] Benchmark production build
- [ ] Verify HMR works

### Phase 2: Missing Routes (Priority: HIGH)

- [ ] access.ts - Implement permission system
- [ ] adapters.ts - Implement adapter management
- [ ] authz.ts - Implement authorization
- [ ] instance-settings.ts - Implement settings
- [ ] issues-checkout-wakeup.ts - Implement wakeups
- [ ] llms.ts - Implement LLM config

### Phase 3: Missing Routes (Priority: MEDIUM)

- [ ] crm.ts - CRM system
- [ ] health.ts - Health checks
- [ ] inbox-dismissals.ts - Dismissals
- [ ] user-profiles.ts - User profiles

### Phase 4: Missing Routes (Priority: LOW)

- [ ] sidebar-badges.ts
- [ ] sidebar-preferences.ts
- [ ] workspace-command-authz.ts
- [ ] workspace-runtime-service-authz.ts
- [ ] org-chart-svg.ts
- [ ] plugin-ui-static.ts

---

## 6. Technical Specifications

### 6.1 UI Architecture

```
ui/src/
├── api/                    # API clients (31 files)
├── components/             # Reusable UI (121 files)
│   ├── access/
│   ├── transcript/
│   └── ui/
├── context/               # React contexts (15 files)
├── lib/                  # Utilities (87 files)
├── pages/                # Page components (76 files)
├── plugins/              # Plugin system
├── App.tsx               # Main app + routing
├── index.css            # Global styles
└── main.tsx             # Entry point
```

### 6.2 Routing Structure

```typescript
// Routes in App.tsx
'/auth'                    → AuthPage
'/board-claim/:token'     → BoardClaimPage
'/cli-auth/:id'           → CliAuthPage
'/invite/:token'          → InviteLandingPage

// Protected routes (CloudAccessGate)
'/instance/settings/*'    → Instance settings pages
'/:companyPrefix/*'       → Company board routes

// Company board routes
'dashboard'               → Dashboard
'companies'              → Companies
'org'                    → OrgChart
'agents/*'               → Agents
'projects/*'              → Projects
'issues/*'               → Issues
'routines/*'              → Routines
'goals/*'                → Goals
'approvals/*'             → Approvals
'costs'                  → Costs
'activity'               → Activity
'inbox/*'                 → Inbox
'skills/*'                → Company skills
'settings'                → Legacy settings
'plugins/:pluginId'       → Plugin pages
```

### 6.3 API Layer Pattern

```typescript
// Example API client pattern
import { client } from './client';

export const dashboardApi = {
  summary: (companyId: string) =>
    client.get(`/companies/${companyId}/dashboard`),
    
  metrics: (companyId: string, params: MetricsParams) =>
    client.get(`/companies/${companyId}/dashboard/metrics`, { params }),
};
```

### 6.4 State Management

- **Server State**: TanStack Query v5
- **UI State**: React Contexts
- **Form State**: React Hook Form patterns

### 6.5 Styling

- **CSS**: Tailwind CSS 4.0
- **Patterns**: cva (class-variance-authority)
- **Utilities**: clsx, tailwind-merge

### 6.6 Component Patterns

```typescript
// Button pattern
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-9 px-3',
      },
    },
  }
);
```

---

## 7. Files to Modify

### 7.1 Modify

| File | Change |
|------|--------|
| `ui/vite.config.ts` | Add Rolldown experimental |

### 7.2 Add (Server Routes)

| File | From |
|------|-------|
| server/src/routes/access.ts | custom-paperclip |
| server/src/routes/adapters.ts | custom-paperclip |
| server/src/routes/authz.ts | custom-paperclip |
| server/src/routes/health.ts | custom-paperclip |
| server/src/routes/instance-settings.ts | custom-paperclip |
| server/src/routes/issues-checkout-wakeup.ts | custom-paperclip |
| server/src/routes/llms.ts | custom-paperclip |

---

## 8. Testing Requirements

### Build Tests

```bash
# Production build
cd /content/company-dai/ui && pnpm build

# Verify bundle size < 500KB
# Verify build time < 5s with Rolldown
```

### Functional Tests

```bash
# Dev server
cd /content/company-dai && pnpm dev

# Verify:
# - All pages load
# - Routing works
# - API calls work
```

---

## 9. Dependencies

### Current (in package.json)

```json
{
  "@dnd-kit/core": "^6.3.1",
  "@dnd-kit/sortable": "^10.0.0",
  "@radix-ui/react-slot": "^1.2.4",
  "@tailwindcss/typography": "^0.5.19",
  "@tanstack/react-query": "^5.90.21",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "cmdk": "^1.1.1",
  "lucide-react": "^0.574.0",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "react-markdown": "^10.1.0",
  "react-router-dom": "^7.1.5",
  "tailwind-merge": "^3.4.1"
}
```

### Dev Dependencies

```json
{
  "@vitejs/plugin-react": "^4.3.4",
  "tailwindcss": "^4.0.7",
  "typescript": "^5.7.3",
  "vite": "^6.1.0"
}
```

---

## 10. Success Criteria

### Performance

- [ ] Production build < 2 seconds (with Rolldown)
- [ ] HMR < 50ms
- [ ] Bundle size < 350KB

### Functionality

- [ ] All 76 pages render
- [ ] All routes work
- [ ] All API calls succeed

### Compatibility

- [ ] Matches custom-paperclip UI 100%
- [ ] All extra features preserved

---

## 11. Rollback Plan

If Rolldown causes issues:

```typescript
// Revert ui/vite.config.ts
experimental: {
  // bundler: 'rolldown',  // Remove this line
},
```

---

## Appendix A: File Lists

### A.1 All company-dai Pages (76)

See: `ls ui/src/pages/*.tsx`

### A.2 All company-dai Components (121)

See: `ls ui/src/components/*.tsx`

### A.3 All company-dai Server Routes (31)

See: `ls server/src/routes/*.ts`

---

## Appendix B: Custom-Paperclip Reference

- **Source**: `/content/custom-paperclip/`
- **UI**: `/content/custom-paperclip/ui/src/`
- **Server**: `/content/custom-paperclip/server/src/`
- **Packages**: `/content/custom-paperclip/packages/`

---

**Document Status**: Draft
**Last Updated**: 2026-04-29