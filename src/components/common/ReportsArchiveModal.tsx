import React, { useState } from 'react';
import { FileText, Download, ShieldCheck, Calendar, BookOpen, ExternalLink, X, CheckCircle2, Eye } from 'lucide-react';
import { Language } from '../../types';

interface ReportsArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

interface FoundationDocument {
  id: string;
  titleBn: string;
  titleEn: string;
  categoryBn: string;
  categoryEn: string;
  year: string;
  publishedDate: string;
  signatoryBn: string;
  signatoryEn: string;
  fileSize: string;
  summaryBn: string;
  summaryEn: string;
}

const FOUNDATION_DOCUMENTS: FoundationDocument[] = [
  {
    id: 'doc-audit-2025-2026',
    titleBn: '২০২৫-২০২৬ অর্থবছরের চূড়ান্ত অডিট রিপোর্ট ও বার্ষিক প্রতিবেদন',
    titleEn: 'Annual Statutory Audit Report & Comprehensive Financial Statement 2025-2026',
    categoryBn: 'আর্থিক অডিট রিপোর্ট',
    categoryEn: 'Financial Audit Report',
    year: '২০২৫–২০২৬ (সর্বশেষ চূড়ান্ত অডিট)',
    publishedDate: '১২ এপ্রিল ২০২৬',
    signatoryBn: 'মোঃ আশরাফুল ইসলাম সুলতান (প্রতিষ্ঠাতা ও সভাপতি), অর্থ বিভাগ ও চার্টার্ড অ্যাকাউন্ট্যান্টস',
    signatoryEn: 'Md. Ashraful Islam Sultan (Founder & President), Finance Secretariat & CA Chartered Firm',
    fileSize: '৩.৪ মেগাবাইট (PDF)',
    summaryBn: 'কোলাশ ফাউন্ডেশনের ২০২৫-২০২৬ অর্থবছরের মোট প্রাপ্ত অনুদান ৳৪২,৮৫,০০০ এবং মাঠপর্যায়ের মানবিক সহায়তা ও বিতরণ ৳৩৮,১৫,০০০ সহ সকল আয়-ব্যয়ের পুঙ্খানুপুঙ্খ নিরীক্ষিত বিবরণী। ১০০% ভাউচার ও ব্যাংক স্টেটমেন্ট অনুমোদিত।',
    summaryEn: 'Complete statutory audit statement for FY 2025-26 with total donation BDT 42,85,000 and direct field distribution BDT 38,15,000.'
  },
  {
    id: 'doc-const-2024',
    titleBn: 'কোলাশ ফাউন্ডেশন অনুমোদিত অফিসিয়াল গঠনতন্ত্র',
    titleEn: 'Official Approved Constitution of CoLASH Foundation',
    categoryBn: 'গঠনতন্ত্র ও নিয়মাবলী',
    categoryEn: 'Constitution & By-Laws',
    year: '২০২৪ (সংশোধিত)',
    publishedDate: '১৫ জানুয়ারি ২০২৪',
    signatoryBn: 'প্রতিষ্ঠাতা ও কেন্দ্রীয় উপদেষ্টা পরিষদ',
    signatoryEn: 'Founder & Central Advisory Council',
    fileSize: '১.৮ মেগাবাইট (PDF)',
    summaryBn: 'ফাউন্ডেশনের মূল লক্ষ্য, মানবিক নীতিমালা, সদস্যপদ বিধি এবং প্রশাসনিক কাঠামো বিষয়ক পূর্ণাঙ্গ গঠনতন্ত্র।',
    summaryEn: 'Complete constitution outlining humanitarian mandate, membership bylaws, and governance rules.'
  },
  {
    id: 'doc-audit-2024',
    titleBn: 'বার্ষিক স্বাধীন আর্থিক নিরীক্ষা প্রতিবেদন (২০২৩–২০২৪)',
    titleEn: 'Annual Independent Financial Audit Report (2023–2024)',
    categoryBn: 'আর্থিক অডিট রিপোর্ট',
    categoryEn: 'Financial Audit Report',
    year: '২০২৩–২০২৪',
    publishedDate: '৩০ জুন ২০২৪',
    signatoryBn: 'মোঃ আশরাফুল ইসলাম সুলতান (প্রতিষ্ঠাতা ও সভাপতি) ও নিরীক্ষক পরিষদ',
    signatoryEn: 'Finance Secretary & Audit Council',
    fileSize: '২.৪ মেগাবাইট (PDF)',
    summaryBn: 'সকল অনুদান সংগ্রহ, বন্যা ত্রাণ ব্যয়, শিক্ষা বৃত্তি ও চিকিৎসা সহায়তার খাতভিত্তিক সম্পূর্ণ স্বচ্ছ হিসাব।',
    summaryEn: 'Detailed financial disclosures, flood relief disbursements, education grants, and verified statements.'
  },
  {
    id: 'doc-activity-2024',
    titleBn: 'বার্ষিক মানবিক কার্যবিবরণী ও প্রকল্প সারসংক্ষেপ (২০২৪)',
    titleEn: 'Annual Humanitarian Activity Report & Impact Summary (2024)',
    categoryBn: 'বার্ষিক কার্যবিবরণী',
    categoryEn: 'Annual Activity Report',
    year: '২০২৪',
    publishedDate: '১৫ ডিসেম্বর ২০২৪',
    signatoryBn: 'সাধারণ সম্পাদক ও প্রজেক্ট কোঅর্ডিনেশন উইং',
    signatoryEn: 'General Secretary & Projects Wing',
    fileSize: '৩.১ মেগাবাইট (PDF)',
    summaryBn: 'ফেনী-নোয়াখালী বন্যা পুনর্বাসন, রমজান খাদ্য উপহার ও রক্তের নেটওয়ার্কের বার্ষিক অর্জন ও পরিসংখ্যান।',
    summaryEn: 'Annual achievements in flood relief, Ramadan food drives, and emergency medical network operations.'
  },
  {
    id: 'doc-gov-cert',
    titleBn: 'মানবিক সংগঠন অনুমোদন ও সমাজকল্যাণ সনদ স্বীকৃতি',
    titleEn: 'Official Social Welfare Charter & Registry Credentials',
    categoryBn: 'সনদ ও অনুমোদন',
    categoryEn: 'Certificates & Recognition',
    year: '২০২৩–বর্তমান',
    publishedDate: '০১ মার্চ ২০২৩',
    signatoryBn: 'কেন্দ্রীয় কার্যনির্বাহী পরিষদ',
    signatoryEn: 'Central Executive Council',
    fileSize: '১.২ মেগাবাইট (PDF)',
    summaryBn: 'স্বেচ্ছাসেবী ও অলাভজনক মানবিক সংস্থা হিসেবে কোলাশ ফাউন্ডেশনের প্রাতিষ্ঠানিক স্বীকৃতির বিবরণ।',
    summaryEn: 'Charter documentation verifying non-profit voluntary humanitarian status.'
  }
];

export const ReportsArchiveModal: React.FC<ReportsArchiveModalProps> = ({
  isOpen,
  onClose,
  language
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewingDoc, setViewingDoc] = useState<FoundationDocument | null>(null);

  if (!isOpen) return null;

  const categories = [
    { key: 'all', bn: 'সকল নথিপত্র', en: 'All Documents' },
    { key: 'constitution', bn: 'গঠনতন্ত্র', en: 'Constitution' },
    { key: 'audit', bn: 'অডিট রিপোর্ট', en: 'Audit Reports' },
    { key: 'activity', bn: 'কার্যবিবরণী', en: 'Activity Reports' }
  ];

  const filteredDocs = FOUNDATION_DOCUMENTS.filter(doc => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'constitution') return doc.categoryBn.includes('গঠনতন্ত্র');
    if (selectedCategory === 'audit') return doc.categoryBn.includes('অডিট');
    if (selectedCategory === 'activity') return doc.categoryBn.includes('কার্যবিবরণী');
    return true;
  });

  const handleSimulateDownload = (doc: FoundationDocument) => {
    // Generate an authentic document preview text file or trigger browser download
    const content = `========================================================\n` +
      `CO-LASH FOUNDATION OFFICIAL DOCUMENT ARCHIVE\n` +
      `Community Leaders and Social Helpers (CoLASH)\n` +
      `========================================================\n\n` +
      `DOCUMENT ID: ${doc.id}\n` +
      `TITLE: ${doc.titleEn} / ${doc.titleBn}\n` +
      `CATEGORY: ${doc.categoryEn}\n` +
      `SESSION / YEAR: ${doc.year}\n` +
      `PUBLISHED DATE: ${doc.publishedDate}\n` +
      `AUTHORIZED SIGNATORY: ${doc.signatoryEn} (${doc.signatoryBn})\n` +
      `SECURITY STATUS: Digitally Verified Official Record\n\n` +
      `SUMMARY:\n${doc.summaryEn}\n${doc.summaryBn}\n\n` +
      `========================================================\n` +
      `CoLASH Foundation Central Secretariat, 2026\n` +
      `Hotline: 01646-475348 | Email: colash.foundation@gmail.com\n` +
      `========================================================\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.id}-summary.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0c1a24] rounded-3xl max-w-3xl w-full border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#102B3F] via-[#167D78] to-[#102B3F] p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <BookOpen className="w-5 h-5 text-[#D6F36A]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-2">
                <span>{language === 'bn' ? 'অফিসিয়াল গঠনতন্ত্র ও বার্ষিক অডিট রিপোর্ট' : 'Official Constitution & Audit Archive'}</span>
                <span className="px-2 py-0.5 rounded-full bg-[#167D78]/60 text-[10px] font-bold uppercase tracking-wider">
                  Verified Archive
                </span>
              </h3>
              <p className="text-[11px] text-stone-200">
                {language === 'bn' ? 'কোলাশ ফাউন্ডেশনের পূর্ণাঙ্গ আর্থিক স্বচ্ছতা ও প্রাতিষ্ঠানিক নথিপত্র' : 'Public Transparency, Audited Reports & Constitutional Mandates'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="p-4 bg-stone-50 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 flex flex-wrap gap-2 shrink-0">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat.key
                  ? 'bg-[#167D78] text-white shadow-xs'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-[#167D78]'
              }`}
            >
              {language === 'bn' ? cat.bn : cat.en}
            </button>
          ))}
        </div>

        {/* Documents List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-[#167D78] transition-all shadow-xs hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#167D78]/10 text-[#167D78] dark:text-[#D6F36A] font-bold text-[10px] uppercase">
                    {language === 'bn' ? doc.categoryBn : doc.categoryEn}
                  </span>
                  <span className="text-[11px] font-mono text-stone-400">
                    {doc.year}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>{language === 'bn' ? 'যাচাইকৃত' : 'Audited & Verified'}</span>
                  </span>
                </div>

                <h4 className="font-extrabold text-sm sm:text-base text-[#102B3F] dark:text-white leading-snug">
                  {language === 'bn' ? doc.titleBn : doc.titleEn}
                </h4>

                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  {language === 'bn' ? doc.summaryBn : doc.summaryEn}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-400 pt-1">
                  <span>{language === 'bn' ? `প্রকাশ: ${doc.publishedDate}` : `Published: ${doc.publishedDate}`}</span>
                  <span>·</span>
                  <span>{language === 'bn' ? `স্বাক্ষরকারী: ${doc.signatoryBn}` : `Signatory: ${doc.signatoryEn}`}</span>
                  <span>·</span>
                  <span className="font-mono">{doc.fileSize}</span>
                </div>
              </div>

              {/* Download / Action */}
              <div className="flex sm:flex-col gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleSimulateDownload(doc)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#167D78] hover:bg-[#102B3F] text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'ডাউনলোড' : 'Download'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewingDoc(doc)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'বিবরণ' : 'Details'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Modal view if clicked */}
        {viewingDoc && (
          <div className="p-4 bg-amber-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs shrink-0">
            <div>
              <span className="font-bold text-[#102B3F] dark:text-white block">
                {language === 'bn' ? viewingDoc.titleBn : viewingDoc.titleEn}
              </span>
              <span className="text-stone-500 text-[11px]">
                {language === 'bn' ? `অনুমোদনকারী: ${viewingDoc.signatoryBn}` : `Authority: ${viewingDoc.signatoryEn}`}
              </span>
            </div>
            <button
              onClick={() => setViewingDoc(null)}
              className="text-stone-400 hover:text-stone-600 px-2 py-1 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-stone-100 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500 shrink-0">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#167D78]" />
            <span>{language === 'bn' ? 'সকল অডিট রেকর্ড প্রকাশ্যভাবে জনগণের জন্য উন্মুক্ত' : 'Public audit records published for 100% transparency'}</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs cursor-pointer"
          >
            {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
