"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCircle2 } from "lucide-react";
import { isPushSupported, getNotificationPermissionStatus, requestAndSubscribePush } from "@/lib/pushNotifications";
import { useAuthStore } from "@/store/useAuthStore";

export default function NotificationModal() {
  const [loading, setLoading] = useState(false);
  const [subscribedUserId, setSubscribedUserId] = useState<string | null>(null);
  const [dismissedUserId, setDismissedUserId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const user = useAuthStore((state) => state.user);
  const syncedUserId = useRef<string | null>(null);
  const permissionStatus = getNotificationPermissionStatus();
  const subscribed = Boolean(user && subscribedUserId === user.id);
  const isOpen = Boolean(user) && dismissedUserId !== user?.id;

  useEffect(() => {
    if (typeof window === "undefined" || !user) return;
    if (permissionStatus !== "granted") return;

    localStorage.setItem("minglee-push-enabled", "true");
    if (syncedUserId.current === user.id) return;
    syncedUserId.current = user.id;
    let active = true;
    requestAndSubscribePush()
      .then((result) => {
        if (!active) return;
        if (result.success) {
          setSubscribedUserId(user.id);
          setDismissedUserId(user.id);
          setError("");
        } else {
          setError(result.error || "Push notifications could not be enabled.");
        }
      })
      .catch((syncError) => {
        if (!active) return;
        console.error("Could not sync push notifications:", syncError);
        setError("Push notifications could not be enabled. Please try again.");
      });

    return () => {
      active = false;
    };
  }, [user, permissionStatus]);

  const handleEnable = async () => {
    setLoading(true);
    setError("");
    if (user) syncedUserId.current = user.id;
    try {
      const res = await requestAndSubscribePush();
      if (res.success) {
        setSubscribedUserId(user?.id || null);
        setTimeout(() => {
          setDismissedUserId(user?.id || null);
          setLoading(false);
        }, 1500);
        return;
      }
      setError(res.error || "Push notifications could not be enabled.");
    } catch (e) {
      console.error("Notification enable error:", e);
      setError("Push notifications could not be enabled. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full max-w-md rounded-2xl bg-[#0c1220] p-6 text-white overflow-hidden"
          >
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
                    Minglee uses notifications for Friday matches and important account updates. Enable them to continue.
                  </p>

                  {!isPushSupported() && (
                    <p role="alert" className="mt-3 text-xs text-amber-200">
                      This browser does not support push notifications. Open Minglee in a supported browser to continue.
                    </p>
                  )}
                  {getNotificationPermissionStatus() === "denied" && (
                    <p role="alert" className="mt-3 text-xs text-amber-200">
                      Notifications are blocked in browser settings. Allow notifications for Minglee, then try again.
                    </p>
                  )}
                  {error && (
                    <p role="alert" className="mt-3 text-xs text-red-300">
                      {error}
                    </p>
                  )}

                  <div className="mt-6 flex flex-col w-full gap-2.5">
                    <button
                      type="button"
                      onClick={handleEnable}
                      disabled={loading || !isPushSupported() || getNotificationPermissionStatus() === "denied"}
                      className="h-11 w-full cursor-pointer rounded-full bg-white px-6 font-sans text-sm font-semibold text-[#0a0f1a] transition-all hover:bg-white/90 active:scale-[0.98] disabled:opacity-50"
                    >
                      {loading ? "Enabling..." : "Enable Required Notifications"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
    </AnimatePresence>
  );
}
