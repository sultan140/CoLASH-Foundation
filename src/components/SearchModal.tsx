import React, { useState } from 'react';
import { Search, X, Heart, FileText, ArrowRight, Users, Crown, Shield, MapPin, Droplets, Calendar } from 'lucide-react';
import { Project, NoticeItem, Language, TeamMember, GeneralMember, AdvisoryCouncilMember } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  projects: Project[];
  notices: NoticeItem[];
  team?: TeamMember[];
  generalMembers?: GeneralMember[];
  advisors?: AdvisoryCouncilMember[];
  onSelectProject: (project: Project) => void;
  onSelectMember?: (member: any) => void;
  onSelectNotice?: (notice: NoticeItem) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  language,
  projects,
  notices,
  team = [],
  generalMembers = [],
  advisors = [],
  onSelectProject,
  onSelectMember,
  onSelectNotice
}) => {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'projects' | 'members' | 'notices'>('all');

  // Close on Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const formatPerson = (val: any, fallback = ''): string => {
    if (!val) return fallback;
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      const name = val.nameBn || val.nameEn || '';
      const des = val.designationBn || val.designationEn || '';
      return des ? `${name} (${des})` : name || fallback;
    }
    return fallback;
  };

  const filteredProjects = projects.filter(p =>
    !q ||
    (p.titleBn + ' ' + p.titleEn + ' ' + p.locationBn + ' ' + p.locationEn + ' ' + p.category + ' ' + formatPerson(p.proposedBy) + ' ' + formatPerson(p.approvedBy))
      .toLowerCase()
      .includes(q)
  );

  const filteredNotices = notices.filter(n =>
    !q ||
    (n.titleBn + ' ' + n.titleEn + ' ' + n.bodyBn + ' ' + n.bodyEn + ' ' + formatPerson(n.publishedBy))
      .toLowerCase()
      .includes(q)
  );

  const filteredLeaders = team.filter(m =>
    !q ||
    (m.nameBn + ' ' + m.nameEn + ' ' + m.roleBn + ' ' + m.roleEn + ' ' + (m.district || '') + ' ' + (m.bloodGroup || ''))
      .toLowerCase()
      .includes(q)
  );

  const filteredGeneralMembers = generalMembers.filter(m => {
    const isApproved = m.approvalStatus === 'approved' || (!m.approvalStatus && m.status === 'active');
    if (!isApproved) return false;
    return !q ||
      (m.nameBn + ' ' + m.nameEn + ' ' + m.membershipId + ' ' + m.district + ' ' + m.bloodGroup + ' ' + m.roleBn)
        .toLowerCase()
        .includes(q);
  });

  const filteredAdvisors = advisors.filter(a =>
    !q ||
    (a.nameBn + ' ' + a.nameEn + ' ' + a.designationBn + ' ' + a.organizationBn)
      .toLowerCase()
      .includes(q)
  );

  const totalResults =
    (categoryFilter === 'all' || categoryFilter === 'projects' ? filteredProjects.length : 0) +
    (categoryFilter === 'all' || categoryFilter === 'notices' ? filteredNotices.length : 0) +
    (categoryFilter === 'all' || categoryFilter === 'members' ? (filteredLeaders.length + filteredGeneralMembers.length + filteredAdvisors.length) : 0);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-[#0c1a24] max-w-2xl w-full rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col my-4">
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#167D78] shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder={language === 'bn' ? 'প্রকল্প, কর্মকর্তা, সাধারণ সদস্য, রক্তদাতা বা নোটিশ খুঁজুন...' : 'Search projects, leaders, blood donors, notices...'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none"
          />
          <button 
            onClick={onClose} 
            className="p-2 text-stone-400 hover:text-stone-900 dark:hover:text-white rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-all cursor-pointer flex items-center justify-center shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="px-4 py-2 border-b border-stone-100 dark:border-stone-800 flex items-center gap-1.5 overflow-x-auto text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              categoryFilter === 'all' ? 'bg-[#167D78] text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
            }`}
          >
            {language === 'bn' ? 'সকল ফলাফল' : 'All Categories'}
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('projects')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              categoryFilter === 'projects' ? 'bg-[#167D78] text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
            }`}
          >
            {language === 'bn' ? `প্রকল্প (${filteredProjects.length})` : `Projects (${filteredProjects.length})`}
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('members')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              categoryFilter === 'members' ? 'bg-[#167D78] text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
            }`}
          >
            {language === 'bn' ? `সদস্য ও উপদেষ্টা (${filteredLeaders.length + filteredGeneralMembers.length + filteredAdvisors.length})` : `Members & Advisors`}
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('notices')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              categoryFilter === 'notices' ? 'bg-[#167D78] text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
            }`}
          >
            {language === 'bn' ? `নোটিশ (${filteredNotices.length})` : `Notices (${filteredNotices.length})`}
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[70vh] overflow-y-auto p-4 space-y-5 text-xs">
          {query.trim() === '' ? (
            <div className="py-8 text-center text-stone-400 space-y-1">
              <p className="font-semibold text-stone-600 dark:text-stone-300">
                {language === 'bn' ? 'কোলাশ ফাউন্ডেশনের পূর্ণাঙ্গ তথ্যভাণ্ডার অনুসন্ধান করুন' : 'Search CoLASH Foundation Database'}
              </p>
              <p className="text-[11px]">
                {language === 'bn' ? 'যেমন লিখুন: বন্যা, আশরাফুল, O+, কমলগঞ্জ, শিক্ষা, সদস্য আইডি' : 'Try searching: Flood relief, Ashraful, O+, Kamalganj...'}
              </p>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-8 text-center text-stone-400">
              {language === 'bn' ? '“' + query + '” সংক্রান্ত কোনো তথ্য পাওয়া যায়নি।' : 'No records found matching “' + query + '”.'}
            </div>
          ) : (
            <>
              {/* Project matches */}
              {(categoryFilter === 'all' || categoryFilter === 'projects') && filteredProjects.length > 0 && (
                <div>
                  <span className="font-bold text-stone-400 uppercase tracking-wider text-[10px] block mb-2">
                    {language === 'bn' ? 'প্রকল্প ও উদ্যোগ' : 'Causes & Projects'} ({filteredProjects.length})
                  </span>
                  <div className="space-y-2">
                    {filteredProjects.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onClose();
                          onSelectProject(p);
                        }}
                        className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/60 hover:bg-[#167D78]/10 border border-stone-200 dark:border-stone-800 cursor-pointer flex items-center justify-between group transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Heart className="w-4 h-4 text-[#167D78]" />
                          <div>
                            <h4 className="font-bold text-stone-900 dark:text-white group-hover:text-[#167D78]">
                              {language === 'bn' ? p.titleBn : p.titleEn}
                            </h4>
                            <span className="text-[10px] text-stone-400">
                              {p.locationBn} · টার্গেট: ৳{p.targetAmount.toLocaleString()} · প্রস্তাবক: {formatPerson(p.proposedBy, 'পরিষদ')}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#167D78]" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Committee Leader matches */}
              {(categoryFilter === 'all' || categoryFilter === 'members') && filteredLeaders.length > 0 && (
                <div>
                  <span className="font-bold text-stone-400 uppercase tracking-wider text-[10px] block mb-2">
                    {language === 'bn' ? 'কার্যনির্বাহী পরিষদ' : 'Executive Council Leaders'} ({filteredLeaders.length})
                  </span>
                  <div className="space-y-2">
                    {filteredLeaders.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          onClose();
                          if (onSelectMember) onSelectMember(m);
                        }}
                        className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/60 hover:bg-[#167D78]/10 border border-stone-200 dark:border-stone-800 cursor-pointer flex items-center justify-between group transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 border border-stone-300 dark:border-stone-700 bg-stone-200">
                            <img src={m.image} alt={m.nameBn} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h4 className="font-bold text-stone-900 dark:text-white group-hover:text-[#167D78] flex items-center gap-1.5">
                              <span>{language === 'bn' ? m.nameBn : m.nameEn}</span>
                              {m.isFounder && <Crown className="w-3 h-3 text-amber-500" />}
                            </h4>
                            <span className="text-[10px] text-[#167D78] dark:text-[#D6F36A] font-semibold">
                              {language === 'bn' ? m.roleBn : m.roleEn}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#167D78]" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* General Member matches */}
              {(categoryFilter === 'all' || categoryFilter === 'members') && filteredGeneralMembers.length > 0 && (
                <div>
                  <span className="font-bold text-stone-400 uppercase tracking-wider text-[10px] block mb-2">
                    {language === 'bn' ? 'সাধারণ সদস্য ও রক্তদাতা' : 'General Members & Donors'} ({filteredGeneralMembers.length})
                  </span>
                  <div className="space-y-2">
                    {filteredGeneralMembers.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          onClose();
                          if (onSelectMember) onSelectMember(m);
                        }}
                        className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/60 hover:bg-[#167D78]/10 border border-stone-200 dark:border-stone-800 cursor-pointer flex items-center justify-between group transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 border border-stone-300 dark:border-stone-700 bg-stone-200">
                            <img src={m.avatar} alt={m.nameBn} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h4 className="font-bold text-stone-900 dark:text-white group-hover:text-[#167D78]">
                              {language === 'bn' ? m.nameBn : m.nameEn}
                            </h4>
                            <div className="flex items-center gap-2 text-[10px] text-stone-400 font-mono">
                              <span>ID: {m.membershipId}</span>
                              <span>•</span>
                              <span className="text-rose-500 font-bold">{m.bloodGroup}</span>
                              <span>•</span>
                              <span>{m.district}</span>
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#167D78]" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Advisory Council matches */}
              {(categoryFilter === 'all' || categoryFilter === 'members') && filteredAdvisors.length > 0 && (
                <div>
                  <span className="font-bold text-stone-400 uppercase tracking-wider text-[10px] block mb-2">
                    {language === 'bn' ? 'উপদেষ্টামণ্ডলী' : 'Advisory Council'} ({filteredAdvisors.length})
                  </span>
                  <div className="space-y-2">
                    {filteredAdvisors.map((a) => (
                      <div
                        key={a.id}
                        onClick={() => {
                          onClose();
                          if (onSelectMember) onSelectMember(a);
                        }}
                        className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/60 hover:bg-[#167D78]/10 border border-stone-200 dark:border-stone-800 cursor-pointer flex items-center justify-between group transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 border border-stone-300 dark:border-stone-700 bg-stone-200">
                            <img src={a.image} alt={a.nameBn} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h4 className="font-bold text-stone-900 dark:text-white group-hover:text-[#167D78]">
                              {language === 'bn' ? a.nameBn : a.nameEn}
                            </h4>
                            <span className="text-[10px] text-stone-500">
                              {language === 'bn' ? a.designationBn : a.designationEn} · {language === 'bn' ? a.organizationBn : a.organizationEn}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#167D78]" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notice matches */}
              {(categoryFilter === 'all' || categoryFilter === 'notices') && filteredNotices.length > 0 && (
                <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
                  <span className="font-bold text-stone-400 uppercase tracking-wider text-[10px] block mb-2">
                    {language === 'bn' ? 'ঘোষণা ও নোটিশ' : 'Notices & Bulletins'} ({filteredNotices.length})
                  </span>
                  <div className="space-y-2">
                    {filteredNotices.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          onClose();
                          if (onSelectNotice) onSelectNotice(n);
                        }}
                        className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/60 hover:bg-[#167D78]/10 border border-stone-200 dark:border-stone-800 cursor-pointer group transition-colors"
                      >
                        <div className="flex items-center justify-between font-bold text-stone-900 dark:text-white group-hover:text-[#167D78] dark:group-hover:text-[#D6F36A]">
                          <span className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-[#E6A15B]" />
                            <span>{language === 'bn' ? n.titleBn : n.titleEn}</span>
                          </span>
                          <span className="text-[10px] text-stone-400 font-mono font-normal">{n.date}</span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-1 line-clamp-1">{n.bodyBn}</p>
                        <div className="flex items-center justify-between mt-1">
                          {n.publishedBy ? (
                            <div className="text-[10px] text-[#167D78] font-semibold">
                              {language === 'bn' ? 'জারি করেছেন:' : 'Issued by:'} {formatPerson(n.publishedBy)}
                            </div>
                          ) : <span />}
                          <span className="text-[10px] font-bold text-[#167D78] dark:text-[#D6F36A] flex items-center gap-0.5">
                            <span>{language === 'bn' ? 'খুলুন' : 'Open'}</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};
