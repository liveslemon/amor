"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, MapPin, Ticket, Loader2 } from "lucide-react";
import { fetchUpcomingEvents, getEventImageUrl, DbEvent } from "@/api/events";

export default function UpcomingEvents() {
  const [events, setEvents] = useState<DbEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingEvents().then((data) => {
      setEvents(data);
      setLoading(false);
    });
  }, []);

  if (!loading && events.length === 0) return null;

  return (
    <section
      id="events"
      className="relative w-full min-h-[84vh] py-12 sm:py-16 md:py-20 overflow-hidden bg-[#0c1220] text-white"
    >
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(244,114,182,0.16),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_30%)]" />

      <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col items-center justify-center mb-8 sm:mb-10 md:mb-12 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20, rotate: -5 }}
            whileInView={{ opacity: 1, y: 0, rotate: -2 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-black text-white px-4 sm:px-6 py-2 shadow-2xl border border-white/10 text-center inline-block"
          >
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-serif tracking-tight drop-shadow-md leading-tight">
              Events{" "}
              <span className="text-[#ff5fb8] font-[family-name:var(--font-marker)] font-normal tracking-wide inline-block -rotate-2 ml-1">
                by Minglee
              </span>
            </h2>
          </motion.div>
          
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#ff5fb8]" />
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto gap-5 sm:gap-6 md:gap-8">
          {events.map((event, index) => {
            const entryFee =
              Number(event.ticket_price) > 0
                ? `From NGN ${Number(event.ticket_price).toLocaleString()}`
                : "Free";
            const eventDate = new Date(event.event_day).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            });

            return (
              <motion.article
                key={event.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                viewport={{ once: true, margin: "-60px" }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl md:rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-white/[0.07]"
              >
                <div>
                  {/* Image Banner */}
                  <div className="relative aspect-[16/10] sm:aspect-[16/9] md:aspect-[16/10] overflow-hidden">
                    <img
                      src={getEventImageUrl(event.event_picture)}
                      alt={event.event_name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#08101e] via-[#08101e]/30 to-transparent" />

                    {/* Ticket Type Pill */}
                    <div className="absolute left-3 top-3 sm:left-4 sm:top-4 flex items-center gap-1.5">
                      {event.is_boosted && (
                        <span className="rounded-full bg-[#ffb6c1] px-3 py-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.22em] text-black">
                          Promoted
                        </span>
                      )}
                      <span className="rounded-full border border-white/15 bg-black/50 backdrop-blur-sm px-3 py-1 text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-white/90 font-medium">
                        {event.ticket_type}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-5 md:p-6">
                    <h3 className="text-xl sm:text-2xl font-serif tracking-tight text-white group-hover:text-[#ffb6c1] transition-colors">
                      {event.event_name}
                    </h3>

                    <p className="mt-2 text-xs sm:text-sm text-white/70 leading-relaxed">
                      {event.event_description}
                    </p>

                    {/* Event Metadata */}
                    <div className="mt-4 pt-4 border-t border-white/10 grid gap-2 sm:gap-2.5 text-xs sm:text-sm text-white/85">
                      <div className="flex items-center gap-2.5">
                        <CalendarDays className="w-4 h-4 text-[#ff6fb1] shrink-0" />
                        <span className="truncate">{eventDate}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <MapPin className="w-4 h-4 text-[#ff6fb1] shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Ticket className="w-4 h-4 text-[#ff6fb1] shrink-0" />
                        <span className="font-medium text-white">{entryFee}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="p-4 sm:p-5 md:p-6 pt-0">
                  <Link
                    href={`/events/${event.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-xs sm:text-sm font-semibold text-[#08101e] transition-all duration-200 hover:bg-white/90 active:scale-[0.98]"
                  >
                    <span>View Details & Register</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>
        )}
      </div>
    </section>
  );
}
