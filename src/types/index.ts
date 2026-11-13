export type Language = 'bn' | 'en';
export type ThemeMode = 'light' | 'dark';

export interface ApprovalRecord {
  step?: string;
  approvedBy?: string;
  userName?: string;
  role?: string;
  action?: string;
  timestamp?: string;
  designation?: string;
  date?: string;
  notes?: string;
}

export interface PaymentChannel {
  id: string;
  gateway: 'bkash' | 'nagad';
  number: string;
  accountType: 'Personal' | 'Merchant' | 'Agent';
  accountHolderName: string;
  instructionBn: string;
  instructionEn: string;
  isActive: boolean;
  qrCodeUrl?: string;
  createdAt?: string;
}

export interface MemberPositionHistory {
  id?: string;
  positionBn?: string;
  positionEn?: string;
  titleBn?: string;
  titleEn?: string;
  fromYear?: number;
  toYear?: number;
  startYear?: number | string;
  endYear?: number | string;
  termTitleBn?: string;
  department?: string;
  notes?: string;
}

export interface DesignationConfig {
  id: string;
  titleBn: string;
  titleEn: string;
  department: string;
  canProposeProjects: boolean;
  canApproveProjects: boolean;
  canPublishNotices: boolean;
  canManageMembers: boolean;
  canVerifyDonations: boolean;
  assignedCategories: string[];
}

export interface FoundationPhilosophyConfig {
  genesisTitleBn: string;
  genesisTitleEn: string;
  genesisDateBn: string;
  genesisStoryBn: string;
  genesisStoryEn: string;
  missionBn: string;
  missionEn: string;
  visionBn: string;
  visionEn: string;
  founderQuoteBn: string;
  founderQuoteEn: string;
  corePillars: Array<{
    id: string;
    titleBn: string;
    titleEn: string;
    descriptionBn: string;
    descriptionEn: string;
    icon: string;
  }>;
}

export interface Project {
  id: string;
  titleBn: string;
  titleEn: string;
  category: 'all' | 'education' | 'relief' | 'health' | 'winter' | 'empowerment';
  targetAmount: number;
  raisedAmount: number;
  donorsCount: number;
  locationBn: string;
  locationEn: string;
  beneficiariesCount: number;
  image: string;
  descriptionBn: string;
  descriptionEn: string;
  urgent?: boolean;
  status: 'active' | 'completed' | 'urgent';
  proposedBy?: string | {
    nameBn: string;
    nameEn?: string;
    designationBn: string;
    designationEn?: string;
    date?: string;
  };
  approvedBy?: string | {
    nameBn: string;
    nameEn?: string;
    designationBn: string;
    designationEn?: string;
    date?: string;
  };
  approvalHistory?: ApprovalRecord[];
  impactUpdates: {
    date: string;
    textBn: string;
    textEn: string;
  }[];
}

export interface Donation {
  id: string;
  receiptNumber: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  amount: number;
  purpose: string;
  purposeNameBn: string;
  purposeNameEn: string;
  paymentMethod: 'bkash' | 'nagad' | 'rocket' | 'card';
  transactionId: string;
  date: string;
  isVerified: boolean;
  isAnonymous: boolean;
  notes?: string;
}

export interface DonationRecord {
  id: string;
  donorName: string;
  amount: number;
  method: string;
  phoneOrTrx?: string;
  date: string;
  purpose?: string;
  status: string;
}

export interface Volunteer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  bloodGroup: string;
  district: string;
  role: 'member' | 'volunteer' | 'coordinator';
  status: 'active' | 'pending';
  joinedDate: string;
  volunteerHours: number;
  certificatesCount: number;
  skills: string[];
}

export interface TeamMember {
  id: string;
  nameBn: string;
  nameEn: string;
  roleBn: string;
  roleEn: string;
  bioBn: string;
  bioEn: string;
  image: string;
  phone?: string;
  email?: string;
  category?: 'executive' | 'finance' | 'education' | 'welfare' | 'publicity' | 'sports';
  isFounder?: boolean;
  joiningYear?: number | string;
  serviceYears?: number | string;
  currentDesignationBn?: string;
  currentDesignationEn?: string;
  previousPositions?: MemberPositionHistory[];
  bloodGroup?: string;
  district?: string;
  dateOfBirth?: string;
  birthMonth?: number;
  birthDay?: number;
}

export interface CommitteeTerm {
  id: string;
  termTitleBn: string;
  termTitleEn: string;
  startYear: number;
  endYear: number;
  isCurrent: boolean;
  status: 'current' | 'archived';
  descriptionBn?: string;
  descriptionEn?: string;
  establishedDate?: string;
  members: TeamMember[];
}

export interface AdvisoryCouncilMember {
  id: string;
  nameBn: string;
  nameEn: string;
  roleBn: string;
  roleEn: string;
  designationBn?: string;
  designationEn?: string;
  organizationBn?: string;
  organizationEn?: string;
  image: string;
  joinedDate: string;
  exitDate?: string;
  status: 'current' | 'former';
  bioBn: string;
  bioEn: string;
  phone?: string;
  email?: string;
}

export interface GeneralMember {
  id: string;
  slNo: number;
  nameBn: string;
  nameEn: string;
  membershipId: string;
  bloodGroup: string;
  joinedDate: string;
  district: string;
  status: 'active' | 'deactivated' | 'suspended';
  roleBn: string;
  roleEn: string;
  phone?: string;
  email?: string;
  avatar?: string;
  password?: string;
  approvalStatus?: 'approved' | 'pending' | 'rejected' | 'correction_requested';
  verificationStatus?: 'verified' | 'pending' | 'under_review' | 'rejected' | 'correction_requested';
  idDocumentType?: 'nid' | 'birth_cert' | 'passport' | 'student_id' | 'other';
  idDocumentNumber?: string;
  idDocumentFile?: string;
  verificationNotes?: string;
  verifiedBy?: {
    name: string;
    designation: string;
    date: string;
  };
  profession?: string;
  address?: string;
  bio?: string;
  registeredAt?: string;
  approvedAt?: string;
  joiningYear?: number | string;
  serviceYears?: number | string;
  currentDesignationBn?: string;
  currentDesignationEn?: string;
  previousPositions?: MemberPositionHistory[];
  dateOfBirth?: string;
  birthMonth?: number;
  birthDay?: number;
}

export interface EventItem {
  id: string;
  titleBn: string;
  titleEn: string;
  date: string;
  timeBn: string;
  timeEn: string;
  locationBn: string;
  locationEn: string;
  descriptionBn: string;
  descriptionEn: string;
  category: 'health' | 'relief' | 'meeting' | 'campaign';
  rsvpsCount: number;
  isPast?: boolean;
}

export interface FinancialRecord {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  project: string;
  voucherNumber: string;
  descriptionBn: string;
  descriptionEn: string;
}

export interface NoticeItem {
  id: string;
  titleBn: string;
  titleEn: string;
  date: string;
  category: 'circular' | 'audit' | 'recruitment' | 'emergency';
  bodyBn: string;
  bodyEn: string;
  contentBn?: string;
  contentEn?: string;
  downloadUrl?: string;
  publishedBy?: string | {
    nameBn: string;
    nameEn?: string;
    designationBn: string;
    designationEn?: string;
    date?: string;
  };
  department?: string;
  approvalHistory?: ApprovalRecord[];
}

// CoLASH Foundation Women's Team Interfaces
export interface WomensTeamMember {
  id: string;
  nameBn: string;
  nameEn: string;
  designationBn: string;
  designationEn: string;
  roleType: 'team_leader' | 'president' | 'vice_president' | 'general_secretary' | 'organizing_secretary' | 'treasurer' | 'welfare' | 'advisor' | 'member';
  membershipId: string;
  phone: string;
  email: string;
  password?: string;
  photoUrl: string;
  bioBn: string;
  bioEn: string;
  joinedDate: string;
  district: string;
  bloodGroup?: string;
  responsibilities: string[];
  status: 'active' | 'leave' | 'pending';
}

export interface WomensTeamDocument {
  id: string;
  titleBn: string;
  titleEn: string;
  type: 'meeting_minutes' | 'resolution' | 'guideline' | 'report' | 'notice';
  date: string;
  fileSize: string;
  descriptionBn: string;
  descriptionEn: string;
  downloadUrl?: string;
  contentSnippet?: string;
  isRestrictedToMembers?: boolean;
}

export interface WomensTeamActivity {
  id: string;
  titleBn: string;
  titleEn: string;
  date: string;
  locationBn: string;
  locationEn: string;
  beneficiariesCount: number;
  image: string;
  category: 'maternal_health' | 'hygiene' | 'tailoring_vocational' | 'rights_literacy' | 'emergency_aid';
  descriptionBn: string;
  descriptionEn: string;
  status: 'completed' | 'ongoing' | 'upcoming';
}

export interface WomensTeamNotice {
  id: string;
  titleBn: string;
  titleEn: string;
  date: string;
  priority: 'urgent' | 'general';
  bodyBn: string;
  bodyEn: string;
  signedBy: string;
}

export interface WomensTeamConfig {
  nameBn: string;
  nameEn: string;
  shortName: string;
  mottoBn: string;
  mottoEn: string;
  logoUrl: string;
  establishedDate: string;
  descriptionBn: string;
  descriptionEn: string;
  email: string;
  phone: string;
  address: string;
}

// Admin & Permission Management Interfaces
export type AdminRole = 
  | 'super_admin' 
  | 'womens_team_leader' 
  | 'member_manager' 
  | 'content_editor' 
  | 'finance_manager' 
  | 'custom_admin';

export interface AdminPermissions {
  canViewMembers: boolean;
  canAddMembers: boolean;
  canEditMembers: boolean;
  canDeleteMembers: boolean;
  canVerifyDonations: boolean;
  canManageProjects: boolean;
  canManageNotices: boolean;
  canManageFiles: boolean;
  canManageWomensTeam: boolean;
  canManageSettings: boolean;
  canManageAdmins: boolean;
  canManageAIContent?: boolean;
  canManageLocation?: boolean;
  canManageApplications?: boolean;
  canManageAIHistory?: boolean;
  canManageWebsiteEditor?: boolean;
  canManageCommittee?: boolean;
  canManageAdvisors?: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: AdminRole;
  roleTitleBn: string;
  roleTitleEn: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  permissions: AdminPermissions;
}

export interface AdminAuditLog {
  id: string;
  timestamp: string;
  adminId: string;
  adminName: string;
  adminRole: string;
  actionBn: string;
  actionEn: string;
  category: 'auth' | 'admin_manage' | 'donation' | 'member' | 'project' | 'notice' | 'womens_team' | 'security' | 'ai_content' | 'settings' | 'public_application' | 'ai_advisor' | 'website_editor' | 'committee' | 'advisors';
}

// ==========================================
// Custom Website Editor Configuration
// ==========================================
export interface WebsiteCustomConfig {
  siteTitleBn: string;
  siteTitleEn: string;
  siteSloganBn: string;
  siteSloganEn: string;
  siteSubtitleBn: string;
  siteSubtitleEn: string;
  hotline: string;
  contactEmail: string;
  addressBn: string;
  addressEn: string;
  heroBadgeBn: string;
  heroBadgeEn: string;
  heroHeadingBn: string;
  heroHeadingEn: string;
  heroSubheadingBn: string;
  heroSubheadingEn: string;
  founderVisionBn: string;
  founderVisionEn: string;
  primaryColor: string; // e.g. '#167D78'
  secondaryColor: string; // e.g. '#102B3F'
  accentColor: string; // e.g. '#D6F36A'
  bgTone: string; // e.g. '#F5F3ED'
  fontFamily: 'Hind Siliguri' | 'Inter' | 'Outfit' | 'Kalpurush' | 'Roboto';
  borderRadius: 'rounded-lg' | 'rounded-xl' | 'rounded-2xl' | 'rounded-3xl';
  logoUrl: string;
  heroImageUrl: string;
  womensTeamLogoUrl: string;
  founderImageUrl: string;
  // Bank & Payment Accounts
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankBranch?: string;
  bankRouting?: string;
  bkashNumber?: string;
  nagadNumber?: string;
  rocketNumber?: string;
  // A to Z Customization: Hero 4 Stats
  stat1Number?: string;
  stat1LabelBn?: string;
  stat1SubtextBn?: string;
  stat2Number?: string;
  stat2LabelBn?: string;
  stat2SubtextBn?: string;
  stat3Number?: string;
  stat3LabelBn?: string;
  stat3SubtextBn?: string;
  stat4Number?: string;
  stat4LabelBn?: string;
  stat4SubtextBn?: string;
  // Urgent Crisis Banner & Ticker
  noticeTickerBn?: string;
  noticeTickerEn?: string;
  urgentBannerTitleBn?: string;
  urgentBannerTitleEn?: string;
  urgentBannerTextBn?: string;
  urgentBannerTextEn?: string;
  urgentBannerBtnBn?: string;
  urgentBannerBtnEn?: string;
  // About Section: Genesis, History & Charter
  foundingDateBn?: string;
  foundingLocationBn?: string;
  charterTitleBn?: string;
  charterStatementBn?: string;
  missionBn?: string;
  visionBn?: string;
  // 4 Core Pillars
  pillar1TitleBn?: string;
  pillar1DescBn?: string;
  pillar1StatBn?: string;
  pillar2TitleBn?: string;
  pillar2DescBn?: string;
  pillar2StatBn?: string;
  pillar3TitleBn?: string;
  pillar3DescBn?: string;
  pillar3StatBn?: string;
  pillar4TitleBn?: string;
  pillar4DescBn?: string;
  pillar4StatBn?: string;
  // Social & Footer
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  footerAboutBn?: string;
  footerCopyrightBn?: string;
  regNumberBn?: string;
  isPublished: boolean;
  lastPublishedAt?: string;
  lastPublishedBy?: string;
}

// AI Content Management & Chatbot Types
export type AIContentCategory = 'general' | 'committee' | 'activities' | 'faq' | 'links';

export interface AIKnowledgeItem {
  id: string;
  category: AIContentCategory;
  titleBn: string;
  titleEn: string;
  contentBn: string;
  contentEn: string;
  keywords: string[];
  targetSection?: string;
  linkTextBn?: string;
  linkTextEn?: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  links?: Array<{
    title: string;
    target: string;
    action?: 'scroll' | 'donate' | 'volunteer' | 'member-portal' | 'womens-team' | 'contact';
  }>;
  interactiveOptions?: string[];
}

export interface MapConfig {
  address: string; // Placeholder or verified address
  customEmbedUrl?: string; // Optional Google Maps embed or share URL
  landmarkBn?: string;
  landmarkEn?: string;
  phone?: string;
  directionsUrl?: string;
  updatedAt?: string;
}

// ==========================================
// 1. Public Message & Application System Types
// ==========================================
export type PublicApplicationType =
  | 'message'        // সাধারণ বার্তা / যোগাযোগ
  | 'complaint'      // অভিযোগ
  | 'feedback'       // পরামর্শ / মতামত
  | 'application'    // সাধারণ আবেদন
  | 'aid_request'    // মানবিক সাহায্য / ত্রাণ আবেদন
  | 'volunteer';     // স্বেচ্ছাসেবী / সদস্য আবেদন

export type PublicApplicationStatus =
  | 'pending'        // অপেক্ষমাণ
  | 'under_review'   // পর্যালোচনাধীন
  | 'in_progress'    // প্রক্রিয়াধীন
  | 'resolved'       // সমাধানকৃত / উত্তর দেওয়া হয়েছে
  | 'closed';        // সমাপ্ত

export interface PublicApplication {
  id: string;
  trackingId: string; // e.g. COLASH-APP-2026-78412
  category: PublicApplicationType;
  name: string;
  phone: string;
  email?: string;
  district?: string;
  subject: string;
  message: string;
  attachmentName?: string;
  createdAt: string;
  updatedAt: string;
  status: PublicApplicationStatus;
  adminReply?: string;
  repliedAt?: string;
  repliedBy?: string;
  internalNotes?: string;
}

// ==========================================
// 2. Three AI Options & Conversation History
// ==========================================
export type AIOptionType = 'main' | 'mens_style' | 'womens_style';

export interface AIConversationLog {
  id: string;
  aiType: AIOptionType;
  timestamp: string;
  userName?: string;
  userQuery: string;
  aiResponse: string;
  category?: string;
  optionsSelected?: Record<string, string>;
  status: 'resolved' | 'unanswered' | 'feedback_positive' | 'feedback_negative';
  satisfactionRating?: number; // 1 to 5
}

// Category Portal Key for Category-Based Navigation on Homepage
export type PortalCategoryKey =
  | 'home'
  | 'all'
  | 'about'
  | 'committee'
  | 'committee_history'
  | 'advisors'
  | 'members'
  | 'womens_team'
  | 'activities'
  | 'transparency'
  | 'notices'
  | 'emergency_notice'
  | 'applications'
  | 'notices_applications'
  | 'ai_tools'
  | 'member_login'
  | 'contact_location';
