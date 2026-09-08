import Link from "next/link";
import { apiGet } from "@/lib/api";
import { Podium } from "@/components/LeaderboardTable";
import { LiveLeaderboard } from "@/components/LiveLeaderboard";
import { BrandLogo } from "@/components/BrandLogo";
import type { LeaderboardRow, Venue } from "@/lib/types";

export const revalidate = 30;

export default async function HomePage() {
  let venues: Venue[] = [];
  let board: { lastUpdated: string; rows: LeaderboardRow[] } = { lastUpdated: new Date().toISOString(), rows: [] };
  let stats = { tribes: 90, venues: 5, events: 5, scores: 0 };
  let error = "";

  try {
    [venues, board, stats] = await Promise.all([
      apiGet<Venue[]>("/api/venues"),
      apiGet<{ lastUpdated: string; rows: LeaderboardRow[] }>("/api/leaderboard"),
      apiGet<{ tribes: number; venues: number; events: number; scores: number }>("/api/stats"),
    ]);
  } catch {
    error = "Connection temporarily unavailable. Start MongoDB and the Node API, then refresh.";
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="scoreboard-bg text-[#f7f1e6] relative overflow-hidden">
        {/* Ambient glow effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-[#e4b84a]/[0.07] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-[#4b1d7a]/30 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative mx-auto max-w-6xl px-5 py-20 md:py-28">
          <div className="animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <BrandLogo size="md" variant="badge" priority />
              <div className="inline-flex items-center gap-2 rounded-full border border-[#e4b84a]/25 bg-[#e4b84a]/[0.08] px-4 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#e4b84a] animate-pulse" />
                <p className="text-[10px] font-bold tracking-[0.25em] text-[#e4b84a]">MEENAKSHI SUNDARARAJAN ENGINEERING COLLEGE</p>
              </div>
            </div>
            <h1 className="display max-w-4xl text-5xl leading-[1.1] md:text-7xl lg:text-[5.5rem]">
              <span className="text-gradient-gold">SIP Arena</span>
            </h1>
            <p className="mt-4 text-lg md:text-xl text-[#f7f1e6]/60 max-w-2xl leading-relaxed">
              Student Induction Program 2026–27 · Live tribe scoreboard
            </p>
          </div>
          <div className="gold-line my-10 animate-fade-in delay-2" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              [stats.tribes, "Tribes"],
              [stats.venues, "Venues"],
              [stats.events, "Active Events"],
              [stats.scores, "Scores Entered"],
            ].map(([value, label], i) => (
              <div
                key={String(label)}
                className="group rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm p-5 animate-fade-in-up cursor-default hover-scale relative overflow-hidden"
                style={{ animationDelay: `${0.15 + i * 0.08}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#e4b84a]/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <p className="relative display text-3xl md:text-4xl text-gradient-gold">{value}</p>
                <p className="relative text-sm text-[#f7f1e6]/50 mt-1">{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3 animate-fade-in-up delay-6">
            <Link href="/overall" className="btn-gold !py-3 !px-7 !text-sm">
              Overall Leaderboard
            </Link>
            <Link href="/scoreboard" className="btn-outline !py-3 !px-7 !text-sm">
              Projector Scoreboard
            </Link>
          </div>
          {error ? <p className="mt-6 text-sm text-[#f3d78a]/90 animate-fade-in">{error}</p> : null}
        </div>
      </section>

      {/* Venues Section */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="mb-8 flex items-end justify-between animate-fade-in-up">
          <div>
            <p className="text-[10px] tracking-[0.25em] text-[#4b1d7a] font-bold uppercase">Campus Evaluation Halls</p>
            <h2 className="display text-3xl md:text-4xl mt-1">Five Venues. One Arena.</h2>
          </div>
          <Link href="/venues" className="text-sm font-bold text-[#4b1d7a] hover:text-[#e4b84a] transition-colors hidden md:block">
            View all 5 halls →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          {venues.map((venue, i) => (
            <Link
              key={venue.id}
              href={`/venue/${venue.id}`}
              className="panel p-5 hover-glow animate-fade-in-up flex flex-col justify-between group relative overflow-hidden"
              style={{ animationDelay: `${0.1 + i * 0.06}s` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#4b1d7a]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
              <div className="relative">
                <span className="inline-block font-mono text-[10px] font-bold text-[#4b1d7a] bg-[#4b1d7a]/[0.08] px-2.5 py-1 rounded-lg border border-[#4b1d7a]/10">
                  {venue.venueName}
                </span>
                <p className="font-extrabold mt-3 text-base text-[#12071f] leading-snug">{venue.location}</p>
                <p className="mt-1.5 text-xs text-[#6d6178] font-medium">{venue.theme}</p>
                <div className="mt-2.5">
                  {venue.participatingClasses && venue.participatingClasses.length > 0 ? (
                    <p className="text-[10px] text-[#4b1d7a]/80 font-medium truncate">
                      👥 {venue.participatingClasses.join(", ")}
                    </p>
                  ) : (
                    <p className="text-[10px] text-amber-700 font-medium">
                      ⚠️ Not Allocated
                    </p>
                  )}
                </div>
              </div>
              <p className="mt-4 text-xs font-bold text-[#4b1d7a] flex items-center justify-between relative">
                <span>{venue.tribeCount} tribes</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Podium Section */}
      <section className="mx-auto max-w-6xl px-5 pb-10">
        <div className="mb-6 flex items-center gap-3 animate-fade-in-up">
          <span className="text-2xl">🏆</span>
          <h2 className="display text-3xl">Current Podium</h2>
        </div>
        <Podium rows={board.rows} />
      </section>

      {/* Leaderboard Section */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <LiveLeaderboard
          title="Overall Live Ranking"
          initialRows={board.rows.slice(0, 12)}
          initialUpdated={board.lastUpdated}
          path="/api/leaderboard"
        />
      </section>
    </div>
  );
}
