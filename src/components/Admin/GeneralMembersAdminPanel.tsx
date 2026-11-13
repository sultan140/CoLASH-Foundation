import React, { useState, useRef } from 'react';
import {
  IdCard,
  Plus,
  Edit,
  Trash2,
  Search,
  Droplets,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Upload,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Save,
  X,
  Users,
  Clock3,
  AlertTriangle,
  UserCheck,
  UserX,
  Key,
  Download,
  Printer
} from 'lucide-react';
import { GeneralMember, AdminUser, Language } from '../../types';
import { exportMembersToCSV } from '../../utils/exportUtils';
import { compressImageFile } from '../../utils/imageCompressor';
import { printMemberIdCard, downloadMemberIdCardPNG, PrintableIdCardData } from '../../utils/idCardPrintUtils';

interface GeneralMembersAdminPanelProps {
  currentAdmin: AdminUser | null;
  language: Language;
  generalMembers: GeneralMember[];
  onUpdateGeneralMembers: (members: GeneralMember[]) => void;
  onToast: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
}

export const GeneralMembersAdminPanel: React.FC<GeneralMembersAdminPanelProps> = ({
  currentAdmin,
  language,
  generalMembers,
  onUpdateGeneralMembers,
  onToast
}) => {
  const isSuperAdmin = currentAdmin?.role === 'super_admin';
  const canAdd = isSuperAdmin || Boolean(currentAdmin?.permissions.canAddMembers);
  const canEdit = isSuperAdmin || Boolean(currentAdmin?.permissions.canEditMembers);
  const canDelete = isSuperAdmin || Boolean(currentAdmin?.permissions.canDeleteMembers);
  const canManageIdCards = Boolean(currentAdmin?.isActive);

  const buildPrintableIdCard = (member: GeneralMember): PrintableIdCardData => ({
    nameBn: member.nameBn,
    nameEn: member.nameEn,
    roleBn: member.currentDesignationBn || member.roleBn,
    roleEn: member.currentDesignationEn || member.roleEn,
    membershipId: member.membershipId,
    bloodGroup: member.bloodGroup,
    district: member.district,
    joiningYear: member.joiningYear || 2024,
    joinedDate: member.joinedDate,
    avatar: member.avatar,
  });

  const handlePrintIdCard = async (member: GeneralMember) => {
    const payload = buildPrintableIdCard(member);
    const ok = await printMemberIdCard(payload);
    if (ok) {
      onToast(
        'info',
        language === 'bn' ? 'আইডি কার্ড প্রিন্ট প্রস্তুত হয়েছে' : 'ID Card Print Ready',
        `${member.nameBn} (${member.membershipId})`
      );
    } else {
      await downloadMemberIdCardPNG(payload);
      onToast(
        'success',
        language === 'bn' ? 'প্রিন্টের জন্য আইডি কার্ড ডাউনলোড হয়েছে' : 'ID Card Downloaded for Print',
        `CoLASH-ID-Card-${member.membershipId}.png`
      );
    }
  };

  const handleDownloadIdCard = async (member: GeneralMember) => {
    await downloadMemberIdCardPNG(buildPrintableIdCard(member));
    onToast(
      'success',
      language === 'bn' ? 'আইডি কার্ড ডাউনলোড সম্পন্ন' : 'ID Card Downloaded',
      `CoLASH-ID-Card-${member.membershipId}.png`
    );
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [statusTab, setStatusTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<GeneralMember | null>(null);

  // Photo upload
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [memberAvatarPreview, setMemberAvatarPreview] = useState<string>('');

  // Duplicate ID warning state
  const [idError, setIdError] = useState<string | null>(null);

  // Distinct blood groups and districts
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const districts = Array.from(new Set(generalMembers.map(m => m.district))).sort();

  // Counts
  const pendingCount = generalMembers.filter(m => m.approvalStatus === 'pending').length;
  const approvedCount = generalMembers.filter(m => m.approvalStatus === 'approved' || (!m.approvalStatus && m.status === 'active')).length;
  const rejectedCount = generalMembers.filter(m => m.approvalStatus === 'rejected').length;

  // Filtered members
  const filteredMembers = generalMembers.filter(m => {
    // Status filter
    const isApproved = m.approvalStatus === 'approved' || (!m.approvalStatus && m.status === 'active');
    if (statusTab === 'pending' && m.approvalStatus !== 'pending') return false;
    if (statusTab === 'approved' && !isApproved) return false;
    if (statusTab === 'rejected' && m.approvalStatus !== 'rejected') return false;

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      m.nameBn.toLowerCase().includes(q) ||
      m.nameEn.toLowerCase().includes(q) ||
      m.membershipId.toLowerCase().includes(q) ||
      m.district.toLowerCase().includes(q) ||
      m.bloodGroup.toLowerCase().includes(q) ||
      (m.phone && m.phone.toLowerCase().includes(q));

    const matchesBlood = selectedBloodGroup === 'all' || m.bloodGroup === selectedBloodGroup;
    const matchesDistrict = selectedDistrict === 'all' || m.district === selectedDistrict;

    return matchesSearch && matchesBlood && matchesDistrict;
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImageFile(file, {
        maxWidth: 1000,
        maxHeight: 1000,
        quality: 0.85,
        format: 'image/webp'
      });
      setMemberAvatarPreview(compressed.dataUrl);
      onToast(
        'info',
        language === 'bn' ? 'ছবি অপ্টিমাইজ করা হয়েছে' : 'Image Optimized',
        language === 'bn' ? `সাইজ ${Math.round(compressed.compressedSize / 1024)} KB-এ সংকুচিত হয়েছে।` : `Compressed to ${Math.round(compressed.compressedSize / 1024)} KB.`
      );
    } catch {
      // Fallback to standard FileReader
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) setMemberAvatarPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 1-Click Approve Member ("Tobe website er admin approve korbe. Tarpor website e show korbe.")
  const handleApproveMember = (memberId: string) => {
    if (!canEdit) {
      onToast('error', language === 'bn' ? 'অনুমতি নেই' : 'Permission Denied');
      return;
    }

    const target = generalMembers.find(m => m.id === memberId);
    const updated = generalMembers.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          approvalStatus: 'approved' as const,
          roleBn: m.roleBn.includes('আবেদনকারী') ? 'সাধারণ সদস্য' : m.roleBn,
          approvedAt: new Date().toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')
        };
      }
      return m;
    });

    onUpdateGeneralMembers(updated);
    onToast(
      'success',
      language === 'bn' ? 'সদস্য আবেদন অনুমোদিত!' : 'Member Approved!',
      `${target?.nameBn || 'সদস্য'} (${target?.membershipId}) এখন ওয়েবসাইটের সদস্য তালিকায় লাইভ প্রদর্শিত হচ্ছে।`
    );
  };

  // 1-Click Reject Member
  const handleRejectMember = (memberId: string) => {
    if (!canEdit) {
      onToast('error', language === 'bn' ? 'অনুমতি নেই' : 'Permission Denied');
      return;
    }

    const target = generalMembers.find(m => m.id === memberId);
    const updated = generalMembers.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          approvalStatus: 'rejected' as const
        };
      }
      return m;
    });

    onUpdateGeneralMembers(updated);
    onToast(
      'info',
      language === 'bn' ? 'সদস্য আবেদন স্থগিত করা হয়েছে' : 'Application Rejected',
      `${target?.nameBn || 'সদস্য'} (${target?.membershipId}) আবেদনটি রিভিউতে স্থগিত রাখা হয়েছে।`
    );
  };

  const handleSaveMemberSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIdError(null);

    const formData = new FormData(e.currentTarget);
    const membershipId = (formData.get('membershipId') as string).trim().toUpperCase();
    const nameBn = (formData.get('nameBn') as string).trim();
    const nameEn = (formData.get('nameEn') as string).trim();
    const bloodGroup = (formData.get('bloodGroup') as string).trim();
    const district = (formData.get('district') as string).trim();
    const joinedDate = (formData.get('joinedDate') as string).trim();
    const roleBn = (formData.get('roleBn') as string).trim();
    const roleEn = (formData.get('roleEn') as string).trim();
    const phone = (formData.get('phone') as string).trim();
    const email = (formData.get('email') as string).trim();
    const password = (formData.get('password') as string).trim();
    const approvalStatus = (formData.get('approvalStatus') as any) || 'approved';
    const profession = (formData.get('profession') as string).trim();
    const address = (formData.get('address') as string).trim();
    const bio = (formData.get('bio') as string).trim();
    const avatarUrl = memberAvatarPreview || (formData.get('avatarUrl') as string).trim();

    if (!membershipId || !nameBn) {
      onToast('error', language === 'bn' ? 'সদস্য আইডি ও নাম আবশ্যক' : 'Membership ID and Name required');
      return;
    }

    // STRICT DUPLICATE ID CHECK
    const isDuplicate = generalMembers.some(m => {
      if (editingMember && m.id === editingMember.id) return false;
      return m.membershipId.toUpperCase() === membershipId;
    });

    if (isDuplicate) {
      setIdError(
        language === 'bn'
          ? `সতর্কতা: "${membershipId}" সদস্য আইডিটি ইতিমধ্যে অন্য একজন সদস্যের নামে নিবন্ধিত! ভিন্ন আইডি দিন।`
          : `Duplicate ID Warning: Membership ID "${membershipId}" already exists! Please use a unique ID.`
      );
      onToast(
        'error',
        language === 'bn' ? 'ডুপ্লিকেট সদস্য আইডি!' : 'Duplicate Membership ID',
        language === 'bn' ? `"${membershipId}" ইতিমধ্যে ব্যবহৃত হয়েছে।` : 'ID already in use.'
      );
      return;
    }

    if (editingMember) {
      if (!canEdit) {
        onToast('error', language === 'bn' ? 'অনুমতি নেই' : 'Permission Denied');
        return;
      }

      const updated = generalMembers.map(m => {
        if (m.id === editingMember.id) {
          return {
            ...m,
            membershipId,
            nameBn,
            nameEn: nameEn || nameBn,
            bloodGroup: bloodGroup || m.bloodGroup,
            district: district || m.district,
            joinedDate: joinedDate || m.joinedDate,
            roleBn: roleBn || m.roleBn,
            roleEn: roleEn || roleBn,
            phone,
            email,
            password: password || m.password || 'member123',
            approvalStatus,
            profession: profession || m.profession,
            address: address || m.address,
            bio: bio || m.bio,
            avatar: avatarUrl || m.avatar
          };
        }
        return m;
      });

      onUpdateGeneralMembers(updated);
      onToast('success', language === 'bn' ? 'সদস্যের তথ্য সফলভাবে হালনাগাদ করা হয়েছে' : 'Member updated successfully');
    } else {
      if (!canAdd) {
        onToast('error', language === 'bn' ? 'অনুমতি নেই' : 'Permission Denied');
        return;
      }

      const nextSlNo = generalMembers.length > 0 ? Math.max(...generalMembers.map(m => m.slNo || 0)) + 1 : 1;
      const newMember: GeneralMember = {
        id: `gm-${Date.now().toString().slice(-6)}`,
        slNo: nextSlNo,
        membershipId,
        nameBn,
        nameEn: nameEn || nameBn,
        bloodGroup: bloodGroup || 'O+',
        district: district || 'মৌলভীবাজার',
        joinedDate: joinedDate || new Date().toISOString().split('T')[0],
        status: 'active',
        roleBn: roleBn || 'সাধারণ সদস্য',
        roleEn: roleEn || 'General Member',
        phone,
        email,
        password: password || 'member123',
        approvalStatus: approvalStatus || 'approved',
        profession: profession || undefined,
        address: address || undefined,
        bio: bio || undefined,
        avatar: avatarUrl || undefined
      };

      const updated = [...generalMembers, newMember];
      onUpdateGeneralMembers(updated);
      onToast('success', language === 'bn' ? 'নতুন সদস্য সফলভাবে নিবন্ধিত হয়েছেন' : 'New member registered successfully');
    }

    setIsModalOpen(false);
    setEditingMember(null);
    setMemberAvatarPreview('');
  };

  const handleDeleteMember = (id: string) => {
    if (!canDelete) {
      onToast('error', language === 'bn' ? 'অনুমতি নেই' : 'Permission Denied', language === 'bn' ? 'সদস্য মুছে ফেলার জন্য Super Admin পারমিশন প্রয়োজন।' : 'Super Admin permission required to delete member.');
      return;
    }

    const target = generalMembers.find(m => m.id === id);
    if (!target) return;

    if (!window.confirm(language === 'bn' ? `আপনি কি নিশ্চিতভাবে সদস্য "${target.nameBn}" (আইডি: ${target.membershipId})-কে ডিলিট করতে চান?` : `Delete member ${target.nameEn || target.nameBn} (${target.membershipId})?`)) {
      return;
    }

    const updated = generalMembers.filter(m => m.id !== id);
    onUpdateGeneralMembers(updated);
    onToast('info', language === 'bn' ? 'সদস্য রেকর্ড মুছে ফেলা হয়েছে' : 'Member record deleted');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#102B3F] to-[#167D78] text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#D6F36A] text-xs font-bold uppercase tracking-wider mb-2">
            <IdCard className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'সাধারণ সদস্য ও অনুমোদন নিয়ন্ত্রণ কেন্দ্র' : 'Member Approvals & ID Registry'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black">
            {language === 'bn' ? 'সদস্য অনুমোদন, প্রোফাইল নিয়ন্ত্রণ ও ডুপ্লিকেট সুরক্ষা' : 'Member Approvals, Profiles & Verification'}
          </h3>
          <p className="text-xs sm:text-sm text-stone-200 mt-1 max-w-2xl leading-relaxed">
            {language === 'bn'
              ? 'ওয়েবসাইট থেকে সাধারণ মানুষ যে মেম্বার আইডি তৈরি করেন তা এখানে জমা হয়। এডমিন অনুমোদন (Approve) করলেই তা প্রকাশ্য ওয়েবসাইটে লাইভ হবে। এছাড়া এডমিন যেকোনো সদস্যের তথ্য ও পাসওয়ার্ড সম্পাদনা করতে পারেন।'
              : 'Approve or reject public member applications before they display on the live website. Edit member details, assign roles, and manage credentials.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              exportMembersToCSV(generalMembers);
              onToast('success', language === 'bn' ? 'সদস্য তালিকা এক্সেল ফাইলে এক্সপোর্ট হয়েছে' : 'Members CSV Exported');
            }}
            className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer shadow-sm flex items-center gap-2 border border-white/20 transition-transform active:scale-95"
            title="Export full member registry to CSV"
          >
            <Download className="w-4 h-4 text-[#D6F36A]" />
            <span>{language === 'bn' ? 'এক্সপোর্ট CSV' : 'Export CSV'}</span>
          </button>

          {canAdd && (
            <button
              onClick={() => {
                setEditingMember(null);
                setMemberAvatarPreview('');
                setIdError(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#D6F36A] hover:bg-[#c5e458] text-[#102B3F] font-bold text-xs cursor-pointer shadow-sm flex items-center gap-2 transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'bn' ? 'সরাসরি সদস্য যোগ করুন' : 'Add Direct Member'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Approval Status Tab Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-3">
        <button
          onClick={() => setStatusTab('all')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            statusTab === 'all'
              ? 'bg-[#102B3F] text-white shadow-xs'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'সকল সদস্য' : 'All Members'}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono">
            {generalMembers.length}
          </span>
        </button>

        <button
          onClick={() => setStatusTab('pending')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 relative ${
            statusTab === 'pending'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-800'
          }`}
        >
          <Clock3 className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'অনুমোদন অপেক্ষমাণ' : 'Pending Approval'}</span>
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setStatusTab('approved')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            statusTab === 'approved'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'অনুমোদিত ও লাইভ' : 'Approved & Live'}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 font-mono">
            {approvedCount}
          </span>
        </button>

        <button
          onClick={() => setStatusTab('rejected')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            statusTab === 'rejected'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-800'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'স্থগিত / বাতিল' : 'Rejected'}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200 font-mono">
            {rejectedCount}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0c1a24] p-3 rounded-2xl border border-stone-200 dark:border-stone-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'bn' ? 'নাম, আইডি, জেলা বা রক্ত...' : 'Search by name, ID, district...'}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#167D78]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Blood group select */}
          <select
            value={selectedBloodGroup}
            onChange={(e) => setSelectedBloodGroup(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white cursor-pointer"
          >
            <option value="all">{language === 'bn' ? 'সকল রক্তের গ্রুপ' : 'All Blood Groups'}</option>
            {bloodGroups.map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>

          {/* District select */}
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white cursor-pointer"
          >
            <option value="all">{language === 'bn' ? 'সকল জেলা' : 'All Districts'}</option>
            {districts.map(dist => (
              <option key={dist} value={dist}>{dist}</option>
            ))}
          </select>

          <span className="text-xs text-stone-500 dark:text-stone-400 pl-2">
            {language === 'bn' ? `প্রদর্শিত: ${filteredMembers.length} জন` : `Showing: ${filteredMembers.length}`}
          </span>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white dark:bg-[#0c1a24] rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-900 text-stone-600 dark:text-stone-400 uppercase tracking-wider font-bold border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="px-4 py-3 text-center w-12">#</th>
                <th className="px-4 py-3">{language === 'bn' ? 'সদস্যের নাম ও ছবি' : 'Member Name'}</th>
                <th className="px-4 py-3">{language === 'bn' ? 'আইডি ও রক্তের গ্রুপ' : 'ID & Blood'}</th>
                <th className="px-4 py-3">{language === 'bn' ? 'অনুমোদন স্ট্যাটাস' : 'Approval Status'}</th>
                <th className="px-4 py-3">{language === 'bn' ? 'দায়িত্ব ও পদবি' : 'Role'}</th>
                <th className="px-4 py-3">{language === 'bn' ? 'জেলা ও ঠিকানা' : 'District & Address'}</th>
                <th className="px-4 py-3">{language === 'bn' ? 'যোগাযোগ' : 'Contact'}</th>
                {(canEdit || canDelete) && (
                  <th className="px-4 py-3 text-right">{language === 'bn' ? 'পদক্ষেপ' : 'Action'}</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-700 dark:text-stone-300">
              {filteredMembers.map((member, idx) => {
                const isApproved = member.approvalStatus === 'approved' || (!member.approvalStatus && member.status === 'active');
                const isPending = member.approvalStatus === 'pending';
                const isRejected = member.approvalStatus === 'rejected';

                return (
                  <tr key={member.id} className={`hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition-colors ${isPending ? 'bg-amber-50/30 dark:bg-amber-950/20' : ''}`}>
                    <td className="px-4 py-3 text-center font-mono font-bold text-stone-400">
                      {member.slNo || idx + 1}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 shrink-0">
                          <img
                            src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                            alt={member.nameBn}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                            <span>{language === 'bn' ? member.nameBn : member.nameEn}</span>
                            {isPending && (
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                            )}
                          </div>
                          <div className="text-[10px] text-stone-400 font-mono">
                            {member.nameEn}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-[#102B3F] text-[#D6F36A] font-mono font-bold text-[11px]">
                          {member.membershipId}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 font-bold text-[10px] flex items-center gap-0.5">
                          <Droplets className="w-2.5 h-2.5" />
                          <span>{member.bloodGroup}</span>
                        </span>
                      </div>
                    </td>

                    {/* APPROVAL STATUS */}
                    <td className="px-4 py-3">
                      {isApproved && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] flex items-center gap-1 w-max border border-emerald-300 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{language === 'bn' ? 'অনুমোদিত ও লাইভ' : 'Approved & Live'}</span>
                        </span>
                      )}
                      {isPending && (
                        <div className="space-y-1">
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 font-bold text-[10px] flex items-center gap-1 w-max border border-amber-300 dark:border-amber-800">
                            <Clock3 className="w-3 h-3 text-amber-600" />
                            <span>{language === 'bn' ? 'অনুমোদন অপেক্ষমাণ' : 'Pending Approval'}</span>
                          </span>
                          {canEdit && (
                            <button
                              onClick={() => handleApproveMember(member.id)}
                              className="px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                            >
                              <UserCheck className="w-3 h-3 text-[#D6F36A]" />
                              <span>{language === 'bn' ? 'অনুমোদন দিন' : 'Approve'}</span>
                            </button>
                          )}
                        </div>
                      )}
                      {isRejected && (
                        <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold text-[10px] flex items-center gap-1 w-max border border-rose-300 dark:border-rose-800">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>{language === 'bn' ? 'স্থগিত / বাতিল' : 'Rejected'}</span>
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <span className="font-semibold text-stone-800 dark:text-stone-200">
                        {language === 'bn' ? member.roleBn : member.roleEn}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-stone-700 dark:text-stone-300 font-medium">
                          <MapPin className="w-3 h-3 text-[#167D78]" />
                          <span>{member.district}</span>
                        </div>
                        {member.address && (
                          <div className="text-[10px] text-stone-400 line-clamp-1 max-w-[130px]">
                            {member.address}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="space-y-0.5 text-[11px] text-stone-500 dark:text-stone-400">
                        {member.phone && <div>📞 {member.phone}</div>}
                        {member.email && <div className="truncate max-w-[130px]">✉️ {member.email}</div>}
                      </div>
                    </td>

                    {(canEdit || canDelete || canManageIdCards) && (
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          {canManageIdCards && (
                            <button
                              type="button"
                              onClick={() => handlePrintIdCard(member)}
                              className="p-1.5 rounded-lg text-[#167D78] dark:text-[#D6F36A] hover:bg-[#167D78]/10 cursor-pointer"
                              title={language === 'bn' ? 'আইডি কার্ড প্রিন্ট করুন (Admin/Co-Admin)' : 'Print ID Card (Admin/Co-Admin)'}
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canManageIdCards && (
                            <button
                              type="button"
                              onClick={() => handleDownloadIdCard(member)}
                              className="p-1.5 rounded-lg text-[#102B3F] dark:text-sky-300 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                              title={language === 'bn' ? 'আইডি কার্ড PNG ডাউনলোড করুন' : 'Download ID Card PNG'}
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {isPending && canEdit && (
                            <button
                              onClick={() => handleApproveMember(member.id)}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer"
                              title={language === 'bn' ? 'অনুমোদন দিন' : 'Approve'}
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}
                          {isPending && canEdit && (
                            <button
                              onClick={() => handleRejectMember(member.id)}
                              className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer"
                              title={language === 'bn' ? 'স্থগিত করুন' : 'Reject'}
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          )}
                          {canEdit && (
                            <button
                              onClick={() => {
                                setEditingMember(member);
                                setMemberAvatarPreview(member.avatar || '');
                                setIdError(null);
                                setIsModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                              title={language === 'bn' ? 'সম্পাদন করুন' : 'Edit Member'}
                            >
                              <Edit className="w-3.5 h-3.5 text-[#167D78]" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteMember(member.id)}
                              className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                              title={language === 'bn' ? 'মুছে ফেলুন' : 'Delete Member'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredMembers.length === 0 && (
          <div className="p-8 text-center text-xs text-stone-500">
            {language === 'bn' ? 'কোনো সদস্য পাওয়া যায়নি।' : 'No members found in this view.'}
          </div>
        )}
      </div>

      {/* CREATE / EDIT MEMBER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0c1a24] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setEditingMember(null);
                setMemberAvatarPreview('');
                setIdError(null);
              }}
              className="absolute top-4 right-4 p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h4 className="text-lg font-bold text-[#102B3F] dark:text-white mb-4 flex items-center gap-2">
              <IdCard className="w-5 h-5 text-[#167D78]" />
              <span>
                {editingMember
                  ? (language === 'bn' ? 'সদস্যের তথ্য ও অনুমোদন সম্পাদনা' : 'Edit Member & Approval')
                  : (language === 'bn' ? 'নতুন সাধারণ সদস্য যোগ' : 'Add New Member')}
              </span>
            </h4>

            {idError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{idError}</span>
              </div>
            )}

            <form onSubmit={handleSaveMemberSubmit} className="space-y-3.5 text-xs">
              
              {/* Photo Upload and Preview */}
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-200 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 shrink-0">
                    <img
                      src={memberAvatarPreview || editingMember?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-[#167D78] hover:bg-[#102B3F] text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#D6F36A]" />
                      <span>{language === 'bn' ? 'নতুন ছবি আপলোড' : 'Upload Photo'}</span>
                    </button>
                    <input
                      type="file"
                      ref={photoInputRef}
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <input
                      type="text"
                      name="avatarUrl"
                      value={memberAvatarPreview || editingMember?.avatar || ''}
                      onChange={(e) => setMemberAvatarPreview(e.target.value)}
                      placeholder={language === 'bn' ? 'বা ছবির লিংক পেস্ট করুন...' : 'Or paste image URL...'}
                      className="w-full px-2.5 py-1 text-xs rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Approval Status Selector */}
              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  {language === 'bn' ? 'অনুমোদন স্ট্যাটাস (Approval Status)' : 'Approval Status'} *
                </label>
                <select
                  name="approvalStatus"
                  defaultValue={editingMember?.approvalStatus || 'approved'}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white font-bold cursor-pointer"
                >
                  <option value="approved">✅ {language === 'bn' ? 'অনুমোদিত ও ওয়েবসাইটে সক্রিয় (Approved & Live)' : 'Approved & Live'}</option>
                  <option value="pending">⏳ {language === 'bn' ? 'অনুমোদন অপেক্ষমাণ (Pending Approval)' : 'Pending Approval'}</option>
                  <option value="rejected">❌ {language === 'bn' ? 'স্থগিত / বাতিল (Rejected)' : 'Rejected'}</option>
                </select>
              </div>

              {/* Membership ID */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    {language === 'bn' ? 'সদস্য আইডি (Membership ID - ইউনিক)' : 'Membership ID (Unique)'} *
                  </label>
                  <span className="text-[10px] text-stone-400 font-mono">যেমন: CLF-GM-114</span>
                </div>
                <input
                  type="text"
                  name="membershipId"
                  defaultValue={editingMember?.membershipId || `CLF-GM-${100 + generalMembers.length + 1}`}
                  required
                  placeholder="CLF-GM-XXX"
                  className="w-full px-3 py-2 text-xs font-mono font-bold uppercase rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {language === 'bn' ? 'নাম (বাংলা)' : 'Name (Bangla)'} *
                  </label>
                  <input
                    type="text"
                    name="nameBn"
                    defaultValue={editingMember?.nameBn || ''}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {language === 'bn' ? 'নাম (English)' : 'Name (English)'}
                  </label>
                  <input
                    type="text"
                    name="nameEn"
                    defaultValue={editingMember?.nameEn || ''}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {language === 'bn' ? 'রক্তের গ্রুপ' : 'Blood Group'} *
                  </label>
                  <select
                    name="bloodGroup"
                    defaultValue={editingMember?.bloodGroup || 'O+'}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white cursor-pointer"
                  >
                    {bloodGroups.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {language === 'bn' ? 'নিজ জেলা' : 'District'} *
                  </label>
                  <input
                    type="text"
                    name="district"
                    defaultValue={editingMember?.district || 'মৌলভীবাজার'}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {language === 'bn' ? 'দায়িত্ব / পদবি (বাংলা)' : 'Role / Designation'}
                  </label>
                  <input
                    type="text"
                    name="roleBn"
                    defaultValue={editingMember?.roleBn || 'সাধারণ সদস্য'}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {language === 'bn' ? 'লগইন পাসওয়ার্ড (Reset)' : 'Login Password'}
                  </label>
                  <input
                    type="text"
                    name="password"
                    defaultValue={editingMember?.password || 'member123'}
                    placeholder="সদস্যের পাসওয়ার্ড"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {language === 'bn' ? 'মোবাইল নম্বর' : 'Phone'}
                  </label>
                  <input
                    type="text"
                    name="phone"
                    defaultValue={editingMember?.phone || ''}
                    placeholder="01711-XXXXXX"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {language === 'bn' ? 'ইমেইল অ্যাড্রেস' : 'Email'}
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingMember?.email || ''}
                    placeholder="member@colash.org"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {language === 'bn' ? 'উপজেলা ও ঠিকানা' : 'Address'}
                  </label>
                  <input
                    type="text"
                    name="address"
                    defaultValue={editingMember?.address || ''}
                    placeholder="কমলগঞ্জ, মৌলভীবাজার"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {language === 'bn' ? 'পেশা / কর্মসংস্থান' : 'Profession'}
                  </label>
                  <input
                    type="text"
                    name="profession"
                    defaultValue={editingMember?.profession || ''}
                    placeholder="যেমন: সমাজকর্মী / শিক্ষক"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setIdError(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#167D78] hover:bg-[#126863] rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Member'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
