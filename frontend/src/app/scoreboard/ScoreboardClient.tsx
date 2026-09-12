"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LiveBadge, useLiveRefresh } from "@/components/LiveBadge";
import { SOCKET_URL } from "@/lib/config";
import { formatTime, rankLabel } from "@/lib/format";
import { getToken } from "@/lib/auth";
import { apiSend } from "@/lib/api";
import type { LeaderboardRow, Venue } from "@/lib/types";

const GROUP_THEMES: Record<string, string> = {
  "Group I": "Creative & Design",
  "Group II": "Technology & Innovation",
  "Group III": "Space & Cosmic",
  "Group IV": "Legends & Mythology",
  "Group V": "Power & Energy",
};

const GROUPS_META = [
  { id: "all", label: "Overall", icon: "🏆" },
  { id: "Group I", label: "Group I · Creative & Design", icon: "🎨" },
  { id: "Group II", label: "Group II · Technology & Innovation", icon: "💻" },
  { id: "Group III", label: "Group III · Space & Cosmic", icon: "🚀" },
  { id: "Group IV", label: "Group IV · Legends & Mythology", icon: "🛡️" },
  { id: "Group V", label: "Group V · Power & Energy", icon: "⚡" },
];

function assignGroupRanks(tribes: LeaderboardRow[]) {
  const sorted = [...tribes].sort(
    (a, b) => b.totalScore - a.totalScore || a.tribeCode.localeCompare(b.tribeCode)
  );
  let currentRank = 0;
  let prevScore: number | null = null;
  return sorted.map((row, index) => {
    if (row.totalScore === 0 || row.totalScore === null) {
      return { ...row, rank: 0 };
    }
    if (row.totalScore !== prevScore) {
      currentRank = index + 1;
      prevScore = row.totalScore;
    }
    return { ...row, rank: currentRank };
  });
}

export function ScoreboardClient({
  venues: initialVenues,
  initial,
}: {
  venues: Venue[];
  initial: {
    lastUpdated: string;
    rows: LeaderboardRow[];
    venue?: { id: string; theme: string; location: string; groupName?: string; venueName?: string } | null;
  };
}) {
  const params = useSearchParams();
  const groupParam = params.get("group") || params.get("groupName");
  const venueParam = params.get("venue") || params.get("venueId");
  const stationParam = params.get("station");
  const cleanGroup = groupParam && groupParam.trim() !== "" && groupParam !== "all" ? groupParam.trim() : null;
  const cleanVenue = venueParam && venueParam.trim() !== "" && venueParam !== "all" ? venueParam.trim() : null;
  const requestedParam = cleanGroup || cleanVenue || "all";

  // Station locked mode is active when opened specifically for a group station or station=true
  const isStationLocked = Boolean(cleanGroup || cleanVenue || stationParam === "true" || stationParam === "1");

  const [selectedGroup, setSelectedGroup] = useState(requestedParam);
  const [allTribes, setAllTribes] = useState<LeaderboardRow[]>(initial.rows || []);
  const [venues, setVenues] = useState<Venue[]>(initialVenues || []);
  const [updated, setUpdated] = useState(initial.lastUpdated || new Date().toISOString());
  const [index, setIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (requestedParam) {
      setSelectedGroup(requestedParam);
    }
  }, [requestedParam]);

  useEffect(() => {
    const token = getToken();
    if (token) {
      setHasToken(true);
      if (requestedParam === "all") {
        apiSend<any>("/api/admin/me", token, "GET")
          .then((me) => {
            if (me.role !== "super_admin") {
              const defaultTarget = me.venue?.groupName;
              if (defaultTarget) {
                setSelectedGroup(defaultTarget);
              }
            }
          })
          .catch(() => {});
      }
    }
  }, [requestedParam]);

  // Refresh latest overall scores & venue mappings in real time
  const refresh = useCallback(async () => {
    try {
      const [resBoard, resVenues] = await Promise.all([
        fetch(`${SOCKET_URL}/api/leaderboard`, { cache: "no-store" }),
        fetch(`${SOCKET_URL}/api/venues`, { cache: "no-store" }),
      ]);
      if (resBoard.ok) {
        const data = await resBoard.json();
        if (data.rows && Array.isArray(data.rows)) {
          setAllTribes(data.rows);
        }
        setUpdated(data.lastUpdated || new Date().toISOString());
      }
      if (resVenues.ok) {
        const dataV = await resVenues.json();
        if (Array.isArray(dataV)) {
          setVenues(dataV);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const live = useLiveRefresh(refresh);

  // Active venue assigned to selected group
  const activeVenue = useMemo(() => {
    if (selectedGroup === "all") return null;
    return (
      venues.find(
        (v) =>
          v.groupName?.toLowerCase() === selectedGroup.toLowerCase() ||
          v.id === selectedGroup ||
          v.venueName?.toLowerCase() === selectedGroup.toLowerCase()
      ) || null
    );
  }, [venues, selectedGroup]);

  // Filter and rank tribes for selected view instantly
  const currentRows = useMemo(() => {
    if (selectedGroup === "all") {
      return allTribes;
    }
    const matching = allTribes.filter((t) => {
      if (t.groupName && t.groupName.toLowerCase() === selectedGroup.toLowerCase()) return true;
      if (activeVenue && t.venueId === activeVenue.id) return true;
      return false;
    });
    return assignGroupRanks(matching);
  }, [allTribes, selectedGroup, activeVenue]);

  const isHostSpecific = selectedGroup !== "all";

  // Auto-scroll animation only on overall if > 10 tribes
  useEffect(() => {
    if (isHostSpecific || currentRows.length <= 10) return;
    const timer = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setIndex((i) => (i + 8) % currentRows.length);
        setTransitioning(false);
      }, 400);
    }, 8000);
    return () => clearInterval(timer);
  }, [currentRows.length, isHostSpecific]);

  const visible = useMemo(() => {
    if (isHostSpecific || currentRows.length <= 10) return currentRows;
    return Array.from({ length: 8 }, (_, i) => currentRows[(index + i) % currentRows.length]);
  }, [currentRows, index, isHostSpecific]);

  // Group switcher buttons list
  const groupsList = useMemo(() => {
    return GROUPS_META.map((g) => {
      if (g.id === "all") {
        return {
          id: "all",
          label: `Overall (${allTribes.length || 91} Tribes)`,
          icon: "🏆",
          location: undefined,
        };
      }
      const assigned = venues.find(
        (v) => v.groupName && v.groupName.toLowerCase() === g.id.toLowerCase()
      );
      const tribeCount = allTribes.filter(
        (t) => t.groupName?.toLowerCase() === g.id.toLowerCase()
      ).length;
      return {
        id: g.id,
        label: `${g.label}${tribeCount ? ` (${tribeCount})` : ""}`,
        icon: g.icon,
        location: assigned?.location,
      };
    });
  }, [venues, allTribes]);

  // Active Title, Subtitle, and Badge
  const activeTitle = useMemo(() => {
    if (selectedGroup === "all") {
      return "Overall SIP Grand Leaderboard";
    }
    if (GROUP_THEMES[selectedGroup]) {
      return `${selectedGroup}: ${GROUP_THEMES[selectedGroup]}`;
    }
    if (activeVenue?.theme && activeVenue.theme !== "Pending Group Selection") {
      return activeVenue.groupName ? `${activeVenue.groupName}: ${activeVenue.theme}` : activeVenue.theme;
    }
    return `${selectedGroup} Standings`;
  }, [selectedGroup, activeVenue]);

  const activeBadge = useMemo(() => {
    if (selectedGroup === "all") {
      return "Projector Grand Scoreboard";
    }
    if (activeVenue?.location && activeVenue.location !== "No Venue Allocated") {
      return `📍 Station Projector · ${activeVenue.location}`;
    }
    return `📍 Station Projector · ${selectedGroup}`;
  }, [selectedGroup, activeVenue]);

  const activeSubtitle = useMemo(() => {
    if (selectedGroup === "all") {
      return `All 5 Campus Halls · ${allTribes.length || 91} Competing Tribes`;
    }
    if (activeVenue?.location && activeVenue.location !== "No Venue Allocated") {
      const vName = activeVenue.venueName ? ` (${activeVenue.venueName})` : "";
      return `📍 ${activeVenue.location}${vName} · ${currentRows.length} Competing Tribes`;
    }
    return `📍 No Venue Allocated · ${currentRows.length} Competing Tribes`;
  }, [selectedGroup, activeVenue, allTribes.length, currentRows.length]);

  return (
    <div className="scoreboard-bg min-h-screen text-[#f7f1e6] flex flex-col justify-between relative">
      {/* Ambient glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-[#e4b84a]/[0.05] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-[#4b1d7a]/25 rounded-full blur-[100px] pointer-events-none" />
      <div className="ambient-orb ambient-orb-gold w-[200px] h-[200px] top-[20%] right-[15%] opacity-40" style={{ animationDelay: "2s" }} />
      <div className="ambient-orb ambient-orb-purple w-[180px] h-[180px] bottom-[25%] left-[25%] opacity-30" style={{ animationDelay: "6s" }} />

      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-5 py-6 sm:py-8 md:px-8 flex-1 flex flex-col">
        {/* Top Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6 pb-5 sm:pb-6 border-b border-white/[0.08] animate-fade-in">
          <div>
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e4b84a]/15 border border-[#e4b84a]/25 px-2.5 sm:px-3 py-0.5 sm:py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#e4b84a] animate-pulse" />
                <span className="text-[9px] sm:text-[10px] font-bold font-mono uppercase tracking-[0.14em] sm:tracking-[0.18em] text-[#e4b84a]">
                  {activeBadge}
                </span>
              </span>
              <span className="text-[10px] sm:text-[11px] text-white/45 font-medium">MSEC SIP 2026–27</span>
            </div>
            <h1 className="display text-2xl sm:text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              {activeTitle}
            </h1>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-[#e4b84a]/80 font-medium flex items-center gap-1.5">
              <span className="truncate">{activeSubtitle}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between md:justify-start gap-2.5 sm:gap-3 md:self-center">
            <div className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3 sm:px-4 py-1.5 sm:py-2 backdrop-blur-md">
              <LiveBadge live={live} />
              <span suppressHydrationWarning className="text-[10px] sm:text-[11px] font-mono text-white/60">
                {mounted ? formatTime(updated) : "—"}
              </span>
            </div>

            <Link
              href={hasToken ? "/admin" : "/"}
              className="rounded-2xl border border-white/[0.12] bg-white/[0.06] backdrop-blur-md px-4 sm:px-5 py-2 sm:py-2.5 text-xs font-bold text-white hover:bg-white/[0.1] hover:border-[#e4b84a]/40 hover:text-[#e4b84a] transition-all flex items-center gap-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
            >
              <span>{hasToken ? "←" : "🏠"}</span>
              <span>{hasToken ? "Exit to Admin" : "Exit Scoreboard"}</span>
            </Link>
          </div>
        </div>

        {/* Group / Venue Switcher Bar — ONLY visible on Overall / Multi-hall projector, hidden when locked to a specific station projector */}
        {!isStationLocked && (
          <div className="my-4 sm:my-5 flex overflow-x-auto no-scrollbar flex-nowrap md:flex-wrap items-center gap-2 pb-1 animate-fade-in">
            {groupsList.map((grp) => {
              const isSelected =
                selectedGroup.toLowerCase() === grp.id.toLowerCase() ||
                (grp.id !== "all" && activeVenue?.groupName?.toLowerCase() === grp.id.toLowerCase());
              return (
                <button
                  key={grp.id}
                  type="button"
                  onClick={() => {
                    setSelectedGroup(grp.id);
                    setIndex(0);
                  }}
                  className={`rounded-2xl px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? "bg-gradient-to-r from-[#e4b84a] to-[#d4a332] text-[#12071f] shadow-lg shadow-[#e4b84a]/20 ring-1 ring-[#e4b84a]/30 scale-[1.02]"
                      : "border border-white/[0.1] bg-white/[0.04] backdrop-blur-sm text-white/70 hover:bg-white/[0.08] hover:border-white/20 hover:text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                  }`}
                >
                  <span>{grp.icon}</span>
                  <span>{grp.label}</span>
                  {grp.location && (
                    <span className="text-[10px] opacity-60 hidden md:inline">· {grp.location}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Scoreboard Rows */}
        <div className="flex-1 space-y-2 sm:space-y-3 mt-2 sm:mt-3">
          {visible.length === 0 ? (
            <div className="py-16 sm:py-24 text-center rounded-2xl sm:rounded-3xl border border-white/[0.08] bg-white/[0.03] p-5 sm:p-8 animate-fade-in">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 opacity-30">📊</div>
              <p className="text-base sm:text-xl font-bold text-white/70">No scores recorded yet for this group.</p>
              <p className="mt-1 text-xs text-white/40">Evaluations submitted by venue hosts will appear live here instantly.</p>
            </div>
          ) : (
            visible.map((row, i) => {
              const rowTheme = row.theme || row.venueTheme || (row.groupName ? GROUP_THEMES[row.groupName] : "");
              const displayRank = row.rank ? rankLabel(row.rank) : i + 1;
              return (
                <div
                  key={`${row.id}-${selectedGroup}-${i}`}
                  className={`grid grid-cols-[38px_1fr_auto] sm:grid-cols-[64px_1fr_auto] md:grid-cols-[80px_1fr_auto] items-center rounded-xl sm:rounded-2xl border px-3 sm:px-5 py-2.5 sm:py-4 transition-all duration-300 ${
                    row.rank === 1
                      ? "border-[#e4b84a]/40 bg-gradient-to-r from-[#e4b84a]/[0.12] via-white/[0.04] to-transparent rank-glow-gold"
                      : row.rank === 2
                      ? "border-slate-300/30 bg-gradient-to-r from-slate-300/[0.08] via-white/[0.04] to-transparent rank-glow-silver"
                      : row.rank === 3
                      ? "border-amber-600/30 bg-gradient-to-r from-amber-600/[0.08] via-white/[0.04] to-transparent rank-glow-bronze"
                      : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05]"
                  }`}
                  style={{
                    opacity: transitioning ? 0 : 1,
                    transform: transitioning ? "translateY(6px)" : "translateY(0)",
                    transition: `opacity 0.35s ease, transform 0.35s ease`,
                    animationDelay: `${i * 0.03}s`,
                  }}
                >
                  <span
                    className={`display text-lg sm:text-2xl md:text-3xl font-extrabold ${
                      row.rank === 1
                        ? "text-[#e4b84a]"
                        : row.rank === 2
                        ? "text-slate-300"
                        : row.rank === 3
                        ? "text-amber-500"
                        : "text-white/30"
                    }`}
                  >
                    {displayRank}
                  </span>

                  <div className="min-w-0 pr-2 sm:pr-4">
                    <span className="display block text-sm sm:text-lg md:text-2xl font-bold text-white truncate leading-tight">
                      {row.tribeName}
                    </span>
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-white/45">
                      <span className="font-mono text-[10px] sm:text-[11px] font-bold text-[#e4b84a]/80">{row.tribeCode}</span>
                      {row.groupName && (
                        <>
                          <span className="text-white/20">·</span>
                          <span className="font-semibold text-white/70">{row.groupName}</span>
                        </>
                      )}
                      {rowTheme && (
                        <>
                          <span className="text-white/20">·</span>
                          <span className="truncate">{rowTheme}</span>
                        </>
                      )}
                      {row.location && row.location !== "No Venue Allocated" && (
                        <>
                          <span className="text-white/20 hidden sm:inline">·</span>
                          <span className="text-white/60 truncate hidden sm:inline">📍 {row.location}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="display text-xl sm:text-3xl md:text-4xl font-extrabold text-[#e4b84a] tracking-tight tabular-nums">
                      {row.totalScore}
                    </span>
                    <span className="block text-[7px] sm:text-[10px] uppercase tracking-[0.16em] text-white/30 font-semibold">pts</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
