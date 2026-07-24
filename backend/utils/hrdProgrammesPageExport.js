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

const {
    buildHrdGroups,
    buildHrdStateSummary,
} = require('../services/reports/formsTemplate/achievementTemplates/hrdProgrammesTemplate.js');

const HEADERS = [
    'Sl. No.',
    'Name of Staff and designation',
    'Name of course/training program attended',
    'Start Date',
    'End Date',
    'Duration',
    'Organizer',
    'Venue',
];
const COLS = HEADERS.length;
const FONT_HP = 13; // ~6.5pt, matches the PDF
const CENTERED = new Set([0, 3, 4, 5]); // Sl, Start, End, Duration
const STATE_HEADERS = [
    'State',
    'No. of KVKs',
    'No. of HRD programmes',
    'No. of personnel attended',
    'Total duration (days)',
];

function rowVals(r) {
    return [r.sl, r.staffCol, r.course, r.start, r.end, r.dur, r.organizer, r.venue];
}

function stateVals(r) {
    return [
        r.stateName,
        r.noOfKvks,
        r.noOfProgrammes,
        r.personnelAttended,
        r.totalDurationDays,
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
            horizontal: opts.stateSummary
                ? (col === 1 ? 'left' : 'center')
                : (CENTERED.has(col - 1) ? 'center' : 'left'),
            vertical: opts.stateSummary ? 'middle' : 'top',
            wrapText: true,
        };
        if (opts.fill) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: opts.fill } };
    });
}

async function generateHrdProgrammesExcelBuffer(reportTitle, rawData, options = {}) {
    const isStateSummary = Boolean(options.isAggregatedReport);
    const statePayload = isStateSummary ? buildHrdStateSummary(rawData) : null;
    const { groups } = buildHrdGroups(rawData);
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('HRD');
    const titleColumns = isStateSummary ? STATE_HEADERS.length : COLS;

    ws.mergeCells(1, 1, 1, titleColumns);
    const t1 = ws.getCell(1, 1);
    t1.value = reportTitle || 'Details of HRD';
    t1.font = { bold: true, size: 12 };
    t1.alignment = { horizontal: 'center' };
    ws.addRow([]);

    if (isStateSummary) {
        if (statePayload.rows.length === 0) {
            ws.addRow(['No data found']);
            return await wb.xlsx.writeBuffer();
        }

        styleRow(ws.addRow(STATE_HEADERS), {
            bold: true,
            fill: 'FFE8E8E8',
            stateSummary: true,
        });
        statePayload.rows.forEach((row) => {
            styleRow(ws.addRow(stateVals(row)), { stateSummary: true });
        });
        styleRow(ws.addRow(stateVals(statePayload.grandTotal)), {
            bold: true,
            fill: 'FFF5F5F5',
            stateSummary: true,
        });
        [18, 14, 24, 25, 22].forEach((width, index) => {
            ws.getColumn(index + 1).width = width;
        });
        return await wb.xlsx.writeBuffer();
    }

    if (groups.length === 0) {
        ws.addRow(['No data found']);
        return await wb.xlsx.writeBuffer();
    }

    groups.forEach((g) => {
        const kr = ws.addRow([g.kvkName]);
        ws.mergeCells(kr.number, 1, kr.number, COLS);
        kr.getCell(1).font = { bold: true, size: 10 };
        kr.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCE6F1' } };
        kr.getCell(1).alignment = { horizontal: 'left' };

        styleRow(ws.addRow(HEADERS), { bold: true, fill: 'FFE8E8E8' });
        g.rows.forEach((r) => styleRow(ws.addRow(rowVals(r))));
        ws.addRow([]);
    });

    const widths = [6, 24, 28, 12, 12, 9, 20, 20];
    widths.forEach((w, i) => { ws.getColumn(i + 1).width = w; });

    return await wb.xlsx.writeBuffer();
}

// ---------------- Word ----------------

function tx(text, opts = {}) {
    return new TextRun({ text: String(text ?? ''), size: opts.size || FONT_HP, bold: Boolean(opts.bold) });
}

function wcell(text, opts = {}) {
    return new TableCell({
        children: [new Paragraph({
            alignment: opts.alignment || AlignmentType.LEFT,
            spacing: { before: 0, after: 0 },
            children: [tx(text, opts)],
        })],
        shading: opts.fill ? { fill: opts.fill } : undefined,
    });
}

function headerRow() {
    return new TableRow({
        tableHeader: true,
        children: HEADERS.map((h, i) => wcell(h, { bold: true, fill: 'E8E8E8', alignment: CENTERED.has(i) ? AlignmentType.CENTER : AlignmentType.LEFT })),
    });
}

function dataRow(r) {
    return new TableRow({
        children: rowVals(r).map((v, i) => wcell(v, { alignment: CENTERED.has(i) ? AlignmentType.CENTER : AlignmentType.LEFT })),
    });
}

function groupTable(g) {
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [headerRow(), ...g.rows.map(dataRow)],
    });
}

async function generateHrdProgrammesWordBuffer(reportTitle, rawData, options = {}) {
    const isStateSummary = Boolean(options.isAggregatedReport);
    const statePayload = isStateSummary ? buildHrdStateSummary(rawData) : null;
    const { groups } = buildHrdGroups(rawData);

    const children = [
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: reportTitle || 'Details of HRD', bold: true, size: 18 })] }),
        new Paragraph({ text: '' }),
    ];

    if (isStateSummary && statePayload.rows.length > 0) {
        const rows = [
            new TableRow({
                tableHeader: true,
                children: STATE_HEADERS.map((header, index) => wcell(header, {
                    bold: true,
                    fill: 'E8E8E8',
                    alignment: index === 0 ? AlignmentType.LEFT : AlignmentType.CENTER,
                })),
            }),
            ...statePayload.rows.map((row) => new TableRow({
                children: stateVals(row).map((value, index) => wcell(value, {
                    alignment: index === 0 ? AlignmentType.LEFT : AlignmentType.CENTER,
                })),
            })),
            new TableRow({
                children: stateVals(statePayload.grandTotal).map((value, index) => wcell(value, {
                    bold: true,
                    fill: 'F5F5F5',
                    alignment: index === 0 ? AlignmentType.LEFT : AlignmentType.CENTER,
                })),
            }),
        ];
        children.push(new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows,
        }));
    } else if (groups.length === 0) {
        children.push(new Paragraph({ children: [tx('No data found')] }));
    } else {
        groups.forEach((g) => {
            children.push(new Paragraph({
                spacing: { before: 120, after: 40 },
                children: [new TextRun({ text: g.kvkName, bold: true, size: 16 })],
            }));
            children.push(groupTable(g));
            children.push(new Paragraph({ text: '' }));
        });
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
    generateHrdProgrammesExcelBuffer,
    generateHrdProgrammesWordBuffer,
};
