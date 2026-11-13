import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  BookOpen,
  ShieldAlert,
  HeartPulse,
  Sparkles,
  Briefcase,
  Award,
  Mail,
  Phone,
  X,
  CheckCircle2,
  Crown,
  Users,
  Search,
  Droplets,
  MapPin,
  Calendar,
  IdCard,
  Printer,
  SlidersHorizontal,
  LayoutGrid,
  Table as TableIcon,
  ChevronRight,
  Scale,
  Shield,
  ShieldCheck,
  HeartHandshake,
  FileCheck2,
  Building2,
  History,
  Archive,
  Clock,
  Download,
  MessageSquare,
  QrCode,
  ChevronDown,
  Check,
  Eye,
  Camera
} from 'lucide-react';
import { TeamMember, GeneralMember, Language, CommitteeTerm, AdvisoryCouncilMember, WebsiteCustomConfig, AdminUser, WomensTeamMember } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { GENERAL_MEMBERS, INITIAL_COMMITTEE_TERMS, INITIAL_ADVISORY_COUNCIL } from '../data/mockData';
import { MemberProfilePage } from './MemberProfilePage';
import { MemberCelebrationsBanner } from './MemberCelebrationsBanner';
import { UrgentBloodModal } from './common/UrgentBloodModal';
import { QRGenerator } from './common/QRGenerator';
import { QRScannerModal } from './common/QRScannerModal';
import { MemberVerificationModal } from './common/MemberVerificationModal';
import { DirectoryPrintPreviewModal, PrintPreviewMemberItem } from './common/DirectoryPrintPreviewModal';
import { exportMembersToCSV } from '../utils/exportUtils';

export type AboutDisplayMode = 'full' | 'about_only' | 'committee_only' | 'history_only' | 'advisory_only' | 'members_only';

interface AboutSectionProps {
  team: TeamMember[];
  generalMembers?: GeneralMember[];
  committeeTerms?: CommitteeTerm[];
  advisors?: AdvisoryCouncilMember[];
  language: Language;
  initialTab?: 'central' | 'history' | 'advisory' | 'general';
  hidePillars?: boolean;
  displayMode?: AboutDisplayMode;
  onSelectMemberProfile?: (member: any) => void;
  onVerifyMember?: (member: GeneralMember, fromScan?: boolean) => void;
  websiteConfig?: WebsiteCustomConfig;
  birthdayMembers?: GeneralMember[];
  currentAdmin?: AdminUser | null;
  loggedInMember?: GeneralMember | null;
  currentWomensUser?: WomensTeamMember | null;
  onOpenPortal?: () => void;
  onOpenAdmin?: () => void;
  onEditOwnProfile?: () => void;
  onToast?: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  team,
  generalMembers = GENERAL_MEMBERS,
  committeeTerms = INITIAL_COMMITTEE_TERMS,
  advisors = INITIAL_ADVISORY_COUNCIL,
  language,
  initialTab = 'central',
  hidePillars = false,
  displayMode = 'full',
  onSelectMemberProfile,
  onVerifyMember,
  websiteConfig,
  birthdayMembers,
  currentAdmin,
  loggedInMember,
  currentWomensUser,
  onOpenPortal,
  onOpenAdmin,
  onEditOwnProfile,
  onToast,
}) => {
  const getDefaultTab = () => {
    if (displayMode === 'committee_only') return 'central';
    if (displayMode === 'history_only') return 'history';
    if (displayMode === 'advisory_only') return 'advisory';
    if (displayMode === 'members_only') return 'general';
    return initialTab || 'central';
  };

  const [activeTab, setActiveTab] = useState<'central' | 'history' | 'advisory' | 'general'>(getDefaultTab());

  React.useEffect(() => {
    if (displayMode === 'committee_only') setActiveTab('central');
    else if (displayMode === 'history_only') setActiveTab('history');
    else if (displayMode === 'advisory_only') setActiveTab('advisory');
    else if (displayMode === 'members_only') setActiveTab('general');
    else if (initialTab) setActiveTab(initialTab);
  }, [displayMode, initialTab]);

  const [activeMember, setActiveMember] = useState<TeamMember | null>(null);
  const [activeGeneralMember, setActiveGeneralMember] = useState<GeneralMember | null>(null);
  const [activeAdvisor, setActiveAdvisor] = useState<AdvisoryCouncilMember | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleSelectMember = (memberData: any) => {
    if (onSelectMemberProfile) {
      onSelectMemberProfile(memberData);
    } else {
      setActiveMember(memberData);
    }
  };

  // History Tab state
  const pastTerms = useMemo(() => committeeTerms.filter(t => !t.isCurrent), [committeeTerms]);
  const [selectedHistoryTermId, setSelectedHistoryTermId] = useState<string>(() => {
    return pastTerms[0]?.id || committeeTerms[0]?.id || '';
  });
  const [historySearch, setHistorySearch] = useState<string>('');

  // Advisory Council Tab state
  const [advisoryFilter, setAdvisoryFilter] = useState<'all' | 'current' | 'former'>('all');
  const [advisorySearch, setAdvisorySearch] = useState<string>('');

  // General Members state
  const [memberSearch, setMemberSearch] = useState<string>('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('all');
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [isDistrictDropdownOpen, setIsDistrictDropdownOpen] = useState<boolean>(false);
  const districtDropdownRef = useRef<HTMLDivElement>(null);
  const [displayView, setDisplayView] = useState<'grid' | 'table'>('grid');
  const [isBloodModalOpen, setIsBloodModalOpen] = useState(false);
  const [qrTargetMember, setQrTargetMember] = useState<GeneralMember | null>(null);
  const [localVerifyMember, setLocalVerifyMember] = useState<GeneralMember | null>(null);
  const [localVerifyFromScan, setLocalVerifyFromScan] = useState<boolean>(false);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);

  const openVerificationForMember = (member: GeneralMember, fromScan = false) => {
    setLocalVerifyFromScan(fromScan);
    if (onVerifyMember) {
      onVerifyMember(member, fromScan);
    } else {
      setLocalVerifyMember(member);
    }
  };

  const openVerificationById = (memberId: string) => {
    const normalized = memberId.trim().toLowerCase();
    const matched =
      generalMembers.find(
        m => m.membershipId.toLowerCase() === normalized || m.id.toLowerCase() === normalized
      ) || qrTargetMember;
    if (matched) {
      openVerificationForMember(matched);
    }
  };
  const t = TRANSLATIONS[language];

  // Close district multi-select dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (districtDropdownRef.current && !districtDropdownRef.current.contains(e.target as Node)) {
        setIsDistrictDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Birthday celebrations for current month (November / current month)
  const activeBirthdayMembers = useMemo(() => {
    if (birthdayMembers && birthdayMembers.length > 0) return birthdayMembers;
    const currentMonth = new Date().getMonth() + 1; // 1-12
    return generalMembers.filter(m => {
      if (m.birthMonth) return m.birthMonth === currentMonth;
      if (m.dateOfBirth) {
        const parts = m.dateOfBirth.split('-');
        if (parts.length >= 2) {
          return parseInt(parts[1], 10) === currentMonth;
        }
      }
      return false;
    });
  }, [birthdayMembers, generalMembers]);

  // Close modals on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeMember) setActiveMember(null);
        if (activeGeneralMember) setActiveGeneralMember(null);
        if (activeAdvisor) setActiveAdvisor(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMember, activeGeneralMember, activeAdvisor]);

  const pillars = [
    {
      icon: BookOpen,
      title: websiteConfig ? (language === 'bn' ? websiteConfig.pillar1TitleBn : websiteConfig.pillar1TitleBn) : t.pillar1,
      desc: websiteConfig ? (language === 'bn' ? websiteConfig.pillar1DescBn : websiteConfig.pillar1DescBn) : t.pillar1Desc,
      stat: websiteConfig?.pillar1StatBn || (language === 'bn' ? '৪৫০+ বার্ষিক বৃত্তি' : '450+ Annual Scholarships'),
      color: '#167D78'
    },
    {
      icon: ShieldAlert,
      title: websiteConfig ? (language === 'bn' ? websiteConfig.pillar2TitleBn : websiteConfig.pillar2TitleBn) : t.pillar2,
      desc: websiteConfig ? (language === 'bn' ? websiteConfig.pillar2DescBn : websiteConfig.pillar2DescBn) : t.pillar2Desc,
      stat: websiteConfig?.pillar2StatBn || (language === 'bn' ? '১২টি উপজেলায় রেসপন্স' : 'Active in 12 flood upazilas'),
      color: '#E6A15B'
    },
    {
      icon: HeartPulse,
      title: websiteConfig ? (language === 'bn' ? websiteConfig.pillar3TitleBn : websiteConfig.pillar3TitleBn) : t.pillar3,
      desc: websiteConfig ? (language === 'bn' ? websiteConfig.pillar3DescBn : websiteConfig.pillar3DescBn) : t.pillar3Desc,
      stat: websiteConfig?.pillar3StatBn || (language === 'bn' ? '১,৮৫০+ বিনামূল্যে রোগী' : '1,850+ Free consultations'),
      color: '#102B3F'
    },
    {
      icon: Sparkles,
      title: websiteConfig ? (language === 'bn' ? websiteConfig.pillar4TitleBn : websiteConfig.pillar4TitleBn) : t.pillar4,
      desc: websiteConfig ? (language === 'bn' ? websiteConfig.pillar4DescBn : websiteConfig.pillar4DescBn) : t.pillar4Desc,
      stat: websiteConfig?.pillar4StatBn || (language === 'bn' ? '১২০+ কর্মজীবী মা' : '120+ Micro-entrepreneurs'),
      color: '#E11D48'
    },
    {
      icon: Briefcase,
      title: language === 'bn' ? 'পুরুষ ও যুবকদের কর্মসংস্থান' : 'Men & Youth Livelihood',
      desc: language === 'bn' ? 'বেকার যুবকদের ভ্যান/রিকশা প্রদান, মেকানিক ও ইলেকট্রিক্যাল প্রশিক্ষণ এবং ক্ষুদ্র ব্যবসা পুঁজি সহায়তা।' : 'Trade training toolkits, electric rickshaws & micro-capital for young men and family breadwinners.',
      stat: language === 'bn' ? '১৮০+ আত্মনির্ভর পরিবার' : '180+ Self-reliant youths',
      color: '#0D9488'
    }
  ];

  const categoryFilters = [
    { id: 'all', labelBn: 'সকল কার্যনির্বাহী পরিষদ (১৬ জন)', labelEn: 'All Committee (16)' },
    { id: 'executive', labelBn: 'শীর্ষ নেতৃত্ব ও প্রশাসন', labelEn: 'Executive & Admin' },
    { id: 'finance', labelBn: 'অর্থ ও হিসাব', labelEn: 'Finance' },
    { id: 'education', labelBn: 'শিক্ষা ও সংস্কৃতি', labelEn: 'Education & Culture' },
    { id: 'welfare', labelBn: 'সমাজকল্যাণ ও ত্রাণ', labelEn: 'Social Welfare' },
    { id: 'publicity', labelBn: 'প্রচার ও পরিকল্পনা', labelEn: 'Publicity & Planning' },
    { id: 'sports', labelBn: 'ক্রীড়া ও যুব উন্নয়ন', labelEn: 'Sports & Youth' },
  ];

  const filteredTeam = selectedCategory === 'all'
    ? team
    : team.filter(m => m.category === selectedCategory);

  const founder = team.find(m => m.isFounder) || team[0];

  // Distinct lists for filters
  const uniqueDistricts = useMemo(() => {
    const list = Array.from(new Set(generalMembers.map(m => m.district)));
    return list.sort();
  }, [generalMembers]);

  const uniqueBloodGroups = useMemo(() => {
    const list = Array.from(new Set(generalMembers.map(m => m.bloodGroup)));
    return list.sort();
  }, [generalMembers]);

  // Filtered general members
  // Filtered general members (Only APPROVED members are publicly displayed)
  const filteredGeneralMembers = useMemo(() => {
    return generalMembers.filter(member => {
      // Must be approved (or legacy active) - pending/rejected are kept private until Admin approves
      const isApproved = member.approvalStatus === 'approved' || (!member.approvalStatus && member.status === 'active');
      if (!isApproved) return false;

      const q = memberSearch.toLowerCase().trim();
      const matchesSearch = !q ||
        member.nameBn.toLowerCase().includes(q) ||
        member.nameEn.toLowerCase().includes(q) ||
        member.membershipId.toLowerCase().includes(q) ||
        member.district.toLowerCase().includes(q) ||
        member.bloodGroup.toLowerCase().includes(q) ||
        member.roleBn.toLowerCase().includes(q);

      const matchesBlood = selectedBloodGroup === 'all' || member.bloodGroup === selectedBloodGroup;
      const matchesDistrict = selectedDistricts.length === 0 || selectedDistricts.includes(member.district);

      return matchesSearch && matchesBlood && matchesDistrict;
    });
  }, [generalMembers, memberSearch, selectedBloodGroup, selectedDistricts]);

  const toggleDistrictSelection = (district: string) => {
    setSelectedDistricts(prev =>
      prev.includes(district)
        ? prev.filter(d => d !== district)
        : [...prev, district]
    );
  };

  const handlePrintMembersList = () => {
    window.print();
  };

  return (
    <section id="about" className="py-14 sm:py-20 bg-stone-50/60 dark:bg-[#09151e] border-t border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Dedicated View: ABOUT US (Genesis, Pillars, Principles) */}
        {(displayMode === 'full' || displayMode === 'about_only') && (
          <>
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-14">
              <div className="text-xs uppercase tracking-widest font-bold text-[#167D78] dark:text-[#D6F36A] mb-2">
                {language === 'bn' ? 'আমাদের দর্শন ও অঙ্গীকার' : 'Institutional Philosophy'}
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#102B3F] dark:text-white tracking-tight">
                {t.aboutTitle}
              </h2>
              <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 mt-2">
                {t.aboutSubtitle}
              </p>
            </div>

        {/* Founding Genesis & Constitutional Charter Banner */}
        <div className="mb-14 bg-gradient-to-br from-[#102B3F] via-[#0e2738] to-[#167D78] text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-teal-500/30 relative overflow-hidden">
          {/* Subtle backdrop pattern */}
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#D6F36A]/10 blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10">
            {/* Seal / Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-6 border-b border-white/10">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D6F36A]">
                <Building2 className="w-4 h-4" />
                <span>
                  {language === 'bn'
                    ? 'প্রতিষ্ঠার ঐতিহাসিক প্রেক্ষাপট ও সাংবিধানিক মূলনীতি'
                    : 'Founding Charter & Constitutional Principles'}
                </span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-stone-200">
                <Calendar className="w-3.5 h-3.5 text-[#D6F36A]" />
                <span className="font-semibold">
                  {websiteConfig?.foundingDateBn ? `প্রতিষ্ঠাকাল: ${websiteConfig.foundingDateBn}` : (language === 'bn' ? 'প্রতিষ্ঠাকাল: ০৭-০৩-২০২৬ খ্রিস্টাব্দ' : 'Founded: 07 March 2026')}
                </span>
                <span className="text-white/40">·</span>
                <MapPin className="w-3.5 h-3.5 text-[#E6A15B]" />
                <span>
                  {websiteConfig?.foundingLocationBn || (language === 'bn' ? 'কমলগঞ্জ, মৌলভীবাজার (সিলেট বিভাগ)' : 'Kamalganj, Moulvibazar (Sylhet)')}
                </span>
              </div>
            </div>

            {/* Genesis Statement */}
            <div className="max-w-4xl mb-8">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-snug tracking-tight">
                {websiteConfig?.charterStatementBn || (language === 'bn'
                  ? 'সিলেট বিভাগ, মৌলভীবাজার জেলার কমলগঞ্জ উপজেলায় জনকল্যাণমূলক ও মানবতার সেবায় কাজ করার উদ্দেশ্যে ০৭-০৩-২০২৬ খ্রিস্টাব্দে প্রতিষ্ঠিত হলো COLASH (Circle of Light and Service for Humanity)!'
                  : 'Founded on 07-03-2026 in Kamalganj Upazila, Moulvibazar District, Sylhet Division, with the sole dedication to public welfare and humanitarian service: COLASH (Circle of Light and Service for Humanity)!')}
              </h3>
            </div>

            {/* Split Pillars: Naming & Slogans */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
              
              {/* Naming Block */}
              <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-[#D6F36A] block mb-2">
                    {language === 'bn' ? 'সংগঠনের অফিসিয়াল নামকরণ' : 'Official Organization Name'}
                  </span>
                  <div className="text-lg sm:text-xl font-bold text-white mb-1">
                    “{websiteConfig ? (language === 'bn' ? websiteConfig.siteSubtitleBn : websiteConfig.siteSubtitleEn) : 'মানবতার জন্য আলো এবং সেবার বলয়'}”
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-stone-200 font-sans tracking-wide">
                    “{websiteConfig ? websiteConfig.siteTitleBn : 'COLASH'} — {websiteConfig ? websiteConfig.siteSubtitleEn : 'Circle of Light and Service for Humanity'}”
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-stone-300">
                  {language === 'bn'
                    ? 'সংক্ষিপ্ত রূপ: কোলাশ (COLASH)'
                    : 'Acronym: COLASH (Circle of Light And Service for Humanity)'}
                </div>
              </div>

              {/* Slogan Block */}
              <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-[#E6A15B] block mb-2">
                    {language === 'bn' ? 'সংগঠনের অফিসিয়াল স্লোগান' : 'Official Slogan'}
                  </span>
                  <div className="text-lg sm:text-xl font-bold text-[#D6F36A] mb-1 font-serif italic">
                    {websiteConfig ? (language === 'bn' ? websiteConfig.siteSloganBn : websiteConfig.siteSloganEn) : '“জীবন আলোকিত করুন। মানবতার সেবা করুন।”'}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-stone-200 tracking-wide italic">
                    {websiteConfig?.siteSloganEn || '“Illuminate Lives. Serve Humanity.”'}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-stone-300">
                  {language === 'bn'
                    ? 'প্রতিটি সদস্য ও স্বেচ্ছাসেবীর পথচলার মূল প্রেরণা'
                    : 'The guiding beacon for every volunteer and humanitarian action'}
                </div>
              </div>

            </div>

            {/* Core Nature & Characteristics (ধরণ ও বৈশিষ্ট্য) */}
            <div className="p-6 rounded-2xl bg-black/25 border border-white/10">
              <div className="text-xs uppercase tracking-wider font-bold text-[#D6F36A] mb-4 flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#E6A15B]" />
                <span>{language === 'bn' ? 'সংগঠনের ধরণ, বৈশিষ্ট্য ও আইনি রূপরেখা' : 'Nature, Characteristics & Statutory Framework'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                    <CheckCircle2 className="w-4 h-4 text-[#D6F36A] shrink-0" />
                    <span>{language === 'bn' ? 'অসাম্প্রদায়িক ও গণতান্ত্রিক' : 'Non-Communal & Democratic'}</span>
                  </div>
                  <p className="text-[11px] text-stone-300 leading-relaxed">
                    {language === 'bn'
                      ? 'COLASH একটি সম্পূর্ণ অসাম্প্রদায়িক, অরাজনৈতিক, অলাভজনক, স্বেচ্ছাসেবী, সামাজিক, গণতান্ত্রিক ও জনকল্যাণমুখী সংগঠন।'
                      : 'COLASH is a fully non-communal, non-political, non-profit, voluntary, democratic, and public welfare organization.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                    <Shield className="w-4 h-4 text-[#E6A15B] shrink-0" />
                    <span>{language === 'bn' ? 'সম্পূর্ণ স্বাধীন ও স্বতন্ত্র' : 'Fully Independent Body'}</span>
                  </div>
                  <p className="text-[11px] text-stone-300 leading-relaxed">
                    {language === 'bn'
                      ? 'কোনো অঙ্গসংগঠন থাকবে না এবং এটি অন্য কোনো সংগঠনের অংশ হিসেবেও কাজ করবে না। শতভাগ স্বাধীন ও দলনিরপেক্ষ।'
                      : 'Maintains zero affiliated sub-wings and shall never function as an extension of any external organization.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                    <FileCheck2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{language === 'bn' ? '১৯৬১ অধ্যাদেশ অনুযায়ী নিবন্ধন' : '1961 Ordinance Compliance'}</span>
                  </div>
                  <p className="text-[11px] text-stone-300 leading-relaxed">
                    {language === 'bn'
                      ? 'অদূর ভবিষ্যতে "স্বেচ্ছাসেবী সমাজকল্যাণ সংস্থা (নিবন্ধন ও নিয়ন্ত্রণ) অধ্যাদেশ, ১৯৬১" অনুযায়ী স্বেচ্ছাসেবী সংস্থা হিসেবে নিবন্ধনের উদ্যোগ নেওয়া হবে।'
                      : 'Institutional registration is underway under the Voluntary Social Welfare Agencies (Registration & Control) Ordinance, 1961.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                    <Scale className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>{language === 'bn' ? 'দেশের সকল আইনের প্রতি আনুগত্য' : 'Full Statutory Adherence'}</span>
                  </div>
                  <p className="text-[11px] text-stone-300 leading-relaxed">
                    {language === 'bn'
                      ? 'সংস্থা গণপ্রজাতন্ত্রী বাংলাদেশের সংবিধান ও প্রচলিত সকল আইন, বিধি ও সরকারি নীতিমালা যথাযথভাবে অনুসরণ করবে।'
                      : 'The foundation meticulously abides by all statutory laws, administrative regulations, and public policies of Bangladesh.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                    <HeartHandshake className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{language === 'bn' ? 'নিঃস্বার্থ স্বেচ্ছাসেবা' : 'Selfless Volunteerism'}</span>
                  </div>
                  <p className="text-[11px] text-stone-300 leading-relaxed">
                    {language === 'bn'
                      ? 'সংগঠন সম্পূর্ণ অরাজনৈতিক ও অলাভজনক; সকল সদস্য ও স্বেচ্ছাসেবীরা মানবিক কাজে সম্পূর্ণ নিঃস্বার্থভাবে অংশগ্রহণ করেন।'
                      : '100% voluntary and selfless engagement; members and volunteers dedicate time without political interest or monetary gain.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                    <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                    <span>{language === 'bn' ? 'প্রত্যক্ষ জনকল্যাণ ও আলোকবর্তিকা' : 'Enlightenment & Direct Care'}</span>
                  </div>
                  <p className="text-[11px] text-stone-300 leading-relaxed">
                    {language === 'bn'
                      ? 'মৌলভীবাজার, সিলেটসহ দেশব্যাপী সুবিধাবঞ্চিত শিশুদের শিক্ষা, স্বাস্থ্য, জরুরি ত্রাণ ও অসহায় মানুষের জীবন আলোকিত করাই মূল ব্রত।'
                      : 'Direct field delivery of education, medical camps, and relief aid to brighten and empower marginalized lives.'}
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Vision & Mission Split Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div className="p-8 rounded-2xl bg-white dark:bg-[#0c1a24] border border-stone-200 dark:border-stone-800 shadow-xs relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-[#167D78]/10 text-[#167D78] flex items-center justify-center font-bold text-sm mb-4">
              01
            </div>
            <h3 className="text-xl font-bold text-[#102B3F] dark:text-white mb-2">
              {t.visionTitle}
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              {t.visionText}
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white dark:bg-[#0c1a24] border border-stone-200 dark:border-stone-800 shadow-xs relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-[#E6A15B]/10 text-[#E6A15B] flex items-center justify-center font-bold text-sm mb-4">
              02
            </div>
            <h3 className="text-xl font-bold text-[#102B3F] dark:text-white mb-2">
              {t.missionTitle}
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              {t.missionText}
            </p>
          </div>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-[#102B3F] dark:text-white">
              {t.pillarsTitle}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white dark:bg-[#0c1a24] border border-stone-200 dark:border-stone-800 flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 shadow-xs"
                      style={{ backgroundColor: pillar.color }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-[#102B3F] dark:text-white mb-2">
                      {pillar.title}
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed mb-4">
                      {pillar.desc}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-stone-100 dark:border-stone-800 text-[11px] font-semibold text-[#167D78] dark:text-[#D6F36A]">
                    {pillar.stat}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        </>
      )}

      {/* Dedicated Header: COMMITTEE ONLY */}
      {displayMode === 'committee_only' && (
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#167D78]/10 text-[#167D78] dark:text-[#D6F36A] text-xs font-bold uppercase tracking-wider mb-2">
            <Crown className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'কার্যনির্বাহী পরিষদ ২০২৬-২০২৮' : 'Governing Council 2026-2028'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#102B3F] dark:text-white tracking-tight">
            {language === 'bn' ? 'বর্তমান কেন্দ্রীয় পরিচালনা পরিষদ' : 'Current Executive Committee'}
          </h2>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 mt-2">
            {language === 'bn' ? 'কোলাশ ফাউন্ডেশনের সার্বিক নীতি নির্ধারণ ও মাঠপর্যায়ের কার্যক্রম পরিচালনাকারী শীর্ষ নেতৃত্ব।' : 'Executive leadership directing operational and humanitarian policy.'}
          </p>
        </div>
      )}

      {/* Dedicated Header: HISTORY ONLY */}
      {displayMode === 'history_only' && (
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#167D78]/10 text-[#167D78] dark:text-[#D6F36A] text-xs font-bold uppercase tracking-wider mb-2">
            <History className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'প্রাতিষ্ঠানিক আর্কাইভ ও ঐতিহ্য' : 'Institutional Archive'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#102B3F] dark:text-white tracking-tight">
            {language === 'bn' ? 'বিগত কমিটিসমূহ ও সাবেক পরিষদ' : 'Past Committees & Historical Rosters'}
          </h2>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 mt-2">
            {language === 'bn' ? 'কোলাশ ফাউন্ডেশনের প্রতিষ্ঠালগ্ন থেকে অতীত মেয়াদের দায়িত্বপ্রাপ্ত নেতৃবৃন্দের ঐতিহাসিক বিবরণী।' : 'Historical archive of leadership terms and committee members.'}
          </p>
        </div>
      )}

      {/* Dedicated Header: ADVISORY ONLY */}
      {displayMode === 'advisory_only' && (
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'দিকনির্দেশনা ও অভিভাবকত্ব' : 'Guidance & Patronage'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#102B3F] dark:text-white tracking-tight">
            {language === 'bn' ? 'সম্মানিত উপদেষ্টা পরিষদ' : 'Distinguished Advisory Council'}
          </h2>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 mt-2">
            {language === 'bn' ? 'অভিজ্ঞ শিক্ষাবিদ, গবেষক ও শুভানুধ্যায়ী ব্যক্তিবর্গ যারা ফাউন্ডেশনকে সঠিক দিশা প্রদান করছেন।' : 'Esteemed advisors and patrons providing wisdom and guidance.'}
          </p>
        </div>
      )}

      {/* Dedicated Header: MEMBERS ONLY */}
      {displayMode === 'members_only' && (
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-bold uppercase tracking-wider mb-2">
            <Users className="w-4 h-4 text-[#167D78] dark:text-[#D6F36A]" />
            <span>{language === 'bn' ? 'নিবন্ধিত সদস্যবৃন্দ ও সেচ্ছাসেবক বলয়' : 'Registered Member Network'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#102B3F] dark:text-white tracking-tight">
            {language === 'bn' ? 'সাধারণ সদস্য ও স্বেচ্ছাসেবক ডিরেক্টরি' : 'General Members & Volunteers Directory'}
          </h2>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 mt-2">
            {language === 'bn' ? 'রক্তের গ্রুপ ও জেলাভিত্তিক ফিল্টারিং সহ অনুমোদিত সদস্যদের পূর্ণাঙ্গ তালিকা ও তথ্য।' : 'Searchable registry with blood group and district filtering.'}
          </p>
        </div>
      )}

      {/* President & Founder Spotlight Message (Only in full or committee_only) */}
      {(displayMode === 'full' || displayMode === 'committee_only') && founder && (
        <div style={{ backgroundColor: '#052626' }} className="mb-16 p-6 sm:p-8 rounded-2xl text-white shadow-xl border border-white/10 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-4 flex flex-col items-center sm:items-start text-center sm:text-left">
              <div
                onClick={() => handleSelectMember(founder)}
                className="relative w-36 h-36 rounded-2xl overflow-hidden border-2 border-[#D6F36A] shadow-lg mb-4 cursor-pointer group"
              >
                <img
                  src={founder.image}
                  alt={language === 'bn' ? founder.nameBn : founder.nameEn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 p-1 bg-[#D6F36A] text-[#102B3F] rounded-md shadow-xs">
                  <Crown className="w-4 h-4" />
                </div>
              </div>
              
              <h3
                onClick={() => handleSelectMember(founder)}
                className="text-xl font-bold leading-tight cursor-pointer hover:text-[#D6F36A] transition-colors"
              >
                {language === 'bn' ? founder.nameBn : founder.nameEn}
              </h3>
              <span
                onClick={() => handleSelectMember(founder)}
                className="text-xs font-semibold text-[#D6F36A] uppercase tracking-wider mt-1 block cursor-pointer hover:underline"
              >
                {language === 'bn' ? founder.roleBn : founder.roleEn}
              </span>
              <span className="text-[11px] text-stone-300 mt-1 block font-mono">
                {founder.email}
              </span>
            </div>

            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D6F36A]">
                <Sparkles className="w-4 h-4 text-[#E6A15B]" />
                <span>{language === 'bn' ? 'প্রতিষ্ঠাতার বাণী ও মূল ভাবনা' : 'Founder’s Vision & Leadership Note'}</span>
              </div>
              <blockquote className="text-base sm:text-lg italic text-stone-100 leading-relaxed font-serif">
                {language === 'bn'
                  ? '“মানবসেবা কোনো বিশেষ ঋতু বা ক্ষণিকের উদ্যোগ নয়; এটি সমাজের সুবিধাবঞ্চিত প্রতিটি মানুষের মৌলিক অধিকার নিশ্চিত করার একটি টেকসই সংগ্রাম। কোলাশ ফাউন্ডেশনের প্রতিটি সদস্য ও ভলান্টিয়ার এই পবিত্র আমানতের পাহারাদার।”'
                  : '“Humanitarian service is not an episodic relief drive; it is a dedicated, transparent mission to protect dignity and empower marginalized children and families to stand self-reliant.”'}
              </blockquote>
              <p className="text-xs text-stone-300 leading-relaxed">
                {language === 'bn' ? founder.bioBn : founder.bioEn}
              </p>
              <div className="pt-2 flex items-center gap-4 text-[11px] text-stone-300">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'অনুমোদিত কার্যনির্বাহী পরিষদ ২০২৬-২০২৮' : 'Approved Executive Council 2026-2028'}</span>
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Section Navigation Tabs (Only rendered when displayMode is 'full') */}
      {displayMode === 'full' && (
        <div className="no-print mb-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
            <div>
              <div className="text-xs uppercase tracking-widest font-bold text-[#167D78] dark:text-[#D6F36A] mb-1 flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>{language === 'bn' ? 'প্রাতিষ্ঠানিক কাঠামো' : 'Organizational Structure'}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#102B3F] dark:text-white">
                {language === 'bn' ? 'পরিচালনা পরিষদ ও সাধারণ সদস্যবৃন্দ' : 'Governance Council & General Members'}
              </h3>
            </div>

            {/* Tab Pill Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-200/70 dark:bg-stone-800 rounded-xl">
              <button
                onClick={() => setActiveTab('central')}
                className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'central'
                    ? 'bg-[#102B3F] text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <Crown className="w-3.5 h-3.5 text-[#D6F36A]" />
                <span>{language === 'bn' ? 'বর্তমান কমিটি (১৬ জন)' : 'Current Council (16)'}</span>
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'history'
                    ? 'bg-[#167D78] text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5 text-[#D6F36A]" />
                <span>{language === 'bn' ? 'কমিটি ইতিহাস ও সাবেক পরিষদ' : 'Committee History'}</span>
              </button>

              <button
                onClick={() => setActiveTab('advisory')}
                className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'advisory'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-[#D6F36A]" />
                <span>{language === 'bn' ? `উপদেষ্টামণ্ডলী (${advisors.length})` : `Advisors (${advisors.length})`}</span>
              </button>

              <button
                onClick={() => setActiveTab('general')}
                className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'general'
                    ? 'bg-stone-900 dark:bg-stone-700 text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <IdCard className="w-3.5 h-3.5 text-[#D6F36A]" />
                <span>{language === 'bn' ? `সদস্য তালিকা (${generalMembers.length})` : `Members (${generalMembers.length})`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

        {/* TAB 1: CENTRAL EXECUTIVE COUNCIL */}
        {activeTab === 'central' && displayMode !== 'about_only' && (
          <div>
            {/* Department Filter Bar & Quick Camera Scan */}
            <div className="no-print flex flex-wrap items-center justify-center gap-2 mb-10 max-w-5xl mx-auto">
              <div className="flex flex-wrap items-center justify-center gap-1.5 p-1.5 bg-stone-100 dark:bg-stone-800 rounded-xl">
                {categoryFilters.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                      selectedCategory === cat.id
                        ? 'bg-white dark:bg-[#102B3F] text-[#102B3F] dark:text-white shadow-xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    {language === 'bn' ? cat.labelBn : cat.labelEn}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setIsQrScannerOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#102B3F] hover:bg-[#167D78] text-[#D6F36A] hover:text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
                title={language === 'bn' ? 'ক্যামেরা দিয়ে আইডি কার্ড স্ক্যান করে যাচাই করুন' : 'Scan ID card with camera to verify'}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'ক্যামেরা ID স্ক্যান' : 'Scan ID (Camera)'}</span>
              </button>
            </div>

            {/* Member Cards Grid */}
            <div className="print-member-directory-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredTeam.map((member) => (
                <div
                  key={member.id}
                  onClick={() => handleSelectMember(member)}
                  className="print-member-card bg-white dark:bg-[#0c1a24] rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden hover:border-[#167D78] transition-all cursor-pointer group shadow-xs hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="h-52 w-full overflow-hidden bg-stone-100 dark:bg-stone-800 relative">
                      <img
                        src={member.image}
                        alt={language === 'bn' ? member.nameBn : member.nameEn}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectMember(member);
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3.5">
                        <span className="text-[11px] text-[#D6F36A] font-medium tracking-wide flex items-center gap-1">
                          {language === 'bn' ? 'বিস্তারিত প্রোফাইল' : 'View Profile'}
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>

                      {member.isFounder && (
                        <span className="absolute top-2.5 right-2.5 bg-[#D6F36A] text-[#102B3F] text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                          {language === 'bn' ? 'প্রতিষ্ঠাতা' : 'Founder'}
                        </span>
                      )}
                    </div>

                    <div className="p-4">
                      <h4
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectMember(member);
                        }}
                        className="font-bold text-sm text-[#102B3F] dark:text-white group-hover:text-[#167D78] dark:group-hover:text-[#D6F36A] transition-colors leading-snug cursor-pointer"
                      >
                        {language === 'bn' ? member.nameBn : member.nameEn}
                      </h4>
                      <p className="text-xs text-[#167D78] dark:text-[#D6F36A] font-semibold mt-1">
                        {language === 'bn' ? member.roleBn : member.roleEn}
                      </p>
                    </div>
                  </div>

                  <div className="px-4 pb-4 pt-1 text-[11px] text-stone-500 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                    <span>CoLASH Council</span>
                    <span className="font-mono text-[10px] text-stone-400">{member.email?.split('@')[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: COMMITTEE HISTORY & PAST COUNCILS */}
        {activeTab === 'history' && displayMode !== 'about_only' && (
          <div className="space-y-6">
            {/* Header description */}
            <div className="p-6 bg-white dark:bg-[#0c1a24] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#167D78] dark:text-[#D6F36A] mb-1">
                    <History className="w-4 h-4" />
                    <span>{language === 'bn' ? 'কমিটি ইতিহাস ও সাবেক পরিষদ সংরক্ষণাগার' : 'Historic Councils & Archive'}</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#102B3F] dark:text-white">
                    {language === 'bn' ? 'বছর ও কার্যকাল অনুযায়ী সাবেক কমিটির তালিকা' : 'Past Committees by Term & Years'}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    {language === 'bn'
                      ? 'কোলাশ ফাউন্ডেশনের প্রতিষ্ঠাকালীন ও সাবেক সকল দায়িত্বশীলদের স্থায়ী আর্কাইভ।'
                      : 'Permanent institutional archive preserving past leadership tenures and volunteer contributions.'}
                  </p>
                </div>

                {/* Term switcher pills */}
                <div className="flex flex-wrap items-center gap-2">
                  {committeeTerms.map((term) => (
                    <button
                      key={term.id}
                      onClick={() => setSelectedHistoryTermId(term.id)}
                      className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                        selectedHistoryTermId === term.id
                          ? 'bg-[#102B3F] text-white shadow-sm'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                      }`}
                    >
                      {term.isCurrent ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      ) : (
                        <Archive className="w-3 h-3 text-amber-500" />
                      )}
                      <span>{language === 'bn' ? term.termTitleBn : term.termTitleEn}</span>
                      <span className="text-[10px] opacity-75 font-mono">({term.members.length})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Search input for history members */}
              <div className="no-print relative max-w-md">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder={language === 'bn' ? 'সাবেক কমিটির সদস্য বা পদবি দিয়ে খুঁজুন...' : 'Search past council members...'}
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm text-stone-800 dark:text-stone-100 focus:outline-hidden focus:border-[#167D78]"
                />
              </div>
            </div>

            {/* Selected Term Details Banner & Members */}
            {(() => {
              const currentHistoryTerm = committeeTerms.find(t => t.id === selectedHistoryTermId) || committeeTerms[0];
              if (!currentHistoryTerm) return null;

              const filteredHistoryMembers = currentHistoryTerm.members.filter(m => {
                const q = historySearch.toLowerCase().trim();
                if (!q) return true;
                return (
                  m.nameBn.toLowerCase().includes(q) ||
                  m.nameEn.toLowerCase().includes(q) ||
                  m.roleBn.toLowerCase().includes(q) ||
                  m.roleEn.toLowerCase().includes(q)
                );
              });

              return (
                <div className="space-y-6">
                  {/* Banner */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-stone-100/80 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-base text-[#102B3F] dark:text-white">
                          {language === 'bn' ? currentHistoryTerm.termTitleBn : currentHistoryTerm.termTitleEn}
                        </h4>
                        {currentHistoryTerm.isCurrent ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                            {language === 'bn' ? 'বর্তমান কার্যকর' : 'Active'}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-bold">
                            {language === 'bn' ? 'সংরক্ষিত অতীত মেয়াদ' : 'Archived Term'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                        {language === 'bn' ? currentHistoryTerm.descriptionBn : currentHistoryTerm.descriptionEn}
                      </p>
                    </div>

                    <div className="text-xs font-mono font-bold text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-900 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 shrink-0">
                      {language === 'bn' ? `কার্যকাল: ${currentHistoryTerm.startYear} - ${currentHistoryTerm.endYear}` : `Tenure: ${currentHistoryTerm.startYear} - ${currentHistoryTerm.endYear}`}
                    </div>
                  </div>

                  {/* Members Grid */}
                  <div className="print-member-directory-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredHistoryMembers.map((member) => (
                      <div
                        key={member.id}
                        onClick={() => handleSelectMember(member)}
                        className="print-member-card bg-white dark:bg-[#0c1a24] rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden hover:border-[#167D78] transition-all cursor-pointer group shadow-xs hover:shadow-md flex flex-col justify-between"
                      >
                        <div>
                          <div className="h-48 w-full overflow-hidden bg-stone-100 dark:bg-stone-800 relative">
                            <img
                              src={member.image}
                              alt={language === 'bn' ? member.nameBn : member.nameEn}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectMember(member);
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                              <span className="text-[11px] text-[#D6F36A] font-medium tracking-wide flex items-center gap-1">
                                {language === 'bn' ? 'বিস্তারিত প্রোফাইল' : 'View Profile'}
                                <ChevronRight className="w-3 h-3" />
                              </span>
                            </div>
                            {member.isFounder && (
                              <span className="absolute top-2.5 right-2.5 bg-[#D6F36A] text-[#102B3F] text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                                {language === 'bn' ? 'প্রতিষ্ঠাতা' : 'Founder'}
                              </span>
                            )}
                          </div>
                          <div className="p-4">
                            <h4 className="font-bold text-sm text-[#102B3F] dark:text-white group-hover:text-[#167D78] dark:group-hover:text-[#D6F36A] transition-colors leading-snug">
                              {language === 'bn' ? member.nameBn : member.nameEn}
                            </h4>
                            <p className="text-xs text-[#167D78] dark:text-[#D6F36A] font-semibold mt-1">
                              {language === 'bn' ? member.roleBn : member.roleEn}
                            </p>
                          </div>
                        </div>

                        <div className="px-4 pb-3 pt-1 text-[11px] text-stone-500 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                          <span>{currentHistoryTerm.startYear} - {currentHistoryTerm.endYear}</span>
                          <span className="font-mono text-[10px] text-stone-400">Archived Record</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredHistoryMembers.length === 0 && (
                    <div className="p-8 text-center bg-white dark:bg-[#0c1a24] rounded-2xl border border-stone-200 dark:border-stone-800">
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        {language === 'bn' ? 'কোনো সদস্য খুঁজে পাওয়া যায়নি।' : 'No members found matching your search.'}
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB: ADVISORY COUNCIL */}
        {activeTab === 'advisory' && displayMode !== 'about_only' && (
          <div className="space-y-6">
            <div className="p-6 bg-white dark:bg-[#0c1a24] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
                    <Award className="w-4 h-4" />
                    <span>{language === 'bn' ? 'সম্মানিত উপদেষ্টামণ্ডলী' : 'Distinguished Advisory Council'}</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#102B3F] dark:text-white">
                    {language === 'bn' ? 'বর্তমান ও সাবেক সম্মানিত উপদেষ্টাবৃন্দ' : 'Current & Emeritus Respected Advisors'}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    {language === 'bn'
                      ? 'কোলাশ ফাউন্ডেশনের মানবিক, আইনি, চিকিৎসা ও সামাজিক দিকনির্দেশক প্রবীণ শিক্ষাবিদ ও সমাজহিতৈষী ব্যক্তিত্ব।'
                      : 'Eminent scholars, jurists, physicians, and philanthropists guiding CoLASH missions.'}
                  </p>
                </div>

                {/* Sub filter buttons */}
                <div className="no-print inline-flex p-1 bg-stone-100 dark:bg-stone-800 rounded-xl">
                  <button
                    onClick={() => setAdvisoryFilter('all')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      advisoryFilter === 'all'
                        ? 'bg-[#102B3F] text-white shadow-xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    {language === 'bn' ? `সকল (${advisors.length})` : `All (${advisors.length})`}
                  </button>
                  <button
                    onClick={() => setAdvisoryFilter('current')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                      advisoryFilter === 'current'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3 text-[#D6F36A]" />
                    <span>{language === 'bn' ? 'বর্তমান' : 'Current'}</span>
                  </button>
                  <button
                    onClick={() => setAdvisoryFilter('former')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                      advisoryFilter === 'former'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>{language === 'bn' ? 'সাবেক / ইমেরিটাস' : 'Emeritus'}</span>
                  </button>
                </div>
              </div>

              {/* Search input */}
              <div className="no-print relative max-w-md">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={advisorySearch}
                  onChange={(e) => setAdvisorySearch(e.target.value)}
                  placeholder={language === 'bn' ? 'উপদেষ্টার নাম, পদবি বা প্রতিষ্ঠান দিয়ে খুঁজুন...' : 'Search advisors by name or institution...'}
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm text-stone-800 dark:text-stone-100 focus:outline-hidden focus:border-[#167D78]"
                />
              </div>
            </div>

            {/* Advisors Grid */}
            <div className="print-member-directory-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {advisors
                .filter(adv => {
                  const q = advisorySearch.toLowerCase().trim();
                  const matchesSearch = !q ||
                    adv.nameBn.toLowerCase().includes(q) ||
                    adv.nameEn.toLowerCase().includes(q) ||
                    adv.roleBn.toLowerCase().includes(q) ||
                    adv.roleEn.toLowerCase().includes(q) ||
                    (adv.organizationBn && adv.organizationBn.toLowerCase().includes(q));

                  const matchesFilter =
                    advisoryFilter === 'all' ||
                    (advisoryFilter === 'current' && adv.status === 'current') ||
                    (advisoryFilter === 'former' && adv.status === 'former');

                  return matchesSearch && matchesFilter;
                })
                .map((advisor) => (
                  <div
                    key={advisor.id}
                    onClick={() => handleSelectMember({
                      ...advisor,
                      roleBn: advisor.roleBn,
                      roleEn: advisor.roleEn,
                      image: advisor.image,
                      memberId: `COLASH-ADV-${advisor.id}`,
                      category: advisor.status === 'current' ? 'বর্তমান উপদেষ্টা' : 'সাবেক উপদেষ্টা',
                    })}
                    className="print-member-card p-5 bg-white dark:bg-[#0c1a24] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs hover:border-blue-500 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 shrink-0 relative">
                          <img
                            src={advisor.image}
                            alt={language === 'bn' ? advisor.nameBn : advisor.nameEn}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';
                            }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            {advisor.status === 'current' ? (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                                {language === 'bn' ? 'বর্তমান উপদেষ্টা' : 'Current'}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                                {language === 'bn' ? 'সাবেক / ইমেরিটাস' : 'Emeritus'}
                              </span>
                            )}
                          </div>

                          <h4 className="font-extrabold text-sm text-[#102B3F] dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {language === 'bn' ? advisor.nameBn : advisor.nameEn}
                          </h4>

                          <p className="text-xs font-bold text-[#167D78] dark:text-[#D6F36A] mt-0.5">
                            {language === 'bn' ? advisor.roleBn : advisor.roleEn}
                          </p>

                          {advisor.organizationBn && (
                            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                              {language === 'bn' ? advisor.organizationBn : advisor.organizationEn}
                            </p>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed line-clamp-3 mb-3">
                        {language === 'bn' ? advisor.bioBn : advisor.bioEn}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 text-[11px] flex items-center justify-between text-stone-500 dark:text-stone-400">
                      <span>{language === 'bn' ? `যোগদান: ${advisor.joinedDate}` : `Joined: ${advisor.joinedDate}`}</span>
                      <span className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-0.5">
                        {language === 'bn' ? 'প্রোফাইল' : 'View'}
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 4: GENERAL MEMBERS LIST */}
        {activeTab === 'general' && displayMode !== 'about_only' && (
          <div className="space-y-6">
            
            {/* Member Celebrations Banner (Current Month Birthdays) */}
            <div className="no-print">
              <MemberCelebrationsBanner
                birthdayMembers={activeBirthdayMembers}
                language={language}
                onToast={onToast}
                onSelectMember={(m) => handleSelectMember({
                  ...m,
                  roleBn: m.roleBn,
                  roleEn: m.roleEn,
                  image: m.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
                  memberId: m.membershipId,
                  joinDate: m.joinedDate,
                  joiningYear: m.joiningYear || 2024,
                  serviceYears: m.serviceYears ? Number(m.serviceYears) : (new Date().getFullYear() - Number(m.joiningYear || 2024)),
                  previousPositions: m.previousPositions || [],
                  category: 'সাধারণ পরিষদ',
                })}
              />
            </div>

            {/* Official Hard-Copy Print Document Header for Member Directory */}
            <div className="print-only print-document-header">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-black text-[#102B3F]">
                    {language === 'bn'
                      ? 'কোলাশ ফাউন্ডেশন — নিবন্ধিত সাধারণ সদস্য ও স্বেচ্ছাসেবক ডিরেক্টরি'
                      : 'CoLASH Foundation — Official Registered Member Directory'}
                  </h3>
                  <p className="text-[8.5pt] text-stone-600 mt-0.5">
                    {language === 'bn'
                      ? `মোট প্রদর্শিত সদস্য: ${filteredGeneralMembers.length} জন${selectedDistricts.length > 0 ? ` · জেলা: ${selectedDistricts.join(', ')}` : ''}${selectedBloodGroup !== 'all' ? ` · রক্তের গ্রুপ: ${selectedBloodGroup}` : ''}`
                      : `Total Members Shown: ${filteredGeneralMembers.length}${selectedDistricts.length > 0 ? ` · Districts: ${selectedDistricts.join(', ')}` : ''}${selectedBloodGroup !== 'all' ? ` · Blood: ${selectedBloodGroup}` : ''}`}
                  </p>
                </div>
                <div className="text-right text-[8.5pt] font-mono text-stone-600">
                  <div>Reg No: DH-9842/2021</div>
                  <div>{new Date().toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="no-print p-4 sm:p-5 bg-white dark:bg-[#0c1a24] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder={language === 'bn' ? 'সদস্যের নাম, আইডি বা জেলা দিয়ে খুঁজুন...' : 'Search members by name, ID or district...'}
                    className="w-full pl-9 pr-8 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-hidden focus:border-[#167D78]"
                  />
                  {memberSearch && (
                    <button
                      onClick={() => setMemberSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Blood Group Filter */}
                  <div className="flex items-center gap-1.5 bg-stone-50 dark:bg-stone-900 px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs">
                    <Droplets className="w-3.5 h-3.5 text-rose-500" />
                    <select
                      value={selectedBloodGroup}
                      onChange={(e) => setSelectedBloodGroup(e.target.value)}
                      className="bg-transparent text-stone-700 dark:text-stone-200 focus:outline-hidden cursor-pointer"
                    >
                      <option value="all">{language === 'bn' ? 'সকল রক্তের গ্রুপ' : 'All Blood Groups'}</option>
                      {uniqueBloodGroups.map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  {/* Multi-Select District Filter Dropdown */}
                  <div ref={districtDropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDistrictDropdownOpen(prev => !prev)}
                      aria-expanded={isDistrictDropdownOpen}
                      aria-haspopup="listbox"
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        selectedDistricts.length > 0
                          ? 'bg-[#167D78]/10 dark:bg-[#167D78]/25 border-[#167D78] text-[#102B3F] dark:text-[#D6F36A]'
                          : 'bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:border-[#167D78]'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#167D78] dark:text-[#D6F36A] shrink-0" />
                      <span>
                        {selectedDistricts.length === 0
                          ? (language === 'bn' ? 'সকল জেলা (একাধিক নির্বাচন)' : 'All Districts (Multi)')
                          : selectedDistricts.length === 1
                            ? selectedDistricts[0]
                            : (language === 'bn'
                                ? `${selectedDistricts.length.toLocaleString('bn-BD')}টি জেলা নির্বাচিত`
                                : `${selectedDistricts.length} Districts Selected`)}
                      </span>
                      {selectedDistricts.length > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-[#167D78] text-white text-[10px] font-bold">
                          {selectedDistricts.length}
                        </span>
                      )}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDistrictDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDistrictDropdownOpen && (
                      <div
                        role="listbox"
                        aria-multiselectable="true"
                        className="absolute right-0 sm:left-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#0c1a24] border border-stone-200 dark:border-stone-700 shadow-2xl z-40 overflow-hidden animate-in fade-in duration-150"
                      >
                        <div className="px-3 py-2.5 bg-stone-50 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between text-[11px]">
                          <span className="font-bold text-stone-600 dark:text-stone-300">
                            {language === 'bn' ? 'জেলা নির্বাচন করুন' : 'Filter by Districts'}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedDistricts(uniqueDistricts)}
                              className="font-bold text-[#167D78] dark:text-[#D6F36A] hover:underline cursor-pointer"
                            >
                              {language === 'bn' ? 'সবগুলো' : 'All'}
                            </button>
                            <span className="text-stone-300 dark:text-stone-700">|</span>
                            <button
                              type="button"
                              onClick={() => setSelectedDistricts([])}
                              className="font-bold text-rose-500 hover:underline cursor-pointer"
                            >
                              {language === 'bn' ? 'মুছুন' : 'Clear'}
                            </button>
                          </div>
                        </div>

                        <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
                          {uniqueDistricts.map((district) => {
                            const isChecked = selectedDistricts.includes(district);
                            const countInDistrict = generalMembers.filter(
                              m => (m.approvalStatus === 'approved' || (!m.approvalStatus && m.status === 'active')) && m.district === district
                            ).length;

                            return (
                              <button
                                key={district}
                                type="button"
                                role="option"
                                aria-selected={isChecked}
                                onClick={() => toggleDistrictSelection(district)}
                                className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                                  isChecked
                                    ? 'bg-[#167D78]/10 dark:bg-[#167D78]/25 text-[#102B3F] dark:text-white font-bold'
                                    : 'hover:bg-stone-100 dark:hover:bg-stone-800/70 text-stone-700 dark:text-stone-300'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span
                                    className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                                      isChecked
                                        ? 'bg-[#167D78] border-[#167D78] text-white'
                                        : 'border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900'
                                    }`}
                                  >
                                    {isChecked && <Check className="w-3 h-3" />}
                                  </span>
                                  <span className="truncate">{district}</span>
                                </div>
                                <span className="text-[10px] font-mono text-stone-400 bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded">
                                  {countInDistrict}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* View Toggle */}
                  <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
                    <button
                      onClick={() => setDisplayView('grid')}
                      title="Grid View"
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        displayView === 'grid'
                          ? 'bg-white dark:bg-stone-700 text-[#167D78] dark:text-[#D6F36A] shadow-xs'
                          : 'text-stone-500'
                      }`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDisplayView('table')}
                      title="Table View"
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        displayView === 'table'
                          ? 'bg-white dark:bg-stone-700 text-[#167D78] dark:text-[#D6F36A] shadow-xs'
                          : 'text-stone-500'
                      }`}
                    >
                      <TableIcon className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Emergency Blood Search Button */}
                  <button
                    onClick={() => setIsBloodModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
                    title={language === 'bn' ? 'জরুরি রক্তের প্রয়োজনে রক্তদাতা খুঁজুন' : 'Find Emergency Blood Donors'}
                  >
                    <Droplets className="w-3.5 h-3.5 fill-white text-white" />
                    <span>{language === 'bn' ? 'জরুরি রক্ত সন্ধান' : 'Find Blood Donors'}</span>
                  </button>

                  {/* Export CSV Button */}
                  <button
                    onClick={() => {
                      exportMembersToCSV(generalMembers);
                      if (onToast) onToast('success', language === 'bn' ? 'সদস্য তালিকা এক্সেল ফাইলে এক্সপোর্ট হয়েছে' : 'Members CSV Exported');
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-semibold cursor-pointer transition-colors"
                    title="Export Members to CSV"
                  >
                    <Download className="w-3.5 h-3.5 text-[#167D78]" />
                    <span>{language === 'bn' ? 'এক্সপোর্ট CSV' : 'Export CSV'}</span>
                  </button>

                  {/* Camera QR Scanner Button */}
                  <button
                    type="button"
                    onClick={() => setIsQrScannerOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#102B3F] hover:bg-[#167D78] text-[#D6F36A] hover:text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
                    title={language === 'bn' ? 'ক্যামেরা দিয়ে সদস্যের QR কোড স্ক্যান করে পরিচয় যাচাই করুন' : 'Scan member QR code using camera to verify ID'}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'ক্যামেরা QR স্ক্যান' : 'Scan ID (Camera)'}</span>
                  </button>

                  {/* Print Preview Button */}
                  <button
                    type="button"
                    onClick={() => setIsPrintPreviewOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#167D78]/10 hover:bg-[#167D78] text-[#167D78] dark:text-[#D6F36A] hover:text-white border border-[#167D78]/30 text-xs font-bold cursor-pointer transition-colors"
                    title={language === 'bn' ? 'কাগজে প্রিন্ট করার আগে লেআউট প্রিভিউ দেখুন' : 'Preview paper grid layout before printing'}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'প্রিন্ট প্রিভিউ' : 'Print Preview'}</span>
                  </button>

                  {/* Print Button */}
                  <button
                    onClick={handlePrintMembersList}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'প্রিন্ট' : 'Print'}</span>
                  </button>
                </div>

              </div>
            </div>

            {/* Results count, active district chips & reset */}
            <div className="no-print flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 px-1">
              <div className="flex flex-wrap items-center gap-2">
                <span>
                  {language === 'bn'
                    ? `মোট ${filteredGeneralMembers.length} জন সদস্য প্রদর্শিত হচ্ছে`
                    : `Showing ${filteredGeneralMembers.length} verified general members`}
                </span>
                {selectedDistricts.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDistrictSelection(d)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#167D78]/10 dark:bg-[#167D78]/25 text-[#167D78] dark:text-[#D6F36A] border border-[#167D78]/30 text-[11px] font-bold hover:bg-rose-500/10 hover:text-rose-600 hover:border-rose-400/40 transition-colors cursor-pointer"
                    title={language === 'bn' ? 'মুছে ফেলতে ক্লিক করুন' : 'Remove district filter'}
                  >
                    <MapPin className="w-3 h-3" />
                    <span>{d}</span>
                    <X className="w-3 h-3" />
                  </button>
                ))}
              </div>
              {(memberSearch || selectedBloodGroup !== 'all' || selectedDistricts.length > 0) && (
                <button
                  onClick={() => {
                    setMemberSearch('');
                    setSelectedBloodGroup('all');
                    setSelectedDistricts([]);
                  }}
                  className="text-[#167D78] dark:text-[#D6F36A] font-semibold hover:underline cursor-pointer"
                >
                  {language === 'bn' ? 'ফিল্টার রিসেট করুন' : 'Reset filters'}
                </button>
              )}
            </div>

            {/* Display: Grid View */}
            {displayView === 'grid' && (
              <div className="print-member-directory-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredGeneralMembers.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => handleSelectMember({
                      ...member,
                      roleBn: member.roleBn,
                      roleEn: member.roleEn,
                      image: member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
                      memberId: member.membershipId,
                      joinDate: member.joinedDate,
                      joiningYear: member.joiningYear || 2024,
                      serviceYears: member.serviceYears ? Number(member.serviceYears) : (new Date().getFullYear() - Number(member.joiningYear || 2024)),
                      previousPositions: member.previousPositions || [],
                      category: 'সাধারণ পরিষদ',
                    })}
                    className="print-member-card bg-white dark:bg-[#0c1a24] rounded-2xl border border-stone-200 dark:border-stone-800 p-5 hover:border-[#167D78] dark:hover:border-[#D6F36A] transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Header Row with SL and Blood Group */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="print-member-sl w-6 h-6 rounded-full bg-[#102B3F] text-white flex items-center justify-center text-xs font-bold font-mono">
                          {language === 'bn' ? member.slNo.toLocaleString('bn-BD') : member.slNo}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <span className="print-blood-pill px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center gap-1 border border-rose-200 dark:border-rose-800">
                            <Droplets className="w-3 h-3" />
                            <span>{member.bloodGroup}</span>
                          </span>
                          <span className="print-status-pill px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-semibold text-[10px] border border-emerald-200 dark:border-emerald-800">
                            {language === 'bn' ? 'সক্রিয়' : 'Active'}
                          </span>
                        </div>
                      </div>

                      {/* Member Name */}
                      <h4 className="font-bold text-base text-[#102B3F] dark:text-white group-hover:text-[#167D78] dark:group-hover:text-[#D6F36A] transition-colors leading-snug">
                        {language === 'bn' ? member.nameBn : member.nameEn}
                      </h4>
                      
                      {/* Member ID & Joining Year (Requirement 6) */}
                      <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono text-stone-400 mt-0.5">
                        <span className="font-bold text-[#167D78] dark:text-[#D6F36A]">{member.membershipId}</span>
                        <span>•</span>
                        <span>{language === 'bn' ? 'যোগদান:' : 'Joined:'} {member.joiningYear || 2024}</span>
                      </div>

                      {/* Previous Positions Badges (Requirement 6) */}
                      {member.previousPositions && member.previousPositions.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {member.previousPositions.map((pos) => (
                            <span key={pos.id} className="text-[10px] bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 px-1.5 py-0.5 rounded border border-stone-200 dark:border-stone-700 font-sans">
                              {pos.positionBn} ({pos.fromYear}–{pos.toYear})
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Role & Scope */}
                      <div className="print-role-box mt-3 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-100 dark:border-stone-800/80">
                        <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">
                          {language === 'bn' ? 'মাঠপর্যায়ের দায়িত্ব' : 'Field Operations Role'}
                        </span>
                        <p className="text-xs font-medium text-stone-700 dark:text-stone-300">
                          {language === 'bn' ? member.roleBn : member.roleEn}
                        </p>
                      </div>
                    </div>

                    {/* Footer Info: District, Join Date & QR Generator Button */}
                    <div className="pt-3 mt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2 text-[11px] text-stone-500">
                      <div className="flex items-center gap-1 text-stone-600 dark:text-stone-400 truncate">
                        <MapPin className="w-3.5 h-3.5 text-[#167D78] shrink-0" />
                        <span className="truncate">{member.district}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-stone-400 font-mono">
                          {member.joinedDate}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setQrTargetMember(member);
                          }}
                          className="no-print inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#167D78]/10 hover:bg-[#167D78] text-[#167D78] dark:text-[#D6F36A] hover:text-white text-[10px] font-bold transition-colors cursor-pointer"
                          title={language === 'bn' ? `${member.membershipId}-এর ইউনিক QR কোড তৈরি করুন` : `Generate unique QR for ${member.membershipId}`}
                        >
                          <QrCode className="w-3 h-3" />
                          <span>QR</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openVerificationForMember(member);
                          }}
                          className="no-print inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-600 text-emerald-700 dark:text-emerald-300 hover:text-white border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold transition-colors cursor-pointer"
                          title={language === 'bn' ? `${member.membershipId} ডিজিটাল পরিচয় যাচাই করুন` : `Verify ${member.membershipId} digital ID`}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>{language === 'bn' ? 'যাচাই' : 'Verify'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Display: Table View */}
            {displayView === 'table' && (
              <div className="print-table-wrapper bg-white dark:bg-[#0c1a24] rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
                <div className="print-table-wrapper overflow-x-auto">
                  <table className="print-member-directory-table w-full text-left text-xs sm:text-sm">
                    <thead className="bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-300 font-semibold border-b border-stone-200 dark:border-stone-800">
                      <tr>
                        <th className="py-3 px-4">#</th>
                        <th className="py-3 px-4">{language === 'bn' ? 'সদস্যের নাম' : 'Member Name'}</th>
                        <th className="py-3 px-4">{language === 'bn' ? 'আইডি' : 'Member ID'}</th>
                        <th className="py-3 px-4">{language === 'bn' ? 'রক্তের গ্রুপ' : 'Blood Group'}</th>
                        <th className="py-3 px-4">{language === 'bn' ? 'জেলা' : 'District'}</th>
                        <th className="py-3 px-4">{language === 'bn' ? 'দায়িত্ব' : 'Assignment'}</th>
                        <th className="py-3 px-4">{language === 'bn' ? 'যোগদান' : 'Joined'}</th>
                        <th className="no-print py-3 px-4 text-right">{language === 'bn' ? 'পদক্ষেপ' : 'Action'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                      {filteredGeneralMembers.map((member) => (
                        <tr
                          key={member.id}
                          onClick={() => handleSelectMember({
                            ...member,
                            roleBn: member.roleBn,
                            roleEn: member.roleEn,
                            image: member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
                            memberId: member.membershipId,
                            joinDate: member.joinedDate,
                            category: 'সাধারণ পরিষদ',
                          })}
                          className="hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors cursor-pointer"
                        >
                          <td className="py-3 px-4 font-mono font-bold text-stone-500">
                            {language === 'bn' ? member.slNo.toLocaleString('bn-BD') : member.slNo}
                          </td>
                          <td className="py-3 px-4 font-bold text-[#102B3F] dark:text-white">
                            <div>{language === 'bn' ? member.nameBn : member.nameEn}</div>
                            <div className="text-[11px] font-normal text-stone-400 sm:hidden">{member.membershipId}</div>
                          </td>
                          <td className="py-3 px-4 font-mono text-xs text-stone-500">
                            {member.membershipId}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs inline-flex items-center gap-1 border border-rose-200 dark:border-rose-800">
                              <Droplets className="w-3 h-3" />
                              <span>{member.bloodGroup}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-stone-600 dark:text-stone-300">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-[#167D78]" />
                              <span>{member.district}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-stone-600 dark:text-stone-300">
                            {language === 'bn' ? member.roleBn : member.roleEn}
                          </td>
                          <td className="py-3 px-4 font-mono text-xs text-stone-400">
                            {member.joinedDate}
                          </td>
                          <td className="no-print py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setQrTargetMember(member);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[#102B3F] dark:text-[#D6F36A] bg-stone-100 dark:bg-stone-800 hover:bg-[#167D78] hover:text-white rounded-lg transition-colors cursor-pointer"
                                title={language === 'bn' ? 'QR কোড তৈরি করুন' : 'Generate QR Code'}
                              >
                                <QrCode className="w-3.5 h-3.5" />
                                <span>{language === 'bn' ? 'QR কোড' : 'QR'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openVerificationForMember(member);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-600 hover:text-white border border-emerald-200 dark:border-emerald-800 rounded-lg transition-colors cursor-pointer"
                                title={language === 'bn' ? 'ডিজিটাল পরিচয় যাচাই মোডাল খুলুন' : 'Open Digital Identity Verification'}
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>{language === 'bn' ? 'যাচাই' : 'Verify'}</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectMember({
                                    ...member,
                                    roleBn: member.roleBn,
                                    roleEn: member.roleEn,
                                    image: member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
                                    memberId: member.membershipId,
                                    joinDate: member.joinedDate,
                                    category: 'সাধারণ পরিষদ',
                                  });
                                }}
                                className="px-2.5 py-1 text-xs font-semibold text-[#167D78] dark:text-[#D6F36A] hover:bg-[#167D78]/10 rounded-lg transition-colors cursor-pointer"
                              >
                                {language === 'bn' ? 'বিস্তারিত' : 'View'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {filteredGeneralMembers.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-[#0c1a24] rounded-2xl border border-stone-200 dark:border-stone-800">
                <Search className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <h4 className="font-bold text-stone-700 dark:text-stone-200 text-sm">
                  {language === 'bn' ? 'কোনো সদস্য পাওয়া যায়নি' : 'No members matched your search'}
                </h4>
                <p className="text-xs text-stone-400 mt-1">
                  {language === 'bn' ? 'দয়া করে অন্য কোনো নাম বা ফিল্টার নির্বাচন করুন।' : 'Try adjusting your search criteria or resetting filters.'}
                </p>
              </div>
            )}

          </div>
        )}

      </div>

      {/* Dedicated Single Member Profile Page View / Fallback */}
      {activeMember && (
        <MemberProfilePage
          member={activeMember}
          onClose={() => setActiveMember(null)}
          language={language}
          currentAdmin={currentAdmin}
          loggedInMember={loggedInMember}
          currentWomensUser={currentWomensUser}
          onOpenPortal={onOpenPortal}
          onOpenAdmin={onOpenAdmin}
          onEditOwnProfile={onEditOwnProfile}
          onOpenScanner={() => setIsQrScannerOpen(true)}
        />
      )}

      {activeGeneralMember && (
        <MemberProfilePage
          member={{
            ...activeGeneralMember,
            roleBn: activeGeneralMember.roleBn,
            roleEn: activeGeneralMember.roleEn,
            image: activeGeneralMember.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
            memberId: activeGeneralMember.membershipId,
            joinDate: activeGeneralMember.joinedDate,
            category: 'সাধারণ পরিষদ',
          }}
          onClose={() => setActiveGeneralMember(null)}
          language={language}
          currentAdmin={currentAdmin}
          loggedInMember={loggedInMember}
          currentWomensUser={currentWomensUser}
          onOpenPortal={onOpenPortal}
          onOpenAdmin={onOpenAdmin}
          onEditOwnProfile={onEditOwnProfile}
          onOpenScanner={() => setIsQrScannerOpen(true)}
        />
      )}

      {activeAdvisor && (
        <MemberProfilePage
          member={{
            ...activeAdvisor,
            roleBn: activeAdvisor.roleBn,
            roleEn: activeAdvisor.roleEn,
            image: activeAdvisor.image,
            memberId: `COLASH-ADV-${activeAdvisor.id}`,
            joinDate: activeAdvisor.joinedDate,
            category: activeAdvisor.status === 'current' ? 'বর্তমান উপদেষ্টা' : 'সাবেক উপদেষ্টা',
          }}
          onClose={() => setActiveAdvisor(null)}
          language={language}
          currentAdmin={currentAdmin}
          loggedInMember={loggedInMember}
          currentWomensUser={currentWomensUser}
          onOpenPortal={onOpenPortal}
          onOpenAdmin={onOpenAdmin}
          onEditOwnProfile={onEditOwnProfile}
          onOpenScanner={() => setIsQrScannerOpen(true)}
        />
      )}

      {/* Emergency Blood Donor Search Modal */}
      <UrgentBloodModal
        isOpen={isBloodModalOpen}
        onClose={() => setIsBloodModalOpen(false)}
        members={generalMembers}
        language={language}
      />

      {/* Shareable Member QR Code Generator Modal */}
      <QRGenerator
        isOpen={Boolean(qrTargetMember)}
        onClose={() => setQrTargetMember(null)}
        memberId={qrTargetMember?.membershipId || ''}
        memberName={qrTargetMember ? (language === 'bn' ? qrTargetMember.nameBn : qrTargetMember.nameEn) : undefined}
        memberRole={qrTargetMember ? (language === 'bn' ? qrTargetMember.roleBn : qrTargetMember.roleEn) : undefined}
        bloodGroup={qrTargetMember?.bloodGroup}
        district={qrTargetMember?.district}
        language={language}
        onVerifyNow={openVerificationById}
        onOpenScanner={() => setIsQrScannerOpen(true)}
        onToast={onToast}
      />

      {/* Local Member Verification Modal Fallback (when used standalone) */}
      <MemberVerificationModal
        member={localVerifyMember}
        isOpen={Boolean(localVerifyMember)}
        onClose={() => {
          setLocalVerifyMember(null);
          setLocalVerifyFromScan(false);
        }}
        language={language}
        currentAdmin={currentAdmin}
        loggedInMember={loggedInMember}
        currentWomensUser={currentWomensUser}
        onOpenPortal={onOpenPortal}
        onOpenAdmin={onOpenAdmin}
        onOpenScanner={() => setIsQrScannerOpen(true)}
        isQrScanSuccess={localVerifyFromScan}
      />

      {/* Member Directory Paper Print Preview Overlay */}
      <DirectoryPrintPreviewModal
        isOpen={isPrintPreviewOpen}
        onClose={() => setIsPrintPreviewOpen(false)}
        onTriggerPrint={handlePrintMembersList}
        language={language}
        initialView={displayView}
        onViewChange={setDisplayView}
        members={filteredGeneralMembers.map((m): PrintPreviewMemberItem => ({
          id: m.id,
          slNo: m.slNo,
          membershipId: m.membershipId,
          nameBn: m.nameBn,
          nameEn: m.nameEn,
          roleBn: m.roleBn,
          roleEn: m.roleEn,
          bloodGroup: m.bloodGroup,
          district: m.district,
          joinedDate: m.joinedDate,
          joiningYear: m.joiningYear,
          statusLabelBn: 'সক্রিয়',
          statusLabelEn: 'Active',
        }))}
        titleBn="কোলাশ ফাউন্ডেশন — নিবন্ধিত সাধারণ সদস্য ও স্বেচ্ছাসেবক ডিরেক্টরি"
        titleEn="CoLASH Foundation — Official Registered Member Directory"
        filterSummaryBn={`মোট প্রদর্শিত সদস্য: ${filteredGeneralMembers.length} জন${selectedDistricts.length > 0 ? ` · জেলা: ${selectedDistricts.join(', ')}` : ''}${selectedBloodGroup !== 'all' ? ` · রক্তের গ্রুপ: ${selectedBloodGroup}` : ''}`}
        filterSummaryEn={`Total Members Shown: ${filteredGeneralMembers.length}${selectedDistricts.length > 0 ? ` · Districts: ${selectedDistricts.join(', ')}` : ''}${selectedBloodGroup !== 'all' ? ` · Blood: ${selectedBloodGroup}` : ''}`}
      />

      {/* Admin Camera QR Code Verification Scanner Modal */}
      <QRScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        language={language}
        generalMembers={generalMembers}
        committee={team}
        onToast={onToast}
        onOpenVerificationModal={(member) => openVerificationForMember(member, true)}
        onVerifiedMemberOpen={(member) => handleSelectMember({
          ...member,
          roleBn: member.roleBn,
          roleEn: member.roleEn,
          image: member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
          memberId: member.membershipId,
          joinDate: member.joinedDate,
          joiningYear: member.joiningYear || 2024,
          serviceYears: member.serviceYears ? Number(member.serviceYears) : (new Date().getFullYear() - Number(member.joiningYear || 2024)),
          previousPositions: member.previousPositions || [],
          category: 'সাধারণ পরিষদ',
        })}
      />

    </section>
  );
};
