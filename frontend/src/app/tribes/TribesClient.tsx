"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { rankLabel } from "@/lib/format";
import type { TribeSummary, Venue } from "@/lib/types";
import { TribeModal } from "@/components/TribeModal";
import { LiveBadge, useLiveRefresh } from "@/components/LiveBadge";
import { SOCKET_URL } from "@/lib/config";

const GROUPS = [
  { groupName: "Group I", theme: "Creative & Design", icon: "🎨" },
  { groupName: "Group II", theme: "Technology & Innovation", icon: "💻" },
  { groupName: "Group III", theme: "Space & Cosmic", icon: "🚀" },
  { groupName: "Group IV", theme: "Legends & Mythology", icon: "🛡️" },
  { groupName: "Group V", theme: "Power & Energy", icon: "⚡" },
];

export function TribesClient({
  initialTribes,
  venues,
}: {
  initialTribes: TribeSummary[];
  venues: Venue[];
}) {
  const [tribesList, setTribesList] = useState<TribeSummary[]>(initialTribes);
  const [selectedTribeId, setSelectedTribeId] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"code" | "rank" | "score" | "name">("code");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const refreshTribes = useCallback(async () => {
    try {
      const res = await fetch(`${SOCKET_URL}/api/tribes`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setTribesList(data);
      }
    } catch {
      // ignore
    }
  }, []);

  const live = useLiveRefresh(refreshTribes);

  const filteredTribes = useMemo(() => {
    let list = [...tribesList];

    if (activeGroup !== "all") {
      list = list.filter((t) => t.groupName === activeGroup || t.theme?.toLowerCase().includes(activeGroup.toLowerCase()));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.tribeName.toLowerCase().includes(q) ||
          t.tribeCode.toLowerCase().includes(q) ||
          t.venueTheme.toLowerCase().includes(q) ||
          t.location.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (sortBy === "code") return a.tribeCode.localeCompare(b.tribeCode);
      if (sortBy === "rank") return (a.rank ?? 999) - (b.rank ?? 999);
      if (sortBy === "score") return b.totalScore - a.totalScore;
      if (sortBy === "name") return a.tribeName.localeCompare(b.tribeName);
      return 0;
    });

    return list;
  }, [tribesList, activeGroup, searchQuery, sortBy]);

  return (
    <div>
      {/* Controls Header */}
      <div className="space-y-4">
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-2xl border border-[#4b1d7a]/[0.1] bg-white/90 p-3.5 sm:p-4 backdrop-blur-xl shadow-sm">
          <div className="relative w-full flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#6d6178]">🔍</span>
            <input
              type="text"
              placeholder="Search by tribe name, code (e.g. SIP-018), or hall..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[#4b1d7a]/[0.12] bg-white py-2.5 pl-10 pr-8 text-sm outline-none focus:border-[#e4b84a] focus:ring-2 focus:ring-[#e4b84a]/10 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6d6178] hover:text-[#12071f] transition-colors"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center justify-between md:justify-start gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[#6d6178] font-semibold">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-lg border border-[#4b1d7a]/[0.12] bg-white px-2.5 sm:px-3 py-1.5 font-medium text-[#4b1d7a] outline-none focus:border-[#e4b84a] transition-all cursor-pointer"
              >
                <option value="code">Tribe Code (SIP-001...)</option>
                <option value="rank">Overall Rank (1st...)</option>
                <option value="score">Highest Score</option>
                <option value="name">Tribe Name (A-Z)</option>
              </select>
            </div>

            <div className="flex rounded-lg border border-[#4b1d7a]/[0.12] bg-white p-0.5 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`rounded-md px-3 py-1 text-xs font-bold transition-all ${
                  viewMode === "grid" ? "bg-[#4b1d7a] text-white shadow-sm" : "text-[#4b1d7a] hover:bg-[#4b1d7a]/[0.04]"
                }`}
              >
                Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`rounded-md px-3 py-1 text-xs font-bold transition-all ${
                  viewMode === "table" ? "bg-[#4b1d7a] text-white shadow-sm" : "text-[#4b1d7a] hover:bg-[#4b1d7a]/[0.04]"
                }`}
              >
                Table
              </button>
            </div>
          </div>
        </div>

        {/* Group Filter Pills */}
        <div className="flex overflow-x-auto no-scrollbar flex-nowrap sm:flex-wrap gap-2 pt-1 pb-1">
          <button
            type="button"
            onClick={() => setActiveGroup("all")}
            className={`rounded-full px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs font-bold transition-all duration-300 cursor-pointer shrink-0 ${
              activeGroup === "all"
                ? "bg-[#12071f] text-[#e4b84a] shadow-md ring-2 ring-[#e4b84a]/30 scale-105"
                : "bg-white text-[#12071f] border border-[#4b1d7a]/15 hover:border-[#4b1d7a]/30"
            }`}
          >
            All Groups ({tribesList.length})
          </button>
          {GROUPS.map((g, idx) => {
            const count = tribesList.filter((t) => t.groupName === g.groupName).length || (g.groupName === "Group V" ? 19 : 18);
            const isActive = activeGroup === g.groupName;
            const activeClass =
              idx === 0
                ? "pill-g1-active scale-105"
                : idx === 1
                ? "pill-g2-active scale-105"
                : idx === 2
                ? "pill-g3-active scale-105"
                : idx === 3
                ? "pill-g4-active scale-105"
                : "pill-g5-active scale-105";

            const defaultPillClass =
              idx === 0
                ? "pill-g1 hover:border-rose-400"
                : idx === 1
                ? "pill-g2 hover:border-cyan-400"
                : idx === 2
                ? "pill-g3 hover:border-purple-400"
                : idx === 3
                ? "pill-g4 hover:border-amber-400"
                : "pill-g5 hover:border-orange-400";

            return (
              <button
                key={g.groupName}
                type="button"
                onClick={() => setActiveGroup(g.groupName)}
                className={`rounded-full px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isActive ? activeClass : defaultPillClass
                }`}
              >
                <span>{g.icon}</span>
                <span>{g.groupName}: {g.theme} ({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Sync & Results Count */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-xs text-[#6d6178]">
        <div className="flex items-center gap-2">
          <span>Showing <strong className="text-[#12071f] font-bold">{filteredTribes.length}</strong> tribes</span>
          {activeGroup !== "all" && (
            <span className="rounded-full bg-[#4b1d7a]/10 px-2.5 py-0.5 text-[11px] font-extrabold text-[#4b1d7a] border border-[#4b1d7a]/20">
              {activeGroup}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <LiveBadge live={live} />
          <span className="text-[11px] font-semibold text-emerald-700">Real-time Location & Score Sync</span>
        </div>
      </div>

      {/* Display: Grid View */}
      {viewMode === "grid" ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTribes.map((tribe) => {
            const groupIdx = GROUPS.findIndex((g) => g.groupName === tribe.groupName);
            const cardThemeClass =
              groupIdx === 0
                ? "group-card-1"
                : groupIdx === 1
                ? "group-card-2"
                : groupIdx === 2
                ? "group-card-3"
                : groupIdx === 3
                ? "group-card-4"
                : groupIdx === 4
                ? "group-card-5"
                : "";

            return (
              <div
                key={tribe.id}
                onClick={() => setSelectedTribeId(tribe.id)}
                className={`panel group relative flex cursor-pointer flex-col justify-between p-5 hover-lift tilt-hover ${cardThemeClass}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-xl bg-black/5 px-2.5 py-1 text-xs font-mono font-extrabold text-[#12071f] border border-black/10">
                      {tribe.tribeCode}
                    </span>
                    <div className="text-right">
                      {tribe.rank ? (
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] tracking-wider uppercase text-[#6d6178] font-bold">Rank</span>
                          <span className={`display rounded-lg px-2 py-0.5 text-xs font-extrabold ${
                            tribe.rank === 1
                              ? "bg-[#e4b84a] text-[#12071f]"
                              : tribe.rank === 2
                              ? "bg-slate-300 text-slate-800"
                              : tribe.rank === 3
                              ? "bg-amber-600 text-white"
                              : "bg-black/5 text-[#4b1d7a]"
                          }`}>
                            {rankLabel(tribe.rank)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-[#6d6178] font-medium">Unranked</span>
                      )}
                    </div>
                  </div>

                  <h2 className="display mt-3 text-xl font-bold text-[#160b24] group-hover:text-[#4b1d7a] transition-colors leading-tight truncate">
                    {tribe.tribeName}
                  </h2>

                  <p className="mt-1 text-xs font-bold text-[#4b1d7a]">
                    {tribe.groupName ? `${tribe.groupName} · ${tribe.theme}` : tribe.theme}
                  </p>

                  <p className="mt-2.5 flex items-center gap-1.5 text-xs text-[#6d6178]">
                    <span>{tribe.location && tribe.location !== "No Venue Allocated" ? "📍" : "⚠️"}</span>
                    <span className={tribe.location && tribe.location !== "No Venue Allocated" ? "font-semibold text-[#12071f]" : "font-semibold text-amber-700"}>
                      {tribe.location && tribe.location !== "No Venue Allocated" ? tribe.location : "No Venue Allocated"}
                    </span>
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-black/[0.06] pt-3.5">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[#6d6178] font-bold">Total Score</span>
                    <p className="display text-2xl font-extrabold text-[#12071f] group-hover:text-[#4b1d7a] transition-colors leading-none tabular-nums mt-0.5">
                      {tribe.totalScore} <span className="text-xs font-sans font-normal text-[#6d6178]">pts</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTribeId(tribe.id);
                    }}
                    className="rounded-xl bg-[#4b1d7a] px-3.5 py-1.5 text-xs font-bold text-[#e4b84a] shadow-xs hover:brightness-110 active:scale-95 transition-all"
                  >
                    Details →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Display: Table View */
        <div className="panel mt-5 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[620px]">
              <div className="grid grid-cols-[80px_1fr_1fr_auto_90px] gap-3 border-b border-[#4b1d7a]/[0.08] bg-[#4b1d7a]/[0.04] px-5 py-3.5 text-[10px] uppercase tracking-[0.2em] text-[#6d6178] font-semibold">
                <span>Code</span>
                <span>Tribe Name</span>
                <span>Venue Hall & Domain</span>
                <span className="text-right">Score & Rank</span>
                <span className="text-right">Action</span>
              </div>
              {filteredTribes.map((tribe) => (
                <div
                  key={tribe.id}
                  onClick={() => setSelectedTribeId(tribe.id)}
                  className="grid cursor-pointer grid-cols-[80px_1fr_1fr_auto_90px] items-center gap-3 border-b border-[#4b1d7a]/[0.05] px-5 py-3.5 last:border-0 hover:bg-[#4b1d7a]/[0.03] transition-all"
                >
                  <span className="font-mono text-xs font-bold text-[#4b1d7a]">{tribe.tribeCode}</span>
                  <div className="min-w-0">
                    <span className="block font-semibold text-[#160b24] truncate">{tribe.tribeName}</span>
                    <span className="text-[10px] text-[#6d6178]">{tribe.groupName || tribe.theme}</span>
                  </div>
                  <div className="min-w-0">
                    <span className={`text-xs block truncate ${tribe.location && tribe.location !== "No Venue Allocated" ? "font-medium text-[#4b1d7a]" : "font-semibold text-amber-700"}`}>
                      {tribe.location && tribe.location !== "No Venue Allocated" ? `📍 ${tribe.location}` : "⚠️ No Venue Allocated"}
                    </span>
                    <span className="text-[11px] text-[#6d6178] truncate block">{tribe.venueTheme || tribe.theme}</span>
                  </div>
                  <div className="text-right">
                    <span className="display text-lg font-bold text-[#4b1d7a] tabular-nums">{tribe.totalScore} pts</span>
                    <span className="block text-[10px] text-[#6d6178]">
                      {tribe.rank ? `Rank ${rankLabel(tribe.rank)}` : "Unranked"}
                    </span>
                  </div>
                  <div className="text-right">
                    <button
                      type="button"
                      className="rounded-full border border-[#4b1d7a]/20 px-3 py-1 text-xs font-bold text-[#4b1d7a] hover:bg-[#4b1d7a] hover:text-white transition-all"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      <TribeModal tribeId={selectedTribeId} onClose={() => setSelectedTribeId(null)} />
    </div>
  );
}
