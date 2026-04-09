/**
 * Farmer awards — same summary table everywhere (Data Management export + modular all-report):
 * Sl. No., Name of the KVK, Name of the Farmer, Total Award (counts per kvk + farmer).
 */

function kvkLabel(r) {
    if (r.kvkName != null && String(r.kvkName).trim() !== '') return String(r.kvkName).trim();
    if (r.kvkId != null) return `KVK ${r.kvkId}`;
    return 'Unknown KVK';
}

function farmerLabel(r) {
    const s = r.farmerName;
    if (s != null && String(s).trim() !== '') return String(s).trim();
    return '—';
}

function resolveFarmerAwardSummaryPayload(rawData) {
    const arr = Array.isArray(rawData) ? rawData : [];
    const counts = new Map();
    const labels = new Map();

    for (const r of arr) {
        const kvk = kvkLabel(r);
        const farmer = farmerLabel(r);
        const key = r.kvkId != null ? `id:${r.kvkId}|${farmer}` : `name:${kvk}|${farmer}`;
        if (!labels.has(key)) {
            labels.set(key, { kvkName: kvk, farmerName: farmer });
        }
        counts.set(key, (counts.get(key) || 0) + 1);
    }

    const rows = [...counts.entries()]
        .map(([key, totalAward]) => {
            const L = labels.get(key) || { kvkName: 'Unknown KVK', farmerName: '—' };
            return { kvkName: L.kvkName, farmerName: L.farmerName, totalAward };
        })
        .sort((a, b) => {
            const c = a.kvkName.localeCompare(b.kvkName);
            if (c !== 0) return c;
            return a.farmerName.localeCompare(b.farmerName);
        });

    return { rows };
}

/**
 * @param {unknown} rawData
 * @returns {{ headers: string[], rows: (string|number)[][] }}
 */
function buildFarmerAwardSummaryTabularData(rawData) {
    const { rows } = resolveFarmerAwardSummaryPayload(rawData);
    return {
        headers: ['Sl. No.', 'Name of the KVK', 'Name of the Farmer', 'Total Award'],
        rows: rows.map((x, idx) => [idx + 1, x.kvkName, x.farmerName, x.totalAward]),
    };
}

function renderFarmerAwardSummarySection(section, data, sectionId, isFirstSection) {
    const { rows } = resolveFarmerAwardSummaryPayload(data);
    const esc = (v) => this._escapeHtml(v ?? '');

    if (rows.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const body = rows
        .map(
            (r, idx) => `<tr>
                <td style="text-align:center;">${idx + 1}</td>
                <td>${esc(r.kvkName)}</td>
                <td>${esc(r.farmerName)}</td>
                <td style="text-align:center;">${esc(String(r.totalAward))}</td>
            </tr>`,
        )
        .join('');

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${esc(section.id)} ${esc(section.title)}</h1>
    <style>
        .farmer-award-sum-table { width: 100%; border-collapse: collapse; font-size: 8pt; }
        .farmer-award-sum-table th, .farmer-award-sum-table td { border: 0.2px solid #000; padding: 4px 6px; vertical-align: middle; }
        .farmer-award-sum-table thead th { background: #e8e8e8; font-weight: bold; text-align: center; }
        .farmer-award-sum-table tbody td:nth-child(2), .farmer-award-sum-table tbody td:nth-child(3) { text-align: left; }
    </style>
    <table class="data-table farmer-award-sum-table">
        <thead>
            <tr>
                <th style="width:8%;">Sl. No.</th>
                <th style="width:28%;">Name of the KVK</th>
                <th style="width:40%;">Name of the Farmer</th>
                <th style="width:14%;">Total Award</th>
            </tr>
        </thead>
        <tbody>${body}</tbody>
    </table>
</div>`;
}

module.exports = {
    renderFarmerAwardSummarySection,
    resolveFarmerAwardSummaryPayload,
    buildFarmerAwardSummaryTabularData,
};
