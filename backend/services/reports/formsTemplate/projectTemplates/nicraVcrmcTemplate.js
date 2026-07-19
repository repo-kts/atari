'use strict';

/**
 * NICRA Village-wise VCRMC  (Section 2.39 / module key: 'nicra-vcrmc')
 *
 * KVK-wise layout: one heading + table per KVK (so admins/superadmin can tell
 * which KVK). The State and KVK columns are dropped — the KVK heading carries
 * that. Columns:
 *
 *   S.No. | Village name | Constitution date | Members (Male|Female|Total) |
 *   Meetings organized | Meeting date | Secretary | President | Major decision
 *
 * Field names differ between the two data sources, so normalizeRow accepts both:
 *   - form module export (_mapResponse): constitutionDate, meetingDate,
 *     maleMembers, femaleMembers, meetingsOrganized, kvk:{kvkName}
 *   - all-report (getNicraVcrmcData): same names + kvkName/stateName flat
 *   (legacy vcrmcConstitutionDate / membersMale / dateOfMeeting still tolerated)
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
    const male = n(pick(r.maleMembers, r.membersMale, 0));
    const female = n(pick(r.femaleMembers, r.membersFemale, 0));
    return {
        kvkName: r.kvkName || r.kvk?.kvkName || '',
        villageName: r.villageName || '',
        constitutionDate: pick(r.constitutionDate, r.vcrmcConstitutionDate) || null,
        maleMembers: male,
        femaleMembers: female,
        membersTotal: r.membersTotal != null ? n(r.membersTotal) : male + female,
        meetingsOrganized: n(r.meetingsOrganized),
        meetingDate: pick(r.meetingDate, r.dateOfMeeting) || null,
        nameOfSecretary: r.nameOfSecretary || '',
        nameOfPresident: r.nameOfPresident || '',
        majorDecisionTaken: r.majorDecisionTaken || '',
    };
}

/**
 * → { groups: [{ kvkName, rows:[...] }], isMultiKvk }
 */
function buildNicraVcrmcGroups(rawData) {
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
  .nicra-vcrmc { width:100%; table-layout:fixed; border-collapse:collapse; font-size:6.5pt; line-height:1.2; margin-bottom:10px; }
  .nicra-vcrmc th,.nicra-vcrmc td { border:0.3px solid #000; padding:2px 3px; text-align:center; vertical-align:middle; word-break:break-word; }
  .nicra-vcrmc thead th { background:#f0f0f0; font-weight:bold; }
  .nicra-vcrmc .l { text-align:left; }
  .nicra-vcrmc-kvk { font-size:9pt; font-weight:bold; margin:8px 0 3px; background:#dce6f1; padding:3px 5px; }
  .nicra-vcrmc-no-data { color:#777; font-style:italic; font-size:9pt; padding:4px 0; }
</style>`;

const COLGROUP = `
    <colgroup>
        <col style="width:3.5%"><col style="width:12%"><col style="width:9%">
        <col style="width:5%"><col style="width:5%"><col style="width:5%">
        <col style="width:7%"><col style="width:9%">
        <col style="width:11%"><col style="width:11%"><col style="width:22.5%">
    </colgroup>`;

const THEAD = `
    <thead>
      <tr>
        <th rowspan="2">S.No.</th>
        <th rowspan="2">Village name</th>
        <th rowspan="2">VCRMC Constitution date</th>
        <th colspan="3">VCRMC members (no.)</th>
        <th rowspan="2">Meetings organized by VCRMC (no.)</th>
        <th rowspan="2">Date of VCRMC meeting</th>
        <th rowspan="2">Name of Secretary</th>
        <th rowspan="2">Name of President</th>
        <th rowspan="2">Major decision taken</th>
      </tr>
      <tr><th>Male</th><th>Female</th><th>Total</th></tr>
    </thead>`;

function buildGroupHTML(g) {
    const body = g.rows.map((r, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td class="l">${esc(r.villageName || '-')}</td>
        <td>${fmtDate(r.constitutionDate)}</td>
        <td>${n(r.maleMembers)}</td>
        <td>${n(r.femaleMembers)}</td>
        <td>${n(r.membersTotal)}</td>
        <td>${n(r.meetingsOrganized)}</td>
        <td>${fmtDate(r.meetingDate)}</td>
        <td class="l">${esc(r.nameOfSecretary || '-')}</td>
        <td class="l">${esc(r.nameOfPresident || '-')}</td>
        <td class="l">${esc(r.majorDecisionTaken || '-')}</td>
      </tr>`).join('');

    return `
      <div class="nicra-vcrmc-kvk">${esc(g.kvkName)}</div>
      <table class="nicra-vcrmc">
        ${COLGROUP}
        ${THEAD}
        <tbody>${body}</tbody>
      </table>`;
}

function renderNicraVcrmcSection(section, data, sectionId, isFirstSection) {
    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const { groups } = buildNicraVcrmcGroups(data);

    const body = groups.length === 0
        ? `<p class="nicra-vcrmc-no-data">No VCRMC data available.</p>`
        : groups.map(buildGroupHTML).join('');

    return `
<div id="${sectionId}" class="${pageClass}">
${STYLE}
  <h1 class="section-title">${esc(section.id)} ${esc(section.title)}</h1>
  ${body}
</div>`;
}

module.exports = {
    renderNicraVcrmcSection,
    buildNicraVcrmcGroups,
    fmtDate,
};
