"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Search,
  ShieldCheck,
  Heart,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import API from "@/api/client";
import { useAuthStore } from "@/store/useAuthStore";
import { APP_CONFIG } from "@/config/app";
import SupportChatModal from "@/components/pwa/SupportChatModal";

interface CurrentMatch {
  match_id: string;
  partner: {
    name: string;
    whatsapp_number: string;
    photos?: Array<{ image_url: string }>;
  };
}

export default function ChatsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [searchQuery, setSearchQuery] = useState("");
  const [match, setMatch] = useState<CurrentMatch | null>(null);
  const [supportOpen, setSupportOpen] = useState(false);

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
        const res = await API.get("/matches/current");
        if (res.data?.match) {
          setMatch(res.data.match);
        }
      } catch (err) {
        // No active match
      }
    };

    fetchCurrent();
  }, [router]);

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

      <SupportChatModal
        isOpen={supportOpen}
        onClose={() => setSupportOpen(false)}
      />

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

          {/* Responsive Layout: 2 Columns on Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column: Official Support & Safety */}
            <div className="md:col-span-5 space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40 px-1">
                  Official Channels
                </span>

                <div
                  onClick={() => setSupportOpen(true)}
                  className="flex items-center justify-between p-4 rounded-2xl bg-[#0c1322] hover:bg-[#111a2c] transition-colors cursor-pointer group border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-white/5 text-[#FFB6C1]">
                      <ShieldCheck className="w-6 h-6" />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-serif text-base text-white flex items-center gap-1">
                          <span className="font-[family-name:var(--font-marker)] text-base font-normal text-white">Minglee</span>
                          <span>Support</span>
                        </span>
                        <span className="text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/80">
                          Concierge
                        </span>
                      </div>
                      <p className="text-xs text-white/70 mt-0.5">
                        Need help? We&apos;re here • 24/7 assistance
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-white px-1">
                      1
                    </span>
                    <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </div>

              {/* Secure Communication Info Card */}
              <div className="p-4 rounded-2xl bg-[#0c1322] border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-white/80">
                  <ShieldCheck className="w-4 h-4 text-[#FFB6C1]" />
                  <span className="text-xs font-medium">Safe & Direct Connection</span>
                </div>
                <p className="text-[11px] leading-relaxed text-white/50">
                  Minglee protects your privacy. Official matches are connected directly via end-to-end encrypted WhatsApp channels once mutually introduced.
                </p>
              </div>
            </div>

            {/* Right Column: Current Date & Past Dates */}
            <div className="md:col-span-7 space-y-5">
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
                        href="/dates"
                        className="flex items-center justify-center px-5 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors"
                      >
                        View Dossier
                      </Link>
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

                <div className="space-y-2">
                  {[
                    {
                      id: "pd1",
                      name: "Emily",
                      lastMsg: "It was really nice meeting you at the party!",
                      time: "Aug 28",
                      avatar:
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
                    },
                    {
                      id: "pd2",
                      name: "Grace",
                      lastMsg: "Haha definitely 😂 see you around campus!",
                      time: "Aug 21",
                      avatar:
                        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
                    },
                  ].map((conv) => (
                    <div
                      key={conv.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0c1322] hover:bg-[#111a2c] transition-colors cursor-pointer group border border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={conv.avatar}
                          alt={conv.name}
                          className="w-11 h-11 rounded-full object-cover"
                        />
                        <div>
                          <span className="font-serif text-sm text-white">
                            {conv.name}
                          </span>
                          <p className="text-xs text-white/50 truncate max-w-[240px] md:max-w-xs mt-0.5">
                            {conv.lastMsg}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-white/40">{conv.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
