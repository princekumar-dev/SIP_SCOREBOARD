import { Suspense } from "react";
import { apiGet } from "@/lib/api";
import { ScoreboardClient } from "./ScoreboardClient";
import type { LeaderboardRow, Venue } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ScoreboardPage() {
  const [venues, board] = await Promise.all([
    apiGet<Venue[]>("/api/venues"),
    apiGet<{ lastUpdated: string; rows: LeaderboardRow[] }>("/api/leaderboard"),
  ]);
  return (
    <Suspense
      fallback={
        <div className="scoreboard-bg min-h-screen flex items-center justify-center text-[#f7f1e6]/60">
          <div className="text-center">
            <div className="h-10 w-10 mx-auto mb-4 animate-spin rounded-full border-3 border-white/20 border-t-[#e4b84a]" />
            <p>Loading scoreboard…</p>
          </div>
        </div>
      }
    >
      <ScoreboardClient venues={venues} initial={board} />
    </Suspense>
  );
}
