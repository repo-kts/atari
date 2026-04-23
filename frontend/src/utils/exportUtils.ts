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
 * Generate filename from title
 */
export function generateFilename(title: string, extension: string): string {
    return `${title.toLowerCase().replace(/\s+/g, '-')}.${extension}`
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
