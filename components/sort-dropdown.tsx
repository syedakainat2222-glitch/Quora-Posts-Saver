"use client"

import { ChevronDown, ArrowDownAz, ArrowUpAz, Clock, User } from "lucide-react"
import { useState } from "react"

export type SortOption = "newest" | "oldest" | "title-asc" | "title-desc" | "author"

interface SortDropdownProps {
  value: SortOption
  onChange: (value: SortOption) => void
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  const options = [
    { id: "newest", label: "Newest First", icon: Clock },
    { id: "oldest", label: "Oldest First", icon: Clock },
    { id: "title-asc", label: "A – Z (Title)", icon: ArrowDownAz },
    { id: "title-desc", label: "Z – A (Title)", icon: ArrowUpAz },
    { id: "author", label: "By Author", icon: User },
  ]

  const active = options.find(o => o.id === value) || options[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-700 transition shadow-sm"
      >
        <active.icon className="size-4 text-muted-foreground" />
        <span>{active.label}</span>
        <ChevronDown className={`size-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-xl z-20 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200">
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  onChange(opt.id as SortOption)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  value === opt.id 
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                    : 'text-foreground hover:bg-gray-100 dark:hover:bg-zinc-800'
                }`}
              >
                <opt.icon className="size-4" />
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
