"use client"

import { useState } from "react"
import useSWR from "swr"
import { Sidebar } from "@/components/sidebar"
import { FeedList } from "@/components/feed-list"
import { ReadingView } from "@/components/reading-view"
import type { SaveItem, SaveKind } from "@/lib/saves"

type ApiRow = {
  id: number | string
  title: string
  author: string
  content: string
  url: string
  tag: string
  type: string
  created_at: string
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ""
  const diff = Date.now() - then
  const min = Math.floor(diff / 60000)
  if (min < 1) return "Just now"
  if (min < 60) return `${min}m ago`
  const hrs = Math.floor(min / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  return `${weeks}w ago`
}

function normalize(row: ApiRow): SaveItem {
  const content = row.content ?? ""
  const paragraphs = content
    .split(/\n{2,}|\n/)
    .map((p) => p.trim())
    .filter(Boolean)
  return {
    id: String(row.id),
    kind: (row.type === "Reply" ? "Reply" : "Post") as SaveKind,
    title: row.title,
    author: row.author || "Unknown Author",
    savedAt: new Date(row.created_at).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    relative: relativeTime(row.created_at),
    tag: row.tag || "General",
    sourceUrl: row.url || "",
    snippet: content.slice(0, 160) + (content.length > 160 ? "…" : ""),
    body: paragraphs.length ? paragraphs : [content],
  }
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function Page() {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data, error, isLoading } = useSWR<ApiRow[]>("/api/save", fetcher, {
    refreshInterval: 5000,
  })

  const saves: SaveItem[] = Array.isArray(data) ? data.map(normalize) : []
  const selected =
    saves.find((s) => s.id === selectedId) ?? saves[0] ?? null

  if (isLoading) {
    return (
      <main className="flex h-dvh items-center justify-center overflow-hidden text-muted-foreground">
        Loading your cloud archive…
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex h-dvh items-center justify-center overflow-hidden text-muted-foreground">
        Could not reach the cloud archive. Please try again.
      </main>
    )
  }

  if (saves.length === 0) {
    return (
      <main className="flex h-dvh overflow-hidden">
        <Sidebar className="hidden lg:flex" />
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
          <p className="text-lg font-semibold text-foreground">
            No saved posts yet
          </p>
          <p className="max-w-sm text-sm text-muted-foreground text-pretty">
            Save a Quora post or reply from the browser extension and it will
            appear here automatically.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex h-dvh overflow-hidden">
      <Sidebar className="hidden lg:flex" />
      <FeedList
        items={saves}
        selectedId={selected ? selected.id : ""}
        onSelect={setSelectedId}
      />
      {selected ? <ReadingView item={selected} /> : null}
    </main>
  )
}
