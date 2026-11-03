"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  CalendarDays,
  MapPin,
  Users,
  Search,
} from "lucide-react";
import { APP_CONFIG } from "@/config/app";
import { fetchUpcomingEvents, getEventImageUrl, DbEvent } from "@/api/events";

export default function EventsIndexPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<DbEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingEvents()
      .then(setEvents)
      .finally(() => setLoading(false));
  }, []);

  const filteredEvents = events.filter((event) => {
    const query = searchQuery.toLowerCase();
    return (
      event.event_name.toLowerCase().includes(query) ||
      event.location.toLowerCase().includes(query)
    );
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

          {/* Search Toolbar */}
          <div className="flex justify-end">
            <div className="relative w-full md:w-72">
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
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-[#0c1322] overflow-hidden animate-pulse">
                  <div className="h-48 w-full bg-white/[0.04]" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 w-2/3 rounded-full bg-white/[0.06]" />
                    <div className="h-3 w-1/2 rounded-full bg-white/[0.04]" />
                    <div className="h-3 w-1/3 rounded-full bg-white/[0.04]" />
                    <div className="h-8 w-full rounded-full bg-white/[0.04] mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="rounded-2xl bg-[#0c1322] border border-white/5 p-10 text-center space-y-1.5">
              <p className="text-sm text-white/70">No events available right now.</p>
              <p className="text-xs text-white/40">
                Check back soon — new campus events drop regularly.
              </p>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-1">
            {filteredEvents.map((evt) => {
              const entryFee =
                Number(evt.ticket_price) > 0
                  ? `From NGN ${Number(evt.ticket_price).toLocaleString()}`
                  : "Free";
              const eventDate = new Date(evt.event_day).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });

              return (
                <Link
                  key={evt.id}
                  href={`/events/${evt.id}`}
                  className="rounded-2xl bg-[#0c1322] border border-white/10 overflow-hidden group hover:border-white/20 transition-colors"
                >
                  <div className="relative h-48 w-full bg-[#141c2e] overflow-hidden">
                    <img
                      src={getEventImageUrl(evt.event_picture)}
                      alt={evt.event_name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c1322] via-transparent to-black/30" />

                    {/* Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      {evt.is_boosted && (
                        <span className="text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-[#FFB6C1] text-black">
                          Promoted
                        </span>
                      )}
                      <span className="text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-black/75 text-white/90">
                        {evt.ticket_type}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 flex items-center gap-1 text-[11px] font-medium rounded-full bg-black/75 px-2.5 py-0.5 text-white">
                      <Users className="w-3 h-3 text-[#FFB6C1]" />
                      <span>{evt.attendee_count} going</span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h2 className="font-serif text-xl text-white mt-0.5">
                        {evt.event_name}
                      </h2>
                    </div>

                    <div className="space-y-1 text-xs text-white/60">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-3.5 h-3.5 text-white/40" />
                        <span>{eventDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-white/40" />
                        <span>{evt.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <span className="text-sm font-semibold text-white">
                        {entryFee}
                      </span>
                      <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-white transition-colors group-hover:bg-white/15">
                        View & Reserve →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          )}
        </main>
      </div>
    </>
  );
}
