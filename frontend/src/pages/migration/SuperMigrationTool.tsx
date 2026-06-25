import { useCallback, useEffect, useMemo, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { Button } from '../../components/ui/button'
import { superMigrationApi } from '../../services/superMigrationApi'
import {
    migrationApi,
    type MigrationKvk,
    type ModuleInfo,
    type TransformResult,
    type SeedResult,
    type RowAction,
} from '../../services/migrationApi'
import { RecordsViewer } from './components/RecordsViewer'
import { MigrationReport } from './components/MigrationReport'
import { SearchableSelect } from './components/SearchableSelect'
import { KvkSelectDropdown, type KvkOption } from './components/KvkSelectDropdown'
import type { FkEditing } from './views/tableUtils'
import type { RowSelection } from './views/TableView'

type Busy = '' | 'fetch' | 'transform' | 'seed'
type Row = Record<string, unknown>

// A superadmin pull is hundreds/thousands of rows, and both transform (per-row
// DB lookups) and seed (per-row insert) run serially server-side — one giant
// request blows the 60s serverless wall (Vercel maxDuration) and the client
// sees "NetworkError". Instead we slice the rows into batches and call the
// backend once per batch, accumulating results in order. Each batch stays well
// under the limit. ~200 rows/batch balances round-trips against per-call cost.
const BATCH_SIZE = 200

// OFT/FLD transform enriches each row from its edit page (extra HTTP per row),
// so they need a smaller batch than the insert-only modules to stay under the
// wall. Keep in sync with the backend ENRICHERS map.
const ENRICH_BATCH_SIZE = 60
const ENRICH_MODULES = new Set(['oft', 'fld'])

// Mirror backend engine.extractRows: pull the row array out of a raw response
// (DataTables `data`, nested `data.data`, or a bare array) so we can batch it.
// Backend transform accepts a bare array (extractRows handles it), so each
// batch is sent as a plain slice.
function extractRows(raw: unknown): Row[] {
    if (Array.isArray(raw)) return raw as Row[]
    const r = raw as { data?: unknown } | null
    if (r && Array.isArray(r.data)) return r.data as Row[]
    if (r && r.data && Array.isArray((r.data as { data?: unknown }).data)) {
        return (r.data as { data: Row[] }).data
    }
    return []
}

// Mirror backend superEngine.rowKvkName so we can group/filter the raw rows by
// KVK BEFORE transform (the backend resolves each row's KVK from its own
// `kvk_name`, which may sit nested or under a flat dotted key). Keeping the same
// extraction rules means the names we filter on match the names the backend
// resolves, so a selected subset transforms exactly the rows we expect.
function asRowObject(value: unknown): Record<string, unknown> | null {
    if (value == null) return null
    if (typeof value === 'object') return value as Record<string, unknown>
    if (typeof value === 'string') {
        try {
            return JSON.parse(value)
        } catch {
            return null
        }
    }
    return null
}

function findKvkName(obj: unknown, depth = 0): string {
    const o = asRowObject(obj)
    if (!o || depth > 2) return ''
    if (typeof o.kvk_name === 'string' && o.kvk_name.trim()) return o.kvk_name
    for (const key of Object.keys(o)) {
        const v = o[key]
        if (key.endsWith('.kvk_name') && typeof v === 'string' && v.trim()) return v
        const child = asRowObject(v)
        if (child) {
            const found = findKvkName(child, depth + 1)
            if (found) return found
        }
    }
    return ''
}

function decodeEntities(value: string): string {
    return value
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#0?39;/g, "'")
        .trim()
}

// Empty string = no resolvable KVK name on the row (backend reports these as
// errors); we keep them as a distinct, selectable group.
function rowKvkName(row: Row): string {
    const found = findKvkName(row)
    const cleaned = found ? String(found).trim() : ''
    if (!cleaned || cleaned.toLowerCase() === 'n/a') return ''
    return decodeEntities(cleaned)
}

// KVKs pre-checked in the picker on each fetch. Old-site names vary in form
// ("Krishi Vigyan Kendra, Dumka", "KVK DHANBAD", "KVK Manpur Gaya", "kvkpatna"),
// so match on a stripped core (drop the "KVK"/"Krishi Vigyan Kendra" prefix and
// all punctuation) rather than the literal string.
const DEFAULT_KVKS = [
    'KVK Chatra',
    'KVK Jamtara',
    'KVK Simdega',
    'KVK West Singhbhum',
    'KVK Sitamarhi',
]

function kvkCore(name: string): string {
    const n = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    return n.replace(/^krishi vigyan kendra\s*/, '').replace(/^kvk\s*/, '').trim()
}

const DEFAULT_KVK_CORES = new Set(DEFAULT_KVKS.map(kvkCore))

/**
 * Super-migration workbench. Same flow as MigrationTool but WITHOUT a KVK
 * picker: paste a superadmin curl (kvk_id empty → all KVKs) -> pick module ->
 * Fetch -> Transform (each row's KVK is resolved on the backend from the row's
 * own kvk.kvk_name) -> review + fix FKs inline -> Push to DB.
 */
export function SuperMigrationTool() {
    const [modules, setModules] = useState<ModuleInfo[]>([])
    const [moduleKey, setModuleKey] = useState<string | ''>('')
    const [curl, setCurl] = useState('')

    const [raw, setRaw] = useState<unknown>(undefined)
    const [rowCount, setRowCount] = useState<number | null>(null)
    // Pre-transform KVK filter: distinct old-site KVK names the user wants to
    // migrate. Empty set = none; defaults to all after each fetch.
    const [selectedRawKvks, setSelectedRawKvks] = useState<Set<string>>(new Set())
    const [enrichTruncated, setEnrichTruncated] = useState(false)
    const [splitPercent, setSplitPercent] = useState<number>(50)
    const [verticalSplit, setVerticalSplit] = useState<number>(65)
    const [showErrorsOnly, setShowErrorsOnly] = useState<boolean>(false)

    const handleMouseDown = (e: ReactMouseEvent) => {
        e.preventDefault()
        const startX = e.clientX
        const startSplit = splitPercent

        const container = e.currentTarget.parentElement
        const containerWidth = container ? container.getBoundingClientRect().width : window.innerWidth

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX
            const deltaPercent = (deltaX / containerWidth) * 100
            const nextPercent = Math.min(Math.max(startSplit + deltaPercent, 15), 85)
            setSplitPercent(nextPercent)
        }

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
    }

    const handleVerticalMouseDown = (e: ReactMouseEvent) => {
        e.preventDefault()
        const startY = e.clientY
        const startSplit = verticalSplit

        const container = e.currentTarget.parentElement
        const containerHeight = container ? container.getBoundingClientRect().height : window.innerHeight

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const deltaY = moveEvent.clientY - startY
            const deltaPercent = (deltaY / containerHeight) * 100
            const nextPercent = Math.min(Math.max(startSplit + deltaPercent, 20), 85)
            setVerticalSplit(nextPercent)
        }
        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
    }

    const [transformed, setTransformed] = useState<TransformResult | null>(null)
    const [records, setRecords] = useState<Array<Row | null>>([])
    const [fkOptions, setFkOptions] = useState<Record<string, { value: number; label: string }[]>>(
        {},
    )
    const [seedResult, setSeedResult] = useState<SeedResult | null>(null)
    const [rowActions, setRowActions] = useState<RowAction[]>([])

    // Push filters: which KVKs and which individual rows to migrate. Populated
    // (all-selected) after each transform; both gate what gets pushed.
    const [kvkNames, setKvkNames] = useState<Record<number, string>>({})
    const [selectedKvkIds, setSelectedKvkIds] = useState<Set<number>>(new Set())
    const [excludedRows, setExcludedRows] = useState<Set<number>>(new Set())

    const [busy, setBusy] = useState<Busy>('')
    const [error, setError] = useState('')
    // Batch progress for the chunked transform/seed (null when idle).
    const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)

    const activeModule = useMemo(
        () => modules.find(m => m.key === moduleKey) || null,
        [modules, moduleKey],
    )

    // Distinct KVKs in the raw pull (name → row count) — drives the pre-transform
    // picker. Recomputed whenever a new curl is fetched.
    const rawKvkGroups = useMemo<KvkOption[]>(() => {
        const m = new Map<string, number>()
        extractRows(raw).forEach(r => {
            const name = rowKvkName(r)
            m.set(name, (m.get(name) ?? 0) + 1)
        })
        // Priority (default) KVKs float to the top, then the rest alphabetical.
        return [...m.entries()]
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => {
                const pa = DEFAULT_KVK_CORES.has(kvkCore(a.name)) ? 0 : 1
                const pb = DEFAULT_KVK_CORES.has(kvkCore(b.name)) ? 0 : 1
                return pa - pb || a.name.localeCompare(b.name)
            })
    }, [raw])

    // On each fresh pull, pre-check the default KVKs (matched by stripped core).
    // Fall back to selecting all if the pull contains none of them, so an
    // unrelated dataset isn't left with an empty (un-transformable) selection.
    useEffect(() => {
        const matched = rawKvkGroups.filter(g => DEFAULT_KVK_CORES.has(kvkCore(g.name)))
        const chosen = matched.length > 0 ? matched : rawKvkGroups
        setSelectedRawKvks(new Set(chosen.map(g => g.name)))
    }, [rawKvkGroups])

    useEffect(() => {
        superMigrationApi
            .getModules()
            .then(r => setModules(r.modules))
            .catch(e => setError(e.message))
        // KVK id → name map, only to label the per-KVK push filter chips.
        migrationApi
            .getKvks()
            .then(r =>
                setKvkNames(
                    Object.fromEntries((r.kvks as MigrationKvk[]).map(k => [k.kvkId, k.kvkName])),
                ),
            )
            .catch(() => {})
    }, [])

    // Load FK master options for the selected module's pickers. `force` refetches
    // even cached masters — needed after a transform, since find-or-create specs
    // (e.g. payScale) may have added new master rows we must now show by label.
    const loadFkOptions = useCallback(
        (force = false) => {
            if (!activeModule) return
            const masters = [...new Set(Object.values(activeModule.foreignKeys).map(f => f.master))]
            masters.forEach(master => {
                if (!force && fkOptions[master]) return
                superMigrationApi
                    .getMasterOptions(master)
                    .then(r =>
                        setFkOptions(prev => ({
                            ...prev,
                            [master]: r.options.map(o => ({
                                value: o.id,
                                label: `${o.label} (#${o.id})`,
                            })),
                        })),
                    )
                    .catch(e =>
                        setError(
                            `Couldn't load master "${master}" options: ${e.message}. ` +
                                `If the backend was running before this feature was added, restart it.`,
                        ),
                    )
            })
        },
        [activeModule, fkOptions],
    )

    useEffect(() => {
        loadFkOptions(false)
    }, [loadFkOptions])

    const run = async (label: Busy, fn: () => Promise<void>) => {
        setError('')
        setBusy(label)
        try {
            await fn()
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e))
        } finally {
            setBusy('')
            setProgress(null)
        }
    }

    const onFetch = () =>
        run('fetch', async () => {
            setTransformed(null)
            setRecords([])
            setSeedResult(null)
            setRowActions([])
            const out = await superMigrationApi.fetchCurl(curl)
            setRaw(out.raw)
            setRowCount(out.rowCount)
            setEnrichTruncated(out.enrichTruncated === true)
        })

    const onTransform = () =>
        run('transform', async () => {
            setSeedResult(null)
            setRowActions([])
            // Only transform rows whose KVK the user picked — a 900+ row
            // superadmin pull can be migrated a few KVKs at a time, keeping each
            // run small and fast. Filtering here means the unselected rows are
            // never sent or processed at all.
            const allRows = extractRows(raw).filter(r =>
                selectedRawKvks.has(rowKvkName(r)),
            )

            // Enrichment modules (OFT/FLD) fetch each row's edit page server-side
            // during transform — a 200-row batch could approach the 60s serverless
            // wall, so use a smaller batch. Other modules stay at BATCH_SIZE.
            const batchSize = ENRICH_MODULES.has(moduleKey) ? ENRICH_BATCH_SIZE : BATCH_SIZE

            // Accumulate batch results in original row order. Report row indices
            // are batch-local, so shift them by the batch offset to stay aligned
            // with the flat `records` array the UI keys everything off.
            const records: Array<Row | null> = []
            const reportRows: TransformResult['report']['rows'] = []
            let errorCount = 0
            let warnCount = 0

            setProgress({ done: 0, total: allRows.length })
            for (let off = 0; off < allRows.length; off += batchSize) {
                const slice = allRows.slice(off, off + batchSize)
                const out = await superMigrationApi.transform(moduleKey, slice, curl)
                ;(out.records as Array<Row | null>).forEach(r => records.push(r))
                out.report.rows.forEach(rr =>
                    reportRows.push({ ...rr, index: rr.index + off }),
                )
                errorCount += out.report.errorCount
                warnCount += out.report.warnCount
                setProgress({ done: Math.min(off + slice.length, allRows.length), total: allRows.length })
            }
            setProgress(null)

            const merged: TransformResult = {
                records,
                report: {
                    total: allRows.length,
                    mapped: records.filter(Boolean).length,
                    errorCount,
                    warnCount,
                    seedable: errorCount === 0,
                    rows: reportRows,
                },
            }
            setTransformed(merged)
            setRecords(records)
            // Default: every KVK present is selected, no rows excluded.
            const ids = new Set<number>()
            records.forEach(r => {
                const id = r?.kvkId
                if (typeof id === 'number') ids.add(id)
            })
            setSelectedKvkIds(ids)
            setExcludedRows(new Set())
            loadFkOptions(true)
        })

    const onSeed = () =>
        run('seed', async () => {
            // Push only selected rows; unselected become null → skipped server-side.
            // Index positions are preserved so returned actions align with the table.
            const filtered = records.map((r, i) => (selectedRowIndices.has(i) ? r : null))

            // Batch the insert the same way as transform so a large push can't
            // overrun the serverless wall. Accumulate counts, and concat the
            // per-row actions in order; failed indices are batch-local, so shift
            // them by the batch offset to point at the real table row.
            const merged: SeedResult = {
                created: 0,
                updated: 0,
                skipped: 0,
                failed: [],
                actions: [],
            }
            setProgress({ done: 0, total: filtered.length })
            for (let off = 0; off < filtered.length; off += BATCH_SIZE) {
                const slice = filtered.slice(off, off + BATCH_SIZE)
                const out = await superMigrationApi.seed(moduleKey, slice)
                merged.created += out.created
                merged.updated += out.updated
                merged.skipped += out.skipped
                out.failed.forEach(f => merged.failed.push({ ...f, index: f.index + off }))
                ;(out.actions ?? []).forEach(a => merged.actions.push(a))
                setProgress({ done: Math.min(off + slice.length, filtered.length), total: filtered.length })
            }
            setProgress(null)
            setSeedResult(merged)
            setRowActions(merged.actions)
        })

    const onEditCell = (rowIndex: number, field: string, value: number | null) => {
        const meta = activeModule?.foreignKeys[field]
        setRecords(prev =>
            prev.map((r, i) => {
                if (i !== rowIndex || !r) return r
                const next: Row = { ...r, [field]: value }
                if (meta?.otherField && value != null) next[meta.otherField] = null
                return next
            }),
        )
    }

    const onEditField = (rowIndex: number, field: string, value: unknown) => {
        setRecords(prev =>
            prev.map((r, i) => (i !== rowIndex || !r ? r : { ...r, [field]: value })),
        )
    }

    const onFillUnmatched = (field: string, value: number) => {
        const meta = activeModule?.foreignKeys[field]
        setRecords(prev =>
            prev.map(r => {
                if (!r) return r
                const cur = r[field]
                if (cur !== null && cur !== undefined && cur !== '') return r
                const next: Row = { ...r, [field]: value }
                if (meta?.otherField) next[meta.otherField] = null
                return next
            }),
        )
    }

    const liveReport = useMemo(() => {
        if (!transformed) return null
        const errorResolved = (field: string, rec: Row | null) => {
            if (!rec) return false
            const v = rec[field]
            return v !== null && v !== undefined && v !== ''
        }
        const rows = transformed.report.rows
            .map(r => {
                const rec = records[r.index] ?? null
                const issues = r.issues.filter(
                    it => !(it.severity === 'error' && errorResolved(it.field, rec)),
                )
                return { index: r.index, issues }
            })
            .filter(r => r.issues.length > 0)
        const errorCount = rows.reduce(
            (n, r) => n + r.issues.filter(i => i.severity === 'error').length,
            0,
        )
        const warnCount = rows.reduce(
            (n, r) => n + r.issues.filter(i => i.severity === 'warn').length,
            0,
        )
        return { ...transformed.report, rows, errorCount, warnCount, seedable: errorCount === 0 }
    }, [transformed, records])

    const errorIndices = useMemo(() => {
        const s = new Set<number>()
        liveReport?.rows.forEach(r => {
            if (r.issues.some(i => i.severity === 'error')) s.add(r.index)
        })
        return s
    }, [liveReport])

    // Distinct KVKs present across the mapped records, with per-KVK row counts —
    // drives the "push these KVKs" filter chips.
    const kvkGroups = useMemo(() => {
        const m = new Map<number, number>()
        records.forEach(r => {
            const id = r?.kvkId
            if (typeof id === 'number') m.set(id, (m.get(id) ?? 0) + 1)
        })
        return [...m.entries()]
            .map(([id, count]) => ({ id, count, name: kvkNames[id] ?? `KVK #${id}` }))
            .sort((a, b) => a.name.localeCompare(b.name))
    }, [records, kvkNames])

    const allKvkSelected =
        kvkGroups.length > 0 && kvkGroups.every(g => selectedKvkIds.has(g.id))

    // Rows that CAN be pushed: mapped, no unresolved error, and in a selected KVK.
    const selectableIndices = useMemo(() => {
        const s = new Set<number>()
        records.forEach((r, i) => {
            if (!r) return
            const id = r.kvkId
            if (typeof id !== 'number' || !selectedKvkIds.has(id)) return
            if (errorIndices.has(i)) return
            s.add(i)
        })
        return s
    }, [records, selectedKvkIds, errorIndices])

    // Rows actually selected to push = selectable minus the ones the user unchecked.
    const selectedRowIndices = useMemo(() => {
        const s = new Set<number>()
        selectableIndices.forEach(i => {
            if (!excludedRows.has(i)) s.add(i)
        })
        return s
    }, [selectableIndices, excludedRows])

    const onToggleKvk = (id: number) =>
        setSelectedKvkIds(prev => {
            const n = new Set(prev)
            if (n.has(id)) n.delete(id)
            else n.add(id)
            return n
        })

    const selection: RowSelection = {
        selected: selectedRowIndices,
        selectable: selectableIndices,
        onToggle: index =>
            setExcludedRows(prev => {
                const n = new Set(prev)
                if (n.has(index)) n.delete(index)
                else n.add(index)
                return n
            }),
        onToggleAll: checked =>
            setExcludedRows(prev => {
                const n = new Set(prev)
                selectableIndices.forEach(i => (checked ? n.delete(i) : n.add(i)))
                return n
            }),
    }

    // Display filter: combine errors-only with the per-KVK filter. Rows without a
    // kvkId (unmapped/null) are kept so their errors stay visible.
    const visibleIndices = useMemo(() => {
        const kvkFilterActive = !allKvkSelected
        if (!showErrorsOnly && !kvkFilterActive) return undefined
        const s = new Set<number>()
        for (let i = 0; i < records.length; i++) {
            if (showErrorsOnly && !errorIndices.has(i)) continue
            if (kvkFilterActive) {
                const id = records[i]?.kvkId
                if (typeof id === 'number' && !selectedKvkIds.has(id)) continue
            }
            s.add(i)
        }
        return s
    }, [showErrorsOnly, allKvkSelected, errorIndices, records, selectedKvkIds])

    const displayRecords = useMemo(() => {
        const source = records.length > 0 ? records : transformed?.records
        if (!source) return undefined
        return source.map((r, index) => {
            if (r) return r
            const issueRow = transformed?.report.rows.find(x => x.index === index)
            const summary =
                issueRow?.issues
                    .map(i => `[${i.severity}] ${i.field}: ${i.message}`)
                    .join(' | ') || 'Transform returned null for this row'
            return { _status: 'not mapped', _issues: summary }
        })
    }, [records, transformed])

    const fk: FkEditing | undefined = activeModule
        ? { foreignKeys: activeModule.foreignKeys, fkOptions, onEditCell, onEditField, onFillUnmatched }
        : undefined

    const canTransform = raw !== undefined && moduleKey !== '' && selectedRawKvks.size > 0
    // Selective push: enabled as long as at least one row is selected (clean rows
    // can ship even while others still carry errors).
    const canSeed = selectedRowIndices.size > 0

    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col gap-4 p-4">
            <div>
                <h1 className="text-xl font-bold text-gray-800">Super Data Migration</h1>
                <p className="text-sm text-gray-500">
                    Paste a superadmin curl (kvk_id empty → all KVKs), pick module, transform; each
                    row's target KVK is resolved automatically from the row. Fix FKs, push.
                </p>
            </div>

            {/* Controls — no KVK picker; KVK comes from each row. */}
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[240px_1fr_auto]">
                <SearchableSelect
                    options={modules.map(m => ({ value: m.key, label: m.label }))}
                    value={moduleKey}
                    onChange={v => setModuleKey(v === '' ? '' : String(v))}
                    placeholder="Search module…"
                />
                <textarea
                    className="min-h-[40px] rounded-md border border-gray-300 px-3 py-2 font-mono text-xs"
                    placeholder="Paste superadmin curl copied from atariams.org devtools…"
                    value={curl}
                    onChange={e => setCurl(e.target.value)}
                />
                <div className="flex items-start gap-2">
                    <Button onClick={onFetch} disabled={!curl || busy !== ''}>
                        {busy === 'fetch' ? 'Fetching…' : 'Fetch'}
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={onTransform}
                        disabled={!canTransform || busy !== ''}
                    >
                        {busy === 'transform'
                            ? progress
                                ? `Transforming ${progress.done}/${progress.total}…`
                                : 'Transforming…'
                            : 'Transform'}
                    </Button>
                    <Button
                        onClick={onSeed}
                        disabled={!canSeed || busy !== ''}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {busy === 'seed'
                            ? progress
                                ? `Pushing ${progress.done}/${progress.total}…`
                                : 'Pushing…'
                            : `Push to DB${transformed ? ` (${selectedRowIndices.size})` : ''}`}
                    </Button>
                </div>
            </div>

            {/* Pre-transform KVK filter — restrict the transform to a subset of
                KVKs so a large superadmin pull can be migrated in batches. */}
            {rawKvkGroups.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                    <KvkSelectDropdown
                        options={rawKvkGroups}
                        selected={selectedRawKvks}
                        onChange={setSelectedRawKvks}
                    />
                    {selectedRawKvks.size === 0 && (
                        <span className="text-xs text-amber-700">
                            Select at least one KVK to transform.
                        </span>
                    )}
                </div>
            )}

            {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                </div>
            )}

            {enrichTruncated && (
                <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    Edit-page enrichment hit its time budget and was cut short —
                    later rows fall back to inline list fields, so some detail
                    columns may be incomplete. Push what maps cleanly, then re-run
                    the affected KVKs via the per-KVK migration tool for full detail.
                </div>
            )}

            {seedResult && (
                <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
                    Pushed — created {seedResult.created}, updated {seedResult.updated}, skipped{' '}
                    {seedResult.skipped}
                    {seedResult.failed.length > 0 &&
                        `, failed ${seedResult.failed.length} (${seedResult.failed
                            .map(f => `#${f.index}: ${f.message}`)
                            .join('; ')})`}
                </div>
            )}

            {/* Per-KVK push filter — pick which KVKs to migrate. */}
            {transformed && kvkGroups.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                    <span className="text-xs font-semibold text-gray-600">Push KVKs:</span>
                    <button
                        type="button"
                        onClick={() =>
                            setSelectedKvkIds(
                                allKvkSelected ? new Set() : new Set(kvkGroups.map(g => g.id)),
                            )
                        }
                        className="rounded border border-gray-300 bg-white px-2 py-0.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
                    >
                        {allKvkSelected ? 'Clear all' : 'Select all'}
                    </button>
                    {kvkGroups.map(g => {
                        const on = selectedKvkIds.has(g.id)
                        return (
                            <button
                                key={g.id}
                                type="button"
                                onClick={() => onToggleKvk(g.id)}
                                className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${
                                    on
                                        ? 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100'
                                        : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                                }`}
                                title={`${g.name} — ${g.count} rows`}
                            >
                                {on ? '✓ ' : ''}
                                {g.name} ({g.count})
                            </button>
                        )
                    })}
                </div>
            )}

            {/* Panes */}
            <div className="flex min-h-0 flex-1 gap-0 overflow-hidden relative">
                <div style={{ width: `${splitPercent}%` }} className="min-w-0 h-full flex flex-col pr-2">
                    <RecordsViewer
                        title="Raw response (old site)"
                        data={raw}
                        defaultView="table"
                        badge={rowCount != null ? `${rowCount} rows` : undefined}
                        placeholder="Fetch a curl to see the old-site response here."
                    />
                </div>

                {/* Draggable Divider */}
                <div
                    onMouseDown={handleMouseDown}
                    className="w-2 hover:w-2.5 bg-gray-100 hover:bg-blue-500 cursor-col-resize self-stretch transition-colors select-none flex items-center justify-center relative z-30"
                    title="Drag to resize panes"
                >
                    <div className="w-0.5 h-12 bg-gray-300 rounded-full"></div>
                </div>

                <div style={{ width: `${100 - splitPercent}%` }} className="min-w-0 h-full flex flex-col pl-2">
                    <div style={{ height: `${transformed ? verticalSplit : 100}%` }} className="min-h-0 flex flex-col">
                        <RecordsViewer
                            title="Mapped to our schema"
                            data={displayRecords}
                            defaultView="table"
                            fk={fk}
                            badge={
                                transformed
                                    ? `${transformed.report.mapped} mapped · ${selectedRowIndices.size} selected`
                                    : undefined
                            }
                            placeholder="Transform to see records mapped to your DB schema."
                            rowActions={rowActions}
                            visibleIndices={visibleIndices}
                            selection={transformed ? selection : undefined}
                            headerExtra={
                                transformed ? (
                                    <button
                                        type="button"
                                        onClick={() => setShowErrorsOnly(v => !v)}
                                        disabled={!showErrorsOnly && errorIndices.size === 0}
                                        title="Show only rows that still have unresolved errors"
                                        className={`rounded border px-2 py-1 text-xs font-medium transition-colors ${
                                            showErrorsOnly
                                                ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
                                                : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50'
                                        }`}
                                    >
                                        {showErrorsOnly
                                            ? 'Show all rows'
                                            : `Errors only (${errorIndices.size})`}
                                    </button>
                                ) : undefined
                            }
                        />
                    </div>
                    {transformed && (
                        <>
                            {/* Vertical draggable divider */}
                            <div
                                onMouseDown={handleVerticalMouseDown}
                                className="h-2 hover:h-2.5 bg-gray-100 hover:bg-blue-500 cursor-row-resize w-full transition-colors select-none flex items-center justify-center"
                                title="Drag to resize"
                            >
                                <div className="h-0.5 w-12 bg-gray-300 rounded-full"></div>
                            </div>
                            <div style={{ height: `${100 - verticalSplit}%` }} className="min-h-0 overflow-auto">
                                <MigrationReport report={liveReport ?? transformed.report} />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
