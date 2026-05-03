# Authentication Implementation Plan for company-dai

## 1. Auth System Implementation

### 1.1 Current State
- ✅ UI: Auth page (`ui/src/pages/Auth.tsx`) and API client (`ui/src/api/auth.ts`) - already exist, copied from Paperclip
- ✅ DB Schema: Auth tables (`authUsers`, `authSessions`, `authAccounts`, `authVerifications`) - already exist in `packages/db/src/schema/auth.ts`
- ⚠️ Server: Has stub auth router at `server/src/routes/auth.ts` returning dummy responses
- ❌ Missing: better-auth library, auth middleware, board-auth service, agent JWT auth, proper config

### 1.2 Dependencies
Add to `server/package.json`:
```json
"better-auth": "^1.x"
```

### 1.3 Server Auth Architecture

#### Deployment Modes (from Paperclip)
| Mode | Description |
|------|-------------|
| `local_trusted` | Development mode - auto-authenticates with implicit local-board user. No cookies/session required. |
| `authenticated` | Production mode - requires proper Better Auth session via cookies, or API keys for agents. |

**Config source** (env variable + optional file config):
- `COMPANY_DAI_DEPLOYMENT_MODE=local_trusted|authenticated`

#### Files to Create

| File | Purpose |
|------|---------|
| `server/src/config.ts` | Load deployment mode, instance settings, auth config |
| `server/src/auth/better-auth.ts` | Initialize better-auth with Drizzle adapter |
| `server/src/auth/agent-auth-jwt.ts` | JWT verification for agents |
| `server/src/middleware/auth.ts` | Actor middleware - resolves board user or agent from request |
| `server/src/services/board-auth.ts` | Board API key management |
| `server/src/routes/auth.ts` | Full auth routes (replace stub) |

#### Auth Routes to Implement

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/get-session` | GET | Returns session + user profile |
| `/api/auth/sign-in/email` | POST | Email/password sign in (better-auth) |
| `/api/auth/sign-up/email` | POST | Email/password sign up (better-auth) |
| `/api/auth/sign-out` | POST | Sign out (better-auth) |
| `/api/auth/profile` | GET | Get current user profile |
| `/api/auth/profile` | PATCH | Update user profile |

#### Middleware Behavior by Mode

**`local_trusted` mode:**
- All requests get `actor = { type: "board", userId: "local-board", isInstanceAdmin: true }`
- No session/cookie validation needed
- Used for local development only

**`authenticated` mode:**
- Check `cookie` header for better-auth session
- If valid session → set `actor = { type: "board", userId, ... }`
- If `Authorization: Bearer <token>` header:
  - Try board API key (from `boardApiKeys` table)
  - Try agent API key (from `agentApiKeys` table)
  - Try agent JWT (from `agent-auth-jwt.ts`)
- If no valid auth → `actor = { type: "none" }`

### 1.4 UI Fixes Needed
- `ui/src/api/auth.ts`: Change `/session` → `/get-session` (line 93)

---

## 2. Performance Optimization Plan

### 2.1 Build Performance (Already Optimized)
The UI already uses:
- ✅ **Rolldown** (experimental, 5-8x faster than default)
- ✅ **esbuild** for minification
- ✅ **SWC** via @vitejs/plugin-react

**Additional optimizations to add:**

| Optimization | File | Change |
|-------------|------|--------|
| Parallel TypeScript build | `ui/package.json` | Add `tsc --build --parallel` or use `esbuild` for type checking |
| Cache dependencies | `.npmrc` or `pnpm-workspace.yaml` | Enable module hoisting |
| Skip unnecessary deps in prod | `ui/vite.config.ts` | Use `treeshake` options |

### 2.2 Runtime Performance - Fastest Options

#### Server (Express)
| Optimization | Implementation |
|--------------|----------------|
| **Compression** | Add `compression` middleware (gzip) |
| **Static files** | Use `serve-static` or Express static with cache headers |
| **HTTP/2** | Use `spdy` or `http2` module (requires SSL) |
| **Response caching** | Add cache-control headers for GET requests |
| **Connection pooling** | Configure DB connection pool properly |

#### UI/Vite
| Optimization | Implementation |
|--------------|----------------|
| **Code splitting** | Enable manual chunks in `vite.config.ts` |
| **Lazy loading** | Use `React.lazy()` for route components |
| **Preload hints** | Add `<link rel="preload">` for critical assets |
| **Brotli compression** | Enable in build with `vite build --mode production` |
| **Cache busting** | Use content hash in filenames |

#### Database
| Optimization | Implementation |
|--------------|----------------|
| **Connection pooling** | Use PgBouncer or native pool |
| **Query optimization** | Add indexes on frequently queried columns |
| **Prepared statements** | Use parameterized queries |

### 2.3 Quick Wins to Implement Immediately

1. **Add compression to Express** (`server/src/index.ts`):
```ts
import compression from 'compression';
app.use(compression());
```

2. **Enable cache headers for static files** (`server/src/index.ts`):
```ts
app.use(express.static(distPath, {
  maxAge: '1y',
  immutable: true
}));
```

3. **Add lazy loading for routes** in UI router (if not already done):
```tsx
const Dashboard = lazy(() => import('./pages/Dashboard'));
```

4. **Use preload for critical assets** in `index.html`:
```html
<link rel="preload" href="/assets/main.css" as="style">
```

---

## 3. Implementation Checklist

### Auth Implementation
- [ ] Add `better-auth` to server dependencies
- [ ] Create `server/src/config.ts` with deployment mode config
- [ ] Create `server/src/auth/better-auth.ts` (adapter setup)
- [ ] Create `server/src/auth/agent-auth-jwt.ts` (JWT verify)
- [ ] Create `server/src/middleware/auth.ts` (actor resolution)
- [ ] Create `server/src/services/board-auth.ts` (API key service)
- [ ] Replace `server/src/routes/auth.ts` with full implementation
- [ ] Update `server/src/index.ts` to wire auth + middleware
- [ ] Fix UI endpoint in `ui/src/api/auth.ts`

### Performance Implementation
- [ ] Add compression middleware to server
- [ ] Configure static file cache headers
- [ ] Verify route lazy loading in UI
- [ ] Add preload hints for critical assets
- [ ] Configure build for optimal chunking

---

## 4. Deployment Mode Configuration

### Environment Variables
```
COMPANY_DAI_DEPLOYMENT_MODE=local_trusted|authenticated
COMPANY_DAI_HOST=localhost:3001
COMPANY_DAI_AUTH_SECRET=<secret-key-for-jwt>
```

### Default Behavior
- Development (no env set): `local_trusted`
- Production: `authenticated`

### Port Configuration
- Default port: `3001`
- Override via `PORT` environment variable