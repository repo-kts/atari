# Implementation Plan: Granular Permissions for Admin-Created Users

## 1. Overview

### Goal
- **Super Admin** continues to create users (Zone/State/District/Org/KVK admins) with no permission picker.
- **Admins** (Zone, State, District, Org, KVK) can also create users **within their scope**.
- When an **admin** (non–super-admin) creates a user, they must assign **granular permissions**: View, Add, Edit, Delete (the four checkboxes).
- Users created by Super Admin get full access for their role; users created by other admins get only the actions selected by that admin.

### Out of scope (for this plan)
- Per-module permissions (e.g. “View in Module A, Edit in Module B”); can be added later.
- Permission editing after user creation (can be Phase 2).

---

## 2. Data Model Changes

### 2.1 User-level permissions

Current model: permissions are **role-based** only (`Role` → `RolePermission` → `Permission` → `Module` + action).

Add **user-level** permissions so that users created by admins can have a subset of actions (View/Add/Edit/Delete) independent of role.

**Option A (recommended): `UserPermission` table**

- New model in `prisma/schema/auth.prisma`:

```prisma
model UserPermission {
  userId      Int   @map("user_id")
  permissionId Int @map("permission_id")
  user        User @relation(fields: [userId], references: [userId], onDelete: Cascade)
  permission  Permission @relation(fields: [permissionId], references: [permissionId], onDelete: Cascade)

  @@id([userId, permissionId])
  @@map("user_permissions")
}
```

- **User** model: add relation `userPermissions UserPermission[]`.
- **Permission** model: add relation `userPermissions UserPermission[]`.

**Permission records for “global” actions**

- Today, `Permission` is per `(moduleId, action)`. To support “View / Add / Edit / Delete” without per-module complexity for this feature:
  - Either ensure there is **one module** (e.g. `moduleCode: 'GLOBAL'` or `'USER_SCOPE'`) with exactly four `Permission` rows: VIEW, ADD, EDIT, DELETE.
  - Or introduce a separate store (e.g. `UserAllowedActions`) with `userId` and four booleans. The plan below assumes **Option A + one global module** so we reuse existing `Permission` and `requirePermission` logic.

**Migration**

- Create `user_permissions` table.
- Seed the four “global” permissions (VIEW, ADD, EDIT, DELETE) for the chosen module if they don’t exist.
- Run `prisma migrate dev --name add_user_permissions`.

---

## 3. Backend Implementation

### 3.1 Create user API

**Endpoint:** `POST /api/admin/users` (unchanged).

**Request body (add optional field):**

- `permissions?: ('VIEW' | 'ADD' | 'EDIT' | 'DELETE')[]`  
  - When present, must be a non-empty subset of the four actions.
  - **Super Admin:** request may omit `permissions`; no user-level permissions stored (user relies on role only).
  - **Other admins (Zone/State/District/Org/KVK):** request **must** include `permissions` (at least one). Backend validates and stores them.

**Logic:**

1. **Who can create**
   - Already allowed: `super_admin`, `zone_admin`, `state_admin`, `district_admin`, `org_admin` (and optionally add `kvk` if KVK admins should create users).

2. **Scope (hierarchy)**
   - Ensure the **creator’s** hierarchy (zoneId/stateId/districtId/orgId/kvkId) is used to constrain the **new user’s** hierarchy (e.g. new user’s zoneId must equal creator’s zoneId for a zone_admin). Use existing `getUsersForAdmin` / hierarchy validation and apply the same rules on create (admin can only create users “under” them).

3. **When creator is not Super Admin**
   - Require `permissions` in body.
   - Validate: each value in `['VIEW','ADD','EDIT','DELETE']`, no duplicates.
   - Resolve permission IDs for the chosen “global” module and the given actions.
   - Create user as today (name, email, phone, password, roleId, hierarchy IDs).
   - Create `UserPermission` rows for (new `userId`, each permissionId).

4. **When creator is Super Admin**
   - Ignore `permissions` if sent; do not create `UserPermission` rows (user gets only role-based permissions).

**Files to touch**

- `backend/controllers/userManagementController.js`: read `permissions` from `req.body`, pass to service.
- `backend/services/userManagementService.js`: add parameter `permissions`; hierarchy validation; resolve permission IDs; after user create, call new repository to insert `UserPermission`s.
- `backend/repositories/userRepository.js` or new `backend/repositories/userPermissionRepository.js`: `addUserPermissions(userId, permissionIds)`.

### 3.2 Permission check (middleware)

**Current:** `requirePermission(moduleCode, action)` checks only **role** permissions (RolePermission).

**Change:**  
- First check **user-level** permissions: if the user has **any** `UserPermission` whose `Permission.action` matches the requested action (and optionally module, if we keep module in the check), treat as allowed.
- Else fall back to current role-permission check.

This way, users created by admins with only “View” and “Edit” will pass `requirePermission(..., 'VIEW')` and `requirePermission(..., 'EDIT')` and fail for ADD/DELETE.

**Files to touch**

- `backend/middleware/auth.js`: in `requirePermission`, load `UserPermission` for `req.user.userId` (with `Permission` and optionally `Module`), then check role permissions if no user-level match.

### 3.3 List/Get user: return permissions

- **GET /api/admin/users** (list): for each user, optionally return `permissions: ['VIEW','EDIT']` (or similar) derived from `UserPermission` (and the Permission action).
- **GET /api/admin/users/:id**: return the same for the single user.

So the frontend can show “View, Edit” for users created by admins.

**Files to touch**

- `backend/services/userManagementService.js`: when building user list/single response, join or query `UserPermission` and map to action names.
- `backend/controllers/userManagementController.js`: ensure response shape includes `permissions` when present.

---

## 4. Frontend Implementation

### 4.1 Create user form

- **Existing fields:** Name, Email, Phone, Password, Confirm password, Role, and hierarchy fields (Zone/State/District/Org/KVK as applicable). Keep as is.

- **New section (only when creator is not Super Admin):**
  - Section title, e.g. “Permissions for this user”.
  - Four checkboxes: **View**, **Add**, **Edit**, **Delete** (as in the provided screenshot).
  - At least one must be selected when this section is shown.
  - On submit, send `permissions: ['VIEW','ADD','EDIT','DELETE']` (only the checked ones) in the same request as the rest of the create-user payload.

- **When creator is Super Admin:**
  - Do not show the permissions section (or show as optional and do not send `permissions`).

**Files to touch**

- `frontend/src/components/admin/CreateUserModal.tsx` (or equivalent):
  - Use auth store to get current user role.
  - If role is not `super_admin`, show the four checkboxes and require at least one.
  - Add state for selected permissions; include in `userApi.createUser` payload.

### 4.2 User list / detail (optional)

- In User Management table or user detail view, show a column or badge for “Permissions” (e.g. “View, Edit”) for users that have user-level permissions, so admins can see what they granted.

---

## 5. API Contract Summary

### POST /api/admin/users

**Body (additions):**

```ts
{
  name: string;
  email: string;
  phoneNumber?: string | null;
  password: string;
  roleId: number;
  zoneId?: number | null;
  stateId?: number | null;
  districtId?: number | null;
  orgId?: number | null;
  kvkId?: number | null;
  // New (required when creator is not super_admin):
  permissions?: ('VIEW' | 'ADD' | 'EDIT' | 'DELETE')[];
}
```

**Rules:**

- If creator is **super_admin**: `permissions` ignored; no `UserPermission` rows.
- If creator is **zone_admin** / **state_admin** / **district_admin** / **org_admin** (and optionally **kvk**): `permissions` **required**, non-empty, subset of VIEW/ADD/EDIT/DELETE; backend creates `UserPermission` for the new user.

### GET /api/admin/users & GET /api/admin/users/:id

**Response (additions):**

- For each user: `permissions?: ('VIEW'|'ADD'|'EDIT'|'DELETE')[]` when the user has any `UserPermission` rows (else omit or `[]`).

---

## 6. Checklist (implementation order)

### Phase 1 – Data & backend

- [x] Add `UserPermission` model and `User`/`Permission` relations in `prisma/schema/auth.prisma`.
- [x] Run migration and seed “global” module + four Permission rows if needed.
- [x] Repository: `addUserPermissions(userId, permissionIds)`, and optionally `getUserPermissionActions(userId)`.
- [x] Service: create user with optional `permissions`; when creator is not super_admin, require and store permissions; enforce hierarchy scope on create.
- [x] Controller: pass `permissions` from body to service; include `permissions` in list/get user responses.
- [ ] Middleware: update `requirePermission` to consider `UserPermission` first, then role.

### Phase 2 – Frontend

- [x] **Sidebar / nav:** Show Create User, Role Management, User Management to all admin roles (super_admin, zone_admin, state_admin, district_admin, org_admin, kvk) – same menu as super admin.
- [ ] Create user form: detect creator role; show View/Add/Edit/Delete checkboxes when not super_admin; validate at least one selected; send `permissions` in create payload.
- [ ] (Optional) User list/detail: show permissions for users that have user-level permissions.

### Phase 3 – Testing & docs

- [ ] Test: Super Admin creates user → no permissions section, user has no `UserPermission` rows.
- [ ] Test: Zone admin creates user with View+Edit → user has only VIEW and EDIT; requirePermission(VIEW/EDIT) passes, ADD/DELETE fail.
- [ ] Test: Hierarchy scope (e.g. zone admin cannot assign stateId outside their zone).
- [ ] Update API/README docs with `permissions` and response shape.

---

## 7. Notes

- **KVK role:** If KVK admins should create users (e.g. for their KVK), add `kvk` to the admin create-user role list in `adminRoutes.js` and apply the same hierarchy and permission rules.
- **Future:** Per-module granular permissions can be added by storing `UserPermission` per (userId, permissionId) where `Permission` is per-module; the same middleware and UI pattern can be extended.
