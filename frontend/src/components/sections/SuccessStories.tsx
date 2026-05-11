"use client";

import React from "react";
import { motion } from "framer-motion";
import { Heart, ThumbsUp } from "lucide-react";
import { APP_CONFIG } from "@/config/app";

const TESTIMONIALS = [
  {
    id: 1,
    image: "/assets/WhatsApp Image 2026-05-02 at 12.15.20 (1).jpeg",
    name: "Chinedu @PAU",
    text: `Omo, ${APP_CONFIG.name} makes it super easy to link up with people without stress.`,
    icon: "heart",
    tilt: -2,
  },
  {
    id: 2,
    image: "/assets/WhatsApp Image 2026-05-02 at 12.15.20.jpeg",
    name: "Aisha @Unilag",
    text: "I literally don't need to do anything and just wait for the match. Mad o!",
    icon: "like",
    tilt: 3,
  },
  {
    id: 3,
    image: "/assets/WhatsApp Image 2026-05-02 at 12.15.50.jpeg",
    name: "Tobi @Covenant",
    text: "Because it's tied to school, no casted peeps. The quality is top notch.",
    icon: "like",
    tilt: -1,
  },
  {
    id: 4,
    image: "/assets/WhatsApp Image 2026-05-02 at 12.15.20 (1).jpeg",
    name: "Amaka @Babcock",
    text: "I got matched a few weeks ago, and we've been outside since then!",
    icon: "heart",
    tilt: 2,
  },
  {
    id: 5,
    image: "/assets/WhatsApp Image 2026-05-02 at 12.15.20.jpeg",
    name: "David @UI",
    text: "Way more efficient than juggling 10 talking stages on other apps. No cap.",
    icon: "like",
    tilt: -3,
  },
  {
    id: 6,
    image: "/assets/WhatsApp Image 2026-05-02 at 12.15.50.jpeg",
    name: "Ngozi @OAU",
    text: "Date was massive! The spot we went to was actually lit.",
    icon: "heart",
    tilt: 1,
  }
];

export default function SuccessStories() {
  return (
    <section className="relative w-full py-16 md:py-24 overflow-hidden bg-[#0a0f1a]">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 80s linear infinite;
          display: flex;
          width: max-content;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Title Label */}
      <div className="flex justify-center mb-16 relative z-10 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20, rotate: -5 }}
          whileInView={{ opacity: 1, y: 0, rotate: -2 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-black text-white px-6 py-2 shadow-2xl border border-white/10"
        >
          <h2 className="text-3xl md:text-5xl font-serif tracking-tight drop-shadow-md">
            Unforgettable Great Times
          </h2>
        </motion.div>
      </div>

      {/* Marquee Container */}
      <div className="relative w-full overflow-hidden flex" style={{ paddingBottom: '3rem', paddingTop: '1rem' }}>
        
        {/* Left/Right Fade Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* The scrolling track */}
        <div className="animate-marquee group flex items-center">
          {/* Duplicate the list twice to create the infinite scroll effect */}
          {[...TESTIMONIALS, ...TESTIMONIALS].map((item, idx) => (
            <div 
              key={idx} 
              className="relative w-[260px] md:w-[300px] h-[340px] md:h-[400px] shrink-0 mx-8 md:mx-12"
              style={{ transform: `rotate(${item.tilt}deg)` }}
            >
              {/* Photo */}
              <div className="w-full h-full bg-[#1a1a1a] p-1 pb-1 shadow-2xl border border-white/5 relative overflow-hidden flex items-center justify-center">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Chat Bubble */}
              <div className="absolute -bottom-6 left-2 w-[85%] bg-white text-black p-3 md:p-4 rounded-xl rounded-bl-sm shadow-xl z-30">
                <p className="text-[10px] text-gray-500 font-sans mb-1">{item.name}</p>
                <p className="text-xs md:text-sm font-medium leading-snug">{item.text}</p>
                
                {/* Badge */}
                <div className="absolute -top-3 -right-3 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white text-white">
                  {item.icon === 'heart' ? (
                    <Heart className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <ThumbsUp className="w-3.5 h-3.5 fill-current" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
