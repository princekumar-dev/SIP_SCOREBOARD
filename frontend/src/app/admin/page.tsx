"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { apiGet, apiSend } from "@/lib/api";
import { getToken } from "@/lib/auth";
import {
  downloadMasterArenaExcel,
  downloadOfflineScoreTemplate,
  downloadMembersDirectoryExcel,
  type MasterExportData,
} from "@/lib/exportUtils";

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

type EventItem = {
  id: string;
  eventName: string;
  description?: string;
  maximumScore: number;
  status?: string;
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
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Export State
  const [exportingType, setExportingType] = useState<string | null>(null);
  const [exportError, setExportError] = useState("");
  const [exportSuccess, setExportSuccess] = useState("");

  // Event Management Modal State
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [eventNameInput, setEventNameInput] = useState("");
  const [eventDescInput, setEventDescInput] = useState("");
  const [eventMaxScoreInput, setEventMaxScoreInput] = useState("100");
  const [savingEvent, setSavingEvent] = useState(false);

  // Venue Master Management State
  const [resettingVenues, setResettingVenues] = useState(false);
  const [lockingVenues, setLockingVenues] = useState(false);
  const [venueActionMsg, setVenueActionMsg] = useState("");

  const loadAll = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const [dash, me, evList] = await Promise.all([
        apiSend<Dash>("/api/admin/dashboard", token, "GET"),
        apiSend<any>("/api/admin/me", token, "GET"),
        apiGet<EventItem[]>("/api/events"),
      ]);
      setData(dash);
      setUser(me);
      setEvents(evList);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const isSuperAdmin = user?.role === "super_admin";
  const isVenueHost = !isSuperAdmin && (user?.venueId || user?.venue || data?.hostData);

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

  // Export handlers
  async function handleExport(type: "master" | "template" | "members" | "group", groupFilter?: string) {
    setExportingType(type);
    setExportError("");
    setExportSuccess("");
    try {
      const masterData = await apiSend<MasterExportData>("/api/admin/export/master-data", getToken(), "GET");
      if (type === "master") {
        downloadMasterArenaExcel(masterData);
        setExportSuccess("Master Arena Scorecard downloaded successfully!");
      } else if (type === "template") {
        downloadOfflineScoreTemplate(masterData, groupFilter);
        setExportSuccess("Blank Evaluation Scoring Template downloaded!");
      } else if (type === "members") {
        downloadMembersDirectoryExcel(masterData);
        setExportSuccess("Tribe & Member Directory downloaded!");
      } else if (type === "group" && groupFilter) {
        downloadOfflineScoreTemplate(masterData, groupFilter);
        setExportSuccess(`Score Template for ${groupFilter} downloaded!`);
      }
      setTimeout(() => setExportSuccess(""), 4000);
    } catch {
      setExportError("Failed to generate export file. Please try again.");
    } finally {
      setExportingType(null);
    }
  }

  // Event Creation & Editing
  function openNewEventModal() {
    setEditingEvent(null);
    setEventNameInput("");
    setEventDescInput("");
    setEventMaxScoreInput("100");
    setShowEventModal(true);
  }

  function openEditEventModal(ev: EventItem) {
    setEditingEvent(ev);
    setEventNameInput(ev.eventName);
    setEventDescInput(ev.description || "");
    setEventMaxScoreInput(String(ev.maximumScore));
    setShowEventModal(true);
  }

  async function handleSaveEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!eventNameInput.trim()) return;
    const maxScore = Number(eventMaxScoreInput);
    if (Number.isNaN(maxScore) || maxScore <= 0) {
      setExportError("Maximum score must be a positive number.");
      return;
    }

    setSavingEvent(true);
    try {
      const token = getToken();
      if (editingEvent) {
        await apiSend(`/api/admin/events/${editingEvent.id}`, token, "PUT", {
          eventName: eventNameInput.trim(),
          description: eventDescInput.trim(),
          maximumScore: maxScore,
        });
        setVenueActionMsg(`✓ Event "${eventNameInput}" updated successfully!`);
      } else {
        await apiSend("/api/admin/events", token, "POST", {
          eventName: eventNameInput.trim(),
          description: eventDescInput.trim(),
          maximumScore: maxScore,
          status: "active",
        });
        setVenueActionMsg(`✓ New Event "${eventNameInput}" added to evaluation criteria!`);
      }
      setShowEventModal(false);
      await loadAll();
    } catch (err: any) {
      setExportError(err.message || "Failed to save event.");
    } finally {
      setSavingEvent(false);
    }
  }

  // Venue Master Actions
  async function handleResetAllVenues() {
    if (!window.confirm("Are you sure you want to reset all venue assignments to Standby? Hosts will need to select groups again.")) {
      return;
    }
    setResettingVenues(true);
    try {
      await apiSend("/api/admin/venues/reset-allocations", getToken(), "POST", {});
      setVenueActionMsg("✓ All venues have been reset to standby mode.");
      await loadAll();
    } catch (err: any) {
      setExportError(err.message || "Failed to reset venues.");
    } finally {
      setResettingVenues(false);
    }
  }

  async function handleToggleAllLocks(shouldLock: boolean) {
    if (!data?.venues) return;
    setLockingVenues(true);
    try {
      const token = getToken();
      await Promise.all(
        data.venues.map((v) =>
          apiSend(`/api/admin/venues/${v.id}/lock`, token, "PUT", { isLocked: shouldLock })
        )
      );
      setVenueActionMsg(`✓ All venue scoring stations are now ${shouldLock ? "LOCKED" : "UNLOCKED"}.`);
      await loadAll();
    } catch (err: any) {
      setExportError(err.message || "Failed to toggle venue locks.");
    } finally {
      setLockingVenues(false);
    }
  }

  return (
    <AdminShell>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Executive / Host Header Banner */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#12071f] via-[#240e3f] to-[#12071f] p-5 sm:p-6 md:p-8 text-white shadow-xl border border-[#e4b84a]/20">
          <div className="absolute right-0 top-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-[#e4b84a]/10 blur-3xl" />
          <div className="absolute left-1/3 bottom-0 -mb-8 h-36 w-36 rounded-full bg-[#4b1d7a]/30 blur-2xl" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="rounded-full bg-[#e4b84a]/20 border border-[#e4b84a]/40 px-3 py-0.5 text-[10px] font-mono uppercase tracking-widest text-[#e4b84a]">
                  {isSuperAdmin ? "👑 Master Control Room" : `🏛️ Host Station · ${hostVenue?.location || "No Venue Allocated"}`}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-white/60">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Station Active
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-4xl font-extrabold tracking-tight text-white">
                {isSuperAdmin ? "SIP Arena Master Portal" : `${hostVenue?.location || "Venue"} Host Portal`}
              </h1>
              <p className="mt-1.5 text-xs md:text-sm text-white/80 max-w-2xl leading-relaxed">
                {isSuperAdmin
                  ? "Central command center for scoring, event configuration, tribe rosters, and master Excel reporting."
                  : `Assigned: ${hostVenue?.groupName || "Group"} (${hostVenue?.theme || "Theme"}) · ${hostVenue?.tribeCount ?? 18} Assigned Tribes`}
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full md:w-auto">
              {isVenueHost ? (
                <Link
                  href="/admin/scores"
                  className="flex-1 sm:flex-initial text-center justify-center rounded-xl bg-gradient-to-r from-[#e4b84a] to-[#d4a332] px-4 py-2.5 text-xs font-extrabold text-[#12071f] shadow-lg shadow-[#e4b84a]/20 hover:brightness-105 active:scale-95 transition flex items-center gap-2"
                >
                  <span>📝</span>
                  <span>Score Entry Matrix</span>
                </Link>
              ) : (
                <a
                  href="#reports"
                  className="flex-1 sm:flex-initial text-center justify-center rounded-xl bg-gradient-to-r from-[#e4b84a] to-[#d4a332] px-4 py-2.5 text-xs font-extrabold text-[#12071f] shadow-lg shadow-[#e4b84a]/20 hover:brightness-105 active:scale-95 transition flex items-center gap-2"
                >
                  <span>📊</span>
                  <span>Excel Reports Hub</span>
                </a>
              )}
              <Link
                href="/admin/teams"
                className="flex-1 sm:flex-initial text-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-md px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition flex items-center gap-2"
              >
                <span>🛡️</span>
                <span>Tribe Rosters</span>
              </Link>
              <Link
                href={
                  isVenueHost && (hostVenue?.groupName || hostVenue?.venueId)
                    ? `/scoreboard?group=${encodeURIComponent(hostVenue?.groupName || "")}&venue=${encodeURIComponent(hostVenue?.venueId || "")}&station=true`
                    : "/scoreboard"
                }
                target="_blank"
                className="flex-1 sm:flex-initial text-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-md px-4 py-2.5 text-xs font-bold text-[#e4b84a] hover:bg-white/20 transition flex items-center gap-2"
              >
                <span>📺</span>
                <span>Projector</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Global Action Notifications */}
        {venueActionMsg && (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 animate-fade-in flex items-center justify-between">
            <span>{venueActionMsg}</span>
            <button type="button" onClick={() => setVenueActionMsg("")} className="text-emerald-800 hover:text-black">✕</button>
          </div>
        )}
        {exportSuccess && (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 animate-fade-in flex items-center justify-between">
            <span>✅ {exportSuccess}</span>
            <button type="button" onClick={() => setExportSuccess("")} className="text-emerald-800 hover:text-black">✕</button>
          </div>
        )}
        {exportError && (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-xs font-semibold text-red-800 animate-fade-in flex items-center justify-between">
            <span>⚠️ {exportError}</span>
            <button type="button" onClick={() => setExportError("")} className="text-red-800 hover:text-black">✕</button>
          </div>
        )}

        {/* Overview Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {[
            {
              label: "Total Tribes",
              value: data?.cards.tribes ?? 90,
              subtext: "5 Groups · 90 Teams total",
              icon: "🛡️",
            },
            {
              label: "Venue Halls",
              value: data?.cards.venues ?? 5,
              subtext: "5 Live evaluation halls",
              icon: "🏛️",
            },
            {
              label: "Evaluation Events",
              value: events.length || data?.cards.events || 3,
              subtext: "Live multi-criteria scoring",
              icon: "⚡",
            },
            {
              label: "Scores Entered",
              value: data?.cards.scores ?? 0,
              subtext: "Live score submissions",
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
          ))}
        </div>

        {/* ========================================================================= */}
        {/* EXCEL & CSV DOWNLOAD HUB (User Requested Core Feature)                   */}
        {/* ========================================================================= */}
        <div id="reports" className="rounded-3xl border border-[#4b1d7a]/20 bg-gradient-to-br from-[#ffffff] via-[#fdfbf7] to-[#fbf7ee] p-6 md:p-7 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#4b1d7a]/10 pb-4 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">📊</span>
                <h2 className="text-lg font-black text-[#12071f]">
                  Excel & CSV Reports Download Center
                </h2>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                  Ready to Export
                </span>
              </div>
              <p className="text-xs text-[#6d6178]">
                Download complete scorecards with team names, codes, leaders, student rosters, and individual event scores box.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Card 1: Comprehensive Master Scorecard */}
            <div className="rounded-2xl border border-[#4b1d7a]/15 bg-white p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">📋</span>
                  <span className="rounded-md bg-[#4b1d7a]/10 px-2 py-0.5 text-[10px] font-mono font-bold text-[#4b1d7a]">
                    MASTER REPORT
                  </span>
                </div>
                <h3 className="text-sm font-black text-[#12071f]">
                  Full Master Arena Scorecard
                </h3>
                <p className="text-xs text-[#6d6178] mt-1.5 leading-relaxed">
                  Contains all 90 teams, Tribe Codes, Group, Theme, Hall Location, Team Lead, Member Rosters, 3 Event Scores breakdown, and Total Points.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleExport("master")}
                disabled={Boolean(exportingType)}
                className="mt-4 w-full rounded-xl bg-gradient-to-r from-[#4b1d7a] to-[#301250] px-4 py-2.5 text-xs font-bold text-[#e4b84a] shadow-xs hover:brightness-110 active:scale-[0.99] transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {exportingType === "master" ? (
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#e4b84a] border-t-transparent" />
                ) : (
                  <span>📥</span>
                )}
                <span>Download Master Excel (.csv)</span>
              </button>
            </div>

            {/* Card 2: Blank Offline Score Entry Template */}
            <div className="rounded-2xl border border-[#4b1d7a]/15 bg-white p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">📝</span>
                  <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-800">
                    OFFLINE EVALUATION
                  </span>
                </div>
                <h3 className="text-sm font-black text-[#12071f]">
                  Blank Score Entry Template
                </h3>
                <p className="text-xs text-[#6d6178] mt-1.5 leading-relaxed">
                  Pre-formatted blank sheet with all tribes & events. Perfect for printing or handing to judges and hall evaluators to record marks offline.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleExport("template")}
                disabled={Boolean(exportingType)}
                className="mt-4 w-full rounded-xl border border-[#4b1d7a]/30 bg-white px-4 py-2.5 text-xs font-bold text-[#4b1d7a] hover:bg-[#4b1d7a] hover:text-white transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                {exportingType === "template" ? (
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#4b1d7a] border-t-transparent" />
                ) : (
                  <span>📥</span>
                )}
                <span>Download Scoring Template (.csv)</span>
              </button>
            </div>

            {/* Card 3: Tribe & Members Directory */}
            <div className="rounded-2xl border border-[#4b1d7a]/15 bg-white p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">👥</span>
                  <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-mono font-bold text-blue-800">
                    STUDENT ROSTER
                  </span>
                </div>
                <h3 className="text-sm font-black text-[#12071f]">
                  Tribes & Members Directory
                </h3>
                <p className="text-xs text-[#6d6178] mt-1.5 leading-relaxed">
                  Complete database roster of all students mapped with their Tribe Code, Team Name, Department, Class Section, and Leader designation.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleExport("members")}
                disabled={Boolean(exportingType)}
                className="mt-4 w-full rounded-xl border border-[#4b1d7a]/30 bg-white px-4 py-2.5 text-xs font-bold text-[#4b1d7a] hover:bg-[#4b1d7a] hover:text-white transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                {exportingType === "members" ? (
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#4b1d7a] border-t-transparent" />
                ) : (
                  <span>📥</span>
                )}
                <span>Download Members Roster (.csv)</span>
              </button>
            </div>
          </div>

          {/* Group-specific Template Quick Download Row */}
          <div className="mt-5 pt-4 border-t border-[#4b1d7a]/10 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-[#4b1d7a]">
              Download Group-Specific Blank Template:
            </span>
            <div className="flex flex-wrap gap-2">
              {ALL_GROUPS.map((g) => (
                <button
                  key={g.groupName}
                  type="button"
                  onClick={() => handleExport("group", g.groupName)}
                  disabled={Boolean(exportingType)}
                  className="rounded-lg border border-[#4b1d7a]/20 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#12071f] hover:bg-[#4b1d7a]/10 transition flex items-center gap-1 cursor-pointer"
                >
                  <span>{g.icon}</span>
                  <span>{g.groupName} Template</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SUPER ADMIN: EVENT MANAGEMENT & EVALUATION CRITERIA                       */}
        {/* ========================================================================= */}
        {isSuperAdmin && (
          <div id="events" className="rounded-3xl border border-[#4b1d7a]/15 bg-white p-6 md:p-7 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#4b1d7a]/10 pb-4 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">⚡</span>
                  <h2 className="text-lg font-black text-[#12071f]">
                    Evaluation Criteria & Events Management
                  </h2>
                </div>
                <p className="text-xs text-[#6d6178]">
                  Configure active evaluation rounds, event names, descriptions, and maximum scores.
                </p>
              </div>

              <button
                type="button"
                onClick={openNewEventModal}
                className="rounded-xl bg-[#4b1d7a] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#38155c] transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <span>➕</span>
                <span>Add New Event Criteria</span>
              </button>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="rounded-2xl border border-[#4b1d7a]/15 bg-[#fdfbf7] p-4 flex flex-col justify-between hover:border-[#4b1d7a]/40 transition"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        {ev.status || "Active"}
                      </span>
                      <span className="rounded-md bg-[#4b1d7a]/10 px-2 py-0.5 text-[10px] font-mono font-bold text-[#4b1d7a]">
                        Max {ev.maximumScore} pts
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[#12071f]">{ev.eventName}</h3>
                    <p className="text-xs text-[#6d6178] mt-1 line-clamp-2">
                      {ev.description || "Live multi-criteria evaluation round for competing teams."}
                    </p>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-[#4b1d7a]/10 flex items-center justify-between">
                    <span className="text-[10px] text-[#6d6178]">Criteria ID: {ev.id.slice(-6)}</span>
                    <button
                      type="button"
                      onClick={() => openEditEventModal(ev)}
                      className="text-xs font-bold text-[#4b1d7a] hover:text-[#e4b84a] transition"
                    >
                      Edit Criteria ✏️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUPER ADMIN: MASTER VENUE ALLOCATION & SECURITY CONTROLS                  */}
        {/* ========================================================================= */}
        {isSuperAdmin && (
          <div className="rounded-3xl border border-[#4b1d7a]/15 bg-white p-6 md:p-7 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#4b1d7a]/10 pb-4 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">🏛️</span>
                  <h2 className="text-lg font-black text-[#12071f]">
                    Master Venue Allocations & Security Locks
                  </h2>
                </div>
                <p className="text-xs text-[#6d6178]">
                  Control hall allocations across all 5 venues and manage score lock security.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleAllLocks(true)}
                  disabled={lockingVenues}
                  className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition cursor-pointer flex items-center gap-1.5"
                  title="Lock all scoring stations"
                >
                  <span>🔒</span>
                  <span>Lock All Stations</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleAllLocks(false)}
                  disabled={lockingVenues}
                  className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition cursor-pointer flex items-center gap-1.5"
                  title="Unlock all scoring stations"
                >
                  <span>🔓</span>
                  <span>Unlock All Stations</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetAllVenues}
                  disabled={resettingVenues}
                  className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 transition cursor-pointer flex items-center gap-1.5"
                  title="Reset all halls to Standby"
                >
                  <span>🔄</span>
                  <span>{resettingVenues ? "Resetting…" : "Reset All to Standby"}</span>
                </button>
              </div>
            </div>

            {/* Venues Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {data?.venues.map((v) => (
                <div
                  key={v.id}
                  className="rounded-2xl border border-[#4b1d7a]/15 bg-[#fdfbf7] p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-[#4b1d7a]">{v.location}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${v.isLocked ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"}`}>
                        {v.isLocked ? "🔒 Locked" : "🟢 Open"}
                      </span>
                    </div>
                    <p className="text-xs font-extrabold text-[#12071f]">{v.venueName}</p>
                    <div className="mt-2">
                      {v.groupName ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#4b1d7a]/10 px-2 py-0.5 text-[10px] font-bold text-[#4b1d7a]">
                          {v.groupName} · {v.tribeCount || 18} Teams
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                          ⚪ Standby (Unallocated)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#4b1d7a]/10 flex items-center justify-between">
                    <Link
                      href="/admin/scores"
                      className="text-[11px] font-bold text-[#4b1d7a] hover:text-[#e4b84a]"
                    >
                      Open Score Matrix →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Audit Stream */}
        <div className="rounded-3xl border border-[#4b1d7a]/15 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#4b1d7a]/10 pb-4 mb-4">
            <h2 className="text-base font-extrabold text-[#12071f] flex items-center gap-2">
              <span>⚡</span>
              <span>Live Evaluation & System Audit Feed</span>
            </h2>
            <span className="text-[11px] font-bold text-[#6d6178]">Real-time audit log</span>
          </div>

          <div className="space-y-2.5">
            {loading ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 w-full animate-pulse rounded-xl bg-[#4b1d7a]/5" />
              ))
            ) : data?.recent && data.recent.length > 0 ? (
              data.recent.slice(0, 8).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-[#4b1d7a]/10 bg-[#fdfbf7] p-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="rounded-md bg-[#4b1d7a]/10 px-2 py-0.5 text-[10px] font-mono font-bold text-[#4b1d7a] uppercase">
                      {item.action.replace(".", " ")}
                    </span>
                    <span className="font-bold text-[#12071f]">{item.user}</span>
                    {item.reason && (
                      <span className="text-[11px] text-[#6d6178] italic hidden sm:inline">
                        — {item.reason}
                      </span>
                    )}
                  </div>
                  <span suppressHydrationWarning className="text-[10px] font-mono text-[#6d6178]">
                    {new Date(item.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-[#6d6178]">
                No audit events recorded yet. Ready for live scoring!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-[#4b1d7a]/20 bg-white p-6 md:p-7 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#4b1d7a]/10 pb-3 mb-4">
              <h3 className="text-base font-black text-[#12071f]">
                {editingEvent ? "Edit Evaluation Event Criteria" : "Add New Evaluation Event"}
              </h3>
              <button
                type="button"
                onClick={() => setShowEventModal(false)}
                className="rounded-full p-1 text-gray-400 hover:text-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#4b1d7a] uppercase mb-1">
                  Event / Criteria Name:
                </label>
                <input
                  type="text"
                  required
                  value={eventNameInput}
                  onChange={(e) => setEventNameInput(e.target.value)}
                  placeholder="e.g., Tear Down Lab, Poster Presentation"
                  className="w-full rounded-xl border border-[#4b1d7a]/20 bg-[#fdfbf7] px-3.5 py-2 text-xs font-bold text-[#12071f] focus:border-[#4b1d7a] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4b1d7a] uppercase mb-1">
                  Maximum Score (Points):
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  required
                  value={eventMaxScoreInput}
                  onChange={(e) => setEventMaxScoreInput(e.target.value)}
                  placeholder="100"
                  className="w-full rounded-xl border border-[#4b1d7a]/20 bg-[#fdfbf7] px-3.5 py-2 text-xs font-bold text-[#12071f] focus:border-[#4b1d7a] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4b1d7a] uppercase mb-1">
                  Description / Evaluation Rubric:
                </label>
                <textarea
                  rows={3}
                  value={eventDescInput}
                  onChange={(e) => setEventDescInput(e.target.value)}
                  placeholder="Describe evaluation rubrics, judging parameters, or time limits…"
                  className="w-full rounded-xl border border-[#4b1d7a]/20 bg-[#fdfbf7] px-3.5 py-2 text-xs text-[#12071f] focus:border-[#4b1d7a] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-[#4b1d7a]/10">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEvent}
                  className="rounded-xl bg-[#4b1d7a] px-5 py-2 text-xs font-bold text-[#e4b84a] shadow-md hover:brightness-110 disabled:opacity-50 cursor-pointer"
                >
                  {savingEvent ? "Saving…" : editingEvent ? "Update Event" : "Create Event Criteria"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
