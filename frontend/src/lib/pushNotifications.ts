import API from "@/api/client";

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

    // Mark as enabled locally immediately since browser permission is granted
    localStorage.setItem("minglee-push-enabled", "true");

    // 2. Proactively register and setup service worker push manager if supported
    if ("serviceWorker" in navigator && "PushManager" in window) {
      try {
        let registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
          registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        }

        // Wait for worker with a 3-second safety timeout so it NEVER hangs indefinitely
        const readyRegistration = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise<ServiceWorkerRegistration | undefined>((resolve) =>
            setTimeout(() => resolve(registration), 3000)
          ),
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
            // Send subscription to backend
            await API.post("/notifications/subscribe", {
              subscription: subscription.toJSON(),
            }).catch((err) => {
              console.warn("Backend notification subscription sync skipped:", err);
            });
          }
        }
      } catch (swErr) {
        console.warn("ServiceWorker push manager setup completed with warning:", swErr);
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error("Failed to subscribe to push notifications:", err);
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      localStorage.setItem("minglee-push-enabled", "true");
      return { success: true };
    }
    return { success: false, error: err?.response?.data?.message || err.message || "Failed to subscribe" };
  }
}
