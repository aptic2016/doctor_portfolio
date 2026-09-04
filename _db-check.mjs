import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()

const setting = await p.homeSpotlightSetting.findFirst()
console.log('collageStyle:', setting?.collageStyle)
console.log('collageHeight:', setting?.collageHeight)

const images = await p.homeSpotlightImage.findMany({ orderBy: { sortOrder: 'asc' } })
for (const img of images) {
  console.log(`  #${img.sortOrder} ${img.altText}: visible=${img.isVisible} x=${img.xPercent} y=${img.yPercent} w=${img.widthPercent} h=${img.heightPercent} rot=${img.rotation} z=${img.zIndex}`)
}

await p.$disconnect()
