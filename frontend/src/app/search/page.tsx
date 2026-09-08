"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SOCKET_URL } from "@/lib/config";
import { rankLabel } from "@/lib/format";
import { SkeletonSearchResults } from "@/components/Skeleton";
import type { TribeSummary } from "@/lib/types";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<TribeSummary[] | null>(null);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const debouncedQ = useDebounce(q, 300);

  const doSearch = useCallback(async (query: string) => {
    abortRef.current?.abort();
    if (query.trim().length < 1) {
      setResults(null);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    try {
      const res = await fetch(`${SOCKET_URL}/api/tribes?q=${encodeURIComponent(query)}`, {
        cache: "no-store",
        signal: controller.signal,
      });
      const data = await res.json();
      setResults(data);
    } catch {
      if (!controller.signal.aborted) setResults(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    doSearch(debouncedQ);
  }, [debouncedQ, doSearch]);

  const empty = useMemo(() => results && results.length === 0, [results]);

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <div className="animate-fade-in-up">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#4b1d7a]/[0.06] border border-[#4b1d7a]/10 px-3 py-1 mb-4">
          <span className="text-[10px] font-bold tracking-[0.22em] text-[#4b1d7a] uppercase">Find a Tribe</span>
        </div>
        <h1 className="display text-4xl md:text-5xl">Search</h1>
        <p className="mt-3 text-[#6d6178] leading-relaxed">Search by tribe name, Tribe ID, member name, or venue.</p>
      </div>
      <div className="relative mt-8 animate-fade-in-up delay-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Try Neural, SIP-024, or Aarav"
          className="input-focus w-full rounded-2xl border border-[#4b1d7a]/[0.15] bg-white px-6 py-4 text-lg outline-none shadow-sm"
        />
        {loading && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#4b1d7a]/20 border-t-[#e4b84a]" />
          </div>
        )}
      </div>
      <div className="mt-8 space-y-3">
        {loading ? <SkeletonSearchResults /> : null}
        {empty ? (
          <div className="panel p-10 text-center text-[#6d6178] animate-scale-in">
            <div className="text-3xl mb-3 opacity-30">🔍</div>
            <p className="font-medium">No tribe found. Try searching by tribe name or Tribe ID.</p>
          </div>
        ) : null}
        {results?.map((tribe, i) => (
          <Link
            key={tribe.id}
            href={`/tribe/${tribe.id}`}
            className="panel block p-6 hover-glow animate-fade-in-up group card-glow"
            style={{ animationDelay: `${i * 0.04}s` }}
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="display text-2xl transition-colors group-hover:text-[#4b1d7a]">{tribe.tribeName}</p>
                <p className="text-sm text-[#6d6178] mt-1">
                  {tribe.tribeCode} · {tribe.venueTheme} · {tribe.location}
                </p>
              </div>
              <div className="text-right ml-4 shrink-0">
                {tribe.rank ? <p className="text-[10px] tracking-[0.18em] text-[#6d6178] font-semibold">RANK {rankLabel(tribe.rank)}</p> : null}
                <p className="display text-2xl font-bold score-highlight">{tribe.totalScore}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
