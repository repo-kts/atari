const { comparePassword } = require('./utils/password.js');
const prisma = require('./config/prisma.js');

async function main() {
  const email = 'kvkgaya@atari.gov.in';
  const password = 'Atari@123';
  
  const user = await prisma.user.findFirst({
    where: { email, deletedAt: null },
  });
  
  if (!user) {
    console.log('User not found');
    return;
  }
  
  const isValid = await comparePassword(password, user.passwordHash);
  console.log(`Password valid? ${isValid}`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
