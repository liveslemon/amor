"use client";

import React, { useEffect, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import SupportChatModal from "./SupportChatModal";

type Point = { x: number; y: number };

const POSITION_KEY = "minglee-assistant-position";
const BUBBLE_SIZE = 56;

function clampPoint(point: Point): Point {
  return {
    x: Math.max(12, Math.min(point.x, window.innerWidth - BUBBLE_SIZE - 12)),
    y: Math.max(12, Math.min(point.y, window.innerHeight - BUBBLE_SIZE - 96)),
  };
}

export default function AIAssistantBubble() {
  const user = useAuthStore((state) => state.user);
  const [position, setPosition] = useState<Point | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dragOffset = useRef<Point | null>(null);
  const moved = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let saved: Point | null = null;
    try {
      const value = localStorage.getItem(POSITION_KEY);
      saved = value ? (JSON.parse(value) as Point) : null;
    } catch (error) {
      console.error("Could not restore the assistant button position:", error);
    }

    const frame = window.requestAnimationFrame(() => {
      setPosition(clampPoint(
        saved ?? {
          x: window.innerWidth - BUBBLE_SIZE - 18,
          y: window.innerHeight - BUBBLE_SIZE - 112,
        },
      ));
    });

    const handleResize = () => {
      setPosition((current) => (current ? clampPoint(current) : current));
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (!user || !position) return null;

  const onPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    dragOffset.current = {
      x: event.clientX - position.x,
      y: event.clientY - position.y,
    };
    moved.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragOffset.current) return;
    const next = clampPoint({
      x: event.clientX - dragOffset.current.x,
      y: event.clientY - dragOffset.current.y,
    });
    if (Math.abs(next.x - position.x) + Math.abs(next.y - position.y) > 4) {
      moved.current = true;
    }
    setPosition(next);
  };

  const onPointerUp = () => {
    if (!dragOffset.current) return;
    dragOffset.current = null;
    if (moved.current) {
      localStorage.setItem(POSITION_KEY, JSON.stringify(position));
      return;
    }
    setIsOpen(true);
  };

  return (
    <>
      <button
        type="button"
        aria-label="Open Minglee AI assistant. Drag to move."
        title="Minglee AI assistant — drag to move"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="fixed z-[45] flex h-14 w-14 touch-none items-center justify-center rounded-full border border-white/20 bg-[#FFB6C1] text-[#07101d] shadow-[0_10px_36px_rgba(0,0,0,.42)] transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        style={{ left: position.x, top: position.y }}
      >
        <MessageCircle className="h-6 w-6" />
      </button>
      <SupportChatModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
