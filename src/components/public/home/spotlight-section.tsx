"use client"

import React from "react"
import { motion } from "motion/react"
import { SpotlightBackdrop, SpotlightStage } from "@/components/shared/spotlight/spotlight-stage"
import type { SpotlightImage, SpotlightSetting } from "@/components/shared/spotlight/stage"

export type { SpotlightImage, SpotlightSetting }

/**
 * PUBLIC SPOTLIGHT — renders the saved composition on the shared stage.
 *
 * Both stages are laid out purely by CSS (`width:100%` + `aspect-ratio`), so there
 * is no ResizeObserver, no measured scale and therefore no jitter. The viewport
 * switch is a media query: only one of the two stages is ever displayed, and the
 * hidden one's lazy images are never fetched.
 */
export function SpotlightSection({
  setting,
  images,
}: {
  setting: SpotlightSetting
  images: SpotlightImage[]
}) {
  const hasContent = images.some((img) => img.isVisible && img.mediaUrl) || Boolean(setting.heading)
  if (!hasContent) return null

  return (
    <section className="relative overflow-hidden text-white" data-spotlight-section="">
      <SpotlightBackdrop setting={setting} />

      <div className="relative mx-auto max-w-screen-xl px-5 sm:px-6 lg:px-8 pt-14 sm:pt-16 lg:pt-20 pb-6 sm:pb-8 lg:pb-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Mobile stage — 375 × 500 logical, uses the saved mobile geometry. */}
          <SpotlightStage
            setting={setting}
            images={images}
            viewport="mobile"
            sizing="responsive"
            showBackground={false}
            interactive
            className="md:hidden mx-auto max-w-[460px]"
          />

          {/* Desktop stage — 900 × 500 logical. */}
          <SpotlightStage
            setting={setting}
            images={images}
            viewport="desktop"
            sizing="responsive"
            showBackground={false}
            interactive
            className="hidden md:block"
          />
        </motion.div>
      </div>
    </section>
  )
}
