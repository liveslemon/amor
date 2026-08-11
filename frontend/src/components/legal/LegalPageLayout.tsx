import Link from "next/link";
import type { ReactNode } from "react";
import Footer from "@/components/layout/Footer";
import { APP_CONFIG } from "@/config/app";

type LegalPageLayoutProps = {
  eyebrow: string;
  title: string;
  lastUpdated: string;
  children: ReactNode;
};

export default function LegalPageLayout({
  eyebrow,
  title,
  lastUpdated,
  children,
}: LegalPageLayoutProps) {
  return (
    <main className="min-h-screen overflow-x-clip bg-[#0a0f1a] text-white">
      <header className="border-b border-white/10 px-6 py-5 md:px-12 lg:px-20">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-6">
          <Link
            href="/"
            className="font-serif text-xl font-medium tracking-[0.12em] text-white transition-colors hover:text-[#ffb6c1]"
          >
            {APP_CONFIG.name.toUpperCase()}
          </Link>
          <Link
            href="/"
            className="text-sm text-white/60 transition-colors hover:text-white"
          >
            ← Back to home
          </Link>
        </div>
      </header>

      <section className="relative px-6 py-18 md:px-12 md:py-24 lg:px-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(255,105,180,0.13),transparent_65%)]" />
        <article className="relative mx-auto w-full max-w-3xl">
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.28em] text-[#ffb6c1]">
            {eyebrow}
          </p>
          <h1 className="max-w-2xl text-5xl leading-[0.95] tracking-tight text-white md:text-7xl">
            {title}
          </h1>
          <p className="mt-7 border-b border-white/10 pb-10 text-sm text-white/50">
            Last updated: {lastUpdated}
          </p>

          <div className="legal-copy pt-10">{children}</div>
        </article>
      </section>

      <Footer />
    </main>
  );
}
