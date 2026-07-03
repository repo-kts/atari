const ExcelJS = require('exceljs');
const {
    Document,
    Packer,
    Paragraph,
    Table,
    TableRow,
    TableCell,
    WidthType,
    AlignmentType,
    HeadingLevel,
    PageOrientation,
    TextRun,
    BorderStyle,
    ShadingType,
} = require('docx');
const { getFldResultReportColumns } = require('./fldResultReportColumns.js');

const WD_BORDER = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
const WD_BORDERS = { top: WD_BORDER, bottom: WD_BORDER, left: WD_BORDER, right: WD_BORDER };
const WD_TABLE_BORDERS = {
    top: WD_BORDER, bottom: WD_BORDER, left: WD_BORDER, right: WD_BORDER,
    insideHorizontal: WD_BORDER, insideVertical: WD_BORDER,
};
const WD_HEADER_SHADE = 'E8E8E8';
const WD_TOTAL_SHADE = 'D9EAD3';

function fmt(v, d = 2) {
    if (v === null || v === undefined || Number.isNaN(Number(v))) return '';
    return Number(v).toFixed(d);
}

function fmtI(v) {
    if (v === null || v === undefined || v === '') return '';
    const n = Number(v);
    return Number.isFinite(n) ? String(Math.round(n)) : '';
}

// ── Excel styling ───────────────────────────────────────────────────
const XL_THIN = { style: 'thin', color: { argb: 'FF000000' } };
const XL_BORDER = { top: XL_THIN, left: XL_THIN, bottom: XL_THIN, right: XL_THIN };
const XL_HEADER_FILL = 'FFE8E8E8';   // grey header
const XL_TOTAL_FILL = 'FFD9EAD3';    // light green totals
const XL_CAT_FILL = 'FFFCE5CD';      // light orange category band

function styleRow(row, colCount, { fill, bold } = {}) {
    for (let c = 1; c <= colCount; c += 1) {
        const cell = row.getCell(c);
        cell.border = XL_BORDER;
        if (bold) cell.font = { ...(cell.font || {}), bold: true };
        if (fill) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
        cell.alignment = { vertical: 'middle', wrapText: true, ...(cell.alignment || {}) };
    }
}

/**
 * Multi-section Excel for FLD page report (not using generic single-header export).
 */
async function generateFldPageExcelBuffer(reportTitle, payload) {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('FLD Report');
    ws.mergeCells(1, 1, 1, 18);
    const tCell = ws.getCell(1, 1);
    tCell.value = reportTitle || 'ACHIEVEMENTS OF FRONTLINE DEMONSTRATIONS (FLD)';
    tCell.font = { bold: true, size: 14 };
    tCell.alignment = { horizontal: 'center' };

    const y = payload.yearLabel || '';
    const subA = ws.addRow([`A. Overall achievements of FLDs conducted${y ? ` for ${y}` : ''}`]);
    subA.getCell(1).font = { bold: true };

    const aHeaders = [
        'S. No.',
        'Category',
        'No. of FLD',
        'Area',
        'No. of beneficiaries',
        'Yield in Demo (q/ha)',
        'Yield in check (q/ha)',
    ];
    const A_COLS = aHeaders.length;
    styleRow(ws.addRow(aHeaders), A_COLS, { fill: XL_HEADER_FILL, bold: true });

    (payload.sectionA || []).forEach((row) => {
        const r = ws.addRow([
            row.sno,
            row.category,
            row.noFld,
            fmt(row.area, 2),
            row.beneficiaries,
            row.yieldDemo != null ? fmt(row.yieldDemo, 2) : '',
            row.yieldCheck != null ? fmt(row.yieldCheck, 2) : '',
        ]);
        styleRow(r, A_COLS);
    });

    const gt = payload.grandTotal || {};
    const gtRow = ws.addRow([
        '',
        'Grand Total',
        gt.noFld,
        fmt(gt.area, 2),
        gt.beneficiaries,
        gt.yieldDemo != null ? fmt(gt.yieldDemo, 2) : '',
        gt.yieldCheck != null ? fmt(gt.yieldCheck, 2) : '',
    ]);
    styleRow(gtRow, A_COLS, { fill: XL_TOTAL_FILL, bold: true });
    ws.addRow([]);

    const subB = ws.addRow([`B. Details of FLDs conducted${y ? ` for ${y}` : ''}`]);
    subB.getCell(1).font = { bold: true };

    (payload.sectionB || []).forEach((cat) => {
        const resultColumns = getFldResultReportColumns(cat);
        const bHead = [
            'Category',
            'Crop',
            'Thematic Area',
            'Technology',
            'No. of Demo',
            'No. of Farmers',
            'Area (ha)',
            ...resultColumns.map((col) => `${col.group}: ${col.label}`),
        ];
        const B_COLS = bHead.length;
        const catRow = ws.addRow([`— ${cat.categoryName} —`]);
        ws.mergeCells(catRow.number, 1, catRow.number, B_COLS);
        styleRow(catRow, B_COLS, { fill: XL_CAT_FILL, bold: true });
        styleRow(ws.addRow(bHead), B_COLS, { fill: XL_HEADER_FILL, bold: true });
        (cat.rows || []).forEach((row) => {
            const r = ws.addRow([
                cat.categoryName,
                row.crop,
                row.thematicArea,
                row.technology,
                fmtI(row.noOfDemonstration),
                fmtI(row.noOfFarmers),
                row.areaHa != null ? fmt(row.areaHa, 2) : '',
                ...resultColumns.map((col) => row[col.key] != null ? fmt(row[col.key], col.decimals) : ''),
            ]);
            styleRow(r, B_COLS);
        });
        ws.addRow([]);
    });

    ws.columns.forEach((col) => {
        col.width = 14;
    });

    return await wb.xlsx.writeBuffer();
}

function cellText(t, { bold = false, fill = null } = {}) {
    return new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: String(t ?? ''), bold, size: 14 })] })],
        borders: WD_BORDERS,
        ...(fill ? { shading: { type: ShadingType.CLEAR, fill } } : {}),
    });
}

async function generateFldPageWordBuffer(reportTitle, payload) {
    const y = payload.yearLabel || '';
    const children = [
        new Paragraph({
            text: reportTitle || 'ACHIEVEMENTS OF FRONTLINE DEMONSTRATIONS (FLD)',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
        }),
        new Paragraph({ text: '' }),
        new Paragraph({
            text: `A. Overall achievements of FLDs conducted${y ? ` for ${y}` : ''}`,
            heading: HeadingLevel.HEADING_2,
        }),
    ];

    const aRows = [
        new TableRow({
            children: ['S. No.', 'Category', 'No. of FLD', 'Area', 'Beneficiaries', 'Yield Demo', 'Yield Check'].map((h) =>
                cellText(h, { bold: true, fill: WD_HEADER_SHADE }),
            ),
        }),
    ];
    (payload.sectionA || []).forEach((row) => {
        aRows.push(
            new TableRow({
                children: [
                    cellText(row.sno),
                    cellText(row.category),
                    cellText(row.noFld),
                    cellText(fmt(row.area, 2)),
                    cellText(row.beneficiaries),
                    cellText(row.yieldDemo != null ? fmt(row.yieldDemo, 2) : ''),
                    cellText(row.yieldCheck != null ? fmt(row.yieldCheck, 2) : ''),
                ],
            }),
        );
    });
    const gt = payload.grandTotal || {};
    aRows.push(
        new TableRow({
            children: [
                cellText('', { bold: true, fill: WD_TOTAL_SHADE }),
                cellText('Grand Total', { bold: true, fill: WD_TOTAL_SHADE }),
                cellText(gt.noFld, { bold: true, fill: WD_TOTAL_SHADE }),
                cellText(fmt(gt.area, 2), { bold: true, fill: WD_TOTAL_SHADE }),
                cellText(gt.beneficiaries, { bold: true, fill: WD_TOTAL_SHADE }),
                cellText(gt.yieldDemo != null ? fmt(gt.yieldDemo, 2) : '', { bold: true, fill: WD_TOTAL_SHADE }),
                cellText(gt.yieldCheck != null ? fmt(gt.yieldCheck, 2) : '', { bold: true, fill: WD_TOTAL_SHADE }),
            ],
        }),
    );

    children.push(
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: WD_TABLE_BORDERS,
            rows: aRows,
        }),
        new Paragraph({ text: '' }),
        new Paragraph({
            text: `B. Details of FLDs conducted${y ? ` for ${y}` : ''}`,
            heading: HeadingLevel.HEADING_2,
        }),
    );

    (payload.sectionB || []).forEach((cat) => {
        children.push(new Paragraph({ text: cat.categoryName, heading: HeadingLevel.HEADING_3 }));
        const resultColumns = getFldResultReportColumns(cat);
        const hdr = [
            'Crop',
            'Thematic',
            'Technology',
            'No.Demo',
            'Farmers',
            'Area',
            ...resultColumns.map((col) => col.label),
        ];
        const bRows = [
            new TableRow({
                children: hdr.map((h) => cellText(h, { bold: true, fill: WD_HEADER_SHADE })),
            }),
        ];
        (cat.rows || []).forEach((r) => {
            bRows.push(
                new TableRow({
                    children: [
                        cellText(r.crop),
                        cellText(r.thematicArea),
                        cellText(r.technology),
                        cellText(fmtI(r.noOfDemonstration)),
                        cellText(fmtI(r.noOfFarmers)),
                        cellText(r.areaHa != null ? fmt(r.areaHa, 2) : ''),
                        ...resultColumns.map((col) => cellText(r[col.key] != null ? fmt(r[col.key], col.decimals) : '')),
                    ],
                }),
            );
        });
        children.push(
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: WD_TABLE_BORDERS,
                rows: bRows,
            }),
            new Paragraph({ text: '' }),
        );
    });

    children.push(
        new Paragraph({
            text: '* Economics to be worked out based on total cost of production per unit area and not on critical inputs alone.',
        }),
        new Paragraph({ text: '** BCR = GROSS RETURN / GROSS COST' }),
    );

    const doc = new Document({
        sections: [
            {
                properties: {
                    page: {
                        size: { orientation: PageOrientation.LANDSCAPE },
                    },
                },
                children,
            },
        ],
    });

    return await Packer.toBuffer(doc);
}

module.exports = {
    generateFldPageExcelBuffer,
    generateFldPageWordBuffer,
};
