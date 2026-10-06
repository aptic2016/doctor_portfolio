-- AlterTable: SiteSettings — add email identity and signature fields
ALTER TABLE "SiteSettings" ADD COLUMN "emailSenderNameOverride" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "emailSignatureEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SiteSettings" ADD COLUMN "emailSignatureName" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "emailSignatureTitle" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "emailSignaturePhone" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "emailSignatureEmail" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "emailSignatureWebsite" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "emailSignatureText" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "emailSignatureImageUrl" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "emailSignatureAccent" TEXT NOT NULL DEFAULT '#0ea5e9';

-- CreateTable: EmailReply
CREATE TABLE "EmailReply" (
    "id" TEXT NOT NULL,
    "contactMessageId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "bodyHtml" TEXT,
    "status" "EmailDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "lastError" TEXT,
    "includeSignature" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable: EmailAttachment
CREATE TABLE "EmailAttachment" (
    "id" TEXT NOT NULL,
    "emailReplyId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "cloudinaryPublicId" TEXT,
    "cloudinaryUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailReply_contactMessageId_idx" ON "EmailReply"("contactMessageId");

-- CreateIndex
CREATE INDEX "EmailAttachment_emailReplyId_idx" ON "EmailAttachment"("emailReplyId");

-- AddForeignKey
ALTER TABLE "EmailReply" ADD CONSTRAINT "EmailReply_contactMessageId_fkey" FOREIGN KEY ("contactMessageId") REFERENCES "ContactMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailAttachment" ADD CONSTRAINT "EmailAttachment_emailReplyId_fkey" FOREIGN KEY ("emailReplyId") REFERENCES "EmailReply"("id") ON DELETE CASCADE ON UPDATE CASCADE;
