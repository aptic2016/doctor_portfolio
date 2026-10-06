-- AlterTable
ALTER TABLE "HomeSection" ADD COLUMN     "frameCustomH" INTEGER,
ADD COLUMN     "frameCustomW" INTEGER,
ADD COLUMN     "frameRatio" TEXT NOT NULL DEFAULT 'original',
ADD COLUMN     "frameSize" TEXT NOT NULL DEFAULT 'medium';
