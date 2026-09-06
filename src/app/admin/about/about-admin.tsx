"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MediaPicker } from "@/components/admin/media/media-picker"
import { FocalPointPicker } from "@/components/admin/media/focal-point-picker"
import { resolveFocalPosition } from "@/lib/media/focal-point"
import { updateAboutSettings } from "./actions"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"

interface AboutAdminProps {
  profileId: string
  displayName: string
  professionalTitle: string
  aboutImageUrl: string | null
  aboutImageAlt: string | null
  showAboutImage: boolean
  aboutImagePosition: string | null
}

export function AboutAdmin({
  profileId,
  displayName,
  professionalTitle,
  aboutImageUrl: initialAboutImageUrl,
  aboutImageAlt: initialAboutImageAlt,
  showAboutImage: initialShowAboutImage,
  aboutImagePosition: initialAboutImagePosition,
}: AboutAdminProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [aboutImageUrl, setAboutImageUrl] = useState(initialAboutImageUrl || "")
  const [aboutImageAlt, setAboutImageAlt] = useState(initialAboutImageAlt || "")
  const [showAboutImage, setShowAboutImage] = useState(initialShowAboutImage)
  const [aboutImagePosition, setAboutImagePosition] = useState(
    resolveFocalPosition(initialAboutImagePosition),
  )

  const handleSave = async () => {
    setIsSubmitting(true)
    try {
      const result = await updateAboutSettings({
        profileId,
        aboutImageUrl: aboutImageUrl || null,
        aboutImageAlt: aboutImageAlt || null,
        showAboutImage,
        aboutImagePosition: aboutImagePosition || null,
      })
      if (result.success) {
        toast.success("About page updated")
      } else {
        toast.error(result.error || "Failed to update")
      }
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">About Page</h1>
          <p className="text-muted-foreground">Manage the portrait and presentation of your About page.</p>
        </div>
        <Button onClick={handleSave} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      {/* About Image */}
      <Card>
        <CardHeader>
          <CardTitle>About Page Image</CardTitle>
          <CardDescription>Editorial portrait shown on the About page alongside your biography.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Show Image</Label>
              <p className="text-xs text-muted-foreground">Display the portrait on the About page.</p>
            </div>
            <Switch checked={showAboutImage} onCheckedChange={setShowAboutImage} />
          </div>

          <MediaPicker
            value={aboutImageUrl}
            onChange={(url) => setAboutImageUrl(url)}
            label="About Page Portrait"
            purpose="ABOUT_PAGE"
          />

          {aboutImageUrl && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs">Alt Text</Label>
                <Input
                  value={aboutImageAlt}
                  onChange={(e) => setAboutImageAlt(e.target.value)}
                  placeholder="Describe the image for accessibility"
                  className="text-sm"
                />
              </div>

              {/* Crop controls sit beside a preview built at the real 4:5 frame
                  ratio and carrying the same caption the page prints, so the
                  focal choice is judged against what ships. */}
              <div className="flex flex-wrap items-start gap-5">
                <div className="space-y-1.5">
                  <div className="relative w-[104px] overflow-hidden rounded-lg bg-muted aspect-[4/5]">
                    <Image
                      src={aboutImageUrl}
                      alt=""
                      fill
                      sizes="104px"
                      className="object-cover"
                      style={{ objectPosition: aboutImagePosition }}
                    />
                  </div>
                  <div className="w-[104px] text-center">
                    <p className="truncate text-[11px] font-semibold">{displayName}</p>
                    <p className="truncate text-[10px] text-muted-foreground">{professionalTitle}</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground">About page preview</p>
                </div>
                <FocalPointPicker
                  value={aboutImagePosition}
                  onChange={setAboutImagePosition}
                  label="About portrait focal point"
                />
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  setAboutImageUrl("")
                  setAboutImageAlt("")
                }}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Remove Image
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Biography Content</CardTitle>
          <CardDescription>Your biography, philosophy, and career objective are managed in your core profile.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* A real link, styled as a button: it navigates, so assistive tech
              should announce it as a link (and Next handles it client-side). */}
          <Link href="/admin/profile" className={buttonVariants({ variant: "outline" })}>
            Edit Profile &amp; Biography
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
