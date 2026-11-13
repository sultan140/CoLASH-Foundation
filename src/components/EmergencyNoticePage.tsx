import React, { useState } from 'react';
import {
  AlertTriangle,
  Phone,
  MessageCircle,
  Heart,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  Share2,
  ExternalLink,
  Users,
  Droplets,
  PackageCheck,
  FileText
} from 'lucide-react';
import { Language, PaymentChannel, WebsiteCustomConfig } from '../types';

interface EmergencyNoticePageProps {
  language: Language;
  onBackToHome: () => void;
  onOpenDonate: (purpose?: string) => void;
  onNavigateSection: (sectionId: string) => void;
  websiteConfig?: WebsiteCustomConfig;
  paymentChannels?: PaymentChannel[];
  onToast: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const EmergencyNoticePage: React.FC<EmergencyNoticePageProps> = ({
  language,
  onBackToHome,
  onOpenDonate,
  onNavigateSection,
  websiteConfig,
  paymentChannels = [],
  onToast,
}) => {
  const [activeTab, setActiveTab] = useState<'flood' | 'haor' | 'blood'>('flood');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const hotline = websiteConfig?.hotline || '01646-475348';
  const rawPhone = hotline.replace(/[^0-9+]/g, '');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    onToast('success', language === 'bn' ? `${label} কপি করা হয়েছে` : `${label} Copied!`, text);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const activeChannels = paymentChannels.filter(c => c.isActive);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">

      {/* Top Breadcrumb & Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <button
            onClick={onBackToHome}
            className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-stone-800 hover:bg-[#167D78] hover:text-white dark:hover:bg-[#167D78] text-stone-800 dark:text-stone-200 font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs border border-stone-200 dark:border-stone-700 active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'হোম পেজে ফিরে যান' : 'Back to Home'}</span>
          </button>
          <span className="text-stone-400">/</span>
          <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
            <span>{language === 'bn' ? 'জরুরি মানবিক বিজ্ঞপ্তি' : 'Emergency Bulletin'}</span>
          </span>
          <span className="text-stone-400">/</span>
          <span className="text-stone-600 dark:text-stone-300 font-semibold truncate max-w-[220px]">
            {activeTab === 'flood'
              ? (language === 'bn' ? 'বন্যা ও শুকনো খাবার প্রস্তুতি' : 'Flood Relief Drive')
              : activeTab === 'haor'
              ? (language === 'bn' ? 'হাওরাঞ্চল সংকট সাহায্য' : 'Haor Crisis Aid')
              : (language === 'bn' ? 'জরুরি রক্ত নেটওয়ার্ক' : 'Emergency Blood Help')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'CoLASH Foundation - জরুরি মানবিক আবেদন',
                  url: window.location.href,
                }).catch(() => {});
              } else {
                copyToClipboard(window.location.href, language === 'bn' ? 'পেজ লিংক' : 'Page Link');
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'শেয়ার করুন' : 'Share Appeal'}</span>
          </button>
          <a
            href={`tel:${rawPhone}`}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Phone className="w-3.5 h-3.5 animate-bounce" />
            <span>{language === 'bn' ? 'হটলাইন কল' : 'Hotline Call'}</span>
          </a>
        </div>
      </div>

      {/* Emergency Alert Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#102B3F] via-[#0c1f2e] to-rose-950 text-white p-6 sm:p-8 md:p-10 shadow-xl overflow-hidden border border-rose-500/40">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>{language === 'bn' ? 'জরুরি রাষ্ট্রীয় ও মাঠপর্যায়ের অ্যালার্ট' : 'Critical Field Notice'}</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-white/10 text-stone-200 text-xs font-mono font-bold">
              ID: COLASH-EMG-2026-01
            </span>
            <span className="text-xs text-amber-300 font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? '২০২৬ বর্ষা ও দুর্যোগ তহবিল' : '2026 Crisis Relief'}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-snug">
            {language === 'bn'
              ? '২০২৬ বর্ষার আগাম বন্যা প্রস্তুতি ও চরাঞ্চলে জরুরি শুকনো খাবার সংগ্রহ'
              : '2026 Flash Flood Preparedness & Riverine Char Dry Rations Mobilization'}
          </h1>

          <p className="text-sm sm:text-base text-stone-200 leading-relaxed max-w-3xl">
            {language === 'bn'
              ? 'সিলেটের হাওরাঞ্চল ও মৌলভীবাজারের পাহাড়ি ঢলে আকস্মিক বন্যায় গৃহহীন পরিবার এবং নদীভাঙন ঝুঁকিতে থাকা চরাঞ্চলের অসহায় মানুষের জন্য জরুরি শুকনো খাবার, শিশুখাদ্য, বিশুদ্ধ পানি ও জরুরি ওষুধ সংগ্রহ কার্যক্রম চলছে। আপনার যাকাত ও সাধারণ অনুদানে শরিক হোন।'
              : 'Emergency mobilization for vulnerable families in Sylhet haor basin and riverine char communities facing flash flood threats. Mobilizing dry rations, infant nutrition, clean drinking water, and first-aid kits.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onOpenDonate('flood_relief')}
              className="px-6 py-3 rounded-2xl bg-[#D6F36A] hover:bg-white text-[#102B3F] font-black text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95"
            >
              <Heart className="w-4 h-4 fill-current text-rose-600" />
              <span>{language === 'bn' ? 'ত্রাণ তহবিলে সরাসরি অনুদান দিন' : 'Donate to Relief Fund'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href={`tel:${rawPhone}`}
              className="px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm flex items-center gap-2 backdrop-blur-xs transition-colors cursor-pointer"
            >
              <Phone className="w-4 h-4 text-[#D6F36A]" />
              <span>{language === 'bn' ? `হটলাইন: ${hotline}` : `Hotline: ${hotline}`}</span>
            </a>
            <a
              href={`https://wa.me/88${rawPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Navigation Tabs for Emergency Branches */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-stone-200 dark:border-stone-800">
        <button
          onClick={() => setActiveTab('flood')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'flood'
              ? 'bg-[#167D78] text-white shadow-md'
              : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          <span>{language === 'bn' ? '১. আগাম বন্যা ও শুকনো খাবার' : '1. Flood & Dry Rations'}</span>
        </button>
        <button
          onClick={() => setActiveTab('haor')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'haor'
              ? 'bg-[#167D78] text-white shadow-md'
              : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>{language === 'bn' ? '২. হাওরাঞ্চল পাহাড়ি ঢল জরুরি সাহায্য' : '2. Haor Basin Relief'}</span>
        </button>
        <button
          onClick={() => setActiveTab('blood')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'blood'
              ? 'bg-[#167D78] text-white shadow-md'
              : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
          }`}
        >
          <Droplets className="w-4 h-4 text-rose-500" />
          <span>{language === 'bn' ? '৩. জরুরি রক্ত সহায়তা নেটওয়ার্ক' : '3. 24/7 Blood Help'}</span>
        </button>
      </div>

      {/* Dynamic Tab Body */}
      {activeTab === 'flood' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 bg-white dark:bg-[#0c1a24] rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#167D78] dark:text-[#D6F36A] block">
                {language === 'bn' ? 'প্রকল্প বিবরণ ও বাস্তবায়ন পরিকল্পনা' : 'Project Scope & Execution'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#102B3F] dark:text-white mt-1">
                {language === 'bn'
                  ? 'চরাঞ্চলের অসহায় পরিবারের জন্য জরুরি শুকনো খাবার ও সামগ্রী'
                  : 'Emergency Dry Rations for Remote Riverine Char Communities'}
              </h2>
            </div>

            <div className="prose dark:prose-invert text-stone-600 dark:text-stone-300 text-sm leading-relaxed space-y-3">
              <p>
                {language === 'bn'
                  ? '২০২৬ সালের বর্ষা মৌসুমে আগাম বন্যা ও নদীভাঙন ঝুঁকিতে থাকা চরাঞ্চলের জন্য কোলাশ সেন্ট্রাল রিলিফ টিম বিশেষ খাদ্যভাণ্ডার প্রস্তুত করছে। প্রতিটি প্যাকেটে থাকবে ৫ কেজি চিঁড়া, ১ কেজি গুড়, ২ প্যাকেট বিস্কুট, ১ কেজি মুড়ি, খাবার স্যালাইন, বিশুদ্ধকরণ ট্যাবলেট ও জরুরি প্রয়োজনীয় ওষুধ।'
                  : 'CoLASH Foundation central relief team is mobilizing dry rations packets for riverine communities. Each packet contains chira, jaggery, biscuits, muri, oral rehydration saline, water purification tablets, and first-aid kits.'}
              </p>
              <p>
                {language === 'bn'
                  ? 'আমাদের স্থানীয় মাঠপর্যায়ের ভলান্টিয়ার টিম নৌকাযোগে দুর্গম এলাকায় সরাসরি মানুষের ঘরে খাবার পৌঁছে দেবে। ১০০% স্বচ্ছতা ও অডিট লেজারের মাধ্যমে প্রতিটি সহায়তার হিসাব সংরক্ষণ করা হবে।'
                  : 'Our volunteer fleet operates locally by boat to reach marooned households directly with verified CA-audited ledger records.'}
              </p>
            </div>

            {/* Target Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-center">
                <span className="text-xl sm:text-2xl font-black text-[#167D78] dark:text-[#D6F36A] block">১,৫০০+</span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold">পরিবার লক্ষ্যমাত্রা</span>
              </div>
              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-center">
                <span className="text-xl sm:text-2xl font-black text-[#102B3F] dark:text-white block">১২০+</span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold">সক্রিয় ভলান্টিয়ার</span>
              </div>
              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-center">
                <span className="text-xl sm:text-2xl font-black text-rose-600 block">২৪/৭</span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold">জরুরি হটলাইন</span>
              </div>
              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-center">
                <span className="text-xl sm:text-2xl font-black text-emerald-600 block">১০০%</span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold">নিরীক্ষিত হিসাব</span>
              </div>
            </div>

            {/* Verification Credentials Note */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 dark:text-emerald-200">
                <span className="font-bold block">ফাউন্ডেশন অফিশিয়াল নিশ্চয়তা:</span>
                <span>আপনার পাঠানো প্রতিটি অনুদানের জন্য তাৎক্ষণিক মানি রসিদ (Money Receipt) ও ভাউচার প্রদান করা হয়। কোনো প্রকার মধ্যস্বত্বভোগী ছাড়াই সরাসরি ক্ষতিগ্রস্ত মানুষের হাতে সাহায্য পৌঁছানো হয়।</span>
              </div>
            </div>
          </div>

          {/* Right Column: Payment & Donation Details */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Direct Donation Box */}
            <div className="bg-white dark:bg-[#0c1a24] rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                <Heart className="w-4 h-4 fill-current" />
                <span>{language === 'bn' ? 'অনলাইন অনুদান দিন' : 'Donate Online'}</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                {language === 'bn'
                  ? 'বিকাশ, নগদ বা সরাসরি ব্যাংকিংয়ের মাধ্যমে যেকোনো পরিমাণ অনুদান প্রদান করুন।'
                  : 'Contribute any amount securely via verified bKash, Nagad or bank transfer.'}
              </p>
              <button
                onClick={() => onOpenDonate('flood_relief')}
                className="w-full py-3 rounded-2xl bg-[#167D78] hover:bg-[#102B3F] text-white font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
              >
                <span>{language === 'bn' ? 'ত্রাণে শরিক হোন (অনুদানের ফর্ম)' : 'Join Relief Drive'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Dynamic Official bKash & Nagad Numbers */}
            <div className="bg-stone-50 dark:bg-stone-900/70 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-stone-500 block">
                {language === 'bn' ? 'অফিশিয়াল পেমেন্ট নম্বরসমূহ' : 'Official Payment Numbers'}
              </span>

              <div className="space-y-3">
                {activeChannels.length > 0 ? (
                  activeChannels.map((channel) => (
                    <div
                      key={channel.id}
                      className="p-3.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-2xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#102B3F] dark:text-white uppercase">
                          {channel.gateway === 'bkash' ? 'bKash' : 'Nagad'} ({channel.accountType})
                        </span>
                        <span className="text-[10px] text-stone-500 font-medium">
                          {channel.accountHolderName}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-base font-black text-[#167D78] dark:text-[#D6F36A]">
                          {channel.number}
                        </span>
                        <button
                          onClick={() => copyToClipboard(channel.number, channel.gateway === 'bkash' ? 'bKash' : 'Nagad')}
                          className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-700 hover:bg-[#167D78] hover:text-white text-stone-700 dark:text-stone-300 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                          title="নম্বর কপি করুন"
                        >
                          {copiedId === channel.number ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedId === channel.number ? 'কপি হয়েছে' : 'কপি'}</span>
                        </button>
                      </div>
                      {channel.instructionBn && (
                        <p className="text-[10px] text-stone-400">
                          {language === 'bn' ? channel.instructionBn : channel.instructionEn}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-center">
                    <span className="font-mono text-base font-black text-[#167D78] dark:text-[#D6F36A] block">
                      {hotline}
                    </span>
                    <span className="text-xs text-stone-500">সার্বক্ষণিক হটলাইন ও বিকাশ সাহায্য</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {activeTab === 'haor' && (
        <div className="bg-white dark:bg-[#0c1a24] rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-600 border border-amber-500/30">
              <AlertTriangle className="w-6 h-6" />
            </span>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 block">
                {language === 'bn' ? 'সংকট তহবিল' : 'Crisis Fund'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#102B3F] dark:text-white">
                {language === 'bn'
                  ? 'সিলেটের হাওরাঞ্চল ও পাহাড়ি ঢলে আকস্মিক বন্যা সাহায্য'
                  : 'Sylhet Haor Basin & Flash Flood Emergency Relief Drive'}
              </h2>
            </div>
          </div>

          <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
            {language === 'bn'
              ? 'মৌলভীবাজার, সুনামগঞ্জ ও সিলেট জেলার বিভিন্ন নিম্নাঞ্চল ও পাহাড়ি সীমান্তবর্তী উপজেলায় ভারী বৃষ্টিপাত ও উজান থেকে নেমে আসা পাহাড়ি ঢলে আকস্মিক বন্যায় প্লাবিত পরিবারগুলোর জন্য আমাদের জরুরি রেসকিউ ও ত্রাণ টিম প্রস্তুত রয়েছে। আপনার অনুদান সরাসরি শিশুদের পুষ্টি ও প্রবীণদের আশ্রয়ে ব্যবহৃত হবে।'
              : 'Our rapid rescue and relief logistics team is on active standby across vulnerable upazilas of Moulvibazar, Sunamganj, and Sylhet facing sudden flash flood inundation.'}
          </p>

          <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="font-bold text-sm text-[#102B3F] dark:text-white block">
                {language === 'bn' ? 'জরুরি যোগাযোগ ও ত্রাণ সমন্বয়ক ডেস্ক' : 'Relief Coordinator Desk'}
              </span>
              <span className="text-xs text-stone-500">হটলাইন: {hotline} (২৪ ঘণ্টা উন্মুক্ত)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenDonate('urgent_aid')}
                className="px-4 py-2 rounded-xl bg-[#167D78] text-white font-bold text-xs shadow-sm hover:bg-[#102B3F] transition-all cursor-pointer"
              >
                {language === 'bn' ? 'হাওর ফান্ডে অনুদান দিন' : 'Donate to Haor Fund'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'blood' && (
        <div className="bg-white dark:bg-[#0c1a24] rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-rose-500/15 text-rose-600 border border-rose-500/30">
              <Droplets className="w-6 h-6" />
            </span>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 block">
                {language === 'bn' ? 'সারাদেশে জরুরি সেবা' : 'Nationwide 24/7 Network'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#102B3F] dark:text-white">
                {language === 'bn'
                  ? 'কোলাশ জরুরি রক্ত সহায়তা নেটওয়ার্ক'
                  : 'CoLASH Central Emergency Blood Donor Directory'}
              </h2>
            </div>
          </div>

          <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
            {language === 'bn'
              ? 'মুমূর্ষু রোগীর রক্তের প্রয়োজনে যেকোনো সময় সরাসরি আমাদের সেন্ট্রাল ব্লাড ডিরেক্টরি এবং হটলাইনে যোগাযোগ করুন। মৌলভীবাজার ও সিলেট বিভাগের শতাধিক নিবন্ধিত রক্তদাতার মাধ্যমে দ্রুত রক্ত নিশ্চিত করা হয়।'
              : 'Direct connection with verified blood donors across Sylhet division for patients in critical condition.'}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={`tel:${rawPhone}`}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Phone className="w-4 h-4" />
              <span>{language === 'bn' ? `রক্তের প্রয়োজনে কল করুন: ${hotline}` : `Call for Blood: ${hotline}`}</span>
            </a>
            <button
              onClick={() => onNavigateSection('members')}
              className="px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-bold text-xs transition-colors cursor-pointer"
            >
              {language === 'bn' ? 'রক্তদাতা সদস্য তালিকা দেখুন' : 'View Donor Members'}
            </button>
          </div>
        </div>
      )}

      {/* Footer Navigation Strip */}
      <div className="p-6 rounded-3xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400">
          <FileText className="w-4 h-4 text-[#167D78]" />
          <span>{language === 'bn' ? 'অন্যান্য নোটিশ বা কার্যক্রম দেখতে চান?' : 'Looking for other notices?'}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigateSection('notices')}
            className="px-4 py-2 rounded-xl bg-white dark:bg-stone-800 hover:bg-[#167D78] hover:text-white text-xs font-bold text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 shadow-2xs transition-all cursor-pointer"
          >
            {language === 'bn' ? 'সকল সাধারণ বিজ্ঞপ্তি পেজ' : 'All Notices Page'}
          </button>
          <button
            onClick={() => onNavigateSection('activities')}
            className="px-4 py-2 rounded-xl bg-white dark:bg-stone-800 hover:bg-[#167D78] hover:text-white text-xs font-bold text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 shadow-2xs transition-all cursor-pointer"
          >
            {language === 'bn' ? 'সকল প্রকল্প ও কার্যক্রম' : 'All Activities'}
          </button>
          <button
            onClick={onBackToHome}
            className="px-4 py-2 rounded-xl bg-[#102B3F] hover:bg-[#167D78] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            ← {language === 'bn' ? 'মূল পেজে ফিরে যান' : 'Back to Home'}
          </button>
        </div>
      </div>

    </div>
  );
};
