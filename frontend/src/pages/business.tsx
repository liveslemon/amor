import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  Megaphone,
  Ticket,
  Calendar,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Clock,
  Layers,
  Bell,
  Eye,
} from "lucide-react";
import axios from "axios";
import API from "@/api/client";
import { APP_CONFIG } from "@/config/app";
import { useAuthStore } from "@/store/useAuthStore";
import { optimizeImage } from "@/lib/imageOptimization";

type BusinessTab = "ads" | "tickets" | "notifications";
type AdType = "banner" | "notification" | "popup" | "ticket_boost";

interface Ad {
  id: string;
  ad_type: AdType;
  title: string;
  text_content?: string;
  image_url?: string;
  target_url?: string;
  popup_id?: string;
  scheduled_date?: string;
  start_date?: string;
  end_date?: string;
  placement?: string;
  status: string;
  rejection_reason?: string;
  impressions?: number;
  clicks?: number;
}

interface EventRecord {
  id: string;
  event_name: string;
  event_description?: string;
  ticket_type?: string;
  ticket_price: number;
  location?: string;
  event_picture: string;
  event_day: string;
  status?: string;
  attendee_count?: number;
}

type ApiErrorBody = {
  message?: string;
  error?: string;
  reason?: string;
  details?: { formErrors?: string[]; fieldErrors?: Record<string, string[]> };
};

// Validation failures come back as { error: "Invalid input", details }; include
// the field-level messages so the user knows what to fix.
function getRequestErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const data = error.response?.data;
    const base = data?.reason || data?.message || data?.error || fallback;
    const problems = [
      ...(data?.details?.formErrors ?? []),
      ...Object.values(data?.details?.fieldErrors ?? {}).flat(),
    ];
    return problems.length ? `${base}: ${problems.join("; ")}` : base;
  }
  return error instanceof Error ? error.message : fallback;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function BusinessPage() {
  const user = useAuthStore((state) => state.user);
  const [tab, setTab] = useState<BusinessTab>("ads");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Existing lists
  const [ads, setAds] = useState<Ad[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);

  // Ad Manager State
  const [adType, setAdType] = useState<AdType>("banner");
  const [title, setTitle] = useState("");
  const [textContent, setTextContent] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [popupId, setPopupId] = useState("");
  const [boostEventId, setBoostEventId] = useState("");
  const [scheduledDate, setScheduledDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [slotAvailability, setSlotAvailability] = useState<{
    checked: boolean;
    available: boolean;
    reason: string | null;
    slotsRemaining: number;
    maxAllowed: number;
  }>({
    checked: false,
    available: true,
    reason: null,
    slotsRemaining: 3,
    maxAllowed: 3,
  });

  // Ticket Manager State
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [ticketType, setTicketType] = useState("Regular");
  const [ticketPrice, setTicketPrice] = useState<number>(0);
  const [location, setLocation] = useState("PAU Campus");
  const [eventDate, setEventDate] = useState(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().slice(0, 10);
  });
  const [eventImages, setEventImages] = useState<string[]>([]);
  const [uploadingEventImage, setUploadingEventImage] = useState(false);
  const [submittingTicket, setSubmittingTicket] = useState(false);

  // Load existing ads and events
  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === "ads") {
        const res = await API.get("/ads", {
          params: { date: new Date().toISOString() },
        });
        setAds(Array.isArray(res.data?.data) ? res.data.data : []);
      } else if (tab === "tickets") {
        const res = await API.get("/events");
        setEvents(Array.isArray(res.data?.events) ? res.data.events : []);
      }
    } catch (err) {
      console.warn("Could not load data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tab]);

  // Check date slot availability in real time when adType or scheduledDate changes
  useEffect(() => {
    let active = true;
    const checkSlots = async () => {
      try {
        const res = await API.get(`/ads/availability/${adType}/${scheduledDate}`);
        if (!active) return;
        if (res.data) {
          const max = res.data.max_allowed || (adType === "banner" || adType === "ticket_boost" ? 3 : 1);
          const current = res.data.current_count || 0;
          const isAvail = res.data.is_available ?? current < max;
          setSlotAvailability({
            checked: true,
            available: isAvail,
            reason: isAvail ? null : "Clashing of dates with another advert",
            slotsRemaining: Math.max(0, max - current),
            maxAllowed: max,
          });
        }
      } catch (err) {
        if (!active) return;
        setSlotAvailability({
          checked: true,
          available: true,
          reason: null,
          slotsRemaining: 1,
          maxAllowed: adType === "banner" ? 3 : 1,
        });
      }
    };

    checkSlots();
    return () => {
      active = false;
    };
  }, [adType, scheduledDate]);

  // Handle ad media upload (strict max 2 images, high-quality downscale)
  const handleAdImageUpload = async (file?: File) => {
    if (!file) return;
    if (uploadedImages.length >= 2) {
      setError("Only 2 images allowed. Remove an existing image first.");
      return;
    }

    setError("");
    setMessage("");
    setUploadingImage(true);

    try {
      const optimized = await optimizeImage(file, 1600, 0.92);
      const formData = new FormData();
      formData.append("file", optimized);
      const response = await API.post("/ads/upload", formData);
      const url = response.data?.data?.image_url;
      if (!url) throw new Error("Image upload did not return a valid URL.");

      setUploadedImages((prev) => [...prev, url].slice(0, 2));
      setMessage("Media image optimized and uploaded.");
    } catch (err) {
      setError(getRequestErrorMessage(err, "Image upload failed."));
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle event picture upload (strict max 2 images, high-quality downscale)
  const handleEventImageUpload = async (file?: File) => {
    if (!file) return;
    if (eventImages.length >= 2) {
      setError("Only 2 images allowed for tickets. Remove an existing image first.");
      return;
    }

    setError("");
    setMessage("");
    setUploadingEventImage(true);

    try {
      const optimized = await optimizeImage(file, 1600, 0.92);
      const formData = new FormData();
      formData.append("file", optimized);
      const response = await API.post("/ads/upload", formData);
      const url = response.data?.data?.image_url;
      if (!url) throw new Error("Image upload did not return a valid URL.");

      setEventImages((prev) => [...prev, url].slice(0, 2));
      setMessage("Ticket event image optimized and attached.");
    } catch (err) {
      setError(getRequestErrorMessage(err, "Image upload failed."));
    } finally {
      setUploadingEventImage(false);
    }
  };

  // Submit Ad
  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!slotAvailability.available) {
      setError("Clashing of dates with another advert");
      return;
    }

    // Constraints check
    if ((adType === "banner" || adType === "ticket_boost" || adType === "popup") && uploadedImages.length === 0) {
      setError("Media is required for this ad format.");
      return;
    }

    if (adType === "notification" && !textContent.trim()) {
      setError("Notification ads require a text description.");
      return;
    }

    try {
      const startTime = `${scheduledDate}T00:00:00Z`;
      // End time minimum 24 hours
      const nextDate = new Date(new Date(scheduledDate).getTime() + 24 * 60 * 60 * 1000);
      const endTime = nextDate.toISOString();

      // The "Link to Popup" field accepts a popup UUID or an internal route; the
      // API only takes a UUID in popup_id, so a route becomes the target_url.
      const popupLink = popupId.trim();
      const linkedPopupId = UUID_PATTERN.test(popupLink) ? popupLink : null;
      const linkedRoute = popupLink && !linkedPopupId ? popupLink : "";

      const payload = {
        ad_type: adType,
        title: title.trim() || (adType === "notification" ? "Notification Promotion" : "Banner Spotlight"),
        text_content: textContent.trim(),
        image_url: uploadedImages[0] || null,
        target_url: targetUrl.trim() || linkedRoute || (boostEventId ? `/events/${boostEventId}` : "/date"),
        popup_id: linkedPopupId,
        event_id: boostEventId || null,
        scheduled_date: scheduledDate,
        start_time: startTime,
        end_time: endTime,
        start_date: startTime,
        end_date: endTime,
        placement: adType === "popup" ? "popup" : "home-banner",
      };

      const res = await API.post("/ads", payload);
      if (res.data?.success) {
        setMessage("Ad promotion submitted successfully! Awaiting administrator approval.");
        setTitle("");
        setTextContent("");
        setTargetUrl("");
        setPopupId("");
        setBoostEventId("");
        setUploadedImages([]);
        loadData();
      } else {
        throw new Error(res.data?.message || "Could not create promotion");
      }
    } catch (err: any) {
      if (err.response?.status === 409 || err.response?.data?.reason?.includes("Clashing")) {
        setError("Clashing of dates with another advert");
      } else {
        setError(getRequestErrorMessage(err, "Promotion could not be submitted."));
      }
    }
  };

  // Submit Ticket / Event
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSubmittingTicket(true);

    if (eventImages.length === 0) {
      setError("Event picture is required for ticket registration.");
      setSubmittingTicket(false);
      return;
    }

    try {
      const payload = {
        event_name: eventName.trim(),
        event_description: eventDescription.trim(),
        ticket_type: ticketType.trim(),
        ticket_price: Number(ticketPrice) || 0,
        location: location.trim(),
        event_picture: eventImages[0],
        event_day: eventDate,
      };

      const res = await API.post("/events", payload);
      if (res.data?.event) {
        setMessage("Ticket event successfully submitted for admin review!");
        setEventName("");
        setEventDescription("");
        setTicketType("Regular");
        setTicketPrice(0);
        setLocation("PAU Campus");
        setEventImages([]);
        loadData();
      }
    } catch (err) {
      setError(getRequestErrorMessage(err, "Could not create ticket event."));
    } finally {
      setSubmittingTicket(false);
    }
  };

  const tabs: Array<{ id: BusinessTab; label: string; icon: React.ReactNode }> = [
    { id: "ads", label: "Ad Manager", icon: <Megaphone className="h-4 w-4" /> },
    { id: "tickets", label: "Ticket Manager", icon: <Ticket className="h-4 w-4" /> },
    { id: "notifications", label: "Notifications & Popups", icon: <Bell className="h-4 w-4" /> },
  ];

  return (
    <>
      <Head>
        <title>{`Business Suite | ${APP_CONFIG.name}`}</title>
      </Head>

      <div className="min-h-screen bg-[#000B1A] text-white selection:bg-[#FFB6C1] selection:text-[#000B1A]">
        {/* Header Bar */}
        <header className="border-b border-white/10 bg-[#0a0f1a]/90 backdrop-blur-md sticky top-0 md:top-16 z-30 md:mt-16">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <Link
                href="/me"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <span className="font-serif text-lg font-semibold tracking-wide">
                  MINGLEE BUSINESS
                </span>
                <span className="ml-2 text-[10px] uppercase tracking-wider text-[#FFB6C1]">
                  Ad & Ticket Hub
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="text-xs text-white/50 hover:text-[#FFB6C1] transition-colors"
              >
                Admin Panel →
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-8">
          {/* Navigation Tabs */}
          <nav className="flex gap-2 border-b border-white/10 pb-3 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTab(t.id);
                  setError("");
                  setMessage("");
                }}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-xs font-medium transition-colors ${
                  tab === t.id
                    ? "bg-white text-[#000B1A]"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </nav>

          {/* Feedback Alerts */}
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-200 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {message && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs text-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          {/* TAB 1: AD MANAGER */}
          {tab === "ads" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Ad Creation Form */}
              <div className="lg:col-span-7 space-y-5">
                <div className="rounded-2xl border border-white/10 bg-[#0c1322] p-6 space-y-5">
                  <div>
                    <h2 className="font-serif text-2xl text-white">Create Advertisement</h2>
                    <p className="text-xs text-white/50 mt-1">
                      Promote your brand, campus event, or ticket to student singles across PAU.
                    </p>
                  </div>

                  {/* Ad Format Selector */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { type: "banner", label: "Banner Ad", sub: "3 per day" },
                      { type: "ticket_boost", label: "Ticket Boost", sub: "Event spotlight" },
                      { type: "notification", label: "Notification", sub: "1 per day" },
                      { type: "popup", label: "Popup Ad", sub: "1 per day" },
                    ].map((f) => (
                      <button
                        key={f.type}
                        type="button"
                        onClick={() => setAdType(f.type as AdType)}
                        className={`p-3 rounded-xl text-left border transition-all ${
                          adType === f.type
                            ? "bg-white/10 border-[#FFB6C1] text-white"
                            : "bg-[#0a0f1a] border-white/10 text-white/60 hover:text-white"
                        }`}
                      >
                        <span className="block text-xs font-semibold">{f.label}</span>
                        <span className="block text-[10px] text-white/40 mt-0.5">{f.sub}</span>
                      </button>
                    ))}
                  </div>

                  {/* Date & Clash Availability Banner */}
                  <div className="rounded-xl border border-white/10 bg-[#0a0f1a] p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-white/70 font-medium flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#FFB6C1]" />
                        <span>Date to be shown (Minimum 24 hours)</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="rounded-lg border border-white/10 bg-[#0c1322] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FFB6C1]"
                      />
                    </div>

                    {slotAvailability.checked && (
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                        <span className="text-white/50">Daily Slot Status:</span>
                        {slotAvailability.available ? (
                          <span className="text-emerald-400 font-medium">
                            Available ({slotAvailability.slotsRemaining} of {slotAvailability.maxAllowed} slots left)
                          </span>
                        ) : (
                          <span className="text-red-400 font-medium flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Clashing of dates with another advert
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleCreateAd} className="space-y-4">
                    {/* Title */}
                    <div>
                      <label className="block text-xs text-white/70 mb-1 font-medium">
                        Ad Title / Headline
                      </label>
                      <input
                        required
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. WET WARS 2.0 Pool Party"
                        className="w-full rounded-xl border border-white/10 bg-[#0a0f1a] p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FFB6C1]"
                      />
                    </div>

                    {/* Text description (required for notification, optional for others) */}
                    <div>
                      <label className="block text-xs text-white/70 mb-1 font-medium">
                        {adType === "notification"
                          ? "Text Description (Required for Notification Ads)"
                          : "Ad Text / Copy"}
                      </label>
                      <textarea
                        required={adType === "notification"}
                        rows={3}
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        placeholder="Enter compelling copy for your advert..."
                        className="w-full rounded-xl border border-white/10 bg-[#0a0f1a] p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FFB6C1] resize-none"
                      />
                    </div>

                    {/* Media upload (for banner, ticket boost, popup) */}
                    {adType !== "notification" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-white/70 font-medium flex items-center gap-1">
                            <span>Ad Media (Downscaled without losing quality, only 2 images max)</span>
                          </label>
                          <span className="text-[11px] text-white/40">{uploadedImages.length}/2</span>
                        </div>

                        {uploadedImages.length > 0 && (
                          <div className="grid grid-cols-2 gap-2">
                            {uploadedImages.map((img, i) => (
                              <div key={i} className="relative aspect-video rounded-lg overflow-hidden bg-white/5 border border-white/10">
                                <img src={img} alt="Uploaded" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => setUploadedImages((prev) => prev.filter((_, idx) => idx !== i))}
                                  className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-red-500 text-white rounded-full p-1 text-[10px]"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {uploadedImages.length < 2 && (
                          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-4 text-xs text-white/60 hover:border-[#FFB6C1] hover:text-white transition-colors">
                            <ImagePlus className="w-4 h-4 text-[#FFB6C1]" />
                            <span>
                              {uploadingImage ? "Optimizing & downscaling image..." : "Upload media image"}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={uploadingImage}
                              className="sr-only"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                e.target.value = "";
                                void handleAdImageUpload(file);
                              }}
                            />
                          </label>
                        )}
                      </div>
                    )}

                    {/* Notification-specific: Link to Popup in App */}
                    {adType === "notification" && (
                      <div>
                        <label className="block text-xs text-white/70 mb-1 font-medium">
                          Link to Popup in App (Popup UUID or Internal Route)
                        </label>
                        <input
                          required
                          type="text"
                          value={popupId}
                          onChange={(e) => setPopupId(e.target.value)}
                          placeholder="e.g. /events or popup UUID"
                          className="w-full rounded-xl border border-white/10 bg-[#0a0f1a] p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FFB6C1]"
                        />
                        <p className="text-[11px] text-white/40 mt-1">
                          Clicking this notification will open the connected popup modal dialog for users.
                        </p>
                      </div>
                    )}

                    {/* Destination Link */}
                    {adType !== "notification" && (
                      <div>
                        <label className="block text-xs text-white/70 mb-1 font-medium">
                          Destination Link
                        </label>
                        <input
                          type="text"
                          value={targetUrl}
                          onChange={(e) => setTargetUrl(e.target.value)}
                          placeholder="e.g. /events/wet-wars or https://..."
                          className="w-full rounded-xl border border-white/10 bg-[#0a0f1a] p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FFB6C1]"
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={!slotAvailability.available || uploadingImage}
                      className="w-full h-11 rounded-full bg-white text-[#000B1A] font-medium text-sm hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Megaphone className="w-4 h-4" />
                      <span>Submit Ad for Approval</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Preview & Live Ads */}
              <div className="lg:col-span-5 space-y-6">
                {/* Live Preview Card */}
                <div className="rounded-2xl border border-white/10 bg-[#0c1322] p-5 space-y-4">
                  <h3 className="font-serif text-lg text-white">Creative Preview</h3>
                  <div className="rounded-xl border border-white/10 bg-[#0a0f1a] overflow-hidden">
                    <div className="relative aspect-video bg-white/5 flex items-center justify-center">
                      {uploadedImages[0] ? (
                        <img src={uploadedImages[0]} alt="Ad preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-white/30">Media preview</span>
                      )}
                      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md rounded-md px-2 py-0.5 text-[10px] uppercase tracking-wider text-[#FFB6C1]">
                        {adType.replace("_", " ")}
                      </div>
                    </div>
                    <div className="p-4 space-y-1">
                      <h4 className="font-serif text-base text-white">{title || "Ad Headline"}</h4>
                      <p className="text-xs text-white/60 line-clamp-2">
                        {textContent || "Text description will appear here..."}
                      </p>
                      <span className="text-[10px] text-white/40 block pt-1">
                        Shown for 24h on {scheduledDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Active Promotions Feed */}
                <div className="rounded-2xl border border-white/10 bg-[#0c1322] p-5 space-y-3">
                  <h3 className="font-serif text-lg text-white">Live Ads & Status</h3>
                  {loading ? (
                    <div className="py-6 flex justify-center text-white/40">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                  ) : ads.length === 0 ? (
                    <p className="text-xs text-white/40 py-4 text-center">No active ads on this date.</p>
                  ) : (
                    <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                      {ads.map((ad) => (
                        <div key={ad.id} className="rounded-xl border border-white/5 bg-[#0a0f1a] p-3 text-xs flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <span className="font-semibold text-white block truncate">{ad.title}</span>
                            <span className="text-[10px] text-white/40 block">
                              {ad.ad_type} · {ad.scheduled_date || "Active"}
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${
                            ad.status === "approved"
                              ? "bg-emerald-500/10 text-emerald-300"
                              : ad.status === "rejected"
                                ? "bg-red-500/10 text-red-300"
                                : "bg-amber-500/10 text-amber-300"
                          }`}>
                            {ad.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TICKET MANAGER */}
          {tab === "tickets" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Ticket Creation Form */}
              <div className="lg:col-span-7 space-y-5">
                <div className="rounded-2xl border border-white/10 bg-[#0c1322] p-6 space-y-5">
                  <div>
                    <h2 className="font-serif text-2xl text-white">Ticket Manager</h2>
                    <p className="text-xs text-white/50 mt-1">
                      Register an official campus event and issue tickets (Regular, VIP, Early Bird).
                    </p>
                  </div>

                  <form onSubmit={handleCreateTicket} className="space-y-4">
                    {/* Event Name */}
                    <div>
                      <label className="block text-xs text-white/70 mb-1 font-medium">Event Name</label>
                      <input
                        required
                        type="text"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                        placeholder="e.g. RAVE DISTRICT: Friday Night Singles"
                        className="w-full rounded-xl border border-white/10 bg-[#0a0f1a] p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FFB6C1]"
                      />
                    </div>

                    {/* Event Description */}
                    <div>
                      <label className="block text-xs text-white/70 mb-1 font-medium">Event Description</label>
                      <textarea
                        required
                        rows={3}
                        value={eventDescription}
                        onChange={(e) => setEventDescription(e.target.value)}
                        placeholder="Describe the dress code, vibe, and what students can expect..."
                        className="w-full rounded-xl border border-white/10 bg-[#0a0f1a] p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FFB6C1] resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Ticket Type */}
                      <div>
                        <label className="block text-xs text-white/70 mb-1 font-medium">Ticket Type</label>
                        <select
                          value={ticketType}
                          onChange={(e) => setTicketType(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#0a0f1a] p-3 text-sm text-white focus:outline-none focus:border-[#FFB6C1]"
                        >
                          <option value="Regular">Regular Admission</option>
                          <option value="VIP">VIP Singles Pass</option>
                          <option value="Early Bird">Early Bird Special</option>
                          <option value="Table">Table Reservation</option>
                        </select>
                      </div>

                      {/* Ticket Price */}
                      <div>
                        <label className="block text-xs text-white/70 mb-1 font-medium">
                          Ticket Price (NGN, 0 for Free RSVP)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={ticketPrice}
                          onChange={(e) => setTicketPrice(Number(e.target.value))}
                          className="w-full rounded-xl border border-white/10 bg-[#0a0f1a] p-3 text-sm text-white focus:outline-none focus:border-[#FFB6C1]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Location */}
                      <div>
                        <label className="block text-xs text-white/70 mb-1 font-medium">Location</label>
                        <input
                          required
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="e.g. Student Center Poolside / PAU Hall"
                          className="w-full rounded-xl border border-white/10 bg-[#0a0f1a] p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FFB6C1]"
                        />
                      </div>

                      {/* Event Date */}
                      <div>
                        <label className="block text-xs text-white/70 mb-1 font-medium">Event Date</label>
                        <input
                          required
                          type="date"
                          value={eventDate}
                          onChange={(e) => setEventDate(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#0a0f1a] p-3 text-sm text-white focus:outline-none focus:border-[#FFB6C1]"
                        />
                      </div>
                    </div>

                    {/* Event Pictures Upload (Max 2 images, downscaled) */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-white/70 font-medium">
                          Event Media (High-res downscaling, only 2 images max)
                        </label>
                        <span className="text-[11px] text-white/40">{eventImages.length}/2</span>
                      </div>

                      {eventImages.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                          {eventImages.map((img, i) => (
                            <div key={i} className="relative aspect-video rounded-lg overflow-hidden bg-white/5 border border-white/10">
                              <img src={img} alt="Event" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setEventImages((prev) => prev.filter((_, idx) => idx !== i))}
                                className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-red-500 text-white rounded-full p-1 text-[10px]"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {eventImages.length < 2 && (
                        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-4 text-xs text-white/60 hover:border-[#FFB6C1] hover:text-white transition-colors">
                          <ImagePlus className="w-4 h-4 text-[#FFB6C1]" />
                          <span>
                            {uploadingEventImage ? "Downscaling without losing quality..." : "Upload event picture"}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingEventImage}
                            className="sr-only"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              e.target.value = "";
                              void handleEventImageUpload(file);
                            }}
                          />
                        </label>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={submittingTicket || eventImages.length === 0}
                      className="w-full h-11 rounded-full bg-white text-[#000B1A] font-medium text-sm hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Ticket className="w-4 h-4" />
                      <span>{submittingTicket ? "Creating Event Ticket..." : "Create Ticket Event"}</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Event & Ticket Roster */}
              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-2xl border border-white/10 bg-[#0c1322] p-5 space-y-4">
                  <h3 className="font-serif text-lg text-white">Registered Events & Tickets</h3>
                  {loading ? (
                    <div className="py-6 flex justify-center text-white/40">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                  ) : events.length === 0 ? (
                    <p className="text-xs text-white/40 py-4 text-center">No campus events created yet.</p>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                      {events.map((ev) => (
                        <div key={ev.id} className="rounded-xl border border-white/5 bg-[#0a0f1a] p-3 text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-serif text-sm text-white font-medium">{ev.event_name}</span>
                            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300 font-medium">
                              ₦{ev.ticket_price > 0 ? Number(ev.ticket_price).toLocaleString() : "Free"}
                            </span>
                          </div>
                          <p className="text-white/50 text-[11px] line-clamp-2">
                            {ev.event_description || "No description provided"}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-white/40 pt-1 border-t border-white/5">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#FFB6C1]" />
                              {ev.location || "Campus"}
                            </span>
                            <span>{ev.event_day}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS & POPUPS */}
          {tab === "notifications" && (
            <div className="max-w-3xl space-y-6">
              <div className="rounded-2xl border border-white/10 bg-[#0c1322] p-6 space-y-4">
                <h2 className="font-serif text-2xl text-white">Notification Ads & Popups</h2>
                <p className="text-xs text-white/50 leading-relaxed">
                  Notification ads (1 per day) send an alert to student devices that links directly to an immersive in-app popup dialog (1 per day). Both formats must run for at least 24 hours.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                  <div className="rounded-xl border border-white/5 bg-[#0a0f1a] p-4 space-y-2">
                    <span className="text-xs font-semibold text-[#FFB6C1]">Notification Ads</span>
                    <ul className="text-xs text-white/60 space-y-1">
                      <li>• Maximum 1 ad per day</li>
                      <li>• Requires text description</li>
                      <li>• Date displayed for at least 24h</li>
                      <li>• Direct deep link to app popup</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-[#0a0f1a] p-4 space-y-2">
                    <span className="text-xs font-semibold text-[#FFB6C1]">Popup Ads</span>
                    <ul className="text-xs text-white/60 space-y-1">
                      <li>• Maximum 1 popup per day</li>
                      <li>• Requires media, text, and link</li>
                      <li>• Displayed for at least 24 hours</li>
                      <li>• Full visual modal experience</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
