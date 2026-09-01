export type SiteSettings = {
  id: number;
  orgName: string;
  tagline: string;
  aboutText: string;
  mission: string;
  vision: string;
  valuesText: string;
  areasOfWork: string;
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
  howDonationsUsed: string;
  paymentInfo: string;
  updatedAt: string;
};

export type Campaign = {
  id: number;
  slug: string;
  title: string;
  locationLabel: string;
  countryCode: string;
  heroImageUrl: string;
  shortDescription: string;
  situationText: string;
  missionText: string;
  reliefPriorities: string[];
  utilisationNotes: string;
  targetAmount: number;
  manualAmountRaised: number;
  manualDonorCount: number;
  amountRaised: number;
  donorCount: number;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CampaignUpdate = {
  id: number;
  campaignId: number;
  title: string;
  body: string;
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
  bio: string;
  photoUrl: string;
  sortOrder: number;
};

export type Faq = {
  id: number;
  question: string;
  answer: string;
  sortOrder: number;
  isPublished: boolean;
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
