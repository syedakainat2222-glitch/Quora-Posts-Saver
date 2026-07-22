"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
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
import { useDeletePost, useDuplicatePost, useBulkDelete, useBulkTagUpdate } from "@/lib/api-mutations"
import { exportToCSV, exportToJSON } from "@/lib/export"
import type { SaveItem, SaveKind } from "@/lib/saves"
import { SortOption } from "@/components/sort-dropdown"
import { Edit2, Trash2, Copy, Share2 } from "lucide-react"

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
    createdAt: row.created_at
  }
}

const fetcher = (url: string) => {
  const token = localStorage.getItem("qsaver_session_token")
  return fetch(url, {
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  }).then((r) => r.json())
}

export default function Page() {
  const router = useRouter()
  const { mutate: globalMutate } = useSWRConfig()
  const toast = useToast()
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [currentTab, setCurrentTab] = useState<string>("All Saves")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  // Profile
  const [userDisplayName, setUserDisplayName] = useState<string>("New User")
  const [inputName, setInputName] = useState<string>("")

  // Search & Sort
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOption, setSortOption] = useState<SortOption>("newest")

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, id: string } | null>(null)

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)
  const [isBulkTagModalOpen, setIsBulkTagModalOpen] = useState(false)
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false)

  // Soft Delete Pending State
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

  const { trigger: deletePost } = useDeletePost()
  const { trigger: duplicatePost } = useDuplicatePost()
  const { trigger: bulkDelete, isMutating: isBulkDeleting } = useBulkDelete()
  const { trigger: bulkTag, isMutating: isBulkTagging } = useBulkTagUpdate()

  const processedSaves = useMemo(() => {
    if (!data || !Array.isArray(data)) return []
    
    let items = data
      .filter(row => !pendingDeletions.includes(String(row.id)))
      .map(normalize)

    if (selectedTag) {
      items = items.filter(s => s.tag.toLowerCase() === selectedTag.toLowerCase())
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      items = items.filter(s => 
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

  const selectedPost = processedSaves.find(s => s.id === selectedId) || null

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

  const handleDuplicate = async (postId?: string) => {
    const post = postId ? processedSaves.find(s => s.id === postId) : selectedPost
    if (!post) return
    try {
      await duplicatePost({
        title: `${post.title} (Copy)`,
        author: post.author,
        contentText: post.body.join("\n\n"),
        tag: post.tag,
        type: post.kind,
        url: post.sourceUrl
      })
      mutate()
      toast.success("Post duplicated!")
    } catch (err) {
      toast.error("Failed to duplicate post")
    }
  }

  const handleDelete = async (postId?: string) => {
    const idToDelete = postId || selectedId
    if (!idToDelete) return
    
    setIsDeleteModalOpen(false)
    if (selectedId === idToDelete) setSelectedId(null)

    setPendingDeletions(prev => [...prev, idToDelete])

    const timer = setTimeout(async () => {
      try {
        await deletePost({ id: idToDelete })
        mutate()
        globalMutate("/api/save/tags")
        setPendingDeletions(prev => prev.filter(id => id !== idToDelete))
        delete timeouts.current[idToDelete]
      } catch (err) {
        toast.error("Failed to delete post")
        setPendingDeletions(prev => prev.filter(id => id !== idToDelete))
      }
    }, 5000)

    timeouts.current[idToDelete] = timer

    toast.info("Post moved to trash", {
      label: "Undo",
      onClick: () => {
        clearTimeout(timeouts.current[idToDelete])
        delete timeouts.current[idToDelete]
        setPendingDeletions(prev => prev.filter(id => id !== idToDelete))
        setSelectedId(idToDelete)
        toast.success("Deletion cancelled")
      }
    })
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
    const post = postId ? processedSaves.find(s => s.id === postId) : selectedPost
    if (!post) return
    const md = `# ${post.title}\nBy ${post.author}\n\n${post.body.join("\n\n")}`
    navigator.clipboard.writeText(md)
    toast.success("Markdown copied to clipboard!")
  }

  const handleShare = (postId?: string) => {
    const post = postId ? processedSaves.find(s => s.id === postId) : selectedPost
    if (!post?.sourceUrl) return
    navigator.clipboard.writeText(post.sourceUrl)
    toast.success("Source link copied!")
  }

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, id })
  }

  if (isAuthenticated === null || isLoading) {
    return (
      <main className="flex h-dvh items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-600"></div>
          <p className="text-sm font-bold text-muted-foreground animate-pulse uppercase tracking-widest">Initialising Library...</p>
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

      <div className="flex-1 flex overflow-hidden relative">
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
              onToggleSelect={(id) => setSelectedIds(prev => 
                prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
              )}
              onSelectAll={() => setSelectedIds(
                selectedIds.length === processedSaves.length ? [] : processedSaves.map(s => s.id)
              )}
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
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-white/30 dark:bg-zinc-900/10 backdrop-blur-sm">
                <div className="size-16 rounded-3xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-6">
                  <Layers className="size-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Nothing Selected</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                  Pick a post from the list to view its contents, edit details, or export to your blog.
                </p>
              </div>
            )}
          </>
        ) : currentTab === "Settings" ? (
            <div className="flex-1 p-10 overflow-y-auto">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter">Settings</h1>
                    <p className="text-muted-foreground mb-10">Manage your library preferences and system data.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-xl shadow-gray-200/20 dark:shadow-none">
                            <div className="size-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6"><FileDown className="size-6 text-blue-600" /></div>
                            <h2 className="text-xl font-bold mb-3">Export Data</h2>
                            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">Download your curated library in CSV or JSON format for backups or external analysis.</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => exportToCSV(processedSaves)} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition active:scale-95 shadow-lg shadow-blue-500/25">Download CSV</button>
                                <button onClick={() => exportToJSON(processedSaves)} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-zinc-800 text-foreground rounded-2xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 transition active:scale-95">Download JSON</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ) : null}

        {/* CONTEXT MENU (Commandment #17) */}
        {contextMenu && (
          <div 
            className="fixed z-[100] w-48 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl py-2 overflow-hidden animate-in fade-in zoom-in duration-150"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button onClick={() => { setSelectedId(contextMenu.id); setIsEditModalOpen(true); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800 transition text-left"><Edit2 className="size-4 text-blue-500" /> Edit Post</button>
            <button onClick={() => handleDuplicate(contextMenu.id)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800 transition text-left"><Copy className="size-4 text-indigo-500" /> Duplicate</button>
            <button onClick={() => handleShare(contextMenu.id)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800 transition text-left"><Share2 className="size-4 text-teal-500" /> Copy Link</button>
            <div className="h-px bg-gray-100 dark:bg-zinc-800 my-1 mx-2" />
            <button onClick={() => handleDelete(contextMenu.id)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition text-left"><Trash2 className="size-4" /> Delete Post</button>
          </div>
        )}
      </div>

      <ToastContainer toasts={toast.toasts} />
      {selectedPost && <EditPostModal open={isEditModalOpen} post={selectedPost} onClose={() => setIsEditModalOpen(false)} onSave={() => { mutate(); globalMutate("/api/save/tags"); toast.success("Changes saved!"); }} />}
      <DeleteConfirmModal open={isDeleteModalOpen} title="Delete Post" message="Are you sure you want to delete this post? It will be permanently removed from your library after 5 seconds." onConfirm={handleDelete} onClose={() => setIsDeleteModalOpen(false)} isDeleting={false} />
      <DeleteConfirmModal open={isBulkDeleteModalOpen} title={`Delete ${selectedIds.length} items`} message="You are about to delete multiple posts. This action is permanent and cannot be undone." onConfirm={handleBulkDelete} onClose={() => setIsBulkDeleteModalOpen(false)} isDeleting={isBulkDeleting} />
      <BulkActionModal open={isBulkTagModalOpen} count={selectedIds.length} onClose={() => setIsBulkTagModalOpen(false)} onConfirm={handleBulkTag} isProcessing={isBulkTagging} />
      <TagManager open={isTagManagerOpen} onClose={() => setIsTagManagerOpen(false)} />
    </main>
  )
}

function Layers(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.1 6.27a2 2 0 0 0 0 3.66l9.07 4.09a2 2 0 0 0 1.66 0l9.07-4.09a2 2 0 0 0 0-3.66z" /><path d="m2.1 14.07 9.07 4.09a2 2 0 0 0 1.66 0l9.07-4.09" /><path d="m2.1 19.07 9.07 4.09a2 2 0 0 0 1.66 0l9.07-4.09" /></svg> }
function FileDown(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="3" y2="15" /></svg> }
function Rocket(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.71-2.13.09-2.91a2.18 2.18 0 0 0-3.09-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4.5c1.62-1.63 5-2 5-2" /><path d="M12 15v5s3.03-.55 4.5-2c1.63-1.62 2-5 2-5" /></svg> }
