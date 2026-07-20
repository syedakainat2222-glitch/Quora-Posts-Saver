"use client"

import { useRouter } from "next/navigation"
import {
  HardDrive,
  Layers,
  Tags,
  Rss,
  Settings,
  Hash,
  Crown,
  LogOut, // Added clean logout icon asset utility
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
}

export function Sidebar({ className, currentTab, onTabChange, selectedTag }: SidebarProps) {
  const router = useRouter()

  // 1. ADD INTERACTIVE LOGOUT SESSION DELETION ACTION METHOD
  const handleLogOutAction = () => {
    // Purge session variables out of browser security context storage frames
    localStorage.removeItem("qsaver_session_token")
    document.cookie = "session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure"
    
    alert("🔒 Logged out of your session safely! Returning to authentication screen.")
    
    // Bounce user back to login portal screen
    router.push("/login")
  }

  return (
    <aside
      className={cn(
        "flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar",
        className,
      )}
    >
      {/* Logo Container */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <HardDrive className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-foreground">Q-Saver</p>
          <p className="text-xs text-muted-foreground">Cloud</p>
        </div>
      </div>

      {/* Main Tab Navigation Link Utilities */}
      <nav className="flex flex-col gap-1 px-3">
        {nav.map((item) => {
          const isButtonActive = currentTab === item.name && selectedTag === null;
          return (
            <button
              key={item.name}
              onClick={() => onTabChange(item.name, null)}
              aria-current={isButtonActive ? "page" : undefined}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left border-none bg-transparent cursor-pointer",
                isButtonActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60",
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {item.name}
            </button>
          )
        })}
      </nav>

      {/* Folders / Tags Subsection */}
      <div className="mt-6 px-3">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Folders / Tags
        </p>
        <div className="flex flex-col gap-0.5">
          {folders.map((folder) => {
            const isTagActive = currentTab === "All Saves" && selectedTag?.toLowerCase() === folder.name.toLowerCase();
            return (
              <button
                key={folder.name}
                onClick={() => onTabChange("All Saves", folder.name)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-sm transition-colors text-left border-none bg-transparent cursor-pointer",
                  isTagActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60"
                )}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <Hash className="size-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">{folder.name}</span>
                </span>
                <span className="text-xs text-muted-foreground px-1.5">{folder.count}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1" />

      {/* Profile banner + INTEGRATED LOG OUT CLICK BUTTON BOX */}
      <div className="m-3 rounded-xl border border-sidebar-border bg-card p-3 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
            SM
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-medium text-foreground">
              Smooaa Mhara
            </p>
            <p className="flex items-center gap-1 text-xs text-primary">
              <Crown className="size-3" />
              Premium
            </p>
          </div>
        </div>
        
        {/* INTERACTIVE CLICKABLE LOGOUT TRIPPED UTILITY LAYOUT */}
        <button
          onClick={handleLogOutAction}
          title="Sign Out of Account"
          className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/20 rounded-lg transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center shrink-0"
        >
          <LogOut className="size-4.5" />
        </button>
      </div>

    </aside>
  )
}
