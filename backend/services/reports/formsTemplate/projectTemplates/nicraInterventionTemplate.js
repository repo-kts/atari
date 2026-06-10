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

/* ── build paired rows from intervention records ───────────────────────────── */

/**
 * Normalise a record into a common shape regardless of source:
 *   - all-report repo  → { bankType, cropWithVariety, quantityQ, kvkName, stateName }
 *   - module export    → { seedBankFodderBank (string|{name}), crop, variety, quantityQ }
 */
function normalizeRow(r) {
    let bank = r.bankType;
    if (!bank) {
        const sb = r.seedBankFodderBank;
        bank = typeof sb === 'string' ? sb : sb?.name || '';
    }
    let cropVariety = r.cropWithVariety;
    if (cropVariety == null) {
        cropVariety = r.variety
            ? `${r.crop || ''} ${r.variety}`.trim()
            : r.crop || '';
    }
    return {
        kvkName: r.kvkName || '',
        stateName: r.stateName || '',
        bank: bank || '',
        cropVariety: cropVariety || '',
        qty: r.quantityQ != null ? num(r.quantityQ) : null,
    };
}

function buildPairs(records) {
    // Group per KVK so seed/fodder entries pair within the same KVK row.
    const groups = new Map();
    for (const raw of records) {
        const r = normalizeRow(raw);
        const key = `${r.stateName}::${r.kvkName}`;
        if (!groups.has(key)) {
            groups.set(key, { stateName: r.stateName, kvkName: r.kvkName, seed: [], fodder: [] });
        }
        const g = groups.get(key);
        if (/fodder/i.test(r.bank)) g.fodder.push(r);
        else g.seed.push(r); // seed bank, or unknown → seed column
    }

    const pairs = [];
    for (const g of groups.values()) {
        const len = Math.max(g.seed.length, g.fodder.length);
        for (let i = 0; i < len; i++) {
            const s = g.seed[i];
            const f = g.fodder[i];
            if (!s && !f) continue;
            pairs.push({
                kvkName: g.kvkName,
                stateName: g.stateName,
                seedCropVariety: s ? s.cropVariety : '',
                seedQuantityQ: s ? s.qty : null,
                fodderCropVariety: f ? f.cropVariety : '',
                fodderQuantityQ: f ? f.qty : null,
            });
        }
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

    if (!Array.isArray(data)) {
        pairs = [];
    } else if (data.length > 0 && data[0]?.seedCropVariety !== undefined) {
        // Already paired (some callers pre-pair the rows).
        pairs = data;
    } else {
        // Flat intervention rows (all-report repo or module export) → pair them.
        pairs = buildPairs(data);
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
