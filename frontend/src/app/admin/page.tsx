"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { apiSend } from "@/lib/api";
import { getToken } from "@/lib/auth";

type HostData = {
  venueId: string;
  groupName: string;
  venueName: string;
  theme: string;
  location: string;
  motif?: string;
  participatingClasses: string[];
  description?: string;
  isLocked: boolean;
  tribeCount: number;
  scoresCount: number;
  totalExpectedScores: number;
  topTribes: { id: string; tribeName: string; tribeCode: string; totalScore: number; rank: number }[];
};

type Dash = {
  cards: { tribes: number; venues: number; events: number; scores: number };
  venues: {
    id: string;
    groupName: string;
    venueName: string;
    theme: string;
    location: string;
    motif?: string;
    participatingClasses: string[];
    isLocked: boolean;
    tribeCount: number;
  }[];
  hostData?: HostData | null;
  recent: { id: string; action: string; user: string; createdAt: string; reason?: string }[];
  topTribes: { id: string; tribeName: string; tribeCode: string; totalScore: number; rank: number }[];
};

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

export default function AdminHome() {
  const [data, setData] = useState<Dash | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    Promise.all([
      apiSend<Dash>("/api/admin/dashboard", token, "GET"),
      apiSend<any>("/api/admin/me", token, "GET"),
    ])
      .then(([dash, me]) => {
        setData(dash);
        setUser(me);
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const isSuperAdmin = user?.role === "super_admin";
  const isVenueHost = !isSuperAdmin && (user?.venueId || user?.venue || data?.hostData);

  // Determine host's venue details
  const hostVenue: HostData | null = data?.hostData || (user?.venue ? {
    venueId: user.venueId,
    groupName: user.venue.groupName,
    venueName: user.venue.venueName || "Unallocated",
    theme: user.venue.theme,
    location: user.venue.location || "No Venue Allocated",
    motif: "creative",
    participatingClasses: user.venue.participatingClasses || [],
    description: "",
    isLocked: false,
    tribeCount: 18,
    scoresCount: 0,
    totalExpectedScores: 0,
    topTribes: [],
  } : null);

  // Build group data dynamically from real venue data
  const groupsFromVenues = useMemo(() => {
    const map = new Map<string, any>();
    ALL_GROUPS.forEach((g) => {
      map.set(g.groupName, {
        groupName: g.groupName,
        theme: g.theme,
        icon: g.icon,
        location: "",
        venueName: "",
        classes: [],
        motif: "creative",
        tribeCount: 18,
      });
    });
    if (data?.venues) {
      data.venues.forEach((v) => {
        if (v.groupName) {
          const existing = map.get(v.groupName);
          map.set(v.groupName, {
            groupName: v.groupName,
            theme: v.theme || existing?.theme || "Untitled",
            icon: GROUP_ICONS[v.groupName] || existing?.icon || "🛡️",
            location: v.location || existing?.location || "",
            venueName: v.venueName || existing?.venueName || "",
            classes: v.participatingClasses || existing?.classes || [],
            motif: v.motif || existing?.motif || "creative",
            tribeCount: v.tribeCount || existing?.tribeCount || 18,
          });
        }
      });
    }
    return Array.from(map.values());
  }, [data?.venues]);

  const activeGroup = useMemo(() => {
    if (!hostVenue) return groupsFromVenues[0] || null;
    return groupsFromVenues.find((g) => g.groupName === hostVenue.groupName) || {
      groupName: hostVenue.groupName,
      theme: hostVenue.theme,
      icon: GROUP_ICONS[hostVenue.groupName] || "🛡️",
      location: hostVenue.location,
      venueName: hostVenue.venueName,
      classes: hostVenue.participatingClasses || [],
      motif: hostVenue.motif || "creative",
      tribeCount: hostVenue.tribeCount,
    };
  }, [hostVenue, groupsFromVenues]);

  const scoringProgress = hostVenue && hostVenue.totalExpectedScores > 0
    ? Math.min(100, Math.round((hostVenue.scoresCount / hostVenue.totalExpectedScores) * 100))
    : 0;

  const activeClassesText =
    hostVenue?.participatingClasses && hostVenue.participatingClasses.length > 0
      ? hostVenue.participatingClasses.join(", ")
      : activeGroup?.classes && activeGroup.classes.length > 0
      ? activeGroup.classes.join(", ")
      : "No Classes Allocated";

  return (
    <AdminShell>
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Executive / Host Header Banner */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#12071f] via-[#240e3f] to-[#12071f] p-5 sm:p-6 md:p-8 text-white shadow-xl border border-[#e4b84a]/20">
          <div className="absolute right-0 top-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-[#e4b84a]/10 blur-3xl" />
          <div className="absolute left-1/3 bottom-0 -mb-8 h-36 w-36 rounded-full bg-[#4b1d7a]/30 blur-2xl" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded-full bg-[#e4b84a]/20 border border-[#e4b84a]/40 px-3 py-0.5 text-[10px] font-mono uppercase tracking-widest text-[#e4b84a]">
                  {isSuperAdmin ? "👑 Master Control Room" : `🏛️ Host Station · ${hostVenue?.location || "No Venue Allocated"}`}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-white/60">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Station Active
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-4xl font-extrabold tracking-tight text-white">
                {isSuperAdmin
                  ? "SIP Arena Master Portal"
                  : `${hostVenue?.location || "Venue"} Host Portal`}
              </h1>
              <p className="mt-1.5 text-xs md:text-sm text-white/80 max-w-2xl leading-relaxed">
                {isSuperAdmin
                  ? "Real-time multi-venue scoring system · 5 Groups · 90 Tribes · Instant live updates"
                  : `Assigned: ${hostVenue?.groupName || activeGroup?.groupName || "Group"} (${hostVenue?.theme || activeGroup?.theme || "Theme"}) · ${activeClassesText} · ${hostVenue?.tribeCount ?? 18} Assigned Tribes`}
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full md:w-auto">
              <Link
                href="/admin/scores"
                className="flex-1 sm:flex-initial text-center justify-center rounded-xl bg-gradient-to-r from-[#e4b84a] to-[#d4a332] px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-extrabold text-[#12071f] shadow-lg shadow-[#e4b84a]/20 hover:brightness-105 active:scale-95 transition flex items-center gap-1.5 sm:gap-2"
              >
                <span>📝</span>
                <span>{isSuperAdmin ? "Score Matrix" : `Score ${hostVenue?.groupName || "Group"}`}</span>
              </Link>
              <Link
                href="/admin/teams"
                className="flex-1 sm:flex-initial text-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-md px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-bold text-white hover:bg-white/20 transition flex items-center gap-1.5 sm:gap-2"
              >
                <span>🛡️</span>
                <span>{isSuperAdmin ? "All Tribes" : "Station Tribes"}</span>
              </Link>
              <Link
                href={
                  isVenueHost && (hostVenue?.groupName || hostVenue?.venueId)
                    ? `/scoreboard?group=${encodeURIComponent(hostVenue?.groupName || "")}&venue=${encodeURIComponent(hostVenue?.venueId || "")}`
                    : "/scoreboard"
                }
                target="_blank"
                className="flex-1 sm:flex-initial text-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-md px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-bold text-[#e4b84a] hover:bg-white/20 transition flex items-center gap-1.5 sm:gap-2"
              >
                <span>📺</span>
                <span>Projector</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Dynamic Stat Cards tailored to Host vs Admin */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {isVenueHost && hostVenue ? (
            <>
              {/* Host Stat 1: Assigned Tribes */}
              <div className="relative overflow-hidden rounded-2xl border border-[#4b1d7a]/15 bg-white p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6d6178]">
                    Assigned Tribes
                  </span>
                  <span className="text-lg">🛡️</span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl md:text-4xl font-black tracking-tight text-[#12071f]">
                    {hostVenue.tribeCount || 18}
                  </span>
                  <span className="text-xs font-semibold text-[#4b1d7a]">teams</span>
                </div>
                <p className="mt-1 text-[11px] text-[#6d6178] truncate">
                  {hostVenue.groupName} · {hostVenue.theme}
                </p>
              </div>

              {/* Host Stat 2: Venue Hall Location */}
              <div className="relative overflow-hidden rounded-2xl border border-[#4b1d7a]/15 bg-white p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6d6178]">
                    Assigned Venue
                  </span>
                  <span className="text-lg">🏛️</span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-lg md:text-xl font-black tracking-tight text-[#12071f] truncate">
                    {hostVenue.location}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Live Evaluation Hall
                </p>
              </div>

              {/* Host Stat 3: Scoring Progress */}
              <div className="relative overflow-hidden rounded-2xl border border-[#4b1d7a]/15 bg-white p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6d6178]">
                    Scoring Progress
                  </span>
                  <span className="text-lg">📊</span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl md:text-4xl font-black tracking-tight text-[#12071f]">
                    {hostVenue.scoresCount}
                  </span>
                  <span className="text-xs font-semibold text-[#6d6178]">
                    / {hostVenue.totalExpectedScores || 90}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#4b1d7a]/10">
                  <div
                    className="h-full bg-gradient-to-r from-[#4b1d7a] to-[#e4b84a] rounded-full transition-all duration-500"
                    style={{ width: `${scoringProgress}%` }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-[#6d6178]">{scoringProgress}% evaluations recorded</p>
              </div>

              {/* Host Stat 4: Active Events */}
              <div className="relative overflow-hidden rounded-2xl border border-[#4b1d7a]/15 bg-white p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6d6178]">
                    Active Events
                  </span>
                  <span className="text-lg">⚡</span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl md:text-4xl font-black tracking-tight text-[#12071f]">
                    {data?.cards.events ?? 0}
                  </span>
                  <span className="text-xs font-semibold text-amber-600">scoring criteria</span>
                </div>
                <p className="mt-1 text-[11px] text-[#6d6178]">Live multi-event scoring active</p>
              </div>
            </>
          ) : (
            // Super Admin 4 Cards
            [
              {
                label: "Total Tribes",
                value: data?.cards.tribes ?? 90,
                subtext: "5 Groups · 18 Teams each",
                icon: "🛡️",
              },
              {
                label: "Venue Halls",
                value: data?.cards.venues ?? 5,
                subtext: "5 Live evaluation halls",
                icon: "🏛️",
              },
              {
                label: "Active Events",
                value: data?.cards.events ?? 5,
                subtext: "Live multi-criteria scoring",
                icon: "⚡",
              },
              {
                label: "Scores Entered",
                value: data?.cards.scores ?? 0,
                subtext: "Live score entries logged",
                icon: "📊",
              },
            ].map((card) => (
              <div
                key={card.label}
                className="relative overflow-hidden rounded-2xl border border-[#4b1d7a]/15 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6d6178]">
                    {card.label}
                  </span>
                  <span className="text-lg">{card.icon}</span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  {loading ? (
                    <div className="h-8 w-16 animate-pulse rounded-lg bg-[#4b1d7a]/10" />
                  ) : (
                    <span className="text-3xl md:text-4xl font-black tracking-tight text-[#12071f]">
                      {card.value}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-[#6d6178]">{card.subtext}</p>
              </div>
            ))
          )}
        </div>

        {/* Venue Host Specific: Dedicated Assigned Station Command Panel */}
        {isVenueHost && hostVenue && activeGroup && (
          <div className="rounded-3xl border-2 border-[#e4b84a]/40 bg-gradient-to-br from-[#ffffff] via-[#fdfaf3] to-[#fbf5e6] p-6 md:p-8 shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 h-40 w-40 rounded-full bg-[#e4b84a]/10 blur-2xl pointer-events-none" />

            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#4b1d7a]/10 pb-5">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="rounded-full bg-[#4b1d7a] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    ⭐ Your Assigned Station
                  </span>
                  <span className="text-xs font-bold text-[#4b1d7a]">
                    📍 {hostVenue.location}
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-[#12071f] flex items-center gap-2.5">
                  <span className="text-2xl">{activeGroup.icon}</span>
                  <span>{hostVenue.groupName} — {hostVenue.theme}</span>
                </h2>
                <p className="text-xs text-[#6d6178] mt-1 max-w-2xl">
                  {hostVenue.description || "Enter evaluation scores, review tribe presentations, and track real-time rankings for your station."}
                </p>
              </div>

              {/* Station Action Shortcuts */}
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/admin/scores"
                  className="rounded-xl bg-[#4b1d7a] text-white px-4 py-2.5 text-xs font-bold shadow-md hover:bg-[#38155c] transition flex items-center gap-2 active:scale-95"
                >
                  <span>📝</span>
                  <span>Enter {hostVenue.groupName} Scores →</span>
                </Link>
                <Link
                  href="/admin/teams"
                  className="rounded-xl border border-[#4b1d7a]/20 bg-white px-4 py-2.5 text-xs font-bold text-[#4b1d7a] hover:bg-[#4b1d7a]/5 transition flex items-center gap-2"
                >
                  <span>🛡️</span>
                  <span>Manage 18 Tribes</span>
                </Link>
              </div>
            </div>

            {/* Participating Classes & Live Details */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-[#4b1d7a]/10 bg-white/80 p-4 backdrop-blur-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6d6178] block mb-1.5">
                  Participating Departments & Classes
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(hostVenue.participatingClasses?.length ? hostVenue.participatingClasses : activeGroup.classes).map((cls: string) => (
                    <span
                      key={cls}
                      className="rounded-lg bg-[#4b1d7a]/10 px-2.5 py-1 text-xs font-bold text-[#4b1d7a]"
                    >
                      {cls}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[#4b1d7a]/10 bg-white/80 p-4 backdrop-blur-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6d6178] block mb-1.5">
                  Station Status
                </span>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-extrabold text-[#12071f]">
                    Ready for Live Evaluations
                  </span>
                </div>
                <p className="text-[11px] text-[#6d6178] mt-1">
                  {hostVenue.tribeCount || 18} Tribes assigned to {hostVenue.location}
                </p>
              </div>

              <div className="rounded-2xl border border-[#4b1d7a]/10 bg-white/80 p-4 backdrop-blur-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6d6178] block mb-1.5">
                  Scoring Matrix Shortcut
                </span>
                <Link
                  href="/admin/scores"
                  className="text-xs font-bold text-[#4b1d7a] hover:text-[#e4b84a] flex items-center justify-between"
                >
                  <span>Open Multi-Criteria Matrix</span>
                  <span className="text-base">→</span>
                </Link>
                <p className="text-[11px] text-[#6d6178] mt-0.5">
                  Supports instant saving & auto-audit
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Group Reference Matrix — built from real venue data */}
        <div className="rounded-3xl border border-[#4b1d7a]/15 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-extrabold text-[#12071f]">
                {isVenueHost ? "Arena Group Overview & Hall Rotations" : "Evaluate Tribes by Group"}
              </h2>
              <p className="text-xs text-[#6d6178]">
                {isVenueHost
                  ? "Overview of all 5 arena groups and their current evaluation stations"
                  : "Select a group to enter scores instantly or inspect tribe performance"}
              </p>
            </div>
            <Link
              href="/admin/scores"
              className="text-xs font-bold text-[#4b1d7a] hover:text-[#e4b84a] transition"
            >
              Open Full Scoring Matrix →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {groupsFromVenues.map((g) => {
              const isAssignedToThisHost = hostVenue?.groupName === g.groupName;
              return (
                <Link
                  key={g.groupName}
                  href="/admin/scores"
                  className={`group relative rounded-2xl border p-4 transition-all duration-200 flex flex-col justify-between ${
                    isAssignedToThisHost
                      ? "border-2 border-[#e4b84a] bg-gradient-to-b from-[#fbf5e6] to-[#f4ead2] shadow-md ring-2 ring-[#e4b84a]/20"
                      : "border-[#4b1d7a]/15 bg-gradient-to-b from-[#fdfbf7] to-[#f7f2ea] hover:border-[#4b1d7a] hover:shadow-md"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{g.icon}</span>
                      {isAssignedToThisHost ? (
                        <span className="rounded-md bg-[#e4b84a] px-2 py-0.5 text-[10px] font-extrabold text-[#12071f]">
                          YOUR STATION
                        </span>
                      ) : (
                        <span className="rounded-md bg-[#4b1d7a]/10 px-2 py-0.5 text-[10px] font-bold text-[#4b1d7a]">
                          {g.tribeCount} Teams
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#4b1d7a] mt-2.5">
                      {g.groupName}
                    </h3>
                    <p className="text-xs font-extrabold text-[#12071f] leading-snug mt-0.5">
                      {g.theme}
                    </p>
                    <p className="text-[10px] text-[#6d6178] mt-1 font-medium">
                      📍 {g.location}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-[#4b1d7a]/10 flex items-center justify-between">
                    <span className="text-[10px] text-[#6d6178] truncate max-w-[100px]">
                      {g.classes.length > 0 ? g.classes.join(", ") : g.venueName}
                    </span>
                    <span className="text-xs font-bold text-[#4b1d7a] group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Venue Summary & Activity Log */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Venues Overview */}
          <div className="rounded-3xl border border-[#4b1d7a]/15 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#4b1d7a]/10 pb-4 mb-4">
              <h2 className="text-base font-extrabold text-[#12071f] flex items-center gap-2">
                <span>🏛️</span>
                <span>Venue Evaluation Halls</span>
              </h2>
              <span className="text-[11px] font-bold text-[#6d6178]">
                {data?.venues.length ?? 5} Venues Active
              </span>
            </div>

            <div className="space-y-3">
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 w-full animate-pulse rounded-xl bg-[#4b1d7a]/5" />
                ))
              ) : (
                data?.venues.map((v) => {
                  const isHostHall = hostVenue && (v.id === hostVenue.venueId || v.location === hostVenue.location);
                  return (
                    <div
                      key={v.id}
                      className={`flex items-center justify-between rounded-2xl border p-3.5 transition ${
                        isHostHall
                          ? "border-[#e4b84a] bg-[#fbf5e6]/80 shadow-sm"
                          : "border-[#4b1d7a]/10 bg-[#fdfbf7] hover:bg-[#f7f2ea]"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-[#12071f]">{v.theme}</p>
                          {isHostHall && (
                            <span className="rounded-full bg-[#e4b84a] px-2 py-0.2 text-[9px] font-extrabold text-[#12071f]">
                              YOUR HALL
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-[#6d6178]">📍 {v.location}</span>
                          <span className="text-[10px] text-[#6d6178]">·</span>
                          <span className="text-[11px] text-[#4b1d7a] font-semibold">
                            {v.tribeCount} tribes
                          </span>
                          {v.groupName && (
                            <>
                              <span className="text-[10px] text-[#6d6178]">·</span>
                              <span className="text-[10px] text-[#6d6178] font-mono">{v.groupName}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                        Live Hall
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent Live Activity */}
          <div className="rounded-3xl border border-[#4b1d7a]/15 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#4b1d7a]/10 pb-4 mb-4">
              <h2 className="text-base font-extrabold text-[#12071f] flex items-center gap-2">
                <span>⚡</span>
                <span>Live Audit Activity</span>
              </h2>
              <span className="text-[11px] font-bold text-[#6d6178]">Real-time feed</span>
            </div>

            <div className="space-y-3">
              {loading ? (
                [1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 w-full animate-pulse rounded-xl bg-[#4b1d7a]/5" />
                ))
              ) : data?.recent && data.recent.length > 0 ? (
                data.recent.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-2xl border border-[#4b1d7a]/10 bg-[#fdfbf7] p-3.5"
                  >
                    <div>
                      <span className="rounded-md bg-[#4b1d7a]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#4b1d7a] uppercase">
                        {item.action.replace(".", " ")}
                      </span>
                      <p className="text-xs font-bold text-[#12071f] mt-1">{item.user}</p>
                      {item.reason && (
                        <p className="text-[10px] text-[#6d6178] italic mt-0.5">{item.reason}</p>
                      )}
                    </div>
                    <span suppressHydrationWarning className="text-[10px] font-mono text-[#6d6178]">
                      {new Date(item.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-[#6d6178]">
                  No score evaluations recorded yet. All ready for live scoring!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
