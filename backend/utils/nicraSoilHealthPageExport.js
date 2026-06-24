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

const { buildNicraSoilHealthGroups } = require('../services/reports/formsTemplate/projectTemplates/nicraSoilHealthTemplate.js');

const TITLE = 'NICRA — Soil Health Card';
const TOTAL_COLS = 19; // S.No, collected, analysed, SHC, farmers(15)
const FONT_HP = 12; // 6pt (docx font size is in half-points)

function farmerCells(r) {
    return [
        r.genM, r.genF, r.genT,
        r.obcM, r.obcF, r.obcT,
        r.scM, r.scF, r.scT,
        r.stM, r.stF, r.stT,
        r.totM, r.totF, r.totT,
    ];
}

function dataVals(r) {
    return [r.sl, r.noOfSoilSamplesCollected, r.noOfSamplesAnalysed, r.shcIssued, ...farmerCells(r)];
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

    ws.mergeCells(r1, 1, r2, 1); ws.getCell(r1, 1).value = 'S.No.';
    ws.mergeCells(r1, 2, r2, 2); ws.getCell(r1, 2).value = 'No. of soil samples collected';
    ws.mergeCells(r1, 3, r2, 3); ws.getCell(r1, 3).value = 'No. of samples analysed';
    ws.mergeCells(r1, 4, r2, 4); ws.getCell(r1, 4).value = 'SHC issued';

    ['General', 'OBC', 'SC', 'ST', 'Total'].forEach((label, i) => {
        const startCol = 5 + i * 3;
        ws.mergeCells(r1, startCol, r1, startCol + 2);
        ws.getCell(r1, startCol).value = label;
    });
    for (let i = 0; i < 5; i += 1) {
        const startCol = 5 + i * 3;
        ws.getCell(r2, startCol).value = 'M';
        ws.getCell(r2, startCol + 1).value = 'F';
        ws.getCell(r2, startCol + 2).value = 'T';
    }

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
    ws.getColumn(2).width = 14;
    ws.getColumn(3).width = 14;
    ws.getColumn(4).width = 11;
    for (let c = 5; c <= TOTAL_COLS; c += 1) ws.getColumn(c).width = 5;
}

async function generateNicraSoilHealthExcelBuffer(reportTitle, rawData) {
    const { groups, isMultiKvk } = buildNicraSoilHealthGroups(rawData);
    const wb = new ExcelJS.Workbook();

    if (groups.length === 0) {
        const ws = wb.addWorksheet('NICRA Soil Health');
        ws.getCell(1, 1).value = reportTitle || TITLE;
        ws.getCell(1, 1).font = { bold: true, size: 12 };
        ws.getCell(3, 1).value = 'No data found';
        return await wb.xlsx.writeBuffer();
    }

    const used = new Set();

    // One coloured tab per KVK so admins can switch between KVKs cleanly.
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

        setColWidths(ws);
    });

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

function buildHeaderRows() {
    const h = (t, o) => wcell(t, { bold: true, fill: 'E8E8E8', ...o });
    const row1 = new TableRow({
        tableHeader: true,
        children: [
            h('S.No.', { rowSpan: 2 }),
            h('No. of soil samples collected', { rowSpan: 2 }),
            h('No. of samples analysed', { rowSpan: 2 }),
            h('SHC issued', { rowSpan: 2 }),
            h('General', { colSpan: 3 }),
            h('OBC', { colSpan: 3 }),
            h('SC', { colSpan: 3 }),
            h('ST', { colSpan: 3 }),
            h('Total', { colSpan: 3 }),
        ],
    });
    const mft = [];
    for (let i = 0; i < 5; i += 1) mft.push(h('M'), h('F'), h('T'));
    const row2 = new TableRow({ tableHeader: true, children: mft });
    return [row1, row2];
}

function buildDataRow(r) {
    const vals = dataVals(r);
    return new TableRow({
        children: vals.map((v) => wcell(v, { alignment: AlignmentType.CENTER })),
    });
}

function buildGroupTable(g) {
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [...buildHeaderRows(), ...g.rows.map(buildDataRow)],
    });
}

async function generateNicraSoilHealthWordBuffer(reportTitle, rawData) {
    const { groups } = buildNicraSoilHealthGroups(rawData);

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
            properties: { page: { size: { orientation: PageOrientation.LANDSCAPE } } },
            children,
        }],
    });

    return await Packer.toBuffer(doc);
}

module.exports = {
    generateNicraSoilHealthExcelBuffer,
    generateNicraSoilHealthWordBuffer,
};
