import React, { useState } from 'react';
import { ShieldCheck, FileText, Search, ArrowDownRight, ArrowUpRight, CheckCircle2, Download, Printer, X, BookOpen } from 'lucide-react';
import { FinancialRecord, Language, Project } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { INITIAL_PROJECTS } from '../data/mockData';
import { TransparencyAnalytics } from './TransparencyAnalytics';
import { DonationTrendChart } from './DonationTrendChart';
import { ReportsArchiveModal } from './common/ReportsArchiveModal';
import { DonationGoalProgress } from './common/DonationGoalProgress';

interface TransparencySectionProps {
  records: FinancialRecord[];
  projects?: Project[];
  language: Language;
  onToast: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
}

export const TransparencySection: React.FC<TransparencySectionProps> = ({ records, projects = INITIAL_PROJECTS, language, onToast }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [isReportsArchiveOpen, setIsReportsArchiveOpen] = useState(false);

  const t = TRANSLATIONS[language];

  const filteredRecords = records.filter((rec) => {
    const matchesType = typeFilter === 'all' || rec.type === typeFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      rec.voucherNumber.toLowerCase().includes(query) ||
      rec.category.toLowerCase().includes(query) ||
      (language === 'bn' ? rec.descriptionBn : rec.descriptionEn).toLowerCase().includes(query);
    return matchesType && matchesSearch;
  });

  const formatCurrency = (val: number) => `৳${val.toLocaleString('en-IN')}`;

  // Real client-side file download for the statutory audit report
  const handleDownloadAuditFile = () => {
    const auditContent = `================================================================================
COLASH FOUNDATION (কোলাশ ফাউন্ডেশন)
ANNUAL STATUTORY AUDIT REPORT & FINANCIAL LEDGER SUMMARY
FINANCIAL YEAR: 2025-2026 (1 JULY 2025 - 30 JUNE 2026)
GOVERNMENT REGISTRATION NO: DH-9842/2021
DIRECTORATE OF SOCIAL WELFARE & NGO AFFAIRS BUREAU APPROVED
================================================================================

1. AUDIT OPINION
We have audited the financial statements of CoLASH Foundation for the period ended 
30 June 2026. The foundation maintains 100% vouchers, digitally logged receipts, 
and bank statements in full compliance with NGO statutory financial guidelines.
Independent Auditor: S. Ahmed & Co., Chartered Accountants (Mohakhali, Dhaka).

2. CONSOLIDATED BALANCE SUMMARY
- Opening Cash & Bank Reserve:              BDT    2,15,000
- Total Donations & Grants Received:        BDT   40,70,000
- Direct On-Ground Relief & School Kits:   (BDT  35,60,000) [88%]
- Field Transport, Boats & Logistics:      (BDT   2,55,000) [ 7%]
- Administrative & Statutory Audit:        (BDT   1,85,000) [ 5%]
--------------------------------------------------------------------------------
NET CLOSING EMERGENCY RESERVE:             BDT    2,85,000
================================================================================

3. SUMMARY BY PROGRAM AREA
- Char Education Stipends & Books:         450 Beneficiaries
- Flood Relief & Clean Water:            3,200 Families
- Free Community Health & Medicine:      1,850 Patients
- Women Tailoring Machines & Kits:         120 Mothers

Certified by:
Md. Ashraful Islam Sultan (Founder & President)
Tanvir Ahmed Chowdhury, ACA (Finance Coordinator)
================================================================================`;

    const blob = new Blob([auditContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CoLASH-Audit-Report-2025-2026.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onToast('success', language === 'bn' ? 'অডিট রিপোর্ট ডাউনলোড সম্পন্ন হয়েছে' : 'Audit Report Downloaded', 'CoLASH-Audit-Report-2025-2026.txt');
  };

  return (
    <section id="transparency" className="py-14 sm:py-20 bg-white dark:bg-[#0c1a24] border-t border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#167D78] dark:text-[#D6F36A] mb-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>{language === 'bn' ? 'শতভাগ জবাবদিহিতা' : 'Uncompromising Governance'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#102B3F] dark:text-white tracking-tight">
              {t.transparencyTitle}
            </h2>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 mt-2 max-w-2xl">
              {t.transparencySubtitle}
            </p>
          </div>

          <div className="no-print flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsReportsArchiveOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#102B3F] to-[#167D78] hover:from-[#167D78] hover:to-[#102B3F] rounded-xl transition-all cursor-pointer shadow-md"
              title="View Constitution & Annual Audit Archive"
            >
              <BookOpen className="w-4 h-4 text-[#D6F36A]" />
              <span>{language === 'bn' ? 'গঠনতন্ত্র ও অডিট আর্কাইভ' : 'Constitution & Audit Archive'}</span>
            </button>

            <button
              onClick={() => setShowAuditModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-[#102B3F] dark:text-white bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 hover:border-[#167D78] rounded-xl transition-colors cursor-pointer btn-outline-interaction"
            >
              <FileText className="w-4 h-4 text-[#167D78] dark:text-[#D6F36A]" />
              <span>{language === 'bn' ? 'অডিট সারাংশ' : 'View Audit Statement'}</span>
            </button>

            <button
              onClick={handleDownloadAuditFile}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#167D78] hover:bg-[#102B3F] rounded-xl transition-colors cursor-pointer shadow-sm btn-primary-interaction"
              title="Download full statutory report"
            >
              <Download className="w-4 h-4 text-[#D6F36A]" />
              <span className="hidden sm:inline">{language === 'bn' ? 'ডাউনলোড ফাইল' : 'Download File'}</span>
            </button>
          </div>
        </div>

        {/* Official Print Header for Hard-Copy Financial Audit Ledger */}
        <div className="print-only print-document-header">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-base font-black text-[#102B3F]">
                CoLASH Foundation (কোলাশ ফাউন্ডেশন)
              </div>
              <div className="text-[9pt] text-stone-600">
                {language === 'bn'
                  ? 'প্রকাশ্য আর্থিক স্বচ্ছতা ও বার্ষিক অডিট লেজার (অর্থবছর ২০২৫–২০২৬)'
                  : 'Public Financial Transparency & Annual Statutory Audit Ledger (FY 2025–2026)'}
              </div>
            </div>
            <div className="text-right text-[8.5pt] font-mono text-stone-600">
              <div>Reg No: DH-9842/2021</div>
              <div>{new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        {/* 3 Overview KPI Cards */}
        <div className="print-audit-kpi-grid grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="print-audit-kpi-card p-6 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800">
            <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
              {t.totalRaised}
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#167D78] dark:text-[#D6F36A] tabular-nums">
              ৳42,85,000
            </div>
            <div className="text-xs text-stone-400 mt-1">
              {language === 'bn' ? '১,২৪০+ জন শুভানুধ্যায়ী ও প্রতিষ্ঠানের অনুদান' : 'From 1,240+ verified donors'}
            </div>
          </div>

          <div className="print-audit-kpi-card p-6 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800">
            <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
              {t.totalSpent}
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#102B3F] dark:text-white tabular-nums">
              ৳38,15,000
            </div>
            <div className="text-xs text-stone-400 mt-1">
              {language === 'bn' ? 'সরাসরি ত্রাণ, চিকিৎসা সামগ্রী ও শিক্ষা উপকরণ' : 'Direct aid, relief kits & student supplies'}
            </div>
          </div>

          <div className="print-audit-kpi-card p-6 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800">
            <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
              {t.emergencyFund}
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#E6A15B] tabular-nums">
              ৳4,70,000
            </div>
            <div className="text-xs text-stone-400 mt-1">
              {language === 'bn' ? 'হঠাৎ জরুরি দুর্যোগ মোকাবেলায় সংরক্ষিত' : 'Instant reserve for rapid disaster response'}
            </div>
          </div>
        </div>

        {/* Live Donation Goal Progress Tracker */}
        <div className="mb-12">
          <DonationGoalProgress
            mode="campaign"
            language={language}
            projects={projects}
          />
        </div>

        {/* Visual Analytics Component: Historical Donation Trends & Category Impact */}
        <TransparencyAnalytics language={language} />

        {/* Detailed Category-wise Line Chart Component */}
        <DonationTrendChart language={language} className="mb-12" />

        {/* Expense Breakdown Visual Bar */}
        <div className="p-6 rounded-2xl bg-stone-50 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800 mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <span className="text-sm font-bold text-[#102B3F] dark:text-white">
              {t.expenseBreakdown}
            </span>
            <span className="text-xs text-stone-500">
              {language === 'bn' ? 'আন্তর্জাতিক হিসাব মানদণ্ড অনুযায়ী পরিচালিত' : 'Statutory Non-Profit Expenditure Standard'}
            </span>
          </div>

          {/* Segmented multi-color bar */}
          <div className="w-full h-3 rounded-full overflow-hidden flex mb-4 bg-stone-200 dark:bg-stone-800">
            <div style={{ width: '88%' }} className="bg-[#167D78] h-full" title="88% Field Programs" />
            <div style={{ width: '7%' }} className="bg-[#E6A15B] h-full" title="7% Logistics" />
            <div style={{ width: '5%' }} className="bg-[#102B3F] dark:bg-stone-600 h-full" title="5% Administration" />
          </div>

          {/* Clean Legend */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-[#167D78]" />
              <span className="text-stone-700 dark:text-stone-300 font-medium">{t.fieldPrograms}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-[#E6A15B]" />
              <span className="text-stone-700 dark:text-stone-300 font-medium">{t.logistics}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-[#102B3F] dark:bg-stone-600" />
              <span className="text-stone-700 dark:text-stone-300 font-medium">{t.adminOffice}</span>
            </div>
          </div>
        </div>

        {/* Public Live Ledger Search & Filter */}
        <div className="border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 sm:p-5 bg-stone-50/80 dark:bg-stone-900/80 border-b border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#102B3F] dark:text-white">
                {t.recentTransactions}
              </span>
              <span className="text-xs text-stone-400">({filteredRecords.length} records)</span>
            </div>

            <div className="no-print flex items-center gap-3">
              {/* Filter tabs */}
              <div className="flex items-center gap-1 p-1 bg-stone-200/70 dark:bg-stone-800 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setTypeFilter('all')}
                  className={`px-2.5 py-1 rounded-md cursor-pointer transition-colors ${typeFilter === 'all' ? 'bg-white dark:bg-[#102B3F] text-stone-900 dark:text-white shadow-xs' : 'text-stone-600 dark:text-stone-400'}`}
                >
                  {language === 'bn' ? 'সকল' : 'All'}
                </button>
                <button
                  onClick={() => setTypeFilter('income')}
                  className={`px-2.5 py-1 rounded-md cursor-pointer transition-colors ${typeFilter === 'income' ? 'bg-white dark:bg-[#102B3F] text-stone-900 dark:text-white shadow-xs' : 'text-stone-600 dark:text-stone-400'}`}
                >
                  {language === 'bn' ? 'আয় (Income)' : 'Income'}
                </button>
                <button
                  onClick={() => setTypeFilter('expense')}
                  className={`px-2.5 py-1 rounded-md cursor-pointer transition-colors ${typeFilter === 'expense' ? 'bg-white dark:bg-[#102B3F] text-stone-900 dark:text-white shadow-xs' : 'text-stone-600 dark:text-stone-400'}`}
                >
                  {language === 'bn' ? 'ব্যয় (Expense)' : 'Expense'}
                </button>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t.searchLedger}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#167D78] w-48 sm:w-60"
                />
              </div>
            </div>

          </div>

          {/* Table Container */}
          <div className="print-audit-table-wrapper overflow-x-auto">
            <table className="print-audit-table w-full text-left text-xs">
              <thead className="bg-stone-100/70 dark:bg-stone-900/60 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="py-3 px-4">{language === 'bn' ? 'তারিখ' : 'Date'}</th>
                  <th className="py-3 px-4">{language === 'bn' ? 'ভাউচার / রেফারেন্স' : 'Voucher'}</th>
                  <th className="py-3 px-4">{language === 'bn' ? 'খাত ও বিবরণ' : 'Category & Description'}</th>
                  <th className="py-3 px-4">{language === 'bn' ? 'ধরণ' : 'Type'}</th>
                  <th className="py-3 px-4 text-right">{language === 'bn' ? 'পরিমাণ (টাকা)' : 'Amount (BDT)'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80 bg-white dark:bg-[#0c1a24]">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-stone-400">
                      {language === 'bn' ? 'কোনো লেনদেন পাওয়া যায়নি।' : 'No records found matching your search.'}
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((rec) => {
                    const isIncome = rec.type === 'income';
                    return (
                      <tr key={rec.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap text-stone-500 font-medium">
                          {rec.date}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap font-mono font-semibold text-stone-700 dark:text-stone-300">
                          {rec.voucherNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-stone-900 dark:text-white">
                            {rec.category}
                          </div>
                          <div className="text-[11px] text-stone-500 line-clamp-1">
                            {language === 'bn' ? rec.descriptionBn : rec.descriptionEn}
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 font-semibold ${isIncome ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-600 dark:text-stone-400'}`}>
                            {isIncome ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                            <span>{isIncome ? (language === 'bn' ? 'অনুদান জমা' : 'Credit') : (language === 'bn' ? 'মাঠ খরচ' : 'Debit')}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-right font-bold tabular-nums text-stone-900 dark:text-white">
                          <span className={isIncome ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-800 dark:text-stone-200'}>
                            {isIncome ? '+' : '-'} {formatCurrency(rec.amount)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

      {/* Official Annual Audit Report Modal */}
      {showAuditModal && (
        <div className="print-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="print-modal-dialog bg-white dark:bg-[#0c1a24] max-w-2xl w-full rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-[#167D78]" />
                <div>
                  <h3 className="font-bold text-stone-900 dark:text-white text-base">
                    {language === 'bn' ? 'বার্ষিক সংবিধিবদ্ধ নিরীক্ষা প্রতিবেদন (Audit Report 2025-2026)' : 'Annual Statutory Audit Report 2025-2026'}
                  </h3>
                  <p className="print-only text-[8.5pt] text-stone-500">
                    CoLASH Foundation · Reg No: DH-9842/2021 · Statutory Audit Verification Copy
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAuditModal(false)}
                className="no-print p-1 text-stone-400 hover:text-stone-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="print-modal-scroll-body p-6 overflow-y-auto space-y-6 text-xs text-stone-700 dark:text-stone-300">
              
              <div className="p-4 bg-stone-50 dark:bg-stone-900/60 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2">
                <div className="font-bold text-sm text-[#102B3F] dark:text-white">
                  স্বতন্ত্র নিরীক্ষক সার্টিফিকেট ও মতামত (Independent Auditor's Opinion)
                </div>
                <p className="leading-relaxed">
                  আমরা কোলাশ ফাউন্ডেশনের ১ জুলাই ২০২৫ থেকে ৩০ জুন ২০২৬ পর্যন্ত সমাপ্ত অর্থবছরের আয় ও ব্যয়ের হিসাব পুঙ্খানুপুঙ্খভাবে নিরীক্ষা করেছি। আমাদের মতামত অনুযায়ী, ফাউন্ডেশনের হিসাব বিবরণী গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের এনজিও বিষয়ক ব্যুরো এবং সমাজসেবা অধিদপ্তরের আর্থিক নির্দেশিকা পুরোপুরি বজায় রেখে তৈরি করা হয়েছে।
                </p>
                <div className="text-[11px] text-stone-500 pt-1">
                  নিরীক্ষক: এস. আহমেদ অ্যান্ড কোং, চার্টার্ড অ্যাকাউন্ট্যান্টস (মহাখালী, ঢাকা)
                </div>
              </div>

              {/* Financial Snapshot Table */}
              <div>
                <h4 className="font-bold text-stone-900 dark:text-white mb-2">
                  {language === 'bn' ? 'আর্থিক সারসংক্ষেপ বিবরণী' : 'Financial Statement Summary'}
                </h4>
                <div className="print-audit-table-wrapper border border-stone-200 dark:border-stone-800 rounded-lg overflow-hidden">
                  <table className="print-audit-table w-full text-left">
                    <thead>
                      <tr>
                        <th>{language === 'bn' ? 'আর্থিক খাত / বিবরণ' : 'Account Line Item'}</th>
                        <th className="text-right">{language === 'bn' ? 'পরিমাণ (টাকা)' : 'Amount (BDT)'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                      <tr className="bg-stone-50 dark:bg-stone-900/40 font-medium">
                        <td className="p-2.5">প্রাথমিক প্রারম্ভিক তহবিল (Opening Balance)</td>
                        <td className="p-2.5 text-right font-mono tabular-nums">৳২,১৫,০০০</td>
                      </tr>
                      <tr>
                        <td className="p-2.5">মোট প্রাপ্ত সাধারণ ও জরুরি অনুদান (Donations Received)</td>
                        <td className="p-2.5 text-right font-mono tabular-nums font-semibold text-emerald-600">৳৪০,৭০,০০০</td>
                      </tr>
                      <tr>
                        <td className="p-2.5">মাঠপর্যায়ে সরাসরি কার্যক্রম ব্যয় (Direct Program Expenditure)</td>
                        <td className="p-2.5 text-right font-mono tabular-nums text-stone-800 dark:text-stone-200">(৳৩৫,৬০,০০০)</td>
                      </tr>
                      <tr>
                        <td className="p-2.5">পরিবহন, নৌকা ভাড়া ও মাঠ লজিস্টিকস (Field Logistics & Boats)</td>
                        <td className="p-2.5 text-right font-mono tabular-nums text-stone-800 dark:text-stone-200">(৳২,৫৫,০০০)</td>
                      </tr>
                      <tr>
                        <td className="p-2.5">দাপ্তরিক, নিরীক্ষা ও আইনি ব্যয় (Administrative & Statutory Audit)</td>
                        <td className="p-2.5 text-right font-mono tabular-nums text-stone-800 dark:text-stone-200">(৳১,৮৫,০০০)</td>
                      </tr>
                      <tr className="bg-stone-100 dark:bg-stone-800 font-bold">
                        <td className="p-2.5">সমাপনী আপদকালীন উদ্বৃত্ত তহবিল (Net Closing Reserve)</td>
                        <td className="p-2.5 text-right font-mono tabular-nums text-[#167D78] dark:text-[#D6F36A]">৳২,৮৫,০০০</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            <div className="no-print p-4 bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <button
                type="button"
                onClick={handleDownloadAuditFile}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-stone-700 dark:text-stone-200 border border-stone-300 dark:border-stone-700 rounded-lg cursor-pointer hover:bg-stone-100"
              >
                <Download className="w-3.5 h-3.5 text-[#167D78]" />
                <span>{language === 'bn' ? 'রিপোর্ট ফাইল ডাউনলোড' : 'Download Audit File'}</span>
              </button>
              
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#167D78] hover:bg-[#102B3F] rounded-lg transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'প্রিন্ট / সেভ করুন' : 'Print Statement'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Official Constitution & Audit Reports Archive Modal */}
      <ReportsArchiveModal
        isOpen={isReportsArchiveOpen}
        onClose={() => setIsReportsArchiveOpen(false)}
        language={language}
      />

    </section>
  );
};
