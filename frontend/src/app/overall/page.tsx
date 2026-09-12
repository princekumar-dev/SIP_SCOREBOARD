import { apiGet } from "@/lib/api";
import { LiveLeaderboard } from "@/components/LiveLeaderboard";
import { Podium } from "@/components/LeaderboardTable";
import type { LeaderboardRow } from "@/lib/types";

export const revalidate = 30;

export default async function OverallPage() {
  try {
    const board = await apiGet<{ lastUpdated: string; rows: LeaderboardRow[] }>("/api/leaderboard");
    const topRows = board.rows || [];

    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-5 py-8 sm:py-12 space-y-8 sm:space-y-10">
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#4b1d7a]/10 border border-[#4b1d7a]/15 px-3.5 py-1 mb-3 sm:mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-[#35d07f] animate-pulse" />
            <span className="text-[10px] font-bold tracking-[0.22em] text-[#4b1d7a] uppercase">Arena Overall Standings</span>
          </div>
          <h1 className="display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#12071f]">
            Overall SIP Tribe Ranking
          </h1>
          <p className="mt-2 sm:mt-3 max-w-2xl text-xs sm:text-sm text-[#6d6178] leading-relaxed font-medium">
            All {board.rows.length || 91} tribes across 5 Houses dynamically ranked by real-time cumulative scores.
          </p>
        </div>

        {/* Live Podium & Leaderboard Table */}
        <div className="animate-fade-in-up delay-1">
          <LiveLeaderboard
            title={`Complete ${board.rows.length || 91}-Tribe Ranking`}
            initialRows={board.rows}
            initialUpdated={board.lastUpdated}
            path="/api/leaderboard"
            showPodium={true}
            podiumTitle="Leaderboard Podium"
          />
        </div>
      </div>
    );
  } catch {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center animate-fade-in">
        <div className="text-5xl mb-4 animate-float">📡</div>
        <h1 className="display text-4xl font-bold">Live Standings Temporarily Unavailable</h1>
        <p className="mt-3 text-[#6d6178] leading-relaxed">
          The arena server is updating scores. Please ensure backend services are running and refresh.
        </p>
      </div>
    );
  }
}
