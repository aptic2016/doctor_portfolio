-- CreateTable
CREATE TABLE "CvSettings" (
    "id" TEXT NOT NULL,
    "resumeEnabled" BOOLEAN NOT NULL DEFAULT false,
    "showInNavigation" BOOLEAN NOT NULL DEFAULT false,
    "publicResumeEnabled" BOOLEAN NOT NULL DEFAULT false,
    "pdfDownloadEnabled" BOOLEAN NOT NULL DEFAULT false,
    "wordDownloadEnabled" BOOLEAN NOT NULL DEFAULT false,
    "activePreset" TEXT NOT NULL DEFAULT 'international_physician',
    "customPresetName" TEXT,
    "showPhotoOnPublic" BOOLEAN NOT NULL DEFAULT false,
    "photoOnPdf" BOOLEAN NOT NULL DEFAULT false,
    "photoOnWord" BOOLEAN NOT NULL DEFAULT false,
    "cvFirstName" TEXT,
    "cvLastName" TEXT,
    "cvPostNominals" TEXT,
    "cvProfessionalTitle" TEXT,
    "cvSpecialty" TEXT,
    "cvEmail" TEXT,
    "cvPhone" TEXT,
    "cvCity" TEXT,
    "cvRegion" TEXT,
    "cvCountry" TEXT,
    "cvWebsite" TEXT,
    "cvLinkedin" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CvSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CvSection" (
    "id" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "customTitle" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "sourceMode" TEXT NOT NULL DEFAULT 'website',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "sortMode" TEXT NOT NULL DEFAULT 'newest_first',
    "isConfigured" BOOLEAN NOT NULL DEFAULT false,
    "publicEnabled" BOOLEAN NOT NULL DEFAULT true,
    "pdfEnabled" BOOLEAN NOT NULL DEFAULT true,
    "docxEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CvSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CvItemOverride" (
    "id" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "cvTitle" TEXT,
    "cvDescription" TEXT,
    "cvBullets" TEXT,
    "cvInstitution" TEXT,
    "cvLocation" TEXT,
    "cvDepartment" TEXT,
    "cvStartDate" TIMESTAMP(3),
    "cvEndDate" TIMESTAMP(3),
    "cvIsCurrent" BOOLEAN,
    "cvSortOrder" INTEGER,
    "hiddenFromCv" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CvItemOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CvCustomEntry" (
    "id" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "institution" TEXT,
    "department" TEXT,
    "location" TEXT,
    "description" TEXT,
    "bullets" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CvCustomEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CvSection_sectionKey_key" ON "CvSection"("sectionKey");

-- CreateIndex
CREATE UNIQUE INDEX "CvItemOverride_sectionKey_sourceType_sourceId_key" ON "CvItemOverride"("sectionKey", "sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "CvItemOverride_sectionKey_idx" ON "CvItemOverride"("sectionKey");

-- CreateIndex
CREATE INDEX "CvCustomEntry_sectionKey_idx" ON "CvCustomEntry"("sectionKey");
