# Parent-Scoped Master Uniqueness Design

## Goal

Prevent false `409 already exists` errors when editing dependent All Masters records whose names are valid in more than one parent scope.

## Scope

Apply composite duplicate checks to these eight masters:

| Master | Name field | Scope fields |
|---|---|---|
| CFLD Crop | `cropName` | `seasonId`, `typeId` |
| FLD Thematic Area | `thematicAreaName` | `sectorId` |
| FLD Category | `categoryName` | `sectorId` |
| FLD Subcategory | `subCategoryName` | `categoryId`, `sectorId` |
| Training Area | `trainingAreaName` | `trainingTypeId` |
| Training Thematic Area | `trainingThematicAreaName` | `trainingAreaId` |
| Equipment Master | `name` | `equipmentTypeId` |
| NICRA Subcategory | `subCategoryName` | `nicraCategoryId` |

OFT Thematic Area and FLD Crop already use this pattern and remain unchanged. Financial Project remains globally unique because its Prisma model explicitly makes `projectName` unique. Production and CRA masters do not currently run the blocking service-level name check and are outside this fix.

## Design

Each affected entity configuration declares its scope fields. Duplicate queries combine:

- the normalized name;
- every configured parent field; and
- an ID exclusion during updates.

For updates, the service first reads the existing record and merges it with the incoming payload before building the scope. This preserves parent IDs when an update payload changes only the name or `isOther` flag.

The OFT/FLD service already has reusable `uniqueScopeFields` support, so its four missing entity configurations only need metadata. The Training service will receive the same small scope-builder pattern. Other Masters already declares `parentField`; its duplicate lookup will accept scope filters, and the service will supply the configured parent using the merged update record.

## Error Behavior

- Same name in a different parent scope: allowed.
- Same name in the same parent scope on a different record: `409` conflict.
- Updating a record without changing its name: allowed because the current ID is excluded.
- Partial update without parent IDs: checked within the existing record's parent scope.

## Testing

Add service-level regression tests that intercept repository duplicate checks and assert the exact name, excluded ID, and scope object for every affected entity. Tests must fail before implementation and pass afterward. Run the full backend test suite and frontend production build to detect regressions.

## Data Safety

This change does not alter Prisma schemas, migrations, or existing rows. It only corrects validation queries.
