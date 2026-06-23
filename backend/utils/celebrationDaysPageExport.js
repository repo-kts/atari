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

const SECTION_D = 'D. Celebration of important days in KVKs';

// 29 columns total: label + activities + Farmers(12) + Officials(12) + Total(3).
const TOTAL_COLS = 29;
const FONT_HP = 12; // 6pt

// Flat header used only for screen-reader/value order; the rendered header is
// the 3-row grouped structure mirroring the PDF.
function rowVals(r) {
    return [
        r.label,
        r.numActivities,
        r.farmersGenM, r.farmersGenF, r.farmersGenT,
        r.farmersObcM, r.farmersObcF, r.farmersObcT,
        r.farmersScM, r.farmersScF, r.farmersScT,
        r.farmersStM, r.farmersStF, r.farmersStT,
        r.offGenM, r.offGenF, r.offGenT,
        r.offObcM, r.offObcF, r.offObcT,
        r.offScM, r.offScF, r.offScT,
        r.offStM, r.offStF, r.offStT,
        r.totalM, r.totalF, r.totalT,
    ];
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

// Writes the 3-row grouped header starting at `top`. Returns next free row.
function writeGroupedHeader(ws, top) {
    const r1 = top;
    const r2 = top + 1;
    const r3 = top + 2;

    // Col 1 label + col 2 activities span all 3 header rows.
    ws.mergeCells(r1, 1, r3, 1);
    ws.getCell(r1, 1).value = 'Celebration of Important Days';
    ws.mergeCells(r1, 2, r3, 2);
    ws.getCell(r1, 2).value = 'No. of activities';

    // Row 1 super-groups.
    ws.mergeCells(r1, 3, r1, 14);
    ws.getCell(r1, 3).value = 'Farmers';
    ws.mergeCells(r1, 15, r1, 26);
    ws.getCell(r1, 15).value = 'Extension Officials';
    ws.mergeCells(r1, 27, r1, 29);
    ws.getCell(r1, 27).value = 'Total';

    // Row 2 category groups (Gen/OBC/SC/ST for Farmers then Officials).
    const cats = ['General', 'OBC', 'SC', 'ST', 'General', 'OBC', 'SC', 'ST'];
    cats.forEach((label, i) => {
        const startCol = 3 + i * 3;
        ws.mergeCells(r2, startCol, r2, startCol + 2);
        ws.getCell(r2, startCol).value = label;
    });
    // Total M/F/T span rows 2-3.
    ['M', 'F', 'T'].forEach((lab, i) => {
        ws.mergeCells(r2, 27 + i, r3, 27 + i);
        ws.getCell(r2, 27 + i).value = lab;
    });

    // Row 3 M/F/T under each category (cols 3..26).
    for (let i = 0; i < 8; i += 1) {
        const startCol = 3 + i * 3;
        ws.getCell(r3, startCol).value = 'M';
        ws.getCell(r3, startCol + 1).value = 'F';
        ws.getCell(r3, startCol + 2).value = 'T';
    }

    for (let rr = r1; rr <= r3; rr += 1) {
        for (let cc = 1; cc <= TOTAL_COLS; cc += 1) {
            styleHeaderCell(ws.getCell(rr, cc));
        }
    }
    return r3 + 1;
}

function writeDataRow(ws, rowIdx, r, opts = {}) {
    const vals = rowVals(r);
    vals.forEach((v, i) => {
        const c = ws.getCell(rowIdx, i + 1);
        c.value = v;
        c.border = allBorders();
        c.font = { size: 8, bold: Boolean(opts.bold) };
        c.alignment = { horizontal: i === 0 ? 'left' : 'center', vertical: 'middle' };
        if (opts.fill) {
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: opts.fill } };
        }
    });
}

async function generateCelebrationDaysPageExcelBuffer(reportTitle, payload) {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Celebration days', {
        pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
    });

    let row = 1;
    ws.mergeCells(row, 1, row, TOTAL_COLS);
    const t1 = ws.getCell(row, 1);
    t1.value = SECTION_D;
    t1.font = { bold: true, size: 12 };
    t1.alignment = { horizontal: 'center' };
    row += 2;

    const groups = (payload && payload.groups) || [];
    if (groups.length === 0) {
        ws.getCell(row, 1).value = 'No celebration days data for export.';
        return await wb.xlsx.writeBuffer();
    }

    groups.forEach((g) => {
        if (payload.isMultiKvk) {
            ws.mergeCells(row, 1, row, TOTAL_COLS);
            const kc = ws.getCell(row, 1);
            kc.value = g.kvkName;
            kc.font = { bold: true, size: 10 };
            kc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCE6F1' } };
            kc.alignment = { horizontal: 'left' };
            row += 1;
        }
        row = writeGroupedHeader(ws, row);
        g.rows.forEach((r) => {
            writeDataRow(ws, row, r);
            row += 1;
        });
        writeDataRow(ws, row, g.subtotal, { bold: true, fill: 'FFF1F5F9' });
        row += 2;
    });

    if (payload.isMultiKvk) {
        row = writeGroupedHeader(ws, row);
        writeDataRow(ws, row, payload.grandTotal, { bold: true, fill: 'FFF5F5F5' });
    }

    ws.getColumn(1).width = 30;
    for (let c = 2; c <= TOTAL_COLS; c += 1) {
        ws.getColumn(c).width = 5.5;
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
        verticalMerge: opts.vMerge,
    });
}

const HDR_FILL = 'E8E8E8';

function buildHeaderRows() {
    const h = (t, o) => wcell(t, { bold: true, fill: HDR_FILL, ...o });

    const row1 = new TableRow({
        tableHeader: true,
        children: [
            h('Celebration of Important Days', { rowSpan: 3, alignment: AlignmentType.LEFT }),
            h('No. of activities', { rowSpan: 3 }),
            h('Farmers', { colSpan: 12 }),
            h('Extension Officials', { colSpan: 12 }),
            h('Total', { colSpan: 3 }),
        ],
    });

    const catCells = [];
    ['General', 'OBC', 'SC', 'ST', 'General', 'OBC', 'SC', 'ST'].forEach((c) => {
        catCells.push(h(c, { colSpan: 3 }));
    });
    const row2 = new TableRow({
        tableHeader: true,
        children: [
            ...catCells,
            h('M', { rowSpan: 2 }),
            h('F', { rowSpan: 2 }),
            h('T', { rowSpan: 2 }),
        ],
    });

    const mftCells = [];
    for (let i = 0; i < 8; i += 1) {
        mftCells.push(h('M'), h('F'), h('T'));
    }
    const row3 = new TableRow({ tableHeader: true, children: mftCells });

    return [row1, row2, row3];
}

function buildDataRow(r, opts = {}) {
    const vals = rowVals(r);
    return new TableRow({
        children: vals.map((v, i) => wcell(v, {
            bold: opts.bold,
            fill: opts.fill,
            alignment: i === 0 ? AlignmentType.LEFT : AlignmentType.CENTER,
        })),
    });
}

function buildGroupTable(g, isMultiKvk) {
    const rows = [
        ...buildHeaderRows(),
        ...g.rows.map((r) => buildDataRow(r)),
        buildDataRow(g.subtotal, { bold: true, fill: 'F1F5F9' }),
    ];
    return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows });
}

async function generateCelebrationDaysPageWordBuffer(reportTitle, payload) {
    const groups = (payload && payload.groups) || [];

    const children = [
        new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: SECTION_D, bold: true, size: 18 })],
        }),
        new Paragraph({ text: '' }),
    ];

    if (groups.length === 0) {
        children.push(new Paragraph({ children: [tx('No celebration days data for export.')] }));
    } else {
        groups.forEach((g) => {
            if (payload.isMultiKvk) {
                children.push(new Paragraph({
                    spacing: { before: 120, after: 40 },
                    children: [new TextRun({ text: g.kvkName, bold: true, size: 16 })],
                }));
            }
            children.push(buildGroupTable(g, payload.isMultiKvk));
            children.push(new Paragraph({ text: '' }));
        });

        if (payload.isMultiKvk) {
            children.push(new Paragraph({
                spacing: { before: 120, after: 40 },
                children: [new TextRun({ text: 'Grand Total (all KVKs)', bold: true, size: 16 })],
            }));
            children.push(new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [...buildHeaderRows(), buildDataRow(payload.grandTotal, { bold: true, fill: 'F5F5F5' })],
            }));
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
    generateCelebrationDaysPageExcelBuffer,
    generateCelebrationDaysPageWordBuffer,
};
