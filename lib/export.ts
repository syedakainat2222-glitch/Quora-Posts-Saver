import { SaveItem } from "./saves";

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToJSON(posts: SaveItem[]) {
  const content = JSON.stringify(posts, null, 2);
  downloadFile(content, `q-saver-export-${new Date().toISOString().split('T')[0]}.json`, "application/json");
}

export function exportToCSV(posts: SaveItem[]) {
  const headers = ["Title", "Author", "Tag", "Type", "URL", "Saved At", "Content"];
  const rows = posts.map(post => [
    `"${(post.title || "").replace(/"/g, '""')}"`,
    `"${(post.author || "").replace(/"/g, '""')}"`,
    `"${(post.tag || "").replace(/"/g, '""')}"`,
    `"${(post.kind || "").replace(/"/g, '""')}"`,
    `"${(post.sourceUrl || "").replace(/"/g, '""')}"`,
    `"${(post.savedAt || "").replace(/"/g, '""')}"`,
    `"${(post.body.join("\n") || "").replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
  downloadFile(csvContent, `q-saver-export-${new Date().toISOString().split('T')[0]}.csv`, "text/csv;charset=utf-8;");
}
