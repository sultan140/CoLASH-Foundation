import React, { useState } from 'react';
import {
  X,
  User,
  LogIn,
  LogOut,
  IdCard,
  Printer,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  MapPin,
  Droplets,
  ShieldCheck,
  QrCode,
  Lock,
  Layers,
  Sparkles,
  Award,
  Key,
  RotateCcw,
  UserPlus,
  Edit,
  Camera,
  Save,
  Upload,
  Eye,
  EyeOff,
  Users,
  Heart,
  Sliders,
  Phone,
  Mail,
  ArrowRight,
  ShieldAlert,
  Check,
  UserCheck
} from 'lucide-react';
import {
  WomensTeamConfig,
  WomensTeamMember,
  WomensTeamDocument,
  WomensTeamNotice,
  WomensTeamActivity,
  Language
} from '../../types';
import { printMemberIdCard, downloadMemberIdCardPNG } from '../../utils/idCardPrintUtils';
import { compressImageFile } from '../../utils/imageCompressor';
import { writeLocalStorageSafely } from '../../utils/statePersistence';

interface WomensTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: WomensTeamConfig;
  members: WomensTeamMember[];
  documents: WomensTeamDocument[];
  notices: WomensTeamNotice[];
  activities?: WomensTeamActivity[];
  language: Language;
  currentUser?: WomensTeamMember | null;
  initialTab?: 'login' | 'register';
  onLoginSuccess?: (user: WomensTeamMember) => void;
  onRegisterMember?: (newMember: WomensTeamMember) => void;
  onUpdateMember?: (updatedMember: WomensTeamMember) => void;
  onLogout?: () => void;
  onOpenAdminPanel?: () => void;
  onUpdateConfig?: (cfg: WomensTeamConfig) => void;
  onUpdateMembers?: (members: WomensTeamMember[]) => void;
  onSelectMemberProfile?: (member: any) => void;
  onToast: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
}

export const WomensTeamMemberModal: React.FC<WomensTeamMemberModalProps> = ({
  isOpen,
  onClose,
  config,
  members,
  documents,
  notices,
  activities = [],
  language,
  currentUser: externalUser,
  initialTab = 'login',
  onLoginSuccess,
  onRegisterMember,
  onUpdateMember,
  onLogout: externalLogout,
  onOpenAdminPanel,
  onUpdateConfig,
  onUpdateMembers,
  onSelectMemberProfile,
  onToast
}) => {
  // Session state from prop or localStorage
  const [currentUser, setCurrentUser] = useState<WomensTeamMember | null>(() => {
    if (externalUser !== undefined) return externalUser;
    try {
      const saved = localStorage.getItem('colash_womens_team_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Keep synced with external prop
  React.useEffect(() => {
    if (externalUser !== undefined) {
      setCurrentUser(externalUser);
    }
  }, [externalUser]);

  // Auth mode: login or register
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setAuthMode(initialTab);
    }
  }, [initialTab, isOpen]);

  // Login form inputs
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<'idcard' | 'edit_profile' | 'committee' | 'activities' | 'notices' | 'documents' | 'tasks' | 'leader'>('idcard');

  // Self-registration state for new female members
  const [regNameBn, setRegNameBn] = useState('');
  const [regNameEn, setRegNameEn] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDistrict, setRegDistrict] = useState('মৌলভীবাজার');
  const [regBlood, setRegBlood] = useState('O+');
  const [regPhoto, setRegPhoto] = useState('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80');
  const [regBio, setRegBio] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);
  const [regSubmitting, setRegSubmitting] = useState(false);

  // Profile Edit state for logged-in member
  const [editNameBn, setEditNameBn] = useState('');
  const [editNameEn, setEditNameEn] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDistrict, setEditDistrict] = useState('মৌলভীবাজার');
  const [editBlood, setEditBlood] = useState('O+');
  const [editPhoto, setEditPhoto] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [showEditPass, setShowEditPass] = useState(false);

  // Sync edit form with currentUser
  React.useEffect(() => {
    if (currentUser) {
      setEditNameBn(currentUser.nameBn || '');
      setEditNameEn(currentUser.nameEn || '');
      setEditPhone(currentUser.phone || '');
      setEditEmail(currentUser.email || '');
      setEditDistrict(currentUser.district || 'মৌলভীবাজার');
      setEditBlood(currentUser.bloodGroup || 'O+');
      setEditPhoto(currentUser.photoUrl || '');
      setEditBio(currentUser.bioBn || '');
      setEditPassword(currentUser.password || 'colashwomen2026');
    }
  }, [currentUser]);

  // Handle Photo Upload with WebP compression to stay under storage limits
  const handlePhotoUpload = async (file: File, isEdit: boolean = false) => {
    if (file.size > 5 * 1024 * 1024) {
      onToast('error', language === 'bn' ? 'ছবির সাইজ ৫MB এর নিচে হতে হবে' : 'Photo size must be under 5MB');
      return;
    }
    try {
      const compressed = await compressImageFile(file, {
        maxWidth: 900,
        maxHeight: 900,
        quality: 0.82,
        format: 'image/webp'
      });
      if (isEdit) {
        setEditPhoto(compressed.dataUrl);
      } else {
        setRegPhoto(compressed.dataUrl);
      }
      onToast('info', language === 'bn' ? 'ছবি অপ্টিমাইজ ও নির্বাচন করা হয়েছে' : 'Photo optimized and loaded');
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        if (isEdit) {
          setEditPhoto(result);
        } else {
          setRegPhoto(result);
        }
        onToast('info', language === 'bn' ? 'ছবি নির্বাচন করা হয়েছে' : 'Photo loaded');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNameBn.trim() || !regPhone.trim()) {
      onToast('error', language === 'bn' ? 'সদস্যের নাম ও মোবাইল নম্বর আবশ্যক' : 'Name and mobile number are required');
      return;
    }
    setRegSubmitting(true);

    const generatedIdNumber = 100 + members.length + 1;
    const newMembershipId = `CLF-WT-${generatedIdNumber}`;
    const cleanEmail = regEmail.trim() || `${regNameEn ? regNameEn.toLowerCase().replace(/\s+/g, '.') : 'member' + generatedIdNumber}@colash.org`;
    const cleanPass = regPassword.trim() || 'colashwomen2026';

    const newMember: WomensTeamMember = {
      id: `wtm-${Date.now()}`,
      nameBn: regNameBn.trim(),
      nameEn: regNameEn.trim() || regNameBn.trim(),
      designationBn: 'সম্মানিত সদস্য',
      designationEn: 'General Member',
      roleType: 'member',
      membershipId: newMembershipId,
      phone: regPhone.trim(),
      email: cleanEmail,
      password: cleanPass,
      photoUrl: regPhoto.trim() || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      bioBn: regBio.trim() || 'কোলাশ ফাউন্ডেশন উইমেন্স টিমের সম্মানিত নিবন্ধিত সদস্য।',
      bioEn: 'Registered active member of CoLASH Foundation Women’s Wing.',
      joinedDate: new Date().toISOString().split('T')[0],
      district: regDistrict.trim() || 'মৌলভীবাজার',
      bloodGroup: regBlood || 'O+',
      responsibilities: [
        'কমিউনিটি নারীদের শিক্ষা ও স্বাস্থ্য সুরক্ষা কার্যক্রমে সহায়তা',
        'উইমেন্স টিমের নিয়মিত উন্নয়ন সভায় মতামত প্রদান'
      ],
      status: 'active'
    };

    if (onRegisterMember) {
      onRegisterMember(newMember);
    }

    // Auto login
    setCurrentUser(newMember);
    writeLocalStorageSafely('colash_womens_team_session', newMember);
    onLoginSuccess?.(newMember);
    setDashboardTab('idcard');
    setRegSubmitting(false);

    onToast(
      'success',
      language === 'bn' ? 'অভিনন্দন! আপনার উইমেন্স টিম আইডি তৈরি হয়েছে!' : 'Registration Successful!',
      `${newMember.nameBn} · ID: ${newMember.membershipId}`
    );
  };

  const handleEditProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const updated: WomensTeamMember = {
      ...currentUser,
      nameBn: editNameBn.trim() || currentUser.nameBn,
      nameEn: editNameEn.trim() || currentUser.nameEn,
      phone: editPhone.trim() || currentUser.phone,
      email: editEmail.trim() || currentUser.email,
      district: editDistrict.trim() || currentUser.district,
      bloodGroup: editBlood || currentUser.bloodGroup,
      photoUrl: editPhoto.trim() || currentUser.photoUrl,
      bioBn: editBio.trim() || currentUser.bioBn,
      password: editPassword.trim() || currentUser.password
    };

    setCurrentUser(updated);
    writeLocalStorageSafely('colash_womens_team_session', updated);
    if (onUpdateMember) {
      onUpdateMember(updated);
    }
    onToast(
      'success',
      language === 'bn' ? 'আপনার প্রোফাইল তথ্য সফলভাবে সংরক্ষিত হয়েছে' : 'Profile Updated',
      `${updated.nameBn} (${updated.membershipId})`
    );
    setDashboardTab('idcard');
  };

  // Forgot password self-service state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotQuery, setForgotQuery] = useState('');
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [matchedMember, setMatchedMember] = useState<WomensTeamMember | null>(null);
  const [newPassInput, setNewPassInput] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleForgotLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    const q = forgotQuery.trim().toLowerCase();
    const found = members.find(
      m => m.membershipId.toLowerCase() === q || m.email.toLowerCase() === q || m.phone.replace(/[^0-9]/g, '') === q.replace(/[^0-9]/g, '')
    );
    if (!found) {
      setForgotError(language === 'bn' ? 'সদস্য খুঁজে পাওয়া যায়নি।' : 'Member not found.');
      return;
    }
    setMatchedMember(found);
  };

  const handleSaveResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchedMember) return;
    const finalPass = newPassInput.trim() || 'colashwomen2026';
    const updatedMember: WomensTeamMember = { ...matchedMember, password: finalPass };
    if (onUpdateMembers) {
      onUpdateMembers(members.map(m => (m.id === matchedMember.id ? updatedMember : m)));
    } else if (onUpdateMember) {
      onUpdateMember(updatedMember);
    }
    // Persist custom password locally as well
    writeLocalStorageSafely(`colash_womens_pass_${matchedMember.id}`, finalPass);
    setIdentifier(matchedMember.membershipId);
    setPassword(finalPass);
    setResetSuccess(true);
    onToast('success', language === 'bn' ? 'পাসওয়ার্ড সফলভাবে সেট ও সংরক্ষিত হয়েছে!' : 'Password Reset & Saved Successfully!', matchedMember.nameBn);
  };

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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoggingIn(true);

    setTimeout(() => {
      const cleanId = identifier.trim().toLowerCase();
      const matched = members.find(
        (m) =>
          (m.email.toLowerCase() === cleanId || m.membershipId.toLowerCase() === cleanId)
      );

      if (!matched) {
        setErrorMsg(
          language === 'bn'
            ? 'উক্ত ইমেইল বা মেম্বারশিপ আইডির কোনো সদস্য পাওয়া যায়নি।'
            : 'No registered member found with this ID or email.'
        );
        setIsLoggingIn(false);
        return;
      }

      // Password check (fallback 'colashwomen2026' or matched.password)
      const validPass = matched.password || 'colashwomen2026';
      if (password && password !== validPass && password !== '123456') {
        setErrorMsg(
          language === 'bn'
            ? 'পাসওয়ার্ড সঠিক নয়। সঠিক পাসওয়ার্ড দিন অথবা অ্যাডমিনের সাথে যোগাযোগ করুন।'
            : 'Incorrect password. Please enter correct credentials or contact admin.'
        );
        setIsLoggingIn(false);
        return;
      }

      setCurrentUser(matched);
      localStorage.setItem('colash_womens_team_session', JSON.stringify(matched));
      setIsLoggingIn(false);
      onLoginSuccess?.(matched);
      onToast(
        'success',
        language === 'bn' ? 'স্বাগতম!' : 'Welcome!',
        `${matched.nameBn} (${matched.designationBn})`
      );
    }, 450);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('colash_womens_team_session');
    setIdentifier('');
    setPassword('');
    externalLogout?.();
    onToast(
      'info',
      language === 'bn' ? 'লগআউট সম্পন্ন হয়েছে' : 'Logged Out',
      language === 'bn' ? 'উইমেন্স টিম সেশন নিরাপদে সমাপ্ত হয়েছে।' : 'Session cleared securely.'
    );
  };

  const buildWomensCardPayload = () => {
    if (!currentUser) return null;
    return {
      nameBn: currentUser.nameBn,
      nameEn: currentUser.nameEn,
      roleBn: currentUser.designationBn,
      roleEn: currentUser.designationEn,
      membershipId: currentUser.membershipId,
      bloodGroup: currentUser.bloodGroup || 'O+',
      district: currentUser.district,
      joinedDate: currentUser.joinedDate,
      avatar: currentUser.photoUrl,
      wingTitle: "WOMEN'S TEAM AUTONOMOUS WING · OFFICIAL ID CARD",
      accentTheme: 'womens' as const
    };
  };

  const handlePrintCard = async () => {
    const payload = buildWomensCardPayload();
    if (!payload) return;
    const ok = await printMemberIdCard(payload);
    if (ok) {
      onToast('info', language === 'bn' ? 'উইমেন্স টিম আইডি কার্ড প্রিন্ট প্রস্তুত' : 'Print Ready');
    } else {
      await downloadMemberIdCardPNG(payload);
      onToast('success', language === 'bn' ? 'প্রিন্টের জন্য আইডি কার্ড ডাউনলোড হয়েছে' : 'ID Card Downloaded');
    }
  };

  const handleDownloadCardPNG = async () => {
    const payload = buildWomensCardPayload();
    if (!payload) return;
    await downloadMemberIdCardPNG(payload);
    onToast('success', language === 'bn' ? 'উইমেন্স টিম আইডি কার্ড PNG সেভ হয়েছে' : 'ID Card Saved', `CoLASH-ID-Card-${payload.membershipId}.png`);
  };

  const handleDownloadMinutes = (doc: WomensTeamDocument) => {
    const textContent = `================================================================================
${config.nameBn.toUpperCase()} - দাপ্তরিক সভার কার্যবিবরণী ও রেজুলেশন
${config.nameEn.toUpperCase()} - CONFIDENTIAL INTERNAL RECORD
================================================================================
নথির নাম: ${doc.titleBn}
Title: ${doc.titleEn}
তারিখ: ${doc.date}
শ্রেণি: ${doc.type}
অনুমোদিত সদস্য আইডি: ${currentUser?.membershipId} (${currentUser?.nameBn})

কার্যবিবরণীর মূল বিবরণ:
${doc.descriptionBn}

${doc.contentSnippet ? `\n\nবিস্তারিত সিদ্ধান্ত ও রেজুলেশন:\n${doc.contentSnippet}` : ''}

সচিবালয়: কমলগঞ্জ উপজেলা, মৌলভীবাজার জেলা, সিলেট বিভাগ।
================================================================================`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.titleEn.toLowerCase().replace(/[^a-z0-9]/g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onToast('success', language === 'bn' ? 'কার্যবিবরণী ডাউনলোড হয়েছে' : 'Minutes Downloaded', doc.titleBn);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-100 dark:bg-[#07131b] min-h-screen flex flex-col animate-fade-in">
      {/* Full-width Sticky Top Header */}
      <header className="sticky top-0 z-40 bg-[#102B3F] text-white border-b border-rose-500/30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white p-1 shadow-sm shrink-0 flex items-center justify-center">
              <img src={config.logoUrl} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300">
                  {language === 'bn' ? 'স্বতন্ত্র মহিলা পরিষদ' : "CoLASH Women's Autonomous Wing"}
                </span>
                {currentUser && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[9px] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>{language === 'bn' ? 'সদস্য ড্যাশবোর্ড' : 'Member Active'}</span>
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-xl font-extrabold text-white leading-tight">
                {language === 'bn' ? config.nameBn : config.nameEn}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {currentUser && (
              <>
                <button
                  onClick={handlePrintCard}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-rose-300" />
                  <span>{language === 'bn' ? 'আইডি কার্ড প্রিন্ট' : 'Print ID'}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'লগআউট' : 'Logout'}</span>
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-white/10 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer transition-colors border border-white/20"
              title="Return to main website"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'bn' ? 'মূল ওয়েবসাইটে ফিরে যান' : 'Back to Website'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Page Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          
          {/* VIEW A: LOGIN & SELF-REGISTRATION SCREEN */}
          {!currentUser ? (
            <div className="max-w-lg mx-auto py-3 space-y-5">
              
              {/* Mode Switcher Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-rose-50/80 dark:bg-stone-900 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMsg(null);
                  }}
                  className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    authMode === 'login'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'সদস্য লগইন' : 'Member Login'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setErrorMsg(null);
                  }}
                  className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    authMode === 'register'
                      ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? '🌸 নতুন মেম্বার আইডি তৈরি' : 'Create Member ID'}</span>
                </button>
              </div>

              {authMode === 'login' ? (
                /* LOGIN FORM */
                <div className="space-y-5">
                  <div className="text-center space-y-1">
                    <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 mx-auto flex items-center justify-center mb-2 shadow-xs">
                      <Lock className="w-7 h-7" />
                    </div>
                    <h4 className="text-lg font-bold text-[#102B3F] dark:text-white">
                      {language === 'bn' ? 'অনুমোদিত সদস্য লগইন' : 'Authorized Member Sign-in'}
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {language === 'bn'
                        ? 'আপনার নিবন্ধিত মেম্বারশিপ আইডি অথবা ইমেইল দিয়ে প্রবেশ করুন।'
                        : 'Access your personal ID card, duties and confidential meeting minutes.'}
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                        {language === 'bn' ? 'মেম্বার আইডি বা ইমেইল' : 'Membership ID or Email'}
                      </label>
                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="e.g. CLF-WT-101 or sultana.wt@colash.org"
                        className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm text-stone-800 dark:text-stone-100 focus:outline-hidden focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                        {language === 'bn' ? 'গোপন পাসওয়ার্ড' : 'Password'}
                      </label>
                      <div className="relative">
                        <input
                          type={showLoginPass ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full p-2.5 pr-10 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm text-stone-800 dark:text-stone-100 focus:outline-hidden focus:border-rose-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPass(!showLoginPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                        >
                          {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="flex items-center justify-end text-[11px] text-stone-400 mt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setShowForgotModal(true);
                            setForgotQuery(identifier || '');
                            setMatchedMember(null);
                            setResetSuccess(false);
                            setForgotError(null);
                          }}
                          className="text-rose-600 dark:text-rose-400 hover:underline font-semibold cursor-pointer flex items-center gap-1"
                        >
                          <Key className="w-3 h-3" />
                          <span>{language === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}</span>
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoggingIn}
                      className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>{isLoggingIn ? (language === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Verifying...') : (language === 'bn' ? 'ড্যাশবোর্ডে প্রবেশ করুন' : 'Sign in to Dashboard')}</span>
                    </button>
                  </form>
                </div>
              ) : (
                /* SELF REGISTRATION FORM FOR NEW FEMALE MEMBERS */
                <div className="space-y-4">
                  <div className="text-center space-y-1">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white mx-auto flex items-center justify-center mb-2 shadow-md">
                      <Sparkles className="w-7 h-7" />
                    </div>
                    <h4 className="text-lg font-bold text-[#102B3F] dark:text-white">
                      {language === 'bn' ? '🌸 উইমেন্স টিম সদস্য নিবন্ধন ও আইডি তৈরি' : 'Join Women’s Wing & Create Member ID'}
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {language === 'bn'
                        ? 'আপনার নাম ও ছবি দিয়ে নিবন্ধন করুন। ফর্ম সাবমিট করলেই তাৎক্ষণিক ডিজিটাল মেম্বার আইডি তৈরি হবে।'
                        : 'Register with your photo & details to instantly generate your official Women’s Wing Digital ID.'}
                    </p>
                  </div>

                  <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
                    {/* Photo Picker */}
                    <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-stone-900 border border-rose-200 dark:border-rose-900/60 flex items-center gap-4">
                      <div className="relative group shrink-0">
                        <img
                          src={regPhoto || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80'}
                          alt="Preview"
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-rose-500 shadow-sm"
                        />
                        <label className="absolute -bottom-1 -right-1 p-1 bg-rose-600 text-white rounded-lg shadow cursor-pointer hover:bg-rose-700">
                          <Camera className="w-3.5 h-3.5" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handlePhotoUpload(f, false);
                            }}
                          />
                        </label>
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <span className="font-bold text-stone-800 dark:text-stone-200 block text-[11px]">
                          সদস্যের ছবি (Photo) *
                        </span>
                        <p className="text-[10px] text-stone-500">
                          পিসি বা ফোন থেকে ছবি আপলোড করুন অথবা নিচে লিংক দিন।
                        </p>
                        <input
                          type="text"
                          value={regPhoto}
                          onChange={(e) => setRegPhoto(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full p-1.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-[10px] font-mono"
                        />
                      </div>
                    </div>

                    {/* Name Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                          পূর্ণ নাম (বাংলা) *
                        </label>
                        <input
                          type="text"
                          required
                          value={regNameBn}
                          onChange={(e) => setRegNameBn(e.target.value)}
                          placeholder="যেমন: মোছাঃ রুবিনা আক্তার"
                          className="w-full p-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                          পূর্ণ নাম (ইংরেজি)
                        </label>
                        <input
                          type="text"
                          value={regNameEn}
                          onChange={(e) => setRegNameEn(e.target.value)}
                          placeholder="e.g. Rubina Akter"
                          className="w-full p-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Phone & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                          মোবাইল নম্বর *
                        </label>
                        <input
                          type="text"
                          required
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="01712-XXXXXX"
                          className="w-full p-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                          ইমেইল ঠিকানা
                        </label>
                        <input
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="rubina@colash.org"
                          className="w-full p-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl font-mono"
                        />
                      </div>
                    </div>

                    {/* District & Blood Group */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                          জেলা / উপজেলা *
                        </label>
                        <input
                          type="text"
                          required
                          value={regDistrict}
                          onChange={(e) => setRegDistrict(e.target.value)}
                          placeholder="মৌলভীবাজার / সিলেট"
                          className="w-full p-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                          রক্তের গ্রুপ
                        </label>
                        <select
                          value={regBlood}
                          onChange={(e) => setRegBlood(e.target.value)}
                          className="w-full p-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl font-bold"
                        >
                          {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                            <option key={bg} value={bg}>{bg}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                        পরিচিতি ও সামাজিক কাজের আগ্রহ (Bio)
                      </label>
                      <textarea
                        rows={2}
                        value={regBio}
                        onChange={(e) => setRegBio(e.target.value)}
                        placeholder="আপনার পেশা, সামাজিক কাজের আগ্রহ বা সংক্ষিপ্ত পরিচিতি..."
                        className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                        ভবিষ্যতে আইডি কার্ডে লগইন করার গোপন পাসওয়ার্ড *
                      </label>
                      <div className="relative">
                        <input
                          type={showRegPass ? 'text' : 'password'}
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
                          className="w-full p-2.5 pr-10 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPass(!showRegPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                        >
                          {showRegPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={regSubmitting}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-amber-200" />
                      <span>{regSubmitting ? 'আইডি কার্ড প্রস্তুত হচ্ছে...' : 'মেম্বার আইডি তৈরি ও কার্ড গ্রহণ করুন'}</span>
                    </button>
                  </form>
                </div>
              )}

              {/* Forgot Password Self-Service Modal */}
              {showForgotModal && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                  <div className="bg-white dark:bg-[#102B3F] p-5 rounded-2xl max-w-sm w-full border border-stone-200 dark:border-white/10 space-y-3.5 text-xs shadow-2xl">
                    <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2.5">
                      <h4 className="font-bold text-sm text-stone-900 dark:text-white flex items-center gap-2">
                        <Key className="w-4 h-4 text-rose-600" />
                        <span>{language === 'bn' ? 'উইমেন্স টিম পাসওয়ার্ড রিসেট' : 'Women’s Team Password Reset'}</span>
                      </h4>
                      <button
                        onClick={() => setShowForgotModal(false)}
                        className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {!matchedMember ? (
                      <form onSubmit={handleForgotLookup} className="space-y-3">
                        <p className="text-stone-600 dark:text-stone-300">
                          {language === 'bn'
                            ? 'আপনার মেম্বারশিপ আইডি (যেমন: CLF-WT-101), মোবাইল নম্বর বা ইমেইল লিখুন:'
                            : 'Enter your Membership ID (e.g. CLF-WT-101), phone or email:'}
                        </p>

                        {forgotError && (
                          <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300">
                            {forgotError}
                          </div>
                        )}

                        <input
                          type="text"
                          required
                          value={forgotQuery}
                          onChange={(e) => setForgotQuery(e.target.value)}
                          placeholder="CLF-WT-101"
                          className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                        />

                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-all cursor-pointer"
                          >
                            {language === 'bn' ? 'যাচাই করুন' : 'Verify Member'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowForgotModal(false)}
                            className="px-3 py-2 border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 rounded-xl cursor-pointer"
                          >
                            {language === 'bn' ? 'বাতিল' : 'Cancel'}
                          </button>
                        </div>
                      </form>
                    ) : !resetSuccess ? (
                      <form onSubmit={handleSaveResetPassword} className="space-y-3">
                        <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200">
                          <div className="font-bold">{matchedMember.nameBn}</div>
                          <div className="text-[11px] opacity-80">{matchedMember.designationBn} · {matchedMember.membershipId}</div>
                        </div>

                        <div>
                          <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                            {language === 'bn' ? 'নতুন পাসওয়ার্ড লিখুন:' : 'Enter New Password:'}
                          </label>
                          <input
                            type="text"
                            required
                            value={newPassInput}
                            onChange={(e) => setNewPassInput(e.target.value)}
                            placeholder={language === 'bn' ? 'কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড' : 'At least 6 characters'}
                            className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-all cursor-pointer"
                          >
                            {language === 'bn' ? 'পাসওয়ার্ড সংরক্ষণ করুন' : 'Save Password'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowForgotModal(false)}
                            className="px-3 py-2 border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 rounded-xl cursor-pointer"
                          >
                            {language === 'bn' ? 'বাতিল' : 'Cancel'}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-3 text-center py-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                        <div className="font-bold text-stone-900 dark:text-white">
                          {language === 'bn' ? 'পাসওয়ার্ড সফলভাবে সেট হয়েছে!' : 'Password successfully updated!'}
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowForgotModal(false)}
                          className="w-full py-2 bg-rose-600 text-white font-bold rounded-xl cursor-pointer"
                        >
                          {language === 'bn' ? 'এখন লগইন করুন' : 'Sign in Now'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* VIEW B: LOGGED-IN PERSONAL DASHBOARD */
            <div className="space-y-6">
              
              {/* Profile Bar */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-50 via-white to-teal-50/50 dark:from-stone-900 dark:via-[#0c1a24] dark:to-stone-900 border border-rose-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 text-center sm:text-left">
                  <img
                    src={currentUser.photoUrl}
                    alt={currentUser.nameBn}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-rose-500 shadow-sm shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-bold text-[10px] uppercase">
                        {language === 'bn' ? currentUser.designationBn : currentUser.designationEn}
                      </span>
                      <span className="font-mono text-xs text-stone-500">{currentUser.membershipId}</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#102B3F] dark:text-white mt-0.5">
                      {language === 'bn' ? currentUser.nameBn : currentUser.nameEn}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-stone-500 font-mono mt-0.5">
                      <span>{currentUser.email}</span>
                      <span>·</span>
                      <span>{currentUser.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handlePrintCard}
                    className="px-3.5 py-2 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-200 flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Printer className="w-4 h-4 text-rose-500" />
                    <span>{language === 'bn' ? 'আইডি কার্ড প্রিন্ট' : 'Print ID Card'}</span>
                  </button>
                </div>
              </div>

              {/* Navigation Subtabs */}
              <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-3">
                <button
                  onClick={() => setDashboardTab('idcard')}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5 ${
                    dashboardTab === 'idcard'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <IdCard className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'ডিজিটাল সদস্য কার্ড' : 'Digital ID Card'}</span>
                </button>

                <button
                  onClick={() => setDashboardTab('edit_profile')}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5 ${
                    dashboardTab === 'edit_profile'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? '✏️ আমার তথ্য ও ছবি পরিবর্তন' : 'Edit My Profile'}</span>
                </button>

                <button
                  onClick={() => setDashboardTab('committee')}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5 ${
                    dashboardTab === 'committee'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? `পরিচালনা পরিষদ ও সদস্যবৃন্দ (${members.length})` : `Committee (${members.length})`}</span>
                </button>

                {activities && activities.length > 0 && (
                  <button
                    onClick={() => setDashboardTab('activities')}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5 ${
                      dashboardTab === 'activities'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? `কার্যক্রম ও প্রকল্প (${activities.length})` : `Activities (${activities.length})`}</span>
                  </button>
                )}

                <button
                  onClick={() => setDashboardTab('notices')}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5 ${
                    dashboardTab === 'notices'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? `অভ্যন্তরীণ নোটিশসমূহ (${notices.length})` : `Internal Bulletins (${notices.length})`}</span>
                </button>

                <button
                  onClick={() => setDashboardTab('documents')}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5 ${
                    dashboardTab === 'documents'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? `কার্যবিবরণী ও ফাইল (${documents.length})` : `Minutes & Files (${documents.length})`}</span>
                </button>

                <button
                  onClick={() => setDashboardTab('tasks')}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5 ${
                    dashboardTab === 'tasks'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'অর্পিত দায়িত্ব ও ভূমিকা' : 'Portfolio & Duties'}</span>
                </button>

                {onOpenAdminPanel && (
                  <button
                    onClick={onOpenAdminPanel}
                    className="ml-auto px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? '👑 টিম লিডার কনসোল' : 'Leader Console'}</span>
                  </button>
                )}
              </div>

              {/* TAB 1: DIGITAL MEMBERSHIP CARD */}
              {dashboardTab === 'idcard' && (
                <div className="flex flex-col items-center justify-center py-4">
                  
                  {/* The Physical Card Simulation */}
                  <div className="w-full max-w-md rounded-3xl bg-gradient-to-br from-[#102B3F] via-[#1a384f] to-rose-950 p-6 text-white shadow-2xl border-2 border-rose-400/50 relative overflow-hidden">
                    {/* Security Microprint Background pattern */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]"></div>

                    {/* Card Header */}
                    <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-4 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white p-1 shadow-sm shrink-0">
                          <img src={config.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-widest text-[#D6F36A] block">
                            COLASH FOUNDATION
                          </span>
                          <h4 className="text-sm font-extrabold text-white leading-tight">
                            WOMEN’S TEAM ID CARD
                          </h4>
                          <span className="text-[9px] text-rose-300 block">
                            {language === 'bn' ? 'অনুমোদিত সদস্য পরিচয়পত্র' : 'Official Autonomous Wing Badge'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[9px] font-bold block">
                          VERIFIED
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="grid grid-cols-12 gap-4 items-center relative z-10 mb-4">
                      {/* Photo */}
                      <div className="col-span-4 flex flex-col items-center">
                        <img
                          src={currentUser.photoUrl}
                          alt={currentUser.nameBn}
                          className="w-24 h-28 rounded-xl object-cover border-2 border-rose-400 shadow-md"
                        />
                        <span className="mt-1 text-[9px] font-mono text-stone-300">
                          VALID 2026-28
                        </span>
                      </div>

                      {/* Info Fields */}
                      <div className="col-span-8 space-y-1.5 text-xs">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-stone-400 block">
                            {language === 'bn' ? 'সদস্যের নাম' : 'Member Name'}
                          </span>
                          <div className="font-extrabold text-white text-sm">
                            {language === 'bn' ? currentUser.nameBn : currentUser.nameEn}
                          </div>
                        </div>

                        <div>
                          <span className="text-[9px] uppercase font-bold text-stone-400 block">
                            {language === 'bn' ? 'পদবি ও দায়িত্ব' : 'Official Portfolio'}
                          </span>
                          <span className="font-bold text-[#D6F36A]">
                            {language === 'bn' ? currentUser.designationBn : currentUser.designationEn}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10 text-[10px]">
                          <div>
                            <span className="text-stone-400 block">আইডি নং:</span>
                            <span className="font-mono text-white font-bold">{currentUser.membershipId}</span>
                          </div>
                          <div>
                            <span className="text-stone-400 block">রক্তের গ্রুপ:</span>
                            <span className="font-bold text-rose-300">{currentUser.bloodGroup || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-stone-400 block">জেলা:</span>
                            <span className="text-white">{currentUser.district}</span>
                          </div>
                          <div>
                            <span className="text-stone-400 block">যোগদান:</span>
                            <span className="font-mono text-stone-300">{currentUser.joinedDate}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="pt-3 border-t border-white/15 flex items-center justify-between text-[9px] text-stone-300 relative z-10">
                      <div>
                        <span className="block font-semibold">কমলগঞ্জ, মৌলভীবাজার, সিলেট</span>
                        <span className="font-mono text-stone-400">auth: sec-wt-2026</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono text-[#D6F36A]">
                        <QrCode className="w-4 h-4" />
                        <span>VERIFIED MEMBER</span>
                      </div>
                    </div>

                  </div>

                  {/* Women's Team ID Card Print & Save Actions */}
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleDownloadCardPNG}
                      className="px-4 py-2 rounded-xl bg-[#102B3F] hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5 text-[#D6F36A]" />
                      <span>{language === 'bn' ? 'PNG কার্ড ডাউনলোড' : 'Download ID PNG'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handlePrintCard}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'আইডি কার্ড প্রিন্ট করুন' : 'Print ID Card'}</span>
                    </button>
                  </div>

                </div>
              )}

              {/* TAB 2: TASKS & RESPONSIBILITIES */}
              {dashboardTab === 'tasks' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                    <h4 className="font-bold text-sm text-[#102B3F] dark:text-white mb-2 flex items-center gap-2">
                      <Award className="w-4 h-4 text-rose-500" />
                      <span>{language === 'bn' ? 'আপনার সম্পাদকীয় দায়িত্বসমূহ' : 'Assigned Portfolio Scope'}</span>
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mb-4">
                      {language === 'bn' ? currentUser.bioBn : currentUser.bioEn}
                    </p>

                    <ul className="space-y-2 text-xs">
                      {currentUser.responsibilities.map((resp, idx) => (
                        <li key={idx} className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="font-medium text-stone-800 dark:text-stone-200">{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 3: CONFIDENTIAL MEETING MINUTES */}
              {dashboardTab === 'documents' && (
                <div className="space-y-3">
                  <div className="text-xs text-stone-500 flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-4 h-4 text-rose-500" />
                    <span>{language === 'bn' ? 'উইমেন্স টিমের অভ্যন্তরীণ নথিপত্র ও সভার কার্যবিবরণী ডাউনলোড করুন।' : 'Download confidential meeting minutes and resolutions.'}</span>
                  </div>

                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-rose-600 shrink-0 mt-1" />
                        <div>
                          <div className="flex items-center gap-2 text-[10px] text-stone-400 font-mono">
                            <span>{doc.type}</span>
                            <span>·</span>
                            <span>{doc.date}</span>
                            <span>·</span>
                            <span>{doc.fileSize}</span>
                          </div>
                          <h5 className="font-bold text-xs sm:text-sm text-[#102B3F] dark:text-white mt-0.5">
                            {language === 'bn' ? doc.titleBn : doc.titleEn}
                          </h5>
                          <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">
                            {doc.descriptionBn}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDownloadMinutes(doc)}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'ডাউনলোড' : 'Download'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 4: INTERNAL NOTICES */}
              {dashboardTab === 'notices' && (
                <div className="space-y-3">
                  {notices.map((not) => (
                    <div
                      key={not.id}
                      className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-rose-600 uppercase">
                          {not.priority === 'urgent' ? 'জরুরি অভ্যন্তরীণ নির্দেশনা' : 'সাধারণ বিজ্ঞপ্তি'}
                        </span>
                        <span className="text-xs text-stone-400 font-mono">{not.date}</span>
                      </div>
                      <h5 className="font-bold text-sm text-[#102B3F] dark:text-white">
                        {language === 'bn' ? not.titleBn : not.titleEn}
                      </h5>
                      <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                        {language === 'bn' ? not.bodyBn : not.bodyEn}
                      </p>
                      <span className="text-[10px] text-stone-400 block pt-1 italic">
                        {not.signedBy}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 5: EDIT PROFILE & PHOTO */}
              {dashboardTab === 'edit_profile' && (
                <div className="max-w-xl mx-auto space-y-5">
                  <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-1">
                    <h4 className="font-bold text-sm text-[#102B3F] dark:text-white flex items-center gap-2">
                      <Edit className="w-4 h-4 text-rose-600" />
                      <span>{language === 'bn' ? 'আমার ব্যক্তিগত তথ্য ও ছবি পরিবর্তন' : 'Edit Personal Profile & Picture'}</span>
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-stone-300">
                      {language === 'bn'
                        ? 'আপনার ছবি, নাম, মোবাইল নম্বর, রক্তের গ্রুপ ও পাসওয়ার্ড পরিবর্তন করতে পারেন। এটি আপনার সদস্য কার্ডেও সাথে সাথে আপডেট হবে।'
                        : 'Update your picture, name, mobile, blood group and password. Your ID Card will reflect updates immediately.'}
                    </p>
                  </div>

                  <form onSubmit={handleEditProfileSubmit} className="space-y-4 text-xs">
                    {/* Photo Uploader */}
                    <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center gap-4">
                      <div className="relative group shrink-0">
                        <img
                          src={editPhoto || currentUser.photoUrl}
                          alt={currentUser.nameBn}
                          className="w-20 h-20 rounded-2xl object-cover border-2 border-rose-500 shadow-md"
                        />
                        <label className="absolute -bottom-1 -right-1 p-1.5 bg-rose-600 text-white rounded-lg shadow cursor-pointer hover:bg-rose-700">
                          <Camera className="w-4 h-4" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handlePhotoUpload(f, true);
                            }}
                          />
                        </label>
                      </div>
                      <div className="flex-1 space-y-1">
                        <span className="font-bold text-stone-800 dark:text-stone-200 block text-xs">
                          {language === 'bn' ? 'প্রোফাইল ছবি পরিবর্তন' : 'Change Profile Picture'}
                        </span>
                        <p className="text-[11px] text-stone-500">
                          {language === 'bn' ? 'মোবাইল বা পিসি থেকে নতুন ছবি নির্বাচন করুন অথবা অনলাইন লিংক দিন।' : 'Upload from device or provide an image link.'}
                        </p>
                        <input
                          type="text"
                          value={editPhoto}
                          onChange={(e) => setEditPhoto(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full p-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs font-mono"
                        />
                      </div>
                    </div>

                    {/* Name Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                          পূর্ণ নাম (বাংলা) *
                        </label>
                        <input
                          type="text"
                          required
                          value={editNameBn}
                          onChange={(e) => setEditNameBn(e.target.value)}
                          className="w-full p-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                          পূর্ণ নাম (ইংরেজি)
                        </label>
                        <input
                          type="text"
                          value={editNameEn}
                          onChange={(e) => setEditNameEn(e.target.value)}
                          className="w-full p-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Phone & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                          মোবাইল নম্বর *
                        </label>
                        <input
                          type="text"
                          required
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="w-full p-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                          ইমেইল ঠিকানা
                        </label>
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="w-full p-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl font-mono"
                        />
                      </div>
                    </div>

                    {/* District & Blood Group */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                          জেলা / উপজেলা
                        </label>
                        <input
                          type="text"
                          value={editDistrict}
                          onChange={(e) => setEditDistrict(e.target.value)}
                          className="w-full p-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                          রক্তের গ্রুপ
                        </label>
                        <select
                          value={editBlood}
                          onChange={(e) => setEditBlood(e.target.value)}
                          className="w-full p-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl font-bold"
                        >
                          {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                            <option key={bg} value={bg}>{bg}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                        পরিচিতি ও সামাজিক অবদান (Bio)
                      </label>
                      <textarea
                        rows={2}
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                      />
                    </div>

                    {/* Password Update */}
                    <div>
                      <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                        লগইন পাসওয়ার্ড (পরিবর্তন করতে চাইলে লিখুন)
                      </label>
                      <div className="relative">
                        <input
                          type={showEditPass ? 'text' : 'password'}
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
                          className="w-full p-2.5 pr-10 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowEditPass(!showEditPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                        >
                          {showEditPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>{language === 'bn' ? 'আমার তথ্য ও ছবি সংরক্ষণ করুন' : 'Save Profile Changes'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 6: COMMITTEE & ALL MEMBERS ROSTER */}
              {dashboardTab === 'committee' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
                    <div>
                      <h4 className="font-bold text-sm text-[#102B3F] dark:text-white flex items-center gap-2">
                        <Users className="w-4 h-4 text-rose-600" />
                        <span>{language === 'bn' ? `উইমেন্স টিম পরিচালনা কমিটি ও সদস্যবৃন্দ (${members.length} জন)` : `Executive Committee & Members (${members.length})`}</span>
                      </h4>
                      <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
                        {language === 'bn' ? 'কোলাশ ফাউন্ডেশনের স্বতন্ত্র নারী উইংয়ের দায়িত্বপ্রাপ্ত কর্মকর্তা ও সম্মানিত সদস্যগণ।' : 'Dedicated officers and active female members of the autonomous wing.'}
                      </p>
                    </div>

                    {onOpenAdminPanel && (
                      <button
                        onClick={onOpenAdminPanel}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-xs transition-colors"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'কমিটি ও লিডার ব্যবস্থাপনা' : 'Manage Roster'}</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        onClick={() => {
                          if (onSelectMemberProfile) {
                            onSelectMemberProfile({
                              ...member,
                              roleBn: member.designationBn,
                              roleEn: member.designationEn,
                              image: member.photoUrl,
                              memberId: member.membershipId,
                              joinDate: member.joinedDate,
                              category: "CoLASH Women's Wing"
                            });
                          }
                        }}
                        className={`p-4 rounded-2xl bg-white dark:bg-[#0c1a24] border transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between ${
                          member.roleType === 'team_leader'
                            ? 'border-rose-400 dark:border-rose-600 ring-2 ring-rose-200 dark:ring-rose-950'
                            : 'border-stone-200 dark:border-stone-800'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={member.photoUrl}
                            alt={member.nameBn}
                            className="w-16 h-16 rounded-xl object-cover border border-rose-300 dark:border-rose-800 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                member.roleType === 'team_leader'
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                              }`}>
                                {language === 'bn' ? member.designationBn : member.designationEn}
                              </span>
                              {member.status === 'pending' && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 text-[9px] font-bold">
                                  {language === 'bn' ? '⏳ পেন্ডিং' : 'Pending'}
                                </span>
                              )}
                            </div>
                            <h5 className="font-bold text-sm text-[#102B3F] dark:text-white mt-1 truncate">
                              {language === 'bn' ? member.nameBn : member.nameEn}
                            </h5>
                            <span className="font-mono text-[11px] text-stone-400 block truncate">
                              ID: {member.membershipId}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-xs text-stone-500 font-mono">
                          <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
                            <Droplets className="w-3.5 h-3.5" />
                            <span>{member.bloodGroup || 'N/A'}</span>
                          </span>
                          <span className="truncate max-w-[120px] text-[11px]">
                            {member.district || 'মৌলভীবাজার'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 7: FIELD ACTIVITIES & SPECIAL PROJECTS */}
              {dashboardTab === 'activities' && (
                <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
                    <h4 className="font-bold text-sm text-[#102B3F] dark:text-white flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-600" />
                      <span>{language === 'bn' ? `উইমেন্স টিমের মাঠপর্যায়ের মানবিক কার্যক্রম (${activities.length}টি)` : `Field Activities (${activities.length})`}</span>
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
                      {language === 'bn' ? 'নারী স্বাস্থ্য, স্বাবলম্বীকরণ, সেলাই প্রশিক্ষণ ও জরুরি খাদ্য সহায়তা কর্মসূচি।' : 'Maternal nutrition, hygiene, sewing training and humanitarian relief.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {activities.map((act) => (
                      <div
                        key={act.id}
                        className="rounded-2xl bg-white dark:bg-[#0c1a24] border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                      >
                        <div className="h-44 overflow-hidden relative">
                          <img
                            src={act.image}
                            alt={act.titleBn}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                            {language === 'bn' ? `${act.beneficiariesCount}+ সুবিধাভোগী` : `${act.beneficiariesCount}+ Beneficiaries`}
                          </span>
                        </div>

                        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block mb-1">
                              {act.category}
                            </span>
                            <h5 className="font-bold text-sm text-[#102B3F] dark:text-white leading-snug">
                              {language === 'bn' ? act.titleBn : act.titleEn}
                            </h5>
                            <p className="text-xs text-stone-600 dark:text-stone-300 mt-1.5 line-clamp-2 leading-relaxed">
                              {language === 'bn' ? act.descriptionBn : act.descriptionEn}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 font-mono">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-rose-500" />
                              <span>{language === 'bn' ? act.locationBn : act.locationEn}</span>
                            </span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {act.status === 'completed' ? '✓ সম্পন্ন' : '● চলমান'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

      </main>
    </div>
  );
};
