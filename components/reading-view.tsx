"use client"

import { Calendar, ExternalLink, Rocket, Clipboard, User } from "lucide-react"
import type { SaveItem } from "@/lib/saves"
import { cn } from "@/lib/utils"

export function ReadingView({ item }: { item: SaveItem }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col bg-background">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-10 sm:px-10 lg:px-14">
        {/* Article header */}
        <header className="border-b border-border pb-8">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "rounded-md px-2 py-0.5 text-xs font-medium",
                item.kind === "Post"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-amber-50 text-amber-700",
              )}
            >
              {item.kind}
            </span>
            <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
              {item.tag}
            </span>
          </div>

          <h1 className="mt-4 text-balance text-3xl font-bold leading-tight tracking-tight text-foreground">
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
              href="#"
              className="flex items-center gap-1.5 text-primary transition-colors hover:text-primary/80"
            >
              <ExternalLink className="size-4" />
              {item.sourceUrl}
            </a>
          </div>
        </header>

        {/* Article body */}
        <article className="flex-1 py-8">
          {item.body.map((paragraph, i) => (
            <p
              key={i}
              className="mb-6 text-lg leading-relaxed text-foreground/90"
            >
              {paragraph}
            </p>
          ))}
        </article>

        {/* CTA footer */}
        <footer className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row">
          <button
            type="button"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Rocket className="size-4" />
            Export to Blog (WordPress/Medium)
          </button>
          <button
            type="button"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <Clipboard className="size-4" />
            Copy Markdown
          </button>
        </footer>
      </div>
    </div>
  )
}
