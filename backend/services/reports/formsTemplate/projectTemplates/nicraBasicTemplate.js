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

function displayRow(r) {
    return {
        rfNormal: num(r.rfMmDistrictNormal ?? r.rfNormal),
        rfReceived: num(r.rfMmDistrictReceived ?? r.rfReceived),
        tempMax: num(r.maxTemperature),
        tempMin: num(r.minTemperature),
        dry10: num(r.dry10),
        dry15: num(r.dry15),
        dry20: num(r.dry20),
        intensiveRain: num(r.intensiveRain),
        waterDepth: num(r.waterDepth),
        duration: r.endDate ? new Date(r.endDate).toISOString().slice(0, 10) : '',
    };
}

/**
 * Groups NICRA basic rows by KVK so admins see each KVK as its own block and a
 * KVK user sees a single block — the KVK name moves to a header band, replacing
 * the per-row KVK column.
 * @returns {{ groups: {kvkName: string, rows: object[]}[], isMultiKvk: boolean }}
 */
function buildNicraBasicGroups(rawData) {
    const rows = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    const byKvk = new Map();
    for (const r of rows) {
        const k = (r && r.kvkName && String(r.kvkName).trim()) || 'Unknown KVK';
        if (!byKvk.has(k)) byKvk.set(k, []);
        byKvk.get(k).push(r);
    }
    const groups = [...byKvk.keys()].sort(sortStr).map((kvkName) => ({
        kvkName,
        rows: byKvk.get(kvkName).map(displayRow),
    }));
    return { groups, isMultiKvk: groups.length > 1 };
}

function headHtml() {
    return `
    <thead>
      <tr>
        <th colspan="4">Districts data</th>
        <th colspan="3">Dry spell/ drought</th>
        <th colspan="1">NICRA Adopted village</th>
        <th colspan="2">Flood</th>
      </tr>
      <tr>
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

function renderNicraBasicSection(section, data, sectionId, isFirstSection) {
    const { groups } = buildNicraBasicGroups(data);
    if (groups.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';

    const groupsHtml = groups.map((g) => {
        const body = g.rows.map((r) => `
        <tr>
            <td>${r.rfNormal}</td>
            <td>${r.rfReceived}</td>
            <td>${r.tempMax}</td>
            <td>${r.tempMin}</td>
            <td>${r.dry10}</td>
            <td>${r.dry15}</td>
            <td>${r.dry20}</td>
            <td>${r.intensiveRain}</td>
            <td>${r.waterDepth}</td>
            <td>${esc(r.duration)}</td>
        </tr>`).join('');

        return `
  <div class="nicra-basic-group">
    <div class="nicra-basic-kvk-hd">${esc(g.kvkName)}</div>
    <table class="nicra-basic">${headHtml()}
      <tbody>${body}</tbody>
    </table>
  </div>`;
    }).join('');

    return `
<div id="${sectionId}" class="${pageClass}">
  <style>
    .nicra-basic-group { page-break-inside: avoid; break-inside: avoid; margin-bottom: 8px; }
    .nicra-basic-kvk-hd { font-size: 8pt; font-weight: bold; background: #dce6f1; padding: 3px 5px; border: 0.2px solid #000; border-bottom: 0; page-break-after: avoid; break-after: avoid; }
    .nicra-basic { width: 100%; table-layout: fixed; border-collapse: collapse; font-size: 6.6pt; line-height: 1.2; }
    .nicra-basic th, .nicra-basic td { border: 0.2px solid #000; padding: 2px 3px; text-align: center; vertical-align: middle; word-break: break-word; }
    .nicra-basic thead th { background: #e8e8e8; font-weight: bold; }
  </style>
  <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
  ${groupsHtml}
</div>`;
}

module.exports = { renderNicraBasicSection, buildNicraBasicGroups };
