-- CreateEnum
CREATE TYPE "EmailDeliveryStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'SKIPPED');

-- AlterTable: SiteSettings
ALTER TABLE "SiteSettings" ADD COLUMN "contactNotificationsEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "SiteSettings" ADD COLUMN "contactNotificationEmail" TEXT;

-- AlterTable: ContactMessage
ALTER TABLE "ContactMessage" ADD COLUMN "emailDeliveryStatus" "EmailDeliveryStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "ContactMessage" ADD COLUMN "emailSentAt" TIMESTAMP(3);
ALTER TABLE "ContactMessage" ADD COLUMN "emailLastError" TEXT;
