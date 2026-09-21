"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  CalendarDays,
  MapPin,
  Clock,
  Ticket,
  Users,
  Search,
  Sparkles,
  Heart,
  Flame,
} from "lucide-react";
import { APP_CONFIG } from "@/config/app";

interface EventItem {
  id: string;
  slug: string;
  category: string;
  badge: string;
  title: string;
  date: string;
  time: string;
  location: string;
  price: string;
  vibe: string;
  image: string;
  attendeesCount: number;
}

const CATEGORIES = [
  "All",
  "❤️ Date-Friendly",
  "🔥 Social",
  "🎉 Party",
  "🍽️ Food & Drinks",
  "🏀 Sports",
];

const EVENTS_DATA: EventItem[] = [
  {
    id: "123e4567-e89b-12d3-a456-426614174001",
    slug: "minglee-at-wet-wars",
    category: "Party",
    badge: "Selling Fast",
    title: "WET WARS 2.0",
    date: "28th & 29th August 2026",
    time: "9:00 PM",
    location: "Unilag Guest House, Akoka",
    price: "From NGN 3,500",
    vibe: "High-Energy • Amapiano • Fun",
    image: "/assets/wet-wars.jpeg",
    attendeesCount: 142,
  },
  {
    id: "evt_002",
    slug: "rave-district",
    category: "Date-Friendly",
    badge: "Limited Seats",
    title: "RAVE DISTRICT",
    date: "27th August 2026",
    time: "9:00 PM",
    location: "Unilag Guest House, Akoka",
    price: "From NGN 4,000",
    vibe: "Warm • Intimate • Conversational",
    image: "/assets/rave-district.jpeg",
    attendeesCount: 98,
  },
  {
    id: "evt_003",
    slug: "minglee-at-wet-wars",
    category: "Social",
    badge: "Campus Mixer",
    title: "CAMPUS SUNSET BRUNCH",
    date: "5th September 2026",
    time: "4:00 PM",
    location: "PAU Main Terrace, Ibeju-Lekki",
    price: "From NGN 2,500",
    vibe: "Cocktails • Good Music • Chill",
    image: "/match-poster.png",
    attendeesCount: 76,
  },
];

export default function EventsIndexPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEvents = EVENTS_DATA.filter((event) => {
    const matchesCat =
      selectedCategory === "All" ||
      selectedCategory.toLowerCase().includes(event.category.toLowerCase());
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <>
      <Head>
        <title>{APP_CONFIG.name} | Campus Events</title>
      </Head>

      <div className="min-h-screen bg-[#000B1A] text-[#F8F9FA] pb-28 md:pb-16">
        {/* Mobile Header (Desktop uses PWANavigation top navbar) */}
        <header className="md:hidden sticky top-0 z-30 bg-[#000B1A] border-b border-white/5 px-4 py-3.5">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <h1 className="font-serif text-xl tracking-tight text-white">
              Campus Events
            </h1>
            <span className="text-xs text-white/40">
              <span className="font-[family-name:var(--font-marker)] text-xs text-[#FFB6C1] font-normal">Minglee</span> Singles
            </span>
          </div>
        </header>

        <main className="max-w-md md:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-24 space-y-6">
          {/* Desktop Title & Subtitle */}
          <div className="hidden md:block space-y-1">
            <h1 className="font-serif text-3xl lg:text-4xl text-white tracking-tight">
              Campus <span className="font-[family-name:var(--font-marker)] text-[#FFB6C1] inline-block -rotate-2 font-normal">Events</span>
            </h1>
            <p className="text-sm text-white/60">
              Curated social parties, weekend mixers, and date-friendly events near you.
            </p>
          </div>

          {/* Search & Category Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Category Filter Chips */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 order-2 md:order-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 text-xs px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-white text-black font-semibold"
                      : "bg-white/[0.04] text-white/70 hover:bg-white/[0.08]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-72 order-1 md:order-2">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search campus events or venues..."
                className="w-full pl-10 pr-4 py-2 rounded-full bg-white/[0.04] text-xs text-white placeholder-white/40 focus:outline-none focus:bg-white/[0.07] transition-colors"
              />
            </div>
          </div>

          {/* Event Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-1">
            {filteredEvents.map((evt) => (
              <div
                key={evt.id}
                className="rounded-2xl bg-[#0c1322] overflow-hidden group"
              >
                <div className="relative h-48 w-full bg-[#141c2e] overflow-hidden">
                  <img
                    src={evt.image}
                    alt={evt.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c1322] via-transparent to-black/30" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-black/75 text-white/90">
                      {evt.badge}
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3 flex items-center gap-1 text-[11px] font-medium rounded-full bg-black/75 px-2.5 py-0.5 text-white">
                    <Users className="w-3 h-3 text-[#FFB6C1]" />
                    <span>{evt.attendeesCount} going</span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#FFB6C1] font-semibold">
                      {evt.vibe}
                    </span>
                    <h2 className="font-serif text-xl text-white mt-0.5">
                      {evt.title}
                    </h2>
                  </div>

                  <div className="space-y-1 text-xs text-white/60">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-3.5 h-3.5 text-white/40" />
                      <span>
                        {evt.date} • {evt.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-white/40" />
                      <span>{evt.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-sm font-semibold text-white">
                      {evt.price}
                    </span>
                    <Link
                      href={`/events/${evt.slug}`}
                      className="rounded-full bg-white/10 hover:bg-white/15 text-white px-4 py-2 text-xs font-medium transition-colors active:scale-95"
                    >
                      View & Reserve →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
