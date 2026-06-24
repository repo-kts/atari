const ExcelJS = require('exceljs');
const { NF_DEMONSTRATION_PARAMETER_DEFS } = require('../repositories/reports/naturalFarmingReport/nfDemonstrationConstants.js');
const { buildDemonstrationGroupedPayload } = require('../repositories/reports/naturalFarmingReport/demonstrationInfoReportRepository.js');

const TITLE = 'Natural Farming — Demonstration Information';

// One distinct colour per State group so tabs of the same State read together.
const STATE_COLORS = [
    'FF4F81BD', 'FF9BBB59', 'FFC0504D', 'FF8064A2',
    'FF4BACC6', 'FFF79646', 'FF2C4D75', 'FF77933C',
    'FF953735', 'FF604A7B', 'FF31859B', 'FFE36C09',
];

const HEADERS = [
    'Sl.',
    'Demo ID',
    'Reporting year',
    'District',
    'Address & contact',
    'Agro-climatic zone',
    'Cropping pattern',
    'Latitude (N)',
    'Longitude (E)',
    'Activity',
    'Crop',
    'Variety',
    'Season',
    'NF technology / components',
    'Area (ha)',
    'Detail of farmer practice',
    'Parameter',
    'Performance without NF',
    'Performance with NF',
    'Farmer feedback',
];

function fmtNum(v) {
    if (v === null || v === undefined || v === '') return '';
    const n = Number(v);
    if (!Number.isFinite(n)) return String(v);
    if (Math.abs(n - Math.round(n)) < 1e-9) return Math.round(n);
    return Number(n.toFixed(4));
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

function writeKvkSheet(ws, stateName, kvkName, records) {
    const titleRow = ws.addRow([TITLE]);
    ws.mergeCells(titleRow.number, 1, titleRow.number, HEADERS.length);
    titleRow.getCell(1).font = { bold: true, size: 12 };
    titleRow.getCell(1).alignment = { horizontal: 'center' };

    const stRow = ws.addRow([`State: ${stateName}`]);
    ws.mergeCells(stRow.number, 1, stRow.number, HEADERS.length);
    stRow.getCell(1).font = { bold: true, size: 11 };

    const kvkRow = ws.addRow([`KVK: ${kvkName}`]);
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

    let sl = 0;
    records.forEach((rec) => {
        const startRowNum = ws.lastRow.number + 1;
        NF_DEMONSTRATION_PARAMETER_DEFS.forEach((def, pi) => {
            sl += 1;
            const row = ws.addRow([
                sl,
                rec.demonstrationInfoId ?? '-',
                pi === 0 ? (rec.reportingYear ?? '') : '',
                pi === 0 ? (rec.districtName ?? '') : '',
                pi === 0 ? (rec.addressWithContact ?? '') : '',
                pi === 0 ? (rec.agroClimaticZone ?? '') : '',
                pi === 0 ? (rec.croppingPattern ?? '') : '',
                pi === 0 ? (rec.latitude != null ? fmtNum(rec.latitude) : '') : '',
                pi === 0 ? (rec.longitude != null ? fmtNum(rec.longitude) : '') : '',
                pi === 0 ? (rec.activityName ?? '') : '',
                pi === 0 ? (rec.crop ?? '') : '',
                pi === 0 ? (rec.variety ?? '') : '',
                pi === 0 ? (rec.seasonName ?? '') : '',
                pi === 0 ? (rec.naturalFarmingTechnology ?? '') : '',
                pi === 0 ? (rec.areaInHa != null ? fmtNum(rec.areaInHa) : '') : '',
                pi === 0 ? (rec.farmerPracticeDetails ?? '') : '',
                def.label,
                fmtNum(rec[def.withoutKey]),
                fmtNum(rec[def.withKey]),
                pi === 0 ? (rec.farmerFeedback ?? '') : '',
            ]);
            row.eachCell((c) => {
                c.border = allBorders();
                c.alignment = { vertical: 'top', wrapText: true };
            });
        });
        // Merge the per-demonstration columns vertically across its parameter rows.
        const endRowNum = ws.lastRow.number;
        if (endRowNum > startRowNum) {
            const mergeCols = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 20];
            mergeCols.forEach((col) => {
                ws.mergeCells(startRowNum, col, endRowNum, col);
                ws.getCell(startRowNum, col).alignment = { vertical: 'top', wrapText: true };
            });
        }
    });

    const widths = [5, 9, 12, 14, 22, 16, 18, 11, 11, 16, 12, 12, 10, 22, 9, 22, 20, 16, 16, 24];
    widths.forEach((w, i) => { ws.getColumn(i + 1).width = w; });
}

async function generateNfDemonstrationExcelBuffer(reportTitle, rawData) {
    const wb = new ExcelJS.Workbook();
    const payload = buildDemonstrationGroupedPayload(rawData);
    const states = payload.states || [];

    if (payload.totalRecords === 0) {
        const ws = wb.addWorksheet('Demonstration');
        ws.addRow([TITLE]).getCell(1).font = { bold: true, size: 12 };
        ws.addRow(['No data available for this section.']);
        return await wb.xlsx.writeBuffer();
    }

    const usedNames = new Set();

    // KVK tabs ordered State-wise; every tab of a State shares that State's colour.
    states.forEach((st, stIdx) => {
        const colour = STATE_COLORS[stIdx % STATE_COLORS.length];
        st.kvks.forEach((kv) => {
            const ws = wb.addWorksheet(safeSheetName(kv.kvkName, usedNames));
            ws.properties.tabColor = { argb: colour };
            writeKvkSheet(ws, st.stateName, kv.kvkName, kv.records);
        });
    });

    return await wb.xlsx.writeBuffer();
}

module.exports = {
    generateNfDemonstrationExcelBuffer,
};
