"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2 } from "lucide-react";
import { useMatchStore } from "@/store/useMatchStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { APP_CONFIG } from "@/config/app";

const WaitlistModal = () => {
  const { isWaitlistModalOpen, toggleWaitlistModal } = useMatchStore();
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      toggleWaitlistModal();
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isWaitlistModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleWaitlistModal}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md glass-morphism rounded-[40px] p-8 shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4">
              <button
                onClick={toggleWaitlistModal}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center text-center py-8"
              >
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-serif mb-2">You're on the list!</h3>
                <p className="text-muted">We'll text you when a match is ready.</p>
              </motion.div>
            ) : (
              <>
                <div className="mb-8">
                  <h3 className="text-3xl font-serif mb-3">Join {APP_CONFIG.name}</h3>
                  <p className="text-muted text-sm">
                    Enter your phone number to join the waitlist for the next Wednesday Drop.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest opacity-50 ml-4">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      required
                      className="bg-white/5"
                    />
                  </div>
                  <Button variant="premium" className="w-full h-14 text-lg">
                    Get Access
                  </Button>
                </form>

                <p className="mt-6 text-[10px] text-center text-muted uppercase tracking-tight">
                  By joining, you agree to our Terms & Privacy Policy.
                </p>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WaitlistModal;
