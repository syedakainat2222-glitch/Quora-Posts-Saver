"use client"

import { ToastType } from "@/lib/use-toast"
import { CheckCircle, XCircle, Info, X, RotateCcw } from "lucide-react"

interface ToastContainerProps {
  toasts: { 
    id: string; 
    message: string; 
    type: ToastType;
    action?: { label: string; onClick: () => void }
  }[]
}

export function ToastContainer({ toasts }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-4 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-md
            animate-in fade-in slide-in-from-right-8 duration-300 pointer-events-auto
            ${
              toast.type === "success"
                ? "bg-green-50/95 border-green-200 text-green-800 dark:bg-green-950/95 dark:border-green-900 dark:text-green-300"
                : toast.type === "error"
                ? "bg-red-50/95 border-red-200 text-red-800 dark:bg-red-950/95 dark:border-red-900 dark:text-red-300"
                : "bg-blue-50/95 border-blue-200 text-blue-800 dark:bg-blue-950/95 dark:border-blue-900 dark:text-blue-300"
            }
          `}
        >
          <div className="flex items-center gap-3">
            {toast.type === "success" && <CheckCircle className="size-5 shrink-0" />}
            {toast.type === "error" && <XCircle className="size-5 shrink-0" />}
            {toast.type === "info" && <Info className="size-5 shrink-0" />}
            <span className="text-sm font-semibold whitespace-nowrap">{toast.message}</span>
          </div>

          {toast.action && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toast.action?.onClick();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg transition-all shadow-sm active:scale-95 uppercase tracking-wider"
            >
              <RotateCcw className="size-3" />
              {toast.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
