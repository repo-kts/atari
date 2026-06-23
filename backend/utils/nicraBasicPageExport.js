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

const { buildNicraBasicGroups } = require('../services/reports/formsTemplate/projectTemplates/nicraBasicTemplate.js');

const TITLE = 'NICRA — Basic Information';
const TOTAL_COLS = 10;
const FONT_HP = 13; // ~6.6pt, matches the PDF

const SUB_HEADERS = [
    'RF (mm) district Normal',
    'RF (mm) district Received',
    'Temperature 0C Max.',
    'Temperature 0C Min.',
    '> 10 days',
    '> 15 days',
    '> 20 days',
    'Intensive rain >60 mm',
    'Water depth (cm)',
    'Duration (days)',
];

function rowVals(r) {
    return [r.rfNormal, r.rfReceived, r.tempMax, r.tempMin, r.dry10, r.dry15, r.dry20, r.intensiveRain, r.waterDepth, r.duration];
}

// ---------------- Excel ----------------

function allBorders() {
    const s = { style: 'thin', color: { argb: 'FF000000' } };
    return { top: s, left: s, bottom: s, right: s };
}

function styleHeaderCell(c) {
    c.font = { bold: true, size: 8 };
    c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8E8E8' } };
    c.border = allBorders();
}

// 2-row grouped header mirroring the PDF. Returns next free row.
function writeGroupedHeader(ws, top) {
    const r1 = top; const r2 = top + 1;

    ws.mergeCells(r1, 1, r1, 4); ws.getCell(r1, 1).value = 'Districts data';
    ws.mergeCells(r1, 5, r1, 7); ws.getCell(r1, 5).value = 'Dry spell/ drought';
    ws.mergeCells(r1, 8, r1, 8); ws.getCell(r1, 8).value = 'NICRA Adopted village';
    ws.mergeCells(r1, 9, r1, 10); ws.getCell(r1, 9).value = 'Flood';

    SUB_HEADERS.forEach((h, i) => { ws.getCell(r2, i + 1).value = h; });

    for (let rr = r1; rr <= r2; rr += 1) {
        for (let cc = 1; cc <= TOTAL_COLS; cc += 1) styleHeaderCell(ws.getCell(rr, cc));
    }
    return r2 + 1;
}

function writeDataRow(ws, rowIdx, vals) {
    vals.forEach((v, i) => {
        const c = ws.getCell(rowIdx, i + 1);
        c.value = v;
        c.border = allBorders();
        c.font = { size: 8 };
        c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    });
}

async function generateNicraBasicExcelBuffer(reportTitle, rawData) {
    const { groups } = buildNicraBasicGroups(rawData);
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('NICRA Basic');

    let row = 1;
    ws.mergeCells(row, 1, row, TOTAL_COLS);
    const t1 = ws.getCell(row, 1);
    t1.value = reportTitle || TITLE;
    t1.font = { bold: true, size: 12 };
    t1.alignment = { horizontal: 'center' };
    row += 2;

    if (groups.length === 0) {
        ws.getCell(row, 1).value = 'No data found';
        return await wb.xlsx.writeBuffer();
    }

    groups.forEach((g) => {
        ws.mergeCells(row, 1, row, TOTAL_COLS);
        const kc = ws.getCell(row, 1);
        kc.value = g.kvkName;
        kc.font = { bold: true, size: 10 };
        kc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCE6F1' } };
        kc.alignment = { horizontal: 'left' };
        row += 1;

        row = writeGroupedHeader(ws, row);
        g.rows.forEach((r) => { writeDataRow(ws, row, rowVals(r)); row += 1; });
        row += 1;
    });

    for (let c = 1; c <= TOTAL_COLS; c += 1) ws.getColumn(c).width = 12;

    return await wb.xlsx.writeBuffer();
}

// ---------------- Word ----------------

function tx(text, opts = {}) {
    return new TextRun({ text: String(text ?? ''), size: opts.size || FONT_HP, bold: Boolean(opts.bold) });
}

function wcell(text, opts = {}) {
    return new TableCell({
        children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 0 },
            children: [tx(text, opts)],
        })],
        shading: opts.fill ? { fill: opts.fill } : undefined,
        columnSpan: opts.colSpan,
    });
}

function buildHeaderRows() {
    const h = (t, o) => wcell(t, { bold: true, fill: 'E8E8E8', ...o });
    const row1 = new TableRow({
        tableHeader: true,
        children: [
            h('Districts data', { colSpan: 4 }),
            h('Dry spell/ drought', { colSpan: 3 }),
            h('NICRA Adopted village', { colSpan: 1 }),
            h('Flood', { colSpan: 2 }),
        ],
    });
    const row2 = new TableRow({ tableHeader: true, children: SUB_HEADERS.map((s) => h(s)) });
    return [row1, row2];
}

function buildDataRow(r) {
    return new TableRow({ children: rowVals(r).map((v) => wcell(v)) });
}

function buildGroupTable(g) {
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [...buildHeaderRows(), ...g.rows.map(buildDataRow)],
    });
}

async function generateNicraBasicWordBuffer(reportTitle, rawData) {
    const { groups } = buildNicraBasicGroups(rawData);

    const children = [
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: reportTitle || TITLE, bold: true, size: 18 })] }),
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
            children.push(buildGroupTable(g));
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
    generateNicraBasicExcelBuffer,
    generateNicraBasicWordBuffer,
};
