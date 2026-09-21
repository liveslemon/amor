"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Heart,
  MessageCircle,
  CalendarDays,
  User,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { APP_CONFIG } from "@/config/app";
import { useAuthStore } from "@/store/useAuthStore";
import NotificationCenter from "@/components/pwa/NotificationCenter";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Home", href: "/home", icon: Home },
  { name: "Dates", href: "/dates", icon: Heart },
  { name: "Chats", href: "/chats", icon: MessageCircle, badge: "1" },
  { name: "Events", href: "/events", icon: CalendarDays },
  { name: "Me", href: "/me", icon: User },
];

export default function PWANavigation() {
  const pathname = usePathname() || "";
  const user = useAuthStore((state) => state.user);

  // Hide navigation on landing, login, signup, and legal reading pages
  const isAuthOrLanding =
    pathname === "/" ||
    pathname === "/Landing" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/registration-complete" ||
    pathname === "/terms" ||
    pathname === "/privacy";

  if (isAuthOrLanding) return null;

  return (
    <>
      {/* ─── DESKTOP TOP NAVIGATION BAR (md and larger screens) ─── */}
      <header className="hidden md:block fixed top-0 inset-x-0 z-40 bg-[#000B1A] border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link
            href="/home"
            className="flex items-center gap-2 group cursor-pointer"
          >
            <span className="font-[family-name:var(--font-marker)] text-2xl tracking-wide text-white group-hover:text-white/90 transition-colors">
              {APP_CONFIG.name}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFB6C1]" />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="flex items-center gap-1.5 bg-white/[0.03] p-1 rounded-full">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href === "/dates" && pathname === "/date") ||
                (item.href !== "/home" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "stroke-[2.2]" : "stroke-[1.8]"
                    }`}
                  />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-semibold text-black">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            <NotificationCenter />
            <Link
              href="/me"
              className="flex items-center gap-2.5 pl-2 py-1 rounded-full hover:bg-white/5 transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-[#141d2e] flex items-center justify-center text-xs font-serif text-white">
                {user?.name ? user.name.charAt(0).toUpperCase() : "M"}
              </div>
              <span className="text-xs text-white/70 group-hover:text-white font-medium max-w-[100px] truncate">
                {user?.name ? user.name.split(" ")[0] : "Account"}
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── MOBILE FLOATING BOTTOM DOCK (< md screens) ─── */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-safe pointer-events-none"
      >
        <div className="w-full max-w-lg px-4 pb-4 sm:pb-6 pointer-events-auto">
          <div className="flex items-center justify-around rounded-full bg-[#0c1322] px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.6)]">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href === "/dates" && pathname === "/date") ||
                (item.href !== "/home" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="relative flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-200 group active:scale-95"
                >
                  <div
                    className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-200 ${
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 transition-transform duration-200 ${
                        isActive ? "scale-105 stroke-[2.2]" : "stroke-[1.8]"
                      }`}
                    />
                    {item.badge && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-semibold text-black">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[11px] font-sans tracking-wide transition-colors duration-200 ${
                      isActive ? "text-white font-medium" : "text-white/50"
                    }`}
                  >
                    {item.name}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-white/70" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}

