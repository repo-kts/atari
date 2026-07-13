# Complete Downstream “Other” Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add conditional, persisted “Specify Other” values to the 17 approved downstream selectors while excluding Zone, State, District, Organization, and University from Other behavior.

**Architecture:** Extend the existing `isOther` + nullable `<field>Other` convention. Master options carry `isOther`; React uses `useOtherSpecify` and `SpecifyOtherInput`; repositories trim and persist nullable text; Prisma models and one additive migration provide storage. Structural geography/organization masters keep their harmless database columns but stop exposing the checkbox.

**Tech Stack:** React 19, TypeScript, Vite, Node.js/CommonJS, Prisma 7, PostgreSQL, Node test runner.

## Global Constraints

- Render the custom input only for a selected option with `isOther: true`.
- Require the custom input while visible.
- Clear stale custom text when the selection changes to a normal option.
- Preserve existing create/update payload compatibility when new fields are omitted.
- Prefer custom text over the generic Other label in edit/list/report mappings.
- Add nullable `TEXT` columns only; do not delete, rename, or rewrite existing data.
- Do not add Other behavior to Zone, State, District, Organization, or University.

---

### Task 1: Regression contracts for the complete inventory

**Files:**
- Modify: `backend/tests/allMastersIsOtherContract.test.js`

**Interfaces:**
- Consumes: Prisma model source and downstream React form source.
- Produces: explicit `CONSUMER_FIELDS` and `UI_CONTRACTS` inventories covering all 17 approved selectors.

- [ ] **Step 1: Write failing Prisma consumer contracts**

Add this inventory and assert each model contains the nullable field:

```js
const CONSUMER_FIELDS = [
    ['backend/prisma/kvk/about-kvk/employee_schema.prisma', 'KvkStaff', 'disciplineOther'],
    ['backend/prisma/kvk/achievements/projects/cfld/extension_activity_schema.prisma', 'ExtensionActivityOrganized', 'activityOther'],
    ['backend/prisma/kvk/achievements/projects/cfld/budget_utilization_schema.prisma', 'KvkBudgetUtilization', 'cropOther'],
    ['backend/prisma/kvk/achievements/fld/technical_feedback_schema.prisma', 'FldTechnicalFeedback', 'cropOther'],
    ['backend/prisma/kvk/achievements/projects/natural_farming/demonstration_info_schema.prisma', 'DemonstrationInfo', 'staffCategoryOther'],
    ['backend/prisma/kvk/performance-indicators/impact/kvk_activities_schema.prisma', 'KvkImpactActivity', 'specificAreaOther'],
    ['backend/prisma/kvk/performance-indicators/impact/entrepreneurship_schema.prisma', 'Entrepreneurship', 'enterpriseTypeOther'],
    ['backend/prisma/kvk/achievements/fld/fld_schema.prisma', 'KvkFldIntroduction', 'seasonOther'],
    ['backend/prisma/kvk/achievements/oft_schema.prisma', 'Kvkoft', 'seasonOther'],
    ['backend/prisma/kvk/achievements/projects/climate_resilient/cra_details_schema.prisma', 'CraDetails', 'seasonOther'],
    ['backend/prisma/kvk/achievements/projects/csisa_schema.prisma', 'Csisa', 'seasonOther'],
    ['backend/prisma/kvk/achievements/projects/nari/bio_fortified_crops_schema.prisma', 'NariBioFortifiedCrop', 'seasonOther'],
    ['backend/prisma/kvk/achievements/projects/natural_farming/demonstration_info_schema.prisma', 'DemonstrationInfo', 'seasonOther'],
    ['backend/prisma/kvk/achievements/projects/natural_farming/soil_data_info_schema.prisma', 'SoilDataInformation', 'seasonOther'],
    ['backend/prisma/kvk/achievements/projects/nicra/nicra_details_schema.prisma', 'NicraDetails', 'seasonOther'],
    ['backend/prisma/kvk/achievements/projects/seed_hub_schema.prisma', 'KvkSeedHubProgram', 'seasonOther'],
    ['backend/prisma/kvk/performance-indicators/infrastructure/instructional_farm_crops_schema.prisma', 'InstructionalFarmCrop', 'seasonOther'],
];

test('every approved downstream selector has nullable specify-other storage', () => {
    for (const [relativeFile, modelName, field] of CONSUMER_FIELDS) {
        const source = fs.readFileSync(path.join(ROOT, relativeFile), 'utf8');
        assert.match(modelBlock(source, modelName), new RegExp(`^\\s*${field}\\s+String\\?`, 'm'));
    }
});
```

- [ ] **Step 2: Write failing UI and structural-exclusion contracts**

For each approved form source, assert the new custom property, `useOtherSpecify`, and `SpecifyOtherInput` are present. Assert `BasicMasterForms.tsx` contains no `IsOtherCheckbox` inside the Zone, State, District, Organization, and University branches; retain checkbox coverage for all non-structural masters.

```js
test('structural masters do not expose the Other checkbox', () => {
    const source = fs.readFileSync(path.join(ROOT, 'frontend/src/pages/dashboard/shared/forms/BasicMasterForms.tsx'), 'utf8');
    for (const entity of ['ZONES', 'STATES', 'DISTRICTS', 'ORGANIZATIONS', 'UNIVERSITIES']) {
        const start = source.indexOf(`ENTITY_TYPES.${entity}`);
        const next = source.indexOf('{entityType ===', start + 1);
        const branch = source.slice(start, next === -1 ? source.length : next);
        assert.doesNotMatch(branch, /<IsOtherCheckbox\b/);
    }
});
```

- [ ] **Step 3: Run the contracts and verify RED**

Run: `cd backend && node --test tests/allMastersIsOtherContract.test.js`

Expected: failures naming the missing consumer fields and the five structural checkbox branches.

- [ ] **Step 4: Commit the red contracts**

```bash
git add backend/tests/allMastersIsOtherContract.test.js
git commit -m "test: cover downstream other selectors"
```

---

### Task 2: Additive Prisma storage and migration

**Files:**
- Modify: the 16 unique Prisma files listed in Task 1.
- Create: `backend/prisma/migrations/20260713150000_complete_downstream_specify_other/migration.sql`

**Interfaces:**
- Consumes: properties named in `CONSUMER_FIELDS`.
- Produces: nullable Prisma strings mapped to nullable PostgreSQL `TEXT` columns.

- [ ] **Step 1: Add the exact Prisma fields**

Add these scalar declarations next to their related IDs/strings:

```prisma
disciplineOther    String? @map("discipline_other")
activityOther      String? @map("activity_other")
cropOther          String? @map("crop_other")
staffCategoryOther String? @map("staff_category_other")
specificAreaOther  String? @map("specific_area_other")
enterpriseTypeOther String? @map("enterprise_type_other")
seasonOther        String? @map("season_other")
```

Use only the declaration matching each `CONSUMER_FIELDS` entry; `DemonstrationInfo` receives both `staffCategoryOther` and `seasonOther`.

- [ ] **Step 2: Create the additive migration**

```sql
ALTER TABLE "kvk_staff" ADD COLUMN "discipline_other" TEXT;
ALTER TABLE "extension_activity_organized" ADD COLUMN "activity_other" TEXT;
ALTER TABLE "kvk_budget_utilization" ADD COLUMN "crop_other" TEXT;
ALTER TABLE "fld_technical_feedback" ADD COLUMN "crop_other" TEXT;
ALTER TABLE "demonstration_info" ADD COLUMN "staff_category_other" TEXT;
ALTER TABLE "kvk_impact_activity" ADD COLUMN "specific_area_other" TEXT;
ALTER TABLE "entrepreneurship" ADD COLUMN "enterprise_type_other" TEXT;
ALTER TABLE "kvk_fld_introduction" ADD COLUMN "season_other" TEXT;
ALTER TABLE "kvk_oft" ADD COLUMN "season_other" TEXT;
ALTER TABLE "cra_details" ADD COLUMN "season_other" TEXT;
ALTER TABLE "csisa" ADD COLUMN "season_other" TEXT;
ALTER TABLE "nari_bio_fortified_crop" ADD COLUMN "season_other" TEXT;
ALTER TABLE "demonstration_info" ADD COLUMN "season_other" TEXT;
ALTER TABLE "soil_data_information" ADD COLUMN "season_other" TEXT;
ALTER TABLE "nicra_details" ADD COLUMN "season_other" TEXT;
ALTER TABLE "kvk_seed_hub_program" ADD COLUMN "season_other" TEXT;
ALTER TABLE "instructional_farm_crop" ADD COLUMN "season_other" TEXT;
```

- [ ] **Step 3: Validate and generate Prisma**

Run: `cd backend && npx prisma validate && npx prisma generate`

Expected: both commands exit 0.

- [ ] **Step 4: Run the schema contracts**

Run: `cd backend && node --test tests/allMastersIsOtherContract.test.js`

Expected: consumer-storage assertions pass; UI/exclusion assertions remain red.

- [ ] **Step 5: Commit schema storage**

```bash
git add backend/prisma backend/tests/allMastersIsOtherContract.test.js
git commit -m "feat: add downstream other storage"
```

---

### Task 3: Employee Discipline end-to-end support

**Files:**
- Modify: `frontend/src/pages/dashboard/shared/forms/AboutKvkForms.tsx`
- Modify: `frontend/src/types/aboutKvk.ts`
- Modify: `frontend/src/services/aboutKvkApi.ts`
- Modify: `backend/repositories/forms/aboutKvkRepository.js`
- Test: `backend/tests/allMastersIsOtherContract.test.js`

**Interfaces:**
- Consumes: `disciplineId`, discipline option `isOther`.
- Produces: `disciplineOther?: string | null` on employee create/update/read payloads.

- [ ] **Step 1: Extend the failing contract to cover both allow-lists**

Assert `disciplineOther` occurs in `STAFF_ALLOWED_KEYS` and `KVK_STAFF_ALLOWED_FIELDS`.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `cd backend && node --test tests/allMastersIsOtherContract.test.js`

Expected: failure reports missing employee allow-list support.

- [ ] **Step 3: Implement Employee Discipline behavior**

Add `disciplineOther` to the employee interface and both allow-lists. In `AboutKvkForms.tsx`, compute `isOtherDisciplineSelected`, clear stale text in the Discipline `onChange`, and render:

```tsx
{isOtherDisciplineSelected && (
    <SpecifyOtherInput
        label="Please specify discipline"
        required
        value={formData.disciplineOther ?? ''}
        onChange={(e) => setFormData({ ...formData, disciplineOther: e.target.value })}
    />
)}
```

- [ ] **Step 4: Run focused tests**

Run: `cd backend && node --test tests/allMastersIsOtherContract.test.js tests/otherMastersRepository.test.js`

Expected: Employee Discipline contracts pass.

- [ ] **Step 5: Commit Employee Discipline support**

```bash
git add frontend/src/pages/dashboard/shared/forms/AboutKvkForms.tsx frontend/src/types/aboutKvk.ts frontend/src/services/aboutKvkApi.ts backend/repositories/forms/aboutKvkRepository.js backend/tests/allMastersIsOtherContract.test.js
git commit -m "fix: support other employee disciplines"
```

---

### Task 4: CFLD, FLD, and Natural Farming direct selectors

**Files:**
- Modify: `frontend/src/pages/dashboard/shared/forms/projects/CfldForms.tsx`
- Modify: `frontend/src/pages/dashboard/shared/forms/OftFldForms.tsx`
- Modify: `frontend/src/pages/dashboard/shared/forms/projects/NaturalFarmingForms.tsx`
- Modify: `backend/repositories/forms/cfldExtensionActivityRepository.js`
- Modify: `backend/repositories/forms/cfldBudgetUtilizationRepository.js`
- Modify: `backend/repositories/forms/fldTechnicalFeedbackRepository.js`
- Modify: `backend/repositories/forms/naturalFarmingRepository.js`
- Test: `backend/tests/allMastersIsOtherContract.test.js`

**Interfaces:**
- Consumes: Extension Activity, FLD Crop, and Staff Category options carrying `isOther`.
- Produces: `activityOther`, `cropOther`, and `staffCategoryOther` values on create/update/read paths.

- [ ] **Step 1: Add failing source contracts for all four selectors**

Assert the form sources preserve `isOther`, call `otherResetPatch`, render `SpecifyOtherInput`, and the four repositories mention their matching custom property.

- [ ] **Step 2: Run and verify RED**

Run: `cd backend && node --test tests/allMastersIsOtherContract.test.js`

Expected: failures identify CFLD Extension Activity, CFLD Budget Crop, FLD Feedback Crop, and Natural Farming Staff Category.

- [ ] **Step 3: Implement the four selector flows**

Create flagged options and `useOtherSpecify` bindings for these exact tuples:

```js
[
    ['extensionActivityOptions', 'formData.extensionActivityId', 'activityOther'],
    ['cfldCropOptions', 'formData.cropId', 'cropOther'],
    ['cropOptionsForSelectedFld', 'formData.cropId', 'cropOther'],
    ['staffCategoryOptions', 'formData.staffCategoryId', 'staffCategoryOther'],
]
```

Each selector preserves its existing ID field, spreads `otherResetPatch(value, '<property>')`, and renders a required `SpecifyOtherInput` bound to the listed property. The labels are “Please specify other extension activity”, “Please specify other crop”, and “Please specify other category”.

- [ ] **Step 4: Persist and map values in repositories**

For raw SQL repositories, add the exact `activity_other`, `crop_other`, or `staff_category_other` column and parameter to INSERT/UPDATE/SELECT statements. For Prisma repositories, use the corresponding explicit expression:

```js
activityOther: data.activityOther !== undefined
    ? ((String(data.activityOther).trim()) || null)
    : existing.activityOther,
cropOther: data.cropOther !== undefined
    ? ((String(data.cropOther).trim()) || null)
    : existing.cropOther,
staffCategoryOther: data.staffCategoryOther !== undefined
    ? ((String(data.staffCategoryOther).trim()) || null)
    : existing.staffCategoryOther,
```

Return the corresponding property with `?? ''` and prefer it when producing the Extension Activity, Crop, or Staff Category display label.

- [ ] **Step 5: Run the focused contracts**

Run: `cd backend && node --test tests/allMastersIsOtherContract.test.js`

Expected: all four direct-selector contracts pass.

- [ ] **Step 6: Commit direct-selector support**

```bash
git add frontend/src/pages/dashboard/shared/forms/projects/CfldForms.tsx frontend/src/pages/dashboard/shared/forms/OftFldForms.tsx frontend/src/pages/dashboard/shared/forms/projects/NaturalFarmingForms.tsx backend/repositories/forms/cfldExtensionActivityRepository.js backend/repositories/forms/cfldBudgetUtilizationRepository.js backend/repositories/forms/fldTechnicalFeedbackRepository.js backend/repositories/forms/naturalFarmingRepository.js backend/tests/allMastersIsOtherContract.test.js
git commit -m "fix: complete direct other selectors"
```

---

### Task 5: Season Other support across ten forms

**Files:**
- Modify: `frontend/src/pages/dashboard/shared/forms/OftFldForms.tsx`
- Modify: `frontend/src/pages/dashboard/shared/forms/projects/CraForms.tsx`
- Modify: `frontend/src/pages/dashboard/shared/forms/projects/CsisaForms.tsx`
- Modify: `frontend/src/pages/dashboard/shared/forms/projects/NariForms.tsx`
- Modify: `frontend/src/pages/dashboard/shared/forms/projects/NaturalFarmingForms.tsx`
- Modify: `frontend/src/pages/dashboard/shared/forms/projects/NicraForms.tsx`
- Modify: `frontend/src/pages/dashboard/shared/forms/projects/SeedHubForms.tsx`
- Modify: `frontend/src/pages/dashboard/shared/forms/performance-indicators/InfrastructurePerformanceForms.tsx`
- Modify: `backend/repositories/forms/fldRepository.js`
- Modify: `backend/repositories/forms/oftRepository.js`
- Modify: `backend/repositories/forms/craDetailsRepository.js`
- Modify: `backend/repositories/forms/csisaRepository.js`
- Modify: `backend/repositories/forms/nariBioFortifiedCropRepository.js`
- Modify: `backend/repositories/forms/naturalFarmingRepository.js`
- Modify: `backend/repositories/forms/nicraDetailsRepository.js`
- Modify: `backend/repositories/forms/seedHubRepository.js`
- Modify: `backend/repositories/forms/instructionalFarmCropRepository.js`
- Test: `backend/tests/allMastersIsOtherContract.test.js`

**Interfaces:**
- Consumes: Season options `{ value, label, isOther }` and `seasonId`.
- Produces: nullable `seasonOther` on all ten form records.

- [ ] **Step 1: Add failing source contracts for all Season consumers**

Assert every listed form passes `{ flagKey: 'isOther' }`, uses `useOtherSpecify`, clears `seasonOther`, and renders `SpecifyOtherInput`; assert every repository mentions `seasonOther` in create/update/read handling.

- [ ] **Step 2: Run and verify RED**

Run: `cd backend && node --test tests/allMastersIsOtherContract.test.js`

Expected: failures name all ten missing Season consumers.

- [ ] **Step 3: Implement the React Season pattern**

For each form component, create flagged options and bind the selected value:

```tsx
const seasonOptions = useMemo(
    () => createMasterDataOptions(seasons, 'seasonId', 'seasonName', { flagKey: 'isOther' }),
    [seasons],
)
const { isOtherSelected: isOtherSeason, otherResetPatch: seasonResetPatch } =
    useOtherSpecify(seasonOptions, formData.seasonId)
```

Each Season dropdown applies `seasonResetPatch(value, 'seasonOther')`, followed by:

```tsx
{isOtherSeason && (
    <SpecifyOtherInput
        label="Please specify other season"
        required
        value={formData.seasonOther}
        onChange={(e) => setFormData((prev: any) => ({ ...prev, seasonOther: e.target.value }))}
    />
)}
```

- [ ] **Step 4: Implement repository persistence**

Each repository trims provided text to `null`, preserves omitted values during update, returns `seasonOther`, and uses `seasonOther || season.seasonName` for display output.

```js
seasonOther: data.seasonOther !== undefined
    ? ((String(data.seasonOther).trim()) || null)
    : existing.seasonOther
```

- [ ] **Step 5: Run the focused contracts**

Run: `cd backend && node --test tests/allMastersIsOtherContract.test.js`

Expected: all Season consumer contracts pass.

- [ ] **Step 6: Commit Season support**

```bash
git add frontend/src/pages/dashboard/shared/forms/OftFldForms.tsx frontend/src/pages/dashboard/shared/forms/projects/CraForms.tsx frontend/src/pages/dashboard/shared/forms/projects/CsisaForms.tsx frontend/src/pages/dashboard/shared/forms/projects/NariForms.tsx frontend/src/pages/dashboard/shared/forms/projects/NaturalFarmingForms.tsx frontend/src/pages/dashboard/shared/forms/projects/NicraForms.tsx frontend/src/pages/dashboard/shared/forms/projects/SeedHubForms.tsx frontend/src/pages/dashboard/shared/forms/performance-indicators/InfrastructurePerformanceForms.tsx backend/repositories/forms/fldRepository.js backend/repositories/forms/oftRepository.js backend/repositories/forms/craDetailsRepository.js backend/repositories/forms/csisaRepository.js backend/repositories/forms/nariBioFortifiedCropRepository.js backend/repositories/forms/naturalFarmingRepository.js backend/repositories/forms/nicraDetailsRepository.js backend/repositories/forms/seedHubRepository.js backend/repositories/forms/instructionalFarmCropRepository.js backend/tests/allMastersIsOtherContract.test.js
git commit -m "fix: support other seasons in kvk forms"
```

---

### Task 6: Performance Impact string-backed selectors

**Files:**
- Modify: `frontend/src/pages/dashboard/shared/forms/performance-indicators/ImpactForms.tsx`
- Modify: `backend/repositories/forms/kvkImpactActivityRepository.js`
- Modify: `backend/repositories/forms/entrepreneurshipRepository.js`
- Test: `backend/tests/allMastersIsOtherContract.test.js`

**Interfaces:**
- Consumes: string-valued Specific Area and Enterprise Type options carrying `isOther`.
- Produces: `specificAreaOther` and `enterpriseTypeOther` without replacing existing selected-label fields.

- [ ] **Step 1: Add failing UI/repository contracts**

Assert flagged option construction, conditional inputs, stale clearing, and repository create/update/read handling for both custom properties.

- [ ] **Step 2: Run and verify RED**

Run: `cd backend && node --test tests/allMastersIsOtherContract.test.js`

Expected: failures identify both Performance Impact selectors.

- [ ] **Step 3: Implement both selector flows**

Use `useOtherSpecify` with string option values. Keep `specificArea` and `enterpriseType` as the selected master labels, while storing custom text in `specificAreaOther` and `enterpriseTypeOther` respectively.

```tsx
const specificAreaOptions = createMasterDataOptions(
    specificAreas,
    'specificAreaName',
    'specificAreaName',
    { flagKey: 'isOther' },
)
```

Render required `SpecifyOtherInput` controls and clear their values through `otherResetPatch` on normal selections.

- [ ] **Step 4: Persist and map custom values**

Trim both custom values to `null`; preserve omitted values on update; return them on edit; prefer custom text in list/report display mappings while retaining the original selector value.

- [ ] **Step 5: Run focused contracts and commit**

Run: `cd backend && node --test tests/allMastersIsOtherContract.test.js`

Expected: Performance Impact contracts pass.

```bash
git add frontend/src/pages/dashboard/shared/forms/performance-indicators/ImpactForms.tsx backend/repositories/forms/kvkImpactActivityRepository.js backend/repositories/forms/entrepreneurshipRepository.js backend/tests/allMastersIsOtherContract.test.js
git commit -m "fix: support other impact values"
```

---

### Task 7: Remove Other controls from structural masters

**Files:**
- Modify: `frontend/src/pages/dashboard/shared/forms/BasicMasterForms.tsx`
- Modify: `backend/tests/allMastersIsOtherContract.test.js`

**Interfaces:**
- Consumes: five structural master edit branches.
- Produces: no Other checkbox for Zone, State, District, Organization, or University; no schema deletion.

- [ ] **Step 1: Remove only the five structural checkboxes**

Delete the `IsOtherCheckbox` element from the Zone, State, District, Organization, and University branches. Retain the import if any non-structural branch in the file still uses it; otherwise remove the unused import.

- [ ] **Step 2: Run contracts and verify GREEN**

Run: `cd backend && node --test tests/allMastersIsOtherContract.test.js tests/otherMastersRepository.test.js tests/oftFldService.test.js`

Expected: all tests pass with zero failures.

- [ ] **Step 3: Commit the exclusion**

```bash
git add frontend/src/pages/dashboard/shared/forms/BasicMasterForms.tsx backend/tests/allMastersIsOtherContract.test.js
git commit -m "fix: exclude structural masters from other options"
```

---

### Task 8: Full verification and delivery readiness

**Files:**
- Verify: all modified files.

**Interfaces:**
- Consumes: completed implementation.
- Produces: evidence that schema, backend, frontend, and migration are valid.

- [ ] **Step 1: Run all backend tests**

Run: `cd backend && node --test tests/*.test.js`

Expected: zero failures.

- [ ] **Step 2: Validate and generate Prisma**

Run: `cd backend && npx prisma validate && npx prisma generate`

Expected: both commands exit 0.

- [ ] **Step 3: Build the frontend**

Run: `cd frontend && npm run build`

Expected: TypeScript and Vite exit 0.

- [ ] **Step 4: Check migration safety and diff integrity**

Run:

```bash
rg -n 'DROP|DELETE|TRUNCATE|RENAME|ALTER COLUMN' backend/prisma/migrations/20260713150000_complete_downstream_specify_other/migration.sql
git diff --check
git status --short --branch
```

Expected: the destructive-SQL search returns no matches, `git diff --check` is clean, and only intended commits differ from `origin/v2-prod`.

- [ ] **Step 5: Inspect the final commit range**

Run: `git log --oneline origin/v2-prod..HEAD && git diff --stat origin/v2-prod...HEAD`

Expected: design, plan, tests, schema, implementation, and exclusion commits are present with no unrelated files.
