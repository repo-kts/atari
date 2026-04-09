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

function cellText(t) {
    return new TableCell({
        children: [new Paragraph({ text: String(t ?? '') })],
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

    const y = payload.yearLabel || '';
    const cap = ws.addRow([`Extension / outreach summary — year ${y}`]);
    cap.getCell(1).font = { bold: true };

    ws.addRow(HEADERS).eachCell((c) => {
        c.font = { bold: true };
    });
    for (const r of payload.rows || []) {
        ws.addRow(rowVals(r));
    }
    const gt = payload.grandTotal || {};
    ws.addRow(['Total', ...rowVals({ label: 'Total', ...gt }).slice(1)]);

    ws.columns.forEach((col) => {
        col.width = 11;
    });

    return await wb.xlsx.writeBuffer();
}

async function generateExtensionActivityPageWordBuffer(reportTitle, payload) {
    const y = payload.yearLabel || '';
    const children = [
        new Paragraph({
            text: reportTitle || MAIN_TITLE,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
        }),
        new Paragraph({ text: SUBTITLE, alignment: AlignmentType.CENTER }),
        new Paragraph({ text: '' }),
        new Paragraph({ text: `Extension / outreach summary — year ${y}`, heading: HeadingLevel.HEADING_2 }),
    ];

    const hdr = new TableRow({ children: HEADERS.map((h) => cellText(h)) });
    const tableRows = [hdr];
    for (const r of payload.rows || []) {
        tableRows.push(new TableRow({ children: rowVals(r).map((v) => cellText(v)) }));
    }
    const gt = payload.grandTotal || {};
    tableRows.push(
        new TableRow({
            children: rowVals({ label: 'Total', ...gt }).map((v) => cellText(v)),
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
    generateExtensionActivityPageExcelBuffer,
    generateExtensionActivityPageWordBuffer,
};
