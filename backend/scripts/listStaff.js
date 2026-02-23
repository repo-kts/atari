const prisma = require('../config/prisma');
prisma.$queryRawUnsafe('SELECT kvk_id, kvk_name FROM kvk ORDER BY kvk_id LIMIT 10')
    .then(r => { console.log(JSON.stringify(r, null, 2)); return prisma.$disconnect(); })
    .catch(e => { console.error(e.message); return prisma.$disconnect(); });
