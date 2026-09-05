-- AlterTable: Add new fields to AiSettings
ALTER TABLE "AiSettings" ADD COLUMN "statusText" TEXT NOT NULL DEFAULT 'Online';
ALTER TABLE "AiSettings" ADD COLUMN "doctorOnlyScope" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable: AiAssistantKnowledge
CREATE TABLE "AiAssistantKnowledge" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'General',
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiAssistantKnowledge_pkey" PRIMARY KEY ("id")
);
