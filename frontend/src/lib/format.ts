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

export function formatMemberMeta(department?: string, classSection?: string): string {
  const dept = (department || "").trim();
  const sec = (classSection || "").trim();

  if (!dept && !sec) return "Participant";
  if (!dept) return sec;
  if (!sec) return dept;

  const cleanDept = dept.toLowerCase().replace(/[^a-z0-9]/g, "");
  const cleanSec = sec.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (cleanDept === cleanSec) {
    return dept;
  }

  if (/^group\s*[ivxlcdm0-9]+$/i.test(sec)) {
    return dept;
  }

  if (
    cleanSec.includes(cleanDept) ||
    cleanDept.includes(cleanSec) ||
    sec.toLowerCase().startsWith(dept.toLowerCase())
  ) {
    return sec.length >= dept.length ? sec : dept;
  }

  if (
    [
      "creative & design",
      "technology & innovation",
      "space & cosmic",
      "legends & mythology",
      "power & energy",
    ].includes(dept.toLowerCase())
  ) {
    return dept;
  }

  return `${dept} · ${sec}`;
}

