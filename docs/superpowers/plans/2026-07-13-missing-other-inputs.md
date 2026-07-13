# Missing Other Inputs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add complete `Other -> specify` support to Infrastructure funding, Soil & Water sample method, and District Level account type fields.

**Architecture:** Add one nullable custom-value column beside each existing selection field, then thread those fields through the existing form, API, repository, and report paths. Reuse the established `isOther`/legacy-label detection pattern while keeping the original selections unchanged for compatibility and report classification.

**Tech Stack:** React 19, TypeScript, TanStack Query, Node.js, Prisma/PostgreSQL, Node test runner

## Global Constraints

- The migration is additive only: three nullable text columns and no destructive SQL.
- Existing selection fields remain authoritative for option identity, aggregation, and classification.
- Custom values are trimmed, stored as `null` when empty, and cleared when selection changes away from Other.
- Existing Other records with null custom values remain readable; a submitted create/update with Other requires custom text.
- Do not correct existing master `isOther` data or add master rows in this change.
- Work directly on the user-approved `v2-prod` branch and do not force-push.

---

### Task 1: Add schema and migration contracts

**Files:**
- Create: `backend/tests/missingOtherInputs.test.js`
- Modify: `backend/prisma/kvk/about-kvk/infra_schema.prisma`
- Modify: `backend/prisma/kvk/soil_water_testing/analysis_details_schema.prisma`
- Modify: `backend/prisma/kvk/performance-indicators/district-village/district_level_schema.prisma`
- Create: `backend/prisma/migrations/20260713193000_add_missing_other_inputs/migration.sql`

**Interfaces:**
- Produces: `sourceOfFundingOther?: string | null`, `samplesAnalysedThroughOther?: string | null`, and `accountTypeOther?: string | null` on their Prisma models.
- Consumes: Existing selection fields `sourceOfFunding`, `samplesAnalysedThrough`, and `items`.

- [ ] **Step 1: Write the failing schema contract test**

Add a Node test that reads each Prisma model and asserts these exact declarations:

```js
assert.match(infrastructure, /^\s*sourceOfFundingOther\s+String\?\s+@map\("source_of_funding_other"\)/m);
assert.match(soilWater, /^\s*samplesAnalysedThroughOther\s+String\?\s+@map\("samples_analysed_through_other"\)/m);
assert.match(district, /^\s*accountTypeOther\s+String\?\s+@map\("account_type_other"\)/m);
```

- [ ] **Step 2: Run the contract test and verify RED**

Run: `cd backend && node --test tests/missingOtherInputs.test.js`

Expected: three assertion failures because the fields do not exist.

- [ ] **Step 3: Add the three Prisma fields and migration**

Add the mapped nullable fields beside their controlling selection fields. Use only:

```sql
ALTER TABLE "kvk_infrastructure" ADD COLUMN "source_of_funding_other" TEXT;
ALTER TABLE "kvk_soil_water_analysis" ADD COLUMN "samples_analysed_through_other" TEXT;
ALTER TABLE "district_level_data" ADD COLUMN "account_type_other" TEXT;
```

- [ ] **Step 4: Validate schema and test GREEN**

Run:

```bash
cd backend
npx prisma validate
node --test tests/missingOtherInputs.test.js
```

Expected: Prisma schema valid; schema contract test passes.

- [ ] **Step 5: Commit schema slice**

```bash
git add backend/prisma backend/tests/missingOtherInputs.test.js
git commit -m "feat: add missing other-value storage"
```

---

### Task 2: Complete Infrastructure Source of Funding behavior

**Files:**
- Modify: `backend/tests/missingOtherInputs.test.js`
- Modify: `frontend/src/pages/dashboard/shared/forms/AboutKvkForms.tsx`
- Modify: `frontend/src/services/aboutKvkApi.ts`
- Modify: `backend/repositories/forms/aboutKvkRepository.js`
- Modify: `frontend/src/utils/fieldValueExtractorUtils.ts`
- Modify: `backend/repositories/reports/aboutkvkReport/assetsReportRepository.js`

**Interfaces:**
- Consumes: Funding Source records `{ fundingSourceId, name, isOther }` from `useFundingSources()`.
- Produces: Form/API property `sourceOfFundingOther`; display value `sourceOfFundingOther || sourceOfFunding`.

- [ ] **Step 1: Add failing Infrastructure contracts**

Assert that:

```js
assert.match(aboutKvkForm, /sourceOfFundingOther/);
assert.match(aboutKvkApi, /'sourceOfFundingOther'/);
assert.match(aboutKvkRepository, /'sourceOfFundingOther'/);
assert.match(fieldExtractor, /sourceOfFundingOther\s*\|\|\s*item\.sourceOfFunding/);
```

Add a repository test that mocks `prisma.kvkInfrastructure.update`, submits `{ sourceOfFunding: 'Others', sourceOfFundingOther: 'CSR Fund' }`, and asserts `sourceOfFundingOther: 'CSR Fund'` reaches Prisma.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `cd backend && node --test tests/missingOtherInputs.test.js`

Expected: missing form/API/repository property assertions fail.

- [ ] **Step 3: Implement frontend detection and input**

Build options with `isOther`, then resolve the current selection by name:

```ts
const selectedFundingSource = fundingSources.find(
  (source) => String(source.name) === String(formData.sourceOfFunding),
)
const normalizedFundingName = String(selectedFundingSource?.name || formData.sourceOfFunding || '').trim().toLowerCase()
const isOtherInfrastructureFunding = Boolean(selectedFundingSource?.isOther)
  || normalizedFundingName === 'other'
  || normalizedFundingName === 'others'
  || normalizedFundingName.includes('please specify')
```

On change, set `sourceOfFunding` and preserve/clear `sourceOfFundingOther`. Render required `SpecifyOtherInput` with label `Please specify source of funding` only when `isOtherInfrastructureFunding` is true.

- [ ] **Step 4: Thread field through API and repository**

Add `sourceOfFundingOther` to `INFRASTRUCTURE_ALLOWED_KEYS`, `KVK_INFRA_ALLOWED_FIELDS`, create/update sanitization, and returned Prisma data. Normalize with:

```js
const normalizeOptionalText = (value) => {
  const text = value == null ? '' : String(value).trim();
  return text || null;
};
```

Resolve the Funding Source row case-insensitively by `name`; if it is `isOther` (or matches the legacy label fallback), reject empty custom text with a 400 validation error. Otherwise persist `null` for the custom field.

- [ ] **Step 5: Update list/report display**

Keep `sourceOfFunding` unchanged in storage. Wherever Infrastructure Source of Funding is displayed, prefer:

```js
row.sourceOfFundingOther || row.sourceOfFunding
```

- [ ] **Step 6: Run focused tests and commit**

Run: `cd backend && node --test tests/missingOtherInputs.test.js`

Expected: Infrastructure contracts and repository behavior pass.

```bash
git add backend/tests/missingOtherInputs.test.js frontend/src/pages/dashboard/shared/forms/AboutKvkForms.tsx frontend/src/services/aboutKvkApi.ts backend/repositories/forms/aboutKvkRepository.js frontend/src/utils/fieldValueExtractorUtils.ts backend/repositories/reports/aboutkvkReport/assetsReportRepository.js
git commit -m "fix: support other infrastructure funding"
```

---

### Task 3: Complete Soil & Water Samples Analysed Through behavior

**Files:**
- Modify: `backend/tests/missingOtherInputs.test.js`
- Modify: `frontend/src/pages/dashboard/shared/forms/SoilWaterTestingForms.tsx`
- Modify: `backend/repositories/forms/soilWaterRepository.js`
- Modify: `backend/repositories/reports/soilWaterAnalysisReport/soilWaterAnalysisReportRepository.js`

**Interfaces:**
- Consumes: Hard-coded selection values `Mini soil testing kit`, `Soil testing laboratory`, and `Other`.
- Produces: `samplesAnalysedThroughOther`; detail display `samplesAnalysedThroughOther || samplesAnalysedThrough`.

- [ ] **Step 1: Add failing Soil & Water contracts**

Assert the form and repository contain `samplesAnalysedThroughOther`. Mock `$queryRawUnsafe` for create/update and assert the SQL includes `samples_analysed_through_other` and receives a trimmed value.

Export `detailRowFromRecord` from the report repository and add a pure report assertion: an input with `samplesAnalysedThrough: 'Other'` and `samplesAnalysedThroughOther: 'Mobile testing van'` produces `through: 'Mobile testing van'`.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `cd backend && node --test tests/missingOtherInputs.test.js`

Expected: custom sample-method persistence/display assertions fail.

- [ ] **Step 3: Implement the conditional form input**

Use the normalized selection:

```ts
const isOtherSamplesThrough = String(formData.samplesAnalysedThrough || '').trim().toLowerCase() === 'other'
```

On dropdown change, clear `samplesAnalysedThroughOther` unless `Other` is selected. Render a required `SpecifyOtherInput` labelled `Please specify how samples were analysed` when true.

- [ ] **Step 4: Implement raw-SQL persistence and mapping**

- Add `samples_analysed_through_other` to the analysis INSERT column/value lists.
- Add `samplesAnalysedThroughOther` to `_mapAnalysisResponse`.
- Add the field to `updateAnalysis` with trimmed/null normalization.
- Reject create/update when the effective selection is `Other` and the effective custom value is empty.
- Clear the custom column when the effective selection changes away from `Other`.

- [ ] **Step 5: Preserve aggregation and improve detail display**

Keep `bucketSamplesThrough(r.samplesAnalysedThrough)` unchanged. Change detail/report display only:

```js
through: String(r.samplesAnalysedThroughOther || r.samplesAnalysedThrough || '').trim() || '—'
```

- [ ] **Step 6: Run focused tests and commit**

Run: `cd backend && node --test tests/missingOtherInputs.test.js`

Expected: Soil & Water tests pass and the Other bucket behavior remains unchanged.

```bash
git add backend/tests/missingOtherInputs.test.js frontend/src/pages/dashboard/shared/forms/SoilWaterTestingForms.tsx backend/repositories/forms/soilWaterRepository.js backend/repositories/reports/soilWaterAnalysisReport/soilWaterAnalysisReportRepository.js
git commit -m "fix: support other soil analysis method"
```

---

### Task 4: Complete District Level Account Type behavior

**Files:**
- Modify: `backend/tests/missingOtherInputs.test.js`
- Modify: `frontend/src/pages/dashboard/shared/forms/performance-indicators/DistrictAndVillageForms.tsx`
- Modify: `backend/repositories/forms/districtLevelDataRepository.js`
- Modify: `backend/repositories/reports/districtLevelDataReportRepository.js`
- Modify: `backend/services/reports/formsTemplate/districtVillageTemplates/districtLevelDataTemplate.js`
- Modify: `frontend/src/utils/fieldValueExtractorUtils.ts`

**Interfaces:**
- Consumes: Account Type records `{ accountTypeId, accountType, isOther }` and existing string property `items`.
- Produces: `accountTypeOther`; display value `accountTypeOther || items` while classification continues to consume `items`.

- [ ] **Step 1: Add failing District Level contracts**

Assert form/repository/report sources contain `accountTypeOther`. Mock `prisma.districtLevelData.create/update` and verify trimmed custom text is persisted for an Other master and null is persisted for a normal master.

Add a report test proving classification functions receive `items`, while rendered base-row text prefers `accountTypeOther`.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `cd backend && node --test tests/missingOtherInputs.test.js`

Expected: District custom field and display assertions fail.

- [ ] **Step 3: Implement frontend detection and input**

Preserve `isOther` in `accountTypeOptions`. Resolve the selected master by matching `accountTypeValue`, use the master flag plus normalized `Other/Others` fallback, and render required `SpecifyOtherInput` labelled `Please specify account type`. Clear `accountTypeOther` when a normal type is selected.

- [ ] **Step 4: Implement repository validation and persistence**

Create a helper with this contract:

```js
async function normalizeAccountTypeOther(items, accountTypeOther) {
  // Resolve AccountTypeMaster case-insensitively by accountType.
  // Return trimmed custom text for Other, null for normal selections.
  // Throw a statusCode=400 validation error for Other without custom text.
}
```

Use it in create and update. For partial updates, derive the effective `items` and `accountTypeOther` from `{ ...existing, ...data }`, so unrelated edits preserve valid custom text.

- [ ] **Step 5: Update list/report display without changing classification**

Return both fields from report repository. Use `row.accountTypeOther || row.items` only in display cells/export rows. Keep `isBaseDistrictItem`, `isCropsItem`, `isClimateItem`, and `isLivestockItem` calls bound to `row.items`.

- [ ] **Step 6: Run focused tests and commit**

Run: `cd backend && node --test tests/missingOtherInputs.test.js`

Expected: District Level behavior passes and existing report classification tests remain green.

```bash
git add backend/tests/missingOtherInputs.test.js frontend/src/pages/dashboard/shared/forms/performance-indicators/DistrictAndVillageForms.tsx backend/repositories/forms/districtLevelDataRepository.js backend/repositories/reports/districtLevelDataReportRepository.js backend/services/reports/formsTemplate/districtVillageTemplates/districtLevelDataTemplate.js frontend/src/utils/fieldValueExtractorUtils.ts
git commit -m "fix: support other district account type"
```

---

### Task 5: Full verification and delivery

**Files:**
- Modify only if verification finds a directly related omission.

**Interfaces:**
- Consumes: The three completed vertical slices.
- Produces: A deployable, migration-ready `v2-prod` commit series.

- [ ] **Step 1: Run focused regression tests**

Run: `cd backend && node --test tests/missingOtherInputs.test.js`

Expected: all missing-Other regression tests pass.

- [ ] **Step 2: Run full backend verification**

```bash
cd backend
node --test tests/*.test.js
npx prisma validate
```

Expected: zero test failures and valid Prisma schema.

- [ ] **Step 3: Run frontend production build**

Run: `cd frontend && npm run build`

Expected: Vite production build exits 0. Existing chunk-size warnings are non-blocking.

- [ ] **Step 4: Run source and diff checks**

```bash
cd /Users/suraj/Desktop/atari
node --check backend/repositories/forms/aboutKvkRepository.js
node --check backend/repositories/forms/soilWaterRepository.js
node --check backend/repositories/forms/districtLevelDataRepository.js
git diff --check
git status --short --branch
```

Expected: syntax checks and diff check pass; only intended files are modified.

- [ ] **Step 5: Confirm the task commits leave a clean worktree**

Run: `git status --short`

Expected: no output. If there is output, inspect it and create a separate, explicitly scoped commit before delivery.

- [ ] **Step 6: Synchronize and push without force**

```bash
git fetch origin v2-prod
git rev-list --left-right --count HEAD...origin/v2-prod
# If remote advanced and the tree is clean:
git rebase origin/v2-prod
# Re-run Steps 1-4 after any rebase.
git push origin v2-prod
```

Expected: local and `origin/v2-prod` resolve to the same final commit.
