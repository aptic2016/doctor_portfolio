-- AlterTable
ALTER TABLE "HomeSection" ADD COLUMN     "mediaAltText" TEXT,
ADD COLUMN     "mediaPosition" TEXT NOT NULL DEFAULT '50% 50%',
ADD COLUMN     "mediaUrl" TEXT,
ADD COLUMN     "showMedia" BOOLEAN NOT NULL DEFAULT true;

