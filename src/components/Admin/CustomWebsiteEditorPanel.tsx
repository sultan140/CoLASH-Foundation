import React, { useState, useRef } from 'react';
import {
  Palette,
  LayoutTemplate,
  Type,
  Image as ImageIcon,
  Save,
  Send,
  RotateCcw,
  Eye,
  CheckCircle2,
  AlertCircle,
  Upload,
  Trash2,
  Sparkles,
  Shield,
  Layers,
  Heart,
  ExternalLink,
  Crown,
  FileCheck2,
  Check,
  Building2,
  CreditCard,
  Smartphone,
  Copy,
  BarChart3,
  BookOpen,
  Calendar,
  MapPin,
  Share2,
  Phone,
  Mail,
  Info
} from 'lucide-react';
import { WebsiteCustomConfig, AdminUser, Language } from '../../types';

interface CustomWebsiteEditorPanelProps {
  currentAdmin: AdminUser | null;
  language: Language;
  publishedConfig: WebsiteCustomConfig;
  onPublishConfig: (newConfig: WebsiteCustomConfig) => void;
  onToast: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
}

const PRESET_PALETTES = [
  {
    nameBn: 'ক্লাসিক টিল ও নেভি (অফিসিয়াল)',
    nameEn: 'Classic Teal & Navy (Official)',
    primary: '#167D78',
    secondary: '#102B3F',
    accent: '#D6F36A',
    bg: '#F5F3ED'
  },
  {
    nameBn: 'রয়্যাল নীল ও গোল্ডেন সিলেট',
    nameEn: 'Royal Blue & Gold Sylhet',
    primary: '#1D4ED8',
    secondary: '#0F172A',
    accent: '#FBBF24',
    bg: '#F8FAFC'
  },
  {
    nameBn: 'এমেরাল্ড গ্রিন ও আর্থি চারকোল',
    nameEn: 'Emerald Green & Earth Charcoal',
    primary: '#059669',
    secondary: '#111827',
    accent: '#A7F3D0',
    bg: '#F3F4F6'
  },
  {
    nameBn: 'রোজি ক্রিমসন ও ডিপ মিডনাইট',
    nameEn: 'Rose Crimson & Deep Midnight',
    primary: '#BE123C',
    secondary: '#18181B',
    accent: '#FDE047',
    bg: '#FFF1F2'
  }
];

export const CustomWebsiteEditorPanel: React.FC<CustomWebsiteEditorPanelProps> = ({
  currentAdmin,
  language,
  publishedConfig,
  onPublishConfig,
  onToast
}) => {
  // Check permission
  const isSuperAdmin = currentAdmin?.role === 'super_admin';
  const hasPermission = isSuperAdmin || Boolean(currentAdmin?.permissions.canManageWebsiteEditor);

  // Active tab within the Website Editor
  const [activeTab, setActiveTab] = useState<
    'text' | 'hero_stats' | 'philosophy' | 'bank' | 'contact_footer' | 'colors' | 'images' | 'preview'
  >('hero_stats');

  // Draft state (initialized from publishedConfig or LocalStorage draft)
  const [draftConfig, setDraftConfig] = useState<WebsiteCustomConfig>(() => {
    try {
      const savedDraft = localStorage.getItem('colash_draft_website_config');
      return savedDraft ? JSON.parse(savedDraft) : { ...publishedConfig, isPublished: false };
    } catch {
      return { ...publishedConfig, isPublished: false };
    }
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Hidden file inputs for image uploads
  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroImageInputRef = useRef<HTMLInputElement>(null);
  const womensLogoInputRef = useRef<HTMLInputElement>(null);
  const founderImageInputRef = useRef<HTMLInputElement>(null);

  const updateDraftField = <K extends keyof WebsiteCustomConfig>(key: K, value: WebsiteCustomConfig[K]) => {
    setDraftConfig(prev => {
      const next = { ...prev, [key]: value, isPublished: false };
      return next;
    });
    setHasUnsavedChanges(true);
  };

  // Handle image upload from computer
  const handleImageFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldKey: 'logoUrl' | 'heroImageUrl' | 'womensTeamLogoUrl' | 'founderImageUrl'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      onToast('error', language === 'bn' ? 'ফাইল সাইজ অনেক বড়' : 'File too large', language === 'bn' ? 'সর্বোচ্চ ৩ মেগাবাইট সাইজের ছবি নির্বাচন করুন।' : 'Maximum allowed size is 3MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        updateDraftField(fieldKey, result);
        onToast('success', language === 'bn' ? 'ছবি আপলোড সম্পন্ন' : 'Image Uploaded', language === 'bn' ? 'খসড়া রূপে নতুন ছবি যুক্ত হয়েছে।' : 'New image added to draft.');
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Draft (Local only)
  const handleSaveDraft = () => {
    try {
      localStorage.setItem('colash_draft_website_config', JSON.stringify({ ...draftConfig, isPublished: false }));
      setHasUnsavedChanges(false);
      onToast(
        'info',
        language === 'bn' ? 'খসড়া সংরক্ষণ সম্পন্ন' : 'Draft Saved',
        language === 'bn' ? 'পরিবর্তনগুলো খসড়া হিসেবে সংরক্ষিত হয়েছে। লাইভ সাইটে দেখাতে "পাবলিশ" করুন।' : 'Changes saved as draft. Click Publish to apply live.'
      );
    } catch (e) {
      console.error(e);
      onToast('error', 'Failed to save draft');
    }
  };

  // Publish Draft to Live Website
  const handlePublish = () => {
    if (!hasPermission) {
      onToast('error', language === 'bn' ? 'অনুমতি নেই' : 'Unauthorized', language === 'bn' ? 'শুধুমাত্র অনুমোদিত অ্যাডমিন ওয়েবসাইট পাবলিশ করতে পারেন।' : 'Only authorized admins can publish website edits.');
      return;
    }

    const finalConfig: WebsiteCustomConfig = {
      ...draftConfig,
      isPublished: true,
      lastPublishedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      lastPublishedBy: currentAdmin ? `${currentAdmin.name} (${currentAdmin.roleTitleBn})` : 'Super Admin'
    };

    onPublishConfig(finalConfig);
    setDraftConfig(finalConfig);
    setHasUnsavedChanges(false);
    try {
      localStorage.setItem('colash_published_website_config', JSON.stringify(finalConfig));
      localStorage.removeItem('colash_draft_website_config');
    } catch (e) {
      console.error(e);
    }

    onToast(
      'success',
      language === 'bn' ? 'ওয়েবসাইটে সফলভাবে পাবলিশ হয়েছে!' : 'Published Live Successfully!',
      language === 'bn' ? 'সকল টেক্সট, পরিসংখ্যান, চার্টার, ব্যাংক ও ডিজাইনের পরিবর্তন লাইভ ওয়েবসাইটে সক্রিয় করা হয়েছে।' : 'All website customization changes are now active on the live website.'
    );
  };

  // Discard Draft / Revert to Published
  const handleDiscardDraft = () => {
    setDraftConfig({ ...publishedConfig, isPublished: true });
    setHasUnsavedChanges(false);
    try {
      localStorage.removeItem('colash_draft_website_config');
    } catch (e) {
      console.error(e);
    }
    onToast('info', language === 'bn' ? 'খসড়া পরিবর্তন বাতিল করা হয়েছে' : 'Draft changes discarded');
  };

  // Reset to initial factory defaults
  const handleResetToDefaults = () => {
    if (window.confirm(language === 'bn' ? 'আপনি কি নিশ্চিত যে ওয়েবসাইট ডিজাইন ও টেক্সট ডিফল্ট অবস্থায় ফিরিয়ে নিতে চান?' : 'Reset all website custom settings to original defaults?')) {
      const defaultConfig: WebsiteCustomConfig = {
        siteTitleBn: 'COLASH FOUNDATION',
        siteTitleEn: 'CoLASH Foundation',
        siteSloganBn: '“জীবন আলোকিত করুন। মানবতার সেবা করুন।”',
        siteSloganEn: '“Illuminate Lives. Serve Humanity.”',
        siteSubtitleBn: 'মানবতার জন্য আলো এবং সেবার বলয়',
        siteSubtitleEn: 'Circle of Light & Service for Humanity',
        hotline: '01646-475348',
        contactEmail: 'contact@colash.org',
        addressBn: 'কমলগঞ্জ উপজেলা পরিষদ সংলগ্ন, মৌলভীবাজার, সিলেট',
        addressEn: 'Near Kamalganj Upazila Parishad, Moulvibazar, Sylhet',
        heroBadgeBn: 'রেজিস্ট্রেশন প্রক্রিয়াধীন অলাভজনক মানবিক সংস্থা · মৌলভীবাজার, সিলেট',
        heroBadgeEn: 'Non-Profit Voluntary Humanitarian Foundation · Sylhet Division',
        heroHeadingBn: 'সিলেটের প্রত্যন্ত জনপদে শিক্ষা, স্বাস্থ্য ও দুর্যোগে অবিচল মানবিক হাত',
        heroHeadingEn: 'Unwavering Humanitarian Support for Education, Health & Disaster Relief',
        heroSubheadingBn: 'কোলাশ ফাউন্ডেশন সুবিধা-বঞ্চিত শিশু, গৃহহীন পরিবার ও দুর্যোগ কবলিত মানুষের অধিকার ও মর্যাদা রক্ষায় শতভাগ স্বচ্ছতা ও দায়িত্বশীলতার সাথে নিবেদিত।',
        heroSubheadingEn: 'CoLASH Foundation is committed to defending the dignity and livelihood of underprivileged families and children with 100% financial transparency.',
        founderVisionBn: '“মানবসেবা কোনো বিশেষ ঋতু বা ক্ষণিকের উদ্যোগ নয়; এটি সমাজের সুবিধাবঞ্চিত প্রতিটি মানুষের মৌলিক অধিকার নিশ্চিত করার একটি টেকসই সংগ্রাম। কোলাশ ফাউন্ডেশনের প্রতিটি সদস্য ও ভলান্টিয়ার এই পবিত্র আমানতের পাহারাদার।”',
        founderVisionEn: '“Humanitarian service is not an episodic relief drive; it is a dedicated, transparent mission to protect dignity and empower marginalized children and families to stand self-reliant.”',
        primaryColor: '#167D78',
        secondaryColor: '#102B3F',
        accentColor: '#D6F36A',
        bgTone: '#F5F3ED',
        fontFamily: 'Hind Siliguri',
        borderRadius: 'rounded-2xl',
        logoUrl: '/src/assets/images/colash_official_logo_1792483287868.jpg',
        heroImageUrl: '/src/assets/images/hero_humanitarian_care_1792170805861.jpg',
        womensTeamLogoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
        founderImageUrl: '/src/assets/images/regenerated_image_1792260857503.jpg',
        bankName: 'Dutch-Bangla Bank PLC (DBBL)',
        bankAccountName: 'CoLASH Foundation',
        bankAccountNumber: '107.110.458921',
        bankBranch: 'মৌলভীবাজার শাখা, সিলেট',
        bankRouting: '090271891',
        bkashNumber: '01646-475348',
        nagadNumber: '01308-241288',
        rocketNumber: '01646-475348-9',
        stat1Number: '14,500+',
        stat1LabelBn: 'সরাসরি উপকৃত মানুষ',
        stat1SubtextBn: 'সরাসরি সহায়তা প্রাপ্ত পরিবার',
        stat2Number: '38+',
        stat2LabelBn: 'চলমান ও সম্পন্ন প্রকল্প',
        stat2SubtextBn: '১৬টি দুর্গম উপজেলায় কার্যক্রম',
        stat3Number: '100%',
        stat3LabelBn: 'আর্থিক স্বচ্ছতা ও জবাবদিহি',
        stat3SubtextBn: 'পাবলিক ভাউচার ও অডিট লেজার',
        stat4Number: '24/7',
        stat4LabelBn: 'জরুরি ফিল্ড রেসপন্স টিম',
        stat4SubtextBn: 'আকস্মিক বন্যায় বোট রেসকিউ',
        noticeTickerBn: 'জরুরি নোটিশ: ২০২৬ বর্ষার আগাম বন্যা প্রস্তুতি ও চরাঞ্চলে জরুরি শুকনো খাবার সংগ্রহে আপনার যাকাত ও অনুদানে শরিক হোন। হটলাইন: 01646-475348',
        noticeTickerEn: 'Emergency Notice: Join flash flood readiness and char dry ration relief campaign. Hotline: 01646-475348',
        urgentBannerTitleBn: 'জরুরি মানবিক আবেদন',
        urgentBannerTextBn: 'সিলেটের হাওরাঞ্চল ও পাহাড়ি ঢলে আকস্মিক বন্যায় গৃহহীন পরিবারগুলোর মাঝে জরুরি খাদ্য ও শিশুখাদ্য পৌঁছে দিতে আপনার অনুদান পাঠিয়ে সহায়তা করুন।',
        urgentBannerBtnBn: 'ত্রাণে শরিক হোন',
        foundingDateBn: '০৭-০৩-২০২৬ খ্রিস্টাব্দ',
        foundingLocationBn: 'কমলগঞ্জ, মৌলভীবাজার (সিলেট বিভাগ)',
        charterTitleBn: 'প্রতিষ্ঠার ঐতিহাসিক প্রেক্ষাপট ও সাংবিধানিক মূলনীতি',
        charterStatementBn: '“সিলেটের প্রান্তিক ও চা শ্রমিক জনপদ, হাওর ও চরাঞ্চলের বঞ্চিত শিশুদের মৌলিক শিক্ষার অধিকার এবং আকস্মিক বন্যা ও স্বাস্থ্যঝুঁকিতে তাৎক্ষণিক আশ্রয় নিশ্চিতের প্রত্যয়ে একদল তরুণ সংগঠক ও পেশাজীবীর যৌথ সংকল্পে ২০২৬ সালের ৭ই মার্চ কমলগঞ্জে কোলাশ ফাউন্ডেশন প্রতিষ্ঠিত হয়।”',
        missionBn: 'প্রাকৃতিক দুর্যোগ, দারিদ্র্য ও অনগ্রসরতায় পিছিয়ে পড়া মানুষের মৌলিক মানবিক মর্যাদা সুরক্ষা, শিশুদের শিক্ষা নিশ্চিতকরণ এবং নারীদের আত্মনির্ভরশীল করে তোলা।',
        visionBn: 'একটি বৈষম্যহীন, আলোকিত ও মানবিক বাংলাদেশ—যেখানে প্রতিটি মানুষ দুর্যোগে দ্রুত সহায়তা পাবে এবং স্বাবলম্বী হয়ে আত্মসম্মানের সাথে বাঁচবে।',
        pillar1TitleBn: 'শিক্ষা ও মেধা বিকাশ',
        pillar1DescBn: 'সুবিধাবঞ্চিত শিশুদের জন্য শিক্ষা বৃত্তি, বিনামূল্যে স্কুল ব্যাগ ও গল্পের বই বিতরণ কর্মসূচি।',
        pillar1StatBn: '৪৫০+ বার্ষিক বৃত্তি',
        pillar2TitleBn: 'দুর্যোগ ও জরুরি খাদ্য ত্রাণ',
        pillar2DescBn: 'আকস্মিক বন্যায় নিজস্ব লাইফবোট রেসকিউ টিম ও প্রত্যন্ত চরে সরাসরি রান্না করা খাবার ও শুকনো রেশন বিতরণ।',
        pillar2StatBn: '৮,২০০+ পরিবারে ত্রাণ',
        pillar3TitleBn: 'ভ্রাম্যমাণ স্বাস্থ্য ক্যাম্প ও ওষুধ',
        pillar3DescBn: 'বিশেষজ্ঞ চিকিৎসকদের উপস্থিতিতে বিনামূল্যে রক্তদান, স্বাস্থ্য পরীক্ষা, প্রেসক্রিপশন ও জীবনরক্ষাকারী ওষুধ সরবরাহ।',
        pillar3StatBn: '১,৮৫০+ বিনামূল্যে রোগী',
        pillar4TitleBn: 'নারীর আত্মনির্ভরশীলতা ও কর্মসংস্থান',
        pillar4DescBn: 'বিধবা ও অসহায় মায়েদের বিনামূল্যে সেলাই মেশিন প্রদান, হস্তশিল্প প্রশিক্ষণ ও ক্ষুদ্র উদ্যোক্তা ঋণ সহায়তা।',
        pillar4StatBn: '১২০+ কর্মজীবী মা',
        facebookUrl: 'https://www.facebook.com/CoLASHFoundation',
        instagramUrl: 'https://www.instagram.com/colashfoundation',
        youtubeUrl: 'https://www.youtube.com/@CoLASHFoundation',
        linkedinUrl: 'https://www.linkedin.com/company/colash-foundation',
        footerAboutBn: 'কোলাশ ফাউন্ডেশন (Circle of Light & Service for Humanity) সিলেট বিভাগের মৌলভীবাজারে প্রতিষ্ঠিত একটি সম্পূর্ণ অরাজনৈতিক ও অলাভজনক মানবিক সংগঠন। জীবন আলোকিত করুন, মানবতার সেবা করুন।',
        footerCopyrightBn: '© ২০২৬ CoLASH Foundation. সর্বস্বত্ব সংরক্ষিত।',
        regNumberBn: 'Reg: CLF-BD-2026-SYL',
        isPublished: true
      };
      setDraftConfig(defaultConfig);
      setHasUnsavedChanges(true);
    }
  };

  if (!hasPermission) {
    return (
      <div className="p-8 text-center bg-white dark:bg-[#0c1a24] rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4 max-w-lg mx-auto my-8">
        <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 mx-auto flex items-center justify-center">
          <Shield className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-stone-900 dark:text-white">
          {language === 'bn' ? 'অ্যাক্সেস সংরক্ষিত' : 'Restricted Access'}
        </h3>
        <p className="text-xs text-stone-600 dark:text-stone-400">
          {language === 'bn'
            ? 'ওয়েবসাইটের কনটেন্ট, রং ও ডিজাইন এডিট করার জন্য আপনার অ্যাকাউন্টে "Website Editor" পারমিশন প্রয়োজন। দয়া করে প্রধান অ্যাডমিনের (Super Admin) সাথে যোগাযোগ করুন।'
            : 'You do not have Website Editor permissions. Please contact the Super Admin.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Control Actions */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#102B3F] via-[#0e2435] to-[#167D78] text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#D6F36A]" />
            <h3 className="text-base sm:text-lg font-bold">
              {language === 'bn' ? '১০০% সম্পূর্ণ ওয়েবসাইট কাস্টমাইজার (A to Z Full Site Control)' : 'A to Z Website Customizer & Content Manager'}
            </h3>
          </div>
          <p className="text-xs text-stone-300">
            {language === 'bn'
              ? 'কোডিং ছাড়া সাইটের প্রতিটি হেডিং, ৪টি পরিসংখ্যান, জরুরি ব্যানার, ৪টি মূল স্তম্ভ, চার্টার, ব্যাংক অ্যাকাউন্ট ও ছবি লাইভ পরিবর্তন করুন।'
              : 'Customize every headline, the 4 stats, urgent banner, 4 pillars, charter, bank details, and images without code.'}
          </p>
          <div className="flex items-center gap-3 text-[11px] text-stone-300 pt-1">
            <span>
              {language === 'bn' ? 'সর্বশেষ পাবলিশ:' : 'Last Published:'}{' '}
              <strong className="text-white">{publishedConfig.lastPublishedAt || 'আজ'}</strong>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              {hasUnsavedChanges ? (
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {language === 'bn' ? 'অপ্রকাশিত খসড়া পরিবর্তন রয়েছে' : 'Unpublished changes in draft'}
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {language === 'bn' ? 'লাইভ সাইটের সাথে পুরোপুরি সিঙ্কড' : 'Synced with live site'}
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
              previewMode
                ? 'bg-[#D6F36A] text-[#102B3F]'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{previewMode ? (language === 'bn' ? 'প্রিভিউ বন্ধ' : 'Hide Preview') : (language === 'bn' ? 'লাইভ প্রিভিউ' : 'Live Preview')}</span>
          </button>

          <button
            onClick={handleSaveDraft}
            className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/25 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            title="খসড়া হিসেবে ব্রাউজারে সংরক্ষণ করুন"
          >
            <Save className="w-3.5 h-3.5 text-[#D6F36A]" />
            <span>{language === 'bn' ? 'সেভ ড্রাফট' : 'Save Draft'}</span>
          </button>

          <button
            onClick={handlePublish}
            className="px-4 py-2 rounded-xl bg-[#D6F36A] hover:bg-[#c8e855] text-[#102B3F] text-xs font-extrabold transition-all cursor-pointer shadow-md flex items-center gap-1.5 hover:scale-105 active:scale-95"
            title="লাইভ ওয়েবসাইটে পরিবর্তনগুলো প্রকাশ করুন"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'পাবলিশ করুন (Publish Live)' : 'Publish Live'}</span>
          </button>

          <button
            onClick={handleDiscardDraft}
            disabled={!hasUnsavedChanges}
            className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 text-xs font-bold transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1"
            title="অপ্রকাশিত খসড়া বাতিল করুন"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'বাতিল' : 'Cancel'}</span>
          </button>
        </div>
      </div>

      {/* Live Preview Simulation Drawer */}
      {previewMode && (
        <div className="p-5 sm:p-6 rounded-2xl bg-stone-100 dark:bg-[#071017] border-2 border-dashed border-[#167D78] dark:border-[#D6F36A] space-y-4">
          <div className="flex items-center justify-between border-b border-stone-300 dark:border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#167D78] dark:text-[#D6F36A]">
                {language === 'bn' ? 'খসড়া লাইভ প্রিভিউ মকআপ (Live Preview Mockup)' : 'Live Preview Simulation'}
              </span>
            </div>
            <span className="text-xs text-stone-500">
              {language === 'bn' ? 'পাবলিশ করার পর ওয়েবসাইটটি যেভাবে দেখাবে' : 'How the website will appear after publishing'}
            </span>
          </div>

          <div
            className="p-6 rounded-2xl shadow-xl space-y-6 transition-all"
            style={{
              backgroundColor: draftConfig.bgTone || '#F5F3ED',
              fontFamily: draftConfig.fontFamily || 'Hind Siliguri'
            }}
          >
            {/* Mock Header */}
            <div
              className="p-4 rounded-xl flex items-center justify-between text-white shadow-md"
              style={{ backgroundColor: draftConfig.secondaryColor || '#102B3F' }}
            >
              <div className="flex items-center gap-3">
                {draftConfig.logoUrl ? (
                  <img src={draftConfig.logoUrl} alt="Logo" className="w-9 h-9 object-contain rounded-lg bg-white/10 p-0.5" />
                ) : (
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: draftConfig.primaryColor }}>
                    <Heart className="w-5 h-5 fill-current" style={{ color: draftConfig.accentColor }} />
                  </div>
                )}
                <div>
                  <div className="font-extrabold text-sm tracking-tight">{draftConfig.siteTitleBn}</div>
                  <div className="text-[10px] opacity-80">{draftConfig.siteSubtitleBn}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg font-bold text-[#102B3F]" style={{ backgroundColor: draftConfig.accentColor }}>
                  {language === 'bn' ? 'অনুদান দিন' : 'Donate'}
                </span>
              </div>
            </div>

            {/* Mock Hero */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white/80 dark:bg-black/30 backdrop-blur-md border border-stone-200/50 shadow-sm space-y-4">
              <div className="inline-block px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: `${draftConfig.primaryColor}20`, color: draftConfig.primaryColor }}>
                {draftConfig.heroBadgeBn}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white leading-tight">
                {draftConfig.heroHeadingBn}
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed max-w-2xl">
                {draftConfig.heroSubheadingBn}
              </p>
              
              {/* Mock 4 Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
                <div className="p-2.5 bg-white dark:bg-stone-800/80 rounded-xl shadow-xs">
                  <div className="text-lg font-black text-stone-900 dark:text-white">{draftConfig.stat1Number || '14,500+'}</div>
                  <div className="text-[10px] font-bold text-[#167D78]">{draftConfig.stat1LabelBn}</div>
                </div>
                <div className="p-2.5 bg-white dark:bg-stone-800/80 rounded-xl shadow-xs">
                  <div className="text-lg font-black text-[#167D78]">{draftConfig.stat2Number || '38+'}</div>
                  <div className="text-[10px] font-bold text-[#167D78]">{draftConfig.stat2LabelBn}</div>
                </div>
                <div className="p-2.5 bg-white dark:bg-stone-800/80 rounded-xl shadow-xs">
                  <div className="text-lg font-black text-stone-900 dark:text-white">{draftConfig.stat3Number || '850+'}</div>
                  <div className="text-[10px] font-bold text-[#167D78]">{draftConfig.stat3LabelBn}</div>
                </div>
                <div className="p-2.5 bg-white dark:bg-stone-800/80 rounded-xl shadow-xs">
                  <div className="text-lg font-black text-[#E6A15B]">{draftConfig.stat4Number || '100%'}</div>
                  <div className="text-[10px] font-bold text-[#167D78]">{draftConfig.stat4LabelBn}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-stone-200 dark:border-stone-800 pb-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('hero_stats')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'hero_stats'
              ? 'bg-[#167D78] text-white shadow-sm'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? '১. হিরো ও ৪টি পরিসংখ্যান' : '1. Hero & 4 Stats'}</span>
        </button>

        <button
          onClick={() => setActiveTab('philosophy')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'philosophy'
              ? 'bg-[#167D78] text-white shadow-sm'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? '২. দর্শন, চার্টার ও ৪টি স্তম্ভ' : '2. Genesis & 4 Pillars'}</span>
        </button>

        <button
          onClick={() => setActiveTab('bank')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'bank'
              ? 'bg-[#167D78] text-white shadow-sm'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? '৩. ব্যাংক ও অনুদান অ্যাকাউন্ট' : '3. Bank & Mobile Money'}</span>
        </button>

        <button
          onClick={() => setActiveTab('contact_footer')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'contact_footer'
              ? 'bg-[#167D78] text-white shadow-sm'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? '৪. যোগাযোগ, সোশ্যাল ও ফুটার' : '4. Contact & Footer'}</span>
        </button>

        <button
          onClick={() => setActiveTab('text')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'text'
              ? 'bg-[#167D78] text-white shadow-sm'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? '৫. নাম, স্লোগান ও ফন্ট' : '5. Brand & Fonts'}</span>
        </button>

        <button
          onClick={() => setActiveTab('colors')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'colors'
              ? 'bg-[#167D78] text-white shadow-sm'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? '৬. রং ও থিম প্যালেট' : '6. Colors & Themes'}</span>
        </button>

        <button
          onClick={() => setActiveTab('images')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'images'
              ? 'bg-[#167D78] text-white shadow-sm'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? '৭. লোগো ও ছবি' : '7. Logos & Images'}</span>
        </button>

        <button
          onClick={handleResetToDefaults}
          className="ml-auto px-2.5 py-1.5 rounded-lg text-xs font-semibold text-stone-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer whitespace-nowrap"
        >
          {language === 'bn' ? 'ডিফল্ট রিসেট' : 'Reset Defaults'}
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: HERO & 4 STATS (A TO Z) */}
      {/* ========================================================= */}
      {activeTab === 'hero_stats' && (
        <div className="space-y-6">
          {/* Hero Main Headings Card */}
          <div className="bg-white dark:bg-[#0c1a24] p-6 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <h4 className="font-extrabold text-sm text-[#102B3F] dark:text-white flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-2">
              <Sparkles className="w-4 h-4 text-[#167D78] dark:text-[#D6F36A]" />
              <span>{language === 'bn' ? 'হিরো সেকশনের মূল শিরোনাম ও ব্যানার' : 'Hero Main Headings & Badges'}</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5 md:col-span-2">
                <label className="font-bold text-stone-700 dark:text-stone-300">হিরো টপ ব্যাজ (Hero Badge)</label>
                <input
                  type="text"
                  value={draftConfig.heroBadgeBn || ''}
                  onChange={(e) => updateDraftField('heroBadgeBn', e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl"
                  placeholder="যেমন: রেজিস্ট্রেশন প্রক্রিয়াধীন অলাভজনক মানবিক সংস্থা..."
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="font-bold text-stone-700 dark:text-stone-300">হিরো প্রধান শিরোনাম (Hero Main Heading)</label>
                <input
                  type="text"
                  value={draftConfig.heroHeadingBn || ''}
                  onChange={(e) => updateDraftField('heroHeadingBn', e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl font-bold text-sm"
                  placeholder="যেমন: সিলেটের প্রত্যন্ত জনপদে শিক্ষা, স্বাস্থ্য ও দুর্যোগে অবিচল মানবিক হাত"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="font-bold text-stone-700 dark:text-stone-300">হিরো সাব-শিরোনাম ও বিস্তারিত বিবরণ (Subheading)</label>
                <textarea
                  rows={2}
                  value={draftConfig.heroSubheadingBn || ''}
                  onChange={(e) => updateDraftField('heroSubheadingBn', e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl leading-relaxed"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="font-bold text-[#167D78] dark:text-[#D6F36A] flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  <span>জরুরি স্ক্রলিং নোটিশ টিকার (Notice Ticker / Marquee)</span>
                </label>
                <input
                  type="text"
                  value={draftConfig.noticeTickerBn || ''}
                  onChange={(e) => updateDraftField('noticeTickerBn', e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-[#167D78]/30 rounded-xl"
                  placeholder="চলমান জরুরি বার্তা যা ওয়েবসাইটের সবার ওপরে স্ক্রল করবে..."
                />
              </div>
            </div>
          </div>

          {/* Urgent Crisis Notification Box */}
          <div className="bg-white dark:bg-[#0c1a24] p-6 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <h4 className="font-extrabold text-sm text-[#102B3F] dark:text-white flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span>{language === 'bn' ? 'জরুরি মানবিক আপিল ব্যানার (Urgent Appeal Notification Box)' : 'Urgent Crisis Appeal Box'}</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 dark:text-stone-300">ব্যানার টাইটেল</label>
                <input
                  type="text"
                  value={draftConfig.urgentBannerTitleBn || ''}
                  onChange={(e) => updateDraftField('urgentBannerTitleBn', e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl font-bold"
                  placeholder="জরুরি মানবিক আবেদন"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="font-bold text-stone-700 dark:text-stone-300">আপিল বার্তা / বিবরণ</label>
                <input
                  type="text"
                  value={draftConfig.urgentBannerTextBn || ''}
                  onChange={(e) => updateDraftField('urgentBannerTextBn', e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl"
                  placeholder="সিলেটের হাওরাঞ্চল ও পাহাড়ি ঢলে আকস্মিক বন্যায়..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 dark:text-stone-300">বাটন টেক্সট</label>
                <input
                  type="text"
                  value={draftConfig.urgentBannerBtnBn || ''}
                  onChange={(e) => updateDraftField('urgentBannerBtnBn', e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl"
                  placeholder="ত্রাণে শরিক হোন"
                />
              </div>
            </div>
          </div>

          {/* 4 Hero Operational Impact Stats */}
          <div className="bg-white dark:bg-[#0c1a24] p-6 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
              <h4 className="font-extrabold text-sm text-[#102B3F] dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#167D78] dark:text-[#D6F36A]" />
                <span>{language === 'bn' ? 'হিরো সেকশনের ৪টি পরিসংখ্যান কার্ড (4 Operational Impact Stats - A to Z)' : 'The 4 Hero Impact Stats'}</span>
              </h4>
              <span className="text-[11px] text-stone-400">ওয়েবসাইটের হোমপেজে প্রদর্শিত হবে</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              
              {/* Stat 1 */}
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2.5">
                <span className="font-extrabold text-[#102B3F] dark:text-[#D6F36A] block text-[11px] uppercase">
                  পরিসংখ্যান ১ (Stat 1)
                </span>
                <div>
                  <label className="font-semibold block mb-1">সংখ্যা (Number)</label>
                  <input
                    type="text"
                    value={draftConfig.stat1Number || ''}
                    onChange={(e) => updateDraftField('stat1Number', e.target.value)}
                    className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg font-mono font-bold"
                    placeholder="14,500+"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">শিরোনাম (Label)</label>
                  <input
                    type="text"
                    value={draftConfig.stat1LabelBn || ''}
                    onChange={(e) => updateDraftField('stat1LabelBn', e.target.value)}
                    className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg"
                    placeholder="সরাসরি উপকৃত মানুষ"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">সাবটেক্সট (Subtext)</label>
                  <input
                    type="text"
                    value={draftConfig.stat1SubtextBn || ''}
                    onChange={(e) => updateDraftField('stat1SubtextBn', e.target.value)}
                    className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg text-stone-500"
                    placeholder="সরাসরি সহায়তা প্রাপ্ত পরিবার"
                  />
                </div>
              </div>

              {/* Stat 2 */}
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2.5">
                <span className="font-extrabold text-[#167D78] dark:text-[#D6F36A] block text-[11px] uppercase">
                  পরিসংখ্যান ২ (Stat 2)
                </span>
                <div>
                  <label className="font-semibold block mb-1">সংখ্যা (Number)</label>
                  <input
                    type="text"
                    value={draftConfig.stat2Number || ''}
                    onChange={(e) => updateDraftField('stat2Number', e.target.value)}
                    className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg font-mono font-bold"
                    placeholder="38+"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">শিরোনাম (Label)</label>
                  <input
                    type="text"
                    value={draftConfig.stat2LabelBn || ''}
                    onChange={(e) => updateDraftField('stat2LabelBn', e.target.value)}
                    className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg"
                    placeholder="চলমান ও সম্পন্ন প্রকল্প"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">সাবটেক্সট (Subtext)</label>
                  <input
                    type="text"
                    value={draftConfig.stat2SubtextBn || ''}
                    onChange={(e) => updateDraftField('stat2SubtextBn', e.target.value)}
                    className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg text-stone-500"
                    placeholder="১৬টি দুর্গম উপজেলায় কার্যক্রম"
                  />
                </div>
              </div>

              {/* Stat 3 */}
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2.5">
                <span className="font-extrabold text-[#102B3F] dark:text-[#D6F36A] block text-[11px] uppercase">
                  পরিসংখ্যান ৩ (Stat 3)
                </span>
                <div>
                  <label className="font-semibold block mb-1">সংখ্যা (Number)</label>
                  <input
                    type="text"
                    value={draftConfig.stat3Number || ''}
                    onChange={(e) => updateDraftField('stat3Number', e.target.value)}
                    className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg font-mono font-bold"
                    placeholder="850+"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">শিরোনাম (Label)</label>
                  <input
                    type="text"
                    value={draftConfig.stat3LabelBn || ''}
                    onChange={(e) => updateDraftField('stat3LabelBn', e.target.value)}
                    className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg"
                    placeholder="নিবেদিত ভলান্টিয়ার"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">সাবটেক্সট (Subtext)</label>
                  <input
                    type="text"
                    value={draftConfig.stat3SubtextBn || ''}
                    onChange={(e) => updateDraftField('stat3SubtextBn', e.target.value)}
                    className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg text-stone-500"
                    placeholder="সারাদেশে নিবেদিত তরুণ দল"
                  />
                </div>
              </div>

              {/* Stat 4 */}
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2.5">
                <span className="font-extrabold text-[#E6A15B] block text-[11px] uppercase">
                  পরিসংখ্যান ৪ (Stat 4)
                </span>
                <div>
                  <label className="font-semibold block mb-1">সংখ্যা (Number)</label>
                  <input
                    type="text"
                    value={draftConfig.stat4Number || ''}
                    onChange={(e) => updateDraftField('stat4Number', e.target.value)}
                    className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg font-mono font-bold"
                    placeholder="100%"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">শিরোনাম (Label)</label>
                  <input
                    type="text"
                    value={draftConfig.stat4LabelBn || ''}
                    onChange={(e) => updateDraftField('stat4LabelBn', e.target.value)}
                    className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg"
                    placeholder="শতভাগ স্বচ্ছতা"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">সাবটেক্সট (Subtext)</label>
                  <input
                    type="text"
                    value={draftConfig.stat4SubtextBn || ''}
                    onChange={(e) => updateDraftField('stat4SubtextBn', e.target.value)}
                    className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg text-stone-500"
                    placeholder="স্বতন্ত্র সিএ ফার্ম নিরীক্ষিত"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: GENESIS, CHARTER & 4 PILLARS (A TO Z) */}
      {/* ========================================================= */}
      {activeTab === 'philosophy' && (
        <div className="space-y-6">
          {/* Genesis and Founding Charter */}
          <div className="bg-white dark:bg-[#0c1a24] p-6 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <h4 className="font-extrabold text-sm text-[#102B3F] dark:text-white flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-2">
              <Calendar className="w-4 h-4 text-[#167D78] dark:text-[#D6F36A]" />
              <span>{language === 'bn' ? 'প্রতিষ্ঠার ঐতিহাসিক প্রেক্ষাপট ও স্থান' : 'Founding Genesis & History'}</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 dark:text-stone-300">প্রতিষ্ঠাকাল (Founding Date)</label>
                <input
                  type="text"
                  value={draftConfig.foundingDateBn || ''}
                  onChange={(e) => updateDraftField('foundingDateBn', e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl"
                  placeholder="০৭-০৩-২০২৬ খ্রিস্টাব্দ"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 dark:text-stone-300">প্রতিষ্ঠার স্থান (Founding Location)</label>
                <input
                  type="text"
                  value={draftConfig.foundingLocationBn || ''}
                  onChange={(e) => updateDraftField('foundingLocationBn', e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl"
                  placeholder="কমলগঞ্জ, মৌলভীবাজার (সিলেট বিভাগ)"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="font-bold text-stone-700 dark:text-stone-300">ঐতিহাসিক সনদ ও চার্টার বার্তা (Charter Statement)</label>
                <textarea
                  rows={3}
                  value={draftConfig.charterStatementBn || ''}
                  onChange={(e) => updateDraftField('charterStatementBn', e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl leading-relaxed"
                  placeholder="সিলেট বিভাগ, মৌলভীবাজার জেলার কমলগঞ্জ উপজেলায় জনকল্যাণমূলক..."
                />
              </div>
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="bg-white dark:bg-[#0c1a24] p-6 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <h4 className="font-extrabold text-sm text-[#102B3F] dark:text-white flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-2">
              <Crown className="w-4 h-4 text-[#E6A15B]" />
              <span>{language === 'bn' ? 'ফাউন্ডেশনের মিশন ও ভিশন (Mission & Vision)' : 'Mission & Vision'}</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 dark:text-stone-300">মিশন স্টেটমেন্ট (Mission)</label>
                <textarea
                  rows={3}
                  value={draftConfig.missionBn || ''}
                  onChange={(e) => updateDraftField('missionBn', e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl leading-relaxed"
                  placeholder="প্রাকৃতিক দুর্যোগ, দারিদ্র্য ও অনগ্রসরতায় পিছিয়ে পড়া..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 dark:text-stone-300">ভিশন স্টেটমেন্ট (Vision)</label>
                <textarea
                  rows={3}
                  value={draftConfig.visionBn || ''}
                  onChange={(e) => updateDraftField('visionBn', e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl leading-relaxed"
                  placeholder="একটি বৈষম্যহীন, আলোকিত ও মানবিক বাংলাদেশ..."
                />
              </div>
            </div>
          </div>

          {/* The 4 Core Pillars */}
          <div className="bg-white dark:bg-[#0c1a24] p-6 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
              <h4 className="font-extrabold text-sm text-[#102B3F] dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#167D78] dark:text-[#D6F36A]" />
                <span>{language === 'bn' ? 'ফাউন্ডেশনের ৪টি মূল স্তম্ভ (The 4 Pillars - A to Z)' : 'The 4 Core Pillars'}</span>
              </h4>
              <span className="text-[11px] text-stone-400">পরিচিতি ও হাইলাইটস উভয় সেকশনে আপডেট হবে</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              {/* Pillar 1 */}
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2.5">
                <span className="font-extrabold text-[#167D78] block text-[11px] uppercase">
                  স্তম্ভ ১: শিক্ষা ও মেধা (Pillar 1)
                </span>
                <div>
                  <label className="font-semibold block mb-1">শিরোনাম</label>
                  <input
                    type="text"
                    value={draftConfig.pillar1TitleBn || ''}
                    onChange={(e) => updateDraftField('pillar1TitleBn', e.target.value)}
                    className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">বিবরণ</label>
                  <textarea
                    rows={2}
                    value={draftConfig.pillar1DescBn || ''}
                    onChange={(e) => updateDraftField('pillar1DescBn', e.target.value)}
                    className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">বাৎসরিক অর্জন / স্ট্যাটস</label>
                  <input
                    type="text"
                    value={draftConfig.pillar1StatBn || ''}
                    onChange={(e) => updateDraftField('pillar1StatBn', e.target.value)}
                    className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg font-mono"
                    placeholder="৪৫০+ বার্ষিক বৃত্তি"
                  />
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2.5">
                <span className="font-extrabold text-[#E6A15B] block text-[11px] uppercase">
                  স্তম্ভ ২: দুর্যোগ ও খাদ্য ত্রাণ (Pillar 2)
                </span>
                <div>
                  <label className="font-semibold block mb-1">শিরোনাম</label>
                  <input
                    type="text"
                    value={draftConfig.pillar2TitleBn || ''}
                    onChange={(e) => updateDraftField('pillar2TitleBn', e.target.value)}
                    className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">বিবরণ</label>
                  <textarea
                    rows={2}
                    value={draftConfig.pillar2DescBn || ''}
                    onChange={(e) => updateDraftField('pillar2DescBn', e.target.value)}
                    className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">বাৎসরিক অর্জন / স্ট্যাটস</label>
                  <input
                    type="text"
                    value={draftConfig.pillar2StatBn || ''}
                    onChange={(e) => updateDraftField('pillar2StatBn', e.target.value)}
                    className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg font-mono"
                    placeholder="১২টি উপজেলায় রেসপন্স"
                  />
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2.5">
                <span className="font-extrabold text-[#102B3F] dark:text-[#D6F36A] block text-[11px] uppercase">
                  স্তম্ভ ৩: স্বাস্থ্যসেবা ও রক্তদান (Pillar 3)
                </span>
                <div>
                  <label className="font-semibold block mb-1">শিরোনাম</label>
                  <input
                    type="text"
                    value={draftConfig.pillar3TitleBn || ''}
                    onChange={(e) => updateDraftField('pillar3TitleBn', e.target.value)}
                    className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">বিবরণ</label>
                  <textarea
                    rows={2}
                    value={draftConfig.pillar3DescBn || ''}
                    onChange={(e) => updateDraftField('pillar3DescBn', e.target.value)}
                    className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">বাৎসরিক অর্জন / স্ট্যাটস</label>
                  <input
                    type="text"
                    value={draftConfig.pillar3StatBn || ''}
                    onChange={(e) => updateDraftField('pillar3StatBn', e.target.value)}
                    className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg font-mono"
                    placeholder="১,৮৫০+ বিনামূল্যে রোগী"
                  />
                </div>
              </div>

              {/* Pillar 4 */}
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2.5">
                <span className="font-extrabold text-[#167D78] block text-[11px] uppercase">
                  স্তম্ভ ৪: স্বাবলম্বীকরণ ও নারী উন্নয়ন (Pillar 4)
                </span>
                <div>
                  <label className="font-semibold block mb-1">শিরোনাম</label>
                  <input
                    type="text"
                    value={draftConfig.pillar4TitleBn || ''}
                    onChange={(e) => updateDraftField('pillar4TitleBn', e.target.value)}
                    className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">বিবরণ</label>
                  <textarea
                    rows={2}
                    value={draftConfig.pillar4DescBn || ''}
                    onChange={(e) => updateDraftField('pillar4DescBn', e.target.value)}
                    className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">বাৎসরিক অর্জন / স্ট্যাটস</label>
                  <input
                    type="text"
                    value={draftConfig.pillar4StatBn || ''}
                    onChange={(e) => updateDraftField('pillar4StatBn', e.target.value)}
                    className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg font-mono"
                    placeholder="১২০+ কর্মজীবী মা"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: BANK & MOBILE MONEY (A TO Z) */}
      {/* ========================================================= */}
      {activeTab === 'bank' && (
        <div className="space-y-6">
          {/* Bank Accounts */}
          <div className="bg-white dark:bg-[#0c1a24] p-6 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <h4 className="font-extrabold text-sm text-[#102B3F] dark:text-white flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-2">
              <CreditCard className="w-4 h-4 text-[#167D78]" />
              <span>{language === 'bn' ? 'অফিসিয়াল ব্যাংক হিসাবের বিবরণী (Bank Accounts)' : 'Official Bank Accounts'}</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 dark:text-stone-300">ব্যাংকের নাম (Bank Name)</label>
                <input
                  type="text"
                  value={draftConfig.bankName || ''}
                  onChange={(e) => updateDraftField('bankName', e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl font-bold"
                  placeholder="Dutch-Bangla Bank PLC (DBBL)"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 dark:text-stone-300">অ্যাকাউন্টের নাম (Account Holder)</label>
                <input
                  type="text"
                  value={draftConfig.bankAccountName || ''}
                  onChange={(e) => updateDraftField('bankAccountName', e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl"
                  placeholder="CoLASH Foundation"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 dark:text-stone-300">হিসাব নম্বর (Account Number)</label>
                <input
                  type="text"
                  value={draftConfig.bankAccountNumber || ''}
                  onChange={(e) => updateDraftField('bankAccountNumber', e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl font-mono font-bold text-sm"
                  placeholder="107.110.458921"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 dark:text-stone-300">শাখা (Branch)</label>
                <input
                  type="text"
                  value={draftConfig.bankBranch || ''}
                  onChange={(e) => updateDraftField('bankBranch', e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl"
                  placeholder="মৌলভীবাজার শাখা, সিলেট"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 dark:text-stone-300">রাউটিং নম্বর (Routing Number)</label>
                <input
                  type="text"
                  value={draftConfig.bankRouting || ''}
                  onChange={(e) => updateDraftField('bankRouting', e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl font-mono"
                  placeholder="090271891"
                />
              </div>
            </div>
          </div>

          {/* Mobile Money Accounts */}
          <div className="bg-white dark:bg-[#0c1a24] p-6 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <h4 className="font-extrabold text-sm text-[#102B3F] dark:text-white flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-2">
              <Smartphone className="w-4 h-4 text-emerald-500" />
              <span>{language === 'bn' ? 'মোবাইল ব্যাংকিং অনুদান নম্বর (bKash, Nagad, Rocket)' : 'Mobile Financial Services (MFS)'}</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-2">
                <span className="font-bold text-rose-600 block">বিকাশ নম্বর (bKash)</span>
                <input
                  type="text"
                  value={draftConfig.bkashNumber || ''}
                  onChange={(e) => updateDraftField('bkashNumber', e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-stone-800 border rounded-xl font-mono font-bold"
                  placeholder="01646-475348"
                />
                <span className="text-[10px] text-stone-400 block">রেফারেন্স: COLASH</span>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-2">
                <span className="font-bold text-amber-600 block">নগদ নম্বর (Nagad)</span>
                <input
                  type="text"
                  value={draftConfig.nagadNumber || ''}
                  onChange={(e) => updateDraftField('nagadNumber', e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-stone-800 border rounded-xl font-mono font-bold"
                  placeholder="01308-241288"
                />
                <span className="text-[10px] text-stone-400 block">পার্সোনাল / মার্চেন্ট নম্বর</span>
              </div>

              <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 space-y-2">
                <span className="font-bold text-purple-600 block">রকেট নম্বর (Rocket)</span>
                <input
                  type="text"
                  value={draftConfig.rocketNumber || ''}
                  onChange={(e) => updateDraftField('rocketNumber', e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-stone-800 border rounded-xl font-mono font-bold"
                  placeholder="01646-475348-9"
                />
                <span className="text-[10px] text-stone-400 block">১২ ডিজিটের হিসাব নম্বর</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: CONTACT, SOCIALS & FOOTER (A TO Z) */}
      {/* ========================================================= */}
      {activeTab === 'contact_footer' && (
        <div className="space-y-6">
          {/* Contact Details */}
          <div className="bg-white dark:bg-[#0c1a24] p-6 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <h4 className="font-extrabold text-sm text-[#102B3F] dark:text-white flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-2">
              <Phone className="w-4 h-4 text-[#167D78]" />
              <span>{language === 'bn' ? 'অফিসিয়াল যোগাযোগ ও ঠিকানা' : 'Official Contact & Office Location'}</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 dark:text-stone-300">হটলাইন / মোবাইল নম্বর</label>
                <input
                  type="text"
                  value={draftConfig.hotline || ''}
                  onChange={(e) => updateDraftField('hotline', e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl font-mono"
                  placeholder="01646-475348"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 dark:text-stone-300">অফিসিয়াল ইমেইল (Official Email)</label>
                <input
                  type="email"
                  value={draftConfig.contactEmail || ''}
                  onChange={(e) => updateDraftField('contactEmail', e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl font-mono"
                  placeholder="contact@colash.org"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="font-bold text-stone-700 dark:text-stone-300">কেন্দ্রীয় কার্যালয়ের সম্পূর্ণ ঠিকানা</label>
                <input
                  type="text"
                  value={draftConfig.addressBn || ''}
                  onChange={(e) => updateDraftField('addressBn', e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl"
                  placeholder="কমলগঞ্জ উপজেলা পরিষদ সংলগ্ন, মৌলভীবাজার, সিলেট"
                />
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="bg-white dark:bg-[#0c1a24] p-6 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <h4 className="font-extrabold text-sm text-[#102B3F] dark:text-white flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-2">
              <Share2 className="w-4 h-4 text-blue-500" />
              <span>{language === 'bn' ? 'অফিসিয়াল সোশ্যাল মিডিয়া লিংক (Social Media Links)' : 'Official Social Media Channels'}</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-[#1877F2]">ফেসবুক পেজ লিংক (Facebook URL)</label>
                <input
                  type="url"
                  value={draftConfig.facebookUrl || ''}
                  onChange={(e) => updateDraftField('facebookUrl', e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl font-mono"
                  placeholder="https://www.facebook.com/CoLASHFoundation"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#E4405F]">ইনস্টাগ্রাম লিংক (Instagram URL)</label>
                <input
                  type="url"
                  value={draftConfig.instagramUrl || ''}
                  onChange={(e) => updateDraftField('instagramUrl', e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl font-mono"
                  placeholder="https://www.instagram.com/colashfoundation"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-red-600">ইউটিউব চ্যানেল (YouTube URL)</label>
                <input
                  type="url"
                  value={draftConfig.youtubeUrl || ''}
                  onChange={(e) => updateDraftField('youtubeUrl', e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl font-mono"
                  placeholder="https://www.youtube.com/@CoLASHFoundation"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-blue-600">লিঙ্কডইন পেজ (LinkedIn URL)</label>
                <input
                  type="url"
                  value={draftConfig.linkedinUrl || ''}
                  onChange={(e) => updateDraftField('linkedinUrl', e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl font-mono"
                  placeholder="https://www.linkedin.com/company/colash-foundation"
                />
              </div>
            </div>
          </div>

          {/* Footer Texts & Registration */}
          <div className="bg-white dark:bg-[#0c1a24] p-6 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <h4 className="font-extrabold text-sm text-[#102B3F] dark:text-white flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-2">
              <FileCheck2 className="w-4 h-4 text-emerald-500" />
              <span>{language === 'bn' ? 'ফুটার টেক্সট, রেজিস্ট্রেশন ও কপিরাইট' : 'Footer Content & Statutory Registration'}</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5 md:col-span-2">
                <label className="font-bold text-stone-700 dark:text-stone-300">ফুটার সম্পর্কে বর্ণনা (Footer About)</label>
                <textarea
                  rows={2}
                  value={draftConfig.footerAboutBn || ''}
                  onChange={(e) => updateDraftField('footerAboutBn', e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 dark:text-stone-300">সরকারি রেজিস্ট্রেশন / ট্যাক্স সার্টিফিকেট স্ট্যাটাস</label>
                <input
                  type="text"
                  value={draftConfig.regNumberBn || ''}
                  onChange={(e) => updateDraftField('regNumberBn', e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl font-mono"
                  placeholder="Reg: CLF-BD-2026-SYL"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 dark:text-stone-300">কপিরাইট নোটিশ (Copyright)</label>
                <input
                  type="text"
                  value={draftConfig.footerCopyrightBn || ''}
                  onChange={(e) => updateDraftField('footerCopyrightBn', e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl"
                  placeholder="© ২০২৬ CoLASH Foundation. সর্বস্বত্ব সংরক্ষিত।"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: BRANDING, SLOGANS & FONTS */}
      {/* ========================================================= */}
      {activeTab === 'text' && (
        <div className="bg-white dark:bg-[#0c1a24] p-6 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4">
          <h4 className="font-extrabold text-sm text-[#102B3F] dark:text-white flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-2">
            <Type className="w-4 h-4 text-[#167D78]" />
            <span>{language === 'bn' ? 'ফাউন্ডেশনের নাম, স্লোগান ও ফন্ট ফ্যামিলি' : 'Foundation Name, Slogans & Typography'}</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-stone-700 dark:text-stone-300">ফাউন্ডেশনের অফিসিয়াল নাম (বাংলা)</label>
              <input
                type="text"
                value={draftConfig.siteTitleBn}
                onChange={(e) => updateDraftField('siteTitleBn', e.target.value)}
                className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-stone-700 dark:text-stone-300">ফাউন্ডেশনের নাম (English)</label>
              <input
                type="text"
                value={draftConfig.siteTitleEn}
                onChange={(e) => updateDraftField('siteTitleEn', e.target.value)}
                className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-stone-700 dark:text-stone-300">অফিসিয়াল স্লোগান (বাংলা)</label>
              <input
                type="text"
                value={draftConfig.siteSloganBn}
                onChange={(e) => updateDraftField('siteSloganBn', e.target.value)}
                className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl italic font-serif"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-stone-700 dark:text-stone-300">অফিসিয়াল স্লোগান (English)</label>
              <input
                type="text"
                value={draftConfig.siteSloganEn}
                onChange={(e) => updateDraftField('siteSloganEn', e.target.value)}
                className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl italic font-serif"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-stone-700 dark:text-stone-300">সাবটাইটেল / সম্প্রসারণ (বাংলা)</label>
              <input
                type="text"
                value={draftConfig.siteSubtitleBn}
                onChange={(e) => updateDraftField('siteSubtitleBn', e.target.value)}
                className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-stone-700 dark:text-stone-300">সাবটাইটেল / সম্প্রসারণ (English)</label>
              <input
                type="text"
                value={draftConfig.siteSubtitleEn}
                onChange={(e) => updateDraftField('siteSubtitleEn', e.target.value)}
                className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="font-bold text-stone-700 dark:text-stone-300">ফাউন্ডার ভিশন কোট (Founder Vision Statement)</label>
              <textarea
                rows={2}
                value={draftConfig.founderVisionBn}
                onChange={(e) => updateDraftField('founderVisionBn', e.target.value)}
                className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl leading-relaxed italic"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-stone-700 dark:text-stone-300">ফন্ট ফ্যামিলি (Font Family)</label>
              <select
                value={draftConfig.fontFamily}
                onChange={(e) => updateDraftField('fontFamily', e.target.value as any)}
                className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl"
              >
                <option value="Hind Siliguri">হিন্দ শিলিগুড়ি (Hind Siliguri - বাংলা স্ট্যান্ডার্ড)</option>
                <option value="Inter">ইন্টার (Inter - Modern Neutral)</option>
                <option value="Kalpurush">কালপুরুষ (Kalpurush - Traditional Bangla)</option>
                <option value="Outfit">আউটফিট (Outfit - Geometric Sans)</option>
                <option value="Roboto">রোবোটো (Roboto - Clean Sans)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-stone-700 dark:text-stone-300">বাটন ও কার্ড কর্নার রাউন্ডনেস</label>
              <select
                value={draftConfig.borderRadius}
                onChange={(e) => updateDraftField('borderRadius', e.target.value as any)}
                className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border rounded-xl"
              >
                <option value="rounded-lg">স্বাভাবিক (Medium - 8px)</option>
                <option value="rounded-xl">আধুনিক রাউন্ডেড (Rounded XL - 12px)</option>
                <option value="rounded-2xl">সফট এলিগ্যান্ট (Soft 2XL - 16px - ডিফল্ট)</option>
                <option value="rounded-3xl">অতি মসৃণ (Ultra Rounded 3XL - 24px)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: COLORS & THEMES */}
      {/* ========================================================= */}
      {activeTab === 'colors' && (
        <div className="space-y-6">
          {/* Preset Palettes */}
          <div className="bg-white dark:bg-[#0c1a24] p-6 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <h4 className="font-extrabold text-sm text-[#102B3F] dark:text-white flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-2">
              <Sparkles className="w-4 h-4 text-[#D6F36A]" />
              <span>{language === 'bn' ? '১-ক্লিক কালার প্যালেট নির্বাচন (Quick Themes)' : 'Preset Themes'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {PRESET_PALETTES.map((palette, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    updateDraftField('primaryColor', palette.primary);
                    updateDraftField('secondaryColor', palette.secondary);
                    updateDraftField('accentColor', palette.accent);
                    updateDraftField('bgTone', palette.bg);
                    onToast('info', language === 'bn' ? 'থিম নির্বাচন সম্পন্ন' : 'Theme Selected', palette.nameBn);
                  }}
                  className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:border-[#167D78] transition-all text-left space-y-2 cursor-pointer group"
                >
                  <div className="flex items-center gap-1.5 h-6 rounded-lg overflow-hidden shadow-xs">
                    <span className="w-1/3 h-full" style={{ backgroundColor: palette.primary }}></span>
                    <span className="w-1/3 h-full" style={{ backgroundColor: palette.secondary }}></span>
                    <span className="w-1/3 h-full" style={{ backgroundColor: palette.accent }}></span>
                  </div>
                  <div className="text-xs font-bold text-stone-900 dark:text-white group-hover:text-[#167D78] truncate">
                    {palette.nameBn}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Color Pickers */}
          <div className="bg-white dark:bg-[#0c1a24] p-6 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <h4 className="font-extrabold text-sm text-[#102B3F] dark:text-white flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-2">
              <Palette className="w-4 h-4 text-[#167D78]" />
              <span>{language === 'bn' ? 'কাস্টম হেক্স কালার নির্বাচন (Custom Hex Colors)' : 'Color Customization'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900 border space-y-2">
                <span className="font-bold text-stone-700 dark:text-stone-300 block">প্রাইমারি রং (Primary)</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={draftConfig.primaryColor}
                    onChange={(e) => updateDraftField('primaryColor', e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border"
                  />
                  <input
                    type="text"
                    value={draftConfig.primaryColor}
                    onChange={(e) => updateDraftField('primaryColor', e.target.value)}
                    className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg font-mono text-xs uppercase"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900 border space-y-2">
                <span className="font-bold text-stone-700 dark:text-stone-300 block">সেকেন্ডারি রং (Secondary)</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={draftConfig.secondaryColor}
                    onChange={(e) => updateDraftField('secondaryColor', e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border"
                  />
                  <input
                    type="text"
                    value={draftConfig.secondaryColor}
                    onChange={(e) => updateDraftField('secondaryColor', e.target.value)}
                    className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg font-mono text-xs uppercase"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900 border space-y-2">
                <span className="font-bold text-stone-700 dark:text-stone-300 block">অ্যাকসেন্ট রং (Accent / Gold)</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={draftConfig.accentColor}
                    onChange={(e) => updateDraftField('accentColor', e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border"
                  />
                  <input
                    type="text"
                    value={draftConfig.accentColor}
                    onChange={(e) => updateDraftField('accentColor', e.target.value)}
                    className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg font-mono text-xs uppercase"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900 border space-y-2">
                <span className="font-bold text-stone-700 dark:text-stone-300 block">ব্যাকগ্রাউন্ড টোন (Background)</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={draftConfig.bgTone}
                    onChange={(e) => updateDraftField('bgTone', e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border"
                  />
                  <input
                    type="text"
                    value={draftConfig.bgTone}
                    onChange={(e) => updateDraftField('bgTone', e.target.value)}
                    className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg font-mono text-xs uppercase"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 7: LOGOS & IMAGES */}
      {/* ========================================================= */}
      {activeTab === 'images' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-[#0c1a24] p-6 rounded-2xl border border-stone-200 dark:border-stone-800">
          
          {/* Logo 1: Main Foundation Logo */}
          <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#102B3F] dark:text-white text-sm">
                ১. মূল ফাউন্ডেশন লোগো (Official Foundation Logo)
              </span>
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="px-3 py-1 rounded-lg bg-[#167D78] hover:bg-[#102B3F] text-white font-bold cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>কম্পিউটার থেকে আপলোড</span>
              </button>
            </div>

            <input
              type="file"
              ref={logoInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageFileUpload(e, 'logoUrl')}
            />

            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-white dark:bg-stone-800 border p-1 shrink-0 flex items-center justify-center overflow-hidden shadow-xs">
                {draftConfig.logoUrl ? (
                  <img src={draftConfig.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <Heart className="w-8 h-8 text-[#167D78]" />
                )}
              </div>
              <div className="space-y-1 flex-1">
                <label className="text-[11px] font-semibold text-stone-500">অথবা সরাসরি ছবির লিঙ্ক (Image URL) দিন:</label>
                <input
                  type="text"
                  value={draftConfig.logoUrl}
                  onChange={(e) => updateDraftField('logoUrl', e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg font-mono text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* Image 2: Hero Banner Image */}
          <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#102B3F] dark:text-white text-sm">
                ২. হিরো সেকশন ব্যানার ছবি (Hero Banner Image)
              </span>
              <button
                type="button"
                onClick={() => heroImageInputRef.current?.click()}
                className="px-3 py-1 rounded-lg bg-[#167D78] hover:bg-[#102B3F] text-white font-bold cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>নতুন ছবি আপলোড</span>
              </button>
            </div>

            <input
              type="file"
              ref={heroImageInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageFileUpload(e, 'heroImageUrl')}
            />

            <div className="flex items-center gap-3">
              <div className="w-24 h-16 rounded-xl bg-stone-200 dark:bg-stone-800 border overflow-hidden shrink-0 shadow-xs">
                <img src={draftConfig.heroImageUrl} alt="Hero" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1 flex-1">
                <label className="text-[11px] font-semibold text-stone-500">ছবির লিঙ্ক (Image URL):</label>
                <input
                  type="text"
                  value={draftConfig.heroImageUrl}
                  onChange={(e) => updateDraftField('heroImageUrl', e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg font-mono text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* Logo 3: Women's Team Wing Logo */}
          <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-600 text-sm">
                ৩. উইমেন্স টিম স্বতন্ত্র লোগো (Women's Wing Logo)
              </span>
              <button
                type="button"
                onClick={() => womensLogoInputRef.current?.click()}
                className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>উইমেন্স লোগো আপলোড</span>
              </button>
            </div>

            <input
              type="file"
              ref={womensLogoInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageFileUpload(e, 'womensTeamLogoUrl')}
            />

            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-rose-100 dark:bg-rose-950 border p-1 shrink-0 flex items-center justify-center overflow-hidden shadow-xs">
                <img src={draftConfig.womensTeamLogoUrl} alt="Women Wing Logo" className="w-full h-full object-cover rounded-lg" />
              </div>
              <div className="space-y-1 flex-1">
                <label className="text-[11px] font-semibold text-stone-500">লোগোর লিঙ্ক (Image URL):</label>
                <input
                  type="text"
                  value={draftConfig.womensTeamLogoUrl}
                  onChange={(e) => updateDraftField('womensTeamLogoUrl', e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg font-mono text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* Image 4: Founder Photo */}
          <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#102B3F] dark:text-white text-sm">
                ৪. প্রতিষ্ঠাতা ও নির্বাহী প্রধানের ছবি (Founder Image)
              </span>
              <button
                type="button"
                onClick={() => founderImageInputRef.current?.click()}
                className="px-3 py-1 rounded-lg bg-[#167D78] hover:bg-[#102B3F] text-white font-bold cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>ছবি আপলোড</span>
              </button>
            </div>

            <input
              type="file"
              ref={founderImageInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageFileUpload(e, 'founderImageUrl')}
            />

            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-stone-200 dark:bg-stone-800 border shrink-0 overflow-hidden shadow-xs">
                <img src={draftConfig.founderImageUrl} alt="Founder" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1 flex-1">
                <label className="text-[11px] font-semibold text-stone-500">ছবির লিঙ্ক (Image URL):</label>
                <input
                  type="text"
                  value={draftConfig.founderImageUrl}
                  onChange={(e) => updateDraftField('founderImageUrl', e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg font-mono text-[11px]"
                />
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Floating Bottom Publishing Bar */}
      <div className="p-4 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          {hasUnsavedChanges ? (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
              <span>{language === 'bn' ? 'আপনার খসড়ায় অপ্রকাশিত পরিবর্তন আছে।' : 'You have unpublished changes.'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>{language === 'bn' ? 'সব পরিবর্তন সফলভাবে লাইভ ওয়েবসাইটে পাবলিশ করা আছে।' : 'All edits are live.'}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveDraft}
            className="px-3.5 py-1.5 rounded-lg bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold cursor-pointer transition-colors"
          >
            {language === 'bn' ? 'খসড়া সংরক্ষণ (Save Draft)' : 'Save Draft'}
          </button>
          <button
            onClick={handlePublish}
            className="px-4 py-1.5 rounded-lg bg-[#167D78] hover:bg-[#102B3F] text-white font-extrabold cursor-pointer transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'ওয়েবসাইটে পাবলিশ করুন (Publish Live)' : 'Publish Live to Website'}</span>
          </button>
        </div>
      </div>

    </div>
  );
};
