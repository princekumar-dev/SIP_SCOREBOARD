import type { Metadata } from "next";
import { Cinzel, Outfit } from "next/font/google";
import "./globals.css";
import { MobileNav, SiteFooter, SiteHeader } from "@/components/Chrome";

const display = Cinzel({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MSEC SIP Arena",
  description: "Live tribe scoreboard for Meenakshi Sundararajan Engineering College Student Induction Program 2026–27.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full flex flex-col pb-16 md:pb-0 antialiased">
        <SiteHeader />
        <main className="flex-1 animate-fade-in">{children}</main>
        <SiteFooter />
        <MobileNav />
      </body>
    </html>
  );
}
