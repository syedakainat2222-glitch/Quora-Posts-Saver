"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { FeedList } from "@/components/feed-list"
import { ReadingView } from "@/components/reading-view"
import { saves } from "@/lib/saves"

export default function Page() {
  const [selectedId, setSelectedId] = useState(saves[0].id)
  const selected = saves.find((s) => s.id === selectedId) ?? saves[0]

  return (
    <main className="flex h-dvh overflow-hidden">
      <Sidebar className="hidden lg:flex" />
      <FeedList items={saves} selectedId={selectedId} onSelect={setSelectedId} />
      <ReadingView item={selected} />
    </main>
  )
}
