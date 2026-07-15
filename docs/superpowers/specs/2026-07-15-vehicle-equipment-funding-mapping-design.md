# Vehicle and Equipment Funding Mapping Design

## Goal

Align the website tables and comprehensive report sections with the approved meaning of the base vehicle/equipment records and their yearly status/detail records. This corrects naming confusion without changing database storage.

## Approved Mapping

| Website section | Data model | Comprehensive report section | Funding fields |
| --- | --- | --- | --- |
| View Vehicles | `KvkVehicle` | 1.4.A Vehicles Details | Do not show Funding Source or Funding Agency |
| Vehicle Details | `KvkVehicleDetail` | 1.4.B Vehicle Status | Show Funding Source and Funding Agency |
| View Equipments | `KvkEquipment` | 1.5.A Equipment Details | Do not show Funding Source or Funding Agency |
| Equipment Details | `KvkEquipmentDetail` | 1.5.B Equipment Status | Show Funding Source and Funding Agency |

The website and report labels remain unchanged in this fix. Their correspondence is documented through the table above.

## Implementation Design

### Website field configuration

Remove `SOURCE_OF_FUND` from the `VIEW_EQUIPMENTS` field group. This removes the column from the View Equipments table and from table-driven filtering/search behavior. The Equipment Details yearly table retains its funding source and agency fields.

### Comprehensive report configuration

- Section 1.4.B keeps Funding Source and adds `fundingAgencyName` as Funding Agency.
- Section 1.5.A removes Source of Funding.
- Section 1.5.B keeps Source of fund and adds `fundingAgencyName` as Funding Agency.

The report-data transformation is field-config driven, so both status sections must list Funding Agency or the fetched value will be discarded before rendering.

### Report templates

Remove the Source of Funding header and cell from the dedicated 1.5.A Equipment Details template. The 1.4.B Vehicle Status and 1.5.B Equipment Status templates already contain Funding Source and Funding Agency columns, so no layout redesign is required there.

### Repository behavior

Keep the yearly status repositories mapping `sourceOfFunding` and `fundingAgencyName`. They read the values from `KvkVehicleDetail` and `KvkEquipmentDetail`, where the forms store them.

The base Equipment report repository no longer needs funding for 1.5.A presentation. Existing database columns and stored values remain untouched for backward compatibility; this change only controls presentation.

## Testing

Regression tests will verify:

1. View Equipments no longer declares the Source of Fund website field.
2. Section 1.5.A configuration and HTML omit Source of Funding.
3. Section 1.4.B transformation and HTML preserve Funding Agency.
4. Section 1.5.B transformation and HTML preserve Funding Agency.
5. Existing repository mappings for status funding continue to pass.

Frontend type-check/build and focused backend report tests will be run after implementation. No Prisma schema or migration change is required.

## Non-goals

- Renaming website tabs or report headings.
- Moving or deleting stored funding data.
- Changing vehicle/equipment form inputs.
- Altering unrelated report sections.
