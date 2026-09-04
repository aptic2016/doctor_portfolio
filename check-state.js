const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const profile = await prisma.profile.findFirst();
  const brand = await prisma.brandSettings.findFirst();
  const site = await prisma.siteSettings.findFirst();
  const media = await prisma.mediaAsset.findMany();
  const gallery = await prisma.galleryItem.findMany();
  const articles = await prisma.article.findMany();

  console.log('=== CURRENT STATE ===');
  console.log('Profile:', profile?.fullName);
  console.log('Brand profileImage:', brand?.profileImage || 'EMPTY');
  console.log('Agency branding:', site?.showAgencyBranding);
  console.log('Media assets:', media.length);
  console.log('Gallery items:', gallery.length);
  console.log('Articles:', articles.length);
  
  for (const m of media) {
    console.log(`  Media: ${m.publicId} | ${m.purpose} | ${m.secureUrl?.substring(0, 50)}`);
  }
  for (const g of gallery) {
    console.log(`  Gallery: ${g.title} | ${g.imageUrl?.substring(0, 50)}`);
  }
  for (const a of articles) {
    console.log(`  Article: ${a.title?.substring(0, 40)} | cover: ${a.coverImage || 'NONE'}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
