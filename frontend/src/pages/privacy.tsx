"use client";

import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { ArrowLeft, ShieldCheck, FileText } from "lucide-react";
import { APP_CONFIG } from "@/config/app";

export default function PrivacyPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">("privacy");

  const handleBack = () => {
    if (typeof window !== "undefined") {
      const token =
        localStorage.getItem("mingle_token") ||
        localStorage.getItem("mingle_access_token");
      if (token) {
        router.push("/me");
        return;
      }
    }
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/me");
    }
  };

  return (
    <>
      <Head>
        <title>{APP_CONFIG.name} | Privacy Policy</title>
      </Head>

      <div className="min-h-screen bg-[#000B1A] text-[#F8F9FA] selection:bg-[#ff5fb8] selection:text-white">
        {/* Sleek Top Header with Just 'Back' */}
        <header className="sticky top-0 z-40 bg-[#000B1A]/95 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 py-3.5">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors cursor-pointer py-1 px-2.5 -ml-2.5 rounded-full hover:bg-white/5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back</span>
            </button>

            <span className="text-xs font-sans text-white/40 uppercase tracking-widest font-medium">
              Legal & Guidelines
            </span>
          </div>
        </header>

        {/* Main Document Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-sans uppercase tracking-[0.2em] text-[#FFB6C1]">
              <ShieldCheck className="w-4 h-4" />
              <span className="flex items-center gap-1">
                <span className="font-[family-name:var(--font-marker)] capitalize text-sm font-normal text-white">Minglee</span>
                <span>Community Guidelines</span>
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl text-white tracking-tight">
              {activeTab === "privacy" ? "Privacy Policy" : "Terms of Service"}
            </h1>
            <p className="text-xs text-white/40">Last updated: August 11, 2026</p>

            {/* Segmented Tab Switcher */}
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.04] w-fit border border-white/5 mt-4">
              <button
                type="button"
                onClick={() => setActiveTab("privacy")}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === "privacy"
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:text-white"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Privacy Policy</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("terms")}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === "terms"
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Terms of Service</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-[#0c1322] border border-white/5 p-6 sm:p-8 space-y-7 text-white/80 text-sm leading-relaxed">
            {activeTab === "privacy" ? (
              <>
                <section className="space-y-3">
                  <p>
                    This Privacy Policy explains how {APP_CONFIG.name} collects, uses, shares, and
                    protects your personal information when you use our platform and matchmaking
                    services.
                  </p>
                </section>

                <section className="space-y-2 border-t border-white/5 pt-5">
                  <h2 className="font-serif text-lg text-white font-medium">1. Information We Collect</h2>
                  <p>We collect information you provide directly during registration and onboarding:</p>
                  <ul className="list-disc pl-5 space-y-1.5 text-white/70">
                    <li>Account details: name, university WhatsApp number, and password;</li>
                    <li>
                      Matchmaking criteria: age, gender, height, body type, lifestyle preferences, and
                      relationship goals;
                    </li>
                    <li>Photos uploaded to represent yourself to prospective matches;</li>
                    <li>Direct support communications and date feedback ratings.</li>
                  </ul>
                </section>

                <section className="space-y-2 border-t border-white/5 pt-5">
                  <h2 className="font-serif text-lg text-white font-medium">2. How We Use Information</h2>
                  <p>We use your information exclusively to:</p>
                  <ul className="list-disc pl-5 space-y-1.5 text-white/70">
                    <li>Run the Friday matchmaking algorithm and curate dates;</li>
                    <li>Connect you directly to introduced matches via WhatsApp;</li>
                    <li>Protect members and provide concierge customer assistance;</li>
                    <li>Enforce community guidelines and campus trust.</li>
                  </ul>
                </section>

                <section className="space-y-2 border-t border-white/5 pt-5">
                  <h2 className="font-serif text-lg text-white font-medium">3. Information Sharing</h2>
                  <p>
                    We never sell personal information. We only reveal relevant profile details
                    (name, photos, height, age, lifestyle tags) to your singular introduced match on
                    Friday morning.
                  </p>
                </section>

                <section className="space-y-2 border-t border-white/5 pt-5">
                  <h2 className="font-serif text-lg text-white font-medium">4. Security & Deletion</h2>
                  <p>
                    We employ industry-standard encryption and database access restrictions. You can
                    request data deletion or account removal at any time through our concierge
                    support channel.
                  </p>
                </section>
              </>
            ) : (
              <>
                <section className="space-y-3">
                  <p>
                    These Terms of Service (“Terms”) govern your use of the {APP_CONFIG.name}{" "}
                    platform and matchmaking services. By creating an account or using the service,
                    you agree to these Terms and our Privacy Policy.
                  </p>
                </section>

                <section className="space-y-2 border-t border-white/5 pt-5">
                  <h2 className="font-serif text-lg text-white font-medium">1. Who Can Use Minglee</h2>
                  <p>
                    You must be at least 18 years old and legally able to enter into this agreement.
                    You must provide accurate account and profile information, keep your login
                    details private, and tell us promptly if you suspect unauthorized use of your
                    account.
                  </p>
                </section>

                <section className="space-y-2 border-t border-white/5 pt-5">
                  <h2 className="font-serif text-lg text-white font-medium">2. Our Service</h2>
                  <p>
                    Minglee uses the information you provide to help curate potential matches and
                    date introductions every Friday. A match or introduction is not a guarantee of
                    compatibility, a relationship, or any specific outcome.
                  </p>
                </section>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
