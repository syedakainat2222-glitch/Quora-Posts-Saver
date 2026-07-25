"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import useSWR, { useSWRConfig } from "swr"
import { Sidebar } from "@/components/sidebar"
import { FeedList } from "@/components/feed-list"
import { ReadingView } from "@/components/reading-view"
import { ToastContainer } from "@/components/toast-container"
import { EditPostModal } from "@/components/modals/EditPostModal"
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal"
import { BulkActionModal } from "@/components/modals/BulkActionModal"
import { TagManager } from "@/components/tag-manager"
import { useToast } from "@/lib/use-toast"
import { useDuplicatePost, useBulkDelete, useBulkTagUpdate } from "@/lib/api-mutations"
import { exportToCSV, exportToJSON } from "@/lib/export"
import type { SaveItem, SaveKind } from "@/lib/saves"
import { SortOption } from "@/components/sort-dropdown"
import { Edit2, Trash2, Copy, Share2, Layers, FileDown } from "lucide-react"

// ✅ Define API base URL
const API = "https://quora-posts-saver2.vercel.app"

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
    createdAt: row.created_at,
  }
}

// --- Refresh token helper (same as before) ---
const SUPABASE_URL = "https://oiwjjpsdtxkagyuhrzfw.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pd2pqcHNkdHhrYWd5dWhyemZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2OTU0NzgsImV4cCI6MjEwMDI3MTQ3OH0.DhfPMIGJhNE7BH7-ygKtF77rKgtcKFp0f4xHnBCCCRw"

async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem("qsaver_refresh_token")
  if (!refreshToken) throw new Error("No refresh token available")
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error_description || data.msg || "Refresh failed")
  localStorage.setItem("qsaver_session_token", data.access_token)
  localStorage.setItem("qsaver_refresh_token", data.refresh_token)
  document.cookie = `session_token=${data.access_token}; path=/; max-age=604800; SameSite=Lax; Secure`
  return data.access_token
}

// --- Smart fetcher ---
const fetcher = async (url: string) => {
  const token = localStorage.getItem("qsaver_session_token")
  const fetchWithToken = (t: string) =>
    fetch(url, { headers: { Authorization: `Bearer ${t}` } })
  let res = await fetchWithToken(token || "")
  if (!res.ok && (res.status === 401 || res.status === 403)) {
    const newToken = await refreshAccessToken()
    res = await fetchWithToken(newToken)
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export default function Page() {
  const router = useRouter()
  const { mutate: globalMutate } = useSWRConfig()
  const toast = useToast()

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [currentTab, setCurrentTab] = useState<string>("All Saves")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const [userDisplayName, setUserDisplayName] = useState<string>("New User")
  const [inputName, setInputName] = useState<string>("")

  const [searchQuery, setSearchQuery] = useState("")
  const [sortOption, setSortOption] = useState<SortOption>("newest")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; id: string } | null>(null)

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)
  const [isBulkTagModalOpen, setIsBulkTagModalOpen] = useState(false)
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false)

  const [pendingDeletions, setPendingDeletions] = useState<string[]>([])
  const timeouts = useRef<Record<string, NodeJS.Timeout>>({})

  useEffect(() => {
    const localToken = localStorage.getItem("qsaver_session_token")
    if (!localToken) {
      setIsAuthenticated(false)
      router.push("/login")
    } else {
      setIsAuthenticated(true)
      const savedName = localStorage.getItem("qsaver_display_name")
      if (savedName) {
        setUserDisplayName(savedName)
        setInputName(savedName)
      }
    }
    return () => {
      Object.values(timeouts.current).forEach(clearTimeout)
    }
  }, [router])

  const { data, error, isLoading, mutate } = useSWR<ApiRow[]>(
    isAuthenticated ? "/api/save" : null,
    fetcher,
    { refreshInterval: 5000 }
  )

  const { trigger: duplicatePost } = useDuplicatePost()
  const { trigger: bulkDelete, isMutating: isBulkDeleting } = useBulkDelete()
  const { trigger: bulkTag, isMutating: isBulkTagging } = useBulkTagUpdate()

  const processedSaves = useMemo(() => {
    if (!data || !Array.isArray(data)) return []
    let items = data
      .filter((row) => !pendingDeletions.includes(String(row.id)))
      .map(normalize)
    if (selectedTag) {
      items = items.filter((s) => s.tag.toLowerCase() === selectedTag.toLowerCase())
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      items = items.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.author.toLowerCase().includes(q) ||
          s.body.join(" ").toLowerCase().includes(q)
      )
    }
    return items.sort((a, b) => {
      switch (sortOption) {
        case "newest": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest": return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "title-asc": return a.title.localeCompare(b.title)
        case "title-desc": return b.title.localeCompare(a.title)
        case "author": return a.author.localeCompare(b.author)
        default: return 0
      }
    })
  }, [data, selectedTag, searchQuery, sortOption, pendingDeletions])

  const selectedPost = processedSaves.find((s) => s.id === selectedId) || null

  // ---------- DELETE (DIRECT FETCH) ----------
  const handleDelete = async (postId?: string) => {
    const idToDelete = postId || selectedId
    if (!idToDelete) return

    setIsDeleteModalOpen(false)

    try {
      const token = localStorage.getItem("qsaver_session_token")
      const res = await fetch(`${API}/api/save/${idToDelete}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || `Delete failed with status ${res.status}`)
      }
      // Remove from pending state if any
      setPendingDeletions((prev) => prev.filter((id) => id !== idToDelete))
      mutate() // refresh the list
      globalMutate("/api/save/tags")
      toast.success("Post deleted")
      if (selectedId === idToDelete) setSelectedId(null)
    } catch (err: any) {
      toast.error(err.message || "Delete failed")
      console.error("Delete error:", err)
    }
  }

  // ---------- OTHER HANDLERS ----------
  const handleDuplicate = async (postId?: string) => {
    const post = postId ? processedSaves.find((s) => s.id === postId) : selectedPost
    if (!post) return
    try {
      await duplicatePost({
        title: `${post.title} (Copy)`,
        author: post.author,
        contentText: post.body.join("\n\n"),
        tag: post.tag,
        type: post.kind,
        url: post.sourceUrl,
      })
      mutate()
      toast.success("Post duplicated!")
    } catch (err) {
      toast.error("Failed to duplicate post")
    }
  }

  const handleBulkDelete = async () => {
    try {
      await bulkDelete({ ids: selectedIds })
      mutate()
      globalMutate("/api/save/tags")
      toast.success(`Deleted ${selectedIds.length} items`)
      setSelectedIds([])
      setIsBulkDeleteModalOpen(false)
    } catch (err) {
      toast.error("Bulk delete failed")
    }
  }

  const handleBulkTag = async (tag: string) => {
    try {
      await bulkTag({ ids: selectedIds, tag })
      mutate()
      globalMutate("/api/save/tags")
      toast.success(`Updated tags for ${selectedIds.length} items`)
      setSelectedIds([])
      setIsBulkTagModalOpen(false)
    } catch (err) {
      toast.error("Failed to update tags")
    }
  }

  const handleCopyMarkdown = (postId?: string) => {
    const post = postId ? processedSaves.find((s) => s.id === postId) : selectedPost
    if (!post) return
    const md = `# ${post.title}\nBy ${post.author}\n\n${post.body.join("\n\n")}`
    navigator.clipboard.writeText(md)
    toast.success("Markdown copied to clipboard!")
  }

  const handleShare = (postId?: string) => {
    const post = postId ? processedSaves.find((s) => s.id === postId) : selectedPost
    if (!post?.sourceUrl) return
    navigator.clipboard.writeText(post.sourceUrl)
    toast.success("Source link copied!")
  }

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, id })
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === "Delete" && selectedId) setIsDeleteModalOpen(true)
      if ((e.ctrlKey || e.metaKey) && e.key === "e" && selectedId) {
        e.preventDefault()
        setIsEditModalOpen(true)
      }
    }
    const handleClickOutside = () => setContextMenu(null)
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("click", handleClickOutside)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("click", handleClickOutside)
    }
  }, [selectedId])

  if (isAuthenticated === null || isLoading) {
    return (
      <main className="flex h-dvh items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-600"></div>
          <p className="animate-pulse text-sm font-bold uppercase tracking-widest text-muted-foreground">Loading...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex h-dvh items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="rounded-2xl border border-red-200/50 bg-red-50/80 p-8 text-center">
          <p className="text-lg font-semibold text-red-700 dark:text-red-300">⚠️ Connection error</p>
          <p className="mt-2 text-sm text-muted-foreground">Could not reach the cloud archive. Please try again later.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex h-dvh w-full overflow-hidden bg-slate-50 dark:bg-zinc-950">
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab, tag) => {
          setCurrentTab(tab)
          setSelectedTag(tag)
          setSelectedId(null)
          setSelectedIds([])
        }}
        selectedTag={selectedTag}
        displayName={userDisplayName}
        onOpenTagManager={() => setIsTagManagerOpen(true)}
      />

      <div className="relative flex flex-1 overflow-hidden">
        {currentTab === "All Saves" ? (
          <>
            <FeedList
              items={processedSaves}
              selectedId={selectedId || ""}
              onSelect={setSelectedId}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortOption={sortOption}
              onSortChange={setSortOption}
              selectedIds={selectedIds}
              onToggleSelect={(id) =>
                setSelectedIds((prev) =>
                  prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
                )
              }
              onSelectAll={() =>
                setSelectedIds(
                  selectedIds.length === processedSaves.length
                    ? []
                    : processedSaves.map((s) => s.id)
                )
              }
              onBulkDelete={() => setIsBulkDeleteModalOpen(true)}
              onBulkTag={() => setIsBulkTagModalOpen(true)}
              onContextMenu={handleContextMenu}
            />
            {selectedPost ? (
              <ReadingView
                item={selectedPost}
                onEdit={() => setIsEditModalOpen(true)}
                onDelete={() => setIsDeleteModalOpen(true)}
                onDuplicate={() => handleDuplicate()}
                onCopyMarkdown={() => handleCopyMarkdown()}
                onShare={() => handleShare()}
              />
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center bg-white/30 p-10 text-center backdrop-blur-sm dark:bg-zinc-900/10">
                <div className="mb-6 flex size-16 items-center justify-center rounded-3xl bg-blue-50 dark:bg-blue-900/20">
                  <Layers className="size-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Nothing Selected</h3>
                <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                  Pick a post from the list to view its contents, edit details, or export to your blog.
                </p>
              </div>
            )}
          </>
        ) : currentTab === "Settings" ? (
          <div className="flex-1 overflow-y-auto p-10">
            <div className="mx-auto max-w-3xl">
              <h1 className="mb-2 text-4xl font-black uppercase tracking-tighter">Settings</h1>
              <p className="mb-10 text-muted-foreground">Manage your library preferences.</p>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30">
                    <FileDown className="size-6 text-blue-600" />
                  </div>
                  <h2 className="mb-3 text-xl font-bold">Export Data</h2>
                  <p className="mb-8 text-sm text-muted-foreground">
                    Download your library as CSV or JSON.
                  </p>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => exportToCSV(processedSaves)}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700 active:scale-95"
                    >
                      Download CSV
                    </button>
                    <button
                      onClick={() => exportToJSON(processedSaves)}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-100 px-6 py-3 text-sm font-bold text-foreground transition hover:bg-gray-200 active:scale-95 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                    >
                      Download JSON
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {contextMenu && (
          <div
            className="fixed z-[100] w-48 animate-in fade-in zoom-in-duration-150 overflow-hidden rounded-2xl border border-gray-200 bg-white py-2 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button
              onClick={() => { setSelectedId(contextMenu.id); setIsEditModalOpen(true); }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
              <Edit2 className="size-4 text-blue-500" /> Edit Post
            </button>
            <button
              onClick={() => handleDuplicate(contextMenu.id)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
              <Copy className="size-4 text-indigo-500" /> Duplicate
            </button>
            <button
              onClick={() => handleShare(contextMenu.id)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
              <Share2 className="size-4 text-teal-500" /> Copy Link
            </button>
            <div className="my-1 mx-2 h-px bg-gray-100 dark:bg-zinc-800" />
            <button
              onClick={() => handleDelete(contextMenu.id)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="size-4" /> Delete Post
            </button>
          </div>
        )}
      </div>

      <ToastContainer toasts={toast.toasts} />
      {selectedPost && (
        <EditPostModal
          open={isEditModalOpen}
          post={selectedPost}
          onClose={() => setIsEditModalOpen(false)}
          onSave={() => {
            mutate()
            globalMutate("/api/save/tags")
            toast.success("Changes saved!")
          }}
        />
      )}
      <DeleteConfirmModal
        open={isDeleteModalOpen}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action is permanent."
        onConfirm={() => handleDelete()}
        onClose={() => setIsDeleteModalOpen(false)}
        isDeleting={false}
      />
      <DeleteConfirmModal
        open={isBulkDeleteModalOpen}
        title={`Delete ${selectedIds.length} items`}
        message="This action is permanent and cannot be undone."
        onConfirm={handleBulkDelete}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        isDeleting={isBulkDeleting}
      />
      <BulkActionModal
        open={isBulkTagModalOpen}
        count={selectedIds.length}
        onClose={() => setIsBulkTagModalOpen(false)}
        onConfirm={handleBulkTag}
        isProcessing={isBulkTagging}
      />
      <TagManager
        open={isTagManagerOpen}
        onClose={() => setIsTagManagerOpen(false)}
      />
    </main>
  )
}
