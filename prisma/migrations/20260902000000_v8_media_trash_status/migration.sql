-- CreateEnum
CREATE TYPE "MediaAssetStatus" AS ENUM ('ACTIVE', 'TRASHED', 'MISSING');

-- AlterTable: Add status, trashedAt, missingDetectedAt to MediaAsset
ALTER TABLE "MediaAsset" ADD COLUMN "status" "MediaAssetStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "MediaAsset" ADD COLUMN "trashedAt" TIMESTAMP(3);
ALTER TABLE "MediaAsset" ADD COLUMN "missingDetectedAt" TIMESTAMP(3);
