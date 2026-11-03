const DISMISSED_KEY = "minglee-dismissed-popup:";

export function isDismissed(id: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return Boolean(localStorage.getItem(`${DISMISSED_KEY}${id}`));
  } catch {
    return false;
  }
}

export function markDismissed(id: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${DISMISSED_KEY}${id}`, "true");
  } catch {
    // Storage may be unavailable (private mode, quota); non-fatal.
  }
}
