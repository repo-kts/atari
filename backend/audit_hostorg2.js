// READ-ONLY sample of differing host_org_name vs university_name.
const prisma = require('./config/prisma.js');
(async () => {
  try {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT k.kvk_name, k.host_org_name AS old_hostorg, u.university_name AS new_hostorg
         FROM kvk k
         LEFT JOIN "universityMaster" u ON u.university_id = k.university_id
        WHERE COALESCE(k.host_org_name,'') <> COALESCE(u.university_name,'')
        ORDER BY k.kvk_name
        LIMIT 12`
    );
    console.table(rows);
  } catch (e) {
    console.error('ERR:', e.message);
  } finally {
    await prisma.$disconnect();
  }
})();
