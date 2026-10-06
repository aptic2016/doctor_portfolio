"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { CV_SECTIONS } from "@/lib/cv/sections"
import { getSensitiveFields, type FieldVisibilityMap } from "@/lib/cv/field-privacy"

interface EntryData {
  id?: string
  title: string
  subtitle: string | null
  institution: string | null
  department: string | null
  location: string | null
  description: string | null
  bullets: string | null
  startDate: string | null
  endDate: string | null
  isCurrent: boolean
  sortOrder: number
  isVisible: boolean
  fieldVisibility?: FieldVisibilityMap | null
  [key: string]: unknown
}

interface FormField {
  key: string
  label: string
  type: "text" | "textarea" | "date" | "checkbox" | "select"
  placeholder?: string
  options?: { value: string; label: string }[]
  required?: boolean
  className?: string
  colSpan?: number
}

const SECTION_FORM_FIELDS: Record<string, FormField[]> = {
  medical_licensure: [
    { key: "institution", label: "Licensing Authority", placeholder: "e.g. General Medical Council, State Medical Board", required: true, type: "text" },
    { key: "title", label: "License Type", placeholder: "e.g. Full Registration, Medical License", required: true, type: "text" },
    { key: "subtitle", label: "License Number", placeholder: "e.g. GMC 7432198, MD-12345", type: "text" },
    { key: "location", label: "Jurisdiction / State / Country", placeholder: "e.g. United Kingdom, California, USA", type: "text" },
    { key: "startDate", label: "Issue Date", type: "date" },
    { key: "endDate", label: "Expiry Date", type: "date" },
    { key: "description", label: "Status / Notes", placeholder: "e.g. Active, In Good Standing, unrestricted", type: "textarea" },
  ],
  board_certification: [
    { key: "institution", label: "Certifying Board", placeholder: "e.g. American Board of Internal Medicine", required: true, type: "text" },
    { key: "title", label: "Board Certification", placeholder: "e.g. Diplomate, Board Certified", required: true, type: "text" },
    { key: "subtitle", label: "Subspecialty / Certificate ID", placeholder: "e.g. Cardiovascular Disease, BC-12345", type: "text" },
    { key: "location", label: "Country / Region", placeholder: "e.g. United States", type: "text" },
    { key: "startDate", label: "Date Certified", type: "date" },
    { key: "endDate", label: "Expiry / Recertification Due", type: "date" },
    { key: "description", label: "Status / Notes", placeholder: "e.g. Active, MOC compliant", type: "textarea" },
  ],
  professional_certifications: [
    { key: "institution", label: "Issuing Organization", placeholder: "e.g. Royal College of Physicians", required: true, type: "text" },
    { key: "title", label: "Certification Name", placeholder: "e.g. MRCP, FRCP, FACP", required: true, type: "text" },
    { key: "subtitle", label: "Certificate / Membership ID", placeholder: "e.g. MRCP 12345", type: "text" },
    { key: "location", label: "Country / Region", placeholder: "e.g. United Kingdom", type: "text" },
    { key: "startDate", label: "Date Awarded", type: "date" },
    { key: "endDate", label: "Expiry Date", type: "date" },
    { key: "description", label: "Status / Notes", type: "textarea" },
  ],
  grants: [
    { key: "title", label: "Grant / Project Title", required: true, type: "text", placeholder: "e.g. Novel Biomarkers for Early Detection of..." },
    { key: "institution", label: "Funding Agency", required: true, type: "text", placeholder: "e.g. NIH, Wellcome Trust, British Heart Foundation" },
    { key: "subtitle", label: "Grant / Award Number", placeholder: "e.g. R01-HL123456, WT 204523/Z/16/Z", type: "text" },
    { key: "department", label: "Role / Position", placeholder: "e.g. Principal Investigator, Co-Investigator", type: "text" },
    { key: "location", label: "Institution / Country", placeholder: "e.g. Oxford University, UK", type: "text" },
    { key: "startDate", label: "Start Date", type: "date" },
    { key: "endDate", label: "End Date", type: "date" },
    { key: "description", label: "Amount & Summary", type: "textarea", placeholder: "e.g. $2.5M over 5 years. Investigating novel therapeutic targets for..." },
  ],
  publications: [
    { key: "title", label: "Article / Chapter Title", required: true, type: "textarea", placeholder: "Full title of the publication" },
    { key: "institution", label: "Authors", required: true, type: "text", placeholder: "e.g. Mitchell JS, Patel AN, Williams R" },
    { key: "subtitle", label: "Journal / Publisher", type: "text", placeholder: "e.g. The Lancet, JAMA, Springer" },
    { key: "department", label: "Volume(Issue): Pages", type: "text", placeholder: "e.g. 401(10382): 1145-1153" },
    { key: "location", label: "Year", type: "text", placeholder: "e.g. 2023" },
    { key: "description", label: "DOI", type: "text", placeholder: "e.g. 10.1016/S0140-6736(23)01234-5" },
  ],
  case_reports: [
    { key: "title", label: "Case Report Title", required: true, type: "textarea" },
    { key: "institution", label: "Authors", required: true, type: "text" },
    { key: "subtitle", label: "Journal / Publication", type: "text" },
    { key: "department", label: "Volume(Issue): Pages", type: "text" },
    { key: "location", label: "Year", type: "text" },
    { key: "description", label: "DOI", type: "text" },
  ],
  books: [
    { key: "title", label: "Book Title", required: true, type: "text" },
    { key: "institution", label: "Authors / Editors", required: true, type: "text" },
    { key: "subtitle", label: "Publisher", type: "text" },
    { key: "location", label: "Edition / Year", type: "text" },
    { key: "description", label: "ISBN / DOI", type: "text" },
  ],
  book_chapters: [
    { key: "title", label: "Chapter Title", required: true, type: "text" },
    { key: "institution", label: "Authors", required: true, type: "text" },
    { key: "subtitle", label: "Book Title", type: "text" },
    { key: "department", label: "Publisher", type: "text" },
    { key: "location", label: "Pages / Year", type: "text" },
    { key: "description", label: "DOI", type: "text" },
  ],
  editorials_commentaries: [
    { key: "title", label: "Title", required: true, type: "textarea" },
    { key: "institution", label: "Authors", required: true, type: "text" },
    { key: "subtitle", label: "Journal", type: "text" },
    { key: "location", label: "Year", type: "text" },
    { key: "description", label: "DOI", type: "text" },
  ],
  reviews_guidelines: [
    { key: "title", label: "Title", required: true, type: "textarea" },
    { key: "institution", label: "Authors", required: true, type: "text" },
    { key: "subtitle", label: "Journal / Organization", type: "text" },
    { key: "location", label: "Year", type: "text" },
    { key: "description", label: "DOI", type: "text" },
  ],
  conference_presentations: [
    { key: "title", label: "Presentation Title", required: true, type: "text" },
    { key: "institution", label: "Conference Name", required: true, type: "text", placeholder: "e.g. ACC Scientific Sessions, ESC Congress" },
    { key: "subtitle", label: "Presentation Type", type: "select", options: [
      { value: "oral", label: "Oral Presentation" },
      { value: "poster", label: "Poster Presentation" },
      { value: "keynote", label: "Keynote" },
      { value: "workshop", label: "Workshop" },
      { value: "panel", label: "Panel Discussion" },
      { value: "invited", label: "Invited Talk" },
    ]},
    { key: "location", label: "City, Country", type: "text" },
    { key: "startDate", label: "Date", type: "date" },
    { key: "description", label: "Abstract / Notes", type: "textarea" },
  ],
  invited_lectures: [
    { key: "title", label: "Lecture Title", required: true, type: "text" },
    { key: "institution", label: "Venue / Organization", required: true, type: "text" },
    { key: "subtitle", label: "Event / Series", type: "text", placeholder: "e.g. Grand Rounds, Visiting Professorship" },
    { key: "location", label: "City, Country", type: "text" },
    { key: "startDate", label: "Date", type: "date" },
    { key: "description", label: "Notes", type: "textarea" },
  ],
  memberships: [
    { key: "title", label: "Organization Name", required: true, type: "text", placeholder: "e.g. American College of Cardiology" },
    { key: "subtitle", label: "Membership Grade / Status", type: "select", options: [
      { value: "fellow", label: "Fellow (F)" },
      { value: "member", label: "Member" },
      { value: "associate", label: "Associate Member" },
      { value: "honorary", label: "Honorary Member" },
      { value: "life", label: "Life Member" },
    ]},
    { key: "location", label: "Country", type: "text" },
    { key: "startDate", label: "Year Joined", type: "date" },
    { key: "description", label: "Role / Contribution", type: "textarea" },
  ],
  society_leadership: [
    { key: "title", label: "Organization", required: true, type: "text" },
    { key: "subtitle", label: "Position / Role", required: true, type: "text", placeholder: "e.g. President, Chair, Secretary" },
    { key: "location", label: "Country", type: "text" },
    { key: "startDate", label: "Start Date", type: "date" },
    { key: "endDate", label: "End Date", type: "date" },
    { key: "isCurrent", label: "Currently Serving", type: "checkbox" },
    { key: "description", label: "Key Contributions", type: "textarea" },
  ],
  references: [
    { key: "title", label: "Full Name", required: true, type: "text", placeholder: "e.g. Prof. James Williams, MD, PhD" },
    { key: "subtitle", label: "Title / Position", type: "text", placeholder: "e.g. Professor of Cardiology, Director of Research" },
    { key: "institution", label: "Institution / Hospital", type: "text" },
    { key: "department", label: "Department", type: "text" },
    { key: "location", label: "City, Country", type: "text" },
    { key: "email", label: "Email", type: "text", placeholder: "professional email" },
    { key: "phone", label: "Phone", type: "text", placeholder: "Contact phone" },
    { key: "description", label: "Relationship / Context", type: "textarea", placeholder: "e.g. PhD supervisor, Research collaborator for 10 years" },
  ],
  languages: [
    { key: "title", label: "Language", required: true, type: "text", placeholder: "e.g. English, Spanish, Mandarin" },
    { key: "subtitle", label: "Proficiency Level", type: "select", options: [
      { value: "native", label: "Native / Mother Tongue" },
      { value: "fluent", label: "Fluent" },
      { value: "advanced", label: "Advanced (C1/C2)" },
      { value: "intermediate", label: "Intermediate (B1/B2)" },
      { value: "basic", label: "Basic (A1/A2)" },
    ]},
    { key: "description", label: "Notes", type: "text", placeholder: "e.g. Medical Spanish certification" },
  ],
  teaching_experience: [
    { key: "title", label: "Role / Position", required: true, type: "text", placeholder: "e.g. Clinical Teaching Fellow, Course Director" },
    { key: "institution", label: "Institution / School", required: true, type: "text" },
    { key: "department", label: "Department / Program", type: "text" },
    { key: "location", label: "City, Country", type: "text" },
    { key: "startDate", label: "Start Date", type: "date" },
    { key: "endDate", label: "End Date", type: "date" },
    { key: "isCurrent", label: "Current Position", type: "checkbox" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "bullets", label: "Key Activities (one per line)", type: "textarea", placeholder: "Year 3 clinical skills teaching\nSupervised 12 medical students\nDeveloped new assessment framework" },
  ],
  curriculum_leadership: [
    { key: "title", label: "Role", required: true, type: "text", placeholder: "e.g. Curriculum Director, Module Lead" },
    { key: "institution", label: "Institution", required: true, type: "text" },
    { key: "subtitle", label: "Program / Course", type: "text" },
    { key: "startDate", label: "Start Date", type: "date" },
    { key: "endDate", label: "End Date", type: "date" },
    { key: "isCurrent", label: "Current Role", type: "checkbox" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "bullets", label: "Key Contributions (one per line)", type: "textarea" },
  ],
  mentoring: [
    { key: "title", label: "Mentoring Activity", required: true, type: "text", placeholder: "e.g. PhD Supervision, Residency Mentoring" },
    { key: "institution", label: "Institution", type: "text" },
    { key: "subtitle", label: "Number / Level of Mentees", type: "text", placeholder: "e.g. 5 PhD students, 12 residents" },
    { key: "startDate", label: "Start Date", type: "date" },
    { key: "endDate", label: "End Date", type: "date" },
    { key: "isCurrent", label: "Ongoing", type: "checkbox" },
    { key: "description", label: "Description / Outcomes", type: "textarea" },
  ],
  quality_improvement: [
    { key: "title", label: "QI Project Title", required: true, type: "text" },
    { key: "institution", label: "Institution / Setting", required: true, type: "text" },
    { key: "subtitle", label: "Your Role", type: "text", placeholder: "e.g. Lead, Team Member" },
    { key: "startDate", label: "Date", type: "date" },
    { key: "description", label: "Description & Outcomes", type: "textarea" },
    { key: "bullets", label: "Key Findings / Impact (one per line)", type: "textarea" },
  ],
  clinical_audit: [
    { key: "title", label: "Audit Title", required: true, type: "text" },
    { key: "institution", label: "Institution", required: true, type: "text" },
    { key: "startDate", label: "Date", type: "date" },
    { key: "description", label: "Description & Outcomes", type: "textarea" },
    { key: "bullets", label: "Key Findings (one per line)", type: "textarea" },
  ],
  patient_safety: [
    { key: "title", label: "Activity / Role", required: true, type: "text" },
    { key: "institution", label: "Institution", required: true, type: "text" },
    { key: "startDate", label: "Date", type: "date" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "bullets", label: "Key Contributions (one per line)", type: "textarea" },
  ],
  clinical_experience: [
    { key: "title", label: "Position / Role", required: true, type: "text", placeholder: "e.g. Consultant Cardiologist" },
    { key: "institution", label: "Hospital / Institution", required: true, type: "text" },
    { key: "department", label: "Department", type: "text" },
    { key: "location", label: "City, Country", type: "text" },
    { key: "startDate", label: "Start Date", type: "date" },
    { key: "endDate", label: "End Date", type: "date" },
    { key: "isCurrent", label: "Current Position", type: "checkbox" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "bullets", label: "Key Responsibilities (one per line)", type: "textarea" },
  ],
  hospital_appointments: [
    { key: "title", label: "Position", required: true, type: "text" },
    { key: "institution", label: "Hospital / Institution", required: true, type: "text" },
    { key: "department", label: "Department", type: "text" },
    { key: "location", label: "City, Country", type: "text" },
    { key: "startDate", label: "Start Date", type: "date" },
    { key: "endDate", label: "End Date", type: "date" },
    { key: "isCurrent", label: "Current", type: "checkbox" },
    { key: "description", label: "Description", type: "textarea" },
  ],
  research_experience: [
    { key: "title", label: "Role / Position", required: true, type: "text" },
    { key: "institution", label: "Institution / Lab", required: true, type: "text" },
    { key: "department", label: "Department", type: "text" },
    { key: "location", label: "City, Country", type: "text" },
    { key: "startDate", label: "Start Date", type: "date" },
    { key: "endDate", label: "End Date", type: "date" },
    { key: "isCurrent", label: "Current", type: "checkbox" },
    { key: "description", label: "Description & Focus", type: "textarea" },
    { key: "bullets", label: "Key Projects / Outputs (one per line)", type: "textarea" },
  ],
  research_projects: [
    { key: "title", label: "Project Title", required: true, type: "text" },
    { key: "institution", label: "Institution / Collaborator", type: "text" },
    { key: "subtitle", label: "Role", type: "text" },
    { key: "startDate", label: "Start Date", type: "date" },
    { key: "endDate", label: "End Date", type: "date" },
    { key: "isCurrent", label: "Ongoing", type: "checkbox" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "bullets", label: "Key Aspects (one per line)", type: "textarea" },
  ],
  peer_review: [
    { key: "title", label: "Journal Name", required: true, type: "text" },
    { key: "subtitle", label: "Frequency / Role", type: "text", placeholder: "e.g. Regular reviewer, Editorial board reviewer" },
    { key: "startDate", label: "Start Date", type: "date" },
    { key: "endDate", label: "End Date", type: "date" },
    { key: "isCurrent", label: "Ongoing", type: "checkbox" },
    { key: "description", label: "Notes", type: "textarea" },
  ],
  grant_review: [
    { key: "title", label: "Funding Agency", required: true, type: "text" },
    { key: "subtitle", label: "Role", type: "text", placeholder: "e.g. Panel Member, Ad Hoc Reviewer" },
    { key: "startDate", label: "Start Date", type: "date" },
    { key: "endDate", label: "End Date", type: "date" },
    { key: "isCurrent", label: "Ongoing", type: "checkbox" },
    { key: "description", label: "Notes", type: "textarea" },
  ],
  committee_service: [
    { key: "title", label: "Committee Name", required: true, type: "text" },
    { key: "institution", label: "Institution / Organization", required: true, type: "text" },
    { key: "subtitle", label: "Role", type: "text" },
    { key: "startDate", label: "Start Date", type: "date" },
    { key: "endDate", label: "End Date", type: "date" },
    { key: "isCurrent", label: "Current", type: "checkbox" },
    { key: "description", label: "Description", type: "textarea" },
  ],
  editorial_boards: [
    { key: "title", label: "Journal Name", required: true, type: "text" },
    { key: "subtitle", label: "Role", type: "text", placeholder: "e.g. Editorial Board Member, Associate Editor" },
    { key: "startDate", label: "Start Date", type: "date" },
    { key: "endDate", label: "End Date", type: "date" },
    { key: "isCurrent", label: "Current", type: "checkbox" },
    { key: "description", label: "Notes", type: "textarea" },
  ],
  community_service: [
    { key: "title", label: "Activity / Role", required: true, type: "text" },
    { key: "institution", label: "Organization", type: "text" },
    { key: "startDate", label: "Date", type: "date" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "bullets", label: "Key Activities (one per line)", type: "textarea" },
  ],
  global_health: [
    { key: "title", label: "Activity / Program", required: true, type: "text" },
    { key: "institution", label: "Organization / Country", required: true, type: "text" },
    { key: "startDate", label: "Date", type: "date" },
    { key: "description", label: "Description & Impact", type: "textarea" },
    { key: "bullets", label: "Key Activities (one per line)", type: "textarea" },
  ],
  media_engagement: [
    { key: "title", label: "Title / Topic", required: true, type: "text" },
    { key: "institution", label: "Media Outlet / Platform", type: "text" },
    { key: "subtitle", label: "Type", type: "select", options: [
      { value: "interview", label: "Interview" },
      { value: "article", label: "Article / Op-Ed" },
      { value: "broadcast", label: "TV / Radio Broadcast" },
      { value: "podcast", label: "Podcast" },
      { value: "talk", label: "Public Talk" },
    ]},
    { key: "startDate", label: "Date", type: "date" },
    { key: "description", label: "Description / Link", type: "textarea" },
  ],
  cme_cpd: [
    { key: "title", label: "Activity Title", required: true, type: "text" },
    { key: "institution", label: "Provider / Organization", type: "text" },
    { key: "subtitle", label: "Credits / Hours", type: "text", placeholder: "e.g. 20 CME credits" },
    { key: "startDate", label: "Date", type: "date" },
    { key: "description", label: "Description", type: "textarea" },
  ],
  courses_workshops: [
    { key: "title", label: "Course / Workshop Title", required: true, type: "text" },
    { key: "institution", label: "Provider / Institution", type: "text" },
    { key: "subtitle", label: "Role", type: "text", placeholder: "e.g. Attendee, Instructor" },
    { key: "startDate", label: "Date", type: "date" },
    { key: "description", label: "Description", type: "textarea" },
  ],
  digital_skills: [
    { key: "title", label: "Skill / Tool", required: true, type: "text" },
    { key: "subtitle", label: "Proficiency Level", type: "select", options: [
      { value: "expert", label: "Expert" },
      { value: "advanced", label: "Advanced" },
      { value: "intermediate", label: "Intermediate" },
      { value: "basic", label: "Basic" },
    ]},
    { key: "description", label: "Details / Context", type: "textarea" },
  ],
  volunteer_service: [
    { key: "title", label: "Activity / Role", required: true, type: "text" },
    { key: "institution", label: "Organization", type: "text" },
    { key: "startDate", label: "Start Date", type: "date" },
    { key: "endDate", label: "End Date", type: "date" },
    { key: "isCurrent", label: "Ongoing", type: "checkbox" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "bullets", label: "Key Activities (one per line)", type: "textarea" },
  ],
  patents: [
    { key: "title", label: "Patent Title", required: true, type: "text" },
    { key: "subtitle", label: "Patent / Application Number", type: "text" },
    { key: "institution", label: "Institution / Assignee", type: "text" },
    { key: "startDate", label: "Filing Date", type: "date" },
    { key: "endDate", label: "Grant Date", type: "date" },
    { key: "description", label: "Description / Status", type: "textarea" },
  ],
  advanced_training: [
    { key: "title", label: "Training Title", required: true, type: "text" },
    { key: "institution", label: "Institution / Provider", required: true, type: "text" },
    { key: "startDate", label: "Start Date", type: "date" },
    { key: "endDate", label: "End Date", type: "date" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "bullets", label: "Key Topics (one per line)", type: "textarea" },
  ],
  clinical_expertise: [
    { key: "title", label: "Area of Expertise", required: true, type: "text" },
    { key: "description", label: "Details", type: "textarea" },
  ],
  procedures_skills: [
    { key: "title", label: "Procedure / Skill", required: true, type: "text" },
    { key: "subtitle", label: "Proficiency Level", type: "select", options: [
      { value: "expert", label: "Expert / Proctor" },
      { value: "advanced", label: "Advanced / Independent" },
      { value: "competent", label: "Competent / Supervised" },
      { value: "basic", label: "Basic / Training" },
    ]},
    { key: "description", label: "Details / Volume", type: "textarea" },
  ],
  research_interests: [
    { key: "title", label: "Research Interest", required: true, type: "text" },
    { key: "description", label: "Details", type: "textarea" },
  ],
}

const GENERIC_FIELDS: FormField[] = [
  { key: "title", label: "Title", required: true, type: "text" },
  { key: "subtitle", label: "Subtitle", type: "text" },
  { key: "institution", label: "Institution / Organization", type: "text" },
  { key: "department", label: "Department", type: "text" },
  { key: "location", label: "Location", type: "text" },
  { key: "startDate", label: "Start Date", type: "date" },
  { key: "endDate", label: "End Date", type: "date" },
  { key: "isCurrent", label: "Current / Present", type: "checkbox" },
  { key: "description", label: "Description", type: "textarea" },
  { key: "bullets", label: "Bullet Points (one per line)", type: "textarea" },
]

function getFieldsForSection(sectionKey: string): FormField[] {
  return SECTION_FORM_FIELDS[sectionKey] || GENERIC_FIELDS
}

export function getCvEntryFormType(sectionKey: string): "purpose_built" | "generic" {
  return SECTION_FORM_FIELDS[sectionKey] ? "purpose_built" : "generic"
}

export function CvEntryForm({
  sectionKey,
  initialData,
  onSave,
  onCancel,
}: {
  sectionKey: string
  initialData?: EntryData
  onSave: (data: Record<string, unknown>) => void
  onCancel: () => void
}) {
  const fields = getFieldsForSection(sectionKey)
  const sectionDef = CV_SECTIONS.find((s) => s.key === sectionKey)
  const sensitiveFields = getSensitiveFields(sectionKey)

  const [formData, setFormData] = useState<Record<string, unknown>>(() => {
    const defaults: Record<string, unknown> = {
      title: "", subtitle: "", institution: "", department: "", location: "",
      description: "", bullets: "", startDate: "", endDate: "", isCurrent: false,
      email: "", phone: "",
    }
    if (initialData) {
      defaults.title = initialData.title || ""
      defaults.subtitle = initialData.subtitle || ""
      defaults.institution = initialData.institution || ""
      defaults.department = initialData.department || ""
      defaults.location = initialData.location || ""
      defaults.description = initialData.description || ""
      defaults.bullets = initialData.bullets || ""
      defaults.startDate = initialData.startDate ? initialData.startDate.split("T")[0] : ""
      defaults.endDate = initialData.endDate ? initialData.endDate.split("T")[0] : ""
      defaults.isCurrent = initialData.isCurrent || false
      defaults.email = (initialData as Record<string, unknown>).email || ""
      defaults.phone = (initialData as Record<string, unknown>).phone || ""
    }
    return defaults
  })

  // Field visibility state: { fieldName: { public: bool, pdf: bool, docx: bool } }
  const [fieldVisibility, setFieldVisibility] = useState<FieldVisibilityMap>(() => {
    const initial: FieldVisibilityMap = {}
    for (const def of sensitiveFields) {
      const stored = initialData?.fieldVisibility?.[def.field]
      initial[def.field] = {
        public: stored?.public ?? def.defaults.public,
        pdf: stored?.pdf ?? def.defaults.pdf,
        docx: stored?.docx ?? def.defaults.docx,
      }
    }
    return initial
  })

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || (typeof formData.title === "string" && !formData.title.trim())) {
      return
    }
    onSave({
      ...formData,
      startDate: formData.startDate ? new Date(formData.startDate as string) : null,
      endDate: formData.endDate ? new Date(formData.endDate as string) : null,
      fieldVisibility: Object.keys(fieldVisibility).length > 0 ? fieldVisibility : null,
    })
  }, [formData, fieldVisibility, onSave])

  const updateField = useCallback((key: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }, [])

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="text-sm font-semibold">{sectionDef?.label || sectionKey}</div>
        {sectionDef?.sensitive && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-600 font-medium">Sensitive</span>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((field) => {
          const val = formData[field.key]
          const isHidden = field.key === "endDate" && formData.isCurrent === true

          if (isHidden) return null

          if (field.type === "checkbox") {
            return (
              <div key={field.key} className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  checked={!!val}
                  onChange={(e) => updateField(field.key, e.target.checked)}
                  className="rounded"
                />
                <Label className="text-xs">{field.label}</Label>
              </div>
            )
          }

          if (field.type === "select") {
            return (
              <div key={field.key} className={field.className}>
                <Label className="text-xs">{field.label}{field.required && " *"}</Label>
                <select
                  value={(val as string) || ""}
                  onChange={(e) => updateField(field.key, e.target.value || null)}
                  className="w-full h-8 text-sm border rounded px-2 bg-background"
                >
                  <option value="">Select...</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )
          }

          if (field.type === "textarea") {
            return (
              <div key={field.key} className={cn("sm:col-span-2", field.className)}>
                <Label className="text-xs">{field.label}{field.required && " *"}</Label>
                <Textarea
                  value={(val as string) || ""}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  rows={field.key === "bullets" || field.key === "description" ? 3 : 2}
                  placeholder={field.placeholder}
                  className="text-sm"
                />
              </div>
            )
          }

          return (
            <div key={field.key} className={field.className}>
              <Label className="text-xs">{field.label}{field.required && " *"}</Label>
              <Input
                type={field.type === "date" ? "date" : "text"}
                value={(val as string) || ""}
                onChange={(e) => updateField(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="h-8 text-sm"
              />
            </div>
          )
        })}
      </div>

      {sensitiveFields.length > 0 && (
        <div className="border-t pt-4 mt-4">
          <div className="text-xs font-semibold text-muted-foreground mb-3">OUTPUT VISIBILITY</div>
          <div className="space-y-3">
            {sensitiveFields.map((def) => {
              const vis = fieldVisibility[def.field]
              if (!vis) return null
              return (
                <div key={def.field} className="bg-muted/30 rounded-lg p-3">
                  <div className="text-xs font-medium mb-2">{def.label}</div>
                  <div className="flex flex-col gap-1.5">
                    {(["public", "pdf", "docx"] as const).map((output) => (
                      <label key={output} className="flex items-center justify-between cursor-pointer">
                        <span className="text-[11px] text-muted-foreground capitalize">{output === "docx" ? "Word" : output}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-muted-foreground">{vis[output] ? "On" : "Off"}</span>
                          <Switch
                            checked={vis[output]}
                            onCheckedChange={(checked) => {
                              setFieldVisibility((prev) => ({
                                ...prev,
                                [def.field]: { ...prev[def.field], [output]: checked },
                              }))
                            }}
                          />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button type="submit" size="sm">{initialData?.id ? "Update" : "Add"} Entry</Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}
