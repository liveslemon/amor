import React, { useState } from 'react';
import { APP_CONFIG } from '@/config/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import { useMatchStore } from '@/store/useMatchStore';

export default function Step2() {
  const router = useRouter();
  const { answers, setAnswer } = useMatchStore();
  
  const [skin_tone, setSkinTone] = useState((answers.skin_tone as string) || '');
  const [personal_style, setPersonalStyle] = useState((answers.personal_style as string) || '');
  const [social_persona, setSocialPersona] = useState((answers.social_persona as string) || '');
  const [weekend_type, setWeekendType] = useState((answers.weekend_type as string) || '');

  const isValid = skin_tone !== '' && personal_style !== '' && social_persona !== '' && weekend_type !== '';

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    
    setAnswer('skin_tone', skin_tone);
    setAnswer('personal_style', personal_style);
    setAnswer('social_persona', social_persona);
    setAnswer('weekend_type', weekend_type);
    
    router.push('/matchmaking/Step3');
  };

  const SelectionGroup = ({ 
    label, 
    options, 
    selected, 
    onSelect 
  }: { 
    label: string, 
    options: string[], 
    selected: string, 
    onSelect: (val: string) => void 
  }) => (
    <div className="flex flex-col gap-3">
      <label className="text-xs uppercase tracking-widest text-white/40 font-medium ml-1">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onSelect(opt)}
            className={`px-4 py-2.5 rounded-full text-sm font-sans transition-all duration-200 border cursor-pointer outline-none ${
              selected === opt 
                ? "bg-white text-black border-white" 
                : "bg-transparent text-white/60 border-white/10 hover:border-white/30 hover:bg-white/[0.02]"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>Vibes | {APP_CONFIG.name}</title>
      </Head>
      <div className="min-h-[100dvh] bg-[#0a0f1a] text-white flex flex-col relative overflow-x-hidden">
        <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1508849789987-4e5333c12b78?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center opacity-[0.03] pointer-events-none" />

        <header className="flex items-center justify-between p-6 z-10 w-full max-w-xl mx-auto">
          <button 
            onClick={() => router.push('/matchmaking/Step1')}
            className="w-10 h-10 rounded-xl bg-[#0c1220] hover:bg-[#111827] flex items-center justify-center transition-colors border border-white/10 outline-none"
          >
            <ChevronLeft className="w-5 h-5 text-white/70" />
          </button>
          <div className="text-xs font-sans font-semibold text-white/50 tracking-[0.2em] uppercase bg-[#0c1220] px-4 py-1.5 rounded-full border border-white/10">
            Step 2 of 6
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
                Aesthetics & <span className="italic font-light">Vibes</span>
              </h1>
              <p className="text-white/50 text-sm font-light">
                Paint a mental picture of who you are.
              </p>
            </div>

            <div className="flex flex-col gap-8">
              <SelectionGroup 
                label="Skin Tone" 
                options={["Fair", "Tan", "Brown", "Dark"]} 
                selected={skin_tone} 
                onSelect={setSkinTone} 
              />

              <SelectionGroup 
                label="Personal Style" 
                options={["Streetwear", "Minimalist", "Casual", "Dressed Up"]} 
                selected={personal_style} 
                onSelect={setPersonalStyle} 
              />

              <SelectionGroup 
                label="Social Persona" 
                options={["Introverted", "Ambiverted", "Extroverted"]} 
                selected={social_persona} 
                onSelect={setSocialPersona} 
              />

              <SelectionGroup 
                label="Ideal Weekend" 
                options={["Chill in", "Out at the Bar", "Exploring new spots"]} 
                selected={weekend_type} 
                onSelect={setWeekendType} 
              />

              <button
                onClick={handleNext}
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
            </div>
          </motion.div>
        </main>
      </div>
    </>
  );
}
