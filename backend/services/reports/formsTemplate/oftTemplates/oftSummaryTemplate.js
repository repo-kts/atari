/**
 * OFT Summary Template (Section 2.1)
 *
 * Renders the OFT Summary table grouped by five sectors (A-E),
 * matching the original ATARI website layout exactly.
 *
 * Single-KVK:  3 value columns (technologies, locations, trials)
 * Multi-state:  per-state columns + total columns
 *
 * Bound to reportTemplateService (`this`).
 */

// ── Sector definitions (order matters) ──────────────────────────────
const SECTORS = [
    {
        key: 'A',
        label: 'A) Technologies Assessed under Various Crops by KVKs (Crop Production)',
        match: (name) => /crop\s*production/i.test(name),
    },
    {
        key: 'B',
        label: 'B) Technologies Assessed under Livestock and Fisheries by KVKs',
        match: (name) =>
            /livestock|animal\s*husbandry|fisheries|poultry|veterinary/i.test(name),
    },
    {
        key: 'C',
        label: 'C) Technologies Assessed under various Enterprises by KVKs',
        match: (name) => /enterprise/i.test(name) && !/women/i.test(name),
    },
    {
        key: 'D',
        label: 'D) Technologies Assessed under various Enterprises for Women Empowerment',
        match: (name) => /women/i.test(name),
    },
    {
        key: 'E',
        label: 'E) Technologies Assessed under various Crops (Horticulture crops.)',
        match: (name) => /horticulture/i.test(name),
    },
];

function classifySector(subjectName) {
    const name = (subjectName || '').trim();
    for (const sector of SECTORS) {
        if (sector.match(name)) return sector.key;
    }
    return 'C';
}

function buildAggregation(records, isMultiState) {
    const agg = {};
    for (const sector of SECTORS) {
        agg[sector.key] = new Map();
    }

    for (const r of records) {
        const subjectName = r.oftSubject?.subjectName || '';
        const thematicArea = r.oftThematicArea?.thematicAreaName || 'Other';
        const sectorKey = classifySector(subjectName);
        const stateKey = isMultiState ? (r.kvk?.state?.stateName || 'Unknown') : '__all__';

        if (!agg[sectorKey].has(thematicArea)) {
            agg[sectorKey].set(thematicArea, new Map());
        }

        const stateMap = agg[sectorKey].get(thematicArea);
        if (!stateMap.has(stateKey)) {
            stateMap.set(stateKey, { techs: 0, locations: 0, trials: 0 });
        }

        const bucket = stateMap.get(stateKey);
        bucket.techs += 1;
        bucket.locations += Number(r.numberOfLocation) || 0;
        bucket.trials += Number(r.numberOfTrialReplication) || 0;
    }

    return agg;
}

function getUniqueStates(records) {
    const set = new Set();
    for (const r of records) {
        const name = r.kvk?.state?.stateName;
        if (name) set.add(name);
    }
    return Array.from(set).sort();
}

function sumBuckets(stateMap, stateKeys) {
    const total = { techs: 0, locations: 0, trials: 0 };
    for (const key of stateKeys) {
        const b = stateMap.get(key);
        if (b) {
            total.techs += b.techs;
            total.locations += b.locations;
            total.trials += b.trials;
        }
    }
    return total;
}

// ── Main render function ────────────────────────────────────────────

function renderOftSummarySection(section, data, sectionId, isFirstSection) {
    if (!data || (Array.isArray(data) && data.length === 0)) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const records = Array.isArray(data) ? data : [data];
    const pageClass = isFirstSection
        ? 'section-page section-page-first'
        : 'section-page section-page-continued';

    const states = getUniqueStates(records);
    const isMultiState = states.length > 1;
    const stateKeys = isMultiState ? states : ['__all__'];

    const agg = buildAggregation(records, isMultiState);

    // Total column count for colspan on sector header rows
    const colCount = isMultiState ? 1 + (states.length * 3) + 3 : 4;

    let html = `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title" style="border-bottom:none;margin-bottom:4px;">2. ACHIEVEMENTS ON TECHNOLOGIES ASSESSED AND REFINED (OFT)</h1>
    <p style="font-size:10px;font-weight:bold;margin-bottom:10px;">2.1. Technology Assessed by KVK (Discipline wise)</p>`;

    if (isMultiState) {
        html += `
    <p style="font-size:9px;font-weight:bold;margin-bottom:8px;">2.1. State wise details of On Farm Trials (OFTs) conducted by KVKs</p>`;
    }

    html += `
    <table class="data-table">
        <thead>`;

    if (isMultiState) {
        // Row 1: state name spans + Total span
        html += `
            <tr>
                <th rowspan="2" style="vertical-align:bottom;">Sector wise Thematic Area</th>`;
        for (const st of states) {
            html += `<th colspan="3" style="text-align:center;">${this._escapeHtml(st)}</th>`;
        }
        html += `<th colspan="3" style="text-align:center;">Total</th>`;
        html += `</tr>`;
        // Row 2: metric labels repeated
        html += `
            <tr>`;
        for (let i = 0; i <= states.length; i++) {
            html += `
                <th style="text-align:center;">No. of technologies assessed</th>
                <th style="text-align:center;">No. of Locations</th>
                <th style="text-align:center;">No. of Trial/Replications</th>`;
        }
        html += `</tr>`;
    } else {
        html += `
            <tr>
                <th>Sector wise Thematic Area</th>
                <th style="text-align:center;">No. of technologies assessed</th>
                <th style="text-align:center;">No. of Locations</th>
                <th style="text-align:center;">No. of Trial/Replications</th>
            </tr>`;
    }

    html += `
        </thead>
        <tbody>`;

    // ── Body: iterate sectors ───────────────────────────────────
    const grandTotal = { techs: 0, locations: 0, trials: 0 };
    const grandTotalByState = {};
    for (const st of stateKeys) {
        grandTotalByState[st] = { techs: 0, locations: 0, trials: 0 };
    }

    for (const sector of SECTORS) {
        const thematicMap = agg[sector.key];

        // Sector header row — spans full width, bold, light background
        html += `
            <tr style="background:#f0f0f0;">
                <td colspan="${colCount}" style="font-weight:bold;padding:6px 8px;">
                    ${this._escapeHtml(sector.label)}
                </td>
            </tr>`;

        const sectorTotal = { techs: 0, locations: 0, trials: 0 };
        const sectorTotalByState = {};
        for (const st of stateKeys) {
            sectorTotalByState[st] = { techs: 0, locations: 0, trials: 0 };
        }

        const sortedThematicAreas = Array.from(thematicMap.keys()).sort();

        for (const thematicArea of sortedThematicAreas) {
            const stateMap = thematicMap.get(thematicArea);
            const rowTotal = sumBuckets(stateMap, stateKeys);

            html += `
            <tr>
                <td>${this._escapeHtml(thematicArea)}</td>`;

            if (isMultiState) {
                for (const st of stateKeys) {
                    const b = stateMap.get(st) || { techs: 0, locations: 0, trials: 0 };
                    html += `<td style="text-align:center;">${b.techs}</td>
                <td style="text-align:center;">${b.locations}</td>
                <td style="text-align:center;">${b.trials}</td>`;
                    sectorTotalByState[st].techs += b.techs;
                    sectorTotalByState[st].locations += b.locations;
                    sectorTotalByState[st].trials += b.trials;
                }
                html += `<td style="text-align:center;">${rowTotal.techs}</td>
                <td style="text-align:center;">${rowTotal.locations}</td>
                <td style="text-align:center;">${rowTotal.trials}</td>`;
            } else {
                html += `<td style="text-align:center;">${rowTotal.techs}</td>
                <td style="text-align:center;">${rowTotal.locations}</td>
                <td style="text-align:center;">${rowTotal.trials}</td>`;
            }

            sectorTotal.techs += rowTotal.techs;
            sectorTotal.locations += rowTotal.locations;
            sectorTotal.trials += rowTotal.trials;

            html += `</tr>`;
        }

        // Sub Total row
        html += `
            <tr style="font-weight:bold;">
                <td>Sub Total</td>`;

        if (isMultiState) {
            for (const st of stateKeys) {
                html += `<td style="text-align:center;">${sectorTotalByState[st].techs}</td>
                <td style="text-align:center;">${sectorTotalByState[st].locations}</td>
                <td style="text-align:center;">${sectorTotalByState[st].trials}</td>`;
                grandTotalByState[st].techs += sectorTotalByState[st].techs;
                grandTotalByState[st].locations += sectorTotalByState[st].locations;
                grandTotalByState[st].trials += sectorTotalByState[st].trials;
            }
            html += `<td style="text-align:center;">${sectorTotal.techs}</td>
                <td style="text-align:center;">${sectorTotal.locations}</td>
                <td style="text-align:center;">${sectorTotal.trials}</td>`;
        } else {
            html += `<td style="text-align:center;">${sectorTotal.techs}</td>
                <td style="text-align:center;">${sectorTotal.locations}</td>
                <td style="text-align:center;">${sectorTotal.trials}</td>`;
        }

        html += `</tr>`;

        grandTotal.techs += sectorTotal.techs;
        grandTotal.locations += sectorTotal.locations;
        grandTotal.trials += sectorTotal.trials;
    }

    // Grand Total row
    html += `
            <tr style="font-weight:bold;">
                <td>Grand Total</td>`;

    if (isMultiState) {
        for (const st of stateKeys) {
            html += `<td style="text-align:center;">${grandTotalByState[st].techs}</td>
                <td style="text-align:center;">${grandTotalByState[st].locations}</td>
                <td style="text-align:center;">${grandTotalByState[st].trials}</td>`;
        }
        html += `<td style="text-align:center;">${grandTotal.techs}</td>
                <td style="text-align:center;">${grandTotal.locations}</td>
                <td style="text-align:center;">${grandTotal.trials}</td>`;
    } else {
        html += `<td style="text-align:center;">${grandTotal.techs}</td>
                <td style="text-align:center;">${grandTotal.locations}</td>
                <td style="text-align:center;">${grandTotal.trials}</td>`;
    }

    html += `</tr>`;

    html += `
        </tbody>
    </table>
</div>`;

    return html;
}

module.exports = { renderOftSummarySection };
