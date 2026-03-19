const prisma = require('./config/prisma.js');

async function main() {
  try {
    const users = await prisma.user.findMany({
      select: {
        email: true,
        role: {
          select: {
            roleName: true
          }
        }
      }
    });
    console.log('Users in database:');
    console.log(JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Error fetching users:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
