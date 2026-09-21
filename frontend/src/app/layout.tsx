import type { Metadata } from "next";
import { Young_Serif, Inter, Permanent_Marker } from "next/font/google";
import "./globals.css";
import { APP_CONFIG } from "@/config/app";
import RegisterPWA from "@/app/register-pwa";
import { PWAAppShell } from "@/components/pwa/PWAAppShell";

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

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://localhost:3000";

export const metadata: Metadata = {
  title: `${APP_CONFIG.name} | ${APP_CONFIG.tagline.toLowerCase()}`,
  description: `${APP_CONFIG.name} sets you up on personalized dates. No swiping, no ghosting, just real connections.`,
  manifest: "/manifest.webmanifest",
  applicationName: APP_CONFIG.name,
  metadataBase: new URL(appUrl),
  appleWebApp: {
    capable: true,
    title: APP_CONFIG.name,
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/match-poster.png",
    shortcut: "/match-poster.png",
    apple: "/match-poster.png",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="facebook-domain-verification"
          content="jrqej54duyox78e8o3kj5kt8wo9vzp"
        />
        <meta name="theme-color" content="#ff6b9d" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content={APP_CONFIG.name} />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${inter.variable} ${youngSerif.variable} ${permanentMarker.variable} antialiased bg-premium-gradient`}
      >
        <RegisterPWA />
        <PWAAppShell>{children}</PWAAppShell>
      </body>
    </html>
  );
}
