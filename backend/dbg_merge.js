const prisma = require('./config/prisma.js');
const ds = require('./services/reports/reportDataService.js');
(async()=>{
  const o = await prisma.kvkoft.findFirst({select:{kvkId:true}});
  for (const s of ['2.1','1.6','1.10','1.11','2.3']) {
    try { const r = await ds.getSectionData(s, o.kvkId, {}); console.log('OK', s, Array.isArray(r.data)?('rows='+r.data.length):(r.data?'obj':'null')); }
    catch(e){ console.log('FAIL', s, (e.message||'').split('\n').pop().slice(0,90)); }
  }
  await prisma.$disconnect();
})().catch(e=>console.log('ERR', e.message));
