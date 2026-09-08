"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { apiSend } from "@/lib/api";
import { getToken } from "@/lib/auth";

type User = { id: string; name: string; email: string; role: string; venueTheme: string; status: string };

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiSend<User[]>("/api/admin/users", getToken(), "GET")
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminShell>
      <div className="animate-fade-in-up">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#12071f] px-3.5 py-1 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#e4b84a]">User Management</span>
        </div>
        <h1 className="display text-4xl">Hosts & Coordinators</h1>
      </div>
      <div className="panel mt-8 overflow-x-auto animate-fade-in-up delay-2">
        <table className="w-full text-left text-sm">
          <thead className="text-[10px] uppercase tracking-[0.2em] text-[#6d6178] font-semibold border-b border-[#4b1d7a]/[0.08]">
            <tr>
              <th className="px-5 py-4">Name</th>
              <th className="px-5 py-4">Email</th>
              <th className="px-5 py-4">Role</th>
              <th className="px-5 py-4">Venue</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1, 2, 3, 4].map((i) => (
                <tr key={i} className="border-t border-[#4b1d7a]/[0.06]">
                  <td className="px-5 py-4"><div className="skeleton skeleton-text w-24 h-4" /></td>
                  <td className="px-5 py-4"><div className="skeleton skeleton-text w-32 h-4" /></td>
                  <td className="px-5 py-4"><div className="skeleton skeleton-text w-16 h-4" /></td>
                  <td className="px-5 py-4"><div className="skeleton skeleton-text w-20 h-4" /></td>
                </tr>
              ))
            ) : (
              users.map((user, i) => (
                <tr
                  key={user.id}
                  className="border-t border-[#4b1d7a]/[0.06] row-hover animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.03}s` }}
                >
                  <td className="px-5 py-4 font-semibold">{user.name}</td>
                  <td className="px-5 py-4 text-[#6d6178]">{user.email}</td>
                  <td className="px-5 py-4">
                    <span className="inline-block rounded-full bg-[#4b1d7a]/[0.06] px-2.5 py-0.5 text-[10px] font-bold text-[#4b1d7a]">
                      {user.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[#6d6178]">{user.venueTheme}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
