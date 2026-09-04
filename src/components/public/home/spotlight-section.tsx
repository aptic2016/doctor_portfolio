"use client"

import React from "react"
import { motion } from "motion/react"
import Link from "next/link"
import { SpotlightCollage, type SpotlightImage, type SpotlightSetting } from "@/components/public/shared/spotlight-collage"

export type { SpotlightImage, SpotlightSetting }

export function SpotlightSection({
  setting,
  images,
}: {
  setting: SpotlightSetting
  images: SpotlightImage[]
}) {
  const visibleImages = images.filter((img) => img.isVisible && img.mediaUrl)
  const hasPhotos = visibleImages.length > 0

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0f2847] via-[#153561] to-[#0d2240] dark:from-[#0f2847] dark:via-[#153561] dark:to-[#0d2240] text-white">
      {/* Background layers */}
      <div className="absolute inset-0">
        {setting.backgroundImage && (
          <>
            <img src={setting.backgroundImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-[#0f2847]" style={{ opacity: setting.backgroundOverlayStrength }} />
          </>
        )}
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }} />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-300/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
      </div>

      <div className="relative mx-auto max-w-screen-xl px-5 sm:px-6 lg:px-8 pt-14 sm:pt-16 lg:pt-20 pb-6 sm:pb-8 lg:pb-10">
        <div className={`grid gap-10 lg:gap-14 items-center ${hasPhotos ? "grid-cols-1 lg:grid-cols-[44%_56%]" : "grid-cols-1 max-w-3xl"}`}>

          {/* LEFT — Content */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="space-y-5"
          >
            {setting.eyebrow && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.08 }}
                className="text-[11px] font-semibold tracking-[0.22em] uppercase text-blue-300/90"
              >
                {setting.eyebrow}
              </motion.p>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.15 }}
              className="text-[28px] sm:text-[36px] lg:text-[clamp(38px,4.2vw,60px)] font-bold leading-[1.12] tracking-tight text-white"
            >
              {setting.heading}
            </motion.h1>

            {setting.supportingText && (
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: 0.28 }}
                className="text-[15px] sm:text-base text-blue-100/65 leading-relaxed max-w-lg"
              >
                {setting.supportingText}
              </motion.p>
            )}

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.38 }}
              className="flex flex-wrap gap-3 pt-1"
            >
              {setting.primaryCtaVisible && (
                <Link
                  href={setting.primaryCtaDestination}
                  className="inline-flex items-center justify-center rounded-lg bg-white text-[#0f2847] px-5 py-2.5 text-sm font-semibold hover:bg-blue-50 transition-colors shadow-[0_2px_12px_rgba(255,255,255,0.12)]"
                >
                  {setting.primaryCtaLabel}
                </Link>
              )}
              {setting.secondaryCtaVisible && (
                <Link
                  href={setting.secondaryCtaDestination}
                  className="inline-flex items-center justify-center rounded-lg border border-white/20 text-white/90 px-5 py-2.5 text-sm font-medium hover:bg-white/8 transition-colors"
                >
                  {setting.secondaryCtaLabel}
                </Link>
              )}
            </motion.div>
          </motion.div>

          {/* RIGHT — Photo Collage */}
          {hasPhotos && (
            <SpotlightCollage
              images={visibleImages}
              collageStyle={setting.collageStyle}
              frameStyle={setting.frameStyle}
              collageHeight={setting.collageHeight}
              animated
            />
          )}

        </div>
      </div>

    </section>
  )
}
