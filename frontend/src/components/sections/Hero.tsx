"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: "05",
    hours: "08",
    minutes: "37",
    seconds: "41",
  });

  // Calculate dynamic countdown to the next upcoming Wednesday at 8:00 PM
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const nextWednesday = new Date();
      
      // Set to next Wednesday
      const currentDay = now.getDay();
      const daysUntilWednesday = (3 - currentDay + 7) % 7;
      
      nextWednesday.setDate(now.getDate() + daysUntilWednesday);
      nextWednesday.setHours(20, 0, 0, 0); // Wednesday at 8:00 PM

      // If Wednesday at 8 PM has already passed today, set to next week's Wednesday
      if (daysUntilWednesday === 0 && now.getHours() >= 20) {
        nextWednesday.setDate(nextWednesday.getDate() + 7);
      }

      const difference = nextWednesday.getTime() - now.getTime();

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
            get a date every<br />
            <span className="font-[family-name:var(--font-marker)] text-[#ff69b4] inline-block -rotate-3 mt-2 ml-2 tracking-normal font-normal">Wednesday.</span>
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
            src="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&q=80&w=600&h=800" 
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
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-white/70 font-medium drop-shadow-md mb-2">Next Match In</span>
          <div className="font-[family-name:var(--font-marker)] text-5xl sm:text-6xl md:text-7xl text-white/40 tracking-wider drop-shadow-lg">
            {timeLeft.days}:{timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
          </div>
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col items-center gap-6 w-full max-w-sm"
        >
          <Link href="/signup" className="w-full">
            <button 
              className="w-full h-14 rounded-xl bg-white hover:bg-white/90 text-[#0a0f1a] transition-colors flex items-center justify-center gap-3 cursor-pointer border-none px-8"
            >
              <span className="font-sans font-bold text-lg">Get Started</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;
