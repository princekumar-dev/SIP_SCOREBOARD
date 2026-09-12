"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SOCKET_URL } from "@/lib/config";
import { rankLabel, formatMemberMeta } from "@/lib/format";
import type { TribeProfile } from "@/lib/types";

export function TribeModal({
  tribeId,
  onClose,
}: {
  tribeId: string | null;
  onClose: () => void;
}) {
  const [data, setData] = useState<TribeProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tribeId) {
      setData(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`${SOCKET_URL}/api/tribes/${tribeId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((res) => {
        if (!cancelled) {
          setData(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tribeId]);

  if (!tribeId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-2.5 sm:p-4 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl sm:rounded-3xl border border-[#e4b84a]/20 bg-[#12071f] p-4 sm:p-6 md:p-8 text-[#f7f1e6] shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#e4b84a]/[0.06] rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#4b1d7a]/20 rounded-full blur-[60px] pointer-events-none" />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 sm:right-5 sm:top-5 grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full border border-white/15 bg-white/5 text-sm text-white/70 hover:border-white/30 hover:text-white transition-all z-10 cursor-pointer"
        >
          ✕
        </button>

        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e4b84a] border-t-transparent" />
            <p className="text-xs sm:text-sm text-[#f7f1e6]/50">Loading tribe details…</p>
          </div>
        ) : data ? (
          <div className="relative z-[1]">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pr-8">
              <span className="rounded-full bg-[#e4b84a]/15 border border-[#e4b84a]/25 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[11px] sm:text-xs font-bold tracking-wider text-[#e4b84a]">
                {data.tribeCode}
              </span>
              <span className="text-[11px] sm:text-xs text-[#f7f1e6]/50 truncate max-w-[220px] sm:max-w-none">
                {data.venue?.theme || data.theme || "Theme"} · 📍 {data.venue?.location && data.venue.location !== "No Venue Allocated" ? data.venue.location : "No Venue Allocated"}
              </span>
            </div>

            <h2 className="display mt-2 sm:mt-3 text-2xl sm:text-3xl md:text-4xl font-bold text-[#f7f1e6] leading-tight">{data.tribeName}</h2>

            <div className="mt-4 sm:mt-6 grid grid-cols-3 gap-1.5 sm:gap-3">
              <div className="rounded-xl sm:rounded-2xl border border-white/[0.08] bg-white/[0.04] p-2 sm:p-4 text-center">
                <p className="text-[7px] sm:text-[9px] tracking-[0.08em] sm:tracking-[0.18em] uppercase text-[#f7f1e6]/50 font-semibold truncate">Overall Rank</p>
                <p className="display mt-1 sm:mt-2 text-lg sm:text-2xl font-bold text-[#e4b84a]">{rankLabel(data.overallRank)}</p>
              </div>
              <div className="rounded-xl sm:rounded-2xl border border-white/[0.08] bg-white/[0.04] p-2 sm:p-4 text-center">
                <p className="text-[7px] sm:text-[9px] tracking-[0.08em] sm:tracking-[0.18em] uppercase text-[#f7f1e6]/50 font-semibold truncate">Group Rank</p>
                <p className="display mt-1 sm:mt-2 text-lg sm:text-2xl font-bold text-[#f7f1e6]">{rankLabel(data.groupRank !== undefined ? data.groupRank : data.venueRank)}</p>
              </div>
              <div className="rounded-xl sm:rounded-2xl border border-white/[0.08] bg-white/[0.04] p-2 sm:p-4 text-center">
                <p className="text-[7px] sm:text-[9px] tracking-[0.08em] sm:tracking-[0.18em] uppercase text-[#f7f1e6]/50 font-semibold truncate">Total Score</p>
                <p className="display mt-1 sm:mt-2 text-lg sm:text-2xl font-bold text-[#e4b84a]">{data.totalScore}</p>
              </div>
            </div>

            <div className="mt-5 sm:mt-6">
              <h3 className="text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase text-[#e4b84a]">Event Evaluations</h3>
              <div className="mt-2.5 space-y-2">
                {!data.events || data.events.length === 0 ? (
                  <p className="text-xs text-[#f7f1e6]/40 py-2">No evaluation events created yet.</p>
                ) : (
                  data.events.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-medium text-white truncate">{event.eventName}</p>
                        <p className="text-[11px] text-[#f7f1e6]/40">Max {event.maximumScore} pts</p>
                      </div>
                      <span className="display text-lg sm:text-xl font-bold text-[#e4b84a] shrink-0">
                        {event.score !== null ? event.score : "—"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-5 sm:mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase text-[#e4b84a]">Team Members</h3>
                <span className="text-[10px] text-white/40">{data.members.length} Members</span>
              </div>
              <div className="mt-2.5 grid gap-2 sm:gap-2.5 grid-cols-1 sm:grid-cols-2">
                {data.members.map((member) => {
                  if (member.isLeader) {
                    return (
                      <div
                        key={member.id}
                        className="rounded-xl border border-[#e4b84a]/60 bg-gradient-to-br from-[#e4b84a]/20 via-[#301250]/80 to-[#12071f] p-2.5 sm:p-3 shadow-md shadow-[#e4b84a]/10 relative overflow-hidden transition-all hover:border-[#e4b84a] flex flex-col justify-between"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs sm:text-sm font-extrabold text-[#e4b84a] leading-tight truncate">
                            {member.name}
                          </p>
                          <span className="rounded-full bg-[#e4b84a] px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-extrabold uppercase tracking-wider text-[#12071f] shadow-xs shrink-0 flex items-center gap-1">
                            <span>👑</span>
                            <span>Lead</span>
                          </span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-white/80 mt-1 font-medium">
                          {formatMemberMeta(member.department, member.classSection)}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={member.id}
                      className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-2.5 sm:p-3 hover:bg-white/[0.07] hover:border-white/20 transition-all flex flex-col justify-between"
                    >
                      <p className="text-xs sm:text-sm font-semibold text-white truncate">{member.name}</p>
                      <p className="text-[11px] sm:text-xs text-[#e4b84a]/70 mt-0.5 sm:mt-1">
                        {formatMemberMeta(member.department, member.classSection)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 sm:mt-8 flex justify-end">
              <Link
                href={`/tribe/${data.id}`}
                className="btn-gold w-full sm:w-auto text-center justify-center flex items-center !py-2.5 !px-6 !text-xs"
              >
                View Full Profile →
              </Link>
            </div>
          </div>
        ) : (
          <p className="py-12 text-center text-xs sm:text-sm text-[#f7f1e6]/50">Unable to load tribe data.</p>
        )}
      </div>
    </div>
  );
}
