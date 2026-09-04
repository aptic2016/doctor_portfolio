import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, Poppins } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/shared/theme/theme-provider"
import { settingsService } from "@/services/settings/settings.service"
import { AppToaster } from "@/components/shared/app-toaster"
import { seoService } from "@/lib/seo/seo.service"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export const viewport: Viewport = {
  viewportFit: "cover",
}

export async function generateMetadata(): Promise<Metadata> {
  return seoService.generateMetadata({})
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let brandSettings = null
  let themeSettings = null
  try {
    brandSettings = await settingsService.getBrandSettings()
    themeSettings = await settingsService.getThemeSettings()
  } catch {
    // Database unavailable at build time, use defaults
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: brandSettings?.siteName || "Portfolio",
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider brandSettings={brandSettings ?? undefined} themeSettings={themeSettings ?? undefined}>
          {children}
          <AppToaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
