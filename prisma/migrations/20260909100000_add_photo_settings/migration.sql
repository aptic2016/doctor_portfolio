-- AlterTable
ALTER TABLE "CvSettings" ADD COLUMN "cvPhotoUrl" TEXT,
ADD COLUMN "photoShape" TEXT NOT NULL DEFAULT 'portrait';
