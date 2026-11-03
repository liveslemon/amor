"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight, Smartphone, X } from "lucide-react";
import { useIsMobile } from "@/lib/useIsMobile";
import {
  getPwaDeviceType,
  getPwaInstallInstructions,
  type PwaDeviceType,
} from "@/lib/pwa";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const Hero = () => {
  const isMobile = useIsMobile();
  const deferredInstallPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [deviceType, setDeviceType] = useState<PwaDeviceType>("desktop");
  const [timeLeft, setTimeLeft] = useState({
    days: "05",
    hours: "08",
    minutes: "37",
    seconds: "41",
  });

  // Capture the native install prompt so the mobile "Download" button can
  // trigger it directly instead of just linking to /signup.
  useEffect(() => {
    setDeviceType(getPwaDeviceType());

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      deferredInstallPrompt.current = event as BeforeInstallPromptEvent;
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () =>
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  // Calculate dynamic countdown to the next upcoming Friday at 8:00 PM
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const nextFriday = new Date(now);

      // Set to next Friday
      const currentDay = now.getDay();
      const daysUntilFriday = (5 - currentDay + 7) % 7;

      nextFriday.setDate(now.getDate() + daysUntilFriday);
      nextFriday.setHours(20, 0, 0, 0); // Friday at 8:00 PM

      // If Friday at 8 PM has already passed today, set to next week's Friday
      if (daysUntilFriday === 0 && now.getHours() >= 20) {
        nextFriday.setDate(nextFriday.getDate() + 7);
      }

      const difference = nextFriday.getTime() - now.getTime();

      let days = Math.floor(difference / (1000 * 60 * 60 * 24));
      let hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      let minutes = Math.floor((difference / 1000 / 60) % 60);
      let seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({
        days: days.toString().padStart(2, "0"),
        hours: hours.toString().padStart(2, "0"),
        minutes: minutes.toString().padStart(2, "0"),
        seconds: seconds.toString().padStart(2, "0"),
      });
    };

    calculateTimeLeft();

    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[110vh] flex flex-col items-center justify-center pt-20 pb-12 px-6 overflow-x-hidden bg-[#0a0f1a]">
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center z-10 mt-8">
        {/* Main Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          <h1 className="text-5xl sm:text-7xl lg:text-[100px] font-sans font-black tracking-tighter leading-[0.9] text-white mb-4">
            get a date every
            <br />
            <span className="font-[family-name:var(--font-marker)] text-[#ff69b4] inline-block -rotate-3 mt-2 ml-2 tracking-normal font-normal">
              Friday.
            </span>
          </h1>
        </motion.div>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1, ease: "easeOut" }}
          className="relative w-[280px] h-[360px] sm:w-[320px] sm:h-[420px] rounded-[32px] overflow-hidden border border-white/10 shadow-2xl my-4"
        >
          <img
            src="/assets/pexels-gustavo-fring-5635513.webp"
            alt="Happy Couple"
            className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-700"
          />
        </motion.div>

        {/* Professional Countdown */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative flex flex-col items-center -mt-20 mb-12 gap-0 z-20 pointer-events-none"
        >
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-white/70 font-medium drop-shadow-md mb-2">
            Next Match In
          </span>
          <div className="font-[family-name:var(--font-marker)] text-5xl sm:text-6xl md:text-7xl text-white/40 tracking-wider drop-shadow-lg">
            {timeLeft.days}:{timeLeft.hours}:{timeLeft.minutes}:
            {timeLeft.seconds}
          </div>
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col items-center gap-6 w-full max-w-sm"
        >
          <Link
            href="/signup"
            className="w-full"
            onClick={(e) => {
              // Mobile users should never land on the signup/login page from
              // this button — they get the native install prompt, or
              // instructions for adding the PWA to their home screen.
              if (!isMobile) return;
              e.preventDefault();

              const prompt = deferredInstallPrompt.current;
              if (prompt) {
                deferredInstallPrompt.current = null;
                prompt.prompt();
              } else {
                setShowInstallGuide(true);
              }
            }}
          >
            <button className="w-full h-14 rounded-xl bg-white hover:bg-white/90 text-[#0a0f1a] transition-colors flex items-center justify-center gap-3 cursor-pointer border-none px-8">
              <span className="font-sans font-bold text-lg">
                {isMobile ? "Download" : "Get Started"}
              </span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </motion.div>
      </div>

      <AnimatePresence>
        {showInstallGuide && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInstallGuide(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm rounded-[32px] border border-white/10 bg-[#0c1220] p-7 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setShowInstallGuide(false)}
                aria-label="Close install instructions"
                className="absolute top-4 right-4 p-1.5 text-white/40 hover:text-white transition-colors cursor-pointer rounded-full hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5">
                  <Smartphone className="h-5 w-5 text-[#ff69b4]" />
                </div>
                <div>
                  <p className="text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-white/50">
                    Install Guide
                  </p>
                  <h3 className="font-serif text-xl text-white">
                    {getPwaInstallInstructions(deviceType).label}
                  </h3>
                </div>
              </div>

              <p className="font-sans text-sm text-white/60 leading-relaxed mb-3">
                {getPwaInstallInstructions(deviceType).description}
              </p>

              <ol className="list-decimal space-y-1 pl-5 font-sans text-sm text-white/70">
                {getPwaInstallInstructions(deviceType).steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Hero;
