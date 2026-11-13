import React from 'react';
import { Target, Users, Heart, TrendingUp } from 'lucide-react';
import { Language, Project } from '../../types';
import { AnimatedProgressBar } from './AnimatedProgressBar';

interface DonationGoalProgressProps {
  language: Language;
  projects: Project[];
  selectedProjectId?: string;
  pendingContribution?: number;
  mode?: 'campaign' | 'compact';
  onDonateClick?: () => void;
}

export const DonationGoalProgress: React.FC<DonationGoalProgressProps> = ({
  language,
  projects,
  selectedProjectId = 'general',
  pendingContribution = 0,
  mode = 'campaign',
  onDonateClick,
}) => {
  const formatCurrency = (val: number) => `৳${Math.round(val).toLocaleString('en-IN')}`;

  // Calculate goal stats either for a single selected project or the combined 2026 campaign
  const targetProject =
    selectedProjectId !== 'general'
      ? projects.find((p) => p.id === selectedProjectId)
      : undefined;

  const currentRaised = targetProject
    ? targetProject.raisedAmount
    : projects.reduce((sum, p) => sum + (p.raisedAmount || 0), 0);

  const totalTarget = targetProject
    ? targetProject.targetAmount
    : projects.reduce((sum, p) => sum + (p.targetAmount || 0), 0);

  const totalDonors = targetProject
    ? targetProject.donorsCount
    : projects.reduce((sum, p) => sum + (p.donorsCount || 0), 0);

  const safeTarget = Math.max(1, totalTarget);
  const currentPercent = Math.min(100, Math.round((currentRaised / safeTarget) * 100));
  const projectedRaised = currentRaised + Math.max(0, pendingContribution || 0);
  const projectedPercent = Math.min(100, Math.round((projectedRaised / safeTarget) * 100));
  const projectedDeltaPercent = Math.max(0, projectedPercent - currentPercent);
  const remainingAmount = Math.max(0, totalTarget - currentRaised);

  if (mode === 'compact') {
    return (
      <div className="p-3.5 rounded-xl bg-gradient-to-br from-teal-50/80 to-stone-50 dark:from-[#0e2634] dark:to-stone-900/70 border border-[#167D78]/25 dark:border-[#167D78]/40 space-y-2">
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-[#102B3F] dark:text-white">
            <Target className="w-3.5 h-3.5 text-[#167D78] dark:text-[#D6F36A]" />
            <span>
              {targetProject
                ? language === 'bn' ? 'নির্বাচিত প্রকল্পের ফান্ড অগ্রগতি' : 'Selected Project Goal Progress'
                : language === 'bn' ? 'সমন্বিত ২০২৬ অনুদান লক্ষ্যমাত্রা' : 'Combined 2026 Fund Goal Progress'}
            </span>
          </div>
          <span className="font-mono font-extrabold text-[#167D78] dark:text-[#D6F36A] tabular-nums">
            {currentPercent}%
            {pendingContribution > 0 && projectedPercent > currentPercent && (
              <span className="text-emerald-600 dark:text-lime-300 ml-1">
                → {projectedPercent}%
              </span>
            )}
          </span>
        </div>

        {/* Stacked Progress Bar (Current + Live Pending Contribution Preview) */}
        <AnimatedProgressBar
          targetPercent={currentPercent}
          previewDeltaPercent={projectedDeltaPercent}
          trackClassName="w-full h-2.5 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden flex"
          fillClassName="h-full bg-[#167D78]"
          previewClassName="h-full bg-[#D6F36A] animate-pulse"
          previewTitle={language === 'bn' ? 'আপনার অনুদান যোগ হলে' : 'With your donation'}
        />

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-600 dark:text-stone-300 tabular-nums">
          <span>
            {language === 'bn' ? 'সংগৃহীত:' : 'Raised:'}{' '}
            <strong className="text-[#102B3F] dark:text-white">{formatCurrency(currentRaised)}</strong>
            {pendingContribution > 0 && (
              <span className="text-[#167D78] dark:text-[#D6F36A] font-semibold ml-1">
                (+{formatCurrency(pendingContribution)})
              </span>
            )}
          </span>
          <span>
            {language === 'bn' ? 'বাকি:' : 'Remaining:'}{' '}
            <strong className="text-amber-700 dark:text-amber-300">{formatCurrency(remainingAmount)}</strong>
            <span className="text-stone-400 mx-1">/</span>
            <span>{formatCurrency(totalTarget)}</span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0c1a24] border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#167D78] dark:text-[#D6F36A]">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'লাইভ অনুদান লক্ষ্যমাত্রা ট্র্যাকার' : 'Live Donation Goal Progress'}</span>
          </div>
          <h4 className="text-base sm:text-lg font-black text-[#102B3F] dark:text-white leading-snug">
            {language === 'bn'
              ? '২০২৬ বার্ষিক মানবিক তহবিল ও চলমান প্রকল্পসমূহের অগ্রগতি'
              : '2026 Annual Humanitarian Campaign & Active Projects Goal'}
          </h4>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {language === 'bn'
              ? `${projects.length}টি চলমান প্রকল্পে ${totalDonors.toLocaleString('en-IN')}+ দাতার অংশগ্রহণে অর্জিত ফান্ড`
              : `Combined verified funding across ${projects.length} active relief & development projects`}
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right tabular-nums">
            <div className="text-2xl sm:text-3xl font-black text-[#167D78] dark:text-[#D6F36A] leading-none">
              {currentPercent}%
            </div>
            <span className="text-[11px] text-stone-500 dark:text-stone-400 block mt-1">
              {language === 'bn' ? 'লক্ষ্যমাত্রা অর্জিত' : 'of annual goal'}
            </span>
          </div>

          {onDonateClick && (
            <button
              type="button"
              onClick={onDonateClick}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#167D78] hover:bg-[#102B3F] text-white font-bold text-xs shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <Heart className="w-3.5 h-3.5 fill-current text-[#D6F36A]" />
              <span>{language === 'bn' ? 'লক্ষ্য পূরণে শরিক হোন' : 'Contribute Now'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Milestone Progress Track */}
      <div className="space-y-2.5">
        <AnimatedProgressBar
          targetPercent={currentPercent}
          trackClassName="relative w-full h-3 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden border border-stone-200/80 dark:border-stone-700"
          fillClassName="h-full bg-gradient-to-r from-[#167D78] to-[#D6F36A] rounded-full"
        >
          {/* Subtle 25%, 50%, 75% Milestone Ticks */}
          <span className="absolute top-0 bottom-0 left-1/4 w-px bg-stone-300/60 dark:bg-white/20" aria-hidden="true" />
          <span className="absolute top-0 bottom-0 left-1/2 w-px bg-stone-300/60 dark:bg-white/20" aria-hidden="true" />
          <span className="absolute top-0 bottom-0 left-3/4 w-px bg-stone-300/60 dark:bg-white/20" aria-hidden="true" />
        </AnimatedProgressBar>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-0.5 tabular-nums">
          <div className="flex items-center justify-between sm:justify-start sm:gap-2 bg-stone-50 dark:bg-stone-900/60 px-3 py-2 rounded-xl border border-stone-200/80 dark:border-stone-800">
            <span className="text-stone-500 dark:text-stone-400">{language === 'bn' ? 'মোট সংগৃহীত:' : 'Total Raised:'}</span>
            <strong className="text-[#167D78] dark:text-[#D6F36A] font-extrabold">{formatCurrency(currentRaised)}</strong>
          </div>
          <div className="flex items-center justify-between sm:justify-start sm:gap-2 bg-stone-50 dark:bg-stone-900/60 px-3 py-2 rounded-xl border border-stone-200/80 dark:border-stone-800">
            <span className="text-stone-500 dark:text-stone-400">{language === 'bn' ? 'বাকি প্রয়োজন:' : 'Still Needed:'}</span>
            <strong className="text-amber-700 dark:text-amber-300 font-extrabold">{formatCurrency(remainingAmount)}</strong>
          </div>
          <div className="flex items-center justify-between sm:justify-start sm:gap-2 bg-stone-50 dark:bg-stone-900/60 px-3 py-2 rounded-xl border border-stone-200/80 dark:border-stone-800">
            <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#167D78] dark:text-[#D6F36A]" />
              <span>{language === 'bn' ? 'মোট লক্ষ্যমাত্রা:' : 'Total Goal:'}</span>
            </span>
            <strong className="text-[#102B3F] dark:text-white font-extrabold">{formatCurrency(totalTarget)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
