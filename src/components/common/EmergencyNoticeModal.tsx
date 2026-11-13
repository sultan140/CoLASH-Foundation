import React, { useState } from 'react';
import {
  AlertTriangle,
  Phone,
  Heart,
  Share2,
  Copy,
  Check,
  X,
  ExternalLink,
  ShieldAlert,
  BellRing,
  Droplets,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Language } from '../../types';

export interface EmergencyNoticeData {
  id: string;
  badgeBn: string;
  badgeEn: string;
  titleBn: string;
  titleEn: string;
  descriptionBn: string;
  descriptionEn: string;
  hotline: string;
  category: 'flood_relief' | 'urgent_aid' | 'blood_help';
  date: string;
}

interface EmergencyNoticeModalProps {
  notice: EmergencyNoticeData | null;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onOpenDonate?: () => void;
  onToast?: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
}

export const EmergencyNoticeModal: React.FC<EmergencyNoticeModalProps> = ({
  notice,
  isOpen,
  onClose,
  language,
  onOpenDonate,
  onToast
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !notice) return null;

  const handleCopy = () => {
    const textToCopy = `${notice.titleBn}\n${notice.descriptionBn}\nহটলাইন: ${notice.hotline}\nকোলাশ ফাউন্ডেশন - মানবতার কল্যাণে নিবেদিত`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
    if (onToast) {
      onToast(
        'success',
        language === 'bn' ? 'নোটিশ কপি করা হয়েছে!' : 'Notice Copied!',
        language === 'bn' ? 'জরুরি তথ্যাবলী ক্লিপবোর্ডে কপি করা হয়েছে।' : 'Notice details copied to clipboard.'
      );
    }
  };

  const handleDonateClick = () => {
    onClose();
    if (onOpenDonate) {
      onOpenDonate();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0c1a24] rounded-3xl max-w-lg w-full border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden relative flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-[#102B3F] p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20 shadow-xs">
                <BellRing className="w-5 h-5 text-amber-300 animate-bounce" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-wider">
                  {language === 'bn' ? notice.badgeBn : notice.badgeEn}
                </span>
                <span className="text-[10px] text-stone-200 font-mono">
                  {notice.date}
                </span>
              </div>
              <h3 className="font-extrabold text-base sm:text-lg text-white leading-tight mt-0.5">
                {language === 'bn' ? notice.titleBn : notice.titleEn}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Main Notice Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-white leading-snug">
                  {language === 'bn' ? notice.titleBn : notice.titleEn}
                </h4>
                <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-sans">
                  {language === 'bn' ? notice.descriptionBn : notice.descriptionEn}
                </p>
              </div>
            </div>
          </div>

          {/* 24/7 Emergency Hotline Card */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  {language === 'bn' ? 'জরুরি কেন্দ্রীয় হটলাইন (২৪/৭)' : 'Emergency 24/7 Hotline'}
                </span>
                <span className="text-sm sm:text-base font-extrabold font-mono text-[#102B3F] dark:text-white">
                  {notice.hotline}
                </span>
              </div>
            </div>

            <a
              href={`tel:${notice.hotline.replace(/[^0-9]/g, '')}`}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-transform active:scale-95 inline-flex items-center gap-1.5 shrink-0"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'সরাসরি কল' : 'Call Now'}</span>
            </a>
          </div>

          {/* Quick Notice Insights */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <span className="text-[10px] font-bold uppercase text-stone-400 block mb-0.5">
                {language === 'bn' ? 'প্রকল্প ক্যাটাগরি' : 'Relief Category'}
              </span>
              <span className="font-bold text-[#167D78] dark:text-[#D6F36A]">
                {language === 'bn' ? 'জরুরি বন্যা ও মানবিক ত্রাণ' : 'Flash Flood & Disaster Aid'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <span className="text-[10px] font-bold uppercase text-stone-400 block mb-0.5">
                {language === 'bn' ? 'তহবিল ও স্বচ্ছতা' : 'Transparency Status'}
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {language === 'bn' ? '১০০% ভাউচার ও অডিটভুক্ত' : '100% Ledger Audited'}
              </span>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied') : (language === 'bn' ? 'নোটিশ কপি' : 'Copy Notice')}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDonateClick}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
              <span>{language === 'bn' ? 'ত্রাণে অনুদান পাঠান' : 'Donate to Relief'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs transition-colors cursor-pointer"
            >
              {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
