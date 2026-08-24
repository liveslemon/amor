import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { signup } from "@/api/auth";
import { completeOnboarding, getMe } from "@/api/profile";
import { useAuthStore } from "@/store/useAuthStore";
import { APP_CONFIG } from "@/config/app";

export default function SignUp() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [signupStep, setSignupStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    whatsapp_number: "",
    password: "",
    gender: "",
    age: "",
    build: "",
    skin_tone: "",
    height_ft: "",
    height_in: "",
    preferred_min_age: "",
    preferred_max_age: "",
    preferred_builds: [] as string[],
    preferred_min_height_ft: "",
    preferred_min_height_in: "",
    preferred_max_height_ft: "",
    preferred_max_height_in: "",
    relationship_goal: "",
    conflict_style: "",
    instagram: "",
    tiktok: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupStep === 1) {
      setSignupStep(2);
      return;
    }

    setLoading(true);
    setError("");

    // Validate
    const trimmedName = formData.name.trim();
    const trimmedPhone = formData.whatsapp_number.trim();
    if (!trimmedName) {
      setError("Name is required");
      setLoading(false);
      return;
    }
    if (trimmedPhone.length < 5) {
      setError("A valid WhatsApp number is required");
      setLoading(false);
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      const res = await signup({
        name: trimmedName,
        whatsapp_number: `+234${trimmedPhone}`,
        password: formData.password,
      });

      if (res.access_token && res.user) {
        setAuth(res.access_token, res.user);

        try {
          const computeInches = (ftStr: string, inStr: string) => {
            if (!ftStr && !inStr) return undefined;
            const ft = ftStr ? parseInt(ftStr, 10) : 0;
            const ins = inStr ? parseInt(inStr, 10) : 0;
            return (ft * 12) + ins;
          };

          await completeOnboarding({
            profile: {
              gender: formData.gender || undefined,
              age: formData.age ? parseInt(formData.age, 10) : undefined,
              build: formData.build || undefined,
              skin_tone: formData.skin_tone || undefined,
              height: computeInches(formData.height_ft, formData.height_in),
              relationship_goal: formData.relationship_goal || undefined,
              conflict_style: formData.conflict_style || undefined,
              instagram: formData.instagram || undefined,
              tiktok: formData.tiktok || undefined,
            },
            preferences: {
              preferred_min_age: formData.preferred_min_age ? parseInt(formData.preferred_min_age, 10) : undefined,
              preferred_max_age: formData.preferred_max_age ? parseInt(formData.preferred_max_age, 10) : undefined,
              preferred_min_height: computeInches(formData.preferred_min_height_ft, formData.preferred_min_height_in),
              preferred_max_height: computeInches(formData.preferred_max_height_ft, formData.preferred_max_height_in),
            },
            preferred_builds: formData.preferred_builds.length > 0 ? formData.preferred_builds : undefined,
          });
        } catch (onboardingErr) {
          console.warn("Onboarding partial failure:", onboardingErr);
        }

        // Redirect to matchmaking Step1 for photo uploads/focuses since they already provided everything else
        router.replace("/matchmaking/Step1");
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
        <title>{`Sign Up | ${APP_CONFIG.name}`}</title>
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

        <div className="max-w-2xl w-full z-10 flex flex-col mt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-[#0c1220]/80 border border-white/10 backdrop-blur-md rounded-2xl p-8 md:p-12 flex flex-col relative overflow-hidden"
          >
            {/* Subtle inner top glare */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-serif tracking-tight leading-[1.1] mb-4">
                Create your <br />
                <span className="italic font-light text-white/90">
                  {APP_CONFIG.name} Profile
                </span>
              </h1>
              <p className="text-sm md:text-base text-white/50 font-sans font-light max-w-md mx-auto leading-relaxed">
                Join the waitlist and let our algorithm curate your perfect Friday
                date. No swiping. No ghosting.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="w-full flex flex-col gap-4"
            >
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl text-sm mb-2 text-center">
                  {error}
                </div>
              )}

              {signupStep === 1 && (
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-white/50 mb-1.5 ml-1">Full Name</label>
                      <input required type="text" placeholder="Your full name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-[#0a0f1a]/50 border border-white/10 rounded-xl px-4 py-3 text-white text-base outline-none focus:border-white/30 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-white/50 mb-1.5 ml-1">WhatsApp Number</label>
                      <div className="flex w-full">
                        <span className="bg-[#0a0f1a]/50 border border-white/10 border-r-0 rounded-l-xl px-3 py-3 text-white/70 text-sm flex items-center shrink-0">🇳🇬 +234</span>
                        <input required type="tel" inputMode="numeric" placeholder="8012345678" value={formData.whatsapp_number} onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value.replace(/[^0-9]/g, "") })} className="w-full bg-[#0a0f1a]/50 border border-white/10 rounded-r-xl px-4 py-3 text-white text-base outline-none focus:border-white/30 transition-colors" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-white/50 mb-1.5 ml-1">Gender</label>
                      <input required type="text" placeholder="e.g. Female" value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="w-full bg-[#0a0f1a]/50 border border-white/10 rounded-xl px-4 py-3 text-white text-base outline-none focus:border-white/30 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-white/50 mb-1.5 ml-1">Age</label>
                      <input required type="number" min="18" placeholder="e.g. 23" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} className="w-full bg-[#0a0f1a]/50 border border-white/10 rounded-xl px-4 py-3 text-white text-base outline-none focus:border-white/30 transition-colors" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-white/50 mb-1.5 ml-1">Build</label>
                      <select required value={formData.build} onChange={(e) => setFormData({ ...formData, build: e.target.value })} className="w-full bg-[#0a0f1a]/50 border border-white/10 rounded-xl px-4 py-3 text-white text-base outline-none focus:border-white/30 transition-colors appearance-none">
                        <option value="" disabled>Select build</option>
                        <option value="Slim">Slim</option>
                        <option value="Petite">Petite</option>
                        <option value="Athletic">Athletic</option>
                        <option value="Average">Average</option>
                        <option value="Muscular">Muscular</option>
                        <option value="Curvy">Curvy</option>
                        <option value="Plus-size">Plus-size</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-white/50 mb-1.5 ml-1">Skin Tone</label>
                      <input required type="text" placeholder="e.g. Brown" value={formData.skin_tone} onChange={(e) => setFormData({ ...formData, skin_tone: e.target.value })} className="w-full bg-[#0a0f1a]/50 border border-white/10 rounded-xl px-4 py-3 text-white text-base outline-none focus:border-white/30 transition-colors" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-white/50 mb-1.5 ml-1">Height</label>
                      <div className="flex gap-2 w-full">
                        <div className="relative flex-1">
                          <input required type="number" min="3" max="8" placeholder="Ft" value={formData.height_ft} onChange={(e) => setFormData({ ...formData, height_ft: e.target.value })} className="w-full bg-[#0a0f1a]/50 border border-white/10 rounded-xl pl-3 pr-6 py-3 text-white text-base outline-none focus:border-white/30 transition-colors" />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40">ft</span>
                        </div>
                        <div className="relative flex-1">
                          <input required type="number" min="0" max="11" placeholder="In" value={formData.height_in} onChange={(e) => setFormData({ ...formData, height_in: e.target.value })} className="w-full bg-[#0a0f1a]/50 border border-white/10 rounded-xl pl-3 pr-6 py-3 text-white text-base outline-none focus:border-white/30 transition-colors" />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40">in</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-white/50 mb-1.5 ml-1">Pref Age Range</label>
                      <div className="flex gap-2 w-full">
                        <input required type="number" min="18" placeholder="Min" value={formData.preferred_min_age} onChange={(e) => setFormData({ ...formData, preferred_min_age: e.target.value })} className="w-full bg-[#0a0f1a]/50 border border-white/10 rounded-xl px-3 py-3 text-white text-base outline-none focus:border-white/30 transition-colors" />
                        <input required type="number" min="18" placeholder="Max" value={formData.preferred_max_age} onChange={(e) => setFormData({ ...formData, preferred_max_age: e.target.value })} className="w-full bg-[#0a0f1a]/50 border border-white/10 rounded-xl px-3 py-3 text-white text-base outline-none focus:border-white/30 transition-colors" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-white/50 mb-1.5 ml-1">Pref Body Type</label>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {["Slim", "Petite", "Athletic", "Average", "Muscular", "Curvy", "Plus-size"].map(b => (
                          <button key={b} type="button" onClick={() => setFormData({ ...formData, preferred_builds: formData.preferred_builds.includes(b) ? formData.preferred_builds.filter(x => x !== b) : [...formData.preferred_builds, b] })} className={`text-[11px] px-3 py-1.5 rounded-full border transition-colors ${formData.preferred_builds.includes(b) ? 'bg-[#ff5fb8]/20 border-[#ff5fb8]/50 text-[#ff5fb8]' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'}`}>{b}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-white/50 mb-1.5 ml-1">Pref Height</label>
                      <div className="flex gap-2 w-full items-center">
                        <div className="flex-1 flex gap-1">
                          <input required type="number" min="3" max="8" placeholder="Ft" value={formData.preferred_min_height_ft} onChange={(e) => setFormData({ ...formData, preferred_min_height_ft: e.target.value })} className="w-full bg-[#0a0f1a]/50 border border-white/10 rounded-xl px-2 py-3 text-white text-base outline-none focus:border-white/30 transition-colors text-center" />
                          <input required type="number" min="0" max="11" placeholder="In" value={formData.preferred_min_height_in} onChange={(e) => setFormData({ ...formData, preferred_min_height_in: e.target.value })} className="w-full bg-[#0a0f1a]/50 border border-white/10 rounded-xl px-2 py-3 text-white text-base outline-none focus:border-white/30 transition-colors text-center" />
                        </div>
                        <span className="text-white/30 text-xs">-</span>
                        <div className="flex-1 flex gap-1">
                          <input required type="number" min="3" max="8" placeholder="Ft" value={formData.preferred_max_height_ft} onChange={(e) => setFormData({ ...formData, preferred_max_height_ft: e.target.value })} className="w-full bg-[#0a0f1a]/50 border border-white/10 rounded-xl px-2 py-3 text-white text-base outline-none focus:border-white/30 transition-colors text-center" />
                          <input required type="number" min="0" max="11" placeholder="In" value={formData.preferred_max_height_in} onChange={(e) => setFormData({ ...formData, preferred_max_height_in: e.target.value })} className="w-full bg-[#0a0f1a]/50 border border-white/10 rounded-xl px-2 py-3 text-white text-base outline-none focus:border-white/30 transition-colors text-center" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {signupStep === 2 && (
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-white/50 mb-1.5 ml-1">Relationship Goal</label>
                      <select required value={formData.relationship_goal} onChange={(e) => setFormData({ ...formData, relationship_goal: e.target.value })} className="w-full bg-[#0a0f1a]/50 border border-white/10 rounded-xl px-4 py-3 text-white text-base outline-none focus:border-white/30 transition-colors appearance-none">
                        <option value="" disabled>Select goal</option>
                        <option value="Marriage bound">Marriage bound</option>
                        <option value="Long-term">Long-term</option>
                        <option value="Short-term">Short-term</option>
                        <option value="Just looking for fun">Just looking for fun</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-white/50 mb-1.5 ml-1">Conflict Style</label>
                      <select required value={formData.conflict_style} onChange={(e) => setFormData({ ...formData, conflict_style: e.target.value })} className="w-full bg-[#0a0f1a]/50 border border-white/10 rounded-xl px-4 py-3 text-white text-base outline-none focus:border-white/30 transition-colors appearance-none">
                        <option value="" disabled>Select style</option>
                        <option value="Talk it out immediately">Talk it out immediately</option>
                        <option value="Need space then talk">Need space then talk</option>
                        <option value="Let it blow over">Let it blow over</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-white/50 mb-1.5 ml-1">Instagram</label>
                      <input type="text" placeholder="@username" value={formData.instagram} onChange={(e) => setFormData({ ...formData, instagram: e.target.value })} className="w-full bg-[#0a0f1a]/50 border border-white/10 rounded-xl px-4 py-3 text-white text-base outline-none focus:border-white/30 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-white/50 mb-1.5 ml-1">TikTok</label>
                      <input type="text" placeholder="@username" value={formData.tiktok} onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })} className="w-full bg-[#0a0f1a]/50 border border-white/10 rounded-xl px-4 py-3 text-white text-base outline-none focus:border-white/30 transition-colors" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-white/50 mb-1.5 ml-1">Password</label>
                    <input required type="password" placeholder="Create a strong password" minLength={8} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full bg-[#0a0f1a]/50 border border-white/10 rounded-xl px-4 py-3 text-white text-base outline-none focus:border-white/30 transition-colors" />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 mt-6">
                {signupStep === 2 && (
                  <button
                    type="button"
                    onClick={() => setSignupStep(1)}
                    className="min-w-[120px] h-[52px] rounded-xl border border-white/15 bg-white/5 px-6 font-sans font-semibold text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-[52px] flex items-center justify-center gap-3 bg-white text-[#0a0f1a] px-8 rounded-xl font-sans font-semibold text-base hover:bg-white/90 transition-colors cursor-pointer border-none outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : signupStep === 1 ? (
                    <>
                      <span>Next Step</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <CheckCircle2 className="w-5 h-5 text-[#ff5fb8]" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 text-sm text-white/40 text-center">
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
