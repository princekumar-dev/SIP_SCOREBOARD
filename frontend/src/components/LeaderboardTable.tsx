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
      className={`panel block p-6 text-center hover-lift tilt-hover animate-pop-in group relative overflow-hidden ${podiumClass} rounded-3xl`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-[#e4b84a]/60 to-transparent" />
      <span className="inline-block rounded-full bg-black/10 px-3 py-1 text-[10px] tracking-[0.25em] font-extrabold uppercase text-[#12071f]/80">
        {place}
      </span>
      
      <div className="relative my-3">
        <span className={`inline-block text-5xl transition-transform duration-300 group-hover:scale-125 ${isFirst ? "animate-trophy" : "animate-float"}`}>
          {medal}
        </span>
      </div>

      <p className="display text-2xl font-bold text-[#12071f] transition-colors group-hover:text-[#4b1d7a] leading-tight truncate px-2">
        {row.tribeName}
      </p>
      
      <div className="mt-2 flex items-center justify-center gap-1.5">
        <span className="font-mono text-xs font-bold text-[#4b1d7a] bg-[#4b1d7a]/10 px-2 py-0.5 rounded-md">
          {row.tribeCode}
        </span>
        {row.groupName ? (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${GROUP_TAG_STYLES[row.groupName] || "bg-gray-100 text-gray-700"}`}>
            {row.groupName}
          </span>
        ) : null}
      </div>

      <div className="mt-4 pt-3 border-t border-[#4b1d7a]/10">
        <p className="display text-4xl font-extrabold text-gradient-purple transition-transform group-hover:scale-105 tabular-nums">
          {row.totalScore}
        </p>
        <p className="text-[10px] font-bold text-[#6d6178] tracking-widest uppercase mt-0.5">Total Points</p>
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
      <div className="panel px-6 py-14 text-center text-[#6d6178] animate-fade-in">
        <div className="text-4xl mb-3 animate-float">📊</div>
        <p className="font-semibold text-base">No scores published yet.</p>
        <p className="text-xs text-[#6d6178]/70 mt-1">Live scores will stream here once evaluators start scoring.</p>
      </div>
    );
  }

  return (
    <div className="panel overflow-hidden animate-fade-in shadow-md">
      <div className="grid grid-cols-[48px_1fr_auto] gap-3 border-b border-[#4b1d7a]/10 bg-[#4b1d7a]/[0.03] px-5 py-3.5 text-[10px] uppercase tracking-[0.2em] text-[#4b1d7a] font-bold md:grid-cols-[56px_1fr_1fr_auto]">
        <span className="text-center">Rank</span>
        <span>Tribe & House</span>
        {showVenue ? <span className="hidden md:block">Active Theme</span> : null}
        <span className="text-right">Score</span>
      </div>
      {rows.map((row, i) => (
        <Link
          key={row.id}
          href={`/tribe/${row.id}`}
          className={`grid grid-cols-[48px_1fr_auto] items-center gap-3 border-b border-[#4b1d7a]/[0.06] px-5 py-4 last:border-0 row-hover group animate-fade-in-up transition-all ${
            row.rank === 1
              ? "bg-[#e4b84a]/[0.06] hover:bg-[#e4b84a]/[0.12]"
              : row.rank === 2
              ? "bg-slate-500/[0.04] hover:bg-slate-500/[0.08]"
              : row.rank === 3
              ? "bg-amber-700/[0.04] hover:bg-amber-700/[0.08]"
              : "hover:bg-[#4b1d7a]/[0.03]"
          } md:grid-cols-[56px_1fr_1fr_auto]`}
          style={{ animationDelay: `${i * 0.02}s` }}
        >
          <div className="flex justify-center">
            <span
              className={`display flex h-8 w-8 items-center justify-center rounded-xl text-base font-extrabold shadow-xs ${
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

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#12071f] transition-colors group-hover:text-[#4b1d7a] truncate">
                {row.tribeName}
              </span>
              {row.groupName && (
                <span className={`hidden sm:inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border ${GROUP_TAG_STYLES[row.groupName] || "bg-gray-100 text-gray-700"}`}>
                  {row.groupName}
                </span>
              )}
            </div>
            <span className="text-xs text-[#6d6178] font-mono font-semibold">{row.tribeCode}</span>
          </div>

          {showVenue ? (
            <div className="hidden md:flex flex-col truncate">
              <span className="text-xs text-[#4b1d7a] font-bold truncate">{row.venueTheme || "Main Arena"}</span>
              <span className="text-[10px] text-[#6d6178] truncate">{row.location}</span>
            </div>
          ) : null}

          <div className="text-right">
            <span className={`font-extrabold text-[#12071f] transition-all duration-200 group-hover:text-[#4b1d7a] group-hover:scale-105 tabular-nums ${compact ? "text-lg" : "text-2xl"}`}>
              {row.totalScore}
            </span>
            <span className="block text-[9px] uppercase font-bold text-[#6d6178]/70">pts</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function Podium({ rows }: { rows: LeaderboardRow[] }) {
  const first = rows[0];
  const second = rows[1];
  const third = rows[2];
  if (!first) return null;

  return (
    <div className="grid gap-5 md:grid-cols-3 items-end pt-4">
      <div className="order-2 md:order-1">
        <PodiumCard row={second} place="02 SILVER" medal="🥈" delay={0.1} podiumClass="podium-2" />
      </div>
      <div className="order-1 md:order-2 md:-translate-y-4">
        <PodiumCard row={first} place="01 GOLD" medal="🏆" delay={0} podiumClass="podium-1" />
      </div>
      <div className="order-3">
        <PodiumCard row={third} place="03 BRONZE" medal="🥉" delay={0.2} podiumClass="podium-3" />
      </div>
    </div>
  );
}
