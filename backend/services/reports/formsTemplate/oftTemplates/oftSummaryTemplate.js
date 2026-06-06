/**
 * OFT Summary Template (Section 2.2)
 *
 * Renders two labeled sub-blocks from the same sector/thematic aggregation:
 *   A. OFT Summary          — sector/thematic rows, totals across all states.
 *   B. State Wise OFT Details — same rows, broken down per state (one column
 *                               group per state) + a Total group.
 *
 * Data shape accepted:
 *   - { records, subjects }                (single-KVK)
 *   - [ { records, subjects }, ... ]       (aggregated: one chunk per KVK)
 *   - [ ...oftRows ]                       (plain rows)
 *
 * Bound to reportTemplateService (`this`).
 */

// ── Sector label mapping by subject name keyword ────────────────────
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

/** Distinct state names across records ("Unknown" when a record has no state). */
function getUniqueStates(records) {
    const set = new Set();
    for (const r of records) set.add(r.kvk?.state?.stateName || 'Unknown');
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

/** Build: subjectId -> thematicAreaName -> stateKey -> {techs, locations, trials}. */
function buildAggregation(records) {
    const agg = new Map();
    for (const r of records) {
        const subjectId = r.oftSubjectId || 0;
        const thematicArea = r.oftThematicArea?.thematicAreaName || 'Other';
        const stateKey = r.kvk?.state?.stateName || 'Unknown';

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

/** Value cells for one thematic row. perState=false → single Total set. */
function renderValueCells(perState, states, stateMap) {
    let html = '';
    if (perState) {
        for (const st of states) {
            const b = getBucket(stateMap, st);
            html += `<td style="text-align:center;">${b.techs}</td><td style="text-align:center;">${b.locations}</td><td style="text-align:center;">${b.trials}</td>`;
        }
    }
    const total = sumBuckets(stateMap, states);
    html += `<td style="text-align:center;">${total.techs}</td><td style="text-align:center;">${total.locations}</td><td style="text-align:center;">${total.trials}</td>`;
    return html;
}

function addBucket(target, b) {
    target.techs += b.techs;
    target.locations += b.locations;
    target.trials += b.trials;
}

// ── Sector/thematic table (used for both A summary and B state-wise) ──
function renderSectorTable(ctx, { agg, sectorList, states, perState }) {
    const esc = (v) => ctx._escapeHtml(v);
    const valueGroups = perState ? states.length + 1 : 1; // per-state groups + Total, or just Total
    const colCount = 1 + valueGroups * 3;
    // The per-state table gets very wide (states x 3). Force it to the page
    // width (table-layout:fixed) and scale the font down as columns grow so the
    // right-most border always stays inside the page.
    const tableClass = perState ? 'data-table oft-statewise' : 'data-table';
    let tableStyle = '';
    if (perState) {
        const groups = states.length + 1; // per-state + Total
        const fs = groups <= 3 ? 7.5 : groups <= 5 ? 6 : groups <= 7 ? 5 : groups <= 9 ? 4.3 : 3.8;
        tableStyle = ` style="font-size:${fs}pt;"`;
    }

    let head = '';
    if (perState) {
        head += `<tr><th rowspan="2" style="vertical-align:bottom;">Sector wise Thematic Area</th>`;
        for (const st of states) head += `<th colspan="3" style="text-align:center;">${esc(st)}</th>`;
        head += `<th colspan="3" style="text-align:center;">Total</th></tr><tr>`;
        for (let i = 0; i <= states.length; i++) {
            head += `<th style="text-align:center;">No. of technologies assessed</th><th style="text-align:center;">No. of Locations</th><th style="text-align:center;">No. of trials</th>`;
        }
        head += `</tr>`;
    } else {
        head += `<tr><th>Sector wise Thematic Area</th><th style="text-align:center;">No. of technologies assessed</th><th style="text-align:center;">No. of Locations</th><th style="text-align:center;">No. of Trial/Replications</th></tr>`;
    }

    let body = '';
    // Grand totals (per state + overall)
    const grandByState = {};
    for (const st of states) grandByState[st] = { techs: 0, locations: 0, trials: 0 };
    const grandTotal = { techs: 0, locations: 0, trials: 0 };

    for (const sector of sectorList) {
        const thematicMap = agg.get(sector.subjectId) || new Map();

        body += `<tr style="background:#f0f0f0;"><td colspan="${colCount}" style="font-weight:bold;padding:6px 8px;">${esc(sector.label)}</td></tr>`;

        const sectorByState = {};
        for (const st of states) sectorByState[st] = { techs: 0, locations: 0, trials: 0 };
        const sectorTotal = { techs: 0, locations: 0, trials: 0 };

        const renderRow = (areaName, stateMap) => {
            body += `<tr><td>${esc(areaName)}</td>${renderValueCells(perState, states, stateMap)}</tr>`;
            for (const st of states) addBucket(sectorByState[st], getBucket(stateMap, st));
            addBucket(sectorTotal, sumBuckets(stateMap, states));
        };

        const renderedAreas = new Set();
        for (const areaName of sector.thematicAreas) {
            renderedAreas.add(areaName);
            renderRow(areaName, thematicMap.get(areaName) || new Map());
        }
        // Extra thematic areas present in data but not in the master list.
        for (const [areaName, stateMap] of thematicMap) {
            if (!renderedAreas.has(areaName)) renderRow(areaName, stateMap);
        }

        // Sub Total
        const subLabel = perState ? `Sub Total (${sector.key})` : 'Sub Total';
        body += `<tr style="font-weight:bold;"><td>${subLabel}</td>`;
        if (perState) {
            for (const st of states) {
                body += `<td style="text-align:center;">${sectorByState[st].techs}</td><td style="text-align:center;">${sectorByState[st].locations}</td><td style="text-align:center;">${sectorByState[st].trials}</td>`;
                addBucket(grandByState[st], sectorByState[st]);
            }
        }
        body += `<td style="text-align:center;">${sectorTotal.techs}</td><td style="text-align:center;">${sectorTotal.locations}</td><td style="text-align:center;">${sectorTotal.trials}</td></tr>`;
        addBucket(grandTotal, sectorTotal);
    }

    // Grand Total
    body += `<tr style="font-weight:bold;"><td>Grand Total</td>`;
    if (perState) {
        for (const st of states) {
            body += `<td style="text-align:center;">${grandByState[st].techs}</td><td style="text-align:center;">${grandByState[st].locations}</td><td style="text-align:center;">${grandByState[st].trials}</td>`;
        }
    }
    body += `<td style="text-align:center;">${grandTotal.techs}</td><td style="text-align:center;">${grandTotal.locations}</td><td style="text-align:center;">${grandTotal.trials}</td></tr>`;

    return `<table class="${tableClass}"${tableStyle}><thead>${head}</thead><tbody>${body}</tbody></table>`;
}

// ── Main render function ────────────────────────────────────────────
function renderOftSummarySection(section, data, sectionId, isFirstSection) {
    // Accept single, aggregated-chunks, or plain-rows shapes.
    let records = [];
    let subjects = [];
    if (Array.isArray(data)) {
        if (data.some(d => d && (d.records || d.subjects))) {
            for (const chunk of data) {
                if (Array.isArray(chunk?.records)) records.push(...chunk.records);
                if (subjects.length === 0 && Array.isArray(chunk?.subjects)) subjects = chunk.subjects;
            }
        } else {
            records = data;
        }
    } else if (data && Array.isArray(data.records)) {
        records = data.records;
        subjects = data.subjects || [];
    } else if (data) {
        records = [data];
    }

    if (records.length === 0 && subjects.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection
        ? 'section-page section-page-first'
        : 'section-page section-page-continued';

    const states = getUniqueStates(records);
    const agg = buildAggregation(records);

    // ── Build ordered sector list from DB subjects ──────────────
    const sectorList = [];
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
    }
    // Fallback: derive sectors from the records when no DB subjects supplied.
    if (sectorList.length === 0) {
        const seen = new Map();
        for (const r of records) {
            const sid = r.oftSubjectId || 0;
            if (!seen.has(sid)) {
                const name = r.oftSubject?.subjectName || 'Unknown';
                const mapped = classifySubject(name);
                seen.set(sid, {
                    key: mapped ? mapped.key : '?',
                    label: mapped ? mapped.prefix : name,
                    subjectId: sid,
                    thematicAreas: [],
                });
            }
        }
        sectorList.push(...seen.values());
    }
    // Order sectors by key (A, B, C, D, E …); DB subjects sort by name otherwise.
    sectorList.sort((a, b) => String(a.key).localeCompare(String(b.key)));

    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title" style="margin-bottom:8px;">${section.id} ${this._escapeHtml(section.title)}</h1>
    <h2 class="section-subtitle">${section.id}.A OFT Summary</h2>
    ${renderSectorTable(this, { agg, sectorList, states, perState: false })}
    <h2 class="section-subtitle" style="margin-top:14px;">${section.id}.B State Wise OFT Details</h2>
    ${renderSectorTable(this, { agg, sectorList, states, perState: true })}
</div>`;
}

module.exports = { renderOftSummarySection };
