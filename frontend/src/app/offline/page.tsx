"use client";

import Link from "next/link";
import { WifiOff } from "lucide-react";
import { APP_CONFIG } from "@/config/app";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0f1a] px-4 text-white">
      <div className="max-w-md rounded-2xl border border-white/10 bg-[#0c1322] p-8 text-center shadow-2xl">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
          <WifiOff className="h-5 w-5 text-[#ff69b4]" />
        </div>
        <h1 className="mb-3 font-serif text-3xl text-white tracking-tight">You&rsquo;re offline</h1>
        <p className="mb-6 text-sm text-white/60 leading-relaxed">
          Your internet connection is unavailable right now. Some parts of{" "}
          {APP_CONFIG.name} may be limited until you reconnect.
        </p>

        <div className="mb-6 rounded-xl border border-white/10 bg-[#0a0f1a] p-4 text-left text-sm text-white/70">
          <p className="mb-2 font-semibold text-white">You can still:</p>
          <ul className="space-y-2">
            <li>• Open previously loaded pages</li>
            <li>• Return to your app experience</li>
            <li>• Try again when connectivity is restored</li>
          </ul>
        </div>

        <Link
          href="/"
          className="inline-flex w-full items-center justify-center rounded-full bg-white px-4 py-3 font-sans font-semibold text-[#0a0f1a] transition-colors hover:bg-white/90"
        >
          Retry
        </Link>
      </div>
    </main>
  );
}
