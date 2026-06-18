# Data Migration Tool

Migrates per-KVK data from the **old** site (`atariams.org`, Laravel/MySQL) into
**this** app's Postgres DB. Module-driven: each old entity has one spec under
`modules/`; adding a spec to the registry wires it into the UI and every engine
endpoint automatically.

Lives in `backend/migration/`. Admin-only UI at
`frontend/src/pages/migration/MigrationTool.tsx`.

## Flow

```
paste curl (old site) ──► /fetch ──► raw rows
                                       │
        pick target KVK + module       ▼
                          /transform ──► mapped records + validation report
                                       │   (no DB writes; edit/fix in the grid)
                                       ▼
                              /seed ──► insert into our DB
```

1. **Fetch** — copy a DataTables list request as cURL from the old site (browser
   devtools → Network → right-click → Copy as cURL). The browser can't replay it
   (cross-origin + old session cookie), so the server does via `/fetch`.
2. **Transform** — pick the target KVK and module. The engine runs the module's
   `transform(row, ctx)` over every row, resolving masters by name and emitting a
   per-row + aggregate validation report. **No DB writes.**
3. **Review/edit** — fix cells inline in the grid; warnings/errors shown per row.
4. **Seed** — `/seed` inserts the mapped records. **Insert-only, never dedupes**
   (the old site has genuine near-duplicate rows distinguished only by
   uncovered fields; matching would collapse them).

## Files

| File | Role |
|------|------|
| `routes.js` | Express routes (mounted under `/api/migration`, auth-gated) |
| `engine.js` | Orchestrates fetch → transform → seed |
| `registry.js` | Module spec registry — **add new modules here** |
| `masterResolver.js` | `MasterResolver`: name→id master lookup with normalization |
| `masterCatalog.js` | Whitelist of FK masters exposed to the UI picker |
| `curlParser.js` | Parses a pasted cURL into `{url, method, headers, body}` |
| `util.js` | Shared transform helpers (`parseDate`, `decodeEntities`, `cleanText`, …) |
| `modules/*.js` | One spec per old entity |
| `fixtures/*.json` | Sample old-site responses for reference |

## Endpoints (all under `/api/migration`, require admin auth)

| Method | Path | Purpose |
|--------|------|---------|
| GET  | `/kvks` | List target KVKs (id + name) |
| GET  | `/modules` | List registered modules for the dropdown |
| GET  | `/master-options/:master` | Whitelisted master options for FK pickers |
| POST | `/fetch` | Replay a pasted cURL against the old site; returns raw JSON |
| POST | `/transform` | Map raw rows → our schema + validation report (no writes) |
| POST | `/seed` | Insert mapped records |

## Module spec shape

```js
module.exports = {
    key: 'drmr-details',          // unique slug; UI dropdown value
    label: 'DRMR Details',        // UI label
    model: 'drmrDetails',         // prisma model (default seed target)
    idField: 'drmrDetailsId',     // PK field name
    naturalKey: ['kvkId', ...],   // metadata only — engine never dedupes
    foreignKeys: {                // render FK cells as labels in the grid
        kvkId: { master: 'kvk' },
        seasonId: { master: 'season', otherField: 'seasonOther' },
    },
    async transform(row, ctx) {
        // map one old row -> { data, issues }
        // data: object for prisma create (or null to skip the row)
        // issues: [{ field, message, severity: 'warn'|'error' }]
        return { data, issues };
    },
    // OPTIONAL — only when the spec spans >1 table (parent + children).
    // Without it the engine does prisma[model].create({ data }).
    async seedRecord(prisma, data, { kvkId }) {
        // create parent + children; return 'created' | 'updated'
    },
};
```

### The `ctx` object (built in `engine.js` `transform()`)

| Field | Meaning |
|-------|---------|
| `kvkId` | Target KVK PK in our DB |
| `targetKvkName` | Its name — used to guard rows against the selected KVK |
| `resolver` | A `MasterResolver` instance (shared across the run, cached) |

Modules may stash per-run caches on `ctx` (e.g. CRA's `_craCropBySeason`).

## Conventions / gotchas

- **KVK guard**: every module compares `row.kvk.kvk_name` (normalized) to
  `ctx.targetKvkName`; mismatched rows return `{ data: null }` and are skipped.
  Missing name → warn + fall back to `ctx.kvkId`.
- **Always resolve masters via `MasterResolver`**, never Prisma ILIKE directly.
  `normalize()` collapses whitespace (incl. non-breaking spaces), case, and
  `._-/` that ILIKE misses. `resolve()` = name→id (miss → park in `*Other`);
  `findOrCreate()` = name→id or create (for `@unique` masters with no `*Other`).
- **Reporting year**: old fiscal int (e.g. `2024`) → `Jan 1 of that year (UTC)`
  via `parseDate`.
- **`*_t` / total / sub_total columns** from the old site are dropped — the new
  UI recomputes them.
- **Parent + children** (e.g. `drmr-activity`, `fld`, `vehicle`): `transform`
  returns the parent fields plus a nested array/object; `seedRecord` creates the
  parent then the children. The grid renders nested values as read-only JSON.

## Adding a module

1. Find the old DataTables endpoint; copy its request as cURL; inspect the JSON
   row shape (`/fetch` or curl directly).
2. Find the target prisma model(s) under `prisma/kvk/**` or `prisma/superadmin/**`.
3. Write `modules/<entity>.js` (copy the closest existing spec — `craDetails.js`
   for a flat table, `drmrActivity.js`/`fld.js` for parent+children).
4. Register it in `registry.js`.
5. Test transform read-only against a sample row before seeding — never seed
   against the shared live DB during testing.

## Registered modules

See `registry.js`. Currently includes: bank account, employee, infrastructure,
OFT, vehicle (+details), equipment (+details), FLD, CFLD (technical / extension /
budget), training, extension activity (+other), technology week, celebration
day, production supply, soil-water analysis, publication, awards (KVK /
scientist / farmer), HRD program, CRA (details / extension activity), FPO
(CBBO / management), DRMR (details / activity), **NARI (nutrition garden /
bio-fortified crops / value addition / training programme / extension
activity)**.
