import { NextRequest, NextResponse } from "next/server"
import { resolveCvForOutput } from "@/lib/cv/resolver"
import { CV_SECTIONS } from "@/lib/cv/sections"
import { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle, convertInchesToTwip } from "docx"

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return ""
  const date = typeof d === "string" ? new Date(d) : d
  if (isNaN(date.getTime())) return ""
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
}

function dateRange(item: Record<string, unknown>): string {
  const start = formatDate(item.startDate as string | Date | null)
  const end = item.isCurrent ? "Present" : formatDate(item.endDate as string | Date | null)
  if (!start && !end) return ""
  if (!start) return end
  if (!end) return start
  return `${start} — ${end}`
}

function safeStr(v: unknown): string {
  if (typeof v === "string") return v
  if (v == null) return ""
  return String(v)
}

function sanitizeFilename(s: string): string {
  return s.replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 60)
}

export async function GET(request: NextRequest) {
  // Use canonical resolver with output="docx" — respects field-level privacy
  const cvData = await resolveCvForOutput("docx")
  if (!cvData || !cvData.settings.resumeEnabled || !cvData.settings.wordDownloadEnabled) {
    return NextResponse.json({ error: "Word download not available" }, { status: 404 })
  }

  const { identity, sections } = cvData

  const fullName = [identity.firstName, identity.lastName].filter(Boolean).join(" ")

  const children: Paragraph[] = []

  children.push(
    new Paragraph({
      children: [new TextRun({ text: `${fullName}${identity.postNominals ? `, ${identity.postNominals}` : ""}`, bold: true, size: 36, font: "Arial" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
    })
  )
  if (identity.professionalTitle) {
    children.push(new Paragraph({
      children: [new TextRun({ text: identity.professionalTitle, size: 22, font: "Arial" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
    }))
  }
  if (identity.specialty) {
    children.push(new Paragraph({
      children: [new TextRun({ text: identity.specialty, size: 20, font: "Arial", color: "444444" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
    }))
  }
  const contactParts: string[] = []
  if (identity.email) contactParts.push(identity.email)
  if (identity.phone) contactParts.push(identity.phone)
  const location = [identity.city, identity.region, identity.country].filter(Boolean).join(", ")
  if (location) contactParts.push(location)
  if (contactParts.length > 0) {
    children.push(new Paragraph({
      children: [new TextRun({ text: contactParts.join("  |  "), size: 18, font: "Arial", color: "555555" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
    }))
  }
  children.push(new Paragraph({ spacing: { after: 200 } }))

  for (const section of sections) {
    const def = CV_SECTIONS.find((s) => s.key === section.sectionKey)
    const title = section.customTitle || def?.label || section.sectionKey

    if (section.sectionKey === "professional_identity") continue
    if (section.items.length === 0) continue

    children.push(
      new Paragraph({
        children: [new TextRun({ text: title.toUpperCase(), bold: true, size: 24, font: "Arial" })],
        spacing: { before: 240, after: 80 },
        border: { bottom: { color: "CCCCCC", space: 4, style: BorderStyle.SINGLE, size: 1 } },
      })
    )

    if (section.sectionKey === "publications") {
      for (const item of section.items) {
        const d = item.override || item.data
        let citation = `${safeStr(d.authors)}. ${safeStr(d.title)}.`
        if (d.journal) citation += ` ${safeStr(d.journal)}.`
        if (d.volume) citation += ` ${safeStr(d.volume)}`
        if (d.issue) citation += `(${safeStr(d.issue)})`
        if (d.pages) citation += `: ${safeStr(d.pages)}`
        if (d.publicationDate) citation += ` (${formatDate(d.publicationDate as string | Date)}).`
        if (d.doi) citation += ` DOI: ${safeStr(d.doi)}`
        children.push(new Paragraph({
          children: [new TextRun({ text: citation, size: 18, font: "Arial" })],
          spacing: { after: 80 },
        }))
      }
    } else {
      for (const item of section.items) {
        const d = item.data
        const o = item.override
        const itemTitle = safeStr(o?.cvTitle || d.title || d.jobTitle || d.degree)
        const subtitle = safeStr(o?.cvSubtitle || d.subtitle || d.credential)
        const inst = safeStr(o?.cvInstitution || d.institution || d.organization)
        const loc = safeStr(o?.cvLocation || d.location)
        const dept = safeStr(o?.cvDepartment || d.department)
        const desc = safeStr(o?.cvDescription || d.description)
        const bullets = ((o?.cvBullets || d.bullets || d.responsibilities || d.achievements) as string || "").split("\n").map((b: string) => b.trim()).filter(Boolean)
        const dates = dateRange(d)

        const runs: TextRun[] = []
        if (itemTitle) runs.push(new TextRun({ text: itemTitle, bold: true, size: 20, font: "Arial" }))
        if (subtitle) runs.push(new TextRun({ text: `, ${subtitle}`, size: 20, font: "Arial" }))
        if (dates) runs.push(new TextRun({ text: `  ${dates}`, size: 18, font: "Arial", color: "666666" }))
        if (runs.length > 0) children.push(new Paragraph({ children: runs, spacing: { before: 80, after: 40 } }))

        const detailParts = [inst, dept, loc].filter(Boolean)
        if (detailParts.length > 0) {
          children.push(new Paragraph({
            children: [new TextRun({ text: detailParts.join(" — "), size: 18, font: "Arial", color: "444444" })],
            spacing: { after: 40 },
          }))
        }
        const contactParts = [safeStr(d.email as string), safeStr(d.phone as string)].filter(Boolean)
        if (contactParts.length > 0) {
          children.push(new Paragraph({
            children: [new TextRun({ text: contactParts.join("  |  "), size: 18, font: "Arial", color: "555555" })],
            spacing: { after: 40 },
          }))
        }
        if (desc) {
          children.push(new Paragraph({
            children: [new TextRun({ text: desc, size: 18, font: "Arial" })],
            spacing: { after: 40 },
          }))
        }
        for (const b of bullets) {
          children.push(new Paragraph({
            children: [new TextRun({ text: `•  ${b}`, size: 18, font: "Arial" })],
            spacing: { after: 20 },
            indent: { left: convertInchesToTwip(0.3) },
          }))
        }
      }
    }
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: convertInchesToTwip(0.7), bottom: convertInchesToTwip(0.7), left: convertInchesToTwip(0.8), right: convertInchesToTwip(0.8) },
        },
      },
      children,
    }],
  })

  const buffer = await Packer.toBuffer(doc)
  const filename = sanitizeFilename(`${identity.firstName}_${identity.lastName}_CV`)

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}.docx"`,
    },
  })
}
