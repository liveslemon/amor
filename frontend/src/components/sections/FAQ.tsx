"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { APP_CONFIG } from "@/config/app";

const faqs = [
  {
    question: `How does ${APP_CONFIG.name} work?`,
    answer:
      `${APP_CONFIG.name} curates dates for you without requiring you to swipe or chat. We pair you by analyzing your profile and preferences, then we text you a date plan with the time, place, and details of your match.`,
  },
  {
    question: "What will I know about my match before the date?",
    answer:
      "We provide you with essential details like their general interests, basic background, and why we think you'd be a great match, while preserving enough mystery for a great first conversation.",
  },
  {
    question: "Where do the dates happen?",
    answer:
      "Dates take place at carefully selected local spots to ensure a safe and enjoyable experience. Usually, these are public places like coffee shops or cozy bistros near your location.",
  },
  {
    question: "What if I don't like my match/date?",
    answer:
      "Not every date will be perfect. Your feedback after the date is crucial because it helps our algorithm better understand your preferences for future matches.",
  },
];

const FAQItem = ({
  question,
  answer,
  index,
  isLast,
}: {
  question: string;
  answer: string;
  index: number;
  isLast: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.05 }}
      viewport={{ once: true }}
      className={cn(
        "overflow-hidden transition-all duration-300",
        !isLast && "border-b border-white/10",
        isOpen
          ? "bg-white/[0.03]"
          : "hover:bg-white/[0.02]"
      )}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-8 md:px-10 py-6 text-left group"
      >
        <span
          className={cn(
            "text-[15px] md:text-base font-medium tracking-tight transition-colors duration-300",
            isOpen
              ? "text-white"
              : "text-white/75 group-hover:text-white"
          )}
        >
          {question}
        </span>

        <div
          className={cn(
            "relative flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-300 shrink-0 ml-6",
            isOpen
              ? "border-white/20 bg-white/10"
              : "border-white/10 bg-white/[0.03]"
          )}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 14 14"
            fill="none"
            className={cn(
              "transition-transform duration-300",
              isOpen && "rotate-45"
            )}
          >
            <path
              d="M7 1V13M1 7H13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="text-white/80"
            />
          </svg>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="overflow-hidden"
          >
            <div className="px-8 md:px-10 pb-6">
              <p className="text-sm md:text-[15px] leading-7 text-white/55 max-w-[92%]">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FAQ = () => {
  return (
    <section
      id="faq"
      className="relative w-full min-h-[100dvh] px-6 py-16 md:py-24 overflow-hidden flex flex-col items-center justify-center bg-[#080d16]"
    >


      <div className="relative z-10 w-full max-w-5xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-white/40 mb-4">
            Support
          </p>

          <h2 className="text-4xl md:text-6xl font-serif text-white tracking-tight">
            Frequently Asked
            <span className="block text-[#ff69b4] font-[family-name:var(--font-marker)] font-normal tracking-wide -rotate-2 mt-4">
              Questions
            </span>
          </h2>
        </motion.div>

        {/* FAQ Container */}
        <div className="border border-white/10 bg-white/[0.02] backdrop-blur-sm overflow-hidden rounded-2xl">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              index={index}
              isLast={index === faqs.length - 1}
              {...faq}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;