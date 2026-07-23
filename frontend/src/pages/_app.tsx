import type { AppProps } from "next/app";
import "@/app/globals.css";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
        />
        <meta
          name="facebook-domain-verification"
          content="jrqej54duyox78e8o3kj5kt8wo9vzp"
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
