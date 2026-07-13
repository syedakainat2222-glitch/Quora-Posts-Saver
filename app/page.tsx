"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { FeedList } from "@/components/feed-list";
import { ReadingView } from "@/components/reading-view";

export default function Page() {
  const [saves, setSaves] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Fetch live data from your API
  useEffect(() => {
    async function loadCloudSaves() {
      try {
        const response = await fetch("/api/save");
        const data = await response.json();
        setSaves(data);
        // Auto-select the first item if available and none selected
        if (data.length > 0 && selectedId === null) {
          setSelectedId(data[0].id);
        }
      } catch (err) {
        console.error("Failed to load cloud saves:", err);
      }
    }
    loadCloudSaves();

    // Optional: poll every 5 seconds to show new saves without refresh
    const interval = setInterval(loadCloudSaves, 5000);
    return () => clearInterval(interval);
  }, []);

  // Find the selected item (fallback to first if not found)
  const selected = saves.find((s) => s.id === selectedId) ?? saves[0] ?? null;

  // If no saves yet, show a loading/empty state
  if (saves.length === 0) {
    return (
      <main className="flex h-dvh overflow-hidden items-center justify-center text-gray-400">
        No saved posts yet. Try saving one from your extension!
      </main>
    );
  }

  return (
    <main className="flex h-dvh overflow-hidden">
      <Sidebar className="hidden lg:flex" />
      <FeedList items={saves} selectedId={selectedId} onSelect={setSelectedId} />
      <ReadingView item={selected} />
    </main>
  );
}
