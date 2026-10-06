-- AlterTable: Add fieldVisibility JSON column to CvCustomEntry and CvItemOverride
-- This stores per-field, per-output visibility controls for sensitive physician data.
-- Format: { "fieldName": { "public": bool, "pdf": bool, "docx": bool } }
-- NULL or missing fields use safe defaults defined in code.

ALTER TABLE "CvCustomEntry" ADD COLUMN "fieldVisibility" JSONB;

ALTER TABLE "CvItemOverride" ADD COLUMN "fieldVisibility" JSONB;
