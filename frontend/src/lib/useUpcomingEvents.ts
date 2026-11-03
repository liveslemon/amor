"use client";

import { useEffect, useState } from "react";
import { fetchUpcomingEvents, DbEvent } from "@/api/events";

export function useUpcomingEvents() {
  const [events, setEvents] = useState<DbEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingEvents().then((data) => {
      setEvents(data);
      setLoading(false);
    });
  }, []);

  return { events, loading };
}
