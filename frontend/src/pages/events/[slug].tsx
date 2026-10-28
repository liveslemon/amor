"use client";

import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  Ticket,
  Users,
  ArrowRight,
  Share2,
  Flame,
  Heart,
  Star,
} from "lucide-react";
import { APP_CONFIG } from "@/config/app";
import { login, signup } from "@/api/auth";
import { getMe, completeOnboarding } from "@/api/profile";
import {
  checkIsUserAttending,
  registerForEvent,
  getEventBySlug,
} from "@/api/events";
import { useAuthStore } from "@/store/useAuthStore";
import { LOCAL_EVENTS, isEventExpired } from "@/data/localEvents";

type EventData = {
  id: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  price: string;
  image: string;
  category: string;
  vibe?: string;
  badge?: string;
  attendeesCount?: number;
  ticketUrl?: string;
  [key: string]: any;
};

// ─── Page Component ──────────────────────────────────────────────────────────
export default function EventDetailsPage() {
  const router = useRouter();
  const { slug } = router.query;

  const currentUser = useAuthStore((state) => state.user);
  const setAuth = useAuthStore((state) => state.setAuth);

  const [event, setEvent] = useState<EventData | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  const [mode, setMode] = useState<"initial" | "login" | "signup">("initial");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [notes, setNotes] = useState("");

  const [loginForm, setLoginForm] = useState({ whatsapp_number: "", password: "" });
  const [signupStep, setSignupStep] = useState(1);
  const [signupForm, setSignupForm] = useState({
    name: "", whatsapp_number: "", password: "", gender: "", age: "", build: "",
    skin_tone: "", height_ft: "", height_in: "", preferred_min_age: "",
    preferred_max_age: "", preferred_builds: [] as string[],
    preferred_min_height_ft: "", preferred_min_height_in: "",
    preferred_max_height_ft: "", preferred_max_height_in: "",
    relationship_goal: "", conflict_style: "", instagram: "", tiktok: "",
  });

  // ── Load event: Supabase first, fallback to local catalogue ──────────────
  useEffect(() => {
    if (!slug || typeof slug !== "string") return;

    const load = async () => {
      setPageLoading(true);
      try {
        const remote = await getEventBySlug(slug);
        if (remote) {
          setEvent(remote);
          setPageLoading(false);
          return;
        }
      } catch {
        // fallthrough to local
      }

      const local = LOCAL_EVENTS.find((e) => e.slug === slug);
      if (local && !isEventExpired(local)) {
        setEvent(local);
      }
      setPageLoading(false);
    };

    load();
  }, [slug]);

  // ── Check attendance for logged-in user ──────────────────────────────────
  useEffect(() => {
    if (currentUser?.id && event?.id) {
      checkIsUserAttending(event.id, currentUser.id).then((isAttending) => {
        if (isAttending) {
          setSuccess(`You're already on the guestlist for ${event.title}!`);
        }
      });
    }
  }, [currentUser?.id, event?.id, event?.title]);

  // ── Registration helpers ─────────────────────────────────────────────────
  const submitRegistration = async (
    user: any,
    source: "login" | "signup" | "authenticated_user",
  ) => {
    if (!event) return;
    await registerForEvent({
      event_id: event.id,
      user_id: user?.id,
      event_slug: event.slug,
      event_name: event.title,
      status: "attending",
      attendance_status: "going",
      is_attending: true,
      ticket_purchased: false,
      type: "rsvp_attendance",
      user: {
        id: user?.id,
        name: user?.name,
        whatsapp_number: user?.whatsapp_number,
        onboarding_completed: user?.onboarding_completed,
      },
      source,
      attendee_notes: notes || undefined,
      agreed_to_terms: agreedToTerms,
      registered_at: new Date().toISOString(),
    });

    if (typeof window !== "undefined") {
      try {
        const stored = JSON.parse(localStorage.getItem("mingle_attending_events") || "[]");
        if (!stored.includes(event.id)) {
          stored.push(event.id);
          localStorage.setItem("mingle_attending_events", JSON.stringify(stored));
        }
      } catch { /* no-op */ }
    }

    if (event.ticketUrl) {
      window.location.href = event.ticketUrl;
      return;
    }

    setSuccess(`RSVP Confirmed! We've recorded that you're going to ${event.title}.`);
    setError("");
  };

  const handleAuthenticatedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const meData = await getMe().catch(() => null);
      await submitRegistration(meData?.user || currentUser, "authenticated_user");
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || err.message || "Failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const num = loginForm.whatsapp_number.startsWith("0")
        ? loginForm.whatsapp_number.substring(1)
        : loginForm.whatsapp_number;
      const res = await login({ whatsapp_number: `+234${num}`, password: loginForm.password });
      if (res.access_token && res.user) {
        setAuth(res.access_token, res.user);
        const meData = await getMe().catch(() => null);
        await submitRegistration(meData?.user || res.user, "login");
        if (!res.user.onboarding_completed) {
          if (typeof window !== "undefined") sessionStorage.setItem("returnToEvent", router.asPath);
          router.push("/home");
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || err.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupStep === 1) { setSignupStep(2); return; }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const num = signupForm.whatsapp_number.startsWith("0")
        ? signupForm.whatsapp_number.substring(1)
        : signupForm.whatsapp_number;
      const res = await signup({ name: signupForm.name, whatsapp_number: `+234${num}`, password: signupForm.password });
      if (res.access_token && res.user) {
        setAuth(res.access_token, res.user);
        const toIn = (ft: string, ins: string) => {
          if (!ft && !ins) return undefined;
          return (parseInt(ft || "0", 10) * 12) + parseInt(ins || "0", 10);
        };
        await completeOnboarding({
          profile: {
            gender: signupForm.gender || undefined,
            age: signupForm.age ? parseInt(signupForm.age, 10) : undefined,
            build: signupForm.build || undefined,
            skin_tone: signupForm.skin_tone || undefined,
            height: toIn(signupForm.height_ft, signupForm.height_in),
            relationship_goal: signupForm.relationship_goal || undefined,
            conflict_style: signupForm.conflict_style || undefined,
            instagram: signupForm.instagram || undefined,
            tiktok: signupForm.tiktok || undefined,
          },
          preferences: {
            preferred_min_age: signupForm.preferred_min_age ? parseInt(signupForm.preferred_min_age, 10) : undefined,
            preferred_max_age: signupForm.preferred_max_age ? parseInt(signupForm.preferred_max_age, 10) : undefined,
            preferred_min_height: toIn(signupForm.preferred_min_height_ft, signupForm.preferred_min_height_in),
            preferred_max_height: toIn(signupForm.preferred_max_height_ft, signupForm.preferred_max_height_in),
          },
          preferred_builds: signupForm.preferred_builds.length > 0 ? signupForm.preferred_builds : undefined,
        });
        const meData = await getMe().catch(() => null);
        await submitRegistration(meData?.user || res.user, "signup");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#000B1A] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#FFB6C1] animate-spin" />
      </div>
    );
  }

  // ── Not found fallback ───────────────────────────────────────────────────
  if (!event) {
    return (
      <>
        <Head><title>Event Not Found | {APP_CONFIG.name}</title></Head>
        <div className="min-h-screen bg-[#000B1A] flex flex-col items-center justify-center px-4 text-center gap-6">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <Heart className="w-7 h-7 text-[#FFB6C1]" />
          </div>
          <div>
            <h1 className="font-serif text-2xl text-white mb-2">Event Not Found</h1>
            <p className="text-sm text-white/50 max-w-xs">
              This event may have ended or been removed. Check out what's coming up next.
            </p>
          </div>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#08101e] hover:bg-white/90 transition-all"
          >
            Browse Events
          </Link>
        </div>
      </>
    );
  }

  const attendeesCount = event.attendeesCount ?? 0;
  const vibe = event.vibe ?? event.category;

  return (
    <>
      <Head>
        <title>{`${event.title} | ${APP_CONFIG.name}`}</title>
        <meta name="description" content={event.description} />
      </Head>

      <main className="min-h-screen bg-[#000B1A] text-white selection:bg-[#FFB6C1]/30 pb-28 md:pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 md:pt-24 pb-16">

          {/* ── Back navigation ─────────────────────────────────────── */}
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-white/50 hover:text-white text-xs sm:text-sm transition-colors py-2 mb-8 group focus-visible:outline-none"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            All events
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-12 items-start">

            {/* ═══════════════════════════════════════════════════════
                LEFT — Poster + Info
            ═══════════════════════════════════════════════════════ */}
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="space-y-7"
            >
              {/* Hero image */}
              <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] shadow-2xl">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-auto object-contain block"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#000B1A]/60 via-transparent to-transparent pointer-events-none" />

                {/* Category badge */}
                <span className="absolute top-4 left-4 rounded-full border border-white/15 bg-black/60 backdrop-blur-sm px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/80 font-medium">
                  {event.category}
                </span>

                {/* Attendees pill */}
                {attendeesCount > 0 && (
                  <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur-sm px-3 py-1 text-[11px] font-medium text-white border border-white/10">
                    <Users className="w-3 h-3 text-[#FFB6C1]" />
                    {attendeesCount} going
                  </span>
                )}
              </div>

              {/* Vibe tag + Title + Description */}
              <div className="space-y-3">
                {vibe && (
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#FFB6C1] font-semibold">
                    {vibe}
                  </span>
                )}
                <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl tracking-tight text-white leading-tight">
                  {event.title}
                </h1>
                {event.description && (
                  <p className="text-sm sm:text-[15px] text-white/65 leading-relaxed max-w-2xl">
                    {event.description}
                  </p>
                )}
              </div>

              {/* Detail pills grid */}
              <div className="grid grid-cols-2 gap-3">
                <DetailPill icon={CalendarDays} label="Date" value={event.date} />
                <DetailPill icon={Clock3} label="Time" value={event.time} />
                <DetailPill icon={MapPin} label="Location" value={event.location} />
                <DetailPill icon={Ticket} label="Entry Fee" value={event.price} />
              </div>

              {/* Share row */}
              <button
                type="button"
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.share) {
                    navigator.share({ title: event.title, url: window.location.href }).catch(() => {});
                  } else if (typeof navigator !== "undefined") {
                    navigator.clipboard?.writeText(window.location.href);
                  }
                }}
                className="inline-flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share event
              </button>
            </motion.section>

            {/* ═══════════════════════════════════════════════════════
                RIGHT — RSVP / Auth Card
            ═══════════════════════════════════════════════════════ */}
            <motion.aside
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="lg:sticky lg:top-8 h-fit"
            >
              <div className="rounded-2xl border border-white/[0.08] bg-[#0c1220] p-5 sm:p-6 shadow-2xl space-y-5">

                {/* Card header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.07]">
                  <div className="flex items-center gap-2 text-white/60 text-[10px] uppercase tracking-[0.2em]">
                    <Users className="w-3.5 h-3.5 text-[#FFB6C1]" />
                    Minglee Guestlist
                  </div>
                  <span className="text-[10px] text-white/35 uppercase tracking-wider">RSVP</span>
                </div>

                {/* Price block */}
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] text-white/40 uppercase tracking-wider block mb-0.5">Entry Fee</span>
                    <span className="text-lg sm:text-xl font-serif text-white">{event.price}</span>
                  </div>
                  <span className="rounded-full bg-white/[0.07] px-3 py-1 text-[11px] text-white/60 font-medium border border-white/[0.05]">
                    Pay at venue
                  </span>
                </div>

                <p className="text-[13px] text-white/50 leading-relaxed">
                  Mark yourself on the Minglee guestlist. We'll record your attendance so you can discover other members going to this event.
                </p>

                {/* ── State: Success ────────────────────────────────── */}
                {success ? (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.08] p-4 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-white">You're on the list!</p>
                      <p className="text-xs mt-1 text-emerald-300/80 leading-relaxed">{success}</p>
                    </div>
                  </div>

                ) : currentUser ? (
                  /* ── Logged in ─────────────────────────────────────── */
                  <form onSubmit={handleAuthenticatedSubmit} className="grid gap-3">
                    <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3.5 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-white/35 block">RSVPing as</span>
                        <span className="text-sm font-semibold text-white">{currentUser.name}</span>
                      </div>
                      <span className="text-xs text-[#FFB6C1] font-medium">{currentUser.whatsapp_number}</span>
                    </div>

                    <NotesField value={notes} onChange={setNotes} />
                    <ConsentCheck agreedToTerms={agreedToTerms} setAgreedToTerms={setAgreedToTerms} />

                    {error && <AlertBox tone="error" text={error} />}

                    <SubmitButton loading={loading} disabled={!agreedToTerms}>
                      Confirm I'm Going
                    </SubmitButton>
                  </form>

                ) : mode === "initial" ? (
                  /* ── Guest: initial CTA ───────────────────────────── */
                  <div className="grid gap-3">
                    <button
                      onClick={() => setMode("login")}
                      className="w-full min-h-[48px] rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#08101e] hover:bg-white/90 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      Already a member? Log in & RSVP
                    </button>
                    <button
                      onClick={() => setMode("signup")}
                      className="w-full min-h-[48px] rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white hover:bg-white/[0.08] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      Sign up & RSVP with Minglee
                    </button>
                  </div>

                ) : (
                  /* ── Guest: login / signup forms ──────────────────── */
                  <div>
                    <button
                      onClick={() => { setMode("initial"); setError(""); }}
                      className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 mb-5 transition-colors cursor-pointer py-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back
                    </button>

                    {mode === "login" ? (
                      <form onSubmit={handleLogin} className="grid gap-3">
                        <FieldLabel>WhatsApp Number</FieldLabel>
                        <div className="flex w-full">
                          <span className="bg-white/[0.04] border border-white/[0.08] border-r-0 rounded-l-xl px-3 text-white text-xs flex items-center shrink-0">🇳🇬 +234</span>
                          <input
                            type="tel" inputMode="numeric" placeholder="8012345678" required
                            value={loginForm.whatsapp_number}
                            onChange={(e) => setLoginForm({ ...loginForm, whatsapp_number: e.target.value.replace(/[^0-9]/g, "") })}
                            className="w-full text-base sm:text-sm rounded-r-xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 outline-none focus:border-white/25 text-white transition-colors"
                          />
                        </div>

                        <FieldLabel>Password</FieldLabel>
                        <input
                          type="password" placeholder="Your password" required
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          className="w-full text-base sm:text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 outline-none focus:border-white/25 text-white transition-colors"
                        />

                        <NotesField value={notes} onChange={setNotes} />
                        <ConsentCheck agreedToTerms={agreedToTerms} setAgreedToTerms={setAgreedToTerms} />
                        {error && <AlertBox tone="error" text={error} />}
                        <SubmitButton loading={loading} disabled={!agreedToTerms}>
                          Log in & Confirm Attendance
                        </SubmitButton>
                      </form>

                    ) : (
                      <form onSubmit={handleSignup} className="grid gap-4">
                        {signupStep === 1 && (
                          <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <FormField label="Full Name">
                                <input required type="text" placeholder="Your full name" value={signupForm.name} onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })} className={inputCls} />
                              </FormField>
                              <FormField label="WhatsApp Number">
                                <div className="flex w-full">
                                  <span className="bg-white/[0.04] border border-white/[0.08] border-r-0 rounded-l-xl px-3 text-white text-xs flex items-center shrink-0">🇳🇬 +234</span>
                                  <input required type="tel" inputMode="numeric" placeholder="8012345678" value={signupForm.whatsapp_number} onChange={(e) => setSignupForm({ ...signupForm, whatsapp_number: e.target.value.replace(/[^0-9]/g, "") })} className="w-full text-base sm:text-sm rounded-r-xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 outline-none focus:border-white/25 text-white transition-colors" />
                                </div>
                              </FormField>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <FormField label="Gender">
                                <select required value={signupForm.gender} onChange={(e) => setSignupForm({ ...signupForm, gender: e.target.value })} className={`${inputCls} appearance-none`}>
                                  <option value="" disabled>Select</option>
                                  <option value="Male">Male</option>
                                  <option value="Female">Female</option>
                                </select>
                              </FormField>
                              <FormField label="Age">
                                <input required type="number" min="18" placeholder="e.g. 23" value={signupForm.age} onChange={(e) => setSignupForm({ ...signupForm, age: e.target.value })} className={inputCls} />
                              </FormField>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <FormField label="Build">
                                <select required value={signupForm.build} onChange={(e) => setSignupForm({ ...signupForm, build: e.target.value })} className={`${inputCls} appearance-none`}>
                                  <option value="" disabled>Select</option>
                                  {["Slim","Petite","Athletic","Average","Muscular","Curvy","Plus-size"].map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                              </FormField>
                              <FormField label="Skin Tone">
                                <select required value={signupForm.skin_tone} onChange={(e) => setSignupForm({ ...signupForm, skin_tone: e.target.value })} className={`${inputCls} appearance-none`}>
                                  <option value="" disabled>Select</option>
                                  {["Fair","Tan","Brown","Dark"].map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                              </FormField>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <FormField label="Height">
                                <div className="flex gap-2">
                                  <div className="relative flex-1">
                                    <input required type="number" min="3" max="8" placeholder="Ft" value={signupForm.height_ft} onChange={(e) => setSignupForm({ ...signupForm, height_ft: e.target.value })} className="w-full text-base sm:text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] pl-3 pr-6 py-3 outline-none focus:border-white/25 text-white transition-colors" />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-white/35">ft</span>
                                  </div>
                                  <div className="relative flex-1">
                                    <input required type="number" min="0" max="11" placeholder="In" value={signupForm.height_in} onChange={(e) => setSignupForm({ ...signupForm, height_in: e.target.value })} className="w-full text-base sm:text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] pl-3 pr-6 py-3 outline-none focus:border-white/25 text-white transition-colors" />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-white/35">in</span>
                                  </div>
                                </div>
                              </FormField>
                              <FormField label="Pref Age Range">
                                <div className="flex gap-2">
                                  <input required type="number" min="18" placeholder="Min" value={signupForm.preferred_min_age} onChange={(e) => setSignupForm({ ...signupForm, preferred_min_age: e.target.value })} className={inputCls} />
                                  <input required type="number" min="18" placeholder="Max" value={signupForm.preferred_max_age} onChange={(e) => setSignupForm({ ...signupForm, preferred_max_age: e.target.value })} className={inputCls} />
                                </div>
                              </FormField>
                            </div>
                            <FormField label="Pref Body Type">
                              <div className="flex flex-wrap gap-2 pt-1">
                                {["Slim","Petite","Athletic","Average","Muscular","Curvy","Plus-size"].map(b => (
                                  <button key={b} type="button" onClick={() => setSignupForm({ ...signupForm, preferred_builds: signupForm.preferred_builds.includes(b) ? signupForm.preferred_builds.filter(x => x !== b) : [...signupForm.preferred_builds, b] })} className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${signupForm.preferred_builds.includes(b) ? "bg-[#FFB6C1]/15 border-[#FFB6C1]/40 text-[#FFB6C1]" : "bg-white/[0.04] border-white/[0.08] text-white/60 hover:border-white/20"}`}>{b}</button>
                                ))}
                              </div>
                            </FormField>
                          </>
                        )}

                        {signupStep === 2 && (
                          <>
                            <div className="grid grid-cols-2 gap-3">
                              <FormField label="Relationship Goal">
                                <select required value={signupForm.relationship_goal} onChange={(e) => setSignupForm({ ...signupForm, relationship_goal: e.target.value })} className={`${inputCls} appearance-none`}>
                                  <option value="" disabled>Select</option>
                                  {["Marriage bound","Long-term","Short-term","Just looking for fun"].map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                              </FormField>
                              <FormField label="Conflict Style">
                                <select required value={signupForm.conflict_style} onChange={(e) => setSignupForm({ ...signupForm, conflict_style: e.target.value })} className={`${inputCls} appearance-none`}>
                                  <option value="" disabled>Select</option>
                                  {["Talk it out immediately","Need space then talk","Let it blow over"].map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                              </FormField>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <FormField label="Instagram"><input type="text" placeholder="@username" value={signupForm.instagram} onChange={(e) => setSignupForm({ ...signupForm, instagram: e.target.value })} className={inputCls} /></FormField>
                              <FormField label="TikTok"><input type="text" placeholder="@username" value={signupForm.tiktok} onChange={(e) => setSignupForm({ ...signupForm, tiktok: e.target.value })} className={inputCls} /></FormField>
                            </div>
                            <FormField label="Password">
                              <input required type="password" placeholder="Create a password" value={signupForm.password} onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })} className={inputCls} />
                            </FormField>
                            <NotesField value={notes} onChange={setNotes} />
                            <ConsentCheck agreedToTerms={agreedToTerms} setAgreedToTerms={setAgreedToTerms} />
                          </>
                        )}

                        {error && <AlertBox tone="error" text={error} />}

                        <div className="flex items-center gap-3">
                          {signupStep === 2 && (
                            <button type="button" onClick={() => setSignupStep(1)} className="min-w-[90px] min-h-[48px] rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white hover:bg-white/[0.08] active:scale-[0.98] transition-all cursor-pointer">
                              Back
                            </button>
                          )}
                          <SubmitButton loading={loading} disabled={signupStep === 2 && !agreedToTerms} className="flex-1">
                            {signupStep === 1 ? "Next Step" : "Sign up & RSVP"}
                          </SubmitButton>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>

              {/* Minglee members blurb */}
              <p className="mt-4 text-center text-[11px] text-white/25 leading-relaxed px-2">
                Minglee connects university singles every Friday. RSVP to discover members attending this event.
              </p>
            </motion.aside>
          </div>
        </div>
      </main>
    </>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const inputCls =
  "w-full text-base sm:text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 outline-none focus:border-white/25 text-white transition-colors";

// ─── Sub-components ───────────────────────────────────────────────────────────
function DetailPill({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4 hover:border-white/[0.12] transition-colors">
      <div className="flex items-center gap-1.5 text-white/40 text-[9px] uppercase tracking-[0.2em] mb-2">
        <Icon className="w-3 h-3 text-[#FFB6C1] shrink-0" />
        <span>{label}</span>
      </div>
      <p className="text-xs sm:text-sm font-medium text-white/85 break-words">{value}</p>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] uppercase tracking-[0.15em] text-white/40 mb-1.5">
      {children}
    </label>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  );
}

function NotesField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <FieldLabel>Notes (Optional)</FieldLabel>
      <textarea
        placeholder="Any notes for the Minglee event team..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[72px] w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 outline-none focus:border-white/25 resize-none text-base sm:text-sm text-white transition-colors"
      />
    </div>
  );
}

function ConsentCheck({
  agreedToTerms,
  setAgreedToTerms,
}: {
  agreedToTerms: boolean;
  setAgreedToTerms: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 text-xs text-white/50 rounded-xl border border-white/[0.07] bg-white/[0.03] p-3.5 cursor-pointer hover:bg-white/[0.06] transition-colors select-none">
      <input
        type="checkbox"
        checked={agreedToTerms}
        onChange={(e) => setAgreedToTerms(e.target.checked)}
        className="mt-0.5 w-4 h-4 rounded border-white/20 text-[#FFB6C1] focus:ring-0 focus:ring-offset-0 bg-transparent shrink-0 cursor-pointer"
      />
      <span className="leading-snug">
        I understand the gate/entry fee is paid at the venue, and I want Minglee to record my attendance.
      </span>
    </label>
  );
}

function AlertBox({ tone, text }: { tone: "error" | "success"; text: string }) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-xs sm:text-sm leading-relaxed ${
        tone === "error"
          ? "border-red-500/30 bg-red-500/[0.08] text-red-300"
          : "border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-300"
      }`}
    >
      {text}
    </div>
  );
}

function SubmitButton({
  children,
  loading,
  disabled,
  className = "",
}: {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className={`min-h-[48px] inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#08101e] hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${className}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <span>{children}</span>
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </button>
  );
}
