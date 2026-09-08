"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { LiveBadge, useLiveRefresh } from "@/components/LiveBadge";
import { SOCKET_URL } from "@/lib/config";
import type { Venue } from "@/lib/types";

const motifColors: Record<string, { gradient: string; accent: string; ring: string }> = {
  creative: { gradient: "from-amber-500/20 to-orange-500/20", accent: "bg-amber-500", ring: "ring-amber-200" },
  tech:     { gradient: "from-blue-500/20 to-indigo-500/20", accent: "bg-blue-500", ring: "ring-blue-200" },
  space:    { gradient: "from-violet-500/20 to-purple-500/20", accent: "bg-violet-500", ring: "ring-violet-200" },
  legend:   { gradient: "from-rose-500/20 to-pink-500/20", accent: "bg-rose-500", ring: "ring-rose-200" },
  energy:   { gradient: "from-emerald-500/20 to-teal-500/20", accent: "bg-emerald-500", ring: "ring-emerald-200" },
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

  return (
    <div>
      {/* Live sync indicator bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <span className="text-xs text-[#6d6178]">
          Showing <strong className="text-[#12071f]">{venues.length}</strong> active evaluation arenas
        </span>
        <div className="flex items-center gap-2">
          <LiveBadge live={live} />
          <span className="text-[11px] font-medium text-emerald-700">Real-time Venue & Class Sync</span>
        </div>
      </div>

      {/* Grid of 5 Venues */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {venues.map((venue, i) => {
          const colors = motifColors[venue.motif] || motifColors.creative;
          return (
            <Link
              key={venue.id}
              href={`/venue/${venue.id}`}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#4b1d7a]/[0.1] bg-white p-6 shadow-sm transition-all duration-400 hover:-translate-y-1 hover:border-[#4b1d7a]/30 hover:shadow-xl animate-fade-in-up card-glow"
              style={{ animationDelay: `${0.06 + i * 0.06}s` }}
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between border-b border-[#4b1d7a]/[0.08] pb-3.5 mb-4">
                  <span className="font-mono text-xs font-bold text-[#4b1d7a] bg-[#4b1d7a]/[0.06] px-2.5 py-1 rounded-lg border border-[#4b1d7a]/[0.06]">
                    {venue.venueName}
                  </span>
                  <span className="rounded-full bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Arena
                  </span>
                </div>

                {/* Hall Name & Domain */}
                <h2 className="text-xl font-extrabold text-[#12071f] group-hover:text-[#4b1d7a] transition-colors leading-tight">
                  {venue.location}
                </h2>
                <div className="mt-3">
                  <span className="inline-block rounded-lg bg-[#12071f] px-3 py-1.5 text-xs font-bold text-[#e4b84a] tracking-wide">
                    Domain: {venue.theme}
                  </span>
                </div>

                {/* Description */}
                <p className="mt-3 text-xs text-[#6d6178] line-clamp-2 leading-relaxed">
                  {venue.description}
                </p>

                {/* Dynamically Updated Participating Classes */}
                {venue.participatingClasses && venue.participatingClasses.length > 0 && (
                  <div className="mt-4 pt-3.5 border-t border-[#4b1d7a]/[0.08]">
                    <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#6d6178] block mb-2">
                      Participating Classes:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {venue.participatingClasses.map((cls) => (
                        <span
                          key={cls}
                          className="rounded-md bg-[#4b1d7a]/[0.05] border border-[#4b1d7a]/[0.08] px-2.5 py-0.5 text-xs font-semibold text-[#4b1d7a]"
                        >
                          {cls}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="mt-6 pt-4 border-t border-[#4b1d7a]/[0.08] flex items-center justify-between text-xs">
                <span className="font-bold text-[#12071f]">
                  {venue.tribeCount} Active Tribes
                </span>
                <span className="font-bold text-[#4b1d7a] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  View Board →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
