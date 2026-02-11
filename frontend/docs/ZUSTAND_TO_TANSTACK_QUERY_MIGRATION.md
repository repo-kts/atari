# Migration Plan: Zustand → TanStack Query

This document outlines the plan to remove Zustand and rely entirely on **TanStack Query** for server state, with minimal React Context only where necessary (e.g. logout callback from API layer).

---

## Current State

| Store | Purpose | Consumers | Persistence |
|-------|---------|-----------|------------|
| **authStore** | User, login/logout, checkAuth, hasRole, hasPermission | 18+ files (Login, ProtectedRoute, Header, Sidebar, UserManagement, CreateUserModal, Dashboard, KVK forms, etc.) | `persist` (user + isAuthenticated) |
| **masterDataStore** | Zones, States, Districts, Organizations + CRUD + filters | `useMasterData.ts` only → DataManagementView, AboutKvkForms | None |
| **dashboardStore** | Mock dashboard data (year, search, filter) | **Unused** (only self-reference) | None |

---

## Target Architecture

- **Server state** (users, roles, master data, KVK data, etc.) → **TanStack Query** (queries + mutations, cache, invalidation).
- **Auth “state”** → Derived from TanStack Query:
  - `useQuery(['currentUser'], getCurrentUser)` → `user` + `isAuthenticated = !!data`
  - `useMutation` for login / logout; on success: invalidate or set `currentUser`, clear cache as needed.
- **Minimal Context** (optional): Only if we need a way for the API layer to trigger “logout” (e.g. `setOnSessionExpired`) without depending on a store. Options:
  - **A)** Pass a `logout` callback from a React Context (provided at app root) into `setOnSessionExpired`.
  - **B)** Invalidate `currentUser` and remove query from cache on 401 in the API client, and have the app treat “no currentUser” as logged out (no explicit logout callback).
- **Dashboard store**: Remove or replace with `useQuery` + mock data later; not blocking.

---

## Phase 1: Auth → TanStack Query + Optional Context

**Goal:** Replace `authStore` with TanStack Query for current user and auth actions; keep same API surface for consumers via a single `useAuth()` hook (from Context or a dedicated auth module).

### 1.1 Create auth query + mutations (no Zustand)

- **New file:** `src/hooks/useAuth.ts` (or `src/contexts/AuthContext.tsx` that uses these hooks internally).

**Queries:**

- `useQuery(['currentUser'], authApi.getCurrentUser, { retry: false, staleTime: Infinity })`
  - Derive: `user = data`, `isAuthenticated = data != null && !error`, `isLoading`, `error`.

**Mutations:**

- **Login:** `useMutation(authApi.login, { onSuccess: () => queryClient.setQueryData(['currentUser'], mapApiUserToUser(response)) })`  
  - Or refetch: `queryClient.invalidateQueries(['currentUser'])`.
- **Logout:** `useMutation(authApi.logout, { onSuccess: () => queryClient.removeQueries(['currentUser']) })`.

**Persistence:**

- Today: Zustand persist stores `user` + `isAuthenticated`.
- After: No persistence of user in frontend. Session is in HTTP-only cookies; on every full reload we run `getCurrentUser()` (via the same `useQuery`). So no localStorage for auth state.

**Session expiry (401):**

- In `api.ts`, `setOnSessionExpired` currently calls `useAuthStore.getState().logout()`.
- **Option A:** Create an `AuthProvider` that holds a ref to `logout` and passes it to `setOnSessionExpired(useRefToLogout.current)` in a `useEffect`. All auth state is still from React Query; Context only provides `logout` for the API.
- **Option B:** In the API client, on 401 after failed refresh: call `queryClient.removeQueries(['currentUser'])` and optionally `queryClient.clear()`. For that, the API module needs access to `QueryClient` (e.g. passed once at app init from `main.tsx` or `App.tsx`). Then no auth Context needed for logout.

### 1.2 Expose a single `useAuth()` API

- Implement:
  - `user`, `isAuthenticated`, `isLoading`, `error`, `clearError`
  - `login(credentials)`, `logout()`
  - `checkAuth()` → can be “refetch currentUser” (e.g. `queryClient.invalidateQueries(['currentUser'])` and await refetch).
  - `hasRole(role)`, `hasPermission(action)` → computed from `user` (same logic as today).

So components keep calling `useAuth()` instead of `useAuthStore()`; only the implementation changes.

### 1.3 Wire session expiry

- Either AuthProvider + `setOnSessionExpired(logout)` (Option A) or pass `QueryClient` into the API and clear/invalidate `currentUser` on session expiry (Option B).

### 1.4 Replace all `useAuthStore` usages

- **Files to update:**  
  `App.tsx`, `Login.tsx`, `ProtectedRoute.tsx`, `Header.tsx`, `Sidebar.tsx`, `Dashboard.tsx`, `KVKDashboard.tsx`, `UserManagement.tsx`, `CreateUserModal.tsx`, `DataManagementView.tsx`, `AboutKvkForms.tsx`, and all About KVK form components (AddBankAccount, AddEmployee, AddEquipment, AddEquipmentDetails, AddFarmImplement, AddInfrastructure, AddVehicle, AddVehicleDetails).
- **Change:** `useAuthStore()` → `useAuth()` (same returned shape).

### 1.5 Remove auth store and persistence

- Delete or gut `src/stores/authStore.ts`.
- Remove any `persist` usage for auth.

### 1.6 ProtectedRoute

- Use `useAuth()` for `isAuthenticated`, `user`, `isLoading`, `hasRole`, and for “check on mount”: call `checkAuth()` (refetch current user) when not authenticated. No Zustand.

---

## Phase 2: Master Data → TanStack Query

**Goal:** Remove `masterDataStore` and `useMasterData`’s dependency on it; implement everything with TanStack Query.

### 2.1 Create query/mutation hooks for master data

- **New file:** `src/hooks/useMasterDataQuery.ts` (or split into `useZones`, `useStates`, etc. in one file).

**Queries (replace store reads):**

- `useZones(params?)`  → `queryKey: ['zones', params]`, `queryFn: () => masterDataApi.getZones(params).then(r => r.data)`.
- `useStates(params?)` → `queryKey: ['states', params]`.
- `useDistricts(params?)` → `queryKey: ['districts', params]`.
- `useOrganizations(params?)` → `queryKey: ['organizations', params]`.

**Optional dependent queries (for dropdowns):**

- `useStatesByZone(zoneId)` → enabled when `zoneId != null`, `queryKey: ['states', 'byZone', zoneId]`.
- `useDistrictsByState(stateId)` → same idea.
- `useOrganizationsByState(stateId)` → same idea.

**Mutations (replace store updates):**

- Create/Update/Delete for each entity (zones, states, districts, organizations).
- Each mutation’s `onSuccess`: invalidate the relevant query keys (e.g. `['zones']`, `['states']`, etc.).

**Derived “selectors”:**

- `getStatesByZone(zoneId)` → derive from `useStates()` data (filter by zoneId), or use `useStatesByZone(zoneId)`.
- Same for districts by state, organizations by state.

### 2.2 Rewrite `useMasterData(entityType)`

- **File:** `src/hooks/useMasterData.ts`.
- Use the new query hooks internally (e.g. call `useZones()`, `useStates()`, etc. and switch by `entityType`).
- Return the same interface: `data`, `loading`, `error`, `fetchAll`, `create`, `update`, `remove`, `setFilters`, `resetFilters`, `clearError`.
- `fetchAll` → `refetch()` of the active query.
- `setFilters` / `resetFilters` → update query key (e.g. pass params into `useZones(params)`) or use a small local state for filter params and pass them into the query key so refetch uses new params.
- No `useMasterDataStore` usage.

### 2.3 Rewrite `useRelatedData` and `useMasterDataStats`

- **useRelatedData:**  
  - Either use the same query hooks and expose `getStatesByZone` as “fetch” that uses `queryClient.fetchQuery(['states', 'byZone', zoneId])`, or derive from `useStates()` etc.
  - Remove `getStatesByZoneFromStore` etc.; consumers use the query-backed getters or direct hooks.
- **useMasterDataStats:**  
  - `useQuery(['masterData', 'stats'], () => masterDataApi.getStats().then(r => r.data))` and return `{ data, isLoading, error, refetch }`. No manual `fetchStats` callback needed, or keep a `refetch` alias.

### 2.4 Update consumers

- **DataManagementView.tsx** – already uses `useMasterData(entityType)`; no API change.
- **AboutKvkForms.tsx** – uses `useMasterData('zones')`; no API change.
- Any other consumer of `useMasterData` or `useRelatedData`/`useMasterDataStats`: ensure they use the new hook API (same surface).

### 2.5 Remove master data store

- Delete `src/stores/masterDataStore.ts`.

---

## Phase 3: Admin/User & Roles → TanStack Query

**Goal:** Ensure User Management and Role Management use TanStack Query only (no local useState/useEffect for server data).

### 3.1 User Management

- **New/use:** `src/hooks/useUserManagement.ts` (or similar):
  - `useUsers(filters)` → `useQuery(['users', filters], () => userApi.getUsers(filters))`.
  - `useRoles()` → `useQuery(['roles'], userApi.getRoles)` (shared with CreateUserModal and RoleManagement).
  - `useCreateUser()` → `useMutation(userApi.createUser, { onSuccess: invalidate ['users'] })`.
  - `useUpdateUser()` → same + invalidate `['users']`.
  - `useDeleteUser()` → same + invalidate `['users']`.
- **UserManagement.tsx:** Use these hooks; remove local `useState`/`useEffect` for users and roles.
- **CreateUserModal.tsx:** Use `useRoles()` and `useCreateUser()` (and any hierarchy data from master data hooks). Already uses `useAuth()` after Phase 1.

### 3.2 Role Management

- **RoleManagement.tsx:** Use `useRoles()` from the same hooks file; remove local fetch and state for roles.

### 3.3 RolePermissionEditor

- If it fetches role permissions or updates them, add:
  - `useRolePermissions(roleId)` → `useQuery(['rolePermissions', roleId], ...)`.
  - `useUpdateRolePermissions()` → `useMutation(..., { onSuccess: invalidate ['rolePermissions', roleId] })`.
- Replace any local state/useEffect with these.

---

## Phase 4: Dashboard Store & Cleanup

### 4.1 Dashboard store

- **dashboardStore** is currently **unused** (only self-reference).
- **Options:**  
  - Remove `src/stores/dashboardStore.ts` and any imports.  
  - Or, if a dashboard page will use it later: replace with `useQuery(['dashboard', year], () => mockFetchDashboard(year))` and local state for `searchQuery`/filter only.

### 4.2 Remove Zustand dependency

- After Phases 1–3 (and 4.1): no remaining imports of Zustand.
- Remove `zustand` (and `zustand/middleware` if used) from `package.json` and run install.

### 4.3 Global defaults and session expiry

- In `main.tsx`, keep/expand QueryClient default options (staleTime, retry, refetchOnWindowFocus, etc.).
- If using Option B for session expiry, ensure `api.ts` has a way to get `QueryClient` (e.g. a module-level `setQueryClient(client)` called from `App` or `main.tsx`).

---

## File Checklist

### New or heavily modified files

| File | Action |
|------|--------|
| `src/hooks/useAuth.ts` or `src/contexts/AuthContext.tsx` | **Create** – currentUser query, login/logout mutations, hasRole/hasPermission, expose useAuth() |
| `src/hooks/useMasterDataQuery.ts` | **Create** – zones/states/districts/organizations queries + mutations |
| `src/hooks/useMasterData.ts` | **Rewrite** – use useMasterDataQuery, no store |
| `src/hooks/useUserManagement.ts` | **Create** – users, roles, create/update/delete user, role permissions |

### Files to update (auth)

| File | Change |
|------|--------|
| `src/App.tsx` | setOnSessionExpired(logout from useAuth or QueryClient); no useAuthStore |
| `src/main.tsx` | Optionally pass queryClient to API for session expiry |
| `src/pages/auth/Login.tsx` | useAuth() instead of useAuthStore() |
| `src/components/auth/ProtectedRoute.tsx` | useAuth(); checkAuth = refetch currentUser |
| `src/components/layout/Header.tsx` | useAuth() |
| `src/components/layout/Sidebar.tsx` | useAuth() |
| `src/pages/dashboard/Dashboard.tsx` | useAuth() |
| `src/pages/dashboard/KVKDashboard.tsx` | useAuth() |
| `src/pages/admin/UserManagement.tsx` | useAuth() + useUsers/useRoles (Phase 3) |
| `src/components/admin/CreateUserModal.tsx` | useAuth() + useRoles/useCreateUser (Phase 3) |
| `src/pages/dashboard/shared/DataManagementView.tsx` | useAuth() |
| `src/pages/dashboard/shared/forms/AboutKvkForms.tsx` | useAuth() (useMasterData already updated in Phase 2) |
| All `src/pages/dashboard/forms/about-kvk/Add*.tsx` | useAuth() |

### Files to update (master data)

| File | Change |
|------|--------|
| `src/pages/dashboard/shared/DataManagementView.tsx` | No code change if useMasterData API unchanged |
| `src/pages/dashboard/shared/forms/AboutKvkForms.tsx` | No code change if useMasterData API unchanged |

### Files to remove

| File | When |
|------|------|
| `src/stores/authStore.ts` | After Phase 1 |
| `src/stores/masterDataStore.ts` | After Phase 2 |
| `src/stores/dashboardStore.ts` | Phase 4 (or when replacing with useQuery) |

---

## Order of Execution (Summary)

1. **Phase 1 – Auth**  
   Implement auth with TanStack Query + optional Context; replace all useAuthStore with useAuth(); remove authStore.

2. **Phase 2 – Master data**  
   Implement useMasterDataQuery; rewrite useMasterData and related helpers; remove masterDataStore.

3. **Phase 3 – Users & roles**  
   Implement useUserManagement (users, roles, mutations); refactor UserManagement, CreateUserModal, RoleManagement, RolePermissionEditor.

4. **Phase 4 – Dashboard & cleanup**  
   Remove or replace dashboardStore; remove Zustand from the project; finalize session-expiry wiring and QueryClient defaults.

---

## Risk and Rollback

- **Auth:** Biggest behavioral change. Keep the same `useAuth()` surface so that only one module (AuthContext or useAuth) needs to be correct. Test: login, logout, refresh, 401 session expiry, ProtectedRoute, role/permission checks.
- **Master data:** Contained to useMasterData and DataManagementView/AboutKvkForms. Rollback = restore masterDataStore and old useMasterData.
- **Rollback:** Keep a branch or tag before each phase so you can revert phase-by-phase if needed.

---

## Testing Focus

- Login → dashboard; logout → login; refresh page while logged in (cookie session restored, currentUser refetched).
- 401 after token expiry: refresh fails → user is logged out and redirected to login.
- User Management: list, filter, create user, delete user; list refetches after create/delete.
- Role Management: list roles; RolePermissionEditor: load and save permissions.
- All Masters / DataManagementView: list entities, CRUD, filters (zones, states, districts, organizations).
- About KVK forms: hierarchy (zones/states/districts/org) loads and persists correctly.

Once this plan is executed, the frontend will be fully on TanStack Query with no Zustand.
