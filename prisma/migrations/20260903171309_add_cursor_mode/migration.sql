-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "cursorMode" TEXT NOT NULL DEFAULT 'normal',
ALTER COLUMN "agencyName" SET DEFAULT 'AS';
