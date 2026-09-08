export const APP_NAME = "Navi Zindagi Foundation";
export const APP_TAGLINE = "Empower • Elevate • Transform";
export const APP_TITLE = "Navi Zindagi Foundation | सेवा, राहत और सामाजिक कल्याण";
export const APP_DESCRIPTION =
  "Navi Zindagi Foundation works through humanitarian relief, education support, Gau Seva, food distribution and community welfare initiatives.";
export const SITE_URL = "https://navizindagi.vercel.app";

export function displayTagline(value?: string | null) {
  const raw = (value ?? "").trim() || APP_TAGLINE;
  return raw
    .replace(/\s*[•·]\s*/g, " • ")
    .replace(/\.\s+/g, " • ")
    .replace(/\.$/, "")
    .trim();
}

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
  { to: "/about", label: "About Us" },
  { to: "/", label: "Our Work", hash: "our-work" },
  { to: "/campaigns", label: "Campaigns" },
  { to: "/volunteer", label: "Volunteer" },
  { to: "/transparency", label: "Transparency" },
  { to: "/contact", label: "Contact" },
] as const;

export const WORK_AREAS = [
  {
    key: "disaster",
    title: "Disaster & Flood Relief",
    body: "बाढ़, आपदा और कठिन परिस्थितियों से प्रभावित लोगों तक आवश्यक सहायता और राहत पहुंचाने के प्रयास।",
    image: "/relief-shelter.jpg",
  },
  {
    key: "gau-seva",
    title: "Gau Seva",
    body: "गौवंश की देखभाल, भोजन और कल्याण से जुड़े सेवा कार्यों में समुदाय की भागीदारी।",
  },
  {
    key: "education",
    title: "Education Support",
    body: "बच्चों और विद्यार्थियों को शिक्षा से जुड़े संसाधन और अवसर उपलब्ध कराने की दिशा में सहयोग।",
  },
  {
    key: "food",
    title: "Free Food Distribution",
    body: "जरूरतमंद लोगों और कठिन परिस्थितियों से गुजर रहे परिवारों के लिए भोजन वितरण से जुड़े सेवा प्रयास।",
    image: "/relief-food.jpg",
  },
  {
    key: "community",
    title: "Community Welfare",
    body: "स्थानीय समुदायों की जरूरतों के अनुसार सामाजिक सहयोग और जनकल्याण से जुड़े कार्य।",
    image: "/relief-hygiene.jpg",
  },
  {
    key: "humanitarian",
    title: "Humanitarian Support",
    body: "जरूरतमंद लोगों तक आवश्यक सहायता पहुंचाने और कठिन समय में साथ खड़े होने के प्रयास।",
    image: "/relief-medical.jpg",
  },
] as const;

export const SUPPORT_STEPS = [
  { step: "01", title: "Donate", body: "आप अपनी क्षमता के अनुसार सहयोग कर सकते हैं।" },
  { step: "02", title: "We Organize", body: "सहयोग को संबंधित सेवा या राहत गतिविधियों तक पहुंचाने की प्रक्रिया।" },
  { step: "03", title: "Help Reaches People", body: "जरूरत के अनुसार सहायता पहुंचाने के प्रयास।" },
  { step: "04", title: "Stay Connected", body: "गतिविधियों और अपडेट्स के माध्यम से जुड़े रहें।" },
] as const;

export const WHY_JOIN_POINTS = [
  "सेवा पर केंद्रित पहल",
  "जरूरतमंदों के लिए सहयोग",
  "समुदाय की भागीदारी",
  "पारदर्शिता और जिम्मेदारी",
] as const;

export const ACTIVITY_PREVIEWS = [
  { key: "flood", title: "Flood Relief", image: "/campaign-nepal.jpg" },
  { key: "gau", title: "Gau Seva" },
  { key: "education", title: "Education" },
  { key: "food", title: "Food Distribution", image: "/relief-food.jpg" },
  { key: "community", title: "Community Welfare", image: "/relief-hygiene.jpg" },
] as const;
