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
 * Inserts into `event_attendees` table (if Supabase configured) and calls backend API.
 */
export const registerForEvent = async (data: EventRegistrationPayload) => {
  const userId = data.user_id || data.user?.id;
  const eventId = data.event_id;

  let backendResult: any = null;
  let supabaseResult: any = null;

  // 1. Direct Supabase insertion into `event_attendees` (if Supabase is configured)
  if (supabase && userId && eventId) {
    try {
      const { data: insertedData, error: insertErr } = await supabase
        .from("event_attendees")
        .insert({
          event_id: eventId,
          user_id: userId,
        })
        .select();

      if (!insertErr && insertedData) {
        supabaseResult = insertedData;
      } else if (insertErr) {
        // Fallback for pluralized table name if applicable
        const { data: fallbackData, error: fallbackErr } = await supabase
          .from("events_attendees")
          .insert({
            event_id: eventId,
            user_id: userId,
          })
          .select();

        if (!fallbackErr && fallbackData) {
          supabaseResult = fallbackData;
        } else {
          console.warn("Supabase attendee insert error:", insertErr.message || fallbackErr?.message);
        }
      }
    } catch (sbErr) {
      console.warn("Supabase insert exception:", sbErr);
    }
  }

  // 2. Also notify the backend REST API
  try {
    const res = await API.post("/events/register", {
      ...data,
      event_id: eventId,
      user_id: userId,
    });
    backendResult = res.data;
  } catch (apiErr) {
    // Graceful fallback if backend router relies entirely on Supabase direct tables
    console.warn("Backend /events/register endpoint note:", apiErr);
  }

  return (
    supabaseResult ||
    backendResult || {
      success: true,
      event_id: eventId,
      user_id: userId,
    }
  );
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
