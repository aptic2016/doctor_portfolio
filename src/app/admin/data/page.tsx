import { DataPageClient } from "./data-page-client"
import { getDataStats } from "./actions/data-actions"

export default async function DataPage() {
  const result = await getDataStats()
  const stats = result.success && result.stats ? result.stats : null

  return <DataPageClient initialStats={stats} />
}
