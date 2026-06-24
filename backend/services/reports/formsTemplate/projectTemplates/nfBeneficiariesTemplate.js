'use strict';

/**
 * Natural Farming - Details of Beneficiaries  (module key: 'natural-farming-beneficiaries')
 *
 * KVK-wise layout: one heading + table per KVK (so admins/superadmin can tell
 * which KVK; a KVK user sees only their own). The KVK column is dropped — the
 * KVK heading carries it. Columns:
 *
 *   S.No. | Reporting year | No. of blocks covered | No. of villages covered |
 *   Total no. of Trained/Practicing NF Farmer | No. of farmers influenced to
 *   adopt NF | No. of farmers engaged all season | No. of farmers engaged in
 *   1 season | Remarks
 */

function esc(t) {
    if (t == null) return '';
    const m = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(t).replace(/[&<>"']/g, c => m[c]);
}

function n(v) {
    const x = Number(v);
    return Number.isFinite(x) ? x : 0;
}

function pick(...vals) {
    for (const v of vals) if (v !== undefined && v !== null && v !== '') return v;
    return undefined;
}

/* ── group builder (shared with Excel/Word) ────────────────────────────────── */

function normalizeRow(r) {
    return {
        kvkName: r.kvkName || r.kvk?.kvkName || '',
        reportingYear: pick(r.reportingYear, r.year) || '',
        blocksCovered: n(pick(r.noOfBlocks, r.blocksCovered, 0)),
        villagesCovered: n(pick(r.noOfVillages, r.villagesCovered, 0)),
        totalTrainedFarmers: n(r.totalTrainedFarmers),
        farmersInfluenced: n(r.farmersInfluenced),
        farmersEngagedAllSeason: n(r.farmersEngagedAllSeason),
        farmersEngagedOneSeason: n(r.farmersEngagedOneSeason),
        remarks: r.remarks || '',
    };
}

/**
 * → { groups: [{ kvkName, rows:[...] }], isMultiKvk }
 */
function buildNfBeneficiariesGroups(rawData) {
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
  .nf-ben { width:100%; table-layout:fixed; border-collapse:collapse; font-size:7.5pt; line-height:1.2; margin-bottom:10px; }
  .nf-ben th,.nf-ben td { border:0.3px solid #000; padding:3px 4px; text-align:center; vertical-align:middle; word-break:break-word; }
  .nf-ben thead th { background:#f0f0f0; font-weight:bold; }
  .nf-ben .l { text-align:left; }
  .nf-ben-kvk { font-size:9pt; font-weight:bold; margin:8px 0 3px; background:#dce6f1; padding:3px 5px; }
  .nf-ben-no-data { color:#777; font-style:italic; font-size:9pt; padding:4px 0; }
</style>`;

const COLGROUP = `
    <colgroup>
        <col style="width:5%"><col style="width:9%"><col style="width:9%">
        <col style="width:9%"><col style="width:13%"><col style="width:13%">
        <col style="width:13%"><col style="width:13%"><col style="width:16%">
    </colgroup>`;

const THEAD = `
    <thead>
      <tr>
        <th>S.No.</th>
        <th>Reporting year</th>
        <th>No. of blocks covered</th>
        <th>No. of villages covered</th>
        <th>Total no. of Trained/Practicing NF Farmer</th>
        <th>No. of farmers influenced to adopt NF</th>
        <th>No. of farmers engaged all season</th>
        <th>No. of farmers engaged in 1 season</th>
        <th>Remarks</th>
      </tr>
    </thead>`;

function buildGroupHTML(g) {
    const body = g.rows.map((r, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${esc(r.reportingYear || '-')}</td>
        <td>${n(r.blocksCovered)}</td>
        <td>${n(r.villagesCovered)}</td>
        <td>${n(r.totalTrainedFarmers)}</td>
        <td>${n(r.farmersInfluenced)}</td>
        <td>${n(r.farmersEngagedAllSeason)}</td>
        <td>${n(r.farmersEngagedOneSeason)}</td>
        <td class="l">${esc(r.remarks || '-')}</td>
      </tr>`).join('');

    return `
      <div class="nf-ben-kvk">${esc(g.kvkName)}</div>
      <table class="nf-ben">
        ${COLGROUP}
        ${THEAD}
        <tbody>${body}</tbody>
      </table>`;
}

function renderNfBeneficiariesSection(section, data, sectionId, isFirstSection) {
    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const { groups } = buildNfBeneficiariesGroups(data);

    const body = groups.length === 0
        ? `<p class="nf-ben-no-data">No Beneficiaries data available.</p>`
        : groups.map(buildGroupHTML).join('');

    return `
<div id="${sectionId}" class="${pageClass}">
${STYLE}
  <h1 class="section-title">${esc(section.id)} ${esc(section.title)}</h1>
  ${body}
</div>`;
}

module.exports = {
    renderNfBeneficiariesSection,
    buildNfBeneficiariesGroups,
};
