"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Calendar, ArrowRight, Flame } from "lucide-react";

interface PromoBannerItem {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  markerWord?: string;
  description: string;
  actionText: string;
  actionHref: string;
  icon: React.ReactNode;
}

const DEFAULT_PROMOS: PromoBannerItem[] = [
  {
    id: "friday-drop",
    badge: "WEEKLY DROP • FRIDAY 8:00 AM",
    badgeColor: "text-pink-400 border-pink-500/20 bg-pink-500/10",
    title: "Friday Match",
    markerWord: "Drop",
    description:
      "Handcrafted dates delivered directly to you every Friday morning. Set your preferences before Tuesday midnight to be paired!",
    actionText: "View Date Status",
    actionHref: "/date",
    icon: <Sparkles className="w-5 h-5 text-pink-400" />,
  },
  {
    id: "campus-events",
    badge: "SPECIAL EVENT • LIVE RSVP",
    badgeColor: "text-orange-400 border-orange-500/20 bg-orange-500/10",
    title: "Mingle Campus",
    markerWord: "Mixers",
    description:
      "Over 200+ singles meet up across our campus mixer events. RSVP now to secure your pass for the next community night.",
    actionText: "Explore Events",
    actionHref: "/events",
    icon: <Flame className="w-5 h-5 text-orange-400" />,
  },
];

interface PromoBannersProps {
  className?: string;
}

export default function PromoBanners({ className = "" }: PromoBannersProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % DEFAULT_PROMOS.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const currentPromo = DEFAULT_PROMOS[currentIndex];

  return (
    <div
      className={`w-full relative overflow-hidden rounded-2xl md:rounded-3xl border border-white/10 bg-[#0c1220] p-5 sm:p-6 shadow-xl ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPromo.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3.5 sm:gap-4 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5">
              {currentPromo.icon}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[10px] font-sans font-medium uppercase tracking-[0.16em] ${currentPromo.badgeColor}`}
                >
                  {currentPromo.badge}
                </span>
              </div>

              <h3 className="font-serif text-xl sm:text-2xl text-white tracking-tight leading-snug">
                {currentPromo.title}{" "}
                {currentPromo.markerWord && (
                  <span className="font-[family-name:var(--font-marker)] text-[#ff69b4] inline-block -rotate-2 ml-1 font-normal tracking-wide">
                    {currentPromo.markerWord}
                  </span>
                )}
              </h3>

              <p className="mt-1 max-w-xl font-sans text-xs sm:text-sm text-white/60 leading-relaxed">
                {currentPromo.description}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 sm:shrink-0 pt-2 sm:pt-0">
            <div className="flex items-center gap-1.5 sm:hidden">
              {DEFAULT_PROMOS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    currentIndex === idx ? "w-5 bg-white" : "w-1.5 bg-white/25"
                  }`}
                  aria-label={`Go to promotion ${idx + 1}`}
                />
              ))}
            </div>

            <Link href={currentPromo.actionHref}>
              <button
                type="button"
                className="h-10 sm:h-11 cursor-pointer rounded-full bg-white px-5 sm:px-6 font-sans text-xs sm:text-sm font-semibold text-[#0a0f1a] transition-all hover:bg-white/90 active:scale-[0.98] flex items-center gap-2"
              >
                <span>{currentPromo.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Desktop Pagination Indicator */}
      <div className="hidden sm:flex absolute bottom-3 right-6 items-center gap-1.5">
        {DEFAULT_PROMOS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              currentIndex === idx ? "w-5 bg-white" : "w-1.5 bg-white/25 hover:bg-white/40"
            }`}
            aria-label={`Go to promo ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
