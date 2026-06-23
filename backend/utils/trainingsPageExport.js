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

// ── Shared styling (borders + background colours) ───────────────────
const XL_THIN = { style: 'thin', color: { argb: 'FF000000' } };
const XL_BORDER = { top: XL_THIN, left: XL_THIN, bottom: XL_THIN, right: XL_THIN };
const XL_HEADER_FILL = 'FFE8E8E8';   // grey column headers
const XL_TOTAL_FILL = 'FFD9EAD3';    // light green sub totals
const XL_TYPE_FILL = 'FFFCE5CD';     // light orange training-type band
const XL_CAMPUS_FILL = 'FFFFF2CC';   // light yellow campus band

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
// Table-level borders incl. inside grid lines — cell-only borders don't reliably
// render in all Word/LibreOffice viewers, so set both.
const WD_TABLE_BORDERS = {
    top: WD_BORDER, bottom: WD_BORDER, left: WD_BORDER, right: WD_BORDER,
    insideHorizontal: WD_BORDER, insideVertical: WD_BORDER,
};
const WD_HEADER_SHADE = 'E8E8E8';
const WD_TOTAL_SHADE = 'D9EAD3';
const WD_FONT = 14; // half-points → 7pt, small for the wide tables

const MAIN_TITLE = '3.4 ACHIEVEMENTS ON TRAINING / CAPACITY BUILDING PROGRAMMES';
const SUBTITLE = '(Mandated KVK trainings / sponsored training / FLD training programmes)';

const THEME_HEADERS = [
    'Thematic Area',
    'No. of Courses',
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
    'Grand M',
    'Grand F',
    'Grand T',
];

function rowFromParticipantRow(t) {
    return [
        t.thematicAreaName != null ? t.thematicAreaName : '',
        t.courses,
        t.generalM,
        t.generalF,
        t.genT,
        t.obcM,
        t.obcF,
        t.obcT,
        t.scM,
        t.scF,
        t.scT,
        t.stM,
        t.stF,
        t.stT,
        t.grandM,
        t.grandF,
        t.grandT,
    ];
}

function rowFromDetail(r) {
    return [
        r.discipline,
        r.clientele,
        r.title,
        r.dateRange,
        r.durationDays,
        r.venue,
        r.campusLabel,
        r.courses,
        r.generalM,
        r.generalF,
        r.genT,
        r.obcM,
        r.obcF,
        r.obcT,
        r.scM,
        r.scF,
        r.scT,
        r.stM,
        r.stF,
        r.stT,
        r.grandM,
        r.grandF,
        r.grandT,
    ];
}

const DETAIL_HEADERS = [
    'Discipline',
    'Clientele',
    'Title of the Training',
    'Date',
    'Duration (Days)',
    'Venue',
    'Campus',
    'No. of Courses',
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
    'Grand M',
    'Grand F',
    'Grand T',
];

function cellText(t, { bold = false, fill = null } = {}) {
    return new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: String(t ?? ''), bold, size: WD_FONT })] })],
        borders: WD_BORDERS,
        ...(fill ? { shading: { type: ShadingType.CLEAR, fill } } : {}),
    });
}

/**
 * Multi-section Excel for Trainings form page export (not modular all-reports).
 */
async function generateTrainingsPageExcelBuffer(reportTitle, payload) {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Training Report');
    const mergeCols = 22;

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

    const THEME_COLS = THEME_HEADERS.length;
    const DETAIL_COLS = DETAIL_HEADERS.length;

    const subTotalRow = (g) => [
        'Sub Total', g.courses, g.generalM, g.generalF, g.genT,
        g.obcM, g.obcF, g.obcT, g.scM, g.scF, g.scT,
        g.stM, g.stF, g.stT, g.grandM, g.grandF, g.grandT,
    ];

    const subA = ws.addRow(['A. Consolidated summary (On and Off Campus combined)']);
    subA.getCell(1).font = { bold: true, size: 12 };

    for (const block of payload.sectionA || []) {
        const typeRow = ws.addRow([`${block.index}. ${block.trainingTypeName}`]);
        ws.mergeCells(typeRow.number, 1, typeRow.number, THEME_COLS);
        styleRow(typeRow, THEME_COLS, { fill: XL_TYPE_FILL, bold: true });
        styleRow(ws.addRow(THEME_HEADERS), THEME_COLS, { fill: XL_HEADER_FILL, bold: true });
        for (const row of block.thematicRows || []) {
            styleRow(ws.addRow(rowFromParticipantRow(row)), THEME_COLS);
        }
        styleRow(ws.addRow(subTotalRow(block.grandTotal || {})), THEME_COLS, { fill: XL_TOTAL_FILL, bold: true });
        ws.addRow([]);
    }

    const subB = ws.addRow(['B. Training-wise details by campus (On Campus, then Off Campus)']);
    subB.getCell(1).font = { bold: true, size: 12 };

    for (const block of payload.sectionB || []) {
        const typeRow = ws.addRow([`${block.index}. ${block.trainingTypeName}`]);
        ws.mergeCells(typeRow.number, 1, typeRow.number, THEME_COLS);
        styleRow(typeRow, THEME_COLS, { fill: XL_TYPE_FILL, bold: true });

        const campusBlocks = [
            block.onCampus,
            block.offCampus,
            block.unspecifiedCampus,
        ].filter(Boolean);

        for (const cb of campusBlocks) {
            const campusRow = ws.addRow([cb.label]);
            ws.mergeCells(campusRow.number, 1, campusRow.number, THEME_COLS);
            styleRow(campusRow, THEME_COLS, { fill: XL_CAMPUS_FILL, bold: true });
            if (!cb.rowCount) {
                ws.addRow(['No trainings recorded']);
                continue;
            }
            styleRow(ws.addRow(THEME_HEADERS), THEME_COLS, { fill: XL_HEADER_FILL, bold: true });
            for (const row of cb.thematicRows || []) {
                styleRow(ws.addRow(rowFromParticipantRow(row)), THEME_COLS);
            }
            styleRow(ws.addRow(subTotalRow(cb.grandTotal || {})), THEME_COLS, { fill: XL_TOTAL_FILL, bold: true });
            ws.addRow([]);
        }
    }

    const subC = ws.addRow(['C. Report with training details']);
    subC.getCell(1).font = { bold: true, size: 12 };
    styleRow(ws.addRow(DETAIL_HEADERS), DETAIL_COLS, { fill: XL_HEADER_FILL, bold: true });
    for (const row of payload.sectionC || []) {
        styleRow(ws.addRow(rowFromDetail(row)), DETAIL_COLS);
    }

    ws.columns.forEach((col) => {
        col.width = 12;
    });

    return await wb.xlsx.writeBuffer();
}

function addThematicTableDocx(children, label, rows, grandTotal) {
    children.push(new Paragraph({ text: label, heading: HeadingLevel.HEADING_3 }));
    const hdr = new TableRow({
        children: THEME_HEADERS.map((h) => cellText(h, { bold: true, fill: WD_HEADER_SHADE })),
    });
    const tableRows = [hdr];
    for (const row of rows || []) {
        tableRows.push(
            new TableRow({
                children: rowFromParticipantRow(row).map((v) => cellText(v)),
            }),
        );
    }
    const gt = grandTotal || {};
    const total = { bold: true, fill: WD_TOTAL_SHADE };
    tableRows.push(
        new TableRow({
            children: [
                cellText('Sub Total', total),
                cellText(gt.courses, total),
                cellText(gt.generalM, total),
                cellText(gt.generalF, total),
                cellText(gt.genT, total),
                cellText(gt.obcM, total),
                cellText(gt.obcF, total),
                cellText(gt.obcT, total),
                cellText(gt.scM, total),
                cellText(gt.scF, total),
                cellText(gt.scT, total),
                cellText(gt.stM, total),
                cellText(gt.stF, total),
                cellText(gt.stT, total),
                cellText(gt.grandM, total),
                cellText(gt.grandF, total),
                cellText(gt.grandT, total),
            ],
        }),
    );
    children.push(
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: WD_TABLE_BORDERS,
            rows: tableRows,
        }),
        new Paragraph({ text: '' }),
    );
}

async function generateTrainingsPageWordBuffer(reportTitle, payload) {
    const children = [
        new Paragraph({
            text: reportTitle || MAIN_TITLE,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
        }),
        new Paragraph({ text: SUBTITLE, alignment: AlignmentType.CENTER }),
        new Paragraph({ text: '' }),
        new Paragraph({
            text: 'A. Consolidated summary (On and Off Campus combined)',
            heading: HeadingLevel.HEADING_2,
        }),
    ];

    for (const block of payload.sectionA || []) {
        children.push(
            new Paragraph({ text: `${block.index}. ${block.trainingTypeName}`, heading: HeadingLevel.HEADING_3 }),
        );
        addThematicTableDocx(
            children,
            'Thematic area wise summary (all venues)',
            block.thematicRows,
            block.grandTotal,
        );
    }

    children.push(
        new Paragraph({
            text: 'B. Training-wise details by campus',
            heading: HeadingLevel.HEADING_2,
        }),
    );

    for (const block of payload.sectionB || []) {
        children.push(
            new Paragraph({ text: `${block.index}. ${block.trainingTypeName}`, heading: HeadingLevel.HEADING_3 }),
        );
        const campusBlocks = [
            block.onCampus,
            block.offCampus,
            block.unspecifiedCampus,
        ].filter(Boolean);
        for (const cb of campusBlocks) {
            if (!cb.rowCount) {
                children.push(new Paragraph({ text: `${cb.label}: No trainings recorded.` }));
                continue;
            }
            addThematicTableDocx(children, cb.label, cb.thematicRows, cb.grandTotal);
        }
    }

    children.push(
        new Paragraph({
            text: 'C. Report with training details',
            heading: HeadingLevel.HEADING_2,
        }),
    );
    const cHdr = new TableRow({
        children: DETAIL_HEADERS.map((h) => cellText(h, { bold: true, fill: WD_HEADER_SHADE })),
    });
    const cRows = [cHdr];
    for (const row of payload.sectionC || []) {
        cRows.push(
            new TableRow({
                children: rowFromDetail(row).map((v) => cellText(v)),
            }),
        );
    }
    children.push(
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: WD_TABLE_BORDERS,
            rows: cRows,
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
    generateTrainingsPageExcelBuffer,
    generateTrainingsPageWordBuffer,
};
