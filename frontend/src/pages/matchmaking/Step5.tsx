import React, { useState } from 'react';
import { APP_CONFIG } from '@/config/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, Check } from 'lucide-react';
import { useMatchStore } from '@/store/useMatchStore';

export default function Step5() {
  const router = useRouter();
  const { answers, setAnswer } = useMatchStore();
  
  const [minAge, setMinAge] = useState((answers.preferred_min_age as string) || '18');
  const [maxAge, setMaxAge] = useState((answers.preferred_max_age as string) || '30');
  const [minHeight, setMinHeight] = useState((answers.preferred_min_height as string) || '150');
  const [maxHeight, setMaxHeight] = useState((answers.preferred_max_height as string) || '210');
  const [preferredBuilds, setPreferredBuilds] = useState<string[]>((answers.preferred_builds as string[]) || []);

  const buildOptions = ["Slim", "Athletic", "Average", "Curvy"];

  const toggleBuild = (option: string) => {
    if (preferredBuilds.includes(option)) {
      setPreferredBuilds(preferredBuilds.filter(b => b !== option));
    } else {
      setPreferredBuilds([...preferredBuilds, option]);
    }
  };

  const isValid = minAge !== '' && maxAge !== '' && preferredBuilds.length > 0 && parseInt(minAge, 10) <= parseInt(maxAge, 10);

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    
    setAnswer('preferred_min_age', parseInt(minAge, 10));
    setAnswer('preferred_max_age', parseInt(maxAge, 10));
    setAnswer('preferred_min_height', parseInt(minHeight, 10));
    setAnswer('preferred_max_height', parseInt(maxHeight, 10));
    setAnswer('preferred_builds', preferredBuilds);
    
    router.push('/matchmaking/Step6');
  };

  return (
    <>
      <Head>
        <title>Ideal Match | {APP_CONFIG.name}</title>
      </Head>
      <div className="min-h-[100dvh] bg-[#0a0f1a] text-white flex flex-col relative overflow-x-hidden">
        <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1508849789987-4e5333c12b78?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center opacity-[0.03] pointer-events-none" />

        <header className="flex items-center justify-between p-6 z-10 w-full max-w-xl mx-auto">
          <button 
            onClick={() => router.push('/matchmaking/Step4')}
            className="w-10 h-10 rounded-xl bg-[#0c1220] hover:bg-[#111827] flex items-center justify-center transition-colors border border-white/10 outline-none"
          >
            <ChevronLeft className="w-5 h-5 text-white/70" />
          </button>
          <div className="text-xs font-sans font-semibold text-white/50 tracking-[0.2em] uppercase bg-[#0c1220] px-4 py-1.5 rounded-full border border-white/10">
            Step 5 of 6
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
                <label className="text-xs uppercase tracking-widest text-white/40 font-medium ml-1">Preferred Age Range</label>
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
                <label className="text-xs uppercase tracking-widest text-white/40 font-medium ml-1">Builds I'm Attracted To</label>
                <div className="grid grid-cols-2 gap-3">
                  {buildOptions.map((opt) => {
                    const isSelected = preferredBuilds.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleBuild(opt)}
                        className={`flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-sans border transition-all cursor-pointer outline-none ${
                          isSelected 
                            ? "bg-white text-black border-white" 
                            : "bg-transparent text-white/60 border-white/10 hover:border-white/20"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-xs uppercase tracking-widest text-white/40 font-medium ml-1">Height Range (cm)</label>
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
                <span>Continue</span>
                <ArrowRight className={`w-4 h-4 ${isValid ? "opacity-100" : "opacity-30"}`} />
              </button>
            </form>
          </motion.div>
        </main>
      </div>
    </>
  );
}
