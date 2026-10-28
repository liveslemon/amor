"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Search, Heart, MessageCircle } from "lucide-react";
import API from "@/api/client";
import { fetchCurrentMatch } from "@/api/matches";
import { useAuthStore } from "@/store/useAuthStore";
import { APP_CONFIG } from "@/config/app";

interface CurrentMatch {
  match_id: string;
  partner: {
    name: string;
    whatsapp_number: string;
    photos?: Array<{ image_url: string }>;
  };
}

interface MatchMessage {
  id: string;
  sender_id: string;
  text: string;
  created_at: string;
}

export default function ChatsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [searchQuery, setSearchQuery] = useState("");
  const [match, setMatch] = useState<CurrentMatch | null>(null);
  const [messages, setMessages] = useState<MatchMessage[]>([]);
  const [messageDraft, setMessageDraft] = useState("");
  const [messageError, setMessageError] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

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
      setMatch(await fetchCurrentMatch<CurrentMatch>(user?.id));
    };

    fetchCurrent();
  }, [router, user?.id]);

  useEffect(() => {
    if (!match?.match_id) return;
    let active = true;
    let interval: ReturnType<typeof setInterval> | undefined;

    const refreshMessages = async () => {
      try {
        const response = await API.get(
          `/matches/${encodeURIComponent(match.match_id)}/messages`,
        );
        if (!active) return false;
        const items =
          response.data?.data?.messages || response.data?.messages || [];
        setMessages(Array.isArray(items) ? items : []);
        setMessageError("");
        return true;
      } catch (error) {
        if (!active) return false;
        console.error("Could not load match messages:", error);
        setMessageError("In-app messaging is not connected to the backend yet.");
        if (interval) clearInterval(interval);
        return false;
      }
    };

    refreshMessages().then((loaded) => {
      if (active && loaded) {
        interval = setInterval(refreshMessages, 5000);
      }
    });

    return () => {
      active = false;
      if (interval) clearInterval(interval);
    };
  }, [match?.match_id]);

  const sendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!match?.match_id || !messageDraft.trim() || sendingMessage) return;
    setSendingMessage(true);
    setMessageError("");
    try {
      const response = await API.post(
        `/matches/${encodeURIComponent(match.match_id)}/messages`,
        { text: messageDraft.trim() },
      );
      if (response.data?.message) {
        setMessages((current) => [...current, response.data.message]);
      }
      setMessageDraft("");
    } catch (error) {
      console.error("Could not send match message:", error);
      setMessageError("In-app messaging is not connected to the backend yet.");
    } finally {
      setSendingMessage(false);
    }
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

                {match ? (
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
                          <p className="text-xs text-white/50 mt-1">
                            &quot;Heyyy 👋&quot; • Active on WhatsApp
                          </p>
                        </div>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FFB6C1]" />
                    </div>

                    <div className="flex gap-2.5 pt-2 border-t border-white/5">
                      <button
                        onClick={handleWhatsAppChat}
                        className="flex-1 flex items-center justify-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 text-xs font-medium transition-colors cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Open WhatsApp Chat</span>
                      </button>
                      <Link
                        href="/date"
                        className="flex items-center justify-center px-5 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors"
                      >
                        View Dossier
                      </Link>
                    </div>

                    <div className="border-t border-white/5 pt-3">
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/45">
                        Minglee chat
                      </p>
                      <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl bg-black/20 p-3">
                        {messages.length === 0 ? (
                          <p className="text-center text-xs text-white/40">
                            Start a conversation with your Friday match.
                          </p>
                        ) : (
                          messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${message.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                            >
                              <p className="max-w-[85%] rounded-2xl bg-white/10 px-3 py-2 text-xs text-white">
                                {message.text}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                      {messageError && (
                        <p role="alert" className="mt-2 text-xs text-amber-200">
                          {messageError}
                        </p>
                      )}
                      <form onSubmit={sendMessage} className="mt-2 flex gap-2">
                        <input
                          value={messageDraft}
                          onChange={(event) => setMessageDraft(event.target.value)}
                          placeholder="Write a message..."
                          aria-label="Write a message to your match"
                          className="min-w-0 flex-1 rounded-full bg-white/[0.05] px-4 py-2 text-xs text-white placeholder:text-white/40"
                        />
                        <button
                          type="submit"
                          disabled={!messageDraft.trim() || sendingMessage}
                          className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black disabled:opacity-40"
                        >
                          Send
                        </button>
                      </form>
                    </div>
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

                <div className="rounded-2xl border border-white/5 bg-[#0c1322] p-4 text-center text-xs text-white/45">
                  Past conversations appear here when match history is available.
                </div>
              </div>
            </div>
        </main>
      </div>
    </>
  );
}
