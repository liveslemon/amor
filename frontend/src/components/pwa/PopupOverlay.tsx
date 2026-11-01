"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, Bell, X } from "lucide-react";

export interface PopupOverlayItem {
  id: string;
  title: string;
  message?: string;
  href?: string;
  image_url?: string;
  label: string;
}

interface PopupOverlayProps {
  popup: PopupOverlayItem;
  /** Closing via the X button, or any other non-click-through dismissal. */
  onDismiss: () => void;
  /** Clicking through the card itself (defaults to onDismiss if omitted). */
  onOpen?: () => void;
}

// Full-screen interstitial shared by real user notifications and "popup" ads,
// and by a "notification" ad's linked popup once it's opened.
export default function PopupOverlay({ popup, onDismiss, onOpen }: PopupOverlayProps) {
  const handleOpen = onOpen ?? onDismiss;
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
            {popup.label}
          </span>
        </div>
        <h2 className="font-serif text-xl text-white">{popup.title}</h2>
        {popup.message && (
          <p className="mt-2 text-sm leading-relaxed text-white/65">
            {popup.message}
          </p>
        )}
        {popup.href && (
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
        onClick={onDismiss}
        aria-label="Dismiss popup"
        className="absolute right-4 top-4 rounded-full bg-black/40 p-2 text-white/70 hover:text-white"
      >
        <X className="h-5 w-5" />
      </button>
      {popup.href ? (
        <Link href={popup.href} onClick={handleOpen} className="block">
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
}
