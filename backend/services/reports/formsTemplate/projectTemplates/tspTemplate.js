'use strict';

/**
 * TSP (Tribal Sub Plan) PDF template – sections a, b, c, d
 */

const BASE_STYLES = `
    <style>
        .tsp-section { font-family: Arial, sans-serif; font-size: 9px; margin-bottom: 18px; }
        .tsp-section h3 { font-size: 11px; font-weight: bold; margin: 0 0 8px 0; }
        .tsp-sub-heading { font-size: 9.5px; font-weight: bold; margin: 12px 0 5px 0; }
        .tsp-single-value { font-size: 9.5px; margin: 5px 0 12px 0; }
        .tsp-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            font-size: 8.5px;
            margin-bottom: 10px;
        }
        .tsp-table th, .tsp-table td {
            border: 1px solid #333;
            padding: 3px 5px;
            text-align: center;
            vertical-align: middle;
            word-break: break-word;
        }
        .tsp-table th { background-color: #e8e8e8; font-weight: bold; }
        .tsp-table td.left { text-align: left; }
        .tsp-table tr.data-row td { background-color: #f9f9f9; }
        .tsp-no-data { color: #888; font-style: italic; font-size: 9px; padding: 4px 0; }
    </style>
`;

// ─── Section (a) Physical Output Table ───────────────────────────────────────

function renderPhysicalOutputTable(activities, year) {
    const yearLabel = year ? ` during ${year}` : '';
    if (!activities || activities.length === 0) {
        return `<p class="tsp-no-data">No physical output data available${yearLabel}.</p>`;
    }

    const rows = activities.map((act, idx) => {
        const name = act.activityName || `Activity ${idx + 1}`;
        const count = act.noOfTrainings != null ? act.noOfTrainings : '-';
        const beneficiaries = act.noOfBeneficiaries != null ? act.noOfBeneficiaries : '-';
        return `
            <tr>
                <td rowspan="2">${idx + 1}</td>
                <td rowspan="2" class="left">${name}</td>
                <td>Nos.</td>
                <td>No. of Beneficiaries</td>
            </tr>
            <tr class="data-row">
                <td>${count}</td>
                <td>${beneficiaries}</td>
            </tr>`;
    }).join('');

    return `
        <table class="tsp-table">
            <colgroup>
                <col style="width:6%">
                <col style="width:40%">
                <col style="width:27%">
                <col style="width:27%">
            </colgroup>
            <thead>
                <tr>
                    <th>Sl. No</th>
                    <th>Activities</th>
                    <th colspan="2">Physical Achievement</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>`;
}

// ─── Section (c) Outcomes Table ──────────────────────────────────────────────

function renderOutcomesTable(outcomes, year) {
    const yearLabel = year ? ` under TSP during ${year}` : ' under TSP';
    if (!outcomes) {
        return `<p class="tsp-no-data">No physical outcome data available${yearLabel}.</p>`;
    }

    const outcomesArr = [
        outcomes.familyIncome,
        outcomes.consumptionLevel,
        outcomes.implementsAvailability,
    ];

    const rows = outcomesArr.map((o, idx) => `
        <tr>
            <td>${idx + 1}.</td>
            <td class="left">${o.description}</td>
            <td>${o.unit || '%'}</td>
            <td>${o.achievement != null ? o.achievement : '-'}</td>
        </tr>`).join('');

    return `
        <table class="tsp-table">
            <colgroup>
                <col style="width:6%">
                <col style="width:58%">
                <col style="width:18%">
                <col style="width:18%">
            </colgroup>
            <thead>
                <tr>
                    <th>Sl. No.</th>
                    <th>Description</th>
                    <th>Unit</th>
                    <th>Achievements</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>`;
}

// ─── Section (d) Location & Beneficiary Table ─────────────────────────────────

function renderLocationTable(locationDetails, year) {
    const yearLabel = year ? ` during ${year}` : '';
    if (!locationDetails || locationDetails.length === 0) {
        return `<p class="tsp-no-data">No location/beneficiary data available${yearLabel}.</p>`;
    }

    const rows = locationDetails.map(loc => `
        <tr>
            <td class="left">${loc.districtName || '-'}</td>
            <td class="left">${loc.subDistrict || '-'}</td>
            <td>${loc.villagesCount != null ? loc.villagesCount : '-'}</td>
            <td class="left">${loc.villageNames || '-'}</td>
            <td>${loc.stMale != null ? loc.stMale : '-'}</td>
            <td>${loc.stFemale != null ? loc.stFemale : '-'}</td>
            <td>${loc.stTotal != null ? loc.stTotal : '-'}</td>
        </tr>`).join('');

    return `
        <table class="tsp-table">
            <colgroup>
                <col style="width:12%">
                <col style="width:15%">
                <col style="width:8%">
                <col style="width:35%">
                <col style="width:10%">
                <col style="width:10%">
                <col style="width:10%">
            </colgroup>
            <thead>
                <tr>
                    <th rowspan="2">District</th>
                    <th rowspan="2">Subdistrict</th>
                    <th rowspan="2">No. of Village covered</th>
                    <th rowspan="2">Name of village(s) covered</th>
                    <th colspan="3">ST population benefitted (No.)</th>
                </tr>
                <tr>
                    <th>M</th>
                    <th>F</th>
                    <th>T</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>`;
}

// ─── Main renderer ────────────────────────────────────────────────────────────

/**
 * Correct signature: (section, data, sectionId, isFirstSection)
 * Called by reportTemplateService._generateCustomSection()
 */
function renderTspSection(section, data, sectionId, isFirstSection) {
    // data is the structured TSP object from tspScspReportRepository.getTspData()
    const rawData = Array.isArray(data) ? data[0] : data;

    if (!rawData || !rawData.activities || rawData.activities.length === 0) {
        return `${BASE_STYLES}
            <div class="tsp-section">
                <h3>Details of Tribal Sub Plan (TSP)</h3>
                <p class="tsp-no-data">No TSP data available for this KVK.</p>
            </div>`;
    }

    const d = rawData;
    const year = d.reportingYear || '';

    const physicalOutputTable = renderPhysicalOutputTable(d.activities, year);
    const fundsText = d.fundsReceived != null
        ? `<p class="tsp-single-value">Fund received under TSP (Rs. In lakh): <strong>${d.fundsReceived}</strong></p>`
        : `<p class="tsp-no-data">No fund data available.</p>`;

    const outcomesTable = renderOutcomesTable(d.outcomes, year);
    const locationTable = renderLocationTable(d.locationDetails, year);

    return `${BASE_STYLES}
        <div class="tsp-section">
            <h3>Details of Tribal Sub Plan (TSP)</h3>

            <p class="tsp-sub-heading">a. Achievements of physical output under TSP</p>
            ${physicalOutputTable}

            <p class="tsp-sub-heading">b. Fund received under TSP</p>
            ${fundsText}

            <p class="tsp-sub-heading">c. Achievements of physical outcome under TSP${year ? ` during ${year}` : ''}</p>
            ${outcomesTable}

            <p class="tsp-sub-heading">d. Location and Beneficiary Details${year ? ` during ${year}` : ''}</p>
            ${locationTable}
        </div>`;
}

module.exports = { renderTspSection };
