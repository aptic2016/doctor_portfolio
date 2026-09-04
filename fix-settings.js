require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const s = await prisma.siteSettings.findFirst();
  await prisma.siteSettings.update({
    where: { id: s.id },
    data: { showAgencyBranding: true }
  });
  console.log('Fixed: showAgencyBranding = true');
  const check = await prisma.siteSettings.findFirst();
  console.log('Verified:', check.showAgencyBranding);
  await prisma.$disconnect();
})();
