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

const SECTION_TITLE = 'Technology week celebration';

const HEADERS = [
    'Type of activities',
    'No. of activities',
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
    'Total M',
    'Total F',
    'Total T',
    'Related crop/livestock technology',
];

function rowVals(r) {
    return [
        r.typeOfActivities,
        r.numberOfActivities,
        r.genM,
        r.genF,
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
        r.totalM,
        r.totalF,
        r.totalT,
        r.relatedTechnology,
    ];
}

function cellText(t) {
    return new TableCell({
        children: [new Paragraph({ text: String(t ?? '') })],
    });
}

async function generateTechnologyWeekCelebrationPageExcelBuffer(reportTitle, payload) {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Technology week');
    const mergeCols = 18;

    ws.mergeCells(1, 1, 1, mergeCols);
    const t1 = ws.getCell(1, 1);
    t1.value = SECTION_TITLE;
    t1.font = { bold: true, size: 12 };
    t1.alignment = { horizontal: 'center' };

    const y = payload.yearLabel || '';
    if (y) {
        ws.mergeCells(2, 1, 2, mergeCols);
        ws.getCell(2, 1).value = `Year ${y}`;
        ws.getCell(2, 1).alignment = { horizontal: 'center' };
    }
    ws.addRow([]);

    ws.addRow(HEADERS).eachCell((c) => {
        c.font = { bold: true };
    });
    for (const r of payload.rows || []) {
        ws.addRow(rowVals(r));
    }
    const gt = payload.grandTotal || {};
    ws.addRow(rowVals(gt)).eachCell((c) => {
        c.font = { bold: true };
    });

    ws.getColumn(1).width = 42;
    for (let c = 2; c <= mergeCols; c += 1) {
        ws.getColumn(c).width = c === mergeCols ? 22 : 9;
    }

    return await wb.xlsx.writeBuffer();
}

async function generateTechnologyWeekCelebrationPageWordBuffer(reportTitle, payload) {
    const y = payload.yearLabel || '';
    const children = [
        new Paragraph({
            text: SECTION_TITLE,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
        }),
        new Paragraph({ text: y ? `Year ${y}` : '', alignment: AlignmentType.CENTER }),
        new Paragraph({ text: '' }),
    ];

    const hdr = new TableRow({ children: HEADERS.map((h) => cellText(h)) });
    const tableRows = [hdr];
    for (const r of payload.rows || []) {
        tableRows.push(new TableRow({ children: rowVals(r).map((v) => cellText(v)) }));
    }
    const gt = payload.grandTotal || {};
    tableRows.push(
        new TableRow({
            children: rowVals(gt).map((v) => cellText(v)),
        }),
    );

    children.push(
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
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
    generateTechnologyWeekCelebrationPageExcelBuffer,
    generateTechnologyWeekCelebrationPageWordBuffer,
};
