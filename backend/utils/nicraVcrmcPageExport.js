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
    buildNicraVcrmcGroups,
    fmtDate,
} = require('../services/reports/formsTemplate/projectTemplates/nicraVcrmcTemplate.js');

const TITLE = 'NICRA — Village-wise VCRMC';
const FONT_HP = 12; // 6pt
const TOTAL_COLS = 11;

// Distinct tab colours cycled per KVK so admins can tell groups apart.
const TAB_COLORS = [
    'FF4F81BD', 'FF9BBB59', 'FFC0504D', 'FF8064A2',
    'FF4BACC6', 'FFF79646', 'FF2C4D75', 'FF77933C',
];

// [value, alignLeft?] per column
function rowVals(r, idx) {
    return [
        idx + 1,
        r.villageName || '—',
        fmtDate(r.constitutionDate),
        Number(r.maleMembers || 0),
        Number(r.femaleMembers || 0),
        Number(r.membersTotal || 0),
        Number(r.meetingsOrganized || 0),
        fmtDate(r.meetingDate),
        r.nameOfSecretary || '—',
        r.nameOfPresident || '—',
        r.majorDecisionTaken || '—',
    ];
}
const LEFT_COLS = new Set([1, 8, 9, 10]); // village, secretary, president, decision

// ---------------- Excel ----------------

function allBorders() {
    const s = { style: 'thin', color: { argb: 'FF000000' } };
    return { top: s, left: s, bottom: s, right: s };
}

function safeSheetName(name, used) {
    let base = String(name || 'KVK').replace(/[\\/?*[\]:]/g, ' ').trim().slice(0, 28) || 'KVK';
    let candidate = base;
    let i = 2;
    while (used.has(candidate.toLowerCase())) candidate = `${base.slice(0, 25)} ${i++}`;
    used.add(candidate.toLowerCase());
    return candidate;
}

function styleHeader(c) {
    c.font = { bold: true, size: 7 };
    c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8E8E8' } };
    c.border = allBorders();
}

// 2-row grouped header mirroring the PDF. Returns next free row.
function writeHeader(ws, top) {
    const r1 = top; const r2 = top + 1;

    // single-row-spanning (merge vertically across r1..r2)
    ws.mergeCells(r1, 1, r2, 1); ws.getCell(r1, 1).value = 'S.No.';
    ws.mergeCells(r1, 2, r2, 2); ws.getCell(r1, 2).value = 'Village name';
    ws.mergeCells(r1, 3, r2, 3); ws.getCell(r1, 3).value = 'VCRMC Constitution date';
    ws.mergeCells(r1, 4, r1, 6); ws.getCell(r1, 4).value = 'VCRMC members (no.)';
    ws.getCell(r2, 4).value = 'Male'; ws.getCell(r2, 5).value = 'Female'; ws.getCell(r2, 6).value = 'Total';
    ws.mergeCells(r1, 7, r2, 7); ws.getCell(r1, 7).value = 'Meetings organized by VCRMC (no.)';
    ws.mergeCells(r1, 8, r2, 8); ws.getCell(r1, 8).value = 'Date of VCRMC meeting';
    ws.mergeCells(r1, 9, r2, 9); ws.getCell(r1, 9).value = 'Name of Secretary';
    ws.mergeCells(r1, 10, r2, 10); ws.getCell(r1, 10).value = 'Name of President';
    ws.mergeCells(r1, 11, r2, 11); ws.getCell(r1, 11).value = 'Major decision taken';

    for (let rr = r1; rr <= r2; rr += 1) for (let cc = 1; cc <= TOTAL_COLS; cc += 1) styleHeader(ws.getCell(rr, cc));
    return r2 + 1;
}

function writeDataRow(ws, rowIdx, vals) {
    vals.forEach((v, i) => {
        const c = ws.getCell(rowIdx, i + 1);
        c.value = v;
        c.border = allBorders();
        c.font = { size: 7 };
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

    row = writeHeader(ws, row);
    g.rows.forEach((r, idx) => { writeDataRow(ws, row, rowVals(r, idx)); row += 1; });

    const widths = [5, 18, 13, 7, 7, 7, 10, 13, 16, 16, 22];
    widths.forEach((w, i) => { ws.getColumn(i + 1).width = w; });
}

async function generateNicraVcrmcExcelBuffer(reportTitle, rawData) {
    const { groups, isMultiKvk } = buildNicraVcrmcGroups(rawData);
    const wb = new ExcelJS.Workbook();

    if (groups.length === 0) {
        const ws = wb.addWorksheet('NICRA VCRMC');
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

// ---------------- Word (6pt) ----------------

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
            h('Village name', { rowSpan: 2 }),
            h('VCRMC Constitution date', { rowSpan: 2 }),
            h('VCRMC members (no.)', { colSpan: 3 }),
            h('Meetings organized by VCRMC (no.)', { rowSpan: 2 }),
            h('Date of VCRMC meeting', { rowSpan: 2 }),
            h('Name of Secretary', { rowSpan: 2 }),
            h('Name of President', { rowSpan: 2 }),
            h('Major decision taken', { rowSpan: 2 }),
        ],
    });
    const row2 = new TableRow({ tableHeader: true, children: [h('Male'), h('Female'), h('Total')] });
    return [row1, row2];
}

function buildGroupTable(g) {
    const bodyRows = g.rows.map((r, idx) => new TableRow({
        children: rowVals(r, idx).map((v, i) => wcell(v, {
            alignment: LEFT_COLS.has(i) ? AlignmentType.LEFT : AlignmentType.CENTER,
        })),
    }));
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [...buildHeaderRows(), ...bodyRows],
    });
}

async function generateNicraVcrmcWordBuffer(reportTitle, rawData) {
    const { groups } = buildNicraVcrmcGroups(rawData);

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
        sections: [{
            properties: { page: { size: { orientation: PageOrientation.LANDSCAPE } } },
            children,
        }],
    });

    return await Packer.toBuffer(doc);
}

module.exports = {
    generateNicraVcrmcExcelBuffer,
    generateNicraVcrmcWordBuffer,
};
