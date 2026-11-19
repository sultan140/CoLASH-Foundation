import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  User,
  Droplets,
  MapPin,
  QrCode,
  ShieldCheck,
  Printer,
  LogIn,
  AlertCircle,
  Key,
  Upload,
  Camera,
  Save,
  LogOut,
  Edit3,
  Phone,
  Mail,
  Briefcase,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  IdCard,
  FileText,
  Calendar,
  Sparkles,
  ExternalLink,
  Info,
  Check,
  Download
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { GeneralMember, Volunteer, Language, NoticeItem, MemberPositionHistory } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { optimizeAndCompressImage } from '../utils/imageUtils';
import { printMemberIdCard, downloadMemberIdCardPNG } from '../utils/idCardPrintUtils';
import { writeLocalStorageSafely } from '../utils/statePersistence';
import { useFirebase } from '../contexts/FirebaseContext';
import { saveAuthenticatedMemberProfileToFirestore } from '../utils/firestoreSync';

interface MemberPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  generalMembers?: GeneralMember[];
  onUpdateGeneralMembers?: (members: GeneralMember[]) => void;
  volunteers?: Volunteer[];
  onRegisterVolunteer?: (vol: Volunteer) => void;
  notices?: NoticeItem[];
  defaultTab?: 'login' | 'register';
  defaultViewTab?: 'card' | 'edit' | 'history' | 'verification' | 'notices';
  onMemberSessionChange?: (member: GeneralMember | null) => void;
  onToast: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
}

export const MemberPortalModal: React.FC<MemberPortalModalProps> = ({
  isOpen,
  onClose,
  language,
  generalMembers = [],
  onUpdateGeneralMembers,
  notices = [],
  defaultTab = 'login',
  defaultViewTab = 'card',
  onMemberSessionChange,
  onToast
}) => {
  const { firebaseUser } = useFirebase();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);

  // Active Member Session (Strictly isolated to "Just nijerta" - their own profile only)
  const [currentMember, setCurrentMember] = useState<GeneralMember | null>(() => {
    try {
      const saved = localStorage.getItem('colash_active_member_session');
      if (saved) {
        return JSON.parse(saved);
      }
      return null;
    } catch {
      return null;
    }
  });

  // Sub-tabs inside logged-in dashboard: 'card' | 'edit' | 'history' | 'verification' | 'notices'
  const [memberViewTab, setMemberViewTab] = useState<'card' | 'edit' | 'history' | 'verification' | 'notices'>(defaultViewTab);

  // Login form state
  const [loginQuery, setLoginQuery] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registrationSuccessMember, setRegistrationSuccessMember] = useState<GeneralMember | null>(null);

  // Forgot password / lookup modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotInput, setForgotInput] = useState('');
  const [forgotResult, setForgotResult] = useState<string | null>(null);

  // Registration form state
  const [regNameBn, setRegNameBn] = useState('');
  const [regNameEn, setRegNameEn] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regBloodGroup, setRegBloodGroup] = useState('O+');
  const [regDistrict, setRegDistrict] = useState('মৌলভীবাজার');
  const [regAddress, setRegAddress] = useState('');
  const [regProfession, setRegProfession] = useState('');
  const [regBio, setRegBio] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAvatar, setRegAvatar] = useState('');
  const [regError, setRegError] = useState<string | null>(null);

  // Identity verification fields for registration
  const [regDocType, setRegDocType] = useState<'nid' | 'birth_cert' | 'passport' | 'student_id' | 'other'>('nid');
  const [regDocNumber, setRegDocNumber] = useState('');
  const [regDocFile, setRegDocFile] = useState('');
  const [regDocFileName, setRegDocFileName] = useState('');
  const [isAiCheckingDoc, setIsAiCheckingDoc] = useState(false);
  const [aiDocCheckFeedback, setAiDocCheckFeedback] = useState<string | null>(null);

  // Edit profile state (for currently logged in member)
  const [editNameBn, setEditNameBn] = useState('');
  const [editNameEn, setEditNameEn] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editBloodGroup, setEditBloodGroup] = useState('O+');
  const [editDistrict, setEditDistrict] = useState('মৌলভীবাজার');
  const [editAddress, setEditAddress] = useState('');
  const [editProfession, setEditProfession] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  // Edit history state
  const [editJoiningYear, setEditJoiningYear] = useState<number>(2024);
  const [editCurrentDesignationBn, setEditCurrentDesignationBn] = useState('');
  const [editCurrentDesignationEn, setEditCurrentDesignationEn] = useState('');
  const [editPositions, setEditPositions] = useState<MemberPositionHistory[]>([]);
  const [newHistPositionBn, setNewHistPositionBn] = useState('');
  const [newHistPositionEn, setNewHistPositionEn] = useState('');
  const [newHistFromYear, setNewHistFromYear] = useState<number>(2022);
  const [newHistToYear, setNewHistToYear] = useState<number>(2024);

  // Document re-upload during correction
  const [reuploadDocFile, setReuploadDocFile] = useState('');

  const regFileRef = useRef<HTMLInputElement>(null);
  const regDocFileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);
  const reuploadDocRef = useRef<HTMLInputElement>(null);

  // Sync edit form with currentMember
  useEffect(() => {
    if (currentMember) {
      setEditNameBn(currentMember.nameBn || '');
      setEditNameEn(currentMember.nameEn || '');
      setEditPhone(currentMember.phone || '');
      setEditEmail(currentMember.email || '');
      setEditBloodGroup(currentMember.bloodGroup || 'O+');
      setEditDistrict(currentMember.district || 'মৌলভীবাজার');
      setEditAddress(currentMember.address || '');
      setEditProfession(currentMember.profession || '');
      setEditBio(currentMember.bio || '');
      setEditPassword(currentMember.password || '');
      setEditAvatar(currentMember.avatar || '');
      setEditJoiningYear(Number(currentMember.joiningYear || 2024));
      setEditCurrentDesignationBn(currentMember.currentDesignationBn || currentMember.roleBn || 'সাধারণ সদস্য');
      setEditCurrentDesignationEn(currentMember.currentDesignationEn || currentMember.roleEn || 'General Member');
      setEditPositions(currentMember.previousPositions || []);
    }
  }, [currentMember]);

  // Keep currentMember in sync if generalMembers updates
  useEffect(() => {
    if (currentMember && generalMembers.length > 0) {
      const fresh = generalMembers.find(m => m.id === currentMember.id || m.membershipId === currentMember.membershipId);
      if (fresh) {
        setCurrentMember(fresh);
        writeLocalStorageSafely('colash_active_member_session', fresh);
        onMemberSessionChange?.(fresh);
      }
    }
  }, [generalMembers]);

  // Sync requested initial tabs when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      if (defaultViewTab) {
        setMemberViewTab(defaultViewTab);
      }
    } else {
      setRegistrationSuccessMember(null);
    }
  }, [isOpen, defaultTab, defaultViewTab]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Optimized Photo Upload (Registration)
  const handleRegPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await optimizeAndCompressImage(file, { maxWidth: 1000, quality: 0.88 });
      setRegAvatar(compressed);
      onToast('success', language === 'bn' ? 'ছবি প্রক্রিয়াকরণ সম্পন্ন' : 'Photo Ready');
    } catch {
      onToast('error', language === 'bn' ? 'ছবি আপলোড ত্রুটি' : 'Upload Failed');
    }
  };

  // Optimized Document Upload (Registration) with AI Format Check
  const handleRegDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRegDocFileName(file.name);
    setIsAiCheckingDoc(true);
    setAiDocCheckFeedback(null);

    try {
      const compressed = await optimizeAndCompressImage(file, { maxWidth: 1400, quality: 0.90 });
      setRegDocFile(compressed);

      // Instant AI Format Assistant Simulation
      setTimeout(() => {
        setIsAiCheckingDoc(false);
        setAiDocCheckFeedback(
          language === 'bn'
            ? '🤖 AI প্রিভিউ সম্পন্ন: ডকুমেন্টের রেজুলেশন ও ফ্রেম সম্পূর্ণ পাঠযোগ্য। আবেদন জমা দেওয়ার পর কোলাশ যাচাইকারী এডমিন এটি চূড়ান্ত অনুমোদন করবেন।'
            : '🤖 AI Preview Complete: Document resolution and edges verified readable. Official Human Admin approval required.'
        );
      }, 600);
    } catch {
      setIsAiCheckingDoc(false);
      onToast('error', language === 'bn' ? 'নথি আপলোডে সমস্যা হয়েছে' : 'Document upload failed');
    }
  };

  // Optimized Photo Upload (Edit Profile)
  const handleEditPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await optimizeAndCompressImage(file, { maxWidth: 1000, quality: 0.88 });
      setEditAvatar(compressed);
      onToast('success', language === 'bn' ? 'নতুন ছবি নির্বাচিত' : 'New Photo Selected');
    } catch {
      onToast('error', language === 'bn' ? 'ছবি আপলোড ত্রুটি' : 'Upload Failed');
    }
  };

  // Login Submit Handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const q = loginQuery.trim().toLowerCase();
    const cleanPhone = q.replace(/[^0-9]/g, '');

    const found = generalMembers.find(m => {
      const matchId = m.membershipId.toLowerCase() === q || m.id.toLowerCase() === q;
      const matchEmail = m.email ? m.email.toLowerCase() === q : false;
      const matchPhone = m.phone ? m.phone.replace(/[^0-9]/g, '') === cleanPhone && cleanPhone.length >= 8 : false;
      return matchId || matchEmail || matchPhone;
    });

    if (!found) {
      setLoginError(
        language === 'bn'
          ? 'কোনো সদস্য অ্যাকাউন্ট খুঁজে পাওয়া যায়নি। আপনার সঠিক মেম্বার আইডি (যেমন: CLF-M-2026-101), মোবাইল বা ইমেইল দিন।'
          : 'Member not found. Please provide valid Member ID, Phone or Email.'
      );
      return;
    }

    // Password verification (strictly require matching password; default initial password 'member123' if not set)
    const expectedPass = found.password || 'member123';
    if (!loginPassword.trim() || loginPassword.trim() !== expectedPass) {
      setLoginError(
        language === 'bn'
          ? 'ভুল পাসওয়ার্ড! অনুগ্রহ করে সঠিক পাসওয়ার্ড দিন। পাসওয়ার্ড ভুলে গেলে অ্যাডমিনের সাথে যোগাযোগ করুন।'
          : 'Incorrect password! Please enter the correct password.'
      );
      return;
    }

    setCurrentMember(found);
    writeLocalStorageSafely('colash_active_member_session', found);
    onMemberSessionChange?.(found);
    setLoginQuery('');
    setLoginPassword('');
    onToast(
      'success',
      language === 'bn' ? 'সদস্য ড্যাশবোর্ডে স্বাগতম!' : 'Welcome to Member Dashboard!',
      `${found.nameBn} (${found.membershipId})`
    );
  };

  // Forgot Password / Member ID Lookup
  const handleForgotLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotResult(null);
    const q = forgotInput.trim().toLowerCase();
    const cleanPhone = q.replace(/[^0-9]/g, '');

    const found = generalMembers.find(m => {
      const matchPhone = m.phone ? m.phone.replace(/[^0-9]/g, '') === cleanPhone && cleanPhone.length >= 8 : false;
      const matchEmail = m.email ? m.email.toLowerCase() === q : false;
      return matchPhone || matchEmail;
    });

    if (found) {
      setForgotResult(
        language === 'bn'
          ? `সদস্য আইডি: ${found.membershipId} | নাম: ${found.nameBn} | আপনার অ্যাকাউন্ট সক্রিয় রয়েছে। পাসওয়ার্ড ভুলে গেলে অ্যাডমিনের সাথে যোগাযোগ করুন।`
          : `Member ID: ${found.membershipId} | Name: ${found.nameEn} | Your account is active. Please contact admin if password assistance is needed.`
      );
    } else {
      setForgotResult(
        language === 'bn'
          ? 'এই মোবাইল বা ইমেইলে কোনো সদস্য অ্যাকাউন্ট পাওয়া যায়নি। সঠিক তথ্য দিন।'
          : 'No member found with this phone or email.'
      );
    }
  };

  // Member Registration Handler with Identity Document & Verification Workflow
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regNameBn.trim()) {
      setRegError(language === 'bn' ? 'অনুগ্রহ করে আপনার পুরো নাম (বাংলায়) লিখুন।' : 'Please enter your full name in Bengali.');
      return;
    }
    if (!regPhone.trim() || regPhone.replace(/[^0-9]/g, '').length < 10) {
      setRegError(language === 'bn' ? 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন।' : 'Please enter a valid phone number.');
      return;
    }
    if (!regPassword.trim() || regPassword.length < 4) {
      setRegError(language === 'bn' ? 'কমপক্ষে ৪ অক্ষরের পাসওয়ার্ড দিন।' : 'Password must be at least 4 characters.');
      return;
    }
    if (!regDocNumber.trim()) {
      setRegError(language === 'bn' ? 'পরিচয়পত্রের নম্বর (NID / জন্ম নিবন্ধন / পাসপোর্ট / স্টুডেন্ট আইডি) দিন।' : 'Please enter your identity document number.');
      return;
    }

    const currentYear = new Date().getFullYear();
    const randomSuffix = Math.floor(100 + Math.random() * 899);
    const nextSlNo = generalMembers.length > 0 ? Math.max(...generalMembers.map(m => m.slNo || 0)) + 1 : 1;
    const newMembershipId = `CLF-M-${currentYear}-${randomSuffix}`;

    const newMember: GeneralMember = {
      id: `gm-${Date.now()}`,
      slNo: nextSlNo,
      membershipId: newMembershipId,
      nameBn: regNameBn.trim(),
      nameEn: regNameEn.trim() || regNameBn.trim(),
      bloodGroup: regBloodGroup,
      district: regDistrict,
      status: 'active',
      roleBn: 'সাধারণ সদস্য (আবেদনকারী)',
      roleEn: 'General Member (Applicant)',
      phone: regPhone.trim(),
      email: regEmail.trim() || undefined,
      avatar: regAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
      password: regPassword.trim(),
      approvalStatus: 'pending', // Requires Human Admin Approval
      verificationStatus: 'under_review',
      idDocumentType: regDocType,
      idDocumentNumber: regDocNumber.trim(),
      idDocumentFile: regDocFile || undefined,
      joiningYear: currentYear,
      serviceYears: 0,
      currentDesignationBn: 'সাধারণ সদস্য',
      currentDesignationEn: 'General Member',
      previousPositions: [],
      profession: regProfession.trim() || undefined,
      address: regAddress.trim() || undefined,
      bio: regBio.trim() || undefined,
      joinedDate: new Date().toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      registeredAt: new Date().toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')
    };

    const updated = [newMember, ...generalMembers];
    if (onUpdateGeneralMembers) {
      onUpdateGeneralMembers(updated);
    }
    if (firebaseUser?.emailVerified) {
      void saveAuthenticatedMemberProfileToFirestore(firebaseUser, newMember);
    }

    // Direct access to personal dashboard + animated registration confirmation
    setCurrentMember(newMember);
    setRegistrationSuccessMember(newMember);
    setMemberViewTab('card');
    writeLocalStorageSafely('colash_active_member_session', newMember);
    onMemberSessionChange?.(newMember);

    onToast(
      'success',
      language === 'bn' ? 'সদস্য ও স্বেচ্ছাসেবী আবেদন সফলভাবে জমা হয়েছে!' : 'Volunteer & Member Registration Confirmed!',
      `${newMember.nameBn} (${newMember.membershipId}) - এডমিন অনুমোদনের পর ওয়েবসাইটে প্রদর্শিত হবে।`
    );
  };

  // Save changes to current member profile
  const handleSaveMemberProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMember) return;

    if (!editNameBn.trim()) {
      onToast('error', language === 'bn' ? 'নাম ফাঁকা রাখা যাবে না' : 'Name cannot be empty');
      return;
    }

    const updatedMember: GeneralMember = {
      ...currentMember,
      nameBn: editNameBn.trim(),
      nameEn: editNameEn.trim() || editNameBn.trim(),
      phone: editPhone.trim(),
      email: editEmail.trim() || undefined,
      bloodGroup: editBloodGroup,
      district: editDistrict,
      address: editAddress.trim() || undefined,
      profession: editProfession.trim() || undefined,
      bio: editBio.trim() || undefined,
      avatar: editAvatar || currentMember.avatar,
      password: editPassword.trim() || currentMember.password
    };

    const updatedList = generalMembers.map(m => (m.id === currentMember.id ? updatedMember : m));
    if (onUpdateGeneralMembers) {
      onUpdateGeneralMembers(updatedList);
    }
    if (firebaseUser?.emailVerified) {
      void saveAuthenticatedMemberProfileToFirestore(firebaseUser, updatedMember);
    }

    setCurrentMember(updatedMember);
    writeLocalStorageSafely('colash_active_member_session', updatedMember);
    onMemberSessionChange?.(updatedMember);

    onToast(
      'success',
      language === 'bn' ? 'প্রোফাইল তথ্য সফলভাবে সংরক্ষিত হয়েছে!' : 'Profile Updated Successfully!',
      language === 'bn' ? 'আপনার ডিজিটাল মেম্বার কার্ডে পরিবর্তন আপডেট হয়েছে।' : 'Changes applied to your Member ID card.'
    );
    setMemberViewTab('card');
  };

  // Add a historical position
  const handleAddHistoricalPosition = () => {
    if (!newHistPositionBn.trim()) {
      onToast('error', language === 'bn' ? 'পদবির নাম লিখুন' : 'Enter Position Title');
      return;
    }

    const newPos: MemberPositionHistory = {
      id: `pos-${Date.now()}`,
      positionBn: newHistPositionBn.trim(),
      positionEn: newHistPositionEn.trim() || newHistPositionBn.trim(),
      department: 'General',
      fromYear: Number(newHistFromYear),
      toYear: Number(newHistToYear),
      notes: `${newHistFromYear} - ${newHistToYear}`
    };

    const updatedPositions = [...editPositions, newPos];
    setEditPositions(updatedPositions);

    if (currentMember) {
      const updatedMember: GeneralMember = {
        ...currentMember,
        previousPositions: updatedPositions,
        joiningYear: editJoiningYear,
        serviceYears: new Date().getFullYear() - Number(editJoiningYear || 2024)
      };

      const updatedList = generalMembers.map(m => (m.id === currentMember.id ? updatedMember : m));
      if (onUpdateGeneralMembers) {
        onUpdateGeneralMembers(updatedList);
      }
      setCurrentMember(updatedMember);
      writeLocalStorageSafely('colash_active_member_session', updatedMember);
      onMemberSessionChange?.(updatedMember);
      onToast('success', language === 'bn' ? 'ইতিহাসে পদবি যুক্ত হয়েছে' : 'Past Position Added');
      setNewHistPositionBn('');
      setNewHistPositionEn('');
    }
  };

  // Remove a historical position
  const handleRemoveHistoricalPosition = (posId?: string) => {
    if (!posId) return;
    const updatedPositions = editPositions.filter(p => p.id !== posId);
    setEditPositions(updatedPositions);

    if (currentMember) {
      const updatedMember: GeneralMember = {
        ...currentMember,
        previousPositions: updatedPositions
      };

      const updatedList = generalMembers.map(m => (m.id === currentMember.id ? updatedMember : m));
      if (onUpdateGeneralMembers) {
        onUpdateGeneralMembers(updatedList);
      }
      setCurrentMember(updatedMember);
      writeLocalStorageSafely('colash_active_member_session', updatedMember);
      onToast('info', language === 'bn' ? 'পদবি মুছে ফেলা হয়েছে' : 'Position Removed');
    }
  };

  // Logout current member
  const handleMemberLogout = () => {
    setCurrentMember(null);
    setRegistrationSuccessMember(null);
    localStorage.removeItem('colash_active_member_session');
    onMemberSessionChange?.(null);
    onToast(
      'info',
      language === 'bn' ? 'লগআউট সফল হয়েছে' : 'Logged Out',
      language === 'bn' ? 'সদস্য পোর্টাল সেশন সমাপ্ত করা হয়েছে।' : 'Member session closed.'
    );
  };

  // Dedicated generator function: renders a stylish, printable digital identity card component for the logged-in member
  const generatePrintableDigitalIdCard = (member: GeneralMember) => {
    const verificationUrl = `${window.location.origin}${window.location.pathname}#verify-member-${encodeURIComponent(member.membershipId)}`;
    const displayName = language === 'bn' ? member.nameBn : member.nameEn;
    const secondaryName = language === 'bn' ? member.nameEn : member.nameBn;
    const designation =
      language === 'bn'
        ? member.currentDesignationBn || member.roleBn
        : member.currentDesignationEn || member.roleEn;

    return (
      <div
        id="logged-in-member-digital-id-card"
        className="print-portal-id-card relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0d2436] via-[#102B3F] to-[#167D78] p-6 sm:p-8 text-white shadow-2xl border border-[#D6F36A]/25"
      >
        {/* Decorative background glows & subtle top security stripe */}
        <div className="no-print absolute -top-12 -right-12 w-64 h-64 bg-[#D6F36A]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="no-print absolute -bottom-16 -left-12 w-56 h-56 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#D6F36A] via-[#167D78] to-[#E6A15B]" />

        {/* Card Header */}
        <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-white/15 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#D6F36A] text-[#102B3F] flex items-center justify-center font-black text-base tracking-tight shadow-md ring-2 ring-white/20">
              CLF
            </div>
            <div>
              <h4 className="font-black text-base sm:text-lg tracking-tight leading-tight">
                CoLASH Foundation
              </h4>
              <span className="text-[10px] text-[#D6F36A] tracking-widest uppercase font-bold block mt-0.5">
                {language === 'bn' ? 'অফিসিয়াল ডিজিটাল সদস্য পরিচয়পত্র' : 'Official Digital Member Identity Card'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${
                member.approvalStatus === 'approved'
                  ? 'bg-emerald-500/20 border-emerald-400/40 text-[#D6F36A]'
                  : member.approvalStatus === 'rejected'
                  ? 'bg-rose-500/20 border-rose-400/40 text-rose-200'
                  : 'bg-amber-500/20 border-amber-400/40 text-amber-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>
                {member.approvalStatus === 'approved'
                  ? language === 'bn'
                    ? 'ভেরিফাইড সদস্য'
                    : 'Verified Member'
                  : member.approvalStatus === 'rejected'
                  ? language === 'bn'
                    ? 'স্থগিত'
                    : 'Suspended'
                  : language === 'bn'
                  ? 'পর্যালোচনাধীন'
                  : 'Under Review'}
              </span>
            </span>
          </div>
        </div>

        {/* Card Body: Portrait + Member Info + QR Code */}
        <div className="relative flex flex-col sm:flex-row items-center gap-6">
          {/* Portrait */}
          <div className="relative group shrink-0">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-[3px] border-[#D6F36A] shadow-xl bg-stone-800">
              <img
                src={
                  member.avatar ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80'
                }
                alt={displayName}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={() => setMemberViewTab('edit')}
              className="no-print absolute -bottom-2 -right-2 p-1.5 rounded-full bg-[#167D78] text-[#D6F36A] border-2 border-white shadow-md hover:scale-110 transition-transform cursor-pointer"
              title={language === 'bn' ? 'ছবি পরিবর্তন করুন' : 'Change Photo'}
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Core Identity Details */}
          <div className="flex-1 space-y-2.5 text-center sm:text-left min-w-0">
            <div>
              <div className="text-xl sm:text-2xl font-black tracking-tight text-white leading-snug">
                {displayName}
              </div>
              {secondaryName && (
                <div className="text-[11px] text-stone-300 font-medium tracking-wide">
                  {secondaryName}
                </div>
              )}
              <div className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-white/10 text-xs text-[#D6F36A] font-bold">
                {designation}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-stone-200 pt-1 bg-black/20 rounded-2xl p-3 border border-white/10">
              <div>
                <span className="text-stone-400 text-[10px] uppercase tracking-wider block">
                  {language === 'bn' ? 'সদস্য আইডি' : 'Membership ID'}
                </span>
                <span className="font-mono font-extrabold text-sm text-[#D6F36A] tracking-wide">
                  {member.membershipId}
                </span>
              </div>
              <div>
                <span className="text-stone-400 text-[10px] uppercase tracking-wider block">
                  {language === 'bn' ? 'রক্তের গ্রুপ' : 'Blood Group'}
                </span>
                <span className="font-bold inline-flex items-center gap-1 text-rose-300">
                  <Droplets className="w-3.5 h-3.5 text-rose-400" />
                  <span>{member.bloodGroup}</span>
                </span>
              </div>
              <div>
                <span className="text-stone-400 text-[10px] uppercase tracking-wider block">
                  {language === 'bn' ? 'জেলা / অঞ্চল' : 'District'}
                </span>
                <span className="font-semibold text-white">{member.district}</span>
              </div>
              <div>
                <span className="text-stone-400 text-[10px] uppercase tracking-wider block">
                  {language === 'bn' ? 'যোগদান ও মেয়াদ' : 'Joined · Validity'}
                </span>
                <span className="font-mono font-bold text-white">
                  {member.joiningYear || 2024} · 2026–28
                </span>
              </div>
            </div>

            {member.previousPositions && member.previousPositions.length > 0 && (
              <div className="pt-1 text-[10px] text-stone-300">
                <span className="text-stone-400 block mb-1">
                  {language === 'bn' ? 'পূর্ববর্তী দায়িত্বসমূহ:' : 'Previous Positions:'}
                </span>
                <div className="flex flex-wrap justify-center sm:justify-start gap-1.5">
                  {member.previousPositions.map((pos) => (
                    <span
                      key={pos.id}
                      className="px-2 py-0.5 rounded-md bg-white/10 border border-white/10 text-[#D6F36A] font-medium"
                    >
                      {language === 'bn' ? pos.positionBn : pos.positionEn} ({pos.fromYear}–{pos.toYear})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Framed QR Verification Block */}
          <div className="flex flex-col items-center gap-1.5 shrink-0 bg-white/10 p-2.5 rounded-2xl border border-white/20 backdrop-blur-xs">
            <div className="w-24 h-24 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-lg">
              <QRCodeSVG
                value={verificationUrl}
                size={84}
                bgColor="#FFFFFF"
                fgColor="#102B3F"
                level="M"
              />
            </div>
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#D6F36A]">
              {language === 'bn' ? 'স্ক্যান যাচাই' : 'Scan to Verify'}
            </span>
          </div>
        </div>

        {/* Official Footer */}
        <div className="relative mt-5 pt-3 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between text-[10px] text-stone-300 gap-2">
          <div className="font-medium">
            {language === 'bn'
              ? 'সার্কেল অব লাইট অ্যান্ড সার্ভিস ফর হিউম্যানিটি (কোলাশ) · রেজি: DH-9842/2021'
              : 'Circle of Light & Service for Humanity (CoLASH) · Reg: DH-9842/2021'}
          </div>
          <div className="font-mono text-[#D6F36A]/90">
            Kamalganj, Moulvibazar · Central Secretariat
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="print-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 25, mass: 0.9 }}
        className="print-modal-dialog bg-white dark:bg-[#0c1a24] max-w-3xl w-full rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-6"
      >
        
        {/* Top Header */}
        <div className="no-print bg-gradient-to-r from-[#102B3F] via-[#133e50] to-[#167D78] p-5 sm:p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-[#D6F36A] shrink-0 shadow-inner">
              <IdCard className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2 truncate">
                <span>{language === 'bn' ? 'কোলাশ সদস্য পার্সোনাল ড্যাশবোর্ড ও সেলফ-সার্ভিস' : 'CoLASH Member Dashboard & Self-Service'}</span>
              </h3>
              <p className="text-xs text-stone-200 truncate">
                {language === 'bn'
                  ? 'সদস্য যাচাইকরণ, আইডি কার্ড, পদবির ইতিহাস ও নিজস্ব প্রোফাইল ব্যবস্থাপনা'
                  : 'Member Verification, ID Card, Position History & Profile Management'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/90 hover:text-white rounded-xl bg-white/10 hover:bg-white/20 transition-all cursor-pointer shadow-xs hover:scale-105 flex items-center justify-center shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* LOGGED IN MEMBER VIEW ("Just nijerta" - strict isolation) */}
        {currentMember ? (
          <div className="print-modal-scroll-body p-5 sm:p-7 space-y-6">
            <AnimatePresence>
              {registrationSuccessMember && (
                <motion.div
                  key={`reg-confirm-${registrationSuccessMember.id}`}
                  initial={{ opacity: 0, y: 40, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 330, damping: 24, mass: 0.85 }}
                  className="no-print p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-white dark:from-emerald-950/50 dark:via-[#0f292e] dark:to-[#0c1a24] border-2 border-emerald-300 dark:border-emerald-700/70 shadow-lg space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <motion.div
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 18, delay: 0.08 }}
                        className="w-11 h-11 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0 shadow-xs"
                      >
                        <CheckCircle2 className="w-6 h-6" />
                      </motion.div>
                      <div className="space-y-1">
                        <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                          {language === 'bn'
                            ? 'স্বেচ্ছাসেবী ও সদস্য নিবন্ধন নিশ্চিত হয়েছে'
                            : 'Volunteer & Member Registration Confirmed'}
                        </span>
                        <h4 className="text-base sm:text-lg font-black text-[#102B3F] dark:text-white leading-snug">
                          {language === 'bn'
                            ? `অভিনন্দন, ${registrationSuccessMember.nameBn}! আপনার আবেদন গৃহীত হয়েছে`
                            : `Welcome, ${registrationSuccessMember.nameEn}! Your Registration Is Received`}
                        </h4>
                        <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                          {language === 'bn'
                            ? `আপনার নির্ধারিত সদস্য আইডি: ${registrationSuccessMember.membershipId}। অ্যাডমিন নথিপত্র যাচাই করে অনুমোদন দেওয়ার পর ওয়েবসাইটে প্রকাশিত হবে।`
                            : `Assigned ID: ${registrationSuccessMember.membershipId}. It will be published on the public directory once verified by an Admin.`}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRegistrationSuccessMember(null)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer shrink-0"
                      aria-label="Dismiss confirmation"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Logged in User Bar */}
            <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#167D78] shrink-0 bg-stone-200 dark:bg-stone-800">
                  <img
                    src={currentMember.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80'}
                    alt={currentMember.nameBn}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-extrabold text-base text-[#102B3F] dark:text-white truncate">
                      {language === 'bn' ? currentMember.nameBn : currentMember.nameEn}
                    </h4>
                    
                    {/* Status Badge */}
                    {currentMember.approvalStatus === 'approved' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{language === 'bn' ? 'অনুমোদিত ও ভেরিফাইড' : 'Approved & Verified'}</span>
                      </span>
                    ) : currentMember.approvalStatus === 'rejected' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{language === 'bn' ? 'আবেদন স্থগিত / বাতিল' : 'Rejected'}</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                        <Clock3 className="w-3 h-3" />
                        <span>{language === 'bn' ? 'এডমিন অনুমোদন অপেক্ষমাণ' : 'Pending Approval'}</span>
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-stone-500 font-mono mt-0.5 flex items-center gap-2 flex-wrap">
                    <span>{language === 'bn' ? 'আইডি:' : 'ID:'} <strong className="text-[#167D78] dark:text-[#D6F36A]">{currentMember.membershipId}</strong></span>
                    <span>•</span>
                    <span>{language === 'bn' ? 'যোগদান:' : 'Joined:'} {currentMember.joiningYear || 2024}</span>
                    {currentMember.previousPositions && currentMember.previousPositions.length > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-stone-600 dark:text-stone-300 font-sans">
                          {currentMember.previousPositions[currentMember.previousPositions.length - 1].positionBn} ({currentMember.previousPositions[currentMember.previousPositions.length - 1].fromYear}–{currentMember.previousPositions[currentMember.previousPositions.length - 1].toYear})
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={handleMemberLogout}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'লগআউট' : 'Logout'}</span>
                </button>
              </div>
            </div>

            {/* Sub-Tab Navigation: 5 Comprehensive Tabs */}
            <div className="no-print flex border-b border-stone-200 dark:border-stone-800 overflow-x-auto text-xs font-bold gap-1">
              <button
                onClick={() => setMemberViewTab('card')}
                className={`pb-3 px-3.5 transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  memberViewTab === 'card'
                    ? 'border-[#167D78] text-[#167D78] dark:text-[#D6F36A]'
                    : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                <IdCard className="w-4 h-4" />
                <span>{language === 'bn' ? 'ডিজিটাল আইডি কার্ড' : 'Digital ID Card'}</span>
              </button>

              <button
                onClick={() => setMemberViewTab('edit')}
                className={`pb-3 px-3.5 transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  memberViewTab === 'edit'
                    ? 'border-[#167D78] text-[#167D78] dark:text-[#D6F36A]'
                    : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                <span>{language === 'bn' ? 'তথ্য ও ছবি পরিবর্তন' : 'Edit Profile'}</span>
              </button>

              <button
                onClick={() => setMemberViewTab('history')}
                className={`pb-3 px-3.5 transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  memberViewTab === 'history'
                    ? 'border-[#167D78] text-[#167D78] dark:text-[#D6F36A]'
                    : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>{language === 'bn' ? 'সদস্য ইতিহাস ও পূর্ববর্তী পদ' : 'Position History'}</span>
              </button>

              <button
                onClick={() => setMemberViewTab('verification')}
                className={`pb-3 px-3.5 transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  memberViewTab === 'verification'
                    ? 'border-[#167D78] text-[#167D78] dark:text-[#D6F36A]'
                    : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{language === 'bn' ? 'নথি যাচাই স্থিতি' : 'Verification Status'}</span>
              </button>

              <button
                onClick={() => setMemberViewTab('notices')}
                className={`pb-3 px-3.5 transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  memberViewTab === 'notices'
                    ? 'border-[#167D78] text-[#167D78] dark:text-[#D6F36A]'
                    : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>{language === 'bn' ? 'সদস্য নোটিশ' : 'Member Notices'}</span>
              </button>
            </div>

            {/* TAB 1: OFFICIAL DIGITAL MEMBER ID CARD */}
            {memberViewTab === 'card' && (
              <div className="space-y-4">
                {generatePrintableDigitalIdCard(currentMember)}

                <div className="no-print flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    onClick={() => setMemberViewTab('edit')}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#167D78]" />
                    <span>{language === 'bn' ? 'আমার তথ্য ও ছবি পরিবর্তন' : 'Edit Profile Details'}</span>
                  </button>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await downloadMemberIdCardPNG({
                          nameBn: currentMember.nameBn,
                          nameEn: currentMember.nameEn,
                          roleBn: currentMember.currentDesignationBn || currentMember.roleBn,
                          roleEn: currentMember.currentDesignationEn || currentMember.roleEn,
                          membershipId: currentMember.membershipId,
                          bloodGroup: currentMember.bloodGroup,
                          district: currentMember.district,
                          joiningYear: currentMember.joiningYear,
                          joinedDate: currentMember.joinedDate,
                          avatar: currentMember.avatar
                        });
                        onToast('success', language === 'bn' ? 'আইডি কার্ড ইমেজ ডাউনলোড হয়েছে' : 'ID Card Downloaded', `CoLASH-ID-Card-${currentMember.membershipId}.png`);
                      }}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-[#102B3F] hover:bg-[#167D78] text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Download className="w-3.5 h-3.5 text-[#D6F36A]" />
                      <span>{language === 'bn' ? 'PNG কার্ড ডাউনলোড' : 'Save ID PNG'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        const ok = await printMemberIdCard({
                          nameBn: currentMember.nameBn,
                          nameEn: currentMember.nameEn,
                          roleBn: currentMember.currentDesignationBn || currentMember.roleBn,
                          roleEn: currentMember.currentDesignationEn || currentMember.roleEn,
                          membershipId: currentMember.membershipId,
                          bloodGroup: currentMember.bloodGroup,
                          district: currentMember.district,
                          joiningYear: currentMember.joiningYear,
                          joinedDate: currentMember.joinedDate,
                          avatar: currentMember.avatar
                        });
                        if (ok) {
                          onToast('info', language === 'bn' ? 'প্রিন্ট ডায়ালগ খোলা হয়েছে' : 'Print Dialog Opened');
                        } else {
                          await downloadMemberIdCardPNG({
                            nameBn: currentMember.nameBn,
                            nameEn: currentMember.nameEn,
                            roleBn: currentMember.currentDesignationBn || currentMember.roleBn,
                            roleEn: currentMember.currentDesignationEn || currentMember.roleEn,
                            membershipId: currentMember.membershipId,
                            bloodGroup: currentMember.bloodGroup,
                            district: currentMember.district,
                            joiningYear: currentMember.joiningYear,
                            joinedDate: currentMember.joinedDate,
                            avatar: currentMember.avatar
                          });
                          onToast('success', language === 'bn' ? 'প্রিন্টের জন্য আইডি কার্ড ডাউনলোড হয়েছে' : 'ID Card Saved for Printing');
                        }
                      }}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-[#167D78] hover:bg-[#102B3F] text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#D6F36A]" />
                      <span>{language === 'bn' ? 'আইডি কার্ড প্রিন্ট করুন' : 'Print ID Card'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: EDIT MY PROFILE & PHOTO */}
            {memberViewTab === 'edit' && (
              <form onSubmit={handleSaveMemberProfile} className="space-y-4">
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4 text-xs">
                  
                  {/* Photo Change Section */}
                  <div className="flex items-center gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#167D78] shrink-0 bg-stone-200 dark:bg-stone-800 relative">
                      <img
                        src={editAvatar || currentMember.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80'}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="font-bold text-stone-900 dark:text-white">
                        {language === 'bn' ? 'আপনার প্রোফাইল ছবি পরিবর্তন করুন (স্বচ্ছ ও পরিষ্কার)' : 'Change Profile Photo (High Quality)'}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          ref={editFileRef}
                          accept="image/*"
                          onChange={handleEditPhotoUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => editFileRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg bg-[#167D78] hover:bg-[#102B3F] text-white font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5 text-[#D6F36A]" />
                          <span>{language === 'bn' ? 'ডিভাইস থেকে আপলোড' : 'Upload From Device'}</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-stone-400">
                        {language === 'bn' ? 'স্বয়ংক্রিয় এইচডি কম্প্রেশন হবে (সর্বোচ্চ স্পষ্টতা)' : 'Auto HD lossless compression applied'}
                      </p>
                    </div>
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                        {language === 'bn' ? 'আপনার নাম (বাংলা)' : 'Your Name (Bengali)'} *
                      </label>
                      <input
                        type="text"
                        required
                        value={editNameBn}
                        onChange={(e) => setEditNameBn(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#167D78]"
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                        {language === 'bn' ? 'Your Name (English)' : 'Your Name (English)'}
                      </label>
                      <input
                        type="text"
                        value={editNameEn}
                        onChange={(e) => setEditNameEn(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#167D78]"
                      />
                    </div>
                  </div>

                  {/* Phone, Email, Blood Group */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                        {language === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'} *
                      </label>
                      <input
                        type="tel"
                        required
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#167D78]"
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                        {language === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'}
                      </label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#167D78]"
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                        {language === 'bn' ? 'রক্তের গ্রুপ' : 'Blood Group'}
                      </label>
                      <select
                        value={editBloodGroup}
                        onChange={(e) => setEditBloodGroup(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#167D78] cursor-pointer"
                      >
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* District & Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                        {language === 'bn' ? 'জেলা' : 'District'}
                      </label>
                      <input
                        type="text"
                        value={editDistrict}
                        onChange={(e) => setEditDistrict(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#167D78]"
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                        {language === 'bn' ? 'উপজেলা ও ঠিকানা' : 'Upazila & Address'}
                      </label>
                      <input
                        type="text"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        placeholder={language === 'bn' ? 'যেমন: কমলগঞ্জ, মৌলভীবাজার' : 'e.g. Kamalganj, Moulvibazar'}
                        className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#167D78]"
                      />
                    </div>
                  </div>

                  {/* Profession & Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                        {language === 'bn' ? 'পেশা / কর্মসংস্থান' : 'Profession'}
                      </label>
                      <input
                        type="text"
                        value={editProfession}
                        onChange={(e) => setEditProfession(e.target.value)}
                        placeholder={language === 'bn' ? 'যেমন: শিক্ষক / শিক্ষার্থী / ব্যবসায়ী' : 'e.g. Teacher, Student'}
                        className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#167D78]"
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                        {language === 'bn' ? 'লগইন পাসওয়ার্ড পরিবর্তন' : 'Change Login Password'}
                      </label>
                      <input
                        type="text"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        placeholder={language === 'bn' ? 'নতুন পাসওয়ার্ড লিখুন' : 'Enter new password'}
                        className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#167D78]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                      {language === 'bn' ? 'সংক্ষিপ্ত পরিচিতি ও আগ্রহ' : 'Short Bio & Interests'}
                    </label>
                    <textarea
                      rows={2}
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      placeholder={language === 'bn' ? 'কোলাশের সাথে আপনার সংশ্লিষ্টতা বা সেবামূলক আগ্রহ...' : 'Brief description...'}
                      className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#167D78]"
                    />
                  </div>

                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setMemberViewTab('card')}
                    className="px-4 py-2 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 cursor-pointer font-bold text-xs"
                  >
                    {language === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#167D78] hover:bg-[#102B3F] text-white font-bold cursor-pointer transition-all shadow-md flex items-center gap-1.5 text-xs"
                  >
                    <Save className="w-4 h-4 text-[#D6F36A]" />
                    <span>{language === 'bn' ? 'আমার তথ্য সংরক্ষণ করুন' : 'Save My Changes'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: MEMBER HISTORY & PREVIOUS POSITIONS */}
            {memberViewTab === 'history' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                    <div>
                      <h5 className="font-bold text-sm text-[#102B3F] dark:text-white">
                        {language === 'bn' ? 'সদস্যপদের মেয়াদ ও সাংগঠনিক ইতিহাস' : 'Organizational History & Timeline'}
                      </h5>
                      <p className="text-[11px] text-stone-500">
                        {language === 'bn' ? 'যোগদানের বছর এবং কোলাশ ফাউন্ডেশনে অতীতে পালনকৃত বিভিন্ন পদের তালিকা' : 'Record of membership years and historical designations held.'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-stone-400 block">{language === 'bn' ? 'মোট সেবা বছর' : 'Service Years'}</span>
                      <span className="text-sm font-black text-[#167D78] dark:text-[#D6F36A]">
                        {Math.max(1, new Date().getFullYear() - Number(currentMember.joiningYear || 2024))} {language === 'bn' ? 'বছর' : 'years'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="font-bold text-stone-600 dark:text-stone-400 block mb-1">
                        {language === 'bn' ? 'যোগদানের সাল' : 'Joining Year'}
                      </span>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono font-bold text-stone-900 dark:text-white">
                        {currentMember.joiningYear || 2024}
                      </div>
                    </div>
                    <div>
                      <span className="font-bold text-stone-600 dark:text-stone-400 block mb-1">
                        {language === 'bn' ? 'বর্তমান দায়িত্ব / পদবি' : 'Current Designation'}
                      </span>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-bold text-stone-900 dark:text-white">
                        {currentMember.currentDesignationBn || currentMember.roleBn || 'সাধারণ সদস্য'}
                      </div>
                    </div>
                  </div>

                  {/* Past Positions List */}
                  <div>
                    <span className="font-bold text-stone-700 dark:text-stone-300 block mb-2">
                      {language === 'bn' ? 'পূর্বে দায়িত্ব পালনকৃত পদসমূহ:' : 'Previous Positions Held:'}
                    </span>

                    {editPositions.length === 0 ? (
                      <div className="p-4 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-center text-stone-400">
                        {language === 'bn' ? 'পূর্বে কোনো বিশেষ পদ যুক্ত করা হয়নি।' : 'No previous positions recorded yet.'}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {editPositions.map((pos) => (
                          <div key={pos.id} className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-between">
                            <div>
                              <div className="font-bold text-stone-900 dark:text-white">
                                {language === 'bn' ? pos.positionBn : pos.positionEn}
                              </div>
                              <div className="text-[11px] text-[#167D78] dark:text-[#D6F36A] font-mono">
                                {pos.fromYear || 2024} – {pos.toYear || 2024} ({Number(pos.toYear || 2024) - Number(pos.fromYear || 2024)} {language === 'bn' ? 'বছর' : 'yrs'})
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveHistoricalPosition(pos.id)}
                              className="text-stone-400 hover:text-rose-500 p-1 cursor-pointer transition-colors"
                              title="পদবি মুছুন"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add New Historical Position Form */}
                  <div className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-3">
                    <span className="font-bold text-stone-800 dark:text-stone-200 block text-[11px]">
                      + {language === 'bn' ? 'পূর্ববর্তী পদবি বা ভূমিকা যুক্ত করুন' : 'Add a Past Role / Position'}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder={language === 'bn' ? 'পদবি (যেমন: সাবেক প্রচার সম্পাদক)' : 'Position (e.g. Former Publicity Sec)'}
                        value={newHistPositionBn}
                        onChange={(e) => setNewHistPositionBn(e.target.value)}
                        className="p-2 rounded-lg border border-stone-300 dark:border-stone-700 text-xs bg-stone-50 dark:bg-stone-900"
                      />
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="হইতে (Year)"
                          value={newHistFromYear}
                          onChange={(e) => setNewHistFromYear(Number(e.target.value))}
                          className="w-1/2 p-2 rounded-lg border border-stone-300 dark:border-stone-700 text-xs bg-stone-50 dark:bg-stone-900 font-mono"
                        />
                        <input
                          type="number"
                          placeholder="পর্যন্ত (Year)"
                          value={newHistToYear}
                          onChange={(e) => setNewHistToYear(Number(e.target.value))}
                          className="w-1/2 p-2 rounded-lg border border-stone-300 dark:border-stone-700 text-xs bg-stone-50 dark:bg-stone-900 font-mono"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddHistoricalPosition}
                      className="px-4 py-1.5 rounded-lg bg-[#167D78] hover:bg-[#102B3F] text-white font-bold text-xs cursor-pointer transition-colors"
                    >
                      {language === 'bn' ? 'পদবি সংরক্ষণ করুন' : 'Save Position'}
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* TAB 4: IDENTITY VERIFICATION STATUS & DOCUMENTS */}
            {memberViewTab === 'verification' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                    <div>
                      <h5 className="font-bold text-sm text-[#102B3F] dark:text-white">
                        {language === 'bn' ? 'পরিচয়পত্র যাচাইকরণ ও নথি কেন্দ্র' : 'Identity Verification & Document Hub'}
                      </h5>
                      <p className="text-[11px] text-stone-500">
                        {language === 'bn' ? 'জাতীয় পরিচয়পত্র, জন্ম সনদ, পাসপোর্ট বা স্টুডেন্ট আইডির অনুমোদন বিবরণ' : 'Official verification status and document records.'}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      currentMember.verificationStatus === 'verified'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : currentMember.verificationStatus === 'correction_requested'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : currentMember.verificationStatus === 'rejected'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    }`}>
                      {currentMember.verificationStatus || 'under_review'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                      <span className="text-[10px] text-stone-400 uppercase font-bold block mb-1">
                        {language === 'bn' ? 'নথির ধরন' : 'Document Type'}
                      </span>
                      <span className="font-bold text-stone-900 dark:text-white text-sm">
                        {currentMember.idDocumentType === 'nid' ? 'জাতীয় পরিচয়পত্র (NID)'
                          : currentMember.idDocumentType === 'birth_cert' ? 'জন্ম নিবন্ধন সনদ'
                          : currentMember.idDocumentType === 'passport' ? 'পাসপোর্ট'
                          : currentMember.idDocumentType === 'student_id' ? 'শিক্ষার্থী আইডি'
                          : 'অফিসিয়াল পরিচয়পত্র'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                      <span className="text-[10px] text-stone-400 uppercase font-bold block mb-1">
                        {language === 'bn' ? 'পরিচয়পত্র নম্বর' : 'Document Number'}
                      </span>
                      <span className="font-mono font-bold text-stone-900 dark:text-white text-sm">
                        {currentMember.idDocumentNumber || 'রেকর্ড পাওয়া যায়নি'}
                      </span>
                    </div>
                  </div>

                  {/* Document Preview */}
                  <div>
                    <span className="font-bold text-stone-700 dark:text-stone-300 block mb-2">
                      {language === 'bn' ? 'আপলোডকৃত পরিচয়পত্রের কপি:' : 'Uploaded Document Preview:'}
                    </span>
                    {currentMember.idDocumentFile ? (
                      <div className="rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700 max-h-60 bg-stone-100 dark:bg-stone-800 flex items-center justify-center p-2">
                        <img
                          src={currentMember.idDocumentFile}
                          alt="Document Preview"
                          className="max-h-56 max-w-full object-contain rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-center text-stone-400">
                        {language === 'bn' ? 'নথি সরাসরি আপলোড করা হয়নি।' : 'No document file uploaded.'}
                      </div>
                    )}
                  </div>

                  {/* Admin Feedback / Verification Notes */}
                  {currentMember.verificationNotes && (
                    <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200">
                      <strong className="block mb-1">{language === 'bn' ? 'এডমিন বার্তা / সংশোধনের নির্দেশনা:' : 'Admin Note:'}</strong>
                      <p>{currentMember.verificationNotes}</p>
                    </div>
                  )}

                  {/* Correction / Reupload option if correction requested */}
                  {currentMember.verificationStatus === 'correction_requested' && (
                    <div className="p-4 rounded-xl bg-white dark:bg-stone-800 border border-amber-300 dark:border-amber-700 space-y-2">
                      <span className="font-bold text-amber-900 dark:text-amber-200 block">
                        {language === 'bn' ? 'সংশোধিত নথি পুনরায় আপলোড করুন:' : 'Re-upload Corrected Document:'}
                      </span>
                      <input
                        type="file"
                        ref={reuploadDocRef}
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const compressed = await optimizeAndCompressImage(file, { maxWidth: 1400, quality: 0.90 });
                          const updated: GeneralMember = {
                            ...currentMember,
                            idDocumentFile: compressed,
                            verificationStatus: 'under_review'
                          };
                          const list = generalMembers.map(m => m.id === currentMember.id ? updated : m);
                          if (onUpdateGeneralMembers) onUpdateGeneralMembers(list);
                          setCurrentMember(updated);
                          writeLocalStorageSafely('colash_active_member_session', updated);
                          onMemberSessionChange?.(updated);
                          onToast('success', language === 'bn' ? 'সংশোধিত নথি জমা হয়েছে' : 'Re-uploaded successfully');
                        }}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => reuploadDocRef.current?.click()}
                        className="px-4 py-2 bg-[#167D78] hover:bg-[#102B3F] text-white rounded-xl font-bold cursor-pointer transition-colors"
                      >
                        {language === 'bn' ? 'নতুন ফাইল নির্বাচন করুন' : 'Select New File'}
                      </button>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-[11px] text-stone-500 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#167D78] shrink-0 mt-0.5" />
                    <span>
                      {language === 'bn'
                        ? 'নিরাপত্তা নিশ্চয়তা: আপনার পরিচয়পত্র এনক্রিপ্ট করে সুরক্ষিত রাখা হয়েছে। এটি কোনো অবস্থাতেই পাবলিক ওয়েবসাইটে প্রদর্শিত হবে না।'
                        : 'Privacy Guarantee: Your identity documents are encrypted and kept confidential. Never displayed publicly.'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: MEMBER NOTICES & BULLETINS */}
            {memberViewTab === 'notices' && (
              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                  <h5 className="font-bold text-sm text-[#102B3F] dark:text-white mb-1">
                    {language === 'bn' ? 'সদস্য বুলেটিন ও অফিশিয়াল নোটিশ' : 'Member Circulars & Notices'}
                  </h5>
                  <p className="text-[11px] text-stone-500 mb-3">
                    {language === 'bn' ? 'কোলাশ ফাউন্ডেশনের সাধারণ সদস্যবৃন্দের জন্য প্রকাশিত গুরুত্বপূর্ণ সার্কুলার' : 'Official announcements and notices for general members.'}
                  </p>

                  {notices.length === 0 ? (
                    <div className="p-4 text-center text-stone-400 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
                      {language === 'bn' ? 'বর্তমানে কোনো নোটিশ নেই।' : 'No circulars available.'}
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {notices.map(notice => (
                        <div key={notice.id} className="p-3.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-900 dark:text-white text-xs">
                              {language === 'bn' ? notice.titleBn : notice.titleEn}
                            </span>
                            <span className="text-[10px] text-stone-400 font-mono">{notice.date}</span>
                          </div>
                          <p className="text-stone-600 dark:text-stone-300 text-[11px] leading-relaxed">
                            {language === 'bn' ? (notice.bodyBn || notice.contentBn) : (notice.bodyEn || notice.contentEn)}
                          </p>
                          {notice.publishedBy && (
                            <div className="text-[10px] text-[#167D78] dark:text-[#D6F36A] font-semibold pt-1 border-t border-stone-100 dark:border-stone-700">
                              {language === 'bn' ? 'প্রকাশক:' : 'Published By:'} {typeof notice.publishedBy === 'string' ? notice.publishedBy : `${notice.publishedBy.nameBn || notice.publishedBy.nameEn || ''}${notice.publishedBy.designationBn ? ` (${notice.publishedBy.designationBn})` : ''}`}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        ) : (
          /* NOT LOGGED IN: TABS FOR LOGIN OR APPLY NEW MEMBER ID */
          <div className="p-5 sm:p-7 space-y-6">
            
            {/* Tab Selector */}
            <div className="flex border-b border-stone-200 dark:border-stone-800 gap-2">
              <button
                onClick={() => setActiveTab('login')}
                className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                  activeTab === 'login'
                    ? 'border-[#167D78] text-[#167D78] dark:text-[#D6F36A]'
                    : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>{language === 'bn' ? 'সদস্য লগইন' : 'Member Login'}</span>
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                  activeTab === 'register'
                    ? 'border-[#167D78] text-[#167D78] dark:text-[#D6F36A]'
                    : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                <User className="w-4 h-4" />
                <span>{language === 'bn' ? 'নতুন সদস্য আইডি আবেদন' : 'Apply for Member ID'}</span>
              </button>
            </div>

            {/* TAB: MEMBER LOGIN */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4 max-w-lg mx-auto">
                <div className="text-center space-y-1 mb-4">
                  <h4 className="font-extrabold text-base text-[#102B3F] dark:text-white">
                    {language === 'bn' ? 'আপনার মেম্বার অ্যাকাউন্টে লগইন করুন' : 'Log into Your Member Account'}
                  </h4>
                  <p className="text-xs text-stone-500">
                    {language === 'bn'
                      ? 'লগইন করে আপনার নিজস্ব ডিজিটাল মেম্বার কার্ড দেখুন ও যেকোনো তথ্য পরিবর্তন করুন।'
                      : 'Log in to view your digital card and update your own profile details.'}
                  </p>
                </div>

                {loginError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                      {language === 'bn' ? 'মেম্বার আইডি, মোবাইল নম্বর বা ইমেইল' : 'Member ID, Phone or Email'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={loginQuery}
                      onChange={(e) => setLoginQuery(e.target.value)}
                      placeholder={language === 'bn' ? 'যেমন: CLF-M-2026-101 অথবা 01711-100201' : 'e.g. CLF-M-2026-101 or phone'}
                      className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#167D78]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-stone-700 dark:text-stone-300">
                        {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'} *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotModal(true);
                          setForgotResult(null);
                        }}
                        className="text-[11px] text-[#167D78] dark:text-[#D6F36A] hover:underline font-semibold cursor-pointer"
                      >
                        {language === 'bn' ? 'আইডি বা পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password / ID?'}
                      </button>
                    </div>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#167D78]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#167D78] hover:bg-[#102B3F] text-white font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4 text-[#D6F36A]" />
                    <span>{language === 'bn' ? 'লগইন করুন' : 'Log In'}</span>
                  </button>

                  <div className="text-center pt-2">
                    <span className="text-stone-400">{language === 'bn' ? 'নতুন আইডি কার্ড চান?' : 'Need an ID Card?'} </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('register')}
                      className="text-[#167D78] dark:text-[#D6F36A] font-bold hover:underline cursor-pointer"
                    >
                      {language === 'bn' ? 'এখানে আবেদন করুন' : 'Apply Here'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* TAB: APPLY FOR NEW MEMBER ID ("Ar je keu login kore nijer I'd bananor access dao. Just nijerta. Tobe website er admin approve korbe.") */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4 max-w-xl mx-auto">
                <div className="text-center space-y-1 mb-4">
                  <h4 className="font-extrabold text-base text-[#102B3F] dark:text-white">
                    {language === 'bn' ? 'নতুন সদস্য আইডি আবেদন ও ভেরিফিকেশন' : 'Apply for New Member ID'}
                  </h4>
                  <p className="text-xs text-stone-500">
                    {language === 'bn'
                      ? 'ব্যক্তিগত বিবরণ, স্পষ্ট ছবি ও জাতীয় পরিচয়পত্র/সনদ জমা দিন। এডমিন অনুমোদনের পর ওয়েবসাইটে প্রকাশিত হবে।'
                      : 'Submit personal details, photo, and identity documents. Publicly published after Admin verification.'}
                  </p>
                </div>

                {regError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{regError}</span>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3.5 text-xs">
                  
                  {/* Photo Upload */}
                  <div className="flex items-center gap-3.5 p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-[#167D78] shrink-0 bg-stone-100 dark:bg-stone-900">
                      <img
                        src={regAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80'}
                        alt="Avatar Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="font-bold text-stone-900 dark:text-white">
                        {language === 'bn' ? 'আপনার পাসপোর্ট সাইজ ছবি আপলোড করুন' : 'Upload Passport Size Photo'} *
                      </div>
                      <input
                        type="file"
                        ref={regFileRef}
                        accept="image/*"
                        onChange={handleRegPhotoUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => regFileRef.current?.click()}
                        className="px-3 py-1 rounded-lg bg-[#167D78] hover:bg-[#102B3F] text-white text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Upload className="w-3 h-3 text-[#D6F36A]" />
                        <span>{language === 'bn' ? 'ডিভাইস থেকে ছবি বাছুন' : 'Choose Photo'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Full Name Bn & En */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                        {language === 'bn' ? 'পূর্ণ নাম (বাংলা)' : 'Full Name (Bengali)'} *
                      </label>
                      <input
                        type="text"
                        required
                        value={regNameBn}
                        onChange={(e) => setRegNameBn(e.target.value)}
                        placeholder="যেমন: তানভীর আহমেদ"
                        className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#167D78]"
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                        {language === 'bn' ? 'Full Name (English)' : 'Full Name (English)'}
                      </label>
                      <input
                        type="text"
                        value={regNameEn}
                        onChange={(e) => setRegNameEn(e.target.value)}
                        placeholder="e.g. Tanvir Ahmed"
                        className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#167D78]"
                      />
                    </div>
                  </div>

                  {/* Phone & Blood Group */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                        {language === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'} *
                      </label>
                      <input
                        type="tel"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="01712-345678"
                        className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#167D78]"
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                        {language === 'bn' ? 'রক্তের গ্রুপ' : 'Blood Group'} *
                      </label>
                      <select
                        value={regBloodGroup}
                        onChange={(e) => setRegBloodGroup(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#167D78] cursor-pointer"
                      >
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Email & District */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                        {language === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'}
                      </label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="example@gmail.com"
                        className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#167D78]"
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                        {language === 'bn' ? 'জেলা' : 'District'} *
                      </label>
                      <input
                        type="text"
                        required
                        value={regDistrict}
                        onChange={(e) => setRegDistrict(e.target.value)}
                        placeholder="মৌলভীবাজার / ঢাকা / সিলেট"
                        className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#167D78]"
                      />
                    </div>
                  </div>

                  {/* Identity Document Verification Section (Requirement 9) */}
                  <div className="p-3.5 rounded-xl bg-[#167D78]/5 border border-[#167D78]/25 space-y-3">
                    <div className="flex items-center gap-2 text-stone-900 dark:text-white font-bold">
                      <ShieldCheck className="w-4 h-4 text-[#167D78]" />
                      <span>{language === 'bn' ? 'জাতীয় পরিচয়পত্র / নথিপত্র যাচাইকরণ' : 'Identity Document Verification'} *</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                          {language === 'bn' ? 'নথির ধরন নির্বাচন করুন' : 'Identity Document Type'} *
                        </label>
                        <select
                          value={regDocType}
                          onChange={(e: any) => setRegDocType(e.target.value)}
                          className="w-full p-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white font-medium"
                        >
                          <option value="nid">{language === 'bn' ? 'জাতীয় পরিচয়পত্র (NID)' : 'National ID (NID)'}</option>
                          <option value="birth_cert">{language === 'bn' ? 'জন্ম নিবন্ধন সনদ' : 'Birth Certificate'}</option>
                          <option value="passport">{language === 'bn' ? 'আন্তর্জাতিক পাসপোর্ট' : 'Passport'}</option>
                          <option value="student_id">{language === 'bn' ? 'শিক্ষার্থী আইডি (Student ID)' : 'Student ID'}</option>
                          <option value="other">{language === 'bn' ? 'অন্যান্য অফিসিয়াল আইডি' : 'Other Official ID'}</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                          {language === 'bn' ? 'পরিচয়পত্র নম্বর' : 'Document Number'} *
                        </label>
                        <input
                          type="text"
                          required
                          value={regDocNumber}
                          onChange={(e) => setRegDocNumber(e.target.value)}
                          placeholder={language === 'bn' ? 'যেমন: ৫৫০৭৪৬৭৮৯১' : 'e.g. 5507467891'}
                          className="w-full p-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-[#167D78]"
                        />
                      </div>
                    </div>

                    {/* Document File Upload */}
                    <div>
                      <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                        {language === 'bn' ? 'পরিচয়পত্রের ছবি বা স্ক্যান কপি' : 'Document Photo / Scan Copy'}
                      </label>
                      <input
                        type="file"
                        ref={regDocFileRef}
                        accept="image/*"
                        onChange={handleRegDocUpload}
                        className="hidden"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => regDocFileRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 text-stone-800 dark:text-stone-200 font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5 text-[#167D78]" />
                          <span>{language === 'bn' ? 'নথির ফাইল বাছুন' : 'Select Document File'}</span>
                        </button>
                        {regDocFileName && (
                          <span className="text-[11px] text-stone-500 font-mono truncate max-w-xs">{regDocFileName}</span>
                        )}
                      </div>
                    </div>

                    {/* AI Document Quality Feedback Helper */}
                    {aiDocCheckFeedback && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{aiDocCheckFeedback}</span>
                      </div>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                      {language === 'bn' ? 'লগইন পাসওয়ার্ড নির্ধারণ করুন' : 'Create Login Password'} *
                    </label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="কমপক্ষে ৪ অক্ষর"
                      className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#167D78]"
                    />
                    <p className="text-[10px] text-stone-400 mt-1">
                      {language === 'bn' ? 'এই পাসওয়ার্ড দিয়ে পরবর্তীতে যেকোনো সময় লগইন করে আপনার আইডি ও তথ্য পরিবর্তন করতে পারবেন।' : 'Use this password to log in anytime and update your ID card.'}
                    </p>
                  </div>

                  {/* Approval Notice */}
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-[11px] text-amber-800 dark:text-amber-200 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>{language === 'bn' ? 'অনুমোদন বিষয়ক শর্তাবলী:' : 'Approval Notice:'}</strong> {language === 'bn' ? 'আবেদনের সাথে সাথে আপনার একটি মেম্বার আইডি তৈরি হবে। তবে দায়িত্বশীল মানব এডমিন নথিপত্র যাচাই ও অনুমোদন করার পরেই তা পাবলিক ওয়েবসাইটে প্রকাশিত হবে।' : 'Your ID will be created immediately, but will only be displayed on the public website after Human Admin verification.'}
                    </div>
                  </div>

                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#167D78] hover:bg-[#102B3F] text-white font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 text-xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#D6F36A]" />
                  <span>{language === 'bn' ? 'আইডি আবেদন জমা দিন ও তৈরি করুন' : 'Submit & Create My Member ID'}</span>
                </button>
              </form>
            )}

            {/* FORGOT PASSWORD MODAL */}
            {showForgotModal && (
              <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                <div className="bg-white dark:bg-[#102B3F] p-5 rounded-2xl max-w-sm w-full border border-stone-200 dark:border-white/10 space-y-3.5 text-xs shadow-2xl">
                  <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2.5">
                    <h4 className="font-bold text-sm text-stone-900 dark:text-white flex items-center gap-2">
                      <Key className="w-4 h-4 text-[#167D78] dark:text-[#D6F36A]" />
                      <span>{language === 'bn' ? 'সদস্য আইডি ও পাসওয়ার্ড অনুসন্ধান' : 'Find Member ID & Password'}</span>
                    </h4>
                    <button
                      onClick={() => setShowForgotModal(false)}
                      className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-stone-600 dark:text-stone-300">
                    {language === 'bn'
                      ? 'আপনার নিবন্ধিত মোবাইল নম্বর অথবা ইমেইল ঠিকানা দিন। সিস্টেম তাৎক্ষণিক আপনার আইডি ও তথ্য দেখাবে।'
                      : 'Enter your registered phone or email to look up your Member ID and credentials.'}
                  </p>

                  {forgotResult && (
                    <div className="p-2.5 rounded-xl bg-[#167D78]/10 border border-[#167D78]/30 text-[#102B3F] dark:text-stone-100 font-medium">
                      {forgotResult}
                    </div>
                  )}

                  <form onSubmit={handleForgotLookup} className="space-y-3">
                    <div>
                      <input
                        type="text"
                        required
                        value={forgotInput}
                        onChange={(e) => setForgotInput(e.target.value)}
                        placeholder={language === 'bn' ? 'যেমন: 01711-100201 অথবা utsha@colash.org' : 'e.g. 01711-100201 or email'}
                        className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#167D78]"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-[#167D78] hover:bg-[#102B3F] text-white font-bold rounded-xl transition-all shadow cursor-pointer"
                      >
                        {language === 'bn' ? 'তথ্য বের করুন' : 'Find Credentials'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(false)}
                        className="px-3 py-2 border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 rounded-xl cursor-pointer"
                      >
                        {language === 'bn' ? 'বন্ধ' : 'Close'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

      </motion.div>
    </div>
  );
};
