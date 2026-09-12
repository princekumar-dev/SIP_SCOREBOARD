import Link from "next/link";
import { apiGet } from "@/lib/api";
import { Podium } from "@/components/LeaderboardTable";
import { LiveLeaderboard } from "@/components/LiveLeaderboard";
import { BrandLogo } from "@/components/BrandLogo";
import type { LeaderboardRow, Venue } from "@/lib/types";

export const revalidate = 30;

const HOUSES_CONFIG = [
  {
    groupName: "Group I",
    defaultTitle: "Creative & Design",
    icon: "🎨",
    cardClass: "group-card-1",
    accentText: "text-rose-600",
    badge: "bg-rose-500/10 text-rose-700 border-rose-400/30",
  },
  {
    groupName: "Group II",
    defaultTitle: "Technology & Innovation",
    icon: "💻",
    cardClass: "group-card-2",
    accentText: "text-cyan-600",
    badge: "bg-cyan-500/10 text-cyan-700 border-cyan-400/30",
  },
  {
    groupName: "Group III",
    defaultTitle: "Space & Cosmic",
    icon: "🚀",
    cardClass: "group-card-3",
    accentText: "text-purple-600",
    badge: "bg-purple-500/10 text-purple-700 border-purple-400/30",
  },
  {
    groupName: "Group IV",
    defaultTitle: "Legends & Mythology",
    icon: "🛡️",
    cardClass: "group-card-4",
    accentText: "text-amber-600",
    badge: "bg-amber-500/10 text-amber-700 border-amber-400/30",
  },
  {
    groupName: "Group V",
    defaultTitle: "Power & Energy",
    icon: "⚡",
    cardClass: "group-card-5",
    accentText: "text-orange-600",
    badge: "bg-orange-500/10 text-orange-700 border-orange-400/30",
  },
];

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
    <div className="space-y-4 overflow-x-hidden">
      {/* Hero Section */}
      <section className="scoreboard-bg text-[#f7f1e6] relative overflow-hidden">
        {/* Ambient glow effects */}
        <div className="absolute top-0 right-0 w-[550px] h-[450px] bg-[#e4b84a]/[0.09] rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
        <div className="absolute bottom-0 left-0 w-[450px] h-[350px] bg-[#4b1d7a]/35 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative mx-auto max-w-6xl px-4 sm:px-5 py-14 sm:py-20 md:py-28">
          <div className="animate-fade-in-up">
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 mb-4 sm:mb-6">
              <BrandLogo size="md" variant="badge" priority />
              <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-[#e4b84a]/30 bg-[#e4b84a]/[0.1] px-3 sm:px-4 py-1 sm:py-1.5 backdrop-blur-md max-w-full">
                <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-[#e4b84a] animate-pulse shrink-0" />
                <p className="text-[8px] sm:text-[10px] font-bold tracking-[0.14em] sm:tracking-[0.25em] text-[#e4b84a] truncate">
                  MEENAKSHI SUNDARARAJAN ENGINEERING COLLEGE
                </p>
              </div>
            </div>
            <h1 className="display max-w-4xl text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] leading-[1.08] tracking-tight">
              <span className="text-gradient-gold">SIP Arena</span>
            </h1>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl text-[#f7f1e6]/70 max-w-2xl leading-relaxed font-normal">
              Student Induction Program 2026–27 · 90 Tribes · 5 Houses · Live Arena Scoreboard
            </p>
          </div>

          <div className="gold-line my-7 sm:my-10 animate-fade-in delay-2" />

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {[
              [stats.tribes, "Competing Tribes", "🛡️"],
              [stats.venues, "Evaluation Halls", "🏛️"],
              [stats.events, "Active Events", "⚡"],
              [stats.scores, "Scores Streamed", "📊"],
            ].map(([value, label, icon], i) => (
              <div
                key={String(label)}
                className="group rounded-2xl sm:rounded-3xl border border-white/[0.09] bg-white/[0.04] backdrop-blur-md p-3.5 sm:p-5 animate-fade-in-up cursor-default tilt-hover relative overflow-hidden"
                style={{ animationDelay: `${0.15 + i * 0.08}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#e4b84a]/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="flex items-center justify-between">
                  <p className="relative display text-2xl sm:text-3xl md:text-4xl font-extrabold text-gradient-gold tabular-nums">{value}</p>
                  <span className="text-xl sm:text-2xl opacity-70 group-hover:scale-125 transition-transform duration-300">{icon}</span>
                </div>
                <p className="relative text-[11px] sm:text-xs text-[#f7f1e6]/60 font-medium mt-1.5 sm:mt-2 truncate">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 animate-fade-in-up delay-6">
            <Link href="/overall" className="btn-gold w-full sm:w-auto text-center justify-center flex items-center !py-3 sm:!py-3.5 !px-6 sm:!px-8 !text-xs sm:!text-sm shadow-xl shadow-[#e4b84a]/25">
              🏆 Overall Standings
            </Link>
            <Link href="/tribes" className="btn-outline w-full sm:w-auto text-center justify-center flex items-center !py-3 sm:!py-3.5 !px-6 sm:!px-8 !text-xs sm:!text-sm hover:bg-white/10">
              Explore 90 Tribes →
            </Link>
            <Link href="/scoreboard" target="_blank" className="btn-dark w-full sm:w-auto text-center justify-center flex items-center !py-3 sm:!py-3.5 !px-5 sm:!px-6 !text-xs sm:!text-sm border border-white/10">
              📺 Projector View
            </Link>
          </div>
          {error ? <p className="mt-6 text-sm text-[#f3d78a]/90 animate-fade-in">{error}</p> : null}
        </div>
      </section>

      {/* 5 Competing Houses Section */}
      <section className="mx-auto max-w-6xl px-4 sm:px-5 py-8 sm:py-12">
        <div className="mb-6 sm:mb-8 flex items-end justify-between animate-fade-in-up">
          <div>
            <span className="text-[10px] tracking-[0.25em] text-[#4b1d7a] font-extrabold uppercase">Arena Houses</span>
            <h2 className="display text-2xl sm:text-3xl md:text-4xl mt-1">5 Competing Houses</h2>
          </div>
          <Link href="/tribes" className="text-xs font-bold text-[#4b1d7a] hover:text-[#e4b84a] transition-colors hidden md:block">
            View House Tribes →
          </Link>
        </div>

        <div className="grid gap-3.5 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-5">
          {HOUSES_CONFIG.map((houseConfig, i) => {
            const assignedVenue = venues.find(
              (v) => v.groupName?.toLowerCase() === houseConfig.groupName.toLowerCase()
            );
            const classesText =
              assignedVenue?.participatingClasses && assignedVenue.participatingClasses.length > 0
                ? assignedVenue.participatingClasses.join(" · ")
                : "Classes Not Allocated";
            const venueTitle = assignedVenue?.theme || houseConfig.defaultTitle;
            const locationText = assignedVenue?.location ? `📍 ${assignedVenue.location}` : "📍 No Venue Allocated";

            return (
              <Link
                key={houseConfig.groupName}
                href={`/tribes?group=${encodeURIComponent(houseConfig.groupName)}`}
                className={`panel p-4 sm:p-5 flex flex-col justify-between group relative overflow-hidden transition-all duration-300 hover-lift ${houseConfig.cardClass}`}
                style={{ animationDelay: `${0.05 + i * 0.05}s` }}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl group-hover:scale-125 transition-transform duration-300">{houseConfig.icon}</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${houseConfig.badge}`}>
                      {houseConfig.groupName}
                    </span>
                  </div>
                  <p className="font-extrabold text-base text-[#12071f] mt-3 leading-snug">{venueTitle}</p>
                  <p className="text-[11px] text-[#6d6178] mt-1 font-medium leading-relaxed">
                    👥 {classesText}
                  </p>
                  <p className="text-[10px] text-[#4b1d7a]/70 mt-1 font-medium truncate">
                    {locationText}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-black/[0.06] flex items-center justify-between text-xs font-bold">
                  <span className={houseConfig.accentText}>18 Tribes</span>
                  <span className="text-[#12071f] transition-transform group-hover:translate-x-1">→</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Venues Section */}
      <section className="mx-auto max-w-6xl px-4 sm:px-5 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 flex items-end justify-between animate-fade-in-up">
          <div>
            <p className="text-[10px] tracking-[0.25em] text-[#4b1d7a] font-bold uppercase">Campus Evaluation Halls</p>
            <h2 className="display text-2xl sm:text-3xl md:text-4xl mt-1">Five Venues. One Arena.</h2>
          </div>
          <Link href="/venues" className="text-xs font-bold text-[#4b1d7a] hover:text-[#e4b84a] transition-colors hidden md:block">
            View all 5 halls →
          </Link>
        </div>
        <div className="grid gap-3.5 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-5">
          {venues.map((venue, i) => {
            const isAllocated = Boolean(venue.groupName && venue.groupName !== "null");
            return (
              <Link
                key={venue.id}
                href={`/venue/${venue.id}`}
                className="panel p-4 sm:p-5 hover-lift animate-fade-in-up flex flex-col justify-between group relative overflow-hidden"
                style={{ animationDelay: `${0.1 + i * 0.06}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#4b1d7a]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-[#4b1d7a] bg-[#4b1d7a]/[0.08] px-2.5 py-1 rounded-lg border border-[#4b1d7a]/10">
                      {venue.venueName}
                    </span>
                    <div className="relative flex items-center justify-center">
                      {isAllocated ? <span className="live-dot" /> : <span className="h-2 w-2 rounded-full bg-amber-500" />}
                    </div>
                  </div>
                  <p className="font-extrabold mt-3 text-base text-[#12071f] leading-snug">{venue.location || "Unallocated Hall"}</p>
                  <p className="mt-1.5 text-xs text-[#6d6178] font-medium">{isAllocated ? venue.theme : "Pending Group Selection"}</p>
                  <div className="mt-2.5">
                    {isAllocated && venue.participatingClasses && venue.participatingClasses.length > 0 ? (
                      <p className="text-[10px] text-[#4b1d7a]/80 font-semibold truncate">
                        👥 {venue.participatingClasses.join(", ")}
                      </p>
                    ) : (
                      <p className="text-[10px] text-amber-700 font-medium">
                        ⚠️ Classes Not Allocated
                      </p>
                    )}
                  </div>
                </div>
                <p className="mt-4 text-xs font-bold text-[#4b1d7a] flex items-center justify-between relative border-t border-[#4b1d7a]/[0.08] pt-2.5">
                  <span>{isAllocated ? `${venue.tribeCount} tribes` : "Standby"}</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Podium Section */}
      <section className="mx-auto max-w-6xl px-4 sm:px-5 py-6">
        <div className="mb-4 flex items-center gap-2.5 sm:gap-3 animate-fade-in-up">
          <span className="text-xl sm:text-2xl">🏆</span>
          <h2 className="display text-2xl sm:text-3xl font-bold">Current Podium Standings</h2>
        </div>
        <Podium rows={board.rows} />
      </section>

      {/* Leaderboard Section */}
      <section className="mx-auto max-w-6xl px-4 sm:px-5 py-8 sm:py-12">
        <LiveLeaderboard
          title="Overall Live Ranking Matrix"
          initialRows={board.rows.slice(0, 15)}
          initialUpdated={board.lastUpdated}
          path="/api/leaderboard"
        />
      </section>
    </div>
  );
}
