"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { APP_CONFIG } from "@/config/app";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const threshold = window.innerHeight * 0.1;
      setIsScrolled(window.scrollY > threshold);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "How it works", href: "#how-it-works" },
    { name: "Features", href: "#features" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 w-full z-50 flex justify-center transition-all duration-300 ${
        isScrolled ? "py-3 md:py-4" : "py-5 md:py-6"
      }`}
    >
      <div className="w-full max-w-7xl relative z-50 flex items-center justify-between transition-all duration-300 bg-transparent px-6 py-4 md:px-12 md:py-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-serif text-2xl tracking-[0.15em] font-medium text-white select-none">
            {APP_CONFIG.name.toUpperCase()}
          </span>
        </Link>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/login">
            <Button
              variant="ghost"
              size="default"
              className={`cursor-pointer transition-all duration-300 ${
                isScrolled
                  ? "backdrop-blur-md bg-white/10 border border-white/15 text-white hover:bg-white/20"
                  : "text-foreground/80 hover:text-foreground"
              }`}
              style={{ paddingLeft: "24px", paddingRight: "24px" }}
            >
              Log In
            </Button>
          </Link>
          
          <Link href="/signup">
            <Button
              variant="default"
              size="default"
              className={`cursor-pointer transition-all duration-300 ${
                isScrolled
                  ? "!bg-white !text-black hover:!bg-white/90"
                  : ""
              }`}
              style={{ paddingLeft: "32px", paddingRight: "32px" }}
            >
              Sign Up
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-foreground/80 hover:text-foreground focus:outline-none cursor-pointer"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-primary" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Slide-out */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="absolute top-0 left-0 right-0 w-full bg-[#0c1220] border-b border-white/10 pt-24 pb-8 px-6 shadow-2xl flex flex-col md:hidden z-40 rounded-b-3xl"
          >
            <div className="flex flex-col gap-3">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" size="default" className="w-full cursor-pointer">
                  Log In
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="default" size="default" className="w-full cursor-pointer">
                  Sign Up
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
