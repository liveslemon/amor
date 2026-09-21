import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
  Heart,
  Sparkles,
  Calendar,
  MessageCircle,
  Clock3,
  MapPin,
  CheckCircle2,
  Bell,
  ArrowRight,
  ShieldCheck,
  Flame,
  UserCheck,
} from "lucide-react";
import API from "@/api/client";
import { useAuthStore } from "@/store/useAuthStore";
import { APP_CONFIG } from "@/config/app";
import PromoBanners from "@/components/ui/PromoBanners";
import NotificationCenter from "@/components/pwa/NotificationCenter";
import NotificationModal from "@/components/pwa/NotificationModal";

interface PartnerProfile {
  id: string;
  name: string;
  whatsapp_number: string;
  profile: {
    age?: number;
    height?: number;
    build?: string;
    gender?: string;
    skin_tone?: string;
    social_persona?: string;
    weekend_type?: string;
    conflict_style?: string;
    relationship_goal?: string;
    instagram?: string;
  };
  photos: Array<{
    image_url: string;
    photo_type?: string;
    upload_order?: number;
  }>;
  focuses: string[];
}

interface MatchData {
  match_id: string;
  match_score: number;
  match_week: string;
  status: string;
  partner: PartnerProfile;
}

export default function MyDatePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ days: "00", hours: "00", minutes: "00", seconds: "00" });

  useEffect(() => {
    // Check auth
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("mingle_token") || localStorage.getItem("mingle_access_token");
      if (!token) {
        router.replace("/login");
        return;
      }
    }

    const fetchCurrentMatch = async () => {
      try {
        setLoading(true);
        const res = await API.get("/matches/current");
        if (res.data?.match) {
          setMatchData(res.data.match);
        }
      } catch (err) {
        console.warn("No active match or error loading match:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentMatch();
  }, [router]);

  // Countdown to next Friday at 8:00 AM WAT
  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const nextFriday = new Date();
      const currentDay = now.getDay();
      const daysUntilFriday = (5 - currentDay + 7) % 7;

      nextFriday.setDate(now.getDate() + daysUntilFriday);
      nextFriday.setHours(8, 0, 0, 0);

      if (daysUntilFriday === 0 && now.getHours() >= 8) {
        nextFriday.setDate(nextFriday.getDate() + 7);
      }

      const diff = Math.max(0, nextFriday.getTime() - now.getTime());
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({
        days: days.toString().padStart(2, "0"),
        hours: hours.toString().padStart(2, "0"),
        minutes: minutes.toString().padStart(2, "0"),
        seconds: seconds.toString().padStart(2, "0"),
      });
    };

    calculateCountdown();
    const timer = setInterval(calculateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  const partner = matchData?.partner;
  const partnerPhotos = partner?.photos && partner.photos.length > 0
    ? partner.photos
    : [{ image_url: "/assets/pexels-ketut-subiyanto-4350099.webp" }];

  const cleanWhatsapp = partner?.whatsapp_number?.replace(/[^0-9]/g, "") || "";
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    `Hey ${partner?.name || "there"}! We were paired on Minglee for our Friday date. Excited to meet you! 😊`
  )}`;

  return (
    <>
      <Head>
        <title>{`My Friday Date | ${APP_CONFIG.name}`}</title>
      </Head>

      <div className="min-h-screen bg-[#0a0f1a] text-white flex flex-col selection:bg-pink-500/30">
        <NotificationModal />

        {/* In-App Header */}
        <header className="sticky top-0 z-40 border-b border-white/5 bg-[#000B1A]">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
            <Link href="/home" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white">
                <Heart className="h-4 w-4 text-[#FFB6C1]" />
              </div>
              <span className="text-lg font-semibold tracking-[0.14em] font-serif">
                {APP_CONFIG.name.toUpperCase()}
              </span>
            </Link>

            <nav className="flex items-center gap-2 text-sm text-slate-200">
              <Link
                href="/dates"
                className="rounded-full px-3.5 py-1.5 bg-white/10 text-white font-medium flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FFB6C1]" />
                <span>My Date</span>
              </Link>
              <Link
                href="/events"
                className="rounded-full px-3.5 py-1.5 hover:bg-white/5 transition-colors"
              >
                Events
              </Link>
              <NotificationCenter />
              <button
                type="button"
                onClick={() => {
                  logout();
                  window.location.href = "/login";
                }}
                className="text-xs text-white/50 hover:text-white px-2 py-1 transition-colors cursor-pointer"
              >
                Log Out
              </button>
            </nav>
          </div>
        </header>

        <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-6 sm:px-6 space-y-6">
          {/* Dual Promotional Banners */}
          <PromoBanners />

          {/* Main Date Section */}
          {loading ? (
            <div className="py-24 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-white/40 border-t-transparent mb-3" />
              <p className="text-sm text-white/50">Retrieving your Friday date...</p>
            </div>
          ) : matchData && partner ? (
            /* ACTIVE DATE VIEW */
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <span className="text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-emerald-400">
                      Active Friday Match
                    </span>
                  </div>
                  <h1 className="font-serif text-3xl sm:text-4xl text-white tracking-tight mt-1">
                    Meet Your Date,{" "}
                    <span className="font-[family-name:var(--font-marker)] text-[#FFB6C1] inline-block -rotate-2 font-normal">
                      {partner.name}
                    </span>
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-black/80 px-3.5 py-1 text-xs font-semibold text-white">
                    {matchData.match_score}% Compatibility
                  </div>
                </div>
              </div>

              {/* Match Card Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Photo Gallery Column */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="relative aspect-[3/4] w-full rounded-2xl md:rounded-3xl overflow-hidden bg-[#1a1a1a]">
                    <img
                      src={partnerPhotos[activePhotoIdx]?.image_url}
                      alt={partner.name}
                      className="h-full w-full object-cover transition-all duration-500"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-5">
                      <h2 className="text-2xl font-serif text-white">{partner.name}, {partner.profile?.age || 21}</h2>
                      <p className="text-xs text-white/70 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#FFB6C1]" />
                        <span>Pan-Atlantic University Campus</span>
                      </p>
                    </div>
                  </div>

                  {partnerPhotos.length > 1 && (
                    <div className="flex gap-2">
                      {partnerPhotos.map((photo, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setActivePhotoIdx(i)}
                          className={`relative h-16 w-16 rounded-xl overflow-hidden transition-all cursor-pointer ${
                            activePhotoIdx === i ? "ring-2 ring-white" : "opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img src={photo.image_url} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Details & WhatsApp Connect Column */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="rounded-2xl bg-[#0c1220] p-6 space-y-5">
                    <div>
                      <h3 className="text-xs uppercase tracking-[0.18em] font-medium text-white/50 mb-2">
                        About {partner.name}
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {partner.profile?.height && (
                          <div className="rounded-xl bg-white/[0.04] p-2.5">
                            <span className="text-[10px] text-white/40 block">Height</span>
                            <span className="text-sm font-medium text-white">{partner.profile.height} cm</span>
                          </div>
                        )}
                        {partner.profile?.build && (
                          <div className="rounded-xl bg-white/[0.04] p-2.5">
                            <span className="text-[10px] text-white/40 block">Build</span>
                            <span className="text-sm font-medium text-white">{partner.profile.build}</span>
                          </div>
                        )}
                        {partner.profile?.relationship_goal && (
                          <div className="rounded-xl bg-white/[0.04] p-2.5">
                            <span className="text-[10px] text-white/40 block">Looking for</span>
                            <span className="text-sm font-medium text-white">{partner.profile.relationship_goal}</span>
                          </div>
                        )}
                        {partner.profile?.weekend_type && (
                          <div className="rounded-xl bg-white/[0.04] p-2.5">
                            <span className="text-[10px] text-white/40 block">Weekend Vibe</span>
                            <span className="text-sm font-medium text-white">{partner.profile.weekend_type}</span>
                          </div>
                        )}
                        {partner.profile?.social_persona && (
                          <div className="rounded-xl bg-white/[0.04] p-2.5">
                            <span className="text-[10px] text-white/40 block">Social Persona</span>
                            <span className="text-sm font-medium text-white">{partner.profile.social_persona}</span>
                          </div>
                        )}
                        {partner.profile?.conflict_style && (
                          <div className="rounded-xl bg-white/[0.04] p-2.5">
                            <span className="text-[10px] text-white/40 block">Communication</span>
                            <span className="text-sm font-medium text-white">{partner.profile.conflict_style}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {partner.focuses && partner.focuses.length > 0 && (
                      <div>
                        <h3 className="text-xs uppercase tracking-[0.18em] font-medium text-white/50 mb-2">
                          Campus Focus
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {partner.focuses.map((f, i) => (
                            <span
                              key={i}
                              className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/90"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Date Icebreaker Card */}
                    <div className="rounded-xl bg-white/[0.04] p-4">
                      <div className="flex items-center gap-2 mb-1 text-[#FFB6C1]">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Suggested Date Icebreaker</span>
                      </div>
                      <p className="text-xs sm:text-sm text-white/80 italic leading-relaxed">
                        &ldquo;Hey! We both value {partner.focuses?.[0] || "good vibes"}. What is your favorite hangout spot on campus on Friday evenings?&rdquo;
                      </p>
                    </div>

                    {/* WhatsApp Action Button */}
                    <div className="pt-2">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-12 w-full cursor-pointer rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-semibold text-sm transition-colors active:scale-[0.98] flex items-center justify-center gap-2.5"
                      >
                        <MessageCircle className="w-5 h-5 fill-current" />
                        <span>Say Hello on WhatsApp</span>
                      </a>
                      <p className="text-[11px] text-center text-white/40 mt-2">
                        Matches persist throughout the week so you can plan your date at your own pace.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* WAITING FOR NEXT DROP VIEW */
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl bg-[#0c1220] p-6 sm:p-10 text-center space-y-6"
            >
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.04] text-[#FFB6C1]">
                <Clock3 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-[#FFB6C1]">
                  Weekly Match Cycle
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl text-white tracking-tight mt-1">
                  Your Friday Date Drop Is{" "}
                  <span className="font-[family-name:var(--font-marker)] text-[#FFB6C1] inline-block -rotate-2 font-normal">
                    Brewing
                  </span>
                </h2>
                <p className="mt-2 max-w-md mx-auto text-sm text-white/60 leading-relaxed">
                  Our matchmaking algorithm is reviewing student preferences. Your curated date drops every Friday at 8:00 AM WAT.
                </p>
              </div>

              {/* Countdown Timer */}
              <div className="inline-flex items-center gap-3 sm:gap-6 bg-white/[0.04] px-6 py-4 rounded-2xl">
                <div className="text-center">
                  <span className="font-[family-name:var(--font-marker)] text-3xl sm:text-4xl text-white block">
                    {timeLeft.days}
                  </span>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-sans">Days</span>
                </div>
                <span className="text-white/20 text-2xl font-light">:</span>
                <div className="text-center">
                  <span className="font-[family-name:var(--font-marker)] text-3xl sm:text-4xl text-white block">
                    {timeLeft.hours}
                  </span>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-sans">Hours</span>
                </div>
                <span className="text-white/20 text-2xl font-light">:</span>
                <div className="text-center">
                  <span className="font-[family-name:var(--font-marker)] text-3xl sm:text-4xl text-white block">
                    {timeLeft.minutes}
                  </span>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-sans">Minutes</span>
                </div>
                <span className="text-white/20 text-2xl font-light">:</span>
                <div className="text-center">
                  <span className="font-[family-name:var(--font-marker)] text-3xl sm:text-4xl text-white block">
                    {timeLeft.seconds}
                  </span>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-sans">Seconds</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/events">
                  <button
                    type="button"
                    className="h-11 cursor-pointer rounded-full bg-white px-6 font-sans text-sm font-semibold text-[#0a0f1a] transition-all hover:bg-white/90 active:scale-[0.98]"
                  >
                    Browse Campus Events
                  </button>
                </Link>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </>
  );
}
