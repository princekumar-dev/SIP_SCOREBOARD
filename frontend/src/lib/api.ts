import { API_URL } from "./config";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiGet<T>(path: string, init?: RequestInit & { revalidate?: number }): Promise<T> {
  const { revalidate, ...fetchInit } = init || {};
  const res = await fetch(`${API_URL}${path}`, {
    ...fetchInit,
    next: revalidate !== undefined ? { revalidate } : { revalidate: 30 },
    headers: { ...(fetchInit?.headers || {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Request failed" }));
    throw new ApiError(res.status, body.error || "Request failed");
  }
  return res.json() as Promise<T>;
}

export async function apiSend<T>(path: string, token: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error || "Request failed");
  return data as T;
}
