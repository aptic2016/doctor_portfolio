require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const exps = await prisma.experience.findMany();
  for (const exp of exps) {
    if (exp.title && (exp.title.includes('Ã') || exp.title.includes('Â'))) {
      console.log(`ID: ${exp.id}`);
      console.log(`Title bytes: ${Buffer.from(exp.title).toString('hex').substring(0, 80)}`);
      console.log(`Title: ${exp.title}`);
      console.log('---');
    }
  }
  await prisma.$disconnect();
})();
