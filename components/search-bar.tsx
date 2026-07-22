"use client"

import { Search, X } from "lucide-react"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <Search className="size-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
      </div>
      <input
        type="text"
        placeholder="Search your library..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-100/50 dark:bg-zinc-800/50 border border-transparent focus:border-blue-500/50 focus:bg-white dark:focus:bg-zinc-900 px-10 py-2.5 rounded-xl text-sm outline-none transition-all placeholder:text-muted-foreground/70"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-foreground text-muted-foreground transition-colors"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
