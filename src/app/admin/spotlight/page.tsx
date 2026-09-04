import { SpotlightAdmin } from "./spotlight-admin"
import { prisma } from "@/lib/db"

export default async function AdminSpotlightPage() {
  const [setting, images] = await Promise.all([
    prisma.homeSpotlightSetting.findFirst(),
    prisma.homeSpotlightImage.findMany({ orderBy: { sortOrder: "asc" } }),
  ])

  return <SpotlightAdmin initialSetting={setting} initialImages={images} />
}
