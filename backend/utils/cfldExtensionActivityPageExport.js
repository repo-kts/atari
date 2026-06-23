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

const { buildCfldExtensionGroups } = require('../services/reports/formsTemplate/projectTemplates/cfldExtensionActivityTemplate.js');

const TITLE = 'Extension Activities organized (CFLD)';
const TOTAL_COLS = 19; // S.No, Activity, Season, Date&Place, Farmers(15)
const FONT_HP = 12; // 6pt

function farmerCells(r) {
    return [
        r.generalM, r.generalF, r.generalT,
        r.obcM, r.obcF, r.obcT,
        r.scM, r.scF, r.scT,
        r.stM, r.stF, r.stT,
        r.totalM, r.totalF, r.totalT,
    ];
}

function dataVals(r) {
    return [r.sl, r.activity, r.season, r.dateAndPlace, ...farmerCells(r)];
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

// 3-row grouped header mirroring the PDF. Returns next free row.
function writeGroupedHeader(ws, top) {
    const r1 = top; const r2 = top + 1; const r3 = top + 2;

    ws.mergeCells(r1, 1, r3, 1); ws.getCell(r1, 1).value = 'S.No.';
    ws.mergeCells(r1, 2, r3, 2); ws.getCell(r1, 2).value = 'Extension Activities organized';
    ws.mergeCells(r1, 3, r3, 3); ws.getCell(r1, 3).value = 'Season';
    ws.mergeCells(r1, 4, r3, 4); ws.getCell(r1, 4).value = 'Date and place of activity';

    ws.mergeCells(r1, 5, r1, 19); ws.getCell(r1, 5).value = 'Number of farmers';

    ['General', 'OBC', 'SC', 'ST', 'Total'].forEach((label, i) => {
        const startCol = 5 + i * 3;
        ws.mergeCells(r2, startCol, r2, startCol + 2);
        ws.getCell(r2, startCol).value = label;
    });

    for (let i = 0; i < 5; i += 1) {
        const startCol = 5 + i * 3;
        ws.getCell(r3, startCol).value = 'M';
        ws.getCell(r3, startCol + 1).value = 'F';
        ws.getCell(r3, startCol + 2).value = 'T';
    }

    for (let rr = r1; rr <= r3; rr += 1) {
        for (let cc = 1; cc <= TOTAL_COLS; cc += 1) styleHeaderCell(ws.getCell(rr, cc));
    }
    return r3 + 1;
}

function writeDataRow(ws, rowIdx, vals, opts = {}) {
    vals.forEach((v, i) => {
        const c = ws.getCell(rowIdx, i + 1);
        c.value = v;
        c.border = allBorders();
        c.font = { size: 8, bold: Boolean(opts.bold) };
        c.alignment = { horizontal: i === 1 || i === 3 ? 'left' : 'center', vertical: 'middle', wrapText: true };
        if (opts.fill) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: opts.fill } };
    });
}

function totalVals(label, r) {
    return [label, '', '', '', ...farmerCells(r)];
}

// Distinct tab colours cycled per KVK so the tabs are easy to tell apart.
const TAB_COLORS = [
    'FF4F81BD', 'FF9BBB59', 'FFC0504D', 'FF8064A2',
    'FF4BACC6', 'FFF79646', 'FF2C4D75', 'FF77933C',
];

function safeSheetName(name, used) {
    const base = String(name || 'KVK').replace(/[\\/?*[\]:]/g, ' ').trim().slice(0, 28) || 'KVK';
    let candidate = base;
    let i = 2;
    while (used.has(candidate.toLowerCase())) {
        candidate = `${base.slice(0, 25)} ${i++}`;
    }
    used.add(candidate.toLowerCase());
    return candidate;
}

function setColWidths(ws) {
    ws.getColumn(1).width = 6;
    ws.getColumn(2).width = 28;
    ws.getColumn(3).width = 12;
    ws.getColumn(4).width = 24;
    for (let c = 5; c <= TOTAL_COLS; c += 1) ws.getColumn(c).width = 5;
}

async function generateCfldExtensionActivityExcelBuffer(reportTitle, rawData) {
    const { groups, grandTotal, isMultiKvk } = buildCfldExtensionGroups(rawData);
    const wb = new ExcelJS.Workbook();

    if (groups.length === 0) {
        const ws = wb.addWorksheet('CFLD Extension');
        ws.getCell(1, 1).value = reportTitle || TITLE;
        ws.getCell(1, 1).font = { bold: true, size: 12 };
        ws.getCell(3, 1).value = 'No data found';
        return await wb.xlsx.writeBuffer();
    }

    const used = new Set();

    // Admin / multi-KVK → one coloured tab per KVK + a Grand Total tab.
    groups.forEach((g, idx) => {
        const ws = wb.addWorksheet(safeSheetName(g.kvkName, used), {
            pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
        });
        if (isMultiKvk) ws.properties.tabColor = { argb: TAB_COLORS[idx % TAB_COLORS.length] };

        let row = 1;
        ws.mergeCells(row, 1, row, TOTAL_COLS);
        const t1 = ws.getCell(row, 1);
        t1.value = reportTitle || TITLE;
        t1.font = { bold: true, size: 12 };
        t1.alignment = { horizontal: 'center' };
        row += 1;

        ws.mergeCells(row, 1, row, TOTAL_COLS);
        const kc = ws.getCell(row, 1);
        kc.value = g.kvkName;
        kc.font = { bold: true, size: 10 };
        kc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCE6F1' } };
        kc.alignment = { horizontal: 'left' };
        row += 2;

        row = writeGroupedHeader(ws, row);
        g.rows.forEach((r) => { writeDataRow(ws, row, dataVals(r)); row += 1; });
        writeDataRow(ws, row, totalVals(`Sub-total — ${g.kvkName}`, g.subtotal), { bold: true, fill: 'FFF1F5F9' });

        setColWidths(ws);
    });

    if (isMultiKvk) {
        const ws = wb.addWorksheet(safeSheetName('Grand Total', used), {
            pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
        });
        ws.properties.tabColor = { argb: 'FF000000' };

        let row = 1;
        ws.mergeCells(row, 1, row, TOTAL_COLS);
        ws.getCell(row, 1).value = `${reportTitle || TITLE} — Grand Total (all KVKs)`;
        ws.getCell(row, 1).font = { bold: true, size: 12 };
        ws.getCell(row, 1).alignment = { horizontal: 'center' };
        row += 2;

        row = writeGroupedHeader(ws, row);
        // Per-KVK sub-totals, then the overall grand total.
        groups.forEach((g) => {
            writeDataRow(ws, row, totalVals(g.kvkName, g.subtotal));
            row += 1;
        });
        writeDataRow(ws, row, totalVals('Grand Total (all KVKs)', grandTotal), { bold: true, fill: 'FFF5F5F5' });

        setColWidths(ws);
    }

    return await wb.xlsx.writeBuffer();
}

// ---------------- Word (6pt, landscape) ----------------

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
        columnSpan: opts.colSpan,
        rowSpan: opts.rowSpan,
    });
}

const HDR_FILL = 'E8E8E8';

function buildHeaderRows() {
    const h = (t, o) => wcell(t, { bold: true, fill: HDR_FILL, ...o });

    const row1 = new TableRow({
        tableHeader: true,
        children: [
            h('S.No.', { rowSpan: 3 }),
            h('Extension Activities organized', { rowSpan: 3, alignment: AlignmentType.LEFT }),
            h('Season', { rowSpan: 3 }),
            h('Date and place of activity', { rowSpan: 3, alignment: AlignmentType.LEFT }),
            h('Number of farmers', { colSpan: 15 }),
        ],
    });
    const cats = ['General', 'OBC', 'SC', 'ST', 'Total'].map((c) => h(c, { colSpan: 3 }));
    const row2 = new TableRow({ tableHeader: true, children: cats });
    const mft = [];
    for (let i = 0; i < 5; i += 1) mft.push(h('M'), h('F'), h('T'));
    const row3 = new TableRow({ tableHeader: true, children: mft });
    return [row1, row2, row3];
}

function buildDataRow(r) {
    const vals = dataVals(r);
    return new TableRow({
        children: vals.map((v, i) => wcell(v, { alignment: i === 1 || i === 3 ? AlignmentType.LEFT : AlignmentType.CENTER })),
    });
}

function buildTotalRow(label, r, fill) {
    return new TableRow({
        children: [
            wcell(label, { bold: true, fill, colSpan: 4, alignment: AlignmentType.LEFT }),
            ...farmerCells(r).map((v) => wcell(v, { bold: true, fill })),
        ],
    });
}

function buildGroupTable(g) {
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [...buildHeaderRows(), ...g.rows.map(buildDataRow), buildTotalRow(`Sub-total — ${g.kvkName}`, g.subtotal, 'F1F5F9')],
    });
}

async function generateCfldExtensionActivityWordBuffer(reportTitle, rawData) {
    const { groups, grandTotal, isMultiKvk } = buildCfldExtensionGroups(rawData);

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

        if (isMultiKvk) {
            children.push(new Paragraph({
                spacing: { before: 120, after: 40 },
                children: [new TextRun({ text: 'Grand Total (all KVKs)', bold: true, size: 16 })],
            }));
            children.push(new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [...buildHeaderRows(), buildTotalRow('Grand Total (all KVKs)', grandTotal, 'F5F5F5')],
            }));
        }
    }

    const doc = new Document({
        styles: { default: { document: { run: { size: FONT_HP } } } },
        sections: [{
            properties: { page: { size: { orientation: PageOrientation.LANDSCAPE } } },
            children,
        }],
    });

    return await Packer.toBuffer(doc);
}

module.exports = {
    generateCfldExtensionActivityExcelBuffer,
    generateCfldExtensionActivityWordBuffer,
};
