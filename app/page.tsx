"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
    tag: folderNameNormalization(row.tag),
    sourceUrl: row.url || "",
    snippet: content.slice(0, 160) + (content.length > 160 ? "…" : ""),
    body: paragraphs.length ? paragraphs : [content],
  }
}

function folderNameNormalization(tag: string): string {
  if (!tag) return "General"
  return tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase()
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function Page() {
  const router = useRouter()
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [currentTab, setCurrentTab] = useState<string>("All Saves")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  // ----- DYNAMIC PROFILE INITIALIZATION STATE -----
  const [userDisplayName, setUserDisplayName] = useState<string>("New User")
  const [inputName, setInputName] = useState<string>("")

  useEffect(() => {
    const localToken = localStorage.getItem("qsaver_session_token")
    const cookieToken = document.cookie.split("; ").find(row => row.startsWith("session_token="))

    if (!localToken && !cookieToken) {
      setIsAuthenticated(false)
      router.push("/login")
    } else {
      setIsAuthenticated(true)
      
      // Load saved display name from local preference context or fallback to profile data elements
      const savedName = localStorage.getItem("qsaver_display_name")
      if (savedName) {
        setUserDisplayName(savedName)
        setInputName(savedName)
      } else {
        setInputName("New User")
      }
    }
  }, [router])

  const { data, error, isLoading } = useSWR<ApiRow[]>(
    isAuthenticated ? "/api/save" : null,
    fetcher, 
    { refreshInterval: 5000 }
  )

  const saves: SaveItem[] = Array.isArray(data) ? data.map(normalize) : []
  const displayedSaves = selectedTag 
    ? saves.filter(s => s.tag.toLowerCase() === selectedTag.toLowerCase())
    : saves

  const selected = displayedSaves.find((s) => s.id === selectedId) ?? displayedSaves[0] ?? null

  const handleUpdateProfileName = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputName.trim()) return
    
    setUserDisplayName(inputName.trim())
    localStorage.setItem("qsaver_display_name", inputName.trim())
    alert("✨ Profile updated successfully!")
  }

  if (isAuthenticated === null || isAuthenticated === false || isLoading) {
    return (
      <main className="flex h-dvh items-center justify-center overflow-hidden text-muted-foreground bg-background font-medium tracking-wide">
        Verifying secure cloud access session credentials…
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

  const handleTabChange = (tabName: string, tagName: string | null = null) => {
    setCurrentTab(tabName)
    setSelectedTag(tagName)
    setSelectedId(null)
  }

  return (
    <main className="flex h-dvh overflow-hidden w-full bg-background text-foreground">
      <Sidebar 
        currentTab={currentTab} 
        onTabChange={handleTabChange}
        displayName={userDisplayName}
      />

      {/* ALL SAVES TAB */}
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

      {/* FOLDERS/TAGS TAB */}
      {currentTab === "Folders/Tags" && (
        <div className="flex-1 p-10 overflow-y-auto bg-card border-l border-border">
          <h1 className="text-2xl font-bold text-foreground mb-2">📁 Folders / Tags Archive</h1>
          <p className="text-sm text-muted-foreground mb-8">Manage your curated tags or click a collection folder in the sidebar panel to slice your workspace.</p>
          <div className="p-8 border border-dashed border-border rounded-xl text-center max-w-xl text-muted-foreground text-sm">
            Tag organization controls and automated folder sorting structures will load in version 1.3 updates. Use the sidebar to filter clips.
          </div>
        </div>
      )}

      {/* CONNECTED BLOGS TAB */}
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
                <p className="text-xs text-muted-foreground">Push clips straight into feed layouts</p>
              </div>
              <button className="px-3 py-1.5 bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black rounded-lg text-xs font-medium hover:opacity-90 transition-opacity">Link Profile</button>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS TAB */}
      {currentTab === "Settings" && (
        <div className="flex-1 p-10 overflow-y-auto bg-card border-l border-border space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">⚙️ Application Settings</h1>
            <p className="text-sm text-muted-foreground">Verify account profiles, metadata indexes, and backend infrastructure state handles.</p>
          </div>

          {/* EDIT PROFILE COMPONENT CARD */}
          <div className="max-w-md border border-border rounded-xl p-6 bg-background space-y-4">
            <h3 className="text-sm font-bold text-foreground">👤 Edit User Profile Workspace</h3>
            <form onSubmit={handleUpdateProfileName} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Display Full Name</label>
                <input 
                  type="text" 
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full text-sm rounded-lg border border-border p-2 bg-transparent focus:border-primary outline-none"
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-lg hover:bg-blue-700 cursor-pointer">
                Save Display Name
              </button>
            </form>
          </div>

          {/* SYNC STATUS */}
          <div className="max-w-md divide-y divide-border border-t border-b border-border py-2">
            <div className="flex justify-between text-sm py-2">
              <span className="text-muted-foreground">Cloud Sync Engine</span>
              <span className="text-green-600 font-medium">● Active</span>
            </div>
            <div className="flex justify-between text-sm py-2">
              <span className="text-muted-foreground">Neon Postgres</span>
              <span className="text-green-600 font-medium">● Connected</span>
            </div>
            <div className="flex justify-between text-sm py-2">
              <span className="text-muted-foreground">Extension Integration Channel</span>
              <span className="text-blue-600 font-medium">Enabled (v1.2)</span>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
