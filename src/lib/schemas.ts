import { z } from "zod";

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

export const donationSchema = z.object({
  campaignSlug: z
    .string()
    .trim()
    .min(3)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Choose a campaign"),
  amount: z.number().int().min(100, "Minimum donation is ₹100").max(10_000_000),
  donorName: z.string().trim().min(2, "Please enter your name").max(120),
  email: z.string().trim().email("Please enter a valid email").max(200),
  phone: z.string().trim().min(8, "Please enter a valid phone number").max(20),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
  anonymous: z.boolean().default(false),
  website: z.string().max(0).optional().or(z.literal("")),
});

export const volunteerSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(8).max(20),
  city: z.string().trim().min(2).max(80),
  stateCountry: z.string().trim().min(2).max(80),
  areasOfInterest: z.array(z.string().trim().min(1).max(80)).min(1, "Select at least one area"),
  availability: z.string().trim().min(2).max(80),
  skills: z.string().trim().max(500).optional().or(z.literal("")),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
  consent: z.literal(true, { error: "Consent is required" }),
  website: z.string().max(0).optional().or(z.literal("")),
});

export const enquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  subject: z.string().trim().min(3).max(160),
  message: z.string().trim().min(10).max(2000),
  website: z.string().max(0).optional().or(z.literal("")),
});

export const verifyPaymentSchema = z.object({
  referenceId: z.string().trim().min(8).max(80),
  razorpayPaymentId: z.string().trim().min(6).max(80),
  razorpayOrderId: z.string().trim().min(6).max(80),
  razorpaySignature: z.string().trim().min(10).max(200),
});

export const sandboxCompleteSchema = z.object({
  referenceId: z.string().trim().min(8).max(80),
});

export const campaignInputSchema = z.object({
  id: z.number().int().optional(),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens"),
  title: z.string().trim().min(3).max(160),
  titleHi: z.string().trim().max(160).optional().or(z.literal("")),
  locationLabel: z.string().trim().min(2).max(80),
  countryCode: z.string().trim().max(8).optional().or(z.literal("")),
  heroImageUrl: z.string().trim().max(500).optional().or(z.literal("")),
  shortDescription: z.string().trim().min(10).max(400),
  shortDescriptionHi: z.string().trim().max(400).optional().or(z.literal("")),
  situationText: z.string().trim().min(10).max(8000),
  situationTextHi: z.string().trim().max(8000).optional().or(z.literal("")),
  missionText: z.string().trim().min(10).max(8000),
  missionTextHi: z.string().trim().max(8000).optional().or(z.literal("")),
  reliefPriorities: z.string().trim().max(4000),
  reliefPrioritiesHi: z.string().trim().max(4000).optional().or(z.literal("")),
  utilisationNotes: z.string().trim().max(4000).optional().or(z.literal("")),
  utilisationNotesHi: z.string().trim().max(4000).optional().or(z.literal("")),
  targetAmount: z.number().int().min(0).max(100_000_000),
  manualAmountRaised: z.number().int().min(0).max(100_000_000),
  manualDonorCount: z.number().int().min(0).max(10_000_000),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
  sortOrder: z.number().int().min(0).max(1000),
});

export const updateInputSchema = z.object({
  id: z.number().int().optional(),
  campaignId: z.number().int(),
  title: z.string().trim().min(3).max(160),
  titleHi: z.string().trim().max(160).optional().or(z.literal("")),
  body: z.string().trim().min(10).max(8000),
  bodyHi: z.string().trim().max(8000).optional().or(z.literal("")),
  published: z.boolean().default(true),
});

export const settingsInputSchema = z.object({
  orgName: z.string().trim().min(3).max(160),
  tagline: z.string().trim().min(3).max(200),
  taglineHi: z.string().trim().max(200).optional().or(z.literal("")),
  aboutText: z.string().trim().max(8000),
  aboutTextHi: z.string().trim().max(8000).optional().or(z.literal("")),
  mission: z.string().trim().max(4000),
  missionHi: z.string().trim().max(4000).optional().or(z.literal("")),
  vision: z.string().trim().max(4000),
  visionHi: z.string().trim().max(4000).optional().or(z.literal("")),
  valuesText: z.string().trim().max(4000),
  valuesTextHi: z.string().trim().max(4000).optional().or(z.literal("")),
  areasOfWork: z.string().trim().max(4000),
  areasOfWorkHi: z.string().trim().max(4000).optional().or(z.literal("")),
  address: z.string().trim().max(500),
  phone: z.string().trim().max(40),
  email: z.string().trim().email().max(200),
  whatsapp: z.string().trim().max(40),
  facebookUrl: z.preprocess(
    emptyToUndefined,
    z.string().trim().url().max(300).optional().or(z.literal("")),
  ),
  instagramUrl: z.preprocess(
    emptyToUndefined,
    z.string().trim().url().max(300).optional().or(z.literal("")),
  ),
  twitterUrl: z.preprocess(
    emptyToUndefined,
    z.string().trim().url().max(300).optional().or(z.literal("")),
  ),
  mapsEmbedUrl: z.string().trim().max(2000).optional().or(z.literal("")),
  registrationCin: z.string().trim().max(80).optional().or(z.literal("")),
  registrationNotes: z.string().trim().max(4000).optional().or(z.literal("")),
  registrationNotesHi: z.string().trim().max(4000).optional().or(z.literal("")),
  howDonationsUsed: z.string().trim().max(8000),
  howDonationsUsedHi: z.string().trim().max(8000).optional().or(z.literal("")),
  paymentInfo: z.string().trim().max(4000),
  paymentInfoHi: z.string().trim().max(4000).optional().or(z.literal("")),
});

export const reportInputSchema = z.object({
  id: z.number().int().optional(),
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  url: z.string().trim().max(500).optional().or(z.literal("")),
  published: z.boolean().default(true),
});

export const teamInputSchema = z.object({
  id: z.number().int().optional(),
  name: z.string().trim().min(2).max(120),
  role: z.string().trim().min(2).max(120),
  roleHi: z.string().trim().max(120).optional().or(z.literal("")),
  bio: z.string().trim().max(2000).optional().or(z.literal("")),
  bioHi: z.string().trim().max(2000).optional().or(z.literal("")),
  photoUrl: z.string().trim().max(500).optional().or(z.literal("")),
  sortOrder: z.number().int().min(0).max(1000),
});

export const faqInputSchema = z.object({
  id: z.number().int().optional(),
  question: z.string().trim().min(6).max(240),
  questionHi: z.string().trim().max(240).optional().or(z.literal("")),
  answer: z.string().trim().min(10).max(4000),
  answerHi: z.string().trim().max(4000).optional().or(z.literal("")),
  sortOrder: z.number().int().min(0).max(1000),
  isPublished: z.boolean(),
});

export const idSchema = z.object({ id: z.number().int() });
export const slugSchema = z.object({ slug: z.string().trim().min(1).max(80) });
export const referenceSchema = z.object({
  referenceId: z.string().trim().min(8).max(80),
});
