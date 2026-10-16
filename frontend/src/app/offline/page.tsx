"use client";

import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0f1a] px-4 text-white">
      <div className="max-w-md rounded-2xl border border-slate-700 bg-[#111827] p-8 text-center shadow-2xl shadow-pink-500/10">
        <div className="mb-4 text-5xl">📴</div>
        <h1 className="mb-3 text-3xl font-bold">You’re offline</h1>
        <p className="mb-6 text-sm text-slate-300">
          Your internet connection is unavailable right now. Some parts of
          Minglee may be limited until you reconnect.
        </p>

        <div className="mb-6 rounded-xl border border-pink-500/20 bg-[#1a1f2e] p-4 text-left text-sm text-slate-200">
          <p className="mb-2 font-semibold text-white">You can still:</p>
          <ul className="space-y-2 text-slate-300">
            <li>• Open previously loaded pages</li>
            <li>• Return to your app experience</li>
            <li>• Try again when connectivity is restored</li>
          </ul>
        </div>

        <Link
          href="/"
          className="inline-flex w-full items-center justify-center rounded-full bg-pink-500 px-4 py-3 font-semibold text-white transition hover:bg-pink-400"
        >
          Retry
        </Link>
      </div>
    </main>
  );
}
