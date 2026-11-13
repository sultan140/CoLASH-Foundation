import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  Calendar,
  Filter,
  Bot,
  Shirt,
  Flower2,
  Clock,
  Eye,
  CheckCircle2,
  AlertCircle,
  Download,
  ThumbsUp,
  X,
  Sparkles
} from 'lucide-react';
import { Language, AIConversationLog, AIOptionType } from '../../types';

interface AIConversationHistoryPanelProps {
  language: Language;
  logs: AIConversationLog[];
  onToast: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
  onAddToKnowledgeBase?: (query: string, answer: string) => void;
}

export const AIConversationHistoryPanel: React.FC<AIConversationHistoryPanelProps> = ({
  language,
  logs,
  onToast,
  onAddToKnowledgeBase
}) => {
  const [selectedAIType, setSelectedAIType] = useState<'all' | AIOptionType>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<AIConversationLog | null>(null);

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchesAI = selectedAIType === 'all' || log.aiType === selectedAIType;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      log.userQuery.toLowerCase().includes(query) ||
      log.aiResponse.toLowerCase().includes(query) ||
      (log.category && log.category.toLowerCase().includes(query));

    // Date filter
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const logDate = new Date(log.timestamp.replace(' ', 'T')).getTime();
      const now = Date.now();
      if (dateFilter === 'today') {
        matchesDate = now - logDate <= 24 * 60 * 60 * 1000;
      } else if (dateFilter === '7days') {
        matchesDate = now - logDate <= 7 * 24 * 60 * 60 * 1000;
      } else if (dateFilter === '30days') {
        matchesDate = now - logDate <= 30 * 24 * 60 * 60 * 1000;
      }
    }

    return matchesAI && matchesSearch && matchesDate;
  });

  const getAIBadge = (type: AIOptionType) => {
    switch (type) {
      case 'mens_style':
        return {
          label: 'Men’s Dress & Style Advisor',
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200',
          icon: Shirt
        };
      case 'womens_style':
        return {
          label: 'Women’s Dress & Style Advisor',
          color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200',
          icon: Flower2
        };
      default:
        return {
          label: 'Main AI Chatbot',
          color: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-200',
          icon: Bot
        };
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'AI Type', 'Timestamp', 'User Query', 'Category', 'Status', 'Rating'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.aiType,
      l.timestamp,
      `"${l.userQuery.replace(/"/g, '""')}"`,
      `"${(l.category || '').replace(/"/g, '""')}"`,
      l.status,
      l.satisfactionRating || 5
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ai_conversation_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onToast('success', language === 'bn' ? 'হিস্ট্রি CSV এক্সপোর্ট হয়েছে' : 'History CSV exported');
  };

  return (
    <div className="space-y-6">

      {/* Header and Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900">
          <div className="text-xs text-teal-700 dark:text-teal-300 font-bold flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5" />
            <span>Main Chatbot</span>
          </div>
          <div className="text-2xl font-black text-teal-900 dark:text-white mt-1">
            {logs.filter(l => l.aiType === 'main').length}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
          <div className="text-xs text-blue-700 dark:text-blue-300 font-bold flex items-center gap-1.5">
            <Shirt className="w-3.5 h-3.5" />
            <span>Men’s Style Advisor</span>
          </div>
          <div className="text-2xl font-black text-blue-900 dark:text-white mt-1">
            {logs.filter(l => l.aiType === 'mens_style').length}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900">
          <div className="text-xs text-rose-700 dark:text-rose-300 font-bold flex items-center gap-1.5">
            <Flower2 className="w-3.5 h-3.5" />
            <span>Women’s Style Advisor</span>
          </div>
          <div className="text-2xl font-black text-rose-900 dark:text-white mt-1">
            {logs.filter(l => l.aiType === 'womens_style').length}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900">
          <div className="text-xs text-purple-700 dark:text-purple-300 font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>মোট সংরক্ষিত প্রশ্ন</span>
          </div>
          <div className="text-2xl font-black text-purple-900 dark:text-white mt-1">
            {logs.length}
          </div>
        </div>
      </div>

      {/* Filter and Tab Bar */}
      <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
        {/* 3 AI Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedAIType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedAIType === 'all'
                ? 'bg-[#102B3F] text-white'
                : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
            }`}
          >
            সকল AI অপশন ({logs.length})
          </button>

          <button
            onClick={() => setSelectedAIType('main')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedAIType === 'main'
                ? 'bg-[#167D78] text-white'
                : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Main AI Chatbot</span>
          </button>

          <button
            onClick={() => setSelectedAIType('mens_style')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedAIType === 'mens_style'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
            }`}
          >
            <Shirt className="w-3.5 h-3.5" />
            <span>Men’s Style Advisor</span>
          </button>

          <button
            onClick={() => setSelectedAIType('womens_style')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedAIType === 'womens_style'
                ? 'bg-rose-600 text-white'
                : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
            }`}
          >
            <Flower2 className="w-3.5 h-3.5" />
            <span>Women’s Style Advisor</span>
          </button>
        </div>

        {/* Search & Date Filter */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-2 border-t border-stone-200 dark:border-stone-800">
          <div className="flex-1 relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="প্রশ্ন বা উত্তরের কিওয়ার্ড দিয়ে খুঁজুন..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#167D78]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white text-xs"
            >
              <option value="all">সব তারিখ (All Time)</option>
              <option value="today">আজকের প্রশ্ন (Today)</option>
              <option value="7days">গত ৭ দিন (Last 7 Days)</option>
              <option value="30days">গত ৩০ দিন (Last 30 Days)</option>
            </select>

            <button
              onClick={handleExportCSV}
              className="px-3 py-2 rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 hover:bg-stone-100 text-stone-700 dark:text-stone-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV এক্সপোর্ট</span>
            </button>
          </div>
        </div>
      </div>

      {/* Conversation Cards List */}
      <div className="space-y-3">
        {filteredLogs.map((log) => {
          const badge = getAIBadge(log.aiType);
          const Icon = badge.icon;

          return (
            <div
              key={log.id}
              onClick={() => setSelectedLog(log)}
              className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0c1a24] hover:border-[#167D78] hover:shadow-md transition-all cursor-pointer space-y-2.5"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${badge.color}`}>
                    <Icon className="w-3 h-3" />
                    <span>{badge.label}</span>
                  </span>
                  {log.category && (
                    <span className="text-[10px] text-stone-500 font-medium">
                      • {log.category}
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-stone-400 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{log.timestamp}</span>
                </div>
              </div>

              {/* User Query */}
              <div className="text-xs font-bold text-stone-900 dark:text-white flex items-start gap-2">
                <span className="text-stone-400 font-normal">প্রশ্ন:</span>
                <span>{log.userQuery}</span>
              </div>

              {/* AI Response Preview */}
              <div className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                {log.aiResponse}
              </div>

              {/* Bottom Meta */}
              <div className="pt-2 border-t border-stone-100 dark:border-stone-900 flex items-center justify-between text-[11px] text-stone-400">
                <span>ব্যবহারকারী: {log.userName || 'ওয়েবসাইট ভিজিটর'}</span>
                <span className="text-[#167D78] dark:text-[#D6F36A] font-bold hover:underline">
                  সম্পূর্ণ কথোপকথন দেখুন →
                </span>
              </div>
            </div>
          );
        })}

        {filteredLogs.length === 0 && (
          <div className="p-8 text-center bg-white dark:bg-[#0c1a24] rounded-2xl border border-stone-200 dark:border-stone-800 text-stone-500 text-xs">
            এই ফিল্টারে কোনো এআই কথোপকথনের রেকর্ড পাওয়া যায়নি।
          </div>
        )}
      </div>

      {/* Detailed Conversation Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0c1a24] max-w-2xl w-full rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">

            {/* Modal Header */}
            <div className="bg-[#102B3F] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">AI কথোপকথন পর্যালোচনা</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20">
                    {selectedLog.aiType}
                  </span>
                </div>
                <div className="text-xs text-stone-300 mt-0.5">
                  তারিখ ও সময়: {selectedLog.timestamp}
                </div>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm">

              {/* Selected Options if any */}
              {selectedLog.optionsSelected && (
                <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-900 text-xs space-y-1">
                  <div className="font-bold text-stone-700 dark:text-stone-300">ব্যবহারকারীর অপশন নির্বাচন:</div>
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(selectedLog.optionsSelected).map(([k, v]) => (
                      <span key={k} className="px-2 py-0.5 rounded-md bg-white dark:bg-stone-800 border text-[11px]">
                        <strong>{k}:</strong> {String(v)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* User Question */}
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 space-y-1">
                <div className="text-[10px] font-extrabold uppercase text-stone-400">ভিজিটরের প্রশ্ন:</div>
                <div className="font-bold text-sm text-stone-900 dark:text-white">{selectedLog.userQuery}</div>
              </div>

              {/* AI Response */}
              <div className="p-4 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/60 space-y-2">
                <div className="text-[10px] font-extrabold uppercase text-[#167D78] dark:text-[#D6F36A] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI প্রদত্ত উত্তর:</span>
                </div>
                <div className="prose dark:prose-invert text-xs text-stone-800 dark:text-stone-200 whitespace-pre-line leading-relaxed">
                  {selectedLog.aiResponse}
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
              {onAddToKnowledgeBase && (
                <button
                  type="button"
                  onClick={() => {
                    onAddToKnowledgeBase(selectedLog.userQuery, selectedLog.aiResponse);
                    setSelectedLog(null);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-[#167D78] text-white text-xs font-bold hover:bg-[#126863] cursor-pointer transition-colors"
                >
                  + নলেজ বেসে যোগ করুন
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 rounded-lg bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold cursor-pointer ml-auto"
              >
                বন্ধ করুন
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
