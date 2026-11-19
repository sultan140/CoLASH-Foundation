/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProjectsSection } from './components/ProjectsSection';
import { TransparencySection } from './components/TransparencySection';
import { AboutSection } from './components/AboutSection';
import { EventsAndNews } from './components/EventsAndNews';
import { GallerySection } from './components/GallerySection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { DonationModal } from './components/DonationModal';
import { MemberPortalModal } from './components/MemberPortalModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { SearchModal } from './components/SearchModal';
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { GoogleMapsSection } from './components/GoogleMapsSection';
import { ScrollReveal } from './components/common/ScrollReveal';

import { WomensTeamSection } from './components/WomensTeam/WomensTeamSection';
import { WomensTeamMemberModal } from './components/WomensTeam/WomensTeamMemberModal';
import { WomensTeamAdminModal } from './components/WomensTeam/WomensTeamAdminModal';

import { PublicApplicationSection } from './components/PublicApplication/PublicApplicationSection';
import { CategoryPortalSection } from './components/CategoryPortal/CategoryPortalSection';
import { HomeHighlightsSection } from './components/HomeHighlightsSection';
import { AIAssistantWidget } from './components/AIAssistantWidget';
import { MemberProfilePage } from './components/MemberProfilePage';
import { MemberCelebrationsBanner } from './components/MemberCelebrationsBanner';
import { MemberVerificationModal } from './components/common/MemberVerificationModal';
import { QRScannerModal } from './components/common/QRScannerModal';
import { EmergencyNoticePage } from './components/EmergencyNoticePage';
import { ReportsArchiveModal } from './components/common/ReportsArchiveModal';
import { BackupPromptBanner } from './components/common/BackupPromptBanner';
import { LocalStorageBackupManager } from './utils/LocalStorageBackupManager';
import {
  StateKey,
  STORAGE_KEY_MAP,
  loadLocalState,
  hasLocalState,
  persistState,
  syncBulkStateToServer,
  fetchServerState,
  writeLocalStorageSafely,
  setFirestoreAdminSyncEnabled,
  setFirestoreSyncListener,
} from './utils/statePersistence';
import { useFirebase } from './contexts/FirebaseContext';
import {
  PUBLIC_SECTION_IDS,
  ADMIN_VAULT_SECTION_IDS,
  fetchPublicContentFromFirestore,
  fetchAdminVaultFromFirestore,
  subscribeAuthenticatedFirestore,
  syncBulkCollectionsDetailed,
  primeWomensPublicCache,
  submitDonationRecordToFirestore,
  submitPublicApplicationToFirestore,
  type BulkSyncResult,
} from './utils/firestoreSync';
import { exportAuditReport20252026 } from './utils/exportUtils';
import { Flower2, Sparkles, Send, Layers, FileText, Download, ShieldCheck, BookOpen, ExternalLink, ArrowRight } from 'lucide-react';

import {
  INITIAL_PROJECTS,
  TEAM_MEMBERS,
  EVENTS_DATA,
  FINANCIAL_RECORDS,
  INITIAL_NOTICES,
  INITIAL_VOLUNTEERS,
  INITIAL_DONATIONS,
  GENERAL_MEMBERS,
  INITIAL_COMMITTEE_TERMS,
  INITIAL_ADVISORY_COUNCIL,
  INITIAL_ADMIN_USERS,
  INITIAL_AUDIT_LOGS,
  INITIAL_MAP_CONFIG,
  INITIAL_AI_KNOWLEDGE,
  INITIAL_PUBLIC_APPLICATIONS,
  INITIAL_AI_CONVERSATION_LOGS,
  INITIAL_WEBSITE_CUSTOM_CONFIG
} from './data/mockData';

import {
  INITIAL_WOMENS_TEAM_CONFIG,
  INITIAL_WOMENS_TEAM_MEMBERS,
  INITIAL_WOMENS_ACTIVITIES,
  INITIAL_WOMENS_DOCUMENTS,
  INITIAL_WOMENS_NOTICES
} from './data/womensTeamData';

import {
  Project,
  Donation,
  Volunteer,
  NoticeItem,
  Language,
  ThemeMode,
  WomensTeamConfig,
  WomensTeamMember,
  WomensTeamActivity,
  WomensTeamDocument,
  WomensTeamNotice,
  AdminUser,
  AdminAuditLog,
  AIKnowledgeItem,
  MapConfig,
  PublicApplication,
  AIConversationLog,
  PortalCategoryKey,
  WebsiteCustomConfig,
  CommitteeTerm,
  AdvisoryCouncilMember,
  GeneralMember,
  PaymentChannel
} from './types';
import { INITIAL_PAYMENT_CHANNELS, PAYMENT_CHANNELS_STORAGE_KEY } from './data/paymentChannels';

export default function App() {
  const {
    firebaseUser,
    authReady,
    isFirebaseAdmin,
    setCloudStatus,
    markCloudSynced,
    refreshCloudInventory,
  } = useFirebase();
  const [language, setLanguage] = useState<Language>('bn');
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [activeSection, setActiveSection] = useState<string>('home');
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // Application Data States (Persisted in LocalStorage & synced to server DB)
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = loadLocalState<Project[]>('projects', INITIAL_PROJECTS);
    if (Array.isArray(saved)) {
      return saved;
    }
    return INITIAL_PROJECTS;
  });
  const [donations, setDonations] = useState<Donation[]>(() =>
    loadLocalState<Donation[]>('donations', INITIAL_DONATIONS)
  );
  const [volunteers, setVolunteers] = useState<Volunteer[]>(() =>
    loadLocalState<Volunteer[]>('volunteers', INITIAL_VOLUNTEERS)
  );
  const [notices, setNotices] = useState<NoticeItem[]>(() =>
    loadLocalState<NoticeItem[]>('notices', INITIAL_NOTICES)
  );
  const [financialRecords, setFinancialRecords] = useState(() =>
    loadLocalState('financialRecords', FINANCIAL_RECORDS)
  );

  // Dynamic bKash and Nagad Payment Channels (Persisted in LocalStorage & server)
  const [paymentChannels, setPaymentChannels] = useState<PaymentChannel[]>(() =>
    loadLocalState<PaymentChannel[]>('paymentChannels', INITIAL_PAYMENT_CHANNELS)
  );

  const handleUpdatePaymentChannels = (newChannels: PaymentChannel[]) => {
    setPaymentChannels(newChannels);
    persistState('paymentChannels', newChannels);
  };

  // Modals
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [selectedDonationProject, setSelectedDonationProject] = useState<Project | null>(null);
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const [portalDefaultTab, setPortalDefaultTab] = useState<'login' | 'register'>('login');
  const [portalDefaultViewTab, setPortalDefaultViewTab] = useState<'card' | 'edit'>('card');
  const [loggedInMember, setLoggedInMember] = useState<GeneralMember | null>(() => {
    try {
      const saved = localStorage.getItem('colash_active_member_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminInitialTab, setAdminInitialTab] = useState<string>('overview');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGlobalScannerOpen, setIsGlobalScannerOpen] = useState(false);
  const [selectedMemberProfile, setSelectedMemberProfile] = useState<any | null>(null);
  const [isReportsArchiveOpen, setIsReportsArchiveOpen] = useState(false);

  // Category Portal Selection
  const [activeCategory, setActiveCategory] = useState<PortalCategoryKey>('all');


  // Public Applications (Persisted in LocalStorage & synced with server)
  const [publicApplications, setPublicApplications] = useState<PublicApplication[]>(() =>
    loadLocalState<PublicApplication[]>('publicApplications', INITIAL_PUBLIC_APPLICATIONS)
  );

  // AI Conversation Logs (Persisted in LocalStorage & synced with server)
  const [aiConversationLogs, setAiConversationLogs] = useState<AIConversationLog[]>(() =>
    loadLocalState<AIConversationLog[]>('aiConversationLogs', INITIAL_AI_CONVERSATION_LOGS)
  );

  // Map & Address Configuration (Persisted in LocalStorage & server)
  const [mapConfig, setMapConfig] = useState<MapConfig>(() =>
    loadLocalState<MapConfig>('mapConfig', INITIAL_MAP_CONFIG)
  );

  // Custom Website Editor Configuration (Persisted in LocalStorage & server)
  const [websiteCustomConfig, setWebsiteCustomConfig] = useState<WebsiteCustomConfig>(() => {
    const parsed = loadLocalState<WebsiteCustomConfig>('websiteCustomConfig', INITIAL_WEBSITE_CUSTOM_CONFIG);
    if (!parsed.logoUrl) {
      return { ...parsed, logoUrl: INITIAL_WEBSITE_CUSTOM_CONFIG.logoUrl };
    }
    return parsed;
  });

  const appendAuditLog = (entry: AdminAuditLog) => {
    setAuditLogs(prev => {
      const next = [entry, ...prev].slice(0, 500);
      persistState('auditLogs', next);
      return next;
    });
  };

  const handlePublishWebsiteConfig = (newConfig: WebsiteCustomConfig) => {
    setWebsiteCustomConfig(newConfig);
    const { localOk, quotaExceeded } = persistState('websiteCustomConfig', newConfig);
    if (!localOk && quotaExceeded) {
      addToast(
        'info',
        language === 'bn' ? 'সার্ভারে সংরক্ষিত হয়েছে' : 'Saved to Server',
        language === 'bn'
          ? 'ব্রাউজার স্টোরেজ পূর্ণ হওয়ায় পরিবর্তনটি মূল সার্ভার ডাটাবেসে সংরক্ষিত হয়েছে।'
          : 'Browser storage was full; changes were safely persisted to the server.'
      );
    }
    appendAuditLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      adminId: currentAdmin?.id || 'adm-super-1',
      adminName: currentAdmin?.name || 'Super Admin',
      adminRole: currentAdmin?.role || 'super_admin',
      actionBn: `কাস্টম ওয়েবসাইট এডিটরে নতুন কনফিগারেশন সফলভাবে পাবলিশ করেছেন`,
      actionEn: 'Published new live website custom configuration via editor',
      category: 'website_editor'
    });
  };

  // Committee Terms State (Persisted in LocalStorage & server)
  const [committeeTerms, setCommitteeTerms] = useState<CommitteeTerm[]>(() =>
    loadLocalState<CommitteeTerm[]>('committeeTerms', INITIAL_COMMITTEE_TERMS)
  );

  const handleUpdateCommitteeTerms = (updatedTerms: CommitteeTerm[]) => {
    setCommitteeTerms(updatedTerms);
    persistState('committeeTerms', updatedTerms);
    appendAuditLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      adminId: currentAdmin?.id || 'adm-super-1',
      adminName: currentAdmin?.name || 'Super Admin',
      adminRole: currentAdmin?.role || 'super_admin',
      actionBn: 'কমিটি ও মেয়াদের তথ্য এবং সদস্য তালিকা হালনাগাদ করেছেন',
      actionEn: 'Updated committee terms and member rosters',
      category: 'committee'
    });
  };

  // Advisory Council State (Persisted in LocalStorage & server)
  const [advisors, setAdvisors] = useState<AdvisoryCouncilMember[]>(() =>
    loadLocalState<AdvisoryCouncilMember[]>('advisors', INITIAL_ADVISORY_COUNCIL)
  );

  const handleUpdateAdvisors = (updatedAdvisors: AdvisoryCouncilMember[]) => {
    setAdvisors(updatedAdvisors);
    persistState('advisors', updatedAdvisors);
    appendAuditLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      adminId: currentAdmin?.id || 'adm-super-1',
      adminName: currentAdmin?.name || 'Super Admin',
      adminRole: currentAdmin?.role || 'super_admin',
      actionBn: 'উপদেষ্টামণ্ডলীর তালিকা ও সদস্য বিবরণী হালনাগাদ করেছেন',
      actionEn: 'Updated advisory council member records and terms',
      category: 'advisors'
    });
  };

  // General Members Directory State (Persisted in LocalStorage)
  const [generalMembers, setGeneralMembers] = useState<GeneralMember[]>(() => {
    try {
      const saved = localStorage.getItem('colash_general_members');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Ensure birthday & history fields exist by merging with mock definitions if needed
          return parsed.map((p: GeneralMember) => {
            const original = GENERAL_MEMBERS.find(m => m.id === p.id);
            return {
              ...p,
              dateOfBirth: p.dateOfBirth || original?.dateOfBirth,
              birthMonth: p.birthMonth || original?.birthMonth,
              birthDay: p.birthDay || original?.birthDay,
            };
          });
        }
      }
      return GENERAL_MEMBERS;
    } catch {
      return GENERAL_MEMBERS;
    }
  });

  // Member Celebrations: Identify members whose birthday falls in the current month (November / month 11)
  const currentMonthBirthdayMembers = useMemo(() => {
    const currentMonth = new Date().getMonth() + 1; // 1-12
    return generalMembers.filter(member => {
      if (member.birthMonth) {
        return member.birthMonth === currentMonth;
      }
      if (member.dateOfBirth) {
        const parts = member.dateOfBirth.split('-');
        if (parts.length >= 2) {
          return parseInt(parts[1], 10) === currentMonth;
        }
      }
      return false;
    });
  }, [generalMembers]);

  const handleUpdateGeneralMembers = (updatedMembers: GeneralMember[]) => {
    setGeneralMembers(updatedMembers);
    persistState('generalMembers', updatedMembers);
    appendAuditLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      adminId: currentAdmin?.id || 'adm-super-1',
      adminName: currentAdmin?.name || 'Super Admin',
      adminRole: currentAdmin?.role || 'super_admin',
      actionBn: 'সাধারণ সদস্য ডিরেক্টরি ও তথ্যাবলি সফলভাবে আপডেট করেছেন',
      actionEn: 'Updated general members registry and unique IDs',
      category: 'member'
    });
  };

  // AI Content Management Knowledge Base (Persisted in LocalStorage & server)
  const [aiKnowledgeBase, setAiKnowledgeBase] = useState<AIKnowledgeItem[]>(() =>
    loadLocalState<AIKnowledgeItem[]>('aiKnowledgeBase', INITIAL_AI_KNOWLEDGE)
  );

  // Women's Team Autonomous Wing States (Persisted in LocalStorage & server)
  const [womensTeamConfig, setWomensTeamConfig] = useState<WomensTeamConfig>(() =>
    loadLocalState<WomensTeamConfig>('womensTeamConfig', INITIAL_WOMENS_TEAM_CONFIG)
  );

  const [womensTeamMembers, setWomensTeamMembers] = useState<WomensTeamMember[]>(() =>
    loadLocalState<WomensTeamMember[]>('womensTeamMembers', INITIAL_WOMENS_TEAM_MEMBERS)
  );

  const [womensTeamActivities, setWomensTeamActivities] = useState<WomensTeamActivity[]>(() =>
    loadLocalState<WomensTeamActivity[]>('womensTeamActivities', INITIAL_WOMENS_ACTIVITIES)
  );

  const [womensTeamDocuments, setWomensTeamDocuments] = useState<WomensTeamDocument[]>(() =>
    loadLocalState<WomensTeamDocument[]>('womensTeamDocuments', INITIAL_WOMENS_DOCUMENTS)
  );

  const [womensTeamNotices, setWomensTeamNotices] = useState<WomensTeamNotice[]>(() =>
    loadLocalState<WomensTeamNotice[]>('womensTeamNotices', INITIAL_WOMENS_NOTICES)
  );

  // Women's Team Modals & Member Session
  const [isWomensMemberModalOpen, setIsWomensMemberModalOpen] = useState(false);
  const [womensMemberModalInitialTab, setWomensMemberModalInitialTab] = useState<'login' | 'register'>('login');
  const [isWomensAdminModalOpen, setIsWomensAdminModalOpen] = useState(false);

  // Active Women's Team Member Session (for Lock / Unlock of details)
  const [currentWomensUser, setCurrentWomensUser] = useState<WomensTeamMember | null>(() => {
    try {
      const saved = localStorage.getItem('colash_womens_team_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleWomensLogin = (user: WomensTeamMember) => {
    setCurrentWomensUser(user);
    writeLocalStorageSafely('colash_womens_team_session', user);
    // Launch full dedicated Women's Team Dashboard immediately
    setIsWomensMemberModalOpen(true);
  };

  const handleRegisterWomensMember = (newMember: WomensTeamMember) => {
    setWomensTeamMembers(prev => {
      const updated = [newMember, ...prev];
      persistState('womensTeamMembers', updated);
      return updated;
    });
    setCurrentWomensUser(newMember);
    writeLocalStorageSafely('colash_womens_team_session', newMember);
    addToast(
      'success',
      language === 'bn' ? 'সদস্য আইডি তৈরি সফল হয়েছে!' : 'Member ID Created!',
      language === 'bn' ? `আপনার অফিসিয়াল মেম্বার আইডি: ${newMember.membershipId}` : `Your ID: ${newMember.membershipId}`
    );
  };

  const handleUpdateWomensMemberSelf = (updatedMember: WomensTeamMember) => {
    setWomensTeamMembers(prev => {
      const updated = prev.map(m => m.id === updatedMember.id ? updatedMember : m);
      persistState('womensTeamMembers', updated);
      return updated;
    });
    setCurrentWomensUser(updatedMember);
    writeLocalStorageSafely('colash_womens_team_session', updatedMember);
    addToast(
      'success',
      language === 'bn' ? 'প্রোফাইল তথ্য ও ছবি সফলভাবে হালনাগাদ করা হয়েছে' : 'Profile Updated'
    );
  };

  const handleWomensLogout = () => {
    setCurrentWomensUser(null);
    try {
      localStorage.removeItem('colash_womens_team_session');
    } catch (e) {
      console.error(e);
    }
    addToast(
      'info',
      language === 'bn' ? 'লগআউট সম্পন্ন হয়েছে' : 'Logged Out',
      language === 'bn' ? 'উইমেন্স টিম সেকশন পুনরায় সুরক্ষিতভাবে লক করা হয়েছে।' : 'Women’s Team section locked securely.'
    );
  };

  const handleUpdateWomensConfig = (newConfig: WomensTeamConfig) => {
    setWomensTeamConfig(newConfig);
    persistState('womensTeamConfig', newConfig);
  };

  const handleUpdateWomensMembers = (newMembers: WomensTeamMember[]) => {
    setWomensTeamMembers(newMembers);
    persistState('womensTeamMembers', newMembers);
  };

  const handleUpdateWomensActivities = (newActivities: WomensTeamActivity[]) => {
    setWomensTeamActivities(newActivities);
    persistState('womensTeamActivities', newActivities);
  };

  const handleUpdateWomensDocuments = (newDocs: WomensTeamDocument[]) => {
    setWomensTeamDocuments(newDocs);
    persistState('womensTeamDocuments', newDocs);
  };

  const handleUpdateWomensNotices = (newNotices: WomensTeamNotice[]) => {
    setWomensTeamNotices(newNotices);
    persistState('womensTeamNotices', newNotices);
  };

  const sanitizeAdminName = (text: string) =>
    text
      .replace(/ইঞ্জি\.\s*আশরাফুল ইসলাম/g, 'Md. Ashraful Islam Sultan')
      .replace(/Engr\.\s*Ashraful Islam/g, 'Md. Ashraful Islam Sultan');

  const normalizeAdminUsers = (list: AdminUser[]): AdminUser[] => {
    const cleaned = list.map((u) =>
      u.id === 'adm-super-1' || u.id === 'adm-super-2'
        ? {
            ...u,
            name: sanitizeAdminName(u.name),
            roleTitleBn: u.roleTitleBn?.includes('প্রধান অ্যাডমিন') ? 'প্রতিষ্ঠাতা, সভাপতি ও সুপার অ্যাডমিন' : u.roleTitleBn,
            roleTitleEn: u.roleTitleEn === 'Super Admin & Founder' ? 'Founder, President & Super Admin' : u.roleTitleEn,
          }
        : u
    );
    const hasConfiguredPrimary = cleaned.some(
      (u) => u.email.trim().toLowerCase() === 'ashrafulis2007@gmail.com'
    );
    if (!hasConfiguredPrimary) {
      const primaryAdmin = INITIAL_ADMIN_USERS.find(
        (u) => u.email.trim().toLowerCase() === 'ashrafulis2007@gmail.com'
      );
      if (primaryAdmin) {
        return [primaryAdmin, ...cleaned];
      }
    }
    return cleaned;
  };

  // Admin & Permission Management States (Persisted in LocalStorage & server)
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => {
    const parsed = loadLocalState<AdminUser[]>('adminUsers', INITIAL_ADMIN_USERS);
    if (Array.isArray(parsed)) {
      return normalizeAdminUsers(parsed);
    }
    return INITIAL_ADMIN_USERS;
  });

  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('colash_current_admin');
      if (saved) {
        const parsed: AdminUser = JSON.parse(saved);
        return parsed.id === 'adm-super-1'
          ? { ...parsed, name: sanitizeAdminName(parsed.name) }
          : parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>(() => {
    const parsed = loadLocalState<AdminAuditLog[]>('auditLogs', INITIAL_AUDIT_LOGS);
    if (Array.isArray(parsed)) {
      return parsed.map((l) => ({
        ...l,
        adminName: sanitizeAdminName(l.adminName),
      }));
    }
    return INITIAL_AUDIT_LOGS;
  });

  const handleAdminLogin = (user: AdminUser) => {
    setCurrentAdmin(user);
    writeLocalStorageSafely('colash_current_admin', user);
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setAdminUsers(prev => {
      const updatedList = prev.map(u => u.id === user.id ? { ...u, lastLogin: nowStr } : u);
      persistState('adminUsers', updatedList);
      return updatedList;
    });

    appendAuditLog({
      id: `log-${Date.now()}`,
      timestamp: nowStr,
      adminId: user.id,
      adminName: `${user.name} (${user.roleTitleBn})`,
      adminRole: user.role,
      actionBn: 'সিস্টেমে লগইন করেছেন এবং অ্যাডমিন ড্যাশবোর্ড অ্যাক্সেস করেছেন',
      actionEn: 'Admin logged in and accessed dashboard',
      category: 'auth'
    });
  };

  const handleAdminLogout = () => {
    setCurrentAdmin(null);
    try {
      localStorage.removeItem('colash_current_admin');
    } catch (e) {
      console.error(e);
    }
    addToast(
      'info',
      language === 'bn' ? 'অ্যাডমিন লগআউট সম্পন্ন' : 'Admin Logged Out',
      language === 'bn' ? 'অ্যাডমিন সেশন সমাপ্ত হয়েছে।' : 'Admin session ended.'
    );
  };

  const handleCreateAdmin = (newAdmin: AdminUser) => {
    setAdminUsers(prev => {
      const updated = [newAdmin, ...prev];
      persistState('adminUsers', updated);
      return updated;
    });

    appendAuditLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      adminId: currentAdmin?.id || 'adm-super',
      adminName: currentAdmin ? `${currentAdmin.name} (${currentAdmin.roleTitleBn})` : 'Super Admin',
      adminRole: currentAdmin?.role || 'super_admin',
      actionBn: `নতুন অ্যাডমিন ${newAdmin.name} (${newAdmin.roleTitleBn})-কে পারমিশনসহ নিয়োগ দিয়েছেন`,
      actionEn: `Created new admin ${newAdmin.name} (${newAdmin.roleTitleEn})`,
      category: 'admin_manage'
    });
  };

  const handleUpdateAdmin = (updatedAdmin: AdminUser) => {
    setAdminUsers(prev => {
      const updated = prev.map(u => u.id === updatedAdmin.id ? updatedAdmin : u);
      persistState('adminUsers', updated);
      return updated;
    });
    if (currentAdmin?.id === updatedAdmin.id) {
      setCurrentAdmin(updatedAdmin);
      writeLocalStorageSafely('colash_current_admin', updatedAdmin);
    }

    appendAuditLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      adminId: currentAdmin?.id || 'adm-super',
      adminName: currentAdmin ? `${currentAdmin.name} (${currentAdmin.roleTitleBn})` : 'Super Admin',
      adminRole: currentAdmin?.role || 'super_admin',
      actionBn: `অ্যাডমিন ${updatedAdmin.name}-এর পারমিশন ও তথ্য হালনাগাদ করেছেন`,
      actionEn: `Updated details and permissions for ${updatedAdmin.name}`,
      category: 'admin_manage'
    });
  };

  const handleDeleteAdmin = (id: string) => {
    const target = adminUsers.find(u => u.id === id);
    setAdminUsers(prev => {
      const updated = prev.filter(u => u.id !== id);
      persistState('adminUsers', updated);
      return updated;
    });

    appendAuditLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      adminId: currentAdmin?.id || 'adm-super',
      adminName: currentAdmin ? `${currentAdmin.name} (${currentAdmin.roleTitleBn})` : 'Super Admin',
      adminRole: currentAdmin?.role || 'super_admin',
      actionBn: `অ্যাডমিন ${target?.name || id}-এর অ্যাক্সেস বাতিল করেছেন`,
      actionEn: `Revoked access for admin ${target?.name || id}`,
      category: 'admin_manage'
    });

    addToast('info', language === 'bn' ? 'অ্যাডমিন অ্যাক্সেস বাতিল' : 'Admin Access Revoked');
  };

  const handleToggleAdminStatus = (id: string) => {
    const target = adminUsers.find(u => u.id === id);
    if (!target) return;
    const newStatus = !target.isActive;
    setAdminUsers(prev => {
      const updated = prev.map(u => u.id === id ? { ...u, isActive: newStatus } : u);
      persistState('adminUsers', updated);
      return updated;
    });

    appendAuditLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      adminId: currentAdmin?.id || 'adm-super',
      adminName: currentAdmin ? `${currentAdmin.name} (${currentAdmin.roleTitleBn})` : 'Super Admin',
      adminRole: currentAdmin?.role || 'super_admin',
      actionBn: `অ্যাডমিন ${target.name}-কে ${newStatus ? 'সক্রিয়' : 'সাময়িকভাবে নিষ্ক্রিয়'} করেছেন`,
      actionEn: `${newStatus ? 'Activated' : 'Suspended'} admin ${target.name}`,
      category: 'admin_manage'
    });

    addToast(
      'info',
      newStatus
        ? (language === 'bn' ? 'অ্যাকাউন্ট সক্রিয় করা হয়েছে' : 'Account Activated')
        : (language === 'bn' ? 'অ্যাকাউন্ট সাময়িকভাবে স্থগিত করা হয়েছে' : 'Account Suspended')
    );
  };

  const handleChangeAdminPassword = (id: string, newPass: string) => {
    const target = adminUsers.find(u => u.id === id);
    setAdminUsers(prev => {
      const updated = prev.map(u => u.id === id ? { ...u, password: newPass } : u);
      persistState('adminUsers', updated);
      return updated;
    });
    if (currentAdmin?.id === id) {
      const updatedCurrent = { ...currentAdmin, password: newPass };
      setCurrentAdmin(updatedCurrent);
      writeLocalStorageSafely('colash_current_admin', updatedCurrent);
    }

    appendAuditLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      adminId: currentAdmin?.id || id,
      adminName: currentAdmin?.name || target?.name || 'Admin',
      adminRole: currentAdmin?.role || 'custom_admin',
      actionBn: `অ্যাকাউন্টের পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে`,
      actionEn: 'Password updated successfully',
      category: 'security'
    });
  };

  const handleUpdateMapConfig = (newConfig: MapConfig) => {
    setMapConfig(newConfig);
    persistState('mapConfig', newConfig);
    appendAuditLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      adminId: currentAdmin?.id || 'adm-super-1',
      adminName: currentAdmin?.name || 'Super Admin',
      adminRole: currentAdmin?.role || 'super_admin',
      actionBn: `অফিস ঠিকানা ও গুগল ম্যাপ কনফিগারেশন আপডেট করা হয়েছে`,
      actionEn: 'Office address and Google Maps configuration updated',
      category: 'settings'
    });
  };

  const handleUpdateAIKnowledgeBase = (newKB: AIKnowledgeItem[]) => {
    setAiKnowledgeBase(newKB);
    persistState('aiKnowledgeBase', newKB);
    appendAuditLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      adminId: currentAdmin?.id || 'adm-super-1',
      adminName: currentAdmin?.name || 'Super Admin',
      adminRole: currentAdmin?.role || 'super_admin',
      actionBn: `AI Content Management নলেজ বেস আপডেট করা হয়েছে`,
      actionEn: 'AI Content Management knowledge base updated',
      category: 'ai_content'
    });
  };

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [qrVerifiedMember, setQrVerifiedMember] = useState<GeneralMember | null>(null);
  const [qrVerifiedFromScan, setQrVerifiedFromScan] = useState<boolean>(false);

  const addToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev, { id, type, title, description }]);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Periodic LocalStorage JSON Backup Safeguard State & Scheduler
  const [isBackupPromptOpen, setIsBackupPromptOpen] = useState(false);
  const [lastBackupAt, setLastBackupAt] = useState<number | null>(() =>
    LocalStorageBackupManager.getLastBackupTimestamp()
  );

  const backupLiveOverrides = useMemo(
    () => ({
      members: generalMembers,
      projects,
      auditLogs,
      aiLogs: aiConversationLogs,
      donations,
      volunteers,
      committeeTerms,
      advisors,
      publicApplications,
      womensTeamMembers,
    }),
    [
      generalMembers,
      projects,
      auditLogs,
      aiConversationLogs,
      donations,
      volunteers,
      committeeTerms,
      advisors,
      publicApplications,
      womensTeamMembers,
    ]
  );

  const backupSnapshotPreview = useMemo(
    () => LocalStorageBackupManager.collectSnapshot(backupLiveOverrides),
    [backupLiveOverrides]
  );

  useEffect(() => {
    return LocalStorageBackupManager.startPeriodicScheduler(() => {
      setLastBackupAt(LocalStorageBackupManager.getLastBackupTimestamp());
      setIsBackupPromptOpen(true);
    });
  }, []);

  // Sync dark mode class on <html>
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Apply Website Customizer Colors & Typography dynamically to CSS Variables
  useEffect(() => {
    const root = document.documentElement;
    if (websiteCustomConfig.primaryColor) {
      root.style.setProperty('--brand-teal', websiteCustomConfig.primaryColor);
    }
    if (websiteCustomConfig.secondaryColor) {
      root.style.setProperty('--brand-navy', websiteCustomConfig.secondaryColor);
    }
    if (websiteCustomConfig.accentColor) {
      root.style.setProperty('--brand-lime', websiteCustomConfig.accentColor);
    }
    if (websiteCustomConfig.bgTone) {
      root.style.setProperty('--brand-ivory', websiteCustomConfig.bgTone);
    }
    if (websiteCustomConfig.fontFamily) {
      document.body.style.fontFamily = `'${websiteCustomConfig.fontFamily}', 'Plus Jakarta Sans', 'Hind Siliguri', system-ui, sans-serif`;
    }
  }, [
    websiteCustomConfig.primaryColor,
    websiteCustomConfig.secondaryColor,
    websiteCustomConfig.accentColor,
    websiteCustomConfig.bgTone,
    websiteCustomConfig.fontFamily,
  ]);

  // Helper to apply any collection update (used by mount hydration & live Firestore onSnapshot)
  const applyHydratedKey = (key: StateKey, rawValue: unknown) => {
    if (rawValue === undefined || rawValue === null) return;
    switch (key) {
      case 'projects':
        if (Array.isArray(rawValue)) {
          setProjects(rawValue as Project[]);
          writeLocalStorageSafely(STORAGE_KEY_MAP.projects, rawValue);
        }
        break;
      case 'donations':
        if (Array.isArray(rawValue)) {
          setDonations(rawValue as Donation[]);
          writeLocalStorageSafely(STORAGE_KEY_MAP.donations, rawValue);
        }
        break;
      case 'volunteers':
        if (Array.isArray(rawValue)) {
          setVolunteers(rawValue as Volunteer[]);
          writeLocalStorageSafely(STORAGE_KEY_MAP.volunteers, rawValue);
        }
        break;
      case 'notices':
        if (Array.isArray(rawValue)) {
          setNotices(rawValue as NoticeItem[]);
          writeLocalStorageSafely(STORAGE_KEY_MAP.notices, rawValue);
        }
        break;
      case 'financialRecords':
        if (Array.isArray(rawValue)) {
          setFinancialRecords(rawValue as typeof FINANCIAL_RECORDS);
          writeLocalStorageSafely(STORAGE_KEY_MAP.financialRecords, rawValue);
        }
        break;
      case 'paymentChannels':
        if (Array.isArray(rawValue)) {
          setPaymentChannels(rawValue as PaymentChannel[]);
          writeLocalStorageSafely(STORAGE_KEY_MAP.paymentChannels, rawValue);
        }
        break;
      case 'publicApplications':
        if (Array.isArray(rawValue)) {
          setPublicApplications(rawValue as PublicApplication[]);
          writeLocalStorageSafely(STORAGE_KEY_MAP.publicApplications, rawValue);
        }
        break;
      case 'aiConversationLogs':
        if (Array.isArray(rawValue)) {
          setAiConversationLogs(rawValue as AIConversationLog[]);
          writeLocalStorageSafely(STORAGE_KEY_MAP.aiConversationLogs, rawValue);
        }
        break;
      case 'mapConfig':
        if (typeof rawValue === 'object') {
          setMapConfig(rawValue as MapConfig);
          writeLocalStorageSafely(STORAGE_KEY_MAP.mapConfig, rawValue);
        }
        break;
      case 'websiteCustomConfig':
        if (typeof rawValue === 'object') {
          const merged = {
            ...INITIAL_WEBSITE_CUSTOM_CONFIG,
            ...(rawValue as Partial<WebsiteCustomConfig>),
            logoUrl: (rawValue as Partial<WebsiteCustomConfig>)?.logoUrl || INITIAL_WEBSITE_CUSTOM_CONFIG.logoUrl,
          };
          setWebsiteCustomConfig(merged);
          writeLocalStorageSafely(STORAGE_KEY_MAP.websiteCustomConfig, merged);
        }
        break;
      case 'committeeTerms':
        if (Array.isArray(rawValue)) {
          setCommitteeTerms(rawValue as CommitteeTerm[]);
          writeLocalStorageSafely(STORAGE_KEY_MAP.committeeTerms, rawValue);
        }
        break;
      case 'advisors':
        if (Array.isArray(rawValue)) {
          setAdvisors(rawValue as AdvisoryCouncilMember[]);
          writeLocalStorageSafely(STORAGE_KEY_MAP.advisors, rawValue);
        }
        break;
      case 'generalMembers':
        if (Array.isArray(rawValue)) {
          const normalized = (rawValue as GeneralMember[]).map((p) => {
            const original = GENERAL_MEMBERS.find(m => m.id === p.id);
            return {
              ...p,
              dateOfBirth: p.dateOfBirth || original?.dateOfBirth,
              birthMonth: p.birthMonth || original?.birthMonth,
              birthDay: p.birthDay || original?.birthDay,
            };
          });
          setGeneralMembers(normalized);
          writeLocalStorageSafely(STORAGE_KEY_MAP.generalMembers, normalized);
        }
        break;
      case 'aiKnowledgeBase':
        if (Array.isArray(rawValue)) {
          setAiKnowledgeBase(rawValue as AIKnowledgeItem[]);
          writeLocalStorageSafely(STORAGE_KEY_MAP.aiKnowledgeBase, rawValue);
        }
        break;
      case 'womensTeamConfig':
        if (typeof rawValue === 'object') {
          setWomensTeamConfig(rawValue as WomensTeamConfig);
          writeLocalStorageSafely(STORAGE_KEY_MAP.womensTeamConfig, rawValue);
        }
        break;
      case 'womensTeamMembers':
        if (Array.isArray(rawValue)) {
          setWomensTeamMembers(rawValue as WomensTeamMember[]);
          writeLocalStorageSafely(STORAGE_KEY_MAP.womensTeamMembers, rawValue);
        }
        break;
      case 'womensTeamActivities':
        if (Array.isArray(rawValue)) {
          setWomensTeamActivities(rawValue as WomensTeamActivity[]);
          writeLocalStorageSafely(STORAGE_KEY_MAP.womensTeamActivities, rawValue);
        }
        break;
      case 'womensTeamDocuments':
        if (Array.isArray(rawValue)) {
          setWomensTeamDocuments(rawValue as WomensTeamDocument[]);
          writeLocalStorageSafely(STORAGE_KEY_MAP.womensTeamDocuments, rawValue);
        }
        break;
      case 'womensTeamNotices':
        if (Array.isArray(rawValue)) {
          setWomensTeamNotices(rawValue as WomensTeamNotice[]);
          writeLocalStorageSafely(STORAGE_KEY_MAP.womensTeamNotices, rawValue);
        }
        break;
      case 'adminUsers':
        if (Array.isArray(rawValue)) {
          const normalizedAdmins = normalizeAdminUsers(rawValue as AdminUser[]);
          setAdminUsers(normalizedAdmins);
          writeLocalStorageSafely(STORAGE_KEY_MAP.adminUsers, normalizedAdmins);
        }
        break;
      case 'auditLogs':
        if (Array.isArray(rawValue)) {
          const normalizedLogs = (rawValue as AdminAuditLog[]).map((l) => ({
            ...l,
            adminName: sanitizeAdminName(l.adminName),
          }));
          setAuditLogs(normalizedLogs);
          writeLocalStorageSafely(STORAGE_KEY_MAP.auditLogs, normalizedLogs);
        }
        break;
    }
  };

  // Keep Firestore sync permission flag & womensPublic cache updated
  useEffect(() => {
    setFirestoreAdminSyncEnabled(authReady && isFirebaseAdmin);
    setFirestoreSyncListener((status) => {
      if (status === 'synced') markCloudSynced();
      else setCloudStatus(status);
    });
    return () => setFirestoreSyncListener(null);
  }, [authReady, isFirebaseAdmin, markCloudSynced, setCloudStatus]);

  useEffect(() => {
    primeWomensPublicCache({
      womensTeamConfig,
      womensTeamActivities,
      womensTeamNotices,
    });
  }, [womensTeamConfig, womensTeamActivities, womensTeamNotices]);

  const buildFullCollectionsSnapshot = (): Partial<Record<StateKey, unknown>> => ({
    projects,
    donations,
    volunteers,
    notices,
    financialRecords,
    paymentChannels,
    publicApplications,
    aiConversationLogs,
    mapConfig,
    websiteCustomConfig,
    committeeTerms,
    advisors,
    generalMembers,
    aiKnowledgeBase,
    womensTeamConfig,
    womensTeamMembers,
    womensTeamActivities,
    womensTeamDocuments,
    womensTeamNotices,
    adminUsers,
    auditLogs,
  });

  const handleSyncAllToCloud = async (): Promise<BulkSyncResult> => {
    setCloudStatus('syncing');
    try {
      const result = await syncBulkCollectionsDetailed(
        buildFullCollectionsSnapshot(),
        firebaseUser
      );
      if (result.ok) {
        markCloudSynced();
      } else {
        setCloudStatus('error');
      }
      await refreshCloudInventory(isFirebaseAdmin);
      return result;
    } catch (err) {
      setCloudStatus('error');
      console.warn('Manual cloud sync error:', err);
      return {
        ok: false,
        writtenCount: 0,
        failedKeys: [],
        errorMessage: err instanceof Error ? err.message : String(err),
      };
    }
  };

  // Hydrate all persisted application data from Firebase Firestore & optional backend API on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [firestoreRes, serverCollections] = await Promise.all([
        fetchPublicContentFromFirestore().catch(() => ({
          publicState: {},
          foundPublicCount: 0,
          presentPublicIds: [],
          missingPublicIds: [...PUBLIC_SECTION_IDS],
        })),
        fetchServerState().catch(() => null),
      ]);
      if (cancelled) return;

      // 1. First apply optional Express server state if present
      if (serverCollections) {
        const toSeed: Partial<Record<StateKey, unknown>> = {};
        const applyOrSeed = <T,>(
          key: StateKey,
          localCurrent: T,
          transform?: (val: any) => T
        ) => {
          const entry = serverCollections[key];
          if (entry && entry.value !== undefined && entry.value !== null) {
            const val = transform ? transform(entry.value) : (entry.value as T);
            applyHydratedKey(key, val);
          } else if (hasLocalState(key)) {
            toSeed[key] = localCurrent;
          }
        };

        applyOrSeed('projects', projects);
        applyOrSeed('donations', donations);
        applyOrSeed('volunteers', volunteers);
        applyOrSeed('notices', notices);
        applyOrSeed('financialRecords', financialRecords);
        applyOrSeed('paymentChannels', paymentChannels);
        applyOrSeed('publicApplications', publicApplications);
        applyOrSeed('aiConversationLogs', aiConversationLogs);
        applyOrSeed('mapConfig', mapConfig);
        applyOrSeed('websiteCustomConfig', websiteCustomConfig);
        applyOrSeed('committeeTerms', committeeTerms);
        applyOrSeed('advisors', advisors);
        applyOrSeed('generalMembers', generalMembers);
        applyOrSeed('aiKnowledgeBase', aiKnowledgeBase);
        applyOrSeed('womensTeamConfig', womensTeamConfig);
        applyOrSeed('womensTeamMembers', womensTeamMembers);
        applyOrSeed('womensTeamActivities', womensTeamActivities);
        applyOrSeed('womensTeamDocuments', womensTeamDocuments);
        applyOrSeed('womensTeamNotices', womensTeamNotices);
        applyOrSeed('adminUsers', adminUsers);
        applyOrSeed('auditLogs', auditLogs);

        if (Object.keys(toSeed).length > 0) {
          void syncBulkStateToServer(toSeed);
        }
      }

      // 2. Overlay authoritative Firebase Firestore public content (works everywhere, including Cloudflare Pages)
      if (firestoreRes.foundPublicCount > 0) {
        for (const [k, v] of Object.entries(firestoreRes.publicState)) {
          applyHydratedKey(k as StateKey, v);
        }
      }
      void refreshCloudInventory(false);
    })();

    return () => {
      cancelled = true;
    };
    // Run once on initial mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Attach authenticated Firestore listeners & seed all missing Firestore sections on Admin connection
  useEffect(() => {
    if (!authReady || !firebaseUser) return;

    let cancelled = false;
    (async () => {
      if (isFirebaseAdmin) {
        // Auto-match Firebase Google Admin into AdminDashboard session if not already logged in
        const userEmail = firebaseUser.email?.toLowerCase();
        if (userEmail && !currentAdmin) {
          const matchedAdmin = adminUsers.find(
            (u) => u.email.toLowerCase() === userEmail && u.isActive
          );
          if (matchedAdmin) {
            setCurrentAdmin(matchedAdmin);
            writeLocalStorageSafely('colash_current_admin', matchedAdmin);
          }
        }

        // Load existing cloud state first, then seed EVERY missing public_content & admin_vault doc
        try {
          const [pubRes, vaultRes] = await Promise.all([
            fetchPublicContentFromFirestore(),
            fetchAdminVaultFromFirestore(),
          ]);
          if (cancelled) return;

          if (pubRes.foundPublicCount > 0) {
            for (const [k, v] of Object.entries(pubRes.publicState)) {
              applyHydratedKey(k as StateKey, v);
            }
          }
          if (vaultRes.foundVaultCount > 0) {
            for (const [k, v] of Object.entries(vaultRes.adminState)) {
              applyHydratedKey(k as StateKey, v);
            }
          }

          const needsSeed =
            pubRes.foundPublicCount < PUBLIC_SECTION_IDS.length ||
            vaultRes.foundVaultCount < ADMIN_VAULT_SECTION_IDS.length;

          if (needsSeed) {
            const fullSnapshot = buildFullCollectionsSnapshot();
            const missingSnapshot: Partial<Record<StateKey, unknown>> = {};

            for (const pubId of pubRes.missingPublicIds) {
              if (pubId === 'publicMembers') {
                missingSnapshot.generalMembers =
                  vaultRes.adminState.generalMembers ?? fullSnapshot.generalMembers;
              } else if (pubId === 'publicDonations') {
                missingSnapshot.donations =
                  vaultRes.adminState.donations ?? fullSnapshot.donations;
              } else if (pubId === 'womensPublic') {
                missingSnapshot.womensTeamConfig = fullSnapshot.womensTeamConfig;
                missingSnapshot.womensTeamActivities = fullSnapshot.womensTeamActivities;
                missingSnapshot.womensTeamNotices = fullSnapshot.womensTeamNotices;
              } else {
                missingSnapshot[pubId as StateKey] = fullSnapshot[pubId as StateKey];
              }
            }

            for (const vaultId of vaultRes.missingVaultIds) {
              if (vaultId === 'generalMembersPrivate') {
                missingSnapshot.generalMembers =
                  vaultRes.adminState.generalMembers ?? fullSnapshot.generalMembers;
              } else if (vaultId === 'donationsFull') {
                missingSnapshot.donations =
                  vaultRes.adminState.donations ?? fullSnapshot.donations;
              } else if (vaultId === 'volunteersFull') {
                missingSnapshot.volunteers = fullSnapshot.volunteers;
              } else if (vaultId === 'publicApplicationsFull') {
                missingSnapshot.publicApplications = fullSnapshot.publicApplications;
              } else {
                missingSnapshot[vaultId as StateKey] = fullSnapshot[vaultId as StateKey];
              }
            }

            if (Object.keys(missingSnapshot).length > 0) {
              setCloudStatus('syncing');
              const seedResult = await syncBulkCollectionsDetailed(
                missingSnapshot,
                firebaseUser
              );
              if (!cancelled) {
                if (seedResult.ok) markCloudSynced();
                else setCloudStatus('error');
              }
            } else {
              markCloudSynced();
            }
          } else {
            markCloudSynced();
          }

          if (!cancelled) {
            await refreshCloudInventory(true);
          }
        } catch (err) {
          console.warn('Initial admin Firestore sync warning:', err);
          setCloudStatus('error');
        }
      }
    })();

    const unsubscribe = subscribeAuthenticatedFirestore(
      firebaseUser,
      isFirebaseAdmin,
      (key, value) => {
        applyHydratedKey(key, value);
        markCloudSynced();
      }
    );

    return () => {
      cancelled = true;
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, firebaseUser, isFirebaseAdmin]);

  // Persistent Authentication Guard & Rehydration Hook
  useEffect(() => {
    try {
      // 1. Rehydrate & Guard Admin Session
      const savedAdminStr = localStorage.getItem('colash_current_admin');
      if (savedAdminStr) {
        const savedAdmin: AdminUser = JSON.parse(savedAdminStr);
        const matchedAdmin = adminUsers.find(u => u.id === savedAdmin.id);
        if (matchedAdmin && matchedAdmin.isActive) {
          setCurrentAdmin(matchedAdmin);
        } else if (!matchedAdmin) {
          setCurrentAdmin(savedAdmin);
        } else {
          // Account was deactivated
          setCurrentAdmin(null);
          localStorage.removeItem('colash_current_admin');
        }
      }

      // 2. Rehydrate & Guard Women's Team Member Session
      const savedWomensStr = localStorage.getItem('colash_womens_team_session');
      if (savedWomensStr) {
        const savedWomensUser: WomensTeamMember = JSON.parse(savedWomensStr);
        const matchedWomens = womensTeamMembers.find(m => m.id === savedWomensUser.id);
        if (matchedWomens) {
          setCurrentWomensUser(matchedWomens);
        } else {
          setCurrentWomensUser(savedWomensUser);
        }
      }

      // 3. Rehydrate General Member Session
      const savedMemberStr = localStorage.getItem('colash_active_member_session');
      if (savedMemberStr) {
        const savedMember: GeneralMember = JSON.parse(savedMemberStr);
        const matchedMember = generalMembers.find(
          m => m.id === savedMember.id || m.membershipId === savedMember.membershipId
        );
        if (matchedMember) {
          setLoggedInMember(matchedMember);
        } else {
          setLoggedInMember(savedMember);
        }
      } else {
        setLoggedInMember(null);
      }
    } catch (err) {
      console.error('Authentication guard rehydration error:', err);
    }
  }, [adminUsers, womensTeamMembers, generalMembers]);

  // Section 5.2: Browser Back/Forward navigation via popstate and initial hash parse
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      setActiveSection(hash);

      // Handle direct QR Code Member Verification URL: #verify-member-[id]
      if (hash.startsWith('verify-member-')) {
        const rawTargetId = hash.replace('verify-member-', '');
        let targetId = rawTargetId;
        try {
          targetId = decodeURIComponent(rawTargetId);
        } catch {
          // use rawTargetId
        }
        const normalizedTarget = targetId.trim().toLowerCase();
        const matched = generalMembers.find(
          m =>
            m.membershipId.toLowerCase() === normalizedTarget ||
            m.id.toLowerCase() === normalizedTarget
        );
        if (matched) {
          setQrVerifiedMember(matched);
          setActiveCategory('members');
        } else {
          const currentCommittee = committeeTerms.find(t => t.isCurrent)?.members || TEAM_MEMBERS;
          const ecIndex = currentCommittee.findIndex(
            (c, idx) =>
              `clf-ec-${(idx + 1).toString().padStart(2, '0')}` === normalizedTarget ||
              c.id.toLowerCase() === normalizedTarget
          );
          if (ecIndex !== -1) {
            const c = currentCommittee[ecIndex];
            const ecId = `CLF-EC-${(ecIndex + 1).toString().padStart(2, '0')}`;
            setQrVerifiedMember({
              id: c.id,
              slNo: ecIndex + 1,
              membershipId: ecId,
              nameBn: c.nameBn,
              nameEn: c.nameEn,
              roleBn: c.roleBn,
              roleEn: c.roleEn,
              bloodGroup: c.bloodGroup || 'O+',
              district: c.district || (language === 'bn' ? 'মৌলভীবাজার' : 'Moulvibazar'),
              joinedDate: c.joiningYear ? `${c.joiningYear}-01-01` : '2026-03-07',
              joiningYear: c.joiningYear || 2026,
              status: 'active',
              approvalStatus: 'approved',
              avatar: c.image,
              email: c.email,
            });
            setActiveCategory('committee');
          }
        }
      }

      // Map hash to separate page view
      if (['about', 'committee', 'committee_history', 'advisors', 'members', 'womens_team', 'activities', 'transparency', 'notices', 'emergency_notice', 'applications', 'notices_applications', 'contact_location'].includes(hash)) {
        setActiveCategory(hash as PortalCategoryKey);
      } else if (hash === 'emergency-notice' || hash === 'emergency_notice') {
        setActiveCategory('emergency_notice');
      } else if (hash === 'notices-applications' || hash === 'notices_applications') {
        setActiveCategory('notices_applications');
      } else if (hash === 'committee-history') {
        setActiveCategory('committee_history');
      } else if (hash === 'advisory') {
        setActiveCategory('advisors');
      } else if (hash === 'womens-team') {
        setActiveCategory('womens_team');
      } else if (['projects', 'events', 'gallery'].includes(hash)) {
        setActiveCategory('activities');
      } else if (['contact', 'location-map'].includes(hash)) {
        setActiveCategory('contact_location');
      } else if (['member-login', 'member_login', 'portal', 'login'].includes(hash)) {
        setPortalDefaultTab('login');
        setIsPortalOpen(true);
      } else if (hash === 'home' || hash === '' || hash === 'all') {
        setActiveCategory('home');
      }

      if (!hash.startsWith('verify-member-')) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    // Run on initial mount so direct URL with hash works cleanly
    handleHashChange();

    window.addEventListener('popstate', handleHashChange);
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('popstate', handleHashChange);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [generalMembers, committeeTerms, language]);

  // Section 5.2: Smooth and responsive navigation across all 10 dedicated pages
  const handleNavigateSection = (sectionId: string) => {
    setActiveSection(sectionId);
    window.history.pushState(null, '', `#${sectionId}`);

    if (sectionId === 'about') {
      setActiveCategory('about');
    } else if (sectionId === 'committee') {
      setActiveCategory('committee');
    } else if (sectionId === 'committee-history' || sectionId === 'committee_history') {
      setActiveCategory('committee_history');
    } else if (sectionId === 'advisors' || sectionId === 'advisory') {
      setActiveCategory('advisors');
    } else if (sectionId === 'members') {
      setActiveCategory('members');
    } else if (sectionId === 'womens-team' || sectionId === 'womens_team') {
      setActiveCategory('womens_team');
    } else if (sectionId === 'activities' || sectionId === 'projects') {
      setActiveCategory('activities');
    } else if (sectionId === 'transparency') {
      setActiveCategory('transparency');
    } else if (sectionId === 'notices') {
      setActiveCategory('notices');
    } else if (sectionId === 'emergency-notice' || sectionId === 'emergency_notice') {
      setActiveCategory('emergency_notice');
    } else if (sectionId === 'applications') {
      setActiveCategory('applications');
    } else if (sectionId === 'notices_applications' || sectionId === 'notices-applications') {
      setActiveCategory('notices_applications');
    } else if (sectionId === 'contact' || sectionId === 'location-map') {
      setActiveCategory('contact_location');
    } else if (sectionId === 'member-login' || sectionId === 'member_login' || sectionId === 'login' || sectionId === 'portal') {
      setPortalDefaultTab('login');
      setIsPortalOpen(true);
      return;
    } else if (sectionId === 'home') {
      setActiveCategory('home');
    }

    // Scroll to top of newly selected separate page
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsTransitioning(false);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    addToast(
      'info',
      newTheme === 'dark' ? 'ডার্ক মোড সক্রিয় করা হয়েছে' : 'লাইট মোড সক্রিয় করা হয়েছে',
      newTheme === 'dark' ? 'Switched to Dark Theme' : 'Switched to Light Theme'
    );
  };

  const handleOpenDonate = (project?: Project | null) => {
    setSelectedDonationProject(project || null);
    setIsDonationOpen(true);
  };

  const handleOpenVolunteer = () => {
    setPortalDefaultTab('register');
    setPortalDefaultViewTab('card');
    setIsPortalOpen(true);
  };

  const handleOpenPortal = () => {
    setPortalDefaultTab('login');
    setPortalDefaultViewTab('card');
    setIsPortalOpen(true);
  };

  const handleEditOwnProfile = () => {
    setSelectedMemberProfile(null);
    setPortalDefaultTab('login');
    setPortalDefaultViewTab('edit');
    setIsPortalOpen(true);
  };

  // When a donation is submitted
  const handleDonationSuccess = (newDonation: Donation) => {
    setDonations(prev => {
      const next = [newDonation, ...prev];
      persistState('donations', next);
      return next;
    });
    if (firebaseUser?.emailVerified) {
      void submitDonationRecordToFirestore(firebaseUser, newDonation);
    }

    // Update matching project target if applicable
    if (newDonation.purpose && newDonation.purpose !== 'general') {
      setProjects(prevProjects => {
        const nextProjects = prevProjects.map(p => {
          if (p.id === newDonation.purpose) {
            return {
              ...p,
              raisedAmount: p.raisedAmount + newDonation.amount,
              donorsCount: p.donorsCount + 1
            };
          }
          return p;
        });
        persistState('projects', nextProjects);
        return nextProjects;
      });
    }

    // Add to public financial audit ledger
    const newRecord = {
      id: `fn-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'income' as const,
      category: 'Public Online Contribution',
      amount: newDonation.amount,
      project: newDonation.purpose,
      voucherNumber: newDonation.receiptNumber,
      descriptionBn: `${newDonation.purposeNameBn} প্রকল্পে অনলাইন অনুদান (${newDonation.donorName})`,
      descriptionEn: `Online donation for ${newDonation.purposeNameEn} (${newDonation.donorName})`
    };
    setFinancialRecords(prev => {
      const next = [newRecord, ...prev];
      persistState('financialRecords', next);
      return next;
    });

    addToast(
      'success',
      language === 'bn' ? 'অনুদান সফলভাবে গৃহীত হয়েছে!' : 'Donation Successfully Verified!',
      `${newDonation.receiptNumber} - BDT ${newDonation.amount.toLocaleString()}`
    );
  };

  const handleRegisterVolunteer = (newVol: Volunteer) => {
    setVolunteers(prev => {
      const next = [newVol, ...prev];
      persistState('volunteers', next);
      return next;
    });
  };

  const handleToggleDonationVerify = (id: string) => {
    setDonations(prev => {
      const next = prev.map(d => {
        if (d.id === id) {
          const updated = !d.isVerified;
          addToast(
            'info',
            updated ? 'অনুদান ভেরিফাইড হিসেবে চিহ্নিত' : 'অনুদান পেন্ডিং হিসেবে চিহ্নিত',
            `Receipt: ${d.receiptNumber}`
          );
          return { ...d, isVerified: updated };
        }
        return d;
      });
      persistState('donations', next);
      return next;
    });
  };

  const handleDeleteDonation = (id: string) => {
    setDonations(prev => {
      const updated = prev.filter(d => d.id !== id);
      persistState('donations', updated);
      return updated;
    });
    addToast('info', language === 'bn' ? 'অনুদান রেকর্ড মুছে ফেলা হয়েছে' : 'Donation record deleted');
  };

  const handleApproveVolunteer = (id: string) => {
    setVolunteers(prev => {
      const updated = prev.map(v => {
        if (v.id === id) {
          addToast(
            'success',
            'স্বেচ্ছাসেবক অনুমোদন সম্পন্ন',
            `${v.fullName} (ID: ${v.id})`
          );
          return { ...v, status: 'active' as const, volunteerHours: v.volunteerHours + 5 };
        }
        return v;
      });
      persistState('volunteers', updated);
      return updated;
    });
  };

  const handleAddVolunteer = (newVol: Volunteer) => {
    setVolunteers(prev => {
      const updated = [newVol, ...prev];
      persistState('volunteers', updated);
      return updated;
    });
    addToast('success', language === 'bn' ? 'নতুন স্বেচ্ছাসেবী সফলভাবে যুক্ত হয়েছে' : 'Volunteer Added', newVol.fullName);
  };

  const handleUpdateVolunteer = (updatedVol: Volunteer) => {
    setVolunteers(prev => {
      const updated = prev.map(v => v.id === updatedVol.id ? updatedVol : v);
      persistState('volunteers', updated);
      return updated;
    });
    addToast('success', language === 'bn' ? 'স্বেচ্ছাসেবী তথ্য আপডেট হয়েছে' : 'Volunteer Updated', updatedVol.fullName);
  };

  const handleDeleteVolunteer = (id: string) => {
    const target = volunteers.find(v => v.id === id);
    setVolunteers(prev => {
      const updated = prev.filter(v => v.id !== id);
      persistState('volunteers', updated);
      return updated;
    });
    addToast('info', language === 'bn' ? 'স্বেচ্ছাসেবী মুছে ফেলা হয়েছে' : 'Volunteer Deleted', target?.fullName);
  };

  const handleDeleteAuditLog = (id: string) => {
    setAuditLogs(prev => {
      const updated = prev.filter(l => l.id !== id);
      persistState('auditLogs', updated);
      return updated;
    });
    addToast('info', language === 'bn' ? 'অডিট রেকর্ড মুছে ফেলা হয়েছে' : 'Audit record deleted');
  };

  const handleClearAuditLogs = () => {
    setAuditLogs([]);
    persistState('auditLogs', []);
    addToast('info', language === 'bn' ? 'সকল অডিট রেকর্ড মুছে ফেলা হয়েছে' : 'All audit records cleared');
  };

  const handleAddNewProject = (project: Project) => {
    setProjects(prev => {
      const updated = [project, ...prev];
      persistState('projects', updated);
      return updated;
    });
    addToast(
      'success',
      language === 'bn' ? 'নতুন মানবিক প্রকল্প যুক্ত করা হয়েছে' : 'New Project Created',
      project.titleBn
    );
  };

  const handleUpdateProject = (updatedProj: Project) => {
    setProjects(prev => {
      const updated = prev.map(p => p.id === updatedProj.id ? updatedProj : p);
      persistState('projects', updated);
      return updated;
    });
    addToast(
      'success',
      language === 'bn' ? 'প্রকল্প সফলভাবে সম্পাদনা করা হয়েছে' : 'Project Updated Successfully',
      updatedProj.titleBn
    );
  };

  const handleDeleteProject = (projId: string) => {
    const target = projects.find(p => p.id === projId);
    setProjects(prev => {
      const updated = prev.filter(p => p.id !== projId);
      persistState('projects', updated);
      return updated;
    });
    addToast(
      'info',
      language === 'bn' ? 'প্রকল্প মুছে ফেলা হয়েছে' : 'Project Deleted',
      target?.titleBn
    );
  };

  const handleAddNewNotice = (notice: NoticeItem) => {
    setNotices(prev => {
      const updated = [notice, ...prev];
      persistState('notices', updated);
      return updated;
    });
    addToast(
      'success',
      'নতুন বিজ্ঞপ্তি প্রকাশিত হয়েছে',
      notice.titleBn
    );
  };

  const handleDeleteNotice = (noticeId: string) => {
    setNotices(prev => {
      const updated = prev.filter(n => n.id !== noticeId);
      persistState('notices', updated);
      return updated;
    });
    addToast('info', language === 'bn' ? 'বিজ্ঞপ্তি মুছে ফেলা হয়েছে' : 'Notice Deleted');
  };

  // Public Applications Handlers
  const handleAddNewApplication = (newApp: PublicApplication) => {
    setPublicApplications(prev => {
      const updated = [newApp, ...prev];
      persistState('publicApplications', updated);
      return updated;
    });
    if (firebaseUser?.emailVerified) {
      void submitPublicApplicationToFirestore(firebaseUser, newApp);
    }
    fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newApp)
    }).catch(() => {});
  };

  const handleUpdateApplication = (updatedApp: PublicApplication) => {
    setPublicApplications(prev => {
      const updatedList = prev.map(a => a.id === updatedApp.id ? updatedApp : a);
      persistState('publicApplications', updatedList);
      return updatedList;
    });
    fetch(`/api/applications/${updatedApp.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedApp)
    }).catch(err => console.warn(err));
  };

  // AI Conversation Logs Handler
  const handleLogAIConversation = (newLog: AIConversationLog) => {
    setAiConversationLogs(prev => {
      const updated = [newLog, ...prev].slice(0, 500);
      persistState('aiConversationLogs', updated);
      return updated;
    });
  };

  // Full JSON Backup Restore Handler
  const handleRestoreBackup = (parsed: any) => {
    const bulk: Partial<Record<StateKey, unknown>> = {};
    if (Array.isArray(parsed.projects)) {
      setProjects(parsed.projects);
      writeLocalStorageSafely(STORAGE_KEY_MAP.projects, parsed.projects);
      bulk.projects = parsed.projects;
    }
    if (Array.isArray(parsed.notices)) {
      setNotices(parsed.notices);
      writeLocalStorageSafely(STORAGE_KEY_MAP.notices, parsed.notices);
      bulk.notices = parsed.notices;
    }
    if (Array.isArray(parsed.donations)) {
      setDonations(parsed.donations);
      writeLocalStorageSafely(STORAGE_KEY_MAP.donations, parsed.donations);
      bulk.donations = parsed.donations;
    }
    if (Array.isArray(parsed.volunteers)) {
      setVolunteers(parsed.volunteers);
      writeLocalStorageSafely(STORAGE_KEY_MAP.volunteers, parsed.volunteers);
      bulk.volunteers = parsed.volunteers;
    }
    if (Array.isArray(parsed.financialRecords)) {
      setFinancialRecords(parsed.financialRecords);
      writeLocalStorageSafely(STORAGE_KEY_MAP.financialRecords, parsed.financialRecords);
      bulk.financialRecords = parsed.financialRecords;
    }
    if (Array.isArray(parsed.generalMembers)) {
      setGeneralMembers(parsed.generalMembers);
      writeLocalStorageSafely(STORAGE_KEY_MAP.generalMembers, parsed.generalMembers);
      bulk.generalMembers = parsed.generalMembers;
    }
    if (Array.isArray(parsed.committeeTerms)) {
      setCommitteeTerms(parsed.committeeTerms);
      writeLocalStorageSafely(STORAGE_KEY_MAP.committeeTerms, parsed.committeeTerms);
      bulk.committeeTerms = parsed.committeeTerms;
    }
    if (Array.isArray(parsed.advisors)) {
      setAdvisors(parsed.advisors);
      writeLocalStorageSafely(STORAGE_KEY_MAP.advisors, parsed.advisors);
      bulk.advisors = parsed.advisors;
    }
    if (Array.isArray(parsed.paymentChannels)) {
      setPaymentChannels(parsed.paymentChannels);
      writeLocalStorageSafely(STORAGE_KEY_MAP.paymentChannels, parsed.paymentChannels);
      bulk.paymentChannels = parsed.paymentChannels;
    }
    if (parsed.websiteConfig) {
      setWebsiteCustomConfig(parsed.websiteConfig);
      writeLocalStorageSafely(STORAGE_KEY_MAP.websiteCustomConfig, parsed.websiteConfig);
      bulk.websiteCustomConfig = parsed.websiteConfig;
    }
    if (Array.isArray(parsed.womensTeamMembers)) {
      setWomensTeamMembers(parsed.womensTeamMembers);
      writeLocalStorageSafely(STORAGE_KEY_MAP.womensTeamMembers, parsed.womensTeamMembers);
      bulk.womensTeamMembers = parsed.womensTeamMembers;
    }
    if (parsed.mapConfig) {
      setMapConfig(parsed.mapConfig);
      writeLocalStorageSafely(STORAGE_KEY_MAP.mapConfig, parsed.mapConfig);
      bulk.mapConfig = parsed.mapConfig;
    }
    if (Array.isArray(parsed.aiKnowledgeBase)) {
      setAiKnowledgeBase(parsed.aiKnowledgeBase);
      writeLocalStorageSafely(STORAGE_KEY_MAP.aiKnowledgeBase, parsed.aiKnowledgeBase);
      bulk.aiKnowledgeBase = parsed.aiKnowledgeBase;
    }
    if (Object.keys(bulk).length > 0) {
      void syncBulkStateToServer(bulk);
    }
  };

  // Category & Separate Page Selection
  const handleSelectCategory = (cat: PortalCategoryKey) => {
    setActiveCategory(cat);
    if (cat === 'all' || cat === 'home') {
      setActiveSection('home');
      window.history.pushState(null, '', '#home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (cat === 'womens_team') setActiveSection('womens-team');
      else if (cat === 'contact_location') setActiveSection('contact');
      else setActiveSection(cat);

      window.history.pushState(null, '', `#${cat}`);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    }
  };

  const getCategoryTitle = (cat: PortalCategoryKey) => {
    switch (cat) {
      case 'home':
      case 'all': return language === 'bn' ? 'হোম পেজ' : 'Home Page';
      case 'about': return language === 'bn' ? 'পরিচিতি ও লক্ষ্য (About Us)' : 'About Us';
      case 'committee': return language === 'bn' ? 'কার্যনির্বাহী পরিষদ (Executive Committee)' : 'Executive Committee';
      case 'committee_history': return language === 'bn' ? 'পূর্ববর্তী কমিটি ও ইতিহাস (Past Committees)' : 'Past Committees';
      case 'advisors': return language === 'bn' ? 'উপদেষ্টামণ্ডলী পরিষদ (Advisory Council)' : 'Advisory Council';
      case 'members': return language === 'bn' ? 'সাধারণ সদস্যবৃন্দ তালিকা (General Members Directory)' : 'General Members Directory';
      case 'womens_team': return language === 'bn' ? 'উইমেন্স টিম উইং (Women’s Team Autonomous Wing)' : "Women's Team Wing";
      case 'activities': return language === 'bn' ? 'কার্যক্রম ও প্রকল্পসমূহ (Activities & Projects)' : 'Activities & Projects';
      case 'transparency': return language === 'bn' ? 'আর্থিক স্বচ্ছতা ও অডিট লেজার (Financial Transparency)' : 'Financial Transparency';
      case 'notices': return language === 'bn' ? 'বিজ্ঞপ্তি ও বুলেটিন (Notices & Bulletins)' : 'Notices & Bulletins';
      case 'emergency_notice': return language === 'bn' ? 'জরুরি মানবিক বিজ্ঞপ্তি ও ত্রাণ তহবিল (Emergency Relief)' : 'Emergency Relief Notice';
      case 'applications': return language === 'bn' ? 'নাগরিক আবেদন ও ট্র্যাকিং (Public Applications)' : 'Public Applications & Tracking';
      case 'notices_applications': return language === 'bn' ? 'বিজ্ঞপ্তি, অডিট রিপোর্ট ও নাগরিক আবেদন' : 'Notices, Audit Reports & Public Applications';
      case 'contact_location': return language === 'bn' ? 'যোগাযোগ ও Google Maps (Contact & Maps)' : 'Contact & Location';
      default: return language === 'bn' ? 'বিভাগীয় পেজ' : 'Department Page';
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-[#F5F3ED] dark:bg-[#071017] text-[#102B3F] dark:text-stone-100 transition-colors duration-200"
      style={
        theme === 'light' && websiteCustomConfig.bgTone && websiteCustomConfig.bgTone !== '#F5F3ED'
          ? { backgroundColor: websiteCustomConfig.bgTone }
          : undefined
      }
    >
      
      {/* Top Navbar with Active Section Sync */}
      <Navbar
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenDonate={() => handleOpenDonate(null)}
        onOpenPortal={handleOpenPortal}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenScanner={() => setIsGlobalScannerOpen(true)}
        activeSection={activeSection}
        onNavigateSection={handleNavigateSection}
        websiteConfig={websiteCustomConfig}
      />

      {/* Main Page Layout with transition container */}
      <main className={`flex-1 transition-opacity duration-200 ${isTransitioning ? 'opacity-80' : 'opacity-100'}`}>
        
        {/* ======================================================== */}
        {/* SEPARATE PAGE VIEWS (When a specific page is selected) */}
        {/* ======================================================== */}
        {activeCategory !== 'all' && activeCategory !== 'home' ? (
          <div id="category-content-view" className="py-4 space-y-6">

            {/* Sticky Breadcrumb & Quick Switcher Strip */}
            <div className="sticky top-16 z-30 bg-white/95 dark:bg-[#0c1a24]/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 py-3 px-4 sm:px-6 shadow-xs">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleSelectCategory('home')}
                    className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-[#167D78] hover:text-white dark:hover:bg-[#167D78] text-stone-800 dark:text-stone-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <span>← {language === 'bn' ? 'হোম পেজে ফিরে যান' : 'Back to Home'}</span>
                  </button>
                  <span className="text-stone-400 text-xs">/</span>
                  <span className="text-xs font-extrabold text-[#167D78] dark:text-[#D6F36A]">
                    {getCategoryTitle(activeCategory)}
                  </span>
                </div>

                {/* Quick Department Switcher Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-1">
                  {[
                    { id: 'about', label: language === 'bn' ? 'পরিচিতি' : 'About' },
                    { id: 'committee', label: language === 'bn' ? 'বর্তমান কমিটি' : 'Committee' },
                    { id: 'committee_history', label: language === 'bn' ? 'পুরোনো কমিটি' : 'Past Committees' },
                    { id: 'advisors', label: language === 'bn' ? 'উপদেষ্টামণ্ডলী' : 'Advisors' },
                    { id: 'members', label: language === 'bn' ? 'সদস্যবৃন্দ' : 'Members' },
                    { id: 'womens_team', label: language === 'bn' ? 'উইমেন্স টিম' : "Women's Team" },
                    { id: 'activities', label: language === 'bn' ? 'কার্যক্রম' : 'Activities' },
                    { id: 'emergency_notice', label: language === 'bn' ? 'জরুরি বিজ্ঞপ্তি' : 'Emergency Notice' },
                    { id: 'notices', label: language === 'bn' ? 'বিজ্ঞপ্তি' : 'Notices' },
                    { id: 'applications', label: language === 'bn' ? 'আবেদন' : 'Applications' },
                    { id: 'notices_applications', label: language === 'bn' ? 'বিজ্ঞপ্তি ও আবেদন' : 'Notices & Form' },
                    { id: 'contact_location', label: language === 'bn' ? 'যোগাযোগ' : 'Contact' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleSelectCategory(tab.id as PortalCategoryKey)}
                      className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap cursor-pointer transition-colors ${
                        activeCategory === tab.id
                          ? 'bg-[#167D78] text-white shadow-xs'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                  <button
                    onClick={() => handleSelectCategory('home')}
                    className="px-2.5 py-1 rounded-lg bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold whitespace-nowrap cursor-pointer hover:bg-stone-300"
                  >
                    {language === 'bn' ? 'হোম' : 'Home'}
                  </button>
                </div>
              </div>
            </div>

            {/* 1. About Us View */}
            {activeCategory === 'about' && (
              <ScrollReveal direction="up">
                <AboutSection
                  displayMode="about_only"
                  team={committeeTerms.find(t => t.isCurrent)?.members || TEAM_MEMBERS}
                  generalMembers={generalMembers}
                  committeeTerms={committeeTerms}
                  advisors={advisors}
                  language={language}
                  initialTab="central"
                  hidePillars={false}
                  onSelectMemberProfile={setSelectedMemberProfile}
                  onVerifyMember={(member, fromScan) => {
                    setQrVerifiedFromScan(Boolean(fromScan));
                    setQrVerifiedMember(member);
                  }}
                  websiteConfig={websiteCustomConfig}
                  currentAdmin={currentAdmin}
                  loggedInMember={loggedInMember}
                  currentWomensUser={currentWomensUser}
                  onOpenPortal={handleOpenPortal}
                  onOpenAdmin={() => setIsAdminOpen(true)}
                  onEditOwnProfile={handleEditOwnProfile}
                />
              </ScrollReveal>
            )}

            {/* 2. Current Committee View (Executive Committee only) */}
            {activeCategory === 'committee' && (
              <ScrollReveal direction="up">
                <AboutSection
                  displayMode="committee_only"
                  team={committeeTerms.find(t => t.isCurrent)?.members || TEAM_MEMBERS}
                  generalMembers={generalMembers}
                  committeeTerms={committeeTerms}
                  advisors={advisors}
                  language={language}
                  initialTab="central"
                  hidePillars={true}
                  onSelectMemberProfile={setSelectedMemberProfile}
                  websiteConfig={websiteCustomConfig}
                  currentAdmin={currentAdmin}
                  loggedInMember={loggedInMember}
                  currentWomensUser={currentWomensUser}
                  onOpenPortal={handleOpenPortal}
                  onOpenAdmin={() => setIsAdminOpen(true)}
                  onEditOwnProfile={handleEditOwnProfile}
                />
              </ScrollReveal>
            )}

            {/* 2b. Committee History View (Archived Past Committees) */}
            {activeCategory === 'committee_history' && (
              <ScrollReveal direction="up">
                <AboutSection
                  displayMode="history_only"
                  team={committeeTerms.find(t => t.isCurrent)?.members || TEAM_MEMBERS}
                  generalMembers={generalMembers}
                  committeeTerms={committeeTerms}
                  advisors={advisors}
                  language={language}
                  initialTab="history"
                  hidePillars={true}
                  onSelectMemberProfile={setSelectedMemberProfile}
                  websiteConfig={websiteCustomConfig}
                  currentAdmin={currentAdmin}
                  loggedInMember={loggedInMember}
                  currentWomensUser={currentWomensUser}
                  onOpenPortal={handleOpenPortal}
                  onOpenAdmin={() => setIsAdminOpen(true)}
                  onEditOwnProfile={handleEditOwnProfile}
                />
              </ScrollReveal>
            )}

            {/* 2c. Advisory Council View (Current & Former Advisors) */}
            {activeCategory === 'advisors' && (
              <ScrollReveal direction="up">
                <AboutSection
                  displayMode="advisory_only"
                  team={committeeTerms.find(t => t.isCurrent)?.members || TEAM_MEMBERS}
                  generalMembers={generalMembers}
                  committeeTerms={committeeTerms}
                  advisors={advisors}
                  language={language}
                  initialTab="advisory"
                  hidePillars={true}
                  onSelectMemberProfile={setSelectedMemberProfile}
                  websiteConfig={websiteCustomConfig}
                  currentAdmin={currentAdmin}
                  loggedInMember={loggedInMember}
                  currentWomensUser={currentWomensUser}
                  onOpenPortal={handleOpenPortal}
                  onOpenAdmin={() => setIsAdminOpen(true)}
                  onEditOwnProfile={handleEditOwnProfile}
                />
              </ScrollReveal>
            )}

            {/* 3. General Members View (Directory with Blood Group & District Filter) */}
            {activeCategory === 'members' && (
              <ScrollReveal direction="up">
                <AboutSection
                  displayMode="members_only"
                  team={committeeTerms.find(t => t.isCurrent)?.members || TEAM_MEMBERS}
                  generalMembers={generalMembers}
                  committeeTerms={committeeTerms}
                  advisors={advisors}
                  language={language}
                  initialTab="general"
                  hidePillars={true}
                  onSelectMemberProfile={setSelectedMemberProfile}
                  onVerifyMember={(member, fromScan) => {
                    setQrVerifiedFromScan(Boolean(fromScan));
                    setQrVerifiedMember(member);
                  }}
                  websiteConfig={websiteCustomConfig}
                  birthdayMembers={currentMonthBirthdayMembers}
                  currentAdmin={currentAdmin}
                  loggedInMember={loggedInMember}
                  currentWomensUser={currentWomensUser}
                  onOpenPortal={handleOpenPortal}
                  onOpenAdmin={() => setIsAdminOpen(true)}
                  onEditOwnProfile={handleEditOwnProfile}
                  onToast={addToast}
                />
              </ScrollReveal>
            )}

            {/* 4. Women's Team Autonomous Wing View */}
            {activeCategory === 'womens_team' && (
              <ScrollReveal direction="up">
                <WomensTeamSection
                  config={womensTeamConfig}
                  members={womensTeamMembers}
                  activities={womensTeamActivities}
                  documents={womensTeamDocuments}
                  notices={womensTeamNotices}
                  language={language}
                  currentUser={currentWomensUser}
                  onLogin={handleWomensLogin}
                  onLogout={handleWomensLogout}
                  onOpenMemberPortal={() => {
                    setWomensMemberModalInitialTab('login');
                    setIsWomensMemberModalOpen(true);
                  }}
                  onOpenRegister={() => {
                    setWomensMemberModalInitialTab('register');
                    setIsWomensMemberModalOpen(true);
                  }}
                  onOpenAdminPanel={() => setIsWomensAdminModalOpen(true)}
                  onToast={addToast}
                  onSelectMemberProfile={setSelectedMemberProfile}
                />
              </ScrollReveal>
            )}

            {/* 5. Activities View (Projects, Transparency, Events & Field Gallery) */}
            {activeCategory === 'activities' && (
              <div className="space-y-6">
                <ProjectsSection
                  projects={projects}
                  language={language}
                  onSelectProjectForDonation={(proj) => handleOpenDonate(proj)}
                />
                <TransparencySection
                  records={financialRecords}
                  projects={projects}
                  language={language}
                  onToast={addToast}
                />
                <EventsAndNews
                  events={EVENTS_DATA}
                  notices={notices}
                  language={language}
                />
                <GallerySection
                  language={language}
                />
              </div>
            )}

            {/* 6. Transparency View */}
            {activeCategory === 'transparency' && (
              <div className="space-y-6">
                <TransparencySection
                  records={financialRecords}
                  projects={projects}
                  language={language}
                  onToast={addToast}
                />
              </div>
            )}

            {/* 7. Notices View */}
            {activeCategory === 'notices' && (
              <div className="space-y-6">
                <EventsAndNews
                  events={EVENTS_DATA}
                  notices={notices}
                  language={language}
                />
              </div>
            )}

            {/* Emergency Notice Dedicated Page View */}
            {activeCategory === 'emergency_notice' && (
              <div className="space-y-6">
                <EmergencyNoticePage
                  language={language}
                  onBackToHome={() => handleSelectCategory('home')}
                  onOpenDonate={(purpose) => {
                    const matchedProj = projects.find(p => p.id === purpose || p.id === 'proj-flood-rehab') || null;
                    handleOpenDonate(matchedProj);
                  }}
                  onNavigateSection={handleNavigateSection}
                  websiteConfig={websiteCustomConfig}
                  paymentChannels={paymentChannels}
                  onToast={addToast}
                />
              </div>
            )}

            {/* 8. Applications & Tracking View */}
            {activeCategory === 'applications' && (
              <div className="space-y-6">
                <PublicApplicationSection
                  language={language}
                  applications={publicApplications}
                  onSubmitApplication={handleAddNewApplication}
                  onToast={addToast}
                />
              </div>
            )}

            {/* Dedicated Notices, Audit Reports & Public Applications View */}
            {activeCategory === 'notices_applications' && (
              <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6">
                
                {/* Dedicated Top Audit & Portal Showcase Header */}
                <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#102B3F] via-[#0e2738] to-[#167D78] text-white border border-teal-500/30 shadow-xl">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-3 max-w-3xl">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#D6F36A] text-[#102B3F] shadow-sm">
                          {language === 'bn' ? 'চূড়ান্ত অডিট ও প্রকাশনা' : 'Statutory Audit 2025-26'}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-teal-200 border border-white/15">
                          {language === 'bn' ? 'সার্বজনীন উন্মুক্ত নথি' : 'Public Transparency'}
                        </span>
                        <span className="text-xs text-stone-300 font-mono">
                          রেজিস্ট্রেশন: CA-BD/2026/0891
                        </span>
                      </div>

                      <h2 className="text-xl sm:text-3xl font-black text-white leading-tight">
                        {language === 'bn'
                          ? '২০২৫-২০২৬ অর্থবছরের চূড়ান্ত অডিট রিপোর্ট ও বার্ষিক প্রতিবেদন প্রকাশ'
                          : 'Publication of Annual Statutory Audit Statement & Public Applications'}
                      </h2>

                      <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
                        {language === 'bn'
                          ? 'কোলাশ ফাউন্ডেশনের ২০২৫-২০২৬ অর্থবছরের সকল আয়-ব্যয়ের পুঙ্খানুপুঙ্খ বিবরণী খ্যাতনামা সিএ ফার্ম “এস. আহমেদ অ্যান্ড কোং, চার্টার্ড অ্যাকাউন্ট্যান্টস” দ্বারা শতভাগ ভাউচার যাচাইকৃত হয়ে সর্বসাধারণের জন্য উন্মুক্ত করা হলো।'
                          : 'Complete verified financial audit statement and statutory bulletins of CoLASH Foundation for FY 2025-26.'}
                      </p>
                    </div>

                    {/* Direct Action Buttons */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          exportAuditReport20252026();
                          addToast(
                            'success',
                            language === 'bn' ? 'অডিট রিপোর্ট ডাউনলোড শুরু হয়েছে' : 'Audit Report Downloaded',
                            'CoLASH-Audit-Report-2025-2026.txt'
                          );
                        }}
                        className="px-5 py-3 rounded-2xl bg-[#D6F36A] hover:bg-white text-[#102B3F] font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                      >
                        <Download className="w-4 h-4 text-[#102B3F]" />
                        <span>{language === 'bn' ? 'ডাউনলোড চূড়ান্ত অডিট রিপোর্ট' : 'Download Audit Report'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsReportsArchiveOpen(true)}
                        className="px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <BookOpen className="w-4 h-4 text-[#D6F36A]" />
                        <span>{language === 'bn' ? 'গঠনতন্ত্র ও অডিট আর্কাইভ' : 'Reports & By-Laws Archive'}</span>
                      </button>
                    </div>
                  </div>

                  {/* 4 Audited Key Metrics Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-white/15 text-center">
                    <div className="p-3 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
                      <span className="text-[11px] text-teal-200 font-medium block">
                        {language === 'bn' ? 'মোট প্রাপ্ত অনুদান' : 'Total Donations'}
                      </span>
                      <span className="text-lg sm:text-2xl font-black text-[#D6F36A] mt-0.5 block">
                        ৳৪২,৮৫,০০০
                      </span>
                      <span className="text-[10px] text-stone-300 mt-0.5 block">
                        {language === 'bn' ? '১০০% ভাউচার অডিটেড' : '100% Voucher Audited'}
                      </span>
                    </div>

                    <div className="p-3 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
                      <span className="text-[11px] text-teal-200 font-medium block">
                        {language === 'bn' ? 'মাঠপর্যায়ে সেবা বিতরণ' : 'Direct Field Relief'}
                      </span>
                      <span className="text-lg sm:text-2xl font-black text-white mt-0.5 block">
                        ৳৩৮,১৫,০০০
                      </span>
                      <span className="text-[10px] text-stone-300 mt-0.5 block">
                        {language === 'bn' ? '৮৯.০% সরাসরি মানুষের কল্যাণে' : '89.0% Direct Field Aid'}
                      </span>
                    </div>

                    <div className="p-3 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
                      <span className="text-[11px] text-teal-200 font-medium block">
                        {language === 'bn' ? 'আপদকালীন রিজার্ভ' : 'Surplus & Reserve'}
                      </span>
                      <span className="text-lg sm:text-2xl font-black text-emerald-300 mt-0.5 block">
                        ৳৪,৭০,০০০
                      </span>
                      <span className="text-[10px] text-stone-300 mt-0.5 block">
                        {language === 'bn' ? 'হাওর ও বন্যা প্রস্তুতি তহবিল' : 'Reserved for Flood Crisis'}
                      </span>
                    </div>

                    <div className="p-3 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
                      <span className="text-[11px] text-teal-200 font-medium block">
                        {language === 'bn' ? 'নিরীক্ষক চার্টার্ড ফার্ম' : 'Chartered Auditors'}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-white mt-1 block line-clamp-1">
                        এস. আহমেদ অ্যান্ড কোং
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold mt-0.5 block">
                        {language === 'bn' ? '✓ শতভাগ স্বচ্ছ ও সত্যায়িত' : '✓ Certified Authentic'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section A: Notices, Circulars and Events */}
                <div>
                  <EventsAndNews
                    events={EVENTS_DATA}
                    notices={notices}
                    language={language}
                  />
                </div>

                {/* Section B: Citizen Applications & Public Tracking Desk */}
                <div>
                  <PublicApplicationSection
                    language={language}
                    applications={publicApplications}
                    onSubmitApplication={handleAddNewApplication}
                    onToast={addToast}
                  />
                </div>

              </div>
            )}

            {/* 9. Contact & Maps View */}
            {activeCategory === 'contact_location' && (
              <div className="space-y-6">
                <ContactSection
                  language={language}
                  websiteConfig={websiteCustomConfig}
                  onToast={addToast}
                />
                <GoogleMapsSection
                  mapConfig={mapConfig}
                  language={language}
                  onOpenAdminLocation={() => {
                    setAdminInitialTab('location_map');
                    setIsAdminOpen(true);
                  }}
                  onToast={addToast}
                />
              </div>
            )}

          </div>
        ) : (
          /* ======================================================== */
          /* CLEAN AND ATTRACTIVE HOME PAGE EXPERIENCE */
          /* ======================================================== */
          <>
            {/* Hero Section */}
            <ScrollReveal direction="up">
              <Hero
                language={language}
                onOpenDonate={() => handleOpenDonate(null)}
                onOpenVolunteer={handleOpenVolunteer}
                onOpenNoticePage={(noticeId) => handleSelectCategory('emergency_notice')}
                websiteConfig={websiteCustomConfig}
              />
            </ScrollReveal>

            {/* Distinct Category Portal Hub */}
            <ScrollReveal direction="up" delay={20}>
              <CategoryPortalSection
                language={language}
                activeCategory={activeCategory}
                onSelectCategory={handleSelectCategory}
                onOpenPortal={handleOpenPortal}
                onOpenSearch={() => setIsSearchOpen(true)}
                onOpenScanner={() => setIsGlobalScannerOpen(true)}
                onOpenDonate={() => handleOpenDonate(null)}
                onOpenVolunteer={handleOpenVolunteer}
              />
            </ScrollReveal>

            {/* Home Highlights Section (Goals, Objectives, 4 Pillars, 3 Top Causes, Women Wing & AI Highlights) */}
            <ScrollReveal direction="up" delay={40}>
              <HomeHighlightsSection
                language={language}
                projects={projects}
                notices={notices}
                websiteConfig={websiteCustomConfig}
                womensTeamConfig={womensTeamConfig}
                onNavigate={handleNavigateSection}
                onOpenDonate={handleOpenDonate}
                onOpenVolunteer={handleOpenVolunteer}
                onOpenPortal={handleOpenPortal}
              />
            </ScrollReveal>
          </>
        )}

      </main>

      {/* Footer */}
      <Footer
        language={language}
        onOpenDonate={() => handleOpenDonate(null)}
        onOpenVolunteer={handleOpenVolunteer}
        onOpenAdmin={() => setIsAdminOpen(true)}
        websiteConfig={websiteCustomConfig}
      />

      {/* Interactive Modals */}
      <DonationModal
        isOpen={isDonationOpen}
        onClose={() => setIsDonationOpen(false)}
        preselectedProject={selectedDonationProject}
        projects={projects}
        language={language}
        websiteConfig={websiteCustomConfig}
        paymentChannels={paymentChannels}
        onDonationSuccess={handleDonationSuccess}
      />

      <MemberPortalModal
        isOpen={isPortalOpen}
        onClose={() => setIsPortalOpen(false)}
        language={language}
        generalMembers={generalMembers}
        onUpdateGeneralMembers={handleUpdateGeneralMembers}
        volunteers={volunteers}
        onRegisterVolunteer={handleRegisterVolunteer}
        notices={notices}
        defaultTab={portalDefaultTab}
        defaultViewTab={portalDefaultViewTab}
        onMemberSessionChange={setLoggedInMember}
        onToast={addToast}
      />

      <AdminDashboardModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        language={language}
        publishedWebsiteConfig={websiteCustomConfig}
        onPublishWebsiteConfig={handlePublishWebsiteConfig}
        committeeTerms={committeeTerms}
        onUpdateCommitteeTerms={handleUpdateCommitteeTerms}
        advisors={advisors}
        onUpdateAdvisors={handleUpdateAdvisors}
        generalMembers={generalMembers}
        onUpdateGeneralMembers={handleUpdateGeneralMembers}
        donations={donations}
        volunteers={volunteers}
        projects={projects}
        notices={notices}
        adminUsers={adminUsers}
        currentAdmin={currentAdmin}
        auditLogs={auditLogs}
        onLoginAdmin={handleAdminLogin}
        onLogoutAdmin={handleAdminLogout}
        onCreateAdmin={handleCreateAdmin}
        onUpdateAdmin={handleUpdateAdmin}
        onDeleteAdmin={handleDeleteAdmin}
        onToggleAdminStatus={handleToggleAdminStatus}
        onChangeAdminPassword={handleChangeAdminPassword}
        onToggleDonationVerify={handleToggleDonationVerify}
        onApproveVolunteer={handleApproveVolunteer}
        onAddVolunteer={handleAddVolunteer}
        onUpdateVolunteer={handleUpdateVolunteer}
        onDeleteVolunteer={handleDeleteVolunteer}
        onDeleteAuditLog={handleDeleteAuditLog}
        onClearAuditLogs={handleClearAuditLogs}
        onAddNewProject={handleAddNewProject}
        onUpdateProject={handleUpdateProject}
        onDeleteProject={handleDeleteProject}
        onAddNewNotice={handleAddNewNotice}
        onDeleteNotice={handleDeleteNotice}
        onOpenWomensAdmin={() => {
          setIsAdminOpen(false);
          setIsWomensAdminModalOpen(true);
        }}
        womensMembersCount={womensTeamMembers.length}
        womensTeamMembers={womensTeamMembers}
        onUpdateWomensMembers={handleUpdateWomensMembers}
        paymentChannels={paymentChannels}
        onUpdatePaymentChannels={handleUpdatePaymentChannels}
        onDeleteDonation={handleDeleteDonation}
        aiKnowledgeBase={aiKnowledgeBase}
        onUpdateAIKnowledgeBase={handleUpdateAIKnowledgeBase}
        mapConfig={mapConfig}
        onUpdateMapConfig={handleUpdateMapConfig}
        publicApplications={publicApplications}
        onUpdatePublicApplication={handleUpdateApplication}
        aiConversationLogs={aiConversationLogs}
        onRestoreBackup={handleRestoreBackup}
        onSyncAllToCloud={handleSyncAllToCloud}
        initialTab={adminInitialTab}
        onToast={addToast}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        language={language}
        projects={projects}
        notices={notices}
        team={TEAM_MEMBERS}
        generalMembers={generalMembers}
        advisors={advisors}
        onSelectProject={(proj) => handleOpenDonate(proj)}
        onSelectMember={(m) => setSelectedMemberProfile(m)}
        onSelectNotice={() => handleSelectCategory('notices_applications')}
      />

      {/* CoLASH Women's Team Autonomous Wing Modals */}
      <WomensTeamMemberModal
        isOpen={isWomensMemberModalOpen}
        onClose={() => setIsWomensMemberModalOpen(false)}
        config={womensTeamConfig}
        members={womensTeamMembers}
        documents={womensTeamDocuments}
        notices={womensTeamNotices}
        activities={womensTeamActivities}
        language={language}
        currentUser={currentWomensUser}
        initialTab={womensMemberModalInitialTab}
        onLoginSuccess={handleWomensLogin}
        onRegisterMember={handleRegisterWomensMember}
        onUpdateMember={handleUpdateWomensMemberSelf}
        onLogout={handleWomensLogout}
        onOpenAdminPanel={() => setIsWomensAdminModalOpen(true)}
        onUpdateConfig={handleUpdateWomensConfig}
        onUpdateMembers={handleUpdateWomensMembers}
        onSelectMemberProfile={setSelectedMemberProfile}
        onToast={addToast}
      />

      <WomensTeamAdminModal
        isOpen={isWomensAdminModalOpen}
        onClose={() => setIsWomensAdminModalOpen(false)}
        config={womensTeamConfig}
        onUpdateConfig={handleUpdateWomensConfig}
        members={womensTeamMembers}
        onUpdateMembers={handleUpdateWomensMembers}
        activities={womensTeamActivities}
        onUpdateActivities={handleUpdateWomensActivities}
        documents={womensTeamDocuments}
        onUpdateDocuments={handleUpdateWomensDocuments}
        notices={womensTeamNotices}
        onUpdateNotices={handleUpdateWomensNotices}
        adminUsers={adminUsers}
        onUpdateAdminPassword={handleChangeAdminPassword}
        onUpdateAdmin={handleUpdateAdmin}
        onCreateAdmin={handleCreateAdmin}
        language={language}
        onToast={addToast}
      />

      {/* Toast Notification Container */}
      <ToastContainer
        toasts={toasts}
        onDismiss={dismissToast}
      />

      {/* Periodic LocalStorage JSON Snapshot Safeguard Prompt */}
      <BackupPromptBanner
        isOpen={isBackupPromptOpen}
        language={language}
        snapshotPreview={backupSnapshotPreview}
        lastBackupTimestamp={lastBackupAt}
        onDownloadNow={() => {
          const { filename } = LocalStorageBackupManager.downloadSnapshotFile(backupLiveOverrides);
          setLastBackupAt(LocalStorageBackupManager.getLastBackupTimestamp());
          setIsBackupPromptOpen(false);
          addToast(
            'success',
            language === 'bn' ? 'JSON ব্যাকআপ ডাউনলোড সম্পন্ন' : 'JSON Snapshot Downloaded',
            language === 'bn'
              ? `ফাইল (${filename}) সফলভাবে সংরক্ষিত হয়েছে।`
              : `Saved safeguard snapshot (${filename}).`
          );
        }}
        onSnooze={() => {
          LocalStorageBackupManager.snoozePrompt();
          setIsBackupPromptOpen(false);
          addToast(
            'info',
            language === 'bn' ? 'ব্যাকআপ রিমাইন্ডার স্থগিত' : 'Backup Reminder Snoozed',
            language === 'bn'
              ? '৪ ঘণ্টা পর পুনরায় মনে করিয়ে দেওয়া হবে।'
              : 'We will remind you again in 4 hours.'
          );
        }}
        onDismiss={() => {
          LocalStorageBackupManager.snoozePrompt(60 * 60 * 1000);
          setIsBackupPromptOpen(false);
        }}
      />

      {/* Dedicated Single Member Profile View / Dedicated Page View */}
      {selectedMemberProfile && (
        <MemberProfilePage
          member={selectedMemberProfile}
          onClose={() => setSelectedMemberProfile(null)}
          language={language}
          currentAdmin={currentAdmin}
          loggedInMember={loggedInMember}
          currentWomensUser={currentWomensUser}
          onOpenPortal={handleOpenPortal}
          onOpenAdmin={() => setIsAdminOpen(true)}
          onEditOwnProfile={handleEditOwnProfile}
          onOpenScanner={() => setIsGlobalScannerOpen(true)}
        />
      )}

      {/* Official Constitution & Audit Reports Archive Modal */}
      <ReportsArchiveModal
        isOpen={isReportsArchiveOpen}
        onClose={() => setIsReportsArchiveOpen(false)}
        language={language}
      />

      {/* Global QR Code Member Verification Modal */}
      <MemberVerificationModal
        member={qrVerifiedMember}
        isOpen={Boolean(qrVerifiedMember)}
        onClose={() => {
          setQrVerifiedMember(null);
          setQrVerifiedFromScan(false);
          if (window.location.hash.startsWith('#verify-member-')) {
            window.history.pushState(null, '', '#members');
          }
        }}
        language={language}
        currentAdmin={currentAdmin}
        loggedInMember={loggedInMember}
        currentWomensUser={currentWomensUser}
        onOpenPortal={handleOpenPortal}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenScanner={() => setIsGlobalScannerOpen(true)}
        isQrScanSuccess={qrVerifiedFromScan}
      />

      {/* Global Camera QR Code ID Verification Scanner */}
      <QRScannerModal
        isOpen={isGlobalScannerOpen}
        onClose={() => setIsGlobalScannerOpen(false)}
        language={language}
        generalMembers={generalMembers}
        committee={committeeTerms.find(t => t.isCurrent)?.members || TEAM_MEMBERS}
        onToast={addToast}
        onOpenVerificationModal={(member) => {
          setQrVerifiedFromScan(true);
          setQrVerifiedMember(member);
        }}
        onVerifiedMemberOpen={(member) => setSelectedMemberProfile({
          ...member,
          image: member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
          memberId: member.membershipId,
          joinDate: member.joinedDate,
          joiningYear: member.joiningYear || 2024,
          serviceYears: member.serviceYears ? Number(member.serviceYears) : (new Date().getFullYear() - Number(member.joiningYear || 2024)),
          previousPositions: member.previousPositions || [],
          category: 'সাধারণ পরিষদ',
        })}
      />

      {/* Interactive AI Assistant Widget */}
      <AIAssistantWidget
        language={language}
        knowledgeBase={aiKnowledgeBase}
        onNavigateSection={handleNavigateSection}
        onOpenDonate={() => handleOpenDonate(null)}
        onOpenVolunteer={handleOpenVolunteer}
        onOpenPortal={handleOpenPortal}
        onOpenWomensTeam={() => handleSelectCategory('womens_team')}
      />

    </div>
  );
}
