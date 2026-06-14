import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '../../components/ui/button'
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
import type { FkEditing } from './views/tableUtils'

type Busy = '' | 'fetch' | 'transform' | 'seed'
type Row = Record<string, unknown>

/**
 * Data-migration workbench. Flow: pick target KVK -> pick module -> paste the
 * curl copied from atariams.org -> Fetch (raw, left) -> Transform (mapped to our
 * schema, right) -> review + fix FKs inline -> Push to DB. Mapping rules live in
 * the backend module spec; tune by trial-and-error there and re-Transform.
 */
export function MigrationTool() {
    const [kvks, setKvks] = useState<MigrationKvk[]>([])
    const [modules, setModules] = useState<ModuleInfo[]>([])
    const [kvkId, setKvkId] = useState<number | ''>('')
    const [moduleKey, setModuleKey] = useState<string | ''>('')
    const [curl, setCurl] = useState('')

    const [raw, setRaw] = useState<unknown>(undefined)
    const [rowCount, setRowCount] = useState<number | null>(null)
    const [splitPercent, setSplitPercent] = useState<number>(50)
    const [verticalSplit, setVerticalSplit] = useState<number>(65)

    const handleMouseDown = (e: React.MouseEvent) => {
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

    const handleVerticalMouseDown = (e: React.MouseEvent) => {
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

    const [busy, setBusy] = useState<Busy>('')
    const [error, setError] = useState('')

    const activeModule = useMemo(
        () => modules.find(m => m.key === moduleKey) || null,
        [modules, moduleKey],
    )

    useEffect(() => {
        migrationApi
            .getKvks()
            .then(r => setKvks(r.kvks))
            .catch(e => setError(e.message))
        migrationApi
            .getModules()
            .then(r => setModules(r.modules))
            .catch(e => setError(e.message))
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
                migrationApi
                    .getMasterOptions(master)
                    .then(r =>
                        setFkOptions(prev => ({
                            ...prev,
                            // Label shows the master value AND its id for confirmation;
                            // the stored/submitted value remains the id.
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
        }
    }

    const onFetch = () =>
        run('fetch', async () => {
            setTransformed(null)
            setRecords([])
            setSeedResult(null)
            setRowActions([])
            const out = await migrationApi.fetchCurl(curl)
            setRaw(out.raw)
            setRowCount(out.rowCount)
        })

    const onTransform = () =>
        run('transform', async () => {
            setSeedResult(null)
            setRowActions([])
            const out = await migrationApi.transform(moduleKey, Number(kvkId), raw)
            setTransformed(out)
            setRecords(out.records as Array<Row | null>)
            // find-or-create specs may have added master rows — refresh pickers
            // so the new ids resolve to labels instead of bare "#id".
            loadFkOptions(true)
        })

    const onSeed = () =>
        run('seed', async () => {
            const out = await migrationApi.seed(moduleKey, Number(kvkId), records)
            setSeedResult(out)
            setRowActions(out.actions ?? [])
        })

    // Inline FK edit: write the chosen master id into the record (and clear the
    // *Other fallback text once a real master is picked). Reflected in all views.
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
        ? { foreignKeys: activeModule.foreignKeys, fkOptions, onEditCell }
        : undefined

    const canTransform = raw !== undefined && kvkId !== '' && moduleKey !== ''
    const canSeed = !!transformed && transformed.report.seedable

    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col gap-4 p-4">
            <div>
                <h1 className="text-xl font-bold text-gray-800">Data Migration</h1>
                <p className="text-sm text-gray-500">
                    Pick the target KVK by name (ids may differ from the old site), paste curl,
                    transform, fix FKs, push.
                </p>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[240px_240px_1fr_auto]">
                <SearchableSelect
                    options={kvks.map(k => ({ value: k.kvkId, label: `${k.kvkName} (#${k.kvkId})` }))}
                    value={kvkId}
                    onChange={v => setKvkId(v === '' ? '' : Number(v))}
                    placeholder="Search target KVK…"
                />
                <SearchableSelect
                    options={modules.map(m => ({ value: m.key, label: m.label }))}
                    value={moduleKey}
                    onChange={v => setModuleKey(v === '' ? '' : String(v))}
                    placeholder="Search module…"
                />
                <textarea
                    className="min-h-[40px] rounded-md border border-gray-300 px-3 py-2 font-mono text-xs"
                    placeholder="Paste curl command copied from atariams.org devtools…"
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
                        {busy === 'transform' ? 'Transforming…' : 'Transform'}
                    </Button>
                    <Button
                        onClick={onSeed}
                        disabled={!canSeed || busy !== ''}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {busy === 'seed' ? 'Pushing…' : 'Push to DB'}
                    </Button>
                </div>
            </div>

            {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
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

            {/* Split Sizer Control */}
            <div className="flex items-center gap-2 border-t border-gray-100 pt-2 text-xs text-gray-500">
                <span className="font-semibold text-gray-700">Resize Panels:</span>
                <input
                    type="range"
                    min="20"
                    max="80"
                    value={splitPercent}
                    onChange={e => setSplitPercent(Number(e.target.value))}
                    className="h-2 w-40 cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-600 focus:outline-none"
                    title="Slide to resize the panels left/right"
                />
                <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                    {splitPercent}% / {100 - splitPercent}%
                </span>
                <button
                    type="button"
                    onClick={() => setSplitPercent(50)}
                    className="rounded border border-gray-300 bg-white px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-50 active:bg-gray-100 font-medium transition-colors"
                >
                    Reset Split
                </button>
            </div>

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
                            badge={transformed ? `${transformed.report.mapped} mapped` : undefined}
                            placeholder="Transform to see records mapped to your DB schema."
                            rowActions={rowActions}
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
                                <MigrationReport report={transformed.report} />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
