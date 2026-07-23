'use strict';

/**
 * Combined TSP + SCSP PDF template  (Section 2.23 / module export key: 'tsp-scsp')
 *
 * Renders two sub-sections:
 *   • "Details of Tribal Sub Plan (TSP)"      — sections a, b, c, d
 *   • "Details of Scheduled Caste Sub Plan (SCSP)" — section a only
 *
 * Data modes:
 *   1. All-report: data = { type: 'combined', tsp: {activities,fundsReceived,outcomes,locationDetails,...},
 *                            scsp: {activities,...} }
 *   2. Module export: data = array of raw TspScsp form records (flat, both types mixed)
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

const STYLES = `
<style>
    .tsp-scsp-wrap { font-family: Arial, sans-serif; font-size: 9px; }
    .tsp-scsp-wrap h3 {
        font-size: 11px; font-weight: bold; margin: 14px 0 6px 0;
        border-top: 1.5px solid #444; padding-top: 6px;
    }
    .tsp-scsp-wrap h3:first-child { border-top: none; margin-top: 0; }
    .tsp-scsp-wrap .sub-h { font-size: 9.5px; font-weight: bold; margin: 10px 0 4px 0; }
    .tsp-scsp-wrap .single-val { font-size: 9.5px; margin: 4px 0 10px 0; }
    .tsp-scsp-wrap .no-data { color: #888; font-style: italic; font-size: 9px; padding: 3px 0; }
    .tsp-scsp-tbl {
        width: 100%; border-collapse: collapse; table-layout: fixed;
        font-size: 8.5px; margin-bottom: 10px;
    }
    .tsp-scsp-tbl th, .tsp-scsp-tbl td {
        border: 1px solid #333; padding: 3px 5px;
        text-align: center; vertical-align: middle; word-break: break-word;
    }
    .tsp-scsp-tbl th { background: #e8e8e8; font-weight: bold; }
    .tsp-scsp-tbl td.L { text-align: left; }
    .tsp-scsp-tbl tr.alt td { background: #f7f7f7; }
</style>`;

/* ── section (a): physical output table ───────────────────────────────────── */

function renderActivities(activities, planLabel) {
    if (!activities || activities.length === 0) {
        return `<p class="no-data">No physical output data available for ${planLabel}.</p>`;
    }
    const rows = activities.map((act, i) => `
        <tr>
            <td rowspan="2">${i + 1}</td>
            <td rowspan="2" class="L">${esc(act.activityName || `Activity ${i + 1}`)}</td>
            <td>Nos.</td>
            <td>No. of Beneficiaries</td>
        </tr>
        <tr class="alt">
            <td>${esc(act.noOfTrainings ?? '-')}</td>
            <td>${esc(act.noOfBeneficiaries ?? '-')}</td>
        </tr>`).join('');

    return `
        <table class="tsp-scsp-tbl">
            <colgroup>
                <col style="width:6%"><col style="width:42%">
                <col style="width:26%"><col style="width:26%">
            </colgroup>
            <thead>
                <tr>
                    <th>Sl. No</th><th>Activities</th>
                    <th colspan="2">Physical Achievement</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>`;
}

/* ── section (c): physical outcome table ──────────────────────────────────── */

function renderOutcomes(outcomes, year) {
    if (!outcomes) {
        return `<p class="no-data">No physical outcome data available.</p>`;
    }
    const list = [
        { desc: 'Change in family income',                                          unit: outcomes.familyIncome?.unit || '%',               val: outcomes.familyIncome?.achievement },
        { desc: 'Change in family consumption level',                               unit: outcomes.consumptionLevel?.unit || '%',            val: outcomes.consumptionLevel?.achievement },
        { desc: 'Change in availability of agricultural implements/ tools etc.',    unit: outcomes.implementsAvailability?.unit || '%',      val: outcomes.implementsAvailability?.achievement },
    ];
    const rows = list.map((o, i) => `
        <tr>
            <td>${i + 1}.</td>
            <td class="L">${esc(o.desc)}</td>
            <td>${esc(o.unit)}</td>
            <td>${o.val != null ? esc(o.val) : '-'}</td>
        </tr>`).join('');

    return `
        <table class="tsp-scsp-tbl">
            <colgroup>
                <col style="width:6%"><col style="width:58%">
                <col style="width:18%"><col style="width:18%">
            </colgroup>
            <thead>
                <tr>
                    <th>Sl. No.</th><th>Description</th>
                    <th>Unit</th><th>Achievements</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>`;
}

/* ── section (d): location & beneficiary table ────────────────────────────── */

function renderLocation(locationDetails) {
    if (!locationDetails || locationDetails.length === 0) {
        return `<p class="no-data">No location/beneficiary data available.</p>`;
    }
    const rows = locationDetails.map(loc => `
        <tr>
            <td class="L">${esc(loc.districtName || '-')}</td>
            <td class="L">${esc(loc.subDistrict || '-')}</td>
            <td>${esc(loc.villagesCount ?? '-')}</td>
            <td class="L">${esc(loc.villageNames || '-')}</td>
            <td>${esc(loc.stMale ?? '-')}</td>
            <td>${esc(loc.stFemale ?? '-')}</td>
            <td>${esc(loc.stTotal ?? '-')}</td>
        </tr>`).join('');

    return `
        <table class="tsp-scsp-tbl">
            <colgroup>
                <col style="width:12%"><col style="width:14%"><col style="width:8%">
                <col style="width:36%"><col style="width:10%"><col style="width:10%"><col style="width:10%">
            </colgroup>
            <thead>
                <tr>
                    <th rowspan="2">District</th>
                    <th rowspan="2">Subdistrict</th>
                    <th rowspan="2">No. of Villages Covered</th>
                    <th rowspan="2">Name of Village(s) Covered</th>
                    <th colspan="3">ST Population Benefitted (No.)</th>
                </tr>
                <tr><th>M</th><th>F</th><th>T</th></tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>`;
}

/* ── build structured data from flat form-records (module export mode) ────── */

function buildStructuredFromRecords(records, type) {
    const filtered = records.filter(r => (r.type || '').toUpperCase() === type);
    if (!filtered.length) return null;

    const isTsp = type === 'TSP';
    const first = filtered[0];

    const activities = filtered.map(r => ({
        activityName: r.activityName || '',
        noOfTrainings: num(r.noOfTrainings),
        noOfBeneficiaries: num(r.noOfBeneficiaries),
    }));

    const fundsRec = isTsp ? (filtered.find(r => num(r.fundsReceived) > 0) || first) : null;
    const outcomeRec = isTsp
        ? (filtered.find(r => num(r.outcome1_achievement) > 0 || num(r.outcome2_achievement) > 0 || num(r.outcome3_achievement) > 0) || first)
        : null;
    const locationDetails = isTsp
        ? filtered.filter(r => r.districtName || r.subDistrict || r.villageNames).map(r => ({
            districtName: r.districtName,
            subDistrict: r.subDistrict,
            villagesCount: num(r.villagesCount),
            villageNames: r.villageNames,
            stMale: num(r.beneficiaryMale),
            stFemale: num(r.beneficiaryFemale),
            stTotal: num(r.beneficiaryTotal),
        }))
        : [];

    return {
        kvkName: first.kvkName || '',
        reportingYear: first.yearName || '',
        activities,
        fundsReceived: fundsRec ? num(fundsRec.fundsReceived) : null,
        outcomes: outcomeRec ? {
            familyIncome:          { unit: outcomeRec.outcome1_unit || '%', achievement: num(outcomeRec.outcome1_achievement) },
            consumptionLevel:      { unit: outcomeRec.outcome2_unit || '%', achievement: num(outcomeRec.outcome2_achievement) },
            implementsAvailability:{ unit: outcomeRec.outcome3_unit || '%', achievement: num(outcomeRec.outcome3_achievement) },
        } : null,
        locationDetails,
    };
}

/* ── all-report renderer (state-wise superadmin + structured KVK) ──────────── */

const STATE_STYLE = `
<style>
    .tsp-state-tbl { width:100%; border-collapse:collapse; font-size:8.5px; margin-bottom:10px; }
    .tsp-state-tbl th, .tsp-state-tbl td { border:1px solid #333; padding:3px 5px; text-align:center; vertical-align:middle; }
    .tsp-state-tbl th { background:#e8e8e8; font-weight:bold; }
    .tsp-state-tbl td.L, .tsp-state-tbl th.L { text-align:left; }
    .tsp-state-tbl tr.alt td { background:#f7f7f7; }
</style>`;

function sortStr(a, b) {
    return String(a || '').localeCompare(String(b || ''), undefined, { sensitivity: 'base' });
}

function activityKey(r) {
    return (r.activityName && String(r.activityName).trim())
        || (r.activityOther && String(r.activityOther).trim())
        || 'Other activities';
}

// Master activities first (0 where no data), then any extras present in data.
function orderedActivities(records, masterActivities) {
    const present = [...new Set(records.map(activityKey))];
    if (Array.isArray(masterActivities) && masterActivities.length) {
        const seen = new Set(masterActivities);
        return [...masterActivities, ...present.filter((a) => !seen.has(a)).sort(sortStr)];
    }
    return present.sort(sortStr);
}

function resolveTspScspRecords(data) {
    // Aggregated all-report shape from reportAggregationService
    if (data && !Array.isArray(data) && (Array.isArray(data.tspRecords) || Array.isArray(data.scspRecords))) {
        return {
            tspRecords: data.tspRecords || [],
            scspRecords: data.scspRecords || [],
            masterActivities: Array.isArray(data.activities) ? data.activities : null,
        };
    }
    // Legacy combined object { type:'combined', tsp:{records}, scsp:{records} }
    if (data && !Array.isArray(data) && (data.tsp || data.scsp)) {
        return {
            tspRecords: (data.tsp && data.tsp.records) || [],
            scspRecords: (data.scsp && data.scsp.records) || [],
            masterActivities: null,
        };
    }
    // Flat array of raw records (module export)
    const arr = Array.isArray(data) ? data : (data ? [data] : []);
    return {
        tspRecords: arr.filter((r) => (r.type || '').toUpperCase() === 'TSP'),
        scspRecords: arr.filter((r) => (r.type || '').toUpperCase() === 'SCSP'),
        masterActivities: null,
    };
}

/* Superadmin: state-wise physical output (image #7 format). */
function renderStatePlanTable(records, masterActivities) {
    const states = [...new Set(records.map((r) => (r.stateName && String(r.stateName).trim()) || 'Unknown'))].sort(sortStr);
    const activities = orderedActivities(records, masterActivities);
    const map = new Map(); // activity -> state -> { tr, ben }
    for (const r of records) {
        const a = activityKey(r);
        const st = (r.stateName && String(r.stateName).trim()) || 'Unknown';
        if (!map.has(a)) map.set(a, new Map());
        const sm = map.get(a);
        if (!sm.has(st)) sm.set(st, { tr: 0, ben: 0 });
        const c = sm.get(st);
        c.tr += num(r.noOfTrainings);
        c.ben += num(r.noOfBeneficiaries);
    }
    const stateHead = states.map((s) => `<th>${esc(s)}</th>`).join('');
    const body = activities.map((a, i) => {
        const sm = map.get(a) || new Map();
        const trCells = states.map((s) => `<td>${num((sm.get(s) || {}).tr)}</td>`).join('');
        const benCells = states.map((s) => `<td>${num((sm.get(s) || {}).ben)}</td>`).join('');
        return `
        <tr>
          <td rowspan="2">${i + 1}</td>
          <td rowspan="2" class="L">${esc(a)}</td>
          <td class="L">No. of Trainings/Demos</td>
          ${trCells}
        </tr>
        <tr class="alt">
          <td class="L">No. of Farmers</td>
          ${benCells}
        </tr>`;
    }).join('');
    return `
        <table class="tsp-state-tbl">
            <thead>
                <tr>
                    <th>Sl. No</th>
                    <th class="L">Name of Activities</th>
                    <th class="L">Physical Achievement</th>
                    ${stateHead}
                </tr>
            </thead>
            <tbody>${body}</tbody>
        </table>`;
}

/* KVK: neat per-activity physical output table. */
function renderKvkActivitiesTable(records, masterActivities) {
    const activities = orderedActivities(records, masterActivities);
    const map = new Map();
    for (const r of records) {
        const a = activityKey(r);
        if (!map.has(a)) map.set(a, { tr: 0, ben: 0 });
        const c = map.get(a);
        c.tr += num(r.noOfTrainings);
        c.ben += num(r.noOfBeneficiaries);
    }
    const body = activities.map((a, i) => {
        const c = map.get(a) || { tr: 0, ben: 0 };
        return `<tr><td>${i + 1}</td><td class="L">${esc(a)}</td><td>${num(c.tr)}</td><td>${num(c.ben)}</td></tr>`;
    }).join('');
    return `
        <table class="tsp-scsp-tbl">
            <colgroup><col style="width:8%"><col style="width:52%"><col style="width:20%"><col style="width:20%"></colgroup>
            <thead>
                <tr><th>Sl. No</th><th>Name of Activities</th><th>No. of Trainings/Demos</th><th>No. of Farmers</th></tr>
            </thead>
            <tbody>${body}</tbody>
        </table>`;
}

function fundFromRecords(records) {
    const r = records.find((x) => num(x.fundsReceived) > 0);
    return r ? num(r.fundsReceived) : null;
}

function outcomesFromRecords(records) {
    const rec = records.find((r) => num(r.outcome1Achievement) > 0 || num(r.outcome2Achievement) > 0 || num(r.outcome3Achievement) > 0);
    if (!rec) return null;
    return {
        familyIncome: { unit: rec.outcome1Unit || '%', achievement: num(rec.outcome1Achievement) },
        consumptionLevel: { unit: rec.outcome2Unit || '%', achievement: num(rec.outcome2Achievement) },
        implementsAvailability: { unit: rec.outcome3Unit || '%', achievement: num(rec.outcome3Achievement) },
    };
}

function renderKvkTspBlock(records, masterActivities) {
    let html = '';
    html += `<p class="sub-h">a. Achievements of physical output under TSP</p>`;
    html += renderKvkActivitiesTable(records, masterActivities);
    const fund = fundFromRecords(records);
    html += `<p class="sub-h">b. Fund received under TSP</p>`;
    html += fund != null
        ? `<p class="single-val">Fund received under TSP (Rs. In lakh): <strong>${esc(fund)}</strong></p>`
        : `<p class="no-data">No fund data available.</p>`;
    html += `<p class="sub-h">c. Achievements of physical outcome under TSP</p>`;
    html += renderOutcomes(outcomesFromRecords(records));
    html += `<p class="sub-h">d. Location and Beneficiary Details</p>`;
    html += renderLocation(records.filter((r) => r.districtName || r.subDistrict || r.villageNames));
    return html;
}

function renderKvkScspBlock(records, masterActivities) {
    return `<p class="sub-h">a. Achievements of physical output under SCSP</p>${renderKvkActivitiesTable(records, masterActivities)}`;
}

/**
 * Signature: (section, data, sectionId, isFirstSection, reportContext)
 * Superadmin (aggregated) → state-wise physical output tables (image #7).
 * KVK side → structured a–d (TSP) / a (SCSP) readable tables.
 */
function renderTspScspSection(section, data, sectionId, isFirstSection, reportContext = {}) {
    const { tspRecords, scspRecords, masterActivities } = resolveTspScspRecords(data);
    const hasTsp = tspRecords.length > 0;
    const hasScsp = scspRecords.length > 0;
    const heading = `<h1 class="section-title">${esc(section.id)} ${esc(section.title)}</h1>`;
    // Wrap the section in an element carrying id="${sectionId}" so the Table of
    // Contents link (#section-2-33) has a jump target — without it the TOC row
    // for TSP/SCSP is not clickable. Matches every other section template.
    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const open = `<div id="${sectionId}" class="${pageClass}">`;

    if (!hasTsp && !hasScsp) {
        return `${STYLES}${open}${heading}<div class="tsp-scsp-wrap"><p class="no-data">No TSP/SCSP data available.</p></div></div>`;
    }

    if (reportContext.isAggregatedView) {
        return `${STYLES}${STATE_STYLE}${open}${heading}
        <div class="tsp-scsp-wrap">
            <h3>Details of Tribal Sub Plan (TSP)</h3>
            <p class="sub-h">a. Achievements of physical output under TSP</p>
            ${hasTsp ? renderStatePlanTable(tspRecords, masterActivities) : '<p class="no-data">No TSP data available.</p>'}
            <h3>Details of Scheduled Caste Sub Plan (SCSP)</h3>
            <p class="sub-h">a. Achievements of physical output under SCSP</p>
            ${hasScsp ? renderStatePlanTable(scspRecords, masterActivities) : '<p class="no-data">No SCSP data available.</p>'}
        </div></div>`;
    }

    return `${STYLES}${open}${heading}
        <div class="tsp-scsp-wrap">
            <h3>Details of Tribal Sub Plan (TSP)</h3>
            ${hasTsp ? renderKvkTspBlock(tspRecords, masterActivities) : '<p class="no-data">No TSP data available.</p>'}
            <h3>Details of Scheduled Caste Sub Plan (SCSP)</h3>
            ${hasScsp ? renderKvkScspBlock(scspRecords, masterActivities) : '<p class="no-data">No SCSP data available.</p>'}
        </div></div>`;
}

/* ── module-export: KVK-wise grouped (TSP-only / SCSP-only) ────────────────────
 *
 * The combined renderer above clutters one big table across all KVKs for the
 * superadmin. These build one structured block PER KVK so each KVK is its own
 * section. Date/year qualifiers are dropped — kept simple per requirement.
 */

const KVK_BAND_STYLE = `
<style>
    .tsp-kvk-band { font-size: 10px; font-weight: bold; background: #dce6f1; padding: 4px 6px; margin: 12px 0 6px 0; }
</style>`;

function buildKvkGroups(data, type) {
    const records = Array.isArray(data) ? data : (data ? [data] : []);
    const byKvk = new Map();
    for (const r of records) {
        if ((r.type || '').toUpperCase() !== type) continue;
        const k = r.kvkName || '—';
        if (!byKvk.has(k)) byKvk.set(k, []);
        byKvk.get(k).push(r);
    }
    const groups = [];
    for (const [kvkName, recs] of byKvk.entries()) {
        const structured = buildStructuredFromRecords(recs, type);
        if (structured) groups.push({ kvkName, data: structured });
    }
    return { groups, isMultiKvk: groups.length > 1 };
}

const buildTspKvkGroups = (data) => buildKvkGroups(data, 'TSP');
const buildScspKvkGroups = (data) => buildKvkGroups(data, 'SCSP');

// TSP block (a–d) without any date/year qualifier.
function renderTspBlockSimple(tsp) {
    let html = '';
    html += `<p class="sub-h">a. Achievements of physical output under TSP</p>`;
    html += renderActivities(tsp.activities, 'TSP');
    html += `<p class="sub-h">b. Fund received under TSP</p>`;
    html += tsp.fundsReceived != null
        ? `<p class="single-val">Fund received under TSP (Rs. In lakh): <strong>${esc(tsp.fundsReceived)}</strong></p>`
        : `<p class="no-data">No fund data available.</p>`;
    html += `<p class="sub-h">c. Achievements of physical outcome under TSP</p>`;
    html += renderOutcomes(tsp.outcomes);
    html += `<p class="sub-h">d. Location and Beneficiary Details</p>`;
    html += renderLocation(tsp.locationDetails);
    return html;
}

function renderScspBlockSimple(scsp) {
    let html = '';
    html += `<p class="sub-h">a. Achievements of physical output under SCSP</p>`;
    html += renderActivities(scsp.activities, 'SCSP');
    return html;
}

function renderTspActivitiesSection(section, data) {
    const { groups } = buildTspKvkGroups(data);
    const body = groups.length === 0
        ? '<p class="no-data">No TSP data available.</p>'
        : groups.map(g => `
            <div class="tsp-kvk-band">${esc(g.kvkName)}</div>
            ${renderTspBlockSimple(g.data)}`).join('');

    return `${STYLES}${KVK_BAND_STYLE}
        <div class="tsp-scsp-wrap">
            <h3>2.23.1 – Details of Tribal Sub Plan (TSP)</h3>
            ${body}
        </div>`;
}

function renderScspActivitiesSection(section, data) {
    const { groups } = buildScspKvkGroups(data);
    const body = groups.length === 0
        ? '<p class="no-data">No SCSP data available.</p>'
        : groups.map(g => `
            <div class="tsp-kvk-band">${esc(g.kvkName)}</div>
            ${renderScspBlockSimple(g.data)}`).join('');

    return `${STYLES}${KVK_BAND_STYLE}
        <div class="tsp-scsp-wrap">
            <h3>2.23.2 – Details of Scheduled Caste Sub Plan (SCSP)</h3>
            ${body}
        </div>`;
}

module.exports = {
    renderTspScspSection,
    renderTspActivitiesSection,
    renderScspActivitiesSection,
    buildTspKvkGroups,
    buildScspKvkGroups,
};
