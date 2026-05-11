"use client";

import React from "react";
import Link from "next/link";
import { APP_CONFIG } from "@/config/app";

const Footer = () => {
  return (
    <footer className="w-full min-h-[45vh] bg-[#06090f] border-t border-white/10 px-6 md:px-12 lg:px-20 py-12 flex flex-col items-center justify-center relative">
      {/* BACK TO TOP */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-[#06090f] border border-white/15 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 hover:bg-[#090d16] transition-all hover:scale-110 active:scale-95 shadow-[0_4px_20px_rgba(0,0,0,0.5)] z-[80] group cursor-pointer"
        aria-label="Back to top"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-y-0.5 transition-transform">
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </button>

      <div className="w-full max-w-5xl mx-auto flex flex-col gap-20">

        {/* TOP */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-16">

          {/* LEFT */}
          <div className="flex flex-col gap-8">

            {/* Speech Bubble */}
            <div className="relative w-fit ">
              <div className="bg-white text-[#0a0f1a] px-10 py-6 rounded-[28px] rounded-bl-md max-w-[85vw] sm:max-w-[340px] shadow-sm">
                <p className="text-lg lg:text-[22px] leading-[1.25] tracking-[-0.03em] font-medium">
                  A friend that texts you
                  <br />
                  ready-to-go dates.
                </p>
              </div>
            </div>

            {/* Logo */}
            <span className="text-white font-black tracking-[-0.08em] leading-none text-6xl sm:text-7xl lg:text-[110px]">
              {APP_CONFIG.name.toUpperCase()}
            </span>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col items-start lg:items-end gap-5">
            <span className="text-white/35 uppercase tracking-[0.2em] text-xs">
              Resources
            </span>

            <div className="flex flex-col items-start lg:items-end gap-3">
              <Link
                href="/careers"
                className="text-white/75 hover:text-white transition-colors text-lg flex items-center gap-2"
              >
                Careers
                <span className="text-xs">↗</span>
              </Link>

              <Link
                href="/manifesto"
                className="text-white/75 hover:text-white transition-colors text-lg flex items-center gap-2"
              >
                Manifesto
                <span className="text-xs">↗</span>
              </Link>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-10">

          {/* Socials */}
          <div className="flex items-center gap-4">

            {/* Instagram */}
            <a
              href="https://instagram.com"
              aria-label="Instagram"
              className="w-11 h-11 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center text-white/60 hover:text-white hover:border-white/20 transition-all"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>

            {/* TikTok */}
            <a
              href="https://tiktok.com"
              aria-label="TikTok"
              className="w-11 h-11 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center text-white/60 hover:text-white hover:border-white/20 transition-all"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.88a8.28 8.28 0 0 0 4.76 1.5V6.93a4.84 4.84 0 0 1-1-.24z" />
              </svg>
            </a>

            {/* X */}
            <a
              href="https://twitter.com"
              aria-label="X"
              className="w-11 h-11 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center text-white/60 hover:text-white hover:border-white/20 transition-all"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>

          {/* Legal */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-white/45">
            <span>© {APP_CONFIG.name.toUpperCase()} {new Date().getFullYear()}</span>

            <Link
              href="/terms"
              className="hover:text-white transition-colors"
            >
              Terms
            </Link>

            <Link
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              Privacy
            </Link>

            <Link
              href="/cookies"
              className="hover:text-white transition-colors"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;