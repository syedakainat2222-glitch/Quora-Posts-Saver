import useSWRMutation from "swr/mutation"
import { useSWRConfig } from "swr"

const API = process.env.NEXT_PUBLIC_API_URL || "https://quora-posts-saver2.vercel.app"

const getToken = () => localStorage.getItem("qsaver_session_token") || ""

async function fetcher(url: string, { arg }: { arg: any }) {
  const token = getToken()
  const method = arg.method || "POST"
  const body = arg.body ? JSON.stringify(arg.body) : undefined

  console.log(`[Mutation] ${method} ${url}`, { token: token ? "present" : "missing", body })

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body,
  })

  const text = await res.text()
  console.log(`[Mutation] Response status: ${res.status}, body: ${text}`)

  if (!res.ok) {
    throw new Error(text || `Request failed with status ${res.status}`)
  }
  return JSON.parse(text)
}

// --- Single Post ---
export function useEditPost() {
  return useSWRMutation("/api/save", (url, { arg }: { arg: { id: string; data: any } }) =>
    fetcher(`${API}/api/save/${arg.id}`, {
      method: "PUT",
      body: arg.data,
    })
  )
}

export function useDeletePost() {
  return useSWRMutation("/api/save", (url, { arg }: { arg: { id: string } }) =>
    fetcher(`${API}/api/save/${arg.id}`, {
      method: "DELETE",
    })
  )
}

export function useDuplicatePost() {
  return useSWRMutation("/api/save", (url, { arg }: { arg: any }) =>
    fetcher(`${API}/api/save`, {
      method: "POST",
      body: arg,
    })
  )
}

// --- Bulk ---
export function useBulkDelete() {
  return useSWRMutation("/api/save/bulk", (url, { arg }: { arg: { ids: string[] } }) =>
    fetcher(`${API}/api/save/bulk`, {
      method: "DELETE",
      body: { ids: arg.ids },
    })
  )
}

export function useBulkTagUpdate() {
  return useSWRMutation("/api/save/bulk", (url, { arg }: { arg: { ids: string[]; tag: string } }) =>
    fetcher(`${API}/api/save/bulk`, {
      method: "PATCH",
      body: { ids: arg.ids, tag: arg.tag },
    })
  )
}

// --- Tags ---
export function useRenameTag() {
  return useSWRMutation("/api/save/tags", (url, { arg }: { arg: { oldName: string; newName: string } }) =>
    fetcher(`${API}/api/save/tags`, {
      method: "PUT",
      body: { oldName: arg.oldName, newName: arg.newName },
    })
  )
}

export function useDeleteTag() {
  return useSWRMutation("/api/save/tags", (url, { arg }: { arg: { tag: string } }) =>
    fetcher(`${API}/api/save/tags`, {
      method: "DELETE",
      body: { tag: arg.tag },
    })
  )
}
