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
      viewBox="0 0 64 64"
      className="w-8 h-8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M24 4 Q22 2 19 5 Q16 8 18 14" />
      <path d="M40 4 Q42 2 45 5 Q48 8 46 14" />
      <path d="M18 14 Q17 20 19 26 Q20 30 21 34 Q22 38 22 42 L22 48" />
      <path d="M46 14 Q47 20 45 26 Q44 30 43 34 Q42 38 42 42 L42 48" />
      <circle cx="29" cy="18" r="1" fill="currentColor" stroke="none" />
      <circle cx="35" cy="18" r="1" fill="currentColor" stroke="none" />
      <circle cx="32" cy="34" r="1" fill="currentColor" stroke="none" />
      <path d="M22 48 L22 52 Q27 54 32 54 Q37 54 42 52 L42 48" />
      <path d="M28 52 Q32 53.5 36 52" />
    </svg>
  ),
  Petite: (
    <svg
      viewBox="0 0 64 64"
      className="w-8 h-8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M24 6 Q21 3 18 6 Q16 9 18 14" />
      <path d="M40 6 Q43 3 46 6 Q48 9 46 14" />
      <path d="M18 14 Q17 18 19 22 Q21 26 23 30 Q24 34 24 38 L24 46" />
      <path d="M46 14 Q47 18 45 22 Q43 26 41 30 Q40 34 40 38 L40 46" />
      <path d="M24 16 Q27 20 28 18" />
      <path d="M40 16 Q37 20 36 18" />
      <circle cx="32" cy="32" r="1" fill="currentColor" stroke="none" />
      <path d="M24 46 L24 50 Q28 54 32 54 Q36 54 40 50 L40 46" />
      <path d="M29 50 L32 52 L35 50" />
    </svg>
  ),
  Athletic: (
    <svg
      viewBox="0 0 64 64"
      className="w-8 h-8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 3 Q18 1 14 4 Q11 8 13 14" />
      <path d="M42 3 Q46 1 50 4 Q53 8 51 14" />
      <path d="M13 14 Q12 20 15 26 Q17 30 19 34 Q20 38 21 42 L21 48" />
      <path d="M51 14 Q52 20 49 26 Q47 30 45 34 Q44 38 43 42 L43 48" />
      <circle cx="27" cy="16" r="1" fill="currentColor" stroke="none" />
      <circle cx="37" cy="16" r="1" fill="currentColor" stroke="none" />
      <line x1="29" y1="22" x2="35" y2="22" />
      <line x1="29" y1="27" x2="35" y2="27" />
      <line x1="29" y1="32" x2="35" y2="32" />
      <line x1="32" y1="18" x2="32" y2="36" />
      <circle cx="32" cy="39" r="1" fill="currentColor" stroke="none" />
      <path d="M21 48 L21 52 Q27 55 32 55 Q37 55 43 52 L43 48" />
      <path d="M28 52 Q32 53.5 36 52" />
    </svg>
  ),
  Average: (
    <svg
      viewBox="0 0 64 64"
      className="w-8 h-8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M23 4 Q20 2 17 5 Q14 9 16 14" />
      <path d="M41 4 Q44 2 47 5 Q50 9 48 14" />
      <path d="M16 14 Q15 20 17 26 Q19 30 20 34 Q21 38 21 42 L21 48" />
      <path d="M48 14 Q49 20 47 26 Q45 30 44 34 Q43 38 43 42 L43 48" />
      <circle cx="28" cy="17" r="1" fill="currentColor" stroke="none" />
      <circle cx="36" cy="17" r="1" fill="currentColor" stroke="none" />
      <circle cx="32" cy="32" r="1" fill="currentColor" stroke="none" />
      <path d="M21 48 L21 52 Q27 54 32 54 Q37 54 43 52 L43 48" />
      <path d="M28 52 Q32 53.5 36 52" />
    </svg>
  ),
  Muscular: (
    <svg
      viewBox="0 0 64 64"
      className="w-8 h-8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 2 Q16 0 10 3 Q7 7 9 14" />
      <path d="M44 2 Q48 0 54 3 Q57 7 55 14" />
      <path d="M9 14 Q8 20 12 26 Q15 30 17 34 Q19 38 20 42 L20 48" />
      <path d="M55 14 Q56 20 52 26 Q49 30 47 34 Q45 38 44 42 L44 48" />
      <path d="M18 14 Q22 18 25 16" />
      <path d="M46 14 Q42 18 39 16" />
      <circle cx="25" cy="14" r="1" fill="currentColor" stroke="none" />
      <circle cx="39" cy="14" r="1" fill="currentColor" stroke="none" />
      <line x1="28" y1="20" x2="36" y2="20" />
      <line x1="28" y1="25" x2="36" y2="25" />
      <line x1="28" y1="30" x2="36" y2="30" />
      <line x1="32" y1="16" x2="32" y2="36" />
      <circle cx="32" cy="38" r="1" fill="currentColor" stroke="none" />
      <path d="M20 48 L20 52 Q26 56 32 56 Q38 56 44 52 L44 48" />
      <path d="M28 52 Q32 54 36 52" />
    </svg>
  ),
  Curvy: (
    <svg
      viewBox="0 0 64 64"
      className="w-8 h-8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M24 4 Q20 2 16 5 Q13 9 15 14" />
      <path d="M40 4 Q44 2 48 5 Q51 9 49 14" />
      <path d="M15 14 Q14 18 16 22 Q19 26 22 28 Q24 32 24 36 Q22 40 20 44 L18 50" />
      <path d="M49 14 Q50 18 48 22 Q45 26 42 28 Q40 32 40 36 Q42 40 44 44 L46 50" />
      <path d="M22 15 Q26 20 28 17" />
      <path d="M42 15 Q38 20 36 17" />
      <circle cx="32" cy="30" r="1" fill="currentColor" stroke="none" />
      <path d="M18 50 L18 54 Q25 58 32 58 Q39 58 46 54 L46 50" />
      <path d="M27 54 L32 56 L37 54" />
    </svg>
  ),
  "Plus-size": (
    <svg
      viewBox="0 0 64 64"
      className="w-8 h-8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M24 2 Q19 0 14 3 Q10 7 12 13" />
      <path d="M40 2 Q45 0 50 3 Q54 7 52 13" />
      <path d="M12 13 Q10 18 11 24 Q12 28 14 32 Q15 36 15 40 Q14 44 12 48 L11 52" />
      <path d="M52 13 Q54 18 53 24 Q52 28 50 32 Q49 36 49 40 Q50 44 52 48 L53 52" />
      <path d="M20 14 Q24 20 27 17" />
      <path d="M44 14 Q40 20 37 17" />
      <circle cx="32" cy="28" r="1" fill="currentColor" stroke="none" />
      <path d="M11 52 L11 56 Q21 60 32 60 Q43 60 53 56 L53 52" />
      <path d="M26 56 L32 58 L38 56" />
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
