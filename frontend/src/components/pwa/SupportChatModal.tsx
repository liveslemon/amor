"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Send, ShieldCheck, MessageCircle, Sparkles } from "lucide-react";
import { APP_CONFIG } from "@/config/app";

interface Message {
  id: string;
  sender: "support" | "user";
  text: string;
  time: string;
}

interface SupportChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUGGESTIONS = [
  "My match isn't showing",
  "I have an issue with my account",
  "Report a user",
  "Something else",
];

export default function SupportChatModal({
  isOpen,
  onClose,
}: SupportChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m1",
      sender: "support",
      text: "Hey! 👋 Welcome to Minglee Support. How can we help you today?",
      time: "Just now",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText.trim();
    if (!text) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // Simulate smart support reply
    setTimeout(() => {
      let replyText =
        "Thanks for reaching out! Our team is reviewing this right now.";

      const lower = text.toLowerCase();
      if (lower.includes("match") && (lower.includes("showing") || lower.includes("not"))) {
        replyText =
          "Minglee matches drop every Friday at 8:00 AM WAT. If you completed onboarding before Thursday midnight, your date will appear on your Home and Dates tabs! If it's still missing, reach out on our direct WhatsApp line.";
      } else if (lower.includes("account") || lower.includes("profile")) {
        replyText =
          "You can update your photos, age, height, and partner preferences anytime under the 'Me' tab. Need a number reset? We can verify your details directly on WhatsApp.";
      } else if (lower.includes("report")) {
        replyText =
          "Your safety is our top priority. You can report any profile under 'Me' > 'Privacy & Safety' > 'Report a User', or provide the user's name right here. Zero harassment is tolerated on Minglee.";
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "support",
        text: replyText,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 900);
  };

  const handleWhatsAppEscalation = () => {
    const message = encodeURIComponent(
      "Hi Minglee Support, I need assistance with my account."
    );
    window.open(
      `https://wa.me/${APP_CONFIG.whatsappNumber.replace("+", "")}?text=${message}`,
      "_blank"
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80">
      <div className="relative flex flex-col w-full max-w-lg h-[82vh] max-h-[680px] rounded-2xl bg-[#0c1322] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-[#0a0f1a]">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white/5 text-white">
              <ShieldCheck className="w-5 h-5 text-[#FFB6C1]" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-base text-white tracking-tight">
                  Minglee Support
                </span>
                <span className="text-[10px] uppercase font-sans font-medium px-1.5 py-0.5 rounded-full bg-white/10 text-white/70">
                  Official
                </span>
              </div>
              <p className="text-xs text-white/50 font-sans">
                Usually replies quickly
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 font-sans">
          {messages.map((m) => {
            const isMe = m.sender === "user";
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isMe
                      ? "bg-white text-black font-medium rounded-tr-none"
                      : "bg-white/5 text-white/90 rounded-tl-none"
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[10px] text-white/40 mt-1 px-1">
                  {m.time}
                </span>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white/5 text-white/50 text-xs w-24">
              <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse delay-150" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse delay-300" />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        {messages.length <= 3 && (
          <div className="px-4 py-2 bg-[#0a0f1a] border-t border-white/5 flex gap-1.5 overflow-x-auto no-scrollbar">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                className="shrink-0 text-xs text-white/80 bg-white/5 hover:bg-white/10 rounded-full px-3 py-1.5 transition-colors cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* WhatsApp Direct Option Banner */}
        <div className="px-4 py-2 bg-[#0a0f1a] border-t border-white/5 flex items-center justify-between text-xs">
          <span className="text-white/60 flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            Need real-time human assistance?
          </span>
          <button
            onClick={handleWhatsAppEscalation}
            className="text-white bg-emerald-700 hover:bg-emerald-600 font-medium px-3 py-1 rounded-full text-[11px] transition-colors cursor-pointer"
          >
            Open WhatsApp
          </button>
        </div>

        {/* Input Footer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 p-3 sm:p-4 border-t border-white/5 bg-[#0a0f1a]"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-full bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:bg-white/[0.07] transition-colors"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-black disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/90 transition-colors active:scale-95 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
