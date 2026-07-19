function esc(text) {
    if (text === null || text === undefined) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

function num(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

function sortStr(a, b) {
    return String(a || '').localeCompare(String(b || ''), undefined, { sensitivity: 'base' });
}

function fmtDate(dt) {
    if (!dt) return '';
    const d = new Date(dt);
    return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}

function durationDays(r) {
    if (!r.startDate || !r.endDate) return 0;
    const s = new Date(r.startDate);
    const e = new Date(r.endDate);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 0;
    return Math.max(0, Math.round((e - s) / (1000 * 60 * 60 * 24)));
}

function metricsOf(r) {
    return {
        rfNormal: num(r.rfMmDistrictNormal ?? r.rfNormal),
        rfReceived: num(r.rfMmDistrictReceived ?? r.rfReceived),
        tempMax: num(r.maxTemperature ?? r.tempMax),
        tempMin: num(r.minTemperature ?? r.tempMin),
        dry10: num(r.dry10),
        dry15: num(r.dry15),
        dry20: num(r.dry20),
        intensiveRain: num(r.intensiveRain),
        waterDepth: num(r.waterDepth),
        duration: durationDays(r),
    };
}

function round2(n) {
    return Number.isInteger(n) ? n : Number(n.toFixed(2));
}

const BASIC_STYLE = `
  <style>
    .nicra-basic-group { page-break-inside: avoid; break-inside: avoid; margin-bottom: 8px; }
    .nicra-basic-kvk-hd { font-size: 8pt; font-weight: bold; background: #dce6f1; padding: 3px 5px; border: 0.2px solid #000; border-bottom: 0; page-break-after: avoid; break-after: avoid; }
    .nicra-basic { width: 100%; table-layout: fixed; border-collapse: collapse; font-size: 6.4pt; line-height: 1.2; }
    .nicra-basic th, .nicra-basic td { border: 0.2px solid #000; padding: 2px 3px; text-align: center; vertical-align: middle; word-break: break-word; }
    .nicra-basic thead th { background: #e8e8e8; font-weight: bold; }
    .nicra-basic .l { text-align: left; }
    .nicra-basic .grand td { font-weight: bold; background: #f5f5f5; }
  </style>`;

// ── KVK view: full table (all fields incl. reporting/start/end dates) ────────
function buildKvkGroups(rawData) {
    const rows = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    const byKvk = new Map();
    for (const r of rows) {
        const k = (r && r.kvkName && String(r.kvkName).trim()) || 'Unknown KVK';
        if (!byKvk.has(k)) byKvk.set(k, []);
        byKvk.get(k).push(r);
    }
    return [...byKvk.keys()].sort(sortStr).map((kvkName) => ({
        kvkName,
        rows: byKvk.get(kvkName).map((r) => ({
            reportingDate: fmtDate(r.reportingDate),
            startDate: fmtDate(r.startDate),
            endDate: fmtDate(r.endDate),
            ...metricsOf(r),
        })),
    }));
}

function kvkHeadHtml() {
    return `
    <thead>
      <tr>
        <th colspan="3">Period</th>
        <th colspan="4">Districts data</th>
        <th colspan="3">Dry spell/ drought</th>
        <th colspan="1">NICRA Adopted village</th>
        <th colspan="2">Flood</th>
      </tr>
      <tr>
        <th>Reporting Date</th>
        <th>Start Date</th>
        <th>End Date</th>
        <th>RF (mm) district Normal</th>
        <th>RF (mm) district Received</th>
        <th>Temperature 0C Max.</th>
        <th>Temperature 0C Min.</th>
        <th>&gt; 10 days</th>
        <th>&gt; 15 days</th>
        <th>&gt; 20 days</th>
        <th>Intensive rain &gt;60 mm</th>
        <th>Water depth (cm)</th>
        <th>Duration (days)</th>
      </tr>
    </thead>`;
}

function renderKvkView(ctx, section, sectionId, isFirstSection, groups) {
    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const groupsHtml = groups.map((g) => {
        const body = g.rows.map((r) => `
        <tr>
            <td>${esc(r.reportingDate)}</td>
            <td>${esc(r.startDate)}</td>
            <td>${esc(r.endDate)}</td>
            <td>${r.rfNormal}</td>
            <td>${r.rfReceived}</td>
            <td>${r.tempMax}</td>
            <td>${r.tempMin}</td>
            <td>${r.dry10}</td>
            <td>${r.dry15}</td>
            <td>${r.dry20}</td>
            <td>${r.intensiveRain}</td>
            <td>${r.waterDepth}</td>
            <td>${r.duration}</td>
        </tr>`).join('');
        return `
  <div class="nicra-basic-group">
    <div class="nicra-basic-kvk-hd">${esc(g.kvkName)}</div>
    <table class="nicra-basic">${kvkHeadHtml()}
      <tbody>${body}</tbody>
    </table>
  </div>`;
    }).join('');

    return `
<div id="${sectionId}" class="${pageClass}">
  ${BASIC_STYLE}
  <h1 class="section-title">${section.id} ${ctx._escapeHtml(section.title)}</h1>
  ${groupsHtml}
</div>`;
}

// ── Superadmin view: state-wise averages ────────────────────────────────────
const AVG_KEYS = ['rfNormal', 'rfReceived', 'tempMax', 'tempMin', 'dry10', 'dry15', 'dry20', 'intensiveRain', 'waterDepth', 'duration'];

function buildStateAverages(rawData) {
    const rows = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    const byState = new Map();
    for (const r of rows) {
        const st = (r && r.stateName && String(r.stateName).trim()) || 'Unknown';
        if (!byState.has(st)) byState.set(st, { count: 0, kvkIds: new Set(), sums: Object.fromEntries(AVG_KEYS.map(k => [k, 0])) });
        const b = byState.get(st);
        const m = metricsOf(r);
        b.count += 1;
        if (r.kvkId != null) b.kvkIds.add(Number(r.kvkId));
        for (const k of AVG_KEYS) b.sums[k] += m[k];
    }
    return [...byState.keys()].sort(sortStr).map((stateName) => {
        const b = byState.get(stateName);
        const avg = {};
        for (const k of AVG_KEYS) avg[k] = round2(b.count ? b.sums[k] / b.count : 0);
        return { stateName, noOfKvks: b.kvkIds.size, ...avg };
    });
}

function stateHeadHtml() {
    return `
    <thead>
      <tr>
        <th rowspan="2" class="l">State</th>
        <th rowspan="2">No. of KVKs</th>
        <th colspan="4">Districts data (avg)</th>
        <th colspan="3">Dry spell/ drought (avg)</th>
        <th colspan="1">NICRA Adopted village</th>
        <th colspan="2">Flood (avg)</th>
      </tr>
      <tr>
        <th>RF (mm) Normal</th>
        <th>RF (mm) Received</th>
        <th>Temp 0C Max.</th>
        <th>Temp 0C Min.</th>
        <th>&gt; 10 days</th>
        <th>&gt; 15 days</th>
        <th>&gt; 20 days</th>
        <th>Intensive rain &gt;60 mm</th>
        <th>Water depth (cm)</th>
        <th>Duration (days)</th>
      </tr>
    </thead>`;
}

function renderStateView(ctx, section, sectionId, isFirstSection, rows) {
    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const body = rows.map((r) => `
      <tr>
        <td class="l">${esc(r.stateName)}</td>
        <td>${r.noOfKvks}</td>
        <td>${r.rfNormal}</td>
        <td>${r.rfReceived}</td>
        <td>${r.tempMax}</td>
        <td>${r.tempMin}</td>
        <td>${r.dry10}</td>
        <td>${r.dry15}</td>
        <td>${r.dry20}</td>
        <td>${r.intensiveRain}</td>
        <td>${r.waterDepth}</td>
        <td>${r.duration}</td>
      </tr>`).join('');

    return `
<div id="${sectionId}" class="${pageClass}">
  ${BASIC_STYLE}
  <h1 class="section-title">${section.id} ${ctx._escapeHtml(section.title)}</h1>
  <table class="nicra-basic">${stateHeadHtml()}
    <tbody>${body}</tbody>
  </table>
</div>`;
}

function renderNicraBasicSection(section, data, sectionId, isFirstSection, reportContext = {}) {
    const rows = Array.isArray(data) ? data : (data ? [data] : []);
    if (rows.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }
    if (reportContext.isAggregatedView) {
        return renderStateView(this, section, sectionId, isFirstSection, buildStateAverages(rows));
    }
    return renderKvkView(this, section, sectionId, isFirstSection, buildKvkGroups(rows));
}

// Backward-compatible shape for the standalone Excel/Word export util.
function buildNicraBasicGroups(rawData) {
    const groups = buildKvkGroups(rawData);
    return { groups, isMultiKvk: groups.length > 1 };
}

module.exports = { renderNicraBasicSection, buildNicraBasicGroups, buildStateAverages };
