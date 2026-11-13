import React from 'react';
import {
  Heart,
  Users,
  Sparkles,
  ArrowRight,
  BookOpen,
  ShieldAlert,
  HeartPulse,
  Flower2,
  Briefcase,
  Wrench,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Award,
  ChevronRight,
  Send,
  Building2,
  Download
} from 'lucide-react';
import { Language, Project, NoticeItem, WebsiteCustomConfig, WomensTeamConfig } from '../types';
import { exportAuditReport20252026 } from '../utils/exportUtils';
import { DonationGoalProgress } from './common/DonationGoalProgress';
import { AnimatedProgressBar } from './common/AnimatedProgressBar';

interface HomeHighlightsSectionProps {
  language: Language;
  projects: Project[];
  notices: NoticeItem[];
  websiteConfig?: WebsiteCustomConfig;
  womensTeamConfig?: WomensTeamConfig;
  onNavigate: (sectionId: string) => void;
  onOpenDonate: (project?: Project | null) => void;
  onOpenVolunteer: () => void;
  onOpenPortal: () => void;
}

export const HomeHighlightsSection: React.FC<HomeHighlightsSectionProps> = ({
  language,
  projects,
  notices,
  websiteConfig,
  womensTeamConfig,
  onNavigate,
  onOpenDonate,
  onOpenVolunteer,
  onOpenPortal,
}) => {
  // Top 3 featured projects
  const featuredProjects = projects.slice(0, 3);
  const latestNotice = notices[0];

  const goals = [
    {
      icon: BookOpen,
      titleBn: websiteConfig?.pillar1TitleBn || 'মানসম্মত শিক্ষা ও মেধা বৃত্তি',
      titleEn: 'Quality Education & Scholarships',
      descBn: websiteConfig?.pillar1DescBn || 'অসচ্ছল শিক্ষার্থীদের শিক্ষাসামগ্রী ও বার্ষিক ৪৫০+ মেধা বৃত্তি প্রদান।',
      descEn: 'Educational supplies and 450+ annual merit-based scholarships.',
      color: '#167D78',
      linkTarget: 'activities',
    },
    {
      icon: ShieldAlert,
      titleBn: websiteConfig?.pillar2TitleBn || 'জরুরি বন্যা ও দুর্যোগ ত্রাণ',
      titleEn: 'Emergency Flood & Disaster Relief',
      descBn: websiteConfig?.pillar2DescBn || 'মৌলভীবাজার ও সিলেট বিভাগের যেকোনো প্রাকৃতিক দুর্যোগে তাৎক্ষণিক খাদ্য ও ত্রাণ সহায়তা।',
      descEn: 'Immediate food, medical kits, and rehabilitation in disaster zones.',
      color: '#E6A15B',
      linkTarget: 'activities',
    },
    {
      icon: HeartPulse,
      titleBn: websiteConfig?.pillar3TitleBn || 'বিনামূল্যে চিকিৎসাসেবা ও রক্তদান',
      titleEn: 'Free Healthcare & Blood Bank',
      descBn: websiteConfig?.pillar3DescBn || 'বিনামূল্যে বিশেষজ্ঞ ডাক্তারদের পরামর্শ, জরুরি ওষুধ ও বিরল রক্তের ডাটাবেজ।',
      descEn: 'Free medical camps, critical medicine, and verified blood donor network.',
      color: '#102B3F',
      linkTarget: 'activities',
    },
    {
      icon: Briefcase,
      titleBn: 'পুরুষ ও যুবকদের কর্মসংস্থান ও স্বাবলম্বন',
      titleEn: 'Men & Youth Livelihood & Trade Skills',
      descBn: 'কর্মহীন যুবক ও পুরুষদের ভ্যান/রিকশা বিতরণ, ড্রাইভিং, মেকানিক, ইলেকট্রিক্যাল ও মোবাইল সার্ভিসিং প্রশিক্ষণ।',
      descEn: 'Battery vans, electric rickshaws, trade skill toolkits & micro-enterprise capital for young men & male breadwinners.',
      color: '#0D9488',
      linkTarget: 'activities',
    },
    {
      icon: Flower2,
      titleBn: websiteConfig?.pillar4TitleBn || 'নারী স্বাবলম্বীকরণ ও কারিগরি উইং',
      titleEn: 'Women Empowerment & Vocational Skills',
      descBn: websiteConfig?.pillar4DescBn || 'উইমেন্স টিমের তত্ত্বাবধানে প্রান্তিক নারীদের সেলাই, কুটির শিল্প ও আত্মনির্ভরতা।',
      descEn: 'Autonomous Women\'s wing tailoring, micro-enterprise & leadership.',
      color: '#E11D48',
      linkTarget: 'womens-team',
    },
  ];

  return (
    <section className="py-12 sm:py-16 space-y-16 max-w-7xl mx-auto px-4 sm:px-6">

      {/* ======================================================== */}
      {/* 1. FOUNDATION GOALS & OBJECTIVES (লক্ষ্য ও উদ্দেশ্য) */}
      {/* ======================================================== */}
      <div className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#167D78]/10 text-[#167D78] dark:text-[#D6F36A] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#167D78] dark:text-[#D6F36A]" />
            <span>{language === 'bn' ? 'আমাদের লক্ষ্য ও উদ্দেশ্য' : 'Our Goals & Objectives'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#102B3F] dark:text-white tracking-tight">
            {language === 'bn'
              ? 'মানবতার সেবায় নিবেদিত ৫টি মৌলিক স্তম্ভ'
              : '5 Core Pillars Dedicated to Serving Humanity'}
          </h2>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300">
            {websiteConfig
              ? (language === 'bn' ? websiteConfig.founderVisionBn : websiteConfig.founderVisionEn)
              : (language === 'bn'
                ? 'CoLASH Foundation কোনো ব্যক্তি বা গোষ্ঠীর স্বার্থে নয়, বরং সম্পূর্ণ নিঃস্বার্থভাবে আর্তমানবতার কল্যাণে কাজ করে।'
                : 'CoLASH Foundation works selflessly for the underprivileged without political or commercial bias.')}
          </p>
        </div>

        {/* 5 Pillars Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {goals.map((g, idx) => {
            const Icon = g.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-[#0c1a24] p-5 sm:p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md hover:border-[#167D78]/40 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105"
                    style={{ backgroundColor: g.color }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-[#102B3F] dark:text-white group-hover:text-[#167D78] dark:group-hover:text-[#D6F36A] transition-colors leading-snug">
                    {language === 'bn' ? g.titleBn : g.titleEn}
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                    {language === 'bn' ? g.descBn : g.descEn}
                  </p>
                </div>
                <button
                  onClick={() => onNavigate(g.linkTarget)}
                  className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 text-xs font-bold text-[#167D78] dark:text-[#D6F36A] flex items-center gap-1 group-hover:translate-x-1 transition-all cursor-pointer"
                >
                  <span>{language === 'bn' ? 'বিস্তারিত দেখুন' : 'Explore More'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. IMPORTANT HIGHLIGHTS GRID */}
      {/* ======================================================== */}
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#167D78] dark:text-[#D6F36A]">
              {language === 'bn' ? 'জরুরি হাইলাইটস' : 'Key Highlights'}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-[#102B3F] dark:text-white mt-1">
              {language === 'bn' ? 'চলমান মানবিক কার্যক্রম ও বিশেষ শাখা' : 'Ongoing Projects & Key Wings'}
            </h3>
          </div>
          <button
            onClick={() => onNavigate('activities')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#167D78] dark:text-[#D6F36A] hover:underline cursor-pointer shrink-0"
          >
            <span>{language === 'bn' ? 'সকল বিস্তারিত কার্যক্রম পেজে যান' : 'Go to Full Activities Page'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Annual Combined Donation Goal Progress Tracker */}
        <DonationGoalProgress
          mode="campaign"
          language={language}
          projects={projects}
          onDonateClick={() => onOpenDonate(null)}
        />

        {/* 3 Featured Projects Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredProjects.map((p, idx) => {
            const pct = Math.min(100, Math.round((p.raisedAmount / p.targetAmount) * 100));
            return (
              <div
                key={p.id}
                className="bg-white dark:bg-[#0c1a24] rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 overflow-hidden bg-stone-100 dark:bg-stone-800">
                    <img
                      src={p.image}
                      alt={language === 'bn' ? p.titleBn : p.titleEn}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#102B3F]/85 backdrop-blur-xs text-white text-[11px] font-bold uppercase">
                      {p.category}
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <h4 className="font-bold text-[#102B3F] dark:text-white text-base line-clamp-1">
                      {language === 'bn' ? p.titleBn : p.titleEn}
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                      {language === 'bn' ? p.descriptionBn : p.descriptionEn}
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-[#167D78] dark:text-[#D6F36A]">
                          ৳{p.raisedAmount.toLocaleString()} ({pct}%)
                        </span>
                        <span className="text-stone-500">
                          {language === 'bn' ? 'লক্ষ্য:' : 'Goal:'} ৳{p.targetAmount.toLocaleString()}
                        </span>
                      </div>
                      <AnimatedProgressBar
                        targetPercent={pct}
                        delayMs={idx * 90}
                        trackClassName="w-full h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden"
                        fillClassName="h-full bg-gradient-to-r from-[#167D78] to-[#D6F36A] rounded-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => onOpenDonate(p)}
                    className="w-full py-2.5 rounded-xl bg-[#167D78] hover:bg-[#126864] text-white font-bold text-xs shadow-sm cursor-pointer transition-all flex items-center justify-center gap-1.5 active:scale-98"
                  >
                    <Heart className="w-3.5 h-3.5 text-[#D6F36A] fill-[#D6F36A]/20" />
                    <span>{language === 'bn' ? 'এই ফান্ডে অনুদান দিন' : 'Donate to this Fund'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3 Special Highlight Banners: Men's Livelihood, Women's Team & Transparency */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          
          {/* Card 1: Men & Youth Employment & Livelihood Highlight */}
          <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-[#0f3443] via-[#16505c] to-[#102B3F] text-white border border-teal-500/40 shadow-lg flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-[#D6F36A] flex items-center justify-center p-2 shadow-inner border border-teal-400/30">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#D6F36A] block">
                      {language === 'bn' ? 'পুরুষ ও যুব স্বাবলম্বন' : 'Men & Youth Livelihood'}
                    </span>
                    <h4 className="text-lg font-black text-white leading-tight">
                      {language === 'bn' ? 'কর্মসংস্থান ও কারিগরি ট্রেড' : 'Vocational Trade & Jobs'}
                    </h4>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-400/30">
                  {language === 'bn' ? 'সক্রিয় উইং' : 'Active Wing'}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
                {language === 'bn'
                  ? '“বেকারত্ব দূরীকরণ, কারিগরি দক্ষতা প্রশিক্ষণ ও আত্মকর্মসংস্থানে পুরুষ ও যুবকদের স্বাবলম্বী করা”'
                  : 'Empowering unemployed youth and male breadwinners with trade skills, electric rickshaws & micro-capital.'}
              </p>

              <div className="flex flex-wrap gap-1.5 text-[11px] text-stone-200">
                <span className="px-2 py-0.5 rounded-md bg-white/10">ভ্যান ও রিকশা বিতরণ</span>
                <span className="px-2 py-0.5 rounded-md bg-white/10">ইলেকট্রিক্যাল ও মেকানিক</span>
                <span className="px-2 py-0.5 rounded-md bg-white/10">ক্ষুদ্র ব্যবসা পুঁজি</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <button
                onClick={() => onNavigate('activities')}
                className="px-4 py-2 rounded-xl bg-[#D6F36A] hover:bg-white text-[#102B3F] font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <span>{language === 'bn' ? 'কর্মসংস্থান প্রকল্প দেখুন' : 'Explore Projects'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onOpenDonate(null)}
                className="text-xs font-bold text-[#D6F36A] hover:text-white transition-colors cursor-pointer"
              >
                {language === 'bn' ? 'তহবিলে অনুদান →' : 'Donate →'}
              </button>
            </div>
          </div>

          {/* Card A: Women's Team Wing Highlight */}
          <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-rose-950/80 via-stone-900 to-[#102B3F] text-white border border-rose-500/30 shadow-lg flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={websiteConfig?.womensTeamLogoUrl || womensTeamConfig?.logoUrl || '/src/assets/images/womens_team_logo.png'}
                    alt="Women's Team Logo"
                    className="w-12 h-12 object-contain rounded-xl bg-white/10 p-1 shadow-inner border border-white/20"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120';
                    }}
                  />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 block">
                      {language === 'bn' ? 'স্বায়ত্তশাসিত নারী উইং' : 'Autonomous Women\'s Wing'}
                    </span>
                    <h4 className="text-lg font-black text-white leading-tight">
                      {womensTeamConfig ? (language === 'bn' ? womensTeamConfig.nameBn : womensTeamConfig.nameEn) : 'CoLASH Foundation Women\'s Team'}
                    </h4>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-400/30">
                  {language === 'bn' ? 'সংরক্ষিত' : 'Restricted'}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                {womensTeamConfig ? (language === 'bn' ? womensTeamConfig.mottoBn : womensTeamConfig.mottoEn) : '“নারীর মর্যাদা, শিক্ষা ও স্বাবলম্বনে আলোকিত সমাজ বিনির্মাণ”'}
              </p>

              <div className="flex flex-wrap gap-2 text-[11px] text-stone-200">
                <span className="px-2 py-0.5 rounded-md bg-white/10">মা ও শিশু স্বাস্থ্য</span>
                <span className="px-2 py-0.5 rounded-md bg-white/10">বিনামূল্যে সেলাই প্রশিক্ষণ</span>
                <span className="px-2 py-0.5 rounded-md bg-white/10">নারী অধিকার সচেতনতা</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <button
                onClick={() => onNavigate('womens-team')}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <span>{language === 'bn' ? 'উইমেন্স টিম পেজে যান' : 'Go to Women\'s Team Page'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onOpenPortal}
                className="text-xs font-bold text-rose-300 hover:text-white transition-colors cursor-pointer"
              >
                {language === 'bn' ? 'সদস্য পোর্টাল →' : 'Member Portal →'}
              </button>
            </div>
          </div>

          {/* Card B: Transparency & Accountability Highlight */}
          <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-[#102B3F] via-[#0c2233] to-[#167D78] text-white border border-teal-500/30 shadow-lg flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#167D78] flex items-center justify-center text-[#D6F36A] shadow-inner">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#D6F36A] block">
                      {language === 'bn' ? 'আর্থিক স্বচ্ছতা ও অডিট' : 'Financial Transparency & Audit'}
                    </span>
                    <h4 className="text-lg font-black text-white leading-tight">
                      {language === 'bn' ? '১০০% উন্মুক্ত অডিট লেজার' : '100% Open Audit & Ledger'}
                    </h4>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                  {language === 'bn' ? 'যাচাইকৃত' : 'Audited'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-white/10 border border-white/10">
                  <span className="font-bold block text-emerald-300">১০০% স্বচ্ছতা</span>
                  <span className="text-[10px] text-stone-300">প্রতিটি অনুদানের রসিদ</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/10 border border-white/10">
                  <span className="font-bold block text-[#D6F36A]">পাবলিক লেজার</span>
                  <span className="text-[10px] text-stone-300">ব্যাংক স্টেটমেন্ট ও ব্যয়</span>
                </div>
              </div>

              <p className="text-xs text-stone-300">
                {language === 'bn'
                  ? 'সকল অনুদান ও ব্যয়ের বিবরণী নিয়মিত প্রকাশ করা হয়। প্রতিটি টাকার যথাযথ ব্যবহার নিশ্চিত করতে আমরা বদ্ধপরিকর।'
                  : 'Every contribution and field expenditure is documented with receipts and open bank audit records.'}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <button
                onClick={() => onNavigate('activities')}
                className="px-4 py-2 rounded-xl bg-[#D6F36A] hover:bg-white text-[#102B3F] font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <span>{language === 'bn' ? 'অডিট ও কার্যক্রম দেখুন' : 'View Audit & Activities'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onOpenDonate(null)}
                className="text-xs font-bold text-[#D6F36A] hover:text-white transition-colors cursor-pointer"
              >
                {language === 'bn' ? 'অনুদান দিন →' : 'Donate Now →'}
              </button>
            </div>
          </div>

        </div>

        {/* Quick Links Banner: Committee & Notices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          
          {/* Box 1: Executive Committee & Members */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1a24] border border-stone-200 dark:border-stone-800 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#102B3F] text-[#D6F36A] flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-[#102B3F] dark:text-white text-sm">
                  {language === 'bn' ? 'কার্যনির্বাহী কমিটি ও সদস্যবৃন্দ' : 'Committee & Members'}
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  ১৬ জন কার্যনির্বাহী পরিষদ এবং সিলেট বিভাগের সাধারণ সদস্য তালিকা
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('committee')}
              className="px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-[#167D78] hover:text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
            >
              {language === 'bn' ? 'কমিটি পেজ' : 'View Page'}
            </button>
          </div>

          {/* Box 2: Latest Notice, Audit Report & Public Applications */}
          <div
            onClick={() => onNavigate('notices_applications')}
            className="p-5 rounded-2xl bg-white dark:bg-[#0c1a24] border border-stone-200 dark:border-stone-800 shadow-sm hover:border-purple-500/60 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group active:scale-[0.99]"
            title={language === 'bn' ? 'বিজ্ঞপ্তি, অডিট রিপোর্ট ও নাগরিক আবেদন পেজ খুলতে ক্লিক করুন' : 'Click to open Notices, Audit Report & Public Applications'}
          >
            <div className="flex items-start sm:items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-purple-700 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                    {language === 'bn' ? 'অডিট ও বিজ্ঞপ্তি' : 'Audit & Notice'}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {language === 'bn' ? '২০২৫-২০২৬ বার্ষিক প্রকাশনা' : 'FY 2025-26 Report'}
                  </span>
                </div>
                <h4 className="font-bold text-[#102B3F] dark:text-white text-sm mt-1 leading-snug group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                  {latestNotice ? (language === 'bn' ? latestNotice.titleBn : latestNotice.titleEn) : '২০২৫-২০২৬ অর্থবছরের চূড়ান্ত অডিট রিপোর্ট ও বার্ষিক প্রতিবেদন প্রকাশ'}
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  {language === 'bn' ? 'বিজ্ঞপ্তি, অডিট রিপোর্ট ও নাগরিক আবেদন পেজ — বিস্তারিত দেখতে স্পর্শ করুন' : 'Notices, Statutory Audit Reports & Public Application Desk — Tap to explore'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-center flex-wrap">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  exportAuditReport20252026();
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-600 hover:text-white text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-1 active:scale-95"
                title={language === 'bn' ? '২০২৫-২০২৬ চূড়ান্ত অডিট রিপোর্ট ফাইল ডাউনলোড করুন' : 'Download Audit Report'}
              >
                <Download className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'ডাউনলোড' : 'Download'}</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate('notices_applications');
                }}
                className="px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1 active:scale-95"
              >
                <span>{language === 'bn' ? 'বিজ্ঞপ্তি ও আবেদন' : 'Notices & Form'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </section>
  );
};
