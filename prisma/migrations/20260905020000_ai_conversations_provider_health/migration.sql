-- AlterTable: Add provider health fields to AiSettings
ALTER TABLE "AiSettings" ADD COLUMN "lastSuccessAt" TIMESTAMP(3);
ALTER TABLE "AiSettings" ADD COLUMN "lastFailureAt" TIMESTAMP(3);
ALTER TABLE "AiSettings" ADD COLUMN "lastErrorType" TEXT;
ALTER TABLE "AiSettings" ADD COLUMN "lastLatencyMs" INTEGER;

-- AlterTable: Rebuild AiConversation with visitor info
-- First drop the old conversation/message tables (cascade handles messages)
DROP TABLE "AiMessage" CASCADE;
DROP TABLE "AiConversation" CASCADE;

-- CreateTable: New AiConversation
CREATE TABLE "AiConversation" (
    "id" TEXT NOT NULL,
    "visitorName" TEXT NOT NULL,
    "visitorPhone" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "AiConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable: New AiMessage
CREATE TABLE "AiMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" "AiRole" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AiMessage_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "AiMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AiConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
