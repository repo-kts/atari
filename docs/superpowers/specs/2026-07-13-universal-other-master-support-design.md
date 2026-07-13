# Universal “Other” Master Support Design

## Goal

Every editable All Masters form must expose a consistent “Mark as Other” checkbox, persist the `isOther` flag on create and update, and let downstream data-entry forms capture a free-text value when a flagged master row is selected.

## Current State

The application has 70 editable master forms:

- 30 display and persist `isOther` correctly.
- 15 display the checkbox but silently discard the flag in their repository write path.
- 25 do not display the checkbox and their master models do not yet define `isOther`.

The existing implementation convention is sound but incomplete: master tables use `is_other`, consuming records use nullable `..._other` columns, frontend dropdown options carry `isOther`, and `useOtherSpecify` controls the conditional free-text input.

## Architecture

### Universal master contract

Every editable master model will define:

```prisma
isOther Boolean @default(false) @map("is_other")
```

Every master create/update path will accept and persist `isOther`. Repository families that already copy safe scalar fields require no special handling; allowlist-based and specialized repositories must explicitly include it.

Every master editor will render the shared `IsOtherCheckbox` component. Existing entity-specific fields and relationships remain unchanged.

### Downstream specify-other contract

When a master is used by a data-entry dropdown:

1. The option mapper carries the row’s `isOther` flag.
2. `useOtherSpecify` determines whether the selected option is flagged.
3. A `SpecifyOtherInput` appears for flagged options.
4. The consuming record persists a nullable, entity-specific `...Other` value.
5. Switching to a non-Other option clears the stale free-text value.

Masters that are not selected by any downstream data-entry form receive the universal master contract only; no unused consumer column is introduced.

### Database changes

Changes are additive:

- Add `is_other BOOLEAN NOT NULL DEFAULT false` to the 25 master tables that lack it.
- Add nullable `TEXT` specify-other columns only to consuming tables that need them and do not already have them.
- Do not delete, rewrite, or reinterpret existing master or form data.

### Error handling and compatibility

- Existing API payloads remain valid because `isOther` defaults to `false`.
- Existing records continue to resolve through their current foreign keys.
- Unknown or omitted flags are normalized by the database default rather than inferred from names.
- Create and update responses must return the persisted `isOther` value.

## Testing

- A Prisma metadata contract verifies all editable master models expose `isOther`.
- Repository contract tests verify allowlist and specialized repositories pass `isOther` through create/update.
- Frontend source contracts verify every master form renders `IsOtherCheckbox`.
- Existing backend tests remain green.
- `prisma validate`, Prisma client generation, frontend TypeScript/build, and diff checks must succeed.

## Scope Boundaries

- This change standardizes the existing Other/specify-other behavior; it does not redesign master relationships or replace foreign keys with free-form values.
- It does not automatically mark rows as Other based on their names.
- It does not alter delete behavior, permissions, pagination, or sorting.
