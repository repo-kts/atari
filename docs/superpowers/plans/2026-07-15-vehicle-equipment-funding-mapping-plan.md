# Vehicle and Equipment Funding Mapping Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the View Vehicles/View Equipments website tables and report sections 1.4.A–1.5.B display funding fields according to the approved base-record versus yearly-status mapping.

**Architecture:** Keep the existing `KvkVehicle`, `KvkVehicleDetail`, `KvkEquipment`, and `KvkEquipmentDetail` storage unchanged. Control website columns through frontend field groups, control comprehensive-report transformation through `reportConfig`, and keep custom report templates aligned with those transformed fields.

**Tech Stack:** React/TypeScript frontend configuration, Node.js/CommonJS backend, Node test runner, custom HTML report templates.

## Global Constraints

- View Vehicles and report 1.4.A must not show Funding Source or Funding Agency.
- Vehicle Details and report 1.4.B must show Funding Source and Funding Agency.
- View Equipments and report 1.5.A must not show Funding Source or Funding Agency.
- Equipment Details and report 1.5.B must show Funding Source and Funding Agency.
- Do not rename website tabs or report headings.
- Do not change schemas, migrations, stored data, or form inputs.

---

### Task 1: Add mapping regression tests

**Files:**
- Create: `backend/tests/vehicleEquipmentFundingMapping.test.js`
- Read: `frontend/src/constants/fieldNames.ts`
- Read: `backend/config/reportConfig.js`
- Read: `backend/services/reports/reportDataService.js`
- Read: `backend/services/reports/formsTemplate/aboutkvkTemplates/vehicleDetailsTemplate.js`
- Read: `backend/services/reports/formsTemplate/aboutkvkTemplates/equipmentDetailsTemplate.js`
- Read: `backend/services/reports/formsTemplate/aboutkvkTemplates/equipmentRecordsTemplate.js`

**Interfaces:**
- Consumes: `getSectionConfig(sectionId)`, `reportDataService._transformSectionData(rawData, sectionConfig)`, and the three custom template render functions.
- Produces: regression coverage defining the approved website and report behavior.

- [ ] **Step 1: Write failing website-field and 1.5.A report tests**

Create tests that read the `VIEW_EQUIPMENTS` block and assert it does not contain `FIELD_NAMES.SOURCE_OF_FUND`; inspect section `1.8` and assert it has no `sourceOfFunding` field; render `renderEquipmentDetailsSection` with a record containing `sourceOfFunding: 'ICAR'` and assert neither the funding header nor `ICAR` appears.

```js
test('View Equipments and report 1.5.A omit funding', () => {
    const viewEquipmentBlock = extractFieldGroup(frontendFields, 'VIEW_EQUIPMENTS');
    assert.doesNotMatch(viewEquipmentBlock, /SOURCE_OF_FUND/);

    const section = getSectionConfig('1.8');
    assert.equal(section.fields.some((field) => field.dbField === 'sourceOfFunding'), false);

    const html = renderEquipmentDetailsSection.call(templateService, section, [{
        kvk: { kvkName: 'KVK Test' },
        equipmentName: 'Computer',
        yearOfPurchase: 2025,
        totalCost: 50000,
        sourceOfFunding: 'ICAR',
    }], 'section-1-8', false, {});
    assert.doesNotMatch(html, /Source of Funding/);
    assert.doesNotMatch(html, />ICAR</);
});
```

- [ ] **Step 2: Write failing 1.4.B and 1.5.B agency-flow tests**

Transform raw status rows through the real report-data transformer, render the real templates, and assert Funding Source and Funding Agency values survive both boundaries.

```js
test('report 1.4.B preserves vehicle funding source and agency', () => {
    const section = getSectionConfig('1.7');
    const transformed = reportDataService._transformSectionData([vehicleStatusRow], section);
    const html = renderVehicleDetailsSection.call(templateService, section, transformed, 'section-1-7', false, {});
    assert.match(html, />ICAR</);
    assert.match(html, />ATARI</);
});

test('report 1.5.B preserves equipment funding source and agency', () => {
    const section = getSectionConfig('1.9');
    const transformed = reportDataService._transformSectionData([equipmentStatusRow], section);
    const html = renderEquipmentRecordsSection.call(templateService, section, transformed, 'section-1-9', false, {});
    assert.match(html, />ICAR</);
    assert.match(html, />ATARI</);
});
```

- [ ] **Step 3: Run the new tests and verify RED**

Run:

```bash
cd backend
node --test --test-force-exit tests/vehicleEquipmentFundingMapping.test.js
```

Expected: failures showing View Equipments/1.5.A still contain funding and 1.4.B/1.5.B transformations omit Funding Agency.

---

### Task 2: Align website and report presentation

**Files:**
- Modify: `frontend/src/constants/fieldNames.ts:816-832`
- Modify: `backend/config/reportConfig.js:163-218`
- Modify: `backend/services/reports/formsTemplate/aboutkvkTemplates/equipmentDetailsTemplate.js:1-80`
- Test: `backend/tests/vehicleEquipmentFundingMapping.test.js`

**Interfaces:**
- Consumes: the existing field-driven website table renderer and field-driven comprehensive-report transformer.
- Produces: corrected field sets for View Equipments, report 1.4.B, report 1.5.A, and report 1.5.B.

- [ ] **Step 1: Remove funding from View Equipments**

Delete only `FIELD_NAMES.SOURCE_OF_FUND` from `FIELD_GROUPS.VIEW_EQUIPMENTS`. Keep `SOURCE_OF_FUND` and `FUNDING_AGENCY_SPECIFY` in `EQUIPMENT_DETAILS`.

- [ ] **Step 2: Align report configuration**

Apply these exact changes:

```js
// Section 1.4.B, after Funding Source
{ dbField: 'fundingAgencyName', displayName: 'Funding Agency', optional: true },

// Section 1.5.A
// Remove: { dbField: 'sourceOfFunding', displayName: 'Source of Funding' }

// Section 1.5.B, after Source of fund
{ dbField: 'fundingAgencyName', displayName: 'Funding Agency', optional: true },
```

- [ ] **Step 3: Remove funding from the 1.5.A custom template**

Remove the `funding` value lookup, its body `<td>`, and the `Source of Funding` `<th>` from `renderEquipmentDetailsSection`. Leave the 1.5.B Equipment Status template unchanged because it already renders both intended columns.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```bash
cd backend
node --test --test-force-exit tests/vehicleEquipmentFundingMapping.test.js
```

Expected: all mapping tests pass.

- [ ] **Step 5: Run existing report regression tests**

Run:

```bash
cd backend
node --test --test-force-exit tests/reportDataCorrections.test.js tests/vehicleEquipmentFundingMapping.test.js
```

Expected: all focused report tests pass with zero failures.

---

### Task 3: Verify builds and final diff

**Files:**
- Verify: `frontend/src/constants/fieldNames.ts`
- Verify: `backend/config/reportConfig.js`
- Verify: `backend/services/reports/formsTemplate/aboutkvkTemplates/equipmentDetailsTemplate.js`
- Verify: `backend/tests/vehicleEquipmentFundingMapping.test.js`

**Interfaces:**
- Consumes: frontend compiler/build scripts and backend test/build scripts.
- Produces: evidence that the implementation compiles and the approved mapping is preserved.

- [ ] **Step 1: Run frontend type and build verification**

```bash
cd frontend
npm run type-check
npm run build
```

Expected: both commands exit successfully; existing non-fatal bundle warnings are acceptable.

- [ ] **Step 2: Run backend validation and build verification**

```bash
cd backend
npx prisma validate
npm run build
```

Expected: Prisma schema validates and backend build exits successfully.

- [ ] **Step 3: Review scope and formatting**

```bash
git diff --check
git status --short
git diff --stat
```

Expected: no whitespace errors and only the approved configuration, template, test, spec, and plan files are changed.

- [ ] **Step 4: Commit the implementation**

```bash
git add frontend/src/constants/fieldNames.ts \
  backend/config/reportConfig.js \
  backend/services/reports/formsTemplate/aboutkvkTemplates/equipmentDetailsTemplate.js \
  backend/tests/vehicleEquipmentFundingMapping.test.js \
  docs/superpowers/plans/2026-07-15-vehicle-equipment-funding-mapping-plan.md
git commit -m "fix(reports): align asset funding sections"
```

- [ ] **Step 5: Synchronize the approved branch**

```bash
git fetch origin v2-prod
git push origin v2-prod
git rev-list --left-right --count HEAD...origin/v2-prod
```

Expected: push succeeds and divergence is `0 0`.
