"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiSend } from "@/lib/api";
import { clearToken, getToken } from "@/lib/auth";
import { BrandLogo } from "@/components/BrandLogo";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const [ready, setReady] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{
    name: string;
    role: string;
    venueId?: string;
    venue?: { id: string; location: string; theme: string; groupName: string };
  } | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    apiSend<any>("/api/admin/me", token, "GET")
      .then((data) => {
        setUser(data);
        setReady(true);
      })
      .catch(() => {
        clearToken();
        router.replace("/login");
      });
  }, [router]);

  if (!ready) {
    return (
      <div className="scoreboard-bg grid min-h-screen place-items-center">
        <div className="text-center animate-fade-in">
          <div className="h-10 w-10 mx-auto mb-4 animate-spin rounded-full border-[3px] border-white/15 border-t-[#e4b84a]" />
          <p className="text-sm font-medium text-white/50">Accessing control room…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col font-sans">
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#12071f]/95 text-[#f7f1e6] backdrop-blur-xl saturate-[1.8] shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#e4b84a]/[0.02] to-transparent pointer-events-none" />
        <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 md:px-8">
          {/* Left: Brand Logo & Links */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <BrandLogo size="md" variant="badge" priority />
              <span>
                <span className="display block text-lg leading-none text-white transition-colors group-hover:text-[#e4b84a]">
                  MSEC SIP Arena
                </span>
                <span className="text-[10px] tracking-[0.28em] text-[#e4b84a]/70 uppercase font-medium">
                  Control Room
                </span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1 text-[13px] text-[#f7f1e6]/65">
              {[
                { href: "/admin", label: "Dashboard", showFor: "all" },
                { href: "/admin/scores", label: "Score Entry", showFor: "host_only" },
                { href: "/admin/teams", label: "Tribes", showFor: "all" },
                {
                  href:
                    user?.role !== "super_admin" && (user?.venue?.groupName || user?.venueId)
                      ? `/scoreboard?group=${encodeURIComponent(user?.venue?.groupName || user?.venueId || "")}&station=true`
                      : "/scoreboard",
                  label: "Scoreboard",
                  isExternal: true,
                  showFor: "all",
                },
              ]
                .filter((item) => item.showFor === "all" || (item.showFor === "host_only" && user?.role !== "super_admin"))
                .map((item) => {
                  const isActive = path === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      target={item.isExternal ? "_blank" : undefined}
                      className={`nav-link px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                        isActive ? "nav-link-active text-[#e4b84a] font-semibold bg-[#e4b84a]/[0.06]" : "hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.isExternal && <span className="text-[10px] text-[#e4b84a]">↗</span>}
                    </Link>
                  );
                })}
            </nav>
          </div>

          {/* Right: User Profile & Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3.5 py-1.5">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-[#e4b84a] to-[#d4a332] text-[11px] font-bold text-[#12071f]">
                {user?.name ? user.name.charAt(0).toUpperCase() : "H"}
              </span>
              <div className="text-left leading-tight pr-1">
                <p className="text-xs font-semibold text-white max-w-[180px] truncate">
                  {user?.name || (user?.venue?.location ? `${user.venue.location} Host` : "Host")}
                </p>
                <p className="text-[10px] text-[#e4b84a]/70 tracking-wider">
                  {user?.role === "super_admin" ? "Super Admin" : user?.venue?.location || "Venue Host"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                clearToken();
                router.push("/login");
              }}
              className="btn-gold !py-1.5 !px-4 !text-xs cursor-pointer"
            >
              Sign out
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="grid md:hidden h-9 w-9 place-items-center rounded-full border border-white/15 text-white/70 hover:bg-white/[0.06]"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/[0.06] bg-[#12071f] px-5 py-4 space-y-2 animate-fade-in">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.06]">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#e4b84a] to-[#d4a332] text-xs font-bold text-[#12071f]">
                {user?.name ? user.name.charAt(0).toUpperCase() : "H"}
              </span>
              <div>
                <p className="text-xs font-bold text-white">{user?.name}</p>
                <p className="text-[10px] text-[#e4b84a]/70">{user?.role?.replace("_", " ")}</p>
              </div>
            </div>

            {[
              { href: "/admin", label: "Dashboard", showFor: "all" },
              { href: "/admin/scores", label: "Score Entry", showFor: "host_only" },
              { href: "/admin/teams", label: "Tribes", showFor: "all" },
              {
                href: user?.role !== "super_admin" && user?.venueId ? `/scoreboard?venue=${user.venueId}` : "/scoreboard",
                label: "Scoreboard",
                showFor: "all",
              },
            ]
              .filter((item) => item.showFor === "all" || (item.showFor === "host_only" && user?.role !== "super_admin"))
              .map((item) => {
                const isActive = path === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-lg text-sm transition ${
                      isActive ? "bg-[#e4b84a]/10 text-[#e4b84a] font-bold" : "text-white/70 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

            <div className="border-t border-white/[0.06] pt-3">
              <button
                type="button"
                onClick={() => {
                  clearToken();
                  router.push("/login");
                }}
                className="w-full btn-gold !py-2.5 !text-xs cursor-pointer text-center"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 mx-auto max-w-7xl w-full px-5 py-8 md:px-8 animate-fade-in">
        {children}
      </main>
    </div>
  );
}
