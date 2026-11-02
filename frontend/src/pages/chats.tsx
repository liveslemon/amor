"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Search, Heart, MessageCircle, Send, History } from "lucide-react";
import { fetchCurrentMatch } from "@/api/matches";
import { fetchMessages, sendMessage as sendMatchMessage, MatchMessage } from "@/api/messages";
import { useAuthStore } from "@/store/useAuthStore";
import { APP_CONFIG } from "@/config/app";

interface CurrentMatch {
  match_id: string;
  blocked?: boolean;
  partner: {
    id?: string;
    name: string;
    whatsapp_number: string | null;
    photos?: Array<{ image_url: string }>;
  };
}

// A message we've shown locally before the server has confirmed it.
interface LocalMessage extends MatchMessage {
  status?: "sending" | "failed";
}

const MESSAGE_POLL_MS = 4000;

export default function ChatsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [searchQuery, setSearchQuery] = useState("");
  const [match, setMatch] = useState<CurrentMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMessageAtRef = useRef<string | undefined>(undefined);

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
        setMatch(await fetchCurrentMatch<CurrentMatch>(user?.id));
      } finally {
        setLoading(false);
      }
    };

    fetchCurrent();
  }, [router, user?.id]);

  // The poll (every 4s) and the optimistic append on send can both land the
  // same message: merge by id instead of assuming they're disjoint.
  const mergeMessages = (prev: LocalMessage[], incoming: MatchMessage[]) => {
    if (incoming.length === 0) return prev;
    const seen = new Set(prev.map((m) => m.id));
    const unique = incoming.filter((m) => !seen.has(m.id));
    return unique.length === 0 ? prev : [...prev, ...unique];
  };

  const advanceCursor = (createdAt: string) => {
    if (!lastMessageAtRef.current || createdAt > lastMessageAtRef.current) {
      lastMessageAtRef.current = createdAt;
    }
  };

  const pollMessages = useCallback(async (matchId: string) => {
    try {
      const incoming = await fetchMessages(matchId, lastMessageAtRef.current);
      if (incoming.length === 0) return;
      advanceCursor(incoming[incoming.length - 1].created_at);
      setMessages((prev) => mergeMessages(prev, incoming));
    } catch (error) {
      console.error("Could not refresh match messages:", error);
    }
  }, []);

  useEffect(() => {
    if (!match?.match_id) return;

    setMessages([]);
    lastMessageAtRef.current = undefined;
    pollMessages(match.match_id);

    const timer = setInterval(() => pollMessages(match.match_id), MESSAGE_POLL_MS);
    return () => clearInterval(timer);
  }, [match?.match_id, pollMessages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Shows the message in the thread immediately with a "sending" state,
  // then swaps it for the server's version (or flags it as failed) once
  // the request resolves — so the UI never waits on the network to feel
  // responsive.
  const sendText = async (body: string, clientId: string, matchId: string) => {
    try {
      const sent = await sendMatchMessage(matchId, body);
      advanceCursor(sent.created_at);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === clientId
            // An undelivered message (recipient has blocked us) stays in the
            // same grey "sending" look forever — no error, no tip-off.
            ? { ...sent, status: sent.undelivered ? "sending" : undefined }
            : m,
        ),
      );
    } catch (error) {
      console.error("Could not send message:", error);
      setMessages((prev) =>
        prev.map((m) => (m.id === clientId ? { ...m, status: "failed" } : m)),
      );
    }
  };

  const handleSend = (event: React.FormEvent) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body || !match?.match_id || !user?.id) return;

    const clientId = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const optimisticMessage: LocalMessage = {
      id: clientId,
      match_id: match.match_id,
      sender_id: user.id,
      body,
      created_at: new Date().toISOString(),
      read_at: null,
      status: "sending",
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setDraft("");
    sendText(body, clientId, match.match_id);
  };

  const handleRetry = (failedMessage: LocalMessage) => {
    if (!match?.match_id) return;
    setMessages((prev) =>
      prev.map((m) => (m.id === failedMessage.id ? { ...m, status: "sending" } : m)),
    );
    sendText(failedMessage.body, failedMessage.id, match.match_id);
  };

  const handleWhatsAppChat = () => {
    if (!match?.partner?.whatsapp_number) return;
    const clean = match.partner.whatsapp_number.replace("+", "");
    const text = encodeURIComponent(
      `Hey ${match.partner.name}! I got you as my Friday match on Minglee 😊`
    );
    window.open(`https://wa.me/${clean}?text=${text}`, "_blank");
  };

  return (
    <>
      <Head>
        <title>{APP_CONFIG.name} | Chats</title>
      </Head>

      <div className="min-h-screen bg-[#000B1A] text-[#F8F9FA] pb-28">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-30 bg-[#000B1A] border-b border-white/5 px-4 py-3.5">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <h1 className="font-serif text-xl tracking-tight text-white">
              Chats
            </h1>
            <span className="text-xs text-white/40">Direct Messages</span>
          </div>
        </header>

        <main className="max-w-md md:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-24 pb-28 md:pb-16 space-y-6">
          {/* Desktop Header Banner */}
          <div className="hidden md:flex items-end justify-between pb-4 border-b border-white/5">
            <div>
              <h1 className="font-serif text-3xl font-light tracking-tight text-white">
                Conversations
              </h1>
              <p className="text-sm text-white/50 mt-1">
                Your Friday date connection, community archive, and concierge support.
              </p>
            </div>
            <div className="w-72 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 rounded-full bg-white/[0.04] text-xs text-white placeholder-white/40 focus:outline-none focus:bg-white/[0.07] transition-colors"
              />
            </div>
          </div>

          {/* Mobile Search Box */}
          <div className="md:hidden relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white/[0.04] text-xs text-white placeholder-white/40 focus:outline-none focus:bg-white/[0.07] transition-colors"
            />
          </div>

          {/* Current Date & Past Dates */}
          <div className="max-w-2xl space-y-5">
              {/* CURRENT DATE CHAT */}
              <div className="space-y-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40 px-1">
                  Current Date
                </span>

                {loading ? (
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#0c1322] border border-white/5 space-y-4 animate-pulse">
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-full bg-white/[0.06]" />
                      <div className="space-y-1.5">
                        <div className="h-4 w-28 rounded-full bg-white/[0.06]" />
                        <div className="h-3 w-20 rounded-full bg-white/[0.04]" />
                      </div>
                    </div>
                    <div className="h-72 rounded-xl bg-white/[0.03]" />
                    <div className="h-10 w-full rounded-full bg-white/[0.04]" />
                  </div>
                ) : match ? (
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#0c1322] border border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3.5">
                        <div className="relative w-14 h-14 rounded-full bg-[#141c2e] overflow-hidden flex items-center justify-center">
                          {match.partner.photos && match.partner.photos[0] ? (
                            <img
                              src={match.partner.photos[0].image_url}
                              alt={match.partner.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Heart className="w-6 h-6 text-[#FFB6C1]" />
                          )}
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0c1322]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-serif text-lg text-white">
                              {match.partner.name}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-[#FFB6C1]">
                              Friday Match
                            </span>
                          </div>
                          <p className="text-xs text-white/50 mt-1">In-app chat</p>
                        </div>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FFB6C1]" />
                    </div>

                    {/* In-app message thread */}
                    <div
                      ref={scrollRef}
                      className="h-72 overflow-y-auto scrollbar-whisper rounded-xl bg-black/20 p-3 space-y-2 flex flex-col"
                    >
                      {messages.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-center">
                          <p className="text-xs text-white/40 px-6">
                            Say hello to {match.partner.name} — your conversation stays here all week.
                          </p>
                        </div>
                      ) : (
                        messages.map((m) => {
                          const mine = m.sender_id === user?.id;
                          return (
                            <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                              <div
                                className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                                  mine
                                    ? `bg-[#FFB6C1] text-[#1a0a10] ${
                                        m.status === "sending" || m.undelivered ? "opacity-60" : ""
                                      }`
                                    : "bg-white/[0.08] text-white"
                                } ${m.status === "failed" ? "opacity-60 border border-red-400/40" : ""}`}
                              >
                                {m.body}
                              </div>
                              {m.status === "failed" && (
                                <button
                                  type="button"
                                  onClick={() => handleRetry(m)}
                                  className="mt-1 text-[10px] text-red-300 hover:text-red-200 cursor-pointer"
                                >
                                  Failed to send · Tap to retry
                                </button>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    {match.blocked ? (
                      <div className="rounded-xl bg-white/[0.04] p-3.5 text-center">
                        <p className="text-xs text-white/60">
                          You've blocked this member. You can no longer message each other.
                        </p>
                      </div>
                    ) : (
                      <>
                        <form onSubmit={handleSend} className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            placeholder={`Message ${match.partner.name}...`}
                            maxLength={2000}
                            className="flex-1 rounded-full bg-white/[0.06] px-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:bg-white/[0.1] transition-colors"
                          />
                          <button
                            type="submit"
                            disabled={!draft.trim()}
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FFB6C1] text-[#1a0a10] disabled:opacity-40 disabled:cursor-not-allowed transition-opacity cursor-pointer shrink-0"
                            aria-label="Send message"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </form>

                        <div className="flex gap-2.5 pt-1 border-t border-white/5 mt-1">
                          <button
                            onClick={handleWhatsAppChat}
                            className="flex-1 flex items-center justify-center gap-2 rounded-full bg-emerald-600/90 hover:bg-emerald-500 text-white py-2 text-xs font-medium transition-colors cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Continue on WhatsApp</span>
                          </button>
                          <Link
                            href="/date"
                            className="flex items-center justify-center px-5 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors"
                          >
                            View Dossier
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-[#0c1322] border border-white/5 text-center space-y-1.5">
                    <p className="text-sm text-white/70">
                      No active date conversation.
                    </p>
                    <p className="text-xs text-white/40">
                      Your next Friday match chat will appear right here at 8:00 AM.
                    </p>
                  </div>
                )}
              </div>

              {/* PAST DATES CHAT ARCHIVE */}
              <div className="space-y-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40 px-1">
                  Past Dates
                </span>

                <div className="rounded-2xl border border-white/10 bg-[#0c1322] p-8 text-center">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
                    <History className="h-4 w-4 text-white/40" />
                  </div>
                  <p className="text-xs text-white/40">
                    Past conversations will appear here once you've had a few Friday dates.
                  </p>
                </div>
              </div>
            </div>
        </main>
      </div>
    </>
  );
}
