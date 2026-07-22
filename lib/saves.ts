export type SaveKind = "Post" | "Reply"

export type SaveItem = {
  id: string
  kind: SaveKind
  title: string
  author: string
  savedAt: string
  relative: string
  tag: string
  sourceUrl: string
  snippet: string
  body: string[]
  createdAt: string // Added for precise sorting
}

// Mock folders for initial UI - these will be replaced by dynamic counts from API
export const folders = [
  { name: "General", count: 0 },
]

export const saves: SaveItem[] = []
