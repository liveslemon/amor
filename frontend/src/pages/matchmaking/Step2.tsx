import React, { useState } from "react";
import { APP_CONFIG } from "@/config/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, Pencil } from "lucide-react";
import { useMatchStore } from "@/store/useMatchStore";

const SelectionGroup = ({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}) => (
  <div className="flex flex-col gap-3">
    <label className="text-xs uppercase tracking-widest text-white/40 font-medium ml-1">
      {label}
    </label>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onSelect(option)}
          className={`px-4 py-2.5 rounded-full text-sm font-sans transition-all duration-200 border cursor-pointer outline-none ${
            selected === option
              ? "bg-white text-black border-white"
              : "bg-transparent text-white/60 border-white/10 hover:border-white/30 hover:bg-white/[0.02]"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  </div>
);

export default function Step2() {
  const router = useRouter();
  const { answers, setAnswer, isUpdating } = useMatchStore();
  const [relationshipGoal, setRelationshipGoal] = useState(
    (answers.relationship_goal as string) || "",
  );
  const [conflictStyle, setConflictStyle] = useState(
    (answers.conflict_style as string) || "",
  );
  const [instagram, setInstagram] = useState(
    (answers.instagram as string) || "",
  );
  const [tiktok, setTiktok] = useState((answers.tiktok as string) || "");

  const isValid =
    relationshipGoal !== "" &&
    conflictStyle !== "" &&
    (instagram.trim() !== "" || tiktok.trim() !== "");

  const handleComplete = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValid) return;

    setAnswer("relationship_goal", relationshipGoal);
    setAnswer("conflict_style", conflictStyle);
    setAnswer("instagram", instagram.trim());
    setAnswer("tiktok", tiktok.trim());
    router.push("/matchmaking/Completion");
  };

  return (
    <>
      <Head>
        <title>{`Relationship Goals | ${APP_CONFIG.name}`}</title>
      </Head>
      <div className="min-h-[100dvh] bg-[#0a0f1a] text-white flex flex-col relative overflow-x-hidden">
        <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1508849789987-4e5333c12b78?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center opacity-[0.03] pointer-events-none" />

        <header className="flex items-center justify-between p-6 z-10 w-full max-w-xl mx-auto">
          <button
            onClick={() => router.push("/matchmaking/Step1")}
            className="w-10 h-10 rounded-xl bg-[#0c1220] hover:bg-[#111827] flex items-center justify-center transition-colors border border-white/10 outline-none"
          >
            <ChevronLeft className="w-5 h-5 text-white/70" />
          </button>
          <div className="text-xs font-sans font-semibold text-white/50 tracking-[0.2em] uppercase bg-[#0c1220] px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
            {isUpdating && <Pencil className="w-3 h-3" />}
            {isUpdating ? "Editing Profile" : "Step 2 of 2"}
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
                Your <span className="italic font-light">Intentions</span>
              </h1>
              <p className="text-white/50 text-sm font-light">
                A few final details for a more thoughtful match.
              </p>
            </div>

            <form onSubmit={handleComplete} className="flex flex-col gap-8">
              <SelectionGroup
                label="Relationship goal"
                options={[
                  "Marriage bound",
                  "Long-term",
                  "Short-term",
                  "Just looking for fun",
                ]}
                selected={relationshipGoal}
                onSelect={setRelationshipGoal}
              />

              <SelectionGroup
                label="Conflict style"
                options={[
                  "Talk it out immediately",
                  "Need space then talk",
                  "Let it blow over",
                ]}
                selected={conflictStyle}
                onSelect={setConflictStyle}
              />

              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-white/40 font-medium ml-1">
                    Instagram or TikTok
                  </label>
                  <p className="text-xs text-white/30 mt-1 ml-1">
                    Add at least one handle.
                  </p>
                </div>

                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30">
                    @
                  </span>
                  <input
                    type="text"
                    placeholder="Instagram handle"
                    maxLength={120}
                    value={instagram}
                    onChange={(event) => setInstagram(event.target.value)}
                    className="w-full bg-[#0a0f1a]/50 border border-white/10 rounded-xl pl-10 pr-5 py-4 text-white text-base outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
                  />
                </div>

                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30">
                    @
                  </span>
                  <input
                    type="text"
                    placeholder="TikTok handle"
                    maxLength={120}
                    value={tiktok}
                    onChange={(event) => setTiktok(event.target.value)}
                    className="w-full bg-[#0a0f1a]/50 border border-white/10 rounded-xl pl-10 pr-5 py-4 text-white text-base outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!isValid}
                className={`mt-4 w-full h-14 rounded-xl flex items-center justify-center gap-3 font-sans font-semibold transition-colors outline-none border-none cursor-pointer ${
                  isValid
                    ? "bg-white text-[#0a0f1a] hover:bg-white/90"
                    : "bg-white/5 text-white/30 cursor-not-allowed border border-white/10"
                }`}
              >
                <span>{isUpdating ? "Update Profile" : "Complete Profile"}</span>
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
