"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Bot } from "lucide-react"
import { RevealSection } from "@/components/public/shared/use-reveal"
import { SectionHeading } from "@/components/public/shared/section-heading"

export function AiCtaSection({ section }: { section?: { eyebrow?: string | null; heading?: string | null; sectionNumber?: string | null; showSectionNumber?: boolean } }) {
  return (
    <section className="py-14 md:py-18 lg:py-20 section-surface">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto">
          <RevealSection>
            <SectionHeading section={section} defaultEyebrow="Digital Assistant" defaultHeading="AI Insight" />
          </RevealSection>
          <RevealSection>
            <div className="relative p-8 md:p-10 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/[0.03] to-accent/[0.02] overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/[0.04] rounded-full blur-[80px]" />
              <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/10 shrink-0">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-3 flex-1">
                  <h3 className="text-lg font-bold text-foreground">Ask the AI Assistant</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Get instant answers about qualifications, experience, and professional background. The AI assistant provides personalized insights based on verified portfolio data.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <Button className="h-10 px-5 text-sm rounded-lg" onClick={() => { window.location.hash = "ai-assistant-trigger" }}>Start Conversation<ArrowRight className="h-4 w-4 ml-1" /></Button>
                    <Button variant="outline" className="h-10 px-5 text-sm rounded-lg" render={<Link href="/about" />}>Full Profile</Button>
                  </div>
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </div>
    </section>
  )
}
