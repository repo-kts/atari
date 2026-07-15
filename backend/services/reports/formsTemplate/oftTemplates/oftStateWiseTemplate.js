/**
 * OFT State Wise Details Template (Section 2.2.1)
 *
 * Per-state farmer participation broken down by category and gender (mirrors
 * the FLD state-wise table). Split out of oftSummaryTemplate so it is its own
 * independently-selectable report section. Aggregated-only — the single-KVK
 * report never selects this section (see `aggregatedOnly` in reportConfig).
 *
 * Data shape expected (same source as OFT Summary — `oftSummary`):
 *   { records: [...OFT rows], subjects: [...] }   single scope
 *   [ { records, subjects }, ... ]                super-admin: one chunk per KVK
 *
 * Bound to reportTemplateService (`this`).
 */

// Records reach this template in two shapes: the raw Prisma shape (data-service
// path) and the flattened `_mapOftResponse` shape (module-wise export posts this).
function readState(r) {
    return r.kvk?.state?.stateName || r.stateName || null;
}

const FARMER_FIELD_MAP = {
    genM: ['farmersGeneralM', 'gen_m'],
    genF: ['farmersGeneralF', 'gen_f'],
    obcM: ['farmersObcM', 'obc_m'],
    obcF: ['farmersObcF', 'obc_f'],
    scM: ['farmersScM', 'sc_m'],
    scF: ['farmersScF', 'sc_f'],
    stM: ['farmersStM', 'st_m'],
    stF: ['farmersStF', 'st_f'],
};

const FARMER_KEYS = ['genM', 'genF', 'obcM', 'obcF', 'scM', 'scF', 'stM', 'stF'];

function readFarmer(r, key) {
    for (const f of FARMER_FIELD_MAP[key]) {
        const v = r[f];
        if (v !== undefined && v !== null && v !== '') return Number(v) || 0;
    }
    return 0;
}

// Normalise every shape the orchestration can hand us into a flat records array.
function extractRecords(data) {
    if (data && !Array.isArray(data) && Array.isArray(data.records)) {
        return data.records;
    }
    if (Array.isArray(data)) {
        if (data.some(d => d && (Array.isArray(d.records) || Array.isArray(d.subjects)))) {
            const records = [];
            for (const chunk of data) {
                if (Array.isArray(chunk?.records)) records.push(...chunk.records);
            }
            return records;
        }
        return data;
    }
    if (data) return [data];
    return [];
}

function renderOftStateWiseSection(section, data, sectionId, isFirstSection, reportContext = {}) {
    const records = extractRecords(data);

    if (records.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection
        ? 'section-page section-page-first'
        : 'section-page section-page-continued';

    const moduleLabel = reportContext.isStandalone
        ? (section.exportTitle || section.title)
        : `${section.id} ${this._escapeHtml(section.title)}`;

    const byState = new Map();
    for (const r of records) {
        const stateName = readState(r) || r.kvk?.kvkName || r.kvkName || 'Unknown';
        if (!byState.has(stateName)) {
            byState.set(stateName, { genM: 0, genF: 0, obcM: 0, obcF: 0, scM: 0, scF: 0, stM: 0, stF: 0 });
        }
        const b = byState.get(stateName);
        for (const k of FARMER_KEYS) b[k] += readFarmer(r, k);
    }

    const sumRow = (b) => FARMER_KEYS.reduce((acc, k) => acc + b[k], 0);
    const total = { genM: 0, genF: 0, obcM: 0, obcF: 0, scM: 0, scF: 0, stM: 0, stF: 0 };
    let rows = '';
    for (const [stateName, b] of byState) {
        for (const k of FARMER_KEYS) total[k] += b[k];
        rows += `
            <tr>
                <td>${this._escapeHtml(stateName)}</td>
                ${FARMER_KEYS.map(k => `<td style="text-align:center;">${b[k]}</td>`).join('')}
                <td style="text-align:center;font-weight:bold;">${sumRow(b)}</td>
            </tr>`;
    }
    if (!rows) {
        rows = `<tr><td colspan="10" style="text-align:center;">No data</td></tr>`;
    }

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title" style="margin-bottom:8px;">${moduleLabel}</h1>
    <table class="data-table">
        <thead>
            <tr>
                <th rowspan="2" style="vertical-align:middle;">States</th>
                <th colspan="8" style="text-align:center;">No. of Farmers</th>
                <th rowspan="2" style="vertical-align:middle;text-align:center;">Total</th>
            </tr>
            <tr>
                <th style="text-align:center;">General M</th>
                <th style="text-align:center;">General F</th>
                <th style="text-align:center;">OBC M</th>
                <th style="text-align:center;">OBC F</th>
                <th style="text-align:center;">SC M</th>
                <th style="text-align:center;">SC F</th>
                <th style="text-align:center;">ST M</th>
                <th style="text-align:center;">ST F</th>
            </tr>
        </thead>
        <tbody>
            ${rows}
            <tr style="font-weight:bold;">
                <td>Total</td>
                ${FARMER_KEYS.map(k => `<td style="text-align:center;">${total[k]}</td>`).join('')}
                <td style="text-align:center;">${sumRow(total)}</td>
            </tr>
        </tbody>
    </table>
</div>`;
}

module.exports = { renderOftStateWiseSection };
