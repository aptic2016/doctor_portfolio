-- AlterTable
ALTER TABLE "BrandSettings" ADD COLUMN "baseFontSize" TEXT NOT NULL DEFAULT '16px',
ADD COLUMN "footerContactTitle" TEXT NOT NULL DEFAULT 'Connect',
ADD COLUMN "footerDescription" TEXT,
ADD COLUMN "footerNavTitle" TEXT NOT NULL DEFAULT 'Navigation',
ADD COLUMN "headingScale" TEXT NOT NULL DEFAULT '1.25',
ADD COLUMN "heroBackground" TEXT NOT NULL DEFAULT 'grid',
ADD COLUMN "heroBadgeText" TEXT NOT NULL DEFAULT 'Currently Practicing',
ADD COLUMN "heroCvCtaLabel" TEXT NOT NULL DEFAULT 'View CV',
ADD COLUMN "heroMobileLayout" TEXT NOT NULL DEFAULT 'portrait-first',
ADD COLUMN "heroMobilePortraitHeight" TEXT NOT NULL DEFAULT 'balanced',
ADD COLUMN "heroOverlayStyle" TEXT NOT NULL DEFAULT 'glass',
ADD COLUMN "heroPrimaryCtaDest" TEXT NOT NULL DEFAULT '/about',
ADD COLUMN "heroPrimaryCtaLabel" TEXT NOT NULL DEFAULT 'Profile',
ADD COLUMN "heroSecondaryCtaDest" TEXT NOT NULL DEFAULT '/contact',
ADD COLUMN "heroSecondaryCtaLabel" TEXT NOT NULL DEFAULT 'Connect',
ADD COLUMN "heroShowBadge" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "heroShowCvCta" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "heroShowInterests" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "heroShowLocation" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "heroShowQualifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "heroShowWorkplace" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "navFontSize" TEXT NOT NULL DEFAULT '14px',
ADD COLUMN "portraitFit" TEXT NOT NULL DEFAULT 'contain',
ADD COLUMN "portraitFocalX" TEXT NOT NULL DEFAULT '50',
ADD COLUMN "portraitFocalY" TEXT NOT NULL DEFAULT '50',
ADD COLUMN "portraitMaxHeight" TEXT NOT NULL DEFAULT '500px',
ADD COLUMN "portraitScale" TEXT NOT NULL DEFAULT '1',
ADD COLUMN "portraitX" TEXT NOT NULL DEFAULT '0',
ADD COLUMN "portraitY" TEXT NOT NULL DEFAULT '0',
ADD COLUMN "typographyPreset" TEXT NOT NULL DEFAULT 'balanced';

-- AlterTable
ALTER TABLE "HomeSection" ADD COLUMN "eyebrow" TEXT,
ADD COLUMN "heading" TEXT,
ADD COLUMN "sectionNumber" TEXT,
ADD COLUMN "showSectionNumber" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "supportingText" TEXT;

-- AlterTable
ALTER TABLE "NavigationItem" ADD COLUMN "desktopVisible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "icon" TEXT,
ADD COLUMN "mobileVisible" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN "showLocalInfo" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "HighlightMetric" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "label" TEXT NOT NULL,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "valueMode" TEXT NOT NULL DEFAULT 'AUTO',
    "manualValue" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HighlightMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroOverlay" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "valueType" TEXT NOT NULL DEFAULT 'AUTO',
    "customValue" TEXT,
    "valueSource" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "desktopVisible" BOOLEAN NOT NULL DEFAULT true,
    "mobileVisible" BOOLEAN NOT NULL DEFAULT true,
    "desktopX" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "desktopY" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "mobileX" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "mobileY" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "width" TEXT NOT NULL DEFAULT '160px',
    "alignment" TEXT NOT NULL DEFAULT 'left',
    "opacity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "styleVariant" TEXT NOT NULL DEFAULT 'glass',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroOverlay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HighlightMetric_key_key" ON "HighlightMetric"("key");

-- CreateIndex
CREATE UNIQUE INDEX "HeroOverlay_key_key" ON "HeroOverlay"("key");
