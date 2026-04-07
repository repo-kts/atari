'use strict';

/**
 * NICRA Intervention PDF template  (Section 2.24.1 / module key: 'nicra-intervention')
 *
 * Layout:
 *   S.No. | State | KVK | Seed bank (Crop with variety | Quantity in (q)) |
 *                         Fodder bank (Fodder crop with variety | Quantity in (q))
 *
 * Data modes:
 *   1. All-report  – data is already an array of intervention pair objects from
 *      getNicraInterventionData() → { kvkName, stateName, seedCropVariety,
 *      seedQuantityQ, fodderCropVariety, fodderQuantityQ }
 *   2. Module export – data is a flat array of raw NicraIntervention form records
 *      (from the forms repo). We split by seedBankFodderBank type and zip.
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

const STYLE = `
<style>
  .nicra-int-table {
    width: 100%; table-layout: fixed; border-collapse: collapse;
    font-size: 8pt; line-height: 1.3;
  }
  .nicra-int-table th, .nicra-int-table td {
    border: 0.5px solid #000; padding: 3px 4px;
    text-align: center; vertical-align: middle; word-break: break-word;
  }
  .nicra-int-table th { font-weight: bold; background: #f0f0f0; }
  .nicra-int-table td.L { text-align: left; }
  .nicra-int-title { font-size: 10pt; font-weight: bold; margin: 6px 0 4px; }
  .nicra-int-no-data { color: #777; font-style: italic; font-size: 9pt; padding: 4px 0; }
</style>`;

/* ── build paired rows from raw flat form records (module export) ──────────── */

function buildPairsFromRawRecords(records) {
    const seedRows   = records.filter(r => /seed/i.test(r.seedBankFodderBank || ''));
    const fodderRows = records.filter(r => /fodder/i.test(r.seedBankFodderBank || ''));
    const len = Math.max(seedRows.length, fodderRows.length);

    const pairs = [];
    for (let i = 0; i < len; i++) {
        const s = seedRows[i];
        const f = fodderRows[i];
        const base = s || f;
        pairs.push({
            kvkName:          base?.kvkName || '',
            stateName:        base?.stateName || '',
            seedCropVariety:  s ? `${s.crop || ''} ${s.variety || ''}`.trim() : '',
            seedQuantityQ:    s ? num(s.quantityQ) : null,
            fodderCropVariety: f ? `${f.crop || ''} ${f.variety || ''}`.trim() : '',
            fodderQuantityQ:  f ? num(f.quantityQ) : null,
        });
    }
    return pairs;
}

/* ── table HTML ───────────────────────────────────────────────────────────── */

function buildTableHTML(pairs) {
    if (!pairs || pairs.length === 0) {
        return `<p class="nicra-int-no-data">No intervention data available.</p>`;
    }

    const rows = pairs.map((r, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td class="L">${esc(r.stateName || '-')}</td>
            <td class="L">${esc(r.kvkName || '-')}</td>
            <td class="L">${esc(r.seedCropVariety || '-')}</td>
            <td>${r.seedQuantityQ != null ? num(r.seedQuantityQ) : '-'}</td>
            <td class="L">${esc(r.fodderCropVariety || '-')}</td>
            <td>${r.fodderQuantityQ != null ? num(r.fodderQuantityQ) : '-'}</td>
        </tr>`).join('');

    return `
        <table class="nicra-int-table">
            <colgroup>
                <col style="width:5%">
                <col style="width:12%">
                <col style="width:18%">
                <col style="width:25%">
                <col style="width:10%">
                <col style="width:22%">
                <col style="width:8%">
            </colgroup>
            <thead>
                <tr>
                    <th rowspan="2">S.No.</th>
                    <th rowspan="2">State</th>
                    <th rowspan="2">KVK</th>
                    <th colspan="2">Seed bank</th>
                    <th colspan="2">Fodder bank</th>
                </tr>
                <tr>
                    <th>Crop with variety</th>
                    <th>Quantity in (q)</th>
                    <th>Fodder crop with variety</th>
                    <th>Quantity in (q)</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>`;
}

/* ── main renderer ────────────────────────────────────────────────────────── */

/**
 * Correct signature: (section, data, sectionId, isFirstSection, reportContext)
 */
function renderNicraInterventionSection(section, data, sectionId, isFirstSection, reportContext = {}) {
    const pageClass = isFirstSection
        ? 'section-page section-page-first'
        : 'section-page section-page-continued';

    let pairs;

    // Mode 1 – all-report: data is already an array of pair objects
    if (Array.isArray(data) && (data.length === 0 || data[0]?.seedCropVariety !== undefined)) {
        pairs = data;
    } else if (Array.isArray(data)) {
        // Mode 2 – module export: flat raw records from forms repository
        pairs = buildPairsFromRawRecords(data);
    } else {
        pairs = [];
    }

    return `
<div id="${sectionId}" class="${pageClass}">
${STYLE}
  <h1 class="section-title">${esc(section.id)} ${esc(section.title)}</h1>
  <p class="nicra-int-title">Seed Bank &amp; Fodder Bank Intervention Details</p>
  ${buildTableHTML(pairs)}
</div>`;
}

module.exports = { renderNicraInterventionSection };
