import { apiGet } from "@/lib/api";
import { TribesClient } from "./TribesClient";
import type { TribeSummary, Venue } from "@/lib/types";

export const revalidate = 60;

export default async function TribesPage() {
  let tribes: TribeSummary[] = [];
  let venues: Venue[] = [];

  try {
    [tribes, venues] = await Promise.all([
      apiGet<TribeSummary[]>("/api/tribes"),
      apiGet<Venue[]>("/api/venues"),
    ]);
  } catch {
    tribes = [];
    venues = [];
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      {/* Header */}
      <div className="animate-fade-in-up mb-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#12071f] px-3.5 py-1 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#e4b84a]">
            Tribe Directory
          </span>
          <span className="text-[10px] text-[#e4b84a]/50">·</span>
          <span className="text-[10px] text-[#e4b84a]/60">{tribes.length || 91} Multidisciplinary Teams · 5 Groups</span>
        </div>
        <h1 className="display text-4xl md:text-5xl font-extrabold text-[#12071f] tracking-tight">
          All {tribes.length || 91} Competing Tribes
        </h1>
        <p className="mt-3 text-sm text-[#6d6178] max-w-2xl leading-relaxed">
          Search and filter across all 5 groups, inspect student members and departments, and track cumulative rankings.
        </p>
      </div>

      <TribesClient initialTribes={tribes} venues={venues} />
    </div>
  );
}
