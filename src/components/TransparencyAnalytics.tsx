import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { TrendingUp, PieChart, Users, DollarSign, Layers } from 'lucide-react';
import { Language } from '../types';

interface TransparencyAnalyticsProps {
  language: Language;
}

export const TransparencyAnalytics: React.FC<TransparencyAnalyticsProps> = ({ language }) => {
  const [activeView, setActiveView] = useState<'trends' | 'category' | 'impact'>('trends');

  // 12-Month Historical Fund Flows
  const monthlyTrendsData = [
    {
      monthBn: 'মে ২৫',
      monthEn: 'May 25',
      donations: 210000,
      disbursed: 180000,
      beneficiaries: 650
    },
    {
      monthBn: 'জুন ২৫',
      monthEn: 'Jun 25',
      donations: 280000,
      disbursed: 245000,
      beneficiaries: 890
    },
    {
      monthBn: 'জুলাই ২৫',
      monthEn: 'Jul 25',
      donations: 490000,
      disbursed: 460000,
      beneficiaries: 1950
    },
    {
      monthBn: 'আগস্ট ২৫',
      monthEn: 'Aug 25',
      donations: 620000,
      disbursed: 580000,
      beneficiaries: 2800
    },
    {
      monthBn: 'সেপ্টেম্বর ২৫',
      monthEn: 'Sep 25',
      donations: 340000,
      disbursed: 310000,
      beneficiaries: 1120
    },
    {
      monthBn: 'অক্টোবর ২৫',
      monthEn: 'Oct 25',
      donations: 290000,
      disbursed: 265000,
      beneficiaries: 980
    },
    {
      monthBn: 'নভেম্বর ২৫',
      monthEn: 'Nov 25',
      donations: 380000,
      disbursed: 350000,
      beneficiaries: 1400
    },
    {
      monthBn: 'ডিসেম্বর ২৫',
      monthEn: 'Dec 25',
      donations: 510000,
      disbursed: 480000,
      beneficiaries: 2200
    },
    {
      monthBn: 'জানুয়ারি ২৬',
      monthEn: 'Jan 26',
      donations: 430000,
      disbursed: 400000,
      beneficiaries: 1650
    },
    {
      monthBn: 'ফেব্রুয়ারি ২৬',
      monthEn: 'Feb 26',
      donations: 360000,
      disbursed: 320000,
      beneficiaries: 1300
    },
    {
      monthBn: 'মার্চ ২৬',
      monthEn: 'Mar 26',
      donations: 540000,
      disbursed: 490000,
      beneficiaries: 2100
    },
    {
      monthBn: 'এপ্রিল ২৬',
      monthEn: 'Apr 26',
      donations: 425000,
      disbursed: 385000,
      beneficiaries: 1580
    }
  ];

  // Category-wise Breakdown Data
  const categoryBreakdownData = [
    {
      categoryBn: 'বন্যা ও জরুরি ত্রাণ',
      categoryEn: 'Flood Relief',
      target: 850000,
      raised: 765000,
      beneficiaries: 3200,
      efficiency: 96
    },
    {
      categoryBn: 'চরাঞ্চলে শিশু শিক্ষা',
      categoryEn: 'Char Education',
      target: 600000,
      raised: 512000,
      beneficiaries: 450,
      efficiency: 94
    },
    {
      categoryBn: 'সুপেয় পানির নলকূপ',
      categoryEn: 'Clean Water',
      target: 750000,
      raised: 480000,
      beneficiaries: 4200,
      efficiency: 92
    },
    {
      categoryBn: 'শীতবস্ত্র ও কম্বল',
      categoryEn: 'Winter Warmth',
      target: 400000,
      raised: 400000,
      beneficiaries: 2500,
      efficiency: 98
    },
    {
      categoryBn: 'স্বাস্থ্য ক্যাম্প ও ওষুধ',
      categoryEn: 'Mobile Health',
      target: 500000,
      raised: 390000,
      beneficiaries: 1850,
      efficiency: 95
    },
    {
      categoryBn: 'নারী স্বাবলম্বীকরণ',
      categoryEn: 'Women Livelihood',
      target: 450000,
      raised: 320000,
      beneficiaries: 120,
      efficiency: 91
    }
  ];

  const formatTaka = (value: number) => {
    if (value >= 100000) {
      return `৳${(value / 100000).toFixed(1)}L`;
    }
    return `৳${(value / 1000).toFixed(0)}k`;
  };

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-[#0c1a24]/95 backdrop-blur-md p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xl text-xs space-y-1.5 z-30">
          <div className="font-bold text-stone-900 dark:text-white border-b border-stone-100 dark:border-stone-800 pb-1">
            {label}
          </div>
          {payload.map((item: any, idx: number) => {
            const isTaka = item.name.includes('Donations') || item.name.includes('Disbursed') || item.name.includes('অনুদান') || item.name.includes('ব্যয়') || item.name.includes('Target') || item.name.includes('Raised') || item.name.includes('লক্ষ্য') || item.name.includes('সংগৃহীত');
            return (
              <div key={idx} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}:</span>
                </span>
                <span className="font-bold tabular-nums text-stone-900 dark:text-white">
                  {isTaka ? `৳${item.value.toLocaleString('en-IN')}` : item.value.toLocaleString('en-IN')}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 rounded-2xl bg-stone-50/80 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 mb-12 shadow-xs transition-all">
      
      {/* Visual Analytics Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-200/80 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#167D78] dark:text-[#D6F36A] mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>{language === 'bn' ? 'অডিট ও ট্রেন্ড বিশ্লেষণ' : 'Visual Audit Intelligence'}</span>
          </div>
          <h3 className="text-lg font-bold text-[#102B3F] dark:text-white">
            {language === 'bn'
              ? 'ঐতিহাসিক অনুদান প্রবাহ ও খাতভিত্তিক সরাসরি প্রভাব'
              : 'Historical Donation Trends & Direct Impact by Category'}
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            {language === 'bn'
              ? '১২ মাসের ধারাবাহিক নিরীক্ষিত তথ্য ও উপকারভোগীর সংখ্যা'
              : '12-month verified ledger trajectory and verified beneficiaries reached'}
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-200/80 dark:bg-stone-800 rounded-xl shrink-0 self-start sm:self-auto text-xs font-semibold">
          <button
            onClick={() => setActiveView('trends')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeView === 'trends'
                ? 'bg-white dark:bg-[#102B3F] text-[#102B3F] dark:text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? '১২ মাসের ট্রেন্ড' : '12M Trends'}</span>
          </button>

          <button
            onClick={() => setActiveView('category')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeView === 'category'
                ? 'bg-white dark:bg-[#102B3F] text-[#102B3F] dark:text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'খাতভিত্তিক অর্থায়ন' : 'By Category'}</span>
          </button>

          <button
            onClick={() => setActiveView('impact')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeView === 'impact'
                ? 'bg-white dark:bg-[#102B3F] text-[#102B3F] dark:text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'উপকারভোগী ম্যাট্রিক্স' : 'Beneficiaries'}</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: 12-Month Area Chart (Donation vs Disbursement) */}
      {activeView === 'trends' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between text-xs text-stone-500 gap-2">
            <span>
              {language === 'bn'
                ? 'প্রতি মাসের সংগৃহীত অনুদান (Donations Received) বনাম মাঠপর্যায়ে ব্যয় (Disbursed)'
                : 'Monthly Donations Received vs. Verified Ground Disbursements in BDT'}
            </span>
            <div className="flex items-center gap-4 font-semibold">
              <span className="flex items-center gap-1 text-[#167D78] dark:text-[#D6F36A]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#167D78]" />
                <span>{language === 'bn' ? 'অনুদান প্রবাহ' : 'Donations Inflow'}</span>
              </span>
              <span className="flex items-center gap-1 text-[#E6A15B]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E6A15B]" />
                <span>{language === 'bn' ? 'মাঠপর্যায়ে ব্যয়' : 'Direct Aid Disbursed'}</span>
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyTrendsData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#167D78" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#167D78" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorDisbursed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E6A15B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#E6A15B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis
                  dataKey={language === 'bn' ? 'monthBn' : 'monthEn'}
                  tick={{ fontSize: 11, fill: '#888' }}
                  tickLine={false}
                  axisLine={{ opacity: 0.2 }}
                />
                <YAxis
                  tickFormatter={formatTaka}
                  tick={{ fontSize: 11, fill: '#888' }}
                  tickLine={false}
                  axisLine={{ opacity: 0.2 }}
                  domain={[0, 700000]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="donations"
                  name={language === 'bn' ? 'প্রাপ্ত অনুদান' : 'Donations Received'}
                  stroke="#167D78"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorDonations)"
                />
                <Area
                  type="monotone"
                  dataKey="disbursed"
                  name={language === 'bn' ? 'মাঠপর্যায়ে ব্যয়' : 'Direct Aid Disbursed'}
                  stroke="#E6A15B"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorDisbursed)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between text-[11px] text-stone-500 border-t border-stone-200/70 dark:border-stone-800">
            <span>
              {language === 'bn'
                ? '💡 বিশেষ পর্যবেক্ষণ: জুলাই-আগস্ট বন্যায় ও ডিসেম্বর-জানুয়ারি শীতে সহায়তা কার্যক্রম সর্বাধিক বৃদ্ধি পায়।'
                : '💡 Note: Seasonal peaks during July-August floods and December winter relief drives.'}
            </span>
            <span className="font-semibold text-[#167D78] dark:text-[#D6F36A]">
              গড় অর্থ রূপান্তর হার: ৮৮.৯%
            </span>
          </div>
        </div>
      )}

      {/* VIEW 2: Category-wise Funding vs Target (Bar Chart) */}
      {activeView === 'category' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between text-xs text-stone-500 gap-2">
            <span>
              {language === 'bn'
                ? 'মানবিক প্রকল্পের খাতভিত্তিক সংগৃহীত অনুদান বনাম নির্ধারিত লক্ষ্যমাত্রা (টাকা)'
                : 'Category Funding: Raised vs Target Goal in BDT'}
            </span>
            <div className="flex items-center gap-4 font-semibold">
              <span className="flex items-center gap-1 text-[#102B3F] dark:text-stone-300">
                <span className="w-2.5 h-2.5 rounded-sm bg-stone-400 dark:bg-stone-600" />
                <span>{language === 'bn' ? 'টার্গেট লক্ষ্য' : 'Target Goal'}</span>
              </span>
              <span className="flex items-center gap-1 text-[#167D78] dark:text-[#D6F36A]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#167D78]" />
                <span>{language === 'bn' ? 'সংগৃহীত অনুদান' : 'Amount Raised'}</span>
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryBreakdownData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis
                  dataKey={language === 'bn' ? 'categoryBn' : 'categoryEn'}
                  tick={{ fontSize: 10, fill: '#888' }}
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
                <Bar
                  dataKey="target"
                  name={language === 'bn' ? 'নির্ধারিত লক্ষ্য' : 'Target Goal'}
                  fill="#94a3b8"
                  radius={[4, 4, 0, 0]}
                  opacity={0.4}
                />
                <Bar
                  dataKey="raised"
                  name={language === 'bn' ? 'সংগৃহীত অনুদান' : 'Amount Raised'}
                  fill="#167D78"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between text-[11px] text-stone-500 border-t border-stone-200/70 dark:border-stone-800">
            <span>
              {language === 'bn'
                ? 'সর্বাধিক অনুদান প্রাপ্ত খাত: বন্যা ও জরুরি খাদ্য ত্রাণ (৳৭,৬৫,০০০)'
                : 'Top Funded Sector: Emergency Flood Relief (BDT 7,65,000)'}
            </span>
            <span className="font-semibold text-stone-700 dark:text-stone-300">
              {language === 'bn' ? 'শতভাগ লক্ষ্য পূরণ: শীতবস্ত্র কর্মসূচি' : '100% Target Met: Winter Warmth'}
            </span>
          </div>
        </div>
      )}

      {/* VIEW 3: Beneficiaries Matrix by Category */}
      {activeView === 'impact' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between text-xs text-stone-500 gap-2">
            <span>
              {language === 'bn'
                ? 'প্রতিটি প্রকল্পে সরাসরি যাচাইকৃত উপকারভোগী পরিবার ও জনসংখ্যা'
                : 'Verified Direct Beneficiary Families and Individuals by Sector'}
            </span>
            <span className="font-semibold text-[#167D78] dark:text-[#D6F36A]">
              {language === 'bn' ? 'সর্বমোট উপকারভোগী: ১৪,৫০০+' : 'Total Beneficiaries: 14,500+'}
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryBreakdownData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: '#888' }}
                  tickLine={false}
                  axisLine={{ opacity: 0.2 }}
                />
                <YAxis
                  dataKey={language === 'bn' ? 'categoryBn' : 'categoryEn'}
                  type="category"
                  tick={{ fontSize: 10, fill: '#888' }}
                  tickLine={false}
                  axisLine={{ opacity: 0.2 }}
                  width={110}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="beneficiaries"
                  name={language === 'bn' ? 'উপকারভোগী সংখ্যা' : 'Beneficiaries'}
                  fill="#E6A15B"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between text-[11px] text-stone-500 border-t border-stone-200/70 dark:border-stone-800">
            <span>
              {language === 'bn'
                ? 'উপকূলীয় সাতক্ষীরা ও চরাঞ্চলে সুপেয় পানির প্রকল্পে সর্বাধিক ৪,২০০+ মানুষ নিয়মিত সুবিধা ভোগ করছেন।'
                : 'Deep solar tube-wells support over 4,200 villagers daily in salinity-affected coastal belts.'}
            </span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {language === 'bn' ? '১০০% ডিজিটাল যাচাইকৃত ডাটাবেস' : '100% Digitally Verified'}
            </span>
          </div>
        </div>
      )}

    </div>
  );
};
