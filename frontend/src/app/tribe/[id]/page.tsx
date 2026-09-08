import { apiGet } from "@/lib/api";
import { rankLabel } from "@/lib/format";
import type { TribeProfile } from "@/lib/types";

export const revalidate = 30;

export default async function TribePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tribe = await apiGet<TribeProfile>(`/api/tribes/${id}`);
  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <div className="animate-fade-in-up">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#4b1d7a]/[0.06] border border-[#4b1d7a]/10 px-3 py-1 mb-4">
          <span className="text-[10px] font-bold tracking-[0.22em] text-[#4b1d7a]">{tribe.tribeCode}</span>
        </div>
        <h1 className="display text-5xl md:text-6xl">{tribe.tribeName}</h1>
        <p className="mt-3 text-[#6d6178] leading-relaxed">
          {tribe.venue.theme} · {tribe.venue.location}
        </p>
      </div>
      <div className="mt-8 grid grid-cols-3 gap-4">
        {[
          ["Overall", rankLabel(tribe.overallRank)],
          ["Venue", rankLabel(tribe.venueRank)],
          ["Total", tribe.totalScore],
        ].map(([label, value], i) => (
          <div
            key={String(label)}
            className="panel p-5 text-center hover-glow animate-fade-in-up card-glow"
            style={{ animationDelay: `${0.1 + i * 0.08}s` }}
          >
            <p className="text-[10px] tracking-[0.18em] text-[#6d6178] font-semibold uppercase">{label}</p>
            <p className="display mt-2 text-3xl text-gradient-purple transition-transform hover:scale-110">{value}</p>
          </div>
        ))}
      </div>
      <section className="panel mt-10 overflow-hidden animate-fade-in-up delay-4">
        <div className="border-b border-[#4b1d7a]/[0.08] px-6 py-5">
          <h2 className="display text-2xl">Event Scores</h2>
        </div>
        {tribe.events.map((event, i) => (
          <div
            key={event.id}
            className="flex items-center justify-between border-b border-[#4b1d7a]/[0.05] px-6 py-4 last:border-0 row-hover animate-fade-in-up"
            style={{ animationDelay: `${0.3 + i * 0.04}s` }}
          >
            <div>
              <p className="font-semibold">{event.eventName}</p>
              <p className="text-xs text-[#6d6178]">Max {event.maximumScore}</p>
            </div>
            <p className="display text-2xl score-highlight font-bold">{event.score ?? "—"}</p>
          </div>
        ))}
      </section>
      <section className="mt-10">
        <h2 className="display mb-5 text-2xl animate-fade-in-up">Members</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {tribe.members.map((member, i) => (
            <div
              key={member.id}
              className="panel p-4 hover-lift animate-fade-in-up"
              style={{ animationDelay: `${0.3 + i * 0.03}s` }}
            >
              <p className="font-semibold">{member.name}</p>
              <p className="text-sm text-[#6d6178]">
                {member.department} · {member.classSection}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
