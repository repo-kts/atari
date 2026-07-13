# Missing Other Inputs Design

## Goal

Complete the `Other -> specify` workflow for three KVK data-entry fields that currently expose, or can expose, an Other option without preserving the user's custom value:

1. Infrastructure Details: Source of Funding
2. Soil & Water Analysis: Samples Analysed Through
3. District Level Data: Account Type

The behavior must work consistently for create, edit, list/detail responses, and reports without changing or deleting existing data.

## Selected approach

Use a dedicated nullable text field for each custom value, matching the established Discipline and Vehicle/Equipment funding pattern:

- `KvkInfrastructure.sourceOfFundingOther` mapped to `source_of_funding_other`
- `KkvSoilWaterAnalysis.samplesAnalysedThroughOther` mapped to `samples_analysed_through_other`
- `DistrictLevelData.accountTypeOther` mapped to `account_type_other`

The original selection remains stored in its existing field. The new field stores only the value typed after selecting Other. This preserves edit-state detection, reporting semantics, and compatibility with existing records.

## Data behavior

### Infrastructure Details

- Continue storing the selected Funding Source master name in `sourceOfFunding` because the existing model uses a string rather than a foreign key.
- Determine whether the selected option is Other from the matched Funding Source master's `isOther` flag.
- Retain a normalized legacy fallback for labels such as `Other`, `Others`, or `Please Specify`.
- Show a required `Please specify source of funding` input only when the selected source is Other.
- Store that text in `sourceOfFundingOther`.
- Clear `sourceOfFundingOther` when the user switches to a normal funding source.

### Soil & Water Analysis

- Keep the hard-coded `Other` option in `samplesAnalysedThrough`.
- Show a required `Please specify how samples were analysed` input only when the selected value is `Other`.
- Store that text in `samplesAnalysedThroughOther`.
- Clear the custom value when the user switches to Mini Soil Testing Kit or Soil Testing Laboratory.

### District Level Data

- Continue storing the selected Account Type master name in `items` for backward compatibility with existing conditional sections and reports.
- Match the selected string to its Account Type master record and inspect `isOther`.
- Retain a normalized legacy fallback for `Other` and `Others` labels.
- Show a required `Please specify account type` input only when the selected Account Type is Other.
- Store that text in `accountTypeOther`.
- Clear the custom value when the user switches to a normal Account Type.

## Frontend changes

- Preserve `isOther` metadata when building the affected master-backed option lists.
- Use the existing `useOtherSpecify` and `SpecifyOtherInput` pattern where practical.
- Add the new fields to form state, create/update payloads, edit hydration, and frontend allow-lists/types.
- Conditional inputs must be visible immediately after selection and remain visible when editing a saved Other record.
- Custom input values must be cleared when their controlling dropdown changes away from Other so stale values are never submitted.

## Backend changes

- Add the three nullable Prisma fields and one additive migration.
- Add each field to the appropriate repository create/update allow-list and response mapping.
- Trim submitted custom values and store empty strings as `null`.
- Validate that a non-empty custom value is supplied when the controlling option resolves to Other.
- Ignore or clear a supplied custom value when the controlling option is not Other.
- Infrastructure and District validation must resolve the selected string against the corresponding master record so custom labels marked `isOther` are supported, not only literal `Other` names.
- Soil & Water validation can use the normalized hard-coded `Other` value.

## Read and report behavior

- API detail/list responses must return all three custom fields so edit forms hydrate correctly.
- User-facing tables, exports, and reports should display the custom value when present; otherwise display the original selected value.
- District Level report classification must continue using the original `items` value. The custom text affects display only and must not accidentally place an Other row into a crop, climate, or livestock-specific section.
- Soil & Water aggregate bucketing should continue grouping an Other record under the existing Other bucket, while detail output displays the custom text.

## Migration and compatibility

- The migration adds nullable columns only. It performs no deletes, renames, constraints, or destructive rewrites.
- Existing rows remain valid.
- Existing rows whose selected value is already `Other` will have a null custom field because the intended historical text cannot be inferred.
- No seed or master-data update is required for this feature.

## Validation and errors

- The UI marks each conditional custom field required.
- Backend validation remains authoritative and returns a 400 validation response if Other is selected without custom text.
- Normal selections must not be rejected because of an empty custom field.
- Existing records with Other and a null custom field remain readable and editable; they are required to supply the custom value only on the next submitted update.

## Tests

Add regression coverage for each field:

- Other selection shows the custom input.
- Normal selection hides it and clears stale custom text.
- Create passes and persists the custom value.
- Edit hydrates and preserves the custom value.
- Update clears the custom field after switching away from Other.
- Backend rejects a new or updated Other selection without custom text.
- Detail/list responses include the field.
- Reports prefer the custom display value while preserving existing aggregation/classification behavior.
- The migration and Prisma schema validate successfully, the backend test suite passes, and the frontend production build succeeds.

## Out of scope

- Converting Infrastructure `sourceOfFunding` or District `items` from strings to foreign keys.
- Correcting existing master records whose `isOther` flags are inconsistent.
- Adding new Other options to master tables.
- Refactoring unrelated forms or report infrastructure.
