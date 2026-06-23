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

// ── Styling (borders + background colours) ──────────────────────────
const XL_THIN = { style: 'thin', color: { argb: 'FF000000' } };
const XL_BORDER = { top: XL_THIN, left: XL_THIN, bottom: XL_THIN, right: XL_THIN };
const XL_HEADER_FILL = 'FFE8E8E8';
const XL_TOTAL_FILL = 'FFD9EAD3';

function styleRow(row, colCount, { fill, bold } = {}) {
    for (let c = 1; c <= colCount; c += 1) {
        const cell = row.getCell(c);
        cell.border = XL_BORDER;
        if (bold) cell.font = { ...(cell.font || {}), bold: true };
        if (fill) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
        cell.alignment = { vertical: 'middle', wrapText: true, ...(cell.alignment || {}) };
    }
}

const WD_BORDER = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
const WD_BORDERS = { top: WD_BORDER, bottom: WD_BORDER, left: WD_BORDER, right: WD_BORDER };
const WD_TABLE_BORDERS = {
    top: WD_BORDER, bottom: WD_BORDER, left: WD_BORDER, right: WD_BORDER,
    insideHorizontal: WD_BORDER, insideVertical: WD_BORDER,
};
const WD_HEADER_SHADE = 'E8E8E8';
const WD_TOTAL_SHADE = 'D9EAD3';
const WD_FONT = 14; // half-points → 7pt

const MAIN_TITLE = '3.5 A. ACHIEVEMENTS OF EXTENSION/OUTREACH ACTIVITIES';
const SUBTITLE = '(Including activities of FLD programmes)';

const HEADERS = [
    'Nature of Extension Activity',
    'No. of activities',
    'Farmers Gen M',
    'Farmers Gen F',
    'Farmers Gen T',
    'Farmers OBC M',
    'Farmers OBC F',
    'Farmers OBC T',
    'Farmers SC M',
    'Farmers SC F',
    'Farmers SC T',
    'Farmers ST M',
    'Farmers ST F',
    'Farmers ST T',
    'Officials Gen M',
    'Officials Gen F',
    'Officials Gen T',
    'Officials OBC M',
    'Officials OBC F',
    'Officials OBC T',
    'Officials SC M',
    'Officials SC F',
    'Officials SC T',
    'Officials ST M',
    'Officials ST F',
    'Officials ST T',
    'Grand M',
    'Grand F',
    'Grand T',
];

function rowVals(r) {
    return [
        r.label,
        r.numActivities,
        r.farmersGeneralM,
        r.farmersGeneralF,
        r.farmersGeneralT,
        r.farmersObcM,
        r.farmersObcF,
        r.farmersObcT,
        r.farmersScM,
        r.farmersScF,
        r.farmersScT,
        r.farmersStM,
        r.farmersStF,
        r.farmersStT,
        r.officialsGeneralM,
        r.officialsGeneralF,
        r.officialsGeneralT,
        r.officialsObcM,
        r.officialsObcF,
        r.officialsObcT,
        r.officialsScM,
        r.officialsScF,
        r.officialsScT,
        r.officialsStM,
        r.officialsStF,
        r.officialsStT,
        r.grandM,
        r.grandF,
        r.grandT,
    ];
}

function cellText(t, { bold = false, fill = null } = {}) {
    return new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: String(t ?? ''), bold, size: WD_FONT })] })],
        borders: WD_BORDERS,
        ...(fill ? { shading: { type: ShadingType.CLEAR, fill } } : {}),
    });
}

async function generateExtensionActivityPageExcelBuffer(reportTitle, payload) {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Extension Activities');
    const mergeCols = 29;

    ws.mergeCells(1, 1, 1, mergeCols);
    const t1 = ws.getCell(1, 1);
    t1.value = MAIN_TITLE;
    t1.font = { bold: true, size: 14 };
    t1.alignment = { horizontal: 'center' };
    ws.mergeCells(2, 1, 2, mergeCols);
    const t2 = ws.getCell(2, 1);
    t2.value = SUBTITLE;
    t2.alignment = { horizontal: 'center' };
    ws.addRow([]);

    const cap = ws.addRow(['Extension / outreach summary']);
    cap.getCell(1).font = { bold: true };

    const COLS = HEADERS.length;
    styleRow(ws.addRow(HEADERS), COLS, { fill: XL_HEADER_FILL, bold: true });
    for (const r of payload.rows || []) {
        styleRow(ws.addRow(rowVals(r)), COLS);
    }
    const gt = payload.grandTotal || {};
    styleRow(
        ws.addRow(['Total', ...rowVals({ label: 'Total', ...gt }).slice(1)]),
        COLS,
        { fill: XL_TOTAL_FILL, bold: true },
    );

    ws.columns.forEach((col) => {
        col.width = 11;
    });

    return await wb.xlsx.writeBuffer();
}

async function generateExtensionActivityPageWordBuffer(reportTitle, payload) {
    const children = [
        new Paragraph({
            text: reportTitle || MAIN_TITLE,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
        }),
        new Paragraph({ text: SUBTITLE, alignment: AlignmentType.CENTER }),
        new Paragraph({ text: '' }),
        new Paragraph({ text: 'Extension / outreach summary', heading: HeadingLevel.HEADING_2 }),
    ];

    const hdr = new TableRow({
        children: HEADERS.map((h) => cellText(h, { bold: true, fill: WD_HEADER_SHADE })),
    });
    const tableRows = [hdr];
    for (const r of payload.rows || []) {
        tableRows.push(new TableRow({ children: rowVals(r).map((v) => cellText(v)) }));
    }
    const gt = payload.grandTotal || {};
    const total = { bold: true, fill: WD_TOTAL_SHADE };
    tableRows.push(
        new TableRow({
            children: rowVals({ label: 'Total', ...gt }).map((v) => cellText(v, total)),
        }),
    );

    children.push(
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: WD_TABLE_BORDERS,
            rows: tableRows,
        }),
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
    generateExtensionActivityPageExcelBuffer,
    generateExtensionActivityPageWordBuffer,
};
