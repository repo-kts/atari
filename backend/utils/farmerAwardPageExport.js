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

const SECTION = 'Awards / Recognition received by farmers';

// docx half-point sizing: 12 = 6pt.
const FONT_HP = 12;

const HEADERS = [
    'Sl. No.', 'Name of the Farmer', 'Address', 'Contact No.',
    'Name of the Award', 'Amount', 'Achievement', 'Conferring Authority',
];

const TAB_COLORS = [
    'FF4F81BD', 'FF9BBB59', 'FFC0504D', 'FF8064A2',
    'FF4BACC6', 'FFF79646', 'FF2C4D75', 'FF77933C',
];

function allBorders() {
    const s = { style: 'thin', color: { argb: 'FF000000' } };
    return { top: s, left: s, bottom: s, right: s };
}

function safeSheetName(name, used) {
    const base = String(name || 'KVK').replace(/[\\/?*[\]:]/g, ' ').trim().slice(0, 28) || 'KVK';
    let candidate = base;
    let i = 2;
    while (used.has(candidate.toLowerCase())) {
        candidate = `${base.slice(0, 25)} ${i++}`;
    }
    used.add(candidate.toLowerCase());
    return candidate;
}

// ---- Excel ----

function writeGroupSheet(ws, g) {
    const titleRow = ws.addRow([SECTION]);
    ws.mergeCells(titleRow.number, 1, titleRow.number, HEADERS.length);
    titleRow.getCell(1).font = { bold: true, size: 12 };
    titleRow.getCell(1).alignment = { horizontal: 'center' };

    const kvkRow = ws.addRow([g.kvkName]);
    ws.mergeCells(kvkRow.number, 1, kvkRow.number, HEADERS.length);
    kvkRow.getCell(1).font = { bold: true, size: 11 };

    ws.addRow([]);

    const hdr = ws.addRow(HEADERS);
    hdr.eachCell((c) => {
        c.font = { bold: true };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8E8E8' } };
        c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        c.border = allBorders();
    });

    for (const r of g.rows) {
        const row = ws.addRow([
            r.sno, r.farmerName, r.address, r.contactNumber,
            r.award, r.amount, r.achievement, r.conferringAuthority,
        ]);
        row.eachCell((c) => { c.border = allBorders(); c.alignment = { vertical: 'top', wrapText: true }; });
    }

    const sub = ws.addRow([
        `Sub-total — ${g.kvkName} (${g.subtotal.count} award${g.subtotal.count === 1 ? '' : 's'})`,
        '', '', '', '', g.subtotal.amount, '', '',
    ]);
    ws.mergeCells(sub.number, 1, sub.number, 5);
    sub.eachCell((c) => {
        c.font = { bold: true };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
        c.border = allBorders();
    });

    const widths = [7, 22, 26, 14, 24, 12, 28, 26];
    widths.forEach((w, i) => { ws.getColumn(i + 1).width = w; });
}

async function generateFarmerAwardPageExcelBuffer(reportTitle, payload) {
    const wb = new ExcelJS.Workbook();
    const groups = (payload && payload.groups) || [];

    if (groups.length === 0) {
        const ws = wb.addWorksheet('Farmer awards');
        ws.addRow([SECTION]).getCell(1).font = { bold: true, size: 12 };
        ws.addRow(['No farmer award data for export.']);
        return await wb.xlsx.writeBuffer();
    }

    const usedNames = new Set();

    if (payload.isMultiKvk) {
        const summary = wb.addWorksheet('Summary');
        summary.addRow([SECTION]).getCell(1).font = { bold: true, size: 12 };
        summary.mergeCells(1, 1, 1, 3);
        summary.addRow([]);
        const sh = summary.addRow(['KVK', 'No. of awards', 'Total amount']);
        sh.eachCell((c) => {
            c.font = { bold: true };
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8E8E8' } };
            c.border = allBorders();
        });
        for (const g of groups) {
            summary.addRow([g.kvkName, g.subtotal.count, g.subtotal.amount])
                .eachCell((c) => { c.border = allBorders(); });
        }
        const gt = summary.addRow(['Grand Total', payload.grandTotal.count, payload.grandTotal.amount]);
        gt.eachCell((c) => {
            c.font = { bold: true };
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
            c.border = allBorders();
        });
        summary.getColumn(1).width = 38;
        summary.getColumn(2).width = 16;
        summary.getColumn(3).width = 16;
        usedNames.add('summary');
    }

    groups.forEach((g, idx) => {
        const ws = wb.addWorksheet(safeSheetName(g.kvkName, usedNames));
        ws.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 };
        if (payload.isMultiKvk) {
            ws.properties.tabColor = { argb: TAB_COLORS[idx % TAB_COLORS.length] };
        }
        writeGroupSheet(ws, g);
    });

    return await wb.xlsx.writeBuffer();
}

// ---- Word (6pt) ----

function tx(text, opts = {}) {
    return new TextRun({ text: String(text ?? ''), size: FONT_HP, bold: Boolean(opts.bold) });
}

function para(text, opts = {}) {
    return new Paragraph({
        alignment: opts.alignment,
        spacing: { before: 0, after: 0 },
        children: [tx(text, opts)],
    });
}

function cell(text, opts = {}) {
    return new TableCell({
        children: [para(text, opts)],
        shading: opts.fill ? { fill: opts.fill } : undefined,
        columnSpan: opts.colSpan,
    });
}

function buildGroupTable(g) {
    const hdr = new TableRow({
        tableHeader: true,
        children: HEADERS.map((h) => cell(h, { bold: true, fill: 'E8E8E8', alignment: AlignmentType.CENTER })),
    });

    const bodyRows = g.rows.map((r) => new TableRow({
        children: [
            cell(r.sno, { alignment: AlignmentType.CENTER }),
            cell(r.farmerName),
            cell(r.address),
            cell(r.contactNumber),
            cell(r.award),
            cell(r.amount, { alignment: AlignmentType.CENTER }),
            cell(r.achievement),
            cell(r.conferringAuthority),
        ],
    }));

    const subRow = new TableRow({
        children: [
            cell(`Sub-total — ${g.kvkName} (${g.subtotal.count} award${g.subtotal.count === 1 ? '' : 's'})`, { bold: true, fill: 'F1F5F9', colSpan: 5 }),
            cell(g.subtotal.amount, { bold: true, fill: 'F1F5F9', alignment: AlignmentType.CENTER }),
            cell('', { fill: 'F1F5F9', colSpan: 2 }),
        ],
    });

    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [hdr, ...bodyRows, subRow],
    });
}

async function generateFarmerAwardPageWordBuffer(reportTitle, payload) {
    const groups = (payload && payload.groups) || [];

    const children = [
        new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: SECTION, bold: true, size: 16 })],
        }),
        new Paragraph({ text: '' }),
    ];

    if (groups.length === 0) {
        children.push(para('No farmer award data for export.'));
    } else {
        groups.forEach((g) => {
            if (payload.isMultiKvk) {
                children.push(
                    new Paragraph({
                        spacing: { before: 120, after: 40 },
                        children: [new TextRun({ text: g.kvkName, bold: true, size: 15 })],
                    }),
                );
            }
            children.push(buildGroupTable(g));
            children.push(new Paragraph({ text: '' }));
        });

        if (payload.isMultiKvk) {
            children.push(
                new Paragraph({
                    children: [new TextRun({
                        text: `Grand Total (all KVKs): ${payload.grandTotal.count} awards, amount ${payload.grandTotal.amount}`,
                        bold: true,
                        size: FONT_HP,
                    })],
                }),
            );
        }
    }

    const doc = new Document({
        styles: { default: { document: { run: { size: FONT_HP } } } },
        sections: [
            {
                properties: { page: { size: { orientation: PageOrientation.LANDSCAPE } } },
                children,
            },
        ],
    });

    return await Packer.toBuffer(doc);
}

module.exports = {
    generateFarmerAwardPageExcelBuffer,
    generateFarmerAwardPageWordBuffer,
};
