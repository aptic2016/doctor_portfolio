"use client"

import React, { useState } from "react"
import { profileSchema, ProfileFormValues } from "@/lib/validators/profile"
import { resolveFocalPosition } from "@/lib/media/focal-point"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { updateProfile } from "./actions/profile-actions"
import { toast } from "sonner"
import type { Profile } from "@prisma/client"

export function ProfileForm({ initialData }: { initialData: Profile }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: initialData.fullName || "",
      displayName: initialData.displayName || "",
      professionalTitle: initialData.professionalTitle || "",
      tagline: initialData.tagline || "",
      shortBio: initialData.shortBio || "",
      fullBio: initialData.fullBio || "",
      currentDesignation: initialData.currentDesignation || "",
      currentOrganization: initialData.currentOrganization || "",
      location: initialData.location || "",
      phone: initialData.phone || "",
      email: initialData.email || "",
      website: initialData.website || "",
      careerObjective: initialData.careerObjective || "",
      philosophy: initialData.philosophy || "",
      quote: initialData.quote || "",
      resumeUrl: initialData.resumeUrl || "",
      aboutImageUrl: initialData.aboutImageUrl || "",
      aboutImageAlt: initialData.aboutImageAlt || "",
      showAboutImage: initialData.showAboutImage ?? true,
      /* These four are edited on the About and Contact screens, not here — the
         form only carries them so a save round-trips them untouched. Seeded
         through the resolver so a row written before the preset set was closed
         cannot make this form unsubmittable. */
      aboutImagePosition: resolveFocalPosition(initialData.aboutImagePosition),
      contactImageUrl: initialData.contactImageUrl || "",
      contactImageAlt: initialData.contactImageAlt || "",
      showContactImage: initialData.showContactImage ?? true,
      contactImagePosition: resolveFocalPosition(initialData.contactImagePosition),
      isVisible: initialData.isVisible ?? true,
      allowAI: initialData.allowAI ?? true,
    },
  })

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true)
    try {
      const result = await updateProfile(data)
      if (result.success) {
        toast.success("Profile updated successfully")
      } else {
        toast.error(result.error || "Failed to update profile")
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
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your public identity and professional details.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>This information is used for your primary identity.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" {...register("fullName")} />
              {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input id="displayName" {...register("displayName")} />
              {errors.displayName && <p className="text-xs text-red-500">{errors.displayName.message}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="professionalTitle">Professional Title</Label>
              <Input id="professionalTitle" {...register("professionalTitle")} />
              {errors.professionalTitle && <p className="text-xs text-red-500">{errors.professionalTitle.message}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input id="tagline" {...register("tagline")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detailed Biography</CardTitle>
            <CardDescription>Describe your professional journey and approach.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="shortBio">Short Biography</Label>
              <Textarea id="shortBio" {...register("shortBio")} rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullBio">Full Biography</Label>
              <Textarea id="fullBio" {...register("fullBio")} rows={6} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Work & Location</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="currentDesignation">Current Designation</Label>
              <Input id="currentDesignation" {...register("currentDesignation")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentOrganization">Current Organization</Label>
              <Input id="currentOrganization" {...register("currentOrganization")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...register("location")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact & Links</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register("phone")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" type="url" {...register("website")} />
              {errors.website && <p className="text-xs text-red-500">{errors.website.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="resumeUrl">Resume URL</Label>
              <Input id="resumeUrl" type="url" {...register("resumeUrl")} />
              {errors.resumeUrl && <p className="text-xs text-red-500">{errors.resumeUrl.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Professional Philosophy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="careerObjective">Career Objective</Label>
              <Textarea id="careerObjective" {...register("careerObjective")} rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="philosophy">Professional Philosophy</Label>
              <Textarea id="philosophy" {...register("philosophy")} rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quote">Favorite Quote</Label>
              <Input id="quote" {...register("quote")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visibility & AI</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Public Visibility</Label>
                <p className="text-sm text-muted-foreground">Whether your profile is visible to the public.</p>
              </div>
              <Controller
                name="isVisible"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow AI Assistant</Label>
                <p className="text-sm text-muted-foreground">Whether the AI assistant can use this data.</p>
              </div>
              <Controller
                name="allowAI"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </form>
    </div>
  )
}
