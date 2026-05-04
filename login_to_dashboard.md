# Login to Dashboard - File Reference

## `/onboarding` Page Files

### Route Definition
- `custom-paperclip/ui/src/App.tsx:61` - Route defined inside `boardRoutes()`

### Main Components
- `custom-paperclip/ui/src/components/OnboardingWizard.tsx` - Main wizard component
- `custom-paperclip/ui/src/pages/Auth.tsx` - Auth page (redirects to onboarding)

### Onboarding Logic Libraries
- `custom-paperclip/ui/src/lib/onboarding-route.ts` - Route helper functions
- `custom-paperclip/ui/src/lib/onboarding-launch.ts` - Launch/logic
- `custom-paperclip/ui/src/lib/onboarding-goal.ts` - Goal parsing

### Server-side (company creation used by onboarding)
- `custom-paperclip/server/src/routes/companies.ts`

### Tests
- `custom-paperclip/tests/e2e/onboarding.spec.ts`
- `custom-paperclip/tests/release-smoke/docker-auth-onboarding.spec.ts`

---

## `/:companyPrefix/dashboard` Page Files

### Route Definition
- `custom-paperclip/ui/src/App.tsx:60` - `<Route path="dashboard" element={<Dashboard />} />`

### Page Component
- `custom-paperclip/ui/src/pages/Dashboard.tsx`

### Server-side
- `custom-paperclip/server/src/routes/dashboard.ts` - API route
- `custom-paperclip/server/src/services/dashboard.ts` - Dashboard service

### Shared Types
- `custom-paperclip/packages/shared/src/types/dashboard.ts`

### Frontend API Client
- `custom-paperclip/ui/src/api/dashboard.ts`

---

## All Pages Accessible After Onboarding (under `/:companyPrefix/`)

From `App.tsx:56-100+`, these pages are in `boardRoutes()`:

### Core Pages
| Route | File Path |
|-------|-----------|
| `/` (redirects to dashboard) | `pages/Dashboard.tsx` |
| `/dashboard` | `pages/Dashboard.tsx` |
| `/onboarding` | `components/OnboardingWizard.tsx` |
| `/companies` | `pages/Companies.tsx` |
| `/agents` | `pages/Agents.tsx` |
| `/agents/new` | `pages/NewAgent.tsx` |
| `/agents/:agentId` | `pages/AgentDetail.tsx` |
| `/projects` | `pages/Projects.tsx` |
| `/projects/:projectId` | `pages/ProjectDetail.tsx` |
| `/projects/:projectId/workspaces/:workspaceId` | `pages/ProjectWorkspaceDetail.tsx` |
| `/workspaces` | `pages/Workspaces.tsx` |
| `/issues` | `pages/Issues.tsx` |
| `/issues/:issueId` | `pages/IssueDetail.tsx` |
| `/routines` | `pages/Routines.tsx` |
| `/routines/:routineId` | `pages/RoutineDetail.tsx` |
| `/goals` | `pages/Goals.tsx` |
| `/goals/:goalId` | `pages/GoalDetail.tsx` |

### Activity & Monitoring
| Route | File Path |
|-------|-----------|
| `/activity` | `pages/Activity.tsx` |
| `/inbox` | `pages/Inbox.tsx` |
| `/costs` | `pages/Costs.tsx` |
| `/approvals` | `pages/Approvals.tsx` |
| `/approvals/:approvalId` | `pages/ApprovalDetail.tsx` |

### Company Management
| Route | File Path |
|-------|-----------|
| `/company/settings` | `pages/CompanySettings.tsx` |
| `/company/settings/access` | `pages/CompanyAccess.tsx` |
| `/company/settings/invites` | `pages/CompanyInvites.tsx` |
| `/company/export/*` | `pages/CompanyExport.tsx` |
| `/company/import` | `pages/CompanyImport.tsx` |
| `/skills/*` | `pages/CompanySkills.tsx` |
| `/org` | `pages/OrgChart.tsx` |

### User & Settings
| Route | File Path |
|-------|-----------|
| `/user/:userId` | `pages/UserProfile.tsx` |
| `/settings/profile` | `pages/ProfileSettings.tsx` |
| `/settings/instance` | `pages/InstanceSettings.tsx` |
| `/settings/instance/general` | `pages/InstanceGeneralSettings.tsx` |
| `/settings/instance/access` | `pages/InstanceAccess.tsx` |
| `/settings/instance/experimental` | `pages/InstanceExperimentalSettings.tsx` |

### Plugin & Adapter Management
| Route | File Path |
|-------|-----------|
| `/plugins` | `pages/PluginManager.tsx` |
| `/plugins/:pluginId` | `pages/PluginPage.tsx` |
| `/plugins/:pluginId/settings` | `pages/PluginSettings.tsx` |
| `/adapters` | `pages/AdapterManager.tsx` |

### Special Pages
| Route | File Path |
|-------|-----------|
| `/board/claim` | `pages/BoardClaim.tsx` |
| `/cli-auth` | `pages/CliAuth.tsx` |
| `/invite/:token` | `pages/InviteLanding.tsx` |
| `/join-requests` | `pages/JoinRequestQueue.tsx` |
| `*`（404） | `pages/NotFound.tsx` |

---

## Shared Layout & Context

### Layout Component (wraps all board pages)
- `custom-paperclip/ui/src/components/Layout.tsx`

### Context Providers
- `custom-paperclip/ui/src/context/CompanyContext.tsx` - Company selection
- `custom-paperclip/ui/src/context/DialogContext.tsx` - Onboarding dialog
- `custom-paperclip/ui/src/context/BreadcrumbContext.tsx` - Breadcrumbs

---

## Server API Routes (for all pages)

### Main server entry
- `custom-paperclip/server/src/index.ts` - Mounts all routes

### Key API Route Files
- `custom-paperclip/server/src/routes/auth.ts`
- `custom-paperclip/server/src/routes/companies.ts`
- `custom-paperclip/server/src/routes/agents.ts`
- `custom-paperclip/server/src/routes/issues.ts`
- `custom-paperclip/server/src/routes/projects.ts`
- `custom-paperclip/server/src/routes/goals.ts`
- `custom-paperclip/server/src/routes/routines.ts`
- `custom-paperclip/server/src/routes/costs.ts`
- `custom-paperclip/server/src/routes/approvals.ts`
- `custom-paperclip/server/src/routes/activity.ts`
- `custom-paperclip/server/src/routes/access.ts`
- `custom-paperclip/server/src/routes/dashboard.ts`
- `custom-paperclip/server/src/routes/execution-workspaces.ts`
- `custom-paperclip/server/src/routes/plugins.ts`
- `custom-paperclip/server/src/routes/invites.ts`
