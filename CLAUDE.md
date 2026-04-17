# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Monorepo with two independent apps (no workspace tooling) — install & run each separately:

- `backend/` — Node.js + Express + Prisma (Postgres/Neon). CommonJS (`"type": "commonjs"`).
- `frontend/` — React 19 + TypeScript + Vite + Tailwind v4 + shadcn. Bun is the package manager (`bunfig.toml`, `bun.lock`).

Top-level `.md` files (`ARCHITECTURE_FLOW.md`, `PROJECT_DEEP_DIVE.md`, `GRANULAR_PERMISSIONS_PLAN.md`, `IMPLEMENTATION_PLAN.md`, `IMPLEMENTATION_CHECKLIST.md`, `TIMELINE.md`) and `docs/` are design references, not runnable code.

## Common commands

### Backend (`cd backend`)
```bash
npm run dev                 # start dev server (node --watch), default port 5000
npm run db:generate         # prisma generate
npm run db:migrate          # prisma migrate dev (creates + applies migration)
npm run db:migrate:deploy   # prisma migrate deploy (prod)
npm run db:push             # push schema without migration history
npm run db:studio           # Prisma Studio
npm run seed:all            # full seed (roles, permissions, users, masters, forms, kvk)
npm run seed:roles | seed:permissions | seed:users | seed:masters | seed:forms | seed:kvk
```
No test runner configured (`npm test` errors out). One-off debug scripts live at repo root (`check_*.js`, `debug_*.js`, `seed_nari_only.js`) — run with `node <file>.js` from `backend/` so they resolve `./config/prisma.js`.

### Frontend (`cd frontend`)
```bash
bun install
bun run dev                 # vite dev server, default port 5173
bun run build               # vite build
bun run lint  | lint:fix
bun run format | format:check
bun run type-check          # tsc --noEmit
```

### Environment
- Backend requires `DATABASE_URL` (runtime, may be Prisma Accelerate `prisma+`-style) AND `DIRECT_URL` (for Prisma CLI/migrations — must be a standard `postgresql://` URL). See `backend/prisma.config.ts`.
- Frontend uses `VITE_API_URL`; when unset it calls `/api` and relies on Vite's dev proxy so cookies stay same-origin (`frontend/src/config/api.ts`).
- Frontend↔backend auth is cookie-based (`credentials: 'include'`); backend CORS is locked to `FRONTEND_URL` / localhost (`backend/index.js`).

## Architecture

### Backend layering (strict)
`routes/ → controllers/ → services/ → repositories/ → prisma` — do not bypass layers. Every layer is mirrored inside subfolders for the three major domains: `forms/`, `all-masters/`, `reports/`.

- **`routes/index.js`** is the single mount point; new features add one line here. URL convention: `/api/forms/<category>/<form>` (categories: `about-kvk`, `achievements`, `achievements/projects`, `performance`, `miscellaneous`, `digital-information`). `/api/admin/masters/*` for master data, `/api/reports/*` for reports.
- **Two cross-cutting middlewares** wrap every `/api/forms` route in that order: `validateFormRobustness` (number/date coercion) then `reportingYearNormalizer` (resolves the active reporting year). Any new form route inherits both automatically via `router.use('/forms', …)`.
- **Auth** (`middleware/auth.js`): reads `accessToken` HTTP-only cookie, verifies JWT, then calls `permissionResolverService` to hydrate `req.user` with `userId`, `roleId`, `roleName`, scope IDs (`zoneId/stateId/districtId/orgId/kvkId`), and `permissionsByModule`. Permissions and user profiles are Redis-cached (`services/cache/redisCacheService.js`) with DB fallback — prefer the resolver service over direct repository calls.
- **Prisma schema is multi-file**, split between two folders: `prisma/superadmin/` (roles, users, zones, masters, cross-KVK entities like OFT/FLD/publications) and `prisma/kvk/` (per-KVK data: about-kvk, achievements, performance-indicators, meetings, soil_water, etc.). The `prisma` folder is passed as a whole in `prisma.config.ts` — Prisma globs all `.prisma` files. Migrations live in `prisma/migrations/`.
- A one-off baseline exists for user-permissions: `npm run db:baseline:user-permissions` (applies a specific SQL file then marks the migration resolved).

### Frontend architecture
- **Routing is declarative and data-driven** (`src/App.tsx`): static routes for dashboard/admin pages, then arrays of route configs (`projectsRoutes`, `allMastersRoutes`, `aboutKvkRoutes`, `achievementsRoutes`, `performanceIndicatorRoutes`, `miscellaneousRoutes`, `digitalInformationRoutes`, `swachhtaBharatAbhiyaanRoutes`, `meetingsRoutes`) exported from `src/config/route/` are `.map`'d into `<Route>` elements, most rendering the generic `DataManagementView` with `title`/`description`/`fields`. **When adding a new form/module, add a route entry to the relevant array instead of writing a new route block.**
- **`ProtectedRoute`** gates by `requiredModuleCode` (a permission key), `requiredRole`, and/or `deniedRoles`. The legacy `ALL_MASTER_BLOCKED_ROLES = ['kvk_admin', 'kvk_amdin']` preserves a historical typo — don't "fix" it without coordinating, existing data may reference the misspelled role.
- **Auth** (`src/contexts/AuthContext.tsx`): TanStack Query owns the `currentUser` cache. `useAuth()` exposes `hasRole`, `hasPermission(action, moduleCode)`, and `canActOnRole` (uses the role hierarchy). `hasPermission` returns false when `moduleCode` is omitted — always pass it explicitly.
- **Role hierarchy** (`src/constants/roleHierarchy.ts`): `super_admin=0` (highest) → `org_user=9`. `CREATABLE_ROLES_MAP` defines which roles each admin may create; `outranks`/`outranksOrEqual` gate admin actions. Mirror role checks on the backend — the frontend hierarchy is UX-only.
- **API layer** (`src/services/api.ts`): single `apiClient` singleton wraps `fetch` with: credentials:'include', 401 refresh-and-retry gated by a mutex `refreshPromise` (so concurrent 401s share one refresh), and a `setOnSessionExpired` callback wired by `App.tsx` to log the user out. Per-domain files (`aboutKvkApi.ts`, `dashboardApi.ts`, `reportApi.ts`, etc.) are thin wrappers on `apiClient`. **Do not call `fetch` directly** — always go through `apiClient` so refresh & error normalization happen.
- **State**: TanStack Query for server state (no Redux/Zustand). Domain hooks live in `src/hooks/` (`useMasterData`, `useOftFldData`, `useCfldWorkflow`, `useTargets`, …) — reuse these before writing new data hooks.
- **UI**: shadcn components in `src/components/ui/`, Tailwind v4 via `@tailwindcss/vite`. Path alias `@/*` → `./src/*`. 4-space indent, single quotes, no semicolons, 80-char lines (prettier enforced) — see `frontend/CONTRIBUTING.md`.

## Conventions & gotchas

- **Commit style**: conventional prefixes (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, etc.) per `frontend/CONTRIBUTING.md`. Recent history uses short topical prefixes (`dashboard:`, `filter/dates:`, `report/dist-level-data`) — follow the local pattern you see on `git log`.
- **`kvk_amdin` typo** is a known legacy role name co-existing with `kvk_admin` in some gates. Grep before changing anything role-related.
- **Reporting year** is request-scoped: `middleware/reportingYearNormalizer.js` mutates the form payload. Don't re-implement year logic in controllers — trust the normalized value.
- **Multi-file Prisma**: the schema is *not* one `schema.prisma`. Models for a new form go into the appropriate folder under `prisma/kvk/` (per-KVK data) or `prisma/superadmin/` (global/master data). `prisma/superadmin/schema.prisma` only holds the `generator` + `datasource` blocks.
- **Serverless-aware entry**: `backend/index.js` exports the Express `app` and only calls `listen` when not on Vercel/Lambda. Don't add top-level side effects that assume a long-lived process without guarding on the same env vars.
