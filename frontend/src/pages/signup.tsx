import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { signup } from "@/api/auth";
import { useAuthStore } from "@/store/useAuthStore";
import { APP_CONFIG } from "@/config/app";

export default function SignUp() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [formData, setFormData] = useState({
    name: "",
    whatsapp_number: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signup(formData);

      if (res.access_token && res.user) {
        setAuth(res.access_token, res.user);
        setIsSuccess(true);
        // Give them a moment to see confirmation
        setTimeout(() => {
          router.push("/matchmaking/Step1");
        }, 1800);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Signup failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign Up | {APP_CONFIG.name}</title>
      </Head>
      <div className="min-h-[100dvh] bg-[#0a0f1a] flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
        {/* Deep Background Elements */}
        <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1508849789987-4e5333c12b78?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center opacity-[0.03] pointer-events-none" />

        {/* Logo / Home Link */}
        <div className="absolute top-8 left-8 z-20">
          <Link
            href="/"
            className="font-serif text-2xl tracking-[0.15em] font-medium text-white hover:opacity-80 transition-opacity"
          >
            {APP_CONFIG.name.toUpperCase()}
          </Link>
        </div>

        <div className="max-w-xl w-full z-10 flex flex-col mt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-[#0c1220]/80 border border-white/10 backdrop-blur-md rounded-2xl p-10 md:p-14 flex flex-col items-center text-center relative overflow-hidden"
          >
            {/* Subtle inner top glare */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <h1 className="text-4xl md:text-5xl font-serif tracking-tight leading-[1.1] mb-6 mt-4">
              Create your <br />
              <span className="italic font-light text-white/90">
                {APP_CONFIG.name} Profile
              </span>
            </h1>

            <p className="text-base md:text-lg text-white/50 mb-8 font-sans font-light max-w-sm mx-auto leading-relaxed">
              {isSuccess
                ? "Account created successfully!"
                : "Join the waitlist and let our algorithm curate your perfect Friday date. No swiping. No ghosting."}
            </p>

            {isSuccess ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center py-8"
              >
                <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mb-4">
                  <motion.svg
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-emerald-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </motion.svg>
                </div>
                <h2 className="text-2xl font-serif text-white mb-1">
                  Welcome, {formData.name}!
                </h2>
                <p className="text-white/40 text-sm font-sans">
                  Taking you to onboarding...
                </p>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="w-full flex flex-col gap-4"
              >
                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl text-sm mb-2">
                    {error}
                  </div>
                )}

                <input
                  type="text"
                  placeholder="First Name"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-[#0a0f1a]/50 border border-white/10 rounded-xl px-6 py-4 text-white text-lg outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
                />
                <input
                  type="tel"
                  placeholder="WhatsApp Number (e.g. +234...)"
                  required
                  value={formData.whatsapp_number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      whatsapp_number: e.target.value,
                    })
                  }
                  className="w-full bg-[#0a0f1a]/50 border border-white/10 rounded-xl px-6 py-4 text-white text-lg outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
                />
                <input
                  type="password"
                  placeholder="Password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full bg-[#0a0f1a]/50 border border-white/10 rounded-xl px-6 py-4 text-white text-lg outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex items-center justify-center gap-3 bg-white text-[#0a0f1a] px-8 py-4 rounded-xl font-sans font-semibold text-lg hover:bg-white/90 transition-colors cursor-pointer border-none outline-none disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Begin Onboarding</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="mt-8 text-sm text-white/40">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-white hover:underline underline-offset-4 transition-all"
              >
                Log In
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
