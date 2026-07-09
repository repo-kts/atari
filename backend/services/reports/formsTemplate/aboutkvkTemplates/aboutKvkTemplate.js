function renderAboutKvkSection(section, data, sectionId, isFirstSection) {
    if (!data) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection)
    }

    const records = Array.isArray(data) ? data : [data]
    if (records.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection)
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'
    // Inner items are numbered off the subsection (feature) number, e.g. 1.1.A.1.
    const base = section.featureNumber || section.id
    let html = `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    <div class="about-kvk-report">
        <h4 class="about-kvk-subheading">${base}.1 Name and address of KVK with phone, fax and e-mail</h4>
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
        <h4 class="about-kvk-subheading">${base}.2 Name and address of host organization with phone, fax and e-mail</h4>
        ${this._renderContactTable({
            // Many KVKs share the same host organization; list each host org once.
            // Dedupe by org name (keep the first occurrence and its data).
            rows: dedupeHostRows.call(this, records),
            nameColumnLabel: 'Name of Host Organization',
            includeSanctionYear: false,
            includeMobile: true
        })}
        <h4 class="about-kvk-subheading">${base}.3 Total Land with KVK</h4>
        ${this._renderLandTable(records)}
    </div>
`;

    html += `
:</div>`;

    return html
}

// Build host-org contact rows from the linked host master (UniversityMaster)
// and the KVK row's stored host contact fields. Module exports post the list
// rows from the View KVK API, which currently include flat host* fields but only
// university id/name; all-report exports may include richer nested university
// data. Accept both shapes and merge later non-empty values for duplicate hosts.
function dedupeHostRows(records) {
    const byKey = new Map();

    const display = (value) => this._toDisplayValue(value);
    const isPresent = (value) => {
        const text = String(value ?? '').trim();
        return text !== '' && text !== '-';
    };
    const firstPresent = (...values) => {
        for (const value of values) {
            const shown = display(value);
            if (isPresent(shown)) {
                return shown;
            }
        }
        return '-';
    };

    // The host master can hold several rows for the same host name with differing
    // contact values. Process records in a stable order (by kvkId, then universityId)
    // so the merged "first non-empty" value per field is deterministic — otherwise
    // the module export and the all-report export could pick different values for
    // the same host depending on natural row order.
    const ordered = [...records].sort((a, b) => {
        const ak = Number(a && a.kvkId) || 0;
        const bk = Number(b && b.kvkId) || 0;
        if (ak !== bk) return ak - bk;
        const au = Number(a && a.university && a.university.universityId) || 0;
        const bu = Number(b && b.university && b.university.universityId) || 0;
        return au - bu;
    });

    for (const record of ordered) {
        const university = record && record.university;
        const name = firstPresent(
            university && university.universityName,
            this._pickValue(record, ['Host Organization', 'hostOrg', 'university.universityName'])
        );
        const key = String(name || '').trim().toLowerCase();
        if (!isPresent(key)) {
            continue;
        }

        const next = {
            name,
            address: firstPresent(university && university.hostAddress, record && record.hostAddress, this._pickValue(record, ['Host Address'])),
            // Office = landline only; Mobile = mobile only. Keep them in their own
            // columns — do not fall back landline↔mobile or they'd show the same value.
            officePhone: firstPresent(
                university && university.hostLandline,
                record && record.hostLandline,
                this._pickValue(record, ['Host Office Phone'])
            ),
            mobile: firstPresent(
                university && university.hostMobile,
                record && record.hostMobile,
                this._pickValue(record, ['Host Mobile'])
            ),
            fax: firstPresent(university && university.hostFax, record && record.hostFax, this._pickValue(record, ['Host Fax'])),
            email: firstPresent(university && university.hostEmail, record && record.hostEmail, this._pickValue(record, ['Host Email'])),
        };

        if (!byKey.has(key)) {
            byKey.set(key, next);
            continue;
        }

        const current = byKey.get(key);
        for (const field of ['address', 'officePhone', 'mobile', 'fax', 'email']) {
            if (!isPresent(current[field]) && isPresent(next[field])) {
                current[field] = next[field];
            }
        }
    }

    return Array.from(byKey.values());
}

module.exports = {
    renderAboutKvkSection,
}
