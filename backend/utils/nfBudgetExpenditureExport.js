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
    ShadingType,
} = require('docx');
const { resolveBudgetGroupedPayload } = require('../repositories/reports/naturalFarmingReport/budgetExpenditureReportRepository.js');

const TABLE_CAPTION = 'Budget Expenditure (Rs. in Rs)';

const HEADERS = [
    'Name of activity',
    'Number of activities organized',
    'Budget sanction (Rs)',
    'Budget expenditure (Rs)',
    'Total Budget Expenditure (Rs)',
];

// One distinct colour per KVK tab so admins can tell them apart.
const TAB_COLORS = [
    'FF4F81BD', 'FF9BBB59', 'FFC0504D', 'FF8064A2',
    'FF4BACC6', 'FFF79646', 'FF2C4D75', 'FF77933C',
];

function num(v) {
    if (v === null || v === undefined || v === '') return '';
    const n = Number(v);
    if (!Number.isFinite(n)) return v;
    return Math.abs(n - Math.round(n)) < 1e-6 ? Math.round(n) : Number(n.toFixed(2));
}

function allBorders() {
    const s = { style: 'thin', color: { argb: 'FF000000' } };
    return { top: s, left: s, bottom: s, right: s };
}

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

function writeGroupSheet(ws, group) {
    const titleRow = ws.addRow([TABLE_CAPTION]);
    ws.mergeCells(titleRow.number, 1, titleRow.number, HEADERS.length);
    titleRow.getCell(1).font = { bold: true, size: 12 };
    titleRow.getCell(1).alignment = { horizontal: 'center' };

    if (group.kvkName) {
        const kvkRow = ws.addRow([`KVK: ${group.kvkName}`]);
        ws.mergeCells(kvkRow.number, 1, kvkRow.number, HEADERS.length);
        kvkRow.getCell(1).font = { bold: true, size: 11 };
    }

    ws.addRow([]);

    const hdr = ws.addRow(HEADERS);
    hdr.eachCell((c) => {
        c.font = { bold: true };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8E8E8' } };
        c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        c.border = allBorders();
    });

    for (const r of group.rows) {
        const row = ws.addRow([
            r.activityLabel || '—',
            num(r.numberOfActivities),
            num(r.budgetSanction),
            num(r.budgetExpenditure),
            num(r.totalBudgetExpenditure),
        ]);
        row.eachCell((c) => { c.border = allBorders(); });
        row.getCell(1).alignment = { horizontal: 'left' };
    }

    const t = group.totals || {};
    const totalRow = ws.addRow([
        'Total',
        num(t.numberOfActivities),
        num(t.budgetSanction),
        num(t.budgetExpenditure),
        num(t.totalBudgetExpenditure),
    ]);
    totalRow.eachCell((c) => {
        c.font = { bold: true };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
        c.border = allBorders();
    });

    ws.getColumn(1).width = 40;
    ws.getColumn(2).width = 18;
    ws.getColumn(3).width = 18;
    ws.getColumn(4).width = 18;
    ws.getColumn(5).width = 20;
}

async function generateNfBudgetExpenditureExcelBuffer(reportTitle, rawData) {
    const wb = new ExcelJS.Workbook();
    const payload = resolveBudgetGroupedPayload(rawData);
    const groups = payload.groups || [];

    if (payload.totalRecords === 0) {
        const ws = wb.addWorksheet('Budget Expenditure');
        ws.addRow([TABLE_CAPTION]).getCell(1).font = { bold: true, size: 12 };
        ws.addRow(['No data available for this section.']);
        return await wb.xlsx.writeBuffer();
    }

    const usedNames = new Set();

    // Admin / multi-KVK → one coloured tab per KVK + a Summary tab so per-KVK
    // groups don't clutter a single sheet.
    if (payload.isMultiKvk) {
        const summary = wb.addWorksheet('Summary');
        summary.addRow([TABLE_CAPTION]).getCell(1).font = { bold: true, size: 12 };
        summary.mergeCells(1, 1, 1, 5);
        summary.addRow([]);
        const sh = summary.addRow(['KVK', 'No. of activities', 'Budget sanction (Rs)', 'Budget expenditure (Rs)', 'Total Budget Expenditure (Rs)']);
        sh.eachCell((c) => {
            c.font = { bold: true };
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8E8E8' } };
            c.border = allBorders();
        });
        for (const g of groups) {
            const t = g.totals || {};
            summary.addRow([
                g.kvkName,
                num(t.numberOfActivities),
                num(t.budgetSanction),
                num(t.budgetExpenditure),
                num(t.totalBudgetExpenditure),
            ]).eachCell((c) => { c.border = allBorders(); });
        }
        const gt = payload.grandTotals || {};
        const gtRow = summary.addRow([
            'Grand Total',
            num(gt.numberOfActivities),
            num(gt.budgetSanction),
            num(gt.budgetExpenditure),
            num(gt.totalBudgetExpenditure),
        ]);
        gtRow.eachCell((c) => {
            c.font = { bold: true };
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
            c.border = allBorders();
        });
        summary.getColumn(1).width = 40;
        [2, 3, 4, 5].forEach((i) => { summary.getColumn(i).width = 20; });
        usedNames.add('summary');
    }

    groups.forEach((g, idx) => {
        const ws = wb.addWorksheet(safeSheetName(g.kvkName || 'Budget', usedNames));
        if (payload.isMultiKvk) {
            ws.properties.tabColor = { argb: TAB_COLORS[idx % TAB_COLORS.length] };
        }
        writeGroupSheet(ws, g);
    });

    return await wb.xlsx.writeBuffer();
}

// ---- Word (matches the PDF: KVK header + table + Total row, portrait) ----

function dispNum(v) {
    const n = num(v);
    return n === '' ? '' : String(n);
}

function wtx(text, opts = {}) {
    return new TextRun({ text: String(text ?? ''), bold: Boolean(opts.bold) });
}

function wcell(text, opts = {}) {
    return new TableCell({
        shading: opts.fill ? { type: ShadingType.CLEAR, fill: opts.fill } : undefined,
        children: [new Paragraph({
            alignment: opts.alignment,
            spacing: { before: 0, after: 0 },
            children: [wtx(text, opts)],
        })],
    });
}

function buildBudgetWordTable(group) {
    const hdr = new TableRow({
        tableHeader: true,
        children: HEADERS.map((h) => wcell(h, { bold: true, fill: 'E8E8E8', alignment: AlignmentType.CENTER })),
    });

    const bodyRows = group.rows.map((r) => new TableRow({
        children: [
            wcell(r.activityLabel || '—', { bold: true }),
            wcell(dispNum(r.numberOfActivities), { alignment: AlignmentType.CENTER }),
            wcell(dispNum(r.budgetSanction), { alignment: AlignmentType.CENTER }),
            wcell(dispNum(r.budgetExpenditure), { alignment: AlignmentType.CENTER }),
            wcell(dispNum(r.totalBudgetExpenditure), { alignment: AlignmentType.CENTER }),
        ],
    }));

    const t = group.totals || {};
    const totalRow = new TableRow({
        children: [
            wcell('Total', { bold: true, fill: 'F1F5F9', alignment: AlignmentType.RIGHT }),
            wcell(dispNum(t.numberOfActivities), { bold: true, fill: 'F1F5F9', alignment: AlignmentType.CENTER }),
            wcell(dispNum(t.budgetSanction), { bold: true, fill: 'F1F5F9', alignment: AlignmentType.CENTER }),
            wcell(dispNum(t.budgetExpenditure), { bold: true, fill: 'F1F5F9', alignment: AlignmentType.CENTER }),
            wcell(dispNum(t.totalBudgetExpenditure), { bold: true, fill: 'F1F5F9', alignment: AlignmentType.CENTER }),
        ],
    });

    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [hdr, ...bodyRows, totalRow],
    });
}

async function generateNfBudgetExpenditureWordBuffer(reportTitle, rawData) {
    const payload = resolveBudgetGroupedPayload(rawData);
    const groups = payload.groups || [];

    const children = [
        new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: TABLE_CAPTION, bold: true, size: 22 })],
        }),
        new Paragraph({ text: '' }),
    ];

    if (payload.totalRecords === 0) {
        children.push(new Paragraph({ children: [new TextRun({ text: 'No data available for this section.', italics: true })] }));
    } else {
        groups.forEach((g) => {
            if (g.kvkName) {
                children.push(new Paragraph({
                    spacing: { before: 160, after: 40 },
                    shading: { type: ShadingType.CLEAR, fill: 'DCE6F1' },
                    keepNext: true,
                    children: [new TextRun({ text: `KVK: ${g.kvkName}`, bold: true, size: 20 })],
                }));
            }
            children.push(buildBudgetWordTable(g));
            children.push(new Paragraph({ text: '' }));
        });

        if (payload.isMultiKvk) {
            children.push(new Paragraph({
                spacing: { before: 160, after: 40 },
                shading: { type: ShadingType.CLEAR, fill: 'DCE6F1' },
                keepNext: true,
                children: [new TextRun({ text: 'Grand Total (all KVKs)', bold: true, size: 20 })],
            }));
            children.push(buildBudgetWordTable({ rows: [], totals: payload.grandTotals }));
        }
    }

    const doc = new Document({
        sections: [{
            properties: { page: { size: { orientation: PageOrientation.PORTRAIT } } },
            children,
        }],
    });

    return await Packer.toBuffer(doc);
}

module.exports = {
    generateNfBudgetExpenditureExcelBuffer,
    generateNfBudgetExpenditureWordBuffer,
};
