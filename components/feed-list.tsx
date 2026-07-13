"use client"

import { Search } from "lucide-react"
import type { SaveItem } from "@/lib/saves"
import { cn } from "@/lib/utils"

function KindBadge({ kind }: { kind: SaveItem["kind"] }) {
  return (
    <span
      className={cn(
        "rounded-md px-2 py-0.5 text-xs font-medium",
        kind === "Post"
          ? "bg-blue-50 text-blue-700"
          : "bg-amber-50 text-amber-700",
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
        "w-full rounded-xl border p-4 text-left transition-colors",
        active
          ? "border-primary/40 bg-accent/60 ring-1 ring-primary/20"
          : "border-border bg-card hover:border-primary/30 hover:bg-accent/40",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <KindBadge kind={item.kind} />
        <span className="shrink-0 text-xs text-muted-foreground">
          {item.relative}
        </span>
      </div>
      <h3 className="mt-2.5 text-pretty text-sm font-semibold leading-snug text-foreground">
        {item.title}
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">by {item.author}</p>
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
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
    <div className="flex w-full flex-col border-r border-border bg-background md:w-96 md:shrink-0">
      {/* Sticky search */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 px-4 py-4 backdrop-blur">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search cloud archive or tags..."
            aria-label="Search cloud archive or tags"
            className="w-full rounded-lg border border-input bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
      </div>

      {/* Scrollable list */}
      <div className="flex flex-col gap-2.5 overflow-y-auto p-4">
        <p className="px-1 text-xs font-medium text-muted-foreground">
          {items.length} saved items
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
