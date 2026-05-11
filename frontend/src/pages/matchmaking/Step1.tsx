import React, { useState } from 'react';
import { APP_CONFIG } from '@/config/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import { useMatchStore } from '@/store/useMatchStore';

export default function Step1() {
  const router = useRouter();
  const { answers, setAnswer } = useMatchStore();
  
  const [gender, setGender] = useState((answers.gender as string) || '');
  const [age, setAge] = useState((answers.age as string) || '');
  const [height, setHeight] = useState((answers.height as string) || '');
  const [build, setBuild] = useState((answers.build as string) || '');

  const isValid = gender !== '' && age !== '' && height !== '' && build !== '';

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    
    setAnswer('gender', gender);
    setAnswer('age', parseInt(age, 10));
    setAnswer('height', parseInt(height, 10));
    setAnswer('build', build);
    
    router.push('/matchmaking/Step2');
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
        <title>The Basics | {APP_CONFIG.name}</title>
      </Head>
      <div className="min-h-[100dvh] bg-[#0a0f1a] text-white flex flex-col relative overflow-x-hidden">
        <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1508849789987-4e5333c12b78?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center opacity-[0.03] pointer-events-none" />

        <header className="flex items-center justify-between p-6 z-10 w-full max-w-xl mx-auto">
          <button 
            onClick={() => router.push('/')}
            className="w-10 h-10 rounded-xl bg-[#0c1220] hover:bg-[#111827] flex items-center justify-center transition-colors border border-white/10 outline-none"
          >
            <ChevronLeft className="w-5 h-5 text-white/70" />
          </button>
          <div className="text-xs font-sans font-semibold text-white/50 tracking-[0.2em] uppercase bg-[#0c1220] px-4 py-1.5 rounded-full border border-white/10">
            Step 1 of 6
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
                The <span className="italic font-light">Fundamentals</span>
              </h1>
              <p className="text-white/50 text-sm font-light">
                Let's create the basic skeleton of your dating profile.
              </p>
            </div>

            <form onSubmit={handleNext} className="flex flex-col gap-8">
              <SelectionGroup 
                label="I am..." 
                options={["Male", "Female", "Non-binary"]} 
                selected={gender} 
                onSelect={setGender} 
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-widest text-white/40 font-medium ml-1">Age</label>
                  <input 
                    type="number"
                    min="18"
                    max="99"
                    placeholder="e.g. 21"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-[#0a0f1a]/50 border border-white/10 rounded-xl px-4 py-3 text-white text-lg outline-none focus:border-white/30 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-widest text-white/40 font-medium ml-1">Height (cm)</label>
                  <input 
                    type="number"
                    min="100"
                    max="250"
                    placeholder="e.g. 175"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full bg-[#0a0f1a]/50 border border-white/10 rounded-xl px-4 py-3 text-white text-lg outline-none focus:border-white/30 transition-colors"
                  />
                </div>
              </div>

              <SelectionGroup 
                label="My Build is..." 
                options={["Slim", "Athletic", "Average", "Curvy"]} 
                selected={build} 
                onSelect={setBuild} 
              />

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
