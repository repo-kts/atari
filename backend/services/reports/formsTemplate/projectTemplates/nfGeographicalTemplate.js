'use strict';

/**
 * Natural Farming - Geographical Information  (module key: 'natural-farming-geo')
 *
 * KVK-wise layout: one heading + table per KVK (so admins/superadmin can tell
 * which KVK; a KVK user sees only their own). The KVK column is dropped — the
 * KVK heading carries it. Columns:
 *
 *   S.No. | Start date | End date | Agro-climatic zone |
 *   Farming situation of selected farmer | Latitude (N) | Longitude (E)
 *
 * Field names differ between data sources, so normalizeRow accepts both:
 *   - form module export (findAll): startDate, endDate, agroClimaticZone,
 *     farmingSituation/farmingSituationOfSelectedFarmer, latitude/latitudeN,
 *     longitude/longitudeE, kvk:{kvkName}
 */

function esc(t) {
    if (t == null) return '';
    const m = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(t).replace(/[&<>"']/g, c => m[c]);
}

// DD-MM-YYYY from Date or 'YYYY-MM-DD'(T...) string. '-' when empty.
function fmtDate(v) {
    if (!v) return '-';
    const x = v instanceof Date ? v : new Date(v);
    if (isNaN(x)) return String(v);
    const dd = String(x.getUTCDate()).padStart(2, '0');
    const mm = String(x.getUTCMonth() + 1).padStart(2, '0');
    return `${dd}-${mm}-${x.getUTCFullYear()}`;
}

function pick(...vals) {
    for (const v of vals) if (v !== undefined && v !== null && v !== '') return v;
    return undefined;
}

/* ── group builder (shared with Excel/Word) ────────────────────────────────── */

function normalizeRow(r) {
    return {
        kvkName: r.kvkName || r.kvk?.kvkName || '',
        startDate: r.startDate || null,
        endDate: r.endDate || null,
        agroClimaticZone: r.agroClimaticZone || '',
        farmingSituation: pick(r.farmingSituationOfSelectedFarmer, r.farmingSituation) || '',
        latitude: pick(r.latitudeN, r.latitude),
        longitude: pick(r.longitudeE, r.longitude),
    };
}

/**
 * → { groups: [{ kvkName, rows:[...] }], isMultiKvk }
 */
function buildNfGeographicalGroups(rawData) {
    const records = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    const map = new Map();
    for (const raw of records) {
        const r = normalizeRow(raw);
        const key = r.kvkName || '—';
        if (!map.has(key)) map.set(key, { kvkName: r.kvkName || '—', rows: [] });
        map.get(key).rows.push(r);
    }
    const groups = Array.from(map.values());
    return { groups, isMultiKvk: groups.length > 1 };
}

function fmtNum(v) {
    if (v === undefined || v === null || v === '') return '-';
    const x = Number(v);
    return Number.isFinite(x) ? String(x) : String(v);
}

/* ── PDF rendering ──────────────────────────────────────────────────────────── */

const STYLE = `
<style>
  .nf-geo { width:100%; table-layout:fixed; border-collapse:collapse; font-size:8pt; line-height:1.2; margin-bottom:10px; }
  .nf-geo th,.nf-geo td { border:0.3px solid #000; padding:3px 4px; text-align:center; vertical-align:middle; word-break:break-word; }
  .nf-geo thead th { background:#f0f0f0; font-weight:bold; }
  .nf-geo .l { text-align:left; }
  .nf-geo-kvk { font-size:9pt; font-weight:bold; margin:8px 0 3px; background:#dce6f1; padding:3px 5px; }
  .nf-geo-no-data { color:#777; font-style:italic; font-size:9pt; padding:4px 0; }
</style>`;

const COLGROUP = `
    <colgroup>
        <col style="width:6%"><col style="width:13%"><col style="width:13%">
        <col style="width:24%"><col style="width:24%">
        <col style="width:10%"><col style="width:10%">
    </colgroup>`;

const THEAD = `
    <thead>
      <tr>
        <th>S.No.</th>
        <th>Start date</th>
        <th>End date</th>
        <th>Agro-climatic zone</th>
        <th>Farming situation of selected farmer</th>
        <th>Latitude (N)</th>
        <th>Longitude (E)</th>
      </tr>
    </thead>`;

function buildGroupHTML(g) {
    const body = g.rows.map((r, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${fmtDate(r.startDate)}</td>
        <td>${fmtDate(r.endDate)}</td>
        <td class="l">${esc(r.agroClimaticZone || '-')}</td>
        <td class="l">${esc(r.farmingSituation || '-')}</td>
        <td>${fmtNum(r.latitude)}</td>
        <td>${fmtNum(r.longitude)}</td>
      </tr>`).join('');

    return `
      <div class="nf-geo-kvk">${esc(g.kvkName)}</div>
      <table class="nf-geo">
        ${COLGROUP}
        ${THEAD}
        <tbody>${body}</tbody>
      </table>`;
}

function renderNfGeographicalSection(section, data, sectionId, isFirstSection) {
    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const { groups } = buildNfGeographicalGroups(data);

    const body = groups.length === 0
        ? `<p class="nf-geo-no-data">No Geographical Information available.</p>`
        : groups.map(buildGroupHTML).join('');

    return `
<div id="${sectionId}" class="${pageClass}">
${STYLE}
  <h1 class="section-title">${esc(section.id)} ${esc(section.title)}</h1>
  ${body}
</div>`;
}

module.exports = {
    renderNfGeographicalSection,
    buildNfGeographicalGroups,
    fmtDate,
    fmtNum,
};
