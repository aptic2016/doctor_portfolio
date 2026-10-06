import { ResumeAdmin } from "./resume-admin"
import { getCvSettings, getCvSections } from "./actions/cv-actions"

export default async function AdminResumePage() {
  const [settings, sections] = await Promise.all([
    getCvSettings().catch(() => null),
    getCvSections().catch(() => []),
  ])

  const serializedSettings = settings ? {
    ...settings,
    updatedAt: settings.updatedAt.toISOString(),
  } : null

  const serializedSections = sections.map((s) => ({
    ...s,
    updatedAt: new Date().toISOString(),
  }))

  return <ResumeAdmin initialSettings={serializedSettings as never} initialSections={serializedSections as never} />
}
