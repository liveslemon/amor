"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Bell, X } from "lucide-react";
import API from "@/api/client";
import { useAuthStore } from "@/store/useAuthStore";

interface PopupItem {
  id: string;
  title: string;
  message?: string;
  body?: string;
  action_url?: string;
  url?: string;
  image_url?: string;
  type: "notification" | "ad";
}

interface PopupNotificationData {
  id: string;
  title?: string;
  message?: string;
  action_url?: string;
  metadata?: { image_url?: string };
}

interface PopupAdData {
  id: string;
  title: string;
  subtitle?: string;
  target_url?: string;
  image_url?: string;
}

const DISMISSED_KEY = "minglee-dismissed-popup:";

export default function NotificationPopup() {
  const user = useAuthStore((state) => state.user);
  const [popup, setPopup] = useState<PopupItem | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;

    const loadPopups = async () => {
      try {
        const [notificationResponse, adResponse] = await Promise.all([
          API.get("/notifications/popups/active"),
          API.get("/ads", {
            params: { placement: "popup", date: new Date().toISOString() },
          }),
        ]);
        if (!active) return;

        const notifications = Array.isArray(notificationResponse.data?.data)
          ? notificationResponse.data.data
          : [];
        const ads = Array.isArray(adResponse.data?.data)
          ? adResponse.data.data
          : [];
        const notification = (notifications as PopupNotificationData[]).find(
          (item) => !localStorage.getItem(`${DISMISSED_KEY}${item.id}`),
        );
        const ad = (ads as PopupAdData[]).find(
          (item) => !localStorage.getItem(`${DISMISSED_KEY}${item.id}`),
        );
        const candidate: PopupItem | undefined = notification
          ? {
              id: notification.id,
              title: notification.title || "Minglee update",
              message: notification.message,
              action_url: notification.action_url,
              image_url: notification.metadata?.image_url,
              type: "notification",
            }
          : ad
            ? {
                id: ad.id,
                title: ad.title,
                message: ad.subtitle,
                action_url: ad.target_url,
                image_url: ad.image_url,
                type: "ad",
              }
            : undefined;

        if (candidate) setPopup(candidate);
      } catch (error) {
        console.warn("Could not load notifications or popup ads:", error);
      }
    };

    loadPopups();
    return () => {
      active = false;
    };
  }, [user]);

  const dismiss = async () => {
    if (!popup) return;
    localStorage.setItem(`${DISMISSED_KEY}${popup.id}`, "true");
    if (popup.type !== "ad") {
      try {
        await API.patch(`/notifications/${encodeURIComponent(popup.id)}/dismiss`);
      } catch (error) {
        console.error("Could not dismiss notification popup:", error);
      }
    }
    setPopup(null);
  };

  if (!popup) return null;
  const href = popup.action_url || popup.url;
  const content = (
    <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[#0c1322] shadow-2xl">
      {popup.image_url && (
        <div className="h-44 overflow-hidden bg-white/5">
          <img
            src={popup.image_url}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="p-5">
        <div className="mb-2 flex items-center gap-2 text-[#FFB6C1]">
          <Bell className="h-4 w-4" />
          <span className="text-[10px] font-semibold uppercase tracking-wider">
            {popup.type === "ad" ? "Promotion" : "Minglee update"}
          </span>
        </div>
        <h2 className="font-serif text-xl text-white">{popup.title}</h2>
        {(popup.message || popup.body) && (
          <p className="mt-2 text-sm leading-relaxed text-white/65">
            {popup.message || popup.body}
          </p>
        )}
        {href && (
          <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-white">
            View details <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4">
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss popup"
        className="absolute right-4 top-4 rounded-full bg-black/40 p-2 text-white/70 hover:text-white"
      >
        <X className="h-5 w-5" />
      </button>
      {href ? (
        <Link href={href} onClick={dismiss} className="block">
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
}
