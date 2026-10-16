"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Heart,
  Sparkles,
  Lock,
  Calendar,
  MessageCircle,
  Clock3,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Flame,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import API from "@/api/client";
import { fetchCurrentMatch } from "@/api/matches";
import { useAuthStore } from "@/store/useAuthStore";
import { APP_CONFIG } from "@/config/app";
import { triggerHaptic } from "@/lib/haptics";

interface PartnerProfile {
  id: string;
  name: string;
  whatsapp_number: string;
  profile?: {
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
  photos?: Array<{
    image_url: string;
    photo_type?: string;
    upload_order?: number;
  }>;
  focuses?: string[];
}

interface MatchData {
  match_id: string;
  match_score: number;
  match_week: string;
  status: string;
  partner: PartnerProfile;
}

export default function DatesPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [activeTab, setActiveTab] = useState<"current" | "past">("current");
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [momentFeedback, setMomentFeedback] = useState<string | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");

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

    const fetchCurrent = async () => {
      try {
        setLoading(true);
        setMatchData(await fetchCurrentMatch<MatchData>(user?.id));
      } finally {
        setLoading(false);
      }
    };

    fetchCurrent();
  }, [router, user?.id]);

  const handleWhatsAppChat = () => {
    triggerHaptic("medium");
    if (!matchData?.partner?.whatsapp_number) return;
    const cleanNumber = matchData.partner.whatsapp_number.replace("+", "");
    const text = encodeURIComponent(
      `Hey ${matchData.partner.name}! I got you as my Friday match on Minglee 😊`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, "_blank");
  };

  const handleMomentVote = async (rating: string) => {
    if (!matchData) return;
    triggerHaptic("success");
    setFeedbackError("");
    try {
      await API.post(
        `/matches/${encodeURIComponent(matchData.match_id)}/feedback`,
        { rating },
      );
      setMomentFeedback(rating);
      setFeedbackSubmitted(true);
      setTimeout(() => setFeedbackSubmitted(false), 4000);
    } catch (error) {
      console.error("Could not submit match feedback:", error);
      setFeedbackError("Date reviews are not connected to the backend yet.");
    }
  };

  return (
    <>
      <Head>
        <title>{APP_CONFIG.name} | Your Dates</title>
      </Head>

      <div className="min-h-screen bg-[#000B1A] text-[#F8F9FA] pb-28 md:pb-16">
        {/* Mobile Header (Desktop uses PWANavigation top navbar) */}
        <header className="md:hidden sticky top-0 z-30 bg-[#000B1A] border-b border-white/5 px-4 py-3.5">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <h1 className="font-serif text-xl tracking-tight text-white">
              Your Dates
            </h1>
            <span className="text-xs font-sans text-white/40">
              Weekly Connections
            </span>
          </div>
        </header>

        <main className="max-w-md md:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-24 space-y-6">
          {/* Desktop Title & Subtitle */}
          <div className="hidden md:flex items-center justify-between">
            <div>
              <h1 className="font-serif text-3xl lg:text-4xl text-white tracking-tight">
                Your Dates
              </h1>
              <p className="text-sm text-white/60 mt-0.5">
                Curated Friday pairings, partner dossiers, and connection feedback.
              </p>
            </div>
            {/* Desktop Segmented Tab Switcher */}
            <div className="flex p-1 rounded-full bg-white/[0.04] w-72">
              <button
                onClick={() => setActiveTab("current")}
                className={`flex-1 py-2 text-xs font-medium rounded-full transition-colors cursor-pointer ${
                  activeTab === "current"
                    ? "bg-white/15 text-white"
                    : "text-white/50 hover:text-white"
                }`}
              >
                CURRENT DATE
              </button>
              <button
                onClick={() => setActiveTab("past")}
                className={`flex-1 py-2 text-xs font-medium rounded-full transition-colors cursor-pointer ${
                  activeTab === "past"
                    ? "bg-white/15 text-white"
                    : "text-white/50 hover:text-white"
                }`}
              >
                PAST DATES
              </button>
            </div>
          </div>

          {/* Mobile Segmented Tab Switcher */}
          <div className="md:hidden flex p-1 rounded-full bg-white/[0.04]">
            <button
              onClick={() => setActiveTab("current")}
              className={`flex-1 py-2 text-xs font-medium rounded-full transition-colors ${
                activeTab === "current"
                  ? "bg-white/15 text-white"
                  : "text-white/50 hover:text-white"
              }`}
            >
              CURRENT DATE
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`flex-1 py-2 text-xs font-medium rounded-full transition-colors ${
                activeTab === "past"
                  ? "bg-white/15 text-white"
                  : "text-white/50 hover:text-white"
              }`}
            >
              PAST DATES
            </button>
          </div>

          {/* TAB 1: CURRENT DATE */}
          {activeTab === "current" && (
            <div className="space-y-6">
              {matchData ? (
                /* Active Match Dossier */
                <div className="rounded-2xl bg-[#0c1322] overflow-hidden grid grid-cols-1 md:grid-cols-12 items-stretch">
                  {/* Photos Carousel Column */}
                  <div className="md:col-span-5 relative min-h-[340px] md:min-h-[460px] bg-[#141c2e]">
                    {matchData.partner.photos &&
                    matchData.partner.photos.length > 0 ? (
                      <img
                        src={
                          matchData.partner.photos[activePhotoIdx]?.image_url ||
                          matchData.partner.photos[0].image_url
                        }
                        alt={matchData.partner.name}
                        className="w-full h-full object-cover object-center transition-all duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#141c2e]">
                        <Heart className="w-16 h-16 text-white/20" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c1322] via-transparent to-black/40 pointer-events-none" />

                    {/* Photo Dots */}
                    {matchData.partner.photos &&
                      matchData.partner.photos.length > 1 && (
                        <div className="absolute top-3 inset-x-0 flex justify-center gap-1.5 z-10">
                          {matchData.partner.photos.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setActivePhotoIdx(idx)}
                              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                activePhotoIdx === idx
                                  ? "w-6 bg-white"
                                  : "w-1.5 bg-white/40"
                              }`}
                            />
                          ))}
                        </div>
                      )}

                    {/* Compatibility Pill */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-black/80 px-3 py-1 text-xs font-medium text-white">
                      <Sparkles className="w-3.5 h-3.5 text-[#FFB6C1]" />
                      <span>{matchData.match_score}% Compatible</span>
                    </div>
                  </div>

                  {/* Profile Details Column */}
                  <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-5">
                    <div>
                      <div className="flex items-center justify-between">
                        <h2 className="font-serif text-2xl text-white">
                          {matchData.partner.name}
                          {matchData.partner.profile?.age && (
                            <span className="text-xl font-sans font-normal text-white/70 ml-2">
                              {matchData.partner.profile.age}
                            </span>
                          )}
                        </h2>
                        <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      </div>
                      <p className="text-xs text-white/60 font-sans mt-1">
                        {matchData.partner.profile?.gender || "Student"} •{" "}
                        {matchData.partner.profile?.build || "Athletic"} build •{" "}
                        {matchData.partner.profile?.relationship_goal ||
                          "Long-term"}
                      </p>
                    </div>

                    {/* Personality & Lifestyle Tags */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                        Vibe & Psychology
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {matchData.partner.profile?.conflict_style && (
                          <span className="text-xs px-3 py-1 rounded-full bg-white/5 text-white/80">
                            💬 {matchData.partner.profile.conflict_style}
                          </span>
                        )}
                        {matchData.partner.profile?.weekend_type && (
                          <span className="text-xs px-3 py-1 rounded-full bg-white/5 text-white/80">
                            ✨ {matchData.partner.profile.weekend_type}
                          </span>
                        )}
                        {matchData.partner.profile?.social_persona && (
                          <span className="text-xs px-3 py-1 rounded-full bg-white/5 text-white/80">
                            🎉 {matchData.partner.profile.social_persona}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Focuses */}
                    {matchData.partner.focuses &&
                      matchData.partner.focuses.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-white/5">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                            Life Priorities
                          </span>
                          <div className="space-y-1">
                            {matchData.partner.focuses.map((f, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-2 text-xs text-white/75"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-[#FFB6C1]" />
                                <span>{f}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* CTA Actions */}
                    <div className="pt-2 space-y-2">
                      <button
                        onClick={handleWhatsAppChat}
                        className="w-full flex items-center justify-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 text-sm font-medium transition-colors active:scale-95 cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Chat on WhatsApp</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Inactive Match Teaser */
                <div className="rounded-2xl bg-[#0c1322] p-8 text-center space-y-4">
                  <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white/[0.04] mx-auto text-[#FFB6C1]">
                    <Lock className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#FFB6C1]">
                      Current Date
                    </span>
                    <h2 className="font-serif text-2xl text-white">
                      No active date yet
                    </h2>
                    <p className="text-xs text-white/50 max-w-xs mx-auto leading-relaxed">
                      Your curated Minglee date arrives every Friday at 8:00 AM
                      WAT. Make sure your preferences are up to date!
                    </p>
                  </div>
                  <div className="pt-2">
                    <Link
                      href="/home"
                      className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/15 text-white px-5 py-2.5 text-xs font-medium transition-colors"
                    >
                      <span>Check Countdown on Home</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}

              {/* MINGLEE MOMENTS - Post-Date Interaction */}
              <div className="rounded-2xl bg-[#0c1322] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/60 flex items-center gap-1.5">
                    <span className="font-[family-name:var(--font-marker)] text-sm tracking-normal capitalize text-[#FFB6C1] font-normal">Minglee</span>
                    <span>Moments</span>
                  </span>
                  <span className="text-[10px] text-white/40">
                    Feedback Loop
                  </span>
                </div>
                <p className="text-xs text-white/70">
                  How did your recent match go? Your feedback refines future
                  pairings.
                </p>

                {feedbackSubmitted ? (
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Thank you! Feedback recorded for your next Friday drop.
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                        Good
                      </p>
                      {[
                        { key: "loved", label: "❤️ Loved it" },
                        { key: "nice", label: "🙂 It was nice" },
                      ].map((btn) => (
                        <button
                          key={btn.key}
                          onClick={() => handleMomentVote(btn.key)}
                          className={`w-full rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors ${
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
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-300">
                        Could be better
                      </p>
                      {[
                        { key: "neutral", label: "😐 Didn't click" },
                        { key: "uncomfortable", label: "👎 Uncomfortable" },
                      ].map((btn) => (
                        <button
                          key={btn.key}
                          onClick={() => handleMomentVote(btn.key)}
                          className={`w-full rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors ${
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
                  <p role="alert" className="text-xs text-amber-200">
                    {feedbackError}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PAST DATES ARCHIVE */}
          {activeTab === "past" && (
            <div className="rounded-2xl bg-[#0c1322] p-8 text-center">
              <p className="font-serif text-xl text-white">Your date archive</p>
              <p className="mt-2 text-sm text-white/50">
                Past dates will appear here when match history is available.
              </p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
