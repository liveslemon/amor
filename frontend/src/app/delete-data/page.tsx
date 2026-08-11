import type { Metadata } from "next";
import LegalPageLayout from "@/components/legal/LegalPageLayout";
import { APP_CONFIG } from "@/config/app";

export const metadata: Metadata = {
  title: `Delete Your Data | ${APP_CONFIG.name}`,
  description: `How to request deletion of your ${APP_CONFIG.name} account and personal data.`,
};

const lastUpdated = "August 11, 2026";
const deletionMessage = encodeURIComponent(
  "Hello Minglee, I would like to request deletion of my account and personal data. My account WhatsApp number is: [enter your number].",
);
const whatsappNumber = APP_CONFIG.whatsappNumber.replace(/\D/g, "");
const deletionRequestUrl = `https://wa.me/${whatsappNumber}?text=${deletionMessage}`;

export default function DeleteDataPage() {
  return (
    <LegalPageLayout
      eyebrow="You&apos;re in control"
      title="Data Deletion Guide"
      lastUpdated={lastUpdated}
    >
      <p>
        You can ask us to delete your Minglee account and personal data at any
        time. This guide explains what to send, how we verify the request, and
        what happens next.
      </p>

      <div className="my-10 rounded-2xl border border-[#ffb6c1]/25 bg-[#ffb6c1]/10 p-6 md:p-8">
        <p className="m-0 text-lg leading-7 text-white">
          Ready to request deletion? Send us a WhatsApp message from the number
          connected to your account.
        </p>
        <a
          href={deletionRequestUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#0a0f1a] transition-transform hover:scale-[1.02]"
        >
          Request data deletion on WhatsApp ↗
        </a>
      </div>

      <h2>How to make a request</h2>
      <ol>
        <li>
          Select <strong>Request data deletion on WhatsApp</strong> above, or
          message us at {APP_CONFIG.whatsappNumber}.
        </li>
        <li>
          Send: “I would like to delete my Minglee account and personal data.”
        </li>
        <li>
          Include the WhatsApp number associated with your account if you are
          contacting us from a different number.
        </li>
        <li>
          We will verify that you own the account before completing the request.
        </li>
      </ol>

      <h2>What deletion includes</h2>
      <p>
        Once your request is verified and completed, we will close your account
        and remove or de-identify the personal data connected to it, including
        your profile, matchmaking preferences, uploaded photos, and account
        contact details, subject to the limited exceptions below.
      </p>

      <h2>What may be retained</h2>
      <p>
        We may retain a minimal amount of information where necessary to meet
        legal, safety, fraud-prevention, or record-keeping obligations. Copies
        in secure backups may remain until those backups are routinely replaced,
        and information that has been irreversibly aggregated or de-identified
        may no longer be linked to you.
      </p>

      <h2>Before you delete</h2>
      <p>
        Deletion permanently ends access to your Minglee account and may not be
        reversible. If you need information from your account, ask for a copy
        before requesting deletion. You may also ask us to correct information
        or delete only specific photos instead of closing your account.
      </p>

      <h2>Other privacy requests</h2>
      <p>
        You can use the same WhatsApp contact to request access to, correction
        of, or deletion of specific personal information. For your protection,
        do not send passwords, payment information, or other unnecessary
        sensitive details in your message.
      </p>

      <p>
        For more information about how we handle personal information, see our
        <a href="/privacy"> Privacy Policy</a>.
      </p>
    </LegalPageLayout>
  );
}
