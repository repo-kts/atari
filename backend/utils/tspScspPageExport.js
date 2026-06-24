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
    buildTspKvkGroups,
    buildScspKvkGroups,
} = require('../services/reports/formsTemplate/projectTemplates/tspScspTemplate.js');

const FONT_HP = 12; // 6pt
const TOTAL_COLS = 7; // widest table (location) drives the sheet width

const OUTCOME_DESCS = [
    'Change in family income',
    'Change in family consumption level',
    'Change in availability of agricultural implements/ tools etc.',
];

function outcomeList(outcomes) {
    if (!outcomes) return [];
    return [
        { desc: OUTCOME_DESCS[0], unit: outcomes.familyIncome?.unit || '%', val: outcomes.familyIncome?.achievement },
        { desc: OUTCOME_DESCS[1], unit: outcomes.consumptionLevel?.unit || '%', val: outcomes.consumptionLevel?.achievement },
        { desc: OUTCOME_DESCS[2], unit: outcomes.implementsAvailability?.unit || '%', val: outcomes.implementsAvailability?.achievement },
    ];
}

const TAB_COLORS = [
    'FF4F81BD', 'FF9BBB59', 'FFC0504D', 'FF8064A2',
    'FF4BACC6', 'FFF79646', 'FF2C4D75', 'FF77933C',
];

function safeSheetName(name, used) {
    const base = String(name || 'KVK').replace(/[\\/?*[\]:]/g, ' ').trim().slice(0, 28) || 'KVK';
    let candidate = base;
    let i = 2;
    while (used.has(candidate.toLowerCase())) candidate = `${base.slice(0, 25)} ${i++}`;
    used.add(candidate.toLowerCase());
    return candidate;
}

/* ── Excel ─────────────────────────────────────────────────────────────────── */

function allBorders() {
    const s = { style: 'thin', color: { argb: 'FF000000' } };
    return { top: s, left: s, bottom: s, right: s };
}

function cell(ws, r, c, value, opts = {}) {
    const x = ws.getCell(r, c);
    x.value = value;
    x.border = allBorders();
    x.font = { size: 9, bold: Boolean(opts.bold) };
    x.alignment = { horizontal: opts.align || 'center', vertical: 'middle', wrapText: true };
    if (opts.fill) x.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: opts.fill } };
    return x;
}

function heading(ws, row, text) {
    ws.mergeCells(row, 1, row, TOTAL_COLS);
    const c = ws.getCell(row, 1);
    c.value = text;
    c.font = { bold: true, size: 9 };
    c.alignment = { horizontal: 'left' };
    return row + 1;
}

function writeActivities(ws, row, activities) {
    cell(ws, row, 1, 'Sl. No', { bold: true, fill: 'FFE8E8E8' });
    cell(ws, row, 2, 'Activities', { bold: true, fill: 'FFE8E8E8' });
    ws.mergeCells(row, 3, row, 4);
    cell(ws, row, 3, 'Physical Achievement', { bold: true, fill: 'FFE8E8E8' });
    cell(ws, row, 4, 'Physical Achievement', { bold: true, fill: 'FFE8E8E8' });
    row += 1;

    (activities || []).forEach((act, i) => {
        ws.mergeCells(row, 1, row + 1, 1);
        cell(ws, row, 1, i + 1);
        ws.mergeCells(row, 2, row + 1, 2);
        cell(ws, row, 2, act.activityName || `Activity ${i + 1}`, { align: 'left' });
        cell(ws, row, 3, 'Nos.');
        cell(ws, row, 4, 'No. of Beneficiaries');
        cell(ws, row + 1, 3, act.noOfTrainings ?? '-');
        cell(ws, row + 1, 4, act.noOfBeneficiaries ?? '-');
        row += 2;
    });
    return row + 1;
}

function writeOutcomes(ws, row, outcomes) {
    ['Sl. No.', 'Description', 'Unit', 'Achievements'].forEach((h, i) => cell(ws, row, i + 1, h, { bold: true, fill: 'FFE8E8E8' }));
    row += 1;
    outcomeList(outcomes).forEach((o, i) => {
        cell(ws, row, 1, `${i + 1}.`);
        cell(ws, row, 2, o.desc, { align: 'left' });
        cell(ws, row, 3, o.unit);
        cell(ws, row, 4, o.val != null ? o.val : '-');
        row += 1;
    });
    return row + 1;
}

function writeLocation(ws, row, locationDetails) {
    const r1 = row; const r2 = row + 1;
    ws.mergeCells(r1, 1, r2, 1); cell(ws, r1, 1, 'District', { bold: true, fill: 'FFE8E8E8' });
    ws.mergeCells(r1, 2, r2, 2); cell(ws, r1, 2, 'Subdistrict', { bold: true, fill: 'FFE8E8E8' });
    ws.mergeCells(r1, 3, r2, 3); cell(ws, r1, 3, 'No. of Villages Covered', { bold: true, fill: 'FFE8E8E8' });
    ws.mergeCells(r1, 4, r2, 4); cell(ws, r1, 4, 'Name of Village(s) Covered', { bold: true, fill: 'FFE8E8E8' });
    ws.mergeCells(r1, 5, r1, 7); cell(ws, r1, 5, 'ST Population Benefitted (No.)', { bold: true, fill: 'FFE8E8E8' });
    cell(ws, r1, 6, 'ST Population Benefitted (No.)', { bold: true, fill: 'FFE8E8E8' });
    cell(ws, r1, 7, 'ST Population Benefitted (No.)', { bold: true, fill: 'FFE8E8E8' });
    cell(ws, r2, 5, 'M', { bold: true, fill: 'FFE8E8E8' });
    cell(ws, r2, 6, 'F', { bold: true, fill: 'FFE8E8E8' });
    cell(ws, r2, 7, 'T', { bold: true, fill: 'FFE8E8E8' });
    row = r2 + 1;

    (locationDetails || []).forEach((loc) => {
        cell(ws, row, 1, loc.districtName || '-', { align: 'left' });
        cell(ws, row, 2, loc.subDistrict || '-', { align: 'left' });
        cell(ws, row, 3, loc.villagesCount ?? '-');
        cell(ws, row, 4, loc.villageNames || '-', { align: 'left' });
        cell(ws, row, 5, loc.stMale ?? '-');
        cell(ws, row, 6, loc.stFemale ?? '-');
        cell(ws, row, 7, loc.stTotal ?? '-');
        row += 1;
    });
    return row + 1;
}

function setColWidths(ws) {
    const widths = [8, 26, 18, 28, 8, 8, 8];
    widths.forEach((w, i) => { ws.getColumn(i + 1).width = w; });
}

function writeKvkTab(wb, g, reportTitle, kind, isMultiKvk, idx, used) {
    const ws = wb.addWorksheet(safeSheetName(g.kvkName, used), {
        pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
    });
    if (isMultiKvk) ws.properties.tabColor = { argb: TAB_COLORS[idx % TAB_COLORS.length] };

    let row = 1;
    ws.mergeCells(row, 1, row, TOTAL_COLS);
    const t = ws.getCell(row, 1);
    t.value = reportTitle;
    t.font = { bold: true, size: 12 };
    t.alignment = { horizontal: 'center' };
    row += 2;

    ws.mergeCells(row, 1, row, TOTAL_COLS);
    const kc = ws.getCell(row, 1);
    kc.value = g.kvkName;
    kc.font = { bold: true, size: 10 };
    kc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCE6F1' } };
    kc.alignment = { horizontal: 'left' };
    row += 2;

    const d = g.data;
    if (kind === 'TSP') {
        row = heading(ws, row, 'a. Achievements of physical output under TSP');
        row = writeActivities(ws, row, d.activities);
        row = heading(ws, row, `b. Fund received under TSP (Rs. In lakh): ${d.fundsReceived != null ? d.fundsReceived : '-'}`);
        row += 1;
        row = heading(ws, row, 'c. Achievements of physical outcome under TSP');
        row = writeOutcomes(ws, row, d.outcomes);
        row = heading(ws, row, 'd. Location and Beneficiary Details');
        row = writeLocation(ws, row, d.locationDetails);
    } else {
        row = heading(ws, row, 'a. Achievements of physical output under SCSP');
        row = writeActivities(ws, row, d.activities);
    }
    setColWidths(ws);
}

async function buildExcel(reportTitle, groups, isMultiKvk, kind, emptyMsg) {
    const wb = new ExcelJS.Workbook();
    if (groups.length === 0) {
        const ws = wb.addWorksheet(kind);
        ws.getCell(1, 1).value = reportTitle;
        ws.getCell(1, 1).font = { bold: true, size: 12 };
        ws.getCell(3, 1).value = emptyMsg;
        return await wb.xlsx.writeBuffer();
    }
    const used = new Set();
    groups.forEach((g, idx) => writeKvkTab(wb, g, reportTitle, kind, isMultiKvk, idx, used));
    return await wb.xlsx.writeBuffer();
}

/* ── Word ──────────────────────────────────────────────────────────────────── */

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

function hpara(text) {
    return new Paragraph({ spacing: { before: 80, after: 30 }, children: [tx(text, { bold: true, size: 13 })] });
}

function activitiesTable(activities) {
    const rows = [new TableRow({
        tableHeader: true,
        children: [
            wcell('Sl. No', { bold: true, fill: 'E8E8E8' }),
            wcell('Activities', { bold: true, fill: 'E8E8E8' }),
            wcell('Physical Achievement', { bold: true, fill: 'E8E8E8', colSpan: 2 }),
        ],
    })];
    (activities || []).forEach((act, i) => {
        rows.push(new TableRow({
            children: [
                wcell(i + 1, { rowSpan: 2 }),
                wcell(act.activityName || `Activity ${i + 1}`, { rowSpan: 2, alignment: AlignmentType.LEFT }),
                wcell('Nos.'),
                wcell('No. of Beneficiaries'),
            ],
        }));
        rows.push(new TableRow({
            children: [wcell(act.noOfTrainings ?? '-'), wcell(act.noOfBeneficiaries ?? '-')],
        }));
    });
    return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows });
}

function outcomesTable(outcomes) {
    const rows = [new TableRow({
        tableHeader: true,
        children: ['Sl. No.', 'Description', 'Unit', 'Achievements'].map(h => wcell(h, { bold: true, fill: 'E8E8E8' })),
    })];
    outcomeList(outcomes).forEach((o, i) => {
        rows.push(new TableRow({
            children: [
                wcell(`${i + 1}.`),
                wcell(o.desc, { alignment: AlignmentType.LEFT }),
                wcell(o.unit),
                wcell(o.val != null ? o.val : '-'),
            ],
        }));
    });
    return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows });
}

function locationTable(locationDetails) {
    const rows = [
        new TableRow({
            tableHeader: true,
            children: [
                wcell('District', { bold: true, fill: 'E8E8E8', rowSpan: 2 }),
                wcell('Subdistrict', { bold: true, fill: 'E8E8E8', rowSpan: 2 }),
                wcell('No. of Villages Covered', { bold: true, fill: 'E8E8E8', rowSpan: 2 }),
                wcell('Name of Village(s) Covered', { bold: true, fill: 'E8E8E8', rowSpan: 2 }),
                wcell('ST Population Benefitted (No.)', { bold: true, fill: 'E8E8E8', colSpan: 3 }),
            ],
        }),
        new TableRow({
            tableHeader: true,
            children: [wcell('M', { bold: true, fill: 'E8E8E8' }), wcell('F', { bold: true, fill: 'E8E8E8' }), wcell('T', { bold: true, fill: 'E8E8E8' })],
        }),
    ];
    (locationDetails || []).forEach((loc) => {
        rows.push(new TableRow({
            children: [
                wcell(loc.districtName || '-', { alignment: AlignmentType.LEFT }),
                wcell(loc.subDistrict || '-', { alignment: AlignmentType.LEFT }),
                wcell(loc.villagesCount ?? '-'),
                wcell(loc.villageNames || '-', { alignment: AlignmentType.LEFT }),
                wcell(loc.stMale ?? '-'),
                wcell(loc.stFemale ?? '-'),
                wcell(loc.stTotal ?? '-'),
            ],
        }));
    });
    return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows });
}

async function buildWord(reportTitle, groups, kind, emptyMsg) {
    const children = [
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: reportTitle, bold: true, size: 16 })] }),
        new Paragraph({ children: [tx(kind === 'TSP' ? '2.23.1 – Details of Tribal Sub Plan (TSP)' : '2.23.2 – Details of Scheduled Caste Sub Plan (SCSP)', { bold: true, size: 15 })] }),
        new Paragraph({ text: '' }),
    ];

    if (groups.length === 0) {
        children.push(new Paragraph({ children: [tx(emptyMsg)] }));
    } else {
        groups.forEach((g) => {
            const d = g.data;
            children.push(new Paragraph({
                spacing: { before: 140, after: 40 },
                shading: { fill: 'DCE6F1' },
                children: [tx(g.kvkName, { bold: true, size: 14 })],
            }));
            if (kind === 'TSP') {
                children.push(hpara('a. Achievements of physical output under TSP'));
                children.push(activitiesTable(d.activities));
                children.push(hpara(`b. Fund received under TSP (Rs. In lakh): ${d.fundsReceived != null ? d.fundsReceived : '-'}`));
                children.push(hpara('c. Achievements of physical outcome under TSP'));
                children.push(outcomesTable(d.outcomes));
                children.push(hpara('d. Location and Beneficiary Details'));
                children.push(locationTable(d.locationDetails));
            } else {
                children.push(hpara('a. Achievements of physical output under SCSP'));
                children.push(activitiesTable(d.activities));
            }
            children.push(new Paragraph({ text: '' }));
        });
    }

    const doc = new Document({
        styles: { default: { document: { run: { size: FONT_HP } } } },
        sections: [{
            properties: {
                page: {
                    size: { orientation: PageOrientation.LANDSCAPE },
                    margin: { top: 360, right: 360, bottom: 360, left: 360 },
                },
            },
            children,
        }],
    });
    return await Packer.toBuffer(doc);
}

/* ── public API ────────────────────────────────────────────────────────────── */

async function generateTspExcelBuffer(reportTitle, rawData) {
    const { groups, isMultiKvk } = buildTspKvkGroups(rawData);
    return buildExcel(reportTitle || 'Tribal Sub Plan (TSP) Activities', groups, isMultiKvk, 'TSP', 'No TSP data found');
}
async function generateTspWordBuffer(reportTitle, rawData) {
    const { groups } = buildTspKvkGroups(rawData);
    return buildWord(reportTitle || 'Tribal Sub Plan (TSP) Activities', groups, 'TSP', 'No TSP data found');
}
async function generateScspExcelBuffer(reportTitle, rawData) {
    const { groups, isMultiKvk } = buildScspKvkGroups(rawData);
    return buildExcel(reportTitle || 'Scheduled Caste Sub Plan (SCSP) Activities', groups, isMultiKvk, 'SCSP', 'No SCSP data found');
}
async function generateScspWordBuffer(reportTitle, rawData) {
    const { groups } = buildScspKvkGroups(rawData);
    return buildWord(reportTitle || 'Scheduled Caste Sub Plan (SCSP) Activities', groups, 'SCSP', 'No SCSP data found');
}

module.exports = {
    generateTspExcelBuffer,
    generateTspWordBuffer,
    generateScspExcelBuffer,
    generateScspWordBuffer,
};
