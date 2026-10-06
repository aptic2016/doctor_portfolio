"use client"

import { Mail, Phone, Globe, MapPin, Link2 } from "lucide-react"
import { CV_SECTIONS } from "@/lib/cv/sections"

interface CvIdentity {
  firstName: string; lastName: string; postNominals: string; professionalTitle: string;
  specialty: string; email: string; phone: string; city: string; region: string;
  country: string; website: string; linkedin: string; profileImage: string | null;
  photoUrl: string | null; photoShape: string; showPhotoOnPublic: boolean;
  photoDisplayMode?: string;
}

interface CvItem {
  id: string; source: "website" | "override" | "cv_only";
  data: Record<string, unknown>; override?: Record<string, unknown>;
}

interface CvSectionData {
  sectionKey: string; isVisible: boolean; sourceMode: string; sortOrder: number;
  sortMode: string; publicEnabled: boolean; pdfEnabled: boolean; docxEnabled: boolean;
  customTitle: string | null; items: CvItem[];
}

export interface CvData {
  settings: { pdfDownloadEnabled: boolean; wordDownloadEnabled: boolean; activePreset: string; resumeEnabled?: boolean; publicResumeEnabled?: boolean };
  identity: CvIdentity;
  sections: CvSectionData[];
  socialLinks: Array<{ platform: string; url: string }>;
  preset: string;
}

interface PhysicianResumeViewProps {
  data: CvData;
  mode?: "public" | "admin";
  onEditSection?: (sectionKey: string) => void;
}

/* ── Helpers ── */

function formatDate(d: string | Date | null | undefined): string {
  if (!d) return ""
  const date = typeof d === "string" ? new Date(d) : d
  if (isNaN(date.getTime())) return ""
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
}

function DateRange(item: Record<string, unknown>): string {
  const start = formatDate(item.startDate as string | Date | null)
  const end = item.isCurrent ? "Present" : formatDate(item.endDate as string | Date | null)
  if (!start && !end) return ""
  if (!start) return end
  if (!end) return start
  return `${start} \u2014 ${end}`
}

function ItemTitle(item: Record<string, unknown>, override?: Record<string, unknown>): string {
  return (override?.cvTitle as string) || (item.title as string) || (item.jobTitle as string) || (item.degree as string) || ""
}

function ItemSubtitle(item: Record<string, unknown>, override?: Record<string, unknown>): string {
  return (override?.cvSubtitle as string) || (item.subtitle as string) || (item.credential as string) || ""
}

function ItemInstitution(item: Record<string, unknown>, override?: Record<string, unknown>): string {
  return (override?.cvInstitution as string) || (item.institution as string) || (item.organization as string) || ""
}

function ItemLocation(item: Record<string, unknown>, override?: Record<string, unknown>): string {
  return (override?.cvLocation as string) || (item.location as string) || ""
}

function ItemDepartment(item: Record<string, unknown>, override?: Record<string, unknown>): string {
  return (override?.cvDepartment as string) || (item.department as string) || ""
}

function ItemDescription(item: Record<string, unknown>, override?: Record<string, unknown>): string {
  return (override?.cvDescription as string) || (item.description as string) || ""
}

function ItemBullets(item: Record<string, unknown>, override?: Record<string, unknown>): string[] {
  const raw = (override?.cvBullets as string) || (item.bullets as string) || (item.responsibilities as string) || (item.achievements as string) || ""
  return raw.split("\n").map((b: string) => b.trim()).filter(Boolean)
}

/* ── Section Title Bar (Full Bordered Box) ── */

function SectionTitleBar({ title, sectionKey, onEditSection, mode }: { title: string; sectionKey: string; onEditSection?: (key: string) => void; mode?: "public" | "admin" }) {
  return (
    <div className="flex items-center mb-3">
      <div className="flex-1 border border-black py-1.5 px-3">
        <h2 className="text-xs font-bold text-black uppercase tracking-widest text-center m-0">
          {title}
        </h2>
      </div>
      {mode === "admin" && onEditSection && (
        <button onClick={() => onEditSection(sectionKey)} className="text-xs text-blue-600 hover:underline shrink-0 ml-3 print:hidden">Edit</button>
      )}
    </div>
  )
}

/* ── Identity Hero ── */

function IdentityHero({ identity, sections }: { identity: CvIdentity; settings: CvData["settings"]; sections: CvSectionData[] }) {
  const fullName = ["Dr.", [identity.firstName, identity.lastName].filter(Boolean).join(" ")].filter(Boolean).join(" ")
  const credentials = identity.postNominals || ""
  const location = [identity.city, identity.region, identity.country].filter(Boolean).join(", ")

  const currentAppointments: string[] = []
  for (const section of sections) {
    if (section.sectionKey === "current_clinical_appointments" || section.sectionKey === "current_academic_appointments") {
      for (const item of section.items) {
        const o = item.override
        const title = (o?.cvTitle as string) || (item.data.title as string) || (item.data.jobTitle as string) || ""
        const inst = (o?.cvInstitution as string) || (item.data.institution as string) || (item.data.organization as string) || ""
        const dept = (o?.cvDepartment as string) || (item.data.department as string) || ""
        const loc = (o?.cvLocation as string) || (item.data.location as string) || ""
        const parts = [title, dept, inst, loc].filter(Boolean)
        if (parts.length > 0) currentAppointments.push(parts.join(", "))
      }
    }
  }

  const photoDisplayMode = identity.photoDisplayMode || "photo"
  const photoSrc = identity.photoUrl || identity.profileImage
  const showPassportPhoto = photoDisplayMode === "photo" && photoSrc
  const showEmptySlot = photoDisplayMode === "empty_slot"

  return (
    <section id="professional_identity" className="mb-4">
      {/* Header Row: Name/Contact left, Photo right */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Name */}
          <h1 className="text-xl sm:text-2xl font-bold text-black leading-tight m-0">
            {fullName}
          </h1>

          {/* Credentials + Title */}
          <div className="mt-0.5">
            {credentials && (
              <p className="text-sm font-semibold text-black m-0">{credentials}</p>
            )}
            {identity.professionalTitle && (
              <p className="text-xs text-black mt-0.5 m-0">{identity.professionalTitle}</p>
            )}
            {identity.specialty && (
              <p className="text-xs text-gray-600 mt-0.5 m-0">{identity.specialty}</p>
            )}
          </div>

          {/* Current Appointments */}
          {currentAppointments.length > 0 && (
            <div className="mt-1.5 space-y-0">
              {currentAppointments.map((apt, i) => (
                <div key={i} className="text-xs text-gray-700">{apt}</div>
              ))}
            </div>
          )}

          {/* Contact Row */}
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2 text-xs text-gray-700">
            {identity.phone && (
              <a href={`tel:${identity.phone}`} className="flex items-center gap-1 hover:text-black transition-colors no-underline text-gray-700">
                <Phone className="h-3 w-3 shrink-0" />{identity.phone}
              </a>
            )}
            {identity.email && (
              <a href={`mailto:${identity.email}`} className="flex items-center gap-1 hover:text-black transition-colors no-underline text-gray-700">
                <Mail className="h-3 w-3 shrink-0" />{identity.email}
              </a>
            )}
            {identity.linkedin && (
              <a href={identity.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-black transition-colors no-underline text-gray-700">
                <Link2 className="h-3 w-3 shrink-0" />LinkedIn
              </a>
            )}
            {location && (
              <span className="flex items-center gap-1 text-gray-700">
                <MapPin className="h-3 w-3 shrink-0" />{location}
              </span>
            )}
            {identity.website && (
              <a href={identity.website.startsWith("http") ? identity.website : `https://${identity.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-black transition-colors no-underline text-gray-700">
                <Globe className="h-3 w-3 shrink-0" />{identity.website.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        </div>

        {/* Passport Photo / Empty Slot */}
        {(showPassportPhoto || showEmptySlot) && (
          <div className="shrink-0">
            {/* 35mm x 45mm aspect ratio = 7:9 */}
            <div
              className="border border-black bg-gray-50 flex items-center justify-center overflow-hidden"
              style={{ width: "70px", height: "90px" }}
            >
              {showPassportPhoto && photoSrc && (
                <img
                  src={photoSrc}
                  alt={`${fullName} passport photo`}
                  className="w-full h-full object-cover"
                />
              )}
              {showEmptySlot && (
                <span className="text-[7px] text-gray-400 text-center px-1 leading-tight select-none">Passport<br/>Photo</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Horizontal Rule */}
      <hr className="mt-3 border-t border-black" />
    </section>
  )
}

/* ── CV Item Row ── */

function CvItemRow({ item }: { item: CvItem }) {
  const o = item.override
  const title = ItemTitle(item.data, o)
  const subtitle = ItemSubtitle(item.data, o)
  const institution = ItemInstitution(item.data, o)
  const location = ItemLocation(item.data, o)
  const department = ItemDepartment(item.data, o)
  const description = ItemDescription(item.data, o)
  const bullets = ItemBullets(item.data, o)
  const dateRange = DateRange(item.data)
  const orgLine = [institution, department].filter(Boolean).join(", ")

  return (
    <div className="mb-3">
      {/* Role + Date row */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0">
        <div className="min-w-0">
          {title && <span className="font-bold text-sm text-black">{title}</span>}
          {subtitle && <span className="text-xs text-gray-600 ml-1">{subtitle}</span>}
        </div>
        {dateRange && <span className="text-xs text-gray-600 whitespace-nowrap shrink-0 sm:text-right">{dateRange}</span>}
      </div>

      {/* Institution + Location row */}
      {(orgLine || location) && (
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0">
          <div className="text-xs text-gray-700 min-w-0">{orgLine}</div>
          {location && <span className="text-xs text-gray-600 whitespace-nowrap shrink-0 sm:text-right">{location}</span>}
        </div>
      )}

      {/* Contact info if present */}
      {((item.data.email as string) || (item.data.phone as string)) && (
        <div className="text-xs text-gray-600 mt-0.5">
          {[item.data.email as string, item.data.phone as string].filter(Boolean).join("  |  ")}
        </div>
      )}

      {/* Description */}
      {description && (
        <p className="text-xs text-gray-700 mt-1 leading-relaxed whitespace-pre-line">{description}</p>
      )}

      {/* Bullets */}
      {bullets.length > 0 && (
        <ul className="mt-1 space-y-0 text-xs text-gray-700 list-none p-0 m-0">
          {bullets.map((b: string, i: number) => (
            <li key={i} className="flex gap-1.5 leading-relaxed">
              <span className="text-gray-400 shrink-0">&bull;</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ── Skill Item ── */

function CvSkillItem({ item }: { item: CvItem }) {
  const o = item.override
  const title = ItemTitle(item.data, o)
  const description = ItemDescription(item.data, o)
  const text = description || title
  if (!text) return null
  return (
    <div className="text-xs text-gray-700 flex gap-1.5 leading-relaxed">
      <span className="text-gray-400 shrink-0">&bull;</span>
      <span>{text}</span>
    </div>
  )
}

/* ── CV Section ── */

function CvSection({ section, onEditSection, mode }: {
  section: CvSectionData;
  onEditSection?: (key: string) => void; mode?: "public" | "admin";
}) {
  const def = CV_SECTIONS.find((s) => s.key === section.sectionKey)
  const title = section.customTitle || def?.label || section.sectionKey
  const items = section.items

  if (section.sectionKey === "professional_identity") return null
  if (items.length === 0) return null

  const isSkillsSection = ["clinical_expertise", "procedures_skills", "languages", "digital_skills", "professional_interests"].includes(section.sectionKey)

  return (
    <section className="mb-4" id={section.sectionKey}>
      <SectionTitleBar title={title} sectionKey={section.sectionKey} onEditSection={onEditSection} mode={mode} />
      {isSkillsSection ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-0">
          {items.map((item) => (
            <CvSkillItem key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <CvItemRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  )
}

/* ── Publications Section ── */

function PublicationSection({ section, onEditSection, mode }: {
  section: CvSectionData; onEditSection?: (key: string) => void; mode?: "public" | "admin";
}) {
  const grouped: Record<string, CvItem[]> = {}
  for (const item of section.items) {
    const cat = (item.data.category as string) || "Peer-Reviewed Original Research"
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(item)
  }

  const categoryOrder = [
    "Peer-Reviewed Original Research", "In Press / Accepted", "Reviews / Guidelines / Consensus",
    "Case Reports / Technical Notes", "Books", "Book Chapters", "Editorials / Commentaries / Letters",
  ]

  const sortedCats = Object.keys(grouped).sort((a, b) => {
    const ai = categoryOrder.indexOf(a)
    const bi = categoryOrder.indexOf(b)
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
  })

  const def = CV_SECTIONS.find((s) => s.key === "publications")
  const title = section.customTitle || def?.label || "Publications"

  return (
    <section className="mb-4" id="publications">
      <SectionTitleBar title={title} sectionKey={section.sectionKey} onEditSection={onEditSection} mode={mode} />
      {sortedCats.map((cat) => (
        <div key={cat} className="mb-2">
          <h3 className="text-xs font-bold text-black mb-1">{cat}</h3>
          <div className="space-y-1">
            {grouped[cat].map((item) => {
              const d = item.override || item.data
              const authors = (d.authors as string) || ""
              const pubTitle = (d.title as string) || ""
              const journal = (d.journal as string) || ""
              const year = d.publicationDate ? formatDate(d.publicationDate as string | Date) : ""
              const doi = (d.doi as string) || ""
              const volume = d.volume as string
              const issue = d.issue as string
              const pages = d.pages as string
              const pmid = d.pmid as string
              const pmcid = d.pmcid as string

              return (
                <div key={item.id} className="text-xs text-gray-700 leading-relaxed">
                  <span className="text-black">{authors}</span>. {pubTitle}.{journal && <em> {journal}</em>}
                  {volume && `, ${volume}`}{issue && `(${issue})`}{pages && `: ${pages}`}
                  {year && <span> ({year})</span>}.
                  {doi && <span> DOI: <a href={`https://doi.org/${doi}`} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">{doi}</a></span>}
                  {pmid && <span> PMID: {pmid}</span>}
                  {pmcid && <span> PMCID: {pmcid}</span>}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </section>
  )
}

/* ── Main Shared Component ── */

export function PhysicianResumeView({ data, mode = "public", onEditSection }: PhysicianResumeViewProps) {
  const visibleSections = data.sections.filter((s) => s.publicEnabled && s.items.length > 0 && s.sectionKey !== "professional_identity")
  const hasIdentity = data.identity.firstName || data.identity.lastName

  return (
    <div className="cv-paper bg-white text-black min-h-screen">
      <div className="max-w-[700px] mx-auto px-6 sm:px-10 py-6 sm:py-8">
        {/* Identity Hero */}
        {hasIdentity && <IdentityHero identity={data.identity} settings={data.settings} sections={data.sections} />}

        {/* Sections */}
        {visibleSections.map((section) =>
          section.sectionKey === "publications" ? (
            <PublicationSection key={section.sectionKey} section={section} onEditSection={onEditSection} mode={mode} />
          ) : (
            <CvSection key={section.sectionKey} section={section} onEditSection={onEditSection} mode={mode} />
          )
        )}

        {visibleSections.length === 0 && !hasIdentity && (
          <div className="text-center py-20 text-gray-500">
            <p>No resume content available.</p>
          </div>
        )}
      </div>
    </div>
  )
}
