"use client"

import { useState, useEffect } from "react"
import { useEditPost } from "@/lib/api-mutations"
import { SaveItem } from "@/lib/saves"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface EditPostModalProps {
  post: SaveItem
  open: boolean
  onClose: () => void
  onSave: () => void
}

export function EditPostModal({ post, open, onClose, onSave }: EditPostModalProps) {
  const [formData, setFormData] = useState({
    title: post.title,
    author: post.author,
    content: post.body.join("\n\n"),
    tag: post.tag,
    type: post.kind
  })

  const { trigger, isMutating } = useEditPost()

  useEffect(() => {
    setFormData({
      title: post.title,
      author: post.author,
      content: post.body.join("\n\n"),
      tag: post.tag,
      type: post.kind
    })
  }, [post])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await trigger({
        id: post.id,
        data: {
          ...formData,
          contentText: formData.content // API expects contentText
        }
      })
      onSave()
      onClose()
    } catch (err) {
      console.error(err)
      alert("Failed to save changes")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b dark:border-zinc-800">
          <h2 className="text-xl font-bold text-foreground">Edit Post</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition">
            <X className="size-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title</label>
              <input
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Author</label>
              <input
                required
                value={formData.author}
                onChange={e => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tag</label>
              <input
                required
                value={formData.tag}
                onChange={e => setFormData({ ...formData, tag: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition"
              >
                <option value="Post">Post</option>
                <option value="Reply">Reply</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Content</label>
            <textarea
              required
              rows={8}
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t dark:border-zinc-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={isMutating}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isMutating}>
              {isMutating ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
