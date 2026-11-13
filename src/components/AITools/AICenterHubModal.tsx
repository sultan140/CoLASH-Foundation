import React from 'react';
import {
  Bot,
  Shirt,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search
} from 'lucide-react';
import { Language } from '../../types';

interface AICenterHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onOpenMainChatbot: () => void;
  onOpenMensAdvisor: () => void;
  onOpenWomensAdvisor?: () => void;
  onOpenSearch: () => void;
}

export const AICenterHubModal: React.FC<AICenterHubModalProps> = ({
  isOpen,
  onClose,
  language,
  onOpenMainChatbot,
  onOpenMensAdvisor,
  onOpenSearch,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-[#0c1a24] max-w-xl w-full rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-6 flex flex-col">

        {/* Header */}
        <div className="bg-[#102B3F] text-white p-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#167D78] flex items-center justify-center text-[#D6F36A] shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">
                  {language === 'bn' ? 'CoLASH Foundation AI Hub' : 'CoLASH Foundation AI Hub'}
                </h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#D6F36A] text-[#102B3F]">
                  100% Free
                </span>
              </div>
              <p className="text-xs text-stone-300">
                {language === 'bn'
                  ? 'আপনার প্রয়োজনীয় এআই সহকারী নির্বাচন করুন'
                  : 'Select an AI assistant for your needs'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-200 hover:text-white rounded-xl bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body with Public & Member AI Options */}
        <div className="p-6 space-y-4">

          {/* AI Option 1: Main AI Chatbot */}
          <div
            onClick={() => {
              onClose();
              onOpenMainChatbot();
            }}
            className="p-5 rounded-2xl border border-teal-200 dark:border-teal-900 bg-teal-50/50 dark:bg-teal-950/20 hover:bg-teal-100/50 dark:hover:bg-teal-950/40 transition-all cursor-pointer group flex items-start gap-4 shadow-xs"
          >
            <div className="w-12 h-12 rounded-xl bg-[#167D78] text-[#D6F36A] flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
              <Bot className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-base text-[#102B3F] dark:text-white group-hover:text-[#167D78] dark:group-hover:text-[#D6F36A] transition-colors">
                    ১. Main AI Chatbot
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                    {language === 'bn' ? 'সবার জন্য উন্মুক্ত' : 'Public Access'}
                  </span>
                </div>
                <span className="text-xs font-bold text-[#167D78] dark:text-[#D6F36A] flex items-center gap-1">
                  চালু করুন <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
                {language === 'bn'
                  ? 'ফাউন্ডেশনের সকল কার্যক্রম, প্রকল্প ও সাধারণ তথ্য সহায়তায় তাৎক্ষণিক উত্তর।'
                  : 'Public assistant for all foundation activities, projects and general inquiries.'}
              </p>
            </div>
          </div>

          {/* AI Option 2: Men’s Dress & Style Advisor */}
          <div
            onClick={() => {
              onClose();
              onOpenMensAdvisor();
            }}
            className="p-5 rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100/50 dark:hover:bg-blue-950/40 transition-all cursor-pointer group flex items-start gap-4 shadow-xs"
          >
            <div className="w-12 h-12 rounded-xl bg-[#102B3F] text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
              <Shirt className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-base text-[#102B3F] dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    ২. Men’s Dress & Style Advisor
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300">
                    {language === 'bn' ? 'CoLASH সদস্যের জন্য সংরক্ষিত' : 'Members Only'}
                  </span>
                </div>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  চালু করুন <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
                {language === 'bn'
                  ? 'রেজিস্টার্ড সদস্যদের জন্য ব্যক্তিগত পোশাক সমন্বয় ও গ্রুমিং গাইড।'
                  : 'Personal attire coordination and grooming guide for registered members.'}
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#167D78]" />
            <span>{language === 'bn' ? 'সব টুল ১০০% ফ্রি ও নিরাপদ' : 'All tools 100% free & private'}</span>
          </div>
          <button
            onClick={() => {
              onClose();
              onOpenSearch();
            }}
            className="text-stone-600 dark:text-stone-300 hover:text-stone-900 font-bold flex items-center gap-1 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'অথবা ওয়েবসাইট সার্চ করুন' : 'Or Search Site'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
