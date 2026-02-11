const puppeteer = require('puppeteer');
const ExcelJS = require('exceljs');
const { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, BorderStyle, HeadingLevel, AlignmentType } = require('docx');

/**
 * Generates a PDF buffer from HTML using Puppeteer
 * @param {string} html 
 * @returns {Promise<Buffer>}
 */
async function generatePDF(html) {
    let browser;
    try {
        // Try to launch with default settings first
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu'
            ]
        });
    } catch (error) {
        // If launch fails, try to install Chrome and retry
        console.log('Chrome not found, attempting to install...');
        try {
            const { install } = require('@puppeteer/browsers');
            await install({
                browser: 'chrome',
                path: require('os').homedir() + '/.cache/puppeteer'
            });
            browser = await puppeteer.launch({
                headless: 'new',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--disable-gpu'
                ]
            });
        } catch (installError) {
            console.error('Failed to install Chrome:', installError);
            throw new Error('Could not launch Chrome browser. Please ensure Chrome is installed or run: npx puppeteer browsers install chrome');
        }
    }

    try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({
            format: 'A4',
            margin: { top: '20mm', right: '10mm', bottom: '20mm', left: '10mm' },
            printBackground: true
        });
        await browser.close();
        return pdfBuffer;
    } catch (error) {
        if (browser) {
            await browser.close();
        }
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
