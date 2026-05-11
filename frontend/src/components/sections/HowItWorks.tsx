"use client";

import React from "react";
import { motion } from "framer-motion";
import { APP_CONFIG } from "@/config/app";

const steps = [
  {
    title: `Tell ${APP_CONFIG.name} Your Type`,
    description: "Submit your preferences by Tuesday 11:59 PM.",
    imageAsset: (
      <div className="w-20 h-20 md:w-24 md:h-24 bg-[#111827] rounded-xl flex items-center justify-center border border-white/10 shadow-xl">
        <span className="text-[10px] text-white/40 uppercase tracking-widest font-medium">Profile</span>
      </div>
    ),
  },
  {
    title: "The Wednesday Drop",
    description: "Check your iMessage at 7pm. We will send you one\npersonalized match and curate your date for you!",
    imageAsset: (
      <div className="w-36 h-24 md:w-48 md:h-28 bg-[#111827] rounded-lg flex items-center justify-center border border-white/10 shadow-xl">
         <span className="text-[10px] md:text-xs text-white/50 uppercase tracking-widest font-medium">Match</span>
      </div>
    ),
  },
  {
    title: "Schedule the Date",
    description: "Find a time that works for both of you to meet up.",
    imageAsset: (
      <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-xl flex flex-col items-center justify-center shadow-xl border border-white/20">
         <div className="w-full h-1/4 bg-red-500 rounded-t-lg border-b border-red-600 mb-1" />
         <span className="text-xl md:text-2xl font-bold text-gray-800">14</span>
      </div>
    ),
  },
  {
    title: "Have fun!",
    description: "Enjoy a good time with your personalized date!",
    imageAsset: (
      <div className="w-24 h-28 md:w-28 md:h-32 bg-white p-2 pb-6 shadow-xl rotate-3 flex flex-col border border-white/20">
         <div className="flex-1 bg-gray-800 flex items-center justify-center rounded-sm">
            <span className="text-[9px] text-white/50 uppercase tracking-widest font-medium">Polaroid</span>
         </div>
      </div>
    ),
  },
];

const HowItWorks = () => {
  return (
    <section 
      id="how-it-works" 
      className="py-16 md:py-24 w-full flex flex-col items-center justify-center overflow-hidden bg-[#0c1220] text-white relative"
    >
      <div className="w-full max-w-5xl mx-auto px-4 md:px-6">
        
        {/* Title */}
        <div className="text-center mb-8 md:mb-12 flex justify-center w-full">
          <div className="bg-black px-5 py-1.5 flex items-center gap-1 shadow-xl rounded-sm">
            <h2 className="text-3xl md:text-4xl font-serif tracking-tight">
              How It <span className="text-[#ff1493] font-[family-name:var(--font-marker)] font-normal tracking-wide inline-block -rotate-2 ml-1">works</span>
            </h2>
          </div>
        </div>

        {/* Alternating Zig-Zag Layout - Slightly increased gaps */}
        <div className="flex flex-col gap-8 md:gap-10 w-full">
          {steps.map((step, index) => {
            const isLeft = index % 2 === 0;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                viewport={{ once: true, margin: "0px" }}
                className={`flex w-full ${isLeft ? "justify-start md:pl-16" : "justify-end md:pr-16"}`}
              >
                <div className="w-full md:w-[60%] flex flex-col items-center text-center">
                  
                  {/* Step Title & Number */}
                  <div className="flex items-center gap-2 mb-2 md:mb-2.5">
                    <span className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full border-[1.5px] border-orange-400 text-orange-400 text-xs md:text-sm font-bold shrink-0">
                      {index + 1}
                    </span>
                    <h3 className="text-xl md:text-2xl font-serif tracking-wide drop-shadow-md">
                      {step.title}
                    </h3>
                  </div>

                  {/* Step Description */}
                  <p className="text-gray-200 text-sm md:text-base leading-tight mb-4 md:mb-5 max-w-[320px] drop-shadow-sm whitespace-pre-line">
                    {step.description}
                  </p>

                  {/* Image Asset Container */}
                  <div className="relative group transition-transform duration-300 hover:scale-105 cursor-default">
                    {step.imageAsset}
                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;