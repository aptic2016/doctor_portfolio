require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const s = await prisma.siteSettings.findFirst();
  console.log('showAgencyBranding:', s?.showAgencyBranding);
  console.log('agencyName:', s?.agencyName);
  console.log('agencyLabel:', s?.agencyLabel);
  console.log('agencyUrl:', s?.agencyUrl);
  console.log('motionLevel:', s?.motionLevel);
  console.log('cursorReactiveEffect:', s?.cursorReactiveEffect);
  console.log('cursorMode:', s?.cursorMode);
  console.log('heroOverlayEntrance:', s?.heroOverlayEntrance);
  console.log('connectCue:', s?.connectCue);
  await prisma.$disconnect();
})();
