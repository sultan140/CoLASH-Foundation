import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { TrendingUp, Filter, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import {
  DONATION_MONTHLY_HISTORY,
  DONATION_CATEGORY_METADATA,
  CategoryDonationMonthly
} from '../data/mockData';
import { Language } from '../types';

interface DonationTrendChartProps {
  language: Language;
  data?: CategoryDonationMonthly[];
  className?: string;
}

export const DonationTrendChart: React.FC<DonationTrendChartProps> = ({
  language,
  data = DONATION_MONTHLY_HISTORY,
  className = ''
}) => {
  // Allow toggling specific category lines on and off
  const [activeCategories, setActiveCategories] = useState<Record<string, boolean>>({
    relief: true,
    education: true,
    health: true,
    winter: true,
    water: true,
    livelihood: true
  });

  const toggleCategory = (key: string) => {
    setActiveCategories(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const selectAll = () => {
    const allOn = DONATION_CATEGORY_METADATA.reduce((acc, cat) => ({ ...acc, [cat.key]: true }), {});
    setActiveCategories(allOn);
  };

  const formatTaka = (value: number) => {
    if (value >= 100000) {
      return `৳${(value / 100000).toFixed(1)}L`;
    }
    return `৳${(value / 1000).toFixed(0)}k`;
  };

  // Custom Line Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const monthTotal = payload.reduce((sum: number, item: any) => sum + (Number(item.value) || 0), 0);

      return (
        <div className="bg-white/95 dark:bg-[#0c1a24]/95 backdrop-blur-md p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xl text-xs space-y-2 z-30 min-w-[220px]">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-1.5">
            <span className="font-bold text-stone-900 dark:text-white">{label}</span>
            <span className="text-[11px] font-semibold text-[#167D78] dark:text-[#D6F36A] tabular-nums">
              {language === 'bn' ? 'মোট:' : 'Total:'} ৳{monthTotal.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="space-y-1">
            {payload.map((item: any) => (
              <div key={item.dataKey} className="flex items-center justify-between gap-3 text-[11px]">
                <span className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="truncate max-w-[130px]">{item.name}</span>
                </span>
                <span className="font-bold tabular-nums text-stone-900 dark:text-white">
                  ৳{(item.value as number).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`p-6 rounded-2xl bg-white dark:bg-[#0c1a24] border border-stone-200 dark:border-stone-800 shadow-sm transition-all ${className}`}>
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-100 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#167D78] dark:text-[#D6F36A] mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>{language === 'bn' ? 'লাইন চার্ট বিশ্লেষণ' : 'Trend Line Analysis'}</span>
          </div>
          <h3 className="text-lg font-bold text-[#102B3F] dark:text-white">
            {language === 'bn'
              ? 'খাতভিত্তিক মাসিক অনুদানের ঐতিহাসিক ধারা (Monthly Donation Trends by Category)'
              : 'Monthly Donations by Project Category'}
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            {language === 'bn'
              ? 'প্রতিটি নির্দিষ্ট প্রকল্পে মাসের ভিত্তিতে অনুদান প্রবাহের গতি ও তুলনামূলক চিত্র'
              : 'Detailed line chart mapping individual project categories across 12 consecutive months'}
          </p>
        </div>

        <button
          onClick={selectAll}
          className="self-start md:self-auto px-3 py-1.5 text-[11px] font-semibold text-stone-600 dark:text-stone-300 hover:text-[#167D78] dark:hover:text-[#D6F36A] border border-stone-200 dark:border-stone-700 rounded-lg cursor-pointer transition-colors"
        >
          {language === 'bn' ? 'সকল খাত প্রদর্শন' : 'Show All Categories'}
        </button>
      </div>

      {/* Interactive Category Selector Legend */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-[11px] font-semibold text-stone-400 mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3" />
          <span>{language === 'bn' ? 'ফিল্টার:' : 'Filter:'}</span>
        </span>
        {DONATION_CATEGORY_METADATA.map((cat) => {
          const isActive = activeCategories[cat.key];
          return (
            <button
              key={cat.key}
              onClick={() => toggleCategory(cat.key)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 border ${
                isActive
                  ? 'bg-stone-50 dark:bg-stone-800/80 text-stone-900 dark:text-white border-stone-300 dark:border-stone-700 shadow-xs'
                  : 'bg-transparent text-stone-400 dark:text-stone-500 border-dashed border-stone-200 dark:border-stone-800 opacity-60'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: isActive ? cat.color : '#94a3b8' }}
              />
              <span>{language === 'bn' ? cat.nameBn : cat.nameEn}</span>
              {isActive ? (
                <Eye className="w-3 h-3 opacity-60 ml-0.5" />
              ) : (
                <EyeOff className="w-3 h-3 opacity-40 ml-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Recharts LineChart Container */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
            <XAxis
              dataKey={language === 'bn' ? 'labelBn' : 'labelEn'}
              tick={{ fontSize: 11, fill: '#888' }}
              tickLine={false}
              axisLine={{ opacity: 0.2 }}
            />
            <YAxis
              tickFormatter={formatTaka}
              tick={{ fontSize: 11, fill: '#888' }}
              tickLine={false}
              axisLine={{ opacity: 0.2 }}
            />
            <Tooltip content={<CustomTooltip />} />

            {DONATION_CATEGORY_METADATA.map((cat) => {
              if (!activeCategories[cat.key]) return null;
              return (
                <Line
                  key={cat.key}
                  type="monotone"
                  dataKey={cat.key}
                  name={language === 'bn' ? cat.nameBn : cat.nameEn}
                  stroke={cat.color}
                  strokeWidth={2.5}
                  dot={{ r: 3, strokeWidth: 1.5, fill: '#fff' }}
                  activeDot={{ r: 6, stroke: cat.color, strokeWidth: 2 }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Statistical Summary Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mt-4 border-t border-stone-100 dark:border-stone-800 text-xs">
        <div>
          <span className="text-stone-400 block text-[10px] uppercase">
            {language === 'bn' ? 'শীর্ষ অনুদান প্রাপ্ত খাত' : 'Top Funded Category'}
          </span>
          <span className="font-bold text-[#167D78] dark:text-[#D6F36A]">
            {language === 'bn' ? 'বন্যা ও জরুরি ত্রাণ' : 'Flood & Disaster Relief'}
          </span>
        </div>

        <div>
          <span className="text-stone-400 block text-[10px] uppercase">
            {language === 'bn' ? 'সর্বোচ্চ অনুদানের মাস' : 'Peak Donation Month'}
          </span>
          <span className="font-bold text-stone-900 dark:text-white tabular-nums">
            {language === 'bn' ? 'আগস্ট ২০২৫ (৳৬.২ লাখ)' : 'August 2025 (BDT 6.2L)'}
          </span>
        </div>

        <div>
          <span className="text-stone-400 block text-[10px] uppercase">
            {language === 'bn' ? 'মাসিক গড় অনুদান' : 'Monthly Average'}
          </span>
          <span className="font-bold text-stone-900 dark:text-white tabular-nums">
            ৳৩,৫৭,০৮৩
          </span>
        </div>

        <div>
          <span className="text-stone-400 block text-[10px] uppercase">
            {language === 'bn' ? 'অডিট ভেরিফিকেশন' : 'Audit Status'}
          </span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>১০০% নিরীক্ষিত</span>
          </span>
        </div>
      </div>

    </div>
  );
};
