-- AlterTable
ALTER TABLE "AiSettings" ADD COLUMN "onboardingNotice" TEXT DEFAULT 'By continuing, your inquiry may be stored for follow-up.';
ALTER TABLE "AiSettings" ADD COLUMN "showOnboardingNotice" BOOLEAN NOT NULL DEFAULT true;
