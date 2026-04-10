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
const SUB_KVK = 'd. Details of World Soil Day Celebration';
const SUB_STATE = 'State wise Details of World Soil Day Celebration at KVKs';

function isStatePayload(payload) {
    return Boolean(payload?.layout === 'state' || (payload?.rows?.[0] && payload.rows[0].stateName != null && payload.rows[0].noOfKvks != null));
}

function headersFor(payload) {
    return isStatePayload(payload)
        ? ['State', 'No. of KVKs', 'No. of farmers benefitted', 'Soil Health Cards distributed', 'No. of Participants', 'No. of VIPs attended']
        : ['Sl.', 'No. of Activity conducted', 'Soil Health Cards distributed', 'No. of farmers benefitted', 'No. of VIPs', 'Name(s) of VIP(s) involved if any', 'Total No. of Participants attended the program'];
}

function rowVals(payload, r) {
    if (isStatePayload(payload)) {
        return [r.stateName, r.noOfKvks, r.farmersBenefitted, r.soilHealthCards, r.participants, r.vipsAttended];
    }
    return [r.sl, r.activitiesConducted, r.soilHealthCards, r.farmersBenefitted, r.vipCount, r.vipNames, r.participants];
}

function cellText(t, bold = false) {
    return new TableCell({
        children: [new Paragraph({ text: String(t ?? ''), bold })],
    });
}

async function generateWorldSoilDayPageExcelBuffer(reportTitle, payload) {
    const cols = isStatePayload(payload) ? 6 : 7;
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('World Soil Day');

    ws.mergeCells(1, 1, 1, cols);
    const t1 = ws.getCell(1, 1);
    t1.value = MAIN_TITLE;
    t1.font = { bold: true, size: 12 };
    t1.alignment = { horizontal: 'center' };

    ws.mergeCells(2, 1, 2, cols);
    const t2 = ws.getCell(2, 1);
    t2.value = isStatePayload(payload) ? SUB_STATE : SUB_KVK;
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
        ws.getColumn(c).width = isStatePayload(payload) ? [18, 12, 22, 24, 18, 16][c - 1] : [6, 16, 18, 18, 10, 42, 28][c - 1];
    }

    return await wb.xlsx.writeBuffer();
}

async function generateWorldSoilDayPageWordBuffer(reportTitle, payload) {
    const y = payload.yearLabel || '';
    const children = [
        new Paragraph({
            text: MAIN_TITLE,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
            text: isStatePayload(payload) ? SUB_STATE : SUB_KVK,
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
    generateWorldSoilDayPageExcelBuffer,
    generateWorldSoilDayPageWordBuffer,
};
