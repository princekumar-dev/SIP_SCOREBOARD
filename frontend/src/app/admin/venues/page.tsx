"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { apiSend } from "@/lib/api";
import { getToken } from "@/lib/auth";

type Venue = { id: string; theme: string; location: string; groupName: string; isLocked: boolean };

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setVenues(await apiSend<Venue[]>("/api/admin/venues", getToken(), "GET"));
    setLoading(false);
  }
  useEffect(() => {
    load().catch(() => setLoading(false));
  }, []);

  async function toggle(venue: Venue) {
    try {
      await apiSend(`/api/admin/venues/${venue.id}/lock`, getToken(), "PUT", { isLocked: !venue.isLocked });
      await load();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to change lock");
    }
  }

  return (
    <AdminShell>
      <div className="animate-fade-in-up">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#12071f] px-3.5 py-1 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#e4b84a]">Venue Management</span>
        </div>
        <h1 className="display text-4xl">Venue Assignment Locks</h1>
      </div>
      <div className="mt-8 grid gap-4">
        {loading ? (
          [1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="panel flex items-center justify-between p-6 animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
              <div>
                <div className="skeleton skeleton-text w-16 mb-2" />
                <div className="skeleton skeleton-title w-32 mb-2" />
                <div className="skeleton skeleton-text w-24" />
              </div>
              <div className="skeleton skeleton-text w-20 h-8 rounded-full" />
            </div>
          ))
        ) : (
          venues.map((venue, i) => (
            <div
              key={venue.id}
              className="panel flex items-center justify-between p-6 hover-glow animate-fade-in-up group"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div>
                <p className="text-xs text-[#6d6178] font-semibold">{venue.groupName}</p>
                <p className="display text-2xl transition-colors group-hover:text-[#4b1d7a]">{venue.theme}</p>
                <p className="text-sm text-[#6d6178] mt-0.5">{venue.location}</p>
              </div>
              <button
                type="button"
                onClick={() => toggle(venue)}
                className={`rounded-full px-5 py-2 text-sm font-bold transition-all duration-200 ${
                  venue.isLocked
                    ? "bg-[#12071f] text-[#e4b84a] hover:bg-[#1e0f35] shadow-md"
                    : "border border-[#4b1d7a]/30 text-[#4b1d7a] hover:bg-[#4b1d7a]/[0.05]"
                }`}
              >
                {venue.isLocked ? "Locked" : "Unlocked"}
              </button>
            </div>
          ))
        )}
      </div>
    </AdminShell>
  );
}
