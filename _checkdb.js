const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const imgs = await prisma.homeSpotlightImage.findMany({ orderBy: { sortOrder: 'asc' } });
  console.log('Spotlight images:', JSON.stringify(imgs.map(i => ({
    id: i.id,
    mediaUrl: i.mediaUrl ? i.mediaUrl.substring(0,100) : null,
    isVisible: i.isVisible,
    x: i.xPercent, y: i.yPercent,
    w: i.widthPercent, h: i.heightPercent,
    zIndex: i.zIndex,
    rotation: i.rotation,
  })), null, 2));
  const setting = await prisma.homeSpotlightSetting.findFirst();
  console.log('Setting:', JSON.stringify(setting, null, 2));
  const sections = await prisma.homeSection.findMany({ orderBy: { sortOrder: 'asc' } });
  console.log('Sections:', JSON.stringify(sections.map(s => ({ id: s.sectionId, visible: s.isVisible, order: s.sortOrder })), null, 2));
  await prisma.$disconnect();
}
main().catch(e => { console.error(e.message); process.exit(1); });
