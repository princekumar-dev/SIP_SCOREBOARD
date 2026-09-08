"use client";

import { useEffect, useRef, useState } from "react";

export function PageTransition({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50 + delay * 100);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: `opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${delay * 0.1}s, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${delay * 0.1}s`,
      }}
    >
      {children}
    </div>
  );
}

export function StaggerContainer({
  children,
  className = "",
  staggerDelay = 0.06,
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  return (
    <div className={className}>
      {Array.isArray(children)
        ? children.map((child, i) => (
            <PageTransition key={i} delay={i} className="">
              <div style={{ animationDelay: `${i * staggerDelay}s` }}>{child}</div>
            </PageTransition>
          ))
        : <PageTransition delay={0}>{children}</PageTransition>
      }
    </div>
  );
}
