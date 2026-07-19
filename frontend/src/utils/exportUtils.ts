/**
 * Export Utilities
 *
 * Centralized utilities for data export functionality
 * Handles CSV generation, file downloads, and header formatting
 */

/**
 * Format field name to readable header label
 * Example: "zoneName" -> "Zone Name"
 */
const CUSTOM_LABELS: Record<string, string> = {
    'rfMmDistrictNormal': 'RF (mm) district Normal',
    'rfMmDistrictReceived': 'RF (mm) district Received',
    'maxTemperature': 'Max. Temperature 0C',
    'minTemperature': 'Min. Temperature 0C',
    'kvkName': 'KVK',
    'nutritionGardenCropResults': 'Crop production & consumption (results)',
    // UI rename (labels only — data keys preserved):
    // Organisation/Organization -> Institute, University -> Host
    'orgName': 'Institute Name',
    'organizationName': 'Institute Name',
    'universityName': 'Host Name',
    'equipmentTypeName': 'Equipment Type',
    'companyBrandModel': 'Company / Brand / Model',
    'startYear': 'Reporting Year',
    'totalMale': 'Total Male',
    'totalFemale': 'Total Female',
    'nameOfHonbleMinister': 'Name of Dignitary',
    'webPortalName': 'Name of Web portal',
}

export function formatHeaderLabel(field: string): string {
    if (CUSTOM_LABELS[field]) return CUSTOM_LABELS[field]
    
    return field
        .charAt(0)
        .toUpperCase() + field
        .slice(1)
        .replace(/([A-Z])/g, ' $1')
        .trim()
}

/**
 * Generate CSV content from data
 */
export function generateCSV(
    headers: string[],
    rows: any[][],
    includeSerialNumber: boolean = true
): string {
    const headerRow = includeSerialNumber
        ? ['S.No.', ...headers]
        : headers

    const dataRows = rows.map((row, index) =>
        includeSerialNumber
            ? [index + 1, ...row]
            : row
    )

    return [
        headerRow,
        ...dataRows
    ]
        .map(row => row.map(cell => String(cell || '').replace(/,/g, ';'))) // Escape commas
        .map(row => row.join(','))
        .join('\n')
}

/**
 * Download file as blob
 */
export function downloadFile(
    blob: Blob,
    filename: string,
    mimeType?: string
): void {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    if (mimeType) {
        a.type = mimeType
    }
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
}

/**
 * Compact "YYYYMMDDHHmm" timestamp (no separators) for filenames, e.g. 202607120857
 */
export function getCompactDateTime(): string {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}`
}

/**
 * Generate filename from title: "<form-name>-<currentDateTime>.<extension>"
 */
export function generateFilename(title: string, extension: string): string {
    return `${title.toLowerCase().replace(/\s+/g, '-')}-${getCompactDateTime()}.${extension}`
}

/**
 * Resolve the most-specific selected scope level to a filename prefix
 * (mirrors the KVK > Org > District > State > Zone precedence used to
 * label aggregated reports elsewhere in the app).
 */
export function getReportScopeFilenamePrefix(scope?: {
    zoneIds?: number[]
    stateIds?: number[]
    districtIds?: number[]
    orgIds?: number[]
    kvkIds?: number[]
} | null): string {
    if (scope?.kvkIds?.length) return 'kvk-report'
    if (scope?.orgIds?.length) return 'org-report'
    if (scope?.districtIds?.length) return 'district-report'
    if (scope?.stateIds?.length) return 'state-report'
    if (scope?.zoneIds?.length) return 'zone-report'
    return 'all-kvk-report'
}

/**
 * File extension map for export formats
 */
export const EXPORT_EXTENSIONS: Record<string, string> = {
    pdf: 'pdf',
    excel: 'xlsx',
    word: 'docx',
    csv: 'csv',
}

/**
 * Get file extension for export format
 */
export function getExportExtension(format: string): string {
    return EXPORT_EXTENSIONS[format] || format
}
