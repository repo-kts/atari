const prisma = require('./backend/config/prisma.js');
console.log('Available Prisma models:');
const models = Object.keys(prisma).filter(k => !k.startsWith('_') && typeof prisma[k] === 'object');
console.log(models.join(', '));
process.exit(0);
