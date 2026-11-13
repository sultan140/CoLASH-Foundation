import React, { useState } from 'react';
import {
  Heart,
  Users,
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  Play,
  Pause,
  Phone,
  BellRing,
  ChevronRight
} from 'lucide-react';
import { Language, WebsiteCustomConfig } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { MagneticButton } from './common/MagneticButton';
import { EmergencyNoticeModal, EmergencyNoticeData } from './common/EmergencyNoticeModal';

interface HeroProps {
  language: Language;
  onOpenDonate: () => void;
  onOpenVolunteer: () => void;
  onOpenNoticePage?: (noticeId?: string) => void;
  websiteConfig?: WebsiteCustomConfig;
}

export const Hero: React.FC<HeroProps> = ({
  language,
  onOpenDonate,
  onOpenVolunteer,
  onOpenNoticePage,
  websiteConfig
}) => {
  const t = TRANSLATIONS[language];
  const [isTickerPaused, setIsTickerPaused] = useState(false);

  // Active Emergency Notice Items for the Running News-Ticker
  const tickerNotice1: EmergencyNoticeData = {
    id: 'notice-flood-2026',
    badgeBn: 'জরুরি নোটিশ',
    badgeEn: 'Urgent Notice',
    titleBn: websiteConfig?.noticeTickerBn || 'জরুরি নোটিশ: ২০২৬ বর্ষার আগাম বন্যা প্রস্তুতি ও চরাঞ্চলে জরুরি শুকনো খাবার সংগ্রহে আপনার যাকাত ও অনুদানে শরিক হোন। হটলাইন: 01646-475348',
    titleEn: websiteConfig?.noticeTickerEn || 'Emergency Notice: Join flash flood readiness and char dry ration relief campaign. Hotline: 01646-475348',
    descriptionBn: '২০২৬ বর্ষার আগাম বন্যা ও নদীভাঙন ঝুঁকিতে থাকা চরাঞ্চলের অসহায় পরিবারগুলোর জন্য জরুরি শুকনো খাবার, শিশুখাদ্য, বিশুদ্ধ পানি ও জরুরি ওষুধ সংগ্রহ চলছে। আপনার যাকাত ও সাধারণ অনুদান পাঠিয়ে এই মানবিক উদ্যোগে শরিক হোন। হটলাইন: 01646-475348',
    descriptionEn: 'Emergency relief supplies, infant food packets and clean drinking water are being mobilized for vulnerable riverine families. Donate your Zakat and humanitarian support. Hotline: 01646-475348',
    hotline: '01646-475348',
    category: 'flood_relief',
    date: '২০২৬ বর্ষা প্রস্তুতি'
  };

  const tickerNotice2: EmergencyNoticeData = {
    id: 'notice-haor-crisis',
    badgeBn: 'জরুরি মানবিক আবেদন',
    badgeEn: 'Urgent Relief Drive',
    titleBn: websiteConfig?.urgentBannerTitleBn
      ? `${websiteConfig.urgentBannerTitleBn} · ২০২৬ জরুরি সাহায্য`
      : 'জরুরি মানবিক আবেদন · ২০২৬ জরুরি সাহায্য',
    titleEn: websiteConfig?.urgentBannerTitleEn || 'Urgent Humanitarian Appeal · 2026 Crisis Aid',
    descriptionBn: websiteConfig?.urgentBannerTextBn || 'সিলেটের হাওরাঞ্চল ও পাহাড়ি ঢলে আকস্মিক বন্যায় গৃহহীন পরিবারগুলোর মাঝে জরুরি খাদ্য ও শিশুখাদ্য পৌঁছে দিতে আপনার অনুদান পাঠিয়ে সহায়তা করুন। হটলাইন: 01646-475348',
    descriptionEn: websiteConfig?.urgentBannerTextEn || 'Provide emergency meals, infant nutrition kits, and shelter support to displaced families in Sylhet haor areas. Hotline: 01646-475348',
    hotline: '01646-475348',
    category: 'urgent_aid',
    date: '২০২৬ সংকট তহবিল'
  };

  const tickerNotice3: EmergencyNoticeData = {
    id: 'notice-blood-network',
    badgeBn: 'জরুরি রক্তের ডাক',
    badgeEn: '24/7 Blood Help',
    titleBn: 'জরুরি রক্ত সহায়তা নেটওয়ার্ক: দেশের যেকোনো প্রান্তে রক্তের প্রয়োজনে কোলাশ সেন্ট্রাল ডিরেক্টরি থেকে সরাসরি রক্তদাতার সাথে যোগাযোগ করুন। হটলাইন: 01646-475348',
    titleEn: 'Emergency Blood Network: Connect with verified donors nationwide 24/7. Hotline: 01646-475348',
    descriptionBn: 'মুমূর্ষু রোগীর জরুরি রক্তের প্রয়োজনে কোলাশ ফাউন্ডেশনের রক্তদাতা ডিরেক্টরি ২৪ ঘণ্টা উন্মুক্ত। রক্ত পেতে বা স্বেচ্ছায় রক্তদান করতে যোগাযোগ করুন। হটলাইন: 01646-475348',
    descriptionEn: 'Verified donor directory available 24/7. Call our emergency hotline for rapid matching.',
    hotline: '01646-475348',
    category: 'blood_help',
    date: '২৪ ঘণ্টা সচল'
  };

  const noticeItems = [tickerNotice1, tickerNotice2, tickerNotice3];

  const handleNoticeClick = (noticeId: string = 'flood') => {
    if (onOpenNoticePage) {
      onOpenNoticePage(noticeId);
    } else {
      window.location.hash = '#emergency-notice';
    }
  };

  return (
    <section id="home" className="relative pt-6 pb-12 lg:pt-10 lg:pb-16 overflow-hidden">
      
      {/* Embedded CSS for guaranteed cross-browser marquee animation without stuck states */}
      <style>{`
        @keyframes continuousTickerSlide {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
        @-webkit-keyframes continuousTickerSlide {
          0% {
            -webkit-transform: translate3d(0, 0, 0);
          }
          100% {
            -webkit-transform: translate3d(-50%, 0, 0);
          }
        }
        .hero-ticker-track {
          display: inline-flex !important;
          flex-direction: row !important;
          flex-wrap: nowrap !important;
          width: max-content !important;
          min-width: 200% !important;
          animation: continuousTickerSlide 28s linear infinite !important;
          -webkit-animation: continuousTickerSlide 28s linear infinite !important;
          animation-timing-function: linear !important;
          -webkit-animation-timing-function: linear !important;
          transform: translate3d(0, 0, 0);
          -webkit-transform: translate3d(0, 0, 0);
          will-change: transform;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          perspective: 1000px;
          -webkit-perspective: 1000px;
        }
        .hero-ticker-track.is-paused {
          animation-play-state: paused !important;
          -webkit-animation-play-state: paused !important;
        }
      `}</style>

      {/* 1. Horizontal Continuous News-Ticker Marquee Announcement Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-4">
        <div className="relative bg-gradient-to-r from-[#167D78]/15 via-amber-500/10 to-[#102B3F]/15 dark:from-[#167D78]/25 dark:via-amber-500/15 dark:to-[#102B3F]/30 border border-[#167D78]/30 dark:border-[#167D78]/40 rounded-2xl p-1.5 sm:p-2 flex items-center shadow-xs overflow-hidden">
          
          {/* Static Emergency Badge with Animated Radar Pulse Beacon */}
          <div
            onClick={() => handleNoticeClick('flood')}
            role="button"
            tabIndex={0}
            className="flex items-center gap-1.5 shrink-0 z-20 bg-white/95 dark:bg-[#0c1a24]/95 px-2.5 py-1.5 rounded-xl border border-[#167D78]/30 shadow-xs mr-2 cursor-pointer hover:bg-white transition-colors active:scale-95"
            title={language === 'bn' ? 'জরুরি নোটিশ আলাদা পেজে দেখুন' : 'Click to view notice page'}
          >
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-emergency-beacon absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-[#167D78] text-[#D6F36A] text-[10px] font-black uppercase tracking-wider">
              {language === 'bn' ? 'জরুরি নোটিশ' : 'Live Ticker'}
            </span>
            <span className="hidden md:inline-flex text-[10px] text-stone-500 font-mono font-bold">
              ২০২৬
            </span>
          </div>

          {/* Continuous Running Marquee Viewport with CSS Animation */}
          <div
            className="flex-1 overflow-hidden relative select-none w-full"
            title={language === 'bn' ? 'বিস্তারিত দেখতে স্পর্শ বা ক্লিক করুন' : 'Click any notice to view full page'}
          >
            <div
              className={`hero-ticker-track ${isTickerPaused ? 'is-paused' : ''}`}
              style={{
                animation: isTickerPaused ? 'none' : 'continuousTickerSlide 30s linear infinite',
                WebkitAnimation: isTickerPaused ? 'none' : 'continuousTickerSlide 30s linear infinite',
              }}
            >
              {/* Duplicate notice list 4 times for seamless infinite loop with zero jump on any screen size */}
              {[...noticeItems, ...noticeItems, ...noticeItems, ...noticeItems].map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  onClick={() => handleNoticeClick(item.category || item.id)}
                  role="button"
                  tabIndex={0}
                  className="inline-flex items-center gap-2 mx-3 px-3 py-1.5 rounded-xl bg-white/85 hover:bg-white dark:bg-stone-900/80 dark:hover:bg-stone-900 border border-stone-200/90 dark:border-stone-800 hover:border-[#167D78] dark:hover:border-[#D6F36A] transition-all cursor-pointer shadow-2xs shrink-0 active:scale-95 group/item"
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 group-hover/item:animate-ping" />
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                    {language === 'bn' ? item.badgeBn : item.badgeEn}
                  </span>
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 group-hover/item:text-[#167D78] dark:group-hover/item:text-[#D6F36A] transition-colors whitespace-nowrap">
                    {language === 'bn' ? item.titleBn : item.titleEn}
                  </span>
                  <span className="text-[10px] text-stone-400 group-hover/item:text-[#167D78] dark:group-hover/item:text-[#D6F36A] font-bold ml-1 inline-flex items-center gap-0.5">
                    <span>{language === 'bn' ? '👆 পেজ খুলুন' : 'Open Page'}</span>
                    <ChevronRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pause / Play Toggle Control */}
          <div className="shrink-0 z-20 ml-2 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsTickerPaused(!isTickerPaused)}
              className="p-1.5 rounded-xl bg-white/90 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-[#167D78] dark:hover:text-[#D6F36A] transition-colors cursor-pointer border border-stone-200 dark:border-stone-700 shadow-2xs"
              title={isTickerPaused ? (language === 'bn' ? 'চলমান করুন' : 'Resume Ticker') : (language === 'bn' ? 'বিরতি দিন' : 'Pause Ticker')}
            >
              {isTickerPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
          </div>

        </div>
      </div>

      {/* 2. Urgent Crisis Notification Banner - Animated & Touch Interactive */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6">
        <div
          onClick={() => handleNoticeClick('haor')}
          className="bg-gradient-to-r from-[#102B3F] via-[#0c2436] to-[#102B3F] text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[#E6A15B]/50 hover:border-[#E6A15B] shadow-md hover:shadow-lg transition-all cursor-pointer group active:scale-[0.99] relative overflow-hidden"
          title={language === 'bn' ? 'জরুরি বিস্তারিত পেজ দেখতে ক্লিক করুন' : 'Click to view relief page'}
        >
          {/* Subtle background glow effect */}
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#E6A15B]/15 rounded-full blur-2xl pointer-events-none group-hover:bg-[#E6A15B]/25 transition-all" />

          <div className="flex items-center gap-3.5 z-10 min-w-0">
            <div className="relative shrink-0">
              <span className="p-2.5 rounded-xl bg-[#E6A15B]/25 text-[#E6A15B] flex items-center justify-center border border-[#E6A15B]/40 group-hover:scale-105 transition-transform">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </span>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
            </div>

            <div className="min-w-0">
              <div className="text-xs font-black uppercase tracking-wider text-[#E6A15B] flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-[#E6A15B]/20 text-[#E6A15B] border border-[#E6A15B]/30 font-bold">
                  {websiteConfig?.urgentBannerTitleBn || t.urgentAppeal}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-amber-200 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D6F36A] animate-ping" />
                  <span>· ২০২৬ জরুরি সাহায্য</span>
                </span>
              </div>
              <p className="text-sm sm:text-base font-semibold text-stone-100 mt-1 leading-snug group-hover:text-white transition-colors">
                {websiteConfig?.urgentBannerTextBn || t.urgentBannerText}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-300 mt-1">
                <span className="text-[#D6F36A] font-mono font-bold flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span>হটলাইন: 01646-475348</span>
                </span>
                <span className="text-stone-400">·</span>
                <span className="text-stone-300 underline underline-offset-2 flex items-center gap-0.5 group-hover:text-[#D6F36A]">
                  <span>{language === 'bn' ? '👆 আলাদা পেজে বিস্তারিত বিবরণ দেখুন' : 'View Full Details Page'}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 z-10 shrink-0 self-end sm:self-center">
            <MagneticButton
              onClick={(e) => {
                e.stopPropagation();
                onOpenDonate();
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-extrabold text-[#102B3F] bg-[#D6F36A] hover:bg-white rounded-xl transition-all cursor-pointer shadow-md active:scale-95 btn-primary-interaction"
            >
              <span>{websiteConfig?.urgentBannerBtnBn || (language === 'bn' ? 'ত্রাণে শরিক হোন' : 'Join Relief Drive')}</span>
              <ArrowRight className="w-4 h-4" />
            </MagneticButton>
          </div>
        </div>
      </div>

      {/* Main Hero Split Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          
          {/* Left Column: Brand Statement & Primary Action */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#167D78] dark:text-[#D6F36A] mb-3">
              <Sparkles className="w-4 h-4 text-[#E6A15B]" />
              <span className="tracking-wide uppercase">
                {language === 'bn' ? 'অসাম্প্রদায়িক, অরাজনৈতিক ও অলাভজনক মানবিক উদ্যোগ' : 'Independent Humanitarian Organization'}
              </span>
              <span className="text-stone-300 dark:text-stone-700">·</span>
              <span className="text-stone-600 dark:text-stone-300 font-mono font-bold">
                {language === 'bn'
                  ? `প্রতিষ্ঠিত: ${websiteConfig?.foundingDateBn || '০৭-০৩-২০২৬'} · ${websiteConfig?.foundingLocationBn || 'কমলগঞ্জ, মৌলভীবাজার'}`
                  : `Est. 07-03-2026 · Kamalganj, Moulvibazar`}
              </span>
            </div>

            <div className="mb-2">
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#167D78] dark:text-[#D6F36A] block">
                {websiteConfig ? (language === 'bn' ? websiteConfig.siteTitleBn : websiteConfig.siteTitleEn) : 'COLASH'} — {websiteConfig ? (language === 'bn' ? websiteConfig.siteSubtitleBn : websiteConfig.siteSubtitleEn) : 'Circle of Light and Service for Humanity'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#102B3F] dark:text-white tracking-tight leading-[1.18] text-balance mb-3">
              {websiteConfig ? (language === 'bn' ? websiteConfig.heroHeadingBn : websiteConfig.heroHeadingEn) : t.heroTitle}
            </h1>

            {/* Official Slogan Callout */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#D6F36A]/20 border border-[#D6F36A]/40 text-[#102B3F] dark:text-[#D6F36A] font-serif italic text-sm sm:text-base mb-4">
              <span>{websiteConfig ? (language === 'bn' ? websiteConfig.siteSloganBn : websiteConfig.siteSloganEn) : `“${t.sloganBn}”`}</span>
              <span className="hidden sm:inline text-xs font-sans not-italic text-stone-500 dark:text-stone-400">· {websiteConfig?.siteSloganEn || t.sloganEn}</span>
            </div>

            <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed max-w-2xl mb-8">
              {websiteConfig ? (language === 'bn' ? websiteConfig.heroSubheadingBn : websiteConfig.heroSubheadingEn) : t.heroSubtitle}
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-8">
              <MagneticButton
                onClick={onOpenDonate}
                className="flex items-center gap-2.5 px-6 py-3.5 text-sm font-bold text-white bg-[#167D78] hover:bg-[#102B3F] dark:hover:bg-[#135955] rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer group btn-primary-interaction"
              >
                <Heart className="w-4 h-4 fill-current text-[#D6F36A] group-hover:scale-110 transition-transform" />
                <span>{t.heroCtaDonate}</span>
                <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
              </MagneticButton>

              <MagneticButton
                onClick={onOpenVolunteer}
                className="flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-[#102B3F] dark:text-white bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 hover:border-[#167D78] rounded-xl transition-all shadow-sm cursor-pointer btn-outline-interaction"
              >
                <Users className="w-4 h-4 text-[#167D78] dark:text-[#D6F36A]" />
                <span>{t.heroCtaVolunteer}</span>
              </MagneticButton>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-stone-500 dark:text-stone-400 pt-6 border-t border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#167D78]" />
                <span>{language === 'bn' ? '১০০% ব্যাংক ও বিকাশ নিরীক্ষিত' : '100% Audited Fund Flow'}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#167D78]" />
                <span>{language === 'bn' ? 'তাৎক্ষণিক ই-মানি রসিদ ও ভাউচার' : 'Instant Verified Receipt & Certificate'}</span>
              </div>
            </div>

          </div>

          {/* Right Column: High-Impact Visual Presentation with Scrim */}
          <div className="lg:col-span-5 relative">
            <div className="relative w-full h-[360px] sm:h-[440px] lg:h-full rounded-2xl overflow-hidden shadow-lg border border-stone-200 dark:border-stone-800 bg-stone-200 dark:bg-stone-800">
              <img
                src={websiteConfig?.heroImageUrl || '/src/assets/images/hero_humanitarian_care_1792170805861.jpg'}
                alt="CoLASH Foundation volunteers distributing humanitarian aid to children and community"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                loading="eager"
              />
              {/* Measured contrast scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#102B3F]/90 via-[#102B3F]/25 to-transparent flex flex-col justify-end p-6">
                <div className="text-white">
                  <div className="text-xs uppercase tracking-widest font-semibold text-[#D6F36A] mb-1">
                    {language === 'bn' ? 'মাঠপর্যায়ের চিত্র' : 'Direct Ground Action'}
                  </div>
                  <h3 className="text-lg font-bold text-white leading-snug">
                    {language === 'bn' 
                      ? 'কুড়িগ্রামের দুর্গম চরে শিক্ষা ও পুষ্টি উপকরণ বিতরণ' 
                      : 'Educational & Nutritional Aid Distribution in Kurigram Chars'}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-stone-300 mt-2">
                    <span>{language === 'bn' ? 'স্থান: উলিপুর ইউনিয়ন' : 'Location: Ulipur Union'}</span>
                    <span>·</span>
                    <span>{language === 'bn' ? 'উপকারভোগী: ৪৫০+ শিশু' : 'Beneficiaries: 450+ children'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 4-Item Operational Impact Ribbon (Fully Customizable A-to-Z from Admin) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-5 sm:p-6 bg-white dark:bg-[#0c1a24] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
          
          {/* Stat 1 */}
          <div className="p-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#102B3F] dark:text-white tabular-nums tracking-tight">
              {websiteConfig?.stat1Number || '14,500+'}
            </div>
            <div className="text-xs font-semibold text-stone-700 dark:text-stone-300 mt-1">
              {websiteConfig ? (language === 'bn' ? websiteConfig.stat1LabelBn : websiteConfig.stat1LabelBn) : t.statBeneficiaries}
            </div>
            <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
              {websiteConfig ? (language === 'bn' ? websiteConfig.stat1SubtextBn : websiteConfig.stat1SubtextBn) : (language === 'bn' ? 'সরাসরি সহায়তা প্রাপ্ত পরিবার' : 'Verified recipient families')}
            </div>
          </div>

          {/* Stat 2 */}
          <div className="p-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#167D78] dark:text-[#D6F36A] tabular-nums tracking-tight">
              {websiteConfig?.stat2Number || '38+'}
            </div>
            <div className="text-xs font-semibold text-stone-700 dark:text-stone-300 mt-1">
              {websiteConfig ? (language === 'bn' ? websiteConfig.stat2LabelBn : websiteConfig.stat2LabelBn) : t.statProjects}
            </div>
            <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
              {websiteConfig ? (language === 'bn' ? websiteConfig.stat2SubtextBn : websiteConfig.stat2SubtextBn) : (language === 'bn' ? '১৬টি দুর্গম উপজেলায় কার্যক্রম' : 'Covering 16 remote upazilas')}
            </div>
          </div>

          {/* Stat 3 */}
          <div className="p-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#102B3F] dark:text-white tabular-nums tracking-tight">
              {websiteConfig?.stat3Number || '850+'}
            </div>
            <div className="text-xs font-semibold text-stone-700 dark:text-stone-300 mt-1">
              {websiteConfig ? (language === 'bn' ? websiteConfig.stat3LabelBn : websiteConfig.stat3LabelBn) : t.statVolunteers}
            </div>
            <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
              {websiteConfig ? (language === 'bn' ? websiteConfig.stat3SubtextBn : websiteConfig.stat3SubtextBn) : (language === 'bn' ? 'সারাদেশে নিবেদিত তরুণ দল' : 'Dedicated nationwide network')}
            </div>
          </div>

          {/* Stat 4 */}
          <div className="p-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#E6A15B] tabular-nums tracking-tight">
              {websiteConfig?.stat4Number || '100%'}
            </div>
            <div className="text-xs font-semibold text-stone-700 dark:text-stone-300 mt-1">
              {websiteConfig ? (language === 'bn' ? websiteConfig.stat4LabelBn : websiteConfig.stat4LabelBn) : t.statTransparency}
            </div>
            <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
              {websiteConfig ? (language === 'bn' ? websiteConfig.stat4SubtextBn : websiteConfig.stat4SubtextBn) : (language === 'bn' ? 'স্বতন্ত্র সিএ ফার্ম নিরীক্ষিত' : 'Independent CA chartered audit')}
            </div>
          </div>

        </div>
      </div>

    </section>
  );
};
