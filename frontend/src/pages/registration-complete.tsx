import React from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { CheckCircle, Home, Share2 } from "lucide-react";
import Link from "next/link";
import { APP_CONFIG } from "@/config/app";

export default function RegistrationComplete() {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: APP_CONFIG.name,
          text: `I just joined ${APP_CONFIG.name} to get curated dates every Friday!`,
          url: window.location.origin,
        });
      } catch (error) {
        console.log("Error sharing", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.origin);
      alert("Link copied to clipboard!");
    }
  };

  const whatsappNumber = APP_CONFIG.whatsappNumber.replace(/[^0-9]/g, "");
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    APP_CONFIG.whatsappMessage,
  )}`;

  return (
    <>
      <Head>
        <title>You're in! | {APP_CONFIG.name}</title>
      </Head>
      <div className="min-h-[100dvh] bg-[#0a0f1a] flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
        {/* Standard background pattern */}
        <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1508849789987-4e5333c12b78?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center opacity-[0.03] pointer-events-none" />

        <main className="max-w-xl w-full z-10 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full bg-[#0c1220]/80 border border-white/10 backdrop-blur-md rounded-2xl p-10 md:p-12 flex flex-col items-center text-center relative"
          >
            {/* Standard inner top line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Standardized Simple Checkmark */}
            <div className="w-20 h-20 rounded-full bg-[#0a0f1a]/50 border border-white/10 flex items-center justify-center mb-8 mt-4">
              <CheckCircle className="w-10 h-10 text-white" strokeWidth={1.5} />
            </div>

            <h1 className="text-3xl md:text-4xl font-serif tracking-tight mb-4">
              You're officially on <br />
              <span className="italic font-light text-white/90">
                {APP_CONFIG.name} 🎉
              </span>
            </h1>

            <p className="text-white/50 text-base font-light font-sans max-w-sm mx-auto leading-relaxed mb-8">
              Registration successful. Here's what to expect next:
            </p>

            <div className="w-full flex flex-col gap-5 border-y border-white/5 py-6 mb-10 text-left max-w-sm">
              <div className="flex items-start gap-3">
                <div className="text-base mt-0.5">📅</div>
                <p className="text-white/70 text-sm leading-relaxed font-light">
                  <strong className="text-white font-medium">
                    Weekly Matches:
                  </strong>{" "}
                  We carefully curate and send your matches directly to you
                  every Friday.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-base mt-0.5">🔔</div>
                <p className="text-white/70 text-sm leading-relaxed font-light">
                  <strong className="text-white font-medium">
                    Stay Alerted:
                  </strong>{" "}
                  No further action is needed for now—keep an eye on your
                  messages.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-sm">
              <Link href="/" className="w-full">
                <button className="w-full h-14 rounded-xl flex items-center justify-center gap-3 font-sans font-semibold transition-colors cursor-pointer border-none bg-white text-[#0a0f1a] hover:bg-white/90">
                  <Home className="w-4 h-4" />
                  <span>Back to Home</span>
                </button>
              </Link>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer noopener"
                className="w-full"
              >
                <button className="w-full h-14 rounded-xl flex items-center justify-center gap-3 font-sans font-semibold transition-colors cursor-pointer border-none bg-white text-[#0a0f1a] hover:bg-white/90">
                  <Home className="w-4 h-4" />
                  <span>Send message on whatsapp</span>
                </button>
              </a>

              <button
                onClick={handleShare}
                className="w-full h-14 rounded-xl flex items-center justify-center gap-3 font-sans font-medium transition-all cursor-pointer border border-white/10 bg-transparent text-white/60 hover:border-white/20 hover:text-white"
              >
                <Share2 className="w-4 h-4" />
                <span>Share {APP_CONFIG.name}</span>
              </button>
            </div>
          </motion.div>
        </main>
      </div>
    </>
  );
}
