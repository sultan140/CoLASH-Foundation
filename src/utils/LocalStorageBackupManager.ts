/**
 * LocalStorageBackupManager
 *
 * Safeguard utility that collects, downloads, restores, and periodically prompts
 * the user to save a JSON snapshot of local CoLASH application state
 * (members, projects, audit & AI logs, donations, volunteers, committees, etc.).
 */

export interface BackupLiveStateOverrides {
  members?: unknown[];
  projects?: unknown[];
  auditLogs?: unknown[];
  aiLogs?: unknown[];
  donations?: unknown[];
  volunteers?: unknown[];
  committeeTerms?: unknown[];
  advisors?: unknown[];
  publicApplications?: unknown[];
  womensTeamMembers?: unknown[];
}

export interface LocalStorageBackupSnapshot {
  schemaVersion: string;
  app: string;
  createdAt: string;
  origin: string;
  summary: {
    membersCount: number;
    projectsCount: number;
    logsCount: number;
    donationsCount: number;
    volunteersCount: number;
    totalKeysCaptured: number;
  };
  data: {
    members: unknown[];
    projects: unknown[];
    logs: {
      auditLogs: unknown[];
      aiConversationLogs: unknown[];
    };
    donations: unknown[];
    volunteers: unknown[];
    committeeTerms: unknown[];
    advisors: unknown[];
    publicApplications: unknown[];
    womensTeamMembers: unknown[];
    rawLocalStorage: Record<string, unknown>;
  };
}

export interface BackupDownloadResult {
  filename: string;
  snapshot: LocalStorageBackupSnapshot;
}

const META_KEYS = {
  LAST_BACKUP_AT: 'colash_backup_last_downloaded_at',
  SNOOZE_UNTIL: 'colash_backup_snooze_until',
  FIRST_SEEN_AT: 'colash_backup_first_seen_at',
};

const DEFAULT_BACKUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
const DEFAULT_SNOOZE_MS = 4 * 60 * 60 * 1000; // 4 hours
const FIRST_PROMPT_GRACE_MS = 5 * 60 * 1000; // 5 minutes after first visit if never backed up

function safeParseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}

function getArrayFromStorage(key: string): unknown[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  const parsed = safeParseJson<unknown>(window.localStorage.getItem(key), []);
  return Array.isArray(parsed) ? parsed : [];
}

function collectAllColashLocalStorage(): Record<string, unknown> {
  const captured: Record<string, unknown> = {};
  if (typeof window === 'undefined' || !window.localStorage) return captured;

  try {
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (!key) continue;
      if (
        key.startsWith('colash_') &&
        key !== META_KEYS.LAST_BACKUP_AT &&
        key !== META_KEYS.SNOOZE_UNTIL &&
        key !== META_KEYS.FIRST_SEEN_AT
      ) {
        const rawValue = window.localStorage.getItem(key);
        captured[key] = safeParseJson<unknown>(rawValue, rawValue);
      }
    }
  } catch (err) {
    console.warn('LocalStorageBackupManager: error scanning localStorage', err);
  }

  return captured;
}

export const LocalStorageBackupManager = {
  DEFAULT_BACKUP_INTERVAL_MS,
  DEFAULT_SNOOZE_MS,
  META_KEYS,

  /**
   * Collects a structured JSON snapshot of application state (preferring live React
   * overrides when passed, falling back to persisted localStorage entries).
   */
  collectSnapshot(overrides?: BackupLiveStateOverrides): LocalStorageBackupSnapshot {
    const rawLocalStorage = collectAllColashLocalStorage();

    const members =
      overrides?.members ?? getArrayFromStorage('colash_general_members');
    const projects =
      overrides?.projects ??
      (() => {
        const v1 = getArrayFromStorage('colash_projects');
        return v1.length > 0 ? v1 : getArrayFromStorage('colash_projects_v2');
      })();
    const auditLogs =
      overrides?.auditLogs ?? getArrayFromStorage('colash_audit_logs');
    const aiConversationLogs =
      overrides?.aiLogs ?? getArrayFromStorage('colash_ai_logs');
    const donations =
      overrides?.donations ?? getArrayFromStorage('colash_donations');
    const volunteers =
      overrides?.volunteers ?? getArrayFromStorage('colash_volunteers');
    const committeeTerms =
      overrides?.committeeTerms ?? getArrayFromStorage('colash_committee_terms');
    const advisors =
      overrides?.advisors ?? getArrayFromStorage('colash_advisors');
    const publicApplications =
      overrides?.publicApplications ??
      getArrayFromStorage('colash_public_applications');
    const womensTeamMembers =
      overrides?.womensTeamMembers ??
      getArrayFromStorage('colash_womens_team_members');

    return {
      schemaVersion: '1.0',
      app: 'CoLASH Foundation Portal',
      createdAt: new Date().toISOString(),
      origin: typeof window !== 'undefined' ? window.location.origin : '',
      summary: {
        membersCount: members.length,
        projectsCount: projects.length,
        logsCount: auditLogs.length + aiConversationLogs.length,
        donationsCount: donations.length,
        volunteersCount: volunteers.length,
        totalKeysCaptured: Object.keys(rawLocalStorage).length,
      },
      data: {
        members,
        projects,
        logs: {
          auditLogs,
          aiConversationLogs,
        },
        donations,
        volunteers,
        committeeTerms,
        advisors,
        publicApplications,
        womensTeamMembers,
        rawLocalStorage,
      },
    };
  },

  /**
   * Serializes the snapshot to a pretty JSON file and triggers a browser download.
   */
  downloadSnapshotFile(overrides?: BackupLiveStateOverrides): BackupDownloadResult {
    const snapshot = this.collectSnapshot(overrides);
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
    const filename = `colash-backup-${stamp}.json`;

    const jsonString = JSON.stringify(snapshot, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    try {
      window.localStorage.setItem(META_KEYS.LAST_BACKUP_AT, String(Date.now()));
      window.localStorage.removeItem(META_KEYS.SNOOZE_UNTIL);
    } catch {
      // ignore storage write failure
    }

    return { filename, snapshot };
  },

  /**
   * Returns timestamp (ms) of the last completed JSON snapshot download, or null.
   */
  getLastBackupTimestamp(): number | null {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    try {
      const raw = window.localStorage.getItem(META_KEYS.LAST_BACKUP_AT);
      if (!raw) return null;
      const num = Number(raw);
      return Number.isFinite(num) && num > 0 ? num : null;
    } catch {
      return null;
    }
  },

  /**
   * Snoozes periodic backup prompt for the given duration (defaults to 4 hours).
   */
  snoozePrompt(durationMs: number = DEFAULT_SNOOZE_MS): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.setItem(META_KEYS.SNOOZE_UNTIL, String(Date.now() + durationMs));
    } catch {
      // ignore
    }
  },

  /**
   * Determines whether the periodic JSON backup safeguard prompt should be shown.
   */
  shouldPromptForBackup(intervalMs: number = DEFAULT_BACKUP_INTERVAL_MS): boolean {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    try {
      const now = Date.now();

      // Check active snooze window
      const snoozeRaw = window.localStorage.getItem(META_KEYS.SNOOZE_UNTIL);
      const snoozeUntil = snoozeRaw ? Number(snoozeRaw) : 0;
      if (Number.isFinite(snoozeUntil) && snoozeUntil > now) {
        return false;
      }

      const lastBackup = this.getLastBackupTimestamp();
      if (lastBackup !== null) {
        return now - lastBackup >= intervalMs;
      }

      // First-time safeguard: wait brief grace period after initial visit before prompting
      let firstSeenRaw = window.localStorage.getItem(META_KEYS.FIRST_SEEN_AT);
      if (!firstSeenRaw) {
        window.localStorage.setItem(META_KEYS.FIRST_SEEN_AT, String(now));
        return false;
      }
      const firstSeen = Number(firstSeenRaw);
      if (!Number.isFinite(firstSeen)) {
        window.localStorage.setItem(META_KEYS.FIRST_SEEN_AT, String(now));
        return false;
      }

      return now - firstSeen >= FIRST_PROMPT_GRACE_MS;
    } catch {
      return false;
    }
  },

  /**
   * Starts a periodic check scheduler. Fires `onPromptDue()` whenever a backup
   * reminder is due. Returns a cleanup function.
   */
  startPeriodicScheduler(
    onPromptDue: () => void,
    options?: {
      intervalMs?: number;
      checkEveryMs?: number;
    }
  ): () => void {
    if (typeof window === 'undefined') return () => {};

    const intervalMs = options?.intervalMs ?? DEFAULT_BACKUP_INTERVAL_MS;
    const checkEveryMs = options?.checkEveryMs ?? 30 * 1000;

    const evaluate = () => {
      if (this.shouldPromptForBackup(intervalMs)) {
        onPromptDue();
      }
    };

    const initialTimer = window.setTimeout(evaluate, 2500);
    const periodicTimer = window.setInterval(evaluate, checkEveryMs);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(periodicTimer);
    };
  },

  /**
   * Validates and restores a previously exported JSON snapshot into localStorage.
   */
  restoreFromJsonString(jsonText: string): {
    restoredKeys: number;
    snapshot: LocalStorageBackupSnapshot;
  } {
    const parsed = JSON.parse(jsonText) as LocalStorageBackupSnapshot;
    if (!parsed || typeof parsed !== 'object' || !parsed.data) {
      throw new Error('Invalid CoLASH backup file format.');
    }

    let restoredKeys = 0;
    const setSafe = (key: string, val: unknown) => {
      if (val !== undefined && val !== null) {
        window.localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
        restoredKeys += 1;
      }
    };

    if (parsed.data.rawLocalStorage && typeof parsed.data.rawLocalStorage === 'object') {
      Object.entries(parsed.data.rawLocalStorage).forEach(([k, v]) => {
        if (k.startsWith('colash_')) {
          setSafe(k, v);
        }
      });
    }

    if (Array.isArray(parsed.data.members) && parsed.data.members.length > 0) {
      setSafe('colash_general_members', parsed.data.members);
    }
    if (Array.isArray(parsed.data.projects) && parsed.data.projects.length > 0) {
      setSafe('colash_projects', parsed.data.projects);
    }
    if (parsed.data.logs) {
      if (Array.isArray(parsed.data.logs.auditLogs)) {
        setSafe('colash_audit_logs', parsed.data.logs.auditLogs);
      }
      if (Array.isArray(parsed.data.logs.aiConversationLogs)) {
        setSafe('colash_ai_logs', parsed.data.logs.aiConversationLogs);
      }
    }

    return { restoredKeys, snapshot: parsed };
  },
};
