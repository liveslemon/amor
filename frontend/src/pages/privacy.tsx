"use client";

import React from "react";
import Head from "next/head";
import { APP_CONFIG } from "@/config/app";
import LegalDocument from "@/components/legal/LegalDocument";

export default function PrivacyPage() {
  return (
    <>
      <Head>
        <title>{APP_CONFIG.name} | Privacy Policy</title>
      </Head>
      <LegalDocument defaultTab="privacy" />
    </>
  );
}
