"use client"

import { useState } from "react"
import useSWR, { useSWRConfig } from "swr"
import { useRenameTag, useDeleteTag } from "@/lib/api-mutations"
import { Button } from "@/components/ui/button"
import { X, Edit2, Trash2, Folder, Check, AlertCircle } from "lucide-react"

const fetcher = (url: string) => {
  const token = localStorage.getItem("qsaver_session_token")
  return fetch(url, {
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  }).then((r) => r.json())
}

export function TagManager({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: tags, mutate } = useSWR<{ name: string; count: number }[]>("/api/save/tags", fetcher)
  const { mutate: globalMutate } = useSWRConfig()
  const { trigger: renameTag } = useRenameTag()
  const { trigger: deleteTag } = useDeleteTag()

  const [editingTag, setEditingTag] = useState<string | null>(null)
  const [newName, setNewName] = useState("")

  if (!open) return null

  const handleRename = async (oldName: string) => {
    if (!newName.trim() || newName === oldName) {
      setEditingTag(null)
      return
    }
    try {
      await renameTag({ oldName, newName })
      mutate()
      globalMutate("/api/save")
      setEditingTag(null)
    } catch (err) {
      alert("Failed to rename tag")
    }
  }

  const handleDelete = async (tag: string) => {
    if (!confirm(`Are you sure you want to delete the tag "${tag}"? Posts will be moved to "General".`)) return
    try {
      await deleteTag({ tag })
      mutate()
      globalMutate("/api/save")
    } catch (err) {
      alert("Failed to delete tag")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b dark:border-zinc-800">
          <h2 className="text-xl font-bold text-foreground">Manage Tags</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition">
            <X className="size-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-4 max-h-[400px] overflow-y-auto">
          {!tags || tags.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Folder className="size-10 mb-2 opacity-20" />
              <p>No tags found.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tags.map((tag) => (
                <div 
                  key={tag.name}
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition"
                >
                  <div className="flex-1 min-w-0 mr-4">
                    {editingTag === tag.name ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="w-full px-2 py-1 text-sm bg-white dark:bg-zinc-800 border rounded outline-none ring-1 ring-blue-500"
                          onKeyDown={(e) => e.key === "Enter" && handleRename(tag.name)}
                        />
                        <button onClick={() => handleRename(tag.name)} className="text-green-600">
                          <Check className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{tag.name}</span>
                        <span className="text-xs text-muted-foreground bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                          {tag.count}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => {
                        setEditingTag(tag.name)
                        setNewName(tag.name)
                      }}
                      className="p-1.5 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                    >
                      <Edit2 className="size-4" />
                    </button>
                    {tag.name !== "General" && (
                      <button 
                        onClick={() => handleDelete(tag.name)}
                        className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 dark:bg-zinc-900/50 border-t dark:border-zinc-800">
          <div className="flex gap-2 text-[11px] text-muted-foreground italic">
            <AlertCircle className="size-3 mt-0.5 shrink-0" />
            <p>Renaming a tag updates all posts associated with it instantly.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
