import React, { useState } from 'react';
import {
  X,
  Users,
  Search,
  ShieldCheck,
  CreditCard,
  Droplets,
  MapPin,
  QrCode,
  Printer,
  Download,
  Filter,
  CheckCircle2,
  Phone,
  Mail,
  UserCheck,
  Eye,
  Camera,
  Lock,
  LogIn,
  Shield
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { TeamMember, GeneralMember, Language, AdminUser, WomensTeamMember } from '../types';
import { MagneticButton } from './common/MagneticButton';
import { QRGenerator } from './common/QRGenerator';
import { QRScannerModal } from './common/QRScannerModal';
import { MemberVerificationModal } from './common/MemberVerificationModal';
import { DirectoryPrintPreviewModal, PrintPreviewMemberItem } from './common/DirectoryPrintPreviewModal';
import { printMemberIdCard, downloadMemberIdCardPNG } from '../utils/idCardPrintUtils';
import { canAccessMemberIdCard } from '../utils/idCardAccess';

interface MembersDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  committee: TeamMember[];
  generalMembers: GeneralMember[];
  currentAdmin?: AdminUser | null;
  loggedInMember?: GeneralMember | null;
  currentWomensUser?: WomensTeamMember | null;
  onOpenPortal?: () => void;
  onOpenAdmin?: () => void;
  onToast: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
}

export const MembersDirectoryModal: React.FC<MembersDirectoryModalProps> = ({
  isOpen,
  onClose,
  language,
  committee,
  generalMembers,
  currentAdmin,
  loggedInMember,
  currentWomensUser,
  onOpenPortal,
  onOpenAdmin,
  onToast
}) => {
  const [activeTab, setActiveTab] = useState<'committee' | 'general' | 'card'>('committee');
  const [searchQuery, setSearchQuery] = useState('');
  const [bloodFilter, setBloodFilter] = useState('all');
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [verifyModalMember, setVerifyModalMember] = useState<GeneralMember | null>(null);
  const [verifyFromScan, setVerifyFromScan] = useState<boolean>(false);
  const [qrTarget, setQrTarget] = useState<{
    memberId: string;
    memberName: string;
    memberRole: string;
    bloodGroup?: string;
    district?: string;
  } | null>(null);
  const [selectedMember, setSelectedMember] = useState<{
    id: string;
    nameBn: string;
    nameEn: string;
    roleBn: string;
    roleEn: string;
    membershipId: string;
    bloodGroup: string;
    district: string;
    joinedDate: string;
    email?: string;
    phone?: string;
  }>({
    id: committee[0]?.id || 'tm-1',
    nameBn: committee[0]?.nameBn || 'মো. আশরাফুল ইসলাম সুলতান',
    nameEn: committee[0]?.nameEn || 'Md. Ashraful Islam Sultan',
    roleBn: committee[0]?.roleBn || 'সভাপতি ও প্রতিষ্ঠাতা',
    roleEn: committee[0]?.roleEn || 'President & Founder',
    membershipId: 'CLF-EC-01',
    bloodGroup: 'O+',
    district: 'ঢাকা',
    joinedDate: '২০২১-০১-০১',
    email: committee[0]?.email || 'ashraful46475348@gmail.com'
  });

  // Close on Escape key (unless Print Preview or QR Scanner overlay is active)
  React.useEffect(() => {
    if (!isOpen || isPrintPreviewOpen || isQrScannerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPrintPreviewOpen, isQrScannerOpen, onClose]);

  if (!isOpen) return null;

  // Filter Committee
  const filteredCommittee = committee.filter(m => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      m.nameBn.toLowerCase().includes(q) ||
      m.nameEn.toLowerCase().includes(q) ||
      m.roleBn.toLowerCase().includes(q) ||
      m.roleEn.toLowerCase().includes(q);
    return matchesSearch;
  });

  // Filter General Members
  const filteredGeneral = generalMembers.filter(m => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      m.nameBn.toLowerCase().includes(q) ||
      m.nameEn.toLowerCase().includes(q) ||
      m.membershipId.toLowerCase().includes(q) ||
      m.district.toLowerCase().includes(q);
    const matchesBlood = bloodFilter === 'all' || m.bloodGroup === bloodFilter;
    return matchesSearch && matchesBlood;
  });

  const handleInspectMember = (
    member: any,
    isCommittee: boolean,
    index: number
  ) => {
    setSelectedMember({
      id: member.id,
      nameBn: member.nameBn,
      nameEn: member.nameEn,
      roleBn: member.roleBn,
      roleEn: member.roleEn,
      membershipId: isCommittee ? `CLF-EC-${(index + 1).toString().padStart(2, '0')}` : member.membershipId,
      bloodGroup: member.bloodGroup || 'O+',
      district: member.district || 'ঢাকা',
      joinedDate: member.joinedDate || '২০২১-০১-০১',
      email: member.email,
      phone: member.phone
    });
    setActiveTab('card');
  };

  // Real client-side download of the official council and members roster
  const handleDownloadRoster = () => {
    let content = `================================================================================
COLASH FOUNDATION (কোলাশ ফাউন্ডেশন)
OFFICIAL EXECUTIVE COUNCIL & GENERAL MEMBERS ROSTER (২০২৬-২০২৮)
REGISTERED UNDER DIRECTORATE OF SOCIAL WELFARE (REG NO: DH-9842/2021)
================================================================================

[১] কেন্দ্রীয় কার্যনির্বাহী কমিটি (CENTRAL EXECUTIVE COMMITTEE - ১৬ জন)
--------------------------------------------------------------------------------
1.  সভাপতি ও প্রতিষ্ঠাতা: মো. আশরাফুল ইসলাম সুলতান
2.  সহ-সভাপতি: আরিয়ান কামাল
3.  সাধারণ সম্পাদক: রাজদ্বীপ অধিকারী
4.  সহ-সাধারণ সম্পাদক: হাফিজুর রহমান
5.  সাংগঠনিক সম্পাদক: মুজিবুর রহমান
6.  সহ-সাংগঠনিক সম্পাদক: এহসানুল ইসলাম রাহি
7.  অর্থ সম্পাদক: সাদ আহমেদ
8.  সহ-অর্থ সম্পাদক: মো. আরশাদ হোসেন
9.  শিক্ষা ও সংস্কৃতি সম্পাদক: সাব্বির হোসেন
10. সহ-শিক্ষা ও সংস্কৃতি সম্পাদক: তাওসিম তাকে তারেক
11. সমাজকল্যাণ সম্পাদক: মাহফুজুর রহমান শাহী
12. সহ-সমাজকল্যাণ সম্পাদক: নাজমুল ইসলাম নাহিদ
13. প্রচার ও পরিকল্পনা সম্পাদক: নাঈম আহমেদ
14. সহ-প্রচার ও পরিকল্পনা সম্পাদক: আহনান ইসলাম শুভ
15. ক্রীড়া সম্পাদক: আল আমিন সোহাগ
16. সহ-ক্রীড়া সম্পাদক: আবু রাফসান নাবিল

[২] সাধারণ সদস্যদের তালিকা (GENERAL MEMBERS DIRECTORY - ১৩ জন)
--------------------------------------------------------------------------------
`;

    generalMembers.forEach((m) => {
      content += `${m.slNo.toString().padStart(2, ' ')}. ${m.nameBn.padEnd(25, ' ')} | ID: ${m.membershipId.padEnd(10, ' ')} | Blood: ${m.bloodGroup.padEnd(4, ' ')} | জেলা: ${m.district}\n`;
    });

    content += `================================================================================
Total Registered Members: ${committee.length + generalMembers.length}
Certified by: Central Secretariat, CoLASH Foundation
================================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CoLASH-Committee-and-Members-Directory.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onToast('success', language === 'bn' ? 'সদস্য তালিকা ডাউনলোড হয়েছে' : 'Roster Downloaded', 'CoLASH-Committee-and-Members-Directory.txt');
  };

  return (
    <div 
      className="print-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="print-modal-dialog bg-white dark:bg-[#0c1a24] max-w-5xl w-full rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="no-print bg-gradient-to-r from-[#102B3F] to-[#167D78] text-white p-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#D6F36A]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">
                  {language === 'bn'
                    ? 'কোলাশ ফাউন্ডেশন সদস্য ও কমিটি পোর্টাল টুল'
                    : 'CoLASH Members & Committee Directory Tool'}
                </h3>
                <span className="text-[10px] bg-[#D6F36A] text-[#102B3F] font-bold px-2 py-0.5 rounded-full">
                  Official Registry
                </span>
              </div>
              <p className="text-xs text-stone-200">
                {language === 'bn'
                  ? 'কেন্দ্রীয় কমিটি (১৬ জন) ও সাধারণ সদস্যবৃন্দ (১৩ জন)-এর অনুমোদিত তালিকা'
                  : 'Central Committee (16) & General Member Registry (13)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsQrScannerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-white/15 hover:bg-white/25 border border-white/20 rounded-lg transition-colors cursor-pointer"
              title={language === 'bn' ? 'ক্যামেরা দিয়ে QR কোড স্ক্যান করে যাচাই' : 'Scan member QR code with camera'}
            >
              <Camera className="w-3.5 h-3.5 text-[#D6F36A]" />
              <span>{language === 'bn' ? 'QR স্ক্যান' : 'Scan QR'}</span>
            </button>
            {activeTab !== 'card' && (
              <button
                type="button"
                onClick={() => setIsPrintPreviewOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#102B3F] bg-[#D6F36A] hover:bg-lime-300 rounded-lg transition-colors cursor-pointer shadow-xs"
                title={language === 'bn' ? 'কাগজে প্রিন্ট করার আগে লেআউট প্রিভিউ দেখুন' : 'Preview paper layout before printing'}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'প্রিন্ট প্রিভিউ' : 'Print Preview'}</span>
              </button>
            )}
            <button
              onClick={handleDownloadRoster}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-white/15 hover:bg-white/25 rounded-lg transition-colors cursor-pointer"
              title="Download text file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'তালিকা ডাউনলোড' : 'Download Roster'}</span>
            </button>
            <button 
              onClick={onClose} 
              className="p-2 text-stone-200 hover:text-white rounded-xl bg-white/10 hover:bg-white/20 transition-all cursor-pointer shadow-xs hover:scale-105 flex items-center justify-center shrink-0"
              aria-label="Close"
              title={language === 'bn' ? 'বন্ধ করুন (Close)' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="no-print px-6 bg-stone-50 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex gap-2 sm:gap-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('committee')}
              className={`py-3 px-2 border-b-2 font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'committee'
                  ? 'border-[#167D78] text-[#167D78] dark:text-[#D6F36A]'
                  : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{language === 'bn' ? 'কেন্দ্রীয় কার্যনির্বাহী কমিটি (১৬)' : 'Central Committee (16)'}</span>
            </button>

            <button
              onClick={() => setActiveTab('general')}
              className={`py-3 px-2 border-b-2 font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'general'
                  ? 'border-[#167D78] text-[#167D78] dark:text-[#D6F36A]'
                  : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>{language === 'bn' ? 'সাধারণ সদস্যদের তালিকা (১৩)' : 'General Members (13)'}</span>
            </button>

            <button
              onClick={() => setActiveTab('card')}
              className={`py-3 px-2 border-b-2 font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'card'
                  ? 'border-[#167D78] text-[#167D78] dark:text-[#D6F36A]'
                  : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>{language === 'bn' ? 'ডিজিটাল আইডি কার্ড টুল' : 'Digital ID Badge Tool'}</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="py-2 flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={language === 'bn' ? 'নাম বা আইডি দিয়ে খুঁজুন...' : 'Search by name or ID...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#167D78] w-48 sm:w-60"
              />
            </div>
            {activeTab === 'general' && (
              <select
                value={bloodFilter}
                onChange={(e) => setBloodFilter(e.target.value)}
                className="py-1.5 px-2 text-xs bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-700 dark:text-stone-300 focus:outline-none"
              >
                <option value="all">Blood: All</option>
                <option value="A+">A+</option>
                <option value="B+">B+</option>
                <option value="O+">O+</option>
                <option value="AB+">AB+</option>
                <option value="A-">A-</option>
                <option value="B-">B-</option>
              </select>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="print-modal-scroll-body p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: Central Executive Committee (16 Members) */}
          {activeTab === 'committee' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>
                  {language === 'bn'
                    ? 'কোলাশ ফাউন্ডেশনের অনুমোদিত ১৬ সদস্যবিশিষ্ট কেন্দ্রীয় কার্যনির্বাহী পরিষদ'
                    : '16-Member Approved Central Executive Committee'}
                </span>
                <span className="font-semibold text-[#167D78] dark:text-[#D6F36A]">
                  {filteredCommittee.length} {language === 'bn' ? 'জন প্রদর্শিত' : 'members'}
                </span>
              </div>

              <div className="print-member-directory-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredCommittee.map((member, idx) => (
                  <div
                    key={member.id}
                    onClick={() => handleInspectMember(member, true, idx)}
                    className="print-member-card p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/60 hover:border-[#167D78] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-800 overflow-hidden shrink-0 border border-stone-200 dark:border-stone-700">
                          <img
                            src={member.image}
                            alt={member.nameBn}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <span className="font-mono text-[10px] font-bold text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded">
                          #{idx + 1}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-[#102B3F] dark:text-white group-hover:text-[#167D78] dark:group-hover:text-[#D6F36A] transition-colors leading-snug">
                        {language === 'bn' ? member.nameBn : member.nameEn}
                      </h4>
                      <p className="text-xs text-[#167D78] dark:text-[#D6F36A] font-semibold mt-1">
                        {language === 'bn' ? member.roleBn : member.roleEn}
                      </p>
                    </div>

                    <div className="no-print pt-3 mt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500">
                      <span>আইডি কার্ড ভিউ</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setQrTarget({
                              memberId: `CLF-EC-${(idx + 1).toString().padStart(2, '0')}`,
                              memberName: language === 'bn' ? member.nameBn : member.nameEn,
                              memberRole: language === 'bn' ? member.roleBn : member.roleEn,
                              bloodGroup: member.bloodGroup || 'O+',
                              district: member.district || 'ঢাকা'
                            });
                          }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#167D78]/10 hover:bg-[#167D78] text-[#167D78] dark:text-[#D6F36A] hover:text-white font-bold text-[10px] transition-colors cursor-pointer"
                          title={language === 'bn' ? 'QR কোড তৈরি করুন' : 'Generate QR Code'}
                        >
                          <QrCode className="w-3 h-3" />
                          <span>QR</span>
                        </button>
                        <CreditCard className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#167D78]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: General Members Directory (13 Members) */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>
                  {language === 'bn'
                    ? 'কোলাশ ফাউন্ডেশনের অনুমোদিত ১৩ জন সক্রিয় সাধারণ সদস্যের সরকারি তালিকা'
                    : '13 Dedicated Registered General Members of CoLASH Foundation'}
                </span>
                <span className="font-semibold text-[#167D78] dark:text-[#D6F36A]">
                  {filteredGeneral.length} {language === 'bn' ? 'জন নিবন্ধিত' : 'registered'}
                </span>
              </div>

              {/* Responsive Table & Cards for General Members */}
              <div className="print-table-wrapper border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden bg-white dark:bg-stone-900/60 shadow-xs">
                <table className="print-member-directory-table w-full text-left text-xs">
                  <thead className="bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 font-semibold border-b border-stone-200 dark:border-stone-800">
                    <tr>
                      <th className="p-3 w-12 text-center">ক্রম</th>
                      <th className="p-3">{language === 'bn' ? 'সদস্যের নাম' : 'Member Name'}</th>
                      <th className="p-3">{language === 'bn' ? 'মেম্বার আইডি' : 'Member ID'}</th>
                      <th className="p-3">{language === 'bn' ? 'দায়িত্ব / বিভাগ' : 'Assigned Role'}</th>
                      <th className="p-3">{language === 'bn' ? 'রক্তের গ্রুপ' : 'Blood'}</th>
                      <th className="p-3">{language === 'bn' ? 'জেলা' : 'District'}</th>
                      <th className="no-print p-3 text-right">{language === 'bn' ? 'আইডি কার্ড' : 'Badge'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {filteredGeneral.map((m) => (
                      <tr
                        key={m.id}
                        onClick={() => handleInspectMember(m, false, m.slNo - 1)}
                        className="hover:bg-stone-50/80 dark:hover:bg-stone-800/40 transition-colors cursor-pointer group"
                      >
                        <td className="p-3 font-mono font-bold text-center text-stone-400">
                          {m.slNo}
                        </td>
                        <td className="p-3 font-bold text-stone-900 dark:text-white group-hover:text-[#167D78]">
                          {language === 'bn' ? m.nameBn : m.nameEn}
                        </td>
                        <td className="p-3 font-mono text-[#167D78] dark:text-[#D6F36A] font-semibold">
                          {m.membershipId}
                        </td>
                        <td className="p-3 text-stone-600 dark:text-stone-300">
                          {language === 'bn' ? m.roleBn : m.roleEn}
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded text-[11px]">
                            <Droplets className="w-3 h-3" />
                            <span>{m.bloodGroup}</span>
                          </span>
                        </td>
                        <td className="p-3 text-stone-500">
                          {m.district}
                        </td>
                        <td className="no-print p-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setQrTarget({
                                  memberId: m.membershipId,
                                  memberName: language === 'bn' ? m.nameBn : m.nameEn,
                                  memberRole: language === 'bn' ? m.roleBn : m.roleEn,
                                  bloodGroup: m.bloodGroup,
                                  district: m.district
                                });
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-[#102B3F] dark:text-[#D6F36A] bg-stone-100 dark:bg-stone-800 hover:bg-[#167D78] hover:text-white rounded-md transition-colors cursor-pointer"
                              title={language === 'bn' ? 'QR কোড তৈরি করুন' : 'Generate QR Code'}
                            >
                              <QrCode className="w-3 h-3" />
                              <span>QR</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setVerifyModalMember(m);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-600 hover:text-white border border-emerald-200 dark:border-emerald-800 rounded-md transition-colors cursor-pointer"
                              title={language === 'bn' ? 'ডিজিটাল পরিচয় যাচাই করুন' : 'Verify Digital Identity'}
                            >
                              <ShieldCheck className="w-3 h-3" />
                              <span>{language === 'bn' ? 'যাচাই' : 'Verify'}</span>
                            </button>
                            <button
                              type="button"
                              className="px-2.5 py-1 text-[11px] font-bold text-[#167D78] hover:text-white bg-[#167D78]/10 hover:bg-[#167D78] rounded-md transition-colors cursor-pointer"
                            >
                              {language === 'bn' ? 'কার্ড দেখুন' : 'View Card'}
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

          {/* TAB 3: Digital Membership ID Badge Tool */}
          {activeTab === 'card' && (() => {
            const canAccessSelectedCard = canAccessMemberIdCard({
              targetMembershipId: selectedMember.membershipId,
              targetMemberId: selectedMember.id,
              currentAdmin,
              loggedInMember,
              currentWomensUser,
            });

            return (
              <div className="max-w-xl mx-auto space-y-6">
                <div className="text-center">
                  <span className="text-xs uppercase font-bold tracking-widest text-[#167D78] dark:text-[#D6F36A]">
                    Official Member Identity Card Tool
                  </span>
                  <h4 className="text-lg font-bold text-[#102B3F] dark:text-white mt-1">
                    {language === 'bn'
                      ? 'কোলাশ ফাউন্ডেশনের ডিজিটাল পরিচয়পত্র'
                      : 'Digital Identity Card Access'}
                  </h4>
                </div>

                {canAccessSelectedCard ? (
                  <>
                    {/* Digital Badge Layout */}
                    <div id="member-badge-print" className="bg-gradient-to-br from-[#102B3F] via-[#0d2232] to-[#167D78] rounded-2xl p-6 text-white shadow-2xl border border-white/10 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-[#D6F36A]/5 rounded-full blur-2xl pointer-events-none" />

                      {/* ID Header */}
                      <div className="flex items-start justify-between border-b border-white/10 pb-3 mb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-[#D6F36A] text-[#102B3F] flex items-center justify-center font-black text-sm">
                            CLF
                          </div>
                          <div>
                            <h4 className="font-bold text-sm tracking-tight">CoLASH Foundation</h4>
                            <span className="text-[10px] text-[#D6F36A] tracking-wider uppercase font-semibold block">
                              {language === 'bn' ? 'অফিসিয়াল সদস্য কার্ড · গভমেন্ট রেজিস্টার্ড' : 'Official Member Identity Card · Registered'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Verified 2026-28</span>
                        </div>
                      </div>

                      {/* ID Details */}
                      <div className="flex flex-col sm:flex-row items-center gap-5">
                        <div className="w-20 h-20 rounded-xl bg-stone-700/60 border-2 border-[#D6F36A]/60 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                          <Users className="w-10 h-10 text-stone-300" />
                        </div>

                        <div className="flex-1 space-y-1.5 text-center sm:text-left">
                          <div className="text-xl font-bold">{selectedMember.nameBn}</div>
                          <div className="text-xs text-[#D6F36A] font-semibold">{selectedMember.roleBn}</div>

                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-stone-300 pt-1">
                            <span className="font-mono text-white font-bold bg-white/10 px-2 py-0.5 rounded">
                              ID: {selectedMember.membershipId}
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1 text-rose-300">
                              <Droplets className="w-3.5 h-3.5" />
                              <span>{selectedMember.bloodGroup}</span>
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-amber-300" />
                              <span>{selectedMember.district}</span>
                            </span>
                          </div>
                        </div>

                        <div className="w-16 h-16 rounded-lg bg-white p-1 flex items-center justify-center shrink-0">
                          <QRCodeSVG
                            value={`${window.location.origin}${window.location.pathname}#verify-member-${encodeURIComponent(selectedMember.membershipId)}`}
                            size={56}
                            bgColor="#FFFFFF"
                            fgColor="#102B3F"
                            level="M"
                          />
                        </div>
                      </div>

                      {/* Footer notes */}
                      <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-stone-400">
                        <span>Reg: DH-9842/2021 · Directorate of Social Welfare</span>
                        <span>Issuing Authority: Central Committee</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveTab('general')}
                        className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white cursor-pointer"
                      >
                        ← {language === 'bn' ? 'সদস্য তালিকায় ফিরুন' : 'Back to Member List'}
                      </button>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={async () => {
                            await downloadMemberIdCardPNG({
                              nameBn: selectedMember.nameBn,
                              nameEn: selectedMember.nameEn,
                              roleBn: selectedMember.roleBn,
                              roleEn: selectedMember.roleEn,
                              membershipId: selectedMember.membershipId,
                              bloodGroup: selectedMember.bloodGroup,
                              district: selectedMember.district,
                              joinedDate: selectedMember.joinedDate
                            });
                            onToast('success', language === 'bn' ? 'আইডি কার্ড ডাউনলোড হয়েছে' : 'ID Card Downloaded', `CoLASH-ID-Card-${selectedMember.membershipId}.png`);
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#102B3F] hover:bg-[#167D78] rounded-xl transition-colors cursor-pointer shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5 text-[#D6F36A]" />
                          <span>{language === 'bn' ? 'PNG সেভ করুন' : 'Download PNG'}</span>
                        </button>
                        <MagneticButton
                          type="button"
                          onClick={async () => {
                            const ok = await printMemberIdCard({
                              nameBn: selectedMember.nameBn,
                              nameEn: selectedMember.nameEn,
                              roleBn: selectedMember.roleBn,
                              roleEn: selectedMember.roleEn,
                              membershipId: selectedMember.membershipId,
                              bloodGroup: selectedMember.bloodGroup,
                              district: selectedMember.district,
                              joinedDate: selectedMember.joinedDate
                            });
                            if (ok) {
                              onToast('info', language === 'bn' ? 'আইডি কার্ড প্রিন্ট প্রস্তুত হয়েছে' : 'Print Ready');
                            } else {
                              await downloadMemberIdCardPNG({
                                nameBn: selectedMember.nameBn,
                                nameEn: selectedMember.nameEn,
                                roleBn: selectedMember.roleBn,
                                roleEn: selectedMember.roleEn,
                                membershipId: selectedMember.membershipId,
                                bloodGroup: selectedMember.bloodGroup,
                                district: selectedMember.district,
                                joinedDate: selectedMember.joinedDate
                              });
                              onToast('success', language === 'bn' ? 'প্রিন্টের জন্য আইডি কার্ড ডাউনলোড হয়েছে' : 'ID Card Saved');
                            }
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#167D78] hover:bg-[#102B3F] rounded-xl transition-colors cursor-pointer shadow-sm btn-primary-interaction"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>{language === 'bn' ? 'কার্ড প্রিন্ট করুন' : 'Print Member Badge'}</span>
                        </MagneticButton>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div className="space-y-1.5">
                      <h5 className="text-sm font-extrabold text-amber-900 dark:text-amber-200">
                        {language === 'bn'
                          ? 'আইডি কার্ড সুরক্ষিত — অ্যাক্সেস সীমিত'
                          : 'Member ID Card Protected — Restricted Access'}
                      </h5>
                      <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed max-w-md mx-auto">
                        {language === 'bn'
                          ? 'অপব্যবহার ও জালিয়াতি রোধে সাধারণ ভিজিটররা কোনো সদস্যের আইডি কার্ড দেখতে, প্রিন্ট করতে বা ডাউনলোড করতে পারবেন না। শুধুমাত্র সংশ্লিষ্ট সদস্য নিজে লগইন করে নিজের আইডি কার্ড অথবা অনুমোদিত অ্যাডমিন / কো-অ্যাডমিন প্রিন্ট করতে পারবেন।'
                          : 'To prevent misuse and forgery, public visitors cannot view, print, or download member ID cards. Only the logged-in cardholder or an authorized Admin / Co-Admin may access it.'}
                      </p>
                      <div className="text-[11px] font-mono font-bold text-stone-600 dark:text-stone-300 pt-1">
                        {selectedMember.nameBn} ({selectedMember.membershipId})
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('general')}
                        className="px-3.5 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl hover:bg-stone-100 cursor-pointer"
                      >
                        ← {language === 'bn' ? 'তালিকায় ফিরুন' : 'Back to List'}
                      </button>
                      {onOpenPortal && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenPortal();
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#167D78] hover:bg-[#102B3F] rounded-xl cursor-pointer shadow-xs"
                        >
                          <LogIn className="w-3.5 h-3.5 text-[#D6F36A]" />
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
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#102B3F] hover:bg-[#167D78] rounded-xl cursor-pointer shadow-xs"
                        >
                          <Shield className="w-3.5 h-3.5 text-[#D6F36A]" />
                          <span>{language === 'bn' ? 'অ্যাডমিন / কো-অ্যাডমিন' : 'Admin / Co-Admin'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

        </div>

      </div>

      {/* Shareable Member QR Code Generator */}
      <QRGenerator
        isOpen={Boolean(qrTarget)}
        onClose={() => setQrTarget(null)}
        memberId={qrTarget?.memberId || ''}
        memberName={qrTarget?.memberName}
        memberRole={qrTarget?.memberRole}
        bloodGroup={qrTarget?.bloodGroup}
        district={qrTarget?.district}
        language={language}
        onVerifyNow={(id) => {
          const norm = id.trim().toLowerCase();
          const matched = generalMembers.find(
            gm => gm.membershipId.toLowerCase() === norm || gm.id.toLowerCase() === norm
          );
          if (matched) setVerifyModalMember(matched);
        }}
        onOpenScanner={() => setIsQrScannerOpen(true)}
        onToast={onToast}
      />

      {/* Print Preview Overlay for Committee Grid or General Members */}
      <DirectoryPrintPreviewModal
        isOpen={isPrintPreviewOpen}
        onClose={() => setIsPrintPreviewOpen(false)}
        onTriggerPrint={() => window.print()}
        language={language}
        initialView={activeTab === 'general' ? 'table' : 'grid'}
        members={
          activeTab === 'committee'
            ? filteredCommittee.map((m, idx): PrintPreviewMemberItem => ({
                id: m.id,
                slNo: idx + 1,
                membershipId: `CLF-EC-${(idx + 1).toString().padStart(2, '0')}`,
                nameBn: m.nameBn,
                nameEn: m.nameEn,
                roleBn: m.roleBn,
                roleEn: m.roleEn,
                bloodGroup: m.bloodGroup || 'O+',
                district: m.district || (language === 'bn' ? 'ঢাকা' : 'Dhaka'),
                joinedDate: m.joiningYear ? String(m.joiningYear) : '২০২১-০১-০১',
                statusLabelBn: 'নির্বাহী',
                statusLabelEn: 'Executive',
              }))
            : filteredGeneral.map((m): PrintPreviewMemberItem => ({
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
              }))
        }
        titleBn={
          activeTab === 'committee'
            ? 'কোলাশ ফাউন্ডেশন — কেন্দ্রীয় কার্যনির্বাহী কমিটি (২০২৬-২০২৮)'
            : 'কোলাশ ফাউন্ডেশন — নিবন্ধিত সাধারণ সদস্য ডিরেক্টরি'
        }
        titleEn={
          activeTab === 'committee'
            ? 'CoLASH Foundation — Central Executive Committee (2026-2028)'
            : 'CoLASH Foundation — Registered General Members Directory'
        }
      />

      {/* Admin Camera QR Verification Scanner */}
      <QRScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        language={language}
        generalMembers={generalMembers}
        committee={committee}
        onToast={onToast}
        onOpenVerificationModal={(member) => {
          setVerifyFromScan(true);
          setVerifyModalMember(member);
        }}
        onVerifiedMemberOpen={(member) => handleInspectMember(member, false, member.slNo - 1)}
      />

      {/* Digital Identity Verification Modal */}
      <MemberVerificationModal
        member={verifyModalMember}
        isOpen={Boolean(verifyModalMember)}
        onClose={() => {
          setVerifyModalMember(null);
          setVerifyFromScan(false);
        }}
        language={language}
        currentAdmin={currentAdmin}
        loggedInMember={loggedInMember}
        currentWomensUser={currentWomensUser}
        onOpenPortal={onOpenPortal}
        onOpenAdmin={onOpenAdmin}
        onOpenScanner={() => setIsQrScannerOpen(true)}
        isQrScanSuccess={verifyFromScan}
      />
    </div>
  );
};
