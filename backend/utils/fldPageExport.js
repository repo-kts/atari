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

function fmt(v, d = 2) {
    if (v === null || v === undefined || Number.isNaN(Number(v))) return '';
    return Number(v).toFixed(d);
}

function fmtI(v) {
    if (v === null || v === undefined || v === '') return '';
    const n = Number(v);
    return Number.isFinite(n) ? String(Math.round(n)) : '';
}

/**
 * Multi-section Excel for FLD page report (not using generic single-header export).
 */
async function generateFldPageExcelBuffer(reportTitle, payload) {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('FLD Report');
    ws.mergeCells(1, 1, 1, 18);
    const tCell = ws.getCell(1, 1);
    tCell.value = reportTitle || 'ACHIEVEMENTS OF FRONTLINE DEMONSTRATIONS (FLD)';
    tCell.font = { bold: true, size: 14 };
    tCell.alignment = { horizontal: 'center' };

    const y = payload.yearLabel || '';
    const subA = ws.addRow([`A. Overall achievements of FLDs conducted during the year ${y}`]);
    subA.getCell(1).font = { bold: true };

    const aHeaders = [
        'S. No.',
        'Category',
        'No. of FLD',
        'Area',
        'No. of beneficiaries',
        'Yield in Demo (q/ha)',
        'Yield in check (q/ha)',
    ];
    ws.addRow(aHeaders).eachCell((c) => {
        c.font = { bold: true };
    });

    (payload.sectionA || []).forEach((row) => {
        ws.addRow([
            row.sno,
            row.category,
            row.noFld,
            fmt(row.area, 2),
            row.beneficiaries,
            row.yieldDemo != null ? fmt(row.yieldDemo, 2) : '',
            row.yieldCheck != null ? fmt(row.yieldCheck, 2) : '',
        ]);
    });

    const gt = payload.grandTotal || {};
    ws.addRow([
        '',
        'Grand Total',
        gt.noFld,
        fmt(gt.area, 2),
        gt.beneficiaries,
        gt.yieldDemo != null ? fmt(gt.yieldDemo, 2) : '',
        gt.yieldCheck != null ? fmt(gt.yieldCheck, 2) : '',
    ]);
    ws.addRow([]);

    const subB = ws.addRow([`B. Details of FLDs conducted during the year ${y}`]);
    subB.getCell(1).font = { bold: true };

    const bHead = [
        'Category',
        'Crop',
        'Thematic Area',
        'Technology',
        'No. of Demo',
        'No. of Farmers',
        'Area (ha)',
        'Yield Demo',
        'Yield Check',
        '% Increase',
        'Demo Gross Cost',
        'Demo Gross Return',
        'Demo Net Return',
        'Demo BCR',
        'Check Gross Cost',
        'Check Gross Return',
        'Check Net Return',
        'Check BCR',
    ];

    (payload.sectionB || []).forEach((cat) => {
        const catRow = ws.addRow([`— ${cat.categoryName} —`]);
        catRow.getCell(1).font = { bold: true };
        ws.addRow(bHead).eachCell((c) => {
            c.font = { bold: true };
        });
        (cat.rows || []).forEach((row) => {
            ws.addRow([
                cat.categoryName,
                row.crop,
                row.thematicArea,
                row.technology,
                fmtI(row.noOfDemonstration),
                fmtI(row.noOfFarmers),
                row.areaHa != null ? fmt(row.areaHa, 2) : '',
                row.yieldDemo != null ? fmt(row.yieldDemo, 2) : '',
                row.yieldCheck != null ? fmt(row.yieldCheck, 2) : '',
                row.increasePercent != null ? fmt(row.increasePercent, 2) : '',
                row.demoGrossCost != null ? fmt(row.demoGrossCost, 1) : '',
                row.demoGrossReturn != null ? fmt(row.demoGrossReturn, 1) : '',
                row.demoNetReturn != null ? fmt(row.demoNetReturn, 1) : '',
                row.demoBcr != null ? fmt(row.demoBcr, 2) : '',
                row.checkGrossCost != null ? fmt(row.checkGrossCost, 1) : '',
                row.checkGrossReturn != null ? fmt(row.checkGrossReturn, 1) : '',
                row.checkNetReturn != null ? fmt(row.checkNetReturn, 1) : '',
                row.checkBcr != null ? fmt(row.checkBcr, 2) : '',
            ]);
        });
        ws.addRow([]);
    });

    ws.columns.forEach((col) => {
        col.width = 14;
    });

    return await wb.xlsx.writeBuffer();
}

function cellText(t) {
    return new TableCell({
        children: [new Paragraph({ text: String(t ?? '') })],
    });
}

async function generateFldPageWordBuffer(reportTitle, payload) {
    const y = payload.yearLabel || '';
    const children = [
        new Paragraph({
            text: reportTitle || 'ACHIEVEMENTS OF FRONTLINE DEMONSTRATIONS (FLD)',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
        }),
        new Paragraph({ text: '' }),
        new Paragraph({
            text: `A. Overall achievements of FLDs conducted during the year ${y}`,
            heading: HeadingLevel.HEADING_2,
        }),
    ];

    const aRows = [
        new TableRow({
            children: ['S. No.', 'Category', 'No. of FLD', 'Area', 'Beneficiaries', 'Yield Demo', 'Yield Check'].map((h) =>
                cellText(h),
            ),
        }),
    ];
    (payload.sectionA || []).forEach((row) => {
        aRows.push(
            new TableRow({
                children: [
                    cellText(row.sno),
                    cellText(row.category),
                    cellText(row.noFld),
                    cellText(fmt(row.area, 2)),
                    cellText(row.beneficiaries),
                    cellText(row.yieldDemo != null ? fmt(row.yieldDemo, 2) : ''),
                    cellText(row.yieldCheck != null ? fmt(row.yieldCheck, 2) : ''),
                ],
            }),
        );
    });
    const gt = payload.grandTotal || {};
    aRows.push(
        new TableRow({
            children: [
                cellText(''),
                cellText('Grand Total'),
                cellText(gt.noFld),
                cellText(fmt(gt.area, 2)),
                cellText(gt.beneficiaries),
                cellText(gt.yieldDemo != null ? fmt(gt.yieldDemo, 2) : ''),
                cellText(gt.yieldCheck != null ? fmt(gt.yieldCheck, 2) : ''),
            ],
        }),
    );

    children.push(
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: aRows,
        }),
        new Paragraph({ text: '' }),
        new Paragraph({
            text: `B. Details of FLDs conducted during the year ${y}`,
            heading: HeadingLevel.HEADING_2,
        }),
    );

    (payload.sectionB || []).forEach((cat) => {
        children.push(new Paragraph({ text: cat.categoryName, heading: HeadingLevel.HEADING_3 }));
        const hdr = [
            'Crop',
            'Thematic',
            'Technology',
            'No.Demo',
            'Farmers',
            'Area',
            'Y.Demo',
            'Y.Chk',
            '%Inc',
            'D.GC',
            'D.GR',
            'D.NR',
            'D.BCR',
            'C.GC',
            'C.GR',
            'C.NR',
            'C.BCR',
        ];
        const bRows = [
            new TableRow({
                children: hdr.map((h) => cellText(h)),
            }),
        ];
        (cat.rows || []).forEach((r) => {
            bRows.push(
                new TableRow({
                    children: [
                        cellText(r.crop),
                        cellText(r.thematicArea),
                        cellText(r.technology),
                        cellText(fmtI(r.noOfDemonstration)),
                        cellText(fmtI(r.noOfFarmers)),
                        cellText(r.areaHa != null ? fmt(r.areaHa, 2) : ''),
                        cellText(r.yieldDemo != null ? fmt(r.yieldDemo, 2) : ''),
                        cellText(r.yieldCheck != null ? fmt(r.yieldCheck, 2) : ''),
                        cellText(r.increasePercent != null ? fmt(r.increasePercent, 2) : ''),
                        cellText(r.demoGrossCost != null ? fmt(r.demoGrossCost, 1) : ''),
                        cellText(r.demoGrossReturn != null ? fmt(r.demoGrossReturn, 1) : ''),
                        cellText(r.demoNetReturn != null ? fmt(r.demoNetReturn, 1) : ''),
                        cellText(r.demoBcr != null ? fmt(r.demoBcr, 2) : ''),
                        cellText(r.checkGrossCost != null ? fmt(r.checkGrossCost, 1) : ''),
                        cellText(r.checkGrossReturn != null ? fmt(r.checkGrossReturn, 1) : ''),
                        cellText(r.checkNetReturn != null ? fmt(r.checkNetReturn, 1) : ''),
                        cellText(r.checkBcr != null ? fmt(r.checkBcr, 2) : ''),
                    ],
                }),
            );
        });
        children.push(
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: bRows,
            }),
            new Paragraph({ text: '' }),
        );
    });

    children.push(
        new Paragraph({
            text: '* Economics to be worked out based on total cost of production per unit area and not on critical inputs alone.',
        }),
        new Paragraph({ text: '** BCR = GROSS RETURN / GROSS COST' }),
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
    generateFldPageExcelBuffer,
    generateFldPageWordBuffer,
};
