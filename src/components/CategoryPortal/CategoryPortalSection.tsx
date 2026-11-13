import React from 'react';
import {
  Info,
  Users,
  Sparkles,
  Calendar,
  FileText,
  UserCheck,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Compass,
  Heart,
  ChevronRight,
  Send,
  Layers,
  Search,
  ScanLine
} from 'lucide-react';
import { Language, PortalCategoryKey } from '../../types';

interface CategoryPortalSectionProps {
  language: Language;
  activeCategory: PortalCategoryKey;
  onSelectCategory: (category: PortalCategoryKey) => void;
  onOpenPortal: () => void;
  onOpenSearch: () => void;
  onOpenScanner?: () => void;
  onOpenDonate: () => void;
  onOpenVolunteer: () => void;
}

export const CategoryPortalSection: React.FC<CategoryPortalSectionProps> = ({
  language,
  activeCategory,
  onSelectCategory,
  onOpenPortal,
  onOpenSearch,
  onOpenScanner,
  onOpenDonate,
  onOpenVolunteer,
}) => {
  // Define the 8 Categories required by User
  const categories = [
    {
      id: 'about' as PortalCategoryKey,
      titleBn: 'About Us',
      subtitleBn: 'পরিচিতি, লক্ষ্য ও উদ্দেশ্য',
      titleEn: 'About Us',
      subtitleEn: 'Mission, Vision & Principles',
      icon: Heart,
      badgeBn: 'ফাউন্ডেশন লক্ষ্য',
      badgeEn: 'Our Mission',
      accentColor: 'from-[#167D78] to-[#102B3F]',
      lightBg: 'bg-teal-50/60 dark:bg-teal-950/20 border-teal-200 dark:border-teal-900/60',
      descriptionBn: 'CoLASH Foundation-এর মূল ভিত্তি, অরাজনৈতিক সেবার চেতনা ও স্থায়ী মানবকল্যাণ লক্ষ্য।'
    },
    {
      id: 'committee' as PortalCategoryKey,
      titleBn: 'Committee & Members',
      subtitleBn: 'মূল কমিটি ও সদস্য তালিকা',
      titleEn: 'Committee & Members',
      subtitleEn: 'Governing Body & Member Directory',
      icon: Users,
      badgeBn: 'নেতৃত্ব ও সদস্যবৃন্দ',
      badgeEn: 'Leadership',
      accentColor: 'from-[#102B3F] to-[#1e4a6d]',
      lightBg: 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/60',
      descriptionBn: 'কেন্দ্রীয় কার্যনির্বাহী পরিষদ, উপদেষ্টা পরিষদ এবং সাধারণ সদস্যদের পূর্ণাঙ্গ ডাটাবেজ।'
    },
    {
      id: 'womens_team' as PortalCategoryKey,
      titleBn: 'Women’s Team',
      subtitleBn: 'আলাদা কমিটি, সদস্য ও কার্যক্রম',
      titleEn: 'Women’s Team',
      subtitleEn: 'Autonomous Wing & Activities',
      icon: Sparkles,
      badgeBn: 'স্বাধীন উইং',
      badgeEn: 'Autonomous Wing',
      accentColor: 'from-rose-500 to-pink-700',
      lightBg: 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60',
      descriptionBn: 'নারীদের স্বাবলম্বীকরণ, শিক্ষা বৃত্তি ও সচেতনতামূলক বিশেষ প্রকল্পসমূহ।'
    },
    {
      id: 'activities' as PortalCategoryKey,
      titleBn: 'Activities & Events',
      subtitleBn: 'অনুষ্ঠান, ইভেন্ট ও গ্যালারি',
      titleEn: 'Activities & Events',
      subtitleEn: 'Humanitarian Projects & Field Gallery',
      icon: Calendar,
      badgeBn: 'মাঠপর্যায়ের কাজ',
      badgeEn: 'Field Operations',
      accentColor: 'from-amber-600 to-orange-700',
      lightBg: 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60',
      descriptionBn: 'চলমান ৫টি মানবিক প্রকল্প, অডিট লেজার, ফটো গ্যালারি ও আসন্ন সামাজিক ইভেন্টস।'
    },
    {
      id: 'notices_applications' as PortalCategoryKey,
      titleBn: 'Notice & Applications',
      subtitleBn: 'নোটিশ, আবেদন, অভিযোগ ও মেসেজ',
      titleEn: 'Notice & Applications',
      subtitleEn: 'Bulletins, Messages & Tracking',
      icon: FileText,
      badgeBn: 'নাগরিক সেবা ও ট্র্যাকিং',
      badgeEn: 'Public Tracking',
      accentColor: 'from-purple-600 to-indigo-800',
      lightBg: 'bg-purple-50/60 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/60',
      descriptionBn: 'জরুরি বিজ্ঞপ্তি দেখা, লগইন ছাড়া যে কারো আবেদন/মেসেজ পাঠানো ও ট্র্যাকিং আইডি দিয়ে স্ট্যাটাস যাচাই।'
    },
    {
      id: 'member_login' as PortalCategoryKey,
      titleBn: 'Member Login',
      subtitleBn: 'সদস্যদের লগইন ও ড্যাশবোর্ড',
      titleEn: 'Member Login',
      subtitleEn: 'Portal Access & Verification',
      icon: UserCheck,
      badgeBn: 'সদস্য পোর্টাল',
      badgeEn: 'Member Area',
      accentColor: 'from-emerald-600 to-teal-800',
      lightBg: 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60',
      descriptionBn: 'নিবন্ধিত সদস্য ও স্বেচ্ছাসেবকদের ব্যক্তিগত ড্যাশবোর্ড, আইডি কার্ড ও সার্ভিস লগ।'
    },
    {
      id: 'contact_location' as PortalCategoryKey,
      titleBn: 'Contact & Location',
      subtitleBn: 'যোগাযোগের তথ্য ও Google Maps',
      titleEn: 'Contact & Location',
      subtitleEn: 'Head Office & Interactive Maps',
      icon: MapPin,
      badgeBn: 'ঠিকানা ও হটলাইন',
      badgeEn: 'Office & Maps',
      accentColor: 'from-stone-700 to-stone-900',
      lightBg: 'bg-stone-100/60 dark:bg-stone-900/60 border-stone-300 dark:border-stone-800',
      descriptionBn: 'কমলগঞ্জ ও সিলেট অফিস, সার্বক্ষণিক হটলাইন নম্বর এবং গুগল ম্যাপে ডিরেকশন।'
    }
  ];

  const handleCategoryClick = (id: PortalCategoryKey) => {
    if (id === 'member_login') {
      onOpenPortal();
    } else {
      onSelectCategory(id);
    }
  };

  return (
    <section className="py-10 sm:py-14 bg-white/70 dark:bg-[#0c1a24]/60 border-b border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#167D78]/10 text-[#167D78] dark:text-[#D6F36A] text-xs font-bold uppercase tracking-wider mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'মডুলার ক্যাটাগরি ব্রাউজিং' : 'Categorized Department Portal'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#102B3F] dark:text-white tracking-tight">
              {language === 'bn' ? 'ফাউন্ডেশনের বিভাগসমূহ বেছে নিন' : 'Explore Foundation Categories'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-xl">
              {language === 'bn'
                ? 'হোম পেজে সবকিছু একসঙ্গে ভিড় না করে আপনার প্রয়োজনীয় নির্দিষ্ট বিভাগ নির্বাচন করুন। ভিজিটর যে অপশনে ক্লিক করবেন, শুধু সেই বিভাগের বিস্তারিত তথ্য প্রদর্শিত হবে।'
                : 'Select any specific department below to open only that section with deep details, search, and intuitive back navigation.'}
            </p>
          </div>

          {/* Quick Actions Strip */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onSelectCategory('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                activeCategory === 'all'
                  ? 'bg-[#102B3F] text-white border-[#102B3F] shadow-sm'
                  : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              {language === 'bn' ? '🌐 সব সেকশন একসাথে' : '🌐 View All Continuous'}
            </button>
            <button
              onClick={onOpenSearch}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'স্মার্ট সার্চ' : 'Search'}</span>
            </button>
            {onOpenScanner && (
              <button
                type="button"
                onClick={onOpenScanner}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#167D78] hover:bg-[#102B3F] text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <ScanLine className="w-3.5 h-3.5 text-[#D6F36A]" />
                <span>{language === 'bn' ? 'ক্যামেরা ID স্ক্যান' : 'Scan ID (Camera)'}</span>
              </button>
            )}
          </div>
        </div>

        {/* 8 Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isCurrentActive = activeCategory === cat.id;

            return (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`group relative rounded-2xl border p-5 sm:p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden hover:shadow-xl hover:-translate-y-1 ${cat.lightBg} ${
                  isCurrentActive ? 'ring-2 ring-[#167D78] shadow-lg' : ''
                }`}
              >
                {/* Top Strip */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.accentColor} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-white/80 dark:bg-black/40 text-stone-700 dark:text-stone-300 border border-stone-200/60 dark:border-stone-700/60">
                      {language === 'bn' ? cat.badgeBn : cat.badgeEn}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-black text-[#102B3F] dark:text-white group-hover:text-[#167D78] dark:group-hover:text-[#D6F36A] transition-colors flex items-center justify-between">
                      <span>{language === 'bn' ? cat.titleBn : cat.titleEn}</span>
                      <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#167D78] dark:text-[#D6F36A]" />
                    </h3>
                    <div className="text-xs font-semibold text-stone-500 dark:text-stone-400 mt-0.5">
                      {language === 'bn' ? cat.subtitleBn : cat.subtitleEn}
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed line-clamp-2">
                    {cat.descriptionBn}
                  </p>
                </div>

                {/* Bottom Action Hint */}
                <div className="pt-4 mt-3 border-t border-stone-200/60 dark:border-stone-800/60 flex items-center justify-between text-xs font-bold text-[#167D78] dark:text-[#D6F36A]">
                  <span>{language === 'bn' ? 'বিস্তারিত বিভাগ খুলুন' : 'Open Section'}</span>
                  <span className="text-stone-400 group-hover:text-[#167D78] transition-colors">→</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
