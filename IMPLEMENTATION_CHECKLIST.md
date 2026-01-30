# Implementation Checklist: OAuth & User Management

## Quick Reference Checklist

### Phase 1: Database Schema ✅
- [x] Update `User` model with password hash
- [x] Add hierarchy fields (zoneId, stateId, districtId, orgId, kvkId) to User
- [x] Add timestamps (createdAt, updatedAt, lastLoginAt)
- [x] Add soft delete (deletedAt)
- [x] Create `RefreshToken` model
- [x] Add relations to Zone, StateMaster, DistrictMaster, OrgMaster schemas
- [x] Update User model with RefreshToken relation
- [x] **Handle schema merging** (create main schema.prisma or update config)
- [x] Run `npm run db:push`
- [x] Run `npm run db:generate`
- [x] Create seed script for roles (`scripts/seedRoles.js`)
- [x] Run seed script: `npm run seed:roles`

### Phase 2: Backend Auth - Dependencies & Config ✅
- [x] Install: `bcrypt`, `jsonwebtoken`, `cookie-parser`, `express-rate-limit`
- [ ] Update `.env` with JWT_SECRET, JWT_ACCESS_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN
- [ ] Update `.env` with FRONTEND_URL for CORS
- [ ] Add BCRYPT_ROUNDS to `.env`

### Phase 2: Backend Auth - Utilities ✅
- [x] Create `backend/utils/jwt.js`
  - [x] `generateAccessToken(userId, roleId)`
  - [x] `generateRefreshToken(userId, tokenId)`
  - [x] `verifyToken(token, type)`
  - [x] `decodeToken(token)`
- [x] Create `backend/utils/password.js`
  - [x] `hashPassword(password)`
  - [x] `comparePassword(password, hash)`
- [x] Create `backend/utils/validation.js`
  - [x] `validateEmail(email)`
  - [x] `validatePassword(password)`
  - [x] `sanitizeInput(input)`
  - [x] `validateRoleId(roleId)`

### Phase 2: Backend Auth - Middleware ✅
- [x] Create `backend/middleware/auth.js`
  - [x] `authenticateToken` middleware
  - [x] `requireRole(roles)` middleware
  - [x] `requirePermission(module, action)` middleware
- [x] Create `backend/middleware/rateLimiter.js`
  - [x] Login rate limiter (5 attempts / 15 min)
  - [x] API rate limiter (100 requests / 15 min)
  - [x] Strict rate limiter (10 requests / hour)

### Phase 2: Backend Auth - Repository ✅
- [x] Create `backend/repositories/authRepository.js`
  - [x] `findUserByEmail(email)`
  - [x] `findUserById(userId)`
  - [x] `createRefreshToken(userId, token, expiresAt)`
  - [x] `findRefreshToken(token)`
  - [x] `revokeRefreshToken(token)`
  - [x] `revokeAllUserTokens(userId)`
  - [x] `updateLastLogin(userId)`
  - [x] `deleteExpiredTokens()` (cleanup utility)
  - [x] `isRefreshTokenValid(token)` (validation helper)

### Phase 2: Backend Auth - Service ✅
- [x] Create `backend/services/authService.js`
  - [x] `login(email, password)`
  - [x] `refreshAccessToken(refreshToken)`
  - [x] `logout(refreshToken)`
  - [x] `validateUserCredentials(email, password)`
  - [x] `getCurrentUser(userId)` (for /me endpoint)

### Phase 2: Backend Auth - Controller & Routes ✅
- [x] Create `backend/controllers/authController.js`
  - [x] `POST /api/auth/login`
  - [x] `POST /api/auth/refresh`
  - [x] `POST /api/auth/logout`
  - [x] `GET /api/auth/me`
- [x] Create `backend/routes/authRoutes.js`
- [x] Update `backend/routes/index.js` to include auth routes

### Phase 2: Backend Auth - Express Setup ✅
- [x] Update `backend/index.js`
  - [x] Add `cookie-parser` middleware
  - [x] Configure CORS with credentials
  - [x] Add rate-limiting middleware (in auth routes)

### Phase 3: User Management - Repository ✅
- [x] Update `backend/repositories/userRepository.js`
  - [x] `createUserWithPassword(userData, passwordHash)`
  - [x] `findUsersByRole(roleId)`
  - [x] `findUsersByHierarchy(zoneId?, stateId?, districtId?, orgId?, kvkId?)`
  - [x] `updateUserPassword(userId, passwordHash)`
  - [x] `softDeleteUser(userId)`
  - [x] Fixed existing methods to use `userId` instead of `id`
  - [x] Added hierarchy relations in includes

### Phase 3: User Management - Service ✅
- [x] Create `backend/services/userManagementService.js`
  - [x] `createUser(userData, password, createdBy)`
  - [x] `validateHierarchyAssignment(roleId, zoneId?, stateId?, districtId?, orgId?, kvkId?)`
  - [x] `getUsersForAdmin(adminUserId, filters)`
  - [x] `updateUser(userId, userData, updatedBy)`
  - [x] `deleteUser(userId, deletedBy)`

### Phase 3: User Management - Controller & Routes ✅
- [x] Create `backend/controllers/userManagementController.js`
  - [x] `POST /api/admin/users`
  - [x] `GET /api/admin/users`
  - [x] `GET /api/admin/users/:id`
  - [x] `PUT /api/admin/users/:id`
  - [x] `DELETE /api/admin/users/:id`
- [x] Create `backend/routes/adminRoutes.js`
- [x] Update `backend/routes/index.js` to include admin routes with auth

### Phase 4: Frontend - API Services ✅
- [x] Create `frontend/src/services/api.ts` (base API client)
- [x] Create `frontend/src/services/authApi.ts`
  - [x] `login(email, password)`
  - [x] `refreshToken()`
  - [x] `logout()`
  - [x] `getCurrentUser()`
- [x] Create `frontend/src/services/userApi.ts`
  - [x] `createUser(userData)`
  - [x] `getUsers(filters)`
  - [x] `getUser(id)`
  - [x] `updateUser(id, userData)`
  - [x] `deleteUser(id)`
- [x] Create `frontend/src/config/api.ts`

### Phase 4: Frontend - Auth Store Update ✅
- [x] Update `frontend/src/stores/authStore.ts`
  - [x] Replace mock login with API call
  - [x] Add `refreshToken()` method
  - [x] Add `checkAuth()` method
  - [x] Remove mock users

### Phase 4: Frontend - Components ✅
- [x] Update `frontend/src/pages/Login.tsx` (connect to API)
- [x] Update `frontend/src/pages/UserManagement.tsx` (connect to API)
- [x] Create `frontend/src/components/admin/CreateUserModal.tsx`
- [x] Update `frontend/src/components/auth/ProtectedRoute.tsx`

### Phase 4: Frontend - Configuration ✅
- [ ] Create `frontend/.env` with `VITE_API_URL`
- [ ] Update `frontend/vite.config.ts` if needed for proxy

### Phase 5: Security ✅
- [ ] Verify password hashing (bcrypt, 12 rounds)
- [ ] Verify JWT signing with secret
- [ ] Verify HTTP-only cookies
- [ ] Verify CORS configuration
- [ ] Verify rate limiting
- [ ] Verify input validation
- [ ] Test SQL injection prevention
- [ ] Test XSS prevention

### Phase 6: Testing ✅
- [ ] Test login with valid credentials
- [ ] Test login with invalid credentials
- [ ] Test token refresh flow
- [ ] Test logout
- [ ] Test role-based access
- [ ] Test user creation (super admin)
- [ ] Test hierarchy validation
- [ ] Test frontend login flow
- [ ] Test frontend user creation
- [ ] End-to-end testing

### Documentation ✅
- [ ] Update API documentation
- [ ] Update README with new endpoints
- [ ] Document environment variables
- [ ] Create user guide for super admin

---

## Quick Commands Reference

```bash
# Backend
cd backend
npm install bcrypt jsonwebtoken cookie-parser express-rate-limit
npm run db:push
npm run db:generate
npm run dev

# Frontend
cd frontend
# Create .env file
bun run dev
```

---

## Testing Endpoints

### Auth Endpoints
- `POST http://localhost:5000/api/auth/login`
- `POST http://localhost:5000/api/auth/refresh`
- `POST http://localhost:5000/api/auth/logout`
- `GET http://localhost:5000/api/auth/me`

### Admin Endpoints (require auth)
- `POST http://localhost:5000/api/admin/users`
- `GET http://localhost:5000/api/admin/users`
- `GET http://localhost:5000/api/admin/users/:id`
- `PUT http://localhost:5000/api/admin/users/:id`
- `DELETE http://localhost:5000/api/admin/users/:id`

---

**Status**: Ready to start implementation
**Next Step**: Begin with Phase 1 - Database Schema Updates
