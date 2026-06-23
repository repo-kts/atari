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

const SECTION = 'Detail of Soil, Water and Plant analysis';

// docx half-point sizing: 12 = 6pt.
const FONT_HP = 12;

// Leaf columns (17) in order. Farmer leaves sit under a grouped header.
const FARMER_LEAVES = ['Gen M', 'Gen F', 'OBC M', 'OBC F', 'SC M', 'SC F', 'ST M', 'ST F', 'Total'];
const FARMER_FIELDS = ['generalM', 'generalF', 'obcM', 'obcF', 'scM', 'scF', 'stM', 'stF', 'farmers'];

// Distinct tab colours cycled per KVK group so admins can tell them apart.
const TAB_COLORS = [
    'FF4F81BD', 'FF9BBB59', 'FFC0504D', 'FF8064A2',
    'FF4BACC6', 'FFF79646', 'FF2C4D75', 'FF77933C',
];

function allBorders() {
    const s = { style: 'thin', color: { argb: 'FF000000' } };
    return { top: s, left: s, bottom: s, right: s };
}

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

// ---- Excel ----

function styleHeaderCell(c) {
    c.font = { bold: true, size: 7 };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8E8E8' } };
    c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    c.border = allBorders();
}

function writeHeader(ws, startRow) {
    const r1 = startRow;
    const r2 = startRow + 1;
    ws.getRow(r1).values = [
        'S.No', 'Analysis', 'Samples analysed through', 'No. of samples analysed',
        'No. of villages covered', 'Amount realized (₹)', 'No. of farmers benefitted',
        '', '', '', '', '', '', '', '', 'Start date', 'End date',
    ];
    ws.getRow(r2).values = ['', '', '', '', '', '', ...FARMER_LEAVES, '', ''];

    // Vertical merges for the single-row columns (1..6, 16, 17).
    [1, 2, 3, 4, 5, 6, 16, 17].forEach((col) => ws.mergeCells(r1, col, r2, col));
    // Grouped farmer header across cols 7..15.
    ws.mergeCells(r1, 7, r1, 15);

    for (let col = 1; col <= 17; col += 1) {
        styleHeaderCell(ws.getCell(r1, col));
        styleHeaderCell(ws.getCell(r2, col));
    }
}

function rowValues(r) {
    return [
        r.sno, r.analysis, r.through, r.samples, r.villages, r.amount,
        r.generalM, r.generalF, r.obcM, r.obcF, r.scM, r.scF, r.stM, r.stF, r.farmers,
        r.startDate || '—', r.endDate || '—',
    ];
}

function totalValues(label, t) {
    // label spans cols 1..3; numbers fill 4..15; 16..17 blank.
    return [
        label, '', '', t.samples, t.villages, t.amount,
        t.generalM, t.generalF, t.obcM, t.obcF, t.scM, t.scF, t.stM, t.stF, t.farmers,
        '', '',
    ];
}

function setColWidths(ws) {
    const widths = [5, 22, 20, 9, 9, 11, 6, 6, 6, 6, 6, 6, 6, 6, 7, 12, 12];
    widths.forEach((w, i) => { ws.getColumn(i + 1).width = w; });
}

function writeGroupSheet(ws, group) {
    const titleRow = ws.addRow([SECTION]);
    ws.mergeCells(titleRow.number, 1, titleRow.number, 17);
    titleRow.getCell(1).font = { bold: true, size: 11 };
    titleRow.getCell(1).alignment = { horizontal: 'center' };

    const kvkRow = ws.addRow([group.kvkName]);
    ws.mergeCells(kvkRow.number, 1, kvkRow.number, 17);
    kvkRow.getCell(1).font = { bold: true, size: 10 };

    ws.addRow([]);

    const headStart = ws.lastRow.number + 1;
    ws.addRow([]);
    ws.addRow([]);
    writeHeader(ws, headStart);

    for (const r of group.rows) {
        const row = ws.addRow(rowValues(r));
        row.eachCell((c) => { c.border = allBorders(); c.font = { size: 7 }; });
    }

    const sub = ws.addRow(totalValues(`Sub-total — ${group.kvkName}`, group.subtotal));
    ws.mergeCells(sub.number, 1, sub.number, 3);
    sub.eachCell((c) => {
        c.font = { bold: true, size: 7 };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
        c.border = allBorders();
    });

    setColWidths(ws);
}

async function generateSoilWaterAnalysisPageExcelBuffer(reportTitle, payload) {
    const wb = new ExcelJS.Workbook();
    const groups = (payload && payload.groups) || [];

    if (groups.length === 0) {
        const ws = wb.addWorksheet('Soil analysis');
        ws.addRow([SECTION]).getCell(1).font = { bold: true, size: 12 };
        ws.addRow(['No soil, water and plant analysis data for export.']);
        return await wb.xlsx.writeBuffer();
    }

    const usedNames = new Set();

    // Admin / multi-KVK → one coloured tab per KVK + a summary tab so per-KVK
    // groups don't clutter a single sheet.
    if (payload.isMultiKvk) {
        const summary = wb.addWorksheet('Summary');
        summary.addRow([SECTION]).getCell(1).font = { bold: true, size: 12 };
        summary.mergeCells(1, 1, 1, 5);
        summary.addRow([]);
        const sh = summary.addRow(['KVK', 'Samples analysed', 'Villages covered', 'Amount realized (₹)', 'Farmers benefitted']);
        sh.eachCell((c) => {
            c.font = { bold: true };
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8E8E8' } };
            c.border = allBorders();
        });
        for (const g of groups) {
            summary.addRow([g.kvkName, g.subtotal.samples, g.subtotal.villages, g.subtotal.amount, g.subtotal.farmers])
                .eachCell((c) => { c.border = allBorders(); });
        }
        const gt = payload.grandTotal;
        const gtRow = summary.addRow(['Grand Total', gt.samples, gt.villages, gt.amount, gt.farmers]);
        gtRow.eachCell((c) => {
            c.font = { bold: true };
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
            c.border = allBorders();
        });
        summary.getColumn(1).width = 36;
        [2, 3, 4, 5].forEach((col) => { summary.getColumn(col).width = 18; });
        usedNames.add('summary');
    }

    groups.forEach((g, idx) => {
        const ws = wb.addWorksheet(safeSheetName(g.kvkName, usedNames));
        ws.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 };
        if (payload.isMultiKvk) {
            ws.properties.tabColor = { argb: TAB_COLORS[idx % TAB_COLORS.length] };
        }
        writeGroupSheet(ws, g);
    });

    return await wb.xlsx.writeBuffer();
}

// ---- Word (6pt) ----

function tx(text, opts = {}) {
    return new TextRun({ text: String(text ?? ''), size: FONT_HP, bold: Boolean(opts.bold) });
}

function para(text, opts = {}) {
    return new Paragraph({
        alignment: opts.alignment,
        spacing: { before: 0, after: 0 },
        children: [tx(text, opts)],
    });
}

function cell(text, opts = {}) {
    return new TableCell({
        children: [para(text, opts)],
        shading: opts.fill ? { fill: opts.fill } : undefined,
        columnSpan: opts.colSpan,
        rowSpan: opts.rowSpan,
    });
}

function headerRows() {
    const top = new TableRow({
        tableHeader: true,
        children: [
            cell('S.No', { bold: true, fill: 'E8E8E8', rowSpan: 2, alignment: AlignmentType.CENTER }),
            cell('Analysis', { bold: true, fill: 'E8E8E8', rowSpan: 2 }),
            cell('Samples analysed through', { bold: true, fill: 'E8E8E8', rowSpan: 2 }),
            cell('No. of samples analysed', { bold: true, fill: 'E8E8E8', rowSpan: 2, alignment: AlignmentType.CENTER }),
            cell('No. of villages covered', { bold: true, fill: 'E8E8E8', rowSpan: 2, alignment: AlignmentType.CENTER }),
            cell('Amount realized (₹)', { bold: true, fill: 'E8E8E8', rowSpan: 2, alignment: AlignmentType.CENTER }),
            cell('No. of farmers benefitted', { bold: true, fill: 'E8E8E8', colSpan: 9, alignment: AlignmentType.CENTER }),
            cell('Start date', { bold: true, fill: 'E8E8E8', rowSpan: 2, alignment: AlignmentType.CENTER }),
            cell('End date', { bold: true, fill: 'E8E8E8', rowSpan: 2, alignment: AlignmentType.CENTER }),
        ],
    });
    const sub = new TableRow({
        tableHeader: true,
        children: FARMER_LEAVES.map((h) => cell(h, { bold: true, fill: 'E8E8E8', alignment: AlignmentType.CENTER })),
    });
    return [top, sub];
}

function bodyRow(r) {
    return new TableRow({
        children: [
            cell(r.sno, { alignment: AlignmentType.CENTER }),
            cell(r.analysis),
            cell(r.through),
            cell(r.samples, { alignment: AlignmentType.CENTER }),
            cell(r.villages, { alignment: AlignmentType.CENTER }),
            cell(r.amount, { alignment: AlignmentType.CENTER }),
            ...FARMER_FIELDS.map((f) => cell(r[f], { alignment: AlignmentType.CENTER })),
            cell(r.startDate || '—', { alignment: AlignmentType.CENTER }),
            cell(r.endDate || '—', { alignment: AlignmentType.CENTER }),
        ],
    });
}

function totalsRow(label, t, fill) {
    return new TableRow({
        children: [
            cell(label, { bold: true, fill, colSpan: 3 }),
            cell(t.samples, { bold: true, fill, alignment: AlignmentType.CENTER }),
            cell(t.villages, { bold: true, fill, alignment: AlignmentType.CENTER }),
            cell(t.amount, { bold: true, fill, alignment: AlignmentType.CENTER }),
            ...FARMER_FIELDS.map((f) => cell(t[f], { bold: true, fill, alignment: AlignmentType.CENTER })),
            cell('', { fill, colSpan: 2 }),
        ],
    });
}

function buildGroupTable(g) {
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            ...headerRows(),
            ...g.rows.map(bodyRow),
            totalsRow(`Sub-total — ${g.kvkName}`, g.subtotal, 'F1F5F9'),
        ],
    });
}

async function generateSoilWaterAnalysisPageWordBuffer(reportTitle, payload) {
    const groups = (payload && payload.groups) || [];

    const children = [
        new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: SECTION, bold: true, size: 16 })],
        }),
        new Paragraph({ text: '' }),
    ];

    if (groups.length === 0) {
        children.push(para('No soil, water and plant analysis data for export.'));
    } else {
        groups.forEach((g) => {
            if (payload.isMultiKvk) {
                children.push(
                    new Paragraph({
                        spacing: { before: 120, after: 40 },
                        children: [new TextRun({ text: g.kvkName, bold: true, size: 15 })],
                    }),
                );
            }
            children.push(buildGroupTable(g));
            children.push(new Paragraph({ text: '' }));
        });

        if (payload.isMultiKvk) {
            children.push(
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [totalsRow('Grand Total (all KVKs)', payload.grandTotal, 'F5F5F5')],
                }),
            );
        }
    }

    const doc = new Document({
        styles: { default: { document: { run: { size: FONT_HP } } } },
        sections: [
            {
                properties: { page: { size: { orientation: PageOrientation.LANDSCAPE } } },
                children,
            },
        ],
    });

    return await Packer.toBuffer(doc);
}

module.exports = {
    generateSoilWaterAnalysisPageExcelBuffer,
    generateSoilWaterAnalysisPageWordBuffer,
};
