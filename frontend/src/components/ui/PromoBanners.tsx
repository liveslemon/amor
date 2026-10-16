"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Heart,
  Sparkles,
} from "lucide-react";
import API from "@/api/client";

interface Promo {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  target_url: string;
  label: string;
  icon: React.ReactNode;
  external?: boolean;
}

interface LiveAd {
  id: string;
  title: string;
  subtitle?: string;
  image_url?: string;
  target_url: string;
}

const DEFAULT_PROMOS: Promo[] = [
  {
    id: "friday-drop",
    title: "Friday Match Drop",
    description: "Your next intentional connection arrives every Friday.",
    target_url: "/date",
    label: "Weekly match",
    icon: <Heart className="h-5 w-5 text-[#FFB6C1]" />,
  },
  {
    id: "campus-events",
    title: "Campus Events",
    description: "Find mixers, meetups, and date-friendly events near you.",
    target_url: "/events",
    label: "Explore events",
    icon: <CalendarDays className="h-5 w-5 text-amber-300" />,
  },
];

interface PromoBannersProps {
  className?: string;
}

export default function PromoBanners({ className = "" }: PromoBannersProps) {
  const [banners, setBanners] = useState<Promo[]>(DEFAULT_PROMOS);
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const seenAds = useRef(new Set<string>());

  useEffect(() => {
    let active = true;

    API.get<{ data?: LiveAd[] }>("/ads", {
      params: { placement: "home-banner", date: new Date().toISOString() },
    })
      .then((response) => {
        const ads = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        if (!active || ads.length === 0) return;

        const liveBanners: Promo[] = ads.map((ad) => ({
          id: String(ad.id),
          title: ad.title,
          description: ad.subtitle || "A promotion picked for the Minglee community.",
          image_url: ad.image_url,
          target_url: ad.target_url,
          label: "Promotion",
          icon: <Sparkles className="h-5 w-5 text-[#FFB6C1]" />,
          external: /^https?:\/\//i.test(ad.target_url || ""),
        }));
        setBanners(liveBanners);
        setActiveIndex(0);
      })
      .catch((error) => {
        console.warn("Could not load live promotions; showing app promotions:", error);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const activeBanner = banners[activeIndex];
    if (!activeBanner || activeBanner.label !== "Promotion" || seenAds.current.has(activeBanner.id)) {
      return;
    }

    seenAds.current.add(activeBanner.id);
    API.post(`/ads/${encodeURIComponent(activeBanner.id)}/impression`).catch(
      (error) => {
        console.warn("Could not record promotion impression:", error);
      },
    );
  }, [activeIndex, banners]);

  const updateActiveIndex = () => {
    const carousel = carouselRef.current;
    const firstCard = carousel?.firstElementChild as HTMLElement | null;
    if (!carousel || !firstCard) return;

    const gap = Number.parseFloat(getComputedStyle(carousel).columnGap) || 0;
    const step = firstCard.getBoundingClientRect().width + gap;
    if (step > 0) {
      setActiveIndex(
        Math.max(0, Math.min(banners.length - 1, Math.round(carousel.scrollLeft / step))),
      );
    }
  };

  const scrollToBanner = (index: number) => {
    const carousel = carouselRef.current;
    const card = carousel?.children[index] as HTMLElement | undefined;
    if (!carousel || !card) return;
    const left =
      carousel.scrollLeft +
      card.getBoundingClientRect().left -
      carousel.getBoundingClientRect().left;
    carousel.scrollTo({ left, behavior: "smooth" });
  };

  return (
    <section
      aria-label="Promotions"
      aria-roledescription="carousel"
      className={`space-y-3 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5" aria-label="Choose promotion">
          {banners.map((banner, index) => (
            <button
              key={banner.id}
              type="button"
              onClick={() => scrollToBanner(index)}
              aria-label={`Show promotion ${index + 1}: ${banner.title}`}
              aria-current={activeIndex === index ? "true" : undefined}
              className={`h-1.5 rounded-full transition-all ${
                activeIndex === index ? "w-6 bg-white" : "w-1.5 bg-white/30"
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => scrollToBanner(Math.max(0, activeIndex - 1))}
            disabled={activeIndex === 0}
            aria-label="Previous promotion"
            className="rounded-full p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollToBanner(Math.min(banners.length - 1, activeIndex + 1))}
            disabled={activeIndex >= banners.length - 1}
            aria-label="Next promotion"
            className="rounded-full p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={carouselRef}
        onScroll={updateActiveIndex}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
      {banners.map((banner) => {
        const content = (
          <div className="relative flex h-full min-h-36 items-end overflow-hidden rounded-2xl border border-white/10 bg-[#0c1322] p-4 sm:min-h-40 sm:p-5">
            {banner.image_url && (
              <img
                src={banner.image_url}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-[#070b14]/75 to-[#070b14]/10" />
            <div className="relative z-10 min-w-0">
              <div className="mb-2 flex items-center gap-2">
                {banner.icon}
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">
                  {banner.label}
                </span>
              </div>
              <h2 className="font-serif text-xl text-white">{banner.title}</h2>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/65">
                {banner.description}
              </p>
            </div>
            <ArrowUpRight className="absolute right-4 top-4 h-4 w-4 text-white/70" />
          </div>
        );

        const handleClick = () => {
          if (banner.label === "Promotion") {
            API.post(`/ads/${encodeURIComponent(banner.id)}/click`).catch(
              (error) => console.warn("Could not record promotion click:", error),
            );
          }
        };

        return banner.external ? (
          <a
            key={banner.id}
            href={banner.target_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className="block min-w-0 shrink-0 basis-[88%] snap-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-white sm:basis-[calc(50%-0.375rem)]"
          >
            {content}
          </a>
        ) : (
          <Link
            key={banner.id}
            href={banner.target_url}
            onClick={handleClick}
            className="block min-w-0 shrink-0 basis-[88%] snap-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-white sm:basis-[calc(50%-0.375rem)]"
          >
            {content}
          </Link>
        );
      })}
      </div>
    </section>
  );
}
