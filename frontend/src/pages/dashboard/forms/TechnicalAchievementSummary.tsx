import React, { useEffect, useMemo, useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/Card'
import { useAuth } from '@/contexts/AuthContext'
import { useTechnicalSummary, useTechnicalSummaryFilters } from '@/hooks/useTechnicalAchievementSummary'
import { useAlert } from '@/hooks/useAlert'
import { ParticipantAchievement, TechnicalAchievementSummaryData } from '@/services/technicalAchievementSummaryApi'
import { DatePicker } from '@/components/ui/date-picker'

const SECTION_TH = 'px-2 py-2 border border-[#D6D6D6] text-center font-semibold text-[13px] leading-tight bg-[#EEEEEE]'
const TH = 'px-1.5 py-1 border border-[#D6D6D6] text-center font-semibold text-[12px] leading-tight'
const TH_NOWRAP = `${TH} whitespace-nowrap`
const TD = 'px-1.5 py-1 border border-[#D6D6D6] text-center text-[12px] whitespace-nowrap'

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
    row: Array<string | number>
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
    ]
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
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
    const [isExportingPdf, setIsExportingPdf] = useState(false)
    const [isExportingExcel, setIsExportingExcel] = useState(false)

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

    const handleDownloadReport = async () => {
        if (!summaryData?.sections) return
        setIsExportingPdf(true)
        try {
            const html2pdfModule = await import('html2pdf.js')
            const html2pdf = html2pdfModule.default || html2pdfModule
            const tables = buildExportTables(summaryData.sections)

            const tableHtml = tables.map((table) => `
        <table class="tas-table">
          <thead>
            <tr><th class="table-title" colspan="${table.headers.length}">${escapeHtml(table.title)}</th></tr>
            <tr>${table.headers.map((header) => `<th>${escapeHtml(String(header))}</th>`).join('')}</tr>
          </thead>
          <tbody>
            <tr>${table.row.map((value) => `<td>${escapeHtml(String(value ?? ''))}</td>`).join('')}</tr>
          </tbody>
        </table>
      `).join('')

            const reportElement = document.createElement('div')
            reportElement.innerHTML = `
        <div class="tas-report">
          <style>
            .tas-report { font-family: Arial, sans-serif; padding: 18px; color: #111; }
            .tas-title { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
            .tas-meta { font-size: 12px; margin-bottom: 2px; }
            .tas-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            .tas-table th, .tas-table td { border: 1px solid #000; font-size: 9px; padding: 3px 4px; text-align: center; }
            .tas-table .table-title { background: #f2f2f2; font-size: 11px; font-weight: 700; }
          </style>
          <div class="tas-title">Technical Achievement Summary</div>
          <div class="tas-meta">Reporting Year: ${escapeHtml(String(summaryData.reportingYear))}</div>
          <div class="tas-meta">KVK: ${escapeHtml(appliedKvkLabel)}</div>
          ${tableHtml}
        </div>
      `

            const filename = `technical-achievement-summary-${summaryData.reportingYear}-${getSafeFileLabel(appliedKvkLabel)}.pdf`
            await html2pdf()
                .set({
                    margin: 0.2,
                    filename,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true },
                    jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' },
                })
                .from(reportElement)
                .save()
        } catch (error) {
            console.error('Failed to generate technical summary PDF:', error)
            alert({
                title: 'Export Failed',
                message: 'Failed to generate PDF report. Please try again.',
                variant: 'error',
            })
        } finally {
            setIsExportingPdf(false)
        }
    }

    const handleDownloadExcel = async () => {
        if (!summaryData?.sections) return
        setIsExportingExcel(true)
        try {
            const XLSX = await import('xlsx')
            const tables = buildExportTables(summaryData.sections)
            const sheet = XLSX.utils.aoa_to_sheet([])
            const merges: Array<{ s: { r: number; c: number }; e: { r: number; c: number } }> = []
            const maxColumns = Math.max(...tables.map((table) => table.headers.length))
            let row = 0

            XLSX.utils.sheet_add_aoa(sheet, [['Technical Achievement Summary']], { origin: { r: row, c: 0 } })
            merges.push({ s: { r: row, c: 0 }, e: { r: row, c: maxColumns - 1 } })
            row += 1

            XLSX.utils.sheet_add_aoa(sheet, [[`Reporting Year: ${summaryData.reportingYear}`]], { origin: { r: row, c: 0 } })
            merges.push({ s: { r: row, c: 0 }, e: { r: row, c: maxColumns - 1 } })
            row += 1

            XLSX.utils.sheet_add_aoa(sheet, [[`KVK: ${appliedKvkLabel}`]], { origin: { r: row, c: 0 } })
            merges.push({ s: { r: row, c: 0 }, e: { r: row, c: maxColumns - 1 } })
            row += 2

            tables.forEach((table) => {
                XLSX.utils.sheet_add_aoa(sheet, [[table.title]], { origin: { r: row, c: 0 } })
                merges.push({ s: { r: row, c: 0 }, e: { r: row, c: table.headers.length - 1 } })
                row += 1

                XLSX.utils.sheet_add_aoa(sheet, [table.headers], { origin: { r: row, c: 0 } })
                row += 1

                XLSX.utils.sheet_add_aoa(sheet, [table.row], { origin: { r: row, c: 0 } })
                row += 2
            })

            sheet['!merges'] = merges
            sheet['!cols'] = Array.from({ length: maxColumns }, () => ({ wch: 12 }))

            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, sheet, 'Technical Summary')
            const filename = `technical-achievement-summary-${summaryData.reportingYear}-${getSafeFileLabel(appliedKvkLabel)}.xlsx`
            XLSX.writeFile(workbook, filename)
        } catch (error) {
            console.error('Failed to generate technical summary Excel:', error)
            alert({
                title: 'Export Failed',
                message: 'Failed to generate Excel report. Please try again.',
                variant: 'error',
            })
        } finally {
            setIsExportingExcel(false)
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
                        <button
                            type="button"
                            onClick={handleDownloadReport}
                            disabled={!summaryData || isExportingPdf}
                            className="px-4 py-2 bg-[#487749] text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isExportingPdf ? 'Generating PDF...' : 'Download Report'}
                        </button>
                        <button
                            type="button"
                            onClick={handleDownloadExcel}
                            disabled={!summaryData || isExportingExcel}
                            className="px-4 py-2 bg-[#487749] text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isExportingExcel ? 'Generating Excel...' : 'Download Excel'}
                        </button>
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
                    </div>
                </CardContent>
            </Card>
            <AlertDialog />
        </div>
    )
}
