# Server-Side Permission Resolution

## Objective

Move authorization from **JWT-embedded module permissions** to **server-side permission resolution with Redis caching**, while preserving all existing behavior.

This addresses:
- Oversized `accessToken` cookies for high-privilege roles (notably `super_admin`)
- Delayed permission-change propagation when permissions are baked into JWT
- Need for immediate effect of role/user permission updates

## Architecture

### Before

```
Login → compute permissions → encode as bitmask → embed in JWT cookie
Request → decode JWT → decodePermissions(bitmask) → req.user.permissionsByModule
```

### After

```
Login → generate slim JWT (userId, roleId, roleName only)
Request → verify JWT → permissionResolverService.getEffectivePermissions() → req.user.permissionsByModule
```

### Permission Resolution Rules

- **Admin roles** (not ending in `_user`): full role-level permissions from `RolePermission` table
- **`_user` roles**: role permissions ∩ user-level actions from `UserPermission` table
- **`_user` with no explicit permissions**: zero access (`{}`)

### Caching

- **Cache layer:** Redis with DB fallback (graceful degradation if Redis is unavailable)
- **Cache keys:**
  - `perm:role:{roleId}:v1` — role-level permissions
  - `perm:user:{userId}:role:{roleId}:v1` — effective user permissions
- **TTL:** 3600 seconds (1 hour), configurable via `PERMISSION_CACHE_TTL_SECONDS` env var
- **Pattern deletion:** Uses `SCAN`-based iteration (not `KEYS`) to avoid blocking Redis

### Cache Invalidation

Invalidation is best-effort (wrapped in try/catch) so write flows don't break if Redis is down.

| Mutation | Invalidation |
|----------|-------------|
| Role permissions updated (`rolePermissionService`) | Role cache + all user-role caches for that role |
| User created (`userManagementService`) | User permission cache |
| User updated (`userManagementService`) | User permission cache |
| User deleted (`userManagementService`) | User permission cache |

## Files Changed

| File | Change |
|------|--------|
| `backend/services/auth/permissionResolverService.js` | **New** — permission resolution with Redis caching |
| `backend/middleware/auth.js` | Resolve permissions server-side instead of decoding from JWT |
| `backend/utils/jwt.js` | `generateAccessToken` no longer accepts/embeds permissions |
| `backend/services/authService.js` | Login/refresh generate slim tokens (identity claims only) |
| `backend/services/rolePermissionService.js` | Cache invalidation on role permission updates |
| `backend/services/userManagementService.js` | Cache invalidation on user create/update/delete |
| `backend/services/cache/redisCacheService.js` | `delPattern` uses `SCAN` instead of `KEYS` |

## Assumptions

- Redis may be unavailable at times; resolver falls back to DB queries.
- DB remains the source of truth for permissions.
- `requirePermission` / `requireAnyPermission` interface is unchanged — they read `req.user.permissionsByModule` as before.
- Existing hardcoded role checks (`requireRole`) are left as-is.

## Rollback Plan

- Revert the PR and redeploy. JWT will carry permissions again.
- No destructive schema or data migration — rollback is clean.

## Risk Register

| Risk | Mitigation |
|------|-----------|
| Redis outage causing auth slowdown | DB fallback; Redis errors are caught and logged, not thrown |
| Stale permissions from missed invalidation | TTL bounds staleness to 1 hour; all known mutation paths have invalidation wired |
| `_user` with no permissions getting unintended access | Returns `{}` — zero access by default |

## Follow-up Items

- [ ] Add unit tests for permission resolver (admin role, `_user` intersection, `_user` with no permissions, cache hit/miss)
- [ ] Remove dead `encodePermissions` / `decodePermissions` exports from `jwt.js`
