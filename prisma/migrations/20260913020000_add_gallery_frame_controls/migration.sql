-- AlterTable
ALTER TABLE "GalleryItem" ADD COLUMN     "frameCustomH" INTEGER,
ADD COLUMN     "frameCustomW" INTEGER,
ADD COLUMN     "frameRatio" TEXT NOT NULL DEFAULT 'original',
ADD COLUMN     "frameSize" TEXT NOT NULL DEFAULT 'medium',
ADD COLUMN     "mediaPosition" TEXT NOT NULL DEFAULT '50% 50%',
ADD COLUMN     "objectFit" TEXT NOT NULL DEFAULT 'cover';
