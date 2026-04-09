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

const SECTION_D = 'D. Celebration of important days in KVKs';

const HEADERS = [
    'Celebration of Important Days',
    'No. of activities',
    'Farmers General M',
    'Farmers General F',
    'Farmers General T',
    'Farmers OBC M',
    'Farmers OBC F',
    'Farmers OBC T',
    'Farmers SC M',
    'Farmers SC F',
    'Farmers SC T',
    'Farmers ST M',
    'Farmers ST F',
    'Farmers ST T',
    'Officials General M',
    'Officials General F',
    'Officials General T',
    'Officials OBC M',
    'Officials OBC F',
    'Officials OBC T',
    'Officials SC M',
    'Officials SC F',
    'Officials SC T',
    'Officials ST M',
    'Officials ST F',
    'Officials ST T',
    'Total M',
    'Total F',
    'Total T',
];

function rowVals(r) {
    return [
        r.label,
        r.numActivities,
        r.farmersGenM,
        r.farmersGenF,
        r.farmersGenT,
        r.farmersObcM,
        r.farmersObcF,
        r.farmersObcT,
        r.farmersScM,
        r.farmersScF,
        r.farmersScT,
        r.farmersStM,
        r.farmersStF,
        r.farmersStT,
        r.offGenM,
        r.offGenF,
        r.offGenT,
        r.offObcM,
        r.offObcF,
        r.offObcT,
        r.offScM,
        r.offScF,
        r.offScT,
        r.offStM,
        r.offStF,
        r.offStT,
        r.totalM,
        r.totalF,
        r.totalT,
    ];
}

function cellText(t) {
    return new TableCell({
        children: [new Paragraph({ text: String(t ?? '') })],
    });
}

async function generateCelebrationDaysPageExcelBuffer(reportTitle, payload) {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Celebration days');
    const mergeCols = 29;

    ws.mergeCells(1, 1, 1, mergeCols);
    const t1 = ws.getCell(1, 1);
    t1.value = SECTION_D;
    t1.font = { bold: true, size: 12 };
    t1.alignment = { horizontal: 'center' };
    if (payload.yearLabel) {
        ws.mergeCells(2, 1, 2, mergeCols);
        ws.getCell(2, 1).value = `Year ${payload.yearLabel}`;
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

    ws.getColumn(1).width = 36;
    for (let c = 2; c <= mergeCols; c += 1) {
        ws.getColumn(c).width = 9;
    }

    return await wb.xlsx.writeBuffer();
}

async function generateCelebrationDaysPageWordBuffer(reportTitle, payload) {
    const y = payload.yearLabel || '';
    const children = [
        new Paragraph({
            text: SECTION_D,
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
    generateCelebrationDaysPageExcelBuffer,
    generateCelebrationDaysPageWordBuffer,
};
