"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { AdminShell } from "@/components/AdminShell";
import { apiGet, apiSend } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { rankLabel } from "@/lib/format";
import type { LeaderboardRow, Venue } from "@/lib/types";
import { TribeModal } from "@/components/TribeModal";
import { LiveBadge } from "@/components/LiveBadge";
import { SOCKET_URL } from "@/lib/config";

const GROUP_ICONS: Record<string, string> = {
  "Group I": "🎨",
  "Group II": "💻",
  "Group III": "🚀",
  "Group IV": "🛡️",
  "Group V": "⚡",
};

const ALL_GROUPS = [
  { groupName: "Group I", theme: "Creative & Design", icon: "🎨" },
  { groupName: "Group II", theme: "Technology & Innovation", icon: "💻" },
  { groupName: "Group III", theme: "Space & Cosmic", icon: "🚀" },
  { groupName: "Group IV", theme: "Legends & Mythology", icon: "🛡️" },
  { groupName: "Group V", theme: "Power & Energy", icon: "⚡" },
];

export default function TeamsPage() {
  const [tribes, setTribes] = useState<LeaderboardRow[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedGroup, setSelectedGroup] = useState<string>("Group I");
  const [selectedVenueId, setSelectedVenueId] = useState<string>("all");
  const [selectedTribeId, setSelectedTribeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const loadData = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    const token = getToken();
    try {
      const [user, teamList, venueList] = await Promise.all([
        apiSend<any>("/api/admin/me", token, "GET"),
        apiSend<LeaderboardRow[]>("/api/admin/tribes", token, "GET"),
        apiGet<Venue[]>("/api/venues"),
      ]);
      setCurrentUser(user);
      setTribes(teamList);
      setVenues(venueList);
    } catch {
      // ignore
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Real-time WebSocket connection for instant live venue updates
    const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    socket.on("connect", () => setLive(true));
    socket.on("disconnect", () => setLive(false));

    const handleRealtimeUpdate = () => {
      loadData(true);
    };

    socket.on("venue-move", handleRealtimeUpdate);
    socket.on("leaderboard", handleRealtimeUpdate);
    socket.on("tribe", handleRealtimeUpdate);
    socket.on("score", handleRealtimeUpdate);

    return () => {
      socket.disconnect();
    };
  }, [loadData]);

  const isVenueHost = currentUser && currentUser.role !== "super_admin";
  const hostGroupName = currentUser?.venue?.groupName;
  const hostLocation = currentUser?.venue?.location;

  const filteredTribes = useMemo(() => {
    let list = [...tribes];

    if (isVenueHost) {
      // Strictly restrict Venue Host to their station group
      if (hostGroupName) {
        list = list.filter((t) => t.groupName === hostGroupName);
      } else if (currentUser?.venueId) {
        list = list.filter((t) => t.venueId === currentUser.venueId);
      }
    } else {
      // Super Admin filter
      if (selectedGroup !== "all") {
        list = list.filter((t) => t.groupName === selectedGroup);
      }
      if (selectedVenueId !== "all") {
        list = list.filter((t) => t.venueId === selectedVenueId);
      }
    }

    // Always sort by natural tribe code numeric order (SIP-001, SIP-002, ...) matching Score Matrix
    list.sort((a, b) => a.tribeCode.localeCompare(b.tribeCode));

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.tribeName?.toLowerCase().includes(q) ||
          t.tribeCode?.toLowerCase().includes(q) ||
          t.groupName?.toLowerCase().includes(q) ||
          t.theme?.toLowerCase().includes(q) ||
          t.location?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [tribes, isVenueHost, hostGroupName, currentUser, selectedGroup, selectedVenueId, searchQuery]);

  const groupsFromVenues = useMemo(() => {
    const map = new Map<string, { groupName: string; theme: string; icon: string }>();
    ALL_GROUPS.forEach((g) => {
      map.set(g.groupName, { ...g });
    });
    venues.forEach((v) => {
      if (v.groupName) {
        const existing = map.get(v.groupName);
        map.set(v.groupName, {
          groupName: v.groupName,
          theme: v.theme || existing?.theme || "Untitled",
          icon: GROUP_ICONS[v.groupName] || existing?.icon || "🎯",
        });
      }
    });
    return Array.from(map.values());
  }, [venues]);

  const activeGroupData = useMemo(() => {
    if (isVenueHost && hostGroupName) {
      return (
        groupsFromVenues.find((g) => g.groupName === hostGroupName) || {
          groupName: hostGroupName,
          theme: currentUser?.venue?.theme || "Tribes",
          icon: "🛡️",
        }
      );
    }
    return groupsFromVenues.find((g) => g.groupName === selectedGroup);
  }, [isVenueHost, hostGroupName, currentUser, selectedGroup, groupsFromVenues]);

  return (
    <AdminShell>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#4b1d7a]/10 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#12071f] px-3 py-0.5 text-[11px] font-bold text-[#e4b84a]">
                🛡️ {isVenueHost ? `Station Tribes · ${hostLocation || "Assigned Venue"}` : "Tribe Directory"}
              </span>
              <span className="text-xs text-[#6d6178]">
                {isVenueHost
                  ? `${filteredTribes.length} Assigned Tribes`
                  : selectedGroup === "all"
                  ? `All 90 Tribes · 5 Groups`
                  : `${filteredTribes.length} Tribes in ${selectedGroup}`}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#12071f] tracking-tight mt-1">
              {isVenueHost
                ? `${hostGroupName || "Assigned Group"}: ${currentUser?.venue?.theme || activeGroupData?.theme || "Tribes"}`
                : selectedGroup === "all"
                ? "All 90 Multidisciplinary Tribes"
                : `${selectedGroup}: ${activeGroupData?.theme || "Tribes"}`}
            </h1>
            <p className="text-xs text-[#6d6178] mt-0.5">
              {isVenueHost
                ? `Showing the ${filteredTribes.length} tribes actively assigned to ${hostLocation || "your venue"} in score entry order.`
                : "Inspect team members, live cumulative scores, and current venue assignments."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <LiveBadge live={live} />
            <span className="text-xs font-semibold text-emerald-700 hidden sm:inline">
              Real-time Venue Sync
            </span>
          </div>
        </div>

        {/* Search Bar / Controls Card */}
        <div className="rounded-3xl border border-[#4b1d7a]/15 bg-white/90 p-5 md:p-6 shadow-sm backdrop-blur-md space-y-4">
          {/* Search bar & View switch */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative min-w-[280px] flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#6d6178]">🔍</span>
              <input
                type="text"
                placeholder={
                  isVenueHost
                    ? `Search among your ${filteredTribes.length} station tribes (by name or code)...`
                    : "Search by tribe name, code (e.g. SIP-019), or venue hall..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-[#4b1d7a]/20 bg-white py-2.5 pl-9 pr-8 text-xs text-[#12071f] outline-none transition focus:border-[#4b1d7a] focus:ring-1 focus:ring-[#4b1d7a]/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6d6178] hover:text-black cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex rounded-xl border border-[#4b1d7a]/20 bg-white p-1">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition cursor-pointer ${
                  viewMode === "table" ? "bg-[#4b1d7a] text-white" : "text-[#4b1d7a] hover:bg-[#4b1d7a]/5"
                }`}
              >
                Table View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition cursor-pointer ${
                  viewMode === "grid" ? "bg-[#4b1d7a] text-white" : "text-[#4b1d7a] hover:bg-[#4b1d7a]/5"
                }`}
              >
                Grid Cards
              </button>
            </div>
          </div>

          {/* Group & Venue Filter Chips (Shown ONLY for Super Admins) */}
          {!isVenueHost && (
            <>
              {/* Group Filter Chips */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#4b1d7a] block mb-2">
                  Filter by Group Type:
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGroup("all");
                      setSelectedVenueId("all");
                    }}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                      selectedGroup === "all"
                        ? "bg-[#12071f] text-[#e4b84a] shadow-xs"
                        : "bg-white text-[#12071f] border border-[#4b1d7a]/15 hover:bg-white/80"
                    }`}
                  >
                    All Groups (90)
                  </button>
                  {groupsFromVenues.map((g) => (
                    <button
                      key={g.groupName}
                      type="button"
                      onClick={() => {
                        setSelectedGroup(g.groupName);
                        setSelectedVenueId("all");
                      }}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        selectedGroup === g.groupName
                          ? "bg-[#4b1d7a] text-[#e4b84a] shadow-xs"
                          : "bg-white text-[#12071f] border border-[#4b1d7a]/15 hover:bg-white/80"
                      }`}
                    >
                      <span>{g.icon}</span>
                      <span>{g.groupName}: {g.theme} (18)</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Venue Location Filter */}
              <div className="border-t border-[#4b1d7a]/10 pt-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#4b1d7a] block mb-2">
                  Filter by Venue Location:
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedVenueId("all")}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                      selectedVenueId === "all"
                        ? "bg-[#12071f] text-[#e4b84a] shadow-xs"
                        : "bg-white text-[#12071f] border border-[#4b1d7a]/15 hover:bg-white/80"
                    }`}
                  >
                    All Venues
                  </button>
                  {venues.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVenueId(v.id)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        selectedVenueId === v.id
                          ? "bg-[#4b1d7a] text-[#e4b84a] shadow-xs"
                          : "bg-white text-[#12071f] border border-[#4b1d7a]/15 hover:bg-white/80"
                      }`}
                    >
                      <span>📍 {v.location}</span>
                      <span className="text-[10px] opacity-70">({v.groupName || v.venueName})</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Display: Table or Grid View */}
        {viewMode === "table" ? (
          <div className="rounded-3xl border border-[#4b1d7a]/15 bg-white/90 shadow-sm backdrop-blur-md overflow-hidden">
            <div className="grid grid-cols-[80px_1.2fr_1.2fr_auto_90px] gap-3 border-b border-[#4b1d7a]/10 bg-[#4b1d7a]/5 px-6 py-3.5 text-[11px] uppercase tracking-[0.18em] font-bold text-[#6d6178]">
              <span>Code</span>
              <span>Tribe & Group</span>
              <span>Real-Time Venue Location</span>
              <span className="text-right">Total Score</span>
              <span className="text-right">Action</span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#4b1d7a] border-t-transparent" />
                <p className="text-xs font-semibold text-[#6d6178]">Loading station tribes…</p>
              </div>
            ) : filteredTribes.length === 0 ? (
              <div className="py-20 text-center text-sm text-[#6d6178]">
                No tribes found matching your search.
              </div>
            ) : (
              <div className="divide-y divide-[#4b1d7a]/8">
                {filteredTribes.map((tribe) => (
                  <div
                    key={tribe.id}
                    onClick={() => setSelectedTribeId(tribe.id)}
                    className="grid cursor-pointer grid-cols-[80px_1.2fr_1.2fr_auto_90px] items-center gap-3 px-6 py-3.5 hover:bg-[#4b1d7a]/5 transition-colors"
                  >
                    <span className="font-mono text-xs font-bold text-[#4b1d7a] bg-[#4b1d7a]/8 px-2 py-1 rounded-md w-fit">
                      {tribe.tribeCode}
                    </span>
                    <div>
                      <span className="block font-bold text-sm text-[#12071f]">{tribe.tribeName}</span>
                      <span className="text-[11px] text-[#4b1d7a] font-semibold">
                        {tribe.groupName ? `${tribe.groupName} · ${tribe.theme}` : tribe.theme}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">📍</span>
                        <span className="text-xs font-extrabold text-[#12071f]">
                          {tribe.location || hostLocation || "Venue Hall"}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#6d6178] block">
                        {tribe.theme || "Active Station"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-extrabold text-[#12071f] block">{tribe.totalScore} pts</span>
                      <span className="text-[10px] text-[#6d6178]">
                        {tribe.rank ? `Rank ${rankLabel(tribe.rank)}` : "Unranked"}
                      </span>
                    </div>
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTribeId(tribe.id);
                        }}
                        className="rounded-full border border-[#4b1d7a]/25 px-3 py-1 text-xs font-bold text-[#4b1d7a] hover:bg-[#4b1d7a] hover:text-white transition shadow-xs cursor-pointer"
                      >
                        Inspect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Grid Cards View */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTribes.map((tribe) => (
              <div
                key={tribe.id}
                onClick={() => setSelectedTribeId(tribe.id)}
                className="panel group relative flex cursor-pointer flex-col justify-between p-5 transition duration-200 hover:-translate-y-1 hover:shadow-lg border border-[#4b1d7a]/15 bg-white rounded-3xl"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-md bg-[#4b1d7a]/10 px-2 py-0.5 text-xs font-mono font-bold text-[#4b1d7a]">
                      {tribe.tribeCode}
                    </span>
                    <div className="text-right">
                      {tribe.rank ? (
                        <>
                          <span className="text-[10px] tracking-wider uppercase text-[#6d6178]">Rank</span>
                          <p className="display text-base font-bold text-[#4b1d7a] leading-none">
                            {rankLabel(tribe.rank)}
                          </p>
                        </>
                      ) : (
                        <span className="text-[10px] text-[#6d6178] font-medium">Unranked</span>
                      )}
                    </div>
                  </div>

                  <h2 className="display mt-3 text-xl font-bold text-[#160b24] group-hover:text-[#4b1d7a] transition">
                    {tribe.tribeName}
                  </h2>

                  <p className="mt-1 text-xs font-semibold text-[#4b1d7a]">
                    {tribe.groupName ? `${tribe.groupName} · ${tribe.theme}` : tribe.theme}
                  </p>

                  <div className="mt-3 rounded-xl bg-[#fbf5e6] p-2.5 border border-[#e4b84a]/30">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#6d6178] block">
                      Current Live Venue
                    </span>
                    <p className="flex items-center gap-1.5 text-xs font-bold text-[#12071f] mt-0.5">
                      <span>📍</span>
                      <span>{tribe.location || hostLocation || "Venue Hall"}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[#4b1d7a]/10 pt-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#6d6178]">Total Score</span>
                    <p className="display text-xl font-extrabold text-[#4b1d7a] leading-none">
                      {tribe.totalScore} pts
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTribeId(tribe.id);
                    }}
                    className="rounded-full bg-[#4b1d7a]/10 px-3 py-1 text-xs font-semibold text-[#4b1d7a] group-hover:bg-[#4b1d7a] group-hover:text-white transition cursor-pointer"
                  >
                    Quick View →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TribeModal tribeId={selectedTribeId} onClose={() => setSelectedTribeId(null)} />
    </AdminShell>
  );
}
