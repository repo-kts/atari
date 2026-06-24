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

const SECTION_TITLE = 'NICRA Others — Dignitaries Visited';

// docx half-point sizing: 12 = 6pt.
const FONT_HP = 12;

const HEADERS = [
    'S.No',
    'Date of Visit',
    'Dignitary Type',
    'Name',
    'Remark',
];

// Distinct tab colours cycled per KVK group so admins can tell them apart.
const TAB_COLORS = [
    'FF4F81BD', 'FF9BBB59', 'FFC0504D', 'FF8064A2',
    'FF4BACC6', 'FFF79646', 'FF2C4D75', 'FF77933C',
];

function safeSheetName(name, used) {
    let base = String(name || 'KVK').replace(/[\\/?*[\]:]/g, ' ').trim().slice(0, 28) || 'KVK';
    let candidate = base;
    let i = 2;
    while (used.has(candidate.toLowerCase())) {
        candidate = `${base.slice(0, 25)} ${i++}`;
    }
    used.add(candidate.toLowerCase());
    return candidate;
}

function allBorders() {
    const s = { style: 'thin', color: { argb: 'FF000000' } };
    return { top: s, left: s, bottom: s, right: s };
}

function writeGroupSheet(ws, payloadGroup) {
    const titleRow = ws.addRow([SECTION_TITLE]);
    ws.mergeCells(titleRow.number, 1, titleRow.number, HEADERS.length);
    titleRow.getCell(1).font = { bold: true, size: 12 };
    titleRow.getCell(1).alignment = { horizontal: 'center' };

    const kvkRow = ws.addRow([payloadGroup.kvkName]);
    ws.mergeCells(kvkRow.number, 1, kvkRow.number, HEADERS.length);
    kvkRow.getCell(1).font = { bold: true, size: 11 };
    kvkRow.getCell(1).alignment = { horizontal: 'left' };

    ws.addRow([]);

    const hdr = ws.addRow(HEADERS);
    hdr.eachCell((c) => {
        c.font = { bold: true };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8E8E8' } };
        c.alignment = { horizontal: 'center', vertical: 'middle' };
        c.border = allBorders();
    });

    for (const r of payloadGroup.rows) {
        const row = ws.addRow([
            r.sno,
            r.dateOfVisit || '—',
            r.type || '—',
            r.name || '—',
            r.remark || '—',
        ]);
        row.eachCell((c) => {
            c.border = allBorders();
            c.alignment = { vertical: 'top', wrapText: true };
        });
    }

    const sub = ws.addRow(['', `Sub-total — ${payloadGroup.kvkName} (visits)`, '', '', payloadGroup.subtotal]);
    sub.eachCell((c) => {
        c.font = { bold: true };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
        c.border = allBorders();
    });

    ws.getColumn(1).width = 6;
    ws.getColumn(2).width = 16;
    ws.getColumn(3).width = 24;
    ws.getColumn(4).width = 28;
    ws.getColumn(5).width = 46;
}

async function generateNicraDignitariesExcelBuffer(reportTitle, payload) {
    const wb = new ExcelJS.Workbook();
    const groups = (payload && payload.groups) || [];

    if (groups.length === 0) {
        const ws = wb.addWorksheet('Dignitaries');
        ws.addRow([SECTION_TITLE]).getCell(1).font = { bold: true, size: 12 };
        ws.addRow(['No dignitaries visited data for export.']);
        return await wb.xlsx.writeBuffer();
    }

    const usedNames = new Set();

    // Admin / multi-KVK → one coloured tab per KVK + a summary tab so per-KVK
    // groups don't clutter a single sheet.
    if (payload.isMultiKvk) {
        const summary = wb.addWorksheet('Summary');
        summary.addRow([SECTION_TITLE]).getCell(1).font = { bold: true, size: 12 };
        summary.mergeCells(1, 1, 1, 2);
        summary.addRow([]);
        const sh = summary.addRow(['KVK', 'No. of visits']);
        sh.eachCell((c) => {
            c.font = { bold: true };
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8E8E8' } };
            c.border = allBorders();
        });
        for (const g of groups) {
            summary.addRow([g.kvkName, g.subtotal]).eachCell((c) => { c.border = allBorders(); });
        }
        const gt = summary.addRow(['Grand Total', payload.grandTotal]);
        gt.eachCell((c) => {
            c.font = { bold: true };
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
            c.border = allBorders();
        });
        summary.getColumn(1).width = 40;
        summary.getColumn(2).width = 18;
        usedNames.add('summary');
    }

    groups.forEach((g, idx) => {
        const ws = wb.addWorksheet(safeSheetName(g.kvkName, usedNames));
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
            cell(r.dateOfVisit || '—', { alignment: AlignmentType.CENTER }),
            cell(r.type || '—'),
            cell(r.name || '—'),
            cell(r.remark || '—'),
        ],
    }));

    const subRow = new TableRow({
        children: [
            cell(`Sub-total — ${g.kvkName} (visits)`, { bold: true, fill: 'F1F5F9', colSpan: 4 }),
            cell(g.subtotal, { bold: true, fill: 'F1F5F9', alignment: AlignmentType.CENTER }),
        ],
    });

    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [hdr, ...bodyRows, subRow],
    });
}

async function generateNicraDignitariesWordBuffer(reportTitle, payload) {
    const groups = (payload && payload.groups) || [];

    const children = [
        new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: SECTION_TITLE, bold: true, size: 16 })],
        }),
        new Paragraph({ text: '' }),
    ];

    if (groups.length === 0) {
        children.push(para('No dignitaries visited data for export.'));
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
                    children: [new TextRun({ text: `Grand Total (all KVKs) — visits: ${payload.grandTotal}`, bold: true, size: FONT_HP })],
                }),
            );
        }
    }

    const doc = new Document({
        styles: {
            default: {
                document: { run: { size: FONT_HP } },
            },
        },
        sections: [
            {
                properties: {
                    page: { size: { orientation: PageOrientation.PORTRAIT } },
                },
                children,
            },
        ],
    });

    return await Packer.toBuffer(doc);
}

module.exports = {
    generateNicraDignitariesExcelBuffer,
    generateNicraDignitariesWordBuffer,
};
