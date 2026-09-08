import Link from "next/link";
import { rankLabel } from "@/lib/format";
import type { LeaderboardRow } from "@/lib/types";

function PodiumCard({ row, place, medal, delay, isGold }: { row?: LeaderboardRow; place: string; medal: string; delay: number; isGold?: boolean }) {
  if (!row) return null;
  return (
    <Link
      href={`/tribe/${row.id}`}
      className={`panel block p-6 text-center hover-glow animate-pop-in group relative overflow-hidden ${isGold ? "ring-1 ring-[#e4b84a]/20" : ""}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className={`absolute inset-0 bg-gradient-to-b ${isGold ? "from-[#e4b84a]/[0.06] via-transparent to-transparent" : "from-[#4b1d7a]/[0.03] to-transparent"} pointer-events-none`} />
      <p className="relative text-[10px] tracking-[0.25em] text-[#e4b84a] font-bold">{place}</p>
      <p className="relative text-4xl mt-3" style={{ animationDelay: `${delay + 0.3}s` }}>{medal}</p>
      <p className="relative display mt-3 text-2xl transition-colors group-hover:text-[#4b1d7a] leading-tight">{row.tribeName}</p>
      <p className="relative mt-1.5 text-xs text-[#6d6178] font-medium">{row.venueTheme}</p>
      <div className="relative mt-4 pt-3 border-t border-[#4b1d7a]/[0.08]">
        <p className="display text-4xl text-gradient-purple transition-transform group-hover:scale-110">{row.totalScore}</p>
        <p className="text-[10px] text-[#6d6178] tracking-wider uppercase mt-1">Points</p>
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
        <div className="text-3xl mb-3 opacity-30">📊</div>
        <p className="font-medium">No scores have been published yet.</p>
      </div>
    );
  }

  return (
    <div className="panel overflow-hidden animate-fade-in">
      <div className="grid grid-cols-[48px_1fr_auto] gap-3 border-b border-[#4b1d7a]/[0.08] px-5 py-3.5 text-[10px] uppercase tracking-[0.2em] text-[#6d6178] font-semibold md:grid-cols-[56px_1fr_1fr_auto]">
        <span className="text-center">Rank</span>
        <span>Tribe</span>
        {showVenue ? <span className="hidden md:block">Venue</span> : null}
        <span className="text-right">Score</span>
      </div>
      {rows.map((row, i) => (
        <Link
          key={row.id}
          href={`/tribe/${row.id}`}
          className={`grid grid-cols-[48px_1fr_auto] items-center gap-3 border-b border-[#4b1d7a]/[0.05] px-5 py-4 last:border-0 row-hover group animate-fade-in-up ${
            row.rank && row.rank <= 3 ? "hover:bg-[#e4b84a]/[0.04]" : "hover:bg-[#4b1d7a]/[0.03]"
          } md:grid-cols-[56px_1fr_1fr_auto]`}
          style={{ animationDelay: `${i * 0.025}s` }}
        >
          <span className={`display text-lg text-center font-bold ${
            row.rank === 1 ? "text-[#e4b84a]" : row.rank === 2 ? "text-[#9ca3af]" : row.rank === 3 ? "text-[#cd7f32]" : "text-[#6d6178]/40"
          }`}>
            {row.rank ? rankLabel(row.rank) : <span className="text-[#d1c9be]">—</span>}
          </span>
          <span className="min-w-0">
            <span className="block font-semibold transition-colors group-hover:text-[#4b1d7a] truncate">{row.tribeName}</span>
            <span className="text-xs text-[#6d6178] font-mono">{row.tribeCode}</span>
          </span>
          {showVenue ? (
            <span className="hidden text-sm text-[#4b1d7a] font-medium md:block truncate">{row.venueTheme}</span>
          ) : null}
          <span className={`text-right font-bold transition-all duration-200 group-hover:text-[#4b1d7a] tabular-nums ${compact ? "text-lg" : "text-xl"}`}>{row.totalScore}</span>
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
    <div className="grid gap-4 md:grid-cols-3 items-end">
      <div className="order-2 md:order-1">
        <PodiumCard row={second} place="02 SILVER" medal="🥈" delay={0.1} />
      </div>
      <div className="order-1 md:order-2 md:-translate-y-4">
        <PodiumCard row={first} place="01 GOLD" medal="🏆" delay={0} isGold />
      </div>
      <div className="order-3">
        <PodiumCard row={third} place="03 BRONZE" medal="🥉" delay={0.2} />
      </div>
    </div>
  );
}
