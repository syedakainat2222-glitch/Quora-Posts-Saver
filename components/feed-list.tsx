"use client"

import { Search, CheckCircle2, Circle, Trash2, Tag, MoreHorizontal } from "lucide-react"
import type { SaveItem } from "@/lib/saves"
import { cn } from "@/lib/utils"
import { SearchBar } from "./search-bar"
import { SortDropdown, SortOption } from "./sort-dropdown"

function KindBadge({ kind }: { kind: SaveItem["kind"] }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        kind === "Post"
          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
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
  isSelected,
  onToggleSelect,
  isSelectionMode
}: {
  item: SaveItem
  active: boolean
  onSelect: () => void
  isSelected: boolean
  onToggleSelect: (e: React.MouseEvent) => void
  isSelectionMode: boolean
}) {
  return (
    <div className="relative group px-4">
      <div 
        className={cn(
          "absolute left-6 top-1/2 -translate-y-1/2 z-10 transition-all duration-200",
          isSelectionMode ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"
        )}
      >
        <button 
          onClick={onToggleSelect}
          className="p-1 rounded-full hover:bg-white dark:hover:bg-zinc-800 transition shadow-sm"
        >
          {isSelected ? (
            <CheckCircle2 className="size-5 text-blue-600 fill-blue-50" />
          ) : (
            <Circle className="size-5 text-gray-300 dark:text-zinc-600" />
          )}
        </button>
      </div>

      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "w-full rounded-2xl border p-4 text-left transition-all duration-200",
          isSelectionMode ? "pl-12" : "",
          active
            ? "border-blue-200/70 bg-blue-50/60 shadow-md shadow-blue-100/30 ring-1 ring-blue-300/20 dark:border-blue-800/40 dark:bg-blue-950/20 dark:shadow-blue-900/20"
            : "border-gray-200/60 bg-white/70 hover:border-blue-200/40 hover:bg-blue-50/40 hover:shadow-sm dark:border-zinc-700/50 dark:bg-zinc-800/50 dark:hover:border-blue-700/30 dark:hover:bg-blue-900/10",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <KindBadge kind={item.kind} />
          <span className="shrink-0 text-[10px] font-medium text-muted-foreground uppercase">
            {item.relative}
          </span>
        </div>
        <h3 className="mt-2.5 text-pretty text-sm font-semibold leading-snug text-gray-900 dark:text-white line-clamp-2">
          {item.title}
        </h3>
        <div className="mt-1.5 flex items-center gap-1.5">
           <div className="size-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[8px] font-bold text-blue-600">
             {item.author[0]}
           </div>
           <p className="text-[11px] font-medium text-muted-foreground">{item.author}</p>
        </div>
        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400 opacity-80">
          {item.snippet}
        </p>
        
        {item.tag && (
          <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-blue-500 uppercase tracking-tighter">
            <Tag className="size-2.5" />
            {item.tag}
          </div>
        )}
      </button>
    </div>
  )
}

export function FeedList({
  items,
  selectedId,
  onSelect,
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onBulkDelete,
  onBulkTag
}: {
  items: SaveItem[]
  selectedId: string
  onSelect: (id: string) => void
  searchQuery: string
  onSearchChange: (val: string) => void
  sortOption: SortOption
  onSortChange: (opt: SortOption) => void
  selectedIds: string[]
  onToggleSelect: (id: string) => void
  onSelectAll: () => void
  onBulkDelete: () => void
  onBulkTag: () => void
}) {
  const isSelectionMode = selectedIds.length > 0
  const allSelected = items.length > 0 && selectedIds.length === items.length

  return (
    <div className="flex w-full flex-col border-r border-gray-200/60 bg-white/50 backdrop-blur-sm dark:border-zinc-800/60 dark:bg-zinc-900/40 md:w-[400px] md:shrink-0 h-full overflow-hidden">
      {/* Header with Search and Sort */}
      <div className="p-4 space-y-3 border-b border-gray-100 dark:border-zinc-800">
        <div className="flex items-center justify-between">
           <h2 className="text-lg font-bold text-foreground">Library</h2>
           <SortDropdown value={sortOption} onChange={onSortChange} />
        </div>
        <SearchBar value={searchQuery} onChange={onSearchChange} />
      </div>

      {/* Selection Control */}
      {items.length > 0 && (
        <div className="flex items-center justify-between px-6 py-2 bg-gray-50/50 dark:bg-zinc-800/20 border-b border-gray-100 dark:border-zinc-800">
          <button 
            onClick={onSelectAll}
            className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-blue-600 transition"
          >
            {allSelected ? (
              <CheckCircle2 className="size-4 text-blue-600" />
            ) : (
              <Circle className="size-4" />
            )}
            {allSelected ? "Deselect All" : "Select All"}
          </button>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
            {items.length} {items.length === 1 ? "Item" : "Items"}
          </span>
        </div>
      )}

      {/* List Container */}
      <div className="flex-1 overflow-y-auto pt-4 pb-24 space-y-1">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-8">
            <Search className="size-8 text-gray-200 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No matches found</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          items.map((item) => (
            <FeedCard
              key={item.id}
              item={item}
              active={item.id === selectedId}
              onSelect={() => onSelect(item.id)}
              isSelected={selectedIds.includes(item.id)}
              onToggleSelect={(e) => {
                e.stopPropagation()
                onToggleSelect(item.id)
              }}
              isSelectionMode={isSelectionMode}
            />
          ))
        )}
      </div>

      {/* Floating Bulk Action Bar */}
      <div className={cn(
        "absolute bottom-6 left-1/2 -translate-x-1/2 z-30 transition-all duration-300 ease-out",
        isSelectionMode ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12 pointer-events-none"
      )}>
        <div className="flex items-center gap-1 p-1.5 bg-gray-900/95 dark:bg-zinc-800/95 backdrop-blur shadow-2xl rounded-2xl border border-white/10">
          <div className="px-3 py-1.5 mr-2 border-r border-white/10">
            <span className="text-xs font-bold text-white whitespace-nowrap">
              {selectedIds.length} Selected
            </span>
          </div>
          
          <button 
            onClick={onBulkTag}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10 transition"
          >
            <Tag className="size-3.5" />
            Tag
          </button>
          
          <button 
            onClick={onBulkDelete}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition"
          >
            <Trash2 className="size-3.5" />
            Delete
          </button>
          
          <button 
            onClick={() => onSelectAll()}
            className="p-1.5 text-gray-400 hover:text-white transition"
          >
            <MoreHorizontal className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
