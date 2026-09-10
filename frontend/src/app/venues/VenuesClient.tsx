"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { LiveBadge, useLiveRefresh } from "@/components/LiveBadge";
import { SOCKET_URL } from "@/lib/config";
import type { Venue } from "@/lib/types";

const VENUE_THEME_MAP: Record<string, { cardClass: string; badgeClass: string; icon: string }> = {
  "Group I": { cardClass: "group-card-1", badgeClass: "bg-rose-500/10 text-rose-700 border-rose-400/30", icon: "🎨" },
  "Group II": { cardClass: "group-card-2", badgeClass: "bg-cyan-500/10 text-cyan-700 border-cyan-400/30", icon: "💻" },
  "Group III": { cardClass: "group-card-3", badgeClass: "bg-purple-500/10 text-purple-700 border-purple-400/30", icon: "🚀" },
  "Group IV": { cardClass: "group-card-4", badgeClass: "bg-amber-500/10 text-amber-700 border-amber-400/30", icon: "🛡️" },
  "Group V": { cardClass: "group-card-5", badgeClass: "bg-orange-500/10 text-orange-700 border-orange-400/30", icon: "⚡" },
};

export function VenuesClient({ initialVenues }: { initialVenues: Venue[] }) {
  const [venues, setVenues] = useState<Venue[]>(initialVenues);

  const refreshVenues = useCallback(async () => {
    try {
      const res = await fetch(`${SOCKET_URL}/api/venues`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setVenues(data);
      }
    } catch {
      // ignore
    }
  }, []);

  const live = useLiveRefresh(refreshVenues);

  const sortedVenues = useMemo(() => {
    return [...venues].sort((a, b) => {
      const numA = parseInt(a.venueName?.replace(/\D/g, "") || "0", 10);
      const numB = parseInt(b.venueName?.replace(/\D/g, "") || "0", 10);
      if (numA !== numB) return numA - numB;
      return (a.venueName || "").localeCompare(b.venueName || "");
    });
  }, [venues]);

  return (
    <div>
      {/* Live sync indicator bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <span className="text-xs text-[#6d6178]">
          Showing <strong className="text-[#12071f] font-bold">{sortedVenues.length}</strong> active evaluation arenas
        </span>
        <div className="flex items-center gap-2">
          <LiveBadge live={live} />
          <span className="text-[11px] font-semibold text-emerald-700">Real-time Venue & Rotation Sync</span>
        </div>
      </div>

      {/* Grid of 5 Venues */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {sortedVenues.map((venue, i) => {
          const themeInfo = VENUE_THEME_MAP[venue.groupName] || {
            cardClass: "group-card-1",
            badgeClass: "bg-purple-500/10 text-purple-700 border-purple-400/30",
            icon: "🏛️",
          };

          return (
            <Link
              key={venue.id}
              href={`/venue/${venue.id}`}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm transition-all duration-300 hover-lift tilt-hover animate-fade-in-up ${themeInfo.cardClass}`}
              style={{ animationDelay: `${0.06 + i * 0.06}s` }}
            >
              <div>
                {/* Header Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.06] pb-3 mb-3.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold text-[#12071f] bg-black/5 px-2.5 py-1 rounded-xl border border-black/10">
                      {venue.venueName}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${themeInfo.badgeClass}`}>
                      {themeInfo.icon} {venue.groupName || "Assigned"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Arena
                  </div>
                </div>

                {/* Hall Name & Domain */}
                <h2 className="text-lg sm:text-xl font-extrabold text-[#12071f] group-hover:text-[#4b1d7a] transition-colors leading-tight">
                  {venue.location}
                </h2>
                <div className="mt-2.5">
                  <span className="inline-block rounded-xl bg-[#12071f] px-3 py-1 text-xs font-bold text-[#e4b84a] tracking-wide shadow-xs">
                    Theme: {venue.theme}
                  </span>
                </div>

                {/* Description */}
                <p className="mt-3 text-xs text-[#6d6178] line-clamp-2 leading-relaxed font-medium">
                  {venue.description}
                </p>

                {/* Dynamically Updated Participating Classes */}
                <div className="mt-4 pt-3.5 border-t border-black/[0.06]">
                  <span className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-[#6d6178] block mb-2">
                    Participating Classes:
                  </span>
                  {venue.participatingClasses && venue.participatingClasses.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {venue.participatingClasses.map((cls) => (
                        <span
                          key={cls}
                          className="rounded-lg bg-white/80 border border-[#4b1d7a]/15 px-2.5 py-1 text-xs font-bold text-[#4b1d7a] shadow-xs"
                        >
                          {cls}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-300 px-2.5 py-1 text-xs font-semibold text-amber-800">
                      <span>⚠️</span>
                      <span>Active Group Rotating</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-6 pt-4 border-t border-black/[0.06] flex items-center justify-between text-xs">
                <span className="font-extrabold text-[#12071f]">
                  {venue.tribeCount} Competing Tribes
                </span>
                <span className="font-extrabold text-[#4b1d7a] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Enter Arena →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
