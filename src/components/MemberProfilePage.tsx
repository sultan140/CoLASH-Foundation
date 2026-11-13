import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  X,
  ArrowLeft,
  ShieldCheck,
  Award,
  Calendar,
  MapPin,
  Droplet,
  Mail,
  Phone,
  CheckCircle2,
  Copy,
  Share2,
  Printer,
  Sparkles,
  QrCode,
  UserCheck,
  HeartHandshake,
  Download,
  Lock,
  LogIn,
  Edit3
} from 'lucide-react';
import { AdminUser, GeneralMember, Language, MemberPositionHistory, WomensTeamMember } from '../types';
import { MemberVerificationModal } from './common/MemberVerificationModal';
import { printMemberIdCard, downloadMemberIdCardPNG } from '../utils/idCardPrintUtils';
import { canAccessMemberIdCard, isMemberCardOwner } from '../utils/idCardAccess';

export interface UnifiedMemberData {
  id?: string | number;
  memberId?: string;
  nameBn: string;
  nameEn: string;
  roleBn?: string;
  roleEn?: string;
  designationBn?: string;
  designationEn?: string;
  organizationBn?: string;
  organizationEn?: string;
  category?: string;
  image?: string;
  photoUrl?: string;
  bioBn?: string;
  bioEn?: string;
  bio?: string;
  email?: string;
  phone?: string;
  bloodGroup?: string;
  district?: string;
  upazila?: string;
  joinDate?: string;
  isFounder?: boolean;
  joiningYear?: number | string;
  serviceYears?: number | string;
  previousPositions?: MemberPositionHistory[] | Array<{ id?: string; positionBn?: string; positionEn?: string; fromYear?: number | string; toYear?: number | string; [key: string]: any }>;
  facebook?: string;
  linkedin?: string;
  dateOfBirth?: string;
  birthMonth?: number;
  birthDay?: number;
}

interface MemberProfilePageProps {
  member: UnifiedMemberData;
  onClose: () => void;
  language: Language;
  currentAdmin?: AdminUser | null;
  loggedInMember?: GeneralMember | null;
  currentWomensUser?: WomensTeamMember | null;
  onOpenPortal?: () => void;
  onOpenAdmin?: () => void;
  onEditOwnProfile?: () => void;
  onOpenScanner?: () => void;
}

export const MemberProfilePage: React.FC<MemberProfilePageProps> = ({
  member,
  onClose,
  language,
  currentAdmin,
  loggedInMember,
  currentWomensUser,
  onOpenPortal,
  onOpenAdmin,
  onEditOwnProfile,
  onOpenScanner,
}) => {
  // Scroll to top when page opens
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Normalize member fields
  const name = language === 'bn' ? (member.nameBn || member.nameEn) : (member.nameEn || member.nameBn);
  const secondaryName = language === 'bn' ? member.nameEn : member.nameBn;
  const role = language === 'bn'
    ? (member.roleBn || member.designationBn || 'সদস্য')
    : (member.roleEn || member.designationEn || 'Member');
  const photo = member.image || member.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400';
  const memberId = member.memberId || (member.id ? `COLASH-M-${member.id}` : 'COLASH-MEMBER');
  const bloodGroup = member.bloodGroup || 'B+';
  const district = member.district || 'মৌলভীবাজার';
  const joinDate = member.joinDate || '২০২৪';
  const email = member.email || 'info@colashfoundation.org';
  const phone = member.phone || '+880 1700-000000';
  const bio = language === 'bn'
    ? (member.bioBn || member.bio || `${member.nameBn} কোলাশ ফাউন্ডেশনের একজন নিবেদিতপ্রাণ মানবিক দায়িত্বশীল সদস্য। তিনি অসহায় ও সুবিধাবঞ্চিত মানুষের জীবনমান উন্নয়নে সার্বক্ষণিক অবদান রেখে চলেছেন।`)
    : (member.bioEn || member.bio || `${member.nameEn} is a dedicated humanitarian official of CoLASH Foundation, serving underprivileged communities with dignity and integrity.`);

  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    const verifyUrl = `${window.location.origin}${window.location.pathname}#verify-member-${memberId}`;
    QRCode.toDataURL(verifyUrl, {
      width: 140,
      margin: 1,
      color: { dark: '#102B3F', light: '#FFFFFF' }
    })
      .then(setQrCodeUrl)
      .catch(console.error);
  }, [memberId]);

  const handleCopyId = () => {
    navigator.clipboard?.writeText(memberId);
  };

  const buildPrintablePayload = () => ({
    nameBn: member.nameBn || member.nameEn,
    nameEn: member.nameEn || member.nameBn,
    roleBn: member.roleBn || member.designationBn || 'সদস্য',
    roleEn: member.roleEn || member.designationEn || 'Member',
    membershipId: memberId,
    bloodGroup,
    district,
    joiningYear: member.joiningYear,
    joinedDate: joinDate,
    avatar: photo
  });

  const canPrintOrDownloadCard = canAccessMemberIdCard({
    targetMembershipId: memberId,
    targetMemberId: member.id,
    currentAdmin,
    loggedInMember,
    currentWomensUser,
  });

  const isOwner = isMemberCardOwner({
    targetMembershipId: memberId,
    targetMemberId: member.id,
    loggedInMember,
    currentWomensUser,
  });

  const handlePrint = async () => {
    if (!canPrintOrDownloadCard) return;
    const ok = await printMemberIdCard(buildPrintablePayload());
    if (!ok) {
      await downloadMemberIdCardPNG(buildPrintablePayload());
    }
  };

  const handleDownloadIdCard = async () => {
    if (!canPrintOrDownloadCard) return;
    await downloadMemberIdCardPNG(buildPrintablePayload());
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-100 dark:bg-[#07131e] text-stone-900 dark:text-stone-100 flex flex-col transition-colors animate-in fade-in duration-200">
      
      {/* Top Header Bar with Prominent Cross (X) and Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0c1a24]/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 shadow-sm px-4 sm:px-8 py-3.5 flex items-center justify-between">
        
        {/* Left: Back / Close button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Back"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-100 font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-[#167D78] dark:text-[#D6F36A]" />
          <span>{language === 'bn' ? 'পেছনে ফিরে যান' : 'Back to Members'}</span>
        </button>

        {/* Center: Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#167D78]/10 dark:bg-[#167D78]/25 text-[#167D78] dark:text-[#D6F36A] text-xs font-bold font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>ID: {memberId}</span>
          <span className="text-stone-300 dark:text-stone-600">·</span>
          <span>{language === 'bn' ? 'ভেরিফাইড প্রোফাইল' : 'Verified Member Profile'}</span>
        </div>

        {/* Right: Protected ID Card Actions + Close Button */}
        <div className="flex items-center gap-2">
          {canPrintOrDownloadCard ? (
            <>
              {isOwner && onEditOwnProfile && (
                <button
                  onClick={onEditOwnProfile}
                  type="button"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#167D78]/10 hover:bg-[#167D78] text-[#167D78] dark:text-[#D6F36A] hover:text-white text-xs font-semibold cursor-pointer transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'নিজের তথ্য এডিট' : 'Edit My Info'}</span>
                </button>
              )}
              <button
                onClick={handleDownloadIdCard}
                type="button"
                title={language === 'bn' ? 'আইডি কার্ড PNG ডাউনলোড' : 'Download ID Card PNG'}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#102B3F] hover:bg-[#167D78] text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#D6F36A]" />
                <span>{language === 'bn' ? 'ID সেভ' : 'Save ID'}</span>
              </button>

              <button
                onClick={handlePrint}
                type="button"
                title={language === 'bn' ? 'আইডি কার্ড প্রিন্ট করুন' : 'Print ID Card'}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-[#167D78]" />
                <span>{language === 'bn' ? 'প্রিন্ট' : 'Print'}</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (onOpenPortal) {
                  onClose();
                  onOpenPortal();
                }
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold cursor-pointer hover:bg-amber-100 transition-colors"
              title={language === 'bn' ? 'আইডি কার্ড শুধুমাত্র নিজস্ব লগইন বা এডমিন/কো-এডমিনের জন্য সংরক্ষিত' : 'ID card print/download requires member or admin login'}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'ID কার্ড লকড · লগইন' : 'ID Card Locked · Login'}</span>
            </button>
          )}

          <button
            onClick={onClose}
            type="button"
            aria-label="Close"
            className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer active:scale-95 hover:shadow-lg"
          >
            <X className="w-5 h-5" />
            <span>{language === 'bn' ? 'বন্ধ করুন' : 'Close'}</span>
          </button>
        </div>
      </header>

      {/* Main Single-Member Content View */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        
        {/* Profile Hero Card */}
        <div className="bg-white dark:bg-[#0c1a24] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xl overflow-hidden mb-8">
          
          {/* Header Banner */}
          <div className="h-32 sm:h-44 bg-gradient-to-r from-[#102B3F] via-[#167D78] to-[#0c1a24] relative p-6 flex justify-between items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[#D6F36A] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'কোলাশ ফাউন্ডেশন অফিসিয়াল ডাটাবেস' : 'CoLASH Foundation Official Database'}</span>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="sm:hidden p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Member Identity Block */}
          <div className="px-6 sm:px-10 pb-8 pt-0 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 sm:-mt-20 mb-6 text-center sm:text-left">
              
              {/* Photo */}
              <div className="relative group shrink-0">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl sm:rounded-3xl overflow-hidden border-4 border-white dark:border-[#0c1a24] shadow-2xl bg-stone-200 dark:bg-stone-800">
                  <img
                    src={photo}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400';
                    }}
                  />
                </div>
                {member.isFounder && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#D6F36A] text-[#102B3F] text-[10px] font-extrabold uppercase shadow-md whitespace-nowrap">
                    {language === 'bn' ? 'প্রতিষ্ঠাতা' : 'Founder'}
                  </span>
                )}
              </div>

              {/* Names & Designations */}
              <div className="flex-1 space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'অনুমোদিত দায়িত্বশীল সদস্য' : 'Verified Council Official'}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#102B3F] dark:text-white tracking-tight">
                  {name}
                </h1>
                
                {secondaryName && secondaryName !== name && (
                  <p className="text-sm font-semibold text-stone-500 dark:text-stone-400">
                    {secondaryName}
                  </p>
                )}

                <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="px-3 py-1 rounded-xl bg-[#167D78] text-white font-bold text-xs sm:text-sm shadow-xs">
                    {role}
                  </span>
                  {member.organizationBn && (
                    <span className="px-2.5 py-1 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-semibold">
                      {language === 'bn' ? member.organizationBn : member.organizationEn}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Core Member Key Badges Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 mb-6">
              
              {/* ID */}
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                  {language === 'bn' ? 'সদস্য আইডি' : 'Member ID'}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono font-extrabold text-xs sm:text-sm text-[#102B3F] dark:text-[#D6F36A]">
                    {memberId}
                  </span>
                  <button
                    onClick={handleCopyId}
                    title="Copy ID"
                    className="p-1 rounded text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Blood Group */}
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                  {language === 'bn' ? 'রক্তের গ্রুপ' : 'Blood Group'}
                </span>
                <span className="font-bold text-xs sm:text-sm text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-0.5">
                  <Droplet className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  <span>{bloodGroup}</span>
                </span>
              </div>

              {/* District */}
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                  {language === 'bn' ? 'জেলা / ঠিকানা' : 'District / Area'}
                </span>
                <span className="font-bold text-xs sm:text-sm text-stone-800 dark:text-stone-200 flex items-center gap-1 mt-0.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-[#167D78]" />
                  <span className="truncate">{district}</span>
                </span>
              </div>

              {/* Join Date / Tenure */}
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                  {language === 'bn' ? 'কার্যকাল / যোগদান' : 'Tenure / Joined'}
                </span>
                <span className="font-bold text-xs sm:text-sm text-stone-800 dark:text-stone-200 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  <span>{member.joiningYear ? `${member.joiningYear} (${Math.max(1, new Date().getFullYear() - Number(member.joiningYear))} বছর)` : joinDate}</span>
                </span>
              </div>

            </div>

            {/* Historical Positions Section if available (Requirement 6) */}
            {member.previousPositions && member.previousPositions.length > 0 && (
              <div className="mb-6 p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800">
                <span className="text-xs font-bold text-[#167D78] dark:text-[#D6F36A] uppercase tracking-wider block mb-2">
                  {language === 'bn' ? 'সাংগঠনিক ইতিহাস ও পূর্বে দায়িত্ব পালনকৃত পদসমূহ:' : 'Historical Organizational Positions:'}
                </span>
                <div className="flex flex-wrap gap-2">
                  {member.previousPositions.map((pos, idx) => (
                    <div key={pos.id || idx} className="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs">
                      <span className="font-bold text-stone-900 dark:text-white">
                        {language === 'bn' ? pos.positionBn : (pos.positionEn || pos.positionBn)}
                      </span>
                      <span className="text-stone-400 ml-1.5 font-mono text-[11px]">
                        ({pos.fromYear}–{pos.toYear})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Bio Section */}
            <div className="space-y-6 pt-2">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#102B3F] dark:text-white flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-[#167D78] dark:text-[#D6F36A]" />
                  <span>{language === 'bn' ? 'পরিচিতি ও মানবিক অবদান' : 'Profile & Humanitarian Service'}</span>
                </h2>
                <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs sm:text-sm leading-relaxed text-stone-700 dark:text-stone-200">
                  <p className="whitespace-pre-line font-serif italic sm:not-italic">
                    {bio}
                  </p>
                </div>
              </div>

              {/* Official Responsibilities Block */}
              <div>
                <h3 className="text-sm font-bold text-[#102B3F] dark:text-white flex items-center gap-2 mb-3">
                  <UserCheck className="w-4 h-4 text-[#167D78] dark:text-[#D6F36A]" />
                  <span>{language === 'bn' ? 'প্রাতিষ্ঠানিক দায়িত্ব ও সেবামূলক ভূমিকা' : 'Institutional Roles & Responsibilities'}</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800/80 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#167D78] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs text-[#102B3F] dark:text-white">
                        {language === 'bn' ? 'নীতিনির্ধারণ ও সিদ্ধান্ত বাস্তবায়ন' : 'Strategic Governance'}
                      </h4>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                        {language === 'bn' ? 'কোলাশ ফাউন্ডেশনের আদর্শ রক্ষা ও কার্যক্রম পরিচালনা।' : 'Implementing organizational values and council mandates.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800/80 flex items-start gap-2.5">
                    <HeartHandshake className="w-4 h-4 text-[#E6A15B] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs text-[#102B3F] dark:text-white">
                        {language === 'bn' ? 'মানবিক সেবা ও জরুরি ত্রাণ' : 'Relief & Social Welfare'}
                      </h4>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                        {language === 'bn' ? 'বন্যা ও সংকটে সরাসরি মাঠে তদারকি ও সহায়তা।' : 'Direct field response and underprivileged assistance.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information & Digital ID Seal */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-2">
                
                {/* Contact Card */}
                <div className="sm:col-span-7 p-4 sm:p-5 rounded-2xl bg-stone-50 dark:bg-stone-900/70 border border-stone-200 dark:border-stone-800 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    {language === 'bn' ? 'যোগাযোগের মাধ্যম' : 'Contact Information'}
                  </h3>
                  
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                      <Mail className="w-4 h-4 text-[#167D78] shrink-0" />
                      <span className="font-mono text-xs">{email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                      <Phone className="w-4 h-4 text-[#167D78] shrink-0" />
                      <span className="font-mono text-xs">{phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                      <MapPin className="w-4 h-4 text-[#167D78] shrink-0" />
                      <span className="text-xs">{district}, বাংলাদেশ</span>
                    </div>
                  </div>
                </div>

                {/* Digital Verification Seal (ID Card protected if unauthorized) */}
                {canPrintOrDownloadCard ? (
                  <div className="sm:col-span-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#102B3F] to-[#167D78] text-white flex flex-col justify-between shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#D6F36A]">
                        {language === 'bn' ? 'অফিসিয়াল সদস্য কার্ড' : 'Digital ID Card Seal'}
                      </span>
                      <ShieldCheck className="w-5 h-5 text-[#D6F36A]" />
                    </div>

                    <div className="my-2 flex items-center justify-between gap-3 bg-white/10 p-2.5 rounded-xl border border-white/15">
                      <div>
                        <div className="text-xs font-mono font-extrabold tracking-widest text-[#D6F36A]">
                          {memberId}
                        </div>
                        <div className="text-[10px] text-stone-200 mt-0.5">
                          CoLASH Verified Member
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsVerifyModalOpen(true)}
                          className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#D6F36A] hover:bg-white text-[#102B3F] text-[10px] font-black tracking-wide shadow-xs transition-all cursor-pointer"
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>{language === 'bn' ? 'অনলাইনে যাচাই করুন' : 'Verify Online'}</span>
                        </button>
                      </div>

                      <div className="bg-white p-1 rounded-lg shrink-0">
                        {qrCodeUrl ? (
                          <img src={qrCodeUrl} alt="Member QR" className="w-14 h-14" />
                        ) : (
                          <div className="w-14 h-14 bg-stone-100 flex items-center justify-center">
                            <QrCode className="w-6 h-6 text-stone-500" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-[9px] text-stone-300 border-t border-white/20 pt-1.5 text-center">
                      {language === 'bn' ? 'স্বাক্ষরকৃত ও কেন্দ্রীয় ডাটাবেসে সংরক্ষিত' : 'Digitally authenticated official record'}
                    </div>
                  </div>
                ) : (
                  <div className="sm:col-span-5 p-4 sm:p-5 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                        {language === 'bn' ? 'আইডি কার্ড সুরক্ষিত' : 'ID Card Protected'}
                      </span>
                      <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed my-2.5">
                      {language === 'bn'
                        ? 'অপব্যবহার রোধে আইডি কার্ড প্রদর্শন, প্রিন্ট ও ডাউনলোড শুধুমাত্র লগইনকৃত সদস্য (নিজস্ব কার্ড) অথবা এডমিন/কো-এডমিনের জন্য উন্মুক্ত।'
                        : 'To prevent misuse, viewing, printing, or downloading ID cards is restricted to the logged-in card owner or an Admin / Co-Admin.'}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsVerifyModalOpen(true)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#167D78] hover:bg-[#102B3F] text-white text-[10px] font-bold cursor-pointer transition-colors"
                      >
                        <ShieldCheck className="w-3 h-3" />
                        <span>{language === 'bn' ? 'সত্যতা যাচাই' : 'Verify Status'}</span>
                      </button>
                      {onOpenPortal && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenPortal();
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#102B3F] hover:bg-slate-800 text-[#D6F36A] text-[10px] font-bold cursor-pointer transition-colors"
                        >
                          <LogIn className="w-3 h-3" />
                          <span>{language === 'bn' ? 'সদস্য লগইন' : 'Member Login'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>

        {/* Member Verification Modal */}
        <MemberVerificationModal
          member={{
            id: String(member.id || memberId),
            membershipId: memberId,
            slNo: 1,
            nameBn: member.nameBn,
            nameEn: member.nameEn,
            bloodGroup: bloodGroup,
            district: district,
            roleBn: role,
            roleEn: role,
            joinedDate: joinDate,
            joiningYear: member.joiningYear ? Number(member.joiningYear) : 2024,
            avatar: photo,
            dateOfBirth: member.dateOfBirth,
            status: 'active'
          }}
          isOpen={isVerifyModalOpen}
          onClose={() => setIsVerifyModalOpen(false)}
          language={language}
          currentAdmin={currentAdmin}
          loggedInMember={loggedInMember}
          currentWomensUser={currentWomensUser}
          onOpenPortal={onOpenPortal}
          onOpenAdmin={onOpenAdmin}
          onOpenScanner={onOpenScanner}
        />

        {/* Bottom Prominent Back Action Button with Cross (X) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 pb-12">
          <button
            onClick={onClose}
            type="button"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-[#102B3F] hover:bg-[#167D78] dark:bg-stone-800 dark:hover:bg-[#167D78] text-white font-bold text-sm shadow-xl transition-all cursor-pointer active:scale-95"
          >
            <X className="w-5 h-5 text-rose-400" />
            <span>{language === 'bn' ? '✕ পেজ বন্ধ করে মূল তালিকায় ফিরে যান' : '✕ Close Profile and Return to Members'}</span>
          </button>
        </div>

      </main>

    </div>
  );
};
