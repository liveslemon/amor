import React, { useState } from "react";
import { APP_CONFIG } from "@/config/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, Check, Pencil } from "lucide-react";
import { useMatchStore } from "@/store/useMatchStore";

const bodyTypeIcons: Record<string, React.ReactNode> = {
  Slim: (
    <svg
      viewBox="0 0 40 80"
      className="w-5 h-8"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="20" cy="8" r="6" />
      <line x1="20" y1="14" x2="20" y2="48" />
      <line x1="20" y1="22" x2="12" y2="36" />
      <line x1="20" y1="22" x2="28" y2="36" />
      <line x1="20" y1="48" x2="14" y2="72" />
      <line x1="20" y1="48" x2="26" y2="72" />
    </svg>
  ),
  Petite: (
    <svg
      viewBox="0 0 40 80"
      className="w-5 h-8"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="20" cy="10" r="6" />
      <line x1="20" y1="16" x2="20" y2="46" />
      <line x1="20" y1="24" x2="13" y2="35" />
      <line x1="20" y1="24" x2="27" y2="35" />
      <line x1="20" y1="46" x2="15" y2="66" />
      <line x1="20" y1="46" x2="25" y2="66" />
    </svg>
  ),
  Athletic: (
    <svg
      viewBox="0 0 40 80"
      className="w-5 h-8"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="20" cy="8" r="6" />
      <path d="M20 14 L20 48" />
      <path d="M20 20 Q15 22 10 34" />
      <path d="M20 20 Q25 22 30 34" />
      <path
        d="M16 18 L24 18 L25 30 L20 48 L15 30 Z"
        fill="currentColor"
        opacity="0.15"
      />
      <line x1="20" y1="48" x2="13" y2="72" />
      <line x1="20" y1="48" x2="27" y2="72" />
    </svg>
  ),
  Average: (
    <svg
      viewBox="0 0 40 80"
      className="w-5 h-8"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="20" cy="8" r="6" />
      <path d="M20 14 L20 48" />
      <path d="M20 22 L11 36" />
      <path d="M20 22 L29 36" />
      <path
        d="M17 18 L23 18 L26 32 L20 48 L14 32 Z"
        fill="currentColor"
        opacity="0.1"
      />
      <line x1="20" y1="48" x2="13" y2="72" />
      <line x1="20" y1="48" x2="27" y2="72" />
    </svg>
  ),
  Muscular: (
    <svg
      viewBox="0 0 40 80"
      className="w-5 h-8"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="20" cy="8" r="6" />
      <path d="M20 14 L20 48" />
      <path d="M20 19 Q13 20 8 32" />
      <path d="M20 19 Q27 20 32 32" />
      <path
        d="M14 17 L26 17 L28 30 L20 48 L12 30 Z"
        fill="currentColor"
        opacity="0.2"
      />
      <line x1="20" y1="48" x2="12" y2="72" />
      <line x1="20" y1="48" x2="28" y2="72" />
    </svg>
  ),
  Curvy: (
    <svg
      viewBox="0 0 40 80"
      className="w-5 h-8"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="20" cy="8" r="6" />
      <path
        d="M20 14 Q16 24 14 32 Q12 40 16 48 L20 48 L24 48 Q28 40 26 32 Q24 24 20 14"
        fill="currentColor"
        opacity="0.1"
      />
      <path d="M20 14 Q16 24 14 32 Q12 40 16 48" />
      <path d="M20 14 Q24 24 26 32 Q28 40 24 48" />
      <path d="M20 22 L10 36" />
      <path d="M20 22 L30 36" />
      <line x1="20" y1="48" x2="13" y2="72" />
      <line x1="20" y1="48" x2="27" y2="72" />
    </svg>
  ),
  "Plus-size": (
    <svg
      viewBox="0 0 40 80"
      className="w-5 h-8"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="20" cy="8" r="6" />
      <path
        d="M20 14 Q14 22 12 32 Q10 42 14 48 L20 50 L26 48 Q30 42 28 32 Q26 22 20 14"
        fill="currentColor"
        opacity="0.15"
      />
      <path d="M20 14 Q14 22 12 32 Q10 42 14 48" />
      <path d="M20 14 Q26 22 28 32 Q30 42 26 48" />
      <path d="M20 22 L9 36" />
      <path d="M20 22 L31 36" />
      <line x1="20" y1="50" x2="12" y2="72" />
      <line x1="20" y1="50" x2="28" y2="72" />
    </svg>
  ),
};

export default function Step5() {
  const router = useRouter();
  const { answers, setAnswer, isUpdating } = useMatchStore();

  const [minAge, setMinAge] = useState(
    (answers.preferred_min_age as string) || "18",
  );
  const [maxAge, setMaxAge] = useState(
    (answers.preferred_max_age as string) || "22",
  );
  const [minHeight, setMinHeight] = useState(
    (answers.preferred_min_height as string) || "150",
  );
  const [maxHeight, setMaxHeight] = useState(
    (answers.preferred_max_height as string) || "210",
  );
  const [preferredBuilds, setPreferredBuilds] = useState<string[]>(
    (answers.preferred_builds as string[]) || [],
  );

  const buildOptions = [
    "Slim",
    "Petite",
    "Athletic",
    "Average",
    "Muscular",
    "Curvy",
    "Plus-size",
  ];

  const toggleBuild = (option: string) => {
    if (preferredBuilds.includes(option)) {
      setPreferredBuilds(preferredBuilds.filter((b) => b !== option));
    } else {
      setPreferredBuilds([...preferredBuilds, option]);
    }
  };

  const isValid =
    minAge !== "" &&
    maxAge !== "" &&
    preferredBuilds.length > 0 &&
    parseInt(minAge, 10) <= parseInt(maxAge, 10);

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setAnswer("preferred_min_age", parseInt(minAge, 10));
    setAnswer("preferred_max_age", parseInt(maxAge, 10));
    setAnswer("preferred_min_height", parseInt(minHeight, 10));
    setAnswer("preferred_max_height", parseInt(maxHeight, 10));
    setAnswer("preferred_builds", preferredBuilds);

    router.push("/matchmaking/Step6");
  };

  return (
    <>
      <Head>
        <title>{`Ideal Match | ${APP_CONFIG.name}`}</title>
      </Head>
      <div className="min-h-[100dvh] bg-[#0a0f1a] text-white flex flex-col relative overflow-x-hidden">
        <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1508849789987-4e5333c12b78?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center opacity-[0.03] pointer-events-none" />

        <header className="flex items-center justify-between p-6 z-10 w-full max-w-xl mx-auto">
          <button
            onClick={() => router.push("/matchmaking/Step4")}
            className="w-10 h-10 rounded-xl bg-[#0c1220] hover:bg-[#111827] flex items-center justify-center transition-colors border border-white/10 outline-none"
          >
            <ChevronLeft className="w-5 h-5 text-white/70" />
          </button>
          <div className="text-xs font-sans font-semibold text-white/50 tracking-[0.2em] uppercase bg-[#0c1220] px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
            {isUpdating && <Pencil className="w-3 h-3" />}
            {isUpdating ? "Editing Profile" : "Step 5 of 6"}
          </div>
          <div className="w-10 h-10" />
        </header>

        <main className="flex-1 flex flex-col items-center px-6 max-w-xl mx-auto w-full pb-20 z-10 mt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full bg-[#0c1220]/80 border border-white/10 backdrop-blur-md rounded-2xl p-8 md:p-10 flex flex-col relative"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="text-center mb-8">
              <h1 className="text-3xl font-serif tracking-tight mb-2 mt-2">
                Your <span className="italic font-light">Ideal Match</span>
              </h1>
              <p className="text-white/50 text-sm font-light">
                What are your dealbreakers and preferences?
              </p>
            </div>

            <form onSubmit={handleComplete} className="flex flex-col gap-8">
              <div className="flex flex-col gap-3">
                <label className="text-xs uppercase tracking-widest text-white/40 font-medium ml-1">
                  Preferred Age Range
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Min Age"
                    value={minAge}
                    onChange={(e) => setMinAge(e.target.value)}
                    className="w-full bg-[#0a0f1a]/50 border border-white/10 rounded-xl px-4 py-3 text-white text-center outline-none focus:border-white/30"
                  />
                  <input
                    type="number"
                    placeholder="Max Age"
                    value={maxAge}
                    onChange={(e) => setMaxAge(e.target.value)}
                    className="w-full bg-[#0a0f1a]/50 border border-white/10 rounded-xl px-4 py-3 text-white text-center outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-xs uppercase tracking-widest text-white/40 font-medium ml-1">
                  Builds I'm Attracted To
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {buildOptions.map((opt) => {
                    const isSelected = preferredBuilds.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleBuild(opt)}
                        className={`flex flex-col items-center justify-center gap-1.5 px-2 py-3 rounded-xl text-xs font-sans border transition-all cursor-pointer outline-none ${
                          isSelected
                            ? "bg-white text-black border-white"
                            : "bg-transparent text-white/60 border-white/10 hover:border-white/20"
                        }`}
                      >
                        {bodyTypeIcons[opt]}
                        {isSelected && (
                          <Check className="w-3 h-3 absolute top-1 right-1" />
                        )}
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-xs uppercase tracking-widest text-white/40 font-medium ml-1">
                  Height Range (cm)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Min Height"
                    value={minHeight}
                    onChange={(e) => setMinHeight(e.target.value)}
                    className="w-full bg-[#0a0f1a]/50 border border-white/10 rounded-xl px-4 py-3 text-white text-center outline-none focus:border-white/30"
                  />
                  <input
                    type="number"
                    placeholder="Max Height"
                    value={maxHeight}
                    onChange={(e) => setMaxHeight(e.target.value)}
                    className="w-full bg-[#0a0f1a]/50 border border-white/10 rounded-xl px-4 py-3 text-white text-center outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!isValid}
                className={`mt-6 w-full h-14 rounded-xl flex items-center justify-center gap-3 font-sans font-semibold transition-colors outline-none border-none cursor-pointer ${
                  isValid
                    ? "bg-white text-[#0a0f1a] hover:bg-white/90"
                    : "bg-white/5 text-white/30 cursor-not-allowed border border-white/10"
                }`}
              >
                <span>{isUpdating ? "Save & Continue" : "Continue"}</span>
                <ArrowRight
                  className={`w-4 h-4 ${isValid ? "opacity-100" : "opacity-30"}`}
                />
              </button>
            </form>
          </motion.div>
        </main>
      </div>
    </>
  );
}
