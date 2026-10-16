import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0f1a] px-4 text-white">
      <div className="max-w-md rounded-2xl border border-slate-700 bg-[#111827] p-8 text-center shadow-2xl">
        <div className="mb-4 text-5xl">✨</div>
        <h1 className="mb-3 text-3xl font-bold">This page doesn’t exist</h1>
        <p className="mb-6 text-sm text-slate-300">
          The page you’re looking for may have moved or isn’t available right
          now.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full bg-pink-500 px-5 py-3 font-semibold text-white transition hover:bg-pink-400"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
