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

/* ── render one TSP block (a–d) ───────────────────────────────────────────── */

function renderTspBlock(tsp) {
    if (!tsp || !tsp.activities || tsp.activities.length === 0) {
        return '<p class="no-data">No TSP data available.</p>';
    }
    const year = esc(tsp.reportingYear || '');
    const yearLabel = year ? ` during ${year}` : '';

    let html = '';
    html += `<p class="sub-h">a. Achievements of physical output under TSP</p>`;
    html += renderActivities(tsp.activities, 'TSP');

    html += `<p class="sub-h">b. Fund received under TSP</p>`;
    html += tsp.fundsReceived != null
        ? `<p class="single-val">Fund received under TSP (Rs. In lakh): <strong>${esc(tsp.fundsReceived)}</strong></p>`
        : `<p class="no-data">No fund data available.</p>`;

    html += `<p class="sub-h">c. Achievements of physical outcome under TSP${yearLabel}</p>`;
    html += renderOutcomes(tsp.outcomes, year);

    html += `<p class="sub-h">d. Location and Beneficiary Details${yearLabel}</p>`;
    html += renderLocation(tsp.locationDetails);

    return html;
}

/* ── render one SCSP block (a only) ──────────────────────────────────────── */

function renderScspBlock(scsp) {
    if (!scsp || !scsp.activities || scsp.activities.length === 0) {
        return '<p class="no-data">No SCSP data available.</p>';
    }
    let html = '';
    html += `<p class="sub-h">a. Achievements of physical output under SCSP</p>`;
    html += renderActivities(scsp.activities, 'SCSP');
    return html;
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

/* ── main renderer ────────────────────────────────────────────────────────── */

/**
 * Correct signature: (section, data, sectionId, isFirstSection)
 * Called by reportTemplateService._generateCustomSection()
 */
function renderTspScspSection(section, data, sectionId, isFirstSection) {
    let tsp, scsp;

    // Mode 1 – all-report: data is the combined structured object
    if (data && !Array.isArray(data) && (data.type === 'combined' || data.tsp !== undefined)) {
        tsp  = data.tsp;
        scsp = data.scsp;
    } else {
        // Mode 2 – module export: data is a flat array of raw form records
        const records = Array.isArray(data) ? data : (data ? [data] : []);
        tsp  = buildStructuredFromRecords(records, 'TSP');
        scsp = buildStructuredFromRecords(records, 'SCSP');
    }

    const hasTsp  = tsp  && tsp.activities  && tsp.activities.length  > 0;
    const hasScsp = scsp && scsp.activities && scsp.activities.length > 0;

    if (!hasTsp && !hasScsp) {
        return `${STYLES}
            <div class="tsp-scsp-wrap">
                <p class="no-data">No TSP/SCSP data available for this KVK.</p>
            </div>`;
    }

    return `${STYLES}
        <div class="tsp-scsp-wrap">
            <h3>2.23.1 – Details of Tribal Sub Plan (TSP)</h3>
            ${hasTsp ? renderTspBlock(tsp) : '<p class="no-data">No TSP data available.</p>'}

            <h3>2.23.2 – Details of Scheduled Caste Sub Plan (SCSP)</h3>
            ${hasScsp ? renderScspBlock(scsp) : '<p class="no-data">No SCSP data available.</p>'}
        </div>`;
}

module.exports = { renderTspScspSection };
