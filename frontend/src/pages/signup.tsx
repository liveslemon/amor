import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { signup } from "@/api/auth";
import { completeOnboarding, getMe } from "@/api/profile";
import { useAuthStore } from "@/store/useAuthStore";
import { APP_CONFIG } from "@/config/app";
import { ProfileFieldsStep1 } from "@/components/profile/ProfileFieldsStep1";

export default function SignUp() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const user = useAuthStore((state) => state.user);

  // An already-registered user with incomplete onboarding (e.g. their
  // preference rows were cleared) gets sent back here by /login with
  // ?resume=1 — reuse this same wizard, but skip account creation and jump
  // straight into the preference steps, prefilled from whatever they have.
  const isResume = router.query.resume === "1" && !!user;

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
  const [prefilling, setPrefilling] = useState(false);

  useEffect(() => {
    if (!isResume) return;

    setPrefilling(true);
    getMe()
      .then((data) => {
        const profile = data?.profile;
        const preferences = data?.preferences;
        setFormData((prev) => ({
          ...prev,
          gender: profile?.gender || "",
          age: profile?.age != null ? String(profile.age) : "",
          build: profile?.build || "",
          skin_tone: profile?.skin_tone || "",
          height_ft: profile?.height?.feet != null ? String(profile.height.feet) : "",
          height_in: profile?.height?.inches != null ? String(profile.height.inches) : "",
          preferred_min_age:
            preferences?.preferred_min_age != null ? String(preferences.preferred_min_age) : "",
          preferred_max_age:
            preferences?.preferred_max_age != null ? String(preferences.preferred_max_age) : "",
          preferred_builds: data?.preferred_builds || [],
          preferred_min_height_ft:
            preferences?.preferred_min_height?.feet != null
              ? String(preferences.preferred_min_height.feet)
              : "",
          preferred_min_height_in:
            preferences?.preferred_min_height?.inches != null
              ? String(preferences.preferred_min_height.inches)
              : "",
          preferred_max_height_ft:
            preferences?.preferred_max_height?.feet != null
              ? String(preferences.preferred_max_height.feet)
              : "",
          preferred_max_height_in:
            preferences?.preferred_max_height?.inches != null
              ? String(preferences.preferred_max_height.inches)
              : "",
          relationship_goal: profile?.relationship_goal || "",
          conflict_style: profile?.conflict_style || "",
          instagram: profile?.instagram || "",
          tiktok: profile?.tiktok || "",
        }));
      })
      .catch((err) => {
        console.error("Could not load existing profile to resume onboarding:", err);
      })
      .finally(() => setPrefilling(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isResume]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupStep === 1) {
      setSignupStep(2);
      return;
    }

    setLoading(true);
    setError("");

    if (!isResume) {
      // Validate account-creation fields — skipped in resume mode since the
      // account already exists.
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
    }

    const computeInches = (ftStr: string, inStr: string) => {
      if (!ftStr && !inStr) return undefined;
      const ft = ftStr ? parseInt(ftStr, 10) : 0;
      const ins = inStr ? parseInt(inStr, 10) : 0;
      return ft * 12 + ins;
    };

    const onboardingPayload = {
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
    };

    try {
      if (isResume) {
        await completeOnboarding(onboardingPayload);
        router.replace("/home");
        return;
      }

      const trimmedName = formData.name.trim();
      const trimmedPhone = formData.whatsapp_number.trim();
      const res = await signup({
        name: trimmedName,
        whatsapp_number: `+234${trimmedPhone}`,
        password: formData.password,
      });

      if (res.access_token && res.user) {
        setAuth(res.access_token, res.user);
        await completeOnboarding(onboardingPayload);

        // Redirect directly to main PWA home dashboard
        router.replace("/home");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          (isResume ? "Could not save your profile" : "Signup failed"),
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
            className="flex items-center gap-2 font-serif text-2xl tracking-[0.15em] font-medium text-white hover:opacity-80 transition-opacity"
          >
            <img src="/logo-mark.png" alt="" className="h-7 w-7" />
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
                {isResume ? (
                  <>
                    Finish your <br />
                    <span className="italic font-light text-white/90">
                      {APP_CONFIG.name} Profile
                    </span>
                  </>
                ) : (
                  <>
                    Create your <br />
                    <span className="italic font-light text-white/90">
                      {APP_CONFIG.name} Profile
                    </span>
                  </>
                )}
              </h1>
              <p className="text-sm md:text-base text-white/50 font-sans font-light max-w-md mx-auto leading-relaxed">
                {isResume
                  ? "A few details are missing from your profile — fill these back in to get matched again."
                  : "Join the waitlist and let our algorithm curate your perfect Friday date. No swiping. No ghosting."}
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
                  {prefilling && (
                    <p className="text-xs text-white/40 text-center">Loading your existing profile…</p>
                  )}

                  {!isResume && (
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
                  )}

                  <ProfileFieldsStep1
                    value={formData}
                    onChange={(patch) => setFormData({ ...formData, ...patch })}
                  />
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

                  {!isResume && (
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-white/50 mb-1.5 ml-1">Password</label>
                      <input required type="password" placeholder="Create a strong password" minLength={8} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full bg-[#0a0f1a]/50 border border-white/10 rounded-xl px-4 py-3 text-white text-base outline-none focus:border-white/30 transition-colors" />
                    </div>
                  )}
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
                      <span>{isResume ? "Save Profile" : "Complete Registration"}</span>
                      <CheckCircle2 className="w-5 h-5 text-[#ff5fb8]" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {!isResume && (
              <div className="mt-8 text-sm text-white/40 text-center">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-white hover:underline underline-offset-4 transition-all"
                >
                  Log In
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}
