"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { SOCKET_URL } from "@/lib/config";
import { setToken } from "@/lib/auth";
import { BrandLogo } from "@/components/BrandLogo";

const HOST_ACCOUNTS = [
  {
    role: "venue_host",
    hallNumber: "Venue 1",
    hallName: "KRS Seminar Hall",
    description: "Evaluates Groups I – V",
    email: "host1@msec.edu",
    tag: "Host 1",
    icon: "🏛️",
  },
  {
    role: "venue_host",
    hallNumber: "Venue 2",
    hallName: "ECE Seminar Hall",
    description: "Evaluates Groups I – V",
    email: "host2@msec.edu",
    tag: "Host 2",
    icon: "📡",
  },
  {
    role: "venue_host",
    hallNumber: "Venue 3",
    hallName: "Civil Seminar Hall",
    description: "Evaluates Groups I – V",
    email: "host3@msec.edu",
    tag: "Host 3",
    icon: "🏗️",
  },
  {
    role: "venue_host",
    hallNumber: "Venue 4",
    hallName: "MCW Seminar Hall",
    description: "Evaluates Groups I – V",
    email: "host4@msec.edu",
    tag: "Host 4",
    icon: "💻",
  },
  {
    role: "venue_host",
    hallNumber: "Venue 5",
    hallName: "MS Auditorium",
    description: "Evaluates Groups I – V",
    email: "host5@msec.edu",
    tag: "Host 5",
    icon: "🎭",
  },
  {
    role: "super_admin",
    hallNumber: "Central",
    hallName: "Control Tower",
    description: "Master Admin across all halls",
    email: "admin@msec.edu",
    tag: "Super Admin",
    icon: "👑",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("host1@msec.edu");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(targetEmail?: string, targetPassword?: string) {
    const loginEmail = targetEmail || email;
    const loginPass = targetPassword || password;

    if (!loginPass) {
      setError("Please enter your account password to sign in.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${SOCKET_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not sign in with provided credentials.");
        setLoading(false);
        return;
      }
      setToken(data.token);
      router.push("/admin/scores");
    } catch {
      setError("Unable to connect to backend server.");
      setLoading(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleLogin();
  }

  function selectHost(hostEmail: string) {
    setEmail(hostEmail);
    setPassword("");
    setError("");
    setTimeout(() => {
      document.getElementById("password-field")?.focus();
    }, 50);
  }

  const selectedHostObj = HOST_ACCOUNTS.find((h) => h.email === email) || HOST_ACCOUNTS[0];

  return (
    <div className="scoreboard-bg min-h-screen py-8 px-5 flex flex-col justify-center items-center relative overflow-hidden">
      {/* Top Floating Bar with Exit Button */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-8 z-20">
        <Link href="/" className="flex items-center gap-3 group">
          <BrandLogo size="md" variant="badge" priority />
          <div>
            <span className="text-sm font-bold text-white group-hover:text-[#e4b84a] transition-colors block leading-tight">
              MSEC SIP Arena
            </span>
            <span className="text-[10px] tracking-[0.2em] text-[#e4b84a]/80 font-mono">
              2026–27
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-5 py-2.5 text-xs font-bold text-white hover:bg-white/[0.1] hover:border-[#e4b84a]/40 hover:text-[#e4b84a] transition-all backdrop-blur-md"
        >
          <span>🏠</span>
          <span>Exit to Home</span>
        </Link>
      </div>

      {/* Subtle background ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#4b1d7a]/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-[#e4b84a]/[0.07] rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-5xl relative z-10">
        {/* Title Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center justify-center">
            <BrandLogo size="lg" variant="badge" />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Host & Coordinator Portal
          </h1>
          <p className="mt-3 text-sm text-white/50 max-w-lg mx-auto leading-relaxed">
            Select your assigned venue below, then enter your password to access the Control Room.
          </p>
        </div>

        {/* Unified Glass Container */}
        <div className="grid gap-6 lg:grid-cols-12 items-stretch">
          {/* Left Column: Venue Host Selectors */}
          <div className="lg:col-span-7 flex flex-col justify-between rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl shadow-2xl">
            <div>
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3.5 mb-5">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#e4b84a]">
                  1. Select Your Venue Hall
                </p>
                <span className="text-[11px] text-white/35 font-medium">5 Venue Hosts + Admin</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {HOST_ACCOUNTS.map((item) => {
                  const isSelected = email === item.email;
                  return (
                    <button
                      key={item.email}
                      type="button"
                      onClick={() => selectHost(item.email)}
                      className={`group relative rounded-2xl border p-4 text-left transition-all duration-300 cursor-pointer ${
                        isSelected
                          ? "border-[#e4b84a]/60 bg-gradient-to-br from-[#e4b84a]/15 via-[#4b1d7a]/15 to-transparent shadow-[0_0_24px_rgba(228,184,74,0.1)] ring-1 ring-[#e4b84a]/30"
                          : "border-white/[0.06] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                          {item.hallNumber}
                        </span>
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition-all ${
                            isSelected
                              ? "bg-[#e4b84a] text-[#12071f]"
                              : "bg-white/[0.06] text-white/60 group-hover:text-white/80"
                          }`}
                        >
                          {item.tag}
                        </span>
                      </div>

                      <p className="mt-2.5 text-sm font-bold text-white group-hover:text-[#e4b84a] transition-colors line-clamp-1">
                        {item.hallName}
                      </p>

                      <p className="mt-1 text-xs text-white/40 line-clamp-1">
                        {item.description}
                      </p>

                      <div className="mt-3 flex items-center justify-between border-t border-white/[0.04] pt-2.5 text-[11px]">
                        <span className="text-white/30 font-mono text-[10px] truncate max-w-[130px]">
                          {item.email}
                        </span>
                        <span className={`font-bold transition-colors ${isSelected ? "text-[#e4b84a]" : "text-white/50 group-hover:text-[#e4b84a]"}`}>
                          {isSelected ? "Selected ✓" : "Select →"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs text-white/30">
              <span>Student Induction Program 2026–27</span>
              <span>All 5 Venue Halls Supported</span>
            </div>
          </div>

          {/* Right Column: Password Sign In */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 md:p-8 backdrop-blur-xl shadow-2xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#e4b84a]/[0.04] rounded-full blur-[80px] pointer-events-none" />
            
            <form onSubmit={onSubmit} className="space-y-5 relative z-[1]">
              <div className="border-b border-white/[0.06] pb-3.5">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#e4b84a]">
                  2. Password Verification
                </span>
                <h2 className="text-lg font-bold text-white tracking-tight mt-1.5">
                  Sign In to Control Room
                </h2>
                <div className="mt-3 rounded-xl border border-[#e4b84a]/20 bg-[#e4b84a]/[0.06] p-3 text-xs text-[#e4b84a] font-semibold flex items-center gap-2">
                  <span>🏛️</span>
                  <span className="truncate">
                    {selectedHostObj.hallName} ({selectedHostObj.email})
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-[0.18em] text-white/60 uppercase mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. host1@msec.edu"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-[#e4b84a]/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-[#e4b84a]/15"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-[0.18em] text-white/60 uppercase mb-2">
                  Password
                </label>
                <input
                  id="password-field"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter account password"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-[#e4b84a]/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-[#e4b84a]/15"
                  required
                  autoFocus
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/[0.08] p-3.5 text-xs text-red-200 font-medium">
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-[#e4b84a] to-[#d4a332] py-3.5 text-sm font-bold text-[#12071f] shadow-lg shadow-[#e4b84a]/15 hover:brightness-105 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading && (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#12071f] border-t-transparent" />
                )}
                <span>{loading ? "Authenticating…" : "Access Control Room →"}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
