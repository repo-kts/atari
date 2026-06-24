'use strict';

/**
 * NICRA Others - PI & Co-PI List  (module key: 'nicra-pi-copi')
 *
 * KVK-wise layout: one heading + table per KVK (so admins/superadmin can tell
 * which KVK). The KVK column is dropped — the KVK heading carries it. Columns:
 *
 *   S.No. | Type (PI/Co-PI) | Name | Start date | End date
 *
 * Field names differ between the two data sources, so normalizeRow accepts both:
 *   - form module export (findAll): type (piType.name), name, startDate, endDate,
 *     kvk:{kvkName}
 *   - flat shape: kvkName/stateName flat
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
        type: pick(r.type, r.piType?.name) || '',
        name: r.name || '',
        startDate: r.startDate || null,
        endDate: r.endDate || null,
    };
}

/**
 * → { groups: [{ kvkName, rows:[...] }], isMultiKvk }
 */
function buildNicraPiCopiGroups(rawData) {
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

/* ── PDF rendering ──────────────────────────────────────────────────────────── */

const STYLE = `
<style>
  .nicra-picopi { width:100%; table-layout:fixed; border-collapse:collapse; font-size:8pt; line-height:1.2; margin-bottom:10px; }
  .nicra-picopi th,.nicra-picopi td { border:0.3px solid #000; padding:3px 4px; text-align:center; vertical-align:middle; word-break:break-word; }
  .nicra-picopi thead th { background:#f0f0f0; font-weight:bold; }
  .nicra-picopi .l { text-align:left; }
  .nicra-picopi-kvk { font-size:9pt; font-weight:bold; margin:8px 0 3px; background:#dce6f1; padding:3px 5px; }
  .nicra-picopi-no-data { color:#777; font-style:italic; font-size:9pt; padding:4px 0; }
</style>`;

const COLGROUP = `
    <colgroup>
        <col style="width:6%"><col style="width:22%"><col style="width:42%">
        <col style="width:15%"><col style="width:15%">
    </colgroup>`;

const THEAD = `
    <thead>
      <tr>
        <th>S.No.</th>
        <th>Type</th>
        <th>Name</th>
        <th>Start date</th>
        <th>End date</th>
      </tr>
    </thead>`;

function buildGroupHTML(g) {
    const body = g.rows.map((r, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td class="l">${esc(r.type || '-')}</td>
        <td class="l">${esc(r.name || '-')}</td>
        <td>${fmtDate(r.startDate)}</td>
        <td>${fmtDate(r.endDate)}</td>
      </tr>`).join('');

    return `
      <div class="nicra-picopi-kvk">${esc(g.kvkName)}</div>
      <table class="nicra-picopi">
        ${COLGROUP}
        ${THEAD}
        <tbody>${body}</tbody>
      </table>`;
}

function renderNicraPiCopiSection(section, data, sectionId, isFirstSection) {
    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const { groups } = buildNicraPiCopiGroups(data);

    const body = groups.length === 0
        ? `<p class="nicra-picopi-no-data">No PI &amp; Co-PI data available.</p>`
        : groups.map(buildGroupHTML).join('');

    return `
<div id="${sectionId}" class="${pageClass}">
${STYLE}
  <h1 class="section-title">${esc(section.id)} ${esc(section.title)}</h1>
  ${body}
</div>`;
}

module.exports = {
    renderNicraPiCopiSection,
    buildNicraPiCopiGroups,
    fmtDate,
};
