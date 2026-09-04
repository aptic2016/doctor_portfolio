/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

async function main() {
  console.log("Seeding V5 hero overlay fields...")

  // 1. Create default hero overlays
  const overlays = [
    { key: "currentRole", label: "Current Role", valueType: "AUTO", valueSource: "currentDesignation", desktopX: 8, desktopY: 28, mobileX: 5, mobileY: 85, sortOrder: 0 },
    { key: "credentials", label: "Credentials", valueType: "AUTO", valueSource: "qualificationCount", desktopX: 78, desktopY: 35, mobileX: 75, mobileY: 10, sortOrder: 1 },
    { key: "location", label: "Location", valueType: "AUTO", valueSource: "location", desktopX: 82, desktopY: 65, mobileX: 5, mobileY: 92, isVisible: false, sortOrder: 2 },
  ]

  for (const o of overlays) {
    await prisma.heroOverlay.upsert({
      where: { key: o.key },
      update: {},
      create: {
        key: o.key,
        label: o.label,
        valueType: o.valueType,
        valueSource: o.valueSource,
        isVisible: o.isVisible ?? true,
        desktopVisible: true,
        mobileVisible: o.key !== "location",
        desktopX: o.desktopX,
        desktopY: o.desktopY,
        mobileX: o.mobileX,
        mobileY: o.mobileY,
        sortOrder: o.sortOrder,
      },
    })
  }

  // 2. Update BrandSettings with hero portrait defaults
  await prisma.brandSettings.updateMany({
    data: {
      portraitScale: "1",
      portraitX: "0",
      portraitY: "0",
      portraitMaxHeight: "500px",
      portraitFit: "contain",
      portraitFocalX: "50",
      portraitFocalY: "50",
      heroBackground: "grid",
      heroOverlayStyle: "glass",
      heroMobileLayout: "portrait-first",
      heroMobilePortraitHeight: "balanced",
    },
  })

  console.log("V5 hero seed complete.")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
