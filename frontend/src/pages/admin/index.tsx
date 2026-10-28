import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  Send,
  Play,
  Users,
  Bell,
  Heart,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Lock,
  Layers,
  Eye,
  Check,
  X,
  MapPin,
  Ticket,
  Megaphone,
  UserCheck,
  UserX,
  ExternalLink,
  Clock,
  Sparkles,
} from "lucide-react";
import API from "@/api/client";
import { APP_CONFIG } from "@/config/app";

interface AdminStats {
  totalUsers: number;
  onboardedUsers: number;
  activeUsers: number;
  pushSubscriptions: number;
  totalMatches: number;
  totalDates: number;
  pushNotificationsCount: number;
  popupsCount: number;
}

interface WeekDaySchedule {
  date: string;
  day: string;
  isToday: boolean;
  matchesCount: number;
  bannersCount: number;
  notificationsCount: number;
  popupsCount: number;
  totalSlotsUsed: number;
}

interface AdCategoryStats {
  banner: number;
  notification: number;
  popup: number;
  ticket_boost: number;
}

interface PendingAd {
  id: string;
  user_id?: string;
  ad_type: "banner" | "notification" | "popup" | "ticket_boost";
  title: string;
  text_content?: string;
  image_url?: string;
  target_url?: string;
  popup_id?: string;
  scheduled_date: string;
  status: string;
  created_at: string;
  users?: {
    id: string;
    name: string;
    whatsapp_number: string;
    is_flagged: boolean;
    flag_reason?: string;
  };
}

interface PendingTicket {
  id: string;
  event_name: string;
  event_description?: string;
  ticket_type?: string;
  ticket_price: number;
  location?: string;
  event_picture: string;
  event_day: string;
  status?: string;
}

interface FlaggedUser {
  id: string;
  name: string;
  whatsapp_number: string;
  role: string;
  is_flagged: boolean;
  flag_reason?: string;
  open_report_count?: number;
  open_report_reasons?: string[];
  created_at: string;
  user_profiles?: {
    gender?: string;
    age?: number;
    height?: number;
    build?: string;
    skin_tone?: string;
    social_persona?: string;
    conflict_style?: string;
    relationship_goal?: string;
    green_flag?: string;
    instagram?: string;
  };
  user_photos?: Array<{
    id: string;
    image_url: string;
    photo_type?: string;
    upload_order?: number;
  }>;
}

interface RecentMatch {
  id: string;
  user1_id: string;
  user2_id: string;
  match_score: number;
  match_week: string;
  status: string;
  created_at: string;
}

// Backend errors come back as { error, details } (validation details from zod);
// some endpoints use message or reason instead.
type ApiErrorBody = {
  error?: string;
  message?: string;
  reason?: string;
  details?: { formErrors?: string[]; fieldErrors?: Record<string, string[]> };
};

function adminErrorText(err: unknown, fallback: string): string {
  const e = err as { message?: string; response?: { data?: ApiErrorBody } } | undefined;
  const data = e?.response?.data;
  if (!data) return e?.message ? `${fallback} (${e.message})` : fallback;
  const base = data.reason || data.message || data.error || fallback;
  const details = data.details;
  const problems = [
    ...(details?.formErrors ?? []),
    ...Object.entries(details?.fieldErrors ?? {}).map(
      ([field, msgs]) => `${field}: ${msgs.join(", ")}`,
    ),
  ];
  return problems.length ? `${base} (${problems.join("; ")})` : base;
}

export default function AdminPage() {
  const [adminSecret, setAdminSecret] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "ads" | "tickets" | "flagged" | "push">("overview");

  // Telemetry data
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [datesOfWeek, setDatesOfWeek] = useState<WeekDaySchedule[]>([]);
  const [adCategories, setAdCategories] = useState<AdCategoryStats>({
    banner: 0,
    notification: 0,
    popup: 0,
    ticket_boost: 0,
  });
  const [recentMatches, setRecentMatches] = useState<RecentMatch[]>([]);
  const [pendingAds, setPendingAds] = useState<PendingAd[]>([]);
  const [pendingTickets, setPendingTickets] = useState<PendingTicket[]>([]);
  const [flaggedUsers, setFlaggedUsers] = useState<FlaggedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Notification Composer state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [targetAudience, setTargetAudience] = useState("all");
  const [targetUserId, setTargetUserId] = useState("");
  const [actionUrl, setActionUrl] = useState("/date");
  const [sendingPush, setSendingPush] = useState(false);

  // Matching trigger state
  const [runningMatch, setRunningMatch] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("minglee-admin-key");
      if (stored) {
        setAdminSecret(stored);
        setIsAuthenticated(true);
      }
    }
  }, []);

  const loadAllData = async (key: string) => {
    if (!key) return;
    setLoading(true);
    try {
      const headers = { "x-admin-secret": key };
      const [statsRes, adsRes, ticketsRes, flaggedRes] = await Promise.all([
        API.get("/admin/stats", { headers }),
        API.get("/admin/ads/pending", { headers }),
        API.get("/admin/tickets/pending", { headers }),
        API.get("/admin/users/flagged", { headers }),
      ]);

      if (statsRes.data?.success) {
        setStats(statsRes.data.stats);
        setDatesOfWeek(statsRes.data.datesOfTheWeek || []);
        setAdCategories(statsRes.data.adCategories || { banner: 0, notification: 0, popup: 0, ticket_boost: 0 });
        setRecentMatches(statsRes.data.recentMatches || []);
        setIsAuthenticated(true);
        localStorage.setItem("minglee-admin-key", key);
      }

      if (adsRes.data?.data) {
        setPendingAds(adsRes.data.data);
      }

      if (ticketsRes.data?.data) {
        setPendingTickets(ticketsRes.data.data);
      }

      if (flaggedRes.data?.data) {
        setFlaggedUsers(flaggedRes.data.data);
      }
    } catch (err: any) {
      console.warn("Admin fetch failed:", err);
      const status = err.response?.status;
      if (status === 401 || status === 503) {
        // Wrong secret, or ADMIN_SECRET isn't set on the server.
        localStorage.removeItem("minglee-admin-key");
        setIsAuthenticated(false);
      }
      setActionMessage({ type: "error", text: adminErrorText(err, "Could not load admin data") });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminSecret) {
      loadAllData(adminSecret);
    }
  }, [adminSecret]);

  // Review Ad (Approve / Deny)
  const handleReviewAd = async (adId: string, action: "approve" | "reject", reason?: string) => {
    try {
      setActionMessage(null);
      const res = await API.post(
        `/admin/ads/${adId}/review`,
        {
          action,
          rejection_reason: reason || (action === "reject" ? "Clashing of dates with another advert" : undefined),
        },
        { headers: { "x-admin-secret": adminSecret } }
      );

      if (res.data?.success) {
        setActionMessage({
          type: "success",
          text: `Advertisement ${action === "approve" ? "approved" : "denied successfully"}.`,
        });
        loadAllData(adminSecret);
      }
    } catch (err: any) {
      const errMsg =
        err.response?.status === 409 && !err.response?.data?.reason
          ? "Clashing of dates with another advert"
          : adminErrorText(err, "Review action failed");
      setActionMessage({ type: "error", text: errMsg });
    }
  };

  // Review Ticket (Approve / Deny)
  const handleReviewTicket = async (ticketId: string, action: "approve" | "reject") => {
    try {
      setActionMessage(null);
      const res = await API.post(
        `/admin/tickets/${ticketId}/review`,
        { action },
        { headers: { "x-admin-secret": adminSecret } }
      );

      if (res.data?.success) {
        setActionMessage({
          type: "success",
          text: `Ticket event ${action === "approve" ? "approved" : "rejected"}.`,
        });
        loadAllData(adminSecret);
      }
    } catch (err: any) {
      setActionMessage({ type: "error", text: adminErrorText(err, "Ticket review failed") });
    }
  };

  // Unflag User Profile
  const handleUnflagUser = async (userId: string) => {
    try {
      setActionMessage(null);
      const res = await API.post(
        `/admin/users/${userId}/flag`,
        { is_flagged: false, flag_reason: null },
        { headers: { "x-admin-secret": adminSecret } }
      );

      if (res.data?.success) {
        setActionMessage({ type: "success", text: "User profile unflagged and restored to good standing." });
        loadAllData(adminSecret);
      }
    } catch (err: any) {
      setActionMessage({ type: "error", text: adminErrorText(err, "Could not unflag user profile.") });
    }
  };

  // Broadcast Custom Notification
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;

    try {
      setSendingPush(true);
      setActionMessage(null);
      const res = await API.post(
        "/admin/notifications/send",
        {
          title,
          body,
          url: actionUrl,
          targetAudience,
          targetUserId: targetAudience === "single" ? targetUserId : undefined,
        },
        { headers: { "x-admin-secret": adminSecret } }
      );

      setActionMessage({
        type: "success",
        text: res.data?.message || "Notification dispatched to inboxes.",
      });
      setTitle("");
      setBody("");
      loadAllData(adminSecret);
    } catch (err: any) {
      setActionMessage({
        type: "error",
        text: adminErrorText(err, "Failed to dispatch notification."),
      });
    } finally {
      setSendingPush(false);
    }
  };

  // Run Friday Matching Cycle
  const handleTriggerMatching = async () => {
    if (!confirm("Are you sure you want to execute the matching cycle now? This will pair eligible users and send notifications.")) {
      return;
    }

    try {
      setRunningMatch(true);
      setActionMessage(null);
      const res = await API.post(
        "/admin/matching/run",
        {},
        { headers: { "x-admin-secret": adminSecret } }
      );

      setActionMessage({
        type: "success",
        text: res.data?.message || "Matching cycle complete.",
      });
      loadAllData(adminSecret);
    } catch (err: any) {
      setActionMessage({ type: "error", text: adminErrorText(err, "Matching cycle failed") });
    } finally {
      setRunningMatch(false);
    }
  };

  return (
    <>
      <Head>
        <title>{`Admin Command Center | ${APP_CONFIG.name}`}</title>
      </Head>

      <div className="min-h-screen bg-[#000B1A] text-white">
        {/* Navigation Bar */}
        <header className="border-b border-white/10 bg-[#0a0f1a]/90 backdrop-blur-md sticky top-0 z-40">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-[#FFB6C1]">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <span className="font-serif text-lg font-semibold tracking-wider">
                MINGLEE ADMIN
              </span>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/business"
                className="text-xs text-white/60 hover:text-white transition-colors"
              >
                Business Suite
              </Link>
              <Link
                href="/date"
                className="text-xs text-white/60 hover:text-white transition-colors"
              >
                App
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-8">
          {/* Secret Key Bar */}
          <div className="rounded-2xl border border-white/10 bg-[#0c1322] p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 w-full sm:w-auto flex-1">
              <Lock className="w-4 h-4 text-[#FFB6C1] shrink-0" />
              <span className="text-xs text-white/50 uppercase tracking-wider font-medium shrink-0">
                Admin Secret:
              </span>
              <input
                type="password"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                placeholder="Enter admin secret..."
                className="bg-[#0a0f1a] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FFB6C1] flex-1 max-w-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => loadAllData(adminSecret)}
              className="h-8 px-4 rounded-full bg-white text-[#000B1A] hover:bg-white/90 text-xs font-medium transition-colors cursor-pointer w-full sm:w-auto"
            >
              Verify & Refresh
            </button>
          </div>

          {/* Action Feedback Alerts */}
          {actionMessage && (
            <div
              className={`rounded-xl border p-4 text-xs flex items-center gap-3 ${
                actionMessage.type === "success"
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                  : "border-red-500/20 bg-red-500/10 text-red-300"
              }`}
            >
              {actionMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              )}
              <span>{actionMessage.text}</span>
            </div>
          )}

          {/* Tab Selection */}
          <nav className="flex gap-2 border-b border-white/10 pb-3 overflow-x-auto">
            {[
              { id: "overview", label: "Overview & Calendar" },
              { id: "ads", label: `Ads (${pendingAds.length})` },
              { id: "tickets", label: `Tickets (${pendingTickets.length})` },
              { id: "flagged", label: `Flagged Profiles (${flaggedUsers.length})` },
              { id: "push", label: "Notification Dispatcher" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as any)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === t.id
                    ? "bg-white text-[#000B1A]"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>

          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Telemetry KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="rounded-2xl border border-white/10 bg-[#0c1322] p-4">
                  <span className="text-[11px] text-white/40 uppercase tracking-wider block mb-1">
                    Active Users
                  </span>
                  <span className="font-serif text-2xl sm:text-3xl font-semibold text-white">
                    {stats?.activeUsers ?? "-"}
                  </span>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#0c1322] p-4">
                  <span className="text-[11px] text-white/40 uppercase tracking-wider block mb-1">
                    Total Dates
                  </span>
                  <span className="font-serif text-2xl sm:text-3xl font-semibold text-white">
                    {stats?.totalDates ?? stats?.totalMatches ?? "-"}
                  </span>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#0c1322] p-4">
                  <span className="text-[11px] text-white/40 uppercase tracking-wider block mb-1">
                    Push Notifications
                  </span>
                  <span className="font-serif text-2xl sm:text-3xl font-semibold text-[#FFB6C1]">
                    {stats?.pushNotificationsCount ?? "-"}
                  </span>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#0c1322] p-4">
                  <span className="text-[11px] text-white/40 uppercase tracking-wider block mb-1">
                    Popups
                  </span>
                  <span className="font-serif text-2xl sm:text-3xl font-semibold text-[#FF69B4]">
                    {stats?.popupsCount ?? "-"}
                  </span>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#0c1322] p-4">
                  <span className="text-[11px] text-white/40 uppercase tracking-wider block mb-1">
                    Flagged Profiles
                  </span>
                  <span className="font-serif text-2xl sm:text-3xl font-semibold text-amber-300">
                    {flaggedUsers.length}
                  </span>
                </div>
              </div>

              {/* DATES OF THE WEEK TELEMETRY */}
              <div className="rounded-2xl border border-white/10 bg-[#0c1322] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-xl text-white">Dates of the Week</h2>
                    <p className="text-xs text-white/50 mt-0.5">
                      Weekly slot capacity and scheduled adverts across campus.
                    </p>
                  </div>
                  <span className="text-xs text-white/40 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#FFB6C1]" />
                    Monday – Sunday
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
                  {datesOfWeek.map((day) => (
                    <div
                      key={day.date}
                      className={`p-3 rounded-xl border text-xs space-y-2 ${
                        day.isToday
                          ? "border-[#FFB6C1] bg-white/[0.08]"
                          : "border-white/5 bg-[#0a0f1a]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-white">{day.day.slice(0, 3)}</span>
                        {day.isToday && (
                          <span className="text-[9px] uppercase tracking-wider bg-[#FFB6C1]/20 text-[#FFB6C1] px-1.5 py-0.5 rounded">
                            Today
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-white/40 block">{day.date.slice(5)}</span>
                      <div className="pt-2 border-t border-white/5 space-y-1 text-[10px]">
                        <div className="flex justify-between text-white/60">
                          <span>Banners (max 3):</span>
                          <span className={day.bannersCount >= 3 ? "text-red-400 font-semibold" : "text-white"}>
                            {day.bannersCount}/3
                          </span>
                        </div>
                        <div className="flex justify-between text-white/60">
                          <span>Notifications (max 1):</span>
                          <span className={day.notificationsCount >= 1 ? "text-red-400 font-semibold" : "text-white"}>
                            {day.notificationsCount}/1
                          </span>
                        </div>
                        <div className="flex justify-between text-white/60">
                          <span>Popups (max 1):</span>
                          <span className={day.popupsCount >= 1 ? "text-red-400 font-semibold" : "text-white"}>
                            {day.popupsCount}/1
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CATEGORY OF ADS USED */}
              <div className="rounded-2xl border border-white/10 bg-[#0c1322] p-6 space-y-4">
                <div>
                  <h2 className="font-serif text-xl text-white">Category of Ads Used</h2>
                  <p className="text-xs text-white/50 mt-0.5">
                    Cumulative breakdown by advertising and promotion format.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
                  <div className="p-4 rounded-xl border border-white/5 bg-[#0a0f1a] space-y-1">
                    <span className="text-xs text-white/50 block">Banner Ads</span>
                    <span className="font-serif text-2xl font-semibold text-white">{adCategories.banner}</span>
                    <span className="text-[10px] text-white/40 block">3 slots per day limit</span>
                  </div>
                  <div className="p-4 rounded-xl border border-white/5 bg-[#0a0f1a] space-y-1">
                    <span className="text-xs text-white/50 block">Notification Ads</span>
                    <span className="font-serif text-2xl font-semibold text-[#FFB6C1]">{adCategories.notification}</span>
                    <span className="text-[10px] text-white/40 block">1 slot per day limit (≥24h)</span>
                  </div>
                  <div className="p-4 rounded-xl border border-white/5 bg-[#0a0f1a] space-y-1">
                    <span className="text-xs text-white/50 block">Popup Ads</span>
                    <span className="font-serif text-2xl font-semibold text-[#FF69B4]">{adCategories.popup}</span>
                    <span className="text-[10px] text-white/40 block">1 slot per day limit (≥24h)</span>
                  </div>
                  <div className="p-4 rounded-xl border border-white/5 bg-[#0a0f1a] space-y-1">
                    <span className="text-xs text-white/50 block">Ticket Boosts</span>
                    <span className="font-serif text-2xl font-semibold text-white">{adCategories.ticket_boost}</span>
                    <span className="text-[10px] text-white/40 block">Event ticket spotlights</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ADS APPROVAL TAB */}
          {activeTab === "ads" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl text-white">Pending Advertisements</h2>
                  <p className="text-xs text-white/50 mt-0.5">
                    Review and approve submitted ads. Clashing adverts are automatically denied.
                  </p>
                </div>
                <span className="text-xs text-white/40">{pendingAds.length} pending review</span>
              </div>

              {pendingAds.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-[#0c1322] p-8 text-center text-xs text-white/40">
                  No pending advertisements in queue.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingAds.map((ad) => (
                    <div
                      key={ad.id}
                      className="rounded-2xl border border-white/10 bg-[#0c1322] p-5 space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] uppercase font-semibold text-[#FFB6C1]">
                            {ad.ad_type.replace("_", " ")}
                          </span>
                          <h3 className="font-serif text-lg text-white mt-1.5">{ad.title}</h3>
                        </div>
                        <span className="text-[11px] text-white/40 shrink-0">
                          {ad.scheduled_date}
                        </span>
                      </div>

                      {ad.image_url && (
                        <div className="aspect-video rounded-xl overflow-hidden bg-[#0a0f1a] border border-white/5">
                          <img src={ad.image_url} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}

                      {ad.text_content && (
                        <p className="text-xs text-white/70 line-clamp-3 bg-[#0a0f1a] p-3 rounded-xl border border-white/5">
                          {ad.text_content}
                        </p>
                      )}

                      <div className="text-[11px] text-white/40 space-y-1">
                        <div>Destination: <span className="text-white/70">{ad.target_url || "In-app"}</span></div>
                        {ad.users && (
                          <div className="flex items-center gap-1.5">
                            <span>Submitter:</span>
                            <span className="text-white/70">{ad.users.name || "Student"}</span>
                            {ad.users.is_flagged && (
                              <span className="rounded bg-red-500/20 px-1 text-[10px] text-red-300">
                                Flagged
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => handleReviewAd(ad.id, "approve")}
                          className="flex-1 h-9 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReviewAd(ad.id, "reject", "Clashing of dates with another advert")}
                          className="flex-1 h-9 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          Deny (Clash)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TICKETS APPROVAL TAB */}
          {activeTab === "tickets" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl text-white">Event Ticket Manager</h2>
                  <p className="text-xs text-white/50 mt-0.5">
                    Approve or deny submitted campus event tickets.
                  </p>
                </div>
                <span className="text-xs text-white/40">{pendingTickets.length} events</span>
              </div>

              {pendingTickets.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-[#0c1322] p-8 text-center text-xs text-white/40">
                  No ticket events in queue.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingTickets.map((t) => (
                    <div
                      key={t.id}
                      className="rounded-2xl border border-white/10 bg-[#0c1322] p-5 space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] uppercase font-semibold text-[#FFB6C1]">
                            {t.ticket_type || "Regular"}
                          </span>
                          <h3 className="font-serif text-lg text-white mt-1.5">{t.event_name}</h3>
                        </div>
                        <span className="text-xs font-semibold text-emerald-400">
                          ₦{t.ticket_price > 0 ? Number(t.ticket_price).toLocaleString() : "Free RSVP"}
                        </span>
                      </div>

                      {t.event_picture && (
                        <div className="aspect-video rounded-xl overflow-hidden bg-[#0a0f1a] border border-white/5">
                          <img src={t.event_picture} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}

                      <p className="text-xs text-white/70 line-clamp-3 bg-[#0a0f1a] p-3 rounded-xl border border-white/5">
                        {t.event_description || "No description provided."}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-white/40 pt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#FFB6C1]" />
                          {t.location || "Campus"}
                        </span>
                        <span>{t.event_day}</span>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => handleReviewTicket(t.id, "approve")}
                          className="flex-1 h-9 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve Ticket
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReviewTicket(t.id, "reject")}
                          className="flex-1 h-9 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          Deny
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* FLAGGED PROFILES INSPECTOR TAB */}
          {activeTab === "flagged" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl text-white">Flagged User Profiles</h2>
                <p className="text-xs text-white/50 mt-0.5">
                  If a user has been flagged, their full profile and photos appear here for administrator inspection.
                </p>
              </div>

              {flaggedUsers.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-[#0c1322] p-8 text-center text-xs text-white/40">
                  No flagged user profiles. All campus members in good standing.
                </div>
              ) : (
                <div className="space-y-6">
                  {flaggedUsers.map((u) => (
                    <div
                      key={u.id}
                      className="rounded-2xl border border-red-500/20 bg-[#0c1322] p-6 space-y-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-serif text-xl text-white">{u.name}</h3>
                            {u.is_flagged && (
                              <span className="rounded-full bg-red-500/20 border border-red-500/30 px-2 py-0.5 text-[10px] font-semibold text-red-300">
                                FLAGGED
                              </span>
                            )}
                            {!!u.open_report_count && (
                              <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                                {u.open_report_count} OPEN REPORT{u.open_report_count === 1 ? "" : "S"}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-white/40 mt-1">
                            WhatsApp: {u.whatsapp_number} · User ID: {u.id.slice(0, 8)}...
                          </p>
                          {u.is_flagged && (
                            <p className="text-xs text-red-200 mt-2 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                              Flag reason: {u.flag_reason || "Flagged by administrator"}
                            </p>
                          )}
                          {!!u.open_report_reasons?.length && (
                            <p className="text-xs text-amber-200 mt-2 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                              Reported for: {u.open_report_reasons.join(", ")}
                            </p>
                          )}
                        </div>

                        {u.is_flagged ? (
                          <button
                            type="button"
                            onClick={() => handleUnflagUser(u.id)}
                            className="h-9 px-4 rounded-full bg-emerald-500/20 hover:bg-emerald-500 text-emerald-200 hover:text-black font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            Clear Flag
                          </button>
                        ) : (
                          <span className="text-[10px] text-white/30 shrink-0 max-w-[9rem] text-right">
                            Not admin-flagged. Reports stay listed until resolved.
                          </span>
                        )}
                      </div>

                      {/* Profile Photos (Downscaled, strictly max 2 images) */}
                      {u.user_photos && u.user_photos.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[11px] text-white/40 uppercase tracking-wider block">
                            Uploaded Profile Photos ({u.user_photos.length}/2):
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {u.user_photos.slice(0, 2).map((photo, i) => (
                              <div
                                key={photo.id || i}
                                className="aspect-square rounded-xl overflow-hidden bg-[#0a0f1a] border border-white/10"
                              >
                                <img
                                  src={photo.image_url}
                                  alt="Profile"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Extended Profile Traits */}
                      {u.user_profiles && (
                        <div className="rounded-xl border border-white/5 bg-[#0a0f1a] p-4 text-xs space-y-2">
                          <span className="text-[11px] text-white/40 uppercase tracking-wider block mb-1">
                            Profile Details:
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-white/70">
                            <div>Gender: <span className="text-white font-medium">{u.user_profiles.gender || "-"}</span></div>
                            <div>Age: <span className="text-white font-medium">{u.user_profiles.age || "-"}</span></div>
                            <div>Build: <span className="text-white font-medium">{u.user_profiles.build || "-"}</span></div>
                            <div>Goals: <span className="text-white font-medium">{u.user_profiles.relationship_goal || "-"}</span></div>
                            <div>Conflict: <span className="text-white font-medium">{u.user_profiles.conflict_style || "-"}</span></div>
                            <div>Persona: <span className="text-white font-medium">{u.user_profiles.social_persona || "-"}</span></div>
                            <div>Green Flag: <span className="text-white font-medium">{u.user_profiles.green_flag || "-"}</span></div>
                            <div>Instagram: <span className="text-white font-medium">{u.user_profiles.instagram || "-"}</span></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* NOTIFICATION DISPATCHER & MATCHING TAB */}
          {activeTab === "push" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Push Notification Composer */}
              <div className="lg:col-span-7 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-[#0c1322] p-6 space-y-5">
                  <div>
                    <h2 className="font-serif text-2xl text-white">Send Push Notification</h2>
                    <p className="text-xs text-white/50 mt-1">
                      Dispatch immediate broadcast or targeted alerts directly to student devices.
                    </p>
                  </div>

                  <form onSubmit={handleSendNotification} className="space-y-4">
                    <div>
                      <label className="text-xs text-white/70 block mb-1 font-medium">Title</label>
                      <input
                        required
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. ❤️ Friday Matches Are Ready!"
                        className="w-full rounded-xl border border-white/10 bg-[#0a0f1a] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFB6C1]"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-white/70 block mb-1 font-medium">Message Body</label>
                      <textarea
                        required
                        rows={3}
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Open Minglee to view your Friday match and start planning your date..."
                        className="w-full rounded-xl border border-white/10 bg-[#0a0f1a] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFB6C1] resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-white/70 block mb-1 font-medium">Target</label>
                        <select
                          value={targetAudience}
                          onChange={(e) => setTargetAudience(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#0a0f1a] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFB6C1]"
                        >
                          <option value="all">Broadcast to All Users</option>
                          <option value="single">Single User UUID</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs text-white/70 block mb-1 font-medium">Destination URL</label>
                        <input
                          type="text"
                          value={actionUrl}
                          onChange={(e) => setActionUrl(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#0a0f1a] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFB6C1]"
                        />
                      </div>
                    </div>

                    {targetAudience === "single" && (
                      <div>
                        <label className="text-xs text-white/70 block mb-1 font-medium">User UUID</label>
                        <input
                          type="text"
                          value={targetUserId}
                          onChange={(e) => setTargetUserId(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#0a0f1a] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFB6C1]"
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={sendingPush || !title || !body}
                      className="w-full h-11 rounded-full bg-white text-[#000B1A] font-semibold text-sm hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>{sendingPush ? "Dispatching..." : "Broadcast Push Notification"}</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Match Engine Controls */}
              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-2xl border border-white/10 bg-[#0c1322] p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-serif text-xl text-white">Execute Match Cycle</h3>
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Triggers the Gale-Shapley matching algorithm for all onboarded students. Generates matches in the database and sends notifications.
                  </p>
                  <button
                    type="button"
                    onClick={handleTriggerMatching}
                    disabled={runningMatch}
                    className="w-full h-11 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>{runningMatch ? "Running Algorithm..." : "Run Friday Matching Now"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
