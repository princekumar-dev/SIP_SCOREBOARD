"use client";

const KEY = "sip-arena-token";

export function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(KEY) || "";
}

export function setToken(token: string) {
  localStorage.setItem(KEY, token);
}

export function clearToken() {
  localStorage.removeItem(KEY);
}
