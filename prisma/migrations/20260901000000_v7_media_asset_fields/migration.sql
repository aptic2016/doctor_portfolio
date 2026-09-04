-- AlterTable: Add new fields to MediaAsset
ALTER TABLE "MediaAsset" ADD COLUMN "originalFilename" TEXT;
ALTER TABLE "MediaAsset" ADD COLUMN "displayName" TEXT;
ALTER TABLE "MediaAsset" ADD COLUMN "purpose" TEXT NOT NULL DEFAULT 'GENERAL';

-- AlterTable: Add profileImage to BrandSettings
ALTER TABLE "BrandSettings" ADD COLUMN "profileImage" TEXT;
