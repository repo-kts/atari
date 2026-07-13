# Parent-Scoped Master Uniqueness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent false duplicate-name conflicts for eight dependent All Masters while retaining conflicts inside the same parent scope.

**Architecture:** Standardize the existing `uniqueScopeFields` metadata pattern across OFT/FLD, Training, and Other Masters. Services build scope filters from complete update state (`existing + incoming`) and repositories combine those filters with name and excluded ID.

**Tech Stack:** Node.js, CommonJS, Prisma 7, PostgreSQL, Node test runner.

## Global Constraints

- Do not change Prisma schemas, migrations, or existing data.
- Permit the same name under different configured parents.
- Continue rejecting the same name under the same configured parents.
- Exclude the current record ID during updates.
- Preserve scope during partial updates that omit parent IDs.
- Keep Financial Project name uniqueness global.

---

### Task 1: OFT/FLD and CFLD scope metadata

**Files:**
- Modify: `backend/tests/oftFldService.test.js`
- Modify: `backend/repositories/all-masters/oftFldRepository.js`

**Interfaces:**
- Consumes: existing `buildScopeFilters(config, data)` and `nameExists(entityName, name, excludeId, additionalFilters)`.
- Produces: `uniqueScopeFields` metadata for four dependent masters.

- [ ] **Step 1: Write failing parameterized update tests**

Add cases asserting these exact duplicate checks:

```js
const cases = [
    ['fld-thematic-areas', 11, 'Others', { sectorId: 6 }],
    ['fld-categories', 12, 'Others', { sectorId: 6 }],
    ['fld-subcategories', 13, 'Others', { categoryId: 1, sectorId: 6 }],
    ['cfld-crops', 14, 'Other', { seasonId: 1, typeId: 2 }],
];
```

For every case, stub `findById`, capture `nameExists` arguments, update with only the name and `isOther`, and assert the stored parent IDs are passed as the fourth argument.

- [ ] **Step 2: Run the test and verify RED**

Run: `cd backend && node --test tests/oftFldService.test.js`

Expected: all four new cases fail because the fourth argument is `{}`.

- [ ] **Step 3: Add minimal configuration metadata**

Add:

```js
'fld-thematic-areas': { uniqueScopeFields: ['sectorId'] }
'fld-categories': { uniqueScopeFields: ['sectorId'] }
'fld-subcategories': { uniqueScopeFields: ['categoryId', 'sectorId'] }
'cfld-crops': { uniqueScopeFields: ['seasonId', 'typeId'] }
```

Keep every existing configuration property unchanged.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `cd backend && node --test tests/oftFldService.test.js`

Expected: all OFT/FLD scoped update tests pass.

---

### Task 2: Training hierarchy scope support

**Files:**
- Create: `backend/tests/trainingExtensionEventsService.test.js`
- Modify: `backend/repositories/all-masters/trainingExtensionEventsRepository.js`
- Modify: `backend/services/all-masters/trainingExtensionEventsService.js`

**Interfaces:**
- Consumes: Training entity configuration and repository `nameExists` fourth argument.
- Produces: `buildScopeFilters(config, data)` behavior for Training Area and Training Thematic Area.

- [ ] **Step 1: Write failing create/update tests**

Test these scopes:

```js
[
    ['training-areas', 'trainingAreaName', 'Other', { trainingTypeId: 2 }],
    ['training-thematic-areas', 'trainingThematicAreaName', 'Any Other', { trainingAreaId: 4 }],
]
```

For updates, make `findById` return the parent ID while the update payload omits it. Assert `nameExists` receives `(entityName, name, id, scope)`. For creates, assert it receives `(entityName, name, null, scope)`.

- [ ] **Step 2: Run the test and verify RED**

Run: `cd backend && node --test tests/trainingExtensionEventsService.test.js`

Expected: duplicate checks omit the fourth scope argument.

- [ ] **Step 3: Implement Training scope metadata and builder**

Add `uniqueScopeFields: ['trainingTypeId']` and `uniqueScopeFields: ['trainingAreaId']` to the two configurations. Add the same small `buildScopeFilters` function used by the OFT/FLD service. Pass its result to create duplicate checks. During update, retain `existing`, merge `{ ...existing, ...data }`, and pass the resulting scope.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `cd backend && node --test tests/trainingExtensionEventsService.test.js`

Expected: create and partial-update cases pass.

---

### Task 3: Other Masters scoped duplicate support

**Files:**
- Create: `backend/tests/otherMastersServiceScope.test.js`
- Modify: `backend/repositories/all-masters/otherMastersRepository.js`
- Modify: `backend/services/all-masters/otherMastersService.js`

**Interfaces:**
- Consumes: `uniqueScopeFields` metadata and repository duplicate lookup.
- Produces: parent-scoped checks for Equipment Master and NICRA Subcategory while leaving Financial Project global.

- [ ] **Step 1: Write failing create/update tests**

Assert these scopes:

```js
[
    ['equipment-master', 'name', 'Other', { equipmentTypeId: 3 }],
    ['nicra-sub-category', 'subCategoryName', 'Other', { nicraCategoryId: 5 }],
]
```

Also assert a Financial Project update passes `{}` so its globally unique `projectName` behavior cannot accidentally become funding-agency scoped.

- [ ] **Step 2: Run the test and verify RED**

Run: `cd backend && node --test tests/otherMastersServiceScope.test.js`

Expected: the repository call receives only three arguments or ignores additional filters.

- [ ] **Step 3: Implement generic scope support**

Add `uniqueScopeFields` only to `equipment-master` and `nicra-sub-category`. Extend repository `nameExists` to accept `additionalFilters = {}` and spread it into `where`. Add a service scope builder, use it during create, and merge existing state during update before building filters.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `cd backend && node --test tests/otherMastersServiceScope.test.js`

Expected: both parent-scoped cases and the Financial Project global case pass.

---

### Task 4: Full verification and delivery

**Files:**
- Verify: all modified files.

**Interfaces:**
- Consumes: completed scoped-validation behavior.
- Produces: a tested commit ready to push.

- [ ] **Step 1: Run all backend tests**

Run: `cd backend && node --test tests/*.test.js`

Expected: zero failures.

- [ ] **Step 2: Validate Prisma and build frontend**

Run: `cd backend && npx prisma validate`

Run: `cd frontend && npm run build`

Expected: both commands exit zero; existing Vite chunk warnings are acceptable.

- [ ] **Step 3: Check source integrity**

Run:

```bash
node --check backend/services/all-masters/oftFldService.js
node --check backend/services/all-masters/trainingExtensionEventsService.js
node --check backend/services/all-masters/otherMastersService.js
git diff --check
```

Expected: all commands exit zero.

- [ ] **Step 4: Commit implementation**

```bash
git add backend/repositories/all-masters backend/services/all-masters backend/tests
git commit -m "fix: scope dependent master duplicate checks"
```
