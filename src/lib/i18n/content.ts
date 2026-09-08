import { tValue } from "./core.ts";
import { translate } from "./messages.ts";
import type { Language } from "./types.ts";

function normalize(value: string) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

const PLACEHOLDERS: Record<string, "common.toBeUpdated" | "common.updatesComing"> = {
  "to be updated": "common.toBeUpdated",
  "to be updated.": "common.toBeUpdated",
  "updates coming soon": "common.updatesComing",
  "updates coming soon.": "common.updatesComing",
};

/** Hindi overlays for known published English copy. Keyed by normalized English source. */
const ENGLISH_TO_HINDI: Record<string, string> = {
  "Empower. Elevate. Transform.": "सशक्त करें • ऊँचा उठाएँ • रूपांतरित करें",
  "Empower • Elevate • Transform": "सशक्त करें • ऊँचा उठाएँ • रूपांतरित करें",

  Nepal: "नेपाल",
  "Assam, India": "असम, भारत",
  "Where the need is most urgent": "जहाँ आवश्यकता सबसे अधिक है",

  "Food kits": "खाद्य किट",
  Food: "भोजन",
  "Clean water": "स्वच्छ जल",
  "Hygiene supplies": "स्वच्छता सामग्री",
  "Medical support": "चिकित्सा सहयोग",
  "Temporary shelter": "अस्थायी आश्रय",
  "Essential household items": "आवश्यक घरेलू वस्तुएँ",
  "Essential supplies": "आवश्यक आपूर्ति",

  "Navi Zindagi Foundation is a registered Indian non-governmental organisation working towards sustainable development in health, education, nutrition and environment. This website is dedicated to flood-relief fundraising and volunteer mobilisation for families affected in Nepal and Assam. Operational claims on this site are limited to information the Foundation has confirmed and published through the admin area.":
    "नवी ज़िंदगी फाउंडेशन स्वास्थ्य, शिक्षा, पोषण और पर्यावरण में सतत विकास की दिशा में कार्य करने वाला एक पंजीकृत भारतीय गैर-सरकारी संगठन है। यह वेबसाइट नेपाल और असम में प्रभावित परिवारों के लिए बाढ़-राहत धन-संग्रह और स्वयंसेवक जुटाव को समर्पित है। इस साइट पर परिचालन दावे केवल उस जानकारी तक सीमित हैं जिसे संस्था ने पुष्टि कर व्यवस्थापक क्षेत्र के माध्यम से प्रकाशित किया है।",

  "To channel compassion into accountable support — raising funds and volunteer capacity for verified flood-relief needs, while continuing the Foundation's broader work in health, education, nutrition and environment.":
    "करुणा को जवाबदेह सहयोग में बदलना — सत्यापित बाढ़-राहत जरूरतों के लिए धन और स्वयंसेवक क्षमता जुटाना, साथ ही स्वास्थ्य, शिक्षा, पोषण और पर्यावरण में संस्था के व्यापक कार्य को जारी रखना।",

  "Communities recovering from disaster with dignity, and a society in which every person can live a navi zindagi — a renewed life — with access to care, learning and opportunity.":
    "गरिमा के साथ आपदा से उबरते समुदाय, और एक ऐसा समाज जहाँ प्रत्येक व्यक्ति देखभाल, शिक्षा और अवसर के साथ नवी ज़िंदगी — एक नया जीवन — जी सके।",

  "Dignity. Transparency. Compassion. Accountability. Do not over-claim. Publish what is verified; label what is still to be updated.":
    "गरिमा। पारदर्शिता। करुणा। जवाबदेही। अतिशय दावा न करें। जो सत्यापित है उसे प्रकाशित करें; जो अभी अद्यतन है उसे वैसा ही चिह्नित करें।",

  "Flood relief fundraising and volunteer mobilisation; health; education; nutrition; environment. Programme details beyond this flood-relief appeal will be published as they are confirmed.":
    "बाढ़ राहत धन-संग्रह और स्वयंसेवक जुटाव; स्वास्थ्य; शिक्षा; पोषण; पर्यावरण। इस बाढ़-राहत अपील से इतर कार्यक्रम विवरण पुष्टि होने पर प्रकाशित होंगे।",

  "Public company-registry details are listed where confirmed. 12A, 80G, FCRA and other tax-exemption or certification information: To be updated. Do not assume tax deductibility until certificates are published here.":
    "सार्वजनिक कंपनी-रजिस्ट्री विवरण जहाँ पुष्टि हैं वहाँ सूचीबद्ध हैं। 12A, 80G, FCRA और अन्य कर-छूट या प्रमाणन जानकारी: अद्यतन किया जाना है। यहाँ प्रमाणपत्र प्रकाशित होने तक कर कटौती मानकर न चलें।",

  'Donations to this appeal are intended for flood-relief support — food, clean water, hygiene supplies, medical support, temporary shelter and essential household items — for Nepal Flood Relief, Assam Flood Relief, or general relief as chosen by the donor. Exact allocation is published as utilisation reports become available. Until a report is posted, treat figures as "To be updated".':
    "इस अपील के दान बाढ़-राहत सहयोग — भोजन, स्वच्छ जल, स्वच्छता सामग्री, चिकित्सा सहयोग, अस्थायी आश्रय और आवश्यक घरेलू वस्तुएँ — के लिए हैं, दाता द्वारा चुने गए नेपाल बाढ़ राहत, असम बाढ़ राहत या सामान्य राहत के अनुसार। सटीक आवंटन उपयोग रिपोर्ट उपलब्ध होने पर प्रकाशित होता है। रिपोर्ट आने तक आंकड़ों को “अद्यतन किया जाना है” माना जाए।",

  "Online donations are processed through a payment gateway (Razorpay when credentials are configured). Card and UPI details are handled by the gateway and are not stored on this website. Until gateway credentials are added on the server, the site runs in labelled sandbox mode and does not collect live payments.":
    "ऑनलाइन दान भुगतान गेटवे के माध्यम से संसाधित होते हैं (कुंजियाँ कॉन्फ़िगर होने पर Razorpay)। कार्ड और यूपीआई विवरण गेटवे संभालता है और इस वेबसाइट पर संग्रहित नहीं होते। सर्वर पर गेटवे कुंजियाँ जुड़ने तक साइट चिह्नित सैंडबॉक्स मोड में चलती है और लाइव भुगतान नहीं लेती।",

  "Support verified flood-relief efforts for families affected by monsoon flooding in Nepal.":
    "नेपाल में मानसून बाढ़ से प्रभावित परिवारों के लिए सत्यापित बाढ़-राहत प्रयासों का सहयोग करें।",

  "Monsoon flooding in Nepal has damaged homes, roads and access to clean water across multiple districts. Navi Zindagi Foundation is raising funds so contributions can be directed to verified relief needs. This page does not claim that the Foundation is physically operating in a named location until that is documented here. Situation details and field reports will be published as they are confirmed.":
    "नेपाल में मानसून बाढ़ ने कई जिलों में घरों, सड़कों और स्वच्छ जल की पहुँच को क्षति पहुँचाई है। नवी ज़िंदगी फाउंडेशन धन जुटा रहा है ताकि योगदान सत्यापित राहत जरूरतों की ओर जा सके। जब तक यहाँ दस्तावेज न हो, यह पृष्ठ यह दावा नहीं करता कि संस्था किसी नामित स्थान पर भौतिक रूप से कार्य कर रही है। स्थिति विवरण और क्षेत्रीय रिपोर्ट पुष्टि होने पर प्रकाशित होंगे।",

  "Channel donor support toward food, clean water, hygiene supplies, medical assistance, temporary shelter and essential household items for flood-affected families in Nepal, through verified relief channels. Updates will appear on this page as they are verified — not before.":
    "सत्यापित राहत माध्यमों से नेपाल में बाढ़-प्रभावित परिवारों के लिए भोजन, स्वच्छ जल, स्वच्छता सामग्री, चिकित्सा सहायता, अस्थायी आश्रय और आवश्यक घरेलू वस्तुओं की ओर दाता सहयोग पहुँचाना। अद्यतन इसी पृष्ठ पर सत्यापन के बाद दिखेंगे — पहले नहीं।",

  "Nepal Flood Relief utilisation: To be updated. Campaign-wise spend will be published when reports are available.":
    "नेपाल बाढ़ राहत उपयोग: अद्यतन किया जाना है। अभियान-वार व्यय रिपोर्ट उपलब्ध होने पर प्रकाशित होगा।",

  "Support verified flood-relief efforts for families affected by flooding in Assam.":
    "असम में बाढ़ से प्रभावित परिवारों के लिए सत्यापित बाढ़-राहत प्रयासों का सहयोग करें।",

  "Seasonal flooding in Assam regularly inundates riverine communities, damaging homes, farmland and access to safe water. Navi Zindagi Foundation is raising funds so contributions can be directed to verified relief needs in Assam. We will not claim on-the-ground operations or beneficiary counts until those facts are published through this page.":
    "असम में मौसमी बाढ़ नदी किनारे के समुदायों को बार-बार जलमग्न करती है, जिससे घर, खेत और सुरक्षित जल की पहुँच क्षतिग्रस्त होती है। नवी ज़िंदगी फाउंडेशन धन जुटा रहा है ताकि योगदान असम की सत्यापित राहत जरूरतों की ओर जा सके। जब तक ये तथ्य इस पृष्ठ पर प्रकाशित न हों, हम स्थल-संचालन या लाभार्थी संख्या का दावा नहीं करेंगे।",

  "Direct donor support to verified needs — food, clean water, hygiene, medical care, temporary shelter and essential supplies — for flood-affected families in Assam. Fundraising targets and utilisation notes are maintained by the Foundation and can be updated from the admin dashboard.":
    "असम में बाढ़-प्रभावित परिवारों की सत्यापित जरूरतों — भोजन, स्वच्छ जल, स्वच्छता, चिकित्सा देखभाल, अस्थायी आश्रय और आवश्यक आपूर्ति — की ओर दाता सहयोग पहुँचाना। धन-संग्रह लक्ष्य और उपयोग टिप्पणियाँ संस्था रखती है और व्यवस्थापक डैशबोर्ड से अद्यतन हो सकती हैं।",

  "Assam Flood Relief utilisation: To be updated. Campaign-wise spend will be published when reports are available.":
    "असम बाढ़ राहत उपयोग: अद्यतन किया जाना है। अभियान-वार व्यय रिपोर्ट उपलब्ध होने पर प्रकाशित होगा।",

  "An unrestricted flood-relief fund so the Foundation can allocate support to the most urgent verified need.":
    "एक अप्रतिबंधित बाढ़-राहत कोष, जिससे संस्था सबसे तात्कालिक सत्यापित जरूरत की ओर सहयोग आवंटित कर सके।",

  "General Relief is for donors who wish to support flood-affected families without restricting funds to a single geography. The Foundation will allocate these gifts to verified Nepal or Assam relief needs, or related essential support, and will publish that allocation when reports are available.":
    "सामान्य राहत उन दाताओं के लिए है जो धन को एक भूगोल तक सीमित किए बिना बाढ़-प्रभावित परिवारों का सहयोग करना चाहते हैं। संस्था इन योगदानों को सत्यापित नेपाल या असम राहत जरूरतों, या संबंधित आवश्यक सहयोग, की ओर आवंटित करेगी और रिपोर्ट उपलब्ध होने पर वह आवंटन प्रकाशित करेगी।",

  "Provide flexible funding for verified flood-relief priorities — food, water, hygiene, medical support, shelter and essentials — wherever the confirmed need is greatest.":
    "सत्यापित बाढ़-राहत प्राथमिकताओं — भोजन, जल, स्वच्छता, चिकित्सा सहयोग, आश्रय और आवश्यक वस्तुएँ — के लिए लचीला वित्तपोषण देना, जहाँ पुष्टि की गई जरूरत सबसे अधिक हो।",

  "General Relief utilisation: To be updated.": "सामान्य राहत उपयोग: अद्यतन किया जाना है।",

  "Campaign-wise utilisation will be published here as reports are available.":
    "रिपोर्ट उपलब्ध होने पर अभियान-वार उपयोग यहाँ प्रकाशित होगा।",

  "Campaign page opened": "अभियान पृष्ठ खुला",

  'This campaign page is live. Situation reports, volunteer notes and utilisation figures will be published here as they are verified. Until then, treat operational statistics as "To be updated".':
    "यह अभियान पृष्ठ सक्रिय है। स्थिति रिपोर्ट, स्वयंसेवक टिप्पणियाँ और उपयोग आंकड़े सत्यापन के बाद यहाँ प्रकाशित होंगे। तब तक परिचालन आंकड़ों को “अद्यतन किया जाना है” माना जाए।",

  "How are donations used?": "दान का उपयोग कैसे होता है?",
  "Donations are intended for flood-relief support: food, clean water, hygiene supplies, medical support, temporary shelter and essential household items. You may choose Nepal Flood Relief, Assam Flood Relief, or General Relief. Detailed utilisation is published on the Transparency page as reports become available.":
    "दान बाढ़-राहत सहयोग के लिए हैं: भोजन, स्वच्छ जल, स्वच्छता सामग्री, चिकित्सा सहयोग, अस्थायी आश्रय और आवश्यक घरेलू वस्तुएँ। आप नेपाल बाढ़ राहत, असम बाढ़ राहत या सामान्य राहत चुन सकते हैं। विस्तृत उपयोग पारदर्शिता पृष्ठ पर रिपोर्ट उपलब्ध होने पर प्रकाशित होता है।",

  "Will I receive a donation receipt?": "क्या मुझे दान पावती मिलेगी?",
  'After a verified payment you can view, download and print a donation acknowledgement from the thank-you page. Tax-exemption certificates (such as 80G) are listed only when the Foundation has published them. Until then, treat tax deductibility as "To be updated".':
    "सत्यापित भुगतान के बाद धन्यवाद पृष्ठ से दान पावती देख, डाउनलोड और प्रिंट कर सकते हैं। कर-छूट प्रमाणपत्र (जैसे 80G) तभी सूचीबद्ध होते हैं जब संस्था ने उन्हें प्रकाशित किया हो। तब तक कर कटौती को “अद्यतन किया जाना है” माना जाए।",

  "Is this website collecting real payments yet?": "क्या यह वेबसाइट अभी वास्तविक भुगतान ले रही है?",
  "Real charges happen only through the configured payment gateway after server-side verification. If gateway credentials are not yet added, the site clearly labels sandbox/test mode and does not collect live payments.":
    "वास्तविक शुल्क केवल कॉन्फ़िगर भुगतान गेटवे से सर्वर-साइड सत्यापन के बाद लगता है। यदि गेटवे कुंजियाँ अभी नहीं जुड़ी हैं, तो साइट स्पष्ट रूप से सैंडबॉक्स/परीक्षण मोड चिह्नित करती है और लाइव भुगतान नहीं लेती।",

  "Does Navi Zindagi Foundation operate in every flood-affected location named here?":
    "क्या नवी ज़िंदगी फाउंडेशन यहाँ नामित हर बाढ़-प्रभावित स्थान पर कार्य करता है?",
  "Not necessarily. This appeal raises funds and volunteer capacity for verified flood-relief efforts. The Foundation will not claim it is physically present in a location until that is documented in an official update.":
    "आवश्यक नहीं। यह अपील सत्यापित बाढ़-राहत प्रयासों के लिए धन और स्वयंसेवक क्षमता जुटाती है। जब तक आधिकारिक अद्यतन में दर्ज न हो, संस्था किसी स्थान पर भौतिक उपस्थिति का दावा नहीं करेगी।",

  "How can I volunteer?": "मैं स्वयंसेवा कैसे कर सकता/सकती हूँ?",
  "Use the volunteer form to share your skills, city and availability. A team member will follow up using the contact details you provide. Submitting the form is not a guarantee of placement.":
    "अपने कौशल, शहर और उपलब्धता बताने के लिए स्वयंसेवक फ़ॉर्म का उपयोग करें। आपके दिए संपर्क विवरण से टीम सदस्य संपर्क करेंगे। फ़ॉर्म भेजना नियुक्ति की गारंटी नहीं है।",

  "Nepal Flood Relief": "नेपाल बाढ़ राहत",
  "Assam Flood Relief": "असम बाढ़ राहत",
  "General Relief": "सामान्य राहत",
};

const HINDI_BY_NORMALIZED_ENGLISH = new Map(
  Object.entries(ENGLISH_TO_HINDI).map(([english, hindi]) => [normalize(english), hindi]),
);

export function hindiForEnglish(english: string | null | undefined): string | null {
  const raw = english ?? "";
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const placeholder = PLACEHOLDERS[trimmed.toLowerCase()];
  if (placeholder) return translate("hi", placeholder);
  return HINDI_BY_NORMALIZED_ENGLISH.get(normalize(trimmed)) ?? null;
}

export function localizeDb(language: Language, english: string | null | undefined): string {
  const raw = english ?? "";
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const placeholder = PLACEHOLDERS[trimmed.toLowerCase()];
  if (placeholder) return translate(language, placeholder);
  return tValue(language, { en: raw, hi: hindiForEnglish(raw) });
}

export function localizeDbList(language: Language, items: string[]): string[] {
  return items.map((item) => localizeDb(language, item));
}
