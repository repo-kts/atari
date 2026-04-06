function esc(t){if(t===null||t===undefined)return'';const m={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'};return String(t).replace(/[&<>"']/g,c=>m[c]);}
function n(v){const x=Number(v);return Number.isFinite(x)?x:0;}

function renderNicraSoilHealthSection(section, data, sectionId, isFirstSection){
  const rows = Array.isArray(data)?data:(data?[data]:[]);
  if(rows.length===0){ return this._generateEmptySection(section,null,sectionId,isFirstSection); }
  const body = rows.map((r,idx)=>`
    <tr>
      <td>${idx+1}</td>
      <td class="l">${esc(r.stateName || '')}</td>
      <td class="l">${esc(r.kvkName || '')}</td>
      <td>${n(r.noOfSoilSamplesCollected)}</td>
      <td>${n(r.noOfSamplesAnalysed)}</td>
      <td>${n(r.shcIssued)}</td>
      <td>${n(r.genM)}</td><td>${n(r.genF)}</td><td>${n(r.genT)}</td>
      <td>${n(r.obcM)}</td><td>${n(r.obcF)}</td><td>${n(r.obcT)}</td>
      <td>${n(r.scM)}</td><td>${n(r.scF)}</td><td>${n(r.scT)}</td>
      <td>${n(r.stM)}</td><td>${n(r.stF)}</td><td>${n(r.stT)}</td>
      <td>${n(r.totM)}</td><td>${n(r.totF)}</td><td>${n(r.totT)}</td>
    </tr>
  `).join('');

  return `
<div id="${sectionId}" class="${isFirstSection?'section-page section-page-first':'section-page section-page-continued'}">
  <style>
    .nicra-shc{ width:100%; table-layout:fixed; border-collapse:collapse; font-size:6.2pt; line-height:1.15; }
    .nicra-shc th,.nicra-shc td{ border:0.2px solid #000; padding:2px 3px; text-align:center; vertical-align:middle; word-break:break-word; }
    .nicra-shc thead th{ background:#fff; font-weight:bold; }
    .nicra-shc .l{ text-align:left; }
  </style>
  <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
  <table class="nicra-shc">
    <thead>
      <tr>
        <th>S.No.</th>
        <th>State</th>
        <th>KVK</th>
        <th>No. of soil samples collected</th>
        <th>No. of samples analysed</th>
        <th>SHC issued</th>
        <th colspan="3">General</th>
        <th colspan="3">OBC</th>
        <th colspan="3">SC</th>
        <th colspan="3">ST</th>
        <th colspan="3">Total</th>
      </tr>
      <tr>
        <th></th><th></th><th></th><th></th><th></th><th></th>
        <th>M</th><th>F</th><th>T</th>
        <th>M</th><th>F</th><th>T</th>
        <th>M</th><th>F</th><th>T</th>
        <th>M</th><th>F</th><th>T</th>
        <th>M</th><th>F</th><th>T</th>
      </tr>
    </thead>
    <tbody>
      ${body}
    </tbody>
  </table>
</div>`;
}

module.exports = { renderNicraSoilHealthSection };
