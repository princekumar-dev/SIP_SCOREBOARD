"use client";

import Image from "next/image";

interface BrandLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "badge" | "rect" | "full" | "light-full";
  className?: string;
  priority?: boolean;
}

const sizeMap = {
  xs: "h-7 w-7",
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-14 w-14",
  xl: "h-20 w-20",
};

const pixelMap = {
  xs: 28,
  sm: 36,
  md: 44,
  lg: 56,
  xl: 80,
};

export function BrandLogo({
  size = "md",
  variant = "badge",
  className = "",
  priority = false,
}: BrandLogoProps) {
  if (variant === "full") {
    return (
      <div className={`relative inline-flex items-center justify-center ${className}`}>
        <Image
          src="/msgi-logo.png"
          alt="Meenakshi Sundararajan Group of Institutions"
          width={280}
          height={140}
          className="h-auto w-full object-contain max-h-16 drop-shadow-sm"
          priority={priority}
        />
      </div>
    );
  }

  if (variant === "light-full") {
    return (
      <div className={`relative inline-flex items-center justify-center ${className}`}>
        <Image
          src="/msgi-logo-light.png"
          alt="Meenakshi Sundararajan Group of Institutions"
          width={280}
          height={140}
          className="h-auto w-full object-contain max-h-16 drop-shadow-[0_2px_12px_rgba(228,184,74,0.25)]"
          priority={priority}
        />
      </div>
    );
  }

  const dimension = pixelMap[size];
  const sizeClass = sizeMap[size];

  if (variant === "rect") {
    return (
      <div
        className={`relative inline-flex ${sizeClass} shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#e4b84a]/60 bg-white p-1 shadow-md shadow-black/20 transition-all duration-300 group-hover:border-[#e4b84a] group-hover:shadow-[0_0_20px_rgba(228,184,74,0.35)] group-hover:scale-105 ${className}`}
      >
        <Image
          src="/msgi-badge.png"
          alt="MSGI Logo"
          width={dimension}
          height={dimension}
          className="h-full w-full object-contain"
          priority={priority}
        />
      </div>
    );
  }

  // Default "badge" (circular, pristine white background, gold rim, smooth glow on hover)
  return (
    <div
      className={`relative inline-flex ${sizeClass} shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#e4b84a]/80 bg-white p-0.5 shadow-md shadow-black/20 transition-all duration-300 group-hover:border-[#e4b84a] group-hover:shadow-[0_0_20px_rgba(228,184,74,0.4)] group-hover:scale-105 ${className}`}
    >
      <Image
        src="/msgi-badge.png"
        alt="MSGI Logo"
        width={dimension}
        height={dimension}
        className="h-full w-full object-contain rounded-full"
        priority={priority}
      />
    </div>
  );
}
