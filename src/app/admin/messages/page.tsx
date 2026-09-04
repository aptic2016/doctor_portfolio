import { MessagesAdmin } from "./messages-admin"
import { contentService } from "@/services/content/content.service"
import type { ContactMessage } from "@prisma/client"

export default async function AdminMessagesPage() {
  let messages: ContactMessage[] = []
  try {
    messages = await contentService.getContactMessages()
  } catch {
    messages = []
  }
  return <MessagesAdmin initialData={messages} />
}
