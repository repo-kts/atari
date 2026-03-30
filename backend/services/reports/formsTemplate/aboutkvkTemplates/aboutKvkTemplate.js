function renderAboutKvkSection(section, data, sectionId, isFirstSection) {
    if (!data) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection)
    }

    const records = Array.isArray(data) ? data : [data]
    if (records.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection)
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'
    let html = `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    <div class="about-kvk-report">
        <h3 class="about-kvk-heading">1. GENERAL INFORMATION ABOUT THE KVK</h3>
        <h4 class="about-kvk-subheading">1.1. Name and address of KVK with phone, fax and e-mail</h4>
        ${this._renderContactTable({
            rows: records.map(record => ({
                name: this._toDisplayValue(this._pickValue(record, ['KVK Name', 'kvkName'])),
                address: this._toDisplayValue(this._pickValue(record, ['Address', 'address'])),
                officePhone: this._toDisplayValue(this._pickValue(record, ['Office Phone', 'landline', 'Mobile', 'mobile'])),
                fax: this._toDisplayValue(this._pickValue(record, ['Fax', 'fax'])),
                email: this._toDisplayValue(this._pickValue(record, ['Email', 'email'])),
                sanctionYear: this._toDisplayValue(this._pickValue(record, ['Year of Sanction', 'yearOfSanction'])),
            })),
            nameColumnLabel: 'Name of KVK',
            includeSanctionYear: true
        })}
        <h4 class="about-kvk-subheading">1.2. Name and address of host organization with phone, fax and e-mail</h4>
        ${this._renderContactTable({
            rows: records.map(record => ({
                name: this._toDisplayValue(this._pickValue(record, ['Host Organization', 'hostOrg', 'org.orgName', 'org.uniName'])),
                address: this._toDisplayValue(this._pickValue(record, ['Host Address', 'hostAddress'])),
                officePhone: this._toDisplayValue(this._pickValue(record, ['Host Office Phone', 'hostLandline', 'hostMobile'])),
                fax: this._toDisplayValue(this._pickValue(record, ['Host Fax', 'hostFax'])),
                email: this._toDisplayValue(this._pickValue(record, ['Host Email', 'hostEmail'])),
            })),
            nameColumnLabel: 'Name of Host Organization',
            includeSanctionYear: false
        })}
        <h4 class="about-kvk-subheading">1.3. Total Land with KVK</h4>
        ${this._renderLandTable(records)}
    </div>
`;

    html += `
:</div>`;

    return html
}

module.exports = {
    renderAboutKvkSection,
}

