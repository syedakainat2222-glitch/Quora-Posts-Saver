"use client"

import {
  HardDrive,
  Layers,
  Tags,
  Rss,
  Settings,
  Hash,
  Crown,
} from "lucide-react"
import { folders } from "@/lib/saves"
import { cn } from "@/lib/utils"

const nav = [
  { name: "All Saves", icon: Layers, active: true },
  { name: "Folders/Tags", icon: Tags, active: false },
  { name: "Connected Blogs", icon: Rss, active: false },
  { name: "Settings", icon: Settings, active: false },
]

export function Sidebar({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar",
        className,
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <HardDrive className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-foreground">Q-Saver</p>
          <p className="text-xs text-muted-foreground">Cloud</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 px-3">
        {nav.map((item) => (
          <a
            key={item.name}
            href="#"
            aria-current={item.active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              item.active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/60",
            )}
          >
            <item.icon className="size-4" />
            {item.name}
          </a>
        ))}
      </nav>

      {/* Folders / Tags */}
      <div className="mt-6 px-3">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Folders / Tags
        </p>
        <div className="flex flex-col gap-0.5">
          {folders.map((folder) => (
            <a
              key={folder.name}
              href="#"
              className="flex items-center justify-between rounded-lg px-3 py-1.5 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent/60"
            >
              <span className="flex items-center gap-2.5">
                <Hash className="size-3.5 text-muted-foreground" />
                {folder.name}
              </span>
              <span className="text-xs text-muted-foreground">{folder.count}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="flex-1" />

      {/* Profile banner */}
      <div className="m-3 rounded-xl border border-sidebar-border bg-card p-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
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
      </div>
    </aside>
  )
}
