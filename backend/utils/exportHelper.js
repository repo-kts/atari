// Use puppeteer-core for serverless compatibility
let puppeteer;
let chromium;

// Try to load serverless-optimized chromium first (for Vercel/AWS Lambda)
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT;

if (isServerless) {
    try {
        chromium = require('@sparticuz/chromium');
        puppeteer = require('puppeteer-core');
        // Set chromium font settings for serverless
        chromium.setGraphicsMode(false);
    } catch (e) {
        console.warn('Serverless chromium not available, falling back to regular puppeteer:', e.message);
        puppeteer = require('puppeteer');
    }
} else {
    // Local development: use regular puppeteer
    try {
        puppeteer = require('puppeteer');
    } catch (err) {
        console.error('Failed to load puppeteer:', err);
        throw new Error('Puppeteer is not installed. Please run: npm install puppeteer');
    }
}

const ExcelJS = require('exceljs');
const { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, BorderStyle, HeadingLevel, AlignmentType, PageOrientation } = require('docx');
const { reportConfig } = require('../config/reportConfig.js');

/**
 * Builds a unique "ATARI-YYYYMMDDHHMISS" serial so office staff can tell two
 * PDF exports apart even if generated seconds apart.
 * @returns {string}
 */
function generatePdfSerialNumber() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`
        + `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    return `ATARI-${stamp}`;
}

/**
 * Compact "YYYYMMDDHHMI" timestamp (no separators) for download filenames,
 * e.g. 202607120857.
 * @returns {string}
 */
function getCompactDateTime() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}`;
}

/**
 * Resolve the most-specific populated scope level to a filename prefix
 * (KVK > Org > District > State > Zone, matching reportService's report-type
 * precedence), for aggregated report downloads.
 * @param {{ zoneIds?: number[], stateIds?: number[], districtIds?: number[], orgIds?: number[], kvkIds?: number[] }} [scope]
 * @returns {string}
 */
function getReportScopeFilenamePrefix(scope) {
    if (scope?.kvkIds?.length) return 'kvk-report';
    if (scope?.orgIds?.length) return 'org-report';
    if (scope?.districtIds?.length) return 'district-report';
    if (scope?.stateIds?.length) return 'state-report';
    if (scope?.zoneIds?.length) return 'zone-report';
    return 'all-kvk-report';
}

/**
 * Generates a PDF buffer from HTML using Puppeteer
 * Optimized for serverless environments (Vercel, AWS Lambda)
 * @param {string} html
 * @returns {Promise<Buffer>}
 */
async function generatePDF(html, options = {}) {
    const isLandscape = Boolean(options.landscape);
    let browser;
    
    try {
        // Serverless environment: use chromium
        if (isServerless && chromium && puppeteer) {
            browser = await puppeteer.launch({
                args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(),
                headless: chromium.headless,
            });
        } else {
            // Local development: use regular puppeteer
            browser = await puppeteer.launch({
                headless: 'new',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--disable-gpu',
                    // '--single-process', // Removed for local stability on Windows
                ]
            });
        }
    } catch (error) {
        console.error('Failed to launch browser:', error);
        // If chromium is not available in serverless, provide helpful error
        if (isServerless && !chromium) {
            throw new Error('PDF generation requires @sparticuz/chromium in serverless environments. Please install: npm install @sparticuz/chromium puppeteer-core');
        }
        throw new Error(`Could not launch browser: ${error.message}`);
    }

    try {
        const page = await browser.newPage();

        // Log HTML size for debugging
        if (html) {
            console.log(`Generating PDF for HTML of size: ${Math.round(html.length / 1024)} KB`);
        }

        // Unique per-generation serial so office staff can tell two PDFs apart
        // even if the content is otherwise identical. PDF-only by construction —
        // Excel/Word exports never call this function. Stamped directly into the
        // HTML (not Puppeteer's headerTemplate, which repeats on every page) as
        // the first element in <body>, so it falls on page 1 only.
        const serialNumber = generatePdfSerialNumber();
        const serialStampHtml = `<div style="position:absolute; top:4mm; right:6mm; font-size:8px; color:#444444; font-family: Arial, Helvetica, sans-serif; z-index:9999;">${serialNumber}</div>`;
        const htmlWithSerial = /<body[^>]*>/i.test(html)
            ? html.replace(/<body([^>]*)>/i, (match, attrs) => `<body${attrs}>${serialStampHtml}`)
            : `${serialStampHtml}${html || ''}`;

        await page.setContent(htmlWithSerial, {
            waitUntil: 'domcontentloaded',
            timeout: 60000 // Increased timeout for larger content
        });
        // Wait for any <img> (e.g. embedded OFT result photos via presigned URLs)
        // to finish loading before rendering — domcontentloaded does not wait for
        // images. Bounded so a broken/slow image never hangs PDF generation (#241).
        try {
            await page.evaluate(async () => {
                const imgs = Array.from(document.images || []);
                await Promise.all(imgs.map((img) => {
                    if (img.complete) return null;
                    return new Promise((resolve) => {
                        const done = () => resolve();
                        img.addEventListener('load', done, { once: true });
                        img.addEventListener('error', done, { once: true });
                        setTimeout(done, 8000);
                    });
                }));
            });
        } catch (_) {}
        // Ensure print media so header/footer render consistently
        try {
            await page.emulateMediaType('print');
        } catch (_) {}
        
        const pdfFooterCfg = reportConfig?.pdfFooter || {};
        const footerTextTemplate = pdfFooterCfg.textTemplate || 'Page {current} of {total}';
        const footerFontSizePx = Number(pdfFooterCfg.fontSize || 9);
        const footerAlign = pdfFooterCfg.align || 'center';
        const footerColor = pdfFooterCfg.color || { r: 90, g: 90, b: 90 };
        const footerColorCss = `rgb(${footerColor.r ?? 90}, ${footerColor.g ?? 90}, ${footerColor.b ?? 90})`;
        const justify = footerAlign === 'left' ? 'flex-start' : (footerAlign === 'right' ? 'flex-end' : 'center');
        // bottom margin should account for footer height; default to 16mm as before
        const bottomMarginMm = Math.max(12, Number((reportConfig?.pdfFooter?.bottomMarginPt || 24) / 2.835)) || 16;

        // Map template to puppeteer footer placeholders
        // Supports common templates like "Page {current} of {total}"
        const footerHtmlSafe = footerTextTemplate
            .replace('{current}', '<span class="pageNumber"></span>')
            .replace('{total}', '<span class="totalPages"></span>');

        const pdfBuffer = await page.pdf({
            format: 'A4',
            landscape: isLandscape,
            printBackground: true,
            preferCSSPageSize: false,
            displayHeaderFooter: true,
            headerTemplate: `
                <div style="font-size:0;"></div>
            `,
            footerTemplate: `
                <div style="font-size:${footerFontSizePx}px; width:100%; padding:0 10mm 4mm 10mm; box-sizing:border-box;">
                  <div style="width:100%; color:${footerColorCss}; display:flex; justify-content:${justify};">
                    ${footerHtmlSafe}
                  </div>
                </div>
            `,
            margin: { top: '6mm', right: '6mm', bottom: `${bottomMarginMm}mm`, left: '6mm' },
            timeout: 60000 // Increased timeout for PDF rendering
        });
        
        await browser.close();
        return pdfBuffer;
    } catch (error) {
        if (browser) {
            await browser.close().catch(() => {}); // Ignore close errors
        }
        console.error('PDF generation error:', error);
        throw error;
    }
}

/**
 * Generates an Excel buffer from data
 * @param {string} title 
 * @param {string[]} headers 
 * @param {any[][]} rows 
 * @returns {Promise<Buffer>}
 */
async function generateExcel(title, headers, rows, options = {}) {
    // Some template-based exports already include their own serial column
    // (e.g. "Sr.No.") in headers/rows. Pass includeSerialColumn:false so we
    // don't prepend a second "S.No." column and end up with two serial columns.
    const includeSerial = options.includeSerialColumn !== false;
    const workbook = new ExcelJS.Workbook();
    // Excel worksheet (tab) names cannot contain * ? : \ / [ ] and are capped at
    // 31 chars — titles like "RAWE/FET programme" would otherwise throw. Sanitize
    // for the tab name only; the original title is still shown in the header cell.
    const sheetName = (String(title || 'Sheet1')
        .replace(/[*?:\\/[\]]/g, '-')
        .trim()
        .slice(0, 31)) || 'Sheet1';
    const worksheet = workbook.addWorksheet(sheetName);

    // Style for the title
    const totalCols = headers.length + (includeSerial ? 1 : 0);
    worksheet.mergeCells('A1', String.fromCharCode(64 + totalCols) + '1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = title;
    titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF487749' } };
    titleCell.alignment = { horizontal: 'center' };

    // Add empty row
    worksheet.addRow([]);

    // Add headers
    const headerRow = worksheet.addRow(includeSerial ? ['S.No.', ...headers] : [...headers]);
    headerRow.eachCell((cell) => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF487749' }
        };
        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });

    // Add data rows
    rows.forEach((row, index) => {
        const dataRow = worksheet.addRow(includeSerial ? [index + 1, ...row] : [...row]);
        dataRow.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });
        if (index % 2 === 1) {
            dataRow.eachCell((cell) => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFF9FBF9' }
                };
            });
        }
    });

    // Auto-fit columns
    worksheet.columns.forEach(column => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
            const columnLength = cell.value ? cell.value.toString().length : 10;
            if (columnLength > maxLength) {
                maxLength = columnLength;
            }
        });
        column.width = maxLength < 10 ? 10 : maxLength + 2;
    });

    return await workbook.xlsx.writeBuffer();
}

/**
 * Generates a Word buffer from data
 * @param {string} title 
 * @param {string[]} headers 
 * @param {any[][]} rows 
 * @returns {Promise<Buffer>}
 */
async function generateWord(title, headers, rows, options = {}) {
    // See generateExcel: pass includeSerialColumn:false when headers/rows already
    // carry their own serial column, to avoid a duplicate "S.No." column.
    const includeSerial = options.includeSerialColumn !== false;
    const headerCells = includeSerial ? ['S.No.', ...headers] : [...headers];
    const table = new Table({
        width: {
            size: 100,
            type: WidthType.PERCENTAGE,
        },
        rows: [
            // Header Row
            new TableRow({
                children: headerCells.map(header => new TableCell({
                    children: [new Paragraph({ text: header, bold: true })],
                    shading: { fill: "487749", color: "FFFFFF" }
                })),
            }),
            // Data Rows
            ...rows.map((row, index) => new TableRow({
                children: (includeSerial ? [index + 1, ...row] : [...row]).map(text => new TableCell({
                    children: [new Paragraph({ text: String(text || '') })],
                })),
            })),
        ],
    });

    const doc = new Document({
        sections: [{
            properties: {
                page: {
                    size: {
                        orientation: PageOrientation.LANDSCAPE,
                    },
                },
            },
            children: [
                new Paragraph({
                    text: title,
                    heading: HeadingLevel.HEADING_1,
                    alignment: AlignmentType.CENTER,
                }),
                new Paragraph({ text: "" }), // Spacing
                table,
            ],
        }],
    });

    return await Packer.toBuffer(doc);
}

module.exports = {
    generatePDF,
    generateExcel,
    generateWord,
    getCompactDateTime,
    getReportScopeFilenamePrefix
};
