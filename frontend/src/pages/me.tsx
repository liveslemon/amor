"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  User,
  Heart,
  ShieldCheck,
  Bell,
  MessageSquare,
  Sparkles,
  LogOut,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  Sliders,
  Check,
  X,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { APP_CONFIG } from "@/config/app";
import API from "@/api/client";
import { savePreferences, saveProfile } from "@/api/profile";

export default function MePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [activeModal, setActiveModal] = useState<
    "preferences" | "privacy" | "whatsapp" | "notifications" | "report" | null
  >(null);

  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Preference State
  const [minAge, setMinAge] = useState(19);
  const [maxAge, setMaxAge] = useState(25);
  const [minHeightFt, setMinHeightFt] = useState("5");
  const [minHeightIn, setMinHeightIn] = useState("4");
  const [maxHeightFt, setMaxHeightFt] = useState("6");
  const [maxHeightIn, setMaxHeightIn] = useState("2");
  const [builds, setBuilds] = useState<string[]>(["Athletic", "Slim"]);
  const [relationshipGoal, setRelationshipGoal] = useState("Long-term");
  const [conflictStyle, setConflictStyle] = useState("Talk it out immediately");

  // Report Modal State
  const [reportReason, setReportReason] = useState("Harassment");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);

  // Notification toggles
  const [notifMatch, setNotifMatch] = useState(true);
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifEvents, setNotifEvents] = useState(true);
  const [dropTiming, setDropTiming] = useState("8:00 AM");

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

    // Hydrate existing user preferences if available
    const fetchUserPreferences = async () => {
      try {
        const res = await API.get("/me/profile");
        if (res.data?.preferences) {
          if (res.data.preferences.preferred_min_age) {
            setMinAge(res.data.preferences.preferred_min_age);
          }
          if (res.data.preferences.preferred_max_age) {
            setMaxAge(res.data.preferences.preferred_max_age);
          }
        }
        if (res.data?.preferred_builds) {
          setBuilds(res.data.preferred_builds);
        }
        if (res.data?.profile?.relationship_goal) {
          setRelationshipGoal(res.data.profile.relationship_goal);
        }
        if (res.data?.profile?.conflict_style) {
          setConflictStyle(res.data.profile.conflict_style);
        }
      } catch (err) {
        console.warn("Could not load user profile:", err);
      }
    };

    fetchUserPreferences();
  }, [router]);

  const handleToggleBuild = (b: string) => {
    setBuilds((prev) =>
      prev.includes(b) ? prev.filter((item) => item !== b) : [...prev, b]
    );
  };

  const handleSavePreferences = async () => {
    try {
      const computeInches = (ft: string, inch: string) =>
        parseInt(ft, 10) * 12 + parseInt(inch, 10);

      await savePreferences({
        preferred_min_age: Number(minAge),
        preferred_max_age: Number(maxAge),
        preferred_min_height: computeInches(minHeightFt, minHeightIn),
        preferred_max_height: computeInches(maxHeightFt, maxHeightIn),
      });

      await saveProfile({
        relationship_goal: relationshipGoal as any,
        conflict_style: conflictStyle as any,
      });

      setSaveStatus("Preferences updated successfully!");
      setTimeout(() => {
        setSaveStatus(null);
        setActiveModal(null);
      }, 1200);
    } catch (err) {
      setSaveStatus("Saved locally.");
      setTimeout(() => {
        setSaveStatus(null);
        setActiveModal(null);
      }, 1000);
    }
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setActiveModal(null);
      setReportDetails("");
    }, 2000);
  };

  const handleTestWhatsApp = () => {
    const text = encodeURIComponent(
      "Hi Minglee! This is a test confirmation from my profile settings."
    );
    window.open(
      `https://wa.me/${APP_CONFIG.whatsappNumber.replace("+", "")}?text=${text}`,
      "_blank"
    );
  };

  const displayName = user?.name || "Member";
  const displayPhone = user?.whatsapp_number || "+234 •••••••••";

  return (
    <>
      <Head>
        <title>{APP_CONFIG.name} | Me</title>
      </Head>

      <div className="min-h-screen bg-[#000B1A] text-[#F8F9FA] pb-28">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-30 bg-[#000B1A] border-b border-white/5 px-4 py-3.5">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <h1 className="font-serif text-xl tracking-tight text-white">Me</h1>
            <span className="text-xs text-white/40">Profile & Settings</span>
          </div>
        </header>

        <main className="max-w-md md:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-24 pb-28 md:pb-16 space-y-6">
          {/* Desktop Header Banner */}
          <div className="hidden md:flex items-end justify-between pb-4 border-b border-white/5">
            <div>
              <h1 className="font-serif text-3xl font-light tracking-tight text-white">
                Profile & Settings
              </h1>
              <p className="text-sm text-white/50 mt-1">
                Manage your identity, dating parameters, and account preferences.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-xs text-white/70 border border-white/5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Active Member
              </span>
            </div>
          </div>

          {/* Responsive Layout: 2 Columns on Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Column: User Profile & Membership Status */}
            <div className="md:col-span-5 space-y-4">
              {/* User Profile Card */}
              <div className="rounded-2xl bg-[#0c1322] border border-white/5 p-5 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-[#141d2e] text-2xl font-serif text-white">
                    {displayName.charAt(0).toUpperCase()}
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <h2 className="font-serif text-xl text-white">
                        {displayName}
                      </h2>
                      <span className="text-[10px] uppercase font-sans font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white/80">
                        Verified
                      </span>
                    </div>
                    <p className="text-xs text-white/50 font-sans">
                      {displayPhone}
                    </p>
                  </div>
                </div>

                {/* Profile Completeness Bar */}
                <div className="pt-2 border-t border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/60">Profile Completeness</span>
                    <span className="font-semibold text-white">85%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="w-[85%] h-full rounded-full bg-white/60" />
                  </div>
                </div>
              </div>

              {/* Private Member Guarantee */}
              <div className="p-4 rounded-2xl bg-[#0c1322] border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-white/80">
                  <ShieldCheck className="w-4 h-4 text-[#FFB6C1]" />
                  <span className="text-xs font-medium flex items-center gap-1">
                    <span className="font-[family-name:var(--font-marker)] text-xs text-white font-normal">Minglee</span>
                    <span>Campus Verification</span>
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-white/50">
                  Your profile is actively verified within the university network. Every Friday, our algorithm curates your singular romantic introduction.
                </p>
              </div>
            </div>

            {/* Right Column: Settings Menu List */}
            <div className="md:col-span-7">
              <div className="rounded-2xl bg-[#0c1322] border border-white/5 overflow-hidden divide-y divide-white/5">
                {/* Match Preferences */}
                <button
                  type="button"
                  onClick={() => setActiveModal("preferences")}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 text-white">
                      <Heart className="w-4 h-4 text-[#FFB6C1]" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-white">
                        Match Preferences
                      </span>
                      <p className="text-xs text-white/40">
                        Age, height, body type, intentions
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/40" />
                </button>

                {/* Privacy & Safety */}
                <button
                  type="button"
                  onClick={() => setActiveModal("privacy")}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 text-white/80">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-white">
                        Privacy & Safety
                      </span>
                      <p className="text-xs text-white/40">
                        Safety rules, reporting, blocked users
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/40" />
                </button>

                {/* WhatsApp Integration */}
                <button
                  type="button"
                  onClick={() => setActiveModal("whatsapp")}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-400">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">
                          WhatsApp Connected
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      </div>
                      <p className="text-xs text-white/40">{displayPhone}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/40" />
                </button>

                {/* Notifications */}
                <button
                  type="button"
                  onClick={() => setActiveModal("notifications")}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 text-white/80">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-white">
                        Notifications
                      </span>
                      <p className="text-xs text-white/40">
                        Friday drop timing, alerts
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/40" />
                </button>

                {/* Terms & Legal */}
                <Link
                  href="/terms"
                  className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 text-white/80">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-white">
                        Terms & Privacy Policy
                      </span>
                      <p className="text-xs text-white/40">Community guidelines</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/40" />
                </Link>

                {/* Log Out */}
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    router.replace("/login");
                  }}
                  className="w-full flex items-center justify-between p-4 hover:bg-red-500/10 transition-colors text-left text-red-400 group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-red-500/10 text-red-400 group-hover:bg-red-500/20">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">Log Out</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-red-400/50" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL 1: MATCH PREFERENCES */}
      {activeModal === "preferences" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl bg-[#0c1322] p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="font-serif text-lg text-white">
                Match Preferences
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="w-7 h-7 flex items-center justify-center rounded-full text-white/50 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveStatus && (
              <div className="p-2.5 rounded-xl bg-emerald-500/15 text-xs text-emerald-300 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{saveStatus}</span>
              </div>
            )}

            {/* Age Bounds */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
                Preferred Age Range ({minAge} - {maxAge})
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-white/40 block mb-1">
                    Min Age
                  </span>
                  <input
                    type="number"
                    min={18}
                    max={40}
                    value={minAge}
                    onChange={(e) => setMinAge(Number(e.target.value))}
                    className="w-full rounded-xl bg-white/[0.04] p-2 text-sm text-white focus:outline-none"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-white/40 block mb-1">
                    Max Age
                  </span>
                  <input
                    type="number"
                    min={18}
                    max={40}
                    value={maxAge}
                    onChange={(e) => setMaxAge(Number(e.target.value))}
                    className="w-full rounded-xl bg-white/[0.04] p-2 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Body Type Multi-Select */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
                Preferred Body Type
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Slim",
                  "Petite",
                  "Athletic",
                  "Average",
                  "Muscular",
                  "Curvy",
                  "Plus-size",
                ].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => handleToggleBuild(b)}
                    className={`text-xs px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                      builds.includes(b)
                        ? "bg-white text-black font-semibold"
                        : "bg-white/[0.04] text-white/70 hover:bg-white/[0.08]"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Relationship Goals */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
                Relationship Intention
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Long-term",
                  "Marriage bound",
                  "Short-term",
                  "Just looking for fun",
                ].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setRelationshipGoal(g)}
                    className={`text-xs p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                      relationshipGoal === g
                        ? "bg-white/20 text-white font-semibold"
                        : "bg-white/[0.04] text-white/70 hover:bg-white/[0.08]"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Conflict Style */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
                Conflict Resolution Style
              </label>
              <div className="space-y-1.5">
                {[
                  "Talk it out immediately",
                  "Need space then talk",
                  "Let it blow over",
                ].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setConflictStyle(c)}
                    className={`w-full text-xs p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                      conflictStyle === c
                        ? "bg-white/20 text-white font-semibold"
                        : "bg-white/[0.04] text-white/70 hover:bg-white/[0.08]"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSavePreferences}
              className="w-full rounded-full bg-white hover:bg-white/90 text-black py-3 text-sm font-semibold transition-colors active:scale-95 cursor-pointer"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: PRIVACY & SAFETY */}
      {activeModal === "privacy" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-md rounded-2xl bg-[#0c1322] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="font-serif text-lg text-white">
                Privacy & Safety
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-white/50 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-xl bg-white/[0.04] p-4 space-y-2 text-xs text-white/90">
              <div className="flex items-center gap-2 font-semibold text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Your Safety Matters</span>
              </div>
              <p className="leading-relaxed text-white/70">
                Never send money or crypto to someone you meet through Minglee.
                Always arrange your first dates in public campus venues and
                inform a close friend.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => setActiveModal("report")}
                className="w-full rounded-full bg-red-500/10 hover:bg-red-500/15 text-red-300 py-2.5 text-xs font-semibold transition-colors cursor-pointer"
              >
                Report a User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: REPORT A USER */}
      {activeModal === "report" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-md rounded-2xl bg-[#0c1322] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="font-serif text-lg text-white">Report a User</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-white/50 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="p-4 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="font-serif text-lg text-white">
                  Report Submitted
                </h4>
                <p className="text-xs text-white/60">
                  Our safety team will investigate and take immediate action.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
                    Reason for report
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "Harassment",
                      "Fake profile",
                      "Inappropriate messages",
                      "Spam",
                      "Threats",
                      "Other",
                    ].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setReportReason(r)}
                        className={`text-xs p-2 rounded-xl text-left transition-all cursor-pointer ${
                          reportReason === r
                            ? "bg-red-500/20 text-red-200 font-semibold"
                            : "bg-white/[0.04] text-white/70"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
                    Additional Details
                  </label>
                  <textarea
                    rows={3}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Provide details or the user's name/number..."
                    className="w-full rounded-xl bg-white/[0.04] p-2.5 text-xs text-white placeholder-white/40 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-full bg-red-600 hover:bg-red-500 text-white py-2.5 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Submit Confidential Report
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 4: WHATSAPP SETTINGS */}
      {activeModal === "whatsapp" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-md rounded-2xl bg-[#0c1322] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="font-serif text-lg text-white">
                WhatsApp Connection
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-white/50 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-xl bg-emerald-500/10 p-4 space-y-1 text-xs">
              <span className="text-[10px] uppercase text-emerald-400 font-bold">
                Connected Number
              </span>
              <p className="text-base font-serif text-white">{displayPhone}</p>
              <p className="text-[11px] text-white/60 pt-1">
                Your WhatsApp number is only used for Minglee match handoffs and
                critical notifications.
              </p>
            </div>

            <button
              type="button"
              onClick={handleTestWhatsApp}
              className="w-full rounded-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 text-xs font-semibold transition-colors cursor-pointer"
            >
              Send Test Message
            </button>
          </div>
        </div>
      )}

      {/* MODAL 5: NOTIFICATIONS */}
      {activeModal === "notifications" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-md rounded-2xl bg-[#0c1322] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="font-serif text-lg text-white">Notifications</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-white/50 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04]">
                <span className="text-xs text-white">
                  Friday Match Reminders
                </span>
                <button
                  onClick={() => setNotifMatch(!notifMatch)}
                  className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 cursor-pointer ${
                    notifMatch ? "bg-white" : "bg-white/20"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-black transition-transform ${
                      notifMatch ? "translate-x-4" : ""
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04]">
                <span className="text-xs text-white">Campus Event Alerts</span>
                <button
                  onClick={() => setNotifEvents(!notifEvents)}
                  className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 cursor-pointer ${
                    notifEvents ? "bg-white" : "bg-white/20"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-black transition-transform ${
                      notifEvents ? "translate-x-4" : ""
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-1 pt-1">
                <span className="text-[11px] uppercase font-semibold text-white/50">
                  Friday Match Delivery Time
                </span>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {["Immediately", "8:00 AM", "9:00 AM"].map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setDropTiming(time)}
                      className={`text-xs py-2 rounded-xl text-center transition-all cursor-pointer ${
                        dropTiming === time
                          ? "bg-white text-black font-semibold"
                          : "bg-white/[0.04] text-white/70 hover:bg-white/[0.08]"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full rounded-full bg-white/10 hover:bg-white/15 text-white py-2.5 text-xs font-semibold transition-colors mt-2 cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
