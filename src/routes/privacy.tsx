import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({ meta: [{ title: "Privacy Policy · Navi Zindagi Foundation" }] }),
});

function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="1 September 2026">
      <p>
        Navi Zindagi Foundation collects only the information needed to process donations, volunteer
        registrations and enquiries. That typically includes name, email, phone, city and any message
        you choose to send.
      </p>
      <p>
        Payment card and UPI credentials are collected by the payment gateway, not by this website.
        We store a donation reference, amount, campaign and gateway identifiers after verification.
      </p>
      <p>
        We do not sell personal information. Access to donor, volunteer and enquiry records is
        limited to authorised administrators. You may request correction or deletion of your records
        by contacting the Foundation using the published email address, subject to legal retention
        duties for donation acknowledgements.
      </p>
      <p>
        This site uses only cookies and session storage required for authentication and preview
        hosting. It does not run advertising trackers.
      </p>
      <p>This policy will be updated if data practices change. Treat unpublished specifics as still to be confirmed.</p>
    </LegalPage>
  );
}
