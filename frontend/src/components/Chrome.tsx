"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";

const links = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/overall", label: "Overall", icon: "🏆" },
  { href: "/venues", label: "Venues", icon: "🏛️" },
  { href: "/tribes", label: "Tribes", icon: "🛡️" },
];

const GROUP_PILLS = [
  { name: "Group I", label: "Creative", color: "text-rose-400 border-rose-500/30 bg-rose-500/10", icon: "🎨" },
  { name: "Group II", label: "Tech", color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10", icon: "💻" },
  { name: "Group III", label: "Cosmic", color: "text-purple-400 border-purple-500/30 bg-purple-500/10", icon: "🚀" },
  { name: "Group IV", label: "Legends", color: "text-amber-400 border-amber-500/30 bg-amber-500/10", icon: "🛡️" },
  { name: "Group V", label: "Energy", color: "text-orange-400 border-orange-500/30 bg-orange-500/10", icon: "⚡" },
];

export function SiteHeader() {
  const path = usePathname();
  
  if (path.startsWith("/scoreboard") || path.startsWith("/admin") || path.startsWith("/login")) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#12071f]/85 text-[#f7f1e6] backdrop-blur-2xl saturate-[1.8] shadow-lg shadow-[#12071f]/20 transition-all">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#e4b84a]/[0.04] to-transparent pointer-events-none" />
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link href="/" className="flex items-center gap-3 group transition-transform duration-300 hover:scale-[1.02]">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#e4b84a]/30 to-[#4b1d7a]/30 blur-sm opacity-0 group-hover:opacity-100 transition duration-500" />
            <BrandLogo size="md" variant="badge" priority />
          </div>
          <span>
            <span className="display block text-lg font-bold tracking-tight text-white transition-colors group-hover:text-[#e4b84a]">
              MSEC SIP Arena
            </span>
            <span className="flex items-center gap-1.5 text-[10px] tracking-[0.25em] text-[#e4b84a]/80 font-semibold uppercase">
              <span>2026–27</span>
              <span className="inline-block h-1 w-1 rounded-full bg-[#e4b84a]" />
              <span className="text-[#35d07f] font-bold">Live</span>
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1.5 text-[13px] text-[#f7f1e6]/80 md:flex">
          {links.map((link) => {
            const isActive = path === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3.5 py-1.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-1.5 ${
                  isActive
                    ? "text-[#e4b84a] bg-[#e4b84a]/15 shadow-sm shadow-[#e4b84a]/10 border border-[#e4b84a]/30 font-bold"
                    : "hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <span>{link.label}</span>
              </Link>
            );
          })}

          <Link
            href="/scoreboard"
            target="_blank"
            className="ml-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#f7f1e6]/90 hover:bg-white/10 hover:text-white transition flex items-center gap-1.5"
          >
            <span>📺</span>
            <span>Projector</span>
          </Link>

          <Link
            href="/login"
            className="btn-gold ml-2 !py-2 !px-4 !text-xs shadow-md shadow-[#e4b84a]/20"
          >
            Host Portal →
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const path = usePathname();
  if (path.startsWith("/scoreboard") || path.startsWith("/admin") || path.startsWith("/login")) return null;

  return (
    <footer className="mt-auto border-t border-[#4b1d7a]/15 bg-[#12071f] text-[#f7f1e6] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#4b1d7a]/5 to-[#4b1d7a]/20 pointer-events-none" />
      
      {/* Group Accent Bar */}
      <div className="border-b border-white/[0.06] bg-black/30 px-5 py-3">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#e4b84a]/80">5 Active Houses & Themes:</span>
          <div className="flex flex-wrap items-center gap-2">
            {GROUP_PILLS.map((grp) => (
              <span key={grp.name} className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border flex items-center gap-1 ${grp.color}`}>
                <span>{grp.icon}</span>
                <span>{grp.name}: {grp.label}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3.5">
          <BrandLogo size="lg" variant="badge" />
          <div>
            <p className="display text-xl font-bold text-white">MSEC SIP Arena</p>
            <p className="mt-1 text-xs text-[#f7f1e6]/50 max-w-md">
              Meenakshi Sundararajan Engineering College · Student Induction Program 2026–27
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-1.5 md:items-end">
          <div className="flex items-center gap-2 text-xs text-[#f7f1e6]/80 font-semibold">
            <span className="live-dot" />
            <span>90 Tribes · 5 Venues · Live Dynamic Scoring</span>
          </div>
          <p className="text-[11px] text-[#e4b84a]/70 font-medium tracking-wide">
            Real-time Live Arena Scoreboard Platform
          </p>
        </div>
      </div>
    </footer>
  );
}

export function MobileNav() {
  const path = usePathname();
  if (path.startsWith("/scoreboard") || path.startsWith("/admin") || path.startsWith("/login")) return null;

  const items = [
    { href: "/", label: "Home", icon: "⬡" },
    { href: "/overall", label: "Standings", icon: "🏆" },
    { href: "/venues", label: "Venues", icon: "🏛️" },
    { href: "/tribes", label: "Tribes", icon: "🛡️" },
  ];

  return (
    <nav className="fixed bottom-3 left-4 right-4 z-40 grid grid-cols-4 rounded-2xl border border-white/10 bg-[#12071f]/90 backdrop-blur-2xl saturate-[1.8] p-1.5 text-[10px] text-[#f7f1e6]/80 shadow-2xl shadow-black/50 md:hidden">
      {items.map((item) => {
        const isActive = path === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 py-1.5 text-center rounded-xl transition-all duration-300 ${
              isActive
                ? "text-[#e4b84a] bg-[#e4b84a]/15 shadow-sm font-bold scale-[1.03]"
                : "hover:bg-white/[0.04] active:scale-95"
            }`}
          >
            <span className="text-base leading-none">{item.icon}</span>
            <span className="font-semibold">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
