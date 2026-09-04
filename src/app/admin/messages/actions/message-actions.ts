"use server"

import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { MessageStatus } from "@prisma/client"

export async function updateMessageStatus(id: string, status: string) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  await prisma.contactMessage.update({
    where: { id },
    data: { status: status as MessageStatus },
  })
  revalidatePath("/admin/messages")
  return { success: true }
}

export async function deleteMessage(id: string) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  await prisma.contactMessage.delete({ where: { id } })
  revalidatePath("/admin/messages")
  return { success: true }
}
