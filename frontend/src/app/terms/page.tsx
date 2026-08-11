import type { Metadata } from "next";
import LegalPageLayout from "@/components/legal/LegalPageLayout";
import { APP_CONFIG } from "@/config/app";

export const metadata: Metadata = {
  title: `Terms of Service | ${APP_CONFIG.name}`,
  description: `The terms that apply to use of ${APP_CONFIG.name}.`,
};

const lastUpdated = "August 11, 2026";

export default function TermsPage() {
  return (
    <LegalPageLayout
      eyebrow="The ground rules"
      title="Terms of Service"
      lastUpdated={lastUpdated}
    >
      <p>
        These Terms of Service (“Terms”) govern your use of the {APP_CONFIG.name}
        website and matchmaking services. By creating an account or using the
        service, you agree to these Terms and our <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>Who can use Minglee</h2>
      <p>
        You must be at least 18 years old and legally able to enter into this
        agreement. You must provide accurate account and profile information,
        keep your login details private, and tell us promptly if you suspect
        unauthorised use of your account.
      </p>

      <h2>Our service</h2>
      <p>
        Minglee uses the information you provide to help curate potential
        matches and date plans. A match, date plan, or introduction is not a
        promise of compatibility, a relationship, or any particular outcome.
        We may change, pause, or discontinue parts of the service as it evolves.
      </p>

      <h2>Your profile and content</h2>
      <p>
        You are responsible for the information, photos, and other content you
        submit. You confirm that it is accurate, that you have the right to
        share it, and that its use by Minglee as described in these Terms and
        the Privacy Policy does not infringe anyone else&apos;s rights. You grant
        us a limited right to host, process, and share your content only as
        needed to operate and improve the service.
      </p>

      <h2>Respectful and safe use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>misrepresent your identity, age, relationship status, or intentions;</li>
        <li>harass, threaten, discriminate against, scam, or exploit anyone;</li>
        <li>post unlawful, misleading, sexually explicit, or infringing content;</li>
        <li>use the service for commercial solicitation or unauthorised advertising;</li>
        <li>try to access another person&apos;s account or interfere with the service; or</li>
        <li>use information about another user for any purpose outside a mutually agreed date.</li>
      </ul>
      <p>
        Please use good judgment when meeting someone. Meet in a public place,
        make your own decisions about whether to attend a date, and contact
        local emergency services if you are in immediate danger.
      </p>

      <h2>Communications</h2>
      <p>
        By providing your WhatsApp number and using the service, you agree that
        we may send service-related messages such as account updates, match
        details, and support replies. You can ask us to stop non-essential
        communications at any time, although we may still send messages needed
        to operate or secure your account.
      </p>

      <h2>Suspension or termination</h2>
      <p>
        You may stop using Minglee at any time. We may suspend or close an
        account if we reasonably believe these Terms have been violated, doing
        so is needed to protect people or the service, or required by law. To
        request account and data deletion, use the <a href="/delete-data">Data Deletion Guide</a>.
      </p>

      <h2>Intellectual property</h2>
      <p>
        The Minglee name, website, design, and service materials belong to
        Minglee or its licensors and are protected by applicable laws. These
        Terms give you a personal, limited, non-transferable right to use the
        service for its intended purpose.
      </p>

      <h2>Disclaimers and limits of liability</h2>
      <p>
        To the fullest extent permitted by law, the service is provided “as is”
        and “as available.” We do not guarantee uninterrupted availability,
        the identity or conduct of any user, the safety of a date, or the
        outcome of any introduction. You are responsible for your choices and
        interactions with other people.
      </p>
      <p>
        To the fullest extent permitted by law, Minglee is not liable for
        indirect, incidental, special, consequential, or punitive damages
        arising from your use of the service or interactions with other users.
        Nothing in these Terms limits rights or liabilities that cannot legally
        be limited.
      </p>

      <h2>Changes to these Terms</h2>
      <p>
        We may update these Terms as our service changes. We will post the
        updated Terms here and revise the date at the top. Continuing to use
        Minglee after an update means you accept the revised Terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these Terms can be sent through the contact path in our
        <a href="/delete-data"> Data Deletion Guide</a>.
      </p>
    </LegalPageLayout>
  );
}
