import { useState, useCallback } from "react"
export type ToastType = "success" | "error" | "info"

export interface Toast {
  id: string
  message: string
  type: ToastType
  action?: { label: string; onClick: () => void }
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback(
    (message: string, type: ToastType, action?: { label: string; onClick: () => void }) => {
      const id = Math.random().toString(36).substring(2, 9)
      setToasts((prev) => [...prev, { id, message, type, action }])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 5000)
    },
    []
  )

  return {
    toasts,
    success: (msg: string, action?: { label: string; onClick: () => void }) =>
      addToast(msg, "success", action),
    error: (msg: string, action?: { label: string; onClick: () => void }) =>
      addToast(msg, "error", action),
    info: (msg: string, action?: { label: string; onClick: () => void }) =>
      addToast(msg, "info", action),
  }
}
