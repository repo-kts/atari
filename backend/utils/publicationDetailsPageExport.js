const ExcelJS = require('exceljs');
const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
    AlignmentType,
    PageOrientation,
} = require('docx');

const {
    buildPublicationGroups,
} = require('../services/reports/formsTemplate/achievementTemplates/publicationDetailsDetailedTemplate.js');

const MAX_COLS = 10;
const FONT_HP = 13;

function allBorders() {
    const side = { style: 'thin', color: { argb: 'FF000000' } };
    return { top: side, left: side, bottom: side, right: side };
}

function styleRow(row, options = {}) {
    row.eachCell((cell, columnNumber) => {
        cell.border = allBorders();
        cell.font = { size: 8, bold: Boolean(options.bold) };
        cell.alignment = {
            horizontal: columnNumber === 1 ? 'center' : 'left',
            vertical: 'top',
            wrapText: true,
        };
        if (options.fill) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: options.fill } };
        }
    });
}

function publicationHeaders(publicationGroup) {
    return ['Sl. No.', ...publicationGroup.columns.map((column) => column.label)];
}

function publicationRowValues(publicationGroup, row) {
    return [row.sl, ...publicationGroup.columns.map((column) => row[column.key])];
}

async function generatePublicationDetailsExcelBuffer(reportTitle, rawData) {
    const { groups } = buildPublicationGroups(rawData);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Publications');

    worksheet.mergeCells(1, 1, 1, MAX_COLS);
    const titleCell = worksheet.getCell(1, 1);
    titleCell.value = reportTitle || 'Publication Details';
    titleCell.font = { bold: true, size: 12 };
    titleCell.alignment = { horizontal: 'center' };
    worksheet.addRow([]);

    if (groups.length === 0) {
        worksheet.addRow(['No data found']);
        return await workbook.xlsx.writeBuffer();
    }

    for (const kvkGroup of groups) {
        const kvkRow = worksheet.addRow([`KVK: ${kvkGroup.kvkName}`]);
        worksheet.mergeCells(kvkRow.number, 1, kvkRow.number, MAX_COLS);
        kvkRow.getCell(1).font = { bold: true, size: 10 };
        kvkRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCE6F1' } };

        for (const publicationGroup of kvkGroup.publicationGroups) {
            const columnCount = publicationGroup.columns.length + 1;
            const groupRow = worksheet.addRow([`Publication Item: ${publicationGroup.publicationItem}`]);
            worksheet.mergeCells(groupRow.number, 1, groupRow.number, columnCount);
            groupRow.getCell(1).font = { bold: true, size: 9 };
            groupRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F3F3' } };

            styleRow(worksheet.addRow(publicationHeaders(publicationGroup)), { bold: true, fill: 'FFE8E8E8' });
            for (const row of publicationGroup.rows) {
                styleRow(worksheet.addRow(publicationRowValues(publicationGroup, row)));
            }
            worksheet.addRow([]);
        }
    }

    worksheet.getColumn(1).width = 8;
    for (let index = 2; index <= MAX_COLS; index += 1) {
        worksheet.getColumn(index).width = 20;
    }

    return await workbook.xlsx.writeBuffer();
}

function textRun(text, options = {}) {
    return new TextRun({ text: String(text ?? ''), size: options.size || FONT_HP, bold: Boolean(options.bold) });
}

function wordCell(text, options = {}) {
    return new TableCell({
        children: [new Paragraph({
            alignment: options.alignment || AlignmentType.LEFT,
            spacing: { before: 0, after: 0 },
            children: [textRun(text, options)],
        })],
        shading: options.fill ? { fill: options.fill } : undefined,
    });
}

function publicationTable(publicationGroup) {
    const header = new TableRow({
        tableHeader: true,
        children: publicationHeaders(publicationGroup).map((label, index) => wordCell(label, {
            bold: true,
            fill: 'E8E8E8',
            alignment: index === 0 ? AlignmentType.CENTER : AlignmentType.LEFT,
        })),
    });

    const rows = publicationGroup.rows.map((row) => new TableRow({
        children: publicationRowValues(publicationGroup, row).map((value, index) => wordCell(value, {
            alignment: index === 0 ? AlignmentType.CENTER : AlignmentType.LEFT,
        })),
    }));

    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [header, ...rows],
    });
}

async function generatePublicationDetailsWordBuffer(reportTitle, rawData) {
    const { groups } = buildPublicationGroups(rawData);
    const children = [
        new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: reportTitle || 'Publication Details', bold: true, size: 18 })],
        }),
        new Paragraph({ text: '' }),
    ];

    if (groups.length === 0) {
        children.push(new Paragraph({ children: [textRun('No data found')] }));
    } else {
        for (const kvkGroup of groups) {
            children.push(new Paragraph({
                spacing: { before: 120, after: 40 },
                children: [new TextRun({ text: `KVK: ${kvkGroup.kvkName}`, bold: true, size: 16 })],
            }));

            for (const publicationGroup of kvkGroup.publicationGroups) {
                children.push(new Paragraph({
                    spacing: { before: 80, after: 30 },
                    children: [new TextRun({
                        text: `Publication Item: ${publicationGroup.publicationItem}`,
                        bold: true,
                        size: 14,
                    })],
                }));
                children.push(publicationTable(publicationGroup));
                children.push(new Paragraph({ text: '' }));
            }
        }
    }

    const document = new Document({
        styles: { default: { document: { run: { size: FONT_HP } } } },
        sections: [{
            properties: { page: { size: { orientation: PageOrientation.LANDSCAPE } } },
            children,
        }],
    });

    return await Packer.toBuffer(document);
}

module.exports = {
    generatePublicationDetailsExcelBuffer,
    generatePublicationDetailsWordBuffer,
};
