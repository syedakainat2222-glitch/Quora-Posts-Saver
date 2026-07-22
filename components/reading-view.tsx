"use client"

import { Calendar, ExternalLink, Rocket, Clipboard, User } from "lucide-react"
import type { SaveItem } from "@/lib/saves"
import { cn } from "@/lib/utils"

export function ReadingView({ item }: { item: SaveItem }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col bg-white/50 backdrop-blur-sm dark:bg-zinc-900/40">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-10 sm:px-10 lg:px-14">
        {/* Header */}
        <header className="border-b border-gray-200/50 pb-8 dark:border-zinc-800/50">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-medium",
                item.kind === "Post"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
              )}
            >
              {item.kind}
            </span>
            <span className="rounded-full bg-gray-100/80 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-zinc-800/60 dark:text-gray-300">
              {item.tag}
            </span>
          </div>

          <h1 className="mt-4 text-balance text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
            {item.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="size-4" />
              {item.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="size-4" />
              Saved {item.savedAt}
            </span>
            <a
              href={item.sourceUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <ExternalLink className="size-4" />
              Source
            </a>
          </div>
        </header>

        {/* Body */}
        <article className="flex-1 py-8">
          {item.body.map((paragraph, i) => (
            <p
              key={i}
              className="mb-6 text-lg leading-relaxed text-gray-800 dark:text-gray-200"
            >
              {paragraph}
            </p>
          ))}
        </article>

        {/* Footer actions */}
        <footer className="flex flex-col gap-3 border-t border-gray-200/50 pt-6 sm:flex-row dark:border-zinc-800/50">
          <button
            type="button"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-blue-500/20 transition hover:shadow-blue-500/30 hover:scale-[1.02]"
          >
            <Rocket className="size-4" />
            Export to Blog
          </button>
          <button
            type="button"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200/60 bg-white/70 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100/60 dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-gray-300 dark:hover:bg-zinc-700/60"
          >
            <Clipboard className="size-4" />
            Copy Markdown
          </button>
        </footer>
      </div>
    </div>
  )
}
