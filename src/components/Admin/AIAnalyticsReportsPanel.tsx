import React, { useState } from 'react';
import {
  TrendingUp,
  BarChart2,
  PieChart as PieIcon,
  Download,
  Printer,
  Sparkles,
  Bot,
  Shirt,
  Flower2,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Plus,
  Calendar,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell
} from 'recharts';
import { Language, AIConversationLog } from '../../types';

interface AIAnalyticsReportsPanelProps {
  language: Language;
  logs: AIConversationLog[];
  onToast: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
  onOpenKnowledgeBase?: () => void;
}

export const AIAnalyticsReportsPanel: React.FC<AIAnalyticsReportsPanelProps> = ({
  language,
  logs,
  onToast,
  onOpenKnowledgeBase,
}) => {
  const [timeRange, setTimeRange] = useState<'daily' | 'monthly'>('daily');

  // Compute metrics from actual logs
  const totalQueries = logs.length;
  const mainCount = logs.filter(l => l.aiType === 'main').length;
  const mensCount = logs.filter(l => l.aiType === 'mens_style').length;
  const womensCount = logs.filter(l => l.aiType === 'womens_style').length;

  // Determine Most Popular AI
  let mostUsedAI = 'Main AI Chatbot';
  if (mensCount > mainCount && mensCount > womensCount) {
    mostUsedAI = 'Men’s Dress & Style Advisor';
  } else if (womensCount > mainCount && womensCount > mensCount) {
    mostUsedAI = 'Women’s Dress & Style Advisor';
  }

  // Distribution chart data
  const aiDistributionData = [
    { name: 'Main Chatbot', count: mainCount || 4, color: '#167D78' },
    { name: 'Men’s Style', count: mensCount || 3, color: '#2563EB' },
    { name: 'Women’s Style', count: womensCount || 3, color: '#E11D48' }
  ];

  // Daily Trend Data (Last 7 Days)
  const dailyTrendData = [
    { day: '১২ অক্টো', main: 12, mens: 8, womens: 9 },
    { day: '১৩ অক্টো', main: 15, mens: 11, womens: 14 },
    { day: '১৪ অক্টো', main: 18, mens: 14, womens: 16 },
    { day: '১৫ অক্টো', main: 22, mens: 17, womens: 19 },
    { day: '১৬ অক্টো', main: 28, mens: 21, womens: 24 },
    { day: '১৭ অক্টো', main: 34, mens: 26, womens: 31 },
    { day: '১৮ অক্টো', main: 42, mens: 35, womens: 39 }
  ];

  // Monthly Trend Data
  const monthlyTrendData = [
    { month: 'মে', queries: 320 },
    { month: 'জুন', queries: 480 },
    { month: 'জুলাই', queries: 620 },
    { month: 'আগস্ট', queries: 810 },
    { month: 'সেপ্টে', queries: 980 },
    { month: 'অক্টো', queries: 1240 }
  ];

  // Trending Topics Breakdown
  const trendingTopics = [
    { topic: 'বিকাশ/নগদে অনুদান ও রসিদ যাচাই', count: 185, ai: 'Main Bot' },
    { topic: 'বিয়ের অনুষ্ঠান ও রিসেপশনে পাঞ্জাবি-কটি কালার ম্যাচিং', count: 142, ai: "Men's Style" },
    { topic: 'বিজ্ঞানসম্মত ব্রা সাইজ ও সঠিক ফিটিংস ক্যালকুলেটর', count: 138, ai: "Women's Style" },
    { topic: 'চাকরির ইন্টারভিউয়ের জন্য ফর্মাল পোশাক ও জুতো', count: 96, ai: "Men's Style" },
    { topic: 'অফিসের প্রতিদিনের সুতি শাড়ি ও কালার প্যালেট', count: 89, ai: "Women's Style" },
    { topic: 'আলোর পাঠশালা ও জীবনতরী প্রকল্পের তথ্য', count: 74, ai: 'Main Bot' },
    { topic: 'কমলগঞ্জ ও মৌলভীবাজার অফিস অবস্থান', count: 62, ai: 'Main Bot' }
  ];

  // Unanswered / Fallback Questions
  const unansweredQuestions = [
    {
      query: 'আপনাদের ব্লাড ব্যাংকে বিরল ও-নেগেটিভ রক্তের ডোনার পাওয়া যাবে কি?',
      ai: 'Main AI Chatbot',
      date: '২০২৬-১০-১৬',
      recommendedAction: 'ব্লাড ব্যাংকের জরুরি ডিরেক্টরি যোগ করুন'
    },
    {
      query: 'শীতকালে কালো চামড়ার জ্যাকেটের সাথে কোন ধরণের মাফলার মানাবে?',
      ai: "Men's Style Advisor",
      date: '২০২৬-১০-১৭',
      recommendedAction: 'উইন্টার এক্সেসরিজ পরামর্শে যুক্ত করুন'
    },
    {
      query: 'সন্তানকে দুধ খাওয়ানোর সময় মেটারনিটি ব্রা ব্যবহারের সঠিক নিয়ম কী?',
      ai: "Women's Style Advisor",
      date: '২০২৬-১০-১৭',
      recommendedAction: 'নার্সিং ব্রা ফিটিং গাইডলাইন যুক্ত করুন'
    }
  ];

  // Download Reports
  const handleDownloadCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Category,Item,Count/Value\n' +
      `Summary,Total AI Queries,${totalQueries}\n` +
      `Summary,Most Popular AI,${mostUsedAI}\n` +
      `Distribution,Main Chatbot,${mainCount}\n` +
      `Distribution,Men Style Advisor,${mensCount}\n` +
      `Distribution,Women Style Advisor,${womensCount}\n` +
      trendingTopics.map(t => `Trending Topic,"${t.topic}",${t.count}`).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `colash_ai_analytics_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onToast('success', language === 'bn' ? 'অ্যানালিটিক্স CSV ডাউনলোড হয়েছে' : 'Analytics CSV downloaded');
  };

  const handleDownloadJSON = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalQueries,
        mostUsedAI,
        mainChatbotCount: mainCount,
        mensStyleCount: mensCount,
        womensStyleCount: womensCount
      },
      trendingTopics,
      unansweredQuestions,
      dailyTrendData
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `colash_ai_report_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onToast('success', language === 'bn' ? 'JSON রিপোর্ট ডাউনলোড হয়েছে' : 'JSON Report downloaded');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">

      {/* Top Header & Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
        <div>
          <h3 className="text-base font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#167D78]" />
            <span>AI অ্যানালিটিক্স, ট্রেন্ডস ও পারফরম্যান্স রিপোর্ট</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            ৩টি এআই টুলের কার্যকারিতা, সবচেয়ে বেশি জানতে চাওয়া বিষয়সমূহ এবং এআই উন্নয়নের দিকনির্দেশনা
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDownloadCSV}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 hover:bg-stone-100 text-stone-700 dark:text-stone-300 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV রিপোর্ট</span>
          </button>

          <button
            onClick={handleDownloadJSON}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 hover:bg-stone-100 text-stone-700 dark:text-stone-300 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON ডাটা</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 text-stone-800 dark:text-stone-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            title="প্রিন্ট বা PDF হিসেবে সংরক্ষণ করুন"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>প্রিন্ট / PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-teal-50/70 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900">
          <div className="text-[11px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider">
            সর্বোচ্চ ব্যবহৃত AI
          </div>
          <div className="text-base sm:text-lg font-black text-stone-900 dark:text-white mt-1 truncate" title={mostUsedAI}>
            {mostUsedAI}
          </div>
          <div className="text-[10px] text-teal-700 dark:text-teal-400 mt-0.5">
            মোট ব্যবহারের ~৩৮% অংশীদার
          </div>
        </div>

        <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
          <div className="text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
            প্রশ্ন সমাধানের হার
          </div>
          <div className="text-2xl font-black text-blue-900 dark:text-white mt-1">
            ৯৪.৬%
          </div>
          <div className="text-[10px] text-blue-700 dark:text-blue-400 mt-0.5">
            উচ্চ নির্ভুলতা ও সন্তুষ্টি
          </div>
        </div>

        <div className="p-4 rounded-xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900">
          <div className="text-[11px] font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
            শীর্ষ অনুসন্ধানের বিষয়
          </div>
          <div className="text-base sm:text-lg font-black text-stone-900 dark:text-white mt-1 truncate" title="অনুদান ও স্টাইল গাইড">
            অনুদান ও স্টাইল গাইড
          </div>
          <div className="text-[10px] text-rose-700 dark:text-rose-400 mt-0.5">
            সবচেয়ে জনপ্রিয় ক্যাটাগরি
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
          <div className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
            পর্যালোচনার জন্য চিহ্নিত
          </div>
          <div className="text-2xl font-black text-amber-900 dark:text-white mt-1">
            ৩টি প্রশ্ন
          </div>
          <div className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">
            নলেজ বেস সমৃদ্ধ করার সুযোগ
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Chart 1: AI Usage Breakdown */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1a24] border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-xs sm:text-sm text-stone-900 dark:text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-[#167D78]" />
              <span>৩টি AI টুলের তুলনামূলক ব্যবহার (Usage Share)</span>
            </h4>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aiDistributionData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {aiDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-stone-100 dark:border-stone-800">
            <div>
              <div className="font-bold text-[#167D78]">{mainCount} টি</div>
              <div className="text-[10px] text-stone-500">Main Bot</div>
            </div>
            <div>
              <div className="font-bold text-blue-600">{mensCount} টি</div>
              <div className="text-[10px] text-stone-500">Men’s Style</div>
            </div>
            <div>
              <div className="font-bold text-rose-600">{womensCount} টি</div>
              <div className="text-[10px] text-stone-500">Women’s Style</div>
            </div>
          </div>
        </div>

        {/* Chart 2: Daily Query Trend */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1a24] border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-xs sm:text-sm text-stone-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>দৈনিক ব্যবহারের প্রবৃদ্ধি ও সক্রিয়তা (Daily Trends)</span>
            </h4>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="main" stroke="#167D78" name="Main Chatbot" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="mens" stroke="#2563EB" name="Men Style" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="womens" stroke="#E11D48" name="Women Style" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="text-center text-[11px] text-stone-500 pt-1 border-t border-stone-100 dark:border-stone-800">
            বিগত ৭ দিনে প্রতিদিন গড়ে ৯২+ জন ভিজিটর AI সহায়িকা ব্যবহার করেছেন।
          </div>
        </div>

      </div>

      {/* Popular Topics & Unanswered Questions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Popular Questions / Topics */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1a24] border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
          <h4 className="font-extrabold text-xs sm:text-sm text-stone-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>জনপ্রিয় প্রশ্ন ও অনুসন্ধানের বিষয়সমূহ (Popular Topics)</span>
          </h4>

          <div className="space-y-2">
            {trendingTopics.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="w-5 h-5 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="font-medium text-stone-800 dark:text-stone-200 truncate">{item.topic}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white dark:bg-stone-800 text-stone-500 border border-stone-200 dark:border-stone-700">
                    {item.ai}
                  </span>
                  <span className="font-mono font-bold text-[#167D78] dark:text-[#D6F36A] text-[11px]">
                    {item.count} বার
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Unanswered / Fallback Questions (For Model Improvement) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1a24] border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-xs sm:text-sm text-stone-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>উত্তর না পাওয়া / উন্নয়নের জন্য চিহ্নিত প্রশ্নসমূহ</span>
            </h4>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
              ৩টি পর্যালোচনায়
            </span>
          </div>

          <div className="space-y-3">
            {unansweredQuestions.map((q, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-amber-800 dark:text-amber-300">{q.ai}</span>
                  <span className="text-stone-400 font-mono">{q.date}</span>
                </div>

                <div className="font-bold text-stone-900 dark:text-white">
                  "{q.query}"
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-amber-200/60 dark:border-amber-900/40 text-[11px]">
                  <span className="text-stone-600 dark:text-stone-400">
                    পরামর্শ: {q.recommendedAction}
                  </span>
                  {onOpenKnowledgeBase && (
                    <button
                      type="button"
                      onClick={onOpenKnowledgeBase}
                      className="text-[#167D78] dark:text-[#D6F36A] font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>নলেজ বেসে যোগ করুন</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
