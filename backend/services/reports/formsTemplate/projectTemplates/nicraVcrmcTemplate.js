function esc(t){if(t===null||t===undefined)return'';const m={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'};return String(t).replace(/[&<>"']/g,c=>m[c]);}
function d(dt){if(!dt) return ''; const x=new Date(dt); return isNaN(x)?'':x.toISOString().slice(0,10);}
function n(v){const x=Number(v); return Number.isFinite(x)?x:0;}

function renderNicraVcrmcSection(section, data, sectionId, isFirstSection){
  const rows = Array.isArray(data)?data:(data?[data]:[]);
  if(rows.length===0){ return this._generateEmptySection(section,null,sectionId,isFirstSection); }
  const body = rows.map((r,idx)=>`
    <tr>
      <td>${idx+1}</td>
      <td class="l">${esc(r.stateName || '')}</td>
      <td class="l">${esc(r.kvkName || '')}</td>
      <td class="l">${esc(r.villageName || '')}</td>
      <td>${esc(d(r.vcrmcConstitutionDate))}</td>
      <td>${n(r.membersMale)}</td>
      <td>${n(r.membersFemale)}</td>
      <td>${n(r.membersTotal)}</td>
      <td>${n(r.meetingsOrganized)}</td>
      <td>${esc(d(r.dateOfMeeting))}</td>
      <td class="l">${esc(r.nameOfSecretary || '')}</td>
      <td class="l">${esc(r.nameOfPresident || '')}</td>
      <td class="l">${esc(r.majorDecisionTaken || '')}</td>
    </tr>
  `).join('');

  return `
<div id="${sectionId}" class="${isFirstSection?'section-page section-page-first':'section-page section-page-continued'}">
  <style>
    .nicra-vcrmc { width:100%; table-layout:fixed; border-collapse:collapse; font-size:6.2pt; line-height:1.15; }
    .nicra-vcrmc th,.nicra-vcrmc td { border:0.2px solid #000; padding:2px 3px; text-align:center; vertical-align:middle; word-break:break-word; }
    .nicra-vcrmc thead th { background:#fff; font-weight:bold; }
    .nicra-vcrmc .l { text-align:left; }
  </style>
  <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
  <table class="nicra-vcrmc">
    <thead>
      <tr>
        <th>S.No.</th>
        <th>State</th>
        <th>KVK</th>
        <th>Village name</th>
        <th>VCRMC Constitution date</th>
        <th colspan="3">VCRMC members (no.)</th>
        <th>Meetings organized by VCRMC (no.)</th>
        <th>Date of VCRMC meeting</th>
        <th>Name of Secretary</th>
        <th>Name of President</th>
        <th>Major decision taken</th>
      </tr>
      <tr>
        <th></th><th></th><th></th><th></th><th></th>
        <th>Male</th><th>Female</th><th>Total</th>
        <th></th><th></th><th></th><th></th><th></th>
      </tr>
    </thead>
    <tbody>
      ${body}
    </tbody>
  </table>
</div>`;
}

module.exports = { renderNicraVcrmcSection };
