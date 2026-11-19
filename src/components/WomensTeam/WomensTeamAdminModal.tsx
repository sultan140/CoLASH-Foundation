import React, { useState } from 'react';
import {
  X,
  Sliders,
  Upload,
  Plus,
  Trash2,
  Edit,
  Save,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Users,
  FileText,
  Calendar,
  Lock,
  RotateCcw,
  Eye,
  LogOut,
  Key,
  Crown,
  UserPlus,
  Check,
  UserCheck
} from 'lucide-react';
import {
  WomensTeamConfig,
  WomensTeamMember,
  WomensTeamActivity,
  WomensTeamDocument,
  WomensTeamNotice,
  Language,
  AdminUser
} from '../../types';
import { DEFAULT_WOMENS_TEAM_LOGO } from '../../data/womensTeamData';
import { compressImageFile } from '../../utils/imageCompressor';

interface WomensTeamAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: WomensTeamConfig;
  onUpdateConfig: (newConfig: WomensTeamConfig) => void;
  members: WomensTeamMember[];
  onUpdateMembers: (newMembers: WomensTeamMember[]) => void;
  activities: WomensTeamActivity[];
  onUpdateActivities: (newActivities: WomensTeamActivity[]) => void;
  documents: WomensTeamDocument[];
  onUpdateDocuments: (newDocs: WomensTeamDocument[]) => void;
  notices: WomensTeamNotice[];
  onUpdateNotices: (newNotices: WomensTeamNotice[]) => void;
  adminUsers?: AdminUser[];
  onUpdateAdmin?: (updatedAdmin: AdminUser) => void;
  onCreateAdmin?: (newAdmin: AdminUser) => void;
  onUpdateAdminPassword?: (id: string, newPass: string) => void;
  language: Language;
  onToast: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
}

export const WomensTeamAdminModal: React.FC<WomensTeamAdminModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  members,
  onUpdateMembers,
  activities,
  onUpdateActivities,
  documents,
  onUpdateDocuments,
  notices,
  onUpdateNotices,
  adminUsers = [],
  onUpdateAdmin,
  onCreateAdmin,
  onUpdateAdminPassword,
  language,
  onToast
}) => {
  // Admin authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLeader, setAuthLeader] = useState<AdminUser | null>(null);
  const [adminPass, setAdminPass] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Active admin tab
  const [adminTab, setAdminTab] = useState<'logo' | 'members' | 'activities' | 'documents' | 'notices' | 'leader' | 'security'>('logo');
  const [newLeaderPass, setNewLeaderPass] = useState('');
  const [confirmLeaderPass, setConfirmLeaderPass] = useState('');

  // Leader Management state
  const [leaderChangeMode, setLeaderChangeMode] = useState<'existing' | 'new'>('existing');
  const [selectedLeaderMemberId, setSelectedLeaderMemberId] = useState('');
  const [leaderNameInputBn, setLeaderNameInputBn] = useState('');
  const [leaderNameInputEn, setLeaderNameInputEn] = useState('');
  const [leaderEmailInput, setLeaderEmailInput] = useState('');
  const [leaderPhoneInput, setLeaderPhoneInput] = useState('');
  const [leaderPhotoInput, setLeaderPhotoInput] = useState('');
  const [leaderPassInput, setLeaderPassInput] = useState('');
  const [leaderBioInput, setLeaderBioInput] = useState('');

  const currentLeaderAdmin = adminUsers.find(u => u.role === 'womens_team_leader');
  const currentLeaderMember = members.find(m => m.roleType === 'president') || members[0];

  // Logo manager state
  const [logoInputUrl, setLogoInputUrl] = useState(config.logoUrl);
  const [mottoInputBn, setMottoInputBn] = useState(config.mottoBn);
  const [mottoInputEn, setMottoInputEn] = useState(config.mottoEn);

  // Member form state
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberNameBn, setNewMemberNameBn] = useState('');
  const [newMemberNameEn, setNewMemberNameEn] = useState('');
  const [newMemberDesigBn, setNewMemberDesigBn] = useState('');
  const [newMemberDesigEn, setNewMemberDesigEn] = useState('');
  const [newMemberRoleType, setNewMemberRoleType] = useState<WomensTeamMember['roleType']>('member');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberPhoto, setNewMemberPhoto] = useState('');
  const [newMemberBio, setNewMemberBio] = useState('');
  const [newMemberDistrict, setNewMemberDistrict] = useState('মৌলভীবাজার');
  const [newMemberBlood, setNewMemberBlood] = useState('O+');
  const [newMemberDuties, setNewMemberDuties] = useState('');

  // Activity form state
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [newActTitleBn, setNewActTitleBn] = useState('');
  const [newActCategory, setNewActCategory] = useState<WomensTeamActivity['category']>('hygiene');
  const [newActLocation, setNewActLocation] = useState('কমলগঞ্জ, মৌলভীবাজার');
  const [newActBeneficiaries, setNewActBeneficiaries] = useState(250);
  const [newActImage, setNewActImage] = useState('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=80');
  const [newActDesc, setNewActDesc] = useState('');

  // Document form state
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [newDocTitleBn, setNewDocTitleBn] = useState('');
  const [newDocTitleEn, setNewDocTitleEn] = useState('');
  const [newDocType, setNewDocType] = useState<WomensTeamDocument['type']>('meeting_minutes');
  const [newDocDesc, setNewDocDesc] = useState('');
  const [newDocContent, setNewDocContent] = useState('');

  // Notice form state
  const [isAddingNotice, setIsAddingNotice] = useState(false);
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeBody, setNewNoticeBody] = useState('');
  const [newNoticePriority, setNewNoticePriority] = useState<'urgent' | 'general'>('general');
  const [newNoticeSigner, setNewNoticeSigner] = useState('সাধারণ সম্পাদক, উইমেন্স টিম');

  // Close on Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const pass = adminPass.trim();

    // Check if matches default key
    if (pass === 'womensadmin2026' || pass === 'admin123') {
      setIsAuthenticated(true);
      setAuthError(null);
      const defaultLeader = adminUsers.find(u => u.role === 'womens_team_leader') || null;
      setAuthLeader(defaultLeader);
      onToast('success', language === 'bn' ? 'উইমেন্স টিম কন্ট্রোল প্যানেলে স্বাগতম' : 'Admin Authenticated', 'CoLASH Women’s Team Leader');
      return;
    }

    // Check if matches an authorized AdminUser from system
    const matchedAdmin = adminUsers.find(
      u => u.isActive && (u.role === 'womens_team_leader' || u.role === 'super_admin' || u.permissions.canManageWomensTeam) &&
           u.password === pass
    );

    if (matchedAdmin) {
      setIsAuthenticated(true);
      setAuthLeader(matchedAdmin);
      setAuthError(null);
      onToast('success', language === 'bn' ? 'স্বাগতম!' : 'Welcome Back!', `${matchedAdmin.name} (${matchedAdmin.roleTitleBn})`);
    } else {
      setAuthError(language === 'bn' ? 'ভুল পাসওয়ার্ড। (ডিফল্ট: womensadmin2026)' : 'Invalid password. (Default: womensadmin2026)');
    }
  };

  const handleChangeLeaderPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeaderPass.trim() || newLeaderPass.length < 6) {
      onToast('error', language === 'bn' ? 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' : 'Password must be at least 6 characters');
      return;
    }
    if (newLeaderPass !== confirmLeaderPass) {
      onToast('error', language === 'bn' ? 'পাসওয়ার্ড দুটি মেলেনি' : 'Passwords do not match');
      return;
    }

    if (authLeader && onUpdateAdminPassword) {
      onUpdateAdminPassword(authLeader.id, newLeaderPass);
    }
    setNewLeaderPass('');
    setConfirmLeaderPass('');
    onToast(
      'success',
      language === 'bn' ? 'টিম লিডার পাসওয়ার্ড সফলভাবে সংরক্ষিত হয়েছে' : 'Password Updated',
      language === 'bn' ? 'পরবর্তী লগইনে এই নতুন পাসওয়ার্ড ব্যবহার করুন।' : 'Use your new password on next login.'
    );
  };

  const handleApproveMember = (memberId: string) => {
    const updated = members.map(m => m.id === memberId ? { ...m, status: 'active' as const } : m);
    onUpdateMembers(updated);
    onToast('success', language === 'bn' ? 'সদস্য অনুমোদন সফল হয়েছে' : 'Member Approved');
  };

  const handleSaveLeaderAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    let finalNameBn = leaderNameInputBn.trim();
    let finalNameEn = leaderNameInputEn.trim();
    let finalEmail = leaderEmailInput.trim();
    let finalPhone = leaderPhoneInput.trim();
    let finalPhoto = leaderPhotoInput.trim() || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80';
    let finalPass = leaderPassInput.trim() || currentLeaderAdmin?.password || 'womensadmin2026';
    let finalBio = leaderBioInput.trim();

    if (leaderChangeMode === 'existing') {
      const mem = members.find(m => m.id === selectedLeaderMemberId);
      if (!mem) {
        onToast('error', language === 'bn' ? 'অনুগ্রহ করে একজন সদস্য নির্বাচন করুন' : 'Select a member');
        return;
      }
      finalNameBn = mem.nameBn;
      finalNameEn = mem.nameEn;
      finalEmail = mem.email || `${mem.nameEn.toLowerCase().replace(/\s+/g, '.')}@colash.org`;
      finalPhone = mem.phone;
      finalPhoto = mem.photoUrl || finalPhoto;
      finalBio = mem.bioBn || finalBio;
    }

    if (!finalNameBn) {
      onToast('error', language === 'bn' ? 'টিম লিডারের নাম আবশ্যক' : 'Leader name is required');
      return;
    }

    // 1. Update/Create admin user
    const leaderAdminId = currentLeaderAdmin ? currentLeaderAdmin.id : `adm-womens-${Date.now()}`;
    const newAdminObj: AdminUser = {
      id: leaderAdminId,
      name: finalNameBn,
      email: finalEmail || 'womensadmin@colash.org',
      phone: finalPhone || '01711-000000',
      password: finalPass,
      role: 'womens_team_leader',
      roleTitleBn: 'উইমেন্স টিম লিডার ও অ্যাডমিন',
      roleTitleEn: "Women's Team Leader & Admin",
      avatar: finalPhoto,
      isActive: true,
      createdAt: currentLeaderAdmin ? currentLeaderAdmin.createdAt : new Date().toISOString().split('T')[0],
      lastLogin: 'হালনাগাদ করা হয়েছে',
      permissions: {
        canViewMembers: true,
        canAddMembers: true,
        canEditMembers: true,
        canDeleteMembers: true,
        canVerifyDonations: false,
        canManageProjects: false,
        canManageNotices: true,
        canManageFiles: true,
        canManageWomensTeam: true,
        canManageSettings: false,
        canManageAdmins: false
      }
    };

    if (currentLeaderAdmin && onUpdateAdmin) {
      onUpdateAdmin(newAdminObj);
    } else if (onCreateAdmin) {
      onCreateAdmin(newAdminObj);
    }

    // 2. Synchronize committee members
    let updatedMembers = [...members];
    if (leaderChangeMode === 'existing') {
      updatedMembers = updatedMembers.map(m => {
        if (m.id === selectedLeaderMemberId) {
          return {
            ...m,
            roleType: 'president' as const,
            designationBn: 'টিম লিডার ও সভাপতি',
            designationEn: 'Team Leader & President',
            email: finalEmail || m.email,
            phone: finalPhone || m.phone,
            password: finalPass,
            photoUrl: finalPhoto || m.photoUrl,
            status: 'active' as const
          };
        } else if (m.roleType === 'president') {
          return {
            ...m,
            roleType: 'advisor' as const,
            designationBn: 'উপদেষ্টা ও সাবেক সভাপতি',
            designationEn: 'Advisor & Former President'
          };
        }
        return m;
      });
    } else {
      const existIdx = updatedMembers.findIndex(m => m.nameBn === finalNameBn || (finalEmail && m.email === finalEmail));
      if (existIdx >= 0) {
        updatedMembers[existIdx] = {
          ...updatedMembers[existIdx],
          nameBn: finalNameBn,
          nameEn: finalNameEn || finalNameBn,
          roleType: 'president',
          designationBn: 'টিম লিডার ও সভাপতি',
          designationEn: 'Team Leader & President',
          email: finalEmail,
          phone: finalPhone,
          password: finalPass,
          photoUrl: finalPhoto,
          status: 'active' as const
        };
      } else {
        const newWtm: WomensTeamMember = {
          id: `wtm-lead-${Date.now()}`,
          nameBn: finalNameBn,
          nameEn: finalNameEn || finalNameBn,
          designationBn: 'টিম লিডার ও সভাপতি',
          designationEn: 'Team Leader & President',
          roleType: 'president',
          membershipId: `CLF-WT-${100 + members.length + 1}`,
          phone: finalPhone,
          email: finalEmail,
          password: finalPass,
          photoUrl: finalPhoto,
          bioBn: finalBio || 'কোলাশ ফাউন্ডেশন উইমেন্স টিমের নীতিনির্ধারণ ও সার্বিক কার্যক্রমে নিয়োজিত।',
          bioEn: 'Leads Women’s Wing strategic operations and grassroots empowerment.',
          joinedDate: new Date().toISOString().split('T')[0],
          district: 'মৌলভীবাজার',
          bloodGroup: 'O+',
          responsibilities: [
            'উইমেন্স টিমের সার্বিক পরিচালনা ও নীতি নির্ধারণ',
            'মাসিক নির্বাহী সমন্বয় সভা পরিচালনা'
          ],
          status: 'active'
        };
        updatedMembers = updatedMembers.map(m => m.roleType === 'president' ? { ...m, roleType: 'advisor' as const, designationBn: 'উপদেষ্টা ও সাবেক সভাপতি', designationEn: 'Advisor & Former President' } : m);
        updatedMembers.unshift(newWtm);
      }
    }

    onUpdateMembers(updatedMembers);
    onToast(
      'success',
      language === 'bn' ? 'উইমেন্স টিম লিডার সফলভাবে নিযুক্ত করা হয়েছে!' : 'Team Leader Appointed!',
      `${finalNameBn} (${finalEmail})`
    );
  };

  // Logo File Upload handler with WebP compression
  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      onToast('error', language === 'bn' ? 'ফাইলের আকার ৫MB এর বেশি' : 'File too large (>5MB)');
      return;
    }
    try {
      const compressed = await compressImageFile(file, {
        maxWidth: 600,
        maxHeight: 600,
        quality: 0.82,
        format: 'image/webp'
      });
      setLogoInputUrl(compressed.dataUrl);
      const updated = { ...config, logoUrl: compressed.dataUrl };
      onUpdateConfig(updated);
      onToast('success', language === 'bn' ? 'নতুন লোগো আপলোড ও সংরক্ষিত হয়েছে' : 'Logo Uploaded & Saved');
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setLogoInputUrl(result);
        const updated = { ...config, logoUrl: result };
        onUpdateConfig(updated);
        onToast('success', language === 'bn' ? 'নতুন লোগো আপলোড সম্পন্ন হয়েছে' : 'Logo Uploaded');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: WomensTeamConfig = {
      ...config,
      logoUrl: logoInputUrl,
      mottoBn: mottoInputBn,
      mottoEn: mottoInputEn
    };
    onUpdateConfig(updated);
    onToast('success', language === 'bn' ? 'ব্র্যান্ডিং ও লোগো সংরক্ষিত হয়েছে' : 'Branding & Logo Saved');
  };

  const handleResetLogo = () => {
    setLogoInputUrl(DEFAULT_WOMENS_TEAM_LOGO);
    const updated = { ...config, logoUrl: DEFAULT_WOMENS_TEAM_LOGO };
    onUpdateConfig(updated);
    onToast('info', language === 'bn' ? 'ডিফল্ট লোগোতে পুনঃস্থাপন করা হয়েছে' : 'Reset to Default Logo');
  };

  // Member management
  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberNameBn.trim() || !newMemberDesigBn.trim()) {
      onToast('error', language === 'bn' ? 'সদস্যের নাম ও পদবি প্রদান করুন' : 'Provide Name & Designation');
      return;
    }

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const newMember: WomensTeamMember = {
      id: `wtm-${Date.now()}`,
      nameBn: newMemberNameBn.trim(),
      nameEn: newMemberNameEn.trim() || newMemberNameBn.trim(),
      designationBn: newMemberDesigBn.trim(),
      designationEn: newMemberDesigEn.trim() || newMemberDesigBn.trim(),
      roleType: newMemberRoleType,
      membershipId: `CLF-WT-${randomSuffix}`,
      phone: newMemberPhone.trim() || '01646-475348',
      email: newMemberEmail.trim() || `member${randomSuffix}@colash.org`,
      photoUrl: newMemberPhoto.trim() || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      bioBn: newMemberBio.trim() || 'কোলাশ ফাউন্ডেশন উইমেন্স টিমের নিবেদিতপ্রাণ সদস্য।',
      bioEn: 'Dedicated executive member of CoLASH Women’s Team.',
      joinedDate: new Date().toISOString().split('T')[0],
      district: newMemberDistrict,
      bloodGroup: newMemberBlood,
      responsibilities: newMemberDuties.split('\n').filter(Boolean),
      status: 'active'
    };

    const updated = [newMember, ...members];
    onUpdateMembers(updated);
    setIsAddingMember(false);
    setNewMemberNameBn('');
    setNewMemberNameEn('');
    setNewMemberDesigBn('');
    setNewMemberDesigEn('');
    setNewMemberPhone('');
    setNewMemberEmail('');
    setNewMemberPhoto('');
    setNewMemberBio('');
    setNewMemberDuties('');
    onToast('success', language === 'bn' ? 'নতুন সদস্য সফলভাবে যুক্ত হয়েছে' : 'Member Added', newMember.nameBn);
  };

  const handleDeleteMember = (id: string, name: string) => {
    if (confirm(language === 'bn' ? `আপনি কি নিশ্চিতভাবে ${name}-কে কমিটি থেকে বাদ দিতে চান?` : `Remove ${name} from committee?`)) {
      const updated = members.filter((m) => m.id !== id);
      onUpdateMembers(updated);
      onToast('info', language === 'bn' ? 'সদস্য তালিকা থেকে বাদ দেওয়া হয়েছে' : 'Member Removed', name);
    }
  };

  // Activity management
  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActTitleBn.trim()) return;

    const newAct: WomensTeamActivity = {
      id: `wact-${Date.now()}`,
      titleBn: newActTitleBn.trim(),
      titleEn: newActTitleBn.trim(),
      date: new Date().toISOString().split('T')[0],
      locationBn: newActLocation.trim(),
      locationEn: newActLocation.trim(),
      beneficiariesCount: Number(newActBeneficiaries) || 100,
      image: newActImage.trim(),
      category: newActCategory,
      descriptionBn: newActDesc.trim(),
      descriptionEn: newActDesc.trim(),
      status: 'completed'
    };

    onUpdateActivities([newAct, ...activities]);
    setIsAddingActivity(false);
    setNewActTitleBn('');
    setNewActDesc('');
    onToast('success', language === 'bn' ? 'নতুন কার্যক্রম প্রকাশিত হয়েছে' : 'Activity Added');
  };

  const handleDeleteActivity = (id: string) => {
    onUpdateActivities(activities.filter((a) => a.id !== id));
    onToast('info', language === 'bn' ? 'কার্যক্রম মুছে ফেলা হয়েছে' : 'Activity Deleted');
  };

  // Document / Minutes management
  const handleSaveDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitleBn.trim()) return;

    const newDoc: WomensTeamDocument = {
      id: `wdoc-${Date.now()}`,
      titleBn: newDocTitleBn.trim(),
      titleEn: newDocTitleEn.trim() || newDocTitleBn.trim(),
      type: newDocType,
      date: new Date().toISOString().split('T')[0],
      fileSize: '1.2 MB',
      descriptionBn: newDocDesc.trim(),
      descriptionEn: newDocDesc.trim(),
      contentSnippet: newDocContent.trim(),
      isRestrictedToMembers: true
    };

    onUpdateDocuments([newDoc, ...documents]);
    setIsAddingDoc(false);
    setNewDocTitleBn('');
    setNewDocTitleEn('');
    setNewDocDesc('');
    setNewDocContent('');
    onToast('success', language === 'bn' ? 'নতুন কার্যবিবরণী সংরক্ষিত হয়েছে' : 'Minutes Published');
  };

  const handleDeleteDoc = (id: string) => {
    onUpdateDocuments(documents.filter((d) => d.id !== id));
    onToast('info', language === 'bn' ? 'নথি মুছে ফেলা হয়েছে' : 'Document Deleted');
  };

  // Notice management
  const handleSaveNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle.trim() || !newNoticeBody.trim()) return;

    const newNot: WomensTeamNotice = {
      id: `wnot-${Date.now()}`,
      titleBn: newNoticeTitle.trim(),
      titleEn: newNoticeTitle.trim(),
      date: new Date().toISOString().split('T')[0],
      priority: newNoticePriority,
      bodyBn: newNoticeBody.trim(),
      bodyEn: newNoticeBody.trim(),
      signedBy: newNoticeSigner.trim()
    };

    onUpdateNotices([newNot, ...notices]);
    setIsAddingNotice(false);
    setNewNoticeTitle('');
    setNewNoticeBody('');
    onToast('success', language === 'bn' ? 'নতুন নোটিশ জারি হয়েছে' : 'Notice Issued');
  };

  const handleDeleteNotice = (id: string) => {
    onUpdateNotices(notices.filter((n) => n.id !== id));
    onToast('info', language === 'bn' ? 'নোটিশ মুছে ফেলা হয়েছে' : 'Notice Deleted');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-[#0c1a24] max-w-4xl w-full rounded-3xl border border-rose-300 dark:border-rose-900 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-stone-900 via-[#102B3F] to-rose-950 text-white flex items-center justify-between border-b border-rose-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300">
                  {language === 'bn' ? 'উইমেন্স টিম কন্ট্রোল প্যানেল' : "Women's Team Control Panel"}
                </span>
                {isAuthenticated && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500 text-white text-[9px] font-bold">
                    ADMIN
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-bold">
                {language === 'bn' ? 'স্বতন্ত্র উইমেন্স টিম অ্যাডমিন প্যানেল' : "Autonomous Women's Team Admin"}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={() => setIsAuthenticated(false)}
                className="px-2.5 py-1 text-xs text-stone-300 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'লক' : 'Lock'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-black/40 hover:bg-black/60 text-white transition-all cursor-pointer shadow-xs hover:scale-105 flex items-center justify-center shrink-0"
              aria-label="Close"
              title={language === 'bn' ? 'বন্ধ করুন (Close)' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          
          {!isAuthenticated ? (
            /* Admin Password Gate */
            <div className="max-w-sm mx-auto py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 mx-auto flex items-center justify-center shadow-xs">
                <Lock className="w-7 h-7" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-[#102B3F] dark:text-white">
                  {language === 'bn' ? 'অ্যাডমিন নিরাপত্তা কোড' : 'Enter Admin Password'}
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  {language === 'bn' ? 'লোগো, কমিটি ও ফাইল পরিচালনার জন্য অ্যাডমিন কোড দিন।' : 'Authorized access only to manage logo, committee, and records.'}
                </p>
              </div>

              {authError && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleAdminLogin} className="space-y-3">
                <input
                  type="password"
                  required
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  placeholder="পাসওয়ার্ড দিন (womensadmin2026)"
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-center text-sm font-mono tracking-widest focus:outline-hidden focus:border-rose-500"
                />

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer transition-colors"
                >
                  {language === 'bn' ? 'প্যানেল আনলক করুন' : 'Unlock Panel'}
                </button>
              </form>

              <span className="text-[11px] text-stone-400 block pt-2">
                ডিফল্ট পাসওয়ার্ড: <code className="bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded text-rose-600">womensadmin2026</code>
              </span>
            </div>
          ) : (
            /* Admin Management Tabs */
            <div className="space-y-6">
              
              {/* Tabs Switcher */}
              <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-3">
                <button
                  onClick={() => setAdminTab('logo')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
                    adminTab === 'logo'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'লোগো ও পরিচিতি' : 'Logo & Branding'}</span>
                </button>

                <button
                  onClick={() => setAdminTab('members')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
                    adminTab === 'members'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? `কমিটি ও সদস্য (${members.length})` : `Members (${members.length})`}</span>
                </button>

                <button
                  onClick={() => setAdminTab('activities')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
                    adminTab === 'activities'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? `কার্যক্রম (${activities.length})` : `Activities (${activities.length})`}</span>
                </button>

                <button
                  onClick={() => setAdminTab('documents')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
                    adminTab === 'documents'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? `কার্যবিবরণী ও ফাইল (${documents.length})` : `Files (${documents.length})`}</span>
                </button>

                <button
                  onClick={() => setAdminTab('notices')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
                    adminTab === 'notices'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? `নোটিশ বোর্ড (${notices.length})` : `Notices (${notices.length})`}</span>
                </button>

                <button
                  onClick={() => setAdminTab('leader')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
                    adminTab === 'leader'
                      ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? '🌸 টিম লিডার নিয়োগ ও পরিবর্তন' : 'Leader Appointment'}</span>
                </button>

                <button
                  onClick={() => setAdminTab('security')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
                    adminTab === 'security'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'টিম লিডার পাসওয়ার্ড' : 'Leader Password'}</span>
                </button>
              </div>

              {/* 1. LOGO & BRANDING MANAGER */}
              {adminTab === 'logo' && (
                <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60">
                    <h4 className="text-sm font-bold text-[#102B3F] dark:text-white mb-1">
                      {language === 'bn' ? 'উইমেন্স টিমের নিজস্ব লোগো ব্যবস্থাপনা' : "Women's Team Logo & Branding"}
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-stone-300">
                      {language === 'bn'
                        ? 'আপনার পিসি বা মোবাইল থেকে সরাসরি লোগো ইমেজ আপলোড করুন অথবা কোনো অনলাইন ইমেজ লিংক বসিয়ে সংরক্ষণ করুন।'
                        : 'Upload an image file or provide an external image URL to change the Women’s Team logo across all pages.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    
                    {/* Logo Preview */}
                    <div className="md:col-span-4 p-5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex flex-col items-center text-center">
                      <span className="text-[10px] font-bold uppercase text-stone-400 mb-3">
                        {language === 'bn' ? 'বর্তমান লোগো প্রিভিউ' : 'Current Logo Preview'}
                      </span>
                      <div className="w-32 h-32 rounded-2xl bg-white p-2 border-2 border-rose-500 shadow-md flex items-center justify-center overflow-hidden mb-3">
                        <img
                          src={logoInputUrl}
                          alt="Women Team Logo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleResetLogo}
                        className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>{language === 'bn' ? 'ডিফল্ট প্রতীকে রিসেট' : 'Reset to Default'}</span>
                      </button>
                    </div>

                    {/* Logo Upload Form */}
                    <form onSubmit={handleSaveBranding} className="md:col-span-8 space-y-4">
                      
                      {/* Direct File Upload */}
                      <div>
                        <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                          {language === 'bn' ? 'ফাইল থেকে সরাসরি আপলোড (JPG / PNG / SVG)' : 'Direct File Upload (PNG/JPG/SVG)'}
                        </label>
                        <div className="flex items-center gap-2">
                          <label className="flex-1 p-2.5 bg-stone-50 dark:bg-stone-900 border border-dashed border-rose-400 dark:border-rose-600 rounded-xl text-xs text-stone-600 dark:text-stone-300 cursor-pointer hover:bg-rose-50/50 flex items-center justify-center gap-2">
                            <Upload className="w-4 h-4 text-rose-500" />
                            <span>{language === 'bn' ? 'লোগো ফাইল নির্বাচন করুন...' : 'Select Logo File...'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      {/* URL input */}
                      <div>
                        <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                          {language === 'bn' ? 'অথবা লোগো ইমেজ ইউআরএল (Image URL)' : 'Or Image URL'}
                        </label>
                        <input
                          type="text"
                          value={logoInputUrl}
                          onChange={(e) => setLogoInputUrl(e.target.value)}
                          placeholder="https://example.com/logo.png"
                          className="w-full p-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-mono text-stone-800 dark:text-stone-100"
                        />
                      </div>

                      {/* Motto */}
                      <div>
                        <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                          {language === 'bn' ? 'উইমেন্স টিমের অফিসিয়াল স্লোগান' : 'Official Slogan'}
                        </label>
                        <input
                          type="text"
                          value={mottoInputBn}
                          onChange={(e) => setMottoInputBn(e.target.value)}
                          className="w-full p-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-800 dark:text-stone-100"
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        <span>{language === 'bn' ? 'লোগো ও তথ্য সংরক্ষণ করুন' : 'Save Logo & Info'}</span>
                      </button>

                    </form>

                  </div>
                </div>
              )}

              {/* 2. MEMBERS & COMMITTEE MANAGER */}
              {adminTab === 'members' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[#102B3F] dark:text-white">
                        {language === 'bn' ? 'পরিচালনা কমিটি ও সদস্য তালিকা' : 'Executive Leadership & Members'}
                      </h4>
                      <p className="text-xs text-stone-400">
                        {language === 'bn' ? 'কমিটির সদস্য সংযোজন, পদবি পরিবর্তন ও অপসারণ করুন।' : 'Add, edit or remove committee officers and members.'}
                      </p>
                    </div>

                    <button
                      onClick={() => setIsAddingMember(!isAddingMember)}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      {isAddingMember ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      <span>{isAddingMember ? (language === 'bn' ? 'বাতিল' : 'Cancel') : (language === 'bn' ? 'নতুন সদস্য যোগ' : 'Add Member')}</span>
                    </button>
                  </div>

                  {/* Add Member Form Drawer */}
                  {isAddingMember && (
                    <form onSubmit={handleSaveMember} className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-rose-200 dark:border-rose-900/60 space-y-4 animate-fade-in">
                      <span className="text-xs font-bold uppercase text-rose-600 block">
                        {language === 'bn' ? 'নতুন সদস্য ফরম' : 'New Member Registration Form'}
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">নাম (বাংলা) *</label>
                          <input
                            type="text"
                            required
                            value={newMemberNameBn}
                            onChange={(e) => setNewMemberNameBn(e.target.value)}
                            placeholder="যেমন: ফাতেমা আক্তার"
                            className="w-full p-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">নাম (English)</label>
                          <input
                            type="text"
                            value={newMemberNameEn}
                            onChange={(e) => setNewMemberNameEn(e.target.value)}
                            placeholder="e.g. Fatema Akter"
                            className="w-full p-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">পদবি (বাংলা) *</label>
                          <input
                            type="text"
                            required
                            value={newMemberDesigBn}
                            onChange={(e) => setNewMemberDesigBn(e.target.value)}
                            placeholder="যেমন: প্রচার সম্পাদক / সদস্য"
                            className="w-full p-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">পদবি (English)</label>
                          <input
                            type="text"
                            value={newMemberDesigEn}
                            onChange={(e) => setNewMemberDesigEn(e.target.value)}
                            placeholder="e.g. Publicity Secretary"
                            className="w-full p-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">মোবাইল নম্বর</label>
                          <input
                            type="text"
                            value={newMemberPhone}
                            onChange={(e) => setNewMemberPhone(e.target.value)}
                            placeholder="017XX-XXXXXX"
                            className="w-full p-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg font-mono"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">ইমেইল ঠিকানা</label>
                          <input
                            type="email"
                            value={newMemberEmail}
                            onChange={(e) => setNewMemberEmail(e.target.value)}
                            placeholder="member@colash.org"
                            className="w-full p-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg font-mono"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">জেলা / উপজেলা</label>
                          <input
                            type="text"
                            value={newMemberDistrict}
                            onChange={(e) => setNewMemberDistrict(e.target.value)}
                            placeholder="মৌলভীবাজার"
                            className="w-full p-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">রক্তের গ্রুপ</label>
                          <select
                            value={newMemberBlood}
                            onChange={(e) => setNewMemberBlood(e.target.value)}
                            className="w-full p-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg"
                          >
                            {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(b => (
                              <option key={b} value={b}>{b}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-stone-700 dark:text-stone-300 text-xs block mb-1">ছবির লিংক (Photo URL)</label>
                        <input
                          type="text"
                          value={newMemberPhoto}
                          onChange={(e) => setNewMemberPhoto(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full p-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-stone-700 dark:text-stone-300 text-xs block mb-1">পরিচিতি ও ভূমিকা (Bio)</label>
                        <textarea
                          rows={2}
                          value={newMemberBio}
                          onChange={(e) => setNewMemberBio(e.target.value)}
                          placeholder="সদস্যের ভূমিকা ও সামাজিক অবদান..."
                          className="w-full p-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-stone-700 dark:text-stone-300 text-xs block mb-1">অর্পিত দায়িত্বসমূহ (প্রতি লাইনে একটি)</label>
                        <textarea
                          rows={2}
                          value={newMemberDuties}
                          onChange={(e) => setNewMemberDuties(e.target.value)}
                          placeholder="দায়িত্ব ১&#10;দায়িত্ব ২"
                          className="w-full p-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs"
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingMember(false)}
                          className="px-3 py-1.5 rounded-lg bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold"
                        >
                          বাতিল
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                        >
                          সংরক্ষণ করুন
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Members Roster List */}
                  <div className="space-y-2">
                    {members.map((m) => {
                      const isPending = m.status === 'pending';
                      const isLeader = m.roleType === 'president';

                      return (
                        <div
                          key={m.id}
                          className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
                            isPending
                              ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                              : 'bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={m.photoUrl}
                              alt={m.nameBn}
                              className="w-10 h-10 rounded-lg object-cover border border-rose-300 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-stone-900 dark:text-white flex items-center flex-wrap gap-1.5">
                                <span>{m.nameBn}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  isLeader
                                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                                    : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                                }`}>
                                  {isLeader ? '👑 ' : ''}{m.designationBn}
                                </span>
                                {isPending && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 text-[9px] font-bold animate-pulse">
                                    ⏳ অনুমোদনের অপেক্ষায়
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] font-mono text-stone-400 mt-0.5">
                                {m.membershipId} · {m.district || 'মৌলভীবাজার'} · {m.phone}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 self-end sm:self-center">
                            {isPending && (
                              <button
                                type="button"
                                onClick={() => handleApproveMember(m.id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-xs transition-colors"
                                title="সদস্যপদ অনুমোদন করুন"
                              >
                                <Check className="w-3 h-3" />
                                <span>অনুমোদন করুন</span>
                              </button>
                            )}

                            {!isLeader && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedLeaderMemberId(m.id);
                                  setLeaderChangeMode('existing');
                                  setAdminTab('leader');
                                }}
                                className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                                title="এই সদস্যকে টিম লিডার বানান"
                              >
                                <Crown className="w-3 h-3 text-amber-500" />
                                <span>লিডার বানান</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteMember(m.id, m.nameBn)}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
                              title="সদস্য মুছে ফেলুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}

              {/* 3. ACTIVITIES MANAGER */}
              {adminTab === 'activities' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#102B3F] dark:text-white">
                      {language === 'bn' ? 'উইমেন্স টিমের কার্যক্রম ও ইভেন্ট' : 'Activities & Campaigns'}
                    </h4>
                    <button
                      onClick={() => setIsAddingActivity(!isAddingActivity)}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      {isAddingActivity ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      <span>{isAddingActivity ? 'বাতিল' : 'নতুন কার্যক্রম যোগ'}</span>
                    </button>
                  </div>

                  {isAddingActivity && (
                    <form onSubmit={handleSaveActivity} className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3 text-xs">
                      <div>
                        <label className="font-bold block mb-1">কার্যক্রমের শিরোনাম *</label>
                        <input
                          type="text"
                          required
                          value={newActTitleBn}
                          onChange={(e) => setNewActTitleBn(e.target.value)}
                          placeholder="যেমন: চাবাগানে স্বাস্থ্য ক্যাম্প"
                          className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold block mb-1">ক্যাটাগরি</label>
                          <select
                            value={newActCategory}
                            onChange={(e) => setNewActCategory(e.target.value as any)}
                            className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg"
                          >
                            <option value="hygiene">স্বাস্থ্য ও হাইজিন</option>
                            <option value="tailoring_vocational">সেলাই ও স্বাবলম্বীকরণ</option>
                            <option value="maternal_health">মাতৃ ও শিশু পুষ্টি</option>
                            <option value="rights_literacy">আইনি অধিকার সচেতনতা</option>
                            <option value="emergency_aid">জরুরি সহায়তা</option>
                          </select>
                        </div>
                        <div>
                          <label className="font-bold block mb-1">উপকারভোগী সংখ্যা</label>
                          <input
                            type="number"
                            value={newActBeneficiaries}
                            onChange={(e) => setNewActBeneficiaries(Number(e.target.value))}
                            className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="font-bold block mb-1">স্থান</label>
                        <input
                          type="text"
                          value={newActLocation}
                          onChange={(e) => setNewActLocation(e.target.value)}
                          className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="font-bold block mb-1">ছবির URL</label>
                        <input
                          type="text"
                          value={newActImage}
                          onChange={(e) => setNewActImage(e.target.value)}
                          className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg font-mono text-[11px]"
                        />
                      </div>
                      <div>
                        <label className="font-bold block mb-1">বিস্তারিত বিবরণ</label>
                        <textarea
                          rows={2}
                          value={newActDesc}
                          onChange={(e) => setNewActDesc(e.target.value)}
                          className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button type="submit" className="px-4 py-1.5 bg-rose-600 text-white font-bold rounded-lg">
                          সংরক্ষণ করুন
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-2">
                    {activities.map((act) => (
                      <div key={act.id} className="p-3 bg-stone-50 dark:bg-stone-900 rounded-xl border flex items-center justify-between text-xs">
                        <div>
                          <h5 className="font-bold text-[#102B3F] dark:text-white">{act.titleBn}</h5>
                          <span className="text-stone-400 text-[11px]">{act.date} · {act.locationBn} · {act.beneficiariesCount} জন উপকৃত</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteActivity(act.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. DOCUMENTS & MINUTES PUBLISHER */}
              {adminTab === 'documents' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#102B3F] dark:text-white">
                      {language === 'bn' ? 'কার্যবিবরণী ও রেজুলেশন প্রকাশ' : 'Meeting Minutes & Documents'}
                    </h4>
                    <button
                      onClick={() => setIsAddingDoc(!isAddingDoc)}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      {isAddingDoc ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      <span>{isAddingDoc ? 'বাতিল' : 'নতুন কার্যবিবরণী প্রকাশ'}</span>
                    </button>
                  </div>

                  {isAddingDoc && (
                    <form onSubmit={handleSaveDoc} className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3 text-xs">
                      <div>
                        <label className="font-bold block mb-1">নথির শিরোনাম *</label>
                        <input
                          type="text"
                          required
                          value={newDocTitleBn}
                          onChange={(e) => setNewDocTitleBn(e.target.value)}
                          placeholder="যেমন: ৩য় নিয়মিত সভার কার্যবিবরণী"
                          className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold block mb-1">নথির ধরণ</label>
                          <select
                            value={newDocType}
                            onChange={(e) => setNewDocType(e.target.value as any)}
                            className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg"
                          >
                            <option value="meeting_minutes">সভার কার্যবিবরণী</option>
                            <option value="resolution">রেজুলেশন</option>
                            <option value="guideline">নীতিমালা</option>
                            <option value="report">প্রতিবেদন</option>
                          </select>
                        </div>
                        <div>
                          <label className="font-bold block mb-1">সংক্ষিপ্ত বিবরণ</label>
                          <input
                            type="text"
                            value={newDocDesc}
                            onChange={(e) => setNewDocDesc(e.target.value)}
                            placeholder="আলোচ্যসূচি ও সিদ্ধান্ত..."
                            className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="font-bold block mb-1">কার্যবিবরণীর মূল টেক্সট (Text Content)</label>
                        <textarea
                          rows={4}
                          value={newDocContent}
                          onChange={(e) => setNewDocContent(e.target.value)}
                          placeholder="সভার সিদ্ধান্তসমূহ ও রেজুলেশন..."
                          className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg font-mono text-[11px]"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button type="submit" className="px-4 py-1.5 bg-rose-600 text-white font-bold rounded-lg">
                          সংরক্ষণ করুন
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-2">
                    {documents.map((d) => (
                      <div key={d.id} className="p-3 bg-stone-50 dark:bg-stone-900 rounded-xl border flex items-center justify-between text-xs">
                        <div>
                          <h5 className="font-bold text-[#102B3F] dark:text-white">{d.titleBn}</h5>
                          <span className="text-stone-400 text-[11px]">{d.date} · {d.type} · {d.fileSize}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteDoc(d.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. NOTICES MANAGER */}
              {adminTab === 'notices' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#102B3F] dark:text-white">
                      {language === 'bn' ? 'নোটিশ বোর্ড পরিচালনা' : 'Notice Board'}
                    </h4>
                    <button
                      onClick={() => setIsAddingNotice(!isAddingNotice)}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      {isAddingNotice ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      <span>{isAddingNotice ? 'বাতিল' : 'নতুন নোটিশ জারি'}</span>
                    </button>
                  </div>

                  {isAddingNotice && (
                    <form onSubmit={handleSaveNotice} className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3 text-xs">
                      <div>
                        <label className="font-bold block mb-1">নোটিশের শিরোনাম *</label>
                        <input
                          type="text"
                          required
                          value={newNoticeTitle}
                          onChange={(e) => setNewNoticeTitle(e.target.value)}
                          className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold block mb-1">গুরুত্ব</label>
                          <select
                            value={newNoticePriority}
                            onChange={(e) => setNewNoticePriority(e.target.value as any)}
                            className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg"
                          >
                            <option value="general">সাধারণ নোটিশ</option>
                            <option value="urgent">জরুরি নোটিশ</option>
                          </select>
                        </div>
                        <div>
                          <label className="font-bold block mb-1">আদেশক্রমে / স্বাক্ষরকারী</label>
                          <input
                            type="text"
                            value={newNoticeSigner}
                            onChange={(e) => setNewNoticeSigner(e.target.value)}
                            className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="font-bold block mb-1">নোটিশের বিষয়বস্তু *</label>
                        <textarea
                          rows={3}
                          required
                          value={newNoticeBody}
                          onChange={(e) => setNewNoticeBody(e.target.value)}
                          className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button type="submit" className="px-4 py-1.5 bg-rose-600 text-white font-bold rounded-lg">
                          প্রকাশ করুন
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-2">
                    {notices.map((n) => (
                      <div key={n.id} className="p-3 bg-stone-50 dark:bg-stone-900 rounded-xl border flex items-center justify-between text-xs">
                        <div>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold mr-2 ${n.priority === 'urgent' ? 'bg-rose-100 text-rose-700' : 'bg-teal-100 text-teal-700'}`}>
                            {n.priority}
                          </span>
                          <span className="font-bold text-[#102B3F] dark:text-white">{n.titleBn}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteNotice(n.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. TEAM LEADER APPOINTMENT & MANAGEMENT */}
              {adminTab === 'leader' && (
                <div className="space-y-6">
                  {/* Header Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-rose-50 dark:from-amber-950/30 dark:to-rose-950/30 border border-amber-200 dark:border-amber-900/50">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
                        <Crown className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
                          <span>{language === 'bn' ? 'উইমেন্স টিম লিডার নিয়োগ ও পরিবর্তন' : "Women's Team Leader Setup"}</span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 text-[10px] font-bold">
                            Official Role
                          </span>
                        </h4>
                        <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
                          {language === 'bn'
                            ? 'উইমেন্স টিমের সর্বাধিনায়ক/সভাপতি নির্বাচন করুন। যাকে লিডার হিসেবে নিয়োগ দেওয়া হবে, তিনি স্বয়ংক্রিয়ভাবে উইমেন্স টিম অ্যাডমিন কন্ট্রোল প্যানেলের পূর্ণ অ্যাক্সেস পাবেন।'
                            : 'Appoint or change the Women’s Team Leader. The appointed person automatically receives administrative access to manage team members, notices, and activities.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Current Active Leader Showcase */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-3">
                      {language === 'bn' ? 'বর্তমান দায়িত্বপ্রাপ্ত টিম লিডার' : 'Currently Active Team Leader'}
                    </span>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="relative">
                          <img
                            src={currentLeaderMember?.photoUrl || currentLeaderAdmin?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80'}
                            alt="Current Leader"
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500 shadow-sm"
                          />
                          <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                            <Crown className="w-3.5 h-3.5" />
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-base text-stone-900 dark:text-white flex items-center gap-2">
                            <span>{currentLeaderMember?.nameBn || currentLeaderAdmin?.name || 'ফাতেমা তুজ জোহরা'}</span>
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                              👑 সভাপতি ও টিম লিডার
                            </span>
                          </div>
                          <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span>📧 {currentLeaderAdmin?.email || currentLeaderMember?.email || 'womensadmin@colash.org'}</span>
                            <span>📞 {currentLeaderMember?.phone || currentLeaderAdmin?.phone || '01646-475348'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right text-[11px] text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-stone-800/60 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700/60">
                        <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>অ্যাডমিন অ্যাক্সেস সক্রিয়</span>
                        </div>
                        <div className="font-mono text-[10px] mt-0.5">আইডি: {currentLeaderMember?.membershipId || 'CLF-WT-101'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Mode Selector */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
                      <button
                        type="button"
                        onClick={() => setLeaderChangeMode('existing')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                          leaderChangeMode === 'existing'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                        }`}
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'বিদ্যমান সদস্য থেকে নির্বাচন' : 'From Existing Members'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setLeaderChangeMode('new')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                          leaderChangeMode === 'new'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                        }`}
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'নতুন ব্যক্তির সরাসরি নিয়োগ' : 'Direct New Appointment'}</span>
                      </button>
                    </div>

                    <form onSubmit={handleSaveLeaderAppointment} className="space-y-4 text-xs">
                      {leaderChangeMode === 'existing' ? (
                        <div className="space-y-3 p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                          <div>
                            <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1.5">
                              {language === 'bn' ? 'উইমেন্স টিমের সদস্য নির্বাচন করুন *' : 'Select Team Member *'}
                            </label>
                            <select
                              required
                              value={selectedLeaderMemberId}
                              onChange={(e) => setSelectedLeaderMemberId(e.target.value)}
                              className="w-full p-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl font-medium"
                            >
                              <option value="">-- সদস্য নির্বাচন করুন --</option>
                              {members.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.nameBn} ({m.membershipId}) - {m.designationBn}
                                </option>
                              ))}
                            </select>
                          </div>

                          {selectedLeaderMemberId && (
                            <div className="p-3 bg-white dark:bg-stone-800 rounded-xl border border-rose-200 dark:border-rose-900/60 flex items-center gap-3">
                              {(() => {
                                const sel = members.find(m => m.id === selectedLeaderMemberId);
                                if (!sel) return null;
                                return (
                                  <>
                                    <img src={sel.photoUrl} alt={sel.nameBn} className="w-12 h-12 rounded-xl object-cover border border-rose-300" />
                                    <div>
                                      <div className="font-bold text-stone-900 dark:text-white flex items-center gap-2">
                                        <span>{sel.nameBn}</span>
                                        <span className="text-[10px] text-rose-600 font-semibold">{sel.designationBn}</span>
                                      </div>
                                      <div className="text-[11px] text-stone-500 font-mono mt-0.5">
                                        মোবাইল: {sel.phone} | ইমেইল: {sel.email || 'নেই'}
                                      </div>
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                          )}

                          <div>
                            <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                              {language === 'bn' ? 'অ্যাডমিন পাসওয়ার্ড সেট করুন (ঐচ্ছিক)' : 'Admin Password (Optional)'}
                            </label>
                            <input
                              type="password"
                              value={leaderPassInput}
                              onChange={(e) => setLeaderPassInput(e.target.value)}
                              placeholder="খালি রাখলে বর্তমান পাসওয়ার্ড বহাল থাকবে (ডিফল্ট: womensadmin2026)"
                              className="w-full p-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl font-mono"
                            />
                            <p className="text-[10px] text-stone-400 mt-1">
                              টিম লিডার এই পাসওয়ার্ড দিয়ে উইমেন্স টিম কন্ট্রোল প্যানেলে লগইন করতে পারবেন।
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">টিম লিডারের নাম (বাংলা) *</label>
                              <input
                                type="text"
                                required
                                value={leaderNameInputBn}
                                onChange={(e) => setLeaderNameInputBn(e.target.value)}
                                placeholder="যেমন: উম্মে হাবিবা"
                                className="w-full p-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
                              />
                            </div>

                            <div>
                              <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">নাম (English)</label>
                              <input
                                type="text"
                                value={leaderNameInputEn}
                                onChange={(e) => setLeaderNameInputEn(e.target.value)}
                                placeholder="e.g. Umme Habiba"
                                className="w-full p-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
                              />
                            </div>

                            <div>
                              <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">অ্যাডমিন ইমেইল *</label>
                              <input
                                type="email"
                                required
                                value={leaderEmailInput}
                                onChange={(e) => setLeaderEmailInput(e.target.value)}
                                placeholder="leader@colash.org"
                                className="w-full p-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl font-mono"
                              />
                            </div>

                            <div>
                              <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">মোবাইল নম্বর *</label>
                              <input
                                type="text"
                                required
                                value={leaderPhoneInput}
                                onChange={(e) => setLeaderPhoneInput(e.target.value)}
                                placeholder="017XX-XXXXXX"
                                className="w-full p-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl font-mono"
                              />
                            </div>

                            <div>
                              <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">পাসওয়ার্ড *</label>
                              <input
                                type="password"
                                required
                                value={leaderPassInput}
                                onChange={(e) => setLeaderPassInput(e.target.value)}
                                placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
                                className="w-full p-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl font-mono"
                              />
                            </div>

                            <div>
                              <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">প্রোফাইল ছবি ইউআরএল</label>
                              <input
                                type="text"
                                value={leaderPhotoInput}
                                onChange={(e) => setLeaderPhotoInput(e.target.value)}
                                placeholder="https://images.unsplash.com/..."
                                className="w-full p-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">সংক্ষিপ্ত পরিচিতি ও বক্তব্য</label>
                            <textarea
                              rows={2}
                              value={leaderBioInput}
                              onChange={(e) => setLeaderBioInput(e.target.value)}
                              placeholder="কোলাশ ফাউন্ডেশন উইমেন্স টিমের সার্বিক পরিচালনা ও প্রান্তিক নারী ক্ষমতায়নে নিবেদিত।"
                              className="w-full p-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
                            />
                          </div>
                        </div>
                      )}

                      <div className="pt-2 flex items-center justify-between">
                        <div className="text-[11px] text-stone-500">
                          👑 নিয়োগ দিলে পূর্বের সভাপতি উপদেষ্টা হিসেবে থাকবেন এবং নতুন লিডার সক্রিয় হবেন।
                        </div>
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-2 transition-all"
                        >
                          <Crown className="w-4 h-4" />
                          <span>{language === 'bn' ? '👑 উইমেন্স টিম লিডার হিসেবে চূড়ান্ত নিয়োগ দিন' : 'Confirm Leader Appointment'}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* 6. TEAM LEADER PASSWORD & SECURITY (Section B Requirement) */}
              {adminTab === 'security' && (
                <div className="space-y-5 max-w-lg">
                  <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60">
                    <h4 className="text-sm font-bold text-[#102B3F] dark:text-white flex items-center gap-2 mb-1">
                      <Key className="w-4 h-4 text-rose-600" />
                      <span>{language === 'bn' ? 'উইমেন্স টিম লিডার পাসওয়ার্ড পরিবর্তন' : 'Team Leader Password Update'}</span>
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-stone-300">
                      {language === 'bn'
                        ? 'উইমেন্স টিম লিডার হিসেবে নিজের অ্যাকাউন্টের নিরাপত্তা নিশ্চিত করতে এখান থেকে নতুন পাসওয়ার্ড সেট করতে পারেন।'
                        : 'Update your personal team leader credential safely.'}
                    </p>
                  </div>

                  <form onSubmit={handleChangeLeaderPasswordSubmit} className="space-y-3.5 text-xs">
                    <div>
                      <label className="font-bold block mb-1">নতুন পাসওয়ার্ড *</label>
                      <input
                        type="password"
                        required
                        value={newLeaderPass}
                        onChange={(e) => setNewLeaderPass(e.target.value)}
                        placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
                        className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                      />
                    </div>

                    <div>
                      <label className="font-bold block mb-1">নতুন পাসওয়ার্ড নিশ্চিত করুন *</label>
                      <input
                        type="password"
                        required
                        value={confirmLeaderPass}
                        onChange={(e) => setConfirmLeaderPass(e.target.value)}
                        placeholder="একই পাসওয়ার্ড পুনরায় লিখুন"
                        className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>{language === 'bn' ? 'পাসওয়ার্ড সংরক্ষণ করুন' : 'Save Password'}</span>
                      </button>
                    </div>
                  </form>

                  {/* Security Policy Reminder */}
                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      <span>{language === 'bn' ? 'নিরাপত্তা ও অনুমতি নীতিমালা (Section B)' : 'RBAC Policy Rule'}</span>
                    </div>
                    <p className="leading-relaxed">
                      {language === 'bn'
                        ? 'উইমেন্স টিম লিডার নিজের পাসওয়ার্ড পরিবর্তন করতে পারেন। তবে অন্য অ্যাডমিন তৈরি বা অনুমতি পরিবর্তনের ক্ষমতা শুধুমাত্র প্রধান অ্যাডমিনের (Super Admin) সংরক্ষিত।'
                        : 'Women’s Team Leader can change own password, but cannot create or expand admin roles without Super Admin authorization.'}
                    </p>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
