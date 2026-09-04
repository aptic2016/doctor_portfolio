require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const s = await prisma.siteSettings.findFirst();
  if (s) {
    await prisma.siteSettings.update({
      where: { id: s.id },
      data: {
        copyrightText: '\u00A9 2026 Dr. Ayman Rahman. All rights reserved.',
        agencyName: 'AS',
      }
    });
    console.log('Fixed copyrightText and agencyName');
  }

  // Verify
  const s2 = await prisma.siteSettings.findFirst();
  console.log('copyrightText:', JSON.stringify(s2?.copyrightText));
  console.log('agencyName:', JSON.stringify(s2?.agencyName));

  await prisma.$disconnect();
})();
