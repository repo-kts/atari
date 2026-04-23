import React, { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, Download } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/Card'
import { useAuth } from '@/contexts/AuthContext'
import { useTechnicalSummary, useTechnicalSummaryFilters } from '@/hooks/useTechnicalAchievementSummary'
import { useAlert } from '@/hooks/useAlert'
import { ParticipantAchievement, TechnicalAchievementSummaryData } from '@/services/technicalAchievementSummaryApi'
import { exportApi } from '@/services/exportApi'
import { DatePicker } from '@/components/ui/date-picker'

/** Template key the backend dispatches on — see exportController.js. */
const TAS_TEMPLATE_KEY = 'technical-achievement-summary-report'

type ExportFormat = 'pdf' | 'excel' | 'word'

const FORMAT_EXT: Record<ExportFormat, string> = {
    pdf: 'pdf',
    excel: 'xlsx',
    word: 'docx',
}

const SECTION_TH = 'px-2 py-2 border border-[#D6D6D6] text-center font-semibold text-[13px] leading-tight bg-[#EEEEEE]'
const TH = 'px-1.5 py-1 border border-[#D6D6D6] text-center font-semibold text-[12px] leading-tight'
const TH_NOWRAP = `${TH} whitespace-nowrap`
const TD = 'px-1.5 py-1 border border-[#D6D6D6] text-center text-[12px] whitespace-nowrap'
const TD_PUB = 'px-1.5 py-1 border border-[#D6D6D6] text-left text-[12px]'

const emptyParticipant: ParticipantAchievement = {
    general: { m: 0, f: 0 },
    obc: { m: 0, f: 0 },
    sc: { m: 0, f: 0 },
    st: { m: 0, f: 0 },
    total: { m: 0, f: 0, t: 0 },
}

function formatInt(value: number | null | undefined) {
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Number(value || 0))
}

function formatDecimal(value: number | null | undefined) {
    return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(Number(value || 0))
}

function ParticipantCategoryHeaders() {
    return (
        <>
            <th className={TH} colSpan={2}>General</th>
            <th className={TH} colSpan={2}>OBC</th>
            <th className={TH} colSpan={2}>SC</th>
            <th className={TH} colSpan={2}>ST</th>
            <th className={TH} colSpan={3}>Total</th>
        </>
    )
}

function ParticipantGenderHeaders() {
    return (
        <>
            <th className={TH_NOWRAP}>M</th>
            <th className={TH_NOWRAP}>F</th>
            <th className={TH_NOWRAP}>M</th>
            <th className={TH_NOWRAP}>F</th>
            <th className={TH_NOWRAP}>M</th>
            <th className={TH_NOWRAP}>F</th>
            <th className={TH_NOWRAP}>M</th>
            <th className={TH_NOWRAP}>F</th>
            <th className={TH_NOWRAP}>M</th>
            <th className={TH_NOWRAP}>F</th>
            <th className={TH_NOWRAP}>T</th>
        </>
    )
}

function ParticipantCells({ value }: { value: ParticipantAchievement }) {
    return (
        <>
            <td className={TD}>{formatInt(value.general.m)}</td>
            <td className={TD}>{formatInt(value.general.f)}</td>
            <td className={TD}>{formatInt(value.obc.m)}</td>
            <td className={TD}>{formatInt(value.obc.f)}</td>
            <td className={TD}>{formatInt(value.sc.m)}</td>
            <td className={TD}>{formatInt(value.sc.f)}</td>
            <td className={TD}>{formatInt(value.st.m)}</td>
            <td className={TD}>{formatInt(value.st.f)}</td>
            <td className={TD}>{formatInt(value.total.m)}</td>
            <td className={TD}>{formatInt(value.total.f)}</td>
            <td className={`${TD} font-semibold`}>{formatInt(value.total.t)}</td>
        </>
    )
}

interface ExportTable {
    title: string
    headers: string[]
    /** Single-row tables (legacy sections) */
    row?: Array<string | number>
    /** Multi-row section (e.g. publications summary) */
    rows?: Array<Array<string | number>>
}

const PARTICIPANT_EXPORT_HEADERS = [
    'General M',
    'General F',
    'OBC M',
    'OBC F',
    'SC M',
    'SC F',
    'ST M',
    'ST F',
    'Total M',
    'Total F',
    'Total T',
]

function participantRow(value: ParticipantAchievement): number[] {
    return [
        value.general.m,
        value.general.f,
        value.obc.m,
        value.obc.f,
        value.sc.m,
        value.sc.f,
        value.st.m,
        value.st.f,
        value.total.m,
        value.total.f,
        value.total.t,
    ]
}

function buildExportTables(sections: TechnicalAchievementSummaryData['sections']): ExportTable[] {
    return [
        {
            title: 'OFT',
            headers: ['Target', 'Achievement', 'No. of Location', 'No. of Trials', 'Farmers Target', ...PARTICIPANT_EXPORT_HEADERS],
            row: [
                sections.oft.target,
                sections.oft.achievement,
                sections.oft.noOfLocation,
                sections.oft.noOfTrials,
                sections.oft.farmers.target,
                ...participantRow(sections.oft.farmers.achievement),
            ],
        },
        {
            title: 'FLD',
            headers: ['Target', 'Achievement', 'Area', 'Farmers Target', ...PARTICIPANT_EXPORT_HEADERS],
            row: [
                sections.fld.target,
                sections.fld.achievement,
                sections.fld.area,
                sections.fld.farmers.target,
                ...participantRow(sections.fld.farmers.achievement),
            ],
        },
        {
            title: 'Training',
            headers: ['Target', 'Achievement', 'Participants Target', ...PARTICIPANT_EXPORT_HEADERS],
            row: [
                sections.training.target,
                sections.training.achievement,
                sections.training.participants.target,
                ...participantRow(sections.training.participants.achievement),
            ],
        },
        {
            title: 'Extension Activities',
            headers: ['Target', 'Achievement', 'Participants Target', ...PARTICIPANT_EXPORT_HEADERS],
            row: [
                sections.extension.target,
                sections.extension.achievement,
                sections.extension.participants.target,
                ...participantRow(sections.extension.participants.achievement),
            ],
        },
        {
            title: 'Seed Production(q)*',
            headers: ['Target', 'Quantity', 'Value', ...PARTICIPANT_EXPORT_HEADERS],
            row: [
                sections.seedProduction.target,
                sections.seedProduction.quantity,
                sections.seedProduction.value,
                ...participantRow(sections.seedProduction.participants),
            ],
        },
        {
            title: 'Planting Material (in Lakh)*',
            headers: ['Target', 'Quantity', 'Value', ...PARTICIPANT_EXPORT_HEADERS],
            row: [
                sections.plantingMaterial.target,
                sections.plantingMaterial.quantity,
                sections.plantingMaterial.value,
                ...participantRow(sections.plantingMaterial.participants),
            ],
        },
        {
            title: 'Livestock Strains and Fish Fingerlings Produced (in Lakh)*',
            headers: ['Target', 'Quantity', 'Value', ...PARTICIPANT_EXPORT_HEADERS],
            row: [
                sections.livestock.target,
                sections.livestock.quantity,
                sections.livestock.value,
                ...participantRow(sections.livestock.participants),
            ],
        },
        {
            title: 'Soil, Water, Plants, Manures Samples Tested(in Lakh)',
            headers: ['Target', 'Achievement', ...PARTICIPANT_EXPORT_HEADERS],
            row: [
                sections.soilWater.target,
                sections.soilWater.achievement,
                ...participantRow(sections.soilWater.participants),
            ],
        },
        {
            title: '4. Publications Details',
            headers: ['Publication', 'No (Counts)'],
            rows:
                (sections.publications?.rows ?? []).length > 0
                    ? (sections.publications?.rows ?? []).map((r) => [r.publication, r.count])
                    : [['—', 0]],
        },
    ]
}

function getSafeFileLabel(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export const TechnicalAchievementSummary: React.FC = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { alert, AlertDialog } = useAlert()

    const { data: filterOptions, isLoading: isFilterLoading, error: filterError } = useTechnicalSummaryFilters(true)
    const canFilterByKvk = Boolean(filterOptions?.canFilterByKvk && user)

    const [fromDate, setFromDate] = useState<string>('')
    const [toDate, setToDate] = useState<string>('')
    const [selectedKvkId, setSelectedKvkId] = useState<string>('')
    const [appliedYear, setAppliedYear] = useState<number | null>(null)
    const [appliedKvkId, setAppliedKvkId] = useState<number | undefined>(undefined)
    const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null)

    const today = useMemo(() => new Date(), [])
    const todayIso = useMemo(() => {
        const y = today.getFullYear()
        const m = String(today.getMonth() + 1).padStart(2, '0')
        const d = String(today.getDate()).padStart(2, '0')
        return `${y}-${m}-${d}`
    }, [today])

    useEffect(() => {
        if (!filterOptions) return
        if (appliedYear !== null) return

        const defaultYear = filterOptions.defaultReportingYear || new Date().getFullYear()
        setAppliedYear(defaultYear)
    }, [filterOptions, appliedYear])

    const summaryParams = useMemo(() => {
        const year = appliedYear ?? filterOptions?.defaultReportingYear ?? new Date().getFullYear()
        const kvkId = canFilterByKvk ? appliedKvkId : undefined
        return { reportingYear: year, kvkId }
    }, [appliedYear, appliedKvkId, canFilterByKvk, filterOptions?.defaultReportingYear])

    const {
        data: summaryData,
        isLoading: isSummaryLoading,
        isFetching: isSummaryFetching,
        error: summaryError,
    } = useTechnicalSummary(summaryParams, Boolean(filterOptions))

    const handleApplyFilter = () => {
        if (!fromDate || !toDate) return
        const from = new Date(fromDate)
        const to = new Date(toDate)
        if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) return

        const year = from.getUTCFullYear()
        if (!Number.isInteger(year) || year <= 0) return

        setAppliedYear(year)
        setAppliedKvkId(canFilterByKvk && selectedKvkId ? Number(selectedKvkId) : undefined)
    }

    const sections = summaryData?.sections
    const appliedKvkLabel = useMemo(() => {
        if (!canFilterByKvk) return 'Scoped KVK'
        if (!appliedKvkId) return 'All KVKs'
        return filterOptions?.kvks.find((kvk) => kvk.kvkId === appliedKvkId)?.kvkName || `KVK ${appliedKvkId}`
    }, [canFilterByKvk, appliedKvkId, filterOptions?.kvks])

    /**
     * Single export handler — posts the section payload to the backend, which
     * produces the PDF/Excel/Word buffer from the shared template. Keeps
     * format identical to the prior client-side output and avoids the
     * html2pdf oklch() parsing issue that broke in production.
     */
    const handleExport = async (format: ExportFormat) => {
        if (!summaryData?.sections) return
        setExportingFormat(format)
        try {
            const tables = buildExportTables(summaryData.sections).map((table) => ({
                title: table.title,
                headers: table.headers,
                rows: table.rows ?? (table.row ? [table.row] : []),
            }))

            const blob = await exportApi.exportData({
                title: 'Technical Achievement Summary',
                headers: [],
                rows: [],
                format,
                templateKey: TAS_TEMPLATE_KEY,
                rawData: {
                    tables,
                    reportingYear: summaryData.reportingYear,
                    kvkLabel: appliedKvkLabel,
                },
            })

            const filename = `technical-achievement-summary-${summaryData.reportingYear}-${getSafeFileLabel(appliedKvkLabel)}.${FORMAT_EXT[format]}`
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = filename
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error(`Failed to generate technical summary ${format.toUpperCase()}:`, error)
            alert({
                title: 'Export Failed',
                message: `Failed to generate ${format.toUpperCase()} report. Please try again.`,
                variant: 'error',
            })
        } finally {
            setExportingFormat(null)
        }
    }

    return (
        <div className="bg-white rounded-2xl p-1">
            <div className="mb-6 flex items-center gap-4 px-6 pt-4">
                <button
                    type="button"
                    onClick={() => navigate('/forms/achievements')}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[#487749] border border-[#E0E0E0] rounded-xl hover:bg-[#F5F5F5] transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                </button>
            </div>

            <Card className="bg-[#FAF9F6]">
                <CardContent className="p-6">
                    <h2 className="text-[44px] font-semibold text-[#212121] mb-4 leading-tight">Technical Achievement Summary</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end mb-4">
                        <div className={isFilterLoading ? 'opacity-50 pointer-events-none' : ''}>
                            <DatePicker
                                label="From Date"
                                value={fromDate}
                                onChange={(v) => {
                                    setFromDate(v)
                                    if (toDate && v && new Date(v) > new Date(toDate)) {
                                        setToDate(v)
                                    }
                                }}
                                max={todayIso}
                                disabled={isFilterLoading}
                                placeholder="Select start date"
                            />
                        </div>

                        <div className={isFilterLoading ? 'opacity-50 pointer-events-none' : ''}>
                            <DatePicker
                                label="To Date"
                                value={toDate}
                                onChange={(v) => setToDate(v)}
                                min={fromDate || undefined}
                                max={todayIso}
                                disabled={isFilterLoading}
                                placeholder="Select end date"
                            />
                        </div>

                        {canFilterByKvk && (
                            <div>
                                <label className="block text-sm font-medium text-[#212121] mb-2">KVK</label>
                                <select
                                    value={selectedKvkId}
                                    onChange={(e) => setSelectedKvkId(e.target.value)}
                                    className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg bg-white"
                                    disabled={isFilterLoading}
                                >
                                    <option value="">All</option>
                                    {(filterOptions?.kvks || []).map((kvk) => (
                                        <option key={kvk.kvkId} value={kvk.kvkId}>{kvk.kvkName}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={handleApplyFilter}
                                className="px-4 py-2 bg-[#487749] text-white rounded-lg text-sm font-medium hover:bg-[#3d6540] transition-colors"
                            >
                                Filter
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3 mb-4">
                        {(
                            [
                                { format: 'pdf', label: 'PDF' },
                                { format: 'excel', label: 'Excel' },
                                { format: 'word', label: 'Word' },
                            ] as const
                        ).map(({ format, label }) => (
                            <button
                                key={format}
                                type="button"
                                onClick={() => handleExport(format)}
                                disabled={!summaryData || exportingFormat !== null}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E0E0E0] bg-white text-[#487749] text-sm font-medium hover:bg-[#F5F5F5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                {exportingFormat === format ? `${label}…` : label}
                            </button>
                        ))}
                    </div>

                    {(filterError || summaryError) && (
                        <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
                            {filterError instanceof Error
                                ? filterError.message
                                : summaryError instanceof Error
                                    ? summaryError.message
                                    : 'Failed to load technical achievement summary'}
                        </div>
                    )}

                    {(isSummaryLoading || isSummaryFetching) && (
                        <div className="mb-4 p-3 rounded-lg border border-[#E0E0E0] bg-white text-[#757575] text-sm">
                            Loading summary...
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1280px] border-collapse bg-white">
                                <thead className="text-[#2F3443]">
                                    <tr>
                                        <th colSpan={16} className={SECTION_TH}>OFT</th>
                                        <th colSpan={15} className={SECTION_TH}>FLD</th>
                                    </tr>
                                    <tr>
                                        <th colSpan={16} className={TH}>No. of Technologies Tested</th>
                                        <th colSpan={15} className={TH}>No. of Technologies Demonstrated</th>
                                    </tr>
                                    <tr>
                                        <th colSpan={4} className={TH}>No. of OFTs</th>
                                        <th colSpan={12} className={TH}>No. of Farmers</th>
                                        <th colSpan={3} className={TH}>Number of FLDs</th>
                                        <th colSpan={12} className={TH}>Number of Farmers</th>
                                    </tr>
                                    <tr>
                                        <th rowSpan={3} className={TH}>Target</th>
                                        <th rowSpan={3} className={TH}>Achievement</th>
                                        <th rowSpan={3} className={TH}>No. of Location</th>
                                        <th rowSpan={3} className={TH}>No. of Trials</th>
                                        <th rowSpan={3} className={TH}>Target</th>
                                        <th colSpan={11} className={TH}>Achievement</th>

                                        <th rowSpan={3} className={TH}>Target</th>
                                        <th rowSpan={3} className={TH}>Achievement</th>
                                        <th rowSpan={3} className={TH}>Area</th>
                                        <th rowSpan={3} className={TH}>Target</th>
                                        <th colSpan={11} className={TH}>Achievement</th>
                                    </tr>
                                    <tr>
                                        <ParticipantCategoryHeaders />
                                        <ParticipantCategoryHeaders />
                                    </tr>
                                    <tr>
                                        <ParticipantGenderHeaders />
                                        <ParticipantGenderHeaders />
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className={TD}>{formatInt(sections?.oft.target)}</td>
                                        <td className={TD}>{formatInt(sections?.oft.achievement)}</td>
                                        <td className={TD}>{formatInt(sections?.oft.noOfLocation)}</td>
                                        <td className={TD}>{formatInt(sections?.oft.noOfTrials)}</td>
                                        <td className={TD}>{formatInt(sections?.oft.farmers.target)}</td>
                                        <ParticipantCells value={sections?.oft.farmers.achievement || emptyParticipant} />

                                        <td className={TD}>{formatInt(sections?.fld.target)}</td>
                                        <td className={TD}>{formatInt(sections?.fld.achievement)}</td>
                                        <td className={TD}>{formatDecimal(sections?.fld.area)}</td>
                                        <td className={TD}>{formatInt(sections?.fld.farmers.target)}</td>
                                        <ParticipantCells value={sections?.fld.farmers.achievement || emptyParticipant} />
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1120px] border-collapse bg-white">
                                <thead className="text-[#2F3443]">
                                    <tr>
                                        <th colSpan={14} className={SECTION_TH}>Training</th>
                                        <th colSpan={14} className={SECTION_TH}>Extension Activities</th>
                                    </tr>
                                    <tr>
                                        <th colSpan={2} className={TH}>Number of Courses</th>
                                        <th colSpan={12} className={TH}>Number of Participants</th>
                                        <th colSpan={2} className={TH}>Number of Activities</th>
                                        <th colSpan={12} className={TH}>Number of Participants</th>
                                    </tr>
                                    <tr>
                                        <th rowSpan={3} className={TH}>Target</th>
                                        <th rowSpan={3} className={TH}>Achievement</th>
                                        <th rowSpan={3} className={TH}>Target</th>
                                        <th colSpan={11} className={TH}>Achievement</th>

                                        <th rowSpan={3} className={TH}>Target</th>
                                        <th rowSpan={3} className={TH}>Achievement</th>
                                        <th rowSpan={3} className={TH}>Target</th>
                                        <th colSpan={11} className={TH}>Achievement</th>
                                    </tr>
                                    <tr>
                                        <ParticipantCategoryHeaders />
                                        <ParticipantCategoryHeaders />
                                    </tr>
                                    <tr>
                                        <ParticipantGenderHeaders />
                                        <ParticipantGenderHeaders />
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className={TD}>{formatInt(sections?.training.target)}</td>
                                        <td className={TD}>{formatInt(sections?.training.achievement)}</td>
                                        <td className={TD}>{formatInt(sections?.training.participants.target)}</td>
                                        <ParticipantCells value={sections?.training.participants.achievement || emptyParticipant} />

                                        <td className={TD}>{formatInt(sections?.extension.target)}</td>
                                        <td className={TD}>{formatInt(sections?.extension.achievement)}</td>
                                        <td className={TD}>{formatInt(sections?.extension.participants.target)}</td>
                                        <ParticipantCells value={sections?.extension.participants.achievement || emptyParticipant} />
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1120px] border-collapse bg-white">
                                <thead className="text-[#2F3443]">
                                    <tr>
                                        <th colSpan={14} className={SECTION_TH}>Seed Production(q)*</th>
                                        <th colSpan={14} className={SECTION_TH}>Planting Material (in Lakh)*</th>
                                    </tr>
                                    <tr>
                                        <th rowSpan={3} className={TH}>Target</th>
                                        <th rowSpan={3} className={TH}>Quantity</th>
                                        <th rowSpan={3} className={TH}>Value</th>
                                        <th colSpan={11} className={TH}>Number of Participants</th>

                                        <th rowSpan={3} className={TH}>Target</th>
                                        <th rowSpan={3} className={TH}>Quantity</th>
                                        <th rowSpan={3} className={TH}>Value</th>
                                        <th colSpan={11} className={TH}>Number of Participants</th>
                                    </tr>
                                    <tr>
                                        <ParticipantCategoryHeaders />
                                        <ParticipantCategoryHeaders />
                                    </tr>
                                    <tr>
                                        <ParticipantGenderHeaders />
                                        <ParticipantGenderHeaders />
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className={TD}>{formatInt(sections?.seedProduction.target)}</td>
                                        <td className={TD}>{formatDecimal(sections?.seedProduction.quantity)}</td>
                                        <td className={TD}>{formatDecimal(sections?.seedProduction.value)}</td>
                                        <ParticipantCells value={sections?.seedProduction.participants || emptyParticipant} />

                                        <td className={TD}>{formatInt(sections?.plantingMaterial.target)}</td>
                                        <td className={TD}>{formatDecimal(sections?.plantingMaterial.quantity)}</td>
                                        <td className={TD}>{formatDecimal(sections?.plantingMaterial.value)}</td>
                                        <ParticipantCells value={sections?.plantingMaterial.participants || emptyParticipant} />
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1120px] border-collapse bg-white">
                                <thead className="text-[#2F3443]">
                                    <tr>
                                        <th colSpan={14} className={SECTION_TH}>Livestock Strains and Fish Fingerlings Produced (in Lakh)*</th>
                                        <th colSpan={13} className={SECTION_TH}>Soil, Water, Plants, Manures Samples Tested(in Lakh)</th>
                                    </tr>
                                    <tr>
                                        <th rowSpan={3} className={TH}>Target</th>
                                        <th rowSpan={3} className={TH}>Quantity</th>
                                        <th rowSpan={3} className={TH}>Value</th>
                                        <th colSpan={11} className={TH}>Number of Participants</th>

                                        <th rowSpan={3} className={TH}>Target</th>
                                        <th rowSpan={3} className={TH}>Achievement</th>
                                        <th colSpan={11} className={TH}>Number of Participants</th>
                                    </tr>
                                    <tr>
                                        <ParticipantCategoryHeaders />
                                        <ParticipantCategoryHeaders />
                                    </tr>
                                    <tr>
                                        <ParticipantGenderHeaders />
                                        <ParticipantGenderHeaders />
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className={TD}>{formatInt(sections?.livestock.target)}</td>
                                        <td className={TD}>{formatDecimal(sections?.livestock.quantity)}</td>
                                        <td className={TD}>{formatDecimal(sections?.livestock.value)}</td>
                                        <ParticipantCells value={sections?.livestock.participants || emptyParticipant} />

                                        <td className={TD}>{formatInt(sections?.soilWater.target)}</td>
                                        <td className={TD}>{formatInt(sections?.soilWater.achievement)}</td>
                                        <ParticipantCells value={sections?.soilWater.participants || emptyParticipant} />
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full max-w-2xl border-collapse bg-white">
                                <thead className="text-[#2F3443]">
                                    <tr>
                                        <th colSpan={2} className={SECTION_TH}>4. Publications Details</th>
                                    </tr>
                                    <tr>
                                        <th className={`${TH} text-left`}>Publication</th>
                                        <th className={TH}>No (Counts)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(sections?.publications?.rows ?? []).length > 0 ? (
                                        (sections?.publications?.rows ?? []).map((r) => (
                                            <tr key={`${r.publication}-${r.count}`}>
                                                <td className={TD_PUB}>{r.publication}</td>
                                                <td className={TD}>{formatInt(r.count)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={2} className={`${TD_PUB} text-center text-[#757575]`}>
                                                No publication records in this period.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <AlertDialog />
        </div>
    )
}
