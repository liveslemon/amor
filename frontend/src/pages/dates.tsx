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
import { useAuthStore } from "@/store/useAuthStore";
import { APP_CONFIG } from "@/config/app";

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

interface PastMatchRecord {
  id: string;
  name: string;
  date: string;
  score: number;
  photoUrl: string;
  relationship_goal: string;
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

  // Fallback / archived past dates for demonstration and history
  const [pastMatches, setPastMatches] = useState<PastMatchRecord[]>([
    {
      id: "pm1",
      name: "Emily",
      date: "Aug 28, 2026",
      score: 82,
      photoUrl:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
      relationship_goal: "Long-term",
    },
    {
      id: "pm2",
      name: "Grace",
      date: "Aug 21, 2026",
      score: 76,
      photoUrl:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80",
      relationship_goal: "Marriage bound",
    },
  ]);

  const [selectedPastMatch, setSelectedPastMatch] =
    useState<PastMatchRecord | null>(null);

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
        const res = await API.get("/matches/current");
        if (res.data?.match) {
          setMatchData(res.data.match);
        }
      } catch (err) {
        console.warn("No active match:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrent();
  }, [router]);

  const handleWhatsAppChat = () => {
    if (!matchData?.partner?.whatsapp_number) return;
    const cleanNumber = matchData.partner.whatsapp_number.replace("+", "");
    const text = encodeURIComponent(
      `Hey ${matchData.partner.name}! I got you as my Friday match on Minglee 😊`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, "_blank");
  };

  const handleMomentVote = (rating: string) => {
    setMomentFeedback(rating);
    setFeedbackSubmitted(true);
    setTimeout(() => {
      setFeedbackSubmitted(false);
    }, 4000);
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
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {[
                      { key: "loved", label: "❤️ Loved it" },
                      { key: "nice", label: "🙂 It was nice" },
                      { key: "neutral", label: "😐 Didn't click" },
                      { key: "block", label: "🚫 Do not pair again" },
                    ].map((btn) => (
                      <button
                        key={btn.key}
                        onClick={() => handleMomentVote(btn.key)}
                        className={`py-2 px-3 rounded-xl text-xs font-medium text-left transition-colors ${
                          momentFeedback === btn.key
                            ? "bg-white/20 text-white font-semibold"
                            : "bg-white/[0.04] text-white/80 hover:bg-white/[0.08]"
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PAST DATES ARCHIVE */}
          {activeTab === "past" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  Historical Matches
                </span>
                <span className="text-xs text-white/40">
                  {pastMatches.length} past dates
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastMatches.map((pm) => (
                  <div
                    key={pm.id}
                    onClick={() => setSelectedPastMatch(pm)}
                    className="flex items-center justify-between p-4 rounded-2xl bg-[#0c1322] hover:bg-[#111a2c] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5">
                      <img
                        src={pm.photoUrl}
                        alt={pm.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-base text-white">
                            {pm.name}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                            {pm.relationship_goal}
                          </span>
                        </div>
                        <p className="text-xs text-white/40 mt-0.5">
                          {pm.date} • {pm.score}% compatible
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                  </div>
                ))}
              </div>

              {/* Past Match Detail Modal */}
              {selectedPastMatch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
                  <div className="w-full max-w-md rounded-2xl bg-[#0c1322] p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase text-white/50">
                        Past Match Archive
                      </span>
                      <button
                        onClick={() => setSelectedPastMatch(null)}
                        className="text-xs text-white/60 hover:text-white cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                    <img
                      src={selectedPastMatch.photoUrl}
                      alt={selectedPastMatch.name}
                      className="w-full h-64 rounded-2xl object-cover"
                    />
                    <div className="space-y-1">
                      <h3 className="font-serif text-2xl text-white">
                        {selectedPastMatch.name}
                      </h3>
                      <p className="text-xs text-white/60">
                        Matched on {selectedPastMatch.date} •{" "}
                        {selectedPastMatch.score}% compatibility score
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedPastMatch(null)}
                      className="w-full rounded-full bg-white/10 hover:bg-white/15 text-white py-2.5 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
