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
    lastUpdated: string;
    leaderboard: LeaderboardRow[];
  }>(`/api/venues/${id}`);

  return (
    <div className={`min-h-screen motif-${data.motif}`}>
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#4b1d7a]/[0.08] border border-[#4b1d7a]/15 px-3 py-1 mb-4">
            <span className="text-[10px] font-bold tracking-[0.22em] text-[#4b1d7a]">
              {data.groupName} · {data.venueName}
            </span>
          </div>
          <h1 className="display text-4xl md:text-5xl">{data.theme}</h1>
          <p className="mt-3 text-[#6d6178] leading-relaxed">{data.location} · {data.tribeCount} tribes</p>
        </div>
        <p className="mt-4 max-w-2xl animate-fade-in-up delay-2 leading-relaxed">{data.description}</p>
        <div className="mt-10 animate-fade-in-up delay-4">
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
