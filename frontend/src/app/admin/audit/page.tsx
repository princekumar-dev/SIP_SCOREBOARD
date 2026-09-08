"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { apiSend } from "@/lib/api";
import { getToken } from "@/lib/auth";

type Log = { id: string; action: string; user: string; reason: string; createdAt: string; entityType: string };

export default function AuditPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiSend<Log[]>("/api/admin/audit", getToken(), "GET")
      .then(setLogs)
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminShell>
      <div className="animate-fade-in-up">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#12071f] px-3.5 py-1 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#e4b84a]">Activity Log</span>
        </div>
        <h1 className="display text-4xl">Audit Log</h1>
      </div>
      <div className="panel mt-8 overflow-hidden animate-fade-in-up delay-2">
        {loading ? (
          <div className="divide-y divide-[#4b1d7a]/[0.06]">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3 px-6 py-5" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="flex-1">
                  <div className="skeleton skeleton-text w-32 mb-2" />
                  <div className="skeleton skeleton-text w-48" />
                </div>
                <div className="skeleton skeleton-text w-20" />
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <p className="p-8 text-center text-[#6d6178]">No audit records yet.</p>
        ) : (
          <div className="divide-y divide-[#4b1d7a]/[0.06]">
            {logs.map((log, i) => (
              <div
                key={log.id}
                className="flex flex-wrap items-start justify-between gap-3 px-6 py-4 text-sm row-hover animate-fade-in-up"
                style={{ animationDelay: `${i * 0.03}s` }}
              >
                <div>
                  <span className="inline-block rounded-md bg-[#4b1d7a]/[0.06] px-2 py-0.5 text-[10px] font-bold text-[#4b1d7a] uppercase mb-1">
                    {log.action.replace(".", " ")}
                  </span>
                  <p className="font-semibold text-[#12071f]">{log.user}</p>
                  <p className="text-[#6d6178] text-xs">
                    {log.entityType}
                    {log.reason ? ` · ${log.reason}` : ""}
                  </p>
                </div>
                <p className="text-xs text-[#6d6178] font-mono shrink-0">{new Date(log.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
