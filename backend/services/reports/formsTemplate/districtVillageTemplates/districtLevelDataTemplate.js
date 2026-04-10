/**
 * District & Village — District level data (account-type-wise composite table).
 */

function kvkNameOf(row) {
    return row?.kvkName != null && String(row.kvkName).trim() !== ''
        ? String(row.kvkName).trim()
        : (row?.kvk?.kvkName != null ? String(row.kvk.kvkName).trim() : '');
}

function txt(v) {
    if (v == null || String(v).trim() === '') return '—';
    return String(v).trim();
}

function num(v) {
    if (v == null || v === '') return '—';
    const n = Number(v);
    if (!Number.isFinite(n)) return '—';
    return n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

function normItems(v) {
    if (v == null) return '';
    return String(v).toLowerCase().replace(/\s+/g, ' ').trim();
}

function isBaseDistrictItem(items) {
    const s = normItems(items);
    return s === 'major farming system/enterprise'
        || s === 'agro climatic zone'
        || s === 'agro ecological situation'
        || s === 'soil type';
}

function isCropsItem(items) {
    return normItems(items).includes('productivity of major 2-3 crops');
}

function isClimateItem(items) {
    return normItems(items).includes('mean yearly temperature, rainfall, humidity of the district');
}

function isLivestockItem(items) {
    return normItems(items).includes('production of major livestock products like milk, egg, meat etc');
}

function renderDistrictLevelDataSection(section, data, sectionId, isFirstSection) {
    const rows = Array.isArray(data) ? data : data ? [data] : [];
    if (rows.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const esc = (v) => this._escapeHtml(v ?? '');

    const baseRows = rows.filter((row) => isBaseDistrictItem(row.items));
    const cropsRows = rows.filter((row) => isCropsItem(row.items));
    const climateRows = rows.filter((row) => isClimateItem(row.items));
    const livestockRows = rows.filter((row) => isLivestockItem(row.items));

    const baseBody = baseRows.map((row, idx) => `<tr>
        <td style="text-align:center;">${idx + 1}</td>
        <td>${esc(txt(row.items))}</td>
        <td>${esc(txt(row.information))}</td>
    </tr>`).join('');

    const cropsBody = cropsRows.map((row, idx) => `<tr>
        <td style="text-align:center;">${idx + 1}</td>
        <td>${esc(txt(row.season))}</td>
        <td>${esc(txt(row.type))}</td>
        <td>${esc(txt(row.cropName))}</td>
        <td style="text-align:right;">${esc(num(row.area))}</td>
        <td style="text-align:right;">${esc(num(row.production))}</td>
        <td style="text-align:right;">${esc(num(row.productivity))}</td>
        <td>${esc(txt(row.information))}</td>
    </tr>`).join('');

    const climateBody = climateRows.map((row, idx) => `<tr>
        <td style="text-align:center;">${idx + 1}</td>
        <td>${esc(txt(row.month))}</td>
        <td style="text-align:right;">${esc(num(row.rainfall))}</td>
        <td style="text-align:right;">${esc(num(row.maxTemp))}</td>
        <td style="text-align:right;">${esc(num(row.minTemp))}</td>
        <td style="text-align:right;">${esc(num(row.maxRH))}</td>
        <td style="text-align:right;">${esc(num(row.minRH))}</td>
        <td>${esc(txt(row.information))}</td>
    </tr>`).join('');

    const livestockBody = livestockRows.map((row, idx) => `<tr>
        <td style="text-align:center;">${idx + 1}</td>
        <td>${esc(txt(row.livestockName))}</td>
        <td style="text-align:right;">${esc(num(row.number))}</td>
        <td>${esc(txt(row.information))}</td>
    </tr>`).join('');

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${esc(section.id)} ${esc(section.title)}</h1>
    <style>
        .dist-level-table { width: 100%; border-collapse: collapse; font-size: 6.5pt; table-layout: fixed; margin-bottom: 12px; }
        .dist-level-table th, .dist-level-table td { border: 0.2px solid #000; padding: 2px 4px; vertical-align: top; word-break: break-word; }
        .dist-level-table thead th { background: #e8e8e8; font-weight: bold; text-align: center; }
        .dist-level-subtitle { margin: 4px 0 4px; font-weight: 700; font-size: 8.5pt; }
    </style>

    <div class="dist-level-subtitle">2.a District level data on agriculture, livestock and farming situation</div>
    <table class="data-table dist-level-table">
        <thead>
            <tr>
                <th style="width:8%;">Sr. No.</th>
                <th style="width:62%;">Items</th>
                <th style="width:30%;">Remarks</th>
            </tr>
        </thead>
        <tbody>${baseBody || '<tr><td colspan="3" style="text-align:center;">No records</td></tr>'}</tbody>
    </table>

    <div class="dist-level-subtitle">2.a.1 Productivity of major 2-3 crops under cereals, pulses, oilseeds, vegetables, fruits and others</div>
    <table class="data-table dist-level-table">
        <thead>
            <tr>
                <th style="width:7%;">Sr. No.</th>
                <th style="width:8%;">Season</th>
                <th style="width:16%;">Type</th>
                <th style="width:14%;">Name of Crop</th>
                <th style="width:9%;">Area(Ha)</th>
                <th style="width:14%;">Production(MT)</th>
                <th style="width:14%;">Productivity(q/ha)</th>
                <th style="width:18%;">Remarks</th>
            </tr>
        </thead>
        <tbody>${cropsBody || '<tr><td colspan="8" style="text-align:center;">No records</td></tr>'}</tbody>
    </table>

    <div class="dist-level-subtitle">2.a.2 Mean yearly temperature, rainfall, humidity of the district</div>
    <table class="data-table dist-level-table">
        <thead>
            <tr>
                <th style="width:8%;">Sr. No.</th>
                <th style="width:8%;">Month</th>
                <th style="width:13%;">Rainfall(mm)</th>
                <th style="width:16%;">Max. Temp. (0C)</th>
                <th style="width:16%;">Min. Temp. (0C)</th>
                <th style="width:14%;">Max. R.H. (%)</th>
                <th style="width:14%;">Min. R.H. (%)</th>
                <th style="width:11%;">Remarks</th>
            </tr>
        </thead>
        <tbody>${climateBody || '<tr><td colspan="8" style="text-align:center;">No records</td></tr>'}</tbody>
    </table>

    <div class="dist-level-subtitle">2.a.3 Production of major livestock products like milk, egg, meat etc</div>
    <table class="data-table dist-level-table">
        <thead>
            <tr>
                <th style="width:8%;">Sr. No.</th>
                <th style="width:52%;">Name of Livestock</th>
                <th style="width:20%;">Number</th>
                <th style="width:20%;">Remarks</th>
            </tr>
        </thead>
        <tbody>${livestockBody || '<tr><td colspan="4" style="text-align:center;">No records</td></tr>'}</tbody>
    </table>
</div>`;
}

function buildDistrictLevelDataTabularData(rawData) {
    const rows = Array.isArray(rawData) ? rawData : [];
    const headers = [
        'KVK',
        'Account Type',
        'Season',
        'Type',
        'Name of Crop',
        'Area(Ha)',
        'Production(MT)',
        'Productivity(q/ha)',
        'Month',
        'Rainfall(mm)',
        'Max. Temp. (0C)',
        'Min. Temp. (0C)',
        'Max. R.H. (%)',
        'Min. R.H. (%)',
        'Name of Livestock',
        'Number',
        'Remarks',
    ];
    const out = rows.map((row) => [
        kvkNameOf(row) || '—',
        txt(row.items),
        txt(row.season),
        txt(row.type),
        txt(row.cropName),
        num(row.area),
        num(row.production),
        num(row.productivity),
        txt(row.month),
        num(row.rainfall),
        num(row.maxTemp),
        num(row.minTemp),
        num(row.maxRH),
        num(row.minRH),
        txt(row.livestockName),
        num(row.number),
        txt(row.information),
    ]);
    return { headers, rows: out };
}

module.exports = {
    renderDistrictLevelDataSection,
    buildDistrictLevelDataTabularData,
};
