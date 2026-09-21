"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, CheckCircle2 } from "lucide-react";
import { isPushSupported, getNotificationPermissionStatus, requestAndSubscribePush } from "@/lib/pushNotifications";
import { useAuthStore } from "@/store/useAuthStore";

export default function NotificationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (typeof window === "undefined" || !user) return;
    if (!isPushSupported()) return;

    const dismissed = localStorage.getItem("minglee-push-prompt-dismissed");
    const enabled = localStorage.getItem("minglee-push-enabled");
    const status = getNotificationPermissionStatus();

    // If permission was already granted in Chrome settings, mark enabled and don't prompt
    if (status === "granted") {
      localStorage.setItem("minglee-push-enabled", "true");
      setIsOpen(false);
      return;
    }

    // Only show if user is logged in, push is supported, permission is 'default' (not granted/denied yet)
    // and they haven't dismissed it in the last 3 days
    if (status === "default" && !enabled) {
      if (!dismissed || Date.now() - parseInt(dismissed, 10) > 3 * 24 * 60 * 60 * 1000) {
        // Delay slightly for smooth page entrance
        const timer = setTimeout(() => setIsOpen(true), 2500);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  const handleEnable = async () => {
    setLoading(true);
    try {
      const res = await requestAndSubscribePush();
      if (res.success) {
        setSubscribed(true);
        setTimeout(() => {
          setIsOpen(false);
          setLoading(false);
        }, 1500);
        return;
      } else {
        localStorage.setItem("minglee-push-prompt-dismissed", Date.now().toString());
        setIsOpen(false);
      }
    } catch (e) {
      console.warn("Notification enable error:", e);
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("minglee-push-prompt-dismissed", Date.now().toString());
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full max-w-md rounded-2xl bg-[#0c1220] p-6 text-white overflow-hidden"
          >
            <button
              onClick={handleDismiss}
              aria-label="Close modal"
              className="absolute top-4 right-4 p-1 text-white/40 hover:text-white transition-colors cursor-pointer rounded-full hover:bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.04] text-[#FFB6C1]">
                <Bell className="w-7 h-7" />
              </div>

              {subscribed ? (
                <div className="flex flex-col items-center py-4">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-2" />
                  <h3 className="font-serif text-2xl text-white tracking-tight">Notifications Enabled!</h3>
                  <p className="mt-1 text-sm text-white/60">You will be the first to know when your Friday date is ready.</p>
                </div>
              ) : (
                <>
                  <span className="text-[10px] font-sans font-medium uppercase tracking-[0.2em] text-white/50 mb-1">
                    Stay Connected
                  </span>
                  <h3 className="font-serif text-2xl text-white tracking-tight leading-snug">
                    Get Match{" "}
                    <span className="font-[family-name:var(--font-marker)] text-[#FFB6C1] inline-block -rotate-2 font-normal">
                      Alerts
                    </span>
                  </h3>
                  <p className="mt-2 text-sm text-white/60 leading-relaxed max-w-sm">
                    Never miss your Friday date! Enable push notifications so you get alerted instantly the moment your curated match drops.
                  </p>

                  <div className="mt-6 flex flex-col w-full gap-2.5">
                    <button
                      type="button"
                      onClick={handleEnable}
                      disabled={loading}
                      className="h-11 w-full cursor-pointer rounded-full bg-white px-6 font-sans text-sm font-semibold text-[#0a0f1a] transition-all hover:bg-white/90 active:scale-[0.98] disabled:opacity-50"
                    >
                      {loading ? "Enabling..." : "Turn On Notifications"}
                    </button>
                    <button
                      type="button"
                      onClick={handleDismiss}
                      className="h-10 w-full cursor-pointer rounded-full bg-white/5 px-5 font-sans text-sm font-medium text-white/60 transition-all hover:bg-white/10 hover:text-white"
                    >
                      Maybe Later
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
