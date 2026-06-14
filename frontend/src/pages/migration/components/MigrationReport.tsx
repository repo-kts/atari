import type { TransformReport } from '../../../services/migrationApi'

interface MigrationReportProps {
    report: TransformReport
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
    return (
        <div className={`rounded-md px-3 py-2 text-center ${tone}`}>
            <div className="text-lg font-bold">{value}</div>
            <div className="text-[11px] uppercase tracking-wide">{label}</div>
        </div>
    )
}

/** Aggregate stats + per-row issue list for a transform run. */
export function MigrationReport({ report }: MigrationReportProps) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="grid grid-cols-4 gap-2">
                <Stat label="rows" value={report.total} tone="bg-gray-100 text-gray-700" />
                <Stat label="mapped" value={report.mapped} tone="bg-blue-50 text-blue-700" />
                <Stat label="errors" value={report.errorCount} tone="bg-red-50 text-red-700" />
                <Stat label="warnings" value={report.warnCount} tone="bg-amber-50 text-amber-700" />
            </div>

            <div className="mt-3 text-sm">
                {report.seedable ? (
                    <span className="font-medium text-green-700">
                        ✓ No errors — safe to push to DB
                    </span>
                ) : (
                    <span className="font-medium text-red-700">
                        ✗ Fix errors before pushing (edit the module spec, re-transform)
                    </span>
                )}
            </div>

            {report.rows.length > 0 && (
                <div className="mt-3 max-h-48 overflow-auto rounded-md border border-gray-100">
                    <table className="w-full text-xs">
                        <thead className="sticky top-0 bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-2 py-1 text-left">Row</th>
                                <th className="px-2 py-1 text-left">Field</th>
                                <th className="px-2 py-1 text-left">Issue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.rows.flatMap(r =>
                                r.issues.map((it, i) => (
                                    <tr key={`${r.index}-${i}`} className="border-t border-gray-100">
                                        <td className="px-2 py-1 text-gray-500">#{r.index}</td>
                                        <td className="px-2 py-1 font-mono text-gray-700">
                                            {it.field}
                                        </td>
                                        <td
                                            className={`px-2 py-1 ${
                                                it.severity === 'error'
                                                    ? 'text-red-600'
                                                    : 'text-amber-600'
                                            }`}
                                        >
                                            {it.message}
                                        </td>
                                    </tr>
                                )),
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
