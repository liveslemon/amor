"use client";

import React, { useEffect, useRef, useState } from "react";
import { Bell, X } from "lucide-react";
import API from "@/api/client";
import { useAuthStore } from "@/store/useAuthStore";
import { isDismissed, markDismissed } from "@/lib/adDismissal";
import PopupOverlay, { PopupOverlayItem } from "./PopupOverlay";

interface NotificationAd {
  id: string;
  title: string;
  text_content?: string;
  image_url?: string;
  target_url?: string;
  popup_id?: string;
}

const AUTO_DISMISS_MS = 8000;
const MAX_VISIBLE = 3;

// "Notification" ads surface as a small, non-blocking toast stack (top-right,
// newest on top) rather than the full-screen interstitial used for "popup"
// ads. Clicking one opens its linked popup ad (ad_type=popup, via popup_id).
export default function NotificationToast() {
  const user = useAuthStore((state) => state.user);
  const [toasts, setToasts] = useState<NotificationAd[]>([]);
  const [linkedPopup, setLinkedPopup] = useState<PopupOverlayItem | null>(null);
  const trackedImpressions = useRef(new Set<string>());

  useEffect(() => {
    if (!user) return;
    let active = true;

    API.get("/ads", {
      params: { placement: "notification", date: new Date().toISOString() },
    })
      .then((res) => {
        if (!active) return;
        const ads: NotificationAd[] = Array.isArray(res.data?.data)
          ? res.data.data
          : [];
        setToasts(ads.filter((ad) => !isDismissed(ad.id)).slice(0, MAX_VISIBLE));
      })
      .catch((error) => {
        console.warn("Could not load notification ads:", error);
      });

    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    for (const ad of toasts) {
      if (trackedImpressions.current.has(ad.id)) continue;
      trackedImpressions.current.add(ad.id);
      API.post(`/ads/${encodeURIComponent(ad.id)}/impression`).catch((error) => {
        console.warn("Could not record notification ad impression:", error);
      });
    }
  }, [toasts]);

  const dismissToast = (id: string) => {
    markDismissed(id);
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((ad) =>
      setTimeout(() => dismissToast(ad.id), AUTO_DISMISS_MS),
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toasts]);

  const openToast = async (ad: NotificationAd) => {
    API.post(`/ads/${encodeURIComponent(ad.id)}/click`).catch((error) => {
      console.warn("Could not record notification ad click:", error);
    });
    dismissToast(ad.id);

    if (ad.popup_id) {
      try {
        const res = await API.get(`/ads/${encodeURIComponent(ad.popup_id)}`);
        const popupAd = res.data?.data;
        if (popupAd) {
          setLinkedPopup({
            id: popupAd.id,
            title: popupAd.title,
            message: popupAd.text_content,
            href: popupAd.target_url,
            image_url: popupAd.image_url,
            label: "Promotion",
          });
          return;
        }
      } catch (error) {
        console.warn("Could not load the linked popup ad:", error);
      }
    }
    if (ad.target_url) window.location.href = ad.target_url;
  };

  return (
    <>
      <div className="fixed top-4 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
        {toasts.map((ad) => (
          <div
            key={ad.id}
            role="button"
            tabIndex={0}
            onClick={() => openToast(ad)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") openToast(ad);
            }}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-[#0c1322]/95 p-3 text-left shadow-xl backdrop-blur-sm transition-transform hover:scale-[1.01]"
          >
            {ad.image_url && (
              <img
                src={ad.image_url}
                alt=""
                className="h-10 w-10 shrink-0 rounded-lg object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[#FFB6C1]">
                <Bell className="h-3.5 w-3.5" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">
                  Minglee
                </span>
              </div>
              <p className="mt-0.5 truncate text-sm font-medium text-white">
                {ad.title}
              </p>
              {ad.text_content && (
                <p className="line-clamp-2 text-xs text-white/60">
                  {ad.text_content}
                </p>
              )}
            </div>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={(e) => {
                e.stopPropagation();
                dismissToast(ad.id);
              }}
              className="shrink-0 rounded-full p-1 text-white/40 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      {linkedPopup && (
        <PopupOverlay popup={linkedPopup} onDismiss={() => setLinkedPopup(null)} />
      )}
    </>
  );
}
