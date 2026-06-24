// Client-side authenticated fetch helper
// Automatically attaches Bearer token and CSRF header

import { useSession } from "@/lib/store";

export interface ApiFetchOptions extends RequestInit {
  body?: unknown;
}

export async function apiFetch(
  url: string,
  opts: ApiFetchOptions = {}
): Promise<Response> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("mot-token") : null;
  const csrf =
    typeof window !== "undefined" ? localStorage.getItem("mot-csrf") : null;

  const headers: Record<string, string> = {
    ...(opts.headers as Record<string, string> | undefined),
  };

  if (opts.body && typeof opts.body === "object" && !(opts.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (csrf) headers["X-CSRF-Token"] = csrf;

  const finalOpts: RequestInit = {
    ...opts,
    headers,
    body:
      opts.body && typeof opts.body === "object" && !(opts.body instanceof FormData)
        ? JSON.stringify(opts.body)
        : (opts.body as BodyInit | undefined),
  };

  const res = await fetch(url, finalOpts);

  // If we got 401, the token is invalid — clear session and redirect
  if (res.status === 401 && typeof window !== "undefined") {
    localStorage.removeItem("mot-token");
    localStorage.removeItem("mot-csrf");
    localStorage.removeItem("mot-hashcat-session");
    // Clear the Zustand store so the UI updates immediately
    useSession.getState().setStudent(null);
    // Reload to clear all client state
    if (window.location.pathname !== "/") {
      window.location.href = "/";
    }
  }

  return res;
}
