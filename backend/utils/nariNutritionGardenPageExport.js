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
    buildNariNutritionGardenGroups,
    getGardenValues,
    formatNum,
} = require('../services/reports/formsTemplate/projectTemplates/nariNutritionGardenTemplate.js');

const FONT_HP = 12;
const GARDEN_HEADERS = [
    'S.no',
    'Name of Nutri-Smart Village',
    'Activity Type',
    'Type of Nutritional Garden',
    'Number',
    'Area(sqm)',
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
const PRODUCTION_HEADERS = [
    'Sr.No',
    'Name of Crops',
    'Varieties',
    'Area Grown(sqm)',
    'Production(kg)',
    'Consumption(kg)',
    'Sell of Produce(kg)',
    'Income from Sell of Produce (Rs)',
];
const TAB_COLORS = [
    'FF4F81BD', 'FF9BBB59', 'FFC0504D', 'FF8064A2',
    'FF4BACC6', 'FFF79646', 'FF2C4D75', 'FF77933C',
];

function allBorders() {
    const s = { style: 'thin', color: { argb: 'FF000000' } };
    return { top: s, left: s, bottom: s, right: s };
}

function safeSheetName(group, used) {
    const raw = `${group.stateName || 'State'} ${group.districtName || 'District'} ${group.kvkName || 'KVK'}`;
    const base = raw.replace(/[\\/?*[\]:]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 28) || 'KVK';
    let candidate = base;
    let i = 2;
    while (used.has(candidate.toLowerCase())) candidate = `${base.slice(0, 25)} ${i++}`;
    used.add(candidate.toLowerCase());
    return candidate;
}

function flattenKvkGroups(groups) {
    const flat = [];
    groups.forEach((state) => {
        state.districts.forEach((district) => {
            district.kvks.forEach((kvk) => {
                flat.push({
                    stateName: state.stateName,
                    districtName: district.districtName,
                    kvkName: kvk.kvkName,
                    rows: kvk.rows,
                });
            });
        });
    });
    return flat;
}

function gardenRowValues(row, idx) {
    const v = getGardenValues(row);
    return [
        idx + 1,
        v.village,
        v.activity,
        v.gardenType,
        v.number,
        v.areaSqm,
        v.generalM,
        v.generalF,
        v.generalT,
        v.obcM,
        v.obcF,
        v.obcT,
        v.scM,
        v.scF,
        v.scT,
        v.stM,
        v.stF,
        v.stT,
        v.totalM,
        v.totalF,
        v.totalT,
    ];
}

function productionRows(rows) {
    const out = [];
    rows.forEach((row) => {
        const resultList = Array.isArray(row.results) ? row.results : [];
        resultList.forEach((r) => {
            out.push([
                out.length + 1,
                r.cropName || '-',
                r.variety || '-',
                formatNum(r.areaSqm),
                formatNum(r.productionKg),
                formatNum(r.consumptionKg),
                formatNum(r.sellKg),
                formatNum(r.income),
            ]);
        });
    });
    return out.length ? out : [['-', 'No record found', '-', '-', '-', '-', '-', '-']];
}

function styleExcelRow(row, { header = false, fill = null } = {}) {
    row.eachCell((cell) => {
        cell.border = allBorders();
        cell.font = { size: header ? 7 : 6, bold: header };
        cell.alignment = { horizontal: header ? 'center' : 'left', vertical: 'middle', wrapText: true };
        if (fill) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
    });
}

function addMergedExcelRow(ws, text, colCount, fill) {
    const row = ws.addRow([text]);
    ws.mergeCells(row.number, 1, row.number, colCount);
    row.getCell(1).font = { bold: true, size: 10 };
    row.getCell(1).alignment = { horizontal: 'left', wrapText: true };
    if (fill) row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
    return row;
}

function writeExcelKvkSheet(ws, title, group) {
    addMergedExcelRow(ws, title, GARDEN_HEADERS.length).getCell(1).alignment = { horizontal: 'center' };
    addMergedExcelRow(ws, `State: ${group.stateName}`, GARDEN_HEADERS.length, 'FFD9EAD3');
    addMergedExcelRow(ws, `District: ${group.districtName}`, GARDEN_HEADERS.length, 'FFEAF4E4');
    addMergedExcelRow(ws, `KVK: ${group.kvkName}`, GARDEN_HEADERS.length, 'FFDCE6F1');
    ws.addRow([]);
    addMergedExcelRow(ws, 'Details of Established Nutrition Garden in Nutri-Smart Village', GARDEN_HEADERS.length);
    styleExcelRow(ws.addRow(GARDEN_HEADERS), { header: true, fill: 'FFE8E8E8' });
    group.rows.forEach((row, idx) => styleExcelRow(ws.addRow(gardenRowValues(row, idx))));
    ws.addRow([]);
    addMergedExcelRow(ws, 'Production and Consumption of Nutrition Garden Crops of Each Beneficiary', GARDEN_HEADERS.length);
    styleExcelRow(ws.addRow(PRODUCTION_HEADERS), { header: true, fill: 'FFE8E8E8' });
    productionRows(group.rows).forEach((row) => styleExcelRow(ws.addRow(row)));

    const widths = [6, 22, 18, 20, 8, 9, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 8, 8, 8];
    widths.forEach((width, idx) => { ws.getColumn(idx + 1).width = width; });
    ws.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 };
}

async function generateNariNutritionGardenExcelBuffer(reportTitle, rawData) {
    const workbook = new ExcelJS.Workbook();
    const kvkGroups = flattenKvkGroups(buildNariNutritionGardenGroups(rawData));
    if (kvkGroups.length === 0) {
        const ws = workbook.addWorksheet('Nutrition Garden');
        ws.addRow([reportTitle || 'Nutrition Garden']);
        ws.addRow(['No data found']);
        return workbook.xlsx.writeBuffer();
    }

    const used = new Set();
    kvkGroups.forEach((group, idx) => {
        const ws = workbook.addWorksheet(safeSheetName(group, used), {
            properties: { tabColor: { argb: TAB_COLORS[idx % TAB_COLORS.length] } },
        });
        writeExcelKvkSheet(ws, reportTitle || 'Nutrition Garden', group);
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
                children: row.map((value, idx) => wcell(value, { align: idx <= 3 ? AlignmentType.LEFT : AlignmentType.CENTER })),
            })),
        ],
    });
}

async function generateNariNutritionGardenWordBuffer(reportTitle, rawData) {
    const kvkGroups = flattenKvkGroups(buildNariNutritionGardenGroups(rawData));
    const children = [
        para(reportTitle || 'Nutrition Garden', { bold: true, size: 16, align: AlignmentType.CENTER, before: 0 }),
    ];

    if (kvkGroups.length === 0) {
        children.push(para('No data found'));
    } else {
        kvkGroups.forEach((group) => {
            children.push(para(`State: ${group.stateName}`, { bold: true, fill: 'D9EAD3', size: 14 }));
            children.push(para(`District: ${group.districtName}`, { bold: true, fill: 'EAF4E4', size: 13 }));
            children.push(para(`KVK: ${group.kvkName}`, { bold: true, fill: 'DCE6F1', size: 13 }));
            children.push(para('Details of Established Nutrition Garden in Nutri-Smart Village', { bold: true, size: 12 }));
            children.push(wordTable(GARDEN_HEADERS, group.rows.map(gardenRowValues)));
            children.push(para('Production and Consumption of Nutrition Garden Crops of Each Beneficiary', { bold: true, size: 12 }));
            children.push(wordTable(PRODUCTION_HEADERS, productionRows(group.rows)));
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
    generateNariNutritionGardenExcelBuffer,
    generateNariNutritionGardenWordBuffer,
};
