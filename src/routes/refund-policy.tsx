import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/refund-policy")({
  component: RefundPage,
  head: () => ({ meta: [{ title: "Donation & Refund Policy · Navi Zindagi Foundation" }] }),
});

function RefundPage() {
  return (
    <LegalPage title="Donation and Refund Policy" updated="1 September 2026">
      <p>
        Donations made through this website are intended as voluntary contributions toward flood
        relief and related Foundation work described on the campaign you select.
      </p>
      <p>
        A donation is treated as received only after the payment gateway confirms it and this
        website verifies that confirmation on the server. Incomplete, cancelled or unverified
        checkouts are not successful donations.
      </p>
      <p>
        If you were charged in error, or a duplicate payment was taken, contact the Foundation with
        your reference ID. Refunds, where appropriate, are processed back through the original
        payment method subject to the gateway and bank timelines.
      </p>
      <p>
        Tax-exemption benefits apply only if the Foundation has published the relevant certificates.
        Until then, treat deductibility as “To be updated”.
      </p>
      <p>Sandbox or test-mode acknowledgements are not live payments and are not refundable as money was not collected.</p>
    </LegalPage>
  );
}
