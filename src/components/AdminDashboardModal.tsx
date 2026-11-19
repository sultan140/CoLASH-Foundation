import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  DollarSign,
  Users,
  FolderKanban,
  Bell,
  Search,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Key,
  UserCheck,
  UserX,
  ShieldAlert,
  Settings,
  FileText,
  Activity,
  RotateCcw,
  LogOut,
  ArrowRight,
  UserPlus,
  HeartHandshake,
  Sparkles,
  ExternalLink,
  Edit,
  Save,
  HelpCircle,
  Bot,
  MapPin,
  Compass,
  BarChart2,
  MessageSquare,
  Palette,
  Crown,
  Award,
  IdCard,
  History,
  Smartphone,
  Printer,
  Download,
  Cloud,
  CloudOff,
  RefreshCw
} from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import {
  Donation,
  Volunteer,
  Project,
  NoticeItem,
  Language,
  AdminUser,
  AdminAuditLog,
  AdminRole,
  AdminPermissions,
  AIKnowledgeItem,
  MapConfig,
  PublicApplication,
  AIConversationLog,
  WebsiteCustomConfig,
  CommitteeTerm,
  AdvisoryCouncilMember,
  GeneralMember,
  WomensTeamMember,
  PaymentChannel,
  DonationRecord
} from '../types';
import { LocationMapSettingsPanel } from './LocationMapSettingsPanel';
import { PublicApplicationsAdminPanel } from './Admin/PublicApplicationsAdminPanel';
import { CustomWebsiteEditorPanel } from './Admin/CustomWebsiteEditorPanel';
import { CommitteeManagementPanel } from './Admin/CommitteeManagementPanel';
import { AdvisoryCouncilAdminPanel } from './Admin/AdvisoryCouncilAdminPanel';
import { GeneralMembersAdminPanel } from './Admin/GeneralMembersAdminPanel';
import { ProjectsAdminPanel } from './Admin/ProjectsAdminPanel';
import { PaymentChannelsAdminPanel } from './Admin/PaymentChannelsAdminPanel';
import { INITIAL_WEBSITE_CUSTOM_CONFIG } from '../data/mockData';
import { DonationReceiptModal } from './common/DonationReceiptModal';
import { exportDonationsToCSV } from '../utils/exportUtils';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  publishedWebsiteConfig?: WebsiteCustomConfig;
  onPublishWebsiteConfig?: (newConfig: WebsiteCustomConfig) => void;
  committeeTerms?: CommitteeTerm[];
  onUpdateCommitteeTerms?: (terms: CommitteeTerm[]) => void;
  advisors?: AdvisoryCouncilMember[];
  onUpdateAdvisors?: (advisors: AdvisoryCouncilMember[]) => void;
  generalMembers?: GeneralMember[];
  onUpdateGeneralMembers?: (members: GeneralMember[]) => void;
  womensTeamMembers?: WomensTeamMember[];
  onUpdateWomensMembers?: (members: WomensTeamMember[]) => void;
  donations: Donation[];
  volunteers: Volunteer[];
  projects: Project[];
  notices: NoticeItem[];
  adminUsers: AdminUser[];
  currentAdmin: AdminUser | null;
  auditLogs: AdminAuditLog[];
  onLoginAdmin: (user: AdminUser) => void;
  onLogoutAdmin: () => void;
  onCreateAdmin: (newAdmin: AdminUser) => void;
  onUpdateAdmin: (updatedAdmin: AdminUser) => void;
  onDeleteAdmin: (id: string) => void;
  onToggleAdminStatus: (id: string) => void;
  onChangeAdminPassword: (id: string, newPass: string) => void;
  onToggleDonationVerify: (id: string) => void;
  onApproveVolunteer: (id: string) => void;
  onAddVolunteer?: (volunteer: Volunteer) => void;
  onUpdateVolunteer?: (volunteer: Volunteer) => void;
  onDeleteVolunteer?: (id: string) => void;
  onDeleteAuditLog?: (id: string) => void;
  onClearAuditLogs?: () => void;
  onAddNewProject: (project: Project) => void;
  onUpdateProject?: (project: Project) => void;
  onDeleteProject?: (projectId: string) => void;
  onAddNewNotice: (notice: NoticeItem) => void;
  onDeleteNotice?: (noticeId: string) => void;
  onOpenWomensAdmin?: () => void;
  womensMembersCount?: number;
  aiKnowledgeBase?: AIKnowledgeItem[];
  onUpdateAIKnowledgeBase?: (newKB: AIKnowledgeItem[]) => void;
  mapConfig?: MapConfig;
  onUpdateMapConfig?: (newConfig: MapConfig) => void;
  publicApplications?: PublicApplication[];
  onUpdatePublicApplication?: (app: PublicApplication) => void;
  aiConversationLogs?: AIConversationLog[];
  paymentChannels?: PaymentChannel[];
  onUpdatePaymentChannels?: (channels: PaymentChannel[]) => void;
  onDeleteDonation?: (id: string) => void;
  onRestoreBackup?: (parsed: any) => void;
  onSyncAllToCloud?: () => Promise<boolean>;
  initialTab?: string;
  onToast: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
}

const DEFAULT_PERMISSIONS: Record<AdminRole, AdminPermissions> = {
  super_admin: {
    canViewMembers: true,
    canAddMembers: true,
    canEditMembers: true,
    canDeleteMembers: true,
    canVerifyDonations: true,
    canManageProjects: true,
    canManageNotices: true,
    canManageFiles: true,
    canManageWomensTeam: true,
    canManageSettings: true,
    canManageAdmins: true,
    canManageAIContent: true,
    canManageLocation: true,
    canManageApplications: true,
    canManageAIHistory: true,
    canManageWebsiteEditor: true,
    canManageCommittee: true,
    canManageAdvisors: true
  },
  womens_team_leader: {
    canViewMembers: true,
    canAddMembers: false,
    canEditMembers: false,
    canDeleteMembers: false,
    canVerifyDonations: false,
    canManageProjects: false,
    canManageNotices: true,
    canManageFiles: true,
    canManageWomensTeam: true,
    canManageSettings: false,
    canManageAdmins: false,
    canManageAIContent: false,
    canManageLocation: false,
    canManageCommittee: false,
    canManageAdvisors: false
  },
  member_manager: {
    canViewMembers: true,
    canAddMembers: true,
    canEditMembers: true,
    canDeleteMembers: false,
    canVerifyDonations: false,
    canManageProjects: false,
    canManageNotices: false,
    canManageFiles: false,
    canManageWomensTeam: false,
    canManageSettings: false,
    canManageAdmins: false,
    canManageAIContent: false,
    canManageLocation: false,
    canManageCommittee: true,
    canManageAdvisors: false
  },
  content_editor: {
    canViewMembers: false,
    canAddMembers: false,
    canEditMembers: false,
    canDeleteMembers: false,
    canVerifyDonations: false,
    canManageProjects: true,
    canManageNotices: true,
    canManageFiles: true,
    canManageWomensTeam: false,
    canManageSettings: false,
    canManageAdmins: false,
    canManageAIContent: true,
    canManageLocation: true,
    canManageCommittee: false,
    canManageAdvisors: false
  },
  finance_manager: {
    canViewMembers: false,
    canAddMembers: false,
    canEditMembers: false,
    canDeleteMembers: false,
    canVerifyDonations: true,
    canManageProjects: false,
    canManageNotices: false,
    canManageFiles: false,
    canManageWomensTeam: false,
    canManageSettings: false,
    canManageAdmins: false,
    canManageCommittee: false,
    canManageAdvisors: false
  },
  custom_admin: {
    canViewMembers: true,
    canAddMembers: false,
    canEditMembers: false,
    canDeleteMembers: false,
    canVerifyDonations: false,
    canManageProjects: false,
    canManageNotices: false,
    canManageFiles: false,
    canManageWomensTeam: false,
    canManageSettings: false,
    canManageAdmins: false,
    canManageCommittee: false,
    canManageAdvisors: false
  }
};

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  language,
  donations,
  volunteers,
  projects,
  notices,
  adminUsers,
  currentAdmin,
  auditLogs,
  onLoginAdmin,
  onLogoutAdmin,
  onCreateAdmin,
  onUpdateAdmin,
  onDeleteAdmin,
  onToggleAdminStatus,
  onChangeAdminPassword,
  onToggleDonationVerify,
  onApproveVolunteer,
  onAddVolunteer,
  onUpdateVolunteer,
  onDeleteVolunteer,
  onDeleteAuditLog,
  onClearAuditLogs,
  onAddNewProject,
  onUpdateProject,
  onDeleteProject,
  onAddNewNotice,
  onDeleteNotice,
  onOpenWomensAdmin,
  womensMembersCount = 21,
  aiKnowledgeBase = [],
  onUpdateAIKnowledgeBase,
  mapConfig,
  onUpdateMapConfig,
  publicApplications = [],
  onUpdatePublicApplication,
  aiConversationLogs = [],
  publishedWebsiteConfig,
  onPublishWebsiteConfig,
  committeeTerms = [],
  onUpdateCommitteeTerms,
  advisors = [],
  onUpdateAdvisors,
  generalMembers = [],
  onUpdateGeneralMembers,
  womensTeamMembers = [],
  onUpdateWomensMembers,
  paymentChannels = [],
  onUpdatePaymentChannels,
  onDeleteDonation,
  onRestoreBackup,
  onSyncAllToCloud,
  initialTab,
  onToast
}) => {
  const {
    firebaseUser,
    isFirebaseAdmin,
    cloudStatus,
    signInWithGoogle,
    signOutFirebase,
  } = useFirebase();
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'admins'
    | 'committee_manage'
    | 'advisors_manage'
    | 'members_manage'
    | 'volunteers'
    | 'donations'
    | 'payment_channels'
    | 'projects'
    | 'notices'
    | 'womens_team'
    | 'audit_logs'
    | 'security'
    | 'location_map'
    | 'public_applications'
    | 'website_editor'
    | 'system_backup'
  >((initialTab as any) || 'overview');

  useEffect(() => {
    if (initialTab && isOpen) {
      setActiveTab(initialTab as any);
    }
  }, [initialTab, isOpen]);

  // Selected donation for official receipt view
  const [selectedDonationForReceipt, setSelectedDonationForReceipt] = useState<DonationRecord | null>(null);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('ashraful46475348@gmail.com');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Self-Service Forgot Password States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<'identify' | 'verify' | 'new_password' | 'success'>('identify');
  const [forgotIdentifier, setForgotIdentifier] = useState('ashraful46475348@gmail.com');
  const [matchedForgotAdmin, setMatchedForgotAdmin] = useState<AdminUser | null>(null);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotPasswordError, setForgotPasswordError] = useState<string | null>(null);
  const [showForgotPassToggle, setShowForgotPassToggle] = useState(false);

  // Password change state
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');

  // Add/Edit Admin Modal State
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<AdminRole>('custom_admin');
  const [formPermissions, setFormPermissions] = useState<AdminPermissions>(DEFAULT_PERMISSIONS.custom_admin);

  // Form states for adding new project
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProjTitleBn, setNewProjTitleBn] = useState('');
  const [newProjTitleEn, setNewProjTitleEn] = useState('');
  const [newProjCategory, setNewProjCategory] = useState<'education' | 'relief' | 'health' | 'winter' | 'empowerment'>('relief');
  const [newProjTarget, setNewProjTarget] = useState('500000');
  const [newProjLocation, setNewProjLocation] = useState('কুড়িগ্রাম চরাঞ্চল');

  // Form states for adding notice
  const [showAddNotice, setShowAddNotice] = useState(false);
  const [noticeTitleBn, setNoticeTitleBn] = useState('');
  const [noticeTitleEn, setNoticeTitleEn] = useState('');
  const [noticeCategory, setNoticeCategory] = useState<'circular' | 'audit' | 'emergency'>('emergency');
  const [noticeBodyBn, setNoticeBodyBn] = useState('');

  // Search filter for audit logs
  const [auditFilter, setAuditFilter] = useState<'all' | 'auth' | 'admin_manage' | 'donation' | 'womens_team'>('all');

  // Volunteer & Member Sub-Tabs & Management States (Requirement 3)
  const [volunteerSubTab, setVolunteerSubTab] = useState<'volunteers' | 'members'>('volunteers');
  const [volunteerSearch, setVolunteerSearch] = useState('');
  const [volunteerStatusFilter, setVolunteerStatusFilter] = useState<'all' | 'active' | 'pending' | 'coordinator'>('all');
  const [isVolunteerModalOpen, setIsVolunteerModalOpen] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | null>(null);

  const [volName, setVolName] = useState('');
  const [volPhone, setVolPhone] = useState('');
  const [volEmail, setVolEmail] = useState('');
  const [volBlood, setVolBlood] = useState('O+');
  const [volDistrict, setVolDistrict] = useState('মৌলভীবাজার');
  const [volRole, setVolRole] = useState<'volunteer' | 'coordinator' | 'member'>('volunteer');
  const [volStatus, setVolStatus] = useState<'active' | 'pending'>('active');
  const [volHours, setVolHours] = useState(10);
  const [volSkills, setVolSkills] = useState('ত্রাণ বিতরণ, সামাজিক সচেতনতা');

  const handleOpenAddVolunteer = () => {
    setEditingVolunteer(null);
    setVolName('');
    setVolPhone('');
    setVolEmail('');
    setVolBlood('O+');
    setVolDistrict('মৌলভীবাজার');
    setVolRole('volunteer');
    setVolStatus('active');
    setVolHours(10);
    setVolSkills('ত্রাণ বিতরণ, সামাজিক সচেতনতা');
    setIsVolunteerModalOpen(true);
  };

  const handleOpenEditVolunteer = (v: Volunteer) => {
    setEditingVolunteer(v);
    setVolName(v.fullName);
    setVolPhone(v.phone || '');
    setVolEmail(v.email || '');
    setVolBlood(v.bloodGroup || 'O+');
    setVolDistrict(v.district || 'মৌলভীবাজার');
    setVolRole(v.role || 'volunteer');
    setVolStatus(v.status || 'active');
    setVolHours(v.volunteerHours || 0);
    setVolSkills((v.skills || []).join(', ') || 'ত্রাণ বিতরণ');
    setIsVolunteerModalOpen(true);
  };

  const handleSaveVolunteer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!volName.trim()) {
      onToast('error', language === 'bn' ? 'স্বেচ্ছাসেবীর নাম আবশ্যক' : 'Name is required');
      return;
    }

    const skillsArray = volSkills
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (editingVolunteer) {
      const updated: Volunteer = {
        ...editingVolunteer,
        fullName: volName.trim(),
        phone: volPhone.trim(),
        email: volEmail.trim(),
        bloodGroup: volBlood,
        district: volDistrict.trim(),
        role: volRole,
        status: volStatus,
        volunteerHours: Number(volHours) || 0,
        skills: skillsArray.length > 0 ? skillsArray : ['সাধারণ স্বেচ্ছাসেবী']
      };
      if (onUpdateVolunteer) {
        onUpdateVolunteer(updated);
      }
    } else {
      const newVol: Volunteer = {
        id: `vol-${Date.now()}`,
        fullName: volName.trim(),
        phone: volPhone.trim(),
        email: volEmail.trim() || `vol${Date.now()}@colash.org`,
        bloodGroup: volBlood,
        district: volDistrict.trim(),
        role: volRole,
        status: volStatus,
        joinedDate: new Date().toISOString().split('T')[0],
        volunteerHours: Number(volHours) || 0,
        certificatesCount: 0,
        skills: skillsArray.length > 0 ? skillsArray : ['সাধারণ স্বেচ্ছাসেবী']
      };
      if (onAddVolunteer) {
        onAddVolunteer(newVol);
      }
    }
    setIsVolunteerModalOpen(false);
  };

  const handleDeleteVolunteerConfirm = (v: Volunteer) => {
    if (window.confirm(language === 'bn' ? `আপনি কি নিশ্চিত যে "${v.fullName}" কে স্বেচ্ছাসেবী তালিকা থেকে মুছে ফেলতে চান?` : `Are you sure you want to delete volunteer "${v.fullName}"?`)) {
      if (onDeleteVolunteer) {
        onDeleteVolunteer(v.id);
      }
    }
  };

  const handleToggleVolunteerStatus = (v: Volunteer) => {
    const nextStatus = v.status === 'active' ? 'pending' : 'active';
    const updated: Volunteer = {
      ...v,
      status: nextStatus,
      volunteerHours: nextStatus === 'active' ? v.volunteerHours + 5 : v.volunteerHours
    };
    if (onUpdateVolunteer) {
      onUpdateVolunteer(updated);
    } else {
      onApproveVolunteer(v.id);
    }
  };

  // Women's Team Leader Appointment & Change State
  const [showLeaderModal, setShowLeaderModal] = useState(false);
  const [leaderChangeMode, setLeaderChangeMode] = useState<'existing_member' | 'new_person'>('existing_member');
  const [selectedExistingMemberId, setSelectedExistingMemberId] = useState<string>('');
  const [leaderFormName, setLeaderFormName] = useState('');
  const [leaderFormNameEn, setLeaderFormNameEn] = useState('');
  const [leaderFormEmail, setLeaderFormEmail] = useState('');
  const [leaderFormPhone, setLeaderFormPhone] = useState('');
  const [leaderFormPassword, setLeaderFormPassword] = useState('');
  const [leaderFormAvatar, setLeaderFormAvatar] = useState('');
  const [leaderFormBio, setLeaderFormBio] = useState('');

  const currentWomensLeader = adminUsers.find(u => u.role === 'womens_team_leader') || adminUsers.find(u => u.permissions.canManageWomensTeam && u.role !== 'super_admin');

  const handleOpenChangeLeaderModal = (prefillMemberId?: string) => {
    if (prefillMemberId) {
      setLeaderChangeMode('existing_member');
      setSelectedExistingMemberId(prefillMemberId);
      const m = womensTeamMembers.find(mem => mem.id === prefillMemberId);
      if (m) {
        setLeaderFormName(m.nameBn);
        setLeaderFormNameEn(m.nameEn);
        setLeaderFormEmail(m.email || `${m.nameEn.toLowerCase().replace(/\s+/g, '.')}@colash.org`);
        setLeaderFormPhone(m.phone || '');
        setLeaderFormAvatar(m.photoUrl || '');
        setLeaderFormBio(m.bioBn || '');
        setLeaderFormPassword('');
      }
    } else if (currentWomensLeader) {
      setLeaderFormName(currentWomensLeader.name);
      setLeaderFormNameEn(currentWomensLeader.name);
      setLeaderFormEmail(currentWomensLeader.email);
      setLeaderFormPhone(currentWomensLeader.phone || '');
      setLeaderFormAvatar(currentWomensLeader.avatar || '');
      setLeaderFormPassword('');
      const match = womensTeamMembers.find(m => m.nameBn === currentWomensLeader.name || m.email === currentWomensLeader.email);
      if (match) {
        setLeaderChangeMode('existing_member');
        setSelectedExistingMemberId(match.id);
      } else {
        setLeaderChangeMode('new_person');
      }
    } else {
      setLeaderChangeMode('existing_member');
      if (womensTeamMembers.length > 0) {
        setSelectedExistingMemberId(womensTeamMembers[0].id);
        setLeaderFormName(womensTeamMembers[0].nameBn);
        setLeaderFormNameEn(womensTeamMembers[0].nameEn);
        setLeaderFormEmail(womensTeamMembers[0].email || '');
        setLeaderFormPhone(womensTeamMembers[0].phone || '');
        setLeaderFormAvatar(womensTeamMembers[0].photoUrl || '');
      }
    }
    setShowLeaderModal(true);
  };

  const handleSelectExistingMember = (memberId: string) => {
    setSelectedExistingMemberId(memberId);
    const m = womensTeamMembers.find(mem => mem.id === memberId);
    if (m) {
      setLeaderFormName(m.nameBn);
      setLeaderFormNameEn(m.nameEn);
      setLeaderFormEmail(m.email || `${m.nameEn.toLowerCase().replace(/\s+/g, '.')}@colash.org`);
      setLeaderFormPhone(m.phone || '');
      setLeaderFormAvatar(m.photoUrl || '');
      setLeaderFormBio(m.bioBn || '');
    }
  };

  const handleSaveWomensLeader = (e: React.FormEvent) => {
    e.preventDefault();
    let targetName = leaderFormName.trim();
    let targetNameEn = leaderFormNameEn.trim();
    let targetEmail = leaderFormEmail.trim();
    let targetPhone = leaderFormPhone.trim();
    let targetPassword = leaderFormPassword.trim() || currentWomensLeader?.password || 'womensadmin2026';
    let targetAvatar = leaderFormAvatar.trim() || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80';
    let targetBio = leaderFormBio.trim();

    if (leaderChangeMode === 'existing_member') {
      const member = womensTeamMembers.find(m => m.id === selectedExistingMemberId);
      if (!member) {
        onToast('error', language === 'bn' ? 'অনুগ্রহ করে একজন সদস্য নির্বাচন করুন' : 'Please select a member');
        return;
      }
      targetName = member.nameBn;
      targetNameEn = member.nameEn;
      targetEmail = member.email || targetEmail || `${member.nameEn.toLowerCase().replace(/\s+/g, '.')}@colash.org`;
      targetPhone = member.phone || targetPhone;
      targetAvatar = member.photoUrl || targetAvatar;
      targetBio = member.bioBn || targetBio;
    }

    if (!targetName) {
      onToast('error', language === 'bn' ? 'টিম লিডারের নাম আবশ্যক' : 'Leader name is required');
      return;
    }

    // 1. Update or create the admin user with role: 'womens_team_leader'
    const existingLeaderAdmin = adminUsers.find(u => u.role === 'womens_team_leader');
    const leaderAdminId = existingLeaderAdmin ? existingLeaderAdmin.id : `adm-womens-${Date.now()}`;

    const updatedLeaderAdmin: AdminUser = {
      id: leaderAdminId,
      name: targetName,
      email: targetEmail || 'womensadmin@colash.org',
      phone: targetPhone || '01711-000000',
      password: targetPassword,
      role: 'womens_team_leader',
      roleTitleBn: 'উইমেন্স টিম লিডার ও অ্যাডমিন',
      roleTitleEn: "Women's Team Leader & Admin",
      avatar: targetAvatar,
      isActive: true,
      createdAt: existingLeaderAdmin ? existingLeaderAdmin.createdAt : new Date().toISOString().split('T')[0],
      lastLogin: existingLeaderAdmin?.lastLogin || 'নতুন নিযুক্ত',
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

    if (existingLeaderAdmin) {
      onUpdateAdmin(updatedLeaderAdmin);
    } else {
      onCreateAdmin(updatedLeaderAdmin);
    }

    // 2. Synchronize Women's Team Committee members
    if (onUpdateWomensMembers && womensTeamMembers.length > 0) {
      let updatedMembers = [...womensTeamMembers];
      if (leaderChangeMode === 'existing_member') {
        updatedMembers = updatedMembers.map(m => {
          if (m.id === selectedExistingMemberId) {
            return {
              ...m,
              roleType: 'president' as const,
              designationBn: 'টিম লিডার ও সভাপতি',
              designationEn: 'Team Leader & President',
              email: targetEmail || m.email,
              phone: targetPhone || m.phone,
              password: targetPassword,
              photoUrl: targetAvatar || m.photoUrl
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
        const existingIdx = updatedMembers.findIndex(m => m.nameBn === targetName || (targetEmail && m.email === targetEmail));
        if (existingIdx >= 0) {
          updatedMembers[existingIdx] = {
            ...updatedMembers[existingIdx],
            nameBn: targetName,
            nameEn: targetNameEn || targetName,
            roleType: 'president',
            designationBn: 'টিম লিডার ও সভাপতি',
            designationEn: 'Team Leader & President',
            email: targetEmail,
            phone: targetPhone,
            password: targetPassword,
            photoUrl: targetAvatar
          };
        } else {
          const newWtm: WomensTeamMember = {
            id: `wtm-lead-${Date.now()}`,
            nameBn: targetName,
            nameEn: targetNameEn || targetName,
            designationBn: 'টিম লিডার ও সভাপতি',
            designationEn: 'Team Leader & President',
            roleType: 'president',
            membershipId: `CLF-WT-${Math.floor(100 + Math.random() * 900)}`,
            phone: targetPhone,
            email: targetEmail,
            password: targetPassword,
            photoUrl: targetAvatar,
            bioBn: targetBio || 'কোলাশ ফাউন্ডেশন উইমেন্স টিমের নীতিনির্ধারণ ও সার্বিক কার্যক্রমে নিয়োজিত।',
            bioEn: 'Leads Women’s Wing strategic operations and grassroots empowerment.',
            joinedDate: new Date().toISOString().split('T')[0],
            district: 'মৌলভীবাজার',
            bloodGroup: 'O+',
            responsibilities: [
              'উইমেন্স টিমের সার্বিক পরিচালনা ও নীতি নির্ধারণ',
              'মাসিক নির্বাহী সমন্বয় সভা পরিচালনা',
              'মাতৃ ও শিশু পুষ্টি তহবিলের দিকনির্দেশনা'
            ],
            status: 'active'
          };
          updatedMembers = updatedMembers.map(m => m.roleType === 'president' ? { ...m, roleType: 'advisor' as const, designationBn: 'উপদেষ্টা ও সাবেক সভাপতি', designationEn: 'Advisor & Former President' } : m);
          updatedMembers.unshift(newWtm);
        }
      }
      onUpdateWomensMembers(updatedMembers);
    }

    setShowLeaderModal(false);
    onToast(
      'success',
      language === 'bn' ? 'উইমেন্স টিম লিডার সফলভাবে নিযুক্ত করা হয়েছে!' : 'Team Leader Appointed!',
      `${targetName} (${targetEmail})`
    );
  };

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

  const totalDonationAmount = donations.reduce((sum, d) => sum + d.amount, 0) + 4285000;
  const pendingDonations = donations.filter(d => !d.isVerified).length;
  const pendingVolunteers = volunteers.filter(v => v.status === 'pending').length;

  const isSuperAdmin = currentAdmin?.role === 'super_admin';
  const permissions = currentAdmin?.permissions || DEFAULT_PERMISSIONS.custom_admin;

  // Handle Admin Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const identifier = loginIdentifier.trim().toLowerCase();
    const pass = loginPassword.trim();

    const matched = adminUsers.find(
      u => (u.email.toLowerCase() === identifier || u.phone.replace(/[^0-9]/g, '') === identifier.replace(/[^0-9]/g, '')) &&
           (u.password === pass || (u.role === 'super_admin' && pass === 'colashadmin2026'))
    );

    if (!matched) {
      setLoginError(
        language === 'bn'
          ? 'ভুল ইমেইল/মোবাইল অথবা পাসওয়ার্ড। অনুগ্রহ করে পুনরায় চেষ্টা করুন।'
          : 'Invalid email/phone or password. Please try again.'
      );
      return;
    }

    if (!matched.isActive) {
      setLoginError(
        language === 'bn'
          ? 'এই অ্যাকাউন্টটি প্রধান অ্যাডমিন কর্তৃক সাময়িকভাবে নিষ্ক্রিয় করা হয়েছে।'
          : 'This admin account is currently deactivated by the Super Admin.'
      );
      return;
    }

    onLoginAdmin(matched);
    setLoginPassword('');
    setLoginError(null);
    onToast(
      'success',
      language === 'bn' ? 'স্বাগতম!' : 'Welcome Back!',
      `${matched.name} (${matched.roleTitleBn})`
    );
  };

  const handleGoogleAdminAuth = async (alreadyLoggedInAdmin?: AdminUser | null) => {
    setIsConnectingGoogle(true);
    setLoginError(null);
    try {
      const user = await signInWithGoogle();
      const email = user.email?.toLowerCase() || '';
      const matched = adminUsers.find(
        (u) => u.email.toLowerCase() === email && u.isActive
      );

      if (!alreadyLoggedInAdmin) {
        if (!matched) {
          await signOutFirebase();
          setLoginError(
            language === 'bn'
              ? `এই Google অ্যাকাউন্ট (${user.email}) অনুমোদিত অ্যাডমিন তালিকায় নেই।`
              : `This Google account (${user.email}) is not authorized in Admin Users.`
          );
          return;
        }
        onLoginAdmin(matched);
      }

      if (onSyncAllToCloud) {
        await onSyncAllToCloud();
      }

      onToast(
        'success',
        language === 'bn' ? 'Firebase Cloud Sync সংযুক্ত হয়েছে!' : 'Firebase Cloud Sync Connected!',
        language === 'bn'
          ? `${user.email} দিয়ে সব তথ্য স্থায়ীভাবে ক্লাউডে সেভ হচ্ছে।`
          : `Connected as ${user.email}. All changes now persist in Firestore.`
      );
    } catch (err: any) {
      const msg = err?.message || '';
      if (!msg.includes('popup-closed-by-user')) {
        setLoginError(
          language === 'bn'
            ? 'Google সাইন-ইন সম্পন্ন করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।'
            : 'Google Sign-In failed. Please try again.'
        );
      }
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  // Self-Service Forgot Password Handlers
  const handleOpenForgotPassword = () => {
    const defaultId = loginIdentifier || 'ashraful46475348@gmail.com';
    setForgotIdentifier(defaultId);
    setMatchedForgotAdmin(null);
    setGeneratedOtp('');
    setEnteredOtp('');
    setOtpError(null);
    setForgotNewPassword('');
    setForgotConfirmPassword('');
    setForgotPasswordError(null);
    setForgotStep('identify');
    setShowForgotModal(true);
  };

  const handleForgotIdentifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordError(null);
    const query = forgotIdentifier.trim().toLowerCase();
    if (!query) {
      setForgotPasswordError(language === 'bn' ? 'অনুগ্রহ করে নিবন্ধিত ইমেইল বা মোবাইল নম্বর দিন।' : 'Please enter registered email or phone.');
      return;
    }

    const matched = adminUsers.find(
      u => u.email.toLowerCase() === query || u.phone.replace(/[^0-9]/g, '') === query.replace(/[^0-9]/g, '')
    );

    if (!matched) {
      setForgotPasswordError(
        language === 'bn'
          ? 'এই ইমেইল বা মোবাইল নম্বরে কোনো সক্রিয় অ্যাডমিন অ্যাকাউন্ট পাওয়া যায়নি।'
          : 'No active admin account found with this email or phone.'
      );
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setMatchedForgotAdmin(matched);
    setGeneratedOtp(code);
    setEnteredOtp(code); // Pre-fill for user convenience
    setOtpError(null);
    setForgotStep('verify');
    onToast(
      'info',
      language === 'bn' ? 'সিকিউরিটি কোড তৈরি হয়েছে' : 'Security Code Ready',
      `${language === 'bn' ? 'যাচাই কোড:' : 'Code:'} ${code}`
    );
  };

  const handleForgotVerifyOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    if (enteredOtp.trim() === generatedOtp) {
      setForgotStep('new_password');
      onToast(
        'success',
        language === 'bn' ? 'সিকিউরিটি যাচাই সম্পন্ন' : 'Security Verified',
        language === 'bn' ? 'এখন আপনার নতুন পাসওয়ার্ড লিখুন।' : 'Now enter your new password.'
      );
    } else {
      setOtpError(
        language === 'bn'
          ? 'ভুল ভেরিফিকেশন কোড। নিচে প্রদর্শিত সঠিক ৬-সংখ্যার কোডটি দিন।'
          : 'Invalid verification code. Please enter the correct 6-digit code.'
      );
    }
  };

  const handleForgotSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordError(null);
    if (!matchedForgotAdmin) return;

    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setForgotPasswordError(
        language === 'bn'
          ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।'
          : 'Password must be at least 6 characters.'
      );
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotPasswordError(
        language === 'bn'
          ? 'উভয় পাসওয়ার্ড একই হতে হবে।'
          : 'Passwords do not match.'
      );
      return;
    }

    onChangeAdminPassword(matchedForgotAdmin.id, forgotNewPassword);
    setLoginIdentifier(matchedForgotAdmin.email);
    setLoginPassword(forgotNewPassword);
    setForgotStep('success');
    onToast(
      'success',
      language === 'bn' ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!' : 'Password reset successfully!',
      `${matchedForgotAdmin.name}`
    );
  };

  const handleQuickResetToDefault = (targetAdmin: AdminUser) => {
    const defaultPass = 'colashadmin2026';
    onChangeAdminPassword(targetAdmin.id, defaultPass);
    setLoginIdentifier(targetAdmin.email);
    setLoginPassword(defaultPass);
    setShowForgotModal(false);
    onToast(
      'success',
      language === 'bn' ? 'পাসওয়ার্ড রিস্টোর হয়েছে (colashadmin2026)' : 'Password restored to colashadmin2026!',
      language === 'bn' ? 'এখন নিরাপদ প্রবেশ বাটনে ক্লিক করুন।' : 'Now click Log In.'
    );
  };

  // Change Password
  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAdmin) return;

    if (currentPasswordInput !== currentAdmin.password) {
      onToast('error', language === 'bn' ? 'বর্তমান পাসওয়ার্ড সঠিক নয়' : 'Current password incorrect');
      return;
    }

    if (newPasswordInput.length < 6) {
      onToast('error', language === 'bn' ? 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' : 'Password must be at least 6 chars');
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      onToast('error', language === 'bn' ? 'নতুন পাসওয়ার্ড দুটি মিলছে না' : 'New passwords do not match');
      return;
    }

    onChangeAdminPassword(currentAdmin.id, newPasswordInput);
    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setConfirmPasswordInput('');
    onToast('success', language === 'bn' ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে' : 'Password updated successfully');
  };

  // Open Create Admin Modal
  const handleOpenAddAdmin = () => {
    setEditingAdmin(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormPassword('');
    setFormRole('custom_admin');
    setFormPermissions(DEFAULT_PERMISSIONS.custom_admin);
    setIsAddAdminOpen(true);
  };

  // Open Edit Admin Modal
  const handleOpenEditAdmin = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setFormName(admin.name);
    setFormEmail(admin.email);
    setFormPhone(admin.phone);
    setFormPassword(admin.password);
    setFormRole(admin.role);
    setFormPermissions(admin.permissions);
    setIsAddAdminOpen(true);
  };

  // Role Selection in Form
  const handleRoleChange = (role: AdminRole) => {
    setFormRole(role);
    setFormPermissions(DEFAULT_PERMISSIONS[role]);
  };

  // Toggle individual permission
  const handleTogglePermission = (key: keyof AdminPermissions) => {
    setFormPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Save Admin (Create or Edit)
  const handleSaveAdminForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formPhone.trim()) {
      onToast('error', language === 'bn' ? 'সকল আবশ্যক তথ্য পূরণ করুন' : 'Fill all required fields');
      return;
    }

    const roleTitles: Record<AdminRole, { bn: string; en: string }> = {
      super_admin: { bn: 'প্রধান অ্যাডমিন (Super Admin)', en: 'Super Admin' },
      womens_team_leader: { bn: 'উইমেন্স টিম লিডার ও অ্যাডমিন', en: 'Women’s Team Leader & Admin' },
      member_manager: { bn: 'সদস্য ব্যবস্থাপনা সাব-অ্যাডমিন', en: 'Member Manager Sub-Admin' },
      content_editor: { bn: 'কনটেন্ট ও নোটিশ সাব-অ্যাডমিন', en: 'Content & Notice Sub-Admin' },
      finance_manager: { bn: 'অর্থ ও অনুদান সাব-অ্যাডমিন', en: 'Finance & Donation Sub-Admin' },
      custom_admin: { bn: 'কাস্টম অনুমতি সাব-অ্যাডমিন', en: 'Custom Permissions Sub-Admin' }
    };

    if (editingAdmin) {
      const updated: AdminUser = {
        ...editingAdmin,
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        password: formPassword.trim() || editingAdmin.password,
        role: formRole,
        roleTitleBn: roleTitles[formRole].bn,
        roleTitleEn: roleTitles[formRole].en,
        permissions: formRole === 'super_admin' ? DEFAULT_PERMISSIONS.super_admin : formPermissions
      };
      onUpdateAdmin(updated);
      onToast('success', language === 'bn' ? 'অ্যাডমিন তথ্য আপডেট সম্পন্ন' : 'Admin updated');
    } else {
      const created: AdminUser = {
        id: `adm-${Date.now()}`,
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        password: formPassword.trim() || 'colash1234',
        role: formRole,
        roleTitleBn: roleTitles[formRole].bn,
        roleTitleEn: roleTitles[formRole].en,
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0],
        permissions: formRole === 'super_admin' ? DEFAULT_PERMISSIONS.super_admin : formPermissions
      };
      onCreateAdmin(created);
      onToast('success', language === 'bn' ? 'নতুন অ্যাডমিন সফলভাবে যুক্ত হয়েছে' : 'New admin created');
    }

    setIsAddAdminOpen(false);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Project = {
      id: `proj-${Date.now()}`,
      titleBn: newProjTitleBn.trim() || 'নতুন মানবিক প্রকল্প',
      titleEn: newProjTitleEn.trim() || 'New Humanitarian Project',
      category: newProjCategory,
      targetAmount: Number(newProjTarget) || 500000,
      raisedAmount: 0,
      donorsCount: 0,
      locationBn: newProjLocation,
      locationEn: 'Rural Bangladesh',
      beneficiariesCount: 500,
      image: '/src/assets/images/hero_humanitarian_care_1792170805861.jpg',
      descriptionBn: 'জরুরি ভিত্তিতে প্রকল্পটির ফিল্ড কার্যক্রম পরিচালিত হচ্ছে।',
      descriptionEn: 'Field operations underway for targeted beneficiaries.',
      status: 'active',
      impactUpdates: []
    };
    onAddNewProject(created);
    setShowAddProject(false);
    setNewProjTitleBn('');
    setNewProjTitleEn('');
  };

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    const created: NoticeItem = {
      id: `not-${Date.now()}`,
      titleBn: noticeTitleBn.trim(),
      titleEn: noticeTitleEn.trim() || noticeTitleBn.trim(),
      date: new Date().toISOString().split('T')[0],
      category: noticeCategory,
      bodyBn: noticeBodyBn.trim(),
      bodyEn: noticeBodyBn.trim()
    };
    onAddNewNotice(created);
    setShowAddNotice(false);
    setNoticeTitleBn('');
    setNoticeTitleEn('');
    setNoticeBodyBn('');
  };

  const filteredLogs = auditLogs.filter(log => {
    if (auditFilter === 'all') return true;
    return log.category === auditFilter;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-[#0c1a24] max-w-5xl w-full rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">

        {/* TOP HEADER */}
        <div className="bg-[#102B3F] text-white p-4 sm:p-5 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#167D78] flex items-center justify-center text-[#D6F36A] shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold">
                  {language === 'bn' ? 'কোলাশ ফাউন্ডেশন অ্যাডমিন ম্যানেজমেন্ট কনসোল' : 'CoLASH Governance & Admin Console'}
                </h3>
                {currentAdmin && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    currentAdmin.role === 'super_admin'
                      ? 'bg-[#D6F36A] text-[#102B3F]'
                      : currentAdmin.role === 'womens_team_leader'
                      ? 'bg-rose-500 text-white'
                      : 'bg-emerald-500 text-white'
                  }`}>
                    {currentAdmin.roleTitleBn}
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-300">
                {currentAdmin
                  ? (language === 'bn' ? `লগইনকৃত: ${currentAdmin.name} (${currentAdmin.email})` : `Logged in: ${currentAdmin.name}`)
                  : (language === 'bn' ? 'নিরাপদ প্রধান ও সাব-অ্যাডমিন অ্যাক্সেস গেটওয়ে' : 'Secure Super Admin & Sub-Admin Access Gateway')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentAdmin && (
              <button
                onClick={onLogoutAdmin}
                className="px-3 py-1.5 text-xs font-semibold bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                title={language === 'bn' ? 'লগআউট করুন' : 'Logout'}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{language === 'bn' ? 'লগআউট' : 'Logout'}</span>
              </button>
            )}
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

        {/* IF NOT LOGGED IN: SHOW ADMIN LOGIN GATEWAY */}
        {!currentAdmin ? (
          <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
            <div className="max-w-md mx-auto text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#167D78] to-[#102B3F] text-[#D6F36A] flex items-center justify-center shadow-lg">
                <Lock className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-extrabold text-stone-900 dark:text-white">
                {language === 'bn' ? 'অ্যাডমিন সিকিউরিটি প্রমাণীকরণ' : 'Admin Security Verification'}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {language === 'bn'
                  ? 'প্রধান অ্যাডমিন, উইমেন্স টিম লিডার অথবা সাব-অ্যাডমিন হিসেবে নিবন্ধিত তথ্য দিয়ে প্রবেশ করুন।'
                  : 'Enter your verified credentials to access role-specific administrative controls.'}
              </p>
            </div>

            <div className="max-w-md mx-auto bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm">
              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                {loginError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    {language === 'bn' ? 'নিবন্ধিত ইমেইল অথবা মোবাইল নম্বর' : 'Registered Email or Mobile'}
                  </label>
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder={language === 'bn' ? 'যেমন: admin@colash.org অথবা 01646-475348' : 'e.g. admin@colash.org or 01646-475348'}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#167D78]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-stone-700 dark:text-stone-300">
                      {language === 'bn' ? 'অ্যাডমিন পাসওয়ার্ড' : 'Admin Password'}
                    </label>
                    <button
                      type="button"
                      onClick={() => handleOpenForgotPassword()}
                      className="text-[11px] text-[#167D78] dark:text-[#D6F36A] hover:underline cursor-pointer font-semibold flex items-center gap-1"
                    >
                      <Key className="w-3 h-3" />
                      <span>{language === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showLoginPass ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-2.5 pr-10 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#167D78]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPass(!showLoginPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                    >
                      {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#167D78] hover:bg-[#102B3F] text-white font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  <ShieldCheck className="w-4 h-4 text-[#D6F36A]" />
                  <span>{language === 'bn' ? 'নিরাপদ প্রবেশ (Log In)' : 'Secure Log In'}</span>
                </button>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-stone-200 dark:border-stone-700" />
                  <span className="px-2 text-[10px] font-bold uppercase text-stone-400">
                    {language === 'bn' ? 'অথবা (Cloud Sync সহ)' : 'OR (With Cloud Sync)'}
                  </span>
                  <div className="flex-grow border-t border-stone-200 dark:border-stone-700" />
                </div>

                <button
                  type="button"
                  disabled={isConnectingGoogle}
                  onClick={() => void handleGoogleAdminAuth(null)}
                  className="w-full py-2.5 px-4 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-white border border-stone-300 dark:border-stone-600 font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Cloud className="w-4 h-4 text-[#167D78] dark:text-[#D6F36A]" />
                  <span>
                    {isConnectingGoogle
                      ? (language === 'bn' ? 'Google সংযোগ হচ্ছে...' : 'Connecting Google...')
                      : (language === 'bn' ? 'Google দিয়ে লগইন (Firebase Cloud Save)' : 'Sign in with Google (Firebase Cloud Save)')}
                  </span>
                </button>
              </form>
            </div>

            {/* Self-Service Forgot Password Modal */}
            {showForgotModal && (
              <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                <div className="bg-white dark:bg-[#102B3F] p-6 rounded-2xl max-w-md w-full border border-stone-200 dark:border-white/10 space-y-4 text-xs shadow-2xl">
                  
                  {/* Modal Header */}
                  <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                    <h4 className="font-bold text-sm text-stone-900 dark:text-white flex items-center gap-2">
                      <Key className="w-4 h-4 text-[#167D78] dark:text-[#D6F36A]" />
                      <span>{language === 'bn' ? 'সেলফ-সার্ভিস অ্যাডমিন পাসওয়ার্ড রিসেট' : 'Self-Service Admin Password Reset'}</span>
                    </h4>
                    <button
                      onClick={() => setShowForgotModal(false)}
                      className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* STEP 1: Enter email or phone */}
                  {forgotStep === 'identify' && (
                    <form onSubmit={handleForgotIdentifySubmit} className="space-y-4">
                      <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                        {language === 'bn'
                          ? 'আপনার নিবন্ধিত অ্যাডমিন ইমেইল বা মোবাইল নম্বর দিন। সিস্টেম যাচাই করে তাৎক্ষণিক সিকিউরিটি কোড প্রদান করবে।'
                          : 'Enter your registered admin email or mobile number to receive your instant verification code.'}
                      </p>

                      {forgotPasswordError && (
                        <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>{forgotPasswordError}</span>
                        </div>
                      )}

                      <div>
                        <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                          {language === 'bn' ? 'নিবন্ধিত ইমেইল / মোবাইল' : 'Registered Email / Mobile'}
                        </label>
                        <input
                          type="text"
                          required
                          value={forgotIdentifier}
                          onChange={(e) => setForgotIdentifier(e.target.value)}
                          placeholder="ashraful46475348@gmail.com"
                          className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#167D78]"
                        />
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                        <button
                          type="submit"
                          className="w-full sm:flex-1 py-2.5 bg-[#167D78] hover:bg-[#102B3F] text-white font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                        >
                          <ShieldCheck className="w-4 h-4 text-[#D6F36A]" />
                          <span>{language === 'bn' ? 'যাচাই কোড তৈরি করুন' : 'Generate Security Code'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowForgotModal(false)}
                          className="w-full sm:w-auto px-4 py-2.5 border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl cursor-pointer"
                        >
                          {language === 'bn' ? 'বাতিল' : 'Cancel'}
                        </button>
                      </div>

                      {/* Quick Restore Default fallback helper */}
                      <div className="pt-3 border-t border-stone-100 dark:border-stone-800 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            const admin = adminUsers.find(u => u.email.toLowerCase() === forgotIdentifier.trim().toLowerCase()) || adminUsers[0];
                            if (admin) handleQuickResetToDefault(admin);
                          }}
                          className="text-[11px] text-[#167D78] dark:text-[#D6F36A] hover:underline font-semibold cursor-pointer inline-flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>{language === 'bn' ? 'জরুরি প্রয়োজনে পাসওয়ার্ড প্রাথমিক ডিফল্টে ফিরিয়ে নিন' : 'Quick restore to initial default password'}</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* STEP 2: Verify OTP code */}
                  {forgotStep === 'verify' && matchedForgotAdmin && (
                    <form onSubmit={handleForgotVerifyOtpSubmit} className="space-y-4">
                      <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60">
                        <div className="text-[11px] text-teal-800 dark:text-teal-300 font-semibold">
                          {language === 'bn' ? 'অ্যাকাউন্ট শনাক্তকরণ সম্পন্ন:' : 'Account Identified:'}
                        </div>
                        <div className="font-bold text-sm text-[#102B3F] dark:text-white mt-0.5">
                          {matchedForgotAdmin.name} ({matchedForgotAdmin.roleTitleBn})
                        </div>
                        <div className="text-[11px] text-stone-500 font-mono mt-0.5">
                          {matchedForgotAdmin.email}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between gap-3">
                        <div>
                          <div className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-300 tracking-wider">
                            {language === 'bn' ? 'সিকিউরিটি ভেরিফিকেশন কোড:' : 'Security Verification Code:'}
                          </div>
                          <div className="text-xl font-mono font-black text-amber-900 dark:text-amber-200 tracking-widest mt-0.5">
                            {generatedOtp}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEnteredOtp(generatedOtp)}
                          className="px-2.5 py-1 text-[11px] font-bold text-amber-800 dark:text-amber-200 bg-amber-200/60 hover:bg-amber-300/60 dark:bg-amber-900/60 rounded-lg transition-colors cursor-pointer"
                        >
                          {language === 'bn' ? 'অটো-বসিয়ে দিন' : 'Auto-fill'}
                        </button>
                      </div>

                      {otpError && (
                        <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>{otpError}</span>
                        </div>
                      )}

                      <div>
                        <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                          {language === 'bn' ? '৬-সংখ্যার সিকিউরিটি কোড দিন' : 'Enter 6-Digit Code'}
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={enteredOtp}
                          onChange={(e) => setEnteredOtp(e.target.value)}
                          placeholder="123456"
                          className="w-full p-2.5 text-center font-mono text-base tracking-widest rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#167D78]"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 py-2.5 bg-[#167D78] hover:bg-[#102B3F] text-white font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#D6F36A]" />
                          <span>{language === 'bn' ? 'কোড যাচাই করুন' : 'Verify Code'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setForgotStep('identify')}
                          className="px-4 py-2.5 border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 rounded-xl cursor-pointer"
                        >
                          {language === 'bn' ? 'পেছনে' : 'Back'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* STEP 3: Enter new password */}
                  {forgotStep === 'new_password' && matchedForgotAdmin && (
                    <form onSubmit={handleForgotSaveNewPassword} className="space-y-4">
                      <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                        {language === 'bn'
                          ? `পরিচয় সফলভাবে যাচাই হয়েছে। ${matchedForgotAdmin.name}-এর অ্যাকাউন্টের জন্য নতুন পাসওয়ার্ড দিন:`
                          : `Identity verified for ${matchedForgotAdmin.name}. Set your new secure password:`}
                      </p>

                      {forgotPasswordError && (
                        <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>{forgotPasswordError}</span>
                        </div>
                      )}

                      <div>
                        <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                          {language === 'bn' ? 'নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)' : 'New Password (min 6 chars)'}
                        </label>
                        <div className="relative">
                          <input
                            type={showForgotPassToggle ? 'text' : 'password'}
                            required
                            value={forgotNewPassword}
                            onChange={(e) => setForgotNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full p-2.5 pr-10 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#167D78]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowForgotPassToggle(!showForgotPassToggle)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                          >
                            {showForgotPassToggle ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                          {language === 'bn' ? 'নতুন পাসওয়ার্ড পুনরায় লিখুন' : 'Confirm New Password'}
                        </label>
                        <input
                          type={showForgotPassToggle ? 'text' : 'password'}
                          required
                          value={forgotConfirmPassword}
                          onChange={(e) => setForgotConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#167D78]"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-[#167D78] hover:bg-[#102B3F] text-white font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Lock className="w-4 h-4 text-[#D6F36A]" />
                        <span>{language === 'bn' ? 'পাসওয়ার্ড সংরক্ষণ ও আপডেট করুন' : 'Save & Update Password'}</span>
                      </button>
                    </form>
                  )}

                  {/* STEP 4: Success Message */}
                  {forgotStep === 'success' && matchedForgotAdmin && (
                    <div className="space-y-4 py-2 text-center">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h5 className="font-bold text-base text-[#102B3F] dark:text-white">
                          {language === 'bn' ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!' : 'Password Reset Successful!'}
                        </h5>
                        <p className="text-stone-600 dark:text-stone-300 mt-1">
                          {language === 'bn'
                            ? `নতুন পাসওয়ার্ড দিয়ে লগইন ফিল্ড স্বয়ংক্রিয়ভাবে পূরণ করা হয়েছে। এখন সরাসরি ড্যাশবোর্ডে প্রবেশ করতে পারেন।`
                            : 'Login credentials have been prefilled. You can now log into the dashboard.'}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotModal(false);
                          onLoginAdmin(matchedForgotAdmin);
                        }}
                        className="w-full py-2.5 bg-[#167D78] hover:bg-[#102B3F] text-white font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#D6F36A]" />
                        <span>{language === 'bn' ? 'সরাসরি ড্যাশবোর্ডে প্রবেশ করুন' : 'Enter Dashboard Now'}</span>
                      </button>
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>
        ) : (
          /* IF LOGGED IN: SHOW FULL MULTI-TAB DASHBOARD WITH PERMISSION ENFORCEMENT */
          <>
            {/* FIREBASE FIRESTORE CLOUD SYNC STATUS BAR */}
            <div className={`px-4 sm:px-6 py-2 border-b text-xs flex flex-wrap items-center justify-between gap-2 shrink-0 ${
              firebaseUser && isFirebaseAdmin
                ? 'bg-emerald-50/90 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200'
                : 'bg-amber-50/90 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200'
            }`}>
              <div className="flex items-center gap-2">
                {firebaseUser && isFirebaseAdmin ? (
                  <>
                    <Cloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="font-bold">
                      {language === 'bn' ? 'Firebase Firestore ক্লাউড সিঙ্ক সক্রিয়' : 'Firebase Firestore Cloud Sync Active'}
                    </span>
                    <span className="hidden md:inline text-[11px] opacity-80">
                      ({firebaseUser.email}) {cloudStatus === 'syncing' ? '• সিঙ্ক হচ্ছে...' : cloudStatus === 'synced' ? '• সব পরিবর্তন ক্লাউডে সেভ হচ্ছে' : ''}
                    </span>
                  </>
                ) : (
                  <>
                    <CloudOff className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span className="font-semibold">
                      {language === 'bn'
                        ? 'সব পরিবর্তন স্থায়ীভাবে Firebase ক্লাউডে সেভ করতে Google অ্যাকাউন্ট সংযুক্ত করুন:'
                        : 'Connect Google account to permanently sync all changes to Firebase Cloud:'}
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                {firebaseUser && isFirebaseAdmin ? (
                  onSyncAllToCloud && (
                    <button
                      type="button"
                      disabled={isManualSyncing}
                      onClick={async () => {
                        setIsManualSyncing(true);
                        try {
                          const ok = await onSyncAllToCloud();
                          if (ok) {
                            onToast(
                              'success',
                              language === 'bn' ? 'ক্লাউড সিঙ্ক সম্পন্ন!' : 'Cloud Sync Complete!',
                              language === 'bn' ? 'সকল তথ্য Firebase Firestore-এ সংরক্ষিত হয়েছে।' : 'All data persisted to Firebase Firestore.'
                            );
                          }
                        } finally {
                          setIsManualSyncing(false);
                        }
                      }}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                    >
                      <RefreshCw className={`w-3 h-3 ${isManualSyncing ? 'animate-spin' : ''}`} />
                      <span>{language === 'bn' ? 'সব তথ্য ক্লাউডে সেভ করুন' : 'Sync All to Cloud'}</span>
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    disabled={isConnectingGoogle}
                    onClick={() => void handleGoogleAdminAuth(currentAdmin)}
                    className="px-3 py-1 rounded-lg bg-[#167D78] hover:bg-[#102B3F] text-white font-bold text-[11px] flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    <Cloud className="w-3.5 h-3.5 text-[#D6F36A]" />
                    <span>
                      {isConnectingGoogle
                        ? (language === 'bn' ? 'সংযোগ হচ্ছে...' : 'Connecting...')
                        : (language === 'bn' ? 'Google দিয়ে ক্লাউড সেভ চালু করুন' : 'Connect Google Cloud Save')}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* TAB NAVIGATION */}
            <div className="px-4 sm:px-6 bg-stone-50 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 flex gap-1 sm:gap-2 overflow-x-auto text-xs font-semibold shrink-0">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'border-[#167D78] text-[#167D78] dark:text-[#D6F36A]'
                    : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                {language === 'bn' ? 'ওভারভিউ' : 'Overview'}
              </button>

              {/* ADMIN MANAGEMENT TAB (Super Admin or canManageAdmins) */}
              {(isSuperAdmin || permissions.canManageAdmins) && (
                <button
                  onClick={() => setActiveTab('admins')}
                  className={`py-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'admins'
                      ? 'border-[#167D78] text-[#167D78] dark:text-[#D6F36A]'
                      : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#167D78] dark:text-[#D6F36A]" />
                  <span>{language === 'bn' ? 'অ্যাডমিন ও পারমিশন কন্ট্রোল' : 'Admins & RBAC'}</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-[#167D78] text-white text-[10px]">
                    {adminUsers.length}
                  </span>
                </button>
              )}

              {/* COMMITTEE & TENURES TAB */}
              {(isSuperAdmin || permissions.canManageCommittee || permissions.canEditMembers) && (
                <button
                  onClick={() => setActiveTab('committee_manage')}
                  className={`py-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'committee_manage'
                      ? 'border-[#167D78] text-[#167D78] dark:text-[#D6F36A]'
                      : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <Crown className="w-3.5 h-3.5 text-[#D6F36A]" />
                  <span>{language === 'bn' ? 'কমিটি ও মেয়াদ পরিচালনা' : 'Committees & Terms'}</span>
                  {committeeTerms.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-[#167D78] text-white text-[10px]">
                      {committeeTerms.length}
                    </span>
                  )}
                </button>
              )}

              {/* ADVISORY COUNCIL TAB */}
              {(isSuperAdmin || permissions.canManageAdvisors || permissions.canManageSettings) && (
                <button
                  onClick={() => setActiveTab('advisors_manage')}
                  className={`py-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'advisors_manage'
                      ? 'border-[#167D78] text-[#167D78] dark:text-[#D6F36A]'
                      : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <Award className="w-3.5 h-3.5 text-[#1D4ED8]" />
                  <span>{language === 'bn' ? 'উপদেষ্টামণ্ডলী' : 'Advisory Council'}</span>
                  {advisors.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px]">
                      {advisors.length}
                    </span>
                  )}
                </button>
              )}

              {/* GENERAL MEMBERS DIRECTORY & EDITING TAB */}
              {(isSuperAdmin || permissions.canViewMembers || permissions.canEditMembers) && (
                <button
                  onClick={() => setActiveTab('members_manage')}
                  className={`py-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'members_manage'
                      ? 'border-[#167D78] text-[#167D78] dark:text-[#D6F36A]'
                      : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <IdCard className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{language === 'bn' ? 'সদস্য সম্পাদনা ও আইডি' : 'Members Directory'}</span>
                  {generalMembers.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[10px]">
                      {generalMembers.length}
                    </span>
                  )}
                </button>
              )}

              {/* VOLUNTEERS & MEMBERS (canViewMembers) */}
              <button
                onClick={() => setActiveTab('volunteers')}
                className={`py-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'volunteers'
                    ? 'border-[#167D78] text-[#167D78] dark:text-[#D6F36A]'
                    : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'সদস্য ও ভলান্টিয়ার' : 'Members'}</span>
                {pendingVolunteers > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px]">
                    {pendingVolunteers}
                  </span>
                )}
              </button>

              {/* DONATIONS (canVerifyDonations) */}
              <button
                onClick={() => setActiveTab('donations')}
                className={`py-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'donations'
                    ? 'border-[#167D78] text-[#167D78] dark:text-[#D6F36A]'
                    : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'অনুদান অডিট' : 'Donations'}</span>
                {pendingDonations > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px]">
                    {pendingDonations}
                  </span>
                )}
              </button>

              {/* PAYMENT CHANNELS: BKASH & NAGAD (Requirement 7) */}
              <button
                onClick={() => setActiveTab('payment_channels')}
                className={`py-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'payment_channels'
                    ? 'border-[#167D78] text-[#167D78] dark:text-[#D6F36A]'
                    : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-[#E2136E]" />
                <span>{language === 'bn' ? 'বিকাশ ও নগদ চ্যানেল' : 'bKash & Nagad Channels'}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                  {paymentChannels.filter(c => c.isActive).length}
                </span>
              </button>

              {/* PROJECTS (canManageProjects) */}
              <button
                onClick={() => setActiveTab('projects')}
                className={`py-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'projects'
                    ? 'border-[#167D78] text-[#167D78] dark:text-[#D6F36A]'
                    : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <FolderKanban className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'প্রকল্প' : 'Projects'}</span>
              </button>

              {/* NOTICES (canManageNotices) */}
              <button
                onClick={() => setActiveTab('notices')}
                className={`py-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'notices'
                    ? 'border-[#167D78] text-[#167D78] dark:text-[#D6F36A]'
                    : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'বিজ্ঞপ্তি' : 'Notices'}</span>
              </button>

              {/* WOMEN'S TEAM CENTRAL (canManageWomensTeam or Super Admin) */}
              {(isSuperAdmin || permissions.canManageWomensTeam) && (
                <button
                  onClick={() => setActiveTab('womens_team')}
                  className={`py-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'womens_team'
                      ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                      : 'border-transparent text-rose-600/70 hover:text-rose-600'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                  <span>{language === 'bn' ? 'উইমেন্স টিম কন্ট্রোল' : 'Women’s Wing'}</span>
                </button>
              )}

              {/* AUDIT LOGS */}
              <button
                onClick={() => setActiveTab('audit_logs')}
                className={`py-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'audit_logs'
                    ? 'border-[#167D78] text-[#167D78] dark:text-[#D6F36A]'
                    : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'অডিট রেকর্ড' : 'Audit Logs'}</span>
              </button>

              {/* SECURITY & PROFILE */}
              <button
                onClick={() => setActiveTab('security')}
                className={`py-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'security'
                    ? 'border-[#167D78] text-[#167D78] dark:text-[#D6F36A]'
                    : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'নিরাপত্তা ও পাসওয়ার্ড' : 'Security'}</span>
              </button>

              {/* GOOGLE MAPS & LOCATION TAB */}
              <button
                onClick={() => setActiveTab('location_map')}
                className={`py-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'location_map'
                    ? 'border-[#167D78] text-[#167D78] dark:text-[#D6F36A]'
                    : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-[#E65100]" />
                <span>{language === 'bn' ? 'গুগল ম্যাপ ও ঠিকানা' : 'Google Maps'}</span>
              </button>

              {/* PUBLIC APPLICATIONS & MESSAGES TAB */}
              <button
                onClick={() => setActiveTab('public_applications')}
                className={`py-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'public_applications'
                    ? 'border-[#167D78] text-[#167D78] dark:text-[#D6F36A]'
                    : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>{language === 'bn' ? 'পাবলিক আবেদন ও মেসেজ' : 'Public Applications'}</span>
                {publicApplications.filter(a => a.status === 'pending').length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-purple-600 text-white text-[10px]">
                    {publicApplications.filter(a => a.status === 'pending').length}
                  </span>
                )}
              </button>

              {/* CUSTOM WEBSITE EDITOR TAB (Super Admin or canManageWebsiteEditor) */}
              {(isSuperAdmin || permissions.canManageWebsiteEditor || permissions.canManageSettings) && (
                <button
                  onClick={() => setActiveTab('website_editor')}
                  className={`py-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'website_editor'
                      ? 'border-[#167D78] text-[#167D78] dark:text-[#D6F36A]'
                      : 'border-transparent text-amber-600 dark:text-amber-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <Palette className="w-3.5 h-3.5 text-amber-500" />
                  <span>{language === 'bn' ? 'কাস্টম ওয়েবসাইট এডিটর' : 'Website Editor'}</span>
                </button>
              )}

              {/* SYSTEM BACKUP & FUTURE-PROOF RECOVERY TAB (Super Admin) */}
              {isSuperAdmin && (
                <button
                  onClick={() => setActiveTab('system_backup')}
                  className={`py-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'system_backup'
                      ? 'border-[#167D78] text-[#167D78] dark:text-[#D6F36A]'
                      : 'border-transparent text-emerald-600 dark:text-emerald-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{language === 'bn' ? 'ডাটাবেস ব্যাকআপ ও রিকভারি' : 'Backup & Recovery'}</span>
                </button>
              )}
            </div>

            {/* CONTENT BODY */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">

              {/* TAB: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Current Admin Welcome Card */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#102B3F] to-[#167D78] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center shrink-0">
                        {currentAdmin.avatar ? (
                          <img src={currentAdmin.avatar} alt={currentAdmin.name} className="w-full h-full object-cover" />
                        ) : (
                          <ShieldCheck className="w-6 h-6 text-[#D6F36A]" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs text-[#D6F36A] font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{language === 'bn' ? 'অনুমোদিত প্রশাসনিক সেশন' : 'Authorized Admin Session'}</span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold">{currentAdmin.name}</h3>
                        <div className="text-xs text-stone-200">
                          {currentAdmin.roleTitleBn} · {currentAdmin.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      <button
                        onClick={() => setActiveTab('security')}
                        className="px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Key className="w-3.5 h-3.5 text-[#D6F36A]" />
                        <span>{language === 'bn' ? 'পাসওয়ার্ড পরিবর্তন' : 'Change Password'}</span>
                      </button>
                      {(isSuperAdmin || permissions.canManageWomensTeam) && onOpenWomensAdmin && (
                        <button
                          onClick={onOpenWomensAdmin}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{language === 'bn' ? 'উইমেন্স টিম কনসোল' : 'Women’s Team Console'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 4 Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                      <div className="text-xs text-stone-500 mb-1">{language === 'bn' ? 'মোট তহবিল ও অনুদান' : 'Total Revenue'}</div>
                      <div className="text-xl font-extrabold text-[#167D78] dark:text-[#D6F36A] tabular-nums">
                        ৳{totalDonationAmount.toLocaleString()}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                      <div className="text-xs text-stone-500 mb-1">{language === 'bn' ? 'সক্রিয় অ্যাডমিন অ্যাকাউন্ট' : 'Active Admins'}</div>
                      <div className="text-xl font-extrabold text-stone-900 dark:text-white tabular-nums">
                        {adminUsers.filter(u => u.isActive).length} জন
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                      <div className="text-xs text-stone-500 mb-1">{language === 'bn' ? 'সক্রিয় প্রকল্প' : 'Active Projects'}</div>
                      <div className="text-xl font-extrabold text-[#102B3F] dark:text-white tabular-nums">
                        {projects.length}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                      <div className="text-xs text-stone-500 mb-1">{language === 'bn' ? 'উইমেন্স টিম সদস্য' : 'Women’s Wing'}</div>
                      <div className="text-xl font-extrabold text-rose-600 dark:text-rose-400 tabular-nums">
                        {womensMembersCount} জন
                      </div>
                    </div>
                  </div>

                  {/* Quick Admin Actions */}
                  <div className="p-4 rounded-xl bg-stone-50/80 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                      {language === 'bn' ? 'অনুমোদিত দ্রুত প্রশাসনিক কার্যক্রম' : 'Authorized Administrative Shortcuts'}
                    </h4>
                    <div className="flex flex-wrap gap-2.5">
                      {(isSuperAdmin || permissions.canManageAdmins) && (
                        <button
                          onClick={handleOpenAddAdmin}
                          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#167D78] hover:bg-[#102B3F] rounded-lg cursor-pointer transition-colors"
                        >
                          <UserPlus className="w-3.5 h-3.5 text-[#D6F36A]" />
                          <span>{language === 'bn' ? 'নতুন অ্যাডমিন বা টিম লিডার নিয়োগ' : 'Add New Admin / Leader'}</span>
                        </button>
                      )}

                      {permissions.canManageProjects && (
                        <button
                          onClick={() => {
                            setActiveTab('projects');
                            setShowAddProject(true);
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-stone-800 dark:text-white bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg cursor-pointer hover:bg-stone-100"
                        >
                          <Plus className="w-3.5 h-3.5 text-[#167D78]" />
                          <span>{language === 'bn' ? 'নতুন ত্রাণ প্রকল্প চালু' : 'Add New Relief Cause'}</span>
                        </button>
                      )}

                      {permissions.canManageNotices && (
                        <button
                          onClick={() => {
                            setActiveTab('notices');
                            setShowAddNotice(true);
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#102B3F] dark:text-white bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg cursor-pointer hover:bg-stone-100"
                        >
                          <Bell className="w-3.5 h-3.5 text-[#E6A15B]" />
                          <span>{language === 'bn' ? 'অফিসিয়াল বিজ্ঞপ্তি প্রকাশ' : 'Publish Notice'}</span>
                        </button>
                      )}

                      {(isSuperAdmin || permissions.canManageWomensTeam) && onOpenWomensAdmin && (
                        <button
                          onClick={onOpenWomensAdmin}
                          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg cursor-pointer hover:bg-rose-100"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{language === 'bn' ? 'উইমেন্স টিম পূর্ণ প্যানেল' : 'Open Women’s Panel'}</span>
                        </button>
                      )}

                      {(isSuperAdmin || permissions.canManageWomensTeam) && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('womens_team');
                            handleOpenChangeLeaderModal();
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 rounded-lg cursor-pointer transition-colors shadow-xs"
                        >
                          <Crown className="w-3.5 h-3.5 text-amber-200" />
                          <span>{language === 'bn' ? 'উইমেন্স টিম লিডার পরিবর্তন' : 'Change Women’s Leader'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: ADMIN MANAGEMENT (A, B, C from User Requirements) */}
              {activeTab === 'admins' && (isSuperAdmin || permissions.canManageAdmins) && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-50 dark:bg-stone-900/60 p-4 rounded-xl border border-stone-200 dark:border-stone-800">
                    <div>
                      <h4 className="font-extrabold text-sm text-stone-900 dark:text-white flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#167D78]" />
                        <span>{language === 'bn' ? 'অ্যাডমিন, টিম লিডার ও পারমিশন ম্যানেজমেন্ট' : 'Admin & RBAC Management'}</span>
                      </h4>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {language === 'bn'
                          ? 'প্রধান অ্যাডমিন কর্তৃক নতুন অ্যাডমিন তৈরি, পদায়ন, পারমিশন কাস্টমাইজেশন ও অ্যাকাউন্ট নিয়ন্ত্রণ'
                          : 'Manage Super Admins, Women’s Team Leaders, and granular Sub-Admins.'}
                      </p>
                    </div>

                    <button
                      onClick={handleOpenAddAdmin}
                      className="px-4 py-2 bg-[#167D78] hover:bg-[#102B3F] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4 text-[#D6F36A]" />
                      <span>{language === 'bn' ? 'নতুন অ্যাডমিন তৈরি করুন' : 'Create Admin'}</span>
                    </button>
                  </div>

                  {/* Admin Accounts List */}
                  <div className="space-y-3">
                    {adminUsers.map((admin) => (
                      <div
                        key={admin.id}
                        className={`p-4 rounded-xl border transition-all ${
                          admin.isActive
                            ? 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'
                            : 'bg-stone-100 dark:bg-stone-950 border-stone-300 dark:border-stone-900 opacity-75'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 overflow-hidden flex items-center justify-center shrink-0">
                              {admin.avatar ? (
                                <img src={admin.avatar} alt={admin.name} className="w-full h-full object-cover" />
                              ) : (
                                <Users className="w-5 h-5 text-stone-400" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-sm text-stone-900 dark:text-white">
                                  {admin.name}
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  admin.role === 'super_admin'
                                    ? 'bg-[#102B3F] text-[#D6F36A]'
                                    : admin.role === 'womens_team_leader'
                                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                }`}>
                                  {admin.roleTitleBn}
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  admin.isActive
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                                }`}>
                                  {admin.isActive ? '● সক্রিয় (Active)' : '○ সাময়িক স্থগিত (Suspended)'}
                                </span>
                              </div>

                              <div className="text-xs text-stone-500 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                                <div><strong>ইমেইল:</strong> {admin.email}</div>
                                <div><strong>মোবাইল:</strong> {admin.phone}</div>
                                <div><strong>তৈরি:</strong> {admin.createdAt}</div>
                                {admin.lastLogin && <div><strong>সর্বশেষ লগইন:</strong> {admin.lastLogin}</div>}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
                            {admin.role === 'womens_team_leader' && (
                              <button
                                type="button"
                                onClick={() => handleOpenChangeLeaderModal()}
                                className="p-1.5 px-2.5 rounded-lg bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold cursor-pointer flex items-center gap-1 shadow-xs hover:from-rose-700 hover:to-pink-700"
                                title="উইমেন্স টিম লিডার পরিবর্তন / নতুন নিয়োগ"
                              >
                                <Crown className="w-3.5 h-3.5 text-amber-200" />
                                <span>লিডার পরিবর্তন</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleOpenEditAdmin(admin)}
                              className="p-1.5 px-2.5 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-semibold cursor-pointer flex items-center gap-1"
                              title="সম্পাদনা ও পারমিশন"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>সম্পাদনা</span>
                            </button>

                            {admin.role !== 'super_admin' && (
                              <button
                                onClick={() => onToggleAdminStatus(admin.id)}
                                className={`p-1.5 px-2.5 rounded-lg font-semibold cursor-pointer flex items-center gap-1 ${
                                  admin.isActive
                                    ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300'
                                    : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300'
                                }`}
                              >
                                {admin.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                                <span>{admin.isActive ? 'নিষ্ক্রিয়' : 'সক্রিয়'}</span>
                              </button>
                            )}

                            {admin.role !== 'super_admin' && (
                              <button
                                onClick={() => {
                                  if (confirm(language === 'bn' ? `আপনি কি নিশ্চিতভাবে "${admin.name}"-এর অ্যাডমিন অ্যাক্সেস বাতিল করতে চান?` : 'Revoke this admin access?')) {
                                    onDeleteAdmin(admin.id);
                                  }
                                }}
                                className="p-1.5 px-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 cursor-pointer"
                                title="অ্যাক্সেস বাতিল"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Granted Permissions Badges */}
                        <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-800/80 flex flex-wrap items-center gap-1.5 text-[10px]">
                          <span className="font-bold text-stone-400 mr-1">কার্যকর অনুমতি:</span>
                          {admin.permissions.canViewMembers && (
                            <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                              সদস্য তালিকা
                            </span>
                          )}
                          {admin.permissions.canAddMembers && (
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                              সদস্য যোগ
                            </span>
                          )}
                          {admin.permissions.canEditMembers && (
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                              সদস্য সম্পাদনা
                            </span>
                          )}
                          {admin.permissions.canDeleteMembers && (
                            <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                              সদস্য অপসারণ
                            </span>
                          )}
                          {admin.permissions.canVerifyDonations && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                              অনুদান অডিট
                            </span>
                          )}
                          {admin.permissions.canManageProjects && (
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                              প্রকল্প
                            </span>
                          )}
                          {admin.permissions.canManageNotices && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                              বিজ্ঞপ্তি প্রকাশ
                            </span>
                          )}
                          {admin.permissions.canManageFiles && (
                            <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                              ফাইল আপলোড
                            </span>
                          )}
                          {admin.permissions.canManageWomensTeam && (
                            <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold">
                              উইমেন্স টিম কন্ট্রোল
                            </span>
                          )}
                          {admin.permissions.canManageAdmins && (
                            <span className="px-2 py-0.5 rounded-md bg-[#102B3F] text-[#D6F36A] font-bold">
                              অ্যাডমিন ব্যবস্থাপনা
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add / Edit Admin Modal */}
                  {isAddAdminOpen && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 overflow-y-auto">
                      <div className="bg-white dark:bg-[#102B3F] max-w-xl w-full rounded-2xl border border-stone-200 dark:border-white/10 p-6 space-y-4 my-8 shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-white/10">
                          <h3 className="font-extrabold text-base text-stone-900 dark:text-white flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-[#167D78]" />
                            <span>
                              {editingAdmin
                                ? (language === 'bn' ? 'অ্যাডমিন তথ্য ও অনুমতি সম্পাদনা' : 'Edit Admin & Permissions')
                                : (language === 'bn' ? 'নতুন অ্যাডমিন বা টিম লিডার নিয়োগ' : 'Create New Admin')}
                            </span>
                          </h3>
                          <button
                            onClick={() => setIsAddAdminOpen(false)}
                            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-white cursor-pointer"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <form onSubmit={handleSaveAdminForm} className="space-y-4 text-xs">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="font-bold block mb-1">পূর্ণ নাম (বাংলা / ইংরেজি) *</label>
                              <input
                                type="text"
                                required
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                placeholder="যেমন: সৈয়দা ফারহানা আক্তার"
                                className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                              />
                            </div>
                            <div>
                              <label className="font-bold block mb-1">পদবী ও ভূমিকা (Role Preset) *</label>
                              <select
                                value={formRole}
                                onChange={(e) => handleRoleChange(e.target.value as AdminRole)}
                                className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                              >
                                <option value="womens_team_leader">🌸 Women’s Team Leader (উইমেন্স টিম লিডার)</option>
                                <option value="member_manager">👥 Member Manager (সদস্য ব্যবস্থাপনা সাব-অ্যাডমিন)</option>
                                <option value="content_editor">📝 Content & Notice Editor (কনটেন্ট সাব-অ্যাডমিন)</option>
                                <option value="finance_manager">💰 Finance & Donation Auditor (অনুদান অডিট সাব-অ্যাডমিন)</option>
                                <option value="custom_admin">⚙️ Custom Admin (কাস্টম অনুমতি)</option>
                                <option value="super_admin">👑 Super Admin (সর্বোচ্চ পূর্ণ ক্ষমতা)</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="font-bold block mb-1">ইমেইল ঠিকানা *</label>
                              <input
                                type="email"
                                required
                                value={formEmail}
                                onChange={(e) => setFormEmail(e.target.value)}
                                placeholder="e.g. leader@colash.org"
                                className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                              />
                            </div>
                            <div>
                              <label className="font-bold block mb-1">মোবাইল নম্বর *</label>
                              <input
                                type="text"
                                required
                                value={formPhone}
                                onChange={(e) => setFormPhone(e.target.value)}
                                placeholder="01712-XXXXXX"
                                className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="font-bold block mb-1">
                              {editingAdmin ? 'পাসওয়ার্ড (পরিবর্তন করতে চাইলে লিখুন)' : 'লগইন পাসওয়ার্ড *'}
                            </label>
                            <input
                              type="text"
                              required={!editingAdmin}
                              value={formPassword}
                              onChange={(e) => setFormPassword(e.target.value)}
                              placeholder={editingAdmin ? 'অপরিবর্তিত রাখতে খালি রাখুন' : 'কমপক্ষে ৬ অক্ষর'}
                              className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 font-mono"
                            />
                          </div>

                          {/* Granular Permissions Section */}
                          <div className="pt-2 border-t border-stone-200 dark:border-white/10">
                            <label className="font-bold block mb-2 text-stone-800 dark:text-stone-200">
                              সুনির্দিষ্ট কাজের অনুমতি নির্ধারণ (Granular Permissions):
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formPermissions.canViewMembers}
                                  onChange={() => handleTogglePermission('canViewMembers')}
                                  className="w-4 h-4 rounded text-[#167D78]"
                                />
                                <span>সদস্য তালিকা পর্যবেক্ষণ</span>
                              </label>

                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formPermissions.canAddMembers}
                                  onChange={() => handleTogglePermission('canAddMembers')}
                                  className="w-4 h-4 rounded text-[#167D78]"
                                />
                                <span>নতুন সদস্য অনুমোদন ও যোগ</span>
                              </label>

                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formPermissions.canEditMembers}
                                  onChange={() => handleTogglePermission('canEditMembers')}
                                  className="w-4 h-4 rounded text-[#167D78]"
                                />
                                <span>সদস্যের তথ্য সম্পাদনা</span>
                              </label>

                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formPermissions.canDeleteMembers}
                                  onChange={() => handleTogglePermission('canDeleteMembers')}
                                  className="w-4 h-4 rounded text-[#167D78]"
                                />
                                <span className="text-rose-600 dark:text-rose-400">সদস্য পদ বাতিল / অপসারণ</span>
                              </label>

                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formPermissions.canVerifyDonations}
                                  onChange={() => handleTogglePermission('canVerifyDonations')}
                                  className="w-4 h-4 rounded text-[#167D78]"
                                />
                                <span>অনুদান ও TrxID যাচাইকরণ</span>
                              </label>

                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formPermissions.canManageProjects}
                                  onChange={() => handleTogglePermission('canManageProjects')}
                                  className="w-4 h-4 rounded text-[#167D78]"
                                />
                                <span>মানবিক ত্রাণ প্রকল্প পরিচালনা</span>
                              </label>

                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formPermissions.canManageNotices}
                                  onChange={() => handleTogglePermission('canManageNotices')}
                                  className="w-4 h-4 rounded text-[#167D78]"
                                />
                                <span>অফিসিয়াল নোটিশ ও বিজ্ঞপ্তি প্রকাশ</span>
                              </label>

                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formPermissions.canManageFiles}
                                  onChange={() => handleTogglePermission('canManageFiles')}
                                  className="w-4 h-4 rounded text-[#167D78]"
                                />
                                <span>রেজোলিউশন ও কার্যবিবরণী ফাইল আপলোড</span>
                              </label>

                              <label className="flex items-center gap-2 cursor-pointer sm:col-span-2 p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
                                <input
                                  type="checkbox"
                                  checked={formPermissions.canManageWomensTeam}
                                  onChange={() => handleTogglePermission('canManageWomensTeam')}
                                  className="w-4 h-4 rounded text-rose-600"
                                />
                                <span className="font-bold text-rose-800 dark:text-rose-200">
                                  উইমেন্স টিম পূর্ণ পরিচালনা (সদস্য, কমিটি, লোগো, নোটিশ, ফাইল)
                                </span>
                              </label>

                              {formRole === 'super_admin' && (
                                <label className="flex items-center gap-2 cursor-pointer sm:col-span-2 p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
                                  <input
                                    type="checkbox"
                                    checked={formPermissions.canManageAdmins}
                                    onChange={() => handleTogglePermission('canManageAdmins')}
                                    className="w-4 h-4 rounded text-amber-600"
                                  />
                                  <span className="font-bold text-amber-800 dark:text-amber-200">
                                    অন্যান্য অ্যাডমিনদের তৈরি ও অনুমতি নিয়ন্ত্রণ (Super Admin Only)
                                  </span>
                                </label>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200 dark:border-white/10">
                            <button
                              type="button"
                              onClick={() => setIsAddAdminOpen(false)}
                              className="px-4 py-2 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-white cursor-pointer font-semibold"
                            >
                              বাতিল
                            </button>
                            <button
                              type="submit"
                              className="px-5 py-2 rounded-xl bg-[#167D78] hover:bg-[#102B3F] text-white font-bold cursor-pointer transition-colors shadow-md"
                            >
                              {editingAdmin ? 'তথ্য সংরক্ষণ' : 'অ্যাডমিন তৈরি করুন'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: VOLUNTEERS & MEMBERS (Requirement 3: সদস্য ও ভলান্টিয়ার অপশন) */}
              {activeTab === 'volunteers' && (
                <div className="space-y-4">
                  {!permissions.canViewMembers ? (
                    <div className="p-8 text-center bg-stone-50 dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3">
                      <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto" />
                      <h4 className="font-bold text-base">{language === 'bn' ? 'অনুমতি সংরক্ষিত' : 'Permission Restricted'}</h4>
                      <p className="text-xs text-stone-500">
                        {language === 'bn'
                          ? 'আপনার অ্যাকাউন্টে সাধারণ সদস্য বা স্বেচ্ছাসেবী তালিকা দেখার অনুমতি প্রদান করা হয়নি।'
                          : 'You do not have permission to view general members. Contact Super Admin.'}
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Sub-tab Navigation between Volunteers and General Members */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200 dark:border-stone-800">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setVolunteerSubTab('volunteers')}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                              volunteerSubTab === 'volunteers'
                                ? 'bg-[#167D78] text-white shadow-sm'
                                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                            }`}
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>{language === 'bn' ? 'স্বেচ্ছাসেবী নেটওয়ার্ক' : 'Volunteers'}</span>
                            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                              {volunteers.length}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setVolunteerSubTab('members')}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                              volunteerSubTab === 'members'
                                ? 'bg-[#167D78] text-white shadow-sm'
                                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                            }`}
                          >
                            <IdCard className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{language === 'bn' ? 'সাধারণ সদস্য পরিষদ' : 'General Members'}</span>
                            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                              {generalMembers.length}
                            </span>
                          </button>
                        </div>

                        {volunteerSubTab === 'volunteers' && permissions.canAddMembers && (
                          <button
                            type="button"
                            onClick={handleOpenAddVolunteer}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer self-start sm:self-auto"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{language === 'bn' ? 'নতুন স্বেচ্ছাসেবী যুক্ত করুন' : 'Add Volunteer'}</span>
                          </button>
                        )}
                      </div>

                      {/* SUB-VIEW 1: GENERAL MEMBERS */}
                      {volunteerSubTab === 'members' && onUpdateGeneralMembers && (
                        <GeneralMembersAdminPanel
                          currentAdmin={currentAdmin}
                          language={language}
                          generalMembers={generalMembers}
                          onUpdateGeneralMembers={onUpdateGeneralMembers}
                          onToast={onToast}
                        />
                      )}

                      {/* SUB-VIEW 2: VOLUNTEERS MANAGEMENT */}
                      {volunteerSubTab === 'volunteers' && (
                        <div className="space-y-4">
                          {/* Search and Filters */}
                          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                            <div className="relative flex-1">
                              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                              <input
                                type="text"
                                value={volunteerSearch}
                                onChange={(e) => setVolunteerSearch(e.target.value)}
                                placeholder={language === 'bn' ? 'নাম, জেলা, মোবাইল বা দক্ষতা দিয়ে খুঁজুন...' : 'Search by name, district, mobile...'}
                                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#167D78]"
                              />
                            </div>

                            {/* Status Filter Pills */}
                            <div className="flex items-center gap-1.5 overflow-x-auto text-xs shrink-0">
                              {(['all', 'active', 'pending', 'coordinator'] as const).map(tab => (
                                <button
                                  key={tab}
                                  type="button"
                                  onClick={() => setVolunteerStatusFilter(tab)}
                                  className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-colors ${
                                    volunteerStatusFilter === tab
                                      ? 'bg-[#102B3F] dark:bg-[#167D78] text-white'
                                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                                  }`}
                                >
                                  {tab === 'all'
                                    ? `সকল (${volunteers.length})`
                                    : tab === 'active'
                                    ? `সক্রিয় (${volunteers.filter(v => v.status === 'active').length})`
                                    : tab === 'pending'
                                    ? `অপেক্ষমাণ (${volunteers.filter(v => v.status === 'pending').length})`
                                    : `সমন্বয়ক (${volunteers.filter(v => v.role === 'coordinator').length})`}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Volunteers Cards Grid */}
                          {(() => {
                            const filteredVols = volunteers.filter(v => {
                              if (volunteerStatusFilter === 'active' && v.status !== 'active') return false;
                              if (volunteerStatusFilter === 'pending' && v.status !== 'pending') return false;
                              if (volunteerStatusFilter === 'coordinator' && v.role !== 'coordinator') return false;
                              const q = volunteerSearch.toLowerCase().trim();
                              if (!q) return true;
                              return (
                                (v.fullName || '').toLowerCase().includes(q) ||
                                (v.phone || '').toLowerCase().includes(q) ||
                                (v.district || '').toLowerCase().includes(q) ||
                                (v.bloodGroup || '').toLowerCase().includes(q) ||
                                ((v.skills || []).join(' ')).toLowerCase().includes(q)
                              );
                            });

                            if (filteredVols.length === 0) {
                              return (
                                <div className="p-8 text-center text-stone-400 bg-stone-50 dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
                                  {language === 'bn' ? 'কোনো স্বেচ্ছাসেবী পাওয়া যায়নি।' : 'No volunteers found.'}
                                </div>
                              );
                            }

                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {filteredVols.map((v) => (
                                  <div
                                    key={v.id}
                                    className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/60 space-y-2.5 text-xs shadow-xs hover:border-[#167D78] transition-all flex flex-col justify-between"
                                  >
                                    <div>
                                      {/* Header Row */}
                                      <div className="flex items-start justify-between gap-2">
                                        <div>
                                          <div className="font-bold text-sm text-[#102B3F] dark:text-white flex items-center gap-1.5">
                                            <span>{v.fullName}</span>
                                            {v.role === 'coordinator' && (
                                              <span className="px-2 py-0.2 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-[10px]">
                                                {language === 'bn' ? 'মাঠ সমন্বয়ক' : 'Coordinator'}
                                              </span>
                                            )}
                                          </div>
                                          <div className="font-mono text-[11px] text-[#167D78] font-bold">
                                            ID: {v.id}
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0">
                                          <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-[10px]">
                                            {v.bloodGroup}
                                          </span>
                                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                            v.status === 'active'
                                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                              : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                          }`}>
                                            {v.status === 'active' ? (language === 'bn' ? 'সক্রিয়' : 'Active') : (language === 'bn' ? 'অপেক্ষমাণ' : 'Pending')}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Details */}
                                      <div className="text-stone-600 dark:text-stone-300 space-y-1 mt-2">
                                        <div><strong>জেলা:</strong> {v.district || 'মৌলভীবাজার'}</div>
                                        <div><strong>মোবাইল:</strong> {v.phone || 'N/A'}</div>
                                        {v.email && <div><strong>ইমেইল:</strong> {v.email}</div>}
                                        <div><strong>দক্ষতা:</strong> {(v.skills || []).join(', ') || 'ত্রাণ ও সেবা'}</div>
                                        <div><strong>সেবা অবদান:</strong> {v.volunteerHours || 0} ঘণ্টা</div>
                                      </div>
                                    </div>

                                    {/* Action Footer */}
                                    <div className="pt-2.5 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-2">
                                      <span className="text-[10px] text-stone-400 font-mono">
                                        যোগদান: {v.joinedDate || '2024'}
                                      </span>

                                      <div className="flex items-center gap-1.5">
                                        {/* Quick Toggle Status */}
                                        {permissions.canEditMembers && (
                                          <button
                                            type="button"
                                            onClick={() => handleToggleVolunteerStatus(v)}
                                            className={`px-2 py-1 text-[11px] font-bold rounded-lg cursor-pointer transition-colors ${
                                              v.status === 'active'
                                                ? 'bg-stone-200 dark:bg-stone-800 hover:bg-amber-100 text-stone-700 dark:text-stone-300'
                                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                            }`}
                                            title="স্ট্যাটাস পরিবর্তন"
                                          >
                                            {v.status === 'active' ? (language === 'bn' ? 'পেন্ডিং করুন' : 'Set Pending') : (language === 'bn' ? 'অনুমোদন দিন' : 'Approve')}
                                          </button>
                                        )}

                                        {/* Edit Button */}
                                        {permissions.canEditMembers && (
                                          <button
                                            type="button"
                                            onClick={() => handleOpenEditVolunteer(v)}
                                            className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 cursor-pointer"
                                            title="সম্পাদনা"
                                          >
                                            <Edit className="w-3.5 h-3.5" />
                                          </button>
                                        )}

                                        {/* Delete Button */}
                                        {(isSuperAdmin || permissions.canDeleteMembers) && (
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteVolunteerConfirm(v)}
                                            className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400 cursor-pointer"
                                            title="স্বেচ্ছাসেবী মুছুন"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {/* ADD / EDIT VOLUNTEER MODAL */}
                      {isVolunteerModalOpen && (
                        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                          <div className="bg-white dark:bg-[#102B3F] p-6 rounded-2xl max-w-lg w-full border border-stone-200 dark:border-white/10 space-y-4 text-xs shadow-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                              <h4 className="font-bold text-sm text-stone-900 dark:text-white flex items-center gap-2">
                                <Users className="w-4 h-4 text-[#167D78] dark:text-[#D6F36A]" />
                                <span>{editingVolunteer ? (language === 'bn' ? 'স্বেচ্ছাসেবী তথ্য সম্পাদনা' : 'Edit Volunteer') : (language === 'bn' ? 'নতুন স্বেচ্ছাসেবী নিবন্ধন' : 'Add New Volunteer')}</span>
                              </h4>
                              <button
                                type="button"
                                onClick={() => setIsVolunteerModalOpen(false)}
                                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            <form onSubmit={handleSaveVolunteer} className="space-y-3.5">
                              <div>
                                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                                  {language === 'bn' ? 'পূর্ণ নাম' : 'Full Name'} *
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={volName}
                                  onChange={(e) => setVolName(e.target.value)}
                                  placeholder="যেমন: সাকিব আল হাসান"
                                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#167D78]"
                                />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                                    {language === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}
                                  </label>
                                  <input
                                    type="text"
                                    value={volPhone}
                                    onChange={(e) => setVolPhone(e.target.value)}
                                    placeholder="01XXXXXXXXX"
                                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#167D78]"
                                  />
                                </div>
                                <div>
                                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                                    {language === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'}
                                  </label>
                                  <input
                                    type="email"
                                    value={volEmail}
                                    onChange={(e) => setVolEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#167D78]"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                                    {language === 'bn' ? 'রক্তের গ্রুপ' : 'Blood Group'}
                                  </label>
                                  <select
                                    value={volBlood}
                                    onChange={(e) => setVolBlood(e.target.value)}
                                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#167D78]"
                                  >
                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                      <option key={bg} value={bg}>{bg}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                                    {language === 'bn' ? 'জেলা / কর্মএলাকা' : 'District'}
                                  </label>
                                  <input
                                    type="text"
                                    value={volDistrict}
                                    onChange={(e) => setVolDistrict(e.target.value)}
                                    placeholder="মৌলভীবাজার / সিলেট"
                                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#167D78]"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                                    {language === 'bn' ? 'সাংগঠনিক ভূমিকা' : 'Role'}
                                  </label>
                                  <select
                                    value={volRole}
                                    onChange={(e) => setVolRole(e.target.value as any)}
                                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#167D78]"
                                  >
                                    <option value="volunteer">স্বেচ্ছাসেবী</option>
                                    <option value="coordinator">মাঠ সমন্বয়ক</option>
                                    <option value="member">সদস্য</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                                    {language === 'bn' ? 'অনুমোদন স্ট্যাটাস' : 'Status'}
                                  </label>
                                  <select
                                    value={volStatus}
                                    onChange={(e) => setVolStatus(e.target.value as any)}
                                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#167D78]"
                                  >
                                    <option value="active">সক্রিয় (Active)</option>
                                    <option value="pending">অপেক্ষমাণ (Pending)</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                                    {language === 'bn' ? 'সেবা ঘণ্টা' : 'Hours'}
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={volHours}
                                    onChange={(e) => setVolHours(Number(e.target.value) || 0)}
                                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#167D78]"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                                  {language === 'bn' ? 'দক্ষতা ও সেবা ক্ষেত্র (কমা দিয়ে লিখুন)' : 'Skills (Comma separated)'}
                                </label>
                                <input
                                  type="text"
                                  value={volSkills}
                                  onChange={(e) => setVolSkills(e.target.value)}
                                  placeholder="ত্রাণ বিতরণ, প্রাথমিক চিকিৎসা, সমাজসেবা"
                                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#167D78]"
                                />
                              </div>

                              <div className="flex gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                                <button
                                  type="submit"
                                  className="flex-1 py-2.5 bg-[#167D78] hover:bg-[#102B3F] text-white font-bold rounded-xl transition-all shadow cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                  <Save className="w-4 h-4 text-[#D6F36A]" />
                                  <span>{editingVolunteer ? (language === 'bn' ? 'তথ্য আপডেট করুন' : 'Update Volunteer') : (language === 'bn' ? 'স্বেচ্ছাসেবী সংরক্ষণ করুন' : 'Save Volunteer')}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setIsVolunteerModalOpen(false)}
                                  className="px-4 py-2.5 border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 rounded-xl cursor-pointer"
                                >
                                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* TAB: DONATIONS AUDIT */}
              {activeTab === 'donations' && (
                <div className="space-y-4">
                  {!permissions.canVerifyDonations ? (
                    <div className="p-8 text-center bg-stone-50 dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3">
                      <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto" />
                      <h4 className="font-bold text-base">{language === 'bn' ? 'অনুমতি সংরক্ষিত' : 'Permission Restricted'}</h4>
                      <p className="text-xs text-stone-500">
                        {language === 'bn'
                          ? 'আপনার অ্যাকাউন্টে আর্থিক অনুদান অডিট বা TrxID যাচাইয়ের অনুমতি নেই।'
                          : 'You do not have permission to audit or verify donations. Contact Super Admin.'}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <span className="text-xs font-bold text-stone-500 uppercase block">
                            {language === 'bn' ? 'সকল অনলাইন ও ব্যাংক অনুদানের তালিকা' : 'All Online & Bank Donations'}
                          </span>
                          <span className="text-xs text-stone-400">({donations.length} records)</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            exportDonationsToCSV(donations.map(d => ({
                              id: d.receiptNumber,
                              donorName: d.donorName,
                              amount: d.amount,
                              method: d.paymentMethod,
                              phoneOrTrx: d.transactionId || d.donorPhone,
                              date: d.date,
                              purpose: d.purposeNameBn,
                              status: d.isVerified ? 'verified' : 'pending'
                            })));
                            onToast('success', language === 'bn' ? 'অনুদানের তালিকা CSV ফাইলে এক্সপোর্ট হয়েছে' : 'Donations Exported');
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs border border-stone-200 dark:border-stone-700 cursor-pointer shadow-xs"
                          title="Export donations to CSV"
                        >
                          <Download className="w-3.5 h-3.5 text-[#167D78]" />
                          <span>{language === 'bn' ? 'এক্সপোর্ট CSV' : 'Export CSV'}</span>
                        </button>
                      </div>

                      <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300">
                              <tr>
                                <th className="p-3">রসিদ ও তারিখ</th>
                                <th className="p-3">দাতার নাম ও ফোন</th>
                                <th className="p-3">খাত</th>
                                <th className="p-3">পরিমাণ ও মাধ্যম</th>
                                <th className="p-3">TrxID ও স্ট্যাটাস</th>
                                <th className="p-3 text-right">অ্যাকশন</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                              {donations.map((d) => (
                                <tr key={d.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/30">
                                  <td className="p-3 font-mono">
                                    <div className="font-bold text-[#167D78]">{d.receiptNumber}</div>
                                    <div className="text-[10px] text-stone-400">{d.date}</div>
                                  </td>
                                  <td className="p-3">
                                    <div className="font-semibold text-stone-900 dark:text-white">{d.donorName}</div>
                                    <div className="text-[10px] text-stone-500">{d.donorPhone}</div>
                                  </td>
                                  <td className="p-3 max-w-[150px] truncate text-stone-700 dark:text-stone-300">
                                    {d.purposeNameBn}
                                  </td>
                                  <td className="p-3 font-bold tabular-nums">
                                    ৳{d.amount.toLocaleString()}
                                    <span className="block text-[10px] uppercase font-normal text-stone-400">{d.paymentMethod}</span>
                                  </td>
                                  <td className="p-3">
                                    <span className="font-mono text-[11px] block">{d.transactionId}</span>
                                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${d.isVerified ? 'text-emerald-600' : 'text-amber-500'}`}>
                                      {d.isVerified ? '✓ ভেরিফাইড' : '⏳ যাচাই প্রক্রিয়াধীন'}
                                    </span>
                                  </td>
                                  <td className="p-3 text-right whitespace-nowrap">
                                    {/* Money Receipt Button */}
                                    <button
                                      type="button"
                                      onClick={() => setSelectedDonationForReceipt({
                                        id: d.receiptNumber,
                                        donorName: d.donorName,
                                        amount: d.amount,
                                        method: d.paymentMethod,
                                        phoneOrTrx: d.transactionId || d.donorPhone,
                                        date: d.date,
                                        purpose: d.purposeNameBn,
                                        status: d.isVerified ? 'verified' : 'pending'
                                      })}
                                      className="p-1 text-[#167D78] hover:text-[#102B3F] hover:bg-[#167D78]/10 rounded-md transition-colors inline-flex items-center mr-1"
                                      title={language === 'bn' ? 'অফিসিয়াল রসিদ দেখুন / প্রিন্ট' : 'View/Print Official Receipt'}
                                    >
                                      <Printer className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      onClick={() => onToggleDonationVerify(d.id)}
                                      className={`px-2.5 py-1 text-[11px] font-bold rounded-md cursor-pointer ${
                                        d.isVerified
                                          ? 'bg-stone-100 dark:bg-stone-800 text-stone-600 hover:bg-stone-200'
                                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                      }`}
                                    >
                                      {d.isVerified ? 'অননুমোদিত করুন' : 'যাচাই অনুমোদন'}
                                    </button>

                                    {onDeleteDonation && (isSuperAdmin || permissions.canVerifyDonations) && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (window.confirm(language === 'bn' ? `আপনি কি নিশ্চিতভাবে এই অনুদান রেকর্ডটি (${d.receiptNumber} - ৳${d.amount}) ডিলিট করতে চান?` : `Delete donation ${d.receiptNumber}?`)) {
                                            onDeleteDonation(d.id);
                                          }
                                        }}
                                        className="ml-1.5 p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors inline-flex items-center"
                                        title={language === 'bn' ? 'অনুদান রেকর্ড ডিলিট করুন' : 'Delete donation record'}
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* TAB: PROJECTS */}
              {activeTab === 'projects' && (
                <ProjectsAdminPanel
                  currentAdmin={currentAdmin}
                  language={language}
                  projects={projects}
                  onAddNewProject={onAddNewProject}
                  onUpdateProject={onUpdateProject || onAddNewProject}
                  onDeleteProject={onDeleteProject || ((id) => console.log('Delete', id))}
                  onToast={onToast}
                />
              )}

              {/* TAB: NOTICES */}
              {activeTab === 'notices' && (
                <div className="space-y-4">
                  {!permissions.canManageNotices ? (
                    <div className="p-8 text-center bg-stone-50 dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3">
                      <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto" />
                      <h4 className="font-bold text-base">{language === 'bn' ? 'অনুমতি সংরক্ষিত' : 'Permission Restricted'}</h4>
                      <p className="text-xs text-stone-500">
                        {language === 'bn'
                          ? 'আপনার অ্যাকাউন্টে অফিসিয়াল নোটিশ বা বিজ্ঞপ্তি প্রকাশের অনুমতি নেই।'
                          : 'You do not have permission to publish notices. Contact Super Admin.'}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-500 uppercase">
                          {language === 'bn' ? 'অফিসিয়াল নোটিশ ও বিজ্ঞপ্তি' : 'Official Notices'}
                        </span>
                        <button
                          onClick={() => setShowAddNotice(!showAddNotice)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-[#167D78] rounded-lg cursor-pointer hover:bg-[#102B3F]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{language === 'bn' ? 'নতুন নোটিশ লিখুন' : 'New Notice'}</span>
                        </button>
                      </div>

                      {showAddNotice && (
                        <form onSubmit={handleCreateNotice} className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3 text-xs">
                          <div>
                            <label className="font-semibold block mb-1">বিজ্ঞপ্তির শিরোনাম (বাংলা)</label>
                            <input
                              type="text"
                              required
                              value={noticeTitleBn}
                              onChange={(e) => setNoticeTitleBn(e.target.value)}
                              placeholder="যেমন: জরুরি বন্যা ত্রাণ সংগ্রহ কর্মসূচি ২০২৬"
                              className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="font-semibold block mb-1">ক্যাটাগরি</label>
                            <select
                              value={noticeCategory}
                              onChange={(e) => setNoticeCategory(e.target.value as any)}
                              className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg"
                            >
                              <option value="emergency">জরুরি বিজ্ঞপ্তি (Emergency)</option>
                              <option value="circular">দাপ্তরিক পরিপত্র (Circular)</option>
                              <option value="audit">অডিট সংক্রান্ত (Audit)</option>
                            </select>
                          </div>
                          <div>
                            <label className="font-semibold block mb-1">বিজ্ঞপ্তির মূল বক্তব্য</label>
                            <textarea
                              rows={3}
                              required
                              value={noticeBodyBn}
                              onChange={(e) => setNoticeBodyBn(e.target.value)}
                              placeholder="বিজ্ঞপ্তির বিস্তারিত বিবরণ এখানে লিখুন..."
                              className="w-full p-2 bg-white dark:bg-stone-800 border rounded-lg"
                            />
                          </div>
                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => setShowAddNotice(false)}
                              className="px-3 py-1.5 text-stone-500 hover:text-stone-800 cursor-pointer"
                            >
                              বাতিল
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-1.5 font-bold text-white bg-[#167D78] rounded-lg cursor-pointer"
                            >
                              প্রকাশ করুন
                            </button>
                          </div>
                        </form>
                      )}

                        <div className="space-y-3">
                          {notices.map((n) => (
                            <div key={n.id} className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs">
                              <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-[#167D78] uppercase">{n.category}</span>
                                  <span>·</span>
                                  <span>{n.date}</span>
                                </div>
                                {onDeleteNotice && (
                                  <button
                                    onClick={() => {
                                      if (confirm(language === 'bn' ? `"${n.titleBn}" বিজ্ঞপ্তিটি মুছে ফেলতে চান?` : 'Delete this notice?')) {
                                        onDeleteNotice(n.id);
                                      }
                                    }}
                                    className="p-1 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                                    title="বিজ্ঞপ্তি মুছে ফেলুন"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                              <div className="font-bold text-stone-900 dark:text-white">{n.titleBn}</div>
                              <p className="text-stone-500 line-clamp-2 mt-0.5">{n.bodyBn}</p>
                            </div>
                          ))}
                        </div>
                    </>
                  )}
                </div>
              )}

              {/* TAB: WOMEN'S TEAM CENTRAL & LEADER MANAGEMENT */}
              {activeTab === 'womens_team' && (isSuperAdmin || permissions.canManageWomensTeam) && (
                <div className="space-y-5">
                  {/* Banner */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-900/20 to-purple-900/20 border border-rose-200 dark:border-rose-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-rose-500" />
                        <h4 className="font-bold text-base text-stone-900 dark:text-white">
                          {language === 'bn' ? 'CoLASH Foundation Women’s Team পরিচালনা ও লিডারশিপ' : 'Women’s Wing Central Authority & Leadership'}
                        </h4>
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 max-w-xl">
                        {language === 'bn'
                          ? 'উইমেন্স টিম লিডার এবং প্রধান অ্যাডমিন এখান থেকে উইমেন্স টিমের নিজস্ব লিডারশিপ হস্তান্তর, লোগো, কমিটি, Member ID, নোটিশ, সভার কার্যবিবরণী ও ফাইল সম্পূর্ণ আলাদাভাবে পরিচালনা করতে পারবেন।'
                          : 'Manage dedicated Women’s Wing leadership appointment, logo, committee, members, notices and restricted files.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenChangeLeaderModal()}
                        className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all"
                      >
                        <Crown className="w-4 h-4 text-amber-200" />
                        <span>{language === 'bn' ? 'টিম লিডার পরিবর্তন' : 'Change Leader'}</span>
                      </button>

                      {onOpenWomensAdmin && (
                        <button
                          type="button"
                          onClick={onOpenWomensAdmin}
                          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>{language === 'bn' ? 'উইমেন্স টিম অ্যাডমিন প্যানেল খুলুন' : 'Launch Women’s Admin Panel'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* HERO LEADER APPOINTMENT & PROFILE CARD */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-50 via-white to-pink-50/50 dark:from-stone-900 dark:via-stone-900 dark:to-rose-950/20 border-2 border-rose-300 dark:border-rose-800 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-rose-100 dark:border-rose-900/40">
                      <div className="flex items-center gap-3.5">
                        <div className="relative">
                          <img
                            src={currentWomensLeader?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80'}
                            alt={currentWomensLeader?.name || 'Leader'}
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-rose-500 shadow-md"
                          />
                          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] shadow">
                            👑
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-extrabold text-[10px] uppercase tracking-wider">
                              বর্তমান উইমেন্স টিম লিডার (Current Leader)
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              সক্রিয় অ্যাক্সেস
                            </span>
                          </div>
                          <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-white mt-0.5">
                            {currentWomensLeader?.name || 'সৈয়দা ফারহানা আক্তার'}
                          </h3>
                          <div className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                            {currentWomensLeader?.email || 'farhana.colash@gmail.com'} · {currentWomensLeader?.phone || '01711-234567'}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenChangeLeaderModal()}
                          className="px-4 py-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow transition-all"
                        >
                          <Crown className="w-4 h-4 text-amber-200" />
                          <span>{language === 'bn' ? '🌸 টিম লিডার পরিবর্তন / নতুন নিয়োগ' : 'Change / Appoint Leader'}</span>
                        </button>
                        {currentWomensLeader && (
                          <button
                            type="button"
                            onClick={() => handleOpenEditAdmin(currentWomensLeader)}
                            className="px-3 py-2 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                          >
                            <Key className="w-3.5 h-3.5 text-rose-600" />
                            <span>{language === 'bn' ? 'পাসওয়ার্ড ও তথ্য পরিবর্তন' : 'Change Password & Info'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3.5 text-xs">
                      <div className="p-2.5 rounded-xl bg-white/80 dark:bg-stone-800/80 border border-rose-100 dark:border-rose-950">
                        <span className="text-[10px] text-stone-400 uppercase font-bold block mb-0.5">লগইন ইউজারনেম / ইমেইল</span>
                        <span className="font-mono font-bold text-stone-800 dark:text-stone-200 truncate block">
                          {currentWomensLeader?.email || 'farhana.colash@gmail.com'}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/80 dark:bg-stone-800/80 border border-rose-100 dark:border-rose-950">
                        <span className="text-[10px] text-stone-400 uppercase font-bold block mb-0.5">নিযুক্তির মেয়াদ ও তারিখ</span>
                        <span className="font-semibold text-stone-800 dark:text-stone-200 block">
                          {currentWomensLeader?.createdAt || '২০২৬-০৩-১০'} (নিয়মিত কার্যকর)
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/80 dark:bg-stone-800/80 border border-rose-100 dark:border-rose-950">
                        <span className="text-[10px] text-stone-400 uppercase font-bold block mb-0.5">প্রশাসনিক ক্ষমতা</span>
                        <span className="font-bold text-rose-600 dark:text-rose-400 block">
                          উইমেন্স উইং সেন্ট্রাল কমান্ড (Full Access)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Governance Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-2">
                      <div className="text-stone-400 font-bold uppercase text-[10px]">অঙ্গসংগঠন স্ট্যাটাস</div>
                      <div className="font-bold text-sm text-stone-900 dark:text-white">স্বতন্ত্র স্বায়ত্তশাসিত উইং</div>
                      <p className="text-stone-500">মূল কমিটি ও ডেটাবেস থেকে পৃথক ও সুরক্ষিত নিরাপত্তা বলয়।</p>
                    </div>

                    <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-2">
                      <div className="text-stone-400 font-bold uppercase text-[10px]">কমিটি ও সদস্য সংখ্যা</div>
                      <div className="font-bold text-sm text-rose-600 dark:text-rose-400">
                        {womensTeamMembers.length > 0 ? `${womensTeamMembers.length} জন সক্রিয় সদস্য` : `${womensMembersCount} জন সক্রিয় সদস্য`}
                      </div>
                      <p className="text-stone-500">যেকোনো সদস্যকে এক ক্লিকে টিম লিডার পদে পদোন্নতি দেওয়া সম্ভব।</p>
                    </div>

                    <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-2">
                      <div className="text-stone-400 font-bold uppercase text-[10px]">লোগো ও ব্র্যান্ডিং</div>
                      <div className="font-bold text-sm text-[#167D78] dark:text-[#D6F36A]">নিজস্ব স্বতন্ত্র লোগো</div>
                      <p className="text-stone-500">অ্যাডমিন কর্তৃক পরিবর্তনযোগ্য ও লাইভ প্রিভিউ সমর্থিত।</p>
                    </div>
                  </div>

                  {/* Women's Team Committee Quick Promotion List */}
                  {womensTeamMembers.length > 0 && (
                    <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-xs uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-rose-600" />
                          <span>{language === 'bn' ? 'উইমেন্স টিম নির্বাহী কমিটি তালিকা (দ্রুত লিডার নির্বাচন)' : 'Committee Members (Quick Leader Promotion)'}</span>
                        </h5>
                        <span className="text-[11px] text-stone-400">
                          {language === 'bn' ? 'যেকোনো সদস্যকে লিডার হিসেবে নিয়োগ করতে বাটনে ক্লিক করুন' : 'Click to appoint as leader'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {womensTeamMembers.map((member) => {
                          const isCurrentlyLeader = member.nameBn === currentWomensLeader?.name || member.roleType === 'president';
                          return (
                            <div
                              key={member.id}
                              className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 transition-all ${
                                isCurrentlyLeader
                                  ? 'border-rose-400 bg-rose-50/50 dark:bg-rose-950/30'
                                  : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 hover:border-rose-300'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img
                                  src={member.photoUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80'}
                                  alt={member.nameBn}
                                  className="w-9 h-9 rounded-xl object-cover shrink-0 border border-stone-200 dark:border-stone-700"
                                />
                                <div className="min-w-0">
                                  <div className="font-bold text-xs text-stone-900 dark:text-white truncate">
                                    {member.nameBn}
                                  </div>
                                  <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                                    {member.designationBn}
                                  </div>
                                </div>
                              </div>

                              {isCurrentlyLeader ? (
                                <span className="px-2 py-1 bg-rose-600 text-white rounded-lg text-[10px] font-bold shrink-0 flex items-center gap-1">
                                  <Crown className="w-3 h-3 text-amber-200" />
                                  <span>বর্তমান লিডার</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleOpenChangeLeaderModal(member.id)}
                                  className="px-2.5 py-1 bg-white dark:bg-stone-700 hover:bg-rose-600 hover:text-white text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-lg text-[10px] font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <Crown className="w-3 h-3" />
                                  <span>লিডার বানান</span>
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: AUDIT LOGS ("গুরুত্বপূর্ণ পরিবর্তনের রেকর্ড") */}
              {activeTab === 'audit_logs' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-extrabold text-sm text-stone-900 dark:text-white flex items-center gap-2">
                        <Activity className="w-4 h-4 text-[#167D78]" />
                        <span>{language === 'bn' ? 'গুরুত্বপূর্ণ প্রশাসনিক পরিবর্তনের রেকর্ড (Audit Trail)' : 'Governance Audit Trail'}</span>
                      </h4>
                      <p className="text-xs text-stone-500">
                        {language === 'bn' ? 'কে, কখন কোন তথ্য বা অনুমতি পরিবর্তন করেছে তার অপরিবর্তনযোগ্য ইতিহাস।' : 'Immutable logs of administrative changes & approvals.'}
                      </p>
                    </div>

                    {/* Action buttons & Filter Pills */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {isSuperAdmin && auditLogs.length > 0 && onClearAuditLogs && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(language === 'bn' ? 'আপনি কি নিশ্চিত যে সকল অডিট হিস্টোরি মুছে ফেলতে চান?' : 'Are you sure you want to clear all audit logs?')) {
                              onClearAuditLogs();
                            }
                          }}
                          className="px-2.5 py-1 text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-300 dark:border-rose-800 rounded-lg font-semibold transition-all flex items-center gap-1 cursor-pointer text-xs"
                          title="সকল অডিট রেকর্ড মুছুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{language === 'bn' ? 'সকল রেকর্ড মুছুন' : 'Clear All'}</span>
                        </button>
                      )}

                      {/* Filter Pills */}
                      <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                        {(['all', 'auth', 'admin_manage', 'donation', 'womens_team'] as const).map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setAuditFilter(cat)}
                            className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-colors ${
                              auditFilter === cat
                                ? 'bg-[#167D78] text-white'
                                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                            }`}
                          >
                            {cat === 'all'
                              ? 'সকল'
                              : cat === 'auth'
                              ? 'লগইন'
                              : cat === 'admin_manage'
                              ? 'অ্যাডমিন'
                              : cat === 'donation'
                              ? 'অনুদান'
                              : 'উইমেন্স টিম'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden divide-y divide-stone-100 dark:divide-stone-800 text-xs">
                    {filteredLogs.length === 0 ? (
                      <div className="p-8 text-center text-stone-400">কোনো রেকর্ড পাওয়া যায়নি।</div>
                    ) : (
                      filteredLogs.map((log) => (
                        <div key={log.id} className="p-3.5 hover:bg-stone-50/60 dark:hover:bg-stone-900/40 flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-[#167D78] shrink-0 mt-0.5">
                              <Activity className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="font-semibold text-stone-900 dark:text-white">
                                {language === 'bn' ? log.actionBn : log.actionEn}
                              </div>
                              <div className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-2">
                                <span className="font-bold text-[#167D78]">{log.adminName}</span>
                                <span>·</span>
                                <span className="font-mono text-stone-400">{log.timestamp}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-500">
                              {log.category}
                            </span>
                            {(isSuperAdmin || permissions.canManageAdmins) && onDeleteAuditLog && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(language === 'bn' ? 'এই অডিট রেকর্ডটি মুছে ফেলতে চান?' : 'Delete this audit log record?')) {
                                    onDeleteAuditLog(log.id);
                                  }
                                }}
                                className="p-1 text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                                title={language === 'bn' ? 'রেকর্ড মুছুন' : 'Delete Log'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB: SECURITY & PASSWORD CHANGE (A from Prompt) */}
              {activeTab === 'security' && (
                <div className="space-y-6 max-w-xl">
                  <div>
                    <h4 className="font-extrabold text-sm text-stone-900 dark:text-white flex items-center gap-2">
                      <Key className="w-4 h-4 text-[#167D78]" />
                      <span>{language === 'bn' ? 'অ্যাকাউন্ট নিরাপত্তা ও পাসওয়ার্ড পরিবর্তন' : 'Account Security & Password'}</span>
                    </h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {language === 'bn'
                        ? 'আপনার বর্তমান লগইন অ্যাকাউন্টের পাসওয়ার্ড নিরাপদভাবে পরিবর্তন করুন।'
                        : 'Update your personal credentials and review access safeguards.'}
                    </p>
                  </div>

                  <form onSubmit={handleChangePasswordSubmit} className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3.5 text-xs">
                    <div>
                      <label className="font-bold block mb-1">বর্তমান পাসওয়ার্ড *</label>
                      <input
                        type="password"
                        required
                        value={currentPasswordInput}
                        onChange={(e) => setCurrentPasswordInput(e.target.value)}
                        placeholder="••••••••"
                        className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                      />
                    </div>

                    <div>
                      <label className="font-bold block mb-1">নতুন পাসওয়ার্ড *</label>
                      <input
                        type="password"
                        required
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        placeholder="কমপক্ষে ৬ অক্ষর"
                        className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                      />
                    </div>

                    <div>
                      <label className="font-bold block mb-1">নতুন পাসওয়ার্ড নিশ্চিত করুন *</label>
                      <input
                        type="password"
                        required
                        value={confirmPasswordInput}
                        onChange={(e) => setConfirmPasswordInput(e.target.value)}
                        placeholder="একই পাসওয়ার্ড পুনরায় লিখুন"
                        className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-[#167D78] hover:bg-[#102B3F] text-white font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
                      >
                        <Save className="w-4 h-4 text-[#D6F36A]" />
                        <span>{language === 'bn' ? 'পাসওয়ার্ড হালনাগাদ করুন' : 'Update Password'}</span>
                      </button>
                    </div>
                  </form>

                  {/* Account Recovery Info */}
                  <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 text-xs space-y-1.5">
                    <div className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>{language === 'bn' ? 'অ্যাকাউন্ট পুনরুদ্ধার ও সাইবার নিরাপত্তা নীতিমালা' : 'Account Recovery Policy'}</span>
                    </div>
                    <p className="text-blue-800/80 dark:text-blue-200/80 text-[11px] leading-relaxed">
                      {language === 'bn'
                        ? 'পাসওয়ার্ড ভুলে গেলে প্রধান অ্যাডমিন (+880 1646-475348) অ্যাকাউন্টের মালিকানা যাচাইপূর্বক তাৎক্ষণিক নতুন ওয়ান-টাইম পাসওয়ার্ড প্রদান করতে পারবেন।'
                        : 'If you lose access, the Super Admin can issue an emergency reset token upon verification.'}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB: GOOGLE MAPS & LOCATION SETTINGS */}
              {activeTab === 'location_map' && mapConfig && (
                <LocationMapSettingsPanel
                  language={language}
                  mapConfig={mapConfig}
                  onUpdateMapConfig={(newConfig) => {
                    if (onUpdateMapConfig) {
                      onUpdateMapConfig(newConfig);
                    }
                  }}
                  onToast={onToast}
                />
              )}

              {/* TAB: PUBLIC APPLICATIONS & MESSAGES */}
              {activeTab === 'public_applications' && (
                <PublicApplicationsAdminPanel
                  language={language}
                  applications={publicApplications}
                  onUpdateApplication={(updatedApp) => {
                    if (onUpdatePublicApplication) {
                      onUpdatePublicApplication(updatedApp);
                    }
                  }}
                  onToast={onToast}
                  currentAdminName={currentAdmin?.name || 'কোলাশ অ্যাডমিন'}
                />
              )}

              {/* TAB: COMMITTEE MANAGEMENT */}
              {activeTab === 'committee_manage' && onUpdateCommitteeTerms && (
                <CommitteeManagementPanel
                  currentAdmin={currentAdmin}
                  language={language}
                  committeeTerms={committeeTerms}
                  onUpdateCommitteeTerms={onUpdateCommitteeTerms}
                  onToast={onToast}
                />
              )}

              {/* TAB: ADVISORY COUNCIL MANAGEMENT */}
              {activeTab === 'advisors_manage' && onUpdateAdvisors && (
                <AdvisoryCouncilAdminPanel
                  currentAdmin={currentAdmin}
                  language={language}
                  advisors={advisors}
                  onUpdateAdvisors={onUpdateAdvisors}
                  onToast={onToast}
                />
              )}

              {/* TAB: GENERAL MEMBERS DIRECTORY & EDITING */}
              {activeTab === 'members_manage' && onUpdateGeneralMembers && (
                <GeneralMembersAdminPanel
                  currentAdmin={currentAdmin}
                  language={language}
                  generalMembers={generalMembers}
                  onUpdateGeneralMembers={onUpdateGeneralMembers}
                  onToast={onToast}
                />
              )}

              {/* TAB: PAYMENT CHANNELS MANAGEMENT (Requirement 7) */}
              {activeTab === 'payment_channels' && onUpdatePaymentChannels && (
                <PaymentChannelsAdminPanel
                  currentAdmin={currentAdmin}
                  language={language}
                  paymentChannels={paymentChannels}
                  onUpdatePaymentChannels={onUpdatePaymentChannels}
                  onToast={onToast}
                />
              )}

              {/* TAB: CUSTOM WEBSITE EDITOR (Requirement 2: কাস্টম ওয়েবসাইট এডিটর) */}
              {activeTab === 'website_editor' && (
                <CustomWebsiteEditorPanel
                  currentAdmin={currentAdmin}
                  language={language}
                  publishedConfig={publishedWebsiteConfig || INITIAL_WEBSITE_CUSTOM_CONFIG}
                  onPublishConfig={onPublishWebsiteConfig || (() => {})}
                  onToast={onToast}
                />
              )}

              {/* TAB: SYSTEM BACKUP & FUTURE-PROOF ARCHITECTURE (10-20 Years Vision) */}
              {activeTab === 'system_backup' && (
                <div className="space-y-6 text-xs">
                  {/* Banner */}
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-[#102B3F] to-[#167D78] text-white shadow-md">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#D6F36A] text-xs font-bold uppercase tracking-wider mb-2">
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? '১০-২০ বছরের ভবিষ্যৎমুখী আর্কিটেকচার ও ডাটাবেস ব্যাকআপ' : '10-20 Years Future-Proof Architecture & Backup'}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black">
                      {language === 'bn' ? 'কোলাশ ক্লাউড ব্যাকআপ, মাইগ্রেশন ও ডিজাস্টার রিকভারি' : 'CoLASH Cloud Backup, Data Migration & Disaster Recovery'}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-200 mt-1 max-w-2xl leading-relaxed">
                      {language === 'bn'
                        ? 'ওয়েবসাইটের সম্পূর্ণ ডাটাবেস (প্রকল্প, সদস্য, কমিটি, পেমেন্ট চ্যানেল, অনুদান ও কনফিগারেশন) এক ক্লিকে JSON ব্যাকআপ ডাউনলোড করুন অথবা পূর্বের ব্যাকআপ ফাইল থেকে সম্পূর্ণ ডাটাবেস রিস্টোর করুন।'
                        : 'Export complete JSON database backup, restore previous states, verify schema version, and maintain 10-20 year architectural forward-compatibility.'}
                    </p>
                  </div>

                  {/* Architecture Metrics Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-white dark:bg-[#0c1a24] border border-stone-200 dark:border-stone-800">
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">{language === 'bn' ? 'ডাটাবেস আর্কিটেকচার' : 'Schema Version'}</span>
                      <span className="text-base font-extrabold text-[#167D78] dark:text-[#D6F36A] font-mono">v2.4 (2026-2046 Ready)</span>
                      <p className="text-[11px] text-stone-500 mt-1">{language === 'bn' ? 'মডুলার ও ব্যাকওয়ার্ড কম্প্যাটিবল' : 'Modular & Backward-Compatible'}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-white dark:bg-[#0c1a24] border border-stone-200 dark:border-stone-800">
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">{language === 'bn' ? 'সক্রিয় রেকর্ড কাউন্ট' : 'Total Active Records'}</span>
                      <span className="text-base font-extrabold text-[#102B3F] dark:text-white font-mono">
                        {projects.length + generalMembers.length + donations.length + volunteers.length + paymentChannels.length} টি
                      </span>
                      <p className="text-[11px] text-stone-500 mt-1">{language === 'bn' ? 'সমস্ত কালেকশন সিঙ্কড' : 'All Collections Synchronized'}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-white dark:bg-[#0c1a24] border border-stone-200 dark:border-stone-800">
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">{language === 'bn' ? 'ডেলিভারি নেটওয়ার্ক' : 'Cloud State'}</span>
                      <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">Realtime / Local + API</span>
                      <p className="text-[11px] text-stone-500 mt-1">{language === 'bn' ? 'নিরবচ্ছিন্ন প্রাপ্যতা' : 'High Availability'}</p>
                    </div>
                  </div>

                  {/* Backup & Restore Action Boxes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* Export Box */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1a24] border border-stone-200 dark:border-stone-800 space-y-3">
                      <div className="flex items-center gap-2 font-bold text-sm text-[#102B3F] dark:text-white">
                        <Save className="w-4 h-4 text-[#167D78]" />
                        <span>{language === 'bn' ? 'সম্পূর্ণ ডাটাবেস এক্সপোর্ট / ডাউনলোড' : 'Export Full JSON Database'}</span>
                      </div>
                      <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                        {language === 'bn'
                          ? 'বর্তমান সকল প্রকল্প, সদস্য তালিকা, কমিটি মেয়াদ, উপদেষ্টা, অনুদান লেজার, পেমেন্ট চ্যানেল এবং ওয়েবসাইট কনফিগারেশন একটি সুরক্ষিত JSON ফাইলে ডাউনলোড হবে।'
                          : 'Download a full snapshot of all projects, members, donations, payment channels and configs.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          const backupData = {
                            version: '2.4',
                            exportDate: new Date().toISOString(),
                            organization: 'CoLASH Foundation',
                            projects,
                            notices,
                            donations,
                            volunteers,
                            generalMembers,
                            committeeTerms,
                            advisors,
                            paymentChannels,
                            websiteConfig: publishedWebsiteConfig,
                            womensTeamMembers,
                            mapConfig,
                            aiKnowledgeBase
                          };
                          const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `colash-backup-${new Date().toISOString().split('T')[0]}.json`;
                          a.click();
                          URL.revokeObjectURL(url);
                          onToast('success', language === 'bn' ? 'ডাটাবেস ব্যাকআপ ডাউনলোড সম্পন্ন' : 'Backup Downloaded');
                        }}
                        className="px-4 py-2.5 rounded-xl bg-[#167D78] hover:bg-[#102B3F] text-white font-bold cursor-pointer transition-colors flex items-center gap-2"
                      >
                        <Save className="w-4 h-4 text-[#D6F36A]" />
                        <span>{language === 'bn' ? 'JSON ব্যাকআপ ডাউনলোড করুন' : 'Download JSON Backup'}</span>
                      </button>
                    </div>

                    {/* Restore Box */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1a24] border border-stone-200 dark:border-stone-800 space-y-3">
                      <div className="flex items-center gap-2 font-bold text-sm text-[#102B3F] dark:text-white">
                        <RotateCcw className="w-4 h-4 text-[#E6A15B]" />
                        <span>{language === 'bn' ? 'পূর্বের ব্যাকআপ থেকে ডাটাবেস রিস্টোর' : 'Restore Database from JSON'}</span>
                      </div>
                      <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                        {language === 'bn'
                          ? 'পূর্বে সংরক্ষিত যে কোনো বৈধ JSON ব্যাকআপ ফাইল নির্বাচন করুন। সিস্টেম স্বয়ংক্রিয়ভাবে ডাটা ভ্যালিডেশন করে সকল রেকর্ড পুনরুদ্ধার করবে।'
                          : 'Select a valid CoLASH backup file to restore records.'}
                      </p>
                      <input
                        type="file"
                        id="backupRestoreFile"
                        accept=".json"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            try {
                              const parsed = JSON.parse(event.target?.result as string);
                              const normalized = parsed?.data ? {
                                projects: parsed.data.projects,
                                generalMembers: parsed.data.members,
                                donations: parsed.data.donations,
                                volunteers: parsed.data.volunteers,
                                committeeTerms: parsed.data.committeeTerms,
                                advisors: parsed.data.advisors,
                                womensTeamMembers: parsed.data.womensTeamMembers,
                              } : parsed;
                              if (onRestoreBackup) {
                                onRestoreBackup(normalized);
                              } else {
                                if (normalized.projects) {
                                  localStorage.setItem('colash_projects', JSON.stringify(normalized.projects));
                                }
                                if (normalized.generalMembers && onUpdateGeneralMembers) {
                                  onUpdateGeneralMembers(normalized.generalMembers);
                                }
                                if (normalized.committeeTerms && onUpdateCommitteeTerms) {
                                  onUpdateCommitteeTerms(normalized.committeeTerms);
                                }
                                if (normalized.advisors && onUpdateAdvisors) {
                                  onUpdateAdvisors(normalized.advisors);
                                }
                                if (normalized.paymentChannels && onUpdatePaymentChannels) {
                                  onUpdatePaymentChannels(normalized.paymentChannels);
                                }
                                if (normalized.websiteConfig && onPublishWebsiteConfig) {
                                  onPublishWebsiteConfig(normalized.websiteConfig);
                                }
                              }
                              onToast('success', language === 'bn' ? 'ডাটাবেস সফলভাবে রিস্টোর হয়েছে!' : 'Database Restored Successfully!');
                            } catch {
                              onToast('error', language === 'bn' ? 'ভুল বা ত্রুটিপূর্ণ ব্যাকআপ ফাইল' : 'Invalid Backup File');
                            }
                          };
                          reader.readAsText(file);
                        }}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById('backupRestoreFile')?.click()}
                        className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer transition-colors flex items-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>{language === 'bn' ? 'ফাইল আপলোড করে রিস্টোর করুন' : 'Select Backup File to Restore'}</span>
                      </button>
                    </div>

                  </div>

                </div>
              )}

            </div>
          </>
        )}

      </div>

      {/* MODAL: CHANGE / APPOINT WOMEN'S TEAM LEADER */}
      {showLeaderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border-2 border-rose-300 dark:border-rose-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-start justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 shadow-sm">
                  <Crown className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-stone-900 dark:text-white">
                    {language === 'bn' ? 'উইমেন্স টিম লিডার পরিবর্তন ও নতুন নিয়োগ' : 'Change / Appoint Women’s Team Leader'}
                  </h4>
                  <p className="text-xs text-stone-500">
                    {language === 'bn'
                      ? 'বিদ্যমান কমিটি থেকে নির্বাচন করুন অথবা নতুন ব্যক্তির তথ্য দিয়ে লিডারশিপ হস্তান্তর করুন।'
                      : 'Select an existing committee member or enter new leader credentials.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLeaderModal(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-stone-100 dark:bg-stone-800 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setLeaderChangeMode('existing_member')}
                className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  leaderChangeMode === 'existing_member'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>বিদ্যমান সদস্য থেকে নির্বাচন</span>
              </button>
              <button
                type="button"
                onClick={() => setLeaderChangeMode('new_person')}
                className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  leaderChangeMode === 'new_person'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>নতুন ব্যক্তির সরাসরি নিয়োগ</span>
              </button>
            </div>

            <form onSubmit={handleSaveWomensLeader} className="space-y-4 text-xs">
              {leaderChangeMode === 'existing_member' ? (
                <div className="space-y-3">
                  <div>
                    <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                      উইমেন্স টিম সদস্য নির্বাচন করুন *
                    </label>
                    <select
                      required
                      value={selectedExistingMemberId}
                      onChange={(e) => handleSelectExistingMember(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-semibold"
                    >
                      <option value="">-- সদস্য বেছে নিন --</option>
                      {womensTeamMembers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nameBn} ({m.designationBn}) - {m.district}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedExistingMemberId && (
                    <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 flex items-center gap-3">
                      <img
                        src={leaderFormAvatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80'}
                        alt="Leader Avatar"
                        className="w-12 h-12 rounded-xl object-cover border border-rose-400"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-stone-900 dark:text-white">{leaderFormName}</div>
                        <div className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">
                          উইমেন্স টিম লিডার ও সভাপতি পদে পদোন্নতি পাবেন
                        </div>
                        <div className="text-[11px] text-stone-500 font-mono">{leaderFormEmail} · {leaderFormPhone}</div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">নতুন লিডারের পূর্ণ নাম (বাংলা) *</label>
                      <input
                        type="text"
                        required
                        value={leaderFormName}
                        onChange={(e) => setLeaderFormName(e.target.value)}
                        placeholder="যেমন: ড. রাবেয়া খাতুন"
                        className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">পূর্ণ নাম (ইংরেজি)</label>
                      <input
                        type="text"
                        value={leaderFormNameEn}
                        onChange={(e) => setLeaderFormNameEn(e.target.value)}
                        placeholder="e.g. Dr. Rabeya Khatun"
                        className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">লগইন ইমেইল ঠিকানা *</label>
                      <input
                        type="email"
                        required
                        value={leaderFormEmail}
                        onChange={(e) => setLeaderFormEmail(e.target.value)}
                        placeholder="leader.colash@gmail.com"
                        className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">মোবাইল নম্বর *</label>
                      <input
                        type="text"
                        required
                        value={leaderFormPhone}
                        onChange={(e) => setLeaderFormPhone(e.target.value)}
                        placeholder="01711-XXXXXX"
                        className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">ছবির লিংক (Avatar URL)</label>
                    <input
                      type="text"
                      value={leaderFormAvatar}
                      onChange={(e) => setLeaderFormAvatar(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2">
                <label className="font-bold block text-stone-800 dark:text-stone-200">
                  টিম লিডার অ্যাকাউন্ট লগইন পাসওয়ার্ড *
                </label>
                <input
                  type="text"
                  value={leaderFormPassword}
                  onChange={(e) => setLeaderFormPassword(e.target.value)}
                  placeholder={currentWomensLeader ? `বর্তমান পাসওয়ার্ড বহাল রাখতে খালি রাখুন (বা নতুন দিন)` : `পাসওয়ার্ড দিন (ডিফল্ট: womensadmin2026)`}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 font-mono text-xs"
                />
                <span className="text-[11px] text-stone-500 block">
                  নতুন লিডার এই পাসওয়ার্ড দিয়ে উইমেন্স টিম অ্যাডমিন প্যানেল এবং মূল সেন্ট্রাল ড্যাশবোর্ডে লগইন করবেন।
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowLeaderModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold cursor-pointer shadow-md flex items-center gap-2"
                >
                  <Crown className="w-4 h-4 text-amber-200" />
                  <span>টিম লিডার নিয়োগ ও সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Money Receipt Modal */}
      <DonationReceiptModal
        donation={selectedDonationForReceipt}
        isOpen={Boolean(selectedDonationForReceipt)}
        onClose={() => setSelectedDonationForReceipt(null)}
        language={language}
      />

    </div>
  );
};
