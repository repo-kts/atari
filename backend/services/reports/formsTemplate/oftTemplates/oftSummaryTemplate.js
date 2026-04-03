/**
 * OFT Summary Template (Section 2.1)
 *
 * Renders the "On Farm Testing Summary" table grouped by five sectors (A-E),
 * with thematic-area rows, sector sub-totals, and a grand total.
 *
 * Automatically detects single-KVK vs multi-state (superadmin) mode:
 *   - Single-state  -> 3 value columns (technologies, locations, trials)
 *   - Multi-state   -> per-state columns + total columns
 *
 * Bound to reportTemplateService (`this`), so helpers like
 * `this._escapeHtml()`, `this._generateEmptySection()`, and
 * `this._toDisplayValue()` are available.
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

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * Classify a subjectName into one of the five sectors.
 * Falls back to sector C (Enterprises) when nothing matches.
 */
function classifySector(subjectName) {
    const name = (subjectName || '').trim();
    for (const sector of SECTORS) {
        if (sector.match(name)) return sector.key;
    }
    return 'C';
}

/**
 * Build a lookup structure:
 *   sectorKey -> thematicAreaName -> stateKey -> { techs, locations, trials }
 *
 * `stateKey` is either a stateName or '__all__' for single-state mode.
 */
function buildAggregation(records, isMultiState) {
    // sectorKey -> Map<thematicAreaName, Map<stateKey, {techs, locations, trials}>>
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

/**
 * Collect sorted unique state names from the dataset.
 */
function getUniqueStates(records) {
    const set = new Set();
    for (const r of records) {
        const name = r.kvk?.state?.stateName;
        if (name) set.add(name);
    }
    return Array.from(set).sort();
}

/**
 * Sum a Map<stateKey, bucket> across all states for a given list of stateKeys.
 */
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

    // Detect multi-state mode
    const states = getUniqueStates(records);
    const isMultiState = states.length > 1;
    const stateKeys = isMultiState ? states : ['__all__'];

    const agg = buildAggregation(records, isMultiState);

    // ── Header row ──────────────────────────────────────────────
    const valueColCount = isMultiState ? states.length * 3 + 3 : 3;

    let html = `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    <table class="data-table">
        <thead>`;

    if (isMultiState) {
        // Two-row header: top row with state group spans, bottom row with metric labels
        html += `
            <tr>
                <th class="s-no" rowspan="2">S.No.</th>
                <th rowspan="2">Sector wise Thematic Area</th>`;
        for (const st of states) {
            html += `<th colspan="3" style="text-align:center;">${this._escapeHtml(st)}</th>`;
        }
        html += `<th colspan="3" style="text-align:center;">Total</th>`;
        html += `</tr>
            <tr>`;
        for (let i = 0; i <= states.length; i++) {
            html += `
                <th>No. of technologies assessed</th>
                <th>No. of Locations</th>
                <th>No. of Trial/Replications</th>`;
        }
        html += `</tr>`;
    } else {
        html += `
            <tr>
                <th class="s-no">S.No.</th>
                <th>Sector wise Thematic Area</th>
                <th>No. of technologies assessed</th>
                <th>No. of Locations</th>
                <th>No. of Trial/Replications</th>
            </tr>`;
    }

    html += `
        </thead>
        <tbody>`;

    // ── Body: iterate sectors ───────────────────────────────────
    let serialNo = 0;
    const grandTotal = { techs: 0, locations: 0, trials: 0 };
    const grandTotalByState = {};
    for (const st of stateKeys) {
        grandTotalByState[st] = { techs: 0, locations: 0, trials: 0 };
    }

    for (const sector of SECTORS) {
        const thematicMap = agg[sector.key]; // Map<thematicArea, Map<stateKey, bucket>>

        // Sector header row
        html += `
            <tr style="background:#f0f0f0; font-weight:bold;">
                <td colspan="${valueColCount + 2}" style="text-align:left; padding:6px 8px;">
                    ${this._escapeHtml(sector.label)}
                </td>
            </tr>`;

        // Sub-total accumulators for this sector
        const sectorTotal = { techs: 0, locations: 0, trials: 0 };
        const sectorTotalByState = {};
        for (const st of stateKeys) {
            sectorTotalByState[st] = { techs: 0, locations: 0, trials: 0 };
        }

        if (thematicMap.size === 0) {
            // No data for this sector
            html += `
            <tr>
                <td colspan="${valueColCount + 2}" style="text-align:center; color:#888;">No data available</td>
            </tr>`;
        }

        // Sort thematic areas alphabetically
        const sortedThematicAreas = Array.from(thematicMap.keys()).sort();

        for (const thematicArea of sortedThematicAreas) {
            serialNo += 1;
            const stateMap = thematicMap.get(thematicArea);
            const rowTotal = sumBuckets(stateMap, stateKeys);

            html += `
            <tr class="${serialNo % 2 === 0 ? 'even' : 'odd'}">
                <td class="s-no">${serialNo}.</td>
                <td>${this._escapeHtml(thematicArea)}</td>`;

            if (isMultiState) {
                for (const st of stateKeys) {
                    const b = stateMap.get(st) || { techs: 0, locations: 0, trials: 0 };
                    html += `
                <td style="text-align:center;">${b.techs}</td>
                <td style="text-align:center;">${b.locations}</td>
                <td style="text-align:center;">${b.trials}</td>`;
                    sectorTotalByState[st].techs += b.techs;
                    sectorTotalByState[st].locations += b.locations;
                    sectorTotalByState[st].trials += b.trials;
                }
                // Total column
                html += `
                <td style="text-align:center;">${rowTotal.techs}</td>
                <td style="text-align:center;">${rowTotal.locations}</td>
                <td style="text-align:center;">${rowTotal.trials}</td>`;
            } else {
                html += `
                <td style="text-align:center;">${rowTotal.techs}</td>
                <td style="text-align:center;">${rowTotal.locations}</td>
                <td style="text-align:center;">${rowTotal.trials}</td>`;
                const b = stateMap.get('__all__') || { techs: 0, locations: 0, trials: 0 };
                sectorTotalByState['__all__'].techs += b.techs;
                sectorTotalByState['__all__'].locations += b.locations;
                sectorTotalByState['__all__'].trials += b.trials;
            }

            sectorTotal.techs += rowTotal.techs;
            sectorTotal.locations += rowTotal.locations;
            sectorTotal.trials += rowTotal.trials;

            html += `</tr>`;
        }

        // Sub Total row
        html += `
            <tr style="font-weight:bold; background:#fafafa;">
                <td></td>
                <td style="text-align:right;">Sub Total</td>`;

        if (isMultiState) {
            for (const st of stateKeys) {
                html += `
                <td style="text-align:center;">${sectorTotalByState[st].techs}</td>
                <td style="text-align:center;">${sectorTotalByState[st].locations}</td>
                <td style="text-align:center;">${sectorTotalByState[st].trials}</td>`;
                grandTotalByState[st].techs += sectorTotalByState[st].techs;
                grandTotalByState[st].locations += sectorTotalByState[st].locations;
                grandTotalByState[st].trials += sectorTotalByState[st].trials;
            }
            html += `
                <td style="text-align:center;">${sectorTotal.techs}</td>
                <td style="text-align:center;">${sectorTotal.locations}</td>
                <td style="text-align:center;">${sectorTotal.trials}</td>`;
        } else {
            html += `
                <td style="text-align:center;">${sectorTotal.techs}</td>
                <td style="text-align:center;">${sectorTotal.locations}</td>
                <td style="text-align:center;">${sectorTotal.trials}</td>`;
            grandTotalByState['__all__'].techs += sectorTotalByState['__all__'].techs;
            grandTotalByState['__all__'].locations += sectorTotalByState['__all__'].locations;
            grandTotalByState['__all__'].trials += sectorTotalByState['__all__'].trials;
        }

        html += `</tr>`;

        grandTotal.techs += sectorTotal.techs;
        grandTotal.locations += sectorTotal.locations;
        grandTotal.trials += sectorTotal.trials;
    }

    // ── Grand Total row ─────────────────────────────────────────
    html += `
            <tr style="font-weight:bold; background:#e8e8e8; border-top:2px solid #333;">
                <td></td>
                <td style="text-align:right;">Grand Total</td>`;

    if (isMultiState) {
        for (const st of stateKeys) {
            html += `
                <td style="text-align:center;">${grandTotalByState[st].techs}</td>
                <td style="text-align:center;">${grandTotalByState[st].locations}</td>
                <td style="text-align:center;">${grandTotalByState[st].trials}</td>`;
        }
        html += `
                <td style="text-align:center;">${grandTotal.techs}</td>
                <td style="text-align:center;">${grandTotal.locations}</td>
                <td style="text-align:center;">${grandTotal.trials}</td>`;
    } else {
        html += `
                <td style="text-align:center;">${grandTotal.techs}</td>
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
