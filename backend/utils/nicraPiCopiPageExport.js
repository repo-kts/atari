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
} = require('docx');

const {
    buildNicraPiCopiGroups,
    fmtDate,
} = require('../services/reports/formsTemplate/projectTemplates/nicraPiCopiTemplate.js');

const TITLE = 'NICRA — PI & Co-PI List';
const FONT_HP = 16; // 8pt (matches the PDF body font)
const TOTAL_COLS = 5;
const HEADERS = ['S.No.', 'Type', 'Name', 'Start date', 'End date'];
const LEFT_COLS = new Set([1, 2]); // Type, Name

// Distinct tab colours cycled per KVK so admins can tell groups apart.
const TAB_COLORS = [
    'FF4F81BD', 'FF9BBB59', 'FFC0504D', 'FF8064A2',
    'FF4BACC6', 'FFF79646', 'FF2C4D75', 'FF77933C',
];

function rowVals(r, idx) {
    return [
        idx + 1,
        r.type || '—',
        r.name || '—',
        fmtDate(r.startDate),
        fmtDate(r.endDate),
    ];
}

// ---------------- Excel ----------------

function allBorders() {
    const s = { style: 'thin', color: { argb: 'FF000000' } };
    return { top: s, left: s, bottom: s, right: s };
}

function safeSheetName(name, used) {
    const base = String(name || 'KVK').replace(/[\\/?*[\]:]/g, ' ').trim().slice(0, 28) || 'KVK';
    let candidate = base;
    let i = 2;
    while (used.has(candidate.toLowerCase())) candidate = `${base.slice(0, 25)} ${i++}`;
    used.add(candidate.toLowerCase());
    return candidate;
}

function styleHeader(c) {
    c.font = { bold: true, size: 9 };
    c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8E8E8' } };
    c.border = allBorders();
}

function writeDataRow(ws, rowIdx, vals) {
    vals.forEach((v, i) => {
        const c = ws.getCell(rowIdx, i + 1);
        c.value = v;
        c.border = allBorders();
        c.font = { size: 9 };
        c.alignment = { horizontal: LEFT_COLS.has(i) ? 'left' : 'center', vertical: 'middle', wrapText: true };
    });
}

function writeGroupSheet(ws, g, reportTitle) {
    let row = 1;
    ws.mergeCells(row, 1, row, TOTAL_COLS);
    const t = ws.getCell(row, 1);
    t.value = reportTitle || TITLE;
    t.font = { bold: true, size: 12 };
    t.alignment = { horizontal: 'center' };
    row += 2;

    ws.mergeCells(row, 1, row, TOTAL_COLS);
    const kc = ws.getCell(row, 1);
    kc.value = g.kvkName;
    kc.font = { bold: true, size: 10 };
    kc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCE6F1' } };
    kc.alignment = { horizontal: 'left' };
    row += 1;

    HEADERS.forEach((h, i) => { const c = ws.getCell(row, i + 1); c.value = h; styleHeader(c); });
    row += 1;

    g.rows.forEach((r, idx) => { writeDataRow(ws, row, rowVals(r, idx)); row += 1; });

    const widths = [6, 22, 42, 15, 15];
    widths.forEach((w, i) => { ws.getColumn(i + 1).width = w; });
}

async function generateNicraPiCopiExcelBuffer(reportTitle, rawData) {
    const { groups, isMultiKvk } = buildNicraPiCopiGroups(rawData);
    const wb = new ExcelJS.Workbook();

    if (groups.length === 0) {
        const ws = wb.addWorksheet('NICRA PI Co-PI');
        ws.getCell(1, 1).value = reportTitle || TITLE;
        ws.getCell(1, 1).font = { bold: true, size: 12 };
        ws.getCell(3, 1).value = 'No data found';
        return await wb.xlsx.writeBuffer();
    }

    const used = new Set();
    groups.forEach((g, idx) => {
        const ws = wb.addWorksheet(safeSheetName(g.kvkName, used));
        if (isMultiKvk) ws.properties.tabColor = { argb: TAB_COLORS[idx % TAB_COLORS.length] };
        writeGroupSheet(ws, g, reportTitle);
    });

    return await wb.xlsx.writeBuffer();
}

// ---------------- Word (8pt) ----------------

function tx(text, opts = {}) {
    return new TextRun({ text: String(text ?? ''), size: opts.size || FONT_HP, bold: Boolean(opts.bold) });
}

function wcell(text, opts = {}) {
    return new TableCell({
        children: [new Paragraph({
            alignment: opts.alignment || AlignmentType.CENTER,
            spacing: { before: 0, after: 0 },
            children: [tx(text, opts)],
        })],
        shading: opts.fill ? { fill: opts.fill } : undefined,
    });
}

function buildHeaderRow() {
    return new TableRow({
        tableHeader: true,
        children: HEADERS.map((t) => wcell(t, { bold: true, fill: 'E8E8E8' })),
    });
}

function buildGroupTable(g) {
    const bodyRows = g.rows.map((r, idx) => new TableRow({
        children: rowVals(r, idx).map((v, i) => wcell(v, {
            alignment: LEFT_COLS.has(i) ? AlignmentType.LEFT : AlignmentType.CENTER,
        })),
    }));
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [buildHeaderRow(), ...bodyRows],
    });
}

async function generateNicraPiCopiWordBuffer(reportTitle, rawData) {
    const { groups } = buildNicraPiCopiGroups(rawData);

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
                shading: { fill: 'DCE6F1' },
                children: [new TextRun({ text: g.kvkName, bold: true, size: 16 })],
            }));
            children.push(buildGroupTable(g));
            children.push(new Paragraph({ text: '' }));
        });
    }

    const doc = new Document({
        styles: { default: { document: { run: { size: FONT_HP } } } },
        sections: [{ children }],
    });

    return await Packer.toBuffer(doc);
}

module.exports = {
    generateNicraPiCopiExcelBuffer,
    generateNicraPiCopiWordBuffer,
};
