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

const GROUP_ICONS: Record<string, string> = {
  "Group I": "🎨",
  "Group II": "💻",
  "Group III": "🚀",
  "Group IV": "🛡️",
  "Group V": "⚡",
};

export function ScoreboardClient({
  venues,
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
  const cleanGroup = groupParam && groupParam.trim() !== "" ? groupParam.trim() : null;
  const cleanVenue = venueParam && venueParam.trim() !== "" ? venueParam.trim() : null;
  const requestedParam = cleanGroup || cleanVenue || "all";

  const [selectedIdentifier, setSelectedIdentifier] = useState(requestedParam);
  const [rows, setRows] = useState(initial.rows);
  const [updated, setUpdated] = useState(initial.lastUpdated);
  const [currentVenueInfo, setCurrentVenueInfo] = useState<any>(initial.venue || null);
  const [index, setIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    if (requestedParam) {
      setSelectedIdentifier(requestedParam);
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
              const defaultTarget = me.venue?.groupName || me.venueId;
              if (defaultTarget) {
                setSelectedIdentifier(defaultTarget);
              }
            }
          })
          .catch(() => {});
      }
    }
  }, [requestedParam]);

  const venue = useMemo(() => {
    if (!selectedIdentifier || selectedIdentifier === "all") return null;
    return (
      venues.find(
        (item) =>
          item.id === selectedIdentifier ||
          item.id === cleanVenue ||
          item.groupName?.toLowerCase() === selectedIdentifier.toLowerCase() ||
          item.location?.toLowerCase().includes(selectedIdentifier.toLowerCase()) ||
          item.theme?.toLowerCase().includes(selectedIdentifier.toLowerCase())
      ) || currentVenueInfo
    );
  }, [venues, selectedIdentifier, cleanVenue, currentVenueInfo]);

  const path = selectedIdentifier === "all" ? "/api/leaderboard" : `/api/leaderboard/venue/${encodeURIComponent(selectedIdentifier)}`;

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${SOCKET_URL}${path}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (data.rows) {
        setRows(data.rows);
      }
      if (data.venue) {
        setCurrentVenueInfo(data.venue);
      } else if (selectedIdentifier === "all") {
        setCurrentVenueInfo(null);
      }
      setUpdated(data.lastUpdated || new Date().toISOString());
    } catch {
      // ignore
    }
  }, [path, selectedIdentifier]);

  useEffect(() => {
    refresh();
    setIndex(0);
  }, [refresh]);

  const live = useLiveRefresh(refresh);

  const isHostSpecific = selectedIdentifier !== "all";

  const filteredRows = useMemo(() => {
    if (!isHostSpecific) return rows;
    if (rows.length <= 20) return rows;
    const matched = rows.filter((r) => {
      if (venue) {
        if (r.venueId === venue.id) return true;
        if (venue.groupName && r.groupName?.toLowerCase() === venue.groupName.toLowerCase()) return true;
        if (venue.location && r.location?.toLowerCase().includes(venue.location.toLowerCase())) return true;
      }
      if (r.groupName?.toLowerCase() === selectedIdentifier.toLowerCase()) return true;
      if (r.venueId === selectedIdentifier) return true;
      if (r.location?.toLowerCase().includes(selectedIdentifier.toLowerCase())) return true;
      return false;
    });
    return matched;
  }, [rows, isHostSpecific, selectedIdentifier, venue]);

  useEffect(() => {
    if (isHostSpecific || filteredRows.length <= 10) return;
    const timer = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setIndex((i) => (i + 8) % filteredRows.length);
        setTransitioning(false);
      }, 400);
    }, 8000);
    return () => clearInterval(timer);
  }, [filteredRows.length, isHostSpecific]);

  const visible = useMemo(() => {
    if (isHostSpecific || filteredRows.length <= 10) return filteredRows;
    return Array.from({ length: 8 }, (_, i) => filteredRows[(index + i) % filteredRows.length]);
  }, [filteredRows, index, isHostSpecific]);

  // Build group list dynamically from real venue data (shown only on overall / multi-hall projector)
  const groupsList = useMemo(() => {
    const all = { id: "all", label: "Overall (90 Tribes)", icon: "🏆", location: undefined as string | undefined };
    const groupButtons = venues.map((v) => ({
      id: v.groupName,
      label: `${v.groupName} · ${v.theme}`,
      icon: GROUP_ICONS[v.groupName] || "🛡️",
      location: v.location,
    }));
    return [all, ...groupButtons];
  }, [venues]);

  return (
    <div className="scoreboard-bg min-h-screen text-[#f7f1e6] flex flex-col justify-between relative">
      {/* Ambient glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-[#e4b84a]/[0.05] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-[#4b1d7a]/25 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative mx-auto w-full max-w-6xl px-5 py-8 md:px-8 flex-1 flex flex-col">
        {/* Top Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-white/[0.08] animate-fade-in">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e4b84a]/15 border border-[#e4b84a]/25 px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#e4b84a] animate-pulse" />
                <span className="text-[10px] font-bold font-mono uppercase tracking-[0.18em] text-[#e4b84a]">
                  {isHostSpecific ? `📍 Station Projector · ${venue?.location || "Assigned Hall"}` : "Projector Grand Scoreboard"}
                </span>
              </span>
              <span className="text-[11px] text-white/45 font-medium">MSEC SIP 2026–27</span>
            </div>
            <h1 className="display text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              {venue
                ? `${venue.groupName ? `${venue.groupName}: ` : ""}${venue.theme}`
                : "Overall SIP Grand Leaderboard"}
            </h1>
            <p className="mt-2 text-sm text-[#e4b84a]/80 font-medium flex items-center gap-1.5">
              <span>📍</span>
              <span>
                {venue
                  ? `${venue.location} (${venue.venueName || "Station"}) · ${filteredRows.length} Competing Tribes`
                  : "All 5 Campus Halls · 90 Competing Tribes"}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 md:self-center">
            <div className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 backdrop-blur-md">
              <LiveBadge live={live} />
              <span className="text-[11px] font-mono text-white/60">
                {formatTime(updated)}
              </span>
            </div>

            <Link
              href={hasToken ? "/admin" : "/"}
              className="rounded-2xl border border-white/[0.12] bg-white/[0.06] px-5 py-2.5 text-xs font-bold text-white hover:bg-white/[0.1] hover:border-[#e4b84a]/40 hover:text-[#e4b84a] transition-all backdrop-blur-md flex items-center gap-1.5"
            >
              <span>{hasToken ? "←" : "🏠"}</span>
              <span>{hasToken ? "Exit to Admin" : "Exit Scoreboard"}</span>
            </Link>
          </div>
        </div>

        {/* Group / Venue Switcher Bar — ONLY visible on Overall Multi-Hall Scoreboard, NOT on Station Projector */}
        {!isHostSpecific && (
          <div className="my-5 flex flex-wrap items-center gap-2 animate-fade-in">
            {groupsList.map((grp) => {
              const isSelected =
                selectedIdentifier === grp.id ||
                (grp.id !== "all" && venue?.groupName === grp.id);
              return (
                <button
                  key={grp.id}
                  type="button"
                  onClick={() => {
                    setSelectedIdentifier(grp.id);
                    setIndex(0);
                  }}
                  className={`rounded-2xl px-4 py-2 text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-gradient-to-r from-[#e4b84a] to-[#d4a332] text-[#12071f] shadow-lg shadow-[#e4b84a]/20 ring-1 ring-[#e4b84a]/30 scale-[1.02]"
                      : "border border-white/[0.1] bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:border-white/20"
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
        <div className="flex-1 space-y-3 mt-4">
          {visible.length === 0 ? (
            <div className="py-24 text-center rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8 animate-fade-in">
              <div className="text-4xl mb-4 opacity-30">📊</div>
              <p className="text-xl font-bold text-white/70">No scores recorded yet for this station.</p>
              <p className="mt-1 text-xs text-white/40">Evaluations submitted by venue hosts will appear live here instantly.</p>
            </div>
          ) : (
            visible.map((row, i) => (
              <div
                key={`${row.id}-${row.rank}-${i}`}
                className={`grid grid-cols-[64px_1fr_auto] md:grid-cols-[80px_1fr_auto] items-center rounded-2xl border px-5 py-4 transition-all duration-300 ${
                  row.rank === 1
                    ? "border-[#e4b84a]/40 bg-gradient-to-r from-[#e4b84a]/[0.12] via-white/[0.04] to-transparent shadow-lg shadow-[#e4b84a]/[0.08]"
                    : row.rank === 2
                    ? "border-slate-300/30 bg-gradient-to-r from-slate-300/[0.08] via-white/[0.04] to-transparent"
                    : row.rank === 3
                    ? "border-amber-600/30 bg-gradient-to-r from-amber-600/[0.08] via-white/[0.04] to-transparent"
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
                  className={`display text-2xl md:text-3xl font-extrabold ${
                    row.rank === 1
                      ? "text-[#e4b84a]"
                      : row.rank === 2
                      ? "text-slate-300"
                      : row.rank === 3
                      ? "text-amber-500"
                      : "text-white/30"
                  }`}
                >
                  {row.rank ? rankLabel(row.rank) : i + 1}
                </span>

                <div className="min-w-0 pr-4">
                  <span className="display block text-lg md:text-2xl font-bold text-white truncate leading-tight">
                    {row.tribeName}
                  </span>
                  <div className="flex items-center gap-2 mt-1 text-xs text-white/45">
                    <span className="font-mono text-[11px] font-bold text-[#e4b84a]/80">{row.tribeCode}</span>
                    <span className="text-white/20">·</span>
                    <span className="truncate">{row.groupName ? `${row.groupName} · ${row.theme}` : row.theme}</span>
                    {row.location && (
                      <>
                        <span className="text-white/20">·</span>
                        <span className="text-white/60 truncate">📍 {row.location}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="display text-3xl md:text-4xl font-extrabold text-[#e4b84a] tracking-tight tabular-nums">
                    {row.totalScore}
                  </span>
                  <span className="block text-[10px] uppercase tracking-[0.18em] text-white/30 font-semibold">pts</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
