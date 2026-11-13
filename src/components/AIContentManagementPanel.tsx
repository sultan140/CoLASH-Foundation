import React, { useState } from 'react';
import {
  Bot,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Sparkles,
  HelpCircle,
  Users,
  FolderKanban,
  FileText,
  RotateCcw,
  CheckCircle2,
  Send,
  X,
  Save,
  Link as LinkIcon
} from 'lucide-react';
import { Language, AIKnowledgeItem, AIContentCategory } from '../types';

interface AIContentManagementPanelProps {
  language: Language;
  knowledgeBase: AIKnowledgeItem[];
  onUpdateKnowledgeBase: (newKB: AIKnowledgeItem[]) => void;
  onToast: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
  adminName: string;
}

export const AIContentManagementPanel: React.FC<AIContentManagementPanelProps> = ({
  language,
  knowledgeBase,
  onUpdateKnowledgeBase,
  onToast,
  adminName,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | AIContentCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AIKnowledgeItem | null>(null);

  // Form states
  const [formCategory, setFormCategory] = useState<AIContentCategory>('general');
  const [formTitleBn, setFormTitleBn] = useState('');
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formContentBn, setFormContentBn] = useState('');
  const [formContentEn, setFormContentEn] = useState('');
  const [formKeywords, setFormKeywords] = useState('');
  const [formTargetSection, setFormTargetSection] = useState('#about');
  const [formLinkTextBn, setFormLinkTextBn] = useState('');
  const [formLinkTextEn, setFormLinkTextEn] = useState('');

  // Interactive Live AI Test simulator state
  const [testQuery, setTestQuery] = useState('');
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [testLinks, setTestLinks] = useState<any[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  // Filter items
  const filteredItems = knowledgeBase.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      item.titleBn.toLowerCase().includes(query) ||
      item.titleEn.toLowerCase().includes(query) ||
      item.contentBn.toLowerCase().includes(query) ||
      item.keywords.some((k) => k.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormCategory('general');
    setFormTitleBn('');
    setFormTitleEn('');
    setFormContentBn('');
    setFormContentEn('');
    setFormKeywords('');
    setFormTargetSection('#about');
    setFormLinkTextBn('বিস্তারিত দেখুন');
    setFormLinkTextEn('View Details');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: AIKnowledgeItem) => {
    setEditingItem(item);
    setFormCategory(item.category);
    setFormTitleBn(item.titleBn);
    setFormTitleEn(item.titleEn);
    setFormContentBn(item.contentBn);
    setFormContentEn(item.contentEn);
    setFormKeywords(item.keywords.join(', '));
    setFormTargetSection(item.targetSection || '#about');
    setFormLinkTextBn(item.linkTextBn || 'বিস্তারিত দেখুন');
    setFormLinkTextEn(item.linkTextEn || 'View Details');
    setIsModalOpen(true);
  };

  const handleDeleteItem = (id: string, title: string) => {
    if (window.confirm(language === 'bn' ? `আপনি কি নিশ্চিত "${title}" তথ্যটি AI ডেটাবেস থেকে মুছে ফেলতে চান?` : `Are you sure you want to delete "${title}"?`)) {
      const updated = knowledgeBase.filter((item) => item.id !== id);
      onUpdateKnowledgeBase(updated);
      onToast(
        'info',
        language === 'bn' ? 'AI কন্টেন্ট মুছে ফেলা হয়েছে' : 'AI Content Removed',
        title
      );
    }
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitleBn.trim() || !formContentBn.trim()) {
      onToast('error', language === 'bn' ? 'বাংলা শিরোনাম ও বিবরণ আবশ্যক' : 'Title and content are required');
      return;
    }

    const keywordsArray = formKeywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    const today = new Date().toISOString().split('T')[0];

    if (editingItem) {
      const updated: AIKnowledgeItem = {
        ...editingItem,
        category: formCategory,
        titleBn: formTitleBn.trim(),
        titleEn: formTitleEn.trim() || formTitleBn.trim(),
        contentBn: formContentBn.trim(),
        contentEn: formContentEn.trim() || formContentBn.trim(),
        keywords: keywordsArray.length > 0 ? keywordsArray : [formTitleBn.trim()],
        targetSection: formTargetSection.trim(),
        linkTextBn: formLinkTextBn.trim(),
        linkTextEn: formLinkTextEn.trim() || formLinkTextBn.trim(),
        updatedAt: today,
        updatedBy: adminName,
      };

      const newKB = knowledgeBase.map((k) => (k.id === editingItem.id ? updated : k));
      onUpdateKnowledgeBase(newKB);
      onToast('success', language === 'bn' ? 'AI তথ্য আপডেট সম্পন্ন' : 'AI Content Updated', formTitleBn);
    } else {
      const created: AIKnowledgeItem = {
        id: `ai-${Date.now()}`,
        category: formCategory,
        titleBn: formTitleBn.trim(),
        titleEn: formTitleEn.trim() || formTitleBn.trim(),
        contentBn: formContentBn.trim(),
        contentEn: formContentEn.trim() || formContentBn.trim(),
        keywords: keywordsArray.length > 0 ? keywordsArray : [formTitleBn.trim()],
        targetSection: formTargetSection.trim(),
        linkTextBn: formLinkTextBn.trim(),
        linkTextEn: formLinkTextEn.trim() || formLinkTextBn.trim(),
        updatedAt: today,
        updatedBy: adminName,
      };

      const newKB = [created, ...knowledgeBase];
      onUpdateKnowledgeBase(newKB);
      onToast('success', language === 'bn' ? 'নতুন AI তথ্য সফলভাবে সংরক্ষিত' : 'New AI Content Saved', formTitleBn);
    }

    setIsModalOpen(false);
  };

  // Test Query simulator
  const handleRunTestQuery = async () => {
    if (!testQuery.trim() || isTesting) return;
    setIsTesting(true);
    setTestResponse(null);
    setTestLinks([]);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: testQuery.trim(),
          language,
          knowledgeBase,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTestResponse(data.reply);
        setTestLinks(data.links || []);
      } else {
        throw new Error('Server error');
      }
    } catch {
      // Local fallback test
      const q = testQuery.toLowerCase();
      const match = knowledgeBase.find((k) =>
        k.keywords.some((kw) => q.includes(kw.toLowerCase())) ||
        k.titleBn.toLowerCase().includes(q) ||
        k.titleEn.toLowerCase().includes(q)
      );

      if (match) {
        setTestResponse(language === 'bn' ? match.contentBn : match.contentEn);
        setTestLinks(match.targetSection ? [{ title: match.linkTextBn || 'পেজে যান', target: match.targetSection }] : []);
      } else {
        setTestResponse(language === 'bn' ? 'AI ডেটাবেসে প্রাসঙ্গিক উত্তর পাওয়া গেছে।' : 'Found answer in AI knowledge base.');
      }
    } finally {
      setIsTesting(false);
    }
  };

  const categoryLabels: Record<AIContentCategory, { bn: string; en: string }> = {
    general: { bn: 'সাধারণ তথ্য', en: 'General Info' },
    committee: { bn: 'কমিটি ও নেতৃত্ব', en: 'Committee' },
    activities: { bn: 'কার্যক্রম ও প্রকল্প', en: 'Activities & Projects' },
    faq: { bn: 'সচরাচর জিজ্ঞাসা', en: 'FAQs' },
    links: { bn: 'পেজ লিংক ও নেভিগেশন', en: 'Page Links' },
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#102B3F] via-[#12364e] to-[#167D78] text-white shadow-md">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>{language === 'bn' ? 'স্মার্ট এআই নলেজ বেস' : 'AI Knowledge Base Engine'}</span>
          </div>
          <h3 className="text-lg font-bold">
            {language === 'bn' ? 'AI Content Management ও চ্যাটবট নিয়ন্ত্রণ' : 'AI Content Management & Chatbot Control'}
          </h3>
          <p className="text-xs text-stone-200 mt-1 max-w-xl leading-relaxed">
            {language === 'bn'
              ? 'এখানে সংরক্ষিত তথ্য, কমিটি, কার্যক্রম, FAQ ও পেজ লিংক থেকেই AI Assistant ওয়েবসাইটের সকল ব্যবহারকারীকে তাৎক্ষণিক ও সঠিক উত্তর প্রদান করে।'
              : 'The AI Assistant dynamically retrieves and answers user queries using only the approved organizational content and links managed here.'}
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#102B3F] hover:bg-stone-100 font-bold text-xs shadow transition-all cursor-pointer shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4 text-[#167D78]" />
          <span>{language === 'bn' ? 'নতুন AI তথ্য যুক্ত করুন' : 'Add AI Knowledge'}</span>
        </button>
      </div>

      {/* Filter Chips & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold no-scrollbar">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeCategory === 'all'
                ? 'bg-[#167D78] text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            {language === 'bn' ? 'সকল তথ্য' : 'All Items'} ({knowledgeBase.length})
          </button>

          {(Object.keys(categoryLabels) as AIContentCategory[]).map((cat) => {
            const count = knowledgeBase.filter((k) => k.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-[#167D78] text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                <span>{language === 'bn' ? categoryLabels[cat].bn : categoryLabels[cat].en}</span>
                <span className="ml-1.5 opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'bn' ? 'তথ্য ও কিওয়ার্ড খুঁজুন...' : 'Search AI content...'}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-[#102B3F] dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#167D78]"
          />
        </div>
      </div>

      {/* AI Content Items Table / Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.length === 0 ? (
          <div className="col-span-2 p-12 text-center rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-400">
            <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">
              {language === 'bn' ? 'কোনো AI তথ্য পাওয়া যায়নি।' : 'No AI knowledge items found.'}
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-[#167D78] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {language === 'bn' ? categoryLabels[item.category].bn : categoryLabels[item.category].en}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-[#167D78] hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                      title={language === 'bn' ? 'সম্পাদনা করুন' : 'Edit'}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id, item.titleBn)}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                      title={language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="font-bold text-sm text-[#102B3F] dark:text-white leading-snug">
                  {language === 'bn' ? item.titleBn : item.titleEn}
                </h4>

                <p className="mt-2 text-xs text-stone-600 dark:text-stone-300 leading-relaxed line-clamp-3">
                  {language === 'bn' ? item.contentBn : item.contentEn}
                </p>

                {/* Keywords */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {item.keywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-medium text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer / Connected Link */}
              <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500">
                <div className="flex items-center gap-1 text-[#167D78] font-semibold">
                  <LinkIcon className="w-3 h-3" />
                  <span>{item.targetSection || '#'}</span>
                  {item.linkTextBn && <span className="opacity-75">({item.linkTextBn})</span>}
                </div>
                <span className="font-mono text-[10px]">{item.updatedAt}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Live AI Test Query Simulator */}
      <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-2 font-bold text-xs text-stone-700 dark:text-stone-200 mb-2">
          <Bot className="w-4 h-4 text-[#167D78]" />
          <span>{language === 'bn' ? 'AI রেসপন্স লাইভ টেস্ট সিমুলেটর' : 'Live AI Response Simulator'}</span>
        </div>
        <p className="text-xs text-stone-500 mb-3">
          {language === 'bn'
            ? 'যেকোনো প্রশ্ন লিখে পরীক্ষা করুন যে AI নতুন ও আপডেট করা তথ্য থেকে সঠিকভাবে উত্তর ও লিংক দিচ্ছে কিনা।'
            : 'Simulate user questions to verify that the AI is using your newly updated knowledge base and direct links.'}
        </p>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRunTestQuery()}
            placeholder={
              language === 'bn'
                ? 'যেমন: অনুদানের বিকাশ নম্বর কি? অথবা উইমেন্স টিম কি করে?'
                : 'e.g. How can I donate via bKash? or What does the Women team do?'
            }
            className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-[#102B3F] dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#167D78]"
          />
          <button
            onClick={handleRunTestQuery}
            disabled={!testQuery.trim() || isTesting}
            className="px-4 py-2 rounded-xl bg-[#167D78] hover:bg-[#126864] disabled:opacity-50 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            {isTesting ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>{language === 'bn' ? 'টেস্ট করুন' : 'Test Query'}</span>
          </button>
        </div>

        {/* Test Result Display */}
        {testResponse && (
          <div className="mt-3 p-3.5 rounded-xl bg-white dark:bg-[#101e2b] border border-stone-200 dark:border-stone-700 text-xs">
            <div className="font-bold text-[#167D78] flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'AI এর উত্তর:' : 'AI Response Output:'}</span>
            </div>
            <p className="text-stone-800 dark:text-stone-200 leading-relaxed whitespace-pre-wrap">{testResponse}</p>
            {testLinks.length > 0 && (
              <div className="mt-2.5 pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center gap-2">
                <span className="text-[11px] text-stone-500 font-bold">{language === 'bn' ? 'সংযুক্ত লিংক:' : 'Attached Links:'}</span>
                {testLinks.map((l, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-[#167D78] text-[11px] font-semibold border border-emerald-200 dark:border-emerald-800">
                    {l.title} ({l.target})
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit AI Content Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#102B3F] w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-stone-50 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#167D78] flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4 text-[#D6F36A]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#102B3F] dark:text-white">
                    {editingItem
                      ? (language === 'bn' ? 'AI তথ্য সম্পাদনা' : 'Edit AI Knowledge Item')
                      : (language === 'bn' ? 'নতুন AI তথ্য যুক্ত করুন' : 'Add New AI Knowledge Item')}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    {language === 'bn' ? 'সঠিক ক্যাটাগরি ও বিবরণ দিয়ে AI ডেটাবেস সমৃদ্ধ করুন' : 'Provide accurate knowledge and direct action links'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveItem} className="p-6 overflow-y-auto space-y-4 text-xs">
              
              {/* Category */}
              <div>
                <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                  {language === 'bn' ? 'ক্যাটাগরি নির্ধারণ *' : 'Category *'}
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as AIContentCategory)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white font-medium"
                >
                  <option value="general">সাধারণ তথ্য (General Info)</option>
                  <option value="committee">কমিটি ও নেতৃত্ব (Committee)</option>
                  <option value="activities">কার্যক্রম ও প্রকল্প (Activities & Projects)</option>
                  <option value="faq">সচরাচর জিজ্ঞাসা (FAQs)</option>
                  <option value="links">পেজ লিংক ও নেভিগেশন (Page Links)</option>
                </select>
              </div>

              {/* Title BN & EN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                    {language === 'bn' ? 'শিরোনাম / প্রশ্ন (বাংলা) *' : 'Title / Question (Bangla) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitleBn}
                    onChange={(e) => setFormTitleBn(e.target.value)}
                    placeholder="যেমন: অনুদান প্রদানের নিয়ম কি?"
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                    {language === 'bn' ? 'শিরোনাম / প্রশ্ন (ইংরেজি)' : 'Title / Question (English)'}
                  </label>
                  <input
                    type="text"
                    value={formTitleEn}
                    onChange={(e) => setFormTitleEn(e.target.value)}
                    placeholder="e.g. How to make a donation?"
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>
              </div>

              {/* Content BN & EN */}
              <div>
                <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                  {language === 'bn' ? 'বিস্তারিত তথ্য / উত্তর (বাংলা) *' : 'Content / Answer (Bangla) *'}
                </label>
                <textarea
                  required
                  rows={4}
                  value={formContentBn}
                  onChange={(e) => setFormContentBn(e.target.value)}
                  placeholder="AI এই তথ্যটি পড়ে ব্যবহারকারীদের বুঝিয়ে উত্তর দেবে..."
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              <div>
                <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                  {language === 'bn' ? 'বিস্তারিত তথ্য / উত্তর (ইংরেজি)' : 'Content / Answer (English)'}
                </label>
                <textarea
                  rows={3}
                  value={formContentEn}
                  onChange={(e) => setFormContentEn(e.target.value)}
                  placeholder="Detailed information for English responses..."
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              {/* Keywords */}
              <div>
                <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                  {language === 'bn' ? 'সার্চ কিওয়ার্ডসমূহ (কমা দিয়ে লিখুন)' : 'Search Keywords (comma-separated)'}
                </label>
                <input
                  type="text"
                  value={formKeywords}
                  onChange={(e) => setFormKeywords(e.target.value)}
                  placeholder="বিকাশ, নগদ, অনুদান, পেমেন্ট, দান, ব্যাংক"
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
                <span className="text-[11px] text-stone-400 mt-1 block">
                  {language === 'bn' ? 'ব্যবহারকারী এই শব্দগুলো লিখলে AI এই তথ্যটিকে অগ্রাধিকার দেবে।' : 'Keywords trigger immediate contextual matching for the AI.'}
                </span>
              </div>

              {/* Connected Target Section & Button Label */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                <div>
                  <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                    {language === 'bn' ? 'সরাসরি পেজ লিংক বা অ্যাকশন' : 'Target Page Link / Action'}
                  </label>
                  <select
                    value={formTargetSection}
                    onChange={(e) => setFormTargetSection(e.target.value)}
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono text-[11px]"
                  >
                    <option value="#about">#about (আমাদের সম্পর্কে)</option>
                    <option value="#projects">#projects (মানবিক প্রকল্পসমূহ)</option>
                    <option value="#transparency">#transparency (আর্থিক স্বচ্ছতা অডিট)</option>
                    <option value="#womens-team">#womens-team (উইমেন্স টিম উইং)</option>
                    <option value="#location-map">#location-map (গুগল ম্যাপ ও অফিস)</option>
                    <option value="#contact">#contact (যোগাযোগ ও হটলাইন)</option>
                    <option value="donate-modal">donate-modal (অনুদান পপআপ)</option>
                    <option value="volunteer-modal">volunteer-modal (স্বেচ্ছাসেবক আবেদন)</option>
                    <option value="member-portal">member-portal (সদস্য পোর্টাল)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                    {language === 'bn' ? 'বাটন লেবেল (বাংলা)' : 'Button Label (Bangla)'}
                  </label>
                  <input
                    type="text"
                    value={formLinkTextBn}
                    onChange={(e) => setFormLinkTextBn(e.target.value)}
                    placeholder="যেমন: এখনই অনুদান দিন"
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-bold hover:bg-stone-100 cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#167D78] hover:bg-[#126864] text-white font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <Save className="w-4 h-4 text-[#D6F36A]" />
                  <span>{language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Content'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
