import { ResumePublic } from "./resume-public"
import { getPublicCvData } from "@/app/admin/resume/actions/cv-actions"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPublicCvData()
  if (!data) return { title: "Resume" }
  const name = [data.identity.firstName, data.identity.lastName, data.identity.postNominals].filter(Boolean).join(" ")
  return {
    title: `${name} — CV / Resume`,
    description: `Professional curriculum vitae of ${name}${data.identity.professionalTitle ? `, ${data.identity.professionalTitle}` : ""}`,
  }
}

export default async function ResumePage() {
  const data = await getPublicCvData()
  if (!data) notFound()
  return <ResumePublic data={data} />
}
