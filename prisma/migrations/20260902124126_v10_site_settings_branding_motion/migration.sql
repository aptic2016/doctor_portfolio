-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "agencyLabel" TEXT NOT NULL DEFAULT 'Designed & Developed by',
ADD COLUMN     "agencyName" TEXT NOT NULL DEFAULT 'AS TECHNOLOGIES LTD',
ADD COLUMN     "agencyUrl" TEXT,
ADD COLUMN     "connectCue" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "connectCueStyle" TEXT NOT NULL DEFAULT 'hand-tap',
ADD COLUMN     "cursorReactiveEffect" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "heroOverlayEntrance" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "motionLevel" TEXT NOT NULL DEFAULT 'subtle',
ADD COLUMN     "showAgencyBranding" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showDemoBadge" BOOLEAN NOT NULL DEFAULT false;
