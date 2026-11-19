import {
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import {
  db,
  auth,
  FIREBASE_PROJECT_ID,
  FIRESTORE_DATABASE_ID,
  isSuperAdminEmail,
  OperationType,
  handleFirestoreError,
} from '../firebase';

export const FIRESTORE_CONSOLE_DATA_URL = `https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/firestore/databases/${FIRESTORE_DATABASE_ID}/data`;
import type {
  AdminUser,
  Donation,
  GeneralMember,
  PublicApplication,
  WomensTeamConfig,
  WomensTeamActivity,
  WomensTeamNotice,
} from '../types';
import type { StateKey } from './statePersistence';

export const PUBLIC_SECTION_IDS = [
  'websiteCustomConfig',
  'mapConfig',
  'paymentChannels',
  'aiKnowledgeBase',
  'projects',
  'notices',
  'committeeTerms',
  'advisors',
  'financialRecords',
  'publicMembers',
  'publicDonations',
  'womensPublic',
] as const;

export type PublicSectionId = (typeof PUBLIC_SECTION_IDS)[number];

export const ADMIN_VAULT_SECTION_IDS = [
  'adminUsers',
  'auditLogs',
  'aiConversationLogs',
  'womensTeamMembers',
  'womensTeamDocuments',
  'generalMembersPrivate',
  'donationsFull',
  'volunteersFull',
  'publicApplicationsFull',
] as const;

export type AdminVaultSectionId = (typeof ADMIN_VAULT_SECTION_IDS)[number];

const MAX_FIRESTORE_PAYLOAD_BYTES = 860_000;

export function stripUndefinedDeep<T>(input: T): T {
  if (Array.isArray(input)) {
    return input
      .filter((item) => item !== undefined)
      .map((item) => stripUndefinedDeep(item)) as unknown as T;
  }
  if (input !== null && typeof input === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      if (v !== undefined) {
        out[k] = stripUndefinedDeep(v);
      }
    }
    return out as T;
  }
  return input;
}

function wrapPayloadForFirestore(rawValue: unknown): Record<string, unknown> {
  const cleaned = stripUndefinedDeep(rawValue);
  let payload: Record<string, unknown> =
    cleaned === undefined
      ? { value: null }
      : Array.isArray(cleaned)
      ? { items: cleaned }
      : cleaned !== null && typeof cleaned === 'object'
      ? (cleaned as Record<string, unknown>)
      : { value: cleaned };

  // Enforce volumetric bounds (< 1MB Firestore document limit)
  try {
    let serialized = JSON.stringify(payload);
    if (serialized.length > MAX_FIRESTORE_PAYLOAD_BYTES && Array.isArray(payload.items)) {
      // Trim oldest items from large arrays (e.g. logs) to stay safely under 1MB
      let items = [...(payload.items as unknown[])];
      while (items.length > 10 && JSON.stringify({ items }).length > MAX_FIRESTORE_PAYLOAD_BYTES) {
        items = items.slice(0, Math.max(10, Math.floor(items.length * 0.75)));
      }
      payload = { items };
      serialized = JSON.stringify(payload);
    }
    if (serialized.length > MAX_FIRESTORE_PAYLOAD_BYTES) {
      // Fallback: strip any giant inline base64 blobs (> 200KB) inside nested objects
      const compact = JSON.parse(serialized, (_k, val) => {
        if (typeof val === 'string' && val.startsWith('data:image/') && val.length > 200_000) {
          return '';
        }
        return val;
      });
      payload = compact;
    }
  } catch {
    // Keep cleaned payload if stringify fails
  }

  return payload;
}

function unwrapFirestorePayload(payload: unknown): unknown {
  if (!payload || typeof payload !== 'object') return payload;
  const obj = payload as Record<string, unknown>;
  if (Array.isArray(obj.items) && Object.keys(obj).length === 1) {
    return obj.items;
  }
  if ('value' in obj && Object.keys(obj).length === 1) {
    return obj.value;
  }
  return obj;
}

// Strip sensitive PII from public member directory before storing in public_content
export function toPublicMembersPayload(members: GeneralMember[]) {
  if (!Array.isArray(members)) return [];
  return members.map((m) => ({
    id: m.id,
    membershipId: m.membershipId,
    nameBn: m.nameBn,
    nameEn: m.nameEn,
    roleBn: m.roleBn,
    roleEn: m.roleEn,
    bloodGroup: m.bloodGroup,
    district: m.district,
    status: m.status,
    joinedDate: m.joinedDate,
    avatar: m.avatar || '',
    joiningYear: m.joiningYear,
    serviceYears: m.serviceYears,
    currentDesignationBn: m.currentDesignationBn,
    currentDesignationEn: m.currentDesignationEn,
    previousPositions: m.previousPositions || [],
    approvalStatus: m.approvalStatus || 'approved',
    verificationStatus: m.verificationStatus || 'verified',
    birthMonth: m.birthMonth,
    birthDay: m.birthDay,
  }));
}

// Strip donor phone, email, and transactionId before storing in public_content
export function toPublicDonationsPayload(donations: Donation[]) {
  if (!Array.isArray(donations)) return [];
  return donations.map((d) => ({
    id: d.id,
    receiptNumber: d.receiptNumber,
    donorName: d.isAnonymous ? 'বেনামী দাতা (Anonymous)' : d.donorName,
    donorEmail: '',
    donorPhone: '',
    amount: d.amount,
    purpose: d.purpose,
    purposeNameBn: d.purposeNameBn,
    purposeNameEn: d.purposeNameEn,
    paymentMethod: d.paymentMethod,
    transactionId: '***',
    date: d.date,
    isVerified: d.isVerified,
    isAnonymous: d.isAnonymous,
  }));
}

export async function ensureAdminRoleDocument(user: User): Promise<boolean> {
  if (!user.emailVerified || !user.email) return false;
  const email = user.email.toLowerCase();
  const path = `admins/${user.uid}`;

  try {
    const adminSnap = await getDoc(doc(db, 'admins', user.uid));
    if (adminSnap.exists()) {
      return true;
    }

    if (isSuperAdminEmail(email)) {
      await setDoc(doc(db, 'admins', user.uid), {
        uid: user.uid,
        email,
        role: 'super_admin',
        createdAt: serverTimestamp(),
      });
      return true;
    }

    // Check if invited as a Co-Admin
    const inviteSnap = await getDoc(doc(db, 'admin_invites', email));
    if (inviteSnap.exists()) {
      await setDoc(doc(db, 'admins', user.uid), {
        uid: user.uid,
        email,
        role: 'co_admin',
        createdAt: serverTimestamp(),
      });
      return true;
    }
    return false;
  } catch (err) {
    // Non-admins querying admin_invites or admins may simply not have admin access
    console.warn(`Admin verification check skipped for ${path}:`, err);
    return isSuperAdminEmail(email) && user.emailVerified;
  }
}

export async function syncAdminInvitesToFirestore(adminUsers: AdminUser[]): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified || !isSuperAdminEmail(user.email)) {
    return;
  }
  for (const adm of adminUsers) {
    const email = adm.email?.trim().toLowerCase();
    if (!email || isSuperAdminEmail(email) || !adm.isActive) continue;
    const path = `admin_invites/${email}`;
    try {
      await setDoc(doc(db, 'admin_invites', email), {
        email,
        role: 'co_admin',
        invitedByUid: user.uid,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }
}

export interface FetchedFirestoreState {
  publicState: Partial<Record<StateKey, unknown>>;
  foundPublicCount: number;
  presentPublicIds: PublicSectionId[];
  missingPublicIds: PublicSectionId[];
}

export async function fetchPublicContentFromFirestore(): Promise<FetchedFirestoreState> {
  const publicState: Partial<Record<StateKey, unknown>> = {};
  const presentPublicIds: PublicSectionId[] = [];
  const missingPublicIds: PublicSectionId[] = [];

  await Promise.all(
    PUBLIC_SECTION_IDS.map(async (sectionId) => {
      const ref = doc(db, 'public_content', sectionId);
      try {
        let snap;
        try {
          snap = await getDocFromServer(ref);
        } catch {
          snap = await getDoc(ref);
        }
        if (!snap.exists()) {
          missingPublicIds.push(sectionId);
          return;
        }
        const data = snap.data();
        if (!data || data.payload === undefined) {
          missingPublicIds.push(sectionId);
          return;
        }
        const unwrapped = unwrapFirestorePayload(data.payload);
        presentPublicIds.push(sectionId);

        if (sectionId === 'publicMembers') {
          publicState.generalMembers = unwrapped;
        } else if (sectionId === 'publicDonations') {
          publicState.donations = unwrapped;
        } else if (sectionId === 'womensPublic' && unwrapped && typeof unwrapped === 'object') {
          const w = unwrapped as {
            womensTeamConfig?: WomensTeamConfig;
            womensTeamActivities?: WomensTeamActivity[];
            womensTeamNotices?: WomensTeamNotice[];
          };
          if (w.womensTeamConfig) publicState.womensTeamConfig = w.womensTeamConfig;
          if (w.womensTeamActivities) publicState.womensTeamActivities = w.womensTeamActivities;
          if (w.womensTeamNotices) publicState.womensTeamNotices = w.womensTeamNotices;
        } else {
          publicState[sectionId as StateKey] = unwrapped;
        }
      } catch (err) {
        missingPublicIds.push(sectionId);
        console.warn(`Failed reading public_content/${sectionId}:`, err);
      }
    })
  );

  return {
    publicState,
    foundPublicCount: presentPublicIds.length,
    presentPublicIds,
    missingPublicIds,
  };
}

export interface FetchedAdminVaultState {
  adminState: Partial<Record<StateKey, unknown>>;
  foundVaultCount: number;
  presentVaultIds: AdminVaultSectionId[];
  missingVaultIds: AdminVaultSectionId[];
}

export async function fetchAdminVaultFromFirestore(): Promise<FetchedAdminVaultState> {
  const adminState: Partial<Record<StateKey, unknown>> = {};
  const presentVaultIds: AdminVaultSectionId[] = [];
  const missingVaultIds: AdminVaultSectionId[] = [];

  await Promise.all(
    ADMIN_VAULT_SECTION_IDS.map(async (sectionId) => {
      const ref = doc(db, 'admin_vault', sectionId);
      try {
        let snap;
        try {
          snap = await getDocFromServer(ref);
        } catch {
          snap = await getDoc(ref);
        }
        if (!snap.exists()) {
          missingVaultIds.push(sectionId);
          return;
        }
        const data = snap.data();
        if (!data || data.payload === undefined) {
          missingVaultIds.push(sectionId);
          return;
        }
        const unwrapped = unwrapFirestorePayload(data.payload);
        presentVaultIds.push(sectionId);

        if (sectionId === 'generalMembersPrivate') {
          adminState.generalMembers = unwrapped;
        } else if (sectionId === 'donationsFull') {
          adminState.donations = unwrapped;
        } else if (sectionId === 'volunteersFull') {
          adminState.volunteers = unwrapped;
        } else if (sectionId === 'publicApplicationsFull') {
          adminState.publicApplications = unwrapped;
        } else {
          adminState[sectionId as StateKey] = unwrapped;
        }
      } catch (error) {
        missingVaultIds.push(sectionId);
        console.warn(`Failed reading admin_vault/${sectionId}:`, error);
      }
    })
  );

  return {
    adminState,
    foundVaultCount: presentVaultIds.length,
    presentVaultIds,
    missingVaultIds,
  };
}

export interface FirestoreCloudInventory {
  projectId: string;
  databaseId: string;
  consoleUrl: string;
  publicFound: number;
  publicTotal: number;
  missingPublicIds: PublicSectionId[];
  vaultFound: number;
  vaultTotal: number;
  missingVaultIds: AdminVaultSectionId[];
  checkedAt: number;
}

export async function fetchCloudInventorySummary(
  includeVault: boolean
): Promise<FirestoreCloudInventory> {
  const pubRes = await fetchPublicContentFromFirestore();
  const vaultRes = includeVault
    ? await fetchAdminVaultFromFirestore()
    : {
        adminState: {},
        foundVaultCount: 0,
        presentVaultIds: [] as AdminVaultSectionId[],
        missingVaultIds: [...ADMIN_VAULT_SECTION_IDS],
      };

  return {
    projectId: FIREBASE_PROJECT_ID,
    databaseId: FIRESTORE_DATABASE_ID,
    consoleUrl: FIRESTORE_CONSOLE_DATA_URL,
    publicFound: pubRes.foundPublicCount,
    publicTotal: PUBLIC_SECTION_IDS.length,
    missingPublicIds: pubRes.missingPublicIds,
    vaultFound: vaultRes.foundVaultCount,
    vaultTotal: ADMIN_VAULT_SECTION_IDS.length,
    missingVaultIds: vaultRes.missingVaultIds,
    checkedAt: Date.now(),
  };
}

export function subscribeAuthenticatedFirestore(
  user: User,
  isAdmin: boolean,
  onSectionUpdate: (key: StateKey, value: unknown) => void
): Unsubscribe {
  const unsubscribers: Unsubscribe[] = [];

  if (!user) {
    return () => {};
  }

  for (const sectionId of PUBLIC_SECTION_IDS) {
    const path = `public_content/${sectionId}`;
    const unsub = onSnapshot(
      doc(db, 'public_content', sectionId),
      (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        if (!data || data.payload === undefined) return;
        const unwrapped = unwrapFirestorePayload(data.payload);

        if (sectionId === 'publicMembers') {
          // If admin vault is active, admin_vault/generalMembersPrivate overrides with full PII
          if (!isAdmin) onSectionUpdate('generalMembers', unwrapped);
        } else if (sectionId === 'publicDonations') {
          if (!isAdmin) onSectionUpdate('donations', unwrapped);
        } else if (sectionId === 'womensPublic' && unwrapped && typeof unwrapped === 'object') {
          const w = unwrapped as {
            womensTeamConfig?: WomensTeamConfig;
            womensTeamActivities?: WomensTeamActivity[];
            womensTeamNotices?: WomensTeamNotice[];
          };
          if (w.womensTeamConfig) onSectionUpdate('womensTeamConfig', w.womensTeamConfig);
          if (w.womensTeamActivities) onSectionUpdate('womensTeamActivities', w.womensTeamActivities);
          if (w.womensTeamNotices) onSectionUpdate('womensTeamNotices', w.womensTeamNotices);
        } else {
          onSectionUpdate(sectionId as StateKey, unwrapped);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
    unsubscribers.push(unsub);
  }

  if (isAdmin) {
    for (const sectionId of ADMIN_VAULT_SECTION_IDS) {
      const path = `admin_vault/${sectionId}`;
      const unsub = onSnapshot(
        doc(db, 'admin_vault', sectionId),
        (snap) => {
          if (!snap.exists()) return;
          const data = snap.data();
          if (!data || data.payload === undefined) return;
          const unwrapped = unwrapFirestorePayload(data.payload);

          if (sectionId === 'generalMembersPrivate') {
            onSectionUpdate('generalMembers', unwrapped);
          } else if (sectionId === 'donationsFull') {
            onSectionUpdate('donations', unwrapped);
          } else if (sectionId === 'volunteersFull') {
            onSectionUpdate('volunteers', unwrapped);
          } else if (sectionId === 'publicApplicationsFull') {
            onSectionUpdate('publicApplications', unwrapped);
          } else {
            onSectionUpdate(sectionId as StateKey, unwrapped);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
        }
      );
      unsubscribers.push(unsub);
    }
  }

  return () => {
    for (const unsub of unsubscribers) {
      unsub();
    }
  };
}

// Keep latest womensPublic parts combined when any of the 3 womens public keys updates
let cachedWomensPublic: {
  womensTeamConfig?: unknown;
  womensTeamActivities?: unknown;
  womensTeamNotices?: unknown;
} = {};

export function primeWomensPublicCache(parts: Partial<typeof cachedWomensPublic>) {
  cachedWomensPublic = { ...cachedWomensPublic, ...parts };
}

async function writePublicSectionDoc(
  sectionId: PublicSectionId,
  rawValue: unknown,
  explicitUser?: User | null
): Promise<void> {
  const user = explicitUser || auth.currentUser;
  if (!user || !user.emailVerified) {
    throw new Error('Verified Google admin session required before writing to public_content');
  }
  const path = `public_content/${sectionId}`;
  try {
    await setDoc(doc(db, 'public_content', sectionId), {
      sectionId,
      visibility: 'public',
      payload: wrapPayloadForFirestore(rawValue),
      updatedByUid: user.uid,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

async function writeAdminVaultDoc(
  sectionId: AdminVaultSectionId,
  rawValue: unknown,
  explicitUser?: User | null
): Promise<void> {
  const user = explicitUser || auth.currentUser;
  if (!user || !user.emailVerified) {
    throw new Error('Verified Google admin session required before writing to admin_vault');
  }
  const path = `admin_vault/${sectionId}`;
  try {
    await setDoc(doc(db, 'admin_vault', sectionId), {
      sectionId,
      visibility: 'admin_only',
      payload: wrapPayloadForFirestore(rawValue),
      updatedByUid: user.uid,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveStateKeyToFirestore(
  key: StateKey,
  value: unknown,
  explicitUser?: User | null
): Promise<boolean> {
  const user = explicitUser || auth.currentUser;
  if (!user || !user.emailVerified) return false;

  switch (key) {
    case 'websiteCustomConfig':
    case 'mapConfig':
    case 'paymentChannels':
    case 'aiKnowledgeBase':
    case 'projects':
    case 'notices':
    case 'committeeTerms':
    case 'advisors':
    case 'financialRecords':
      await writePublicSectionDoc(key, value, user);
      return true;

    case 'generalMembers': {
      const members = Array.isArray(value) ? (value as GeneralMember[]) : [];
      await Promise.all([
        writePublicSectionDoc('publicMembers', toPublicMembersPayload(members), user),
        writeAdminVaultDoc('generalMembersPrivate', members, user),
      ]);
      return true;
    }

    case 'donations': {
      const donations = Array.isArray(value) ? (value as Donation[]) : [];
      await Promise.all([
        writePublicSectionDoc('publicDonations', toPublicDonationsPayload(donations), user),
        writeAdminVaultDoc('donationsFull', donations, user),
      ]);
      return true;
    }

    case 'womensTeamConfig':
    case 'womensTeamActivities':
    case 'womensTeamNotices': {
      cachedWomensPublic = { ...cachedWomensPublic, [key]: value };
      await writePublicSectionDoc('womensPublic', cachedWomensPublic, user);
      return true;
    }

    case 'volunteers':
      await writeAdminVaultDoc('volunteersFull', value, user);
      return true;

    case 'publicApplications':
      await writeAdminVaultDoc('publicApplicationsFull', value, user);
      return true;

    case 'adminUsers':
      await writeAdminVaultDoc('adminUsers', value, user);
      if (Array.isArray(value)) {
        try {
          await syncAdminInvitesToFirestore(value as AdminUser[]);
        } catch (inviteErr) {
          console.warn('Co-admin invite sync warning:', inviteErr);
        }
      }
      return true;

    case 'auditLogs':
    case 'aiConversationLogs':
    case 'womensTeamMembers':
    case 'womensTeamDocuments':
      await writeAdminVaultDoc(key, value, user);
      return true;

    default:
      return false;
  }
}

export interface BulkSyncResult {
  ok: boolean;
  writtenCount: number;
  failedKeys: string[];
  errorMessage?: string;
}

let inFlightBulkSync: Promise<BulkSyncResult> | null = null;

export async function syncBulkCollectionsDetailed(
  collections: Partial<Record<StateKey, unknown>>,
  explicitUser?: User | null
): Promise<BulkSyncResult> {
  const execute = async (): Promise<BulkSyncResult> => {
    const user = explicitUser || auth.currentUser;
    if (!user || !user.emailVerified) {
      return {
        ok: false,
        writtenCount: 0,
        failedKeys: Object.keys(collections),
        errorMessage: 'Verified Google Admin sign-in is required to sync to Firestore.',
      };
    }

    const adminVerified = await ensureAdminRoleDocument(user);
    if (!adminVerified) {
      return {
        ok: false,
        writtenCount: 0,
        failedKeys: Object.keys(collections),
        errorMessage: `Account (${user.email}) is not registered in Firestore admins.`,
      };
    }

    if (
      'womensTeamConfig' in collections ||
      'womensTeamActivities' in collections ||
      'womensTeamNotices' in collections
    ) {
      primeWomensPublicCache({
        ...('womensTeamConfig' in collections ? { womensTeamConfig: collections.womensTeamConfig } : {}),
        ...('womensTeamActivities' in collections
          ? { womensTeamActivities: collections.womensTeamActivities }
          : {}),
        ...('womensTeamNotices' in collections ? { womensTeamNotices: collections.womensTeamNotices } : {}),
      });
    }

    const entries = Object.entries(collections) as [StateKey, unknown][];
    let wroteWomensPublic = false;
    let writtenCount = 0;
    const failedKeys: string[] = [];
    let firstErrorMessage: string | undefined;

    for (const [key, value] of entries) {
      if (
        key === 'womensTeamConfig' ||
        key === 'womensTeamActivities' ||
        key === 'womensTeamNotices'
      ) {
        if (!wroteWomensPublic) {
          wroteWomensPublic = true;
          try {
            const ok = await saveStateKeyToFirestore(key, value, user);
            if (ok) writtenCount += 1;
          } catch (err) {
            failedKeys.push('womensPublic');
            if (!firstErrorMessage) {
              firstErrorMessage = err instanceof Error ? err.message : String(err);
            }
          }
        }
        continue;
      }

      try {
        const ok = await saveStateKeyToFirestore(key, value, user);
        if (ok) writtenCount += 1;
      } catch (err) {
        failedKeys.push(key);
        if (!firstErrorMessage) {
          firstErrorMessage = err instanceof Error ? err.message : String(err);
        }
      }
    }

    return {
      ok: failedKeys.length === 0 && writtenCount > 0,
      writtenCount,
      failedKeys,
      errorMessage: firstErrorMessage,
    };
  };

  // Serialize consecutive bulk sync runs so overlapping triggers never collide
  const prev = inFlightBulkSync;
  const current = (prev ? prev.catch(() => null).then(() => execute()) : execute()).finally(() => {
    if (inFlightBulkSync === current) {
      inFlightBulkSync = null;
    }
  });
  inFlightBulkSync = current;
  return current;
}

export async function syncBulkCollectionsToFirestore(
  collections: Partial<Record<StateKey, unknown>>,
  explicitUser?: User | null
): Promise<boolean> {
  const result = await syncBulkCollectionsDetailed(collections, explicitUser);
  return result.ok;
}

export async function saveAuthenticatedMemberProfileToFirestore(
  user: User,
  member: Partial<GeneralMember>
): Promise<void> {
  if (!user.emailVerified) return;
  const displayName = (member.nameBn || member.nameEn || user.displayName || 'CoLASH Member').slice(0, 120);
  const membershipId = (member.membershipId || '').slice(0, 64);

  const accountPath = `users/${user.uid}`;
  try {
    const existingAccount = await getDoc(doc(db, 'users', user.uid));
    const createdAt = existingAccount.exists()
      ? existingAccount.data()?.createdAt || serverTimestamp()
      : serverTimestamp();
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      displayName,
      role: 'member',
      ...(membershipId ? { membershipId } : {}),
      createdAt,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, accountPath);
  }

  const privatePath = `users/${user.uid}/private/info`;
  try {
    await setDoc(doc(db, 'users', user.uid, 'private', 'info'), {
      uid: user.uid,
      email: (member.email || user.email || '').slice(0, 200),
      ...(member.phone ? { phone: member.phone.slice(0, 32) } : {}),
      ...(member.address ? { address: member.address.slice(0, 300) } : {}),
      ...(member.district ? { district: member.district.slice(0, 80) } : {}),
      ...(member.bloodGroup ? { bloodGroup: member.bloodGroup.slice(0, 16) } : {}),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, privatePath);
  }
}

export async function submitDonationRecordToFirestore(
  user: User,
  donation: Donation
): Promise<void> {
  if (!user.emailVerified) return;
  const safeId = donation.id.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 120) || `don-${Date.now()}`;
  const path = `donations/${safeId}`;
  try {
    await setDoc(doc(db, 'donations', safeId), {
      id: safeId,
      ownerUid: user.uid,
      receiptNumber: (donation.receiptNumber || `COL-${Date.now()}`).slice(0, 64),
      donorName: (donation.donorName || 'Donor').slice(0, 120),
      ...(donation.donorEmail ? { donorEmail: donation.donorEmail.slice(0, 200) } : {}),
      ...(donation.donorPhone ? { donorPhone: donation.donorPhone.slice(0, 32) } : {}),
      amount: Number(donation.amount) > 0 ? Number(donation.amount) : 100,
      purpose: (donation.purpose || 'general').slice(0, 64),
      paymentMethod: donation.paymentMethod || 'bkash',
      transactionId: (donation.transactionId || 'TRX').slice(0, 100),
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function submitPublicApplicationToFirestore(
  user: User,
  appItem: PublicApplication
): Promise<void> {
  if (!user.emailVerified) return;
  const safeId = appItem.id.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 120) || `app-${Date.now()}`;
  const path = `applications/${safeId}`;
  try {
    await setDoc(doc(db, 'applications', safeId), {
      id: safeId,
      ownerUid: user.uid,
      trackingId: (appItem.trackingId || `TRK-${Date.now()}`).slice(0, 64),
      applicantName: (appItem.name || 'Applicant').slice(0, 120),
      phone: (appItem.phone || '01700000000').slice(0, 32),
      category: (appItem.category || 'aid_request').slice(0, 64),
      details: (`${appItem.subject ? appItem.subject + ': ' : ''}${appItem.message || 'Application details'}`).slice(0, 2000),
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}
