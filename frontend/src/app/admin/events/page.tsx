"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { apiSend } from "@/lib/api";
import { getToken } from "@/lib/auth";

type EventItem = { id: string; eventName: string; maximumScore: number; status: string; description?: string };

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventName, setEventName] = useState("");
  const [maximumScore, setMaximumScore] = useState("100");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setEvents(await apiSend<EventItem[]>("/api/admin/events", getToken(), "GET"));
    setLoading(false);
  }
  useEffect(() => {
    load().catch(() => setLoading(false));
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    await apiSend("/api/admin/events", getToken(), "POST", { eventName, maximumScore: Number(maximumScore) });
    setEventName("");
    await load();
  }

  return (
    <AdminShell>
      <div className="animate-fade-in-up">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#12071f] px-3.5 py-1 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#e4b84a]">Event Management</span>
        </div>
        <h1 className="display text-4xl">Events</h1>
      </div>
      <form onSubmit={create} className="panel mt-8 grid gap-3 p-6 md:grid-cols-[1fr_140px_auto] animate-fade-in-up delay-2">
        <input
          required
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          placeholder="Event name"
          className="input-focus rounded-xl border border-[#4b1d7a]/[0.15] px-4 py-2.5 text-sm"
        />
        <input
          type="number"
          min={1}
          value={maximumScore}
          onChange={(e) => setMaximumScore(e.target.value)}
          className="input-focus rounded-xl border border-[#4b1d7a]/[0.15] px-4 py-2.5 text-sm"
        />
        <button className="btn-gold !py-2.5">Add event</button>
      </form>
      <div className="mt-6 grid gap-3">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="panel flex items-center justify-between p-6 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <div>
                <div className="skeleton skeleton-title w-32 mb-2" />
                <div className="skeleton skeleton-text w-24" />
              </div>
            </div>
          ))
        ) : (
          events.map((event, i) => (
            <div
              key={event.id}
              className="panel flex items-center justify-between p-6 hover-glow animate-fade-in-up group"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div>
                <p className="display text-2xl transition-colors group-hover:text-[#4b1d7a]">{event.eventName}</p>
                <p className="text-sm text-[#6d6178] mt-0.5">Max {event.maximumScore} · {event.status}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminShell>
  );
}
