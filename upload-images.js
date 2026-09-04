const { PrismaClient } = require('@prisma/client');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary from env
require('dotenv').config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient();

async function uploadToCloudinary(filePath, folder, publicIdBase) {
  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload(filePath, {
      folder: folder,
      public_id: publicIdBase,
      overwrite: true,
    }, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
  return result;
}

async function createMediaAsset(result, filename, purpose) {
  return prisma.mediaAsset.upsert({
    where: { publicId: result.public_id },
    update: {
      secureUrl: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      status: 'ACTIVE',
    },
    create: {
      publicId: result.public_id,
      secureUrl: result.secure_url,
      originalFilename: filename,
      displayName: filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      purpose: purpose,
      altText: filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      width: result.width,
      height: result.height,
      format: result.format,
      folder: result.folder || 'portfolio',
      status: 'ACTIVE',
    },
  });
}

async function main() {
  console.log('Uploading images to Cloudinary...');

  // 1. Hero portrait
  console.log('Uploading hero portrait...');
  const heroResult = await uploadToCloudinary('D:\\dr\\hero-portrait.jpg', 'portfolio', 'hero-dr-ayman-rahman');
  const heroAsset = await createMediaAsset(heroResult, 'hero-portrait.jpg', 'HERO');
  console.log('Hero uploaded:', heroResult.public_id);

  // Set as brand profile image
  const brand = await prisma.brandSettings.findFirst();
  if (brand) {
    await prisma.brandSettings.update({
      where: { id: brand.id },
      data: { profileImage: heroResult.secure_url },
    });
    console.log('Brand profileImage set to hero portrait');
  }

  // 2. Gallery images
  const galleryFiles = [
    { file: 'gallery-clinical.jpg', name: 'Clinical Practice', category: 'Clinical Practice' },
    { file: 'gallery-education.jpg', name: 'Medical Education', category: 'Medical Education' },
    { file: 'gallery-conference.jpg', name: 'Medical Conference', category: 'Conference' },
    { file: 'gallery-community.jpg', name: 'Community Health', category: 'Community Health' },
    { file: 'gallery-professional.jpg', name: 'Professional Moments', category: 'Professional Moments' },
  ];

  // Create gallery categories first
  const categories = {};
  for (const cat of galleryFiles.map(g => g.category)) {
    const slug = cat.toLowerCase().replace(/\s+/g, '-');
    const category = await prisma.galleryCategory.upsert({
      where: { slug },
      create: { name: cat, slug },
      update: {},
    });
    categories[cat] = category;
  }
  console.log('Gallery categories created');

  // Upload gallery images
  let sortOrder = 0;
  for (const gal of galleryFiles) {
    console.log(`Uploading gallery: ${gal.name}...`);
    const result = await uploadToCloudinary(`D:\\dr\\${gal.file}`, 'portfolio', `gallery-${gal.name.toLowerCase().replace(/\s+/g, '-')}`);
    const asset = await createMediaAsset(result, gal.file, 'GALLERY');

    await prisma.galleryItem.create({
      data: {
        mediaAssetId: asset.id,
        caption: gal.name,
        category: gal.category,
        isVisible: true,
        isFeatured: sortOrder < 3,
        sortOrder: sortOrder,
      },
    });
    sortOrder++;
    console.log(`  Gallery: ${gal.name} uploaded and created`);
  }

  // 3. Article covers
  const articles = await prisma.article.findMany();
  const coverFiles = ['article-cover1.jpg', 'article-cover2.jpg', 'article-cover3.jpg'];

  for (let i = 0; i < Math.min(3, articles.length); i++) {
    console.log(`Uploading article cover: ${coverFiles[i]}...`);
    const result = await uploadToCloudinary(`D:\\dr\\${coverFiles[i]}`, 'portfolio', `article-cover-${articles[i].slug}`);
    const asset = await createMediaAsset(result, coverFiles[i], 'ARTICLE');

    await prisma.article.update({
      where: { id: articles[i].id },
      data: { coverImage: result.secure_url },
    });
    console.log(`  Article "${articles[i].title.substring(0, 40)}" cover set`);
  }

  console.log('\n=== ALL IMAGES UPLOADED SUCCESSFULLY ===');

  // Verify
  const mediaCount = await prisma.mediaAsset.count();
  const galleryCount = await prisma.galleryItem.count();
  const articlesWithCover = await prisma.article.count({ where: { coverImage: { not: null } } });
  const brandUpdated = await prisma.brandSettings.findFirst();

  console.log('\nVerification:');
  console.log('Media assets:', mediaCount);
  console.log('Gallery items:', galleryCount);
  console.log('Articles with cover:', articlesWithCover);
  console.log('Brand profileImage set:', brandUpdated?.profileImage ? 'YES' : 'NO');
}

main().catch(console.error).finally(() => prisma.$disconnect());
