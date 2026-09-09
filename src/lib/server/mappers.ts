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
    taglineHi: text(row.tagline_hi ?? row.taglineHi),
    aboutText: text(row.about_text ?? row.aboutText),
    aboutTextHi: text(row.about_text_hi ?? row.aboutTextHi),
    mission: text(row.mission),
    missionHi: text(row.mission_hi ?? row.missionHi),
    vision: text(row.vision),
    visionHi: text(row.vision_hi ?? row.visionHi),
    valuesText: text(row.values_text ?? row.valuesText),
    valuesTextHi: text(row.values_text_hi ?? row.valuesTextHi),
    areasOfWork: text(row.areas_of_work ?? row.areasOfWork),
    areasOfWorkHi: text(row.areas_of_work_hi ?? row.areasOfWorkHi),
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
    registrationNotesHi: text(row.registration_notes_hi ?? row.registrationNotesHi),
    howDonationsUsed: text(row.how_donations_used ?? row.howDonationsUsed),
    howDonationsUsedHi: text(row.how_donations_used_hi ?? row.howDonationsUsedHi),
    paymentInfo: text(row.payment_info ?? row.paymentInfo),
    paymentInfoHi: text(row.payment_info_hi ?? row.paymentInfoHi),
    updatedAt: ts(row.updated_at ?? row.updatedAt),
  };
}

export function mapCampaign(row: Record<string, unknown>): Campaign {
  return {
    id: num(row.id),
    slug: text(row.slug),
    title: text(row.title),
    titleHi: text(row.title_hi ?? row.titleHi),
    locationLabel: text(row.location_label ?? row.locationLabel),
    countryCode: text(row.country_code ?? row.countryCode),
    heroImageUrl: text(row.hero_image_url ?? row.heroImageUrl),
    shortDescription: text(row.short_description ?? row.shortDescription),
    shortDescriptionHi: text(row.short_description_hi ?? row.shortDescriptionHi),
    situationText: text(row.situation_text ?? row.situationText),
    situationTextHi: text(row.situation_text_hi ?? row.situationTextHi),
    missionText: text(row.mission_text ?? row.missionText),
    missionTextHi: text(row.mission_text_hi ?? row.missionTextHi),
    reliefPriorities: parseStringList(text(row.relief_priorities ?? row.reliefPriorities)),
    reliefPrioritiesHi: parseStringList(text(row.relief_priorities_hi ?? row.reliefPrioritiesHi)),
    utilisationNotes: text(row.utilisation_notes ?? row.utilisationNotes),
    utilisationNotesHi: text(row.utilisation_notes_hi ?? row.utilisationNotesHi),
    targetAmount: num(row.target_amount ?? row.targetAmount),
    manualAmountRaised: num(row.manual_amount_raised ?? row.manualAmountRaised),
    manualDonorCount: num(row.manual_donor_count ?? row.manualDonorCount),
    amountRaised: num(row.amount_raised ?? row.amountRaised),
    donorCount: num(row.donor_count ?? row.donorCount),
    isFeatured: bool(row.is_featured ?? row.isFeatured),
    isActive: bool(row.is_active ?? row.isActive),
    sortOrder: num(row.sort_order ?? row.sortOrder),
    organizationId: num(row.organization_id ?? row.organizationId),
    createdBy: text(row.created_by ?? row.createdBy),
    status: campaignStatus(row.status, bool(row.is_active ?? row.isActive)),
    category: text(row.category),
    startAt: tsOrNull(row.start_at ?? row.startAt),
    endAt: tsOrNull(row.end_at ?? row.endAt),
    beneficiaryName: text(row.beneficiary_name ?? row.beneficiaryName),
    videoUrl: text(row.video_url ?? row.videoUrl),
    allowFundraisers: bool(row.allow_fundraisers ?? row.allowFundraisers),
    allowRecurring: bool(row.allow_recurring ?? row.allowRecurring),
    createdAt: ts(row.created_at ?? row.createdAt),
    updatedAt: ts(row.updated_at ?? row.updatedAt),
  };
}

function campaignStatus(value: unknown, isActive: boolean): Campaign["status"] {
  const status = text(value);
  if (
    status === "draft" ||
    status === "pending_review" ||
    status === "active" ||
    status === "paused" ||
    status === "completed" ||
    status === "rejected"
  ) {
    return status;
  }
  return isActive ? "active" : "paused";
}

export function mapUpdate(row: Record<string, unknown>): CampaignUpdate {
  return {
    id: num(row.id),
    campaignId: num(row.campaign_id ?? row.campaignId),
    campaignTitle: text(row.campaign_title ?? row.campaignTitle) || undefined,
    campaignTitleHi: text(row.campaign_title_hi ?? row.campaignTitleHi) || undefined,
    campaignSlug: text(row.campaign_slug ?? row.campaignSlug) || undefined,
    title: text(row.title),
    titleHi: text(row.title_hi ?? row.titleHi),
    body: text(row.body),
    bodyHi: text(row.body_hi ?? row.bodyHi),
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
    fundraiserId: row.fundraiser_id == null && row.fundraiserId == null ? null : num(row.fundraiser_id ?? row.fundraiserId),
    referralLinkId:
      row.referral_link_id == null && row.referralLinkId == null ? null : num(row.referral_link_id ?? row.referralLinkId),
    utmSource: text(row.utm_source ?? row.utmSource),
    utmMedium: text(row.utm_medium ?? row.utmMedium),
    utmCampaign: text(row.utm_campaign ?? row.utmCampaign),
    utmContent: text(row.utm_content ?? row.utmContent),
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
    roleHi: text(row.role_hi ?? row.roleHi),
    bio: text(row.bio) || "To be updated",
    bioHi: text(row.bio_hi ?? row.bioHi),
    photoUrl: text(row.photo_url ?? row.photoUrl),
    sortOrder: num(row.sort_order ?? row.sortOrder),
  };
}

export function mapFaq(row: Record<string, unknown>): Faq {
  return {
    id: num(row.id),
    question: text(row.question),
    questionHi: text(row.question_hi ?? row.questionHi),
    answer: text(row.answer),
    answerHi: text(row.answer_hi ?? row.answerHi),
    sortOrder: num(row.sort_order ?? row.sortOrder),
    isPublished: bool(row.is_published ?? row.isPublished),
  };
}

export const CAMPAIGN_SELECT = `
  c.id, c.slug, c.title, c.title_hi, c.location_label, c.country_code, c.hero_image_url,
  c.short_description, c.short_description_hi, c.situation_text, c.situation_text_hi,
  c.mission_text, c.mission_text_hi, c.relief_priorities, c.relief_priorities_hi,
  c.utilisation_notes, c.utilisation_notes_hi, c.target_amount, c.manual_amount_raised, c.manual_donor_count,
  c.is_featured, c.is_active, c.sort_order, c.organization_id, c.created_by, c.status,
  c.category, c.start_at, c.end_at, c.beneficiary_name, c.video_url,
  c.allow_fundraisers, c.allow_recurring, c.created_at, c.updated_at,
  coalesce((
    select sum(d.amount) from donations d
    where d.campaign_id = c.id and d.status = 'completed'
  ), 0)::int as amount_raised,
  coalesce((
    select count(*) from donations d
    where d.campaign_id = c.id and d.status = 'completed'
  ), 0)::int as donor_count
`;
