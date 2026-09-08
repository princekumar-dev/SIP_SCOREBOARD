export function formatTime(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function rankLabel(rank?: number | null) {
  if (!rank) return "—";
  return String(rank).padStart(2, "0");
}

export function motifClass(motif?: string) {
  return `motif-${motif || "creative"}`;
}
