import useSWRMutation from "swr/mutation";

const getToken = () => localStorage.getItem("qsaver_session_token");

async function sendRequest(url: string, { arg }: { arg: any }, method: string = "POST") {
  const token = getToken();
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify(arg),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function useEditPost() {
  return useSWRMutation("/api/save", async (url, { arg }: { arg: { id: string; data: any } }) => {
    return sendRequest(`${url}/${arg.id}`, { arg: arg.data }, "PUT");
  });
}

export function useDeletePost() {
  return useSWRMutation("/api/save", async (url, { arg }: { arg: { id: string } }) => {
    return sendRequest(`${url}/${arg.id}`, { arg: {} }, "DELETE");
  });
}

export function useBulkDelete() {
  return useSWRMutation("/api/save/bulk", (url, { arg }: { arg: { ids: string[] } }) => {
    return sendRequest(url, { arg }, "DELETE");
  });
}

export function useBulkTagUpdate() {
  return useSWRMutation("/api/save/bulk", (url, { arg }: { arg: { ids: string[]; tag: string } }) => {
    return sendRequest(url, { arg }, "PATCH");
  });
}

export function useRenameTag() {
  return useSWRMutation("/api/save/tags", (url, { arg }: { arg: { oldName: string; newName: string } }) => {
    return sendRequest(url, { arg }, "PUT");
  });
}

export function useDeleteTag() {
  return useSWRMutation("/api/save/tags", (url, { arg }: { arg: { tag: string } }) => {
    return sendRequest(url, { arg }, "DELETE");
  });
}

export function useDuplicatePost() {
  return useSWRMutation("/api/save", (url, { arg }: { arg: any }) => {
    return sendRequest(url, { arg }, "POST");
  });
}
