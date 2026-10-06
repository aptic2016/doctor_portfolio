import { NextRequest, NextResponse } from "next/server"
import { resolveCvForOutput } from "@/lib/cv/resolver"
import { CV_SECTIONS } from "@/lib/cv/sections"
import PDFDocument from "pdfkit"

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
  const cvData = await resolveCvForOutput("pdf")
  if (!cvData || !cvData.settings.resumeEnabled || !cvData.settings.pdfDownloadEnabled) {
    return NextResponse.json({ error: "PDF download not available" }, { status: 404 })
  }

  const { identity, sections } = cvData

  const fullName = [identity.firstName, identity.lastName].filter(Boolean).join(" ")
  const profTitle = identity.professionalTitle
  const specialty = identity.specialty
  const email = identity.email
  const phone = identity.phone
  const location = [identity.city, identity.region, identity.country].filter(Boolean).join(", ")

  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 50, bottom: 50, left: 55, right: 55 },
    info: {
      Title: `${fullName} — CV`,
      Author: fullName,
      Subject: "Curriculum Vitae",
      Creator: "Physician Portfolio System",
    },
  })

  const chunks: Buffer[] = []
  doc.on("data", (chunk: Buffer) => chunks.push(chunk))

  const fontRegular = "Helvetica"
  const fontBold = "Helvetica-Bold"

  doc.font(fontBold).fontSize(18).text(`${fullName}${identity.postNominals ? `, ${identity.postNominals}` : ""}`, { align: "center" })
  doc.moveDown(0.2)
  if (profTitle) doc.font(fontRegular).fontSize(11).text(profTitle, { align: "center" })
  if (specialty) doc.font(fontRegular).fontSize(10).fillColor("#444444").text(specialty, { align: "center" }).fillColor("#000000")
  doc.moveDown(0.3)

  const contactParts: string[] = []
  if (email) contactParts.push(email)
  if (phone) contactParts.push(phone)
  if (location) contactParts.push(location)
  if (contactParts.length > 0) {
    doc.font(fontRegular).fontSize(9).fillColor("#555555").text(contactParts.join("  |  "), { align: "center" }).fillColor("#000000")
  }
  doc.moveDown(0.8)

  doc.moveTo(55, doc.y).lineTo(540, doc.y).strokeColor("#cccccc").lineWidth(0.5).stroke()
  doc.moveDown(0.6)

  for (const section of sections) {
    const def = CV_SECTIONS.find((s) => s.key === section.sectionKey)
    const title = section.customTitle || def?.label || section.sectionKey

    if (section.sectionKey === "professional_identity") continue
    if (section.items.length === 0) continue

    if (doc.y > 700) doc.addPage()

    doc.font(fontBold).fontSize(12).text(title.toUpperCase())
    doc.moveDown(0.2)
    doc.moveTo(55, doc.y).lineTo(540, doc.y).strokeColor("#cccccc").lineWidth(0.3).stroke()
    doc.moveDown(0.4)

    if (section.sectionKey === "publications") {
      for (const item of section.items) {
        const d = item.override || item.data
        const authors = safeStr(d.authors)
        const pubTitle = safeStr(d.title)
        const journal = safeStr(d.journal)
        const year = d.publicationDate ? formatDate(d.publicationDate as string | Date) : ""
        const doi = safeStr(d.doi)
        const volume = safeStr(d.volume)
        const issue = safeStr(d.issue)
        const pages = safeStr(d.pages)

        let citation = `${authors}. ${pubTitle}.`
        if (journal) citation += ` ${journal}.`
        if (volume) citation += ` ${volume}`
        if (issue) citation += `(${issue})`
        if (pages) citation += `: ${pages}`
        if (year) citation += ` (${year}).`
        if (doi) citation += ` DOI: ${doi}`

        doc.font(fontRegular).fontSize(9).text(citation, { lineGap: 1.5 })
        doc.moveDown(0.3)
      }
    } else {
      for (const item of section.items) {
        const d = item.data
        const o = item.override
        const itemTitle = o?.cvTitle || d.title || d.jobTitle || d.degree || ""
        const subtitle = o?.cvSubtitle || d.subtitle || d.credential || ""
        const inst = o?.cvInstitution || d.institution || d.organization || ""
        const loc = o?.cvLocation || d.location || ""
        const dept = o?.cvDepartment || d.department || ""
        const desc = o?.cvDescription || d.description || ""
        const bullets = ((o?.cvBullets || d.bullets || d.responsibilities || d.achievements) as string || "").split("\n").map((b: string) => b.trim()).filter(Boolean)
        const dates = dateRange(d)

        const headerLine = [safeStr(itemTitle), safeStr(subtitle)].filter(Boolean).join(", ")
        const detailLine = [safeStr(inst), safeStr(dept), safeStr(loc)].filter(Boolean).join(" — ")

        if (headerLine) {
          doc.font(fontBold).fontSize(10).text(headerLine, { continued: dates ? true : false, lineGap: 0.5 })
          if (dates) doc.font(fontRegular).fontSize(9).text(`  ${dates}`, { align: "right" })
        }
        if (detailLine) doc.font(fontRegular).fontSize(9).fillColor("#444444").text(detailLine, { lineGap: 0.5 }).fillColor("#000000")
        const contactLine = [safeStr(d.email as string), safeStr(d.phone as string)].filter(Boolean).join("  |  ")
        if (contactLine) doc.font(fontRegular).fontSize(9).fillColor("#555555").text(contactLine, { lineGap: 0.5 }).fillColor("#000000")
        if (desc) doc.font(fontRegular).fontSize(9).text(safeStr(desc), { lineGap: 1 })
        if (bullets.length > 0) {
          for (const b of bullets) {
            doc.font(fontRegular).fontSize(9).text(`    •  ${b}`, { lineGap: 0.5 })
          }
        }
        doc.moveDown(0.5)
      }
    }

    doc.moveDown(0.3)
  }

  doc.end()

  const pdfBuffer = await new Promise<Buffer>((resolve) => {
    doc.on("end", () => {
      resolve(Buffer.concat(chunks))
    })
  })

  const filename = sanitizeFilename(`${identity.firstName}_${identity.lastName}_CV`)

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}.pdf"`,
    },
  })
}
