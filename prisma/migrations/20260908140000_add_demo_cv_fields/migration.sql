-- AlterTable
ALTER TABLE "CvSettings" ADD COLUMN "demoLoaded" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "CvCustomEntry" ADD COLUMN "isDemo" BOOLEAN NOT NULL DEFAULT false;
