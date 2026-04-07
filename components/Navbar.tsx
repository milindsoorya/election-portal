"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/candidates", label: "Candidates", icon: "👤" },
  { href: "/booth-finder", label: "Booth Finder", icon: "📍" },
  { href: "/results", label: "Live Results", icon: "📊" },
  { href: "/voter-guide", label: "Voter Guide", icon: "📋" },
  { href: "/trivia", label: "Trivia & Quiz", icon: "🧠" },
  { href: "/parties", label: "Party Hub", icon: "🏛" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 shadow-md" style={{ background: "linear-gradient(135deg, #0f3d22 0%, #1a6b3a 100%)" }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg">
            <span className="text-2xl">🗳️</span>
            <div className="leading-tight">
              <div className="text-white font-bold text-sm md:text-base">India Election Portal</div>
              <div className="text-green-300 text-xs font-normal">Kerala 2026</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-lg text-xs font-medium transition-all",
                  pathname === link.href
                    ? "bg-white/20 text-white"
                    : "text-green-100 hover:bg-white/10 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Live Badge */}
          <div className="hidden md:flex items-center gap-2">
            <span className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full animate-pulse">
              <span className="w-2 h-2 bg-white rounded-full inline-block"></span>
              LIVE COUNTING
            </span>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-6 h-0.5 bg-white mb-1.5 transition-all"></div>
            <div className="w-6 h-0.5 bg-white mb-1.5"></div>
            <div className="w-6 h-0.5 bg-white"></div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-green-900 border-t border-green-700 px-4 py-3">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-white rounded-full inline-block animate-pulse"></span>
              LIVE COUNTING
            </span>
          </div>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all mb-1",
                pathname === link.href
                  ? "bg-white/20 text-white"
                  : "text-green-100 hover:bg-white/10"
              )}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
