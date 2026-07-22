"use client"

import { useRouter } from "next/navigation"
import {
  HardDrive,
  Layers,
  Tags,
  Rss,
  Settings,
  Hash,
  LogOut,
} from "lucide-react"
import { folders } from "@/lib/saves"
import { cn } from "@/lib/utils"

const nav = [
  { name: "All Saves", icon: Layers },
  { name: "Folders/Tags", icon: Tags },
  { name: "Connected Blogs", icon: Rss },
  { name: "Settings", icon: Settings },
]

interface SidebarProps {
  className?: string
  currentTab: string
  onTabChange: (tabName: string, tagName: string | null) => void
  selectedTag: string | null
  displayName: string
}

export function Sidebar({
  className,
  currentTab,
  onTabChange,
  selectedTag,
  displayName,
}: SidebarProps) {
  const router = useRouter()

  const handleLogOutAction = () => {
    localStorage.removeItem("qsaver_session_token")
    document.cookie = "session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure"
    alert("🔒 Logged out of your session safely! Returning to authentication screen.")
    router.push("/login")
  }

  const profileInitials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "US"

  return (
    <aside
      className={cn(
        "flex w-64 shrink-0 flex-col border-r border-gray-200/60 bg-white/70 backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-900/70",
        className,
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
          <HardDrive className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Q-Saver</p>
          <p className="text-xs text-muted-foreground">Cloud</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-3">
        {nav.map((item) => {
          const isActive = currentTab === item.name && selectedTag === null
          return (
            <button
              key={item.name}
              onClick={() => onTabChange(item.name, null)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all text-left border-none bg-transparent cursor-pointer",
                isActive
                  ? "bg-blue-50/80 text-blue-700 shadow-sm dark:bg-blue-950/30 dark:text-blue-300"
                  : "text-gray-700 hover:bg-gray-100/60 dark:text-gray-300 dark:hover:bg-zinc-800/60",
              )}
            >
              <item.icon
                className={cn(
                  "size-4 shrink-0",
                  isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400",
                )}
              />
              {item.name}
            </button>
          )
        })}
      </nav>

      {/* Tags */}
      <div className="mt-6 px-3">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Folders / Tags
        </p>
        <div className="flex flex-col gap-0.5">
          {folders.map((folder) => {
            const isTagActive =
              currentTab === "All Saves" && selectedTag?.toLowerCase() === folder.name.toLowerCase()
            return (
              <button
                key={folder.name}
                onClick={() => onTabChange("All Saves", folder.name)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-all text-left border-none bg-transparent cursor-pointer",
                  isTagActive
                    ? "bg-blue-50/80 text-blue-700 shadow-sm dark:bg-blue-950/30 dark:text-blue-300"
                    : "text-gray-700 hover:bg-gray-100/60 dark:text-gray-300 dark:hover:bg-zinc-800/60",
                )}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <Hash className="size-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">{folder.name}</span>
                </span>
                <span className="rounded-full bg-gray-100/60 px-2 py-0.5 text-xs font-medium text-muted-foreground dark:bg-zinc-800/60">
                  {folder.count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1" />

      {/* Profile */}
      <div className="m-3 rounded-2xl border border-gray-200/60 bg-white/70 p-3 shadow-sm backdrop-blur-sm dark:border-zinc-800/60 dark:bg-zinc-900/70">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-sm font-bold text-blue-700 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-300">
              {profileInitials}
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                {displayName}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogOutAction}
            title="Sign Out"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-50/50 hover:text-red-500 dark:hover:bg-red-950/20"
          >
            <LogOut className="size-4.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
