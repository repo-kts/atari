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

const TITLE = 'Production and supply of Technological products';
// Crop + Variety + Quantity + Value + Farmers(12) + Total(3).
const TOTAL_COLS = 19;
const FONT_HP = 12; // 6pt

function fmtNum(v) {
    if (typeof v === 'number' && !Number.isInteger(v)) return Number(v.toFixed(2));
    return v;
}

// The 15 numeric figure cells (Farmers General/OBC/SC/ST M/F/T + Total M/F/T).
function figureVals(r) {
    return [
        r.farmersGenM, r.farmersGenF, r.farmersGenT,
        r.farmersObcM, r.farmersObcF, r.farmersObcT,
        r.farmersScM, r.farmersScF, r.farmersScT,
        r.farmersStM, r.farmersStF, r.farmersStT,
        r.totalM, r.totalF, r.totalT,
    ];
}

// A crop data row: Crop, Variety, Quantity, Value, then figures.
function cropRowVals(r) {
    return [r.crop, r.variety, r.quantityLabel, fmtNum(r.valueRs), ...figureVals(r)];
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
    const r1 = top;
    const r2 = top + 1;
    const r3 = top + 2;

    // Crop / Variety / Quantity / Value span all 3 rows (cols 1-4).
    ws.mergeCells(r1, 1, r3, 1); ws.getCell(r1, 1).value = 'Crop';
    ws.mergeCells(r1, 2, r3, 2); ws.getCell(r1, 2).value = 'Variety';
    ws.mergeCells(r1, 3, r3, 3); ws.getCell(r1, 3).value = 'Quantity';
    ws.mergeCells(r1, 4, r3, 4); ws.getCell(r1, 4).value = 'Value (Rs)';

    // Row 1 super-groups: Farmers (cols 5-16), Total (cols 17-19).
    ws.mergeCells(r1, 5, r1, 16); ws.getCell(r1, 5).value = 'Farmers';
    ws.mergeCells(r1, 17, r1, 19); ws.getCell(r1, 17).value = 'Total';

    // Row 2 caste groups (cols 5..16).
    ['General', 'OBC', 'SC', 'ST'].forEach((label, i) => {
        const startCol = 5 + i * 3;
        ws.mergeCells(r2, startCol, r2, startCol + 2);
        ws.getCell(r2, startCol).value = label;
    });
    // Total M/F/T span rows 2-3 (cols 17-19).
    ['M', 'F', 'T'].forEach((lab, i) => {
        ws.mergeCells(r2, 17 + i, r3, 17 + i);
        ws.getCell(r2, 17 + i).value = lab;
    });

    // Row 3 M/F/T under each caste group (cols 5..16).
    for (let i = 0; i < 4; i += 1) {
        const startCol = 5 + i * 3;
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

// Full-width Product Type group-header row (e.g. "Cereals"). Returns next row.
function writeProductTypeHeader(ws, rowIdx, name) {
    ws.mergeCells(rowIdx, 1, rowIdx, TOTAL_COLS);
    const c = ws.getCell(rowIdx, 1);
    c.value = name;
    c.font = { bold: true, size: 8 };
    c.alignment = { horizontal: 'left', vertical: 'middle' };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEF2F7' } };
    for (let cc = 1; cc <= TOTAL_COLS; cc += 1) ws.getCell(rowIdx, cc).border = allBorders();
    return rowIdx + 1;
}

function writeCropRow(ws, rowIdx, r) {
    cropRowVals(r).forEach((v, i) => {
        const c = ws.getCell(rowIdx, i + 1);
        c.value = v;
        c.border = allBorders();
        c.font = { size: 8 };
        c.alignment = { horizontal: i <= 1 ? 'left' : 'center', vertical: 'middle' };
    });
}

// Totals row (Sub Total / Total): label merged across Crop+Variety, then figures.
function writeTotalsRow(ws, rowIdx, r, label, fill) {
    ws.mergeCells(rowIdx, 1, rowIdx, 2);
    const vals = [label, null, r.quantityLabel, fmtNum(r.valueRs), ...figureVals(r)];
    // Skip index 1 (col 2, absorbed by the merge); write the rest.
    for (let i = 0; i < vals.length; i += 1) {
        if (i === 1) continue;
        const c = ws.getCell(rowIdx, i + 1);
        c.value = vals[i];
        c.border = allBorders();
        c.font = { size: 8, bold: true };
        c.alignment = { horizontal: i === 0 ? 'left' : 'center', vertical: 'middle' };
        if (fill) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
    }
    // Ensure the merged col-2 cell also gets a border.
    ws.getCell(rowIdx, 2).border = allBorders();
    return rowIdx + 1;
}

async function generateProductionSupplyPageExcelBuffer(reportTitle, payload) {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Production supply', {
        pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
    });

    let row = 1;
    ws.mergeCells(row, 1, row, TOTAL_COLS);
    const t1 = ws.getCell(row, 1);
    t1.value = TITLE;
    t1.font = { bold: true, size: 12 };
    t1.alignment = { horizontal: 'center' };
    row += 2;

    const categories = (payload && payload.categories) || [];
    if (categories.length === 0) {
        ws.getCell(row, 1).value = 'No data found';
        return await wb.xlsx.writeBuffer();
    }

    categories.forEach((cat) => {
        // Category title, e.g. "A. Production of Seed".
        ws.mergeCells(row, 1, row, TOTAL_COLS);
        const kc = ws.getCell(row, 1);
        kc.value = `${cat.letter}. ${cat.categoryName}`;
        kc.font = { bold: true, size: 10 };
        kc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCE6F1' } };
        kc.alignment = { horizontal: 'left' };
        row += 1;

        row = writeGroupedHeader(ws, row);
        (cat.productTypeGroups || []).forEach((g) => {
            row = writeProductTypeHeader(ws, row, g.productTypeName);
            (g.rows || []).forEach((r) => { writeCropRow(ws, row, r); row += 1; });
            row = writeTotalsRow(ws, row, g.subtotal, 'Sub Total', 'FFF1F5F9');
        });
        row = writeTotalsRow(ws, row, cat.total, 'Total', 'FFF5F5F5');
        row += 2;
    });

    ws.getColumn(1).width = 22;
    ws.getColumn(2).width = 16;
    ws.getColumn(3).width = 12;
    ws.getColumn(4).width = 11;
    for (let c = 5; c <= TOTAL_COLS; c += 1) ws.getColumn(c).width = 5.5;

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
            h('Crop', { rowSpan: 3, alignment: AlignmentType.LEFT }),
            h('Variety', { rowSpan: 3, alignment: AlignmentType.LEFT }),
            h('Quantity', { rowSpan: 3 }),
            h('Value (Rs)', { rowSpan: 3 }),
            h('Farmers', { colSpan: 12 }),
            h('Total', { colSpan: 3 }),
        ],
    });

    const castes = ['General', 'OBC', 'SC', 'ST'].map((c) => h(c, { colSpan: 3 }));
    const row2 = new TableRow({
        tableHeader: true,
        children: [...castes, h('M', { rowSpan: 2 }), h('F', { rowSpan: 2 }), h('T', { rowSpan: 2 })],
    });

    const mft = [];
    for (let i = 0; i < 4; i += 1) mft.push(h('M'), h('F'), h('T'));
    const row3 = new TableRow({ tableHeader: true, children: mft });

    return [row1, row2, row3];
}

function buildProductTypeHeaderRow(name) {
    return new TableRow({
        children: [wcell(name, {
            bold: true,
            fill: 'EEF2F7',
            alignment: AlignmentType.LEFT,
            colSpan: TOTAL_COLS,
        })],
    });
}

function buildCropRow(r) {
    return new TableRow({
        children: cropRowVals(r).map((v, i) => wcell(v, {
            alignment: i <= 1 ? AlignmentType.LEFT : AlignmentType.CENTER,
        })),
    });
}

function buildTotalsRow(r, label, fill) {
    const children = [wcell(label, { bold: true, fill, alignment: AlignmentType.LEFT, colSpan: 2 })];
    [r.quantityLabel, fmtNum(r.valueRs), ...figureVals(r)].forEach((v) => {
        children.push(wcell(v, { bold: true, fill, alignment: AlignmentType.CENTER }));
    });
    return new TableRow({ children });
}

function buildCategoryTable(cat) {
    const rows = [...buildHeaderRows()];
    (cat.productTypeGroups || []).forEach((g) => {
        rows.push(buildProductTypeHeaderRow(g.productTypeName));
        (g.rows || []).forEach((r) => rows.push(buildCropRow(r)));
        rows.push(buildTotalsRow(g.subtotal, 'Sub Total', 'F1F5F9'));
    });
    rows.push(buildTotalsRow(cat.total, 'Total', 'F5F5F5'));
    return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows });
}

async function generateProductionSupplyPageWordBuffer(reportTitle, payload) {
    const categories = (payload && payload.categories) || [];

    const children = [
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: TITLE, bold: true, size: 18 })] }),
        new Paragraph({ text: '' }),
    ];

    if (categories.length === 0) {
        children.push(new Paragraph({ children: [tx('No data found')] }));
    } else {
        categories.forEach((cat) => {
            children.push(new Paragraph({
                spacing: { before: 120, after: 40 },
                children: [new TextRun({ text: `${cat.letter}. ${cat.categoryName}`, bold: true, size: 16 })],
            }));
            children.push(buildCategoryTable(cat));
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
    generateProductionSupplyPageExcelBuffer,
    generateProductionSupplyPageWordBuffer,
};
