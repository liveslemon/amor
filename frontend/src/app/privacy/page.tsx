import type { Metadata } from "next";
import LegalPageLayout from "@/components/legal/LegalPageLayout";
import { APP_CONFIG } from "@/config/app";

export const metadata: Metadata = {
  title: `Privacy Policy | ${APP_CONFIG.name}`,
  description: `Learn how ${APP_CONFIG.name} collects, uses, and protects personal information.`,
};

const lastUpdated = "August 11, 2026";

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      eyebrow="Your privacy"
      title="Privacy Policy"
      lastUpdated={lastUpdated}
    >
      <p>
        This Privacy Policy explains how {APP_CONFIG.name} (also called
        &nbsp;“Minglee,” “we,” “us,” or “our”) collects, uses, shares, and protects personal
        information when you use our website and matchmaking services.
      </p>

      <h2>Information we collect</h2>
      <p>We collect information you give us, including:</p>
      <ul>
        <li>
          Account information, such as your name, WhatsApp number, and a
          securely stored password credential.
        </li>
        <li>
          Matchmaking profile information, such as your age, gender, height,
          appearance and lifestyle preferences, relationship goals, interests,
          and social-media handles if you choose to provide them.
        </li>
        <li>
          Photos and other content that you upload to your profile.
        </li>
        <li>
          Your communications with us and feedback you share about the service
          or a date.
        </li>
      </ul>
      <p>
        We and our service providers may also receive limited technical
        information when you visit the website, such as your IP address,
        browser type, device information, and activity needed to operate,
        secure, and improve the service.
      </p>

      <h2>How we use information</h2>
      <p>We use personal information to:</p>
      <ul>
        <li>create and manage your account;</li>
        <li>
          understand your preferences and provide matchmaking and date-planning
          services;
        </li>
        <li>communicate with you, including by WhatsApp where you opt in;</li>
        <li>provide support, prevent fraud and misuse, and keep people safe;</li>
        <li>maintain, troubleshoot, and improve our website and services; and</li>
        <li>comply with legal obligations and enforce our Terms of Service.</li>
      </ul>

      <h2>When we share information</h2>
      <p>
        We may share limited, relevant profile information with a potential
        match when needed to facilitate a date. We may also share information
        with providers who help us host the service, store photos, communicate
        with users, or provide support. These providers may use the information
        only to perform services for us.
      </p>
      <p>
        We may disclose information when required by law, to protect the safety
        and rights of Minglee or others, or as part of a business transfer. We
        do not sell your personal information.
      </p>

      <h2>How long we keep information</h2>
      <p>
        We keep personal information only for as long as reasonably needed to
        provide the service, meet legal or safety requirements, resolve
        disputes, and enforce our agreements. When you ask us to delete your
        account, we will delete or de-identify information unless we need to
        retain a limited amount for these purposes.
      </p>

      <h2>Your choices and rights</h2>
      <p>
        You can ask us to access, correct, or delete personal information we
        hold about you. You can also ask us to stop non-essential WhatsApp
        messages. To make a deletion request, follow the <a href="/delete-data">Data Deletion Guide</a>.
      </p>

      <h2>Security</h2>
      <p>
        We use reasonable technical and organisational safeguards designed to
        protect personal information. No online service is completely secure,
        so please use a strong, unique password and let us know promptly if you
        believe your account has been accessed without permission.
      </p>

      <h2>Adults only</h2>
      <p>
        Minglee is intended only for people aged 18 or older. We do not
        knowingly collect personal information from anyone under 18. If you
        believe a minor has provided us personal information, contact us so we
        can remove it.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy from time to time. If we make changes, we
        will post the updated version here and update the date at the top of
        this page.
      </p>

      <h2>Contact us</h2>
      <p>
        For privacy questions or requests, please use our <a href="/delete-data">Data Deletion Guide</a> and tell us that your request concerns privacy.
      </p>
    </LegalPageLayout>
  );
}
