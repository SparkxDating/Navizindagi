import { parseStringList } from "@/lib/utils";
import type {
  Campaign,
  CampaignUpdate,
  Donation,
  Enquiry,
  Faq,
  ReportDoc,
  SiteSettings,
  TeamMember,
  Volunteer,
} from "@/lib/types";

export function num(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function bool(value: unknown) {
  return value === true || value === "t" || value === "true" || value === 1 || value === "1";
}

export function text(value: unknown) {
  return value == null ? "" : String(value);
}

export function ts(value: unknown) {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

export function tsOrNull(value: unknown) {
  if (!value) return null;
  return ts(value);
}

export function mapSettings(row: Record<string, unknown>): SiteSettings {
  return {
    id: num(row.id),
    orgName: text(row.org_name ?? row.orgName),
    tagline: text(row.tagline),
    aboutText: text(row.about_text ?? row.aboutText),
    mission: text(row.mission),
    vision: text(row.vision),
    valuesText: text(row.values_text ?? row.valuesText),
    areasOfWork: text(row.areas_of_work ?? row.areasOfWork),
    address: text(row.address),
    phone: text(row.phone),
    email: text(row.email),
    whatsapp: text(row.whatsapp),
    facebookUrl: text(row.facebook_url ?? row.facebookUrl),
    instagramUrl: text(row.instagram_url ?? row.instagramUrl),
    twitterUrl: text(row.twitter_url ?? row.twitterUrl),
    mapsEmbedUrl: text(row.maps_embed_url ?? row.mapsEmbedUrl),
    registrationCin: text(row.registration_cin ?? row.registrationCin),
    registrationNotes: text(row.registration_notes ?? row.registrationNotes),
    howDonationsUsed: text(row.how_donations_used ?? row.howDonationsUsed),
    paymentInfo: text(row.payment_info ?? row.paymentInfo),
    updatedAt: ts(row.updated_at ?? row.updatedAt),
  };
}

export function mapCampaign(row: Record<string, unknown>): Campaign {
  return {
    id: num(row.id),
    slug: text(row.slug),
    title: text(row.title),
    locationLabel: text(row.location_label ?? row.locationLabel),
    countryCode: text(row.country_code ?? row.countryCode),
    heroImageUrl: text(row.hero_image_url ?? row.heroImageUrl),
    shortDescription: text(row.short_description ?? row.shortDescription),
    situationText: text(row.situation_text ?? row.situationText),
    missionText: text(row.mission_text ?? row.missionText),
    reliefPriorities: parseStringList(text(row.relief_priorities ?? row.reliefPriorities)),
    utilisationNotes: text(row.utilisation_notes ?? row.utilisationNotes),
    targetAmount: num(row.target_amount ?? row.targetAmount),
    manualAmountRaised: num(row.manual_amount_raised ?? row.manualAmountRaised),
    manualDonorCount: num(row.manual_donor_count ?? row.manualDonorCount),
    amountRaised: num(row.amount_raised ?? row.amountRaised),
    donorCount: num(row.donor_count ?? row.donorCount),
    isFeatured: bool(row.is_featured ?? row.isFeatured),
    isActive: bool(row.is_active ?? row.isActive),
    sortOrder: num(row.sort_order ?? row.sortOrder),
    createdAt: ts(row.created_at ?? row.createdAt),
    updatedAt: ts(row.updated_at ?? row.updatedAt),
  };
}

export function mapUpdate(row: Record<string, unknown>): CampaignUpdate {
  return {
    id: num(row.id),
    campaignId: num(row.campaign_id ?? row.campaignId),
    title: text(row.title),
    body: text(row.body),
    publishedAt: tsOrNull(row.published_at ?? row.publishedAt),
    createdAt: ts(row.created_at ?? row.createdAt),
  };
}

export function mapDonation(row: Record<string, unknown>): Donation {
  const status = text(row.status);
  return {
    id: num(row.id),
    campaignId: num(row.campaign_id ?? row.campaignId),
    campaignTitle: text(row.campaign_title ?? row.campaignTitle),
    campaignSlug: text(row.campaign_slug ?? row.campaignSlug),
    donorName: text(row.donor_name ?? row.donorName),
    email: text(row.email),
    phone: text(row.phone),
    amount: num(row.amount),
    currency: text(row.currency) || "INR",
    message: text(row.message),
    isAnonymous: bool(row.is_anonymous ?? row.isAnonymous),
    status:
      status === "completed" || status === "failed" || status === "sandbox"
        ? status
        : "pending",
    paymentProvider: text(row.payment_provider ?? row.paymentProvider),
    paymentOrderId: text(row.payment_order_id ?? row.paymentOrderId),
    paymentId: text(row.payment_id ?? row.paymentId),
    referenceId: text(row.reference_id ?? row.referenceId),
    createdAt: ts(row.created_at ?? row.createdAt),
  };
}

export function mapVolunteer(row: Record<string, unknown>): Volunteer {
  return {
    id: num(row.id),
    fullName: text(row.full_name ?? row.fullName),
    email: text(row.email),
    phone: text(row.phone),
    city: text(row.city),
    stateCountry: text(row.state_country ?? row.stateCountry),
    areasOfInterest: parseStringList(text(row.areas_of_interest ?? row.areasOfInterest)),
    availability: text(row.availability),
    skills: text(row.skills),
    message: text(row.message),
    createdAt: ts(row.created_at ?? row.createdAt),
  };
}

export function mapEnquiry(row: Record<string, unknown>): Enquiry {
  return {
    id: num(row.id),
    name: text(row.name),
    email: text(row.email),
    phone: text(row.phone),
    subject: text(row.subject),
    message: text(row.message),
    createdAt: ts(row.created_at ?? row.createdAt),
  };
}

export function mapReport(row: Record<string, unknown>): ReportDoc {
  return {
    id: num(row.id),
    title: text(row.title),
    description: text(row.description),
    url: text(row.url),
    publishedAt: tsOrNull(row.published_at ?? row.publishedAt),
  };
}

export function mapTeam(row: Record<string, unknown>): TeamMember {
  return {
    id: num(row.id),
    name: text(row.name),
    role: text(row.role) || "To be updated",
    bio: text(row.bio) || "To be updated",
    photoUrl: text(row.photo_url ?? row.photoUrl),
    sortOrder: num(row.sort_order ?? row.sortOrder),
  };
}

export function mapFaq(row: Record<string, unknown>): Faq {
  return {
    id: num(row.id),
    question: text(row.question),
    answer: text(row.answer),
    sortOrder: num(row.sort_order ?? row.sortOrder),
    isPublished: bool(row.is_published ?? row.isPublished),
  };
}

export const CAMPAIGN_SELECT = `
  c.id, c.slug, c.title, c.location_label, c.country_code, c.hero_image_url,
  c.short_description, c.situation_text, c.mission_text, c.relief_priorities,
  c.utilisation_notes, c.target_amount, c.manual_amount_raised, c.manual_donor_count,
  c.is_featured, c.is_active, c.sort_order, c.created_at, c.updated_at,
  (c.manual_amount_raised + coalesce((
    select sum(d.amount) from donations d
    where d.campaign_id = c.id and d.status = 'completed'
  ), 0))::int as amount_raised,
  (c.manual_donor_count + coalesce((
    select count(*) from donations d
    where d.campaign_id = c.id and d.status = 'completed'
  ), 0))::int as donor_count
`;
