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

const { NF_DEMONSTRATION_PARAMETER_DEFS } = require('../repositories/reports/naturalFarmingReport/nfDemonstrationConstants.js');
const { normalizeFarmersPracticingExportRow } = require('../repositories/reports/naturalFarmingReport/farmersPracticingReportRepository.js');

const TITLE = 'Natural Farming — Farmers Already Practicing Natural Farming';
const CAPTION = 'Information of Farmer Already Practicing Natural Farming';
const FONT_HP = 14; // 7pt
const TOTAL_COLS = 11;

const LEAD_HEADERS = [
    'Name of Farmer',
    'Address',
    'Contact Number',
    'Name of Activity',
    'Crop',
    'Name of Natural Farming components/Technology demonstrated',
    'Area (ha) in Natural farming practice',
    'Practicing Year Of Natural Farming',
];
const PARAM_HEADERS = ['Name of parameter', 'Without NF practice', 'With NF practice'];
const HEADERS = [...LEAD_HEADERS, ...PARAM_HEADERS];
const NUM_LEAD = LEAD_HEADERS.length; // 8

function fmtNum(v) {
    if (v === null || v === undefined || v === '') return '—';
    const n = Number(v);
    if (!Number.isFinite(n)) return String(v);
    if (Math.abs(n - Math.round(n)) < 1e-9) return String(Math.round(n));
    return String(Number(n.toFixed(4)));
}

function leadVals(rec) {
    return [
        rec.farmerName || '—',
        rec.address || '—',
        rec.contactNumber || '—',
        rec.activityName || '—',
        rec.crop || '—',
        rec.naturalFarmingTechnology || '—',
        rec.areaInHa != null ? fmtNum(rec.areaInHa) : '—',
        rec.farmerPracticeDetails || '—',
    ];
}

function toRows(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.records)) return data.records;
    return data ? [data] : [];
}

// → { groups: [{ kvkName, records:[...] }], isMultiKvk }
function buildGroups(rawData) {
    const records = toRows(rawData).map(normalizeFarmersPracticingExportRow).filter(Boolean);
    const map = new Map();
    for (const r of records) {
        const key = r.kvkName || '—';
        if (!map.has(key)) map.set(key, { kvkName: r.kvkName || '—', records: [] });
        map.get(key).records.push(r);
    }
    const groups = Array.from(map.values());
    return { groups, isMultiKvk: groups.length > 1 };
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

const TAB_COLORS = [
    'FF4F81BD', 'FF9BBB59', 'FFC0504D', 'FF8064A2',
    'FF4BACC6', 'FFF79646', 'FF2C4D75', 'FF77933C',
];

function styleHeader(c) {
    c.font = { bold: true, size: 8 };
    c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8E8E8' } };
    c.border = allBorders();
}

function setCell(ws, r, c, value, opts = {}) {
    const cell = ws.getCell(r, c);
    cell.value = value;
    cell.border = allBorders();
    cell.font = { size: 8, bold: Boolean(opts.bold) };
    cell.alignment = { horizontal: opts.align || 'center', vertical: 'middle', wrapText: true };
    if (opts.fill) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: opts.fill } };
    return cell;
}

// Writes one farmer block; returns next free row.
function writeFarmerBlock(ws, top, rec) {
    // caption
    ws.mergeCells(top, 1, top, TOTAL_COLS);
    const cap = ws.getCell(top, 1);
    cap.value = CAPTION;
    cap.font = { bold: true, size: 9 };
    cap.alignment = { horizontal: 'center' };
    let row = top + 1;

    // header
    HEADERS.forEach((h, i) => { const c = ws.getCell(row, i + 1); c.value = h; styleHeader(c); });
    row += 1;

    const defs = NF_DEMONSTRATION_PARAMETER_DEFS;
    const firstRow = row;
    const lastRow = row + defs.length - 1;
    const lead = leadVals(rec);

    // merge the 8 leading columns across all parameter rows
    for (let c = 1; c <= NUM_LEAD; c += 1) {
        if (defs.length > 1) ws.mergeCells(firstRow, c, lastRow, c);
        setCell(ws, firstRow, c, lead[c - 1], { align: c === 3 || c === 7 ? 'center' : 'left' });
    }
    // parameter rows
    defs.forEach((def, i) => {
        const r = firstRow + i;
        setCell(ws, r, 9, def.label, { align: 'left' });
        setCell(ws, r, 10, fmtNum(rec[def.withoutKey]));
        setCell(ws, r, 11, fmtNum(rec[def.withKey]));
    });
    row = lastRow + 1;

    // feedback row
    setCell(ws, row, 1, 'Farmer Feedback', { bold: true, align: 'left' });
    ws.mergeCells(row, 2, row, TOTAL_COLS);
    setCell(ws, row, 2, rec.farmerFeedback || '—', { align: 'left' });
    row += 1;

    return row + 1; // blank spacer row
}

function setColWidths(ws) {
    const widths = [16, 22, 13, 16, 12, 22, 12, 16, 20, 12, 12];
    widths.forEach((w, i) => { ws.getColumn(i + 1).width = w; });
}

async function generateNfFarmersPracticingExcelBuffer(reportTitle, rawData) {
    const { groups, isMultiKvk } = buildGroups(rawData);
    const wb = new ExcelJS.Workbook();

    if (groups.length === 0) {
        const ws = wb.addWorksheet('NF Farmers Practicing');
        ws.getCell(1, 1).value = reportTitle || TITLE;
        ws.getCell(1, 1).font = { bold: true, size: 12 };
        ws.getCell(3, 1).value = 'No data found';
        return await wb.xlsx.writeBuffer();
    }

    const used = new Set();
    groups.forEach((g, idx) => {
        const ws = wb.addWorksheet(safeSheetName(g.kvkName, used), {
            pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
        });
        if (isMultiKvk) ws.properties.tabColor = { argb: TAB_COLORS[idx % TAB_COLORS.length] };

        let row = 1;
        ws.mergeCells(row, 1, row, TOTAL_COLS);
        const t = ws.getCell(row, 1);
        t.value = reportTitle || TITLE;
        t.font = { bold: true, size: 12 };
        t.alignment = { horizontal: 'center' };
        row += 1;

        ws.mergeCells(row, 1, row, TOTAL_COLS);
        const kc = ws.getCell(row, 1);
        kc.value = g.kvkName;
        kc.font = { bold: true, size: 10 };
        kc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCE6F1' } };
        kc.alignment = { horizontal: 'left' };
        row += 2;

        g.records.forEach((rec) => { row = writeFarmerBlock(ws, row, rec); });
        setColWidths(ws);
    });

    return await wb.xlsx.writeBuffer();
}

// ---------------- Word (7pt, landscape) ----------------

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

function buildHeaderRow() {
    return new TableRow({
        tableHeader: true,
        children: HEADERS.map((t) => wcell(t, { bold: true, fill: 'E8E8E8' })),
    });
}

function buildFarmerTable(rec) {
    const defs = NF_DEMONSTRATION_PARAMETER_DEFS;
    const lead = leadVals(rec);
    const rows = [buildHeaderRow()];

    defs.forEach((def, i) => {
        const cells = [];
        if (i === 0) {
            lead.forEach((v, ci) => cells.push(wcell(v, {
                rowSpan: defs.length,
                alignment: (ci === 2 || ci === 6) ? AlignmentType.CENTER : AlignmentType.LEFT,
            })));
        }
        cells.push(wcell(def.label, { alignment: AlignmentType.LEFT }));
        cells.push(wcell(fmtNum(rec[def.withoutKey])));
        cells.push(wcell(fmtNum(rec[def.withKey])));
        rows.push(new TableRow({ children: cells }));
    });

    rows.push(new TableRow({
        children: [
            wcell('Farmer Feedback', { bold: true, alignment: AlignmentType.LEFT }),
            wcell(rec.farmerFeedback || '—', { colSpan: TOTAL_COLS - 1, alignment: AlignmentType.LEFT }),
        ],
    }));

    return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows });
}

async function generateNfFarmersPracticingWordBuffer(reportTitle, rawData) {
    const { groups } = buildGroups(rawData);

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
            g.records.forEach((rec) => {
                children.push(new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 60, after: 20 },
                    children: [new TextRun({ text: CAPTION, bold: true, size: 15 })],
                }));
                children.push(buildFarmerTable(rec));
                children.push(new Paragraph({ text: '' }));
            });
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
    generateNfFarmersPracticingExcelBuffer,
    generateNfFarmersPracticingWordBuffer,
};
