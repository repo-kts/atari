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
const { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, BorderStyle, HeadingLevel, AlignmentType } = require('docx');

/**
 * Generates a PDF buffer from HTML using Puppeteer
 * Optimized for serverless environments (Vercel, AWS Lambda)
 * @param {string} html 
 * @returns {Promise<Buffer>}
 */
async function generatePDF(html) {
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
                    '--single-process', // Important for serverless
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
        await page.setContent(html, { 
            waitUntil: 'networkidle0',
            timeout: 30000 // 30 second timeout
        });
        
        const pdfBuffer = await page.pdf({
            format: 'A4',
            margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
            printBackground: true,
            preferCSSPageSize: false,
            timeout: 30000
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
async function generateExcel(title, headers, rows) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(title);

    // Style for the title
    worksheet.mergeCells('A1', String.fromCharCode(64 + headers.length + 1) + '1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = title;
    titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF487749' } };
    titleCell.alignment = { horizontal: 'center' };

    // Add empty row
    worksheet.addRow([]);

    // Add headers
    const headerRow = worksheet.addRow(['S.No.', ...headers]);
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
        const dataRow = worksheet.addRow([index + 1, ...row]);
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
async function generateWord(title, headers, rows) {
    const table = new Table({
        width: {
            size: 100,
            type: WidthType.PERCENTAGE,
        },
        rows: [
            // Header Row
            new TableRow({
                children: ['S.No.', ...headers].map(header => new TableCell({
                    children: [new Paragraph({ text: header, bold: true })],
                    shading: { fill: "487749", color: "FFFFFF" }
                })),
            }),
            // Data Rows
            ...rows.map((row, index) => new TableRow({
                children: [index + 1, ...row].map(text => new TableCell({
                    children: [new Paragraph({ text: String(text || '') })],
                })),
            })),
        ],
    });

    const doc = new Document({
        sections: [{
            properties: {},
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
    generateWord
};
