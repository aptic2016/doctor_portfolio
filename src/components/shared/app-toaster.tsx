"use client"

import { Toaster } from "@/components/ui/toast"
import { Toaster as SonnerToaster } from "sonner"

export function AppToaster() {
  return (
    <>
      <Toaster />
      <SonnerToaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          style: {
            marginTop: "70px",
          },
        }}
      />
    </>
  )
}
