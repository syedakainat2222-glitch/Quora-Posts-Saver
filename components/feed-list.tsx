"use client"

import { Search } from "lucide-react"
import type { SaveItem } from "@/lib/saves"
import { cn } from "@/lib/utils"

function KindBadge({ kind }: { kind: SaveItem["kind"] }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-medium",
        kind === "Post"
          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
          : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
      )}
    >
      {kind}
    </span>
  )
}

function FeedCard({
  item,
  active,
  onSelect,
}: {
  item: SaveItem
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? "true" : undefined}
      className={cn(
        "w-full rounded-2xl border p-4 text-left transition-all",
        active
          ? "border-blue-200/70 bg-blue-50/60 shadow-md shadow-blue-100/30 ring-1 ring-blue-300/20 dark:border-blue-800/40 dark:bg-blue-950/20 dark:shadow-blue-900/20"
          : "border-gray-200/60 bg-white/70 hover:border-blue-200/40 hover:bg-blue-50/40 hover:shadow-sm dark:border-zinc-700/50 dark:bg-zinc-800/50 dark:hover:border-blue-700/30 dark:hover:bg-blue-900/10",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <KindBadge kind={item.kind} />
        <span className="shrink-0 text-xs text-muted-foreground">
          {item.relative}
        </span>
      </div>
      <h3 className="mt-2.5 text-pretty text-sm font-semibold leading-snug text-gray-900 dark:text-white">
        {item.title}
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">by {item.author}</p>
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
        {item.snippet}
      </p>
    </button>
  )
}

export function FeedList({
  items,
  selectedId,
  onSelect,
}: {
  items: SaveItem[]
  selectedId: string
  onSelect: (id: string) => void
}) {
  return (
    <div className="flex w-full flex-col border-r border-gray-200/60 bg-white/50 backdrop-blur-sm dark:border-zinc-800/60 dark:bg-zinc-900/40 md:w-96 md:shrink-0">
      {/* Sticky search */}
      <div className="sticky top-0 z-10 border-b border-gray-200/60 bg-white/80 px-4 py-4 backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-900/80">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search your library…"
            aria-label="Search"
            className="w-full rounded-xl border border-gray-200/60 bg-white/70 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-300/40 dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-white dark:placeholder:text-zinc-500"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-2.5 overflow-y-auto p-4">
        <p className="px-1 text-xs font-medium text-muted-foreground">
          {items.length} saved {items.length === 1 ? "item" : "items"}
        </p>
        {items.map((item) => (
          <FeedCard
            key={item.id}
            item={item}
            active={item.id === selectedId}
            onSelect={() => onSelect(item.id)}
          />
        ))}
      </div>
    </div>
  )
}
