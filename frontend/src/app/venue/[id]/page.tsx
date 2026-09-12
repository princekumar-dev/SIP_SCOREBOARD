import { apiGet } from "@/lib/api";
import { LiveLeaderboard } from "@/components/LiveLeaderboard";
import type { LeaderboardRow } from "@/lib/types";

export const revalidate = 30;

export default async function VenuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await apiGet<{
    theme: string;
    location: string;
    groupName: string;
    venueName: string;
    description: string;
    motif: string;
    tribeCount: number;
    participatingClasses?: string[];
    lastUpdated: string;
    leaderboard: LeaderboardRow[];
  }>(`/api/venues/${id}`);

  const isAllocated = Boolean(data.groupName && data.groupName !== "null");

  return (
    <div className={`min-h-screen motif-${data.motif || "creative"}`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-5 py-8 sm:py-12">
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#4b1d7a]/[0.08] border border-[#4b1d7a]/15 px-3 py-1 mb-3 sm:mb-4">
            <span className="text-[10px] font-bold tracking-[0.22em] text-[#4b1d7a]">
              {isAllocated ? `${data.groupName} · ${data.venueName}` : `Standby · ${data.venueName}`}
            </span>
          </div>
          <h1 className="display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            {isAllocated ? data.theme : "Pending Group Selection"}
          </h1>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-[#6d6178] leading-relaxed">
            {data.location} · {isAllocated ? `${data.tribeCount} tribes` : "0 tribes assigned"}
          </p>
          
          <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#6d6178]">Participating Classes:</span>
            {isAllocated && data.participatingClasses && data.participatingClasses.length > 0 ? (
              data.participatingClasses.map((cls) => (
                <span key={cls} className="rounded-md bg-[#4b1d7a]/[0.08] border border-[#4b1d7a]/15 px-2.5 py-0.5 sm:py-1 text-xs font-semibold text-[#4b1d7a]">
                  {cls}
                </span>
              ))
            ) : (
              <span className="rounded-md bg-amber-50 border border-amber-200 px-2.5 py-0.5 sm:py-1 text-xs font-semibold text-amber-800">
                ⚠️ Classes Not Allocated
              </span>
            )}
          </div>
        </div>
        <p className="mt-3 sm:mt-4 max-w-2xl animate-fade-in-up delay-2 text-sm sm:text-base text-[#6d6178] leading-relaxed">
          {isAllocated ? data.description : "Waiting for venue host to select and activate the currently present group in this arena."}
        </p>
        <div className="mt-8 sm:mt-10 animate-fade-in-up delay-4">
          <LiveLeaderboard
            initialRows={data.leaderboard}
            initialUpdated={data.lastUpdated}
            path={`/api/leaderboard/venue/${id}`}
            showVenue={false}
          />
        </div>
      </div>
    </div>
  );
}
