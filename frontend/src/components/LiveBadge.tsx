"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { SOCKET_URL } from "@/lib/config";

export function useLiveRefresh(onUpdate: () => void) {
  const [live, setLive] = useState(false);
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["polling", "websocket"],
      reconnectionDelay: 3000,
      reconnectionAttempts: 10,
    });

    socket.on("connect", () => setLive(true));
    socket.on("disconnect", () => setLive(false));
    socket.on("scores:updated", () => onUpdateRef.current());

    const poll = setInterval(() => onUpdateRef.current(), 30000);

    return () => {
      clearInterval(poll);
      socket.close();
    };
  }, []);

  return live;
}

export function LiveBadge({ live }: { live: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.18em] transition-all duration-300 ${
      live
        ? "border-[#35d07f]/30 bg-[#35d07f]/10 text-[#35d07f]"
        : "border-white/15 bg-black/20 text-white/60"
    }`}>
      <span className={live ? "live-dot" : "offline-dot"} />
      {live ? "LIVE" : "OFFLINE"}
    </span>
  );
}
