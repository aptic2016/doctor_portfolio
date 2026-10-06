import { AdminLayout } from "@/components/admin/layout/admin-layout"

// Authenticated admin pages are per-request and DB-backed. Opt the whole /admin
// segment out of build-time prerendering so `next build` never queries the
// production database (avoids Prisma P2024 / pool exhaustion on Vercel).
export const dynamic = "force-dynamic"

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>
}
