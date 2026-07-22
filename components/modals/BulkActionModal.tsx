"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Tag } from "lucide-react"

interface BulkActionModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (tag: string) => void
  isProcessing: boolean
  count: number
}

export function BulkActionModal({
  open,
  onClose,
  onConfirm,
  isProcessing,
  count
}: BulkActionModalProps) {
  const [newTag, setNewTag] = useState("")

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Tag className="size-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Bulk Update Tag</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition">
            <X className="size-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Enter a new tag for the <strong>{count}</strong> selected items.
          </p>
          <input
            autoFocus
            type="text"
            placeholder="e.g. Research, Ideas..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition"
          />
        </div>

        <div className="flex justify-end gap-3 p-6 border-t dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button 
            onClick={() => onConfirm(newTag || "General")} 
            disabled={isProcessing || !newTag.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isProcessing ? "Updating..." : "Update Tags"}
          </Button>
        </div>
      </div>
    </div>
  )
}
