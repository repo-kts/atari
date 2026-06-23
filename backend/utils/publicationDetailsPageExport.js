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

const { buildPublicationGroups } = require('../services/reports/formsTemplate/achievementTemplates/publicationDetailsDetailedTemplate.js');

const HEADERS = [
    'Sl. No.',
    'Category',
    'Authors',
    'Title',
    'Journal Name',
    'Volume',
    'Issue',
    'Page No.',
    'Year',
    'Impact Factor',
];
const COLS = HEADERS.length;
const FONT_HP = 13; // ~6.5pt, matches the PDF

function rowVals(r) {
    return [r.sl, r.category, r.authors, r.title, r.journal, r.vol, r.issue, r.pageNo, r.year, r.impact];
}

// ---------------- Excel ----------------

function allBorders() {
    const s = { style: 'thin', color: { argb: 'FF000000' } };
    return { top: s, left: s, bottom: s, right: s };
}

function styleRow(row, opts = {}) {
    row.eachCell((c, col) => {
        c.border = allBorders();
        c.font = { size: 8, bold: Boolean(opts.bold) };
        c.alignment = { horizontal: col === 1 ? 'center' : 'left', vertical: 'top', wrapText: true };
        if (opts.fill) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: opts.fill } };
    });
}

async function generatePublicationDetailsExcelBuffer(reportTitle, rawData) {
    const { groups } = buildPublicationGroups(rawData);
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Publications');

    ws.mergeCells(1, 1, 1, COLS);
    const t1 = ws.getCell(1, 1);
    t1.value = reportTitle || 'Publication Details';
    t1.font = { bold: true, size: 12 };
    t1.alignment = { horizontal: 'center' };
    ws.addRow([]);

    if (groups.length === 0) {
        ws.addRow(['No data found']);
        return await wb.xlsx.writeBuffer();
    }

    groups.forEach((g) => {
        const kr = ws.addRow([g.kvkName]);
        ws.mergeCells(kr.number, 1, kr.number, COLS);
        kr.getCell(1).font = { bold: true, size: 10 };
        kr.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCE6F1' } };
        kr.getCell(1).alignment = { horizontal: 'left' };

        styleRow(ws.addRow(HEADERS), { bold: true, fill: 'FFE8E8E8' });
        g.rows.forEach((r) => styleRow(ws.addRow(rowVals(r))));
        ws.addRow([]);
    });

    const widths = [6, 18, 18, 22, 18, 8, 8, 8, 8, 12];
    widths.forEach((w, i) => { ws.getColumn(i + 1).width = w; });

    return await wb.xlsx.writeBuffer();
}

// ---------------- Word ----------------

function tx(text, opts = {}) {
    return new TextRun({ text: String(text ?? ''), size: opts.size || FONT_HP, bold: Boolean(opts.bold) });
}

function wcell(text, opts = {}) {
    return new TableCell({
        children: [new Paragraph({
            alignment: opts.alignment || AlignmentType.LEFT,
            spacing: { before: 0, after: 0 },
            children: [tx(text, opts)],
        })],
        shading: opts.fill ? { fill: opts.fill } : undefined,
    });
}

function headerRow() {
    return new TableRow({
        tableHeader: true,
        children: HEADERS.map((h, i) => wcell(h, { bold: true, fill: 'E8E8E8', alignment: i === 0 ? AlignmentType.CENTER : AlignmentType.LEFT })),
    });
}

function dataRow(r) {
    return new TableRow({
        children: rowVals(r).map((v, i) => wcell(v, { alignment: i === 0 ? AlignmentType.CENTER : AlignmentType.LEFT })),
    });
}

function groupTable(g) {
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [headerRow(), ...g.rows.map(dataRow)],
    });
}

async function generatePublicationDetailsWordBuffer(reportTitle, rawData) {
    const { groups } = buildPublicationGroups(rawData);

    const children = [
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: reportTitle || 'Publication Details', bold: true, size: 18 })] }),
        new Paragraph({ text: '' }),
    ];

    if (groups.length === 0) {
        children.push(new Paragraph({ children: [tx('No data found')] }));
    } else {
        groups.forEach((g) => {
            children.push(new Paragraph({
                spacing: { before: 120, after: 40 },
                children: [new TextRun({ text: g.kvkName, bold: true, size: 16 })],
            }));
            children.push(groupTable(g));
            children.push(new Paragraph({ text: '' }));
        });
    }

    const doc = new Document({
        styles: { default: { document: { run: { size: FONT_HP } } } },
        sections: [{
            properties: { page: { size: { orientation: PageOrientation.PORTRAIT } } },
            children,
        }],
    });

    return await Packer.toBuffer(doc);
}

module.exports = {
    generatePublicationDetailsExcelBuffer,
    generatePublicationDetailsWordBuffer,
};
