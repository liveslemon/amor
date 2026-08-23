import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { GetStaticPaths, GetStaticProps } from "next";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  Ticket,
  Users,
} from "lucide-react";
import { APP_CONFIG } from "@/config/app";
import { login, signup } from "@/api/auth";
import { getMe } from "@/api/profile";
import {
  checkIsUserAttending,
  registerForEvent,
  fetchEvents,
  getEventBySlug,
} from "@/api/events";
import { useAuthStore } from "@/store/useAuthStore";

type Event = {
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
  [key: string]: any;
};

type Props = {
  event: Event;
};

export default function EventDetailsPage({ event }: Props) {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const setAuth = useAuthStore((state) => state.setAuth);

  const [mode, setMode] = useState<"initial" | "login" | "signup">("initial");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [notes, setNotes] = useState("");

  const [loginForm, setLoginForm] = useState({
    whatsapp_number: "",
    password: "",
  });
  const [signupForm, setSignupForm] = useState({
    name: "",
    whatsapp_number: "",
    password: "",
  });

  // Check if current user is already attending in the event_attendees DB table
  useEffect(() => {
    if (currentUser?.id && event?.id) {
      checkIsUserAttending(event.id, currentUser.id).then((isAttending) => {
        if (isAttending) {
          setSuccess(`You're already on the guestlist for ${event.title}!`);
        }
      });
    }
  }, [currentUser?.id, event?.id, event?.title]);

  const submitRegistration = async (
    user: any,
    source: "login" | "signup" | "authenticated_user",
  ) => {
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

    // Save locally to persist attendance state
    if (typeof window !== "undefined") {
      try {
        const stored = JSON.parse(
          localStorage.getItem("mingle_attending_events") || "[]",
        );
        if (!stored.includes(event.id)) {
          stored.push(event.id);
          localStorage.setItem(
            "mingle_attending_events",
            JSON.stringify(stored),
          );
        }
      } catch {
        // no-op
      }
    }

    setSuccess(
      `RSVP Confirmed! We've recorded that you're going to ${event.title}.`,
    );
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
      const userObj = meData?.user || currentUser;
      await submitRegistration(userObj, "authenticated_user");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to record attendance. Please try again.",
      );
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
      const formattedNum = loginForm.whatsapp_number.startsWith('0') 
        ? loginForm.whatsapp_number.substring(1) 
        : loginForm.whatsapp_number;

      const res = await login({
        whatsapp_number: `+234${formattedNum}`,
        password: loginForm.password,
      });

      if (res.access_token && res.user) {
        setAuth(res.access_token, res.user);
        const meData = await getMe().catch(() => null);
        const userObj = meData?.user || res.user;
        await submitRegistration(userObj, "login");

        if (!res.user.onboarding_completed) {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("returnToEvent", router.asPath);
          }
          router.push("/matchmaking/Step1");
        }
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Login failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formattedNum = signupForm.whatsapp_number.startsWith('0') 
        ? signupForm.whatsapp_number.substring(1) 
        : signupForm.whatsapp_number;

      const res = await signup({
        name: signupForm.name,
        whatsapp_number: `+234${formattedNum}`,
        password: signupForm.password,
      });

      if (res.access_token && res.user) {
        setAuth(res.access_token, res.user);
        await submitRegistration(res.user, "signup");

        if (typeof window !== "undefined") {
          sessionStorage.setItem("returnToEvent", router.asPath);
        }
        router.push("/matchmaking/Step1");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Signup failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>{`${event.title} | ${APP_CONFIG.name}`}</title>
        <meta name="description" content={event.description} />
      </Head>

      <main className="min-h-screen bg-[#0a0f1a] text-white selection:bg-[#ff5fb8] selection:text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
          {/* Back button */}
          <Link
            href="/#events"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-xs sm:text-sm transition-colors py-2 mb-6 md:mb-8 focus-visible:outline-none"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to all events
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 lg:gap-8 items-start">
            {/* Left Column: Event Poster & Core Details */}
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Event Poster */}
              <div className="relative overflow-hidden rounded-2xl md:rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-auto object-contain block"
                />

                <span className="absolute top-4 left-4 sm:top-5 sm:left-5 rounded-full border border-white/15 bg-black/60 backdrop-blur-sm px-3 py-1 text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-white/90 font-medium shadow-md">
                  {event.category}
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif tracking-tight text-white leading-tight">
                  {event.title}
                </h1>
                <p className="mt-3 text-sm sm:text-base text-white/75 leading-relaxed max-w-2xl">
                  {event.description}
                </p>
              </div>

              {/* Key Details: Date, Time, Location, Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Pill icon={CalendarDays} label="Date" value={event.date} />
                <Pill icon={Clock3} label="Time" value={event.time} />
                <Pill icon={MapPin} label="Location" value={event.location} />
                <Pill icon={Ticket} label="Gate / Entry" value={event.price} />
              </div>
            </motion.section>

            {/* Right Column: Attendance / RSVP Card */}
            <motion.aside
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:sticky lg:top-8 h-fit rounded-2xl md:rounded-[2rem] border border-white/10 bg-[#0c1220] p-5 sm:p-6 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2 text-white/70 text-xs uppercase tracking-[0.25em]">
                  <Users className="w-4 h-4 text-[#ff5fb8]" />
                  <span>Minglee Guestlist</span>
                </div>
                <span className="text-xs text-white/50">RSVP Attendance</span>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-white/55 block">
                    Gate / Entry Fee
                  </span>
                  <span className="text-lg sm:text-xl font-serif text-white">
                    {event.price}
                  </span>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] text-white/80 font-medium">
                  Buy tickets online
                </span>
              </div>

              <p className="mt-4 text-xs sm:text-sm text-white/65 leading-relaxed">
                Let us know you're going! We record your attendance on the
                Minglee guestlist so you can connect with members attending this
                event.
              </p>

              {success ? (
                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-200 text-sm flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">
                        You're on the list!
                      </p>
                      <p className="text-xs mt-1 text-emerald-200/90 leading-relaxed">
                        We've recorded that you're going to{" "}
                        <span className="font-semibold text-white">
                          {event.title}
                        </span>
                        . Tickets can be bought online.
                      </p>
                    </div>
                  </div>
                </div>
              ) : currentUser ? (
                /* User is already logged in */
                <form
                  onSubmit={handleAuthenticatedSubmit}
                  className="mt-5 grid gap-3"
                >
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-white/50 block">
                        RSVPing as
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {currentUser.name}
                      </span>
                    </div>
                    <span className="text-xs text-[#ff5fb8] font-medium">
                      {currentUser.whatsapp_number}
                    </span>
                  </div>

                  <NotesField value={notes} onChange={setNotes} />

                  <Consent
                    agreedToTerms={agreedToTerms}
                    setAgreedToTerms={setAgreedToTerms}
                  />

                  {error && <Alert tone="error" text={error} />}

                  <button
                    type="submit"
                    disabled={loading || !agreedToTerms}
                    className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-xs sm:text-sm font-semibold text-[#08101e] hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-1"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Confirm I'm Going</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : mode === "initial" ? (
                <div className="mt-5 grid gap-3">
                  <button
                    onClick={() => setMode("login")}
                    className="w-full min-h-[48px] rounded-full bg-white px-5 py-3 text-xs sm:text-sm font-semibold text-[#08101e] hover:bg-white/90 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Already a Minglee member? Log in & RSVP
                  </button>
                  <button
                    onClick={() => setMode("signup")}
                    className="w-full min-h-[48px] rounded-full border border-white/15 bg-white/5 px-5 py-3 text-xs sm:text-sm font-semibold text-white hover:bg-white/10 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Sign up & RSVP with Minglee
                  </button>
                </div>
              ) : (
                <div className="mt-5">
                  <button
                    onClick={() => {
                      setMode("initial");
                      setError("");
                      setSuccess("");
                    }}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-white/60 hover:text-white mb-4 transition-colors cursor-pointer py-1"
                  >
                    <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                    Switch option
                  </button>

                  {mode === "login" ? (
                    <form onSubmit={handleLogin} className="grid gap-3">
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-white/50 mb-1.5 ml-1">
                          WhatsApp Number
                        </label>
                        <div className="flex w-full">
                          <span className="bg-white/5 border border-white/10 border-r-0 rounded-l-2xl px-3 sm:px-4 text-white text-xs sm:text-sm flex items-center shrink-0">
                            🇳🇬 +234
                          </span>
                          <input
                            type="tel"
                            inputMode="numeric"
                            placeholder="8012345678"
                            required
                            value={loginForm.whatsapp_number}
                            onChange={(e) =>
                              setLoginForm({
                                ...loginForm,
                                whatsapp_number: e.target.value.replace(
                                  /[^0-9]/g,
                                  "",
                                ),
                              })
                            }
                            className="w-full text-base sm:text-sm rounded-r-2xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-white/30 text-white transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-white/50 mb-1.5 ml-1">
                          Password
                        </label>
                        <input
                          type="password"
                          placeholder="Your password"
                          required
                          value={loginForm.password}
                          onChange={(e) =>
                            setLoginForm({
                              ...loginForm,
                              password: e.target.value,
                            })
                          }
                          className="w-full text-base sm:text-sm rounded-2xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-white/30 text-white transition-colors"
                        />
                      </div>

                      <NotesField value={notes} onChange={setNotes} />

                      <Consent
                        agreedToTerms={agreedToTerms}
                        setAgreedToTerms={setAgreedToTerms}
                      />

                      {error && <Alert tone="error" text={error} />}

                      <button
                        type="submit"
                        disabled={loading || !agreedToTerms}
                        className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-xs sm:text-sm font-semibold text-[#08101e] hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-1"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <span>Log in & Confirm Attendance</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleSignup} className="grid gap-3">
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-white/50 mb-1.5 ml-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          placeholder="Your full name"
                          required
                          value={signupForm.name}
                          onChange={(e) =>
                            setSignupForm({
                              ...signupForm,
                              name: e.target.value,
                            })
                          }
                          className="w-full text-base sm:text-sm rounded-2xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-white/30 text-white transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-white/50 mb-1.5 ml-1">
                          WhatsApp Number
                        </label>
                        <div className="flex w-full">
                          <span className="bg-white/5 border border-white/10 border-r-0 rounded-l-2xl px-3 sm:px-4 text-white text-xs sm:text-sm flex items-center shrink-0">
                            🇳🇬 +234
                          </span>
                          <input
                            type="tel"
                            inputMode="numeric"
                            placeholder="8012345678"
                            required
                            value={signupForm.whatsapp_number}
                            onChange={(e) =>
                              setSignupForm({
                                ...signupForm,
                                whatsapp_number: e.target.value.replace(
                                  /[^0-9]/g,
                                  "",
                                ),
                              })
                            }
                            className="w-full text-base sm:text-sm rounded-r-2xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-white/30 text-white transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-white/50 mb-1.5 ml-1">
                          Password
                        </label>
                        <input
                          type="password"
                          placeholder="Create a password"
                          required
                          value={signupForm.password}
                          onChange={(e) =>
                            setSignupForm({
                              ...signupForm,
                              password: e.target.value,
                            })
                          }
                          className="w-full text-base sm:text-sm rounded-2xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-white/30 text-white transition-colors"
                        />
                      </div>

                      <NotesField value={notes} onChange={setNotes} />

                      <Consent
                        agreedToTerms={agreedToTerms}
                        setAgreedToTerms={setAgreedToTerms}
                      />

                      {error && <Alert tone="error" text={error} />}

                      <button
                        type="submit"
                        disabled={loading || !agreedToTerms}
                        className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-xs sm:text-sm font-semibold text-[#08101e] hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-1"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <span>Sign up & Confirm Attendance</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </motion.aside>
          </div>
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const allEvents = await fetchEvents();
  return {
    paths: allEvents.map((event: any) => ({ params: { slug: event.slug } })),
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = params?.slug as string;
  const event = await getEventBySlug(slug);

  if (!event) {
    return { notFound: true };
  }

  return {
    props: { event },
    revalidate: 60,
  };
};

function Pill({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 transition-colors hover:border-white/20">
      <div className="flex items-center gap-2 text-white/50 text-[11px] uppercase tracking-[0.2em]">
        <Icon className="w-3.5 h-3.5 text-[#ff5fb8] shrink-0" />
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-2 text-xs sm:text-sm font-medium text-white/90 break-words">
        {value}
      </p>
    </div>
  );
}

function NotesField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-wider text-white/50 mb-1.5 ml-1">
        Special Requests or Notes (Optional)
      </label>
      <textarea
        placeholder="Any notes for the Minglee event team..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[80px] w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-white/30 resize-none text-base sm:text-sm text-white transition-colors"
      />
    </div>
  );
}

function Consent({
  agreedToTerms,
  setAgreedToTerms,
}: {
  agreedToTerms: boolean;
  setAgreedToTerms: (value: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 text-xs text-white/70 rounded-2xl border border-white/10 bg-white/5 p-3.5 sm:p-4 cursor-pointer hover:bg-white/[0.07] transition-colors select-none">
      <input
        type="checkbox"
        checked={agreedToTerms}
        onChange={(e) => setAgreedToTerms(e.target.checked)}
        className="mt-0.5 w-4 h-4 rounded border-white/20 text-[#ff5fb8] focus:ring-0 focus:ring-offset-0 bg-transparent shrink-0 cursor-pointer"
      />
      <span className="leading-snug">
        I understand gate/entry fee is paid at the venue, and I want Minglee to
        record that I'm attending this event.
      </span>
    </label>
  );
}

function Alert({ tone, text }: { tone: "error" | "success"; text: string }) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-xs sm:text-sm ${
        tone === "error"
          ? "border-red-500/40 bg-red-500/10 text-red-200"
          : "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
      }`}
    >
      {text}
    </div>
  );
}
