-- AlterTable: SiteSettings — add signature, auto-reply, and favicon fields
ALTER TABLE "SiteSettings" ADD COLUMN "emailSignatureSecondaryTitle" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "emailSignatureMobile" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "emailSignatureAddress" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "emailSignaturePhotoShape" TEXT NOT NULL DEFAULT 'circle';
ALTER TABLE "SiteSettings" ADD COLUMN "emailSignatureBackgroundColor" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "emailSignatureTextColor" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "autoReplyLanguageMode" TEXT NOT NULL DEFAULT 'auto';
ALTER TABLE "SiteSettings" ADD COLUMN "autoReplyEnglishSubject" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "autoReplyBanglaSubject" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "autoReplyEnglishBody" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "autoReplyBanglaBody" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "autoReplyIncludeMessage" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SiteSettings" ADD COLUMN "autoReplyIncludeSignature" BOOLEAN NOT NULL DEFAULT true;
