import React from 'react';
import { Download, ShieldCheck, Clock, X, Database } from 'lucide-react';
import { Language } from '../../types';
import { LocalStorageBackupSnapshot } from '../../utils/LocalStorageBackupManager';

interface BackupPromptBannerProps {
  isOpen: boolean;
  language: Language;
  snapshotPreview: LocalStorageBackupSnapshot;
  lastBackupTimestamp: number | null;
  onDownloadNow: () => void;
  onSnooze: () => void;
  onDismiss: () => void;
}

export const BackupPromptBanner: React.FC<BackupPromptBannerProps> = ({
  isOpen,
  language,
  snapshotPreview,
  lastBackupTimestamp,
  onDownloadNow,
  onSnooze,
  onDismiss,
}) => {
  if (!isOpen) return null;

  const { membersCount, projectsCount, logsCount } = snapshotPreview.summary;
  const lastBackupText = lastBackupTimestamp
    ? new Date(lastBackupTimestamp).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : language === 'bn'
      ? 'এখনো নেওয়া হয়নি'
      : 'Never backed up';

  return (
    <div
      role="region"
      aria-label={language === 'bn' ? 'ডাটা ব্যাকআপ রিমাইন্ডার' : 'Data backup reminder'}
      className="no-print fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-40 w-[calc(100vw-2rem)] sm:w-[360px] bg-white dark:bg-[#0c1a24] rounded-2xl border border-[#167D78]/40 dark:border-teal-700/60 shadow-2xl overflow-hidden transition-all duration-300"
    >
      {/* Accent Header */}
      <div className="px-4 py-2.5 bg-gradient-to-r from-[#102B3F] to-[#167D78] text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center text-[#D6F36A]">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold leading-tight">
              {language === 'bn' ? 'নিরাপদ JSON ব্যাকআপ রিমাইন্ডার' : 'Safeguard State Backup'}
            </h4>
            <p className="text-[10px] text-stone-200">
              {language === 'bn' ? 'লোকাল ডাটা সুরক্ষিত রাখুন' : 'Periodic LocalStorage Snapshot'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label={language === 'bn' ? 'বন্ধ করুন' : 'Dismiss'}
          className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3 text-xs">
        <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
          {language === 'bn'
            ? 'আপনার ব্রাউজারে সংরক্ষিত সদস্য তালিকা, প্রকল্প ও অডিট লগের একটি নিরাপদ JSON কপি সংরক্ষণ করে রাখুন।'
            : 'Download a verified JSON snapshot of your current members, projects, and activity logs as a local safeguard.'}
        </p>

        {/* Snapshot Counts */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
            <span className="block font-extrabold text-sm text-[#102B3F] dark:text-white tabular-nums">
              {membersCount}
            </span>
            <span className="text-[10px] text-stone-500">
              {language === 'bn' ? 'সদস্য' : 'Members'}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
            <span className="block font-extrabold text-sm text-[#167D78] dark:text-[#D6F36A] tabular-nums">
              {projectsCount}
            </span>
            <span className="text-[10px] text-stone-500">
              {language === 'bn' ? 'প্রকল্প' : 'Projects'}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
            <span className="block font-extrabold text-sm text-amber-600 dark:text-amber-400 tabular-nums">
              {logsCount}
            </span>
            <span className="text-[10px] text-stone-500">
              {language === 'bn' ? 'লগ' : 'Logs'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-stone-500 dark:text-stone-400 pt-0.5">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{language === 'bn' ? 'সর্বশেষ ব্যাকআপ:' : 'Last backup:'}</span>
          </span>
          <span className="font-mono">{lastBackupText}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onDownloadNow}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#167D78] hover:bg-[#102B3F] text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#D6F36A]" />
            <span>{language === 'bn' ? 'JSON ডাউনলোড করুন' : 'Download JSON'}</span>
          </button>
          <button
            type="button"
            onClick={onSnooze}
            className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-semibold text-xs transition-colors cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'পরে' : 'Later'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
