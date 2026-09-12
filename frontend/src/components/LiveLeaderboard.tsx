"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { LeaderboardTable, Podium } from "@/components/LeaderboardTable";
import { LiveBadge, useLiveRefresh } from "@/components/LiveBadge";
import { SOCKET_URL } from "@/lib/config";
import { formatTime } from "@/lib/format";
import type { LeaderboardRow } from "@/lib/types";

export function LiveLeaderboard({
  initialRows,
  initialUpdated,
  path: defaultPath,
  showVenue = true,
  showPodium = false,
  title,
  podiumTitle = "Current Podium Standings",
}: {
  initialRows: LeaderboardRow[];
  initialUpdated: string;
  path: string;
  showVenue?: boolean;
  showPodium?: boolean;
  title?: string;
  podiumTitle?: string;
}) {
  const [rows, setRows] = useState(initialRows);
  const [updated, setUpdated] = useState(initialUpdated);
  const [mounted, setMounted] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${SOCKET_URL}${defaultPath}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setRows(data.rows || data);
        setUpdated(data.lastUpdated || new Date().toISOString());
      }
    } catch {
      // ignore
    }
  }, [defaultPath]);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    refresh();
  }, [refresh]);

  const live = useLiveRefresh(refresh);

  return (
    <div className="space-y-8 animate-fade-in">
      {showPodium && (
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <span className="text-xl sm:text-2xl">🏆</span>
            <h2 className="display text-2xl sm:text-3xl font-bold text-[#12071f]">{podiumTitle}</h2>
          </div>
          <Podium rows={rows} />
        </section>
      )}

      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2">
          <div>
            <p className="text-[10px] tracking-[0.25em] text-[#4b1d7a] font-bold uppercase">Live Score Standings</p>
            {title ? <h2 className="display text-2xl sm:text-3xl md:text-4xl mt-1 font-bold text-[#12071f]">{title}</h2> : null}
          </div>
          <div className="flex items-center gap-3">
            <LiveBadge live={live} />
            <span suppressHydrationWarning className="text-[11px] font-mono uppercase text-[#6d6178]">
              Updated {mounted ? formatTime(updated) : "—"}
            </span>
            <Link href="/" className="ml-2 text-xs font-semibold text-[#4b1d7a] hover:text-[#e4b84a] transition-colors">
              Exit
            </Link>
          </div>
        </div>
        <LeaderboardTable rows={rows} showVenue={showVenue} />
      </section>
    </div>
  );
}
