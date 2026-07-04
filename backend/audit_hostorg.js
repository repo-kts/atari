// READ-ONLY audit. No writes.
const prisma = require('./config/prisma.js');
(async () => {
  try {
    const total = await prisma.kvk.count();
    const noUniversity = await prisma.$queryRawUnsafe(
      `SELECT count(*)::int AS c FROM kvk WHERE university_id IS NULL`
    );
    const mismatch = await prisma.$queryRawUnsafe(
      `SELECT count(*)::int AS c
         FROM kvk k
         LEFT JOIN "universityMaster" u ON u.university_id = k.university_id
        WHERE COALESCE(k.host_org_name,'') <> COALESCE(u.university_name,'')`
    );
    const orphanHostOrg = await prisma.$queryRawUnsafe(
      `SELECT kvk_id, kvk_name, host_org_name
         FROM kvk
        WHERE university_id IS NULL
          AND COALESCE(host_org_name,'') <> ''
        LIMIT 20`
    );
    console.log('total kvk:', total);
    console.log('kvk without university_id:', noUniversity[0].c);
    console.log('kvk host_org_name != university_name:', mismatch[0].c);
    console.log('orphan (no university but has host_org_name):', orphanHostOrg.length);
    console.table(orphanHostOrg);
  } catch (e) {
    console.error('AUDIT ERROR:', e.message);
  } finally {
    await prisma.$disconnect();
  }
})();
