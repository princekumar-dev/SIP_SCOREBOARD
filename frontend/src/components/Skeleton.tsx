"use client";

import React from "react";

export function Skeleton({
  className = "",
  dark = false,
  style,
}: {
  className?: string;
  dark?: boolean;
  style?: React.CSSProperties;
}) {
  return <div className={`${dark ? "skeleton-dark" : "skeleton"} ${className}`} style={style} />;
}

export function SkeletonText({ width, className = "" }: { width?: string; className?: string }) {
  return <Skeleton className={`skeleton-text ${className}`} style={width ? { width } : undefined} />;
}

export function SkeletonCard({ dark = false }: { dark?: boolean }) {
  return (
    <div className={`skeleton-card ${dark ? "border-white/5" : ""} animate-fade-in`}>
      <Skeleton className={`skeleton-title mb-3 ${dark ? "skeleton-dark" : ""}`} />
      <Skeleton className={`skeleton-text mb-2 w-3/4 ${dark ? "skeleton-dark" : ""}`} />
      <Skeleton className={`skeleton-text w-1/2 ${dark ? "skeleton-dark" : ""}`} />
    </div>
  );
}

export function SkeletonTable({ rows = 5, dark = false }: { rows?: number; dark?: boolean }) {
  return (
    <div className={`skeleton-card ${dark ? "border-white/5" : ""}`}>
      <div className="flex gap-4 border-b border-[#4b1d7a]/10 px-4 py-3">
        <Skeleton className={`skeleton-text w-12 ${dark ? "skeleton-dark" : ""}`} />
        <Skeleton className={`skeleton-text w-32 ${dark ? "skeleton-dark" : ""}`} />
        <Skeleton className={`skeleton-text w-24 ${dark ? "skeleton-dark" : ""}`} />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-[#4b1d7a]/6 px-4 py-3 last:border-0">
          <Skeleton className={`skeleton-text w-8 ${dark ? "skeleton-dark" : ""}`} />
          <Skeleton className={`skeleton-text w-40 ${dark ? "skeleton-dark" : ""}`} />
          <Skeleton className={`skeleton-text w-20 ${dark ? "skeleton-dark" : ""}`} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonPodium() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`skeleton-card ${i === 2 ? "md:-translate-y-3" : ""}`}>
          <Skeleton className="skeleton-text w-16 mx-auto mb-3" />
          <Skeleton className="skeleton-title mx-auto mb-2 w-2/3" />
          <Skeleton className="skeleton-text mx-auto mb-3 w-1/3" />
          <Skeleton className="skeleton-title mx-auto w-20" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div className="scoreboard-bg text-[#f7f1e6]">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <Skeleton className="skeleton-dark skeleton-text w-48 mb-4" />
        <Skeleton className="skeleton-dark skeleton-title w-96 mb-3" />
        <Skeleton className="skeleton-dark skeleton-text w-64 mb-8" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <Skeleton className="skeleton-dark skeleton-title w-16 mb-2" />
              <Skeleton className="skeleton-dark skeleton-text w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonVenueCard() {
  return (
    <div className="skeleton-card">
      <Skeleton className="skeleton-text w-20 mb-2" />
      <Skeleton className="skeleton-title mb-2" />
      <Skeleton className="skeleton-text w-32 mb-3" />
      <Skeleton className="skeleton-text w-16" />
    </div>
  );
}

export function SkeletonTribeCard() {
  return (
    <div className="skeleton-card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Skeleton className="skeleton-text w-16 mb-2" />
          <Skeleton className="skeleton-title mb-1" />
          <Skeleton className="skeleton-text w-24" />
        </div>
        <div className="text-right">
          <Skeleton className="skeleton-text w-12 mb-1 ml-auto" />
          <Skeleton className="skeleton-title w-16 ml-auto" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonSearchResults() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="skeleton-card">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Skeleton className="skeleton-title mb-2 w-40" />
              <Skeleton className="skeleton-text w-48" />
            </div>
            <div className="text-right">
              <Skeleton className="skeleton-text w-12 mb-1 ml-auto" />
              <Skeleton className="skeleton-title w-12 ml-auto" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
