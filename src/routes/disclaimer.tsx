import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/disclaimer")({
  component: DisclaimerPage,
  head: () => ({ meta: [{ title: "Disclaimer · Navi Zindagi Foundation" }] }),
});

function DisclaimerPage() {
  return (
    <LegalPage title="Disclaimer" updated="1 September 2026">
      <p>
        Situation descriptions on this website summarise publicly discussed flood-relief needs. They
        are not a substitute for official government or humanitarian situation reports, and they are
        not a claim of exclusive field operations by Navi Zindagi Foundation.
      </p>
      <p>
        Fundraising totals display verified completed payments plus any amounts the Foundation
        chooses to publish. They do not include pending or sandbox transactions. Where a target or
        impact figure has not been set, the site shows “Updates coming soon” or “To be updated”
        instead of an invented number.
      </p>
      <p>
        External links, maps and payment checkouts are provided by third parties. Their terms apply
        once you leave this site or open the gateway window.
      </p>
      <p>
        Nothing on this website is legal, tax or investment advice. For the latest operational
        facts, rely on published updates and documents in the Transparency section.
      </p>
    </LegalPage>
  );
}
