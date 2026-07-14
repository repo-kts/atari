# Report Funding, Units, and FLD Verification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct missing vehicle/equipment funding values, remove the false `Kg` fallback, and prove FLD economics render when result data exists.

**Architecture:** Keep report templates consuming normalized rows. Correct the asset and production-supply repositories at their mapping/formatting boundaries, while preserving the existing FLD implementation and covering it with a regression test.

**Tech Stack:** Node.js, Prisma, `node:test`, HTML report templates.

## Global Constraints

- No database schema or data migration.
- Preserve the selected reporting-year scope for yearly equipment details.
- Prefer custom Other text over master labels.
- Do not invent a unit when the product master has no unit.

---

### Task 1: Asset funding report mappings

**Files:**
- Modify: `backend/repositories/reports/aboutkvkReport/assetsReportRepository.js`
- Test: `backend/tests/reportDataCorrections.test.js`

**Interfaces:**
- Consumes: Prisma vehicle/equipment detail rows and report filters.
- Produces: normalized `sourceOfFunding`, `fundingAgencyName`, and `presentStatus` report fields.

- [ ] **Step 1: Write failing tests** for vehicle agency/Other mapping and equipment latest-detail funding fallback.
- [ ] **Step 2: Run the focused tests** and confirm the missing fields fail.
- [ ] **Step 3: Implement minimal repository mapping changes**, filtering nested equipment details by the selected reporting period.
- [ ] **Step 4: Run the focused tests** and confirm they pass.
- [ ] **Step 5: Commit** the asset report correction.

### Task 2: Production quantity unit formatting

**Files:**
- Modify: `backend/repositories/reports/productionSupplyPageReport/productionSupplyPageReportRepository.js`
- Test: `backend/tests/reportDataCorrections.test.js`

**Interfaces:**
- Consumes: numeric quantity and optional product-master unit.
- Produces: row and total quantity labels without fabricated units.

- [ ] **Step 1: Write failing tests** for blank, single, and mixed units.
- [ ] **Step 2: Run the focused tests** and confirm `Kg`/blank-total behavior fails.
- [ ] **Step 3: Remove the `Kg` fallback** and centralize totals through the corrected unit-label helper.
- [ ] **Step 4: Run the focused tests** and confirm they pass.
- [ ] **Step 5: Commit** the quantity-label correction.

### Task 3: FLD economics regression and verification

**Files:**
- Test: `backend/tests/reportDataCorrections.test.js`

**Interfaces:**
- Consumes: normalized FLD rows containing `fldResult`.
- Produces: category/crop/state payload with yield and economics values intact.

- [ ] **Step 1: Add a regression test** using the Oilseeds values observed in the database.
- [ ] **Step 2: Run the focused test** and confirm current FLD behavior passes; do not change production code unless it fails.
- [ ] **Step 3: Run Prisma validation, all backend tests, frontend type-check, and frontend build.**
- [ ] **Step 4: Review the final diff and commit** the regression coverage.
