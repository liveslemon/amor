import API from "./client";

const MATCH_CACHE_PREFIX = "minglee_current_match:";
const MATCH_NOTIFICATION_KEY = "minglee_notified_match:";
// Partner photo URLs are signed and expire after 1 hour; don't serve a cached
// match past that, or its photos would show broken.
const MATCH_CACHE_TTL_MS = 55 * 60 * 1000;

function cacheKey(userId?: string) {
  return `${MATCH_CACHE_PREFIX}${userId || "current"}`;
}

export function readCachedMatch<T>(userId?: string): T | null {
  if (typeof window === "undefined") return null;

  try {
    const value = localStorage.getItem(cacheKey(userId));
    if (!value) return null;

    const parsed = JSON.parse(value) as { savedAt?: number; match?: T };
    if (!parsed.savedAt || !parsed.match || Date.now() - parsed.savedAt > MATCH_CACHE_TTL_MS) {
      localStorage.removeItem(cacheKey(userId));
      return null;
    }
    return parsed.match;
  } catch (error) {
    console.error("Could not restore the saved Minglee date:", error);
    localStorage.removeItem(cacheKey(userId));
    return null;
  }
}

export async function fetchCurrentMatch<T extends { match_id?: string }>(
  userId?: string,
): Promise<T | null> {
  const cachedMatch = readCachedMatch<T>(userId);

  try {
    const response = await API.get("/matches/current");
    const match = response.data?.match ?? null;

    if (typeof window !== "undefined") {
      if (match) {
        localStorage.setItem(cacheKey(userId), JSON.stringify({ savedAt: Date.now(), match }));
        const notifiedMatch = localStorage.getItem(MATCH_NOTIFICATION_KEY);
        if (
          match.match_id &&
          notifiedMatch !== match.match_id &&
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          const registration = await navigator.serviceWorker?.getRegistration();
          if (registration?.showNotification) {
            await registration.showNotification("Your Minglee date is ready", {
              body: "Your Friday match has been revealed. Open Minglee to see who you were paired with.",
              icon: "/icons/icon-192x192.png",
              tag: `match-${match.match_id}`,
            });
          } else {
            new Notification("Your Minglee date is ready", {
              body: "Your Friday match has been revealed. Open Minglee to see who you were paired with.",
              tag: `match-${match.match_id}`,
            });
          }
          localStorage.setItem(MATCH_NOTIFICATION_KEY, match.match_id);
        }
      } else {
        localStorage.removeItem(cacheKey(userId));
      }
    }

    return match;
  } catch (error) {
    console.warn("Could not refresh the current Minglee date; using saved date if available:", error);
    return cachedMatch;
  }
}
