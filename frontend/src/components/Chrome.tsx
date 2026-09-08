"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";


import { BrandLogo } from "@/components/BrandLogo";

const links = [
  { href: "/", label: "Home" },
  { href: "/overall", label: "Overall" },
  { href: "/venues", label: "Venues" },
  { href: "/tribes", label: "Tribes" },
];

export function SiteHeader() {
  const path = usePathname();
  
  if (path.startsWith("/scoreboard") || path.startsWith("/admin") || path.startsWith("/login")) return null;
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#12071f]/90 text-[#f7f1e6] backdrop-blur-xl saturate-[1.8]">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#e4b84a]/[0.03] to-transparent pointer-events-none" />
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
        <Link href="/" className="flex items-center gap-3 group">
          <BrandLogo size="md" variant="badge" priority />
          <span>
            <span className="display block text-lg leading-none text-white transition-colors group-hover:text-[#e4b84a]">MSEC SIP Arena</span>
            <span className="text-[10px] tracking-[0.28em] text-[#e4b84a]/80 font-medium">2026–27</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 text-[13px] text-[#f7f1e6]/70 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link px-3 py-1.5 rounded-lg transition-all duration-200 ${path === link.href ? "nav-link-active text-[#e4b84a] bg-[#e4b84a]/[0.06]" : "hover:text-white hover:bg-white/[0.04]"}`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="btn-gold ml-3 !py-2 !px-5 !text-xs"
          >
            Host login
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
    <footer className="mt-auto border-t border-[#4b1d7a]/10 bg-[#12071f] text-[#f7f1e6]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3.5">
          <BrandLogo size="lg" variant="badge" />
          <div>
            <p className="display text-xl animate-fade-in">MSEC SIP Arena</p>
            <p className="mt-1 text-xs text-[#f7f1e6]/40">Meenakshi Sundararajan Engineering College · Student Induction Program 2026–27</p>
          </div>
        </div>
        <div className="flex flex-col items-start gap-1 md:items-end">
          <p className="text-sm text-[#f7f1e6]/60">90 Tribes · 5 Venues · One Journey</p>
          <p className="text-[11px] text-[#e4b84a]/50 font-medium tracking-wide">Live Score Management Platform</p>
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
    { href: "/overall", label: "Leaderboard", icon: "🏆" },
    { href: "/venues", label: "Venues", icon: "🏛" },
    { href: "/tribes", label: "Tribes", icon: "🛡" },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-4 border-t border-white/[0.06] bg-[#12071f]/95 backdrop-blur-xl saturate-[1.8] px-1 py-2 text-[10px] text-[#f7f1e6]/70 md:hidden">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex flex-col items-center gap-0.5 py-1.5 text-center rounded-xl transition-all duration-200 ${
            path === item.href
              ? "text-[#e4b84a] bg-[#e4b84a]/[0.08]"
              : "hover:bg-white/[0.03]"
          }`}
        >
          <span className="text-sm leading-none">{item.icon}</span>
          <span className="font-semibold">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
