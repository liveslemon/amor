"use client";

import React, { useEffect, useRef, useState } from "react";
import API from "@/api/client";
import { useAuthStore } from "@/store/useAuthStore";
import { isDismissed, markDismissed } from "@/lib/adDismissal";
import PopupOverlay, { PopupOverlayItem } from "./PopupOverlay";

interface PopupItem extends PopupOverlayItem {
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

export default function NotificationPopup() {
  const user = useAuthStore((state) => state.user);
  const [popup, setPopup] = useState<PopupItem | null>(null);
  const trackedImpression = useRef<string | null>(null);

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
          (item) => !isDismissed(item.id),
        );
        const ad = (ads as PopupAdData[]).find((item) => !isDismissed(item.id));
        const candidate: PopupItem | undefined = notification
          ? {
              id: notification.id,
              title: notification.title || "Minglee update",
              message: notification.message,
              href: notification.action_url,
              image_url: notification.metadata?.image_url,
              label: "Minglee update",
              type: "notification",
            }
          : ad
            ? {
                id: ad.id,
                title: ad.title,
                message: ad.subtitle,
                href: ad.target_url,
                image_url: ad.image_url,
                label: "Promotion",
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

  // Record an impression once per popup ad shown (real notifications aren't
  // ad inventory, so they don't get impression/click tracking).
  useEffect(() => {
    if (!popup || popup.type !== "ad" || trackedImpression.current === popup.id) {
      return;
    }
    trackedImpression.current = popup.id;
    API.post(`/ads/${encodeURIComponent(popup.id)}/impression`).catch((error) => {
      console.warn("Could not record popup ad impression:", error);
    });
  }, [popup]);

  const dismiss = async (clicked: boolean) => {
    if (!popup) return;
    markDismissed(popup.id);
    if (popup.type === "ad") {
      if (clicked) {
        API.post(`/ads/${encodeURIComponent(popup.id)}/click`).catch((error) => {
          console.warn("Could not record popup ad click:", error);
        });
      }
    } else {
      try {
        await API.patch(`/notifications/${encodeURIComponent(popup.id)}/dismiss`);
      } catch (error) {
        console.error("Could not dismiss notification popup:", error);
      }
    }
    setPopup(null);
  };

  if (!popup) return null;

  return (
    <PopupOverlay
      popup={popup}
      onDismiss={() => dismiss(false)}
      onOpen={() => dismiss(true)}
    />
  );
}
