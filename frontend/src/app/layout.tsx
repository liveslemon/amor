import type { Metadata } from "next";
import { Young_Serif, Inter, Permanent_Marker } from "next/font/google";
import "./globals.css";
import { APP_CONFIG } from "@/config/app";

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

export const metadata: Metadata = {
  title: `${APP_CONFIG.name} | ${APP_CONFIG.tagline.toLowerCase()}`,
  description: `${APP_CONFIG.name} sets you up on personalized dates. No swiping, no ghosting, just real connections.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${youngSerif.variable} ${permanentMarker.variable} antialiased bg-premium-gradient`}
      >
        {children}
      </body>
    </html>
  );
}
