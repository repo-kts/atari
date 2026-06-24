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
    buildNariBioFortifiedKvkGroups,
    fmt,
    num,
} = require('../services/reports/formsTemplate/projectTemplates/nariBioFortifiedTemplate.js');

const FONT_HP = 12;
const TABLE1_HEADERS = [
    'S.no.',
    'Name of Nutri-Smart Village',
    'Season',
    'Activity Type',
    'Category of Crop',
    'Name of Crop',
    'Variety',
    'Area(ha)',
    'General M',
    'General F',
    'General T',
    'OBC M',
    'OBC F',
    'OBC T',
    'SC M',
    'SC F',
    'SC T',
    'ST M',
    'ST F',
    'ST T',
    'Grand Total M',
    'Grand Total F',
    'Grand Total T',
];
const TABLE2_HEADERS = [
    'Sr.No.',
    'Name of Bio-fortified Crops',
    'Varieties',
    'Area Grown(sqm)',
    'Production/yield',
    'Consumption (gm/day/person)',
    'Form of Consumption',
    'No. of Days of Consumption in a Year',
];
const TAB_COLORS = [
    'FF4F81BD', 'FF9BBB59', 'FFC0504D', 'FF8064A2',
    'FF4BACC6', 'FFF79646', 'FF2C4D75', 'FF77933C',
];

function allBorders() {
    const s = { style: 'thin', color: { argb: 'FF000000' } };
    return { top: s, left: s, bottom: s, right: s };
}

function safeSheetName(name, used) {
    const base = String(name || 'KVK').replace(/[\\/?*[\]:]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 28) || 'KVK';
    let candidate = base;
    let i = 2;
    while (used.has(candidate.toLowerCase())) candidate = `${base.slice(0, 25)} ${i++}`;
    used.add(candidate.toLowerCase());
    return candidate;
}

function table1Row(row, idx) {
    const generalM = num(row.generalM ?? row.genMale);
    const generalF = num(row.generalF ?? row.genFemale);
    const generalT = num(row.generalT) || (generalM + generalF);
    const obcM = num(row.obcM ?? row.obcMale);
    const obcF = num(row.obcF ?? row.obcFemale);
    const obcT = num(row.obcT) || (obcM + obcF);
    const scM = num(row.scM ?? row.scMale);
    const scF = num(row.scF ?? row.scFemale);
    const scT = num(row.scT) || (scM + scF);
    const stM = num(row.stM ?? row.stMale);
    const stF = num(row.stF ?? row.stFemale);
    const stT = num(row.stT) || (stM + stF);
    const grandM = num(row.grandM) || (generalM + obcM + scM + stM);
    const grandF = num(row.grandF) || (generalF + obcF + scF + stF);

    return [
        idx + 1,
        row.nameOfNutriSmartVillage || row.villageName || '-',
        row.seasonName || '-',
        row.activityName || '-',
        row.cropCategoryName || row.cropCategory || '-',
        row.nameOfCrop || row.cropName || '-',
        row.variety || '-',
        fmt(row.areaHa),
        generalM,
        generalF,
        generalT,
        obcM,
        obcF,
        obcT,
        scM,
        scF,
        scT,
        stM,
        stF,
        stT,
        grandM,
        grandF,
        grandM + grandF,
    ];
}

function table2Rows(rows) {
    const resultRows = rows.flatMap(row => (Array.isArray(row.results) ? row.results : []));
    if (resultRows.length === 0) return [['-', 'No records found.', '-', '-', '-', '-', '-', '-']];
    return resultRows.map((row, idx) => [
        idx + 1,
        row.cropName || '-',
        row.variety || '-',
        fmt(row.areaHa),
        fmt(row.productionKg),
        fmt(row.consumptionGm),
        row.formOfConsumption || '-',
        fmt(row.daysInYear),
    ]);
}

function styleExcelRow(row, { header = false, fill = null } = {}) {
    row.eachCell((cell) => {
        cell.border = allBorders();
        cell.font = { size: header ? 7 : 6, bold: header };
        cell.alignment = { horizontal: header ? 'center' : 'left', vertical: 'middle', wrapText: true };
        if (fill) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
    });
}

function mergedRow(ws, text, cols, fill = null) {
    const row = ws.addRow([text]);
    ws.mergeCells(row.number, 1, row.number, cols);
    const cell = row.getCell(1);
    cell.font = { bold: true, size: 10 };
    cell.alignment = { horizontal: 'left', wrapText: true };
    if (fill) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
    return row;
}

function writeExcelSheet(ws, title, group) {
    mergedRow(ws, title, TABLE1_HEADERS.length).getCell(1).alignment = { horizontal: 'center' };
    mergedRow(ws, `KVK: ${group.kvkName}`, TABLE1_HEADERS.length, 'FFDCE6F1');
    ws.addRow([]);
    mergedRow(ws, 'Details of Bio-fortified Crops used in Nutri-Smart Village', TABLE1_HEADERS.length);
    styleExcelRow(ws.addRow(TABLE1_HEADERS), { header: true, fill: 'FFE8E8E8' });
    group.rows.forEach((row, idx) => styleExcelRow(ws.addRow(table1Row(row, idx))));
    ws.addRow([]);
    mergedRow(ws, 'Details of Consumption Pattern of Bio-fortified Crops each Beneficiary', TABLE1_HEADERS.length);
    styleExcelRow(ws.addRow(TABLE2_HEADERS), { header: true, fill: 'FFE8E8E8' });
    table2Rows(group.rows).forEach(row => styleExcelRow(ws.addRow(row)));

    const widths = [6, 22, 10, 16, 16, 16, 14, 8, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 8, 8, 8];
    widths.forEach((width, idx) => { ws.getColumn(idx + 1).width = width; });
    ws.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 };
}

async function generateNariBioFortifiedExcelBuffer(reportTitle, rawData) {
    const workbook = new ExcelJS.Workbook();
    const groups = buildNariBioFortifiedKvkGroups(rawData);
    if (groups.length === 0) {
        const ws = workbook.addWorksheet('Bio-fortified');
        ws.addRow([reportTitle || 'Bio-fortified Crops']);
        ws.addRow(['No data found']);
        return workbook.xlsx.writeBuffer();
    }
    const used = new Set();
    groups.forEach((group, idx) => {
        const ws = workbook.addWorksheet(safeSheetName(group.kvkName, used), {
            properties: { tabColor: { argb: TAB_COLORS[idx % TAB_COLORS.length] } },
        });
        writeExcelSheet(ws, reportTitle || 'Bio-fortified Crops', group);
    });
    return workbook.xlsx.writeBuffer();
}

function tx(text, opts = {}) {
    return new TextRun({ text: String(text ?? ''), size: opts.size || FONT_HP, bold: Boolean(opts.bold) });
}

function para(text, opts = {}) {
    return new Paragraph({
        spacing: { before: opts.before ?? 80, after: opts.after ?? 40 },
        shading: opts.fill ? { fill: opts.fill } : undefined,
        alignment: opts.align || AlignmentType.LEFT,
        children: [tx(text, { bold: opts.bold, size: opts.size })],
    });
}

function wcell(text, opts = {}) {
    return new TableCell({
        children: [new Paragraph({
            alignment: opts.align || AlignmentType.CENTER,
            spacing: { before: 0, after: 0 },
            children: [tx(text, { bold: opts.bold, size: opts.size || FONT_HP })],
        })],
        shading: opts.fill ? { fill: opts.fill } : undefined,
    });
}

function wordTable(headers, rows) {
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({
                tableHeader: true,
                children: headers.map(header => wcell(header, { bold: true, fill: 'E8E8E8', size: 11 })),
            }),
            ...rows.map(row => new TableRow({
                children: row.map((value, idx) => wcell(value, { align: idx <= 6 ? AlignmentType.LEFT : AlignmentType.CENTER })),
            })),
        ],
    });
}

async function generateNariBioFortifiedWordBuffer(reportTitle, rawData) {
    const groups = buildNariBioFortifiedKvkGroups(rawData);
    const children = [
        para(reportTitle || 'Bio-fortified Crops', { bold: true, size: 16, align: AlignmentType.CENTER, before: 0 }),
    ];

    if (groups.length === 0) {
        children.push(para('No data found'));
    } else {
        groups.forEach((group) => {
            children.push(para(`KVK: ${group.kvkName}`, { bold: true, fill: 'DCE6F1', size: 13 }));
            children.push(para('Details of Bio-fortified Crops used in Nutri-Smart Village', { bold: true, size: 12 }));
            children.push(wordTable(TABLE1_HEADERS, group.rows.map(table1Row)));
            children.push(para('Details of Consumption Pattern of Bio-fortified Crops each Beneficiary', { bold: true, size: 12 }));
            children.push(wordTable(TABLE2_HEADERS, table2Rows(group.rows)));
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
    return Packer.toBuffer(doc);
}

module.exports = {
    generateNariBioFortifiedExcelBuffer,
    generateNariBioFortifiedWordBuffer,
};
