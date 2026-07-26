import useSWRMutation from "swr/mutation"

const API = process.env.NEXT_PUBLIC_API_URL || "https://quora-posts-saver2.vercel.app"

const getToken = () => localStorage.getItem("qsaver_session_token") || ""

// --- Single Post ---
export function useEditPost() {
  return useSWRMutation("/api/save", async (url, { arg }: { arg: { id: string; data: any } }) => {
    const token = getToken()
    const res = await fetch(`${API}/api/save/${arg.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(arg.data),
    })
    const text = await res.text()
    if (!res.ok) throw new Error(text || `Edit failed with status ${res.status}`)
    return text ? JSON.parse(text) : { success: true }
  })
}

export function useDeletePost() {
  return useSWRMutation("/api/save", async (url, { arg }: { arg: { id: string } }) => {
    const token = getToken()
    const res = await fetch(`${API}/api/save/${arg.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    const text = await res.text()
    if (!res.ok) throw new Error(text || `Delete failed with status ${res.status}`)
    return text ? JSON.parse(text) : { success: true }
  })
}

export function useDuplicatePost() {
  return useSWRMutation("/api/save", async (url, { arg }: { arg: any }) => {
    const token = getToken()
    const res = await fetch(`${API}/api/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(arg),
    })
    const text = await res.text()
    if (!res.ok) throw new Error(text || `Duplicate failed with status ${res.status}`)
    return JSON.parse(text)
  })
}

// --- Bulk ---
export function useBulkDelete() {
  return useSWRMutation("/api/save/bulk", async (url, { arg }: { arg: { ids: string[] } }) => {
    const token = getToken()
    const res = await fetch(`${API}/api/save/bulk`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ids: arg.ids }),
    })
    const text = await res.text()
    if (!res.ok) throw new Error(text || `Bulk delete failed with status ${res.status}`)
    return text ? JSON.parse(text) : { success: true }
  })
}

export function useBulkTagUpdate() {
  return useSWRMutation("/api/save/bulk", async (url, { arg }: { arg: { ids: string[]; tag: string } }) => {
    const token = getToken()
    const res = await fetch(`${API}/api/save/bulk`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ids: arg.ids, tag: arg.tag }),
    })
    const text = await res.text()
    if (!res.ok) throw new Error(text || `Bulk tag update failed with status ${res.status}`)
    return text ? JSON.parse(text) : { success: true }
  })
}

// --- Tags ---
export function useRenameTag() {
  return useSWRMutation("/api/save/tags", async (url, { arg }: { arg: { oldName: string; newName: string } }) => {
    const token = getToken()
    const res = await fetch(`${API}/api/save/tags`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ oldName: arg.oldName, newName: arg.newName }),
    })
    const text = await res.text()
    if (!res.ok) throw new Error(text || `Rename tag failed with status ${res.status}`)
    return text ? JSON.parse(text) : { success: true }
  })
}

export function useDeleteTag() {
  return useSWRMutation("/api/save/tags", async (url, { arg }: { arg: { tag: string } }) => {
    const token = getToken()
    const res = await fetch(`${API}/api/save/tags`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tag: arg.tag }),
    })
    const text = await res.text()
    if (!res.ok) throw new Error(text || `Delete tag failed with status ${res.status}`)
    return text ? JSON.parse(text) : { success: true }
  })
}

// --- Profile ---
export function useUpdateProfile() {
  return useSWRMutation("/api/profile", async (url, { arg }: { arg: { display_name: string } }) => {
    const token = getToken()
    const res = await fetch(`${API}/api/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ display_name: arg.display_name }),
    })
    const text = await res.text()
    if (!res.ok) throw new Error(text || `Update profile failed with status ${res.status}`)
    return text ? JSON.parse(text) : { success: true }
  })
}
