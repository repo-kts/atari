// Types imported for type checking only

// Dynamic import for xlsx (will be installed)
let XLSX: any = null

const loadXLSX = async () => {
    if (!XLSX) {
        XLSX = await import('xlsx')
    }
    return XLSX
}

// Dynamic import for html2pdf (will be installed)
let html2pdf: any = null

const loadHtml2Pdf = async () => {
    if (!html2pdf) {
        html2pdf = await import('html2pdf.js')
    }
    return html2pdf.default || html2pdf
}

interface ExportOptions {
    filename?: string
    title?: string
}

export const exportService = {
    exportToPDF: async (
        data: any[],
        type: 'kvk' | 'bank' | 'staff',
        options?: ExportOptions
    ): Promise<void> => {
        try {
            const html2pdfLib = await loadHtml2Pdf()

            // Generate HTML table
            const tableHtml = generateTableHTML(data, type, options?.title)

            const opt = {
                margin: 0.5,
                filename: options?.filename || `${type}-export.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 1.5 },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' },
            }

            await html2pdfLib().set(opt).from(tableHtml).save()
        } catch (error) {
            console.error('Error exporting to PDF:', error)
            throw error
        }
    },

    exportToExcel: async (
        data: any[],
        type: 'kvk' | 'bank' | 'staff',
        filename?: string
    ): Promise<void> => {
        try {
            const XLSXLib = await loadXLSX()

            // Flatten nested objects for Excel
            const flattenedData = data.map(item => flattenObject(item))

            const ws = XLSXLib.utils.json_to_sheet(flattenedData)
            const wb = XLSXLib.utils.book_new()
            XLSXLib.utils.book_append_sheet(wb, ws, 'Sheet1')
            XLSXLib.writeFile(wb, `${filename || `${type}-export`}.xlsx`)
        } catch (error) {
            console.error('Error exporting to Excel:', error)
            throw error
        }
    },
}

function generateTableHTML(
    data: any[],
    type: 'kvk' | 'bank' | 'staff',
    title?: string
): string {
    if (data.length === 0) {
        return '<div>No data to export</div>'
    }

    const headers = getHeaders(type, data[0])
    const rows = data.map(item => getRowData(type, item, headers))

    let tableHTML = `
        <div style="font-family: Arial, sans-serif; padding: 10px; font-size: 9px;">
            ${title ? `<h2 style="text-align: center; color: #10b981; margin-bottom: 10px; font-size: 14px;">${title}</h2>` : ''}
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd; font-size: 8px;">
                <thead>
                    <tr style="background-color: #10b981; color: white;">
                        ${headers.map(h => `<th style="padding: 6px; text-align: left; border: 1px solid #ddd; font-size: 8px;">${h}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${rows.map(row => `
                        <tr>
                            ${row.map(cell => `<td style="padding: 4px; border: 1px solid #ddd; font-size: 8px;">${cell || '-'}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `

    return tableHTML
}

function getHeaders(type: string, sampleItem: any): string[] {
    switch (type) {
        case 'kvk':
            return [
                'KVK Name',
                'State',
                'District',
                'University',
                'Mobile',
                'Email',
                'Address',
                'Organization',
                'Sanction Year',
            ]
        case 'bank':
            return [
                'KVK Name',
                'Account Type',
                'Account Name',
                'Bank Name',
                'Location',
                'Account Number',
            ]
        case 'staff':
            return [
                'Staff Name',
                'KVK Name',
                'Post',
                'Mobile',
                'Email',
                'Discipline',
                'Designation',
                'Job Type',
                'Date of Joining',
            ]
        default:
            return Object.keys(sampleItem)
    }
}

function getRowData(type: string, item: any, headers: string[]): any[] {
    switch (type) {
        case 'kvk':
            return [
                item.kvk_name || '-',
                item.state?.state_name || '-',
                item.district?.district_name || '-',
                item.university?.university_name || '-',
                item.mobile || '-',
                item.email || '-',
                item.address || '-',
                item.org_name || '-',
                item.sanction_year || '-',
            ]
        case 'bank':
            return [
                item.kvk?.kvk_name || '-',
                item.account_type || '-',
                item.account_name || '-',
                item.bank_name || '-',
                item.location || '-',
                item.account_number || '-',
            ]
        case 'staff':
            return [
                item.staff_name || '-',
                item.kvks?.kvk_name || '-',
                item.post?.post_name || '-',
                item.mobile || '-',
                item.email || '-',
                item.discipline || '-',
                item.designation || '-',
                item.job_type || '-',
                item.date_of_joining || '-',
            ]
        default:
            return headers.map(h => item[h] || '-')
    }
}

function flattenObject(obj: any, prefix = ''): any {
    const flattened: any = {}

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const newKey = prefix ? `${prefix}.${key}` : key
            if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key]) && !(obj[key] instanceof Date)) {
                Object.assign(flattened, flattenObject(obj[key], newKey))
            } else {
                flattened[newKey] = obj[key]
            }
        }
    }

    return flattened
}
