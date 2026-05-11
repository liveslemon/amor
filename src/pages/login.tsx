import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { ArrowRight, Lock } from 'lucide-react';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Log In | Mingle</title>
      </Head>
      <div className="min-h-[100dvh] bg-[#0a0f1a] flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
        {/* Deep Background Elements */}
        <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1508849789987-4e5333c12b78?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center opacity-[0.03] pointer-events-none" />

        {/* Logo / Home Link */}
        <div className="absolute top-8 left-8 z-20">
          <Link href="/" className="font-serif text-2xl tracking-[0.15em] font-medium text-white hover:opacity-80 transition-opacity">
            MINGLE
          </Link>
        </div>

        <div className="max-w-xl w-full z-10 flex flex-col mt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-[#0c1220]/80 border border-white/10 backdrop-blur-md rounded-2xl p-10 md:p-14 flex flex-col items-center text-center relative overflow-hidden"
          >
            {/* Subtle inner top glare */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <h1 className="text-4xl md:text-5xl font-serif tracking-tight leading-[1.1] mb-6 mt-4">
              Welcome <br />
              <span className="italic font-light text-white/90">back</span>
            </h1>

            <p className="text-base md:text-lg text-white/50 mb-10 font-sans font-light max-w-sm mx-auto leading-relaxed">
              Enter your phone number to manage your profile or check your upcoming dates.
            </p>
            
            <div className="w-full mb-8">
              <input 
                type="tel"
                placeholder="(555) 000-0000"
                className="w-full bg-[#0a0f1a]/50 border border-white/10 rounded-xl px-6 py-4 text-white text-center text-lg outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
              />
            </div>

            <button
              onClick={() => {}}
              className="group relative w-full flex items-center justify-center gap-3 bg-white text-[#0a0f1a] px-8 py-4 rounded-xl font-sans font-semibold text-lg hover:bg-white/90 transition-colors cursor-pointer border-none outline-none"
            >
              <span>Send Login Code</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="mt-8 text-sm text-white/40">
              Don't have an account?{' '}
              <Link href="/signup" className="text-white hover:underline underline-offset-4 transition-all">
                Sign Up
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
