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

// ✅ FIXED: fetcher now sends the Authorization header with the token
const fetcher = (url: string) => {
  const token = localStorage.getItem("qsaver_session_token")
  return fetch(url, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  }).then((r) => r.json())
}

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
      <main className="flex h-dvh items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="size-10 animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-500"></div>
          <p className="text-sm font-medium">Verifying your session…</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex h-dvh items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
        <div className="rounded-2xl border border-red-200/50 bg-red-50/80 p-8 text-center backdrop-blur-sm dark:border-red-900/30 dark:bg-red-950/20">
          <p className="text-lg font-semibold text-red-700 dark:text-red-300">⚠️ Connection error</p>
          <p className="mt-2 text-sm text-muted-foreground">Could not reach the cloud archive. Please try again later.</p>
        </div>
      </main>
    )
  }

  const handleTabChange = (tabName: string, tagName: string | null = null) => {
    setCurrentTab(tabName)
    setSelectedTag(tagName)
    setSelectedId(null)
  }

  return (
    <main className="flex h-dvh w-full overflow-hidden bg-gradient-to-br from-slate-50/50 to-blue-50/30 dark:from-slate-950 dark:to-slate-900">
      <Sidebar 
        currentTab={currentTab} 
        onTabChange={handleTabChange}
        displayName={userDisplayName}
      />

      <div className="flex-1 overflow-hidden bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50">
        {/* ALL SAVES TAB */}
        {currentTab === "All Saves" && (
          <>
            {displayedSaves.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
                <div className="rounded-full bg-blue-100/50 p-4 dark:bg-blue-900/20">
                  <HardDrive className="size-10 text-blue-500 dark:text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {selectedTag ? `No items in “${selectedTag}”` : "Your library is empty"}
                </p>
                <p className="max-w-md text-sm text-muted-foreground">
                  {selectedTag 
                    ? "You haven't added any clips under this tag yet."
                    : "Save a Quora post or reply from the browser extension and it will appear here instantly."}
                </p>
                {!selectedTag && (
                  <div className="mt-2 rounded-full bg-blue-50 px-4 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    💡 Install the Q‑Saver extension to start saving
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full overflow-hidden">
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
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl space-y-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">📁 Folders & Tags</h1>
                <p className="mt-1 text-sm text-muted-foreground">Organise your saved content by tags – click any folder in the sidebar to filter.</p>
              </div>
              <div className="rounded-2xl border border-dashed border-blue-200/50 bg-blue-50/30 p-12 text-center dark:border-blue-800/30 dark:bg-blue-900/10">
                <p className="text-sm text-muted-foreground">
                  Tag management and automated sorting will arrive in version 1.3.
                </p>
                <p className="mt-2 text-xs text-muted-foreground/70">
                  For now, use the sidebar to browse by tag.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CONNECTED BLOGS TAB */}
        {currentTab === "Connected Blogs" && (
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl space-y-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">🔗 Connected Blogs</h1>
                <p className="mt-1 text-sm text-muted-foreground">Link external platforms to publish your saved content seamlessly.</p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="group rounded-2xl border border-gray-200/70 bg-white/70 p-6 shadow-sm transition hover:shadow-md dark:border-zinc-700/50 dark:bg-zinc-800/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">WordPress</h4>
                      <p className="text-sm text-muted-foreground">Sync drafts to self‑hosted or .com sites</p>
                    </div>
                    <button className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700">
                      Connect
                    </button>
                  </div>
                </div>
                <div className="group rounded-2xl border border-gray-200/70 bg-white/70 p-6 shadow-sm transition hover:shadow-md dark:border-zinc-700/50 dark:bg-zinc-800/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">Medium</h4>
                      <p className="text-sm text-muted-foreground">Push stories directly to your profile</p>
                    </div>
                    <button className="rounded-full bg-zinc-800 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300">
                      Connect
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground/70">More integrations coming soon.</p>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {currentTab === "Settings" && (
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-3xl space-y-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">⚙️ Settings</h1>
                <p className="mt-1 text-sm text-muted-foreground">Manage your profile and check system status.</p>
              </div>

              {/* Profile card */}
              <div className="rounded-2xl border border-gray-200/70 bg-white/70 p-6 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-800/50">
                <h3 className="text-lg font-semibold text-foreground">👤 Profile</h3>
                <form onSubmit={handleUpdateProfileName} className="mt-4 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Display name</label>
                    <input
                      type="text"
                      value={inputName}
                      onChange={(e) => setInputName(e.target.value)}
                      placeholder="Enter your name"
                      className="mt-1 w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Update name
                  </button>
                </form>
              </div>

              {/* System status */}
              <div className="rounded-2xl border border-gray-200/70 bg-white/70 p-6 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-800/50">
                <h3 className="text-lg font-semibold text-foreground">🔌 System status</h3>
                <div className="mt-3 divide-y divide-gray-200/50 dark:divide-zinc-700/50">
                  <div className="flex justify-between py-2.5 text-sm">
                    <span className="text-muted-foreground">Cloud sync</span>
                    <span className="flex items-center gap-1.5 font-medium text-green-600 dark:text-green-400">
                      <span className="size-2 rounded-full bg-green-500"></span> Active
                    </span>
                  </div>
                  <div className="flex justify-between py-2.5 text-sm">
                    <span className="text-muted-foreground">Database</span>
                    <span className="flex items-center gap-1.5 font-medium text-green-600 dark:text-green-400">
                      <span className="size-2 rounded-full bg-green-500"></span> Connected
                    </span>
                  </div>
                  <div className="flex justify-between py-2.5 text-sm">
                    <span className="text-muted-foreground">Extension channel</span>
                    <span className="flex items-center gap-1.5 font-medium text-blue-600 dark:text-blue-400">
                      <span className="size-2 rounded-full bg-blue-500"></span> v1.2
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
