"use client"

import { Calendar, ExternalLink, Rocket, Clipboard, User, Edit2, Trash2, Copy, Share2, FileDown } from "lucide-react"
import type { SaveItem } from "@/lib/saves"
import { cn } from "@/lib/utils"

interface ReadingViewProps {
  item: SaveItem
  onEdit: () => void
  onDelete: () => void
  onDuplicate: () => void
  onCopyMarkdown: () => void
  onShare: () => void
}

export function ReadingView({ 
  item, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onCopyMarkdown, 
  onShare 
}: ReadingViewProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col bg-white/50 backdrop-blur-sm dark:bg-zinc-900/40 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-10 sm:px-10 lg:px-14">
        {/* Top Action Bar */}
        <div className="flex items-center justify-end gap-2 mb-8">
           <button 
             onClick={onEdit}
             className="p-2 hover:bg-blue-50 text-muted-foreground hover:text-blue-600 dark:hover:bg-blue-900/20 rounded-xl transition"
             title="Edit Post"
           >
             <Edit2 className="size-4.5" />
           </button>
           <button 
             onClick={onDuplicate}
             className="p-2 hover:bg-indigo-50 text-muted-foreground hover:text-indigo-600 dark:hover:bg-indigo-900/20 rounded-xl transition"
             title="Duplicate Post"
           >
             <Copy className="size-4.5" />
           </button>
           <button 
             onClick={onShare}
             className="p-2 hover:bg-teal-50 text-muted-foreground hover:text-teal-600 dark:hover:bg-teal-900/20 rounded-xl transition"
             title="Copy Link"
           >
             <Share2 className="size-4.5" />
           </button>
           <div className="w-px h-4 bg-gray-200 dark:bg-zinc-800 mx-1" />
           <button 
             onClick={onDelete}
             className="p-2 hover:bg-red-50 text-muted-foreground hover:text-red-600 dark:hover:bg-red-900/20 rounded-xl transition"
             title="Delete Post"
           >
             <Trash2 className="size-4.5" />
           </button>
        </div>

        {/* Header */}
        <header className="border-b border-gray-200/50 pb-8 dark:border-zinc-800/50">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                item.kind === "Post"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
              )}
            >
              {item.kind}
            </span>
            <span className="rounded-full bg-gray-100/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-700 dark:bg-zinc-800/60 dark:text-gray-300">
              {item.tag}
            </span>
          </div>

          <h1 className="mt-6 text-balance text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
            {item.title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-2 font-medium">
              <div className="size-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[10px] font-bold text-blue-700">
                {item.author[0]}
              </div>
              {item.author}
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="size-4 opacity-70" />
              Saved {item.savedAt}
            </span>
            <a
              href={item.sourceUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              <ExternalLink className="size-4" />
              Original Post
            </a>
          </div>
        </header>

        {/* Body */}
        <article className="flex-1 py-10">
          {item.body.map((paragraph, i) => (
            <p
              key={i}
              className="mb-6 text-lg leading-relaxed text-gray-800 dark:text-gray-200 selection:bg-blue-100 selection:text-blue-900"
            >
              {paragraph}
            </p>
          ))}
        </article>

        {/* Footer actions */}
        <footer className="flex flex-col gap-4 border-t border-gray-200/50 pt-8 sm:flex-row dark:border-zinc-800/50 mb-20">
          <button
            type="button"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-500/25 transition hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Rocket className="size-4.5" />
            Publish to Blog
          </button>
          <button
            type="button"
            onClick={onCopyMarkdown}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-200 dark:hover:bg-zinc-700 active:scale-[0.98]"
          >
            <Clipboard className="size-4.5" />
            Copy Markdown
          </button>
        </footer>
      </div>
    </div>
  )
}
