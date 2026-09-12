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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl sm:rounded-3xl border border-[#e4b84a]/20 bg-[#12071f] p-5 sm:p-6 md:p-8 text-[#f7f1e6] shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#e4b84a]/[0.06] rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#4b1d7a]/20 rounded-full blur-[60px] pointer-events-none" />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-3.5 top-3.5 sm:right-5 sm:top-5 grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full border border-white/15 bg-white/5 text-sm text-white/70 hover:border-white/30 hover:text-white transition-all z-10"
        >
          ✕
        </button>

        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e4b84a] border-t-transparent" />
            <p className="text-sm text-[#f7f1e6]/50">Loading tribe details…</p>
          </div>
        ) : data ? (
          <div className="relative z-[1]">
            <div className="flex flex-wrap items-center gap-2 pr-8">
              <span className="rounded-full bg-[#e4b84a]/15 border border-[#e4b84a]/25 px-3 py-1 text-xs font-bold tracking-wider text-[#e4b84a]">
                {data.tribeCode}
              </span>
              <span className="text-xs text-[#f7f1e6]/50">
                {data.venue?.theme || data.theme || "Theme"} · 📍 {data.venue?.location && data.venue.location !== "No Venue Allocated" ? data.venue.location : "No Venue Allocated"}
              </span>
            </div>

            <h2 className="display mt-3 text-2xl sm:text-3xl md:text-4xl font-bold text-[#f7f1e6]">{data.tribeName}</h2>

            <div className="mt-5 sm:mt-6 grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-xl sm:rounded-2xl border border-white/[0.08] bg-white/[0.04] p-2.5 sm:p-4 text-center">
                <p className="text-[8px] sm:text-[9px] tracking-[0.1em] sm:tracking-[0.18em] uppercase text-[#f7f1e6]/50 font-semibold truncate">Overall Rank</p>
                <p className="display mt-1 sm:mt-2 text-xl sm:text-2xl font-bold text-[#e4b84a]">{rankLabel(data.overallRank)}</p>
              </div>
              <div className="rounded-xl sm:rounded-2xl border border-white/[0.08] bg-white/[0.04] p-2.5 sm:p-4 text-center">
                <p className="text-[8px] sm:text-[9px] tracking-[0.1em] sm:tracking-[0.18em] uppercase text-[#f7f1e6]/50 font-semibold truncate">Venue Rank</p>
                <p className="display mt-1 sm:mt-2 text-xl sm:text-2xl font-bold text-[#f7f1e6]">{rankLabel(data.venueRank)}</p>
              </div>
              <div className="rounded-xl sm:rounded-2xl border border-white/[0.08] bg-white/[0.04] p-2.5 sm:p-4 text-center">
                <p className="text-[8px] sm:text-[9px] tracking-[0.1em] sm:tracking-[0.18em] uppercase text-[#f7f1e6]/50 font-semibold truncate">Total Score</p>
                <p className="display mt-1 sm:mt-2 text-xl sm:text-2xl font-bold text-[#e4b84a]">{data.totalScore}</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#e4b84a]">Event Evaluations</h3>
              <div className="mt-3 space-y-2">
                {!data.events || data.events.length === 0 ? (
                  <p className="text-xs text-[#f7f1e6]/40 py-2">No evaluation events created yet.</p>
                ) : (
                  data.events.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm"
                    >
                      <div>
                        <p className="font-medium text-white">{event.eventName}</p>
                        <p className="text-xs text-[#f7f1e6]/40">Max {event.maximumScore} pts</p>
                      </div>
                      <span className="display text-xl font-bold text-[#e4b84a]">
                        {event.score !== null ? event.score : "—"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#e4b84a]">Team Members</h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {data.members.map((member) => (
                  <div key={member.id} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                    <p className="text-sm font-semibold text-white">{member.name}</p>
                    <p className="text-xs text-[#e4b84a]/70 mt-0.5">
                      {formatMemberMeta(member.department, member.classSection)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Link
                href={`/tribe/${data.id}`}
                className="btn-gold !py-2.5 !px-6 !text-xs"
              >
                View Full Profile →
              </Link>
            </div>
          </div>
        ) : (
          <p className="py-12 text-center text-[#f7f1e6]/50">Unable to load tribe data.</p>
        )}
      </div>
    </div>
  );
}
