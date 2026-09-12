"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { apiGet, apiSend } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { Venue } from "@/lib/types";
import { downloadOfflineScoreTemplate, type MasterExportData } from "@/lib/exportUtils";

type EventItem = {
  id: string;
  eventName: string;
  description?: string;
  maximumScore: number;
};

type TribeScoreRow = {
  tribeId: string;
  tribeCode: string;
  tribeName: string;
  groupName: string;
  theme: string;
  currentVenue: string;
  currentScore: number | null;
  remarks: string;
  totalScore: number;
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

export default function ScoresPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState<string>("");
  const [selectedGroupName, setSelectedGroupName] = useState<string>("");
  const [selectedEventId, setSelectedEventId] = useState<string>("");

  const [tribeRows, setTribeRows] = useState<TribeScoreRow[]>([]);
  const [scoresInput, setScoresInput] = useState<{ [tribeId: string]: string }>({});
  const [remarksInput, setRemarksInput] = useState<{ [tribeId: string]: string }>({});

  const [savingTribeId, setSavingTribeId] = useState<string | null>(null);
  const [savingAll, setSavingAll] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [exportingTemplate, setExportingTemplate] = useState(false);
  const [savedSuccessMap, setSavedSuccessMap] = useState<{ [tribeId: string]: boolean }>({});
  const [globalMessage, setGlobalMessage] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingRows, setLoadingRows] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Load user profile, venues, and events
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    Promise.all([
      apiSend<any>("/api/admin/me", token, "GET"),
      apiGet<Venue[]>("/api/venues"),
      apiGet<EventItem[]>("/api/events"),
    ])
      .then(([user, vList, eList]) => {
        if (user.role === "super_admin") {
          router.replace("/admin");
          return;
        }

        setCurrentUser(user);
        setVenues(vList);
        setEvents(eList);

        // Pre-select user's venue if assigned, or first venue
        const initialVenueId = user.venueId || (vList[0] ? vList[0].id : "");
        setSelectedVenueId(initialVenueId);

        // If this venue already has an active group assigned in DB, load it on refresh!
        const activeVenueObj = vList.find((v) => v.id === initialVenueId);
        const existingGroup = user?.venue?.groupName || (activeVenueObj?.groupName && activeVenueObj.groupName !== "null" ? activeVenueObj.groupName : "");
        if (existingGroup) {
          setSelectedGroupName(existingGroup);
        } else {
          setSelectedGroupName(user.role === "super_admin" ? "Group I" : "");
        }

        if (eList[0]) {
          setSelectedEventId(eList[0].id);
        }
        setLoading(false);
      })
      .catch(() => {
        setGlobalError("Failed to initialize score portal.");
        setLoading(false);
      });
  }, []);

  // Fetch score matrix whenever selectedGroupName or selectedEventId changes
  useEffect(() => {
    if (!selectedGroupName || !selectedEventId) return;
    const token = getToken();
    if (!token) return;

    setLoadingRows(true);
    setGlobalMessage("");
    setGlobalError("");

    apiSend<{ tribes: TribeScoreRow[] }>(
      `/api/admin/scores/matrix?groupName=${encodeURIComponent(selectedGroupName)}&eventId=${selectedEventId}`,
      token,
      "GET"
    )
      .then((data) => {
        const rows = data.tribes || [];
        setTribeRows(rows);

        // Populate local state inputs
        const initialScores: { [key: string]: string } = {};
        const initialRemarks: { [key: string]: string } = {};
        rows.forEach((r) => {
          initialScores[r.tribeId] = r.currentScore !== null ? String(r.currentScore) : "";
          initialRemarks[r.tribeId] = r.remarks || "";
        });
        setScoresInput(initialScores);
        setRemarksInput(initialRemarks);
      })
      .catch(() => {
        setGlobalError("Could not load tribes for this group/event.");
      })
      .finally(() => {
        setLoadingRows(false);
      });
  }, [selectedGroupName, selectedEventId]);

  const activeEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId),
    [events, selectedEventId]
  );

  const activeVenue = useMemo(
    () => venues.find((v) => v.id === selectedVenueId),
    [venues, selectedVenueId]
  );

  const filteredTribeRows = useMemo(() => {
    if (!searchQuery.trim()) return tribeRows;
    const q = searchQuery.toLowerCase().trim();
    return tribeRows.filter(
      (t) =>
        t.tribeName.toLowerCase().includes(q) ||
        t.tribeCode.toLowerCase().includes(q)
    );
  }, [tribeRows, searchQuery]);

  const groupsFromVenues = useMemo(() => {
    return ALL_GROUPS.map((g) => {
      const hostingVenue = venues.find(
        (v) => v.groupName && v.groupName.toLowerCase() === g.groupName.toLowerCase()
      );
      return {
        ...g,
        hostingVenue: hostingVenue || null,
      };
    });
  }, [venues]);

  const activeGroup = useMemo(
    () => (selectedGroupName ? groupsFromVenues.find((g) => g.groupName === selectedGroupName) || null : null),
    [selectedGroupName, groupsFromVenues]
  );

  // Assign/rotate selected group to the selected venue hall
  async function assignGroupToVenue(groupToAssign?: string) {
    const targetGroup = groupToAssign || selectedGroupName;
    if (!targetGroup || !selectedVenueId) return;
    setRotating(true);
    setGlobalError("");
    setGlobalMessage("");

    const prevHostingVenue = venues.find(
      (v) => v.groupName && v.groupName.toLowerCase() === targetGroup.toLowerCase() && v.id !== selectedVenueId
    );

    try {
      const res = await apiSend<any>("/api/admin/groups/assign-venue", getToken(), "PUT", {
        groupName: targetGroup,
        venueId: selectedVenueId,
        reason: `Host activated ${targetGroup} into ${activeVenue?.location || "Venue"}`,
      });

      if (prevHostingVenue) {
        setGlobalMessage(`✓ Transferred ${targetGroup} from ${prevHostingVenue.location} (${prevHostingVenue.venueName}) into ${res.venueLocation || activeVenue?.location || "your venue"}!`);
      } else {
        setGlobalMessage(`✓ ${targetGroup} (${res.updatedCount || 18} tribes) is now actively hosted in ${res.venueLocation || activeVenue?.location || "your venue"}!`);
      }

      setTribeRows((prev) =>
        prev.map((r) => ({ ...r, currentVenue: res.venueLocation || activeVenue?.location || "" }))
      );

      // Re-fetch all venues from server so accurate assignments are reflected across all venues
      try {
        const freshVenues = await apiGet<Venue[]>("/api/venues");
        setVenues(freshVenues);
      } catch {
        setVenues((prev) =>
          prev.map((v) => (v.id === selectedVenueId ? { ...v, groupName: targetGroup } : v))
        );
      }

      if (currentUser && currentUser.venue) {
        setCurrentUser((prev: any) => ({
          ...prev,
          venue: { ...prev.venue, groupName: targetGroup },
        }));
      }
    } catch (err: any) {
      setGlobalError(err.message || "Failed to rotate group to venue.");
    } finally {
      setRotating(false);
    }
  }

  // Unassign/deselect group and reset venue to standby
  async function unassignGroupFromVenue() {
    if (!selectedVenueId) return;
    setRotating(true);
    setGlobalError("");
    setGlobalMessage("");
    try {
      const res = await apiSend<any>("/api/admin/groups/unassign-venue", getToken(), "PUT", {
        venueId: selectedVenueId,
        reason: `Host unselected ${selectedGroupName || "group"} to standby in ${activeVenue?.location || "Venue"}`,
      });
      setSelectedGroupName("");
      setTribeRows([]);
      setGlobalMessage(`✓ ${selectedGroupName || "Group"} unselected. ${res.venueLocation || "Venue"} is now in Standby mode.`);
      try {
        const freshVenues = await apiGet<Venue[]>("/api/venues");
        setVenues(freshVenues);
      } catch {
        setVenues((prev) =>
          prev.map((v) => (v.id === selectedVenueId ? { ...v, groupName: null } : v))
        );
      }
      if (currentUser && currentUser.venue) {
        setCurrentUser((prev: any) => ({
          ...prev,
          venue: { ...prev.venue, groupName: null },
        }));
      }
    } catch (err: any) {
      setGlobalError(err.message || "Failed to unassign group.");
    } finally {
      setRotating(false);
    }
  }

  async function handleSelectGroup(groupName: string) {
    if (selectedGroupName === groupName) {
      if (currentUser?.role === "super_admin") {
        return; // Super admin keeps browsing
      }
      await unassignGroupFromVenue();
    } else {
      setSelectedGroupName(groupName);
      if (currentUser?.role !== "super_admin") {
        await assignGroupToVenue(groupName);
      }
    }
  }

  // Download offline score template for current group or all groups
  async function handleDownloadTemplate() {
    setExportingTemplate(true);
    try {
      const masterData = await apiSend<MasterExportData>("/api/admin/export/master-data", getToken(), "GET");
      downloadOfflineScoreTemplate(masterData, selectedGroupName || undefined);
    } catch {
      setGlobalError("Could not download scoring template.");
    } finally {
      setExportingTemplate(false);
    }
  }

  // Save single tribe score
  async function saveSingleScore(tribeId: string) {
    const rawScore = scoresInput[tribeId];
    if (rawScore === undefined || rawScore.trim() === "") {
      setGlobalError("Please enter a numeric score before saving.");
      return;
    }

    const num = Number(rawScore);
    if (Number.isNaN(num) || num < 0 || (activeEvent && num > activeEvent.maximumScore)) {
      setGlobalError(`Score must be a number between 0 and ${activeEvent?.maximumScore || 100}.`);
      return;
    }

    setSavingTribeId(tribeId);
    setGlobalError("");
    setGlobalMessage("");

    try {
      const result = await apiSend<{ totalScore: number }>(
        "/api/admin/scores",
        getToken(),
        "POST",
        {
          tribeId,
          eventId: selectedEventId,
          score: num,
          remarks: remarksInput[tribeId] || "",
          reason: "Live venue evaluation update",
        }
      );

      // Update local row state
      setTribeRows((prev) =>
        prev.map((r) =>
          r.tribeId === tribeId
            ? { ...r, currentScore: num, totalScore: result.totalScore }
            : r
        )
      );

      // Flash success indicator
      setSavedSuccessMap((prev) => ({ ...prev, [tribeId]: true }));
      setTimeout(() => {
        setSavedSuccessMap((prev) => ({ ...prev, [tribeId]: false }));
      }, 2500);

      setGlobalMessage(`✓ Score for tribe updated successfully!`);
    } catch (err: any) {
      setGlobalError(err.message || "Failed to save score.");
    } finally {
      setSavingTribeId(null);
    }
  }

  // Bulk Save all entered scores
  async function saveAllScores() {
    const enteredEntries: { tribeId: string; score: number; remarks: string }[] = [];

    for (const tribe of tribeRows) {
      const val = scoresInput[tribe.tribeId];
      if (val !== undefined && val.trim() !== "") {
        const num = Number(val);
        if (Number.isNaN(num) || num < 0 || (activeEvent && num > activeEvent.maximumScore)) {
          setGlobalError(`Invalid score for ${tribe.tribeCode} (${tribe.tribeName}). Must be between 0 and ${activeEvent?.maximumScore || 100}.`);
          return;
        }
        enteredEntries.push({
          tribeId: tribe.tribeId,
          score: num,
          remarks: remarksInput[tribe.tribeId] || "",
        });
      }
    }

    if (enteredEntries.length === 0) {
      setGlobalError("No score inputs found to save. Please enter scores first.");
      return;
    }

    setSavingAll(true);
    setGlobalError("");
    setGlobalMessage("");

    try {
      const token = getToken();
      await Promise.all(
        enteredEntries.map((e) =>
          apiSend("/api/admin/scores", token, "POST", {
            tribeId: e.tribeId,
            eventId: selectedEventId,
            score: e.score,
            remarks: e.remarks,
            reason: `Bulk live scoring for ${activeEvent?.eventName || "Event"}`,
          })
        )
      );

      // Re-fetch updated score matrix
      const refreshed = await apiSend<{ tribes: TribeScoreRow[] }>(
        `/api/admin/scores/matrix?groupName=${encodeURIComponent(selectedGroupName)}&eventId=${selectedEventId}`,
        token,
        "GET"
      );
      setTribeRows(refreshed.tribes || []);

      const newSuccessMap: { [key: string]: boolean } = {};
      enteredEntries.forEach((e) => (newSuccessMap[e.tribeId] = true));
      setSavedSuccessMap(newSuccessMap);
      setTimeout(() => setSavedSuccessMap({}), 3000);

      setGlobalMessage(`🎉 All ${enteredEntries.length} scores for ${activeEvent?.eventName || "Event"} saved successfully!`);
    } catch (err: any) {
      setGlobalError(err.message || "Error saving scores. Please check inputs.");
    } finally {
      setSavingAll(false);
    }
  }

  return (
    <AdminShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Header Card */}
        <div className="rounded-3xl border border-[#4b1d7a]/20 bg-gradient-to-r from-[#ffffff] via-[#fdfbf7] to-[#fbf7ee] p-5 sm:p-6 md:p-7 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="rounded-full bg-[#4b1d7a] px-3 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-white">
                {currentUser?.role === "super_admin" ? "👑 Master Score Portal" : "🏛️ Venue Evaluation Station"}
              </span>
              <span className="text-xs font-bold text-[#4b1d7a]">
                📍 {activeVenue?.location || "No Venue Allocated"}
              </span>
              {selectedGroupName && (
                <span className="rounded-md bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  {selectedGroupName} Active
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#12071f] tracking-tight">
              {selectedGroupName ? `${selectedGroupName}: ${activeGroup?.theme || "Evaluation"}` : "Score Entry"}
            </h1>
            <p className="text-xs text-[#6d6178] mt-1 font-medium">
              {activeEvent ? `Evaluating: ${activeEvent.eventName} (Max ${activeEvent.maximumScore} pts)` : "Select event below to begin evaluation"}
              {selectedGroupName ? ` · ${tribeRows.length} Competing Tribes` : ""}
            </p>
          </div>

          {/* Top Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              disabled={exportingTemplate}
              className="rounded-xl border border-[#4b1d7a]/20 bg-white px-3.5 py-2.5 text-xs font-bold text-[#4b1d7a] shadow-xs hover:bg-[#4b1d7a]/5 transition flex items-center gap-1.5 cursor-pointer"
              title="Download blank template to fill scores offline"
            >
              <span>📥</span>
              <span>{exportingTemplate ? "Preparing…" : "Offline Template"}</span>
            </button>

            {selectedGroupName && (
              <Link
                href={`/scoreboard?group=${encodeURIComponent(selectedGroupName)}${selectedVenueId ? `&venue=${encodeURIComponent(selectedVenueId)}` : ""}&station=true`}
                target="_blank"
                className="rounded-xl border border-[#4b1d7a]/20 bg-white px-3.5 py-2.5 text-xs font-bold text-[#4b1d7a] shadow-xs hover:bg-[#4b1d7a]/5 transition flex items-center gap-1.5"
              >
                <span>📺</span>
                <span>Projector</span>
              </Link>
            )}

            <button
              type="button"
              onClick={saveAllScores}
              disabled={savingAll || tribeRows.length === 0 || !selectedGroupName}
              className="rounded-xl bg-gradient-to-r from-[#4b1d7a] to-[#301250] px-5 py-2.5 text-xs font-bold text-[#e4b84a] shadow-md hover:brightness-110 active:scale-[0.99] transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {savingAll ? (
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#e4b84a] border-t-transparent" />
              ) : (
                <span>💾</span>
              )}
              <span>Save All Scores</span>
            </button>
          </div>
        </div>

        {/* Global Notifications */}
        {globalMessage && (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800 animate-fade-in flex items-center justify-between">
            <span>✅ {globalMessage}</span>
            <button type="button" onClick={() => setGlobalMessage("")} className="text-emerald-800 hover:text-black cursor-pointer">✕</button>
          </div>
        )}
        {globalError && (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-3.5 text-xs font-semibold text-red-800 animate-fade-in flex items-center justify-between">
            <span>⚠️ {globalError}</span>
            <button type="button" onClick={() => setGlobalError("")} className="text-red-800 hover:text-black cursor-pointer">✕</button>
          </div>
        )}

        {/* Clean Selector Panel: Group & Event */}
        <div className="rounded-3xl border border-[#4b1d7a]/15 bg-white/90 p-5 md:p-6 shadow-sm backdrop-blur-md space-y-4">
          {/* Group Selector */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#4b1d7a]">
                1. Select Competing Group:
              </label>
              <span className="text-[11px] text-[#6d6178]">
                {currentUser?.role === "super_admin" ? "Switch between 5 groups" : "Select or rotate group in your hall"}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {groupsFromVenues.map((g) => {
                const isSelected = selectedGroupName === g.groupName;
                const hostingVenue = g.hostingVenue;
                return (
                  <button
                    key={g.groupName}
                    type="button"
                    onClick={() => handleSelectGroup(g.groupName)}
                    className={`rounded-2xl p-3.5 text-left transition-all duration-200 border flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? "bg-[#12071f] text-white border-[#e4b84a] ring-2 ring-[#e4b84a]/30 shadow-md"
                        : "bg-[#fdfbf7] text-[#12071f] border-[#4b1d7a]/15 hover:border-[#4b1d7a] hover:bg-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg">{g.icon}</span>
                        <span className={`text-[10px] font-extrabold uppercase ${isSelected ? "text-[#e4b84a]" : "text-[#4b1d7a]"}`}>
                          {g.groupName}
                        </span>
                      </div>
                      <p className="font-extrabold text-xs mt-1.5 leading-tight">{g.theme}</p>
                    </div>

                    <div className="mt-2.5 pt-1.5 border-t border-black/[0.06] flex items-center justify-between text-[10px]">
                      <span className="opacity-70 font-semibold">{g.groupName === "Group V" ? "19" : "18"} Teams</span>
                      {hostingVenue ? (
                        <span className={`font-bold ${isSelected ? "text-emerald-400" : "text-indigo-600"}`}>
                          📍 {hostingVenue.location.split(" ")[0]}
                        </span>
                      ) : (
                        <span className="text-slate-400">Standby</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Event Selector */}
          <div className="border-t border-[#4b1d7a]/10 pt-4">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#4b1d7a]">
                2. Select Evaluation Event Criteria:
              </label>
              {currentUser?.role === "super_admin" && (
                <Link href="/admin#events" className="text-[11px] font-bold text-[#4b1d7a] hover:text-[#e4b84a]">
                  ⚙️ Manage / Add Events →
                </Link>
              )}
            </div>
            <div className="flex flex-wrap gap-2.5">
              {events.map((e) => {
                const isSelected = selectedEventId === e.id;
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => setSelectedEventId(e.id)}
                    className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                      isSelected
                        ? "bg-[#e4b84a] text-[#12071f] shadow-md shadow-[#e4b84a]/25 scale-[1.02]"
                        : "bg-white text-[#12071f] border border-[#4b1d7a]/15 hover:bg-[#fdfbf7] hover:border-[#4b1d7a]/40"
                    }`}
                  >
                    <span>{e.eventName}</span>
                    <span className="rounded-md bg-black/10 px-2 py-0.5 text-[10px] font-mono font-bold">
                      Max {e.maximumScore} pts
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 18 Teams Evaluation Grid */}
        <div className="rounded-2xl sm:rounded-3xl border border-[#4b1d7a]/15 bg-white/90 shadow-sm backdrop-blur-md overflow-hidden">
          <div className="border-b border-[#4b1d7a]/10 bg-[#4b1d7a]/5 px-4 sm:px-6 py-3.5 sm:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#12071f] flex items-center gap-2">
                <span>
                  {selectedGroupName && activeGroup
                    ? `${selectedGroupName}: ${activeGroup.theme} · ${tribeRows.length} Teams Matrix`
                    : "Team Evaluation Matrix"}
                </span>
                {selectedGroupName ? (
                  <span className="hidden sm:inline-flex rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live Sync Active</span>
                  </span>
                ) : null}
              </h2>
              <p className="text-xs text-[#6d6178] mt-0.5">
                Evaluating Event: <strong className="text-[#4b1d7a]">{activeEvent?.eventName || "No event selected"}</strong> {activeEvent ? `(0 to ${activeEvent.maximumScore} points)` : ""}
              </p>
            </div>

            {selectedGroupName && tribeRows.length > 0 && (
              <div className="flex items-center gap-2.5 w-full md:w-auto">
                <div className="relative flex-1 md:w-72">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#4b1d7a]/60 pointer-events-none">🔍</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search team name or code (e.g. Byte, SIP-019)…"
                    className="w-full rounded-xl border border-[#4b1d7a]/20 bg-white pl-8 pr-7 py-2 text-xs text-[#12071f] font-semibold placeholder-[#6d6178]/60 outline-none transition focus:border-[#4b1d7a] focus:ring-2 focus:ring-[#4b1d7a]/15 shadow-xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#6d6178] hover:text-[#12071f] cursor-pointer p-0.5"
                      title="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </div>
                {searchQuery && (
                  <span className="text-[11px] font-bold text-[#4b1d7a] bg-[#4b1d7a]/8 px-2 py-1 rounded-lg shrink-0">
                    {filteredTribeRows.length} of {tribeRows.length}
                  </span>
                )}
              </div>
            )}
          </div>

          {!selectedGroupName ? (
            <div className="py-20 text-center text-sm text-[#6d6178] animate-fade-in">
              <span className="text-4xl block mb-3">🎯</span>
              <p className="font-bold text-base text-[#12071f]">No Group Selected</p>
              <p className="text-xs text-[#6d6178] mt-1">Please select which group is currently present in your venue hall in Step 1 above to load teams and enter scores.</p>
            </div>
          ) : events.length === 0 ? (
            <div className="py-20 text-center text-sm text-[#6d6178]">
              <span className="text-3xl block mb-2">⚡</span>
              <p className="font-bold text-base text-[#12071f]">No Scoring Events Created Yet</p>
              <p className="text-xs text-[#6d6178] mt-1">Please create an event in Event Management to begin scoring teams.</p>
            </div>
          ) : loadingRows ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#4b1d7a] border-t-transparent" />
              <p className="text-xs font-semibold text-[#6d6178]">Loading team scores…</p>
            </div>
          ) : tribeRows.length === 0 ? (
            <div className="py-20 text-center text-sm text-[#6d6178]">
              No tribes found in {selectedGroupName}.
            </div>
          ) : filteredTribeRows.length === 0 ? (
            <div className="py-16 text-center text-sm text-[#6d6178] animate-fade-in">
              <span className="text-3xl block mb-2">🔍</span>
              <p className="font-bold text-base text-[#12071f]">No matching teams found</p>
              <p className="text-xs text-[#6d6178] mt-1">No team matches "{searchQuery}" in {selectedGroupName}.</p>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-3 rounded-xl border border-[#4b1d7a]/20 bg-white px-3.5 py-1.5 text-xs font-bold text-[#4b1d7a] hover:bg-[#4b1d7a]/5 transition cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#4b1d7a]/8">
              {filteredTribeRows.map((tribe, index) => {
                const isSaving = savingTribeId === tribe.tribeId;
                const isSaved = savedSuccessMap[tribe.tribeId];
                const currentVal = scoresInput[tribe.tribeId] || "";

                return (
                  <div
                    key={tribe.tribeId}
                    className={`grid grid-cols-1 md:grid-cols-12 items-center gap-3 px-3.5 sm:px-6 py-3 sm:py-4 transition-colors ${
                      isSaved ? "bg-emerald-50/70" : "hover:bg-white/60"
                    }`}
                  >
                    {/* Index & Tribe Info */}
                    <div className="md:col-span-5 flex items-center gap-2.5 sm:gap-3">
                      <span className="grid h-6 w-6 sm:h-7 sm:w-7 shrink-0 place-items-center rounded-lg sm:rounded-xl bg-[#4b1d7a]/10 text-xs font-bold text-[#4b1d7a]">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="block font-bold text-sm sm:text-base text-[#12071f] truncate">
                          {tribe.tribeName}
                        </span>
                        <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
                          <span className="font-mono text-[11px] sm:text-xs font-bold text-[#4b1d7a] bg-[#4b1d7a]/8 px-1.5 py-0.2 rounded">
                            {tribe.tribeCode}
                          </span>
                          <span className="text-[10px] text-[#6d6178]">·</span>
                          <span className="text-[11px] sm:text-xs text-[#6d6178] truncate">
                            Total: <strong className="text-[#12071f] font-bold">{tribe.totalScore} pts</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Controls Container (Score + Remarks + Action) */}
                    <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-2 sm:gap-2.5 items-center">
                      {/* Score Input */}
                      <div className="md:col-span-3 relative w-full">
                        <input
                          type="number"
                          min={0}
                          max={activeEvent?.maximumScore || 100}
                          value={currentVal}
                          onChange={(e) =>
                            setScoresInput({ ...scoresInput, [tribe.tribeId]: e.target.value })
                          }
                          placeholder="Score"
                          className="w-full rounded-xl border border-[#4b1d7a]/25 bg-white px-3 py-2 text-sm font-bold text-[#12071f] outline-none transition focus:border-[#4b1d7a] focus:ring-2 focus:ring-[#4b1d7a]/15"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#6d6178] pointer-events-none">
                          / {activeEvent?.maximumScore || 100}
                        </span>
                      </div>

                      {/* Remarks Input */}
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          value={remarksInput[tribe.tribeId] || ""}
                          onChange={(e) =>
                            setRemarksInput({ ...remarksInput, [tribe.tribeId]: e.target.value })
                          }
                          placeholder="Remarks (opt)"
                          className="w-full rounded-xl border border-[#4b1d7a]/15 bg-white px-3 py-2 text-xs text-[#12071f] outline-none transition focus:border-[#4b1d7a]"
                        />
                      </div>

                      {/* Action Button */}
                      <div className="md:col-span-2 text-right">
                        <button
                          type="button"
                          onClick={() => saveSingleScore(tribe.tribeId)}
                          disabled={isSaving}
                          className={`w-full rounded-xl px-3 sm:px-4 py-2 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                            isSaved
                              ? "bg-emerald-600 text-white"
                              : "bg-[#12071f] text-[#e4b84a] hover:bg-[#25103a]"
                          } disabled:opacity-50`}
                        >
                          {isSaving ? (
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#e4b84a] border-t-transparent" />
                          ) : isSaved ? (
                            "✓ Saved"
                          ) : (
                            "Save Score"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
