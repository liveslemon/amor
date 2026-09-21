"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Heart, Sparkles, Calendar, Check, ExternalLink } from "lucide-react";
import API from "@/api/client";
import { useAuthStore } from "@/store/useAuthStore";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  url?: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((state) => state.user);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await API.get("/notifications");
      if (res.data?.notifications) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.warn("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll notifications every 30 seconds while active
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const markAsRead = async (id: string) => {
    try {
      await API.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.warn("Failed to mark as read:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "match":
        return <Heart className="w-4 h-4 text-pink-400" />;
      case "event":
        return <Calendar className="w-4 h-4 text-orange-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-pink-300" />;
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-black">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-[#0c1220] p-4 shadow-[0_12px_36px_rgba(0,0,0,0.6)] z-50 text-white"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg tracking-tight font-medium">Notifications</span>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/80">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={fetchNotifications}
                className="text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                Refresh
              </button>
            </div>

            <div className="mt-3 max-h-80 overflow-y-auto space-y-2 pr-1">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-sm text-white/40">
                  <p>No notifications yet</p>
                  <p className="text-xs text-white/30 mt-1">Friday match updates will pop up here.</p>
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-start gap-3 rounded-xl p-3 transition-colors ${
                      item.is_read
                        ? "bg-white/[0.02] text-white/70"
                        : "bg-white/[0.06] text-white"
                    }`}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 mt-0.5">
                      {getIcon(item.type)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-sm font-semibold truncate">{item.title}</p>
                        {!item.is_read && (
                          <button
                            type="button"
                            onClick={() => markAsRead(item.id)}
                            title="Mark as read"
                            className="text-white/40 hover:text-white cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-white/60 mt-0.5 line-clamp-2 leading-relaxed">
                        {item.body}
                      </p>
                      {item.url && (
                        <Link
                          href={item.url}
                          onClick={() => {
                            markAsRead(item.id);
                            setIsOpen(false);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-pink-400 hover:text-pink-300 mt-2"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
