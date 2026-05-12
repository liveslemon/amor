"use client";

import React from "react";
import { motion } from "framer-motion";

const RealDatesDelivered = () => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <section className="relative w-full flex flex-col items-center justify-center py-16 md:py-20 px-6 md:px-12 overflow-hidden bg-[#070b14] text-white">
      
      {/* Title */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="relative md:absolute md:top-[15%] z-0 mb-12 md:mb-0"
      >
        <h2 className="text-3xl md:text-5xl font-serif tracking-tight drop-shadow-md">
          Real Dates <span className="font-[family-name:var(--font-marker)] text-[#ff69b4] font-normal tracking-wide inline-block -rotate-3 ml-2">Delivered</span>
        </h2>
      </motion.div>

      {/* Tightly Centered Collage Container */}
      <div className="relative w-full max-w-4xl h-auto md:h-[600px] mt-10 flex flex-col md:block items-center gap-12 md:gap-0">
        
        {/* TOP LEFT POLAROID */}
        <motion.div 
          initial={{ opacity: 0, x: isMobile ? 0 : -50, y: isMobile ? 40 : -50, rotate: -10 }}
          whileInView={{ opacity: 1, x: isMobile ? 0 : "-80%", y: isMobile ? 0 : "-65%", rotate: -2 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          viewport={{ once: true }}
          className="relative md:absolute md:left-1/2 md:top-1/2 z-10 w-[260px] max-w-[85vw] md:w-[320px] bg-[#1a1a1a] p-1.5 pb-6 shadow-2xl rounded-sm border border-white/5"
        >
          {/* Top Film Accents */}
          <div className="flex justify-center items-center px-2 mb-1 text-[#b09e39] text-[8px] font-mono tracking-widest">
            <span>36</span>
          </div>
          {/* Image Placeholder */}
          <div className="w-full h-[220px] md:h-[280px] bg-[#2a2a2c] flex items-center justify-center overflow-hidden border border-black/50 select-none">
            <img 
              src="/assets/WhatsApp Image 2026-05-02 at 12.15.20 (1).jpeg" 
              alt="Eating Photo" 
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
          {/* Bottom Film Accents */}
          <div className="flex justify-end items-center px-2 mt-1.5 text-[#b09e39] text-[8px] font-mono">
            <span>▶ 1</span>
          </div>

        </motion.div>


        {/* RIGHT FILM STRIP */}
        <motion.div 
          initial={{ opacity: 0, x: isMobile ? 0 : 50, y: isMobile ? 40 : -20, rotate: 10 }}
          whileInView={{ opacity: 1, x: isMobile ? 0 : "10%", y: isMobile ? 0 : "-40%", rotate: 2 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative md:absolute md:left-1/2 md:top-1/2 z-10 w-[300px] max-w-[85vw] md:w-[380px] bg-[#111] p-1 flex gap-1 shadow-2xl border border-white/5"
        >
          {/* Left Photo in Strip */}
          <div className="flex-1 h-[120px] md:h-[150px] bg-[#222] relative flex items-center justify-center overflow-hidden border border-black select-none">
            <img 
              src="/assets/WhatsApp Image 2026-05-02 at 12.15.20.jpeg" 
              alt="Park Pic 1" 
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
          {/* Right Photo in Strip */}
          <div className="flex-1 h-[120px] md:h-[150px] bg-[#2a2a2c] relative flex items-center justify-center overflow-hidden border border-black select-none">
            <img 
              src="/assets/WhatsApp Image 2026-05-02 at 12.15.50.jpeg" 
              alt="Park Pic 2" 
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>

        </motion.div>


        {/* BOTTOM POLAROID */}
        <motion.div 
          initial={{ opacity: 0, y: isMobile ? 40 : 50, rotate: 5 }}
          whileInView={{ opacity: 1, x: isMobile ? 0 : "-35%", y: isMobile ? 0 : "15%", rotate: -1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          viewport={{ once: true }}
          className="relative md:absolute md:left-1/2 md:top-1/2 z-20 w-[280px] max-w-[85vw] md:w-[380px] bg-[#1a1a1a] p-1 pb-1 shadow-2xl border border-white/5"
        >
          <div className="w-full h-[180px] md:h-[240px] bg-[#222] flex items-center justify-center overflow-hidden border border-black/50 select-none">
            <img 
              src="/assets/pexels-sena-yildirim-85161789-9586608.jpg" 
              alt="Date Vibe Record Player" 
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default RealDatesDelivered;
