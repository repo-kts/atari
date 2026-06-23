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
    buildNicraInterventionGroups,
    fmtDate,
} = require('../services/reports/formsTemplate/projectTemplates/nicraInterventionTemplate.js');

const TITLE = 'NICRA — Other Interventions';
const FONT_HP = 12; // docx half-points → 6pt, matches the small PDF text
const TOTAL_COLS = 7;

const HEADERS = [
    'S.No.',
    'Bank Type',
    'Crop',
    'Variety',
    'Quantity (q)',
    'Start Date',
    'End Date',
];

// Distinct tab colours cycled per KVK so admins can tell groups apart.
const TAB_COLORS = [
    'FF4F81BD', 'FF9BBB59', 'FFC0504D', 'FF8064A2',
    'FF4BACC6', 'FFF79646', 'FF2C4D75', 'FF77933C',
];

function rowVals(r, idx) {
    return [idx + 1, r.bankType || '—', r.crop || '—', r.variety || '—', Number(r.quantityQ || 0), fmtDate(r.startDate), fmtDate(r.endDate)];
}

// ---------------- Excel ----------------

function allBorders() {
    const s = { style: 'thin', color: { argb: 'FF000000' } };
    return { top: s, left: s, bottom: s, right: s };
}

function safeSheetName(name, used) {
    let base = String(name || 'KVK').replace(/[\\/?*[\]:]/g, ' ').trim().slice(0, 28) || 'KVK';
    let candidate = base;
    let i = 2;
    while (used.has(candidate.toLowerCase())) {
        candidate = `${base.slice(0, 25)} ${i++}`;
    }
    used.add(candidate.toLowerCase());
    return candidate;
}

function writeHeaderRow(ws, rowIdx) {
    HEADERS.forEach((h, i) => {
        const c = ws.getCell(rowIdx, i + 1);
        c.value = h;
        c.font = { bold: true, size: 8 };
        c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8E8E8' } };
        c.border = allBorders();
    });
}

function writeDataRow(ws, rowIdx, vals) {
    vals.forEach((v, i) => {
        const c = ws.getCell(rowIdx, i + 1);
        c.value = v;
        c.border = allBorders();
        c.font = { size: 8 };
        c.alignment = { horizontal: i === 0 || i === 4 ? 'center' : 'left', vertical: 'middle', wrapText: true };
    });
}

function writeGroupSheet(ws, g, reportTitle) {
    let row = 1;
    ws.mergeCells(row, 1, row, TOTAL_COLS);
    const t1 = ws.getCell(row, 1);
    t1.value = reportTitle || TITLE;
    t1.font = { bold: true, size: 12 };
    t1.alignment = { horizontal: 'center' };
    row += 2;

    ws.mergeCells(row, 1, row, TOTAL_COLS);
    const kc = ws.getCell(row, 1);
    kc.value = g.kvkName;
    kc.font = { bold: true, size: 10 };
    kc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCE6F1' } };
    kc.alignment = { horizontal: 'left' };
    row += 1;

    writeHeaderRow(ws, row);
    row += 1;

    g.rows.forEach((r, idx) => { writeDataRow(ws, row, rowVals(r, idx)); row += 1; });

    // Sub-total
    const sub = ['', `Sub-total — ${g.kvkName}`, '', '', Number(g.subtotal || 0), '', ''];
    sub.forEach((v, i) => {
        const c = ws.getCell(row, i + 1);
        c.value = v;
        c.font = { bold: true, size: 8 };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
        c.border = allBorders();
    });

    const widths = [6, 16, 22, 22, 12, 14, 14];
    widths.forEach((w, i) => { ws.getColumn(i + 1).width = w; });
}

async function generateNicraInterventionExcelBuffer(reportTitle, rawData) {
    const { groups, isMultiKvk, grandTotal } = buildNicraInterventionGroups(rawData);
    const wb = new ExcelJS.Workbook();

    if (groups.length === 0) {
        const ws = wb.addWorksheet('NICRA Intervention');
        ws.getCell(1, 1).value = reportTitle || TITLE;
        ws.getCell(1, 1).font = { bold: true, size: 12 };
        ws.getCell(3, 1).value = 'No data found';
        return await wb.xlsx.writeBuffer();
    }

    const used = new Set();

    // Admin / multi-KVK → summary tab + one coloured tab per KVK.
    if (isMultiKvk) {
        const summary = wb.addWorksheet('Summary');
        summary.mergeCells(1, 1, 1, 2);
        summary.getCell(1, 1).value = reportTitle || TITLE;
        summary.getCell(1, 1).font = { bold: true, size: 12 };
        const sh = summary.getRow(3);
        sh.getCell(1).value = 'KVK';
        sh.getCell(2).value = 'Quantity (q)';
        sh.eachCell((c) => {
            c.font = { bold: true };
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8E8E8' } };
            c.border = allBorders();
        });
        let r = 4;
        groups.forEach((g) => {
            summary.getCell(r, 1).value = g.kvkName;
            summary.getCell(r, 2).value = Number(g.subtotal || 0);
            summary.getCell(r, 1).border = allBorders();
            summary.getCell(r, 2).border = allBorders();
            r += 1;
        });
        summary.getCell(r, 1).value = 'Grand Total';
        summary.getCell(r, 2).value = Number(grandTotal || 0);
        [1, 2].forEach((c) => {
            summary.getCell(r, c).font = { bold: true };
            summary.getCell(r, c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
            summary.getCell(r, c).border = allBorders();
        });
        summary.getColumn(1).width = 40;
        summary.getColumn(2).width = 16;
        used.add('summary');
    }

    groups.forEach((g, idx) => {
        const ws = wb.addWorksheet(safeSheetName(g.kvkName, used));
        if (isMultiKvk) ws.properties.tabColor = { argb: TAB_COLORS[idx % TAB_COLORS.length] };
        writeGroupSheet(ws, g, reportTitle);
    });

    return await wb.xlsx.writeBuffer();
}

// ---------------- Word (6pt) ----------------

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
        columnSpan: opts.colSpan,
    });
}

function buildHeaderRow() {
    return new TableRow({
        tableHeader: true,
        children: HEADERS.map((h) => wcell(h, { bold: true, fill: 'E8E8E8', alignment: AlignmentType.CENTER })),
    });
}

function buildGroupTable(g) {
    const bodyRows = g.rows.map((r, idx) => new TableRow({
        children: rowVals(r, idx).map((v, i) => wcell(v, {
            alignment: i === 0 || i === 4 ? AlignmentType.CENTER : AlignmentType.LEFT,
        })),
    }));

    const subRow = new TableRow({
        children: [
            wcell(`Sub-total — ${g.kvkName}`, { bold: true, fill: 'F1F5F9', colSpan: 4 }),
            wcell(Number(g.subtotal || 0), { bold: true, fill: 'F1F5F9', alignment: AlignmentType.CENTER }),
            wcell('', { fill: 'F1F5F9', colSpan: 2 }),
        ],
    });

    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [buildHeaderRow(), ...bodyRows, subRow],
    });
}

async function generateNicraInterventionWordBuffer(reportTitle, rawData) {
    const { groups, isMultiKvk, grandTotal } = buildNicraInterventionGroups(rawData);

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
        if (isMultiKvk) {
            children.push(new Paragraph({
                children: [new TextRun({ text: `Grand Total (all KVKs): ${Number(grandTotal || 0)} q`, bold: true, size: FONT_HP })],
            }));
        }
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
    generateNicraInterventionExcelBuffer,
    generateNicraInterventionWordBuffer,
};
