# Universal “Other” Master Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `isOther` visible and persistent on every editable All Masters form, while completing specify-other behavior for downstream selectors that use those masters.

**Architecture:** Extend the project’s existing `isOther`/`...Other` convention rather than adding a new polymorphic subsystem. Additive Prisma fields and migrations establish storage, existing repository-family sanitizers persist the flag, shared React components render the control, and consumer forms reuse `useOtherSpecify` plus `SpecifyOtherInput`.

**Tech Stack:** Node.js/CommonJS, Prisma 7/PostgreSQL, React 19/TypeScript, Vite, Node test runner.

## Global Constraints

- Every editable All Masters form renders `IsOtherCheckbox`.
- Existing API payloads remain backward compatible; omitted `isOther` values resolve to `false`.
- Database changes are additive and preserve existing rows.
- Existing foreign-key relationships, permissions, sorting, pagination, and deletion behavior remain unchanged.
- No master row is inferred as Other from its name.

---

### Task 1: Universal contract tests

**Files:**
- Create: `backend/tests/allMastersIsOtherContract.test.js`
- Modify: `backend/tests/otherMastersRepository.test.js`

**Interfaces:**
- Consumes: Prisma DMMF model metadata and exported repository configurations.
- Produces: a single inventory contract for the 70 editable master entities and focused write-allowlist assertions.

- [ ] **Step 1: Write failing schema coverage tests**

Create an explicit master-label-to-Prisma-model inventory and assert every model includes a scalar Boolean field named `isOther`.

- [ ] **Step 2: Write failing repository coverage tests**

Assert every `otherMastersRepository` entity used by a checkbox includes `isOther` in `extraFields`; capture the specialized Agri Drone create/update data and assert the flag reaches Prisma.

- [ ] **Step 3: Write failing frontend visibility tests**

Read the six All Masters form source files and assert every master entity in the inventory is paired with `IsOtherCheckbox`, including shared conditions such as Equipment Type/Vehicle Type.

- [ ] **Step 4: Run tests and verify RED**

Run: `cd backend && node --test tests/allMastersIsOtherContract.test.js tests/otherMastersRepository.test.js`

Expected: failures naming the 25 missing Prisma fields, missing repository allowlists, specialized Agri Drone omission, and missing form controls.

### Task 2: Prisma models and additive migration

**Files:**
- Modify: the 25 Prisma model files reported by Task 1.
- Create: `backend/prisma/migrations/20260713130000_universal_master_is_other/migration.sql`

**Interfaces:**
- Consumes: the explicit model inventory from Task 1.
- Produces: `isOther Boolean @default(false) @map("is_other")` on every editable master model and matching database columns.

- [ ] **Step 1: Add `isOther` to the missing Prisma models**

Add the field beside each model’s name field so generated clients expose a consistent property.

- [ ] **Step 2: Add the migration**

For each affected table, add:

```sql
ALTER TABLE "<table>" ADD COLUMN IF NOT EXISTS "is_other" BOOLEAN NOT NULL DEFAULT false;
```

- [ ] **Step 3: Validate and generate Prisma client**

Run: `cd backend && npx prisma validate && npx prisma generate`

Expected: both commands exit 0.

- [ ] **Step 4: Run schema contract tests**

Run: `cd backend && node --test tests/allMastersIsOtherContract.test.js`

Expected: schema assertions pass while repository/frontend assertions remain red.

### Task 3: Backend create/update persistence

**Files:**
- Modify: `backend/repositories/all-masters/masterDataRepository.js`
- Modify: `backend/repositories/all-masters/otherMastersRepository.js`
- Modify: `backend/repositories/all-masters/trainingExtensionEventsRepository.js`
- Modify: `backend/repositories/all-masters/agriDroneDemonstrationsOnRepository.js`
- Modify: `backend/repositories/all-masters/publicationRepository.js` only if its scalar sanitizer does not already retain the flag.

**Interfaces:**
- Consumes: API payload property `isOther?: boolean`.
- Produces: create/update Prisma data containing the same Boolean value and API responses returning the persisted flag.

- [ ] **Step 1: Extend allowlist repository configurations**

Add `isOther` to Basic Masters `allowedFields`, every affected Other Masters `extraFields`, and the Training Event `writableFields` list.

- [ ] **Step 2: Repair specialized Agri Drone writes**

Construct create/update data as:

```js
{
    demonstrationsOnName: name,
    ...(data?.isOther !== undefined ? { isOther: Boolean(data.isOther) } : {}),
}
```

- [ ] **Step 3: Verify scalar-copy repository families**

Confirm OFT/FLD, Production Projects, and Publication sanitizers retain non-object Boolean fields without extra changes.

- [ ] **Step 4: Run repository contract tests**

Run: `cd backend && node --test tests/allMastersIsOtherContract.test.js tests/otherMastersRepository.test.js tests/oftFldService.test.js`

Expected: schema and backend persistence assertions pass; frontend visibility assertions remain red.

### Task 4: Universal master checkbox rendering

**Files:**
- Modify: `frontend/src/pages/dashboard/shared/forms/BasicMasterForms.tsx`
- Modify: `frontend/src/pages/dashboard/shared/forms/OftFldForms.tsx`
- Modify: `frontend/src/pages/dashboard/shared/forms/TrainingExtensionForms.tsx`
- Modify: `frontend/src/pages/dashboard/shared/forms/ProductionProjectForms.tsx`
- Modify: `frontend/src/pages/dashboard/shared/forms/OtherMastersForms.tsx`
- Modify: `frontend/src/pages/dashboard/shared/forms/PublicationForms.tsx`

**Interfaces:**
- Consumes: `formData.isOther` and `setFormData`.
- Produces: a controlled `IsOtherCheckbox` on every master form.

- [ ] **Step 1: Import the shared checkbox where missing**

Use:

```tsx
import { IsOtherCheckbox } from '@/components/common/IsOtherCheckbox'
```

- [ ] **Step 2: Wrap single-field master editors and render the checkbox**

Use the controlled pattern:

```tsx
<IsOtherCheckbox
    checked={Boolean(formData.isOther)}
    onChange={(checked) => setFormData((prev: any) => ({ ...prev, isOther: checked }))}
/>
```

Preserve all existing inputs, dropdowns, and callbacks.

- [ ] **Step 3: Run frontend visibility contracts**

Run: `cd backend && node --test tests/allMastersIsOtherContract.test.js`

Expected: all schema, repository, and visibility assertions pass.

### Task 5: Downstream specify-other wiring

**Files:**
- Modify: Prisma consuming-record models identified by relation references to the newly enabled masters.
- Create: `backend/prisma/migrations/20260713140000_universal_master_specify_other/migration.sql`
- Modify: corresponding form repositories and response mappers.
- Modify: corresponding React data-entry forms.

**Interfaces:**
- Consumes: options with `{ value, label, isOther }` and selected master IDs.
- Produces: nullable `<field>Other` values stored on consuming records and shown only for flagged selections.

- [ ] **Step 1: Inventory actual downstream selectors**

Use Prisma relations and frontend dropdown references for each newly enabled master. Exclude masters that are never selected by a data-entry form.

- [ ] **Step 2: Add nullable consumer fields and migration columns**

For each actual selector, add a field following the existing convention:

```prisma
<field>Other String? @map("<field>_other")
```

- [ ] **Step 3: Persist and map consumer values**

Include the new scalar in create/update sanitization and prefer it over the related master name in response/report display mapping.

- [ ] **Step 4: Add conditional inputs**

Carry `isOther` through `createMasterDataOptions`, use `useOtherSpecify`, clear stale values when a non-Other option is selected, and render `SpecifyOtherInput`.

- [ ] **Step 5: Validate migration and generated client**

Run: `cd backend && npx prisma validate && npx prisma generate`

Expected: both commands exit 0.

### Task 6: Full verification

**Files:**
- Verify all modified files; no new behavior is added in this task.

**Interfaces:**
- Consumes: completed Tasks 1–5.
- Produces: evidence that backend, schema, frontend, and formatting are valid.

- [ ] **Step 1: Run backend tests**

Run: `cd backend && node --test tests/*.test.js`

Expected: zero failures.

- [ ] **Step 2: Run Prisma validation and generation**

Run: `cd backend && npx prisma validate && npx prisma generate`

Expected: both exit 0.

- [ ] **Step 3: Build frontend**

Run: `cd frontend && npm run build`

Expected: TypeScript and Vite build exit 0.

- [ ] **Step 4: Check diff integrity**

Run: `git diff --check && git status --short --branch`

Expected: no whitespace errors and only intended files modified.
