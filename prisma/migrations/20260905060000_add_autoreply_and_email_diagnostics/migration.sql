-- AlterTable: SiteSettings — add auto-reply config and email diagnostics
ALTER TABLE "SiteSettings" ADD COLUMN "contactEmailLastSuccessAt" TIMESTAMP(3);
ALTER TABLE "SiteSettings" ADD COLUMN "contactEmailLastErrorAt" TIMESTAMP(3);
ALTER TABLE "SiteSettings" ADD COLUMN "contactEmailLastError" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "autoReplyEnabled" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable: ContactMessage — add auto-reply delivery tracking
ALTER TABLE "ContactMessage" ADD COLUMN "autoReplyStatus" "EmailDeliveryStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "ContactMessage" ADD COLUMN "autoReplySentAt" TIMESTAMP(3);
ALTER TABLE "ContactMessage" ADD COLUMN "autoReplyLastError" TEXT;
