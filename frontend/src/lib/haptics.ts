/**
 * Minglee PWA Haptic Feedback System
 * Uses the Web Vibration API on supported devices (Android, Chrome, Edge, Samsung Internet)
 * with graceful fallback on devices where hardware vibration is restricted (e.g. iOS Safari).
 */

export type HapticType =
  | "selection"
  | "light"
  | "medium"
  | "heavy"
  | "success"
  | "warning";

const HAPTIC_PATTERNS: Record<HapticType, number | number[]> = {
  selection: 10,
  light: 12,
  medium: 22,
  heavy: 35,
  success: [15, 45, 20],
  warning: [30, 50, 30],
};

/**
 * Triggers a device vibration pulse if supported.
 * @param type Style of haptic pulse ("light", "medium", "selection", "success", "warning")
 */
export function triggerHaptic(type: HapticType = "light"): void {
  if (typeof window === "undefined" || !("vibrate" in navigator)) {
    return;
  }

  try {
    const pattern = HAPTIC_PATTERNS[type] ?? 12;
    navigator.vibrate(pattern);
  } catch {
    // Silently ignore if device/browser disallows vibration
  }
}

/**
 * Initializes global pointerdown listener for automatic button & interactive element haptics.
 * Attaches to touch/pointer down for instant native tactile response.
 */
export function initGlobalHaptics(): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handlePointerDown = (e: PointerEvent) => {
    // Only trigger on primary touch/click
    if (e.button !== 0 && e.pointerType === "mouse") return;

    const interactive = (e.target as HTMLElement | null)?.closest(
      "button, [role='button'], nav a, [data-haptic]"
    );

    if (interactive) {
      const customType = interactive.getAttribute("data-haptic") as HapticType | null;
      triggerHaptic(customType || "light");
    }
  };

  document.addEventListener("pointerdown", handlePointerDown, { passive: true });

  return () => {
    document.removeEventListener("pointerdown", handlePointerDown);
  };
}
