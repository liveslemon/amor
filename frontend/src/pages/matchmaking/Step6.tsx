import React, { useState, useRef } from 'react';
import { APP_CONFIG } from '@/config/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, Plus, X, Loader2, Camera } from 'lucide-react';
import { useMatchStore } from '@/store/useMatchStore';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase';
import { uploadPhotoBinary } from '@/api/profile';

interface PhotoSlot {
  id: number;
  file: File | null;
  preview: string | null;
  uploadedUrl: string | null;
  isUploading: boolean;
}

const BUCKET_NAME = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "user-photos";

export default function Step6() {
  const router = useRouter();
  const { answers, setAnswer } = useMatchStore();
  const { user } = useAuthStore();
  
  const [photos, setPhotos] = useState<PhotoSlot[]>([
    { id: 1, file: null, preview: null, uploadedUrl: null, isUploading: false },
    { id: 2, file: null, preview: null, uploadedUrl: null, isUploading: false },
    { id: 3, file: null, preview: null, uploadedUrl: null, isUploading: false }
  ]);
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [error, setError] = useState('');

  const handleSlotClick = (slotId: number) => {
    setActiveSlot(slotId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || activeSlot === null) return;

    // Clear input
    e.target.value = '';

    const slotIndex = photos.findIndex(p => p.id === activeSlot);
    const previewUrl = URL.createObjectURL(file);

    // 1. Optimistic UI state
    const newPhotos = [...photos];
    newPhotos[slotIndex] = {
      ...newPhotos[slotIndex],
      file,
      preview: previewUrl,
      isUploading: true,
      uploadedUrl: null
    };
    setPhotos(newPhotos);
    setError('');

    try {
      // 2. UPLOAD VIA OUR BACKEND PROXY (Secure, bypasses direct RLS)
      const { image_url } = await uploadPhotoBinary(file);

      // 3. Record success state
      setPhotos(prev => prev.map(p => p.id === activeSlot ? {
        ...p,
        uploadedUrl: image_url,
        isUploading: false
      } : p));
      
    } catch (err: any) {
      console.error('Direct Supabase Upload Error:', err);
      setError(err.message || 'Upload failed. Please check your internet connection.');
      // Rollback UI slot
      setPhotos(prev => prev.map(p => p.id === activeSlot ? {
        id: activeSlot,
        preview: null,
        file: null,
        uploadedUrl: null,
        isUploading: false
      } : p));
    }
  };

  const removePhoto = (slotId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotos(prev => prev.map(p => p.id === slotId ? {
      id: slotId, file: null, preview: null, uploadedUrl: null, isUploading: false
    } : p));
  };

  // Logic Check: User needs AT LEAST 2 photos successfully uploaded
  const validUploads = photos.filter(p => p.uploadedUrl !== null);
  const isValid = validUploads.length >= 2;
  const isCurrentlyUploading = photos.some(p => p.isUploading);

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    
    // Map to the photo payload required by backend schema
    const mappedPhotos = validUploads.map((p, index) => ({
      image_url: p.uploadedUrl,
      photo_type: index === 0 ? "Profile" : "Gallery",
      upload_order: index + 1
    }));

    setAnswer('uploaded_photos', mappedPhotos as any); // Store custom temp array
    router.push('/matchmaking/Completion');
  };

  return (
    <>
      <Head>
        <title>Photo Showcase | {APP_CONFIG.name}</title>
      </Head>
      <div className="min-h-[100dvh] bg-[#0a0f1a] text-white flex flex-col relative overflow-x-hidden">
        <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1508849789987-4e5333c12b78?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center opacity-[0.03] pointer-events-none" />

        <header className="flex items-center justify-between p-6 z-10 w-full max-w-xl mx-auto">
          <button 
            onClick={() => router.push('/matchmaking/Step5')}
            className="w-10 h-10 rounded-xl bg-[#0c1220] hover:bg-[#111827] flex items-center justify-center transition-colors border border-white/10 outline-none"
          >
            <ChevronLeft className="w-5 h-5 text-white/70" />
          </button>
          <div className="text-xs font-sans font-semibold text-white/50 tracking-[0.2em] uppercase bg-[#0c1220] px-4 py-1.5 rounded-full border border-white/10">
            Step 6 of 6
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
              <h1 className="text-3xl font-serif tracking-tight mb-2 mt-2 flex items-center justify-center gap-3">
                The <span className="italic font-light">Lookbook</span>
              </h1>
              <p className="text-white/50 text-sm font-light">
                Show off your vibe. At least 2 clear photos required.
              </p>
            </div>

            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />

            <div className="grid grid-cols-2 gap-4 mb-6">
              {photos.map((slot, index) => (
                <div 
                  key={slot.id}
                  onClick={() => !slot.isUploading && !slot.preview && handleSlotClick(slot.id)}
                  className={`relative aspect-[3/4] rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden cursor-pointer group ${
                    index === 0 ? "col-span-2 aspect-[4/3] md:aspect-[16/9]" : ""
                  } ${
                    slot.preview 
                      ? "border-solid border-white/20" 
                      : "border-white/10 hover:border-white/30 hover:bg-white/[0.02]"
                  }`}
                >
                  {slot.preview ? (
                    <>
                      <img src={slot.preview} className="w-full h-full object-cover" alt="Preview" />
                      {slot.isUploading ? (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        </div>
                      ) : (
                        <button 
                          onClick={(e) => removePhoto(slot.id, e)}
                          className="absolute top-3 right-3 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 text-white hover:bg-red-500/80 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-white/40 group-hover:text-white/70 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-1">
                        {index === 0 ? <Camera className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                      </div>
                      <span className="text-xs font-medium font-sans tracking-wide">
                        {index === 0 ? "Main Profile Photo" : `Photo #${index + 1}`}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center mb-4 bg-red-900/20 border border-red-900/50 py-2 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleComplete}>
              <button
                type="submit"
                disabled={!isValid || isCurrentlyUploading}
                className={`w-full h-14 rounded-xl flex items-center justify-center gap-3 font-sans font-semibold transition-colors outline-none border-none cursor-pointer ${
                  isValid && !isCurrentlyUploading
                    ? "bg-white text-[#0a0f1a] hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.1)]" 
                    : "bg-white/5 text-white/30 cursor-not-allowed border border-white/10"
                }`}
              >
                <span>{isCurrentlyUploading ? 'Uploading Assets...' : 'Finalize Profile'}</span>
                {!isCurrentlyUploading && <ArrowRight className={`w-4 h-4 ${isValid ? "opacity-100" : "opacity-30"}`} />}
              </button>
            </form>

            <p className="text-[10px] text-center text-white/20 uppercase tracking-wider mt-4">
              Max 5MB per image • JPEG, PNG, WebP
            </p>
          </motion.div>
        </main>
      </div>
    </>
  );
}
