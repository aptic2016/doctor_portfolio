-- AlterTable
ALTER TABLE "Profile" ADD COLUMN "aboutImageUrl" TEXT,
ADD COLUMN "aboutImageAlt" TEXT,
ADD COLUMN "showAboutImage" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "aboutImagePosition" TEXT,
ADD COLUMN "contactImageUrl" TEXT,
ADD COLUMN "contactImageAlt" TEXT,
ADD COLUMN "showContactImage" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "contactImagePosition" TEXT;
