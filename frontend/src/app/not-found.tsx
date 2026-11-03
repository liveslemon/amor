import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0f1a] px-4 text-white">
      <div className="max-w-md rounded-2xl border border-white/10 bg-[#0c1322] p-8 text-center shadow-2xl">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
          <SearchX className="h-5 w-5 text-[#ff69b4]" />
        </div>
        <h1 className="mb-3 font-serif text-3xl text-white tracking-tight">This page doesn&rsquo;t exist</h1>
        <p className="mb-6 text-sm text-white/60 leading-relaxed">
          The page you&rsquo;re looking for may have moved or isn&rsquo;t available right
          now.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 font-sans font-semibold text-[#0a0f1a] transition-colors hover:bg-white/90"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
