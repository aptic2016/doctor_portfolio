"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Search,
} from "lucide-react"
import { toast } from "sonner"
import {
  createArticle,
  updateArticle,
  deleteArticle,
  createCategory,
  createTag,
  type CreateArticleInput,
  type UpdateArticleInput,
} from "./actions/article-actions"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Switch } from "@/components/ui/switch"
import { MediaPicker } from "@/components/admin/media/media-picker"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

const articleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  coverImage: z.string().optional(),
  readingTime: z.coerce.number().optional(),
  isDraft: z.boolean().default(true),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  canonicalUrl: z.string().optional(),
  ogImage: z.string().optional(),
  sortOrder: z.coerce.number().default(0),
  categoryIds: z.array(z.string()).default([]),
  tagIds: z.array(z.string()).default([]),
})

type ArticleFormValues = z.input<typeof articleSchema>

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  coverImage: string | null
  readingTime: number | null
  isDraft: boolean
  isPublished: boolean
  isFeatured: boolean
  publishDate: Date
  sortOrder: number
  createdAt: Date
  updatedAt: Date
  categories: { id: string; name: string }[]
  tags: { id: string; name: string }[]
}

interface Category {
  id: string
  name: string
  slug: string
}

interface Tag {
  id: string
  name: string
  slug: string
}

export function ArticlesAdmin({
  initialArticles,
  initialCategories,
  initialTags,
}: {
  initialArticles: Article[]
  initialCategories: Category[]
  initialTags: Tag[]
}) {
  const [articles, setArticles] = useState<Article[]>(initialArticles)
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [tags, setTags] = useState<Tag[]>(initialTags)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [newCategory, setNewCategory] = useState("")
  const [newTag, setNewTag] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      isDraft: true,
      isPublished: false,
      isFeatured: false,
      sortOrder: 0,
      categoryIds: [],
      tagIds: [],
    },
  })

  const selectedCategoryIds = useWatch({ name: "categoryIds", control })
  const selectedTagIds = useWatch({ name: "tagIds", control })

  const onOpenDialog = (article?: Article) => {
    if (article) {
      setEditingId(article.id)
      reset({
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt || "",
        content: article.content,
        coverImage: article.coverImage || "",
        readingTime: article.readingTime || undefined,
        isDraft: article.isDraft,
        isPublished: article.isPublished,
        isFeatured: article.isFeatured,
        seoTitle: "",
        seoDescription: "",
        canonicalUrl: "",
        ogImage: "",
        sortOrder: article.sortOrder,
        categoryIds: article.categories.map((c) => c.id),
        tagIds: article.tags.map((t) => t.id),
      })
    } else {
      setEditingId(null)
      reset({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        coverImage: "",
        readingTime: undefined,
        isDraft: true,
        isPublished: false,
        isFeatured: false,
        seoTitle: "",
        seoDescription: "",
        canonicalUrl: "",
        ogImage: "",
        sortOrder: 0,
        categoryIds: [],
        tagIds: [],
      })
    }
    setIsDialogOpen(true)
  }

  const onSubmit = async (values: ArticleFormValues) => {
    try {
      if (editingId) {
        await updateArticle(editingId, values as UpdateArticleInput)
        toast.success("Article updated")
      } else {
        await createArticle(values as CreateArticleInput)
        toast.success("Article created")
      }
      window.location.reload()
    } catch {
      toast.error("An error occurred")
    }
  }

  const onDelete = async (id: string) => {
    setIsDeleting(true)
    try {
      await deleteArticle(id)
      toast.success("Article deleted")
      setArticles(articles.filter((a) => a.id !== id))
    } catch {
      toast.error("Failed to delete")
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return
    try {
      const cat = await createCategory(newCategory.trim())
      setCategories([...categories, cat])
      setNewCategory("")
      toast.success("Category added")
    } catch {
      toast.error("Failed to add category")
    }
  }

  const handleAddTag = async () => {
    if (!newTag.trim()) return
    try {
      const tag = await createTag(newTag.trim())
      setTags([...tags, tag])
      setNewTag("")
      toast.success("Tag added")
    } catch {
      toast.error("Failed to add tag")
    }
  }

  const toggleCategory = (id: string) => {
    const current = selectedCategoryIds || []
    const updated = current.includes(id)
      ? current.filter((c) => c !== id)
      : [...current, id]
    setValue("categoryIds", updated)
  }

  const toggleTag = (id: string) => {
    const current = selectedTagIds || []
    const updated = current.includes(id)
      ? current.filter((t) => t !== id)
      : [...current, id]
    setValue("tagIds", updated)
  }

  const filteredArticles = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.slug.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Articles</h1>
          <p className="text-muted-foreground">
            Manage your blog posts and articles.
          </p>
        </div>
        <Button onClick={() => onOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" /> New Article
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredArticles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {article.coverImage && (
                        <div className="h-10 w-10 rounded bg-muted overflow-hidden flex-shrink-0">
                          <img
                            src={article.coverImage}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{article.title}</p>
                        <p className="text-xs text-muted-foreground">
                          /{article.slug}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {article.isPublished ? (
                        <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full flex items-center gap-1">
                          <Eye className="h-3 w-3" /> Published
                        </span>
                      ) : (
                        <span className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-1 rounded-full flex items-center gap-1">
                          <EyeOff className="h-3 w-3" /> Draft
                        </span>
                      )}
                      {article.isFeatured && (
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {article.categories.map((cat) => (
                        <span
                          key={cat.id}
                          className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded"
                        >
                          {cat.name}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(article.publishDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {article.isPublished && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          render={<a href={`/articles/${article.slug}`} target="_blank" />}
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onOpenDialog(article)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600"
                        onClick={() => setDeleteTarget(article.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredArticles.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-16 text-muted-foreground"
                  >
                    No articles found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Article" : "New Article"}
            </DialogTitle>
            <DialogDescription>
              Write and publish your article.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Article title"
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                {...register("slug")}
                placeholder="auto-generated-from-title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                {...register("excerpt")}
                placeholder="Brief summary..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                {...register("content")}
                placeholder="Write your article content here..."
                rows={12}
                className="font-mono text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cover Image</Label>
                <MediaPicker
                  value={useWatch({ name: "coverImage", control }) || ""}
                  onChange={(url) => setValue("coverImage", url)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="readingTime">Reading Time (min)</Label>
                <Input
                  id="readingTime"
                  type="number"
                  {...register("readingTime")}
                  placeholder="5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categories</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                      selectedCategoryIds?.includes(cat.id)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="New category..."
                  className="flex-grow"
                />
                <Button type="button" variant="outline" onClick={handleAddCategory}>
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                      selectedTagIds?.includes(tag.id)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="New tag..."
                  className="flex-grow"
                />
                <Button type="button" variant="outline" onClick={handleAddTag}>
                  Add
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input id="seoTitle" {...register("seoTitle")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoDescription">Meta Description</Label>
                <Input id="seoDescription" {...register("seoDescription")} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="space-y-0.5">
                  <Label>Draft</Label>
                  <p className="text-xs text-muted-foreground">
                    Save as draft (not visible publicly).
                  </p>
                </div>
                <Switch
                  checked={useWatch({ name: "isDraft", control })}
                  onCheckedChange={(checked) => setValue("isDraft", checked)}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="space-y-0.5">
                  <Label>Published</Label>
                  <p className="text-xs text-muted-foreground">
                    Make visible to the public.
                  </p>
                </div>
                <Switch
                  checked={useWatch({ name: "isPublished", control })}
                  onCheckedChange={(checked) => setValue("isPublished", checked)}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="space-y-0.5">
                  <Label>Featured</Label>
                  <p className="text-xs text-muted-foreground">
                    Highlight this article.
                  </p>
                </div>
                <Switch
                  checked={useWatch({ name: "isFeatured", control })}
                  onCheckedChange={(checked) => setValue("isFeatured", checked)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingId ? "Update" : "Create"} Article
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Delete Article"
        description="Are you sure you want to delete this article? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={isDeleting}
        onConfirm={() => { if (deleteTarget) onDelete(deleteTarget) }}
      />
    </div>
  )
}
