const ExcelJS = require('exceljs');
const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
    AlignmentType,
    PageOrientation,
} = require('docx');

const MAIN_TITLE = '7. SOIL & WATER TESTING';
const SUB_KVK = 'd. Details of World Soil Day Celebration';
const FONT_HP = 12; // 6pt

const HEADERS = [
    'Sl.',
    'No. of Activity conducted',
    'Soil Health Cards distributed',
    'No. of farmers benefitted',
    'No. of VIPs',
    'Name(s) of VIP(s) involved if any',
    'Total No. of Participants attended the program',
];
const COLS = HEADERS.length;
const STATE_HEADERS = [
    'State',
    'No. of KVKs',
    'No. of activities conducted',
    'No. of farmers benefited',
    'Total number of participants',
];

function detailVals(r) {
    return [r.sl, r.activitiesConducted, r.soilHealthCards, r.farmersBenefitted, r.vipCount, r.vipNames, r.participants];
}

function totalVals(r) {
    return ['—', r.label, r.soilHealthCards, r.farmersBenefitted, r.vipCount, '', r.participants];
}

function stateVals(r) {
    return [
        r.stateName,
        r.noOfKvks,
        r.activitiesConducted,
        r.farmersBenefitted,
        r.participants,
    ];
}

// ---------------- Excel ----------------

function allBorders() {
    const s = { style: 'thin', color: { argb: 'FF000000' } };
    return { top: s, left: s, bottom: s, right: s };
}

function styleRow(row, opts = {}) {
    row.eachCell((c, col) => {
        c.border = allBorders();
        c.font = { size: 8, bold: Boolean(opts.bold) };
        c.alignment = {
            horizontal: col === (opts.leftColumn || 6) ? 'left' : 'center',
            vertical: 'middle',
            wrapText: true,
        };
        if (opts.fill) {
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: opts.fill } };
        }
    });
}

async function generateWorldSoilDayPageExcelBuffer(reportTitle, payload) {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('World Soil Day');
    const isStateSummary = payload?.layout === 'state';
    const titleColumns = isStateSummary ? STATE_HEADERS.length : COLS;

    ws.mergeCells(1, 1, 1, titleColumns);
    const t1 = ws.getCell(1, 1);
    t1.value = MAIN_TITLE;
    t1.font = { bold: true, size: 12 };
    t1.alignment = { horizontal: 'center' };

    ws.mergeCells(2, 1, 2, titleColumns);
    const t2 = ws.getCell(2, 1);
    t2.value = SUB_KVK;
    t2.font = { bold: true, size: 10 };
    t2.alignment = { horizontal: 'left' };
    ws.addRow([]);

    if (isStateSummary) {
        styleRow(ws.addRow(STATE_HEADERS), { bold: true, fill: 'FFE8E8E8', leftColumn: 1 });
        (payload.rows || []).forEach((row) => styleRow(ws.addRow(stateVals(row)), { leftColumn: 1 }));
        if (payload.grandTotal) {
            styleRow(ws.addRow(stateVals(payload.grandTotal)), {
                bold: true,
                fill: 'FFF5F5F5',
                leftColumn: 1,
            });
        }
        [18, 14, 24, 24, 28].forEach((w, i) => { ws.getColumn(i + 1).width = w; });
        return await wb.xlsx.writeBuffer();
    }

    const groups = (payload && payload.groups) || [];
    if (groups.length === 0) {
        ws.addRow(['No World Soil Day celebration data for this period.']);
        return await wb.xlsx.writeBuffer();
    }

    groups.forEach((g) => {
        if (payload.isMultiKvk) {
            const kr = ws.addRow([g.kvkName]);
            ws.mergeCells(kr.number, 1, kr.number, COLS);
            kr.getCell(1).font = { bold: true, size: 10 };
            kr.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCE6F1' } };
            kr.getCell(1).alignment = { horizontal: 'left' };
        }
        styleRow(ws.addRow(HEADERS), { bold: true, fill: 'FFE8E8E8' });
        g.rows.forEach((r) => styleRow(ws.addRow(detailVals(r))));
        styleRow(ws.addRow(totalVals(g.subtotal)), { bold: true, fill: 'FFF1F5F9' });
        ws.addRow([]);
    });

    if (payload.isMultiKvk) {
        styleRow(ws.addRow(HEADERS), { bold: true, fill: 'FFE8E8E8' });
        styleRow(ws.addRow(totalVals(payload.grandTotal)), { bold: true, fill: 'FFF5F5F5' });
    }

    const widths = [6, 16, 18, 18, 10, 42, 28];
    widths.forEach((w, i) => { ws.getColumn(i + 1).width = w; });

    return await wb.xlsx.writeBuffer();
}

// ---------------- Word (6pt) ----------------

function tx(text, opts = {}) {
    return new TextRun({ text: String(text ?? ''), size: opts.size || FONT_HP, bold: Boolean(opts.bold) });
}

function wcell(text, opts = {}) {
    return new TableCell({
        children: [new Paragraph({
            alignment: opts.alignment || AlignmentType.CENTER,
            spacing: { before: 0, after: 0 },
            children: [tx(text, opts)],
        })],
        shading: opts.fill ? { fill: opts.fill } : undefined,
    });
}

function headerRow() {
    return new TableRow({
        tableHeader: true,
        children: HEADERS.map((h, i) => wcell(h, {
            bold: true,
            fill: 'E8E8E8',
            alignment: i === 5 ? AlignmentType.LEFT : AlignmentType.CENTER,
        })),
    });
}

function dataRow(r) {
    return new TableRow({
        children: detailVals(r).map((v, i) => wcell(v, { alignment: i === 5 ? AlignmentType.LEFT : AlignmentType.CENTER })),
    });
}

function totalRow(r, fill) {
    return new TableRow({
        children: totalVals(r).map((v, i) => wcell(v, {
            bold: true,
            fill,
            alignment: i === 1 || i === 5 ? AlignmentType.LEFT : AlignmentType.CENTER,
        })),
    });
}

function groupTable(g) {
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [headerRow(), ...g.rows.map(dataRow), totalRow(g.subtotal, 'F1F5F9')],
    });
}

async function generateWorldSoilDayPageWordBuffer(reportTitle, payload) {
    const isStateSummary = payload?.layout === 'state';
    const groups = (payload && payload.groups) || [];

    const children = [
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: MAIN_TITLE, bold: true, size: 18 })] }),
        new Paragraph({ children: [new TextRun({ text: SUB_KVK, bold: true, size: 16 })] }),
        new Paragraph({ text: '' }),
    ];

    if (isStateSummary) {
        const stateRows = [
            new TableRow({
                tableHeader: true,
                children: STATE_HEADERS.map((header, index) => wcell(header, {
                    bold: true,
                    fill: 'E8E8E8',
                    alignment: index === 0 ? AlignmentType.LEFT : AlignmentType.CENTER,
                })),
            }),
            ...(payload.rows || []).map((row) => new TableRow({
                children: stateVals(row).map((value, index) => wcell(value, {
                    alignment: index === 0 ? AlignmentType.LEFT : AlignmentType.CENTER,
                })),
            })),
        ];
        if (payload.grandTotal) {
            stateRows.push(new TableRow({
                children: stateVals(payload.grandTotal).map((value, index) => wcell(value, {
                    bold: true,
                    fill: 'F5F5F5',
                    alignment: index === 0 ? AlignmentType.LEFT : AlignmentType.CENTER,
                })),
            }));
        }
        children.push(new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: stateRows,
        }));
    } else if (groups.length === 0) {
        children.push(new Paragraph({ children: [tx('No World Soil Day celebration data for this period.')] }));
    } else {
        groups.forEach((g) => {
            if (payload.isMultiKvk) {
                children.push(new Paragraph({
                    spacing: { before: 120, after: 40 },
                    children: [new TextRun({ text: g.kvkName, bold: true, size: 15 })],
                }));
            }
            children.push(groupTable(g));
            children.push(new Paragraph({ text: '' }));
        });

        if (payload.isMultiKvk) {
            children.push(new Paragraph({
                spacing: { before: 120, after: 40 },
                children: [new TextRun({ text: 'Grand Total (all KVKs)', bold: true, size: 15 })],
            }));
            children.push(new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [headerRow(), totalRow(payload.grandTotal, 'F5F5F5')],
            }));
        }
    }

    const doc = new Document({
        styles: { default: { document: { run: { size: FONT_HP } } } },
        sections: [{
            properties: { page: { size: { orientation: PageOrientation.PORTRAIT } } },
            children,
        }],
    });

    return await Packer.toBuffer(doc);
}

module.exports = {
    generateWorldSoilDayPageExcelBuffer,
    generateWorldSoilDayPageWordBuffer,
};
