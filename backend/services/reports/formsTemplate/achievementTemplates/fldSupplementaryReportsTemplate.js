function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
    }[char]));
}

function records(data) {
    return Array.isArray(data) ? data : [];
}

function sectionShell(section, sectionId, isFirstSection, body) {
    const heading = `${esc(section.id)} ${esc(section.title)}`;
    return `<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <style>.fld-supp{width:100%;border-collapse:collapse;font-size:7pt}.fld-supp th,.fld-supp td{border:.35pt solid #000;padding:3px;vertical-align:top}.fld-supp th{background:#e8e8e8;text-align:center}.fld-supp .c{text-align:center}</style>
  <h1 class="section-title">${heading}</h1>${body}</div>`;
}

function renderFldExtensionTrainingReportSection(section, data, sectionId, isFirstSection) {
    const rows = records(data);
    if (!rows.length) return sectionShell(section, sectionId, isFirstSection, '<p class="no-data">No FLD extension and training activity data for this period.</p>');
    const body = rows.map((row, index) => `<tr><td class="c">${index + 1}</td><td>${esc(row.kvk?.kvkName)}</td><td>${esc(row.fld?.fldName)}</td><td>${esc(row.fldActivity?.activityName || row.activityOther)}</td><td class="c">${esc(row.activityDate ? new Date(row.activityDate).toISOString().slice(0, 10) : '—')}</td><td class="c">${esc(row.numberOfActivities)}</td><td class="c">${Number(row.generalM || 0) + Number(row.generalF || 0) + Number(row.obcM || 0) + Number(row.obcF || 0) + Number(row.scM || 0) + Number(row.scF || 0) + Number(row.stM || 0) + Number(row.stF || 0)}</td><td>${esc(row.remarks || '—')}</td></tr>`).join('');
    return sectionShell(section, sectionId, isFirstSection, `<table class="fld-supp"><thead><tr><th>Sl.</th><th>KVK</th><th>FLD</th><th>Activity</th><th>Date</th><th>No. of activities</th><th>Participants</th><th>Remarks</th></tr></thead><tbody>${body}</tbody></table>`);
}

function renderFldTechnicalFeedbackReportSection(section, data, sectionId, isFirstSection) {
    const rows = records(data);
    if (!rows.length) return sectionShell(section, sectionId, isFirstSection, '<p class="no-data">No FLD technical feedback data for this period.</p>');
    const body = rows.map((row, index) => `<tr><td class="c">${index + 1}</td><td>${esc(row.kvk?.kvkName)}</td><td>${esc(row.fld?.fldName)}</td><td>${esc(row.cropOther || row.crop?.cropName || '—')}</td><td>${esc(row.feedback)}</td></tr>`).join('');
    return sectionShell(section, sectionId, isFirstSection, `<table class="fld-supp"><thead><tr><th>Sl.</th><th>KVK</th><th>FLD</th><th>Crop</th><th>Technical feedback</th></tr></thead><tbody>${body}</tbody></table>`);
}

module.exports = { renderFldExtensionTrainingReportSection, renderFldTechnicalFeedbackReportSection };
