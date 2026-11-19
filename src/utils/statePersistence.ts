import { PAYMENT_CHANNELS_STORAGE_KEY } from '../data/paymentChannels';

export type StateKey =
  | 'projects'
  | 'donations'
  | 'volunteers'
  | 'notices'
  | 'financialRecords'
  | 'paymentChannels'
  | 'publicApplications'
  | 'aiConversationLogs'
  | 'mapConfig'
  | 'websiteCustomConfig'
  | 'committeeTerms'
  | 'advisors'
  | 'generalMembers'
  | 'aiKnowledgeBase'
  | 'womensTeamConfig'
  | 'womensTeamMembers'
  | 'womensTeamActivities'
  | 'womensTeamDocuments'
  | 'womensTeamNotices'
  | 'adminUsers'
  | 'auditLogs';

export const STORAGE_KEY_MAP: Record<StateKey, string> = {
  projects: 'colash_projects',
  donations: 'colash_donations',
  volunteers: 'colash_volunteers',
  notices: 'colash_notices',
  financialRecords: 'colash_financial_records',
  paymentChannels: PAYMENT_CHANNELS_STORAGE_KEY,
  publicApplications: 'colash_public_applications',
  aiConversationLogs: 'colash_ai_logs',
  mapConfig: 'colash_map_config',
  websiteCustomConfig: 'colash_published_website_config',
  committeeTerms: 'colash_committee_terms',
  advisors: 'colash_advisors',
  generalMembers: 'colash_general_members',
  aiKnowledgeBase: 'colash_ai_knowledge',
  womensTeamConfig: 'colash_womens_team_config',
  womensTeamMembers: 'colash_womens_team_members',
  womensTeamActivities: 'colash_womens_team_activities',
  womensTeamDocuments: 'colash_womens_team_documents',
  womensTeamNotices: 'colash_womens_team_notices',
  adminUsers: 'colash_admin_users',
  auditLogs: 'colash_audit_logs',
};

export function loadLocalState<T>(key: StateKey, fallback: T): T {
  if (typeof window === 'undefined' || !window.localStorage) {
    return fallback;
  }
  try {
    const lsKey = STORAGE_KEY_MAP[key];
    let raw = window.localStorage.getItem(lsKey);
    if (!raw && key === 'projects') {
      raw = window.localStorage.getItem('colash_projects_v2');
    }
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}

export function hasLocalState(key: StateKey): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY_MAP[key]) !== null;
  } catch {
    return false;
  }
}

export function writeLocalStorageSafely(
  lsKey: string,
  value: unknown
): { ok: boolean; quotaExceeded: boolean } {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { ok: false, quotaExceeded: false };
  }
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  try {
    window.localStorage.setItem(lsKey, serialized);
    return { ok: true, quotaExceeded: false };
  } catch (err) {
    // Attempt cleanup of bulky log arrays in localStorage (full logs stay on server)
    try {
      const trimLogKey = (logKey: string, maxItems: number) => {
        const raw = window.localStorage.getItem(logKey);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > maxItems) {
          window.localStorage.setItem(logKey, JSON.stringify(parsed.slice(0, maxItems)));
        }
      };
      trimLogKey('colash_ai_logs', 30);
      trimLogKey('colash_audit_logs', 50);
      window.localStorage.setItem(lsKey, serialized);
      return { ok: true, quotaExceeded: false };
    } catch (retryErr) {
      console.warn(`LocalStorage write failed for "${lsKey}" (server sync still proceeds):`, retryErr || err);
      return { ok: false, quotaExceeded: true };
    }
  }
}

// Per-key serialized sync queue so rapid consecutive updates never race on disk
const pendingValues = new Map<StateKey, unknown>();
const inFlightKeys = new Set<StateKey>();

async function flushKeyToServer(key: StateKey): Promise<boolean> {
  if (inFlightKeys.has(key)) return true;
  if (!pendingValues.has(key)) return true;

  inFlightKeys.add(key);
  let lastOk = true;
  try {
    while (pendingValues.has(key)) {
      const value = pendingValues.get(key);
      pendingValues.delete(key);
      try {
        const res = await fetch(`/api/state/${encodeURIComponent(key)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value }),
        });
        if (!res.ok) {
          lastOk = false;
          console.warn(`Server state sync returned ${res.status} for key "${key}"`);
        }
      } catch (err) {
        lastOk = false;
        console.warn(`Server state sync network error for key "${key}":`, err);
      }
    }
  } finally {
    inFlightKeys.delete(key);
  }
  return lastOk;
}

export function persistState<T>(
  key: StateKey,
  value: T,
  options?: { syncServer?: boolean }
): { localOk: boolean; quotaExceeded: boolean; serverPromise: Promise<boolean> } {
  const lsKey = STORAGE_KEY_MAP[key];
  const localResult = writeLocalStorageSafely(lsKey, value);

  if (options?.syncServer === false) {
    return { localOk: localResult.ok, quotaExceeded: localResult.quotaExceeded, serverPromise: Promise.resolve(true) };
  }

  pendingValues.set(key, value);
  const serverPromise = flushKeyToServer(key);
  return { localOk: localResult.ok, quotaExceeded: localResult.quotaExceeded, serverPromise };
}

export async function syncBulkStateToServer(
  collections: Partial<Record<StateKey, unknown>>
): Promise<boolean> {
  try {
    const res = await fetch('/api/state/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collections }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Bulk server state sync failed:', err);
    return false;
  }
}

export async function fetchServerState(): Promise<
  Record<string, { value: unknown; updatedAt: number }> | null
> {
  try {
    const res = await fetch('/api/state', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.collections && typeof data.collections === 'object') {
      return data.collections;
    }
    return null;
  } catch (err) {
    console.warn('Failed to fetch persisted server state:', err);
    return null;
  }
}
