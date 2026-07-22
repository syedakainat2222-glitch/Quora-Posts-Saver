"use client"

import { Button } from "@/components/ui/button"
import { X, AlertTriangle } from "lucide-react"

interface DeleteConfirmModalProps {
  title: string
  message: string
  open: boolean
  onClose: () => void
  onConfirm: () => void
  isDeleting: boolean
}

export function DeleteConfirmModal({
  title,
  message,
  open,
  onClose,
  onConfirm,
  isDeleting
}: DeleteConfirmModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertTriangle className="size-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-foreground">{title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition">
            <X className="size-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-muted-foreground">{message}</p>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm} 
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  )
}
