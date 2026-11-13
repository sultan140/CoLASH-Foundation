import {
  WomensTeamConfig,
  WomensTeamMember,
  WomensTeamActivity,
  WomensTeamDocument,
  WomensTeamNotice
} from '../types';

// Default SVG Logo for CoLASH Foundation Women's Team
// Embedded as data URI for instant offline rendering without external dependencies
export const DEFAULT_WOMENS_TEAM_LOGO = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
  <defs>
    <linearGradient id="wtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#be185d" />
      <stop offset="50%" stop-color="#db2777" />
      <stop offset="100%" stop-color="#167d78" />
    </linearGradient>
    <linearGradient id="glowGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#d6f36a" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#f472b6" stop-opacity="0.9" />
    </linearGradient>
  </defs>
  
  <!-- Outer Embellished Circle -->
  <circle cx="120" cy="120" r="112" fill="#102B3F" stroke="url(#wtGrad)" stroke-width="6" />
  <circle cx="120" cy="120" r="102" fill="none" stroke="#D6F36A" stroke-width="1.5" stroke-dasharray="4 4" />
  
  <!-- Inner Background Radiant -->
  <circle cx="120" cy="120" r="92" fill="#0d2232" />
  
  <!-- Rays of Light -->
  <g stroke="url(#glowGrad)" stroke-width="2" opacity="0.6">
    <line x1="120" y1="36" x2="120" y2="48" />
    <line x1="120" y1="192" x2="120" y2="204" />
    <line x1="36" y1="120" x2="48" y2="120" />
    <line x1="192" y1="120" x2="204" y2="120" />
    <line x1="60" y1="60" x2="70" y2="70" />
    <line x1="180" y1="180" x2="170" y2="170" />
    <line x1="60" y1="180" x2="70" y2="170" />
    <line x1="180" y1="60" x2="170" y2="70" />
  </g>

  <!-- Empowered Female Silhouette & Lotus Motif -->
  <path d="M120 72 C128 72 134 78 134 86 C134 94 128 100 120 100 C112 100 106 94 106 86 C106 78 112 72 120 72 Z" fill="#FCE7F3" />
  
  <!-- Humanitarian Caring Hands & Lotus Wings -->
  <path d="M120 106 C104 106 86 116 80 134 C94 130 108 136 120 148 C132 136 146 130 160 134 C154 116 136 106 120 106 Z" fill="url(#wtGrad)" />
  <path d="M120 126 C112 136 94 146 72 144 C84 158 104 162 120 166 C136 162 156 158 168 144 C146 146 128 136 120 126 Z" fill="#D6F36A" />

  <!-- Heart of Compassion -->
  <path d="M120 142 C116 136 108 136 104 140 C100 144 100 150 106 156 L120 168 L134 156 C140 150 140 144 136 140 C132 136 124 136 120 142 Z" fill="#EC4899" />

  <!-- Ribbon Emblem Text -->
  <path d="M50 186 Q120 206 190 186" fill="none" stroke="#be185d" stroke-width="12" stroke-linecap="round" />
  <text x="120" y="190" text-anchor="middle" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="10" font-weight="bold" letter-spacing="1.5">
    WOMEN'S TEAM
  </text>
  
  <!-- Foundation Name Curve -->
  <text x="120" y="58" text-anchor="middle" fill="#D6F36A" font-family="Arial, sans-serif" font-size="9" font-weight="bold" letter-spacing="2">
    COLASH FOUNDATION
  </text>
</svg>
`)}`;

export const INITIAL_WOMENS_TEAM_CONFIG: WomensTeamConfig = {
  nameBn: 'কোলাশ ফাউন্ডেশন উইমেন্স টিম',
  nameEn: "CoLASH Foundation Women's Team",
  shortName: 'CoLASH Women’s Team',
  mottoBn: 'নারীর ক্ষমতায়ন, মর্যাদা ও আলোর পথে সেবা',
  mottoEn: 'Empowering Women, Uplifting Dignity, Serving Humanity',
  logoUrl: DEFAULT_WOMENS_TEAM_LOGO,
  establishedDate: '০৭-০৩-২০২৬ খ্রিস্টাব্দ',
  descriptionBn: 'কোলাশ ফাউন্ডেশনের আওতাধীন একটি স্বতন্ত্র ও নিবেদিত নারী অঙ্গসংগঠন। মৌলভীবাজার জেলা ও সিলেট বিভাগের প্রত্যন্ত এলাকায় পিছিয়ে পড়া নারীদের আর্থ-সামাজিক স্বাবলম্বীকরণ, বিনামূল্যে স্বাস্থ্য ও স্যানিটেশন সচেতনতা, শিশু-মাতৃ পুষ্টি এবং নারীদের সামাজিক অধিকার রক্ষায় নিবেদিতপ্রাণ।',
  descriptionEn: 'An autonomous, dedicated women wing under CoLASH Foundation committed to socio-economic self-reliance, maternal and adolescent health drives, menstrual hygiene literacy, and crisis relief across rural communities.',
  email: 'womensteam@colash.org',
  phone: '01646-475348',
  address: 'কমলগঞ্জ উপজেলা, মৌলভীবাজার জেলা, সিলেট বিভাগ, বাংলাদেশ'
};

// Initial verified committee posts & members
// Ready for official administration and appointments via the Admin Panel
export const INITIAL_WOMENS_TEAM_MEMBERS: WomensTeamMember[] = [
  {
    id: 'wtm-1',
    nameBn: 'সুলতানা রাজিয়া চৌধুরী',
    nameEn: 'Sultana Razia Chowdhury',
    designationBn: 'সভাপতি',
    designationEn: 'President',
    roleType: 'president',
    membershipId: 'CLF-WT-101',
    phone: '01646-475348',
    email: 'sultana.wt@colash.org',
    password: 'colashwomen2026',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    bioBn: 'উইমেন্স টিমের নীতিনির্ধারণ, গ্রামীণ নারী উদ্যোক্তা সৃষ্টি এবং চাবাগানের নারীদের স্বাস্থ্য সুরক্ষা কর্মসূচির সার্বিক তত্ত্বাবধানে নিয়োজিত।',
    bioEn: 'Leads strategic policy, tea-garden women healthcare drives, and community grassroots empowerment initiatives.',
    joinedDate: '২০২৬-০৩-০৭',
    district: 'মৌলভীবাজার',
    bloodGroup: 'O+',
    responsibilities: [
      'উইমেন্স টিমের সার্বিক পরিচালনা ও নীতি নির্ধারণ',
      'মাসিক নির্বাহী সমন্বয় সভা পরিচালনা',
      'মাতৃ ও শিশু পুষ্টি তহবিলের দিকনির্দেশনা'
    ],
    status: 'active'
  },
  {
    id: 'wtm-2',
    nameBn: 'ফারহানা ইসলাম তানিয়া',
    nameEn: 'Farhana Islam Tania',
    designationBn: 'সহ-সভাপতি',
    designationEn: 'Vice President',
    roleType: 'vice_president',
    membershipId: 'CLF-WT-102',
    phone: '01308-241288',
    email: 'farhana.wt@colash.org',
    password: 'colashwomen2026',
    photoUrl: 'https://images.unsplash.com/photo-1580894732483-e02cf3c9597d?w=400&auto=format&fit=crop&q=80',
    bioBn: 'মাঠপর্যায়ের ক্যাম্পেইন বাস্তবায়ন, ভলান্টিয়ার টিম পরিচালনা ও প্রত্যন্ত কমিউনিটির সাথে যোগাযোগ সমন্বয় করেন।',
    bioEn: 'Oversees operational field deployment, youth female volunteer corps, and grassroots community outreach.',
    joinedDate: '২০২৬-০৩-০৭',
    district: 'সিলেট',
    bloodGroup: 'A+',
    responsibilities: [
      'ফিল্ড কার্যক্রম ও ভলান্টিয়ার টিম মনিটরিং',
      'জরুরি নারী ও শিশু ত্রাণ সেল সমন্বয়',
      'প্রশিক্ষণ কর্মশালার সার্বিক তত্ত্বাবধান'
    ],
    status: 'active'
  },
  {
    id: 'wtm-3',
    nameBn: 'নুসরাত জাহান মিম',
    nameEn: 'Nusrat Jahan Meem',
    designationBn: 'সাধারণ সম্পাদক',
    designationEn: 'General Secretary',
    roleType: 'general_secretary',
    membershipId: 'CLF-WT-103',
    phone: '01711-889911',
    email: 'nusrat.wt@colash.org',
    password: 'colashwomen2026',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    bioBn: 'দাপ্তরিক নথি, সদস্য নিবন্ধন, সভার কার্যবিবরণী লিপিবদ্ধকরণ ও প্রাতিষ্ঠানিক যোগাযোগ পরিচালনা করেন।',
    bioEn: 'Manages official secretariat documentation, member registrations, meeting minutes recording, and communications.',
    joinedDate: '২০২৬-০৩-০৭',
    district: 'মৌলভীবাজার (কমলগঞ্জ)',
    bloodGroup: 'B+',
    responsibilities: [
      'সভার নোটিশ ও কার্যবিবরণী প্রস্তুত',
      'সদস্য তথ্যভাণ্ডার সংরক্ষণ',
      'ত্রৈমাসিক অগ্রগতি প্রতিবেদন তৈরি'
    ],
    status: 'active'
  },
  {
    id: 'wtm-4',
    nameBn: 'শামীমা আক্তার বৃষ্টি',
    nameEn: 'Shamima Akter Brishti',
    designationBn: 'সাংগঠনিক সম্পাদক',
    designationEn: 'Organizing Secretary',
    roleType: 'organizing_secretary',
    membershipId: 'CLF-WT-104',
    phone: '01822-334455',
    email: 'shamima.wt@colash.org',
    password: 'colashwomen2026',
    photoUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&auto=format&fit=crop&q=80',
    bioBn: 'উপজেলা ও ইউনিয়ন পর্যায়ে নারী স্বেচ্ছাসেবক ইউনিট গঠন এবং নতুন সদস্যদের সমন্বয় করেন।',
    bioEn: 'Mobilizes upazila-level female volunteer chapters and oversees youth engagement initiatives.',
    joinedDate: '২০২৬-০৩-১০',
    district: 'হবিগঞ্জ',
    bloodGroup: 'AB+',
    responsibilities: [
      'নতুন নারী সদস্য ও স্বেচ্ছাসেবক রিক্রুটমেন্ট',
      'ক্যাম্পেইন টিম প্রস্তুতকরণ',
      'জেলা সমন্বয় কমিটি সমূহের ফলোআপ'
    ],
    status: 'active'
  },
  {
    id: 'wtm-5',
    nameBn: 'আফরিন জাহান সোনিয়া',
    nameEn: 'Afrin Jahan Sonia',
    designationBn: 'কোষাধ্যক্ষ (অর্থ সম্পাদক)',
    designationEn: 'Treasurer & Finance Officer',
    roleType: 'treasurer',
    membershipId: 'CLF-WT-105',
    phone: '01912-778899',
    email: 'finance.wt@colash.org',
    password: 'colashwomen2026',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    bioBn: 'উইমেন্স টিমের সকল প্রজেক্ট বাজেট, আয়-ব্যয় ভাউচার ও স্বচ্ছ হিসাব সংরক্ষণ তদারক করেন।',
    bioEn: 'Maintains project ledgers, women fund disbursements, receipts, and statutory financial audits.',
    joinedDate: '২০২৬-০৩-১০',
    district: 'মৌলভীবাজার',
    bloodGroup: 'O+',
    responsibilities: [
      'নারী স্বাবলম্বীকরণ প্রকল্পের হিসাবরক্ষণ',
      'স্বাস্থ্য কিট ক্রয়ের ভাউচার অনুমোদন',
      'মাসিক আর্থিক বিবরণী প্রস্তুত'
    ],
    status: 'active'
  },
  {
    id: 'wtm-6',
    nameBn: 'রেহানা পারভীন',
    nameEn: 'Rehana Parveen',
    designationBn: 'সমাজকল্যাণ ও স্বাস্থ্য বিষয়ক সম্পাদক',
    designationEn: 'Social Welfare & Health Secretary',
    roleType: 'welfare',
    membershipId: 'CLF-WT-106',
    phone: '01733-556677',
    email: 'welfare.wt@colash.org',
    password: 'colashwomen2026',
    photoUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&auto=format&fit=crop&q=80',
    bioBn: 'প্রত্যন্ত চাবাগান ও চর এলাকায় স্যানিটেশন কিট বিতরণ ও নারী স্বাস্থ্য ক্যাম্প পরিচালনার দায়িত্বে নিয়োজিত।',
    bioEn: 'Directs menstrual hygiene education, distribution camps, and community maternal health workshops.',
    joinedDate: '২০২৬-০৩-১৫',
    district: 'মৌলভীবাজার (শ্রীমঙ্গল)',
    bloodGroup: 'B+',
    responsibilities: [
      'বিনামূল্যে স্যানিটারি ন্যাপকিন বিতরণ প্রোগ্রাম',
      'নারী চিকিৎসকদের স্বাস্থ্য ক্যাম্প লজিস্টিকস',
      'বিধবা মায়েদের জন্য জরুরি খাদ্য সহায়তা'
    ],
    status: 'active'
  }
];

// Initial field activities of Women's Team
export const INITIAL_WOMENS_ACTIVITIES: WomensTeamActivity[] = [
  {
    id: 'wact-01',
    titleBn: 'কমলগঞ্জের চাবাগানে নারী ও কিশোরীদের বিনামূল্যে হাইজিন কিট বিতরণ',
    titleEn: 'Free Menstrual Hygiene Kits & Health Awareness in Kamalganj Tea Gardens',
    date: '২০২৬-০৩-১৮',
    locationBn: 'ভানুগাছ ও শমশেরনগর চাবাগান এলাকা, কমলগঞ্জ',
    locationEn: 'Bhanugach & Shamshernagar Tea Gardens, Kamalganj',
    beneficiariesCount: 480,
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=80',
    category: 'hygiene',
    descriptionBn: 'চা শ্রমজীবী নারী ও কিশোরীদের মাঝে উন্নত মানের রি-ইউজেবল প্যাড, সাবান ও স্বাস্থ্য সুরক্ষা সামগ্রী বিতরণ এবং নারী চিকিৎসকের মাধ্যমে হাইজিন কাউন্সেলিং সম্পন্ন।',
    descriptionEn: 'Distributed medical-grade reusable hygiene kits, antiseptic supplies, and held specialized female-led health consultations for 480 tea garden workers.',
    status: 'completed'
  },
  {
    id: 'wact-02',
    titleBn: 'অসচ্ছল ও বিধবা মায়েদের জন্য বিনামূল্যে সেলাই ও হস্তশিল্প প্রশিক্ষণ কেন্দ্র',
    titleEn: 'Vocational Tailoring & Handicraft Skills Workshop for Destitute Mothers',
    date: '২০২৬-০৩-২৫',
    locationBn: 'কমলগঞ্জ উপজেলা সদর প্রশিক্ষণ কেন্দ্র',
    locationEn: 'Kamalganj Upazila Women Community Center',
    beneficiariesCount: 45,
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    category: 'tailoring_vocational',
    descriptionBn: '১ম ব্যাচের ৪৫ জন অসহায় নারীকে স্বাবলম্বী করার লক্ষ্যে ৩ মাসের নিয়মিত দর্জি প্রশিক্ষণ ও পরবর্তীতে বিনামূল্যে সেলাই মেশিন প্রদান কর্মসূচি চলমান।',
    descriptionEn: 'Enrolled 45 marginalized mothers for comprehensive 3-month tailoring courses with guaranteed machine grants upon graduation.',
    status: 'ongoing'
  },
  {
    id: 'wact-03',
    titleBn: 'গর্ভবতী মা ও নবজাতক পুষ্টি ও জরুরি রক্তদান সাপোর্ট সেল',
    titleEn: 'Maternal Nutrition Rations & Emergency Safe Blood Donors Network',
    date: '২০২৬-০৪-০২',
    locationBn: 'মৌলভীবাজার সদর ও কমলগঞ্জ স্বাস্থ্য কমপ্লেক্স পরিধি',
    locationEn: 'Moulvibazar & Kamalganj Rural Health Centers',
    beneficiariesCount: 220,
    image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=600&auto=format&fit=crop&q=80',
    category: 'maternal_health',
    descriptionBn: 'অসচ্ছল গর্ভবতী মায়েদের জন্য ক্যালসিয়াম, আয়রন ও ভিটামিন সমৃদ্ধ পুষ্টি বাস্কেট বিতরণ এবং জরুরি ডেলিভারির জন্য নারী রক্তদাতাদের ডাটাবেজ প্রস্তুত।',
    descriptionEn: 'Providing vital prenatal nutritional packs and maintaining a verified 24/7 emergency female blood donor directory.',
    status: 'ongoing'
  }
];

// Initial official documents & meeting minutes
export const INITIAL_WOMENS_DOCUMENTS: WomensTeamDocument[] = [
  {
    id: 'wdoc-01',
    titleBn: 'উইমেন্স টিমের ১ম আনুষ্ঠানিক সাধারণ সভার কার্যবিবরণী (০৭-০৩-২০২৬)',
    titleEn: 'Minutes of the 1st Inaugural General Assembly (07-03-2026)',
    type: 'meeting_minutes',
    date: '২০২৬-০৩-০৭',
    fileSize: '1.4 MB',
    descriptionBn: 'উইমেন্স টিমের আনুষ্ঠানিক আত্মপ্রকাশ, লক্ষ্য-উদ্দেশ্য অনুমোদন ও পরিচালনা পরিষদ গঠনের সভার পূর্ণাঙ্গ কার্যবিবরণী।',
    descriptionEn: 'Full minutes and signed resolutions from the founding meeting in Kamalganj establishing the Women’s Team charter.',
    isRestrictedToMembers: true,
    contentSnippet: `কোলাশ ফাউন্ডেশন উইমেন্স টিম
১ম সাধারণ সভার কার্যবিবরণী
স্থান: কমলগঞ্জ উপজেলা কার্যালয়, মৌলভীবাজার
তারিখ: ০৭ মার্চ ২০২৬ খ্রিস্টাব্দ | সময়: সকাল ১০:৩০ মিনিট

উপস্থিত সদস্যবৃন্দ:
১. সুলতানা রাজিয়া চৌধুরী (সভাপতি)
২. ফারহানা ইসলাম তানিয়া (সহ-সভাপতি)
৩. নুসরাত জাহান মিম (সাধারণ সম্পাদক)
৪. শামীমা আক্তার বৃষ্টি (সাংগঠনিক সম্পাদক)
৫. আফরিন জাহান সোনিয়া (কোষাধ্যক্ষ)
৬. রেহানা পারভীন (সমাজকল্যাণ সম্পাদক)

গৃহীত সিদ্ধান্তসমূহ:
১. উইমেন্স টিম সম্পূর্ণ অসাম্প্রদায়িক, অরাজনৈতিক, অলাভজনক ও স্বাধীনভাবে নারীর মর্যাদা ও জনকল্যাণে কাজ করবে।
২. চাবাগান ও হাওর অঞ্চলে প্রান্তিক নারীদের বিনামূল্যে হাইজিন কিট বিতরণ কর্মসূচি অগ্রাধিকার পাবে।
৩. প্রতিটি ইউনিয়ন থেকে সৎ ও উদ্যমী নারী প্রতিনিধিদের সদস্য হিসেবে যুক্ত করা হবে।

স্বাক্ষরিত:
নুসরাত জাহান মিম (সাধারণ সম্পাদক)
সুলতানা রাজিয়া চৌধুরী (সভাপতি)`
  },
  {
    id: 'wdoc-02',
    titleBn: 'কোলাশ ফাউন্ডেশন উইমেন্স টিম পরিচালনা নীতিমালা ও আচরণবিধি ২০২৬',
    titleEn: 'Constitution, Code of Conduct & Operational Guidelines 2026',
    type: 'guideline',
    date: '২০২৬-০৩-১২',
    fileSize: '2.1 MB',
    descriptionBn: 'সদস্য অন্তর্ভুক্তি, স্বেচ্ছাসেবা প্রদান, অনুদান হিসাবরক্ষণ এবং প্রকল্প পরিচালনার পূর্ণাঙ্গ নির্দেশিকা।',
    descriptionEn: 'Official operational statutes, ethical guidelines, and democratic procedure manual for the women wing.',
    isRestrictedToMembers: false,
    contentSnippet: `কোলাশ ফাউন্ডেশন উইমেন্স টিম - সাংগঠনিক সংবিধান ও নীতিমালা
ধারা ১: নাম ও পরিচিতি — কোলাশ ফাউন্ডেশন উইমেন্স টিম
ধারা ২: অবস্থান — কমলগঞ্জ উপজেলা, মৌলভীবাজার জেলা, সিলেট বিভাগ।
ধারা ৩: আদর্শ — অসাম্প্রদায়িক, অরাজনৈতিক, অলাভজনক ও শতভাগ স্বেচ্ছাসেবী।
ধারা ৪: স্বাতন্ত্র্য — কোনো অঙ্গসংগঠন থাকবে না এবং এটি কোনো বহিরাগত রাজনৈতিক দলের অংশ নয়।`
  },
  {
    id: 'wdoc-03',
    titleBn: 'কার্যনির্বাহী সভার কার্যবিবরণী নং ০২: চাবাগান স্বাস্থ্য ক্যাম্প প্রস্তাবনা',
    titleEn: 'Executive Minutes #02: Tea Garden Maternal Health Drive Approval',
    type: 'meeting_minutes',
    date: '২০২৬-০৩-১৫',
    fileSize: '890 KB',
    descriptionBn: 'ভানুগাছ ও শমশেরনগরে ৪৫০+ নারীর হাইজিন কিট ক্রয়ের বাজেট অনুমোদন সংক্রান্ত সিদ্ধান্ত।',
    descriptionEn: 'Approved budget allocations and volunteer dispatch protocols for the upcoming tea estate health camp.',
    isRestrictedToMembers: true,
    contentSnippet: `উইমেন্স টিম - কার্যনির্বাহী কমিটির ২য় নিয়মিত সভা
তারিখ: ১৫ মার্চ ২০২৬
সিদ্ধান্ত:
১. ভানুগাছ চাবাগানের জন্য ৪৮০ প্যাকেট হাইজিন কিট সংগ্রহ।
২. ডা. ফাহিমা শারমিনের নেতৃত্বে ৩ সদস্যের মেডিকেল দল গঠন।
৩. তহবিল থেকে অনুমোদিত বরাদ্দ: ৬০,০০০ টাকা।`
  }
];

// Initial notices
export const INITIAL_WOMENS_NOTICES: WomensTeamNotice[] = [
  {
    id: 'wnot-01',
    titleBn: 'আগামী ২২ এপ্রিল ২০২৬ উইমেন্স টিমের বিশেষ সাধারণ সভা আহ্বান',
    titleEn: 'Special General Council Meeting Scheduled for 22 April 2026',
    date: '২০২৬-০৪-১০',
    priority: 'urgent',
    bodyBn: 'সকল সম্মানিত কার্যনির্বাহী ও সাধারণ সদস্যদের অবগতির জন্য জানানো যাচ্ছে যে, আগামী ২২ এপ্রিল ২০২৬ বিকাল ৩:০০ টায় কমলগঞ্জ কার্যালয়ে চাবাগান প্রজেক্টের অগ্রগতি মূল্যায়নে বিশেষ সভা অনুষ্ঠিত হবে। সকল সদস্যের উপস্থিতি বাধ্যতামূলক।',
    bodyEn: 'Notice to all executive and general members: An evaluation meeting will convene on 22 April 2026 at 3:00 PM at Kamalganj Center. Punctual attendance requested.',
    signedBy: 'নুসরাত জাহান মিম (সাধারণ সম্পাদক)'
  },
  {
    id: 'wnot-02',
    titleBn: 'নতুন নারী সদস্য অন্তর্ভুক্তি ও স্বেচ্ছাসেবী আবেদন বিজ্ঞপ্তি ২০২৬',
    titleEn: 'Recruitment Circular for Passionate Female Volunteers in Sylhet & Moulvibazar',
    date: '২০২৬-০৩-২৫',
    priority: 'general',
    bodyBn: 'মৌলভীবাজার জেলার সকল উপজেলার কলেজ ও বিশ্ববিদ্যালয়পড়ুয়া মানবিক তরুণীদের উইমেন্স টিমে স্বেচ্ছাসেবী হিসেবে যুক্ত হতে আমন্ত্রণ জানানো যাচ্ছে। অনলাইন পোর্টালের মাধ্যমে আবেদন সম্পন্ন করুন।',
    bodyEn: 'Inviting female college and university students across Moulvibazar to join the dedicated humanitarian volunteer corps.',
    signedBy: 'শামীমা আক্তার বৃষ্টি (সাংগঠনিক সম্পাদক)'
  }
];
