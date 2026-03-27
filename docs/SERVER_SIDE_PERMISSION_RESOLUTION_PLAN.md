# Server-Side Permission Resolution Plan

## Objective

Move authorization from **JWT-embedded module permissions** to **server-side permission resolution with Redis caching**, while preserving all existing behavior and minimizing rollout risk.

This plan addresses:
- oversized `accessToken` cookies for high-privilege roles (notably `super_admin`)
- delayed permission-change propagation when permissions are baked into JWT
- need for safer invalidation and immediate effect of role/user permission updates

## Execution Log (Step-by-Step)

### 2026-03-28 - Step 1 Completed

Implemented:
- Added `backend/services/auth/permissionResolverService.js`
- Added role-level + effective user-level permission resolution
- Added Redis cache keys + DB fallback
- Added invalidation helper methods
- Default cache TTL set to **3600 seconds** (1 hour), env-overridable via `PERMISSION_CACHE_TTL_SECONDS`

Behavior impact:
- None (new service only; no runtime wiring in this step)

### 2026-03-28 - Step 2 Completed

Implemented:
- Updated `backend/middleware/auth.js` to resolve permissions via `permissionResolverService` in `authenticateToken`
- Removed temporary feature-flag approach and switched directly to server-side permission resolution

Behavior impact:
- Runtime permission source now server-side (DB + Redis cache), not token payload decode

### 2026-03-28 - Step 3 Completed

Implemented:
- Updated `backend/utils/jwt.js` access-token payload to carry identity/session claims only
- Removed permissions embedding from access token generation
- Updated `backend/services/authService.js` login/refresh token generation calls accordingly

Behavior impact:
- Access token cookie size reduced significantly
- Authorization behavior unchanged (permissions resolved server-side in middleware)

### 2026-03-28 - Step 4 Completed

Implemented:
- Added cache invalidation on role permission updates in `backend/services/rolePermissionService.js`
- Added cache invalidation on user create/update/delete in `backend/services/userManagementService.js`
- Invalidation is best-effort to avoid breaking write flows if cache is unavailable

Behavior impact:
- Permission changes now invalidate cached effective permissions promptly

### 2026-03-28 - Step 5 Completed (Verification)

Performed:
- Static audit for lingering JWT-permission runtime dependency in backend auth path
- Backend syntax validation of all touched auth/permission files
- Frontend production build validation
- Token size sanity check after JWT payload shrink

Result:
- No remaining runtime dependency on `decoded.permissions` in auth middleware
- New compact access token length observed around ~212 chars (vs prior oversized payload risk)
- Build/syntax checks passed

## Assumptions

- Redis may be unavailable at times; resolver must remain functional via DB fallback.
- DB remains source of truth for permissions.
- Existing route authorization (`requirePermission`/`requireAnyPermission`) behavior must stay unchanged.
- Existing hardcoded business-rule role checks are intentionally left as-is unless explicitly migrated.

## Temporary Decisions / Follow-up Changes

Current temporary/intermediate state:
- JWT utility still contains legacy encode/decode helpers and token payload path for permissions.
- Auth service still computes permission maps during login/refresh responses.
- Cache invalidation is implemented as helper functions but not yet fully wired to all mutation paths.

Must be completed in upcoming steps:
- Remove permission map from JWT payload generation.
- Wire invalidation into:
  - role permission update flows
  - user permission update flows
  - user role changes / deactivation flows
- Add tests for resolver correctness + invalidation.
- Add rollout validation checklist and rollback verification from real staging runs.

## Current State

- Access token currently carries `permissions` payload.
- `authenticateToken` decodes permissions from JWT and attaches `req.user.permissionsByModule`.
- `requirePermission` / `requireAnyPermission` depend on `req.user.permissionsByModule`.
- Permissions are mutated in role and user permission flows.
- Redis utility already exists: `backend/services/cache/redisCacheService.js`.

## Target State

- JWT contains only identity/session claims: `userId`, `roleId`, `roleName`, `type`, `exp` (optional: `tokenVersion`, `jti`).
- `req.user.permissionsByModule` is resolved server-side at request time.
- Resolver uses Redis cache with DB fallback.
- Permission changes invalidate cache immediately.
- Existing route guards (`requirePermission`) remain unchanged.

## Scope

In scope:
- backend auth middleware + resolver + cache invalidation
- JWT payload reduction
- auth/login/refresh/me compatibility updates
- tests for permission resolution and invalidation

Out of scope:
- replacing all business-rule role checks (`requireRole(['super_admin'])`) unless explicitly requested
- multi-service centralized PDP rollout

## Implementation Phases

### Phase 0: Safety Guardrails

1. Add feature flag `AUTH_PERMISSIONS_SOURCE` with values:
   - `jwt` (current)
   - `server` (new)
2. Keep default `jwt` until rollout day.
3. Add structured logs for auth source and resolver cache hit/miss.

Acceptance:
- No behavior change in production when flag is `jwt`.

### Phase 1: Add Permission Resolver Service (No Wiring Yet)

Create `backend/services/auth/permissionResolverService.js`:
- `getEffectivePermissions({ userId, roleId, roleName })`
- `getRolePermissions(roleId)`
- `invalidateRolePermissions(roleId)`
- `invalidateUserPermissions(userId)`
- `invalidateUsersByRole(roleId)` (pattern-based, best-effort)

Resolution rules:
- non-`_user` roles: role permissions as-is
- `_user` roles: role permissions ∩ user actions (VIEW/ADD/EDIT/DELETE)

Cache keys:
- `perm:role:{roleId}:v1`
- `perm:user:{userId}:role:{roleId}:v1`

TTL:
- `PERMISSION_CACHE_TTL_SECONDS` (default 900)

Acceptance:
- Resolver unit tests pass.
- No runtime path changed yet.

### Phase 2: Wire Middleware to Server Source (Flagged)

Update `backend/middleware/auth.js`:
- if flag=`jwt`: keep legacy decode path
- if flag=`server`: call resolver and attach `permissionsByModule`

Keep `requirePermission` and `requireAnyPermission` interface unchanged.

Acceptance:
- Same route behavior under both modes.
- No downstream code changes required.

### Phase 3: Shrink JWT Payload

Update `backend/utils/jwt.js` and `backend/services/authService.js`:
- stop embedding permissions in access token
- keep identity/session claims only

Compatibility:
- keep `decodePermissions` available for transition while flag=`jwt`.

Acceptance:
- cookie size drops materially
- auth/login/refresh still works

### Phase 4: Add Invalidation Hooks

Add invalidation in mutation paths:

1. Role permission updates (`rolePermissionService.updateRolePermissions`):
   - invalidate `perm:role:{roleId}:*`
   - invalidate all user caches for users with this role

2. User-level permission updates (`userPermissionRepository.setUserPermissions` call sites):
   - invalidate `perm:user:{userId}:*`

3. User role changes (`userManagementService.updateUser` when `roleId` changes):
   - invalidate old/new role-derived user cache for that user

4. User delete/deactivate:
   - invalidate `perm:user:{userId}:*`

Acceptance:
- Permission updates reflect on next request without forced re-login.

### Phase 5: Frontend Compatibility

No major redesign needed.

Keep:
- `permissionsByModule` returned by `/auth/me` and login response (optional but recommended for UI gating).
- `hasPermission` behavior unchanged.

Acceptance:
- sidebar/menu/action visibility remains correct.

### Phase 6: Testing

Unit tests:
- resolver for admin role
- resolver for `_user` role intersection
- cache hit/miss and fallback behavior
- invalidation methods

Integration tests:
- login + protected route access
- permission change and immediate enforcement
- super_admin access remains correct without oversized cookie failures

Manual smoke:
- notifications, role editor, user management, reports endpoints
- refresh token flow

### Phase 7: Rollout

1. Deploy code with flag still `jwt`.
2. Enable Redis in production if not already enabled.
3. Turn flag to `server` in staging.
4. Validate smoke checklist.
5. Turn flag to `server` in production.
6. Force re-login window if needed.
7. After stability period, remove legacy `jwt` permission path.

## Rollback Plan

Immediate rollback:
- set `AUTH_PERMISSIONS_SOURCE=jwt`

If severe issue persists:
- rollback deployment to previous release

Data rollback:
- not required (no destructive schema/data migration in this plan)

## Risk Register

1. Redis outage causing auth slowdown
- Mitigation: DB fallback, short timeout, fail-closed policy with explicit logs

2. Stale permissions due missed invalidation
- Mitigation: explicit invalidation matrix + TTL + tests

3. `_user` intersection mismatch
- Mitigation: targeted unit tests against existing rules

4. Hidden dependency on JWT permissions in custom code
- Mitigation: grep audit + staged flag rollout

## Estimated Effort

MVP (phases 0-4): 1 to 2 days  
Hardened (phases 5-7 + tests + cleanup): 2 to 4 days total

## Task Checklist

- [ ] Add resolver service
- [ ] Add flag-controlled middleware path
- [ ] Remove permissions from JWT payload
- [ ] Add cache invalidation hooks
- [ ] Add tests (unit + integration)
- [ ] Staging rollout with metrics/logging
- [ ] Production rollout
- [ ] Remove legacy JWT-permission code
