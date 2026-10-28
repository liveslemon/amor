import type { AppProps } from "next/app";
import { Young_Serif, Inter, Permanent_Marker } from "next/font/google";
import "@/app/globals.css";
import Head from "next/head";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const youngSerif = Young_Serif({
  variable: "--font-young-serif",
  weight: "400",
  subsets: ["latin"],
});

const permanentMarker = Permanent_Marker({
  variable: "--font-marker",
  weight: "400",
  subsets: ["latin"],
});

import React, { useEffect } from "react";
import PWANavigation from "@/components/pwa/PWANavigation";
import NotificationModal from "@/components/pwa/NotificationModal";
import NotificationPopup from "@/components/pwa/NotificationPopup";
import { initGlobalHaptics } from "@/lib/haptics";
import API from "@/api/client";
import { useAuthStore } from "@/store/useAuthStore";

export default function App({ Component, pageProps }: AppProps) {
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch((err) => {
          console.warn("PWA Service Worker registration warning:", err);
        });
    }

    const cleanupHaptics = initGlobalHaptics();

    // Wake up/keep backend warm on app visit
    API.get("/health").catch(() => {});

    return () => {
      cleanupHaptics();
    };
  }, []);

  useEffect(() => {
    const token =
      localStorage.getItem("mingle_token") ||
      localStorage.getItem("mingle_access_token");
    if (!token) return;

    API.get("/me/profile")
      .then((response) => {
        if (response.data?.user) setAuth(token, response.data.user);
      })
      .catch((error) => {
        console.error("Could not restore the signed-in Minglee profile:", error);
      });
  }, [setAuth]);

  return (
    <div className={`${inter.variable} ${youngSerif.variable} ${permanentMarker.variable} font-sans`}>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes"
        />
        <meta
          name="facebook-domain-verification"
          content="jrqej54duyox78e8o3kj5kt8wo9vzp"
        />
      </Head>
      <Component {...pageProps} />
      <PWANavigation />
      <NotificationModal />
      <NotificationPopup />
    </div>
  );
}
