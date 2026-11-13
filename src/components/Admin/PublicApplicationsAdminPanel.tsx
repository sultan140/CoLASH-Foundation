import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Send,
  Mail,
  Phone,
  Eye,
  Edit2,
  Copy,
  Check,
  Download,
  Calendar,
  X,
  MessageSquare
} from 'lucide-react';
import { Language, PublicApplication, PublicApplicationStatus, PublicApplicationType } from '../../types';

interface PublicApplicationsAdminPanelProps {
  language: Language;
  applications: PublicApplication[];
  onUpdateApplication: (app: PublicApplication) => void;
  onToast: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
  currentAdminName: string;
}

export const PublicApplicationsAdminPanel: React.FC<PublicApplicationsAdminPanelProps> = ({
  language,
  applications,
  onUpdateApplication,
  onToast,
  currentAdminName
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | PublicApplicationType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | PublicApplicationStatus>('all');

  // Selected Application for View / Reply
  const [selectedApp, setSelectedApp] = useState<PublicApplication | null>(null);
  const [replyText, setReplyText] = useState('');
  const [newStatus, setNewStatus] = useState<PublicApplicationStatus>('resolved');
  const [internalNotes, setInternalNotes] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  // Filtered List
  const filteredApps = applications.filter(app => {
    const matchesCat = categoryFilter === 'all' || app.category === categoryFilter;
    const matchesStat = statusFilter === 'all' || app.status === statusFilter;
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      !query ||
      app.trackingId.toLowerCase().includes(query) ||
      app.name.toLowerCase().includes(query) ||
      app.phone.includes(query) ||
      app.subject.toLowerCase().includes(query);

    return matchesCat && matchesStat && matchesSearch;
  });

  const handleOpenApp = (app: PublicApplication) => {
    setSelectedApp(app);
    setReplyText(app.adminReply || '');
    setNewStatus(app.status);
    setInternalNotes(app.internalNotes || '');
  };

  const handleSaveReply = (sendEmail = false) => {
    if (!selectedApp) return;

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const updatedApp: PublicApplication = {
      ...selectedApp,
      adminReply: replyText.trim() || undefined,
      repliedAt: replyText.trim() ? nowStr : selectedApp.repliedAt,
      repliedBy: replyText.trim() ? currentAdminName : selectedApp.repliedBy,
      status: newStatus,
      internalNotes: internalNotes.trim() || undefined,
      updatedAt: nowStr
    };

    onUpdateApplication(updatedApp);
    setSelectedApp(updatedApp);

    if (sendEmail && selectedApp.email) {
      // Trigger mailto link or simulated delivery
      const mailtoUrl = `mailto:${selectedApp.email}?subject=${encodeURIComponent(
        `CoLASH Foundation - ${selectedApp.trackingId} আবেদনের উত্তর`
      )}&body=${encodeURIComponent(
        `প্রিয় ${selectedApp.name},\n\nআপনার আবেদন (Tracking ID: ${selectedApp.trackingId}) এর প্রেক্ষিতে আমাদের সিদ্ধান্ত:\n\n${replyText}\n\nধন্যবাদ,\n${currentAdminName}\nCoLASH Foundation Secretariat`
      )}`;
      window.open(mailtoUrl, '_blank');
      onToast(
        'success',
        language === 'bn' ? 'উত্তর সংরক্ষিত হয়েছে এবং ইমেইল প্রস্তুত' : 'Reply Saved & Email Composed',
        selectedApp.email
      );
    } else {
      onToast(
        'success',
        language === 'bn' ? 'আবেদনের উত্তর ও স্ট্যাটাস সংরক্ষিত' : 'Status & Reply Updated',
        `ID: ${selectedApp.trackingId}`
      );
    }
  };

  // Quick Reply Template helper
  const applyTemplate = (tmpl: string) => {
    if (tmpl === 'verified') {
      setReplyText(
        'আপনার আবেদনটি আমাদের ফিল্ড টিম সরেজমিনে যাচাই করেছে এবং তা অনুমোদন করা হয়েছে। আগামী ৩ কার্যদিবসের মধ্যে স্থানীয় ভলান্টিয়ার টিম সামগ্রী বিতরণের ব্যবস্থা করবে।'
      );
      setNewStatus('in_progress');
    } else if (tmpl === 'info_needed') {
      setReplyText(
        'আপনার আবেদনটি পর্যালোচনা করা হয়েছে। চূড়ান্ত অনুমোদনের জন্য আপনার জাতীয় পরিচয়পত্র ও স্থানীয় প্রতিনিধির প্রত্যয়নপত্র প্রয়োজন। অনুগ্রহ করে আমাদের হটলাইনে যোগাযোগ করুন।'
      );
      setNewStatus('under_review');
    } else if (tmpl === 'resolved') {
      setReplyText(
        'আপনার অভিযোগ/পরামর্শটি গুরুত্বের সাথে বিবেচনা করে যথাযথ ব্যবস্থা গ্রহণ ও সমাধান নিশ্চিত করা হয়েছে। CoLASH Foundation-এর সাথে থাকার জন্য ধন্যবাদ।'
      );
      setNewStatus('resolved');
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Tracking ID', 'Category', 'Name', 'Phone', 'District', 'Subject', 'Status', 'Date', 'Admin Reply'];
    const rows = filteredApps.map(a => [
      a.trackingId,
      a.category,
      `"${a.name.replace(/"/g, '""')}"`,
      a.phone,
      `"${(a.district || '').replace(/"/g, '""')}"`,
      `"${a.subject.replace(/"/g, '""')}"`,
      a.status,
      a.createdAt,
      `"${(a.adminReply || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `colash_applications_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onToast('success', language === 'bn' ? 'CSV ফাইল ডাউনলোড হয়েছে' : 'CSV Exported');
  };

  return (
    <div className="space-y-6">

      {/* Top Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
          <div className="text-xs text-amber-700 dark:text-amber-300 font-bold">অপেক্ষমাণ (Pending)</div>
          <div className="text-2xl font-black text-amber-900 dark:text-white mt-1">
            {applications.filter(a => a.status === 'pending').length}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
          <div className="text-xs text-blue-700 dark:text-blue-300 font-bold">প্রক্রিয়াধীন (In Progress)</div>
          <div className="text-2xl font-black text-blue-900 dark:text-white mt-1">
            {applications.filter(a => a.status === 'in_progress' || a.status === 'under_review').length}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
          <div className="text-xs text-emerald-700 dark:text-emerald-300 font-bold">নিষ্পত্তি / উত্তর দেওয়া</div>
          <div className="text-2xl font-black text-emerald-900 dark:text-white mt-1">
            {applications.filter(a => a.status === 'resolved').length}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900">
          <div className="text-xs text-purple-700 dark:text-purple-300 font-bold">মোট আবেদন ও বার্তা</div>
          <div className="text-2xl font-black text-purple-900 dark:text-white mt-1">
            {applications.length}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex-1 relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'bn' ? 'ট্র্যাকিং আইডি, নাম, মোবাইল বা বিষয় লিখে খুঁজুন...' : 'Search by ID, name, phone, subject...'}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#167D78]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white text-xs"
          >
            <option value="all">সকল ক্যাটাগরি</option>
            <option value="complaint">অভিযোগ (Complaint)</option>
            <option value="aid_request">সাহায্যের আবেদন (Aid Request)</option>
            <option value="message">সাধারণ বার্তা (Message)</option>
            <option value="feedback">পরামর্শ (Feedback)</option>
            <option value="volunteer">ভলান্টিয়ার আবেদন</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white text-xs"
          >
            <option value="all">সকল অবস্থা (All Status)</option>
            <option value="pending">অপেক্ষমাণ (Pending)</option>
            <option value="under_review">পর্যালোচনাধীন (Under Review)</option>
            <option value="in_progress">প্রক্রিয়াধীন (In Progress)</option>
            <option value="resolved">সমাধানকৃত (Resolved)</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 hover:bg-stone-100 text-stone-700 dark:text-stone-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV এক্সপোর্ট</span>
          </button>
        </div>
      </div>

      {/* Applications Table / Cards */}
      <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0c1a24]">
        <table className="w-full text-left text-xs">
          <thead className="bg-stone-100 dark:bg-stone-900/80 text-stone-700 dark:text-stone-300 uppercase tracking-wider font-bold border-b border-stone-200 dark:border-stone-800">
            <tr>
              <th className="p-3">ট্র্যাকিং আইডি</th>
              <th className="p-3">আবেদনকারী</th>
              <th className="p-3">ক্যাটাগরি</th>
              <th className="p-3">বিষয়</th>
              <th className="p-3">তারিখ</th>
              <th className="p-3">স্ট্যাটাস</th>
              <th className="p-3 text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
            {filteredApps.map((app) => (
              <tr key={app.id} className="hover:bg-stone-50 dark:hover:bg-stone-900/40 transition-colors">
                <td className="p-3 font-mono font-bold text-[#167D78] dark:text-[#D6F36A] whitespace-nowrap">
                  {app.trackingId}
                </td>
                <td className="p-3">
                  <div className="font-bold text-stone-900 dark:text-white">{app.name}</div>
                  <div className="text-[11px] text-stone-500 font-mono">{app.phone}</div>
                </td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                    {app.category}
                  </span>
                </td>
                <td className="p-3 font-medium text-stone-800 dark:text-stone-200 max-w-xs truncate" title={app.subject}>
                  {app.subject}
                </td>
                <td className="p-3 text-stone-500 whitespace-nowrap text-[11px]">
                  {app.createdAt.slice(0, 10)}
                </td>
                <td className="p-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    app.status === 'resolved'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : app.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      : app.status === 'under_review'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300'
                  }`}>
                    {app.status}
                  </span>
                </td>
                <td className="p-3 text-right whitespace-nowrap">
                  <button
                    onClick={() => handleOpenApp(app)}
                    className="px-3 py-1.5 rounded-lg bg-[#167D78] hover:bg-[#126863] text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 ml-auto"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>উত্তর / পর্যালোচনা</span>
                  </button>
                </td>
              </tr>
            ))}

            {filteredApps.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-stone-500 text-xs">
                  কোনো আবেদন বা বার্তার রেকর্ড খুঁজে পাওয়া যায়নি।
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Reply & Details Modal / Drawer */}
      {selectedApp && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0c1a24] max-w-2xl w-full rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">

            {/* Modal Header */}
            <div className="bg-[#102B3F] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-black text-[#D6F36A]">
                    {selectedApp.trackingId}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20">
                    {selectedApp.category}
                  </span>
                </div>
                <div className="text-xs text-stone-300 mt-0.5">
                  আবেদনকারী: {selectedApp.name} ({selectedApp.phone})
                </div>
              </div>
              <button onClick={() => setSelectedApp(null)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm">

              {/* Applicant Message */}
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2">
                <div className="text-xs font-bold text-stone-500 uppercase">মূল আবেদন / বার্তা:</div>
                <h4 className="font-bold text-sm text-stone-900 dark:text-white">{selectedApp.subject}</h4>
                <p className="text-xs text-stone-700 dark:text-stone-300 whitespace-pre-line leading-relaxed">
                  {selectedApp.message}
                </p>
                <div className="text-[11px] text-stone-400 pt-2 border-t border-stone-200 dark:border-stone-800 flex gap-4">
                  <span>ঠিকানা: {selectedApp.district || 'উল্লেখ নেই'}</span>
                  <span>তারিখ: {selectedApp.createdAt}</span>
                  {selectedApp.email && <span>ইমেইল: {selectedApp.email}</span>}
                </div>
              </div>

              {/* Quick Template Buttons */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  দ্রুত উত্তরের টেমপ্লেট নির্বাচন করুন:
                </label>
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => applyTemplate('verified')}
                    className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-xs font-medium cursor-pointer"
                  >
                    ✓ যাচাইকৃত ও অনুমোদিত
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate('info_needed')}
                    className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-xs font-medium cursor-pointer"
                  >
                    ℹ️ অতিরিক্ত তথ্য প্রয়োজন
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate('resolved')}
                    className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-xs font-medium cursor-pointer"
                  >
                    ★ সমাধানকৃত / নিষ্পত্তি
                  </button>
                </div>
              </div>

              {/* Admin Reply Composer */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  অফিসিয়াল উত্তর (যা ব্যবহারকারী ট্র্যাকিং পেজে দেখতে পাবেন) *:
                </label>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="ব্যবহারকারীর জন্য পরিষ্কার উত্তর বা সিদ্ধান্ত লিখুন..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#167D78]"
                ></textarea>
              </div>

              {/* Status Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    স্ট্যাটাস আপডেট করুন:
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-white text-xs font-bold"
                  >
                    <option value="pending">অপেক্ষমাণ (Pending)</option>
                    <option value="under_review">পর্যালোচনাধীন (Under Review)</option>
                    <option value="in_progress">প্রক্রিয়াধীন (In Progress)</option>
                    <option value="resolved">সমাধানকৃত / উত্তর দেওয়া হয়েছে (Resolved)</option>
                    <option value="closed">সমাপ্ত (Closed)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    অভ্যন্তরীণ অ্যাডমিন নোট (ব্যবহারকারী দেখবেন না):
                  </label>
                  <input
                    type="text"
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="যেমন: ফিল্ড অফিসার পরিদর্শন করেছেন"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-white text-xs"
                  />
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold cursor-pointer"
              >
                বাতিল
              </button>

              <div className="flex items-center gap-2">
                {selectedApp.email && (
                  <button
                    type="button"
                    onClick={() => handleSaveReply(true)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>উত্তর সংরক্ষণ ও ইমেইল পাঠান</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleSaveReply(false)}
                  className="px-5 py-2 rounded-xl bg-[#167D78] hover:bg-[#126863] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>উত্তর সংরক্ষণ ও ট্র্যাকিং আপডেট</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
