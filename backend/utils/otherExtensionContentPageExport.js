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

const SECTION_B = 'B. Other Extension/content mobilization activities';

function cellText(t) {
    return new TableCell({
        children: [new Paragraph({ text: String(t ?? '') })],
    });
}

async function generateOtherExtensionContentPageExcelBuffer(reportTitle, payload) {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Other extension');
    ws.mergeCells(1, 1, 1, 2);
    const t1 = ws.getCell(1, 1);
    t1.value = SECTION_B;
    t1.font = { bold: true, size: 12 };
    t1.alignment = { horizontal: 'center' };
    if (payload.yearLabel) {
        ws.mergeCells(2, 1, 2, 2);
        ws.getCell(2, 1).value = `Year ${payload.yearLabel}`;
        ws.getCell(2, 1).alignment = { horizontal: 'center' };
    }
    ws.addRow([]);

    ws.addRow(['Nature of Extension Activity', 'No. of activities']).eachCell((c) => {
        c.font = { bold: true };
    });
    for (const r of payload.rows || []) {
        ws.addRow([r.label, r.numActivities]);
    }
    ws.addRow(['Total', payload.grandTotal ?? 0]).eachCell((c) => {
        c.font = { bold: true };
    });

    ws.getColumn(1).width = 40;
    ws.getColumn(2).width = 18;

    return await wb.xlsx.writeBuffer();
}

async function generateOtherExtensionContentPageWordBuffer(reportTitle, payload) {
    const children = [
        new Paragraph({
            text: SECTION_B,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
        }),
        new Paragraph({ text: payload.yearLabel ? `Year ${payload.yearLabel}` : '', alignment: AlignmentType.CENTER }),
        new Paragraph({ text: '' }),
    ];

    const hdr = new TableRow({
        children: [cellText('Nature of Extension Activity'), cellText('No. of activities')],
    });
    const rows = [hdr];
    for (const r of payload.rows || []) {
        rows.push(
            new TableRow({
                children: [cellText(r.label), cellText(r.numActivities)],
            }),
        );
    }
    rows.push(
        new TableRow({
            children: [cellText('Total'), cellText(payload.grandTotal ?? '')],
        }),
    );

    children.push(
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows,
        }),
    );

    const doc = new Document({
        sections: [
            {
                properties: {
                    page: {
                        size: { orientation: PageOrientation.PORTRAIT },
                    },
                },
                children,
            },
        ],
    });

    return await Packer.toBuffer(doc);
}

module.exports = {
    generateOtherExtensionContentPageExcelBuffer,
    generateOtherExtensionContentPageWordBuffer,
};
