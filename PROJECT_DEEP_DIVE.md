# ATARI Project - Complete Deep Dive Documentation

> Agricultural Technology Application Research Institute (ATARI) - Zone IV Patna
> A comprehensive KVK (Krishi Vigyan Kendra) management system for data entry, reporting, user management, and administrative operations.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Authentication & Authorization](#authentication--authorization)
4. [Database Schema](#database-schema)
5. [Backend Architecture](#backend-architecture)
6. [Frontend Architecture](#frontend-architecture)
7. [API Endpoints](#api-endpoints)
8. [Role Hierarchy & Permissions](#role-hierarchy--permissions)
9. [Key Patterns & Conventions](#key-patterns--conventions)
10. [Seed Data & Master Data](#seed-data--master-data)
11. [Known Areas & Potential Issues](#known-areas--potential-issues)

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Express.js | 5.2.1 | Web framework |
| Prisma | 7.2.0 | ORM (PostgreSQL) |
| PostgreSQL | via pg 8.17.1 | Database |
| JWT (jsonwebtoken) | 9.0.3 | Token auth |
| bcrypt | 6.0.0 | Password hashing |
| ioredis | 5.9.3 | Redis caching |
| express-rate-limit | 8.2.1 | Rate limiting |
| Puppeteer | 24.37.2 | PDF generation |
| ExcelJS | 4.4.0 | Excel export |
| docx | 9.5.1 | Word export |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.2 | UI framework |
| TypeScript | 5.7 | Type safety |
| Vite | 7.2 | Build tool |
| Tailwind CSS | 4.1 | Styling |
| TanStack React Query | 5.90.20 | Server state management |
| TanStack React Table | 8.21.3 | Data tables |
| React Router DOM | 7.12.0 | Routing |
| lucide-react | 0.562.0 | Icons |

### Infrastructure
- **Deployment**: Vercel (serverless)
- **Database**: PostgreSQL (Neon serverless / Prisma Accelerate)
- **Caching**: Redis (ioredis)

---

## Project Structure

```
atari/
├── backend/
│   ├── index.js                    # Express entry point (port 5000)
│   ├── config/
│   │   ├── prisma.js               # Prisma client (dual: Accelerate + direct PG)
│   │   ├── cacheConfig.js          # Redis TTL strategy
│   │   └── reportConfig.js         # Report section definitions
│   ├── constants/
│   │   └── roleHierarchy.js        # Role levels, creatable roles
│   ├── controllers/                # Thin HTTP handlers
│   │   ├── authController.js
│   │   ├── userManagementController.js
│   │   ├── rolePermissionController.js
│   │   ├── exportController.js
│   │   ├── reportController.js
│   │   └── forms/                  # 20+ form controllers
│   ├── middleware/
│   │   ├── auth.js                 # authenticateToken, requireRole, requirePermission
│   │   └── rateLimiter.js          # login/api/strict/refresh limiters
│   ├── repositories/               # Data access layer
│   │   ├── authRepository.js
│   │   ├── userRepository.js
│   │   ├── rolePermissionRepository.js
│   │   ├── userPermissionRepository.js
│   │   └── forms/                  # Form-specific repos
│   ├── routes/
│   │   ├── index.js                # Route mounting
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── userRoutes.js
│   │   ├── all-masters/            # Master data CRUD routes
│   │   ├── forms/                  # 20+ form route files
│   │   └── reports/
│   ├── services/                   # Business logic
│   │   ├── authService.js          # Login, refresh, logout (~770 lines)
│   │   ├── userManagementService.js # User CRUD + hierarchy (~785 lines)
│   │   ├── rolePermissionService.js
│   │   └── forms/                  # 20+ form services
│   ├── utils/
│   │   ├── jwt.js                  # Token gen/verify, bitmask permissions
│   │   ├── password.js             # bcrypt hash/compare
│   │   ├── validation.js           # Email, password, phone validation
│   │   ├── dataSanitizer.js        # Input sanitization
│   │   ├── errorHandler.js         # Custom errors + Prisma error translation
│   │   ├── cacheKeyBuilder.js      # Redis key generators
│   │   └── exportHelper.js         # PDF/Excel/Word generation
│   ├── prisma/
│   │   └── superadmin/             # 80 .prisma schema files
│   │       ├── schema.prisma       # Main config
│   │       ├── user/user_schema.prisma  # User, Role, Permission, RefreshToken
│   │       ├── zones/zone_schema.prisma # Zone, State, District, Org, Uni
│   │       ├── masters/            # 16 master data schemas
│   │       └── ...
│   │   └── kvk/                    # 47 KVK-specific schemas
│   │       ├── about-kvk/          # KVK details, staff, bank, infra
│   │       ├── achievements/       # Awards, extension, FLD, OFT, projects
│   │       ├── soil_water_testing/
│   │       ├── meetings/
│   │       ├── hrd_schema.prisma
│   │       └── swachhta_bharat/
│   └── scripts/                    # Seed scripts (12 files)
│
├── frontend/
│   ├── vite.config.ts              # Alias @=src, proxy /api to :5000
│   ├── src/
│   │   ├── main.tsx                # React Query client setup
│   │   ├── App.tsx                 # Router + ProtectedRoute
│   │   ├── index.css               # Tailwind + CSS variables
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Layout.tsx      # Two-column (sidebar + main)
│   │   │   │   ├── Sidebar.tsx     # Permission-based nav tree
│   │   │   │   └── Header.tsx      # User info, logout
│   │   │   ├── ui/                 # Button, Modal, Input, Card
│   │   │   └── common/             # DataManagementView, DataTable,
│   │   │                           # DynamicFormPage, DependentDropdown,
│   │   │                           # ProtectedRoute, ErrorBoundary, etc.
│   │   ├── pages/
│   │   │   ├── auth/Login.tsx
│   │   │   ├── dashboard/Dashboard.tsx  # Role-based dispatch
│   │   │   ├── admin/
│   │   │   │   ├── RoleManagement.tsx
│   │   │   │   ├── RolePermissionEditor.tsx
│   │   │   │   └── UserManagement.tsx
│   │   │   └── forms/              # About KVK, achievements, projects
│   │   ├── services/
│   │   │   ├── api.ts              # Base API client (cookie auth, 401 refresh)
│   │   │   ├── authApi.ts
│   │   │   ├── userApi.ts
│   │   │   ├── masterDataApi.ts
│   │   │   └── ...                 # 10+ specialized API services
│   │   ├── hooks/
│   │   │   ├── useMasterData.ts    # Generic CRUD hook
│   │   │   ├── useEntityHook.ts    # Hook factory for 150+ entity types
│   │   │   └── ...                 # 15+ specialized hooks
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx     # Auth state, permissions, login/logout
│   │   ├── config/
│   │   │   └── routeConfig.ts     # All route definitions with metadata
│   │   ├── constants/
│   │   │   ├── roleHierarchy.ts   # Mirror of backend hierarchy
│   │   │   └── entityTypes.ts     # Entity type constants
│   │   ├── types/                  # TypeScript interfaces
│   │   └── utils/                  # Transform, query, export helpers
│   └── .env                        # VITE_API_URL=/api
│
├── ARCHITECTURE_FLOW.md
├── IMPLEMENTATION_PLAN.md
├── IMPLEMENTATION_CHECKLIST.md
├── GRANULAR_PERMISSIONS_PLAN.md
└── TIMELINE.md
```

---

## Authentication & Authorization

### Auth Flow
1. **Login**: `POST /api/auth/login` with email/password
2. Backend validates credentials, builds permission bitmask
3. Returns HTTP-only cookies: `accessToken` (1h) + `refreshToken` (7d)
4. Frontend stores user in React Query cache (`['currentUser']`)

### Token Structure
- **Access Token (JWT, 1h)**: `{ userId, roleId, roleName, permissions (bitmask), type: 'access' }`
- **Refresh Token (JWT, 7d)**: `{ userId, tokenId, type: 'refresh' }`
- **Bitmask encoding**: VIEW=1, ADD=2, EDIT=4, DELETE=8 (reduces JWT size ~50%)

### Permission System (Two-Layer)
1. **Role Permissions**: Each role has a set of module permissions (RolePermission junction table)
2. **User Permissions**: Individual users can have specific permissions (UserPermission junction table)
3. **_user roles** (kvk_user, state_user, etc.): Use INTERSECTION of role + user permissions (ceiling pattern)
4. **Admin roles**: Use role permissions directly
5. **super_admin**: Bypasses all permission checks

### Middleware Stack
```
Request → CORS → Cookie Parser → Rate Limiter → authenticateToken → requireRole/requirePermission → Controller
```

### Key Auth Files
| File | Purpose |
|---|---|
| `backend/middleware/auth.js` | authenticateToken, requireRole, requirePermission, requireAnyPermission |
| `backend/utils/jwt.js` | generateAccessToken, generateRefreshToken, verifyToken, bitmask encode/decode |
| `backend/services/authService.js` | Login, refresh, logout with full permission building |
| `frontend/contexts/AuthContext.tsx` | Auth state, hasRole(), hasPermission(), canActOnRole() |
| `frontend/services/api.ts` | Base client with auto 401 refresh + mutex |

### Cookie Configuration
- HTTP-only, SameSite=none (prod), Secure (prod)
- Safari ITP: partitioned attribute
- Cross-origin CORS support with credentials

### Security Layers
- Rate limiting: Login (5/15min), API (100/15min), Strict (10/hr), Refresh (30/15min)
- bcrypt (12 rounds) for password hashing
- Timing-attack prevention (dummy hash on login failure)
- Input sanitization via dataSanitizer.js
- Prisma prevents SQL injection

---

## Database Schema

### Core Models (120+ total across 80 .prisma files)

#### User & Auth
```
User: userId, name, email (unique), passwordHash, roleId, phoneNumber
       zoneId, stateId, districtId, orgId, universityId, kvkId (geographic hierarchy)
       createdAt, updatedAt, lastLoginAt, deletedAt (soft delete)

Role: roleId, roleName (unique), description, hierarchyLevel

Module: moduleId, menuName, subMenuName, moduleCode (unique)

Permission: permissionId, moduleId, action (VIEW|ADD|EDIT|DELETE)

RolePermission: [roleId, permissionId] (composite key)

UserPermission: [userId, permissionId] (composite key, cascade delete)

RefreshToken: tokenId, userId, token (unique), expiresAt, revokedAt
```

#### Geographic Hierarchy
```
Zone → StateMaster → DistrictMaster → OrgMaster → UniversityMaster
                                                  → Kvk
```

#### KVK Entities (About KVK)
- Kvk, KvkStaff, KvkBankAccount, KvkEquipment, KvkFarmImplement
- KvkInfrastructure, KvkVehicle, StaffTransferHistory

#### KVK Achievements
- **Awards**: FarmerAward, KvkAward, ScientistAward
- **Extension**: KvkExtensionActivity, KvkTechnologyWeekCelebration, KvkImportantDayCelebration, KvkOtherExtensionActivity
- **FLD**: KvkFldIntroduction, FldActivity, FldCategory, FldSubcategory, FldCrop
- **OFT**: Kvkoft, KvkoftTechnology, OftSubject, OftThematicArea
- **Projects**: ARYA, CFLD, CSISA, DRMR, FPO/CBBO, Natural Farming, NICRA, Agri Drone, Seed Hub
- **Other**: HrdProgram, SoilWaterAnalysis, SwachhtaHiSewa, AtariMeeting, SacMeeting

#### Master Data
- CropType, Discipline, ExtensionActivityType, FundingSourceMaster
- ImportantDay, InfrastructureMaster, PayLevelMaster, SanctionedPost
- Season, StaffCategoryMaster, TrainingArea, ClienteleMaster
- TrainingThematicArea, TrainingType, YearMaster
- Product, ProductCategory, ProductType, Sector

---

## Backend Architecture

### Layer Pattern
```
Route → Controller → Service → Repository → Prisma → PostgreSQL
```

### Entry Point (`backend/index.js`)
- Express on port 5000 (configurable)
- CORS: whitelisted origins from `FRONTEND_URL` env var
- Cookie parser + JSON body parser
- Health check: `GET /health`
- Serverless compatible (Vercel/Lambda export)
- All routes under `/api` prefix

### Controllers (Thin HTTP Handlers)
- Extract request data, delegate to service, format response
- Set HTTP-only cookies for auth endpoints
- Handle Safari ITP with partitioned cookies

### Services (Business Logic)
- **authService.js** (~770 lines): Login flow, token rotation, permission building
- **userManagementService.js** (~785 lines): User CRUD with hierarchy validation, role escalation prevention
- **rolePermissionService.js** (~150 lines): Role CRUD, permission management
- Form services: Data retrieval, validation, caching per form type

### Repositories (Data Access)
- Direct Prisma queries, no business logic
- Specialized queries for hierarchy, search, filtering

### Error Handling
```
ValidationError (400) | NotFoundError (404) | UnauthorizedError (403) | ConflictError (409)
```
- Prisma errors auto-translated (P2002→Conflict, P2025→NotFound, P2003→Validation)
- `asyncHandler(fn)` wraps route handlers for Promise rejection catching

### Caching (Redis)
- TTL strategy: SHORT (5-15min), MEDIUM (30-60min), LONG (2-4h), VERY_LONG (24h)
- Cache key builders in `utils/cacheKeyBuilder.js`
- MD5-hashed filter params for consistent keys

### Export
- **PDF**: Puppeteer-core + @sparticuz/chromium (serverless), A4 format
- **Excel**: ExcelJS with styled headers (green #487749), auto-fit columns
- **Word**: docx library with styled tables

---

## Frontend Architecture

### State Management
- **Server state**: TanStack React Query (staleTime: 5min, retry: 1)
- **Auth state**: React Context + React Query cache key `['currentUser']`
- **UI state**: Local component state via custom hooks

### Routing (React Router DOM)
- Centralized in `config/routeConfig.ts` with metadata (permissions, fields, components)
- `ProtectedRoute` wrapper: role check + module permission check
- Dynamic rendering from route config

### API Client (`services/api.ts`)
- Cookie-based auth (`credentials: 'include'`)
- Auto 401 refresh with mutex (prevents race conditions)
- Session expiration callback triggers logout
- AbortSignal support for request cancellation

### Component Patterns
- **DataManagementView**: Generic CRUD UI (table + form) driven by config
- **DependentDropdown**: Cascading selectors (zone → state → district → org)
- **DynamicFormPage/DynamicTablePage**: Config-driven form/table rendering
- **Entity Hook Factory** (`useEntityHook`): Dispatches to correct hook for 150+ entity types

### Layout
- Two-column: collapsible Sidebar + scrollable Main content
- Sidebar: permission-based nav tree with nested dropdowns
- Header: user info, role display name, logout

### Styling
- Tailwind CSS 4.1 with CSS custom properties
- Primary green: `#487749`, accent: `#4caf50`
- Custom scrollbar styling

### Query Invalidation
- Smart cascading: updating zone invalidates states, districts, orgs, universities
- Scoped by userId + role to prevent cache pollution

### Key Frontend Files
| File | Purpose |
|---|---|
| `App.tsx` | Router setup, session expiration handling |
| `contexts/AuthContext.tsx` | Auth state, permission checks |
| `services/api.ts` | Base API client with 401 refresh |
| `config/routeConfig.ts` | All route definitions (large file) |
| `constants/roleHierarchy.ts` | Frontend mirror of backend hierarchy |
| `hooks/useMasterData.ts` | Generic CRUD with React Query |
| `hooks/useEntityHook.ts` | Hook factory for entity types |
| `components/layout/Sidebar.tsx` | Permission-filtered navigation |
| `components/common/DataManagementView.tsx` | Generic CRUD view |
| `components/common/DependentDropdown.tsx` | Cascading selectors |
| `utils/queryInvalidation.ts` | Cache invalidation logic |

---

## API Endpoints

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout (revoke tokens) |
| GET | `/api/auth/me` | Get current user |

### Admin - Users
| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/users` | List users (scoped by hierarchy) |
| POST | `/api/admin/users` | Create user |
| GET | `/api/admin/users/:id` | Get user by ID |
| PUT | `/api/admin/users/:id` | Update user |
| DELETE | `/api/admin/users/:id` | Soft delete user |

### Admin - Roles
| Method | Path | Description |
|---|---|---|
| POST | `/api/admin/roles` | Create role (super_admin only) |
| GET | `/api/admin/roles` | List all roles |
| GET | `/api/admin/roles/:roleId/permissions` | Get role permissions |
| PUT | `/api/admin/roles/:roleId/permissions` | Update role permissions |

### Master Data (all under `/api/admin/`)
- **Zones**: CRUD at `/zones`
- **States**: CRUD at `/states`, + `GET /states/zone/:zoneId`
- **Districts**: CRUD at `/districts`, + `GET /districts/state/:stateId`
- **Organizations**: CRUD at `/organizations`, + `GET /organizations/district/:districtId`
- **Universities**: CRUD at `/universities`, + `GET /universities/organization/:orgId`
- **Stats**: `GET /master-data/stats`, `GET /master-data/hierarchy`

### Master Data (all under `/api/admin/masters/`)
- **OFT**: subjects, thematic-areas (CRUD + hierarchical)
- **FLD**: sectors, thematic-areas, categories, subcategories, crops (CRUD + hierarchical)
- **CFLD**: crops (CRUD + by season/type)
- **Training**: types, areas, thematic-areas (CRUD + hierarchical)
- **Extension**: extension-activities, other-extension-activities, events (CRUD)
- **Products**: product-categories, product-types, products (CRUD + hierarchical)
- **CRA**: cra-cropping-systems, cra-farming-systems (CRUD)
- **ARYA**: arya-enterprises (CRUD)
- **Publication**: publication-items (CRUD)
- **Other**: seasons, sanctioned-posts, years, staff-category, pay-level, discipline, extension-activity-type, other-extension-activity-type, important-day, training-clientele, funding-source, crop-type, infrastructure-master (CRUD)
- **Export**: `POST /exportData`

### Forms - About KVK (`/api/forms/about-kvk/`)
- KVKs, bank-accounts, employees, staff-transferred, infrastructure, vehicles, vehicle-details, equipments, equipment-details, farm-implements (all CRUD)
- Employee transfer: `POST /:id/transfer`, `GET /:id/transfer-history`, `POST /:id/transfer/revert`
- Dropdowns: sanctioned-posts, disciplines, infra-masters, kvks-dropdown, staff-dropdown
- Export: `POST /export`

### Forms - Achievements (`/api/forms/achievements/`)
- kvk-awards, scientist-awards, farmer-awards (CRUD)
- extension-activities, other-extension-activities (CRUD)
- cfld-technical-parameters, cfld-extension-activities, cfld-budget-utilizations (CRUD)
- soil-water: equipments, analysis, world-soil-day (CRUD)
- hrd, technology-week, celebration-days (CRUD)
- oft (CRUD)

### Forms - Projects (`/api/forms/achievements/projects/`)
- fpo/management, fpo/details (CRUD)
- seed-hub, arya/current, arya/previous (CRUD)
- csisa, agri-drone (CRUD)

### Reports (`/api/reports/`)
- `GET /kvk/config` - Report config
- `POST /kvk/data` - KVK report data
- `POST /kvk/generate` - Generate KVK report
- `GET /scope` - Report scope
- `POST /scope/children`, `/scope/kvks` - Scope navigation
- `POST /aggregated/generate` - Aggregated report

---

## Role Hierarchy & Permissions

### Hierarchy (0 = highest authority)
```
Level 0: super_admin      - Full system access, no restrictions
Level 1: zone_admin       - Manages entire zone
Level 2: state_admin      - Manages states within zone
Level 3: district_admin   - Manages districts
Level 4: org_admin        - Manages organizations
Level 5: kvk_admin        - Manages single KVK
Level 6: kvk_user         - KVK data entry (ceiling pattern)
Level 7: state_user       - State-level data entry (ceiling pattern)
Level 8: district_user    - District-level data entry (ceiling pattern)
Level 9: org_user         - Org-level data entry (ceiling pattern)
```

### Who Can Create Whom
| Creator | Can Create |
|---|---|
| super_admin | All roles |
| zone_admin | state_admin, district_admin, org_admin, kvk_admin, kvk_user, state_user, district_user, org_user |
| state_admin | state_user, district_admin, org_admin, kvk_admin, kvk_user, district_user, org_user |
| district_admin | district_user, org_user, kvk_user |
| org_admin | org_user, kvk_user |
| kvk_admin | kvk_user only |

### Permission Modules (86 total)
Organized in 11 menu categories:
1. **All Masters** (19+ modules): Zone, State, Org, District, University, OFT, FLD, CFLD, Training, Extension, Products, Climate, ARYA, Publication, Season, Sanctioned Post, Year, etc.
2. **Role Management** (1): Roles
3. **User Management** (1): Users
4. **About KVKs** (8): View KVKs, Bank Accounts, Employees, Staff, Infrastructure, Vehicles, Equipment, Farm Implements
5. **Achievements** (12): OFT, FLD, Training, Extension, Tech Week, Soil/Water, Projects, Publications, Awards, HRD
6. **Performance Indicators** (4): Impact, Infrastructure, Financial, Linkages
7. **Miscellaneous** (6): Crop Diseases, Livestock Diseases, NYK Training, PPV&FRA, RAWE/FET, VIP Visitors
8. **Digital Information** (5): Mobile App, Web Portal, Kisan Sarthi, KMAS, Other Channels
9. **Swachh Bharat** (3): Swachhta hi Sewa, Swachta Pakhwada, Quarterly Budget
10. **Meetings** (2): SAC, ATARI
11. **System** (5): Success Stories, Module Images, Targets, Log History, Notifications, Reports

### Permission Actions
Each module can have: **VIEW**, **ADD**, **EDIT**, **DELETE**

### Bitmask Encoding (in JWT)
- VIEW=1, ADD=2, EDIT=4, DELETE=8
- Example: VIEW+ADD+EDIT = 7 (binary: 0111)
- Stored per moduleCode in access token to reduce JWT size

---

## Key Patterns & Conventions

### Backend Patterns
1. **Route → Controller → Service → Repository → Prisma**: Strict layer separation
2. **Permission bitmask in JWT**: Zero-DB authorization queries
3. **Geographic hierarchy enforcement**: Admin scope limited by assignment (zone_admin sees only their zone)
4. **Soft deletes**: Users set `deletedAt` instead of hard delete
5. **Atomic transactions**: Token rotation, user+permission creation
6. **_user ceiling pattern**: Actual access = intersection(role_permissions, user_permissions)
7. **Prisma error translation**: P2002→Conflict, P2025→NotFound, etc.
8. **Modular Prisma schema**: 80 files organized by feature
9. **Serverless optimization**: Puppeteer-core + chromium, connection pooling
10. **Rate limiting per endpoint type**: Different limits for login, API, strict, refresh

### Frontend Patterns
1. **React Query for server state**: 5min staleTime, smart invalidation
2. **Config-driven routing**: routeConfig.ts defines all routes with metadata
3. **Entity Hook Factory**: useEntityHook dispatches to correct hook for 150+ types
4. **Permission-based UI**: Sidebar, routes, buttons all check permissions
5. **DependentDropdown**: Cascading selectors for geographic hierarchy
6. **DataManagementView**: Generic CRUD component reused across 50+ entities
7. **Auto 401 refresh with mutex**: Prevents race conditions
8. **Cascading query invalidation**: Updating zone invalidates child entities

### Naming Conventions
- **Backend**: camelCase for variables/functions, snake_case for role names, PascalCase for Prisma models
- **Frontend**: camelCase for variables/hooks, PascalCase for components, UPPER_SNAKE for constants
- **API routes**: kebab-case (e.g., `/about-kvk/bank-accounts`)
- **Module codes**: snake_case (e.g., `all_masters_zone_master`)

### Environment Variables
```
# Backend (.env)
DATABASE_URL=postgresql://user:password@host:5432/db
PORT=5000
NODE_ENV=development
BCRYPT_ROUNDS=12
JWT_SECRET=...
JWT_REFRESH_SECRET=...
FRONTEND_URL=http://localhost:5173

# Frontend (.env)
VITE_API_URL=/api
```

---

## Seed Data & Master Data

### Default Seeded Users
1. **Super Admin**: `superadmin@atari.gov.in` / `Atari@123`
2. **KVK User**: `kvkuser@atari.gov.in` / `Atari@123` (with test hierarchy)

### Seeded Hierarchy
- Zone: "Zone IV - Patna"
- States: Bihar, Jharkhand, Andaman & Nicobar, Odisha, West Bengal
- Districts: 14 total across states
- Organizations: ICAR (default)
- Universities: 6 agricultural universities

### Master Data Categories
- **Staff**: 4 categories (Gen, OBC, SC, ST), 18 pay levels
- **Training**: 12 types, 11 areas, 11 clientele, 13 thematic areas
- **Extension**: 16 activity types, 13 other types, 12 important days
- **Products**: 7 categories with types (Seeds, Biofertilizers, Biopesticides, Vermicompost, Planting Material, Livestock, Processed)
- **CRA**: Cropping systems (3 seasons), Farming systems (3 seasons)
- **ARYA**: 12 enterprise types
- **Other**: 3 seasons, 13 disciplines, 15 infrastructure types, 9 sanctioned posts, 7 soil/water analysis types, 6 fiscal years

### Seed Execution
```bash
npm run seed        # Core: roles → permissions → users → hierarchy → masters → years
npm run seed-all    # Core + form data for all KVKs
```

---

## Known Areas & Potential Issues

### Architecture Notes
1. **Express 5.x**: Using a very recent major version - check for breaking changes
2. **Modular Prisma**: 80 schema files - migrations need care
3. **Permission intersection model**: _user roles see intersection of role+user permissions; can be confusing
4. **JWT bitmask**: Compact but requires synced encode/decode logic
5. **Legacy token support**: `decodePermissions` supports old string[] format for backward compat
6. **Phone validation**: Indian 10-digit format only (6-9 prefix)

### Frontend Notes
1. **Large routeConfig.ts**: Single file with all route definitions - can be hard to maintain
2. **150+ entity types**: Hook factory pattern manages complexity but adds indirection
3. **Permission-based rendering**: Missing moduleCode silently fails (dev warning only)
4. **React 19**: Latest version - check for breaking changes with libraries

### Current Branch State (role-edit)
Modified files:
- `frontend/src/components/layout/Sidebar.tsx`
- `frontend/src/pages/admin/RoleManagement.tsx`
- `frontend/src/pages/dashboard/Dashboard.tsx`

Recent fixes addressed:
- Permission filtering
- Phone number normalization
- Graceful role fallback
- KVK-related functionality
- DB/API form issues

---

## Quick Reference for Bug Fixing

### To trace a bug from UI to DB:
1. **Frontend page** → check `config/routeConfig.ts` for route + moduleCode
2. **API call** → check `services/*.ts` for endpoint
3. **Backend route** → check `routes/` for middleware + controller
4. **Business logic** → check `services/` for validation + logic
5. **Data access** → check `repositories/` for Prisma queries
6. **Schema** → check `prisma/` for model definition

### Common debugging paths:
- **Auth issues**: `AuthContext.tsx` → `api.ts` (refresh) → `authService.js` → `jwt.js`
- **Permission issues**: `Sidebar.tsx`/`ProtectedRoute.tsx` → `AuthContext.tsx` (hasPermission) → `auth.js` middleware → `jwt.js` (bitmask)
- **Master data issues**: `useMasterData.ts` → `masterDataApi.ts` → `masterDataRoutes.js` → controller → service → repo
- **Form data issues**: `useEntityHook.ts` → specific hook → specific API → form routes → form controller → form service → form repo
- **User management**: `UserManagement.tsx` → `useUserManagement.ts` → `userApi.ts` → `adminRoutes.js` → `userManagementController.js` → `userManagementService.js`
- **Role/permission management**: `RolePermissionEditor.tsx` → API → `rolePermissionController.js` → `rolePermissionService.js`

### Key validation points:
- **User creation**: Email format, password strength (8+ chars, upper+lower+number), role hierarchy, geographic hierarchy derivation
- **Permission checks**: `requirePermission(moduleCode, action)` in middleware, `hasPermission(action, moduleCode)` in frontend
- **Geographic scoping**: Admin users can only see/manage entities within their assigned zone/state/district/org/kvk
