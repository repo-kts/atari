'use strict';

/**
 * SCSP (Scheduled Caste Sub Plan) PDF template – section a only
 * (No fund received, physical outcome, or location sections)
 */

const BASE_STYLES = `
    <style>
        .scsp-section { font-family: Arial, sans-serif; font-size: 9px; margin-bottom: 18px; }
        .scsp-section h3 { font-size: 11px; font-weight: bold; margin: 0 0 8px 0; }
        .scsp-sub-heading { font-size: 9.5px; font-weight: bold; margin: 12px 0 5px 0; }
        .scsp-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            font-size: 8.5px;
            margin-bottom: 10px;
        }
        .scsp-table th, .scsp-table td {
            border: 1px solid #333;
            padding: 3px 5px;
            text-align: center;
            vertical-align: middle;
            word-break: break-word;
        }
        .scsp-table th { background-color: #e8e8e8; font-weight: bold; }
        .scsp-table td.left { text-align: left; }
        .scsp-table tr.data-row td { background-color: #f9f9f9; }
        .scsp-no-data { color: #888; font-style: italic; font-size: 9px; padding: 4px 0; }
    </style>
`;

// ─── Section (a) Physical Output Table ───────────────────────────────────────

function renderPhysicalOutputTable(activities) {
    if (!activities || activities.length === 0) {
        return `<p class="scsp-no-data">No physical output data available.</p>`;
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
        <table class="scsp-table">
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

// ─── Main renderer ────────────────────────────────────────────────────────────

/**
 * Correct signature: (section, data, sectionId, isFirstSection)
 * Called by reportTemplateService._generateCustomSection()
 */
function renderScspSection(section, data, sectionId, isFirstSection) {
    // data is the structured SCSP object from tspScspReportRepository.getScspData()
    const rawData = Array.isArray(data) ? data[0] : data;

    if (!rawData || !rawData.activities || rawData.activities.length === 0) {
        return `${BASE_STYLES}
            <div class="scsp-section">
                <h3>Details of Scheduled Caste Sub Plan (SCSP)</h3>
                <p class="scsp-no-data">No SCSP data available for this KVK.</p>
            </div>`;
    }

    const d = rawData;

    return `${BASE_STYLES}
        <div class="scsp-section">
            <h3>Details of Scheduled Caste Sub Plan (SCSP)</h3>

            <p class="scsp-sub-heading">a. Achievements of physical output under SCSP</p>
            ${renderPhysicalOutputTable(d.activities)}
        </div>`;
}

module.exports = { renderScspSection };
