export const APP_NAME = "Navi Zindagi Foundation";
export const APP_TAGLINE = "Empower. Elevate. Transform.";
export const APP_TITLE = "Navi Zindagi Foundation | Flood Relief & Donations";
export const APP_DESCRIPTION =
  "Navi Zindagi Foundation supports verified flood-relief efforts in Nepal and Assam through donations, volunteers and transparent relief updates.";
export const SITE_URL = "https://navizindagi.org";

export const PRESET_AMOUNTS = [500, 1000, 2500, 5000] as const;

export const INTEREST_AREAS = [
  "Fundraising and donor outreach",
  "Relief logistics",
  "Medical and first-aid support",
  "Community coordination",
  "Communications and translation",
  "Remote administration",
] as const;

export const AVAILABILITY_OPTIONS = [
  "Weekdays",
  "Weekends",
  "Evenings only",
  "On-call / emergency",
  "A few hours a week",
  "Full-time for a limited period",
] as const;

export const RELIEF_CATEGORIES = [
  {
    key: "food",
    title: "Food",
    image: "/relief-food.jpg",
    body: "Nutritious meals and dry-ration kits for families whose kitchens and markets have been disrupted by floodwater.",
  },
  {
    key: "water",
    title: "Clean water",
    image: "/relief-water.jpg",
    body: "Safe drinking water, purification and storage so households are not forced to rely on contaminated sources.",
  },
  {
    key: "hygiene",
    title: "Hygiene supplies",
    image: "/relief-hygiene.jpg",
    body: "Soap, sanitary items, disinfectant and dignity kits that reduce disease risk in crowded or damaged shelters.",
  },
  {
    key: "medical",
    title: "Medical support",
    image: "/relief-medical.jpg",
    body: "First-aid materials and support toward urgent care where flooding has cut off routine health access.",
  },
  {
    key: "shelter",
    title: "Temporary shelter",
    image: "/relief-shelter.jpg",
    body: "Tarpaulins, bedding and emergency cover for families whose homes are inundated or unsafe.",
  },
  {
    key: "essentials",
    title: "Essential supplies",
    image: "/relief-hygiene.jpg",
    body: "Household basics — clothing, utensils, lighting — so displaced families can manage day-to-day needs.",
  },
] as const;

export const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/campaigns", label: "Campaigns" },
  { to: "/transparency", label: "Transparency" },
  { to: "/volunteer", label: "Volunteer" },
  { to: "/contact", label: "Contact" },
] as const;
