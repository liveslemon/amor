import React, { useState } from 'react';
import { APP_CONFIG } from '@/config/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, Check } from 'lucide-react';
import { useMatchStore } from '@/store/useMatchStore';

export default function Step4() {
  const router = useRouter();
  const { answers, setAnswer } = useMatchStore();
  
  const [focuses, setFocuses] = useState<string[]>((answers.focuses as string[]) || []);
  const [green_flag, setGreenFlag] = useState((answers.green_flag as string) || '');
  const [instagram, setInstagram] = useState((answers.instagram as string) || '');

  const focusOptions = [
    "Getting my degree and doing well",
    "Building a business/project on the side",
    "Balancing school and enjoying life",
    "Still figuring things out"
  ];

  const toggleFocus = (option: string) => {
    if (focuses.includes(option)) {
      setFocuses(focuses.filter(f => f !== option));
    } else {
      if (focuses.length < 2) {
        setFocuses([...focuses, option]);
      }
    }
  };

  const isValid = focuses.length > 0 && green_flag !== '' && instagram !== '';

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    
    setAnswer('focuses', focuses);
    setAnswer('green_flag', green_flag);
    setAnswer('instagram', instagram);
    setAnswer('tiktok', instagram); // Use as placeholder for now
    
    router.push('/matchmaking/Step5');
  };

  return (
    <>
      <Head>
        <title>Focus & Socials | {APP_CONFIG.name}</title>
      </Head>
      <div className="min-h-[100dvh] bg-[#0a0f1a] text-white flex flex-col relative overflow-x-hidden">
        <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1508849789987-4e5333c12b78?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center opacity-[0.03] pointer-events-none" />

        <header className="flex items-center justify-between p-6 z-10 w-full max-w-xl mx-auto">
          <button 
            onClick={() => router.push('/matchmaking/Step3')}
            className="w-10 h-10 rounded-xl bg-[#0c1220] hover:bg-[#111827] flex items-center justify-center transition-colors border border-white/10 outline-none"
          >
            <ChevronLeft className="w-5 h-5 text-white/70" />
          </button>
          <div className="text-xs font-sans font-semibold text-white/50 tracking-[0.2em] uppercase bg-[#0c1220] px-4 py-1.5 rounded-full border border-white/10">
            Step 4 of 6
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
                Academic <span className="italic font-light">Drive</span>
              </h1>
              <p className="text-white/50 text-sm font-light">
                Select your top priorities right now.
              </p>
            </div>

            <form onSubmit={handleNext} className="flex flex-col gap-8">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-end">
                  <label className="text-xs uppercase tracking-widest text-white/40 font-medium ml-1">
                    My Focuses (Select up to 2)
                  </label>
                  <span className="text-[10px] text-white/30">{focuses.length}/2</span>
                </div>
                <div className="flex flex-col gap-3">
                  {focusOptions.map((opt) => {
                    const isSelected = focuses.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleFocus(opt)}
                        className={`w-full text-left px-5 py-4 rounded-xl text-sm font-sans transition-all duration-200 border flex items-center justify-between cursor-pointer outline-none ${
                          isSelected 
                            ? "bg-white/5 text-white border-white/40 shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]" 
                            : "bg-transparent text-white/60 border-white/10 hover:border-white/20"
                        }`}
                      >
                        <span>{opt}</span>
                        {isSelected && <Check className="w-4 h-4 text-emerald-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-white/40 font-medium ml-1">Biggest Green Flag In Others</label>
                <input 
                  type="text"
                  placeholder="e.g. Ambition, Kindness, Good listener"
                  value={green_flag}
                  onChange={(e) => setGreenFlag(e.target.value)}
                  className="w-full bg-[#0a0f1a]/50 border border-white/10 rounded-xl px-5 py-4 text-white text-base outline-none focus:border-white/30 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-white/40 font-medium ml-1">Instagram Handle</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30">@</span>
                  <input 
                    type="text"
                    placeholder="johndoe"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full bg-[#0a0f1a]/50 border border-white/10 rounded-xl pl-10 pr-5 py-4 text-white text-base outline-none focus:border-white/30 transition-colors"
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
