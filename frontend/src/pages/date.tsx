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
  CheckCircle2,
  Bell,
  ArrowRight,
  ShieldCheck,
  Flame,
  UserCheck,
  Settings,
  History,
} from "lucide-react";
import API from "@/api/client";
import { fetchCurrentMatch as fetchCurrentMatchData } from "@/api/matches";
import { useAuthStore } from "@/store/useAuthStore";
import { APP_CONFIG } from "@/config/app";
import PromoBanners from "@/components/ui/PromoBanners";
import NotificationCenter from "@/components/pwa/NotificationCenter";
import { triggerHaptic } from "@/lib/haptics";

interface PartnerProfile {
  id: string;
  name: string;
  whatsapp_number: string | null;
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
  blocked: boolean;
  partner: PartnerProfile;
}

export default function MyDatePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [safetyStatus, setSafetyStatus] = useState("");
  const [momentFeedback, setMomentFeedback] = useState<string | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
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
        setMatchData(await fetchCurrentMatchData<MatchData>(user?.id));
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentMatch();
  }, [router, user?.id]);

  const handleMomentVote = async (rating: string) => {
    if (!matchData) return;
    triggerHaptic("success");
    setFeedbackError("");
    try {
      await API.post(`/matches/${encodeURIComponent(matchData.match_id)}/feedback`, { rating });
      setMomentFeedback(rating);
      setFeedbackSubmitted(true);
      setTimeout(() => setFeedbackSubmitted(false), 4000);
    } catch (error) {
      console.error("Could not submit match feedback:", error);
      setFeedbackError("Could not save your feedback. Please try again.");
    }
  };

  // Countdown to next Friday at 8:00 AM WAT
  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const nextFriday = new Date(now);
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
  const partnerPhotos = (partner?.photos || []).slice(0, 2);

  const cleanWhatsapp = partner?.whatsapp_number?.replace(/[^0-9]/g, "") || "";
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    `Hey ${partner?.name || "there"}! We were paired on Minglee for our Friday date. Excited to meet you! 😊`
  )}`;
  const isBlocked = matchData?.blocked ?? false;

  const submitSafetyAction = async (action: "block" | "report") => {
    if (!partner?.id) return;
    const confirmed = window.confirm(
      action === "block"
        ? `Block ${partner.name}? This won't end your current chat, but it's recorded so you won't be matched together again.`
        : `Report ${partner.name}'s profile or photos for review?`,
    );
    if (!confirmed) return;

    setSafetyStatus("");
    try {
      if (action === "block") {
        await API.post(`/users/${encodeURIComponent(partner.id)}/block`);
        setMatchData((prev) =>
          prev
            ? {
                ...prev,
                blocked: true,
                partner: { ...prev.partner, whatsapp_number: null, photos: [] },
              }
            : prev,
        );
      } else {
        await API.post("/reports", {
          reported_user_id: partner.id,
          reason: "Inappropriate profile photo",
        });
      }
      setSafetyStatus(
        action === "block"
          ? "This member has been blocked."
          : "Your report was sent to the safety team.",
      );
    } catch (error) {
      const responseData = (error as { response?: { data?: unknown } })?.response?.data as
        | { error?: string; details?: unknown }
        | undefined;
      console.error(`Could not ${action} this member:`, responseData ?? error);
      setSafetyStatus(
        responseData?.error ||
          (action === "block"
            ? "Blocking is unavailable until the safety service is connected."
            : "Reporting is unavailable until the safety service is connected."),
      );
    }
  };

  return (
    <>
      <Head>
        <title>{`My Friday Date | ${APP_CONFIG.name}`}</title>
      </Head>

      <div className="min-h-screen bg-[#0a0f1a] text-white flex flex-col selection:bg-pink-500/30">

        {/* Mobile-only Top App Header (Desktop uses PWANavigation top navbar) */}
        <header className="md:hidden sticky top-0 z-30 bg-[#000B1A] border-b border-white/5 px-4 py-3">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/logo-mark.png" alt="" className="h-7 w-7" />
              <span className="font-[family-name:var(--font-marker)] text-2xl tracking-wide text-white">
                {APP_CONFIG.name}
              </span>
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

        <main className="flex-1 mx-auto max-w-5xl w-full px-4 pt-6 md:pt-24 pb-28 md:pb-10 sm:px-6 space-y-6">
          {/* Dual Promotional Banners */}
          <PromoBanners />

          {/* Main Date Section */}
          {loading ? (
            /* SKELETON — avoid flashing the active/waiting card while the match loads */
            <div className="space-y-6 animate-pulse">
              <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-4">
                <div className="space-y-2">
                  <div className="h-3 w-32 rounded-full bg-white/[0.06]" />
                  <div className="h-8 w-56 rounded-full bg-white/[0.06]" />
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-5">
                  <div className="aspect-[3/4] w-full rounded-2xl md:rounded-3xl bg-white/[0.04]" />
                </div>
                <div className="lg:col-span-7">
                  <div className="rounded-2xl bg-[#0c1220] p-6 space-y-4">
                    <div className="h-4 w-1/3 rounded-full bg-white/[0.06]" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-14 rounded-xl bg-white/[0.04]" />
                      ))}
                    </div>
                    <div className="h-12 w-full rounded-full bg-white/[0.06]" />
                  </div>
                </div>
              </div>
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
              </div>

              {/* Match Card Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Photo Gallery Column */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="relative aspect-[3/4] w-full rounded-2xl md:rounded-3xl overflow-hidden bg-[#1a1a1a]">
                    {partnerPhotos[activePhotoIdx]?.image_url ? (
                      <img
                        src={partnerPhotos[activePhotoIdx].image_url}
                        alt={partner.name}
                        className="h-full w-full object-cover transition-all duration-500"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-white/35">
                        <Heart className="h-12 w-12" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-5">
                      <h2 className="text-2xl font-serif text-white">{partner.name}, {partner.profile?.age || 21}</h2>
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

                    {/* Chat Action Buttons */}
                    {isBlocked ? (
                      <div className="pt-2 rounded-xl bg-white/[0.04] p-4 text-center">
                        <p className="text-sm text-white/60">
                          You've blocked this member. You can no longer message each other.
                        </p>
                      </div>
                    ) : (
                      <div className="pt-2 flex gap-2.5">
                        <Link
                          href="/chats"
                          className="h-12 flex-1 cursor-pointer rounded-full bg-[#FFB6C1] hover:bg-[#ffc4cd] text-[#1a0a10] font-sans font-semibold text-sm transition-colors active:scale-[0.98] flex items-center justify-center gap-2.5"
                        >
                          <MessageCircle className="w-5 h-5" />
                          <span>Message in Minglee</span>
                        </Link>
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Say hello on WhatsApp"
                          className="h-12 w-12 shrink-0 cursor-pointer rounded-full bg-emerald-600 hover:bg-emerald-500 text-white transition-colors active:scale-[0.98] flex items-center justify-center"
                        >
                          <MessageCircle className="w-5 h-5 fill-current" />
                        </a>
                      </div>
                    )}
                    <div className="pt-0">
                      {!isBlocked && (
                        <p className="text-[11px] text-center text-white/40 mt-2">
                          Matches persist throughout the week so you can plan your date at your own pace.
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => submitSafetyAction("report")}
                          className="rounded-full bg-white/5 px-3 py-2 text-xs text-white/70 hover:bg-white/10"
                        >
                          Report profile/photo
                        </button>
                        <button
                          type="button"
                          onClick={() => submitSafetyAction("block")}
                          disabled={isBlocked}
                          className="rounded-full bg-red-500/10 px-3 py-2 text-xs text-red-200 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isBlocked ? "Blocked" : "Block member"}
                        </button>
                      </div>
                      {safetyStatus && (
                        <p role="status" className="pt-1 text-center text-xs text-amber-200">
                          {safetyStatus}
                        </p>
                      )}
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

          {/* MINGLEE MOMENTS - Post-Date Feedback */}
          {!loading && matchData && (
            <div className="rounded-2xl bg-[#0c1322] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/60 flex items-center gap-1.5">
                  <span className="font-[family-name:var(--font-marker)] text-sm tracking-normal capitalize text-[#FFB6C1] font-normal">Minglee</span>
                  <span>Moments</span>
                </span>
                <span className="text-[10px] text-white/40">Feedback Loop</span>
              </div>
              <p className="text-xs text-white/70">
                How did your date with {matchData.partner.name} go? Your feedback refines future pairings.
              </p>

              {feedbackSubmitted ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Thank you! Feedback recorded for your next Friday drop.</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300">Good</p>
                    {[
                      { key: "loved", label: "❤️ Loved it" },
                      { key: "nice", label: "🙂 It was nice" },
                    ].map((btn) => (
                      <button
                        key={btn.key}
                        type="button"
                        onClick={() => handleMomentVote(btn.key)}
                        className={`w-full rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors cursor-pointer ${
                          momentFeedback === btn.key
                            ? "bg-emerald-500/20 text-white"
                            : "bg-white/[0.04] text-white/80 hover:bg-white/[0.08]"
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-300">Could be better</p>
                    {[
                      { key: "neutral", label: "😐 Didn't click" },
                      { key: "uncomfortable", label: "👎 Uncomfortable" },
                    ].map((btn) => (
                      <button
                        key={btn.key}
                        type="button"
                        onClick={() => handleMomentVote(btn.key)}
                        className={`w-full rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors cursor-pointer ${
                          momentFeedback === btn.key
                            ? "bg-rose-500/20 text-white"
                            : "bg-white/[0.04] text-white/80 hover:bg-white/[0.08]"
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {feedbackError && (
                <p role="alert" className="text-xs text-amber-200">{feedbackError}</p>
              )}
            </div>
          )}

          {/* PAST DATES ARCHIVE */}
          <div className="rounded-2xl border border-white/10 bg-[#0c1322] p-8 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
              <History className="h-4 w-4 text-white/40" />
            </div>
            <p className="font-serif text-lg text-white">Past dates</p>
            <p className="mt-1.5 text-xs text-white/40">
              Your match history will appear here once you've had a few Friday dates.
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
