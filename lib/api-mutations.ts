import useSWRMutation from "swr/mutation"

const API = process.env.NEXT_PUBLIC_API_URL || "https://quora-posts-saver2.vercel.app"

const getToken = () => localStorage.getItem("qsaver_session_token") || ""

// Generic mutator – handles all HTTP methods
async function mutator(url: string, { arg }: { arg: { method: string; body?: any } }) {
  const token = getToken()
  const { method, body } = arg

  console.log(`[API] ${method} ${url}`, { token: token ? "present" : "missing", body })

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  console.log(`[API] Response ${res.status}:`, text)

  if (!res.ok) {
    throw new Error(text || `Request failed with status ${res.status}`)
  }
  return text ? JSON.parse(text) : null
}

// --- Single Post ---
export function useEditPost() {
  return useSWRMutation("/api/save", (url, { arg }: { arg: { id: string; data: any } }) =>
    mutator(`${API}/api/save/${arg.id}`, {
      method: "PUT",
      body: arg.data,
    })
  )
}

export function useDeletePost() {
  return useSWRMutation("/api/save", (url, { arg }: { arg: { id: string } }) =>
    mutator(`${API}/api/save/${arg.id}`, {
      method: "DELETE",
    })
  )
}

export function useDuplicatePost() {
  return useSWRMutation("/api/save", (url, { arg }: { arg: any }) =>
    mutator(`${API}/api/save`, {
      method: "POST",
      body: arg,
    })
  )
}

// --- Bulk ---
export function useBulkDelete() {
  return useSWRMutation("/api/save/bulk", (url, { arg }: { arg: { ids: string[] } }) =>
    mutator(`${API}/api/save/bulk`, {
      method: "DELETE",
      body: { ids: arg.ids },
    })
  )
}

export function useBulkTagUpdate() {
  return useSWRMutation("/api/save/bulk", (url, { arg }: { arg: { ids: string[]; tag: string } }) =>
    mutator(`${API}/api/save/bulk`, {
      method: "PATCH",
      body: { ids: arg.ids, tag: arg.tag },
    })
  )
}

// --- Tags ---
export function useRenameTag() {
  return useSWRMutation("/api/save/tags", (url, { arg }: { arg: { oldName: string; newName: string } }) =>
    mutator(`${API}/api/save/tags`, {
      method: "PUT",
      body: { oldName: arg.oldName, newName: arg.newName },
    })
  )
}

export function useDeleteTag() {
  return useSWRMutation("/api/save/tags", (url, { arg }: { arg: { tag: string } }) =>
    mutator(`${API}/api/save/tags`, {
      method: "DELETE",
      body: { tag: arg.tag },
    })
  )
}
