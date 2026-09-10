"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { apiGet, apiSend } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { Venue } from "@/lib/types";

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
  const [savedSuccessMap, setSavedSuccessMap] = useState<{ [tribeId: string]: boolean }>({});
  const [globalMessage, setGlobalMessage] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingRows, setLoadingRows] = useState(false);

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
        setCurrentUser(user);
        setVenues(vList);
        setEvents(eList);

        // Pre-select user's venue if assigned, or first venue
        const initialVenueId = user.venueId || (vList[0] ? vList[0].id : "");
        setSelectedVenueId(initialVenueId);

        // Pre-select the venue's active group (e.g. Group II for ECE Seminar Hall)
        const userVenue = vList.find((v) => v.id === initialVenueId);
        const initialGroup = user.venue?.groupName || userVenue?.groupName || "Group I";
        setSelectedGroupName(initialGroup);

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

  const activeGroup = useMemo(
    () => groupsFromVenues.find((g) => g.groupName === selectedGroupName) || groupsFromVenues[0] || { groupName: "Group I", theme: "Creative & Design", icon: "🎨" },
    [selectedGroupName, groupsFromVenues]
  );

  // Assign/rotate selected group to the selected venue hall
  async function assignGroupToVenue() {
    if (!selectedGroupName || !selectedVenueId) return;
    setRotating(true);
    setGlobalError("");
    setGlobalMessage("");
    try {
      const res = await apiSend<any>("/api/admin/groups/assign-venue", getToken(), "PUT", {
        groupName: selectedGroupName,
        venueId: selectedVenueId,
        reason: `Rotated ${selectedGroupName} into ${activeVenue?.location || "Venue"}`,
      });
      setGlobalMessage(`✓ ${selectedGroupName} (${res.updatedCount} tribes) is now actively hosted in ${res.venueLocation}!`);
      setTribeRows((prev) =>
        prev.map((r) => ({ ...r, currentVenue: res.venueLocation }))
      );
      // Re-fetch all venues from server so accurate swapped assignments are reflected
      try {
        const freshVenues = await apiGet<Venue[]>("/api/venues");
        setVenues(freshVenues);
      } catch {
        setVenues((prev) =>
          prev.map((v) => (v.id === selectedVenueId ? { ...v, groupName: selectedGroupName } : v))
        );
      }
      if (currentUser && currentUser.venue) {
        setCurrentUser((prev: any) => ({
          ...prev,
          venue: { ...prev.venue, groupName: selectedGroupName },
        }));
      }
    } catch (err: any) {
      setGlobalError(err.message || "Failed to rotate group to venue.");
    } finally {
      setRotating(false);
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

      setGlobalMessage(`Saved score (${num} pts). New total: ${result.totalScore} pts.`);
    } catch (err: any) {
      setGlobalError(err.message || "Failed to save score.");
    } finally {
      setSavingTribeId(null);
    }
  }

  // Save all entered scores
  async function saveAllScores() {
    setSavingAll(true);
    setGlobalError("");
    setGlobalMessage("");
    let savedCount = 0;

    for (const row of tribeRows) {
      const raw = scoresInput[row.tribeId];
      if (raw !== undefined && raw.trim() !== "") {
        const num = Number(raw);
        if (!Number.isNaN(num) && num >= 0 && (!activeEvent || num <= activeEvent.maximumScore)) {
          try {
            await apiSend("/api/admin/scores", getToken(), "POST", {
              tribeId: row.tribeId,
              eventId: selectedEventId,
              score: num,
              remarks: remarksInput[row.tribeId] || "",
              reason: "Batch live scoring",
            });
            savedCount += 1;
          } catch {
            // continue
          }
        }
      }
    }

    setSavingAll(false);
    setGlobalMessage(`Successfully saved scores for ${savedCount} teams! Live scores updated across all screens.`);
  }

  return (
    <AdminShell>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header & Main Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#4b1d7a]/10 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#12071f] px-3 py-0.5 text-[11px] font-bold text-[#e4b84a]">
                {currentUser?.role === "super_admin" ? "👑 Super Admin" : "🏛️ Venue Host"}
              </span>
              <span className="text-xs text-[#6d6178] font-medium">Real-time Score Management</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#12071f] tracking-tight mt-1">
              {selectedGroupName}: {activeGroup.theme}
            </h1>
            <p className="text-xs text-[#6d6178] mt-0.5">
              Host Location: <strong className="text-[#4b1d7a]">{activeVenue?.location || "Assigned Hall"}</strong> · 18 Competing Teams
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            <Link
              href={`/scoreboard?group=${encodeURIComponent(selectedGroupName)}${selectedVenueId ? `&venue=${encodeURIComponent(selectedVenueId)}` : activeVenue?.id ? `&venue=${encodeURIComponent(activeVenue.id)}` : ""}`}
              target="_blank"
              className="rounded-xl border border-[#4b1d7a]/20 bg-white px-4 py-2.5 text-xs font-bold text-[#4b1d7a] shadow-sm hover:bg-[#4b1d7a]/5 transition flex items-center justify-center gap-1.5 text-center"
            >
              <span>📺</span>
              <span>Projector ({selectedGroupName})</span>
            </Link>

            <button
              type="button"
              onClick={saveAllScores}
              disabled={savingAll || tribeRows.length === 0}
              className="rounded-xl bg-gradient-to-r from-[#4b1d7a] to-[#301250] px-5 py-2.5 text-xs font-bold text-[#e4b84a] shadow-md hover:brightness-110 active:scale-[0.99] transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-center"
            >
              {savingAll ? (
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#e4b84a] border-t-transparent" />
              ) : (
                <span>💾</span>
              )}
              <span>Save All 18 Scores</span>
            </button>
          </div>
        </div>

        {/* Global Notifications */}
        {globalMessage && (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800 animate-fade-in flex items-center justify-between">
            <span>✅ {globalMessage}</span>
            <button type="button" onClick={() => setGlobalMessage("")} className="text-emerald-800 hover:text-black">✕</button>
          </div>
        )}
        {globalError && (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-3.5 text-xs font-semibold text-red-800 animate-fade-in flex items-center justify-between">
            <span>⚠️ {globalError}</span>
            <button type="button" onClick={() => setGlobalError("")} className="text-red-800 hover:text-black">✕</button>
          </div>
        )}

        {/* Dynamic Controls Card */}
        <div className="rounded-3xl border border-[#4b1d7a]/15 bg-white/90 p-5 md:p-6 shadow-sm backdrop-blur-md space-y-5">
          {/* Step 1: Group Selector */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#4b1d7a]">
                1. Select Present Group to Score:
              </label>
              <span className="text-[11px] text-[#6d6178]">Choose any group present in your venue hall</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              {groupsFromVenues.map((g, idx) => {
                const isSelected = selectedGroupName === g.groupName;
                const groupSelectedStyle =
                  idx === 0
                    ? "bg-gradient-to-br from-[#12071f] via-[#2d0a1b] to-[#12071f] text-white border-rose-400 ring-2 ring-rose-400/40 shadow-lg shadow-rose-900/30"
                    : idx === 1
                    ? "bg-gradient-to-br from-[#12071f] via-[#082032] to-[#12071f] text-white border-cyan-400 ring-2 ring-cyan-400/40 shadow-lg shadow-cyan-900/30"
                    : idx === 2
                    ? "bg-gradient-to-br from-[#12071f] via-[#260c38] to-[#12071f] text-white border-purple-400 ring-2 ring-purple-400/40 shadow-lg shadow-purple-900/30"
                    : idx === 3
                    ? "bg-gradient-to-br from-[#12071f] via-[#2d2208] to-[#12071f] text-white border-amber-400 ring-2 ring-amber-400/40 shadow-lg shadow-amber-900/30"
                    : "bg-gradient-to-br from-[#12071f] via-[#331405] to-[#12071f] text-white border-orange-400 ring-2 ring-orange-400/40 shadow-lg shadow-orange-900/30";

                return (
                  <button
                    key={g.groupName}
                    type="button"
                    onClick={() => setSelectedGroupName(g.groupName)}
                    className={`rounded-2xl p-4 text-left transition-all duration-300 border flex flex-col justify-between cursor-pointer hover-lift ${
                      isSelected
                        ? groupSelectedStyle
                        : "bg-white text-[#12071f] border-[#4b1d7a]/15 hover:border-[#4b1d7a]/35 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl transition-transform duration-300 hover:scale-125">{g.icon}</span>
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isSelected ? "text-[#e4b84a]" : "text-[#4b1d7a]"}`}>
                        {g.groupName}
                      </span>
                    </div>
                    <p className="font-extrabold text-xs mt-2.5 leading-snug">{g.theme}</p>
                    <div className="mt-2 flex items-center justify-between text-[10px]">
                      <span className="opacity-70 font-semibold">18 Teams</span>
                      {isSelected && (
                        <span className="h-2 w-2 rounded-full bg-[#35d07f] animate-pulse" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Physical Venue Hall */}
          <div className="border-t border-[#4b1d7a]/10 pt-4">
            {currentUser?.role === "super_admin" ? (
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#4b1d7a]">
                    2. Physical Venue Location (Super Admin Control):
                  </label>
                  <button
                    type="button"
                    onClick={assignGroupToVenue}
                    disabled={rotating}
                    className="rounded-full border border-[#4b1d7a]/30 bg-white px-3 py-1 text-[11px] font-bold text-[#4b1d7a] hover:bg-[#4b1d7a] hover:text-white transition disabled:opacity-50 shadow-xs"
                  >
                    {rotating ? "Updating…" : `📍 Set ${selectedGroupName} Active in ${activeVenue?.location.split(" ")[0] || "this Hall"}`}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {venues.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVenueId(v.id)}
                      className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
                        selectedVenueId === v.id
                          ? "bg-[#4b1d7a] text-[#e4b84a] shadow-xs"
                          : "bg-white text-[#12071f] border border-[#4b1d7a]/15 hover:bg-white/80"
                      }`}
                    >
                      <span>📍 {v.location}</span>
                      <span className="text-[10px] opacity-60">({v.venueName})</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#4b1d7a]">
                    Host Venue Location:
                  </label>
                  <span className="inline-flex items-center gap-2 rounded-xl border border-[#4b1d7a]/20 bg-[#4b1d7a]/5 px-3.5 py-1.5 text-xs font-extrabold text-[#12071f]">
                    <span>📍</span>
                    <span>{activeVenue?.location || "Assigned Hall"}</span>
                    <span className="text-[10px] text-[#6d6178] font-normal">({activeVenue?.venueName})</span>
                    <span className="rounded-md bg-purple-100 border border-purple-200 px-2 py-0.5 text-[10px] font-bold text-purple-800">
                      🔒 Your Assigned Hall
                    </span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={assignGroupToVenue}
                  disabled={rotating}
                  className="rounded-full border border-[#4b1d7a]/30 bg-white px-3.5 py-1.5 text-xs font-bold text-[#4b1d7a] hover:bg-[#4b1d7a] hover:text-white transition disabled:opacity-50 shadow-xs"
                >
                  {rotating ? "Updating…" : `📍 Set ${selectedGroupName} Active in ${activeVenue?.location.split(" ")[0] || "this Hall"}`}
                </button>
              </div>
            )}
          </div>

          {/* Step 3: Active Event */}
          <div className="border-t border-[#4b1d7a]/10 pt-4">
            <label className="text-xs font-bold uppercase tracking-wider text-[#4b1d7a] block mb-2.5">
              3. Select Active Evaluation Event:
            </label>
            <div className="flex flex-wrap gap-2">
              {events.map((e) => {
                const isSelected = selectedEventId === e.id;
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => setSelectedEventId(e.id)}
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-2 ${
                      isSelected
                        ? "bg-[#e4b84a] text-[#12071f] shadow-md shadow-[#e4b84a]/20"
                        : "bg-white text-[#12071f] border border-[#4b1d7a]/15 hover:bg-white/80"
                    }`}
                  >
                    <span>{e.eventName}</span>
                    <span className="rounded-md bg-black/10 px-1.5 py-0.5 text-[10px] font-mono font-bold">
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
          <div className="border-b border-[#4b1d7a]/10 bg-[#4b1d7a]/5 px-4 sm:px-6 py-3.5 sm:py-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#12071f]">
                {selectedGroupName}: {activeGroup.theme} · 18 Teams Matrix
              </h2>
              <p className="text-xs text-[#6d6178]">
                Evaluating Event: <strong className="text-[#4b1d7a]">{activeEvent?.eventName}</strong> (0 to {activeEvent?.maximumScore || 100} points)
              </p>
            </div>
            <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-[11px] font-bold text-emerald-800 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Sync Active</span>
            </span>
          </div>

          {loadingRows ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#4b1d7a] border-t-transparent" />
              <p className="text-xs font-semibold text-[#6d6178]">Loading team scores…</p>
            </div>
          ) : tribeRows.length === 0 ? (
            <div className="py-20 text-center text-sm text-[#6d6178]">
              No tribes found in {selectedGroupName}.
            </div>
          ) : (
            <div className="divide-y divide-[#4b1d7a]/8">
              {tribeRows.map((tribe, index) => {
                const isSaving = savingTribeId === tribe.tribeId;
                const isSaved = savedSuccessMap[tribe.tribeId];
                const currentVal = scoresInput[tribe.tribeId] || "";

                return (
                  <div
                    key={tribe.tribeId}
                    className={`grid grid-cols-1 md:grid-cols-12 items-center gap-3 px-4 sm:px-6 py-3.5 sm:py-4 transition-colors ${
                      isSaved ? "bg-emerald-50/70" : "hover:bg-white/60"
                    }`}
                  >
                    {/* Index & Tribe Info */}
                    <div className="md:col-span-5 flex items-center gap-3">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-[#4b1d7a]/10 text-xs font-bold text-[#4b1d7a]">
                        {index + 1}
                      </span>
                      <div>
                        <span className="block font-bold text-sm md:text-base text-[#12071f]">
                          {tribe.tribeName}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-xs font-bold text-[#4b1d7a] bg-[#4b1d7a]/8 px-1.5 py-0.2 rounded">
                            {tribe.tribeCode}
                          </span>
                          <span className="text-[10px] text-[#6d6178]">·</span>
                          <span className="text-xs text-[#6d6178]">
                            Total Points: <strong className="text-[#12071f] font-bold">{tribe.totalScore}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Score Input */}
                    <div className="md:col-span-3 flex items-center gap-2">
                      <div className="relative w-full">
                        <input
                          type="number"
                          min={0}
                          max={activeEvent?.maximumScore || 100}
                          value={currentVal}
                          onChange={(e) =>
                            setScoresInput({ ...scoresInput, [tribe.tribeId]: e.target.value })
                          }
                          placeholder="Score (0-100)"
                          className="w-full rounded-xl border border-[#4b1d7a]/25 bg-white px-3 py-2 text-sm font-bold text-[#12071f] outline-none transition focus:border-[#4b1d7a] focus:ring-2 focus:ring-[#4b1d7a]/15"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#6d6178]">
                          / {activeEvent?.maximumScore || 100}
                        </span>
                      </div>
                    </div>

                    {/* Remarks Input */}
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        value={remarksInput[tribe.tribeId] || ""}
                        onChange={(e) =>
                          setRemarksInput({ ...remarksInput, [tribe.tribeId]: e.target.value })
                        }
                        placeholder="Remarks (optional)"
                        className="w-full rounded-xl border border-[#4b1d7a]/15 bg-white px-3 py-2 text-xs text-[#12071f] outline-none transition focus:border-[#4b1d7a]"
                      />
                    </div>

                    {/* Action Button */}
                    <div className="md:col-span-2 text-right">
                      <button
                        type="button"
                        onClick={() => saveSingleScore(tribe.tribeId)}
                        disabled={isSaving}
                        className={`w-full md:w-auto rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 ${
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
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
