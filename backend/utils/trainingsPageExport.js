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
} = require('docx');

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

function cellText(t) {
    return new TableCell({
        children: [new Paragraph({ text: String(t ?? '') })],
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

    const y = payload.yearLabel || '';

    const subA = ws.addRow([`A. Consolidated summary (On and Off Campus combined) — year ${y}`]);
    subA.getCell(1).font = { bold: true, size: 12 };

    for (const block of payload.sectionA || []) {
        const hRow = ws.addRow([`${block.index}. ${block.trainingTypeName}`]);
        hRow.getCell(1).font = { bold: true };
        ws.addRow(THEME_HEADERS).eachCell((c) => {
            c.font = { bold: true };
        });
        for (const row of block.thematicRows || []) {
            ws.addRow(rowFromParticipantRow(row));
        }
        const gt = block.grandTotal || {};
        ws.addRow([
            'Sub Total',
            gt.courses,
            gt.generalM,
            gt.generalF,
            gt.genT,
            gt.obcM,
            gt.obcF,
            gt.obcT,
            gt.scM,
            gt.scF,
            gt.scT,
            gt.stM,
            gt.stF,
            gt.stT,
            gt.grandM,
            gt.grandF,
            gt.grandT,
        ]);
        ws.addRow([]);
    }

    const subB = ws.addRow([`B. Training-wise details by campus (On Campus, then Off Campus) — year ${y}`]);
    subB.getCell(1).font = { bold: true, size: 12 };

    for (const block of payload.sectionB || []) {
        const hRow = ws.addRow([`${block.index}. ${block.trainingTypeName}`]);
        hRow.getCell(1).font = { bold: true };

        const campusBlocks = [
            block.onCampus,
            block.offCampus,
            block.unspecifiedCampus,
        ].filter(Boolean);

        for (const cb of campusBlocks) {
            ws.addRow([cb.label]).getCell(1).font = { bold: true };
            if (!cb.rowCount) {
                ws.addRow(['No trainings recorded']);
                continue;
            }
            ws.addRow(THEME_HEADERS).eachCell((c) => {
                c.font = { bold: true };
            });
            for (const row of cb.thematicRows || []) {
                ws.addRow(rowFromParticipantRow(row));
            }
            const g = cb.grandTotal || {};
            ws.addRow([
                'Sub Total',
                g.courses,
                g.generalM,
                g.generalF,
                g.genT,
                g.obcM,
                g.obcF,
                g.obcT,
                g.scM,
                g.scF,
                g.scT,
                g.stM,
                g.stF,
                g.stT,
                g.grandM,
                g.grandF,
                g.grandT,
            ]);
            ws.addRow([]);
        }
    }

    const subC = ws.addRow([`C. Report with training details — year ${y}`]);
    subC.getCell(1).font = { bold: true, size: 12 };
    ws.addRow(DETAIL_HEADERS).eachCell((c) => {
        c.font = { bold: true };
    });
    for (const row of payload.sectionC || []) {
        ws.addRow(rowFromDetail(row));
    }

    ws.columns.forEach((col) => {
        col.width = 12;
    });

    return await wb.xlsx.writeBuffer();
}

function addThematicTableDocx(children, label, rows, grandTotal) {
    children.push(new Paragraph({ text: label, heading: HeadingLevel.HEADING_3 }));
    const hdr = new TableRow({ children: THEME_HEADERS.map((h) => cellText(h)) });
    const tableRows = [hdr];
    for (const row of rows || []) {
        tableRows.push(
            new TableRow({
                children: rowFromParticipantRow(row).map((v) => cellText(v)),
            }),
        );
    }
    const gt = grandTotal || {};
    tableRows.push(
        new TableRow({
            children: [
                cellText('Sub Total'),
                cellText(gt.courses),
                cellText(gt.generalM),
                cellText(gt.generalF),
                cellText(gt.genT),
                cellText(gt.obcM),
                cellText(gt.obcF),
                cellText(gt.obcT),
                cellText(gt.scM),
                cellText(gt.scF),
                cellText(gt.scT),
                cellText(gt.stM),
                cellText(gt.stF),
                cellText(gt.stT),
                cellText(gt.grandM),
                cellText(gt.grandF),
                cellText(gt.grandT),
            ],
        }),
    );
    children.push(
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: tableRows,
        }),
        new Paragraph({ text: '' }),
    );
}

async function generateTrainingsPageWordBuffer(reportTitle, payload) {
    const y = payload.yearLabel || '';
    const children = [
        new Paragraph({
            text: reportTitle || MAIN_TITLE,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
        }),
        new Paragraph({ text: SUBTITLE, alignment: AlignmentType.CENTER }),
        new Paragraph({ text: '' }),
        new Paragraph({
            text: `A. Consolidated summary (On and Off Campus combined) — year ${y}`,
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
            text: `B. Training-wise details by campus — year ${y}`,
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
            text: `C. Report with training details — year ${y}`,
            heading: HeadingLevel.HEADING_2,
        }),
    );
    const cHdr = new TableRow({ children: DETAIL_HEADERS.map((h) => cellText(h)) });
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
