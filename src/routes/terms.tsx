import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({ meta: [{ title: "Terms of Use · Navi Zindagi Foundation" }] }),
});

function TermsPage() {
  return (
    <LegalPage title="Terms of Use" updated="1 September 2026">
      <p>
        This website is operated by Navi Zindagi Foundation to share information, receive donations
        and register volunteers for flood-relief support. Content is provided in good faith and is
        updated as information is confirmed.
      </p>
      <p>
        You agree not to submit false details, attempt to interfere with payment processing, or use
        automated tools to overload the forms. Donations are voluntary gifts, not purchases of goods
        or services.
      </p>
      <p>
        Campaign pages describe intended use of funds. They do not constitute a claim that the
        Foundation is physically present in every named location unless an official update says so.
      </p>
      <p>
        The Foundation may refuse or return a donation where required by law or where payment
        verification fails. Admin access is restricted to authorised accounts.
      </p>
    </LegalPage>
  );
}
