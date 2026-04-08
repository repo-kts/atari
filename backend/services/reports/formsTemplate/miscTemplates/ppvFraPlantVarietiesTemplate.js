/**
 * PPV & FRA Plant Varieties / Farmer Details Template
 *
 * Renders a flat table matching the original ATARI website:
 *   Name of Crop | Year of Registration | Farmer Name | Mobile No. |
 *   District | Block | Village | Characteristics
 *
 * Title: "PPV & FRA Sensitization training Programme"
 * Bound to reportTemplateService (`this`).
 */

function renderPpvFraPlantVarietiesSection(section, data, sectionId, isFirstSection) {
    const records = Array.isArray(data) ? data : (data ? [data] : []);
    const pageClass = isFirstSection
        ? 'section-page section-page-first'
        : 'section-page section-page-continued';

    let html = `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title" style="margin-bottom:10px;">PPV &amp; FRA Sensitization training Programme</h1>
    <table class="data-table" style="width:100%;">
        <thead>
            <tr>
                <th>Name of Crop Registered</th>
                <th>Year of Registration</th>
                <th>Registration No.</th>
                <th>Farmer Name</th>
                <th>Mobile No.</th>
                <th>District</th>
                <th>Block</th>
                <th>Village</th>
                <th>Characteristics</th>
            </tr>
        </thead>
        <tbody>`;

    if (records.length === 0) {
        html += `
            <tr>
                <td colspan="9" style="text-align:center;color:#666;font-style:italic;padding:12px;">No data available for this section.</td>
            </tr>`;
    }

    records.forEach((row) => {
        const crop = row.cropName || '-';
        const year = row.reportingYear != null ? String(row.reportingYear) : '-';
        const regNo = row.registrationNo || '-';
        const farmer = row.farmerName || '-';
        const mobile = row.mobile || '-';
        const district = row.district || '-';
        const block = row.block || '-';
        const village = row.village || '-';
        const characteristics = row.characteristics || '-';

        html += `
            <tr>
                <td>${this._escapeHtml(crop)}</td>
                <td>${this._escapeHtml(year)}</td>
                <td>${this._escapeHtml(regNo)}</td>
                <td>${this._escapeHtml(farmer)}</td>
                <td>${this._escapeHtml(mobile)}</td>
                <td>${this._escapeHtml(district)}</td>
                <td>${this._escapeHtml(block)}</td>
                <td>${this._escapeHtml(village)}</td>
                <td>${this._escapeHtml(characteristics)}</td>
            </tr>`;
    });

    html += `
        </tbody>
    </table>
</div>`;

    return html;
}

module.exports = { renderPpvFraPlantVarietiesSection };
