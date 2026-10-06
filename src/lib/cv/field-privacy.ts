/**
 * CV Field-Level Output Privacy
 *
 * Each CV entry can have a `fieldVisibility` JSON object that controls
 * which fields are visible in which output (public/pdf/docx).
 *
 * Format: { "fieldName": { "public": bool, "pdf": bool, "docx": bool } }
 *
 * Fields NOT listed in fieldVisibility use section-level defaults.
 * Fields listed but missing a specific output key default to true for that output.
 */

export type CvOutput = "public" | "pdf" | "docx"

export interface FieldVisibilityEntry {
  public: boolean
  pdf: boolean
  docx: boolean
}

export type FieldVisibilityMap = Record<string, FieldVisibilityEntry>

// ── SECTION-SPECIFIC SENSITIVE FIELDS ──
// Only fields listed here are eligible for field-level privacy controls.
// Fields NOT in this list are always visible in all outputs.
// Default values: public=false, pdf=true, docx=true (conservative public, full for downloads).

export interface SensitiveFieldDef {
  /** Field key in the entry data object */
  field: string
  /** Human-readable label for admin UI */
  label: string
  /** Default visibility for each output */
  defaults: FieldVisibilityEntry
}

export const SECTION_SENSITIVE_FIELDS: Record<string, SensitiveFieldDef[]> = {
  medical_licensure: [
    {
      field: "subtitle",
      label: "License Number / Registration ID",
      defaults: { public: false, pdf: true, docx: true },
    },
  ],
  board_certification: [
    {
      field: "subtitle",
      label: "Certificate ID / Number",
      defaults: { public: false, pdf: true, docx: true },
    },
  ],
  professional_certifications: [
    {
      field: "subtitle",
      label: "Certificate / Membership ID",
      defaults: { public: false, pdf: true, docx: true },
    },
  ],
  references: [
    {
      field: "email",
      label: "Reference Email",
      defaults: { public: false, pdf: false, docx: true },
    },
    {
      field: "phone",
      label: "Reference Phone",
      defaults: { public: false, pdf: false, docx: true },
    },
  ],
  grants: [
    {
      field: "description",
      label: "Funding Amount & Details",
      defaults: { public: false, pdf: false, docx: true },
    },
  ],
  clinical_trials: [
    {
      field: "subtitle",
      label: "Trial Identifier (NCT etc.)",
      defaults: { public: false, pdf: true, docx: true },
    },
  ],
  custom: [
    {
      field: "email",
      label: "Contact Email",
      defaults: { public: true, pdf: true, docx: true },
    },
    {
      field: "phone",
      label: "Contact Phone",
      defaults: { public: true, pdf: true, docx: true },
    },
    {
      field: "description",
      label: "Description / Address Content",
      defaults: { public: true, pdf: true, docx: true },
    },
    {
      field: "bullets",
      label: "Personal Details / Bullet Content",
      defaults: { public: true, pdf: true, docx: true },
    },
  ],
}

// ── DEFAULT VISIBILITY FOR NON-SENSITIVE SECTIONS ──
// Sections not in SECTION_SENSITIVE_FIELDS have all fields visible in all outputs.

/**
 * Get the sensitive field definitions for a section.
 * Returns empty array if section has no sensitive fields.
 */
export function getSensitiveFields(sectionKey: string): SensitiveFieldDef[] {
  return SECTION_SENSITIVE_FIELDS[sectionKey] || []
}

/**
 * Check if a section has any sensitive fields defined.
 */
export function hasSensitiveFields(sectionKey: string): boolean {
  return (SECTION_SENSITIVE_FIELDS[sectionKey]?.length || 0) > 0
}

/**
 * Get the effective field visibility for an entry, merged with section defaults.
 * Returns a complete FieldVisibilityMap for all sensitive fields in the section.
 */
export function getEffectiveFieldVisibility(
  sectionKey: string,
  entryFieldVisibility: unknown
): FieldVisibilityMap {
  const sensitiveDefs = getSensitiveFields(sectionKey)
  if (sensitiveDefs.length === 0) return {}

  const stored = (entryFieldVisibility && typeof entryFieldVisibility === "object")
    ? entryFieldVisibility as Record<string, Record<string, unknown>>
    : {}

  const result: FieldVisibilityMap = {}

  for (const def of sensitiveDefs) {
    const storedEntry = stored[def.field]
    if (storedEntry && typeof storedEntry === "object") {
      result[def.field] = {
        public: typeof storedEntry.public === "boolean" ? storedEntry.public : def.defaults.public,
        pdf: typeof storedEntry.pdf === "boolean" ? storedEntry.pdf : def.defaults.pdf,
        docx: typeof storedEntry.docx === "boolean" ? storedEntry.docx : def.defaults.docx,
      }
    } else {
      result[def.field] = { ...def.defaults }
    }
  }

  return result
}

/**
 * Apply field visibility filtering to a data record for a specific output.
 * Returns a new object with restricted fields set to null.
 * Handles both base field names (subtitle) and override-prefixed names (cvSubtitle).
 */
export function applyFieldVisibility(
  data: Record<string, unknown>,
  fieldVisibility: FieldVisibilityMap,
  output: CvOutput
): Record<string, unknown> {
  if (Object.keys(fieldVisibility).length === 0) return data

  const result = { ...data }
  for (const [field, visibility] of Object.entries(fieldVisibility)) {
    if (!visibility[output]) {
      result[field] = null
      // Also null the override-prefixed version (cvSubtitle, cvDescription, etc.)
      const cvKey = `cv${field.charAt(0).toUpperCase()}${field.slice(1)}`
      if (cvKey in result) {
        result[cvKey] = null
      }
    }
  }
  return result
}

/**
 * Parse fieldVisibility from a JSON database column.
 * Returns empty object if null/invalid.
 */
export function parseFieldVisibility(raw: unknown): FieldVisibilityMap {
  if (!raw || typeof raw !== "object") return {}
  const obj = raw as Record<string, unknown>
  const result: FieldVisibilityMap = {}
  for (const [key, val] of Object.entries(obj)) {
    if (val && typeof val === "object" && "public" in (val as Record<string, unknown>)) {
      const v = val as Record<string, unknown>
      result[key] = {
        public: !!v.public,
        pdf: !!v.pdf,
        docx: !!v.docx,
      }
    }
  }
  return result
}
