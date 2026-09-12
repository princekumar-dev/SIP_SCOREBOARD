import { apiGet } from "@/lib/api";
import { rankLabel, formatMemberMeta } from "@/lib/format";
import type { TribeProfile } from "@/lib/types";

export const revalidate = 30;

export default async function TribePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tribe = await apiGet<TribeProfile>(`/api/tribes/${id}`);
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-5 py-8 sm:py-12">
      <div className="animate-fade-in-up">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#4b1d7a]/[0.06] border border-[#4b1d7a]/10 px-3 py-1 mb-3 sm:mb-4">
          <span className="text-[10px] font-bold tracking-[0.22em] text-[#4b1d7a]">{tribe.tribeCode}</span>
        </div>
        <h1 className="display text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight">{tribe.tribeName}</h1>
        <p className="mt-2 sm:mt-3 text-sm sm:text-base text-[#6d6178] leading-relaxed">
          {tribe.venue?.theme || tribe.theme || "Theme"} · 📍 {tribe.venue?.location || "No Venue Allocated"}
        </p>
      </div>
      <div className="mt-6 sm:mt-8 grid grid-cols-3 gap-2.5 sm:gap-4">
        {[
          ["Overall", rankLabel(tribe.overallRank)],
          ["Group Rank", rankLabel(tribe.groupRank !== undefined ? tribe.groupRank : tribe.venueRank)],
          ["Total", tribe.totalScore],
        ].map(([label, value], i) => (
          <div
            key={String(label)}
            className="panel p-3 sm:p-5 text-center hover-glow animate-fade-in-up card-glow rounded-2xl sm:rounded-3xl"
            style={{ animationDelay: `${0.1 + i * 0.08}s` }}
          >
            <p className="text-[8px] sm:text-[10px] tracking-[0.12em] sm:tracking-[0.18em] text-[#6d6178] font-semibold uppercase truncate">{label}</p>
            <p className="display mt-1 sm:mt-2 text-xl sm:text-3xl font-extrabold text-gradient-purple transition-transform hover:scale-105 tabular-nums">{value}</p>
          </div>
        ))}
      </div>
      <section className="panel mt-8 sm:mt-10 overflow-hidden animate-fade-in-up delay-4 rounded-2xl sm:rounded-3xl">
        <div className="border-b border-[#4b1d7a]/[0.08] px-4 sm:px-6 py-4 sm:py-5">
          <h2 className="display text-xl sm:text-2xl font-bold">Event Scores</h2>
        </div>
        {!tribe.events || tribe.events.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#6d6178]">
            No scoring events created yet.
          </div>
        ) : (
          tribe.events.map((event, i) => (
            <div
              key={event.id}
              className="flex items-center justify-between border-b border-[#4b1d7a]/[0.05] px-4 sm:px-6 py-3.5 sm:py-4 last:border-0 row-hover animate-fade-in-up"
              style={{ animationDelay: `${0.3 + i * 0.04}s` }}
            >
              <div className="min-w-0 pr-3">
                <p className="font-semibold text-sm sm:text-base text-[#12071f] truncate">{event.eventName}</p>
                <p className="text-xs text-[#6d6178]">Max {event.maximumScore} pts</p>
              </div>
              <p className="display text-xl sm:text-2xl score-highlight font-bold tabular-nums shrink-0">{event.score ?? "—"}</p>
            </div>
          ))
        )}
      </section>
      <section className="mt-8 sm:mt-10">
        <h2 className="display mb-4 sm:mb-5 text-xl sm:text-2xl font-bold animate-fade-in-up">Members</h2>
        <div className="grid gap-2.5 sm:gap-3 grid-cols-1 sm:grid-cols-2">
          {tribe.members.map((member, i) => {
            if (member.isLeader) {
              return (
                <div
                  key={member.id}
                  className="sm:col-span-2 rounded-2xl border-2 border-[#e4b84a]/60 bg-gradient-to-r from-[#e4b84a]/15 via-[#4b1d7a]/10 to-white p-4 shadow-md shadow-[#e4b84a]/10 hover-lift animate-fade-in-up"
                  style={{ animationDelay: `${0.3 + i * 0.03}s` }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#e4b84a] text-[#12071f] text-sm font-bold shadow-xs">
                        👑
                      </span>
                      <div>
                        <p className="font-extrabold text-base text-[#12071f]">{member.name}</p>
                        <p className="text-xs text-[#4b1d7a] font-semibold mt-0.5">
                          {formatMemberMeta(member.department, member.classSection)}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-[#12071f] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#e4b84a] shadow-xs">
                      Team Lead
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={member.id}
                className="panel p-3.5 sm:p-4 hover-lift animate-fade-in-up rounded-xl sm:rounded-2xl h-full"
                style={{ animationDelay: `${0.3 + i * 0.03}s` }}
              >
                <p className="font-semibold text-sm sm:text-base text-[#12071f]">{member.name}</p>
                <p className="text-xs sm:text-sm text-[#6d6178] mt-0.5">
                  {formatMemberMeta(member.department, member.classSection)}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
