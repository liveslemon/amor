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

export default function App({ Component, pageProps }: AppProps) {
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
    </div>
  );
}
