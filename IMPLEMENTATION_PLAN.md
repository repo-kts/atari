# Implementation Plan: In-House OAuth & Super Admin Account Management

## 📋 Overview

This document outlines the implementation plan for:
1. **In-House OAuth System**: Email/password authentication with JWT tokens (access + refresh)
2. **Super Admin Account Creation**: Ability for super admin to create accounts for different hierarchy levels

---

## 🎯 Goals & Scope

### MVP (Phase 1)
- ✅ Email/password login with JWT tokens
- ✅ HTTP-only cookies for token storage
- ✅ Access token (1 hour) + Refresh token (7 days)
- ✅ Super admin can create users with roles and hierarchy assignments
- ✅ Role-based access control (RBAC) enforcement
- ✅ Frontend integration replacing mock auth

### Future Phases (Phase 2+)
- Password reset/forgot password flow
- Email notifications
- Audit logging for user creation
- Configurable roles/permissions via UI
- Multi-entity user associations

---

## 🏗️ Architecture Decisions

### Authentication Flow
- **Type**: Email/password + JWT tokens (Option A - Classic approach)
- **Token Storage**: HTTP-only cookies (secure, prevents XSS)
- **Token Lifetime**: 
  - Access token: 1 hour
  - Refresh token: 7 days
- **Password Hashing**: bcrypt (industry standard, simple)

### Role Model
- **Approach**: Fixed roles (can evolve to configurable later)
- **Roles**: `super_admin`, `zone_admin`, `state_admin`, `district_admin`,`org_admin`,`kvk`
- **User-Entity**: Single role + single primary entity per user (simplified for MVP)

### State Management
- **Frontend**: Keep existing Zustand AuthStore, connect to real API
- **Backend**: JWT-based stateless authentication

---

## 📊 Phase 1: Database Schema Changes

### 1.1 Update User Model

**File**: `backend/prisma/user/user_schema.prisma`

**Changes**:
```prisma
model User {
  userId       Int       @id @default(autoincrement()) @map("user_id")
  name         String
  email        String    @unique
  passwordHash String    @map("password_hash")  // NEW: Hashed password
  roleId       Int       @map("role_id")
  
  // Hierarchy associations (optional, one per user)
  zoneId       Int?      @map("zone_id")
  stateId      Int?      @map("state_id")
  orgId        Int?      @map("org_id")
  kvkId        Int?      @map("kvk_id")
  
  // Timestamps
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  lastLoginAt  DateTime? @map("last_login_at")
  
  // Soft delete
  deletedAt    DateTime? @map("deleted_at")
  
  // Relations
  role         Role      @relation(fields: [roleId], references: [roleId])
  zone         Zone?     @relation(fields: [zoneId], references: [zoneId])
  state        StateMaster? @relation(fields: [stateId], references: [stateId])
  org          OrgMaster? @relation(fields: [orgId], references: [orgId])
  // kvk relation will be added when KVK schema is created
  
  @@map("users")
}
```

**Note**: Need to add relations to Zone, StateMaster, OrgMaster schemas.

### 1.2 Add RefreshToken Model

**File**: `backend/prisma/user/user_schema.prisma`

**New Model**:
```prisma
model RefreshToken {
  tokenId     Int       @id @default(autoincrement()) @map("token_id")
  userId      Int       @map("user_id")
  token       String    @unique  // JWT refresh token
  expiresAt   DateTime  @map("expires_at")
  createdAt   DateTime  @default(now()) @map("created_at")
  revokedAt   DateTime? @map("revoked_at")
  
  user        User      @relation(fields: [userId], references: [userId], onDelete: Cascade)
  
  @@index([userId])
  @@index([token])
  @@map("refresh_tokens")
}
```

**Update User model**:
```prisma
model User {
  // ... existing fields
  refreshTokens RefreshToken[]
}
```

### 1.3 Update Zone Schema Relations

**File**: `backend/prisma/zones/zone_schema.prisma`

**Add User relation**:
```prisma
model Zone {
  // ... existing fields
  users User[]
}
```

**Update StateMaster and OrgMaster**:
```prisma
model StateMaster {
  // ... existing fields
  users User[]
}

model OrgMaster {
  // ... existing fields
  users User[]
}
```

### 1.4 Seed Initial Roles

**Action**: Create seed script or manual insertion for:
- `super_admin` (roleId: 1)
- `admin` (roleId: 2)
- `kvk` (roleId: 3)
- `zone_admin` (roleId: 4)
- `state_admin` (roleId: 5)
- `org_admin` (roleId: 6)

---

## 🔐 Phase 2: Backend Authentication Implementation

### 2.1 Install Dependencies

```bash
cd backend
npm install bcrypt jsonwebtoken cookie-parser express-rate-limit
npm install --save-dev @types/bcrypt @types/jsonwebtoken @types/cookie-parser
```

### 2.2 Environment Variables

**File**: `backend/.env.example` (update)

```env
DATABASE_URL="postgresql://..."
PORT=5000

# JWT Configuration
JWT_SECRET="your-super-secret-key-change-in-production"
JWT_ACCESS_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"

# CORS
FRONTEND_URL="http://localhost:5173"

# Security
BCRYPT_ROUNDS=12
```

### 2.3 Create Authentication Utilities

**File**: `backend/utils/jwt.js`
- `generateAccessToken(userId, roleId)`
- `generateRefreshToken(userId)`
- `verifyToken(token, type)`

**File**: `backend/utils/password.js`
- `hashPassword(password)`
- `comparePassword(password, hash)`

**File**: `backend/utils/validation.js`
- `validateEmail(email)`
- `validatePassword(password)` (min 8 chars, complexity rules)

### 2.4 Create Authentication Middleware

**File**: `backend/middleware/auth.js`
- `authenticateToken` - Verify access token from cookie
- `requireRole(roles)` - Check user role
- `requirePermission(module, action)` - Check specific permission

**File**: `backend/middleware/rateLimiter.js`
- Login rate limiter (5 attempts per 15 minutes)

### 2.5 Create Auth Repository

**File**: `backend/repositories/authRepository.js`
- `findUserByEmail(email)`
- `createRefreshToken(userId, token, expiresAt)`
- `findRefreshToken(token)`
- `revokeRefreshToken(token)`
- `revokeAllUserTokens(userId)`
- `updateLastLogin(userId)`

### 2.6 Create Auth Service

**File**: `backend/services/authService.js`
- `login(email, password)` - Returns tokens + user data
- `refreshAccessToken(refreshToken)` - Generate new access token
- `logout(refreshToken)` - Revoke refresh token
- `validateUserCredentials(email, password)` - Internal validation

### 2.7 Create Auth Controller

**File**: `backend/controllers/authController.js`
- `POST /api/auth/login` - Login endpoint
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout endpoint
- `GET /api/auth/me` - Get current user info

### 2.8 Create Auth Routes

**File**: `backend/routes/authRoutes.js`
- Mount auth routes

**File**: `backend/routes/index.js`
- Add auth routes: `router.use('/auth', authRoutes)`

### 2.9 Update Express App

**File**: `backend/index.js`
- Add `cookie-parser` middleware
- Configure CORS with credentials
- Add rate limiting middleware

---

## 👤 Phase 3: Super Admin Account Creation

### 3.1 Update User Repository

**File**: `backend/repositories/userRepository.js`
- `createUserWithPassword(userData, passwordHash)` - Create user with password
- `findUsersByRole(roleId)` - Get users by role
- `findUsersByHierarchy(zoneId?, stateId?, orgId?, kvkId?)` - Filter by hierarchy
- `updateUserPassword(userId, passwordHash)` - Update password
- `softDeleteUser(userId)` - Soft delete

### 3.2 Create User Management Service

**File**: `backend/services/userManagementService.js`
- `createUser(userData, password, createdBy)` - Create user (with validation)
- `validateHierarchyAssignment(roleId, zoneId?, stateId?, orgId?, kvkId?)` - Validate hierarchy
- `getUsersForAdmin(adminUserId, filters)` - Get users based on admin's scope
- `updateUser(userId, userData, updatedBy)` - Update user
- `deleteUser(userId, deletedBy)` - Soft delete user

**Business Rules**:
- Super admin can create any user with any role
- Zone admin can only create users for their zone
- State admin can only create users for their state
- Org admin can only create users for their org
- KVK users can only view their own data

### 3.3 Create User Management Controller

**File**: `backend/controllers/userManagementController.js`
- `POST /api/admin/users` - Create user (super admin only)
- `GET /api/admin/users` - List users (with filters)
- `GET /api/admin/users/:id` - Get user details
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Soft delete user
- `POST /api/admin/users/:id/reset-password` - Reset password (future)

### 3.4 Create Admin Routes

**File**: `backend/routes/adminRoutes.js`
- Mount admin routes with authentication middleware

**File**: `backend/routes/index.js`
- Add: `router.use('/admin', authenticateToken, requireRole(['super_admin', 'admin']), adminRoutes)`

---

## 🎨 Phase 4: Frontend Integration

### 4.1 Create API Service Layer

**File**: `frontend/src/services/api.ts`
- Base API client with cookie handling
- Request/response interceptors
- Error handling

**File**: `frontend/src/services/authApi.ts`
- `login(email, password)`
- `refreshToken()`
- `logout()`
- `getCurrentUser()`

**File**: `frontend/src/services/userApi.ts`
- `createUser(userData)`
- `getUsers(filters)`
- `getUser(id)`
- `updateUser(id, userData)`
- `deleteUser(id)`

### 4.2 Update Auth Store

**File**: `frontend/src/stores/authStore.ts`
- Replace mock login with real API call
- Store tokens in HTTP-only cookies (handled by backend)
- Add `refreshToken()` method
- Add `checkAuth()` method for token refresh on app load
- Remove mock users

### 4.3 Update Login Component

**File**: `frontend/src/pages/Login.tsx`
- Connect to real API
- Handle errors
- Show loading states

### 4.4 Create User Management UI

**File**: `frontend/src/pages/UserManagement.tsx` (update existing)
- Add "Create User" button (super admin only)
- Connect to real API
- Show user list with filters

**File**: `frontend/src/components/admin/CreateUserModal.tsx` (new)
- Form for creating users
- Role selection
- Hierarchy selection (zone/state/org/kvk)
- Password field (initial password)

### 4.5 Update Protected Routes

**File**: `frontend/src/components/auth/ProtectedRoute.tsx`
- Add token refresh check
- Handle 401 errors (redirect to login)

### 4.6 Add API Configuration

**File**: `frontend/src/config/api.ts`
- API base URL (from env or config)
- Default headers

**File**: `frontend/.env` (new)
```env
VITE_API_URL=http://localhost:5000
```

---

## 🔒 Phase 5: Security Implementation

### 5.1 Backend Security

- ✅ Password hashing with bcrypt (12 rounds)
- ✅ JWT signing with secret
- ✅ HTTP-only cookies
- ✅ CORS configuration (specific origins)
- ✅ Rate limiting on login endpoint
- ✅ Input validation and sanitization
- ✅ SQL injection prevention (Prisma handles this)
- ✅ XSS prevention (validate inputs)

### 5.2 Frontend Security

- ✅ Store tokens in HTTP-only cookies (backend sets)
- ✅ CSRF protection (same-site cookies)
- ✅ Input validation
- ✅ Secure API calls (HTTPS in production)

### 5.3 Security Checklist

- [ ] Use strong JWT_SECRET (32+ characters, random)
- [ ] Enable HTTPS in production
- [ ] Set secure cookie flags in production
- [ ] Implement rate limiting
- [ ] Add request logging
- [ ] Validate all inputs
- [ ] Sanitize user inputs
- [ ] Implement CORS properly

---

## 📝 Phase 6: Testing & Validation

### 6.1 Backend Testing

- Test login with valid/invalid credentials
- Test token refresh flow
- Test logout (token revocation)
- Test role-based access control
- Test user creation with different roles
- Test hierarchy validation

### 6.2 Frontend Testing

- Test login flow
- Test token refresh on app load
- Test protected routes
- Test user creation form
- Test error handling

### 6.3 Integration Testing

- End-to-end login flow
- End-to-end user creation flow
- Test cookie handling
- Test CORS configuration

---

## 📅 Implementation Timeline

### Week 1: Backend Foundation
- **Day 1-2**: Database schema updates + migrations
- **Day 3-4**: Authentication utilities + middleware
- **Day 5**: Auth endpoints (login, refresh, logout)

### Week 2: User Management
- **Day 1-2**: User management service + repository
- **Day 3-4**: Admin endpoints for user CRUD
- **Day 5**: Testing + bug fixes

### Week 3: Frontend Integration
- **Day 1-2**: API service layer + auth API
- **Day 3**: Update auth store + login component
- **Day 4**: User management UI
- **Day 5**: Testing + integration

### Week 4: Polish & Deploy
- **Day 1-2**: Security hardening
- **Day 3**: End-to-end testing
- **Day 4**: Documentation
- **Day 5**: Deployment preparation

---

## 🚀 Getting Started

### Step 1: Database Schema
```bash
cd backend
# Update prisma schemas
npm run db:push
npm run db:generate
```

### Step 2: Install Dependencies
```bash
cd backend
npm install bcrypt jsonwebtoken cookie-parser express-rate-limit
```

### Step 3: Environment Setup
```bash
# Update .env with JWT_SECRET and other configs
```

### Step 4: Start Implementation
Follow phases in order, testing each phase before moving to next.

---

## 📚 Future Enhancements (Phase 2+)

1. **Password Reset Flow**
   - Forgot password endpoint
   - Email with reset token
   - Reset password endpoint

2. **Email Notifications**
   - Welcome email on user creation
   - Password reset emails
   - Account activity notifications

3. **Audit Logging**
   - Log all user creation/updates
   - Track who created/modified users
   - Activity history

4. **Advanced Features**
   - Multi-entity user associations
   - Configurable roles via UI
   - Permission management UI
   - Two-factor authentication (2FA)

---

## ✅ Definition of Done

- [ ] Users can login with email/password
- [ ] Access tokens expire after 1 hour
- [ ] Refresh tokens work and expire after 7 days
- [ ] Logout revokes refresh tokens
- [ ] Super admin can create users with roles
- [ ] Super admin can assign users to hierarchy (zone/state/org/kvk)
- [ ] Role-based access control works
- [ ] Frontend uses real API (no mock data)
- [ ] All security measures implemented
- [ ] End-to-end testing passes
- [ ] Documentation updated

---

## 📖 Notes

- **Token Storage**: Using HTTP-only cookies for security
- **Password Policy**: Minimum 8 characters (can add complexity later)
- **Role Model**: Fixed roles for MVP, can evolve to configurable
- **User-Entity**: Single association per user (can add multi-association later)
- **Email**: Not required for MVP, can add later

---

**Last Updated**: [Current Date]
**Status**: Ready for Implementation
