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
} = require('docx');

const MAIN_TITLE = '7. SOIL & WATER TESTING';
const SUB_TITLE = 'A. Details of equipment available in Soil and Water Testing Laboratory.';

function isAggregatedPayload(payload) {
    const r = payload?.rows?.[0];
    return Boolean(r && Object.prototype.hasOwnProperty.call(r, 'stateName'));
}

function headersFor(payload) {
    return isAggregatedPayload(payload)
        ? ['State', 'KVK', 'Sl.', 'Name of the Equipment', 'Qty']
        : ['Sl.', 'Name of the Equipment', 'Qty'];
}

function rowVals(payload, r) {
    if (isAggregatedPayload(payload)) {
        return [r.stateName, r.kvkName, r.sl, r.name, r.qty];
    }
    return [r.sl, r.name, r.qty];
}

function cellText(t, bold = false) {
    return new TableCell({
        children: [new Paragraph({ text: String(t ?? ''), bold })],
    });
}

async function generateSoilWaterEquipmentPageExcelBuffer(reportTitle, payload) {
    const cols = isAggregatedPayload(payload) ? 5 : 3;
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Soil water equipment');

    ws.mergeCells(1, 1, 1, cols);
    const t1 = ws.getCell(1, 1);
    t1.value = MAIN_TITLE;
    t1.font = { bold: true, size: 12 };
    t1.alignment = { horizontal: 'center' };

    ws.mergeCells(2, 1, 2, cols);
    const t2 = ws.getCell(2, 1);
    t2.value = SUB_TITLE;
    t2.font = { bold: true, size: 10 };
    t2.alignment = { horizontal: 'left' };

    let rowNum = 3;
    if (payload.yearLabel) {
        ws.mergeCells(rowNum, 1, rowNum, cols);
        ws.getCell(rowNum, 1).value = `Reporting year ${payload.yearLabel}`;
        rowNum += 1;
    }
    ws.addRow([]);

    ws.addRow(headersFor(payload)).eachCell((c) => {
        c.font = { bold: true };
    });
    for (const r of payload.rows || []) {
        ws.addRow(rowVals(payload, r));
    }

    for (let c = 1; c <= cols; c += 1) {
        if (isAggregatedPayload(payload)) {
            ws.getColumn(1).width = 18;
            ws.getColumn(2).width = 32;
            ws.getColumn(3).width = 6;
            ws.getColumn(4).width = 40;
            ws.getColumn(5).width = 8;
        } else {
            ws.getColumn(1).width = 8;
            ws.getColumn(2).width = 48;
            ws.getColumn(3).width = 8;
        }
    }

    return await wb.xlsx.writeBuffer();
}

async function generateSoilWaterEquipmentPageWordBuffer(reportTitle, payload) {
    const y = payload.yearLabel || '';
    const children = [
        new Paragraph({
            text: MAIN_TITLE,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
            text: SUB_TITLE,
            heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({ text: y ? `Reporting year ${y}` : '', alignment: AlignmentType.CENTER }),
        new Paragraph({ text: '' }),
    ];

    const hdr = new TableRow({
        children: headersFor(payload).map((h) => cellText(h, true)),
    });
    const tableRows = [hdr];
    for (const r of payload.rows || []) {
        tableRows.push(new TableRow({ children: rowVals(payload, r).map((v) => cellText(v)) }));
    }

    children.push(
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: tableRows,
        }),
    );

    const doc = new Document({
        sections: [{ children }],
    });

    return await Packer.toBuffer(doc);
}

module.exports = {
    generateSoilWaterEquipmentPageExcelBuffer,
    generateSoilWaterEquipmentPageWordBuffer,
};
