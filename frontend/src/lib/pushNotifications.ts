import API from "@/api/client";
import axios from "axios";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

export function getNotificationPermissionStatus(): NotificationPermission | "unsupported" {
  if (!isPushSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestAndSubscribePush(): Promise<{ success: boolean; error?: string }> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return { success: false, error: "Push notifications are not supported on this browser/device." };
  }

  try {
    // 1. Request or check browser permission
    let permission = Notification.permission;
    if (permission !== "granted") {
      permission = await Notification.requestPermission();
    }

    if (permission !== "granted") {
      return { success: false, error: "Notification permission was denied." };
    }

    // 2. Proactively register and setup service worker push manager if supported
    if ("serviceWorker" in navigator && "PushManager" in window) {
      try {
        let registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
          registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        }

        // Wait up to 3 seconds for service worker to be ready
        const readyRegistration = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
        ]);

        const targetReg = readyRegistration || registration;

        if (targetReg && targetReg.pushManager) {
          let subscription = await targetReg.pushManager.getSubscription();

          const vapidKey =
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
            "BEdi1ZbW35u08LcRddIZ24EhucveVL66wwKS08g8HBMzQpLBAm3VeojOyOfvjjUDpxSD0PwD_PBSDDWMjCHeUE8";

          if (!subscription && vapidKey) {
            const convertedVapidKey = urlBase64ToUint8Array(vapidKey);
            subscription = await targetReg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: convertedVapidKey,
            });
          }

          if (subscription) {
            const subJson = subscription.toJSON();

            // The backend derives the user from the JWT and saves with the service role.
            await API.post("/notifications/subscribe", {
              subscription: subJson,
            });

            localStorage.setItem("minglee-push-enabled", "true");
            localStorage.setItem("minglee-push-sub", JSON.stringify(subJson));
            return { success: true };
          }
        }
      } catch (swErr) {
        console.warn("Could not register push notifications:", swErr);
        const message = axios.isAxiosError<{ error?: string }>(swErr)
          ? swErr.response?.data?.error || swErr.message
          : swErr instanceof Error
            ? swErr.message
            : null;
        return {
          success: false,
          error: message || "Push registration failed. Please try again.",
        };
      }
    }

    return {
      success: false,
      error: "Push notifications are not supported on this browser/device.",
    };
  } catch (err) {
    console.error("Failed to subscribe to push notifications:", err);
    const message = axios.isAxiosError<{ message?: string }>(err)
      ? err.response?.data?.message || err.message
      : err instanceof Error
        ? err.message
        : null;
    return { success: false, error: message || "Failed to subscribe" };
  }
}
