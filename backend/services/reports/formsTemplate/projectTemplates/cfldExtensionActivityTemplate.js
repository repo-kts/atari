function toNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

function formatDate(value) {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '-';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function sortStr(a, b) {
    return String(a || '').localeCompare(String(b || ''), undefined, { sensitivity: 'base' });
}

function activityLabel(row) {
    return row.extensionActivityName
        || row.extensionActivityOrganized
        || row.extensionActivitiesOrganized
        || (row.extensionActivity && row.extensionActivity.extensionName)
        || '-';
}

function displayRow(row) {
    const generalM = toNumber(row.generalM ?? row.genM);
    const generalF = toNumber(row.generalF ?? row.genF);
    const obcM = toNumber(row.obcM);
    const obcF = toNumber(row.obcF);
    const scM = toNumber(row.scM);
    const scF = toNumber(row.scF);
    const stM = toNumber(row.stM);
    const stF = toNumber(row.stF);
    const totalM = generalM + obcM + scM + stM;
    const totalF = generalF + obcF + scF + stF;
    return {
        activity: activityLabel(row),
        season: row.seasonName || row.season || '-',
        dateAndPlace: `${formatDate(row.activityDate || row.date)} and ${row.placeOfActivity || '-'}`,
        generalM, generalF, generalT: generalM + generalF,
        obcM, obcF, obcT: obcM + obcF,
        scM, scF, scT: scM + scF,
        stM, stF, stT: stM + stF,
        totalM, totalF, totalT: totalM + totalF,
    };
}

function emptyTotals() {
    return { generalM: 0, generalF: 0, obcM: 0, obcF: 0, scM: 0, scF: 0, stM: 0, stF: 0, totalM: 0, totalF: 0 };
}

function addTotals(z, r) {
    z.generalM += r.generalM; z.generalF += r.generalF;
    z.obcM += r.obcM; z.obcF += r.obcF;
    z.scM += r.scM; z.scF += r.scF;
    z.stM += r.stM; z.stF += r.stF;
    z.totalM += r.totalM; z.totalF += r.totalF;
}

function totalsRow(z) {
    return {
        generalM: z.generalM, generalF: z.generalF, generalT: z.generalM + z.generalF,
        obcM: z.obcM, obcF: z.obcF, obcT: z.obcM + z.obcF,
        scM: z.scM, scF: z.scF, scT: z.scM + z.scF,
        stM: z.stM, stF: z.stF, stT: z.stM + z.stF,
        totalM: z.totalM, totalF: z.totalF, totalT: z.totalM + z.totalF,
    };
}

/**
 * Groups CFLD extension rows by KVK. Sl.No resets within each group; each group
 * carries a sub-total, and a grand total is provided for multi-KVK (admin).
 * @returns {{ groups: object[], grandTotal: object, isMultiKvk: boolean }}
 */
function buildCfldExtensionGroups(rawData) {
    const rows = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    const byKvk = new Map();
    for (const r of rows) {
        const k = (r && r.kvkName && String(r.kvkName).trim()) || 'Unknown KVK';
        if (!byKvk.has(k)) byKvk.set(k, []);
        byKvk.get(k).push(r);
    }

    const grandZ = emptyTotals();
    const groups = [...byKvk.keys()].sort(sortStr).map((kvkName) => {
        const z = emptyTotals();
        const rowsOut = byKvk.get(kvkName).map((r, i) => {
            const d = displayRow(r);
            addTotals(z, d);
            addTotals(grandZ, d);
            return { sl: i + 1, ...d };
        });
        return { kvkName, rows: rowsOut, subtotal: totalsRow(z) };
    });

    return { groups, grandTotal: totalsRow(grandZ), isMultiKvk: groups.length > 1 };
}

function cells(r) {
    return `<td>${r.generalM}</td><td>${r.generalF}</td><td>${r.generalT}</td>
                <td>${r.obcM}</td><td>${r.obcF}</td><td>${r.obcT}</td>
                <td>${r.scM}</td><td>${r.scF}</td><td>${r.scT}</td>
                <td>${r.stM}</td><td>${r.stF}</td><td>${r.stT}</td>
                <td>${r.totalM}</td><td>${r.totalF}</td><td>${r.totalT}</td>`;
}

function renderCfldExtensionActivitySection(section, data, sectionId, isFirstSection) {
    const { groups, grandTotal, isMultiKvk } = buildCfldExtensionGroups(data);
    if (groups.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const esc = (v) => this._escapeHtml(v ?? '');

    const head = `
        <thead>
            <tr>
                <th rowspan="3">S.No.</th>
                <th rowspan="3">Extension Activities organized</th>
                <th rowspan="3">Season</th>
                <th rowspan="3">Date and place of activity</th>
                <th colspan="15">Number of farmers</th>
            </tr>
            <tr>
                <th colspan="3">General</th>
                <th colspan="3">OBC</th>
                <th colspan="3">SC</th>
                <th colspan="3">ST</th>
                <th colspan="3">Total</th>
            </tr>
            <tr>
                <th>M</th><th>F</th><th>T</th>
                <th>M</th><th>F</th><th>T</th>
                <th>M</th><th>F</th><th>T</th>
                <th>M</th><th>F</th><th>T</th>
                <th>M</th><th>F</th><th>T</th>
            </tr>
        </thead>`;

    const groupsHtml = groups.map((g) => {
        const body = g.rows.map((r) => `
            <tr>
                <td>${r.sl}</td>
                <td>${esc(r.activity)}</td>
                <td>${esc(r.season)}</td>
                <td>${esc(r.dateAndPlace)}</td>
                ${cells(r)}
            </tr>`).join('');

        const sub = `
            <tr class="cfld-ext-sub">
                <td colspan="4">Sub-total — ${esc(g.kvkName)}</td>
                ${cells(g.subtotal)}
            </tr>`;

        return `
    <div class="cfld-ext-group">
        <div class="cfld-ext-kvk-hd">${esc(g.kvkName)}</div>
        <table class="data-table cfld-ext-table">${head}
            <tbody>${body}${sub}</tbody>
        </table>
    </div>`;
    }).join('');

    const grandHtml = isMultiKvk ? `
    <div class="cfld-ext-group">
        <table class="data-table cfld-ext-table">${head}
            <tbody>
                <tr class="cfld-ext-grand">
                    <td colspan="4">Grand Total (all KVKs)</td>
                    ${cells(grandTotal)}
                </tr>
            </tbody>
        </table>
    </div>` : '';

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${section.id} ${esc(section.title)}</h1>
    <style>
        @page { size: A4 landscape; }
        .cfld-ext-group { page-break-inside: avoid; break-inside: avoid; margin-bottom: 8px; }
        .cfld-ext-kvk-hd { font-size: 8pt; font-weight: bold; background: #dce6f1; padding: 3px 5px; border: 0.2px solid #000; border-bottom: 0; page-break-after: avoid; break-after: avoid; }
        .cfld-ext-table { width: 100%; border-collapse: collapse; font-size: 6pt; table-layout: fixed; }
        .cfld-ext-table th, .cfld-ext-table td { border: 0.2px solid #000; padding: 2px 3px; vertical-align: middle; text-align: center; word-break: break-word; }
        .cfld-ext-table thead th { background: #e8e8e8; font-weight: bold; }
        .cfld-ext-table .cfld-ext-sub { font-weight: 700; background: #f1f5f9; }
        .cfld-ext-table .cfld-ext-grand { font-weight: 700; background: #f5f5f5; }
    </style>
    ${groupsHtml}
    ${grandHtml}
</div>`;
}

module.exports = {
    renderCfldExtensionActivitySection,
    buildCfldExtensionGroups,
};
