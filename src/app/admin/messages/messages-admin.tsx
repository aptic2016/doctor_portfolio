"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Trash2,
  Mail,
  MailOpen,
  Star,
  Archive,
  Search,
  User,
  Phone,
} from "lucide-react"
import { toast } from "sonner"
import {
  updateMessageStatus,
  deleteMessage,
} from "./actions/message-actions"
import { cn } from "@/lib/utils"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

interface Message {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  status: string
  createdAt: Date
}

export function MessagesAdmin({ initialData }: { initialData: Message[] }) {
  const [messages, setMessages] = useState<Message[]>(initialData)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<string>("all")
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateMessageStatus(id, status)
      setMessages(
        messages.map((m) => (m.id === id ? { ...m, status } : m))
      )
      toast.success("Status updated")
    } catch {
      toast.error("Failed to update status")
    }
  }

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    try {
      await deleteMessage(id)
      toast.success("Message deleted")
      setMessages(messages.filter((m) => m.id !== id))
      setSelectedMessage(null)
    } catch {
      toast.error("Failed to delete")
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }

  const filteredMessages = messages.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.subject.toLowerCase().includes(search.toLowerCase())

    if (filter === "all") return matchesSearch
    if (filter === "unread") return matchesSearch && m.status === "UNREAD"
    if (filter === "important") return matchesSearch && m.status === "IMPORTANT"
    if (filter === "archived") return matchesSearch && m.status === "ARCHIVED"
    return matchesSearch
  })

  const unreadCount = messages.filter((m) => m.status === "UNREAD").length

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "UNREAD":
        return <Mail className="h-3 w-3" />
      case "READ":
        return <MailOpen className="h-3 w-3" />
      case "IMPORTANT":
        return <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
      case "ARCHIVED":
        return <Archive className="h-3 w-3" />
      default:
        return null
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case "UNREAD":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      case "READ":
        return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
      case "IMPORTANT":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "ARCHIVED":
        return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">
            Manage contact form submissions.
            {unreadCount > 0 && (
              <span className="ml-2 text-primary font-medium">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {["all", "unread", "important", "archived"].map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMessages.map((msg) => (
                <TableRow
                  key={msg.id}
                  className={cn(
                    "cursor-pointer",
                    msg.status === "UNREAD" && "font-medium"
                  )}
                  onClick={() => {
                    setSelectedMessage(msg)
                    if (msg.status === "UNREAD") {
                      handleStatusChange(msg.id, "READ")
                    }
                  }}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {msg.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{msg.name}</p>
                        <p className="text-xs text-muted-foreground">{msg.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{msg.subject}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit",
                        getStatusClass(msg.status)
                      )}
                    >
                      {getStatusIcon(msg.status)}
                      {msg.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {msg.status !== "IMPORTANT" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStatusChange(msg.id, "IMPORTANT")
                          }}
                          title="Mark as important"
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      {msg.status !== "ARCHIVED" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStatusChange(msg.id, "ARCHIVED")
                          }}
                          title="Archive"
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteTarget(msg.id)
                        }}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredMessages.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-16 text-muted-foreground"
                  >
                    No messages found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-lg">
          {selectedMessage && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedMessage.subject}</DialogTitle>
                <DialogDescription>
                  From {selectedMessage.name} ({selectedMessage.email})
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" /> {selectedMessage.name}
                  </span>
                  <span>{selectedMessage.email}</span>
                  {selectedMessage.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" /> {selectedMessage.phone}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(selectedMessage.createdAt).toLocaleString()}
                </p>
                <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap text-sm">
                  {selectedMessage.message}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSelectedMessage(null)}
                >
                  Close
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteTarget(selectedMessage.id)}
                >
                  Delete
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Delete Message"
        description="Are you sure you want to delete this message? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={isDeleting}
        onConfirm={() => { if (deleteTarget) handleDelete(deleteTarget) }}
      />
    </div>
  )
}
