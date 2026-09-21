"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Heart,
  Lock,
  Sparkles,
  Calendar,
  MessageCircle,
  Clock3,
  ShieldCheck,
  ChevronRight,
  Bell,
  Settings,
  Flame,
  ArrowRight,
  CheckCircle2,
  Users,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { APP_CONFIG } from "@/config/app";
import API from "@/api/client";
import NotificationModal from "@/components/pwa/NotificationModal";
import NotificationCenter from "@/components/pwa/NotificationCenter";
import SupportChatModal from "@/components/pwa/SupportChatModal";

interface CurrentMatch {
  match_id: string;
  match_score: number;
  match_week: string;
  partner: {
    id: string;
    name: string;
    whatsapp_number: string;
    profile?: {
      age?: number;
      height?: number;
      build?: string;
      gender?: string;
      weekend_type?: string;
    };
    photos?: Array<{ image_url: string }>;
  };
}

export default function PWAHome() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [match, setMatch] = useState<CurrentMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [supportOpen, setSupportOpen] = useState(false);
  const [countdown, setCountdown] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
    isFridayNow: false,
    isThursday: false,
  });

  // Check authentication
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token =
        localStorage.getItem("mingle_token") ||
        localStorage.getItem("mingle_access_token");
      if (!token) {
        router.replace("/login");
        return;
      }
    }

    const fetchMatch = async () => {
      try {
        setLoading(true);
        const res = await API.get("/matches/current");
        if (res.data?.match) {
          setMatch(res.data.match);
        }
      } catch {
        // No match yet
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [router]);

  // Weekly Friday 8:00 AM WAT Countdown calculation
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 = Sun, 5 = Fri
      const hour = now.getHours();

      // Check if today is Thursday
      const isThu = dayOfWeek === 4;
      // Check if today is Friday (after 8 AM is active match time)
      const isFriActive = dayOfWeek === 5 && hour >= 8;

      const target = new Date();
      let daysUntilFriday = (5 - dayOfWeek + 7) % 7;
      if (daysUntilFriday === 0 && now.getHours() >= 8) {
        daysUntilFriday = 7;
      }

      target.setDate(now.getDate() + daysUntilFriday);
      target.setHours(8, 0, 0, 0);

      const diff = Math.max(0, target.getTime() - now.getTime());
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setCountdown({
        days: String(d).padStart(2, "0"),
        hours: String(h).padStart(2, "0"),
        minutes: String(m).padStart(2, "0"),
        seconds: String(s).padStart(2, "0"),
        isFridayNow: isFriActive,
        isThursday: isThu,
      });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  const displayName = user?.name ? user.name.split(" ")[0] : "there";

  return (
    <>
      <Head>
        <title>{APP_CONFIG.name} | Home</title>
      </Head>

      <NotificationModal />
      <SupportChatModal
        isOpen={supportOpen}
        onClose={() => setSupportOpen(false)}
      />

      <div className="min-h-screen bg-[#000B1A] text-[#F8F9FA] pb-28 md:pb-16">
        {/* Mobile-only Top App Header (Desktop uses PWANavigation top navbar) */}
        <header className="md:hidden sticky top-0 z-30 bg-[#000B1A] border-b border-white/5 px-4 py-3">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-[family-name:var(--font-marker)] text-2xl tracking-wide text-white">
                {APP_CONFIG.name}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFB6C1]" />
            </div>
            <div className="flex items-center gap-1">
              <NotificationCenter />
              <Link
                href="/me"
                aria-label="Settings"
                className="flex items-center justify-center w-9 h-9 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Settings className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-md md:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 md:pt-24 space-y-6">
          {/* Welcome Banner - Intimate & Personal */}
          <div className="space-y-1">
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl tracking-tight text-white">
              Hey, {displayName} 👋
            </h1>
            <p className="font-sans text-sm sm:text-base text-white/60">
              {countdown.isFridayNow ? (
                <>
                  Your <span className="font-[family-name:var(--font-marker)] text-[#FFB6C1] inline-block -rotate-1 font-normal">Friday match</span> is live. Make your move.
                </>
              ) : countdown.isThursday ? (
                <>
                  Tomorrow is <span className="font-[family-name:var(--font-marker)] text-[#FFB6C1] inline-block -rotate-1 font-normal">Match Day</span>. Someone is getting paired with you.
                </>
              ) : (
                <>
                  Your next connection starts here on <span className="font-[family-name:var(--font-marker)] text-[#FFB6C1] inline-block -rotate-1 font-normal">Friday.</span>
                </>
              )}
            </p>
          </div>

          {/* Responsive 2-Column Grid on Larger Screens */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* ─── LEFT COLUMN: Date Spotlight & Weekly Rhythm (7 cols on lg) ─── */}
            <div className="lg:col-span-7 space-y-6">
              {/* Thursday Match Preparation Banner */}
              {countdown.isThursday && !match && (
                <div className="rounded-2xl bg-[#0c1322] p-5 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#FFB6C1]">
                    <Sparkles className="w-4 h-4 text-[#FFB6C1]" />
                    <span>Your Date is Tomorrow</span>
                  </div>
                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-sans">
                    Tomorrow at 8:00 AM WAT, your curated Minglee match will unlock.
                    Get ready for your Friday drop!
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Link
                      href="/events"
                      className="text-xs font-medium bg-white/5 hover:bg-white/10 text-white px-3.5 py-1.5 rounded-full transition-colors"
                    >
                      Find a Campus Event
                    </Link>
                    <Link
                      href="/me"
                      className="text-xs font-medium bg-white/5 hover:bg-white/10 text-white px-3.5 py-1.5 rounded-full transition-colors"
                    >
                      Review Match Preferences
                    </Link>
                  </div>
                </div>
              )}

              {/* THIS WEEK'S DATE - The Main Card */}
              <section aria-labelledby="main-card-heading" className="space-y-2.5">
                <div className="flex items-center justify-between px-0.5">
                  <span
                    id="main-card-heading"
                    className="text-xs font-medium uppercase tracking-wider text-white/50 font-sans"
                  >
                    This Week&apos;s Date
                  </span>
                  <span className="text-xs font-medium text-[#FFB6C1] flex items-center gap-1 font-sans">
                    <Heart className="w-3.5 h-3.5 fill-[#FFB6C1]" />
                    Friday Drop
                  </span>
                </div>

                {match ? (
                  /* ACTIVE FRIDAY MATCH REVEALED CARD */
                  <div className="relative rounded-2xl bg-[#0c1322] overflow-hidden">
                    <div className="relative h-72 sm:h-80 w-full bg-[#141c2e]">
                      {match.partner.photos && match.partner.photos[0] ? (
                        <img
                          src={match.partner.photos[0].image_url}
                          alt={match.partner.name}
                          className="w-full h-full object-cover object-center"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#0c1322]">
                          <Heart className="w-16 h-16 text-white/20" />
                        </div>
                      )}

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0c1322] via-transparent to-black/30" />

                      {/* Compatibility Badge */}
                      <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 rounded-full bg-black/80 px-3 py-1 text-xs font-medium text-white">
                        <Sparkles className="w-3.5 h-3.5 text-[#FFB6C1]" />
                        <span>{match.match_score}% Compatible</span>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6 space-y-3">
                      <div>
                        <h2 className="font-serif text-2xl sm:text-3xl text-white">
                          {match.partner.name}
                          {match.partner.profile?.age && (
                            <span className="text-lg font-sans font-normal text-white/70 ml-2">
                              {match.partner.profile.age}
                            </span>
                          )}
                        </h2>
                        <p className="text-xs sm:text-sm text-white/60 font-sans mt-0.5">
                          {match.partner.profile?.build && (
                            <span>{match.partner.profile.build} build</span>
                          )}
                          {match.partner.profile?.weekend_type && (
                            <span> • {match.partner.profile.weekend_type}</span>
                          )}
                        </p>
                      </div>

                      <Link
                        href="/dates"
                        className="w-full flex items-center justify-center gap-2 rounded-full bg-white text-black py-3 sm:py-3.5 text-sm font-semibold hover:bg-white/90 transition-all active:scale-95"
                      >
                        <span>View My Date Dossier</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  /* PRE-MATCH ANTICIPATION CARD (Clean Mysterious Silhouette) */
                  <div className="relative rounded-2xl bg-[#0c1322] p-6 sm:p-8 overflow-hidden">
                    <div className="flex flex-col items-center text-center space-y-4 py-3">
                      {/* Clean Minimalist Avatar with Padlock */}
                      <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-white/[0.04]">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/[0.06] text-[#FFB6C1]">
                          <Lock className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#FFB6C1]">
                          Your Friday Date
                        </span>
                        <h2 className="font-serif text-2xl sm:text-3xl text-white tracking-tight">
                          Someone is <span className="font-[family-name:var(--font-marker)] text-[#FFB6C1] inline-block -rotate-2 font-normal">waiting...</span>
                        </h2>
                        <p className="text-xs sm:text-sm text-white/50 font-sans">
                          Next drop unlocks Friday at 8:00 AM WAT
                        </p>
                      </div>

                      {/* Countdown Digits */}
                      <div className="grid grid-cols-4 gap-2.5 w-full max-w-sm pt-1">
                        {[
                          { label: "Days", val: countdown.days },
                          { label: "Hours", val: countdown.hours },
                          { label: "Mins", val: countdown.minutes },
                          { label: "Secs", val: countdown.seconds },
                        ].map((c) => (
                          <div
                            key={c.label}
                            className="flex flex-col items-center justify-center py-2.5 px-2 rounded-xl bg-white/[0.04]"
                          >
                            <span className="font-mono text-lg sm:text-xl font-bold text-white tracking-tight">
                              {c.val}
                            </span>
                            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/40 mt-0.5">
                              {c.label}
                            </span>
                          </div>
                        ))}
                      </div>

                      <Link
                        href="/dates"
                        className="w-full max-w-sm flex items-center justify-center gap-2 rounded-full bg-white/10 hover:bg-white/15 text-white py-3 text-sm font-medium transition-colors active:scale-95 mt-1"
                      >
                        <span>View Match Schedule</span>
                        <ChevronRight className="w-4 h-4 text-white/60" />
                      </Link>
                    </div>
                  </div>
                )}
              </section>

              {/* YOUR WEEK - Weekly Rhythm Timeline */}
              <section className="rounded-2xl bg-[#0c1322] p-5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/60 font-sans">
                    Your Week
                  </span>
                  <span className="text-xs text-white/40 font-sans">
                    Weekly Rhythm
                  </span>
                </div>

                {/* Mon - Fri Track */}
                <div className="grid grid-cols-5 gap-2 pt-1">
                  {[
                    { day: "MON", label: "Preferences" },
                    { day: "TUE", label: "Discovery" },
                    { day: "WED", label: "Events" },
                    { day: "THU", label: "Prep" },
                    { day: "FRI", label: "Match", isMatch: true },
                  ].map((item) => (
                    <div
                      key={item.day}
                      className={`flex flex-col items-center justify-center py-3 rounded-xl transition-colors ${
                        item.isMatch
                          ? "bg-white/10 text-[#FFB6C1]"
                          : "bg-white/[0.03] text-white/70"
                      }`}
                    >
                      <span className="text-xs sm:text-sm font-bold font-sans">
                        {item.day}
                      </span>
                      <span className="text-[10px] text-white/40 mt-0.5 truncate px-1">
                        {item.label}
                      </span>
                      {item.isMatch && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FFB6C1] mt-1.5" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-white/60 font-sans">
                  <div className="flex items-center gap-2">
                    <Clock3 className="w-3.5 h-3.5 text-[#FFB6C1]" />
                    <span>Matches arrive every Friday at 8:00 AM</span>
                  </div>
                  <Link
                    href="/dates"
                    className="text-[#FFB6C1] hover:underline font-medium"
                  >
                    Learn more
                  </Link>
                </div>
              </section>
            </div>

            {/* ─── RIGHT COLUMN: Conversations & Events (5 cols on lg) ─── */}
            <div className="lg:col-span-5 space-y-6">
              {/* YOUR CONVERSATIONS - Fast Shortcut */}
              <section className="space-y-2.5">
                <div className="flex items-center justify-between px-0.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/60 font-sans">
                    Your Conversations
                  </span>
                  <Link
                    href="/chats"
                    className="text-xs font-medium text-[#FFB6C1] hover:underline font-sans"
                  >
                    See all
                  </Link>
                </div>

                <div className="space-y-2.5">
                  {/* Current Date Row if exists */}
                  {match ? (
                    <Link
                      href="/chats"
                      className="flex items-center justify-between p-4 rounded-2xl bg-[#0c1322] hover:bg-[#111a2c] transition-colors group"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="relative w-12 h-12 rounded-full bg-white/5 overflow-hidden flex items-center justify-center">
                          {match.partner.photos && match.partner.photos[0] ? (
                            <img
                              src={match.partner.photos[0].image_url}
                              alt={match.partner.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Heart className="w-5 h-5 text-[#FFB6C1]" />
                          )}
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm sm:text-base font-medium text-white">
                              {match.partner.name}
                            </span>
                            <span className="text-[10px] bg-white/10 text-[#FFB6C1] px-1.5 py-0.2 rounded-full font-medium">
                              Friday Match
                            </span>
                          </div>
                          <p className="text-xs text-white/50 truncate max-w-[200px] mt-0.5">
                            Say hi on WhatsApp or view dossier
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                    </Link>
                  ) : null}

                  {/* Minglee Official Support Row */}
                  <button
                    type="button"
                    onClick={() => setSupportOpen(true)}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#0c1322] hover:bg-[#111a2c] transition-colors group text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-white/5 text-[#FFB6C1]">
                        <ShieldCheck className="w-6 h-6" />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm sm:text-base font-medium text-white flex items-center gap-1">
                            <span className="font-[family-name:var(--font-marker)] text-base font-normal text-white">Minglee</span>
                            <span>Support</span>
                          </span>
                          <span className="text-[10px] bg-white/10 text-white/70 px-1.5 py-0.2 rounded-full font-medium">
                            Verified
                          </span>
                        </div>
                        <p className="text-xs text-white/50 mt-0.5">
                          Need help or safety assistance? Tap to chat
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                  </button>
                </div>
              </section>

              {/* NEAR YOU / CAMPUS EVENTS HIGHLIGHT */}
              <section className="space-y-2.5">
                <div className="flex items-center justify-between px-0.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/60 font-sans">
                    Near You • Events
                  </span>
                  <Link
                    href="/events"
                    className="text-xs font-medium text-[#FFB6C1] hover:underline font-sans"
                  >
                    Explore all
                  </Link>
                </div>

                <div className="rounded-2xl bg-[#0c1322] p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-white/10 text-[#FFB6C1]">
                          Selling Fast
                        </span>
                        <span className="text-[10px] text-white/50">Pool Party</span>
                      </div>
                      <h3 className="font-serif text-xl text-white mt-1">
                        WET WARS 2.0
                      </h3>
                      <p className="text-xs text-white/50 mt-0.5">
                        Unilag Guest House, Akoka • 9:00 PM
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="flex items-center gap-1.5 text-xs text-white/60">
                      <Users className="w-3.5 h-3.5 text-[#FFB6C1]" />
                      <span>142 Minglee users attending</span>
                    </div>
                    <Link
                      href="/events/minglee-at-wet-wars"
                      className="text-xs font-medium bg-white/10 hover:bg-white/15 text-white px-4 py-2 rounded-full transition-colors"
                    >
                      View Event →
                    </Link>
                  </div>
                </div>
              </section>

              {/* Members-Only Guarantee Card */}
              <div className="rounded-2xl bg-white/[0.02] p-5 space-y-2 text-xs text-white/60">
                <div className="flex items-center gap-2 text-white font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="flex items-center gap-1.5">
                    <span className="font-[family-name:var(--font-marker)] text-sm font-normal text-white">Minglee</span>
                    <span>Private Circle</span>
                  </span>
                </div>
                <p className="leading-relaxed text-white/50">
                  Every Minglee member is authenticated with active campus credentials. Matches drop every Friday at 8:00 AM WAT.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
