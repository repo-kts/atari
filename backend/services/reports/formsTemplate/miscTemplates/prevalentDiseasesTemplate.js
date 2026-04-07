/**
 * Prevalent Diseases Template (Crops & Livestock)
 *
 * Renders a flat table matching the original ATARI website:
 *   KVK | Name of the Disease | Crop | Date of outbreak |
 *   Area affected (in ha) | % Commodity loss |
 *   Preventive measures taken for area (in ha)
 *
 * Used for both crops and livestock reports (same column layout in original).
 *
 * Bound to reportTemplateService (`this`).
 */

function _formatDate(dateValue) {
    if (!dateValue) return '-';
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function renderPrevalentDiseasesCropsSection(section, data, sectionId, isFirstSection) {
    return _renderPrevalentDiseases.call(this, section, data, sectionId, isFirstSection, 'crops');
}

function renderPrevalentDiseasesLivestockSection(section, data, sectionId, isFirstSection) {
    return _renderPrevalentDiseases.call(this, section, data, sectionId, isFirstSection, 'livestock');
}

function _renderPrevalentDiseases(section, data, sectionId, isFirstSection, type) {
    const records = Array.isArray(data) ? data : (data ? [data] : []);
    const pageClass = isFirstSection
        ? 'section-page section-page-first'
        : 'section-page section-page-continued';

    const title = type === 'crops'
        ? 'Prevalent diseases in Crops'
        : 'Prevalent diseases in Livestocks';

    // Column config differs slightly between crops and livestock
    const isCrops = type === 'crops';
    const col2Label = isCrops ? 'Crop' : 'Crop';
    const col4Label = 'Area affected (in ha)';
    const col5Label = '% Commodity loss';
    const col6Label = 'Preventive measures taken for area (in ha)';

    let html = `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title" style="margin-bottom:10px;">${this._escapeHtml(title)}</h1>
    <table class="data-table" style="width:100%;">
        <thead>
            <tr>
                <th>KVK</th>
                <th>Name of the Disease</th>
                <th>${this._escapeHtml(col2Label)}</th>
                <th>Date of outbreak</th>
                <th>${this._escapeHtml(col4Label)}</th>
                <th>${this._escapeHtml(col5Label)}</th>
                <th>${this._escapeHtml(col6Label)}</th>
            </tr>
        </thead>
        <tbody>`;

    if (records.length === 0) {
        html += `
            <tr>
                <td colspan="7" style="text-align:center;color:#666;font-style:italic;padding:12px;">No data available for this section.</td>
            </tr>`;
    }

    records.forEach((row) => {
        const kvk = row.kvk?.kvkName || '-';
        const disease = row.diseaseName || '-';
        const cropOrType = isCrops ? (row.crop || '-') : (row.livestockType || '-');
        const date = _formatDate(row.dateOfOutbreak);

        let areaAffected, commodityLoss, preventive;
        if (isCrops) {
            areaAffected = row.areaAffected != null ? String(row.areaAffected) : '-';
            commodityLoss = row.commodityLossPercent != null ? String(row.commodityLossPercent) : '-';
            preventive = row.preventiveMeasuresArea != null ? String(row.preventiveMeasuresArea) : '-';
        } else {
            areaAffected = row.mortalityCount != null ? String(row.mortalityCount) : '-';
            commodityLoss = row.animalsTreated != null ? String(row.animalsTreated) : '-';
            preventive = row.preventiveMeasures || '-';
        }

        html += `
            <tr>
                <td>${this._escapeHtml(kvk)}</td>
                <td>${this._escapeHtml(disease)}</td>
                <td>${this._escapeHtml(cropOrType)}</td>
                <td>${this._escapeHtml(date)}</td>
                <td>${this._escapeHtml(areaAffected)}</td>
                <td>${this._escapeHtml(String(commodityLoss))}</td>
                <td>${this._escapeHtml(String(preventive))}</td>
            </tr>`;
    });

    html += `
        </tbody>
    </table>
</div>`;

    return html;
}

module.exports = {
    renderPrevalentDiseasesCropsSection,
    renderPrevalentDiseasesLivestockSection,
};
