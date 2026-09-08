import { apiGet } from "@/lib/api";
import { LiveLeaderboard } from "@/components/LiveLeaderboard";
import type { LeaderboardRow } from "@/lib/types";

export const revalidate = 30;

export default async function OverallPage() {
  try {
    const board = await apiGet<{ lastUpdated: string; rows: LeaderboardRow[] }>("/api/leaderboard");
    return (
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#4b1d7a]/[0.06] border border-[#4b1d7a]/10 px-3 py-1 mb-4">
            <span className="text-[10px] font-bold tracking-[0.22em] text-[#4b1d7a] uppercase">Public Leaderboard</span>
          </div>
          <h1 className="display text-4xl md:text-5xl">Overall SIP Ranking</h1>
          <p className="mt-3 max-w-2xl text-[#6d6178] leading-relaxed">
            All 90 tribes ranked by automatic total score. Scores belong to the tribe, not the venue.
          </p>
        </div>
        <div className="mt-10 animate-fade-in-up delay-2">
          <LiveLeaderboard initialRows={board.rows} initialUpdated={board.lastUpdated} path="/api/leaderboard" />
        </div>
      </div>
    );
  } catch {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center animate-fade-in">
        <div className="text-4xl mb-4 opacity-30">📡</div>
        <h1 className="display text-4xl">Connection Temporarily Unavailable</h1>
        <p className="mt-3 text-[#6d6178] leading-relaxed">Showing the latest synchronized scores requires the Node API and MongoDB.</p>
      </div>
    );
  }
}
