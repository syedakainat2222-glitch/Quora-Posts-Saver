import type { SaveItem } from "@/lib/saves"

export function exportToCSV(items: SaveItem[]) {
  const headers = ["Title", "Author", "Tag", "Type", "Content", "URL", "Saved At"]
  const rows = items.map((item) => [
    item.title,
    item.author,
    item.tag,
    item.kind,
    item.body.join("\n"),
    item.sourceUrl,
    item.savedAt,
  ])
  const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
  downloadFile(csv, "qsaver-export.csv", "text/csv")
}

export function exportToJSON(items: SaveItem[]) {
  const json = JSON.stringify(items, null, 2)
  downloadFile(json, "qsaver-export.json", "application/json")
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
