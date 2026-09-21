import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Send,
  Play,
  Users,
  Bell,
  Heart,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Lock,
} from "lucide-react";
import API from "@/api/client";
import { APP_CONFIG } from "@/config/app";

interface AdminStats {
  totalUsers: number;
  onboardedUsers: number;
  pushSubscriptions: number;
  totalMatches: number;
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

export default function AdminPage() {
  const [adminSecret, setAdminSecret] = useState("minglee_admin_secret_2026");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Notification Composer state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [targetAudience, setTargetAudience] = useState("all");
  const [targetUserId, setTargetUserId] = useState("");
  const [actionUrl, setActionUrl] = useState("/date");
  const [sendingPush, setSendingPush] = useState(false);
  const [pushStatus, setPushStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Matching trigger state
  const [runningMatch, setRunningMatch] = useState(false);
  const [matchStatus, setMatchStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Stats state
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentMatches, setRecentMatches] = useState<RecentMatch[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("minglee-admin-key");
      if (stored) {
        setAdminSecret(stored);
        setIsAuthenticated(true);
      }
    }
  }, []);

  const loadStats = async (key: string) => {
    try {
      setLoadingStats(true);
      const res = await API.get("/admin/stats", {
        headers: { "x-admin-secret": key },
      });
      if (res.data) {
        setStats(res.data.stats);
        setRecentMatches(res.data.recentMatches || []);
        setIsAuthenticated(true);
        localStorage.setItem("minglee-admin-key", key);
      }
    } catch (err: any) {
      console.warn("Failed to load admin stats:", err);
      setIsAuthenticated(false);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (adminSecret) {
      loadStats(adminSecret);
    }
  }, []);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;

    try {
      setSendingPush(true);
      setPushStatus(null);
      const res = await API.post(
        "/admin/notifications/send",
        {
          title,
          body,
          url: actionUrl,
          targetAudience,
          targetUserId: targetAudience === "single" ? targetUserId : undefined,
        },
        {
          headers: { "x-admin-secret": adminSecret },
        }
      );

      setPushStatus({
        type: "success",
        message: res.data?.message || "Notification successfully sent!",
      });
      setTitle("");
      setBody("");
      loadStats(adminSecret);
    } catch (err: any) {
      setPushStatus({
        type: "error",
        message: err.response?.data?.message || err.message || "Failed to send notification",
      });
    } finally {
      setSendingPush(false);
    }
  };

  const handleTriggerMatching = async () => {
    if (!confirm("Are you sure you want to execute the Friday matching cycle now? This will pair eligible users and send push notifications.")) {
      return;
    }

    try {
      setRunningMatch(true);
      setMatchStatus(null);
      const res = await API.post(
        "/admin/matching/run",
        {},
        {
          headers: { "x-admin-secret": adminSecret },
        }
      );

      setMatchStatus({
        type: "success",
        message: `Matching complete! Generated ${res.data?.result?.count || 0} matches. Push notifications sent!`,
      });
      loadStats(adminSecret);
    } catch (err: any) {
      setMatchStatus({
        type: "error",
        message: err.response?.data?.message || err.message || "Matching cycle failed",
      });
    } finally {
      setRunningMatch(false);
    }
  };

  return (
    <>
      <Head>
        <title>{`Admin Panel | ${APP_CONFIG.name}`}</title>
      </Head>

      <div className="min-h-screen bg-[#0a0f1a] text-white selection:bg-pink-500/30">
        {/* Admin Header */}
        <header className="border-b border-white/10 bg-[#0c1220]/80 backdrop-blur-md sticky top-0 z-40">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-500/20 text-pink-300">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <span className="font-serif text-lg font-semibold tracking-wider">
                {APP_CONFIG.name.toUpperCase()} ADMIN
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/date"
                className="text-xs text-white/60 hover:text-white transition-colors"
              >
                Back to App
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-8">
          {/* Admin Secret Bar */}
          <div className="rounded-2xl border border-white/10 bg-[#0c1220] p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Lock className="w-4 h-4 text-pink-400 shrink-0" />
              <span className="text-xs text-white/50 uppercase tracking-wider font-medium">Admin Secret Key:</span>
              <input
                type="password"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                placeholder="Enter admin secret..."
                className="bg-[#0a0f1a] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500/50 flex-1"
              />
            </div>
            <button
              type="button"
              onClick={() => loadStats(adminSecret)}
              className="h-8 px-4 rounded-full bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors cursor-pointer w-full sm:w-auto"
            >
              Verify & Refresh
            </button>
          </div>

          {/* Metrics Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-white/10 bg-[#0c1220] p-4">
              <div className="flex items-center justify-between text-white/40 mb-2">
                <span className="text-xs uppercase tracking-wider font-medium">Total Users</span>
                <Users className="w-4 h-4" />
              </div>
              <span className="text-2xl sm:text-3xl font-serif font-semibold text-white">
                {stats?.totalUsers ?? "-"}
              </span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0c1220] p-4">
              <div className="flex items-center justify-between text-pink-400/60 mb-2">
                <span className="text-xs uppercase tracking-wider font-medium">Ready for Match</span>
                <Sparkles className="w-4 h-4 text-pink-400" />
              </div>
              <span className="text-2xl sm:text-3xl font-serif font-semibold text-pink-300">
                {stats?.onboardedUsers ?? "-"}
              </span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0c1220] p-4">
              <div className="flex items-center justify-between text-emerald-400/60 mb-2">
                <span className="text-xs uppercase tracking-wider font-medium">Push Devices</span>
                <Bell className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-2xl sm:text-3xl font-serif font-semibold text-emerald-300">
                {stats?.pushSubscriptions ?? "-"}
              </span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0c1220] p-4">
              <div className="flex items-center justify-between text-purple-400/60 mb-2">
                <span className="text-xs uppercase tracking-wider font-medium">Total Matches</span>
                <Heart className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-2xl sm:text-3xl font-serif font-semibold text-purple-300">
                {stats?.totalMatches ?? "-"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Custom Push Notification Composer */}
            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-2xl md:rounded-3xl border border-white/10 bg-[#0c1220] p-6 shadow-xl space-y-5">
                <div>
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-pink-400" />
                    <h2 className="font-serif text-xl sm:text-2xl text-white tracking-tight">
                      Send Custom Push Notification
                    </h2>
                  </div>
                  <p className="text-xs text-white/50 mt-1">
                    Type and broadcast non-scheduled push notifications to all subscribed students instantly.
                  </p>
                </div>

                {pushStatus && (
                  <div
                    className={`rounded-xl p-3 flex items-start gap-2.5 text-xs ${
                      pushStatus.type === "success"
                        ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                        : "bg-red-500/10 border border-red-500/30 text-red-300"
                    }`}
                  >
                    {pushStatus.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{pushStatus.message}</span>
                  </div>
                )}

                <form onSubmit={handleSendNotification} className="space-y-4">
                  <div>
                    <label className="text-xs text-white/70 block mb-1 font-medium">
                      Notification Title
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. ❤️ Friday Matches Are Ready!"
                      className="w-full rounded-xl border border-white/10 bg-[#0a0f1a] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-white/70 block mb-1 font-medium">
                      Notification Message Body
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="e.g. Open Minglee now to see your Friday match and start planning your date!"
                      className="w-full rounded-xl border border-white/10 bg-[#0a0f1a] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-white/70 block mb-1 font-medium">
                        Target Audience
                      </label>
                      <select
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#0a0f1a] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
                      >
                        <option value="all">Broadcast to All Subscribed Devices</option>
                        <option value="single">Specific User (UUID)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-white/70 block mb-1 font-medium">
                        On-Click Destination URL
                      </label>
                      <input
                        type="text"
                        value={actionUrl}
                        onChange={(e) => setActionUrl(e.target.value)}
                        placeholder="/date or /events"
                        className="w-full rounded-xl border border-white/10 bg-[#0a0f1a] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500"
                      />
                    </div>
                  </div>

                  {targetAudience === "single" && (
                    <div>
                      <label className="text-xs text-white/70 block mb-1 font-medium">
                        Target User ID
                      </label>
                      <input
                        type="text"
                        value={targetUserId}
                        onChange={(e) => setTargetUserId(e.target.value)}
                        placeholder="User UUID..."
                        className="w-full rounded-xl border border-white/10 bg-[#0a0f1a] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={sendingPush || !title || !body}
                    className="h-11 w-full cursor-pointer rounded-full bg-white px-6 font-sans text-sm font-semibold text-[#0a0f1a] transition-all hover:bg-white/90 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{sendingPush ? "Dispatching..." : "Broadcast Push Notification"}</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Matching Operations & Status */}
            <div className="lg:col-span-5 space-y-6">
              {/* Friday Matching Trigger Box */}
              <div className="rounded-2xl md:rounded-3xl border border-white/10 bg-[#0c1220] p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-400" />
                  <h2 className="font-serif text-xl text-white tracking-tight">
                    Execute Match Cycle
                  </h2>
                </div>
                <p className="text-xs text-white/50 leading-relaxed">
                  Triggers the Gale-Shapley matching algorithm for all onboarded males and females. Generates matches in the database and sends push notifications to all paired users.
                </p>

                {matchStatus && (
                  <div
                    className={`rounded-xl p-3 flex items-start gap-2.5 text-xs ${
                      matchStatus.type === "success"
                        ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                        : "bg-red-500/10 border border-red-500/30 text-red-300"
                    }`}
                  >
                    {matchStatus.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{matchStatus.message}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleTriggerMatching}
                  disabled={runningMatch}
                  className="h-11 w-full cursor-pointer rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-sans text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{runningMatch ? "Running Gale-Shapley Matching..." : "Run Friday Matching Cycle Now"}</span>
                </button>
              </div>

              {/* Recent Matches */}
              <div className="rounded-2xl md:rounded-3xl border border-white/10 bg-[#0c1220] p-6 shadow-xl space-y-3">
                <h3 className="font-serif text-lg text-white tracking-tight">Recent Matches</h3>
                {recentMatches.length === 0 ? (
                  <p className="text-xs text-white/40 py-4 text-center">No matches recorded yet.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {recentMatches.map((m) => (
                      <div
                        key={m.id}
                        className="rounded-xl border border-white/5 bg-[#0a0f1a] p-2.5 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="text-white/80 font-mono block">
                            {m.user1_id.slice(0, 6)}... ↔ {m.user2_id.slice(0, 6)}...
                          </span>
                          <span className="text-[10px] text-white/40">Week of {m.match_week}</span>
                        </div>
                        <span className="rounded-full bg-pink-500/20 px-2 py-0.5 text-[10px] font-semibold text-pink-300">
                          {m.match_score}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
