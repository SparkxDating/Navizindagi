import { Link, createFileRoute } from "@tanstack/react-router";
import {
  GraduationCap,
  HandHelping,
  HeartHandshake,
  ShieldCheck,
  Soup,
  Users,
  Waves,
} from "lucide-react";
import { CampaignCard } from "@/components/campaign-card";
import { CtaBand } from "@/components/cta-band";
import { ImpactCard } from "@/components/impact-card";
import { Section } from "@/components/section";
import { TrustBar } from "@/components/trust-bar";
import { UpdateCard } from "@/components/update-card";
import { Button } from "@/components/ui/button";
import {
  ACTIVITY_PREVIEWS,
  APP_DESCRIPTION,
  APP_TITLE,
  SITE_URL,
  SUPPORT_STEPS,
  WHY_JOIN_POINTS,
  WORK_AREAS,
  displayTagline,
} from "@/lib/site";
import { getPublicSite } from "@/lib/server/site";
import type { ReactNode } from "react";

export const Route = createFileRoute("/")({
  loader: () => getPublicSite(),
  component: HomePage,
  head: () => ({
    meta: [
      { title: APP_TITLE },
      { name: "description", content: APP_DESCRIPTION },
      { property: "og:title", content: APP_TITLE },
      { property: "og:description", content: APP_DESCRIPTION },
      { property: "og:image", content: `${SITE_URL}/og.jpg` },
    ],
    links: [{ rel: "canonical", href: SITE_URL }],
  }),
});

const WORK_ICONS: Record<string, ReactNode> = {
  disaster: <Waves className="size-8" aria-hidden />,
  "gau-seva": <HeartHandshake className="size-8" aria-hidden />,
  education: <GraduationCap className="size-8" aria-hidden />,
  food: <Soup className="size-8" aria-hidden />,
  community: <Users className="size-8" aria-hidden />,
  humanitarian: <HandHelping className="size-8" aria-hidden />,
};

function HomePage() {
  const { settings, campaigns, updates } = Route.useLoaderData();
  const nepal = campaigns.find((campaign) => campaign.slug === "nepal-flood-relief");
  const assam = campaigns.find((campaign) => campaign.slug === "assam-flood-relief");
  const liveCampaigns = [nepal, assam].filter((campaign): campaign is NonNullable<typeof campaign> => Boolean(campaign));
  const verifiedImpact = liveCampaigns.some((campaign) => campaign.amountRaised > 0 || campaign.donorCount > 0);

  return (
    <>
      <section className="relative overflow-hidden bg-navy">
        <img
          src="/hero-banner.jpg"
          alt=""
          width={1600}
          height={900}
          fetchPriority="high"
          className="absolute inset-0 size-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-navy/70" />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-24 lg:py-28">
          <div className="reveal max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-soft">
              {displayTagline(settings.tagline)}
            </p>
            <h1 className="mt-4 font-display text-cream">
              सेवा, सहयोग और संवेदना के साथ एक बेहतर ज़िंदगी की ओर
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-cream/90 sm:text-lg">
              Navi Zindagi Foundation जरूरतमंद लोगों, बच्चों, समुदायों और गौवंश के लिए राहत, शिक्षा,
              भोजन और सामाजिक कल्याण से जुड़े कार्यों को आगे बढ़ाने के लिए प्रतिबद्ध है।
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="min-h-12">
                <Link to="/donate" search={{ campaign: undefined }}>
                  Donate Now
                </Link>
              </Button>
              <Button asChild size="lg" variant="cream" className="min-h-12">
                <Link to="/volunteer">Volunteer With Us</Link>
              </Button>
            </div>
            <p className="mt-5 text-sm text-cream/75">
              Registered Indian NGO
              {settings.registrationCin ? ` · CIN ${settings.registrationCin}` : ""}. Donations are
              marked successful only after payment verification.
            </p>
          </div>
        </div>
      </section>

      <TrustBar settings={settings} />

      <Section
        id="about-foundation"
        eyebrow="Who we are"
        title="नवी ज़िंदगी फाउंडेशन के बारे में"
        lead="Navi Zindagi Foundation community participation और सामाजिक पहलों के माध्यम से मानवीय सहयोग, शिक्षा, भोजन सहायता, पशु कल्याण और आपदा राहत पर केंद्रित कार्य करती है।"
      >
        <div className="mx-auto max-w-3xl rounded-2xl bg-card p-6 text-center shadow-card sm:p-8">
          <p className="text-base leading-relaxed text-muted-foreground">
            {settings.aboutText}
          </p>
          <Button asChild className="mt-6">
            <Link to="/about">Know More About Us</Link>
          </Button>
        </div>
      </Section>

      <Section
        id="our-work"
        tone="cream"
        eyebrow="Our work"
        title="हम किन क्षेत्रों में काम करते हैं"
        lead="ये सेवा क्षेत्र संगठन की दिशा दिखाते हैं। आंकड़े और फ़ील्ड रिपोर्ट तभी प्रकाशित होते हैं जब वे सत्यापित हों।"
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {WORK_AREAS.map((area) => (
            <ImpactCard
              key={area.key}
              title={area.title}
              body={area.body}
              image={"image" in area ? area.image : undefined}
              icon={WORK_ICONS[area.key]}
              href="/about"
              hrefLabel="Learn More"
            />
          ))}
        </div>
      </Section>

      <Section
        id="campaigns"
        eyebrow="Campaigns"
        title="हमारे अभियान"
        lead="Live donation campaigns below use published fundraising data only. Other service themes are shown as activities, not as unverified donation drives."
      >
        {liveCampaigns.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {liveCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">Campaign pages: Updates coming soon.</p>
        )}
        <h3 className="mt-12 text-center font-display text-2xl text-navy">Our Activities</h3>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-muted-foreground">
          These activities describe areas of work. They are not live fundraising campaigns until a
          campaign page is published.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {WORK_AREAS.filter((area) => ["gau-seva", "education", "food"].includes(area.key)).map((area) => (
            <article
              key={area.key}
              className="flex h-full flex-col rounded-2xl bg-card p-6 shadow-card transition-shadow duration-200 motion-safe:hover:shadow-card-hover"
            >
              <div className="text-teal">{WORK_ICONS[area.key]}</div>
              <h3 className="mt-3 font-display text-xl text-navy">{area.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{area.body}</p>
              <Button asChild variant="outline" className="mt-5">
                <Link to="/about">Learn More</Link>
              </Button>
            </article>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button asChild variant="outline">
            <Link to="/campaigns">View Campaigns</Link>
          </Button>
        </div>
      </Section>

      <Section
        id="how-support-helps"
        tone="cream"
        eyebrow="Support"
        title="आपका सहयोग कैसे मदद करता है"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SUPPORT_STEPS.map((item) => (
            <article key={item.step} className="rounded-2xl bg-card p-6 shadow-card">
              <p className="font-display text-3xl text-teal">{item.step}</p>
              <h3 className="mt-3 font-display text-xl text-navy">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section
        id="impact-glimpse"
        eyebrow="Impact"
        title="हमारे कार्यों की झलक"
        lead={
          verifiedImpact
            ? "Published campaign figures appear only where the Foundation has recorded them."
            : "हमारे सेवा कार्यों की जानकारी और अपडेट्स जल्द यहां साझा किए जाएंगे।"
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {ACTIVITY_PREVIEWS.map((item) => (
            <article key={item.key} className="overflow-hidden rounded-2xl bg-card shadow-card">
              {"image" in item && item.image ? (
                <img src={item.image} alt="" className="aspect-[4/3] w-full object-cover" loading="lazy" />
              ) : (
                <div className="grid aspect-[4/3] place-items-center bg-teal-soft text-sm font-semibold text-teal-dark">
                  {item.title}
                </div>
              )}
              <h3 className="p-4 font-display text-lg text-navy">{item.title}</h3>
            </article>
          ))}
        </div>
        {updates.length > 0 ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {updates.slice(0, 2).map((update) => (
              <UpdateCard key={update.id} update={update} />
            ))}
          </div>
        ) : null}
      </Section>

      <Section
        id="why-join"
        tone="cream"
        eyebrow="Trust"
        title="हमारे साथ क्यों जुड़ें?"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_JOIN_POINTS.map((point) => (
            <article key={point} className="rounded-2xl bg-card p-6 shadow-card">
              <ShieldCheck className="size-5 text-teal" aria-hidden />
              <h3 className="mt-3 font-display text-lg text-navy">{point}</h3>
            </article>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button asChild variant="outline">
            <Link to="/transparency">View Transparency</Link>
          </Button>
        </div>
      </Section>

      <Section id="activity-gallery" title="हमारी गतिविधियों की झलक">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <img src="/campaign-assam.jpg" alt="" className="aspect-[16/10] w-full rounded-2xl object-cover shadow-card" loading="lazy" />
          <img src="/relief-water.jpg" alt="" className="aspect-[16/10] w-full rounded-2xl object-cover shadow-card" loading="lazy" />
          <img src="/relief-shelter.jpg" alt="" className="aspect-[16/10] w-full rounded-2xl object-cover shadow-card" loading="lazy" />
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Category visuals from existing site assets. They are not presented as photographs of a
          specific field event.
        </p>
      </Section>

      <Section id="volunteer-cta" tone="navy">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl text-cream sm:text-4xl">आप भी सेवा से जुड़ सकते हैं</h2>
          <p className="mt-4 text-base leading-relaxed text-cream/80">
            अपने समय, कौशल या सहयोग के माध्यम से Navi Zindagi Foundation की गतिविधियों से जुड़ें।
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="cream">
              <Link to="/volunteer">
                <Users className="size-4" />
                Become a Volunteer
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-cream/30 bg-transparent text-cream hover:bg-navy-mid">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </Section>

      <CtaBand
        title="आपका छोटा सा सहयोग किसी की ज़िंदगी में बड़ा बदलाव ला सकता है।"
        actions={
          <>
            <Button asChild size="lg">
              <Link to="/donate" search={{ campaign: undefined }}>
                Donate Now
              </Link>
            </Button>
            <Button asChild size="lg" variant="cream">
              <Link to="/campaigns">View Campaigns</Link>
            </Button>
          </>
        }
      />
    </>
  );
}
