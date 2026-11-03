import API from "./client";
import { supabase } from "@/lib/supabase";

export interface EventAttendeeRecord {
  event_id: string;
  user_id: string;
  created_at?: string;
}

export interface DbEvent {
  id: string;
  event_name: string;
  event_description: string;
  ticket_type: string;
  location: string;
  status: string;
  event_picture: string;
  event_day: string;
  ticket_price: number;
  created_at: string | null;
  is_boosted: boolean;
  attendee_count: number;
}

export type EventRegistrationPayload = {
  event_id: string;
  user_id?: string;
  event_slug?: string;
  event_name?: string;
  status?: "attending" | "interested" | "cancelled";
  attendance_status?: "going" | "interested" | "not_going";
  is_attending?: boolean;
  ticket_purchased?: boolean;
  type?: "rsvp_attendance";
  user?: {
    id?: string;
    name?: string;
    whatsapp_number?: string;
    email?: string;
    gender?: string;
    age?: number;
    location?: string;
    onboarding_completed?: boolean;
  };
  source: "login" | "signup" | "authenticated_user";
  attendee_notes?: string;
  agreed_to_terms?: boolean;
  registered_at?: string;
};

/**
 * Register a user as an attendee for an event.
 *
 * Writes go through the backend only: RLS now only grants anon/public reads
 * on `event_attendees`, not inserts, and the backend derives the user from
 * the JWT rather than trusting a client-supplied user_id.
 */
export const registerForEvent = async (data: EventRegistrationPayload) => {
  const res = await API.post("/events/register", { event_id: data.event_id });
  return res.data;
};

/**
 * Helper to get the public URL for an event image from the Supabase 'events' bucket.
 */
export const getEventImageUrl = (imagePath: string | undefined | null) => {
  if (!imagePath) return "";
  // If it's already a full URL or a local asset, return it directly
  if (imagePath.startsWith("http") || imagePath.startsWith("/assets")) {
    return imagePath;
  }

  if (supabase) {
    const { data } = supabase.storage.from("events").getPublicUrl(imagePath);
    return data.publicUrl;
  }
  return imagePath;
};

/**
 * Fetch all events from the `events` DB table via the backend API, which
 * also attaches live attendee counts (`v_event_attendees`).
 */
export const fetchEvents = async (): Promise<DbEvent[]> => {
  try {
    const res = await API.get("/events");
    const events: DbEvent[] = res.data?.events ?? [];
    return events;
  } catch (err) {
    console.error("Events fetch error:", err);
    return [];
  }
};

/**
 * Only events that are approved and haven't happened yet.
 */
export const fetchUpcomingEvents = async (): Promise<DbEvent[]> => {
  const events = await fetchEvents();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return events
    .filter((event) => event.status === "approved")
    .filter((event) => new Date(event.event_day) >= today)
    .sort((a, b) => {
      // Boosted (sponsored) events stay pinned to the top.
      if (a.is_boosted !== b.is_boosted) return a.is_boosted ? -1 : 1;
      return new Date(a.event_day).getTime() - new Date(b.event_day).getTime();
    });
};

/**
 * Fetch a single event by its DB id.
 */
export const getEventById = async (id: string): Promise<DbEvent | null> => {
  const events = await fetchEvents();
  return events.find((event) => event.id === id) ?? null;
};

/**
 * Check if a specific user is currently registered in `event_attendees`.
 */
export const checkIsUserAttending = async (eventId: string, userId: string): Promise<boolean> => {
  if (!supabase || !eventId || !userId) return false;
  try {
    const { data, error } = await supabase
      .from("event_attendees")
      .select("event_id, user_id")
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!error && data) return true;

    // Pluralized table fallback
    const { data: fallbackData } = await supabase
      .from("events_attendees")
      .select("event_id, user_id")
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .maybeSingle();

    if (fallbackData) return true;
  } catch (err) {
    console.warn("Check attendance error:", err);
  }
  return false;
};

/**
 * Fetch all attendee user IDs for a given event from `event_attendees`.
 */
export const getEventAttendees = async (eventId: string) => {
  if (!supabase || !eventId) return [];
  try {
    const { data, error } = await supabase
      .from("event_attendees")
      .select("*, users(*)")
      .eq("event_id", eventId);

    if (!error && data) return data;
  } catch (err) {
    console.warn("Fetch event attendees error:", err);
  }
  return [];
};
