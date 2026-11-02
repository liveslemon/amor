"use client";

import React from "react";
import Head from "next/head";
import { APP_CONFIG } from "@/config/app";
import LegalDocument from "@/components/legal/LegalDocument";

export default function TermsPage() {
  return (
    <>
      <Head>
        <title>{APP_CONFIG.name} | Terms & Privacy</title>
      </Head>
      <LegalDocument defaultTab="terms" />
    </>
  );
}
