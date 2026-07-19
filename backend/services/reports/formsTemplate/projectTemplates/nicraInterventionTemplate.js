'use strict';

/**
 * NICRA Other Interventions  (Section 2.37 / module key: 'nicra-intervention')
 *
 * Detailed, KVK-wise layout (so admins/superadmin can tell which KVK a row
 * belongs to). One heading + table per KVK, mirroring the "Other Extension
 * Activities" report. Columns are the actual form fields:
 *
 *   S.No. | Bank Type | Crop | Variety | Quantity (q) | Start Date | End Date
 *
 * Data modes (all normalised by buildNicraInterventionGroups):
 *   1. All-report  – getNicraInterventionData() rows:
 *      { kvkName, stateName, bankType, crop, variety, quantityQ, startDate, endDate }
 *   2. Module export – raw form records posted by the data-management page:
 *      { kvk:{kvkName}, seedBankFodderBank:<name>, crop, variety, quantityQ,
 *        startDate, endDate }
 *
 * The same group structure feeds the PDF (this file), Excel and Word
 * (nicraInterventionPageExport.js) so all three match exactly.
 */

/* ── helpers ──────────────────────────────────────────────────────────────── */

function esc(v) {
    if (v == null) return '';
    const m = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(v).replace(/[&<>"']/g, c => m[c]);
}

function num(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}

// DD-MM-YYYY from a Date or 'YYYY-MM-DD'(T...) string. '-' when empty.
function fmtDate(v) {
    if (!v) return '-';
    const d = v instanceof Date ? v : new Date(v);
    if (isNaN(d)) return String(v);
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    return `${dd}-${mm}-${d.getUTCFullYear()}`;
}

/* ── group builder (shared with Excel/Word) ────────────────────────────────── */

function normalizeRow(r) {
    let bank = r.bankType;
    if (!bank) {
        const sb = r.seedBankFodderBank;
        bank = typeof sb === 'string' ? sb : sb?.name || '';
    }
    return {
        kvkName: r.kvkName || r.kvk?.kvkName || '',
        stateName: r.stateName || r.kvk?.state?.stateName || '',
        bankType: bank || '',
        crop: r.crop || '',
        variety: r.variety || '',
        quantityQ: r.quantityQ != null ? num(r.quantityQ) : 0,
        startDate: r.startDate || null,
        endDate: r.endDate || null,
    };
}

/**
 * → { groups: [{ kvkName, rows:[...], subtotal }], isMultiKvk, grandTotal }
 */
function buildNicraInterventionGroups(rawData) {
    const records = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    const map = new Map();

    for (const raw of records) {
        const r = normalizeRow(raw);
        const key = r.kvkName || '—';
        if (!map.has(key)) map.set(key, { kvkName: r.kvkName || '—', rows: [], subtotal: 0 });
        const g = map.get(key);
        g.rows.push(r);
        g.subtotal += r.quantityQ;
    }

    const groups = Array.from(map.values());
    const grandTotal = groups.reduce((s, g) => s + g.subtotal, 0);
    return { groups, isMultiKvk: groups.length > 1, grandTotal };
}

/* ── PDF rendering ──────────────────────────────────────────────────────────── */

const STYLE = `
<style>
  .nicra-int-table {
    width: 100%; table-layout: fixed; border-collapse: collapse;
    font-size: 7pt; line-height: 1.25; margin-bottom: 10px;
  }
  .nicra-int-table th, .nicra-int-table td {
    border: 0.5px solid #000; padding: 2px 3px;
    text-align: center; vertical-align: middle; word-break: break-word;
  }
  .nicra-int-table th { font-weight: bold; background: #f0f0f0; }
  .nicra-int-table td.L { text-align: left; }
  .nicra-int-table tr.sub td { font-weight: bold; background: #f1f5f9; }
  .nicra-int-kvk { font-size: 9pt; font-weight: bold; margin: 8px 0 3px; background:#dce6f1; padding:3px 5px; }
  .nicra-int-grand { font-size: 8pt; font-weight: bold; margin: 6px 0; }
  .nicra-int-no-data { color: #777; font-style: italic; font-size: 9pt; padding: 4px 0; }
</style>`;

const COLGROUP = `
    <colgroup>
        <col style="width:5%">
        <col style="width:20%">
        <col style="width:21%">
        <col style="width:21%">
        <col style="width:11%">
        <col style="width:11%">
        <col style="width:11%">
    </colgroup>`;

const THEAD = `
    <thead>
        <tr>
            <th>S.No.</th>
            <th>Bank Type</th>
            <th>Crop</th>
            <th>Variety</th>
            <th>Quantity (q)</th>
            <th>Start Date</th>
            <th>End Date</th>
        </tr>
    </thead>`;

function buildGroupHTML(g) {
    const rows = g.rows.map((r, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td class="L">${esc(r.bankType || '-')}</td>
            <td class="L">${esc(r.crop || '-')}</td>
            <td class="L">${esc(r.variety || '-')}</td>
            <td>${num(r.quantityQ)}</td>
            <td>${fmtDate(r.startDate)}</td>
            <td>${fmtDate(r.endDate)}</td>
        </tr>`).join('');

    return `
        <div class="nicra-int-kvk">${esc(g.kvkName)}</div>
        <table class="nicra-int-table">
            ${COLGROUP}
            ${THEAD}
            <tbody>
                ${rows}
                <tr class="sub">
                    <td colspan="4">Sub-total — ${esc(g.kvkName)}</td>
                    <td>${num(g.subtotal)}</td>
                    <td colspan="2"></td>
                </tr>
            </tbody>
        </table>`;
}

function renderNicraInterventionSection(section, data, sectionId, isFirstSection, reportContext = {}) {
    const pageClass = isFirstSection
        ? 'section-page section-page-first'
        : 'section-page section-page-continued';

    const { groups, isMultiKvk, grandTotal } = buildNicraInterventionGroups(data);

    const body = groups.length === 0
        ? `<p class="nicra-int-no-data">No intervention data available.</p>`
        : groups.map(buildGroupHTML).join('')
          + (isMultiKvk ? `<p class="nicra-int-grand">Grand Total (all KVKs): ${num(grandTotal)} q</p>` : '');

    return `
<div id="${sectionId}" class="${pageClass}">
${STYLE}
  <h1 class="section-title">${esc(section.id)} ${esc(section.title)}</h1>
  <p class="nicra-int-grand">Seed Bank &amp; Fodder Bank Intervention Details</p>
  ${body}
</div>`;
}

module.exports = {
    renderNicraInterventionSection,
    buildNicraInterventionGroups,
    fmtDate,
};
