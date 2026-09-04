require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const s = await prisma.siteSettings.findFirst();
  console.log('copyrightText:', JSON.stringify(s?.copyrightText));
  console.log('copyrightHex:', Buffer.from(s?.copyrightText || '', 'utf8').toString('hex').substring(0,60));
  console.log('agencyName:', JSON.stringify(s?.agencyName));
  const brand = await prisma.brandSettings.findFirst();
  console.log('brandSiteName:', JSON.stringify(brand?.siteName));
  console.log('brandProfileImage:', brand?.profileImage ? 'SET' : 'EMPTY');
  await prisma.$disconnect();
})();
