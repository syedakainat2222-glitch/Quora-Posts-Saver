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
  const [currentTab, setCurrentTab] = useState<string>("All Saves")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const { data, error, isLoading } = useSWR<ApiRow[]>("/api/save", fetcher, {
    refreshInterval: 5000,
  })

  const saves: SaveItem[] = Array.isArray(data) ? data.map(normalize) : []

  // Filter items by tag if a specific tag is clicked/active
  const displayedSaves = selectedTag 
    ? saves.filter(s => s.tag.toLowerCase() === selectedTag.toLowerCase())
    : saves

  const selected =
    displayedSaves.find((s) => s.id === selectedId) ?? displayedSaves[0] ?? null

  if (isLoading) {
    return (
      <main className="flex h-dvh items-center justify-center overflow-hidden text-muted-foreground bg-background">
        Loading your cloud archive…
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex h-dvh items-center justify-center overflow-hidden text-muted-foreground bg-background">
        Could not reach the cloud archive. Please try again.
      </main>
    )
  }

  // Helper function to handle custom navigation triggers
  const handleTabChange = (tabName: string, tagName: string | null = null) => {
    setCurrentTab(tabName)
    setSelectedTag(tagName)
    setSelectedId(null) // reset item selection when jumping tabs
  }

  return (
    <main className="flex h-dvh overflow-hidden w-full bg-background text-foreground">
      <Sidebar 
        className="hidden lg:flex" 
        currentTab={currentTab} 
        onTabChange={handleTabChange}
        selectedTag={selectedTag}
      />
      
      {/* ROUTER PANEL CONTENT */}
      {currentTab === "All Saves" && (
        <>
          {displayedSaves.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
              <p className="text-lg font-semibold text-foreground">
                {selectedTag ? `No items in ${selectedTag}` : "No saved posts yet"}
              </p>
              <p className="max-w-sm text-sm text-muted-foreground text-pretty">
                {selectedTag 
                  ? "You haven't added any clips under this specific collection category filter yet."
                  : "Save a Quora post or reply from the browser extension and it will appear here automatically."}
              </p>
            </div>
          ) : (
            <div className="flex flex-1 overflow-hidden">
              <FeedList
                items={displayedSaves}
                selectedId={selected ? selected.id : ""}
                onSelect={setSelectedId}
              />
              {selected ? <ReadingView item={selected} /> : null}
            </div>
          )}
        </>
      )}

      {currentTab === "Folders/Tags" && (
        <div className="flex-1 p-10 overflow-y-auto bg-card border-l border-border">
          <h1 className="text-2xl font-bold text-foreground mb-2">📁 Folders / Tags Archive</h1>
          <p className="text-sm text-muted-foreground mb-8">Manage your curated tags or click a collection folder in the sidebar panel to slice your workspace.</p>
          <div className="p-8 border border-dashed border-border rounded-xl text-center max-w-xl text-muted-foreground text-sm">
            Tag organization controls and automated folder sorting structures will load in version 1.3 updates. Use the sidebar to filter clips.
          </div>
        </div>
      )}

      {currentTab === "Connected Blogs" && (
        <div className="flex-1 p-10 overflow-y-auto bg-card border-l border-border">
          <h1 className="text-2xl font-bold text-foreground mb-2">🔗 Connected Blogging Sync</h1>
          <p className="text-sm text-muted-foreground mb-8">Link external distribution systems to automatically format and broadcast text drafts directly from your feed canvas.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
            <div className="p-5 border border-border rounded-xl bg-background/50 flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-sm text-foreground">WordPress Core</h4>
                <p className="text-xs text-muted-foreground">Sync drafts to self-hosted instances</p>
              </div>
              <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:opacity-90 transition-opacity">Link Profile</button>
            </div>
            <div className="p-5 border border-border rounded-xl bg-background/50 flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-sm text-foreground">Medium Stories</h4>
                <p className="text-xs text-muted-foreground">Publish clips straight into feed layouts</p>
              </div>
              <button className="px-3 py-1.5 bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black rounded-lg text-xs font-medium hover:opacity-90 transition-opacity">Link Profile</button>
            </div>
          </div>
        </div>
      )}

      {currentTab === "Settings" && (
        <div className="flex-1 p-10 overflow-y-auto bg-card border-l border-border">
          <h1 className="text-2xl font-bold text-foreground mb-2">⚙️ Application Settings</h1>
          <p className="text-sm text-muted-foreground mb-6">Verify account profiles, metadata indexes, and backend infrastructure state handles.</p>
          <div className="max-w-md divide-y divide-border border-t border-b border-border py-2">
            <div className="flex justify-between items-center py-3 text-sm">
              <span className="text-muted-foreground">Cloud Sync Engine</span>
              <span className="text-emerald-500 font-semibold flex items-center gap-1.5">● Neon Postgres Active</span>
            </div>
            <div className="flex justify-between items-center py-3 text-sm">
              <span className="text-muted-foreground">Extension Integration Channel</span>
              <span className="text-foreground font-medium">Enabled (v1.2)</span>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
