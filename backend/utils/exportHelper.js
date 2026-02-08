const puppeteer = require('puppeteer');
const ExcelJS = require('exceljs');
const { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, BorderStyle, HeadingLevel, AlignmentType } = require('docx');

/**
 * Generates a PDF buffer from HTML using Puppeteer
 * @param {string} html 
 * @returns {Promise<Buffer>}
 */
async function generatePDF(html) {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: { top: '20mm', right: '10mm', bottom: '20mm', left: '10mm' },
        printBackground: true
    });
    await browser.close();
    return pdfBuffer;
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
