# Granular Permissions Implementation Plan

**Goal:** When any role/admin/user logs in, they see and can do only what is configured for their role in **Role Permission Editor** (`/role-view/:roleId/permissions`). No more hardcoded role checks; everything is driven by the permission matrix (VIEW / ADD / EDIT / DELETE per module).

---

## Current state (summary)

| Layer | Current behavior |
|-------|------------------|
| **Backend `/auth/me`** | Returns `permissions` only when the user has **user-level** permissions (UserPermission table). Role’s permissions (RolePermission) are **not** returned. |
| **Backend API routes** | User Management uses `requirePermission(moduleCode, action)`. Master data, About KVK, etc. use `requireRole(...)` only. |
| **Frontend AuthContext** | `hasPermission(action)` has no module. Admins/kvk get `true` for everything; non-admins use flat `user.permissions`. |
| **Frontend Sidebar** | Menu items are chosen by role (super_admin menu vs admin menu vs kvk vs regular). No permission check. |
| **Frontend DataManagementView** | Add/Edit/Delete visibility uses `user.role` and `routeConfig.canCreate`, not permissions. |
| **Frontend ProtectedRoute** | Uses `requiredRole` only, not module/permission. |

---

## Phase 1: Backend – Expose role permissions to the client

### 1.1 Role permissions by module (for a user)

- **Add** in `rolePermissionRepository.js` (or a new helper):
  - `getRolePermissionsByModule(roleId)`  
  - Returns: `{ [moduleCode: string]: string[] }` (e.g. `{ 'user_management_users': ['VIEW','ADD','EDIT','DELETE'], 'all_masters_zone_master': ['VIEW','EDIT'], ... }`).
- Implementation: get all `RolePermission` for `roleId`, join to `Permission` and `Module`, group by `module.moduleCode`, collect `Permission.action`.

### 1.2 Effective permissions for current user

Implemented in `authService.buildPermissionsByModule(roleId, roleName, userId)`.

**Merge rule — intersection (role is the ceiling, user-level is a restriction):**

| Role type | Merge behaviour |
|-----------|----------------|
| `*_user` roles (`state_user`, `district_user`, `org_user`) | `effective = getRolePermissionsByModule(roleId) ∩ getUserPermissionActions(userId)` applied across **every** moduleCode. The role defines the maximum set of actions; the user's individually assigned actions act as a downward filter. Modules where the intersection yields zero actions are **dropped** from `permissionsByModule`. If `getUserPermissionActions` returns an empty list (no individual actions set), the role's permissions are used unchanged. |
| All other roles (`super_admin`, `zone_admin`, …, `kvk`) | `getRolePermissionsByModule(roleId)` is returned as-is. `getUserPermissionActions` is **never called** — no user-level filtering. |

**Super Admin:** Always authoritative. Full access is guaranteed by seeding the `super_admin` role with all modules × all actions via `seedSuperAdminPermissions.js`. No runtime bypass — `super_admin` goes through the same code path as every other role.

**Example — conflicting entries for a `state_user`:**
```text
Role permissions (ceiling):
  all_masters_zone_master:  [VIEW, ADD, EDIT, DELETE]
  all_masters_states_master: [VIEW, ADD]

User-level actions (filter):
  [VIEW, EDIT]

Effective permissionsByModule:
  all_masters_zone_master:  [VIEW, EDIT]   ← intersection of {VIEW,ADD,EDIT,DELETE} ∩ {VIEW,EDIT}
  all_masters_states_master: [VIEW]        ← intersection of {VIEW,ADD} ∩ {VIEW,EDIT}
  // modules not in role permissions are absent regardless of user-level actions
```

**Return value:** `permissionsByModule: Record<string, ('VIEW'|'ADD'|'EDIT'|'DELETE')[]>` — emitted in both `/auth/login` and `/auth/me` responses and embedded in the JWT access token under the `permissions` key.

### 1.3 Auth API contract (frontend types)

- **Extend** `ApiUser` in `frontend/src/services/authApi.ts` (and align `User` in `types/auth.ts`):
  - `permissionsByModule?: Record<string, ('VIEW'|'ADD'|'EDIT'|'DELETE')[]>`.
- **Map** in AuthContext: when mapping API user to `User`, set `user.permissionsByModule` from the API.

---

## Phase 2: Frontend – Permission checks by module

### 2.1 AuthContext: `hasPermission(action, moduleCode?)`

- **Change** `hasPermission` in `AuthContext.tsx`:
  - Signature: `hasPermission(action: PermissionAction, moduleCode?: string): boolean`.
  - Logic:
    - If `moduleCode` is provided and `user.permissionsByModule` exists:
      - If `user.permissionsByModule[moduleCode]` exists, return `user.permissionsByModule[moduleCode].includes(action)`.
      - Else return `false` (no access to that module).
    - If no `moduleCode` (legacy calls, e.g. User Management before we pass module):
      - For **User Management** only: treat as `moduleCode === 'user_management_users'` and check `permissionsByModule['user_management_users']`.
  - **No runtime bypass for any role** — everyone including `super_admin` is restricted by `permissionsByModule`. The Role Permission Editor is the single source of truth. Ensure `super_admin` is seeded with all modules × all actions so it retains full access via the DB, not via a hardcoded bypass.

### 2.2 Route config: add `moduleCode` to every route

- **Extend** `RouteConfig` in `routeConfig.ts`: add optional **`moduleCode?: string`**.
- **Set** `moduleCode` for every route that corresponds to a **module** in the Role Permission Editor (same codes as in `backend/scripts/seedModulesForRolePermissions.js`), e.g.:
  - All Masters: `all_masters_zone_master`, `all_masters_states_master`, `all_masters_organization_master`, `all_masters_districts_master`, `all_masters_oft_master`, … (one per master submenu).
  - Role Management: `role_management_roles` (and permissions page can use same or a sub-module if you add one).
  - User Management: `user_management_users`.
  - About KVKs: `about_kvks_view_kvks`, `about_kvks_bank_account_details`, `about_kvks_employee_details`, …
  - Achievements, Performance Indicators, Miscellaneous, Digital, Swachh Bharat, Meetings: match by submenu name to `moduleCode`.
  - Standalone: `module_images`, `targets`, `log_history`, `notifications`, `reports`.
- **Helper**: add `getRouteConfig(pathname)` (already exists); ensure it returns `moduleCode` when the route matches. For dynamic routes (e.g. `/forms/about-kvk/view-kvks/:id/employees`), derive module from path (e.g. “employees” → `about_kvks_employee_details`).

### 2.3 Sidebar: show only modules where user has VIEW

- **Change** `Sidebar.tsx`:
  - For each menu item (and each child in dropdowns), define which **moduleCode**(s) it represents (single code per item, or one per child).
  - Compute visible menu items: filter `menuItems` (and their `children`) so that the user has **VIEW** for the item’s `moduleCode`: `hasPermission('VIEW', moduleCode)`.
  - If a parent has no children left after filtering, you can hide the parent or show it with no children (product decision).
  - Menu items that are pure navigation (e.g. Dashboard) can either have a dedicated module (e.g. `dashboard`) with VIEW in Role Editor, or be shown to everyone when authenticated; recommend a small “dashboard” module so it’s configurable.

### 2.4 DataManagementView: Add/Edit/Delete by permission

- **Change** `DataManagementView.tsx`:
  - Get `moduleCode` from current route: `routeConfig?.moduleCode` (from `getRouteConfig(location.pathname)`).
  - **Add button:** `showAddButton = hasPermission('ADD', moduleCode)` (and keep any entity-specific rules only if needed, e.g. KVK scope).
  - **Edit:** `canEditItem(item)`: use `hasPermission('EDIT', moduleCode)` plus any scope (e.g. KVK can edit only own data); remove hardcoded `super_admin` / role checks for “can edit”.
  - **Delete:** `canDeleteItem(item)`: use `hasPermission('DELETE', moduleCode)` plus same scope rules.
  - **View:** If the user does not have `hasPermission('VIEW', moduleCode)`, show an “Access denied” or redirect to dashboard (optional; route-level guard can do this too).

### 2.5 ProtectedRoute: require VIEW for route’s module

- **Change** `ProtectedRoute.tsx`:
  - Add optional prop: **`requiredModuleCode?: string`** (or derive from route).
  - If `requiredModuleCode` is set: require `hasPermission('VIEW', requiredModuleCode)`. If false, show the same “Access Restricted” UI and link to dashboard.
  - **App.tsx**: For dashboard routes, pass `requiredModuleCode` per route (or from a route config) instead of/in addition to `requiredRole`. Option: one wrapper that reads current path, gets `getRouteConfig(path).moduleCode`, and checks VIEW for that module; then you don’t need to pass `requiredRole` for granular pages.

### 2.6 User Management page

- **Change** `UserManagement.tsx`:
  - Use `hasPermission('ADD', 'user_management_users')`, `hasPermission('EDIT', 'user_management_users')`, `hasPermission('DELETE', 'user_management_users')` (and VIEW for showing the page). Remove reliance on global `hasPermission('ADD')` so it’s consistent with the rest.

### 2.7 Role Permission Editor

- **Access:** Only users who have VIEW (and optionally EDIT) for `role_management_roles` should see the list and the permissions page. Use `hasPermission('VIEW', 'role_management_roles')` and `hasPermission('EDIT', 'role_management_roles')` where appropriate.

---

## Phase 3: Backend API – Enforce permission by module (optional but recommended)

- **Replace** `requireRole(...)` with `requirePermission(moduleCode, action)` on all relevant routes:
  - Master data routes: each resource (zones, states, districts, …) maps to a moduleCode (e.g. zones → `all_masters_zone_master`). Use `requirePermission('all_masters_zone_master', 'VIEW')` for GET, `requirePermission(..., 'ADD')` for POST, etc.
  - About KVK routes: map each sub-resource (bank-accounts, employees, staff-transferred, infrastructure, vehicles, equipments, farm-implements) to the corresponding `about_kvks_*` moduleCode; use `requirePermission(moduleCode, action)`.
- This keeps API and UI in sync: if Role Editor revokes ADD for a module, both the button and the API will deny the action.

---

## Phase 4: Super Admin and seeding

- **JWT cookie size constraint — bitmask encoding:** Browsers silently reject `Set-Cookie` headers exceeding ~4 KB. With 74+ modules, the permissions payload would overflow the cookie. Fix: `generateAccessToken` in `jwt.js` encodes permissions as a bitmask integer per module (`VIEW=1, ADD=2, EDIT=4, DELETE=8`), cutting payload by ~50%. `authenticateToken` in `auth.js` decodes the bitmask back to `string[]` format so `requirePermission` and all downstream consumers are unchanged. Legacy tokens with string arrays are handled transparently.
- **Super Admin:** `buildPermissionsByModule()` in `authService.js` returns an **empty** map for `super_admin` (skips the DB query entirely). Full access is enforced by explicit bypasses:
  - **Backend:** `requirePermission` and `requireAnyPermission` in `auth.js` — `if (req.user.roleName === 'super_admin') return next()`.
  - **Frontend:** `hasPermission` in `AuthContext.tsx` — `if (user.role === 'super_admin') return true`.
  - The `roleName` in the JWT is the trusted source for the bypass; no separate permissions payload is needed.
- **Super Admin in Role Permission Editor:** `seedSuperAdminPermissions.js` still assigns every permission to `super_admin` in the database so that the Role Editor UI shows a complete matrix. These DB rows are authoritative for the Role Editor display but are **not** loaded into the JWT.
- **Seeding:** Run scripts in this order:
  1. `seedModulesForRolePermissions.js` — creates all modules and their four actions (VIEW/ADD/EDIT/DELETE).
  2. `seedSuperAdminPermissions.js` — assigns every permission to the `super_admin` role (for Role Editor display).
  3. `seedAllRolePermissions.js` or configure other roles manually via the Role Editor.

---

## Phase 5: Testing and edge cases

- **No `permissionsByModule` (old client / migration):** If `permissionsByModule` is missing, frontend can fall back to “deny all” or to previous role-based behavior during transition; prefer “deny all” for security.
- **User-level permissions:** Backend already merges user-level permissions in `requirePermission`. In `getCurrentUser`, when building `permissionsByModule`, for the USER_SCOPE / user_management module, merge in the user’s UserPermission actions so that admin-created users with custom permissions still see the right actions.
- **KVK / scope:** Keep scope rules (e.g. KVK can edit only own KVK’s data) in addition to `hasPermission('EDIT', moduleCode)`; do not remove scope checks.

---

## File checklist (summary)

| Area | File(s) | Change |
|------|--------|--------|
| Backend | `repositories/rolePermissionRepository.js` | Add `getRolePermissionsByModule(roleId)` |
| Backend | `services/authService.js` | Build and return `permissionsByModule` in getCurrentUser; handle user-level merge for USER_SCOPE |
| Backend | `controllers/authController.js` | Ensure response includes `permissionsByModule` (if not already in user object) |
| Backend | Routes (master, about KVK, etc.) | Optionally switch from `requireRole` to `requirePermission(moduleCode, action)` |
| Frontend | `services/authApi.ts`, `types/auth.ts` | Add `permissionsByModule` to ApiUser/User |
| Frontend | `contexts/AuthContext.tsx` | New `hasPermission(action, moduleCode?)` using `permissionsByModule`; remove admin full-access bypass (or only for super_admin) |
| Frontend | `config/routeConfig.ts` | Add `moduleCode` to every route that has a corresponding module in Role Editor |
| Frontend | `components/layout/Sidebar.tsx` | Add moduleCode to menu items; filter by `hasPermission('VIEW', moduleCode)` |
| Frontend | `pages/dashboard/shared/DataManagementView.tsx` | Use `hasPermission('ADD', moduleCode)`, `hasPermission('EDIT', moduleCode)`, `hasPermission('DELETE', moduleCode)` and optional VIEW check |
| Frontend | `components/auth/ProtectedRoute.tsx` | Add `requiredModuleCode`, check `hasPermission('VIEW', requiredModuleCode)` |
| Frontend | `App.tsx` | Pass `requiredModuleCode` (or derive from route) for dashboard routes |
| Frontend | `pages/admin/UserManagement.tsx` | Use `hasPermission(..., 'user_management_users')` |
| Frontend | Role Permission Editor / Role list | Guard with `hasPermission('VIEW', 'role_management_roles')` and `hasPermission('EDIT', 'role_management_roles')` |

---

## Order of implementation

1. **Backend:** `getRolePermissionsByModule` → `getCurrentUser` returns `permissionsByModule`.
2. **Frontend types + AuthContext:** Add `permissionsByModule`, implement `hasPermission(action, moduleCode)`.
3. **Route config:** Add `moduleCode` to all routes that map to Role Editor modules.
4. **DataManagementView:** Switch to `hasPermission(..., moduleCode)` for Add/Edit/Delete (and optional VIEW).
5. **Sidebar:** Filter menu by VIEW permission per module.
6. **ProtectedRoute + App:** Require VIEW per module for protected pages.
7. **User Management + Role Management:** Use module-scoped `hasPermission`.
8. **Backend routes (optional):** Migrate from `requireRole` to `requirePermission(moduleCode, action)` for master data and About KVK.

After this, the only source of truth for “what can this role do?” is the Role Permission Editor; login simply loads that matrix into `permissionsByModule` and the app respects it everywhere.
