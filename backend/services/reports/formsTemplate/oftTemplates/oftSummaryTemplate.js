/**
 * OFT Summary Template (Section 2.1)
 *
 * Renders the OFT Summary table grouped by sectors (OftSubject) and
 * their thematic areas (OftThematicArea), ALL from the database.
 * Shows every thematic area even when it has 0 data.
 *
 * Data shape expected:
 *   { records: [...OFT rows], subjects: [...OftSubject with thematicAreas] }
 *
 * Single-KVK:  3 value columns, heading "2.1. OFT Summary"
 * Multi-state:  per-state columns + total, full heading hierarchy
 *
 * Bound to reportTemplateService (`this`).
 */

// ── Sector label mapping by subject name keyword ────────────────────
// Maps OftSubject names to sector labels + keys used in the original report.
// If a subject doesn't match any keyword, it gets its own section.

const SECTOR_MAP = [
    { key: 'A', keyword: /crop\s*production/i, prefix: 'A) Technologies Assessed under Various Crops by KVKs (Crop Production)' },
    { key: 'B', keyword: /livestock|animal|fisheries|poultry|veterinary/i, prefix: 'B) Technologies Assessed under Livestock and Fisheries by KVKs' },
    { key: 'C', keyword: /enterprise/i, extraReject: /women/i, prefix: 'C) Technologies Assessed under various Enterprises by KVKs' },
    { key: 'D', keyword: /women/i, prefix: 'D) Technologies Assessed under various Enterprises for Women Empowerment' },
    { key: 'E', keyword: /horticulture/i, prefix: 'E) Technologies Assessed under various Crops (Horticulture crops.)' },
];

function classifySubject(subjectName) {
    const name = (subjectName || '').trim();
    for (const s of SECTOR_MAP) {
        if (s.extraReject && s.extraReject.test(name)) continue;
        if (s.keyword.test(name)) return s;
    }
    return null;
}

// ── Helpers ─────────────────────────────────────────────────────────

function getUniqueStates(records) {
    const set = new Set();
    for (const r of records) {
        const name = r.kvk?.state?.stateName;
        if (name) set.add(name);
    }
    return Array.from(set).sort();
}

function getBucket(stateMap, stateKey) {
    return stateMap?.get(stateKey) || { techs: 0, locations: 0, trials: 0 };
}

function sumBuckets(stateMap, stateKeys) {
    const total = { techs: 0, locations: 0, trials: 0 };
    for (const key of stateKeys) {
        const b = getBucket(stateMap, key);
        total.techs += b.techs;
        total.locations += b.locations;
        total.trials += b.trials;
    }
    return total;
}

/**
 * Build: subjectId -> thematicAreaName -> stateKey -> {techs, locations, trials}
 */
function buildAggregation(records, isMultiState) {
    const agg = new Map(); // subjectId -> Map<thematicAreaName, Map<stateKey, bucket>>

    for (const r of records) {
        const subjectId = r.oftSubjectId || 0;
        const thematicArea = r.oftThematicArea?.thematicAreaName || 'Other';
        const stateKey = isMultiState ? (r.kvk?.state?.stateName || 'Unknown') : '__all__';

        if (!agg.has(subjectId)) agg.set(subjectId, new Map());
        const thematicMap = agg.get(subjectId);

        if (!thematicMap.has(thematicArea)) thematicMap.set(thematicArea, new Map());
        const stateMap = thematicMap.get(thematicArea);

        if (!stateMap.has(stateKey)) stateMap.set(stateKey, { techs: 0, locations: 0, trials: 0 });
        const bucket = stateMap.get(stateKey);
        bucket.techs += 1;
        bucket.locations += Number(r.numberOfLocation) || 0;
        bucket.trials += Number(r.numberOfTrialReplication) || 0;
    }

    return agg;
}

function renderValueCells(isMultiState, stateKeys, stateMap) {
    let html = '';
    if (isMultiState) {
        for (const st of stateKeys) {
            const b = getBucket(stateMap, st);
            html += `<td style="text-align:center;">${b.techs}</td>
                <td style="text-align:center;">${b.locations}</td>
                <td style="text-align:center;">${b.trials}</td>`;
        }
        const total = sumBuckets(stateMap, stateKeys);
        html += `<td style="text-align:center;">${total.techs}</td>
                <td style="text-align:center;">${total.locations}</td>
                <td style="text-align:center;">${total.trials}</td>`;
    } else {
        const total = sumBuckets(stateMap, stateKeys);
        html += `<td style="text-align:center;">${total.techs}</td>
                <td style="text-align:center;">${total.locations}</td>
                <td style="text-align:center;">${total.trials}</td>`;
    }
    return html;
}

// ── Main render function ────────────────────────────────────────────

function renderOftSummarySection(section, data, sectionId, isFirstSection) {
    // data can be { records, subjects } from data service, or plain array from combined template
    let records, subjects;
    if (data && !Array.isArray(data) && data.records) {
        records = data.records;
        subjects = data.subjects || [];
    } else {
        records = Array.isArray(data) ? data : (data ? [data] : []);
        subjects = [];
    }

    if (records.length === 0 && subjects.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection
        ? 'section-page section-page-first'
        : 'section-page section-page-continued';

    const states = getUniqueStates(records);
    const isMultiState = states.length > 1;
    const stateKeys = isMultiState ? states : ['__all__'];

    const agg = buildAggregation(records, isMultiState);
    const colCount = isMultiState ? 1 + (states.length * 3) + 3 : 4;

    // ── Build ordered sector list from DB subjects ──────────────
    const sectorList = [];
    const usedSubjectIds = new Set();

    // First pass: map DB subjects to known sectors
    for (const subject of subjects) {
        const mapped = classifySubject(subject.subjectName);
        const sectorKey = mapped ? mapped.key : subject.subjectName.charAt(0).toUpperCase();
        const sectorLabel = mapped ? mapped.prefix : `${sectorKey}) ${subject.subjectName}`;

        sectorList.push({
            key: sectorKey,
            label: sectorLabel,
            subjectId: subject.oftSubjectId,
            thematicAreas: (subject.thematicAreas || []).map(ta => ta.thematicAreaName),
        });
        usedSubjectIds.add(subject.oftSubjectId);
    }

    // If no subjects from DB, fall back to data-driven sectors
    if (sectorList.length === 0) {
        // Group by subject from the records themselves
        const seenSubjects = new Map();
        for (const r of records) {
            const sid = r.oftSubjectId || 0;
            if (!seenSubjects.has(sid)) {
                const name = r.oftSubject?.subjectName || 'Unknown';
                const mapped = classifySubject(name);
                seenSubjects.set(sid, {
                    key: mapped ? mapped.key : '?',
                    label: mapped ? mapped.prefix : name,
                    subjectId: sid,
                    thematicAreas: [],
                });
            }
        }
        sectorList.push(...seenSubjects.values());
    }

    // ── Headings ────────────────────────────────────────────────
    let html = `
<div id="${sectionId}" class="${pageClass}">`;

    if (isMultiState) {
        html += `
    <h1 class="section-title" style="border-bottom:none;margin-bottom:6px;font-size:12px;">2. ACHIEVEMENTS ON TECHNOLOGIES ASSESSED AND REFINED (OFT)</h1>
    <p style="font-size:11px;font-weight:bold;margin-bottom:12px;">2.1. Technology Assessed by KVK (Discipline wise)</p>`;
    } else {
        html += `
    <h1 class="section-title" style="margin-bottom:10px;">2.1. OFT Summary</h1>`;
    }

    // ── Table header ────────────────────────────────────────────
    html += `
    <table class="data-table">
        <thead>`;

    if (isMultiState) {
        html += `
            <tr>
                <th colspan="${colCount}" style="text-align:left;font-weight:bold;font-size:9pt;padding:8px;">
                    2.1. State wise details of On Farm Trials (OFTs) conducted by KVKs
                </th>
            </tr>
            <tr>
                <th rowspan="2" style="vertical-align:bottom;">Sector wise Thematic Area</th>`;
        for (const st of states) {
            html += `<th colspan="3" style="text-align:center;">${this._escapeHtml(st)}</th>`;
        }
        html += `<th colspan="3" style="text-align:center;">Total</th></tr>
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

    // ── Body ────────────────────────────────────────────────────
    const grandTotal = { techs: 0, locations: 0, trials: 0 };
    const grandTotalByState = {};
    for (const st of stateKeys) grandTotalByState[st] = { techs: 0, locations: 0, trials: 0 };

    for (const sector of sectorList) {
        const thematicMap = agg.get(sector.subjectId) || new Map();

        // Sector header row
        html += `
            <tr style="background:#f0f0f0;">
                <td colspan="${colCount}" style="font-weight:bold;padding:6px 8px;">
                    ${this._escapeHtml(sector.label)}
                </td>
            </tr>`;

        const sectorTotal = { techs: 0, locations: 0, trials: 0 };
        const sectorTotalByState = {};
        for (const st of stateKeys) sectorTotalByState[st] = { techs: 0, locations: 0, trials: 0 };

        // Render ALL thematic areas from DB (with 0 defaults)
        const renderedAreas = new Set();

        for (const areaName of sector.thematicAreas) {
            renderedAreas.add(areaName);
            const stateMap = thematicMap.get(areaName) || new Map();
            const rowTotal = sumBuckets(stateMap, stateKeys);

            html += `
            <tr>
                <td>${this._escapeHtml(areaName)}</td>`;
            html += renderValueCells(isMultiState, stateKeys, stateMap);
            html += `</tr>`;

            if (isMultiState) {
                for (const st of stateKeys) {
                    const b = getBucket(stateMap, st);
                    sectorTotalByState[st].techs += b.techs;
                    sectorTotalByState[st].locations += b.locations;
                    sectorTotalByState[st].trials += b.trials;
                }
            }
            sectorTotal.techs += rowTotal.techs;
            sectorTotal.locations += rowTotal.locations;
            sectorTotal.trials += rowTotal.trials;
        }

        // Any extra areas from data not in the DB master list
        for (const [areaName, stateMap] of thematicMap) {
            if (renderedAreas.has(areaName)) continue;
            const rowTotal = sumBuckets(stateMap, stateKeys);

            html += `
            <tr>
                <td>${this._escapeHtml(areaName)}</td>`;
            html += renderValueCells(isMultiState, stateKeys, stateMap);
            html += `</tr>`;

            if (isMultiState) {
                for (const st of stateKeys) {
                    const b = getBucket(stateMap, st);
                    sectorTotalByState[st].techs += b.techs;
                    sectorTotalByState[st].locations += b.locations;
                    sectorTotalByState[st].trials += b.trials;
                }
            }
            sectorTotal.techs += rowTotal.techs;
            sectorTotal.locations += rowTotal.locations;
            sectorTotal.trials += rowTotal.trials;
        }

        // Sub Total
        const subLabel = isMultiState ? `Sub Total (${sector.key})` : 'Sub Total';
        html += `
            <tr style="font-weight:bold;">
                <td>${subLabel}</td>`;
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

    // Grand Total
    const grandLabel = isMultiState ? 'Grand Total (F)' : 'Grand Total';
    html += `
            <tr style="font-weight:bold;">
                <td>${grandLabel}</td>`;
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
    html += `</tr>
        </tbody>
    </table>
</div>`;

    return html;
}

module.exports = { renderOftSummarySection };
