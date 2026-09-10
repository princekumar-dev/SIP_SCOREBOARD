import { apiGet } from "@/lib/api";
import { VenuesClient } from "./VenuesClient";
import type { Venue } from "@/lib/types";

export const revalidate = 60;

export default async function VenuesPage() {
  let venues: Venue[] = [];
  try {
    venues = await apiGet<Venue[]>("/api/venues");
  } catch {
    venues = [];
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-5 py-8 sm:py-12">
      {/* Header */}
      <div className="animate-fade-in-up mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#12071f] px-3.5 py-1 mb-3 sm:mb-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#e4b84a]">
            Campus Arenas
          </span>
          <span className="text-[10px] text-[#e4b84a]/50">·</span>
          <span className="text-[10px] text-[#e4b84a]/60">Student Induction Program 2026–27</span>
        </div>
        <h1 className="display text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#12071f] tracking-tight">
          Five Evaluation Halls. One Arena.
        </h1>
        <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-[#6d6178] max-w-2xl leading-relaxed">
          Explore the 5 presentation venues across campus. When groups rotate into a hall, participating classes and domain themes update automatically in real time.
        </p>
      </div>

      <VenuesClient initialVenues={venues} />
    </div>
  );
}
