import Link from "next/link";
import { rankLabel } from "@/lib/format";
import type { LeaderboardRow } from "@/lib/types";

const GROUP_TAG_STYLES: Record<string, string> = {
  "Group I": "bg-rose-500/10 text-rose-700 border-rose-400/30",
  "Group II": "bg-cyan-500/10 text-cyan-700 border-cyan-400/30",
  "Group III": "bg-purple-500/10 text-purple-700 border-purple-400/30",
  "Group IV": "bg-amber-500/10 text-amber-700 border-amber-400/30",
  "Group V": "bg-orange-500/10 text-orange-700 border-orange-400/30",
};

function PodiumCard({
  row,
  place,
  medal,
  delay,
  podiumClass,
}: {
  row?: LeaderboardRow;
  place: string;
  medal: string;
  delay: number;
  podiumClass: string;
}) {
  if (!row) return null;
  const isFirst = place.includes("GOLD");

  return (
    <Link
      href={`/tribe/${row.id}`}
      className={`panel block p-3.5 sm:p-5 md:p-6 text-center hover-lift tilt-hover animate-pop-in group relative overflow-hidden ${podiumClass} rounded-2xl sm:rounded-3xl`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-[#e4b84a]/60 to-transparent" />
      <span className="inline-block rounded-full bg-black/10 px-2 sm:px-3 py-0.5 sm:py-1 text-[8px] sm:text-[10px] tracking-[0.16em] sm:tracking-[0.25em] font-extrabold uppercase text-[#12071f]/80">
        {place}
      </span>
      
      <div className="relative my-1.5 sm:my-3">
        <span className={`inline-block text-3xl sm:text-4xl md:text-5xl transition-transform duration-300 group-hover:scale-125 ${isFirst ? "animate-trophy" : "animate-float"}`}>
          {medal}
        </span>
      </div>

      <p className="display text-base sm:text-xl md:text-2xl font-bold text-[#12071f] transition-colors group-hover:text-[#4b1d7a] leading-tight truncate px-1 sm:px-2">
        {row.tribeName}
      </p>
      
      <div className="mt-1.5 sm:mt-2 flex items-center justify-center gap-1 sm:gap-1.5 flex-wrap">
        <span className="font-mono text-[11px] sm:text-xs font-bold text-[#4b1d7a] bg-[#4b1d7a]/10 px-1.5 sm:px-2 py-0.5 rounded-md">
          {row.tribeCode}
        </span>
        {row.groupName ? (
          <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md border ${GROUP_TAG_STYLES[row.groupName] || "bg-gray-100 text-gray-700"}`}>
            {row.groupName}
          </span>
        ) : null}
      </div>

      <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-[#4b1d7a]/10">
        <p className="display text-2xl sm:text-3xl md:text-4xl font-extrabold text-gradient-purple transition-transform group-hover:scale-105 tabular-nums leading-none">
          {row.totalScore}
        </p>
        <p className="text-[8px] sm:text-[10px] font-bold text-[#6d6178] tracking-widest uppercase mt-1">Total Points</p>
      </div>
    </Link>
  );
}

export function LeaderboardTable({
  rows,
  showVenue = true,
  compact = false,
}: {
  rows: LeaderboardRow[];
  showVenue?: boolean;
  compact?: boolean;
}) {
  if (!rows.length) {
    return (
      <div className="panel px-4 sm:px-6 py-12 sm:py-14 text-center text-[#6d6178] animate-fade-in">
        <div className="text-4xl mb-3 animate-float">📊</div>
        <p className="font-semibold text-base">No scores published yet.</p>
        <p className="text-xs text-[#6d6178]/70 mt-1">Live scores will stream here once evaluators start scoring.</p>
      </div>
    );
  }

  return (
    <div className="panel overflow-hidden animate-fade-in shadow-md">
      <div className="grid grid-cols-[34px_1fr_auto] sm:grid-cols-[48px_1fr_auto] md:grid-cols-[56px_1fr_1fr_auto] gap-2 sm:gap-3 border-b border-[#4b1d7a]/10 bg-[#4b1d7a]/[0.03] px-3 sm:px-5 py-2.5 sm:py-3.5 text-[8px] sm:text-[10px] uppercase tracking-[0.14em] sm:tracking-[0.2em] text-[#4b1d7a] font-bold">
        <span className="text-center">Rank</span>
        <span>Tribe & House</span>
        {showVenue ? <span className="hidden md:block">Active Theme</span> : null}
        <span className="text-right">Score</span>
      </div>
      {rows.map((row, i) => (
        <Link
          key={row.id}
          href={`/tribe/${row.id}`}
          className={`grid grid-cols-[34px_1fr_auto] sm:grid-cols-[48px_1fr_auto] md:grid-cols-[56px_1fr_1fr_auto] items-center gap-2 sm:gap-3 border-b border-[#4b1d7a]/[0.06] px-3 sm:px-5 py-2.5 sm:py-4 last:border-0 row-hover group animate-fade-in-up transition-all ${
            row.rank === 1
              ? "bg-[#e4b84a]/[0.06] hover:bg-[#e4b84a]/[0.12]"
              : row.rank === 2
              ? "bg-slate-500/[0.04] hover:bg-slate-500/[0.08]"
              : row.rank === 3
              ? "bg-amber-700/[0.04] hover:bg-amber-700/[0.08]"
              : "hover:bg-[#4b1d7a]/[0.03]"
          }`}
          style={{ animationDelay: `${i * 0.02}s` }}
        >
          <div className="flex justify-center">
            <span
              className={`display flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-lg sm:rounded-xl text-[11px] sm:text-base font-extrabold shadow-xs ${
                row.rank === 1
                  ? "bg-[#e4b84a] text-[#12071f] ring-2 ring-[#e4b84a]/40 shadow-amber-500/20"
                  : row.rank === 2
                  ? "bg-slate-300 text-slate-800 ring-2 ring-slate-400/40"
                  : row.rank === 3
                  ? "bg-amber-600 text-white ring-2 ring-amber-700/40"
                  : "bg-white/80 text-[#6d6178] border border-[#4b1d7a]/10"
              }`}
            >
              {row.rank ? rankLabel(row.rank) : "—"}
            </span>
          </div>

          <div className="min-w-0 pr-1">
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="font-bold text-xs sm:text-base text-[#12071f] transition-colors group-hover:text-[#4b1d7a] truncate">
                {row.tribeName}
              </span>
              {row.groupName && (
                <span className={`hidden sm:inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border ${GROUP_TAG_STYLES[row.groupName] || "bg-gray-100 text-gray-700"}`}>
                  {row.groupName}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5">
              <span className="text-[11px] sm:text-xs text-[#6d6178] font-mono font-semibold">{row.tribeCode}</span>
              {row.groupName && (
                <span className="sm:hidden text-[9px] font-bold text-[#4b1d7a]">
                  · {row.groupName}
                </span>
              )}
            </div>
          </div>

          {showVenue ? (
            <div className="hidden md:flex flex-col truncate">
              <span className="text-xs text-[#4b1d7a] font-bold truncate">{row.venueTheme || row.theme || "Main Arena"}</span>
              <span className="text-[10px] text-[#6d6178] truncate">{row.location && row.location !== "No Venue Allocated" ? `📍 ${row.location}` : "📍 No Venue Allocated"}</span>
            </div>
          ) : null}

          <div className="text-right shrink-0">
            <span className={`font-extrabold text-[#12071f] transition-all duration-200 group-hover:text-[#4b1d7a] group-hover:scale-105 tabular-nums ${compact ? "text-sm sm:text-lg" : "text-base sm:text-2xl"}`}>
              {row.totalScore}
            </span>
            <span className="block text-[7px] sm:text-[9px] uppercase font-bold text-[#6d6178]/70">pts</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function Podium({ rows }: { rows: LeaderboardRow[] }) {
  const scoredRows = rows.filter((r) => r.rank !== null && r.rank !== undefined && Number(r.totalScore) > 0);

  if (scoredRows.length === 0) {
    return (
      <div className="panel px-4 sm:px-6 py-10 sm:py-12 text-center text-[#6d6178] animate-fade-in rounded-2xl sm:rounded-3xl border border-[#4b1d7a]/15 bg-white/70 backdrop-blur-sm">
        <div className="text-4xl mb-3 animate-float">🏆</div>
        <h3 className="font-extrabold text-base sm:text-lg text-[#12071f]">Podium Standings Awaiting Live Scores</h3>
        <p className="text-xs sm:text-sm text-[#6d6178] mt-1 max-w-md mx-auto font-medium">
          Gold, Silver, and Bronze podium rankings will appear here in real-time as venue hosts submit evaluation scores.
        </p>
      </div>
    );
  }

  const first = scoredRows[0];
  const second = scoredRows[1];
  const third = scoredRows[2];

  return (
    <div className="grid gap-4 sm:gap-5 md:grid-cols-3 items-end pt-2 sm:pt-4">
      <div className="order-2 md:order-1">
        {second ? (
          <PodiumCard row={second} place="02 SILVER" medal="🥈" delay={0.1} podiumClass="podium-2" />
        ) : (
          <div className="panel p-6 text-center rounded-2xl sm:rounded-3xl border border-dashed border-black/10 bg-white/40 text-xs text-[#6d6178] h-full flex flex-col items-center justify-center min-h-[180px]">
            <span className="text-2xl block mb-1">🥈</span>
            <span className="font-bold text-[#12071f]/70">Awaiting 2nd Place</span>
            <span className="text-[10px] text-[#6d6178] mt-1">Pending evaluations</span>
          </div>
        )}
      </div>
      <div className="order-1 md:order-2 md:-translate-y-4">
        <PodiumCard row={first} place="01 GOLD" medal="🏆" delay={0} podiumClass="podium-1" />
      </div>
      <div className="order-3">
        {third ? (
          <PodiumCard row={third} place="03 BRONZE" medal="🥉" delay={0.2} podiumClass="podium-3" />
        ) : (
          <div className="panel p-6 text-center rounded-2xl sm:rounded-3xl border border-dashed border-black/10 bg-white/40 text-xs text-[#6d6178] h-full flex flex-col items-center justify-center min-h-[180px]">
            <span className="text-2xl block mb-1">🥉</span>
            <span className="font-bold text-[#12071f]/70">Awaiting 3rd Place</span>
            <span className="text-[10px] text-[#6d6178] mt-1">Pending evaluations</span>
          </div>
        )}
      </div>
    </div>
  );
}
