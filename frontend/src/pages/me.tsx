"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import axios from "axios";
import {
  User,
  Heart,
  ShieldCheck,
  Camera,
  Briefcase,
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
import { fetchCurrentMatch } from "@/api/matches";
import {
  savePhotos,
  savePreferences,
  savePreferredBuilds,
  saveProfile,
  uploadPhotoBinary,
} from "@/api/profile";
import { optimizeImage } from "@/lib/imageOptimization";

export default function MePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [activeModal, setActiveModal] = useState<
    "preferences" | "privacy" | "whatsapp" | "report" | null
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

  // Report Modal State. Members have no way to look up another user's ID, so
  // reporting is only offered for the current Friday match, whose partner ID
  // we already have from /matches/current.
  const [reportReason, setReportReason] = useState("Harassment");
  const [reportDetails, setReportDetails] = useState("");
  const [currentPartner, setCurrentPartner] = useState<{ id: string; name: string } | null>(null);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState("");
  const [profilePhotos, setProfilePhotos] = useState<
    Array<{ image_url: string; photo_type?: string; upload_order: number }>
  >([]);
  const [photoStatus, setPhotoStatus] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

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
        setProfilePhotos((res.data?.photos || []).slice(0, 2));
      } catch (err) {
        console.warn("Could not load user profile:", err);
      }
    };

    fetchUserPreferences();
  }, [router]);

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const match = await fetchCurrentMatch<{
          match_id?: string;
          partner?: { id: string; name: string };
        }>(user?.id);
        setCurrentPartner(match?.partner ? { id: match.partner.id, name: match.partner.name } : null);
      } catch (err) {
        console.warn("Could not load current match for reporting:", err);
      }
    };
    fetchPartner();
  }, [user?.id]);

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
      if (builds.length > 0) await savePreferredBuilds(builds);

      await saveProfile({
        relationship_goal: relationshipGoal,
        conflict_style: conflictStyle,
      });

      setSaveStatus("Preferences updated successfully!");
      setTimeout(() => {
        setSaveStatus(null);
        setActiveModal(null);
      }, 1200);
    } catch (err) {
      const message = axios.isAxiosError<{ error?: string }>(err)
        ? err.response?.data?.error || err.message
        : err instanceof Error
          ? err.message
          : null;
      setSaveStatus(message || "Unable to save preferences. Please try again.");
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    event.target.value = "";
    if (!selectedFile) return;
    if (profilePhotos.length >= 2) {
      setPhotoStatus("You can add up to two profile photos.");
      return;
    }

    setUploadingPhoto(true);
    setPhotoStatus("");
    try {
      const optimized = await optimizeImage(selectedFile);
      const uploaded = await uploadPhotoBinary(optimized);
      const nextPhotos = [
        ...profilePhotos,
        {
          image_url: uploaded.image_url,
          photo_type: profilePhotos.length === 0 ? "Profile" : "Gallery",
          upload_order: profilePhotos.length + 1,
        },
      ];
      await savePhotos(nextPhotos);
      setProfilePhotos(nextPhotos);
      setPhotoStatus("Photo uploaded and saved.");
    } catch (error) {
      console.error("Could not upload profile photo:", error);
      const message = axios.isAxiosError<{ error?: string }>(error)
        ? error.response?.data?.error || error.message
        : error instanceof Error
          ? error.message
          : null;
      setPhotoStatus(message || "Photo upload failed. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPartner) return;
    setReportError("");
    try {
      await API.post("/reports", {
        reported_user_id: currentPartner.id,
        reason: reportReason,
        details: reportDetails,
      });
      setReportSuccess(true);
      setTimeout(() => {
        setReportSuccess(false);
        setActiveModal(null);
        setReportDetails("");
      }, 2000);
    } catch (error) {
      console.error("Could not submit user report:", error);
      const message = axios.isAxiosError<{ error?: string }>(error)
        ? error.response?.data?.error || error.message
        : null;
      setReportError(
        message || "Reporting is unavailable until the safety service is connected.",
      );
    }
  };

  const handleTestWhatsApp = () => {
    const text = encodeURIComponent("Hi Minglee! I need some help.");
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

              </div>

              <div className="rounded-2xl border border-white/5 bg-[#0c1322] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-white">Profile photos</h3>
                    <p className="mt-0.5 text-xs text-white/45">
                      Up to two optimized photos
                    </p>
                  </div>
                  <span className="text-xs text-white/45">
                    {profilePhotos.length}/2
                  </span>
                </div>
                <div className="mb-3 grid grid-cols-2 gap-2">
                  {[0, 1].map((index) => (
                    <div
                      key={index}
                      className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-white/[0.04]"
                    >
                      {profilePhotos[index] ? (
                        <img
                          src={profilePhotos[index].image_url}
                          alt={`Profile photo ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Camera className="h-6 w-6 text-white/25" />
                      )}
                    </div>
                  ))}
                </div>
                <label
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold ${
                    profilePhotos.length >= 2 || uploadingPhoto
                      ? "bg-white/10 text-white/40"
                      : "bg-white text-black"
                  }`}
                >
                  <Camera className="h-4 w-4" />
                  {uploadingPhoto
                    ? "Optimizing and uploading..."
                    : profilePhotos.length >= 2
                      ? "Photo limit reached"
                      : "Add profile photo"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    disabled={profilePhotos.length >= 2 || uploadingPhoto}
                    onChange={handlePhotoUpload}
                  />
                </label>
                {photoStatus && (
                  <p role="status" className="mt-2 text-xs text-white/65">
                    {photoStatus}
                  </p>
                )}
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
              <Link
                href="/business"
                className="mb-4 flex items-center justify-between rounded-2xl border border-white/10 bg-[#0c1322] p-4 transition-colors hover:bg-white/[0.06]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-[#FFB6C1]">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-white">
                      Business Suite
                    </span>
                    <p className="text-xs text-white/40">
                      Manage promotions and event tickets
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-white/40" />
              </Link>

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
                      "Inappropriate profile image",
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
                    Reporting
                  </label>
                  {currentPartner ? (
                    <div className="w-full rounded-xl bg-white/[0.04] p-2.5 text-xs text-white">
                      {currentPartner.name} (your current Friday match)
                    </div>
                  ) : (
                    <p className="text-xs text-white/50 leading-relaxed">
                      You don&apos;t have an active match to report right now. Once you&apos;re
                      paired, you can report or block them from the date page.
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
                    Additional Details
                  </label>
                  <textarea
                    rows={3}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Describe what happened..."
                    className="w-full rounded-xl bg-white/[0.04] p-2.5 text-xs text-white placeholder-white/40 focus:outline-none"
                  />
                </div>

                {reportError && (
                  <p role="alert" className="text-xs text-amber-200">
                    {reportError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!currentPartner}
                  className="w-full rounded-full bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white py-2.5 text-xs font-semibold transition-colors cursor-pointer"
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
                critical notifications. Need help? Message Minglee support directly
                on WhatsApp below.
              </p>
            </div>

            <button
              type="button"
              onClick={handleTestWhatsApp}
              className="w-full rounded-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 text-xs font-semibold transition-colors cursor-pointer"
            >
              Message Minglee on WhatsApp
            </button>
          </div>
        </div>
      )}

    </>
  );
}
