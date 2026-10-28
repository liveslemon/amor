import API from "./client";
import { supabase } from "@/lib/supabase";

export interface EventAttendeeRecord {
  event_id: string;
  user_id: string;
  created_at?: string;
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
const getEventImageUrl = (imagePath: string | undefined | null) => {
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
 * Fetch all events from the `events` DB table.
 */
export const fetchEvents = async () => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: true });

      if (!error && data) {
        return data.map((event) => ({
          ...event,
          image: getEventImageUrl(event.image),
        }));
      }
      if (error) {
        console.error("Supabase events fetch error:", error);
      }
    } catch (err) {
      console.error("Supabase events fetch exception:", err);
    }
  }
  return [];
};

/**
 * Fetch a single event by its slug from DB table.
 */
export const getEventBySlug = async (slug: string) => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (!error && data) {
        return {
          ...data,
          image: getEventImageUrl(data.image),
        };
      }
      if (error) {
        console.error("Supabase event by slug fetch error:", error);
      }
    } catch (err) {
      console.error("Supabase event by slug fetch exception:", err);
    }
  }
  return null;
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
