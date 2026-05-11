import React, { useEffect, useState } from 'react';
import { APP_CONFIG } from '@/config/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Check, Home, Loader2 } from 'lucide-react';
import { useMatchStore } from '@/store/useMatchStore';
import { 
  saveProfile, 
  savePreferences, 
  saveFocuses, 
  savePreferredBuilds,
  savePhotos
} from '@/api/profile';

export default function Completion() {
  const router = useRouter();
  const { answers } = useMatchStore();
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
    
    const persistOnboardingData = async () => {
      try {
        // 1. Profile
        await saveProfile({
          gender: answers.gender,
          age: answers.age,
          height: answers.height,
          build: answers.build,
          skin_tone: answers.skin_tone,
          personal_style: answers.personal_style,
          social_persona: answers.social_persona,
          weekend_type: answers.weekend_type,
          afternoon_activity: answers.afternoon_activity,
          habits: answers.habits,
          conflict_style: answers.conflict_style,
          relationship_goal: answers.relationship_goal,
          green_flag: answers.green_flag,
          instagram: answers.instagram,
          tiktok: answers.tiktok
        });

        // 2. Preferences
        if (answers.preferred_min_age || answers.preferred_max_age) {
          await savePreferences({
            preferred_min_age: answers.preferred_min_age,
            preferred_max_age: answers.preferred_max_age,
            preferred_min_height: answers.preferred_min_height,
            preferred_max_height: answers.preferred_max_height
          });
        }

        // 3. Focuses
        if (answers.focuses && Array.isArray(answers.focuses)) {
          await saveFocuses(answers.focuses as string[]);
        }

        // 4. Preferred Builds
        if (answers.preferred_builds && Array.isArray(answers.preferred_builds)) {
          await savePreferredBuilds(answers.preferred_builds as string[]);
        }

        // 5. Uploaded Photos
        if (answers.uploaded_photos && Array.isArray(answers.uploaded_photos)) {
          await savePhotos(answers.uploaded_photos);
        }

        setSaving(false);
        // Smooth redirection to the dedicated success screen
        setTimeout(() => {
          router.push('/registration-complete');
        }, 1200);
      } catch (err: any) {
        setError(err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to save profile');
        setSaving(false);
      }
    };

    // Only run if we actually have answers to save
    if (Object.keys(answers).length > 0) {
      persistOnboardingData();
    } else {
      setSaving(false);
    }
  }, [answers]);

  return (
    <>
      <Head>
        <title>You're Set | {APP_CONFIG.name}</title>
      </Head>
      <div className="min-h-[100dvh] bg-[#0a0f1a] flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
        
        {/* Deep Background Elements */}
        <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1508849789987-4e5333c12b78?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center opacity-[0.03] pointer-events-none" />

        <div className="max-w-md w-full z-10 flex flex-col items-center text-center mt-4">
          
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
            className={`w-24 h-24 rounded-2xl bg-[#0c1220] border border-white/10 flex items-center justify-center mb-10 ${error ? 'border-red-500/50' : ''}`}
          >
            {saving ? (
              <Loader2 className="w-10 h-10 text-white/50 animate-spin" strokeWidth={2} />
            ) : error ? (
              <div className="text-red-500 font-bold text-2xl">!</div>
            ) : (
              <Check className="w-10 h-10 text-emerald-500" strokeWidth={2} />
            )}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="text-4xl md:text-5xl font-serif tracking-tight mb-6"
          >
            {saving ? "Saving Profile..." : error ? "Oops!" : "You're on the list."}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="w-full bg-[#0c1220]/80 border border-white/10 rounded-2xl p-8 mb-12 backdrop-blur-md relative overflow-hidden"
          >
            {/* Subtle inner top glare */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {error ? (
              <p className="text-red-400/80 text-lg font-light leading-relaxed">
                {error}
              </p>
            ) : saving ? (
              <p className="text-white/60 text-lg font-light leading-relaxed">
                Please wait while we secure your spot on the waitlist.
              </p>
            ) : (
              <p className="text-white/60 text-lg font-light leading-relaxed">
                We're analyzing your profile now. Check your texts this 
                <span className="text-white font-medium"> Wednesday at 7 PM </span> 
                for your first curated date plan.
              </p>
            )}
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
            onClick={() => router.push('/')}
            className="group flex items-center justify-center gap-3 text-white/50 hover:text-white transition-colors cursor-pointer border-none outline-none bg-transparent font-sans uppercase tracking-widest text-xs font-medium"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </motion.button>
        </div>
      </div>
    </>
  );
}
