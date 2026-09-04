"use client"

import React, { useState, useCallback, useEffect } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface GalleryMediaAsset {
  secureUrl: string
  altText: string | null
}

interface GalleryItem {
  id: string
  caption: string | null
  category: string | null
  captureDate: Date | string | null
  location: string | null
  isFeatured: boolean
  mediaAsset: GalleryMediaAsset
}

interface PublicGalleryProps {
  items: GalleryItem[]
}

export function PublicGallery({ items }: PublicGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index)
    document.body.style.overflow = "hidden"
  }, [])

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null)
    document.body.style.overflow = ""
  }, [])

  const goToPrev = useCallback(() => {
    setLightboxIndex((prev) =>
      prev === null ? null : prev === 0 ? items.length - 1 : prev - 1
    )
  }, [items.length])

  const goToNext = useCallback(() => {
    setLightboxIndex((prev) =>
      prev === null ? null : prev === items.length - 1 ? 0 : prev + 1
    )
  }, [items.length])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return
      if (e.key === "Escape") closeLightbox()
      if (e.key === "ArrowLeft") goToPrev()
      if (e.key === "ArrowRight") goToNext()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [lightboxIndex, closeLightbox, goToPrev, goToNext])

  const currentItem = lightboxIndex !== null ? items[lightboxIndex] : null

  return (
    <>
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="break-inside-avoid cursor-pointer group"
            onClick={() => openLightbox(index)}
          >
            <div className="relative rounded-lg overflow-hidden bg-muted">
              <Image
                src={item.mediaAsset.secureUrl}
                alt={item.mediaAsset.altText || item.caption || ""}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </div>
            {item.caption && (
              <p className="mt-3 text-center text-sm text-muted-foreground italic">
                &ldquo;{item.caption}&rdquo;
              </p>
            )}
          </div>
        ))}
      </div>

      {currentItem && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:text-white/80 z-10"
            onClick={closeLightbox}
          >
            <X className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 sm:left-4 text-white hover:text-white/80 z-10 h-12 w-12"
            onClick={(e) => {
              e.stopPropagation()
              goToPrev()
            }}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>

          <div
            className="max-w-5xl max-h-[90vh] mx-4 sm:mx-8 md:mx-16 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={currentItem.mediaAsset.secureUrl}
              alt={currentItem.mediaAsset.altText || currentItem.caption || ""}
              width={0}
              height={0}
              sizes="100vw"
              className="h-auto w-full max-w-full max-h-[75vh] object-contain rounded-lg"
            />
            {currentItem.caption && (
              <p className="mt-4 text-center text-white text-base sm:text-lg italic">
                &ldquo;{currentItem.caption}&rdquo;
              </p>
            )}
            {currentItem.location && (
              <p className="mt-2 text-center text-white/60 text-xs sm:text-sm">
                {currentItem.location}
              </p>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 sm:right-4 text-white hover:text-white/80 z-10 h-12 w-12"
            onClick={(e) => {
              e.stopPropagation()
              goToNext()
            }}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>

          <div className="absolute bottom-4 text-white/60 text-sm">
            {lightboxIndex! + 1} / {items.length}
          </div>
        </div>
      )}
    </>
  )
}
