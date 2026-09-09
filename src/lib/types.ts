export type SiteSettings = {
  id: number;
  orgName: string;
  tagline: string;
  taglineHi: string;
  aboutText: string;
  aboutTextHi: string;
  mission: string;
  missionHi: string;
  vision: string;
  visionHi: string;
  valuesText: string;
  valuesTextHi: string;
  areasOfWork: string;
  areasOfWorkHi: string;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  mapsEmbedUrl: string;
  registrationCin: string;
  registrationNotes: string;
  registrationNotesHi: string;
  howDonationsUsed: string;
  howDonationsUsedHi: string;
  paymentInfo: string;
  paymentInfoHi: string;
  updatedAt: string;
};

export type CampaignStatus =
  | "draft"
  | "pending_review"
  | "active"
  | "paused"
  | "completed"
  | "rejected";

export type Campaign = {
  id: number;
  slug: string;
  title: string;
  titleHi: string;
  locationLabel: string;
  countryCode: string;
  heroImageUrl: string;
  shortDescription: string;
  shortDescriptionHi: string;
  situationText: string;
  situationTextHi: string;
  missionText: string;
  missionTextHi: string;
  reliefPriorities: string[];
  reliefPrioritiesHi: string[];
  utilisationNotes: string;
  utilisationNotesHi: string;
  targetAmount: number;
  manualAmountRaised: number;
  manualDonorCount: number;
  amountRaised: number;
  donorCount: number;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  organizationId: number;
  createdBy: string;
  status: CampaignStatus;
  category: string;
  startAt: string | null;
  endAt: string | null;
  beneficiaryName: string;
  videoUrl: string;
  allowFundraisers: boolean;
  allowRecurring: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CampaignUpdate = {
  id: number;
  campaignId: number;
  campaignTitle?: string;
  campaignTitleHi?: string;
  campaignSlug?: string;
  title: string;
  titleHi: string;
  body: string;
  bodyHi: string;
  publishedAt: string | null;
  createdAt: string;
};

export type Donation = {
  id: number;
  campaignId: number;
  campaignTitle: string;
  campaignSlug: string;
  donorName: string;
  email: string;
  phone: string;
  amount: number;
  currency: string;
  message: string;
  isAnonymous: boolean;
  status: "pending" | "completed" | "failed" | "sandbox";
  paymentProvider: string;
  paymentOrderId: string;
  paymentId: string;
  referenceId: string;
  fundraiserId: number | null;
  referralLinkId: number | null;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  createdAt: string;
};

export type Volunteer = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  stateCountry: string;
  areasOfInterest: string[];
  availability: string;
  skills: string;
  message: string;
  createdAt: string;
};

export type Enquiry = {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
};

export type Faq = {
  id: number;
  question: string;
  questionHi: string;
  answer: string;
  answerHi: string;
  sortOrder: number;
  isPublished: boolean;
};

export type ReportDoc = {
  id: number;
  title: string;
  description: string;
  url: string;
  publishedAt: string | null;
};

export type TeamMember = {
  id: number;
  name: string;
  role: string;
  roleHi: string;
  bio: string;
  bioHi: string;
  photoUrl: string;
  sortOrder: number;
};

export type PaymentConfig = {
  mode: "sandbox" | "razorpay";
  publicKey: string | null;
};

export type DashboardStats = {
  donationTotal: number;
  completedDonationCount: number;
  sandboxDonationCount: number;
  pendingDonationCount: number;
  volunteerCount: number;
  enquiryCount: number;
  campaignCount: number;
  campaigns: Array<{
    id: number;
    title: string;
    amountRaised: number;
    targetAmount: number;
    donorCount: number;
  }>;
};
