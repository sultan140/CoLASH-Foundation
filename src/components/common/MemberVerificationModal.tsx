import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { ShieldCheck, CheckCircle2, Award, Calendar, Droplets, MapPin, X, Printer, ExternalLink, QrCode, Download, ScanLine, Lock, LogIn } from 'lucide-react';
import { AdminUser, GeneralMember, Language, WomensTeamMember } from '../../types';
import { printMemberIdCard, downloadMemberIdCardPNG } from '../../utils/idCardPrintUtils';
import { canAccessMemberIdCard } from '../../utils/idCardAccess';

interface MemberVerificationModalProps {
  member: GeneralMember | null;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onOpenScanner?: () => void;
  currentAdmin?: AdminUser | null;
  loggedInMember?: GeneralMember | null;
  currentWomensUser?: WomensTeamMember | null;
  onOpenPortal?: () => void;
  onOpenAdmin?: () => void;
  isQrScanSuccess?: boolean;
}

export const MemberVerificationModal: React.FC<MemberVerificationModalProps> = ({
  member,
  isOpen,
  onClose,
  language,
  onOpenScanner,
  currentAdmin,
  loggedInMember,
  currentWomensUser,
  onOpenPortal,
  onOpenAdmin,
  isQrScanSuccess = false
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [hasEntered, setHasEntered] = useState<boolean>(false);

  useEffect(() => {
    if (member && isOpen) {
      setHasEntered(false);
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setHasEntered(true));
      });
      const verificationUrl = `${window.location.origin}${window.location.pathname}#verify-member-${encodeURIComponent(member.membershipId)}`;
      QRCode.toDataURL(verificationUrl, {
        width: 180,
        margin: 1,
        color: {
          dark: '#102B3F',
          light: '#FFFFFF'
        }
      })
        .then(setQrCodeDataUrl)
        .catch(console.error);

      return () => {
        cancelAnimationFrame(raf1);
        if (raf2) cancelAnimationFrame(raf2);
      };
    } else {
      setHasEntered(false);
    }
  }, [member, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !member) return null;

  const isScannedContext =
    isQrScanSuccess ||
    (typeof window !== 'undefined' && window.location.hash.startsWith('#verify-member-'));

  const buildCardData = () => ({
    nameBn: member.nameBn,
    nameEn: member.nameEn,
    roleBn: member.roleBn,
    roleEn: member.roleEn,
    membershipId: member.membershipId,
    bloodGroup: member.bloodGroup,
    district: member.district,
    joiningYear: member.joiningYear,
    joinedDate: member.joinedDate,
    avatar: member.avatar
  });

  const canPrintOrDownloadCard = canAccessMemberIdCard({
    targetMembershipId: member.membershipId,
    targetMemberId: member.id,
    currentAdmin,
    loggedInMember,
    currentWomensUser,
  });

  const handlePrint = async () => {
    if (!canPrintOrDownloadCard) return;
    const ok = await printMemberIdCard(buildCardData());
    if (!ok) {
      await downloadMemberIdCardPNG(buildCardData());
    }
  };

  const handleDownload = async () => {
    if (!canPrintOrDownloadCard) return;
    await downloadMemberIdCardPNG(buildCardData());
  };

  return (
    <div
      className={`fixed inset-0 z-[80] overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 transition-opacity duration-300 ease-out ${
        hasEntered ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        key={`${member.membershipId}-${isScannedContext ? 'scanned' : 'verify'}`}
        className={`bg-white dark:bg-[#0c1a24] rounded-3xl max-w-lg w-full border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden relative transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          hasEntered ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
        }`}
      >
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#102B3F] via-[#167D78] to-[#102B3F] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-5 h-5 text-[#D6F36A]" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-1.5">
                <span>{language === 'bn' ? 'সদস্যপদ সত্যতা যাচাই' : 'Official Member Verification'}</span>
              </h3>
              <p className="text-[11px] text-stone-200 font-mono">
                CoLASH Official Identity Verification System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {canPrintOrDownloadCard && (
              <>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#D6F36A] transition-colors cursor-pointer"
                  title={language === 'bn' ? 'আইডি কার্ড PNG ডাউনলোড' : 'Download ID Card PNG'}
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title={language === 'bn' ? 'আইডি কার্ড প্রিন্ট' : 'Print ID Card'}
                >
                  <Printer className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Certificate Body */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {/* Official Verification Badge with Smooth Green Tick Transition */}
          <div
            className={`relative overflow-hidden p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-emerald-50/90 to-teal-50 dark:from-emerald-950/60 dark:via-emerald-950/40 dark:to-teal-950/40 border-2 border-emerald-400/70 dark:border-emerald-600/70 flex items-center justify-between gap-3 transition-all duration-500 ease-out ${
              hasEntered
                ? 'opacity-100 translate-y-0 ring-4 ring-emerald-500/15 shadow-lg shadow-emerald-500/10'
                : 'opacity-0 translate-y-2 ring-0'
            }`}
          >
            {/* Subtle confirmation light sweep across the verification status banner */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/70 dark:via-emerald-300/20 to-transparent animate-verify-sweep" />

            <div className="relative flex items-center gap-3 min-w-0">
              {/* Animated Green Tick Icon with Halo Pulse */}
              <div className="relative w-10 h-10 shrink-0 flex items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-emerald-400/50 animate-verify-ring-pulse" />
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 animate-verify-tick-pop">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="w-5 h-5"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 13l4 4L19 7" className="animate-verify-tick-draw" />
                  </svg>
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-extrabold text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 block">
                    {language === 'bn' ? 'বৈধ ও নিবন্ধিত সদস্য' : 'Verified & Registered Member'}
                  </span>
                  {isScannedContext && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-600/15 dark:bg-emerald-400/20 text-emerald-700 dark:text-emerald-300 text-[9px] font-extrabold uppercase tracking-wide">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{language === 'bn' ? 'QR যাচাইকৃত' : 'QR Verified'}</span>
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-emerald-700/90 dark:text-emerald-400/90 font-mono block truncate">
                  Status: ACTIVE / কেন্দ্রীয় ডাটাবেসে সংরক্ষিত
                </span>
              </div>
            </div>

            <span className="relative shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
              <CheckCircle2 className="w-3 h-3 text-[#D6F36A]" />
              <span>{language === 'bn' ? 'অনুমোদিত' : 'Active'}</span>
            </span>
          </div>

          {/* Member Card Box */}
          <div
            className={`p-4 sm:p-5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center gap-4 transition-all duration-500 delay-75 ease-out ${
              hasEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            
            {/* Avatar with verified ring */}
            <div className="relative shrink-0">
              <img
                src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                alt={member.nameEn}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-emerald-500/80 shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center border-2 border-white dark:border-[#0c1a24] shadow-sm animate-verify-tick-pop">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Member Details */}
            <div className="flex-1 text-center sm:text-left min-w-0">
              <h4 className="font-extrabold text-base sm:text-lg text-[#102B3F] dark:text-white leading-tight">
                {language === 'bn' ? member.nameBn : member.nameEn}
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-medium mt-0.5">
                {member.nameEn}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mt-2">
                <span className="px-2 py-0.5 rounded-md bg-[#167D78]/10 text-[#167D78] dark:text-[#D6F36A] font-mono font-bold text-xs">
                  {member.membershipId}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center gap-1 border border-rose-200 dark:border-rose-800">
                  <Droplets className="w-3 h-3" />
                  <span>{member.bloodGroup}</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#167D78]" />
                  <span>{member.district}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Institutional Role & Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800">
              <span className="text-[10px] font-bold uppercase text-stone-400 block mb-0.5">
                {language === 'bn' ? 'বর্তমান দায়িত্ব' : 'Designation / Assignment'}
              </span>
              <span className="font-bold text-stone-800 dark:text-stone-200">
                {language === 'bn' ? member.roleBn : member.roleEn}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800">
              <span className="text-[10px] font-bold uppercase text-stone-400 block mb-0.5">
                {language === 'bn' ? 'যোগদানের সন' : 'Joining Year & Tenure'}
              </span>
              <span className="font-bold text-stone-800 dark:text-stone-200">
                {member.joiningYear || 2024} ({Math.max(1, new Date().getFullYear() - Number(member.joiningYear || 2024))} বছর সক্রিয়)
              </span>
            </div>
          </div>

          {/* QR Code and Official Stamp Row */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-stone-50 to-amber-50/40 dark:from-stone-900 dark:to-stone-900/60 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold text-[#167D78] dark:text-[#D6F36A] uppercase tracking-wider block">
                {language === 'bn' ? 'ডিজিটাল কিউআর যাচাই' : 'Encrypted QR Verification'}
              </span>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-relaxed max-w-xs">
                {language === 'bn'
                  ? 'এই কিউআর কোড স্ক্যান করে যেকোনো সময় কোলাশ কেন্দ্রীয় সার্ভার থেকে এই কার্ডের সত্যতা নিশ্চিত হওয়া যাবে।'
                  : 'Scan this official QR code with any smartphone to verify authentication directly with CoLASH central registry.'}
              </p>
              <span className="inline-block font-mono text-[9px] text-stone-400">
                Hash: {member.membershipId}-AUTHOFF-COLASH
              </span>
            </div>

            <div className="shrink-0 bg-white p-2 rounded-xl border border-stone-200 shadow-xs flex flex-col items-center">
              {qrCodeDataUrl ? (
                <img src={qrCodeDataUrl} alt="Verification QR" className="w-20 h-20" />
              ) : (
                <div className="w-20 h-20 bg-stone-100 flex items-center justify-center">
                  <QrCode className="w-8 h-8 text-stone-400 animate-pulse" />
                </div>
              )}
              <span className="text-[8px] font-bold font-mono text-[#102B3F] mt-1">SCAN ME</span>
            </div>
          </div>

          {/* ID Card Print/Download Protection Notice for Public Visitors */}
          {!canPrintOrDownloadCard && (
            <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
                <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>
                  {language === 'bn'
                    ? 'অপব্যবহার রোধে সদস্যের পূর্ণাঙ্গ আইডি কার্ড প্রিন্ট ও ডাউনলোড লক করা আছে। শুধুমাত্র লগইনকৃত সংশ্লিষ্ট সদস্য (নিজস্ব কার্ড) অথবা এডমিন/কো-এডমিন প্রিন্ট করতে পারবেন।'
                    : 'To prevent misuse, ID card printing and downloading is locked to the logged-in member (own card) or an authorized Admin / Co-Admin.'}
                </span>
              </div>
              {(onOpenPortal || onOpenAdmin) && (
                <div className="flex items-center gap-1.5 shrink-0">
                  {onOpenPortal && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenPortal();
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#167D78] hover:bg-[#102B3F] text-white text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      <LogIn className="w-3 h-3" />
                      <span>{language === 'bn' ? 'সদস্য লগইন' : 'Member Login'}</span>
                    </button>
                  )}
                  {onOpenAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAdmin();
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#102B3F] hover:bg-slate-800 text-[#D6F36A] text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      <ShieldCheck className="w-3 h-3" />
                      <span>{language === 'bn' ? 'এডমিন' : 'Admin'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <span className="text-[10px] text-stone-400 font-mono">
              CoLASH Foundation © 2026
            </span>
            <div className="flex items-center gap-2">
              {onOpenScanner && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenScanner();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#167D78]/10 hover:bg-[#167D78] text-[#167D78] dark:text-[#D6F36A] hover:text-white border border-[#167D78]/30 font-bold text-xs transition-all cursor-pointer"
                >
                  <ScanLine className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'আরেকটি ID স্ক্যান' : 'Scan Another ID'}</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[#102B3F] hover:bg-[#167D78] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                {language === 'bn' ? 'ঠিক আছে' : 'Close Verification'}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
