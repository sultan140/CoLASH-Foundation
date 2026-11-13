import React, { useState } from 'react';
import { Heart, MapPin, Users, ArrowUpRight, CheckCircle2, X } from 'lucide-react';
import { Project, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { AnimatedProgressBar } from './common/AnimatedProgressBar';

interface ProjectsSectionProps {
  projects: Project[];
  language: Language;
  onSelectProjectForDonation: (project: Project) => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  projects,
  language,
  onSelectProjectForDonation
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeModalProject, setActiveModalProject] = useState<Project | null>(null);

  const t = TRANSLATIONS[language];

  const categories = [
    { id: 'all', label: t.categoryAll },
    { id: 'education', label: t.categoryEducation },
    { id: 'relief', label: t.categoryRelief },
    { id: 'health', label: t.categoryHealth },
    { id: 'winter', label: t.categoryWinter },
    { id: 'empowerment', label: t.categoryEmpowerment },
  ];

  const filteredProjects = selectedCategory === 'all'
    ? projects
    : projects.filter(p => p.category === selectedCategory);

  const formatCurrency = (val: number) => {
    return `৳${val.toLocaleString('en-IN')}`;
  };

  const renderPersonInfo = (val: any, fallback: string) => {
    if (!val) return fallback;
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      const name = val.nameBn || val.nameEn || '';
      const des = val.designationBn || val.designationEn || '';
      return des ? `${name} (${des})` : name || fallback;
    }
    return fallback;
  };

  return (
    <section id="projects" className="py-14 sm:py-20 bg-stone-50 dark:bg-[#08131b] border-t border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="text-xs uppercase tracking-widest font-bold text-[#167D78] dark:text-[#D6F36A] mb-1.5">
              {language === 'bn' ? 'সরাসরি জনকল্যাণ' : 'Direct Ground Interventions'}
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#102B3F] dark:text-white tracking-tight">
              {t.projectsTitle}
            </h2>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 mt-2 max-w-2xl">
              {t.projectsSubtitle}
            </p>
          </div>

          {/* Interactive Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-stone-200/80 dark:bg-stone-800/80 rounded-xl">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-white dark:bg-[#102B3F] text-[#102B3F] dark:text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, idx) => {
            const percent = Math.min(100, Math.round((project.raisedAmount / project.targetAmount) * 100));

            return (
              <div
                key={project.id}
                className="bg-white dark:bg-[#0d1c27] rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col hover:shadow-lg transition-all group"
              >
                {/* Visual Media Header */}
                <div className="relative h-52 w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
                  <img
                    src={project.image}
                    alt={language === 'bn' ? project.titleBn : project.titleEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  
                  {project.urgent && (
                    <div className="absolute top-3 right-3 bg-[#E6A15B] text-[#102B3F] text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm">
                      {language === 'bn' ? 'জরুরি ফান্ড প্রয়োজন' : 'Urgent Appeal'}
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1 rounded-md flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-[#D6F36A]" />
                    <span className="truncate max-w-[200px]">
                      {language === 'bn' ? project.locationBn : project.locationEn}
                    </span>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#102B3F] dark:text-white line-clamp-2 leading-snug mb-2">
                      {language === 'bn' ? project.titleBn : project.titleEn}
                    </h3>

                    <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed mb-4">
                      {language === 'bn' ? project.descriptionBn : project.descriptionEn}
                    </p>

                    {/* Funding Progress Bar */}
                    <div className="space-y-1.5 mb-5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#102B3F] dark:text-white tabular-nums">
                          {formatCurrency(project.raisedAmount)}
                        </span>
                        <span className="text-stone-500 dark:text-stone-400 tabular-nums">
                          {percent}% ({t.target}: {formatCurrency(project.targetAmount)})
                        </span>
                      </div>
                      <AnimatedProgressBar
                        targetPercent={percent}
                        delayMs={(idx % 3) * 90}
                        trackClassName="w-full h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden"
                        fillClassName="h-full bg-gradient-to-r from-[#167D78] to-[#D6F36A] rounded-full"
                      />
                    </div>

                    {/* Unboxed Metadata with Dot Separators */}
                    <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#167D78]" />
                        <span>{project.donorsCount} {t.donors}</span>
                      </span>
                      <span>·</span>
                      <span>{project.beneficiariesCount} {t.beneficiaries}</span>
                    </div>

                    {/* Proposed By & Approved By Badges (Requirement 4) */}
                    <div className="mb-4 pt-2 border-t border-stone-100 dark:border-stone-800/80 text-[11px] space-y-1">
                      <div className="flex items-center justify-between text-stone-600 dark:text-stone-300">
                        <span className="text-stone-400">{language === 'bn' ? 'প্রস্তাবক:' : 'Proposed By:'}</span>
                        <span className="font-semibold truncate max-w-[170px]">
                          {renderPersonInfo(project.proposedBy, language === 'bn' ? 'কার্যনির্বাহী পরিষদ' : 'Executive Council')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-stone-600 dark:text-stone-300">
                        <span className="text-stone-400">{language === 'bn' ? 'অনুমোদন:' : 'Approved By:'}</span>
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400 truncate max-w-[170px]">
                          {renderPersonInfo(project.approvedBy, language === 'bn' ? 'মোঃ আশরাফুল ইসলাম সুলতান (প্রতিষ্ঠাতা ও সভাপতি)' : 'Md. Ashraful Islam Sultan (Founder & President)')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
                    <button
                      onClick={() => onSelectProjectForDonation(project)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-white bg-[#167D78] hover:bg-[#102B3F] dark:hover:bg-[#125854] rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                      <Heart className="w-3.5 h-3.5 fill-current text-[#D6F36A]" />
                      <span>{t.donateThis}</span>
                    </button>

                    <button
                      onClick={() => setActiveModalProject(project)}
                      className="p-2.5 text-stone-600 dark:text-stone-300 hover:text-[#167D78] dark:hover:text-[#D6F36A] hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
                      title={t.viewDetails}
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Project Impact Details Modal */}
      {activeModalProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0c1a24] max-w-2xl w-full rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="relative h-60 w-full bg-stone-900">
              <img
                src={activeModalProject.image}
                alt={language === 'bn' ? activeModalProject.titleBn : activeModalProject.titleEn}
                className="w-full h-full object-cover opacity-90"
              />
              <button
                onClick={() => setActiveModalProject(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="text-xs uppercase tracking-wider font-bold text-[#D6F36A] mb-1 block">
                  {language === 'bn' ? 'প্রকল্পের বাস্তব অগ্রগতি' : 'Ground Project Overview'}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold leading-tight">
                  {language === 'bn' ? activeModalProject.titleBn : activeModalProject.titleEn}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              <div>
                <h4 className="text-xs uppercase font-bold text-stone-400 mb-1">
                  {language === 'bn' ? 'কার্যক্রম বিবরণ' : 'Objective & Scope'}
                </h4>
                <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                  {language === 'bn' ? activeModalProject.descriptionBn : activeModalProject.descriptionEn}
                </p>
              </div>

              {/* Progress and KPIs */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-stone-50 dark:bg-stone-900/50 rounded-xl border border-stone-200 dark:border-stone-800 text-center">
                <div>
                  <div className="text-xs text-stone-500">{t.raised}</div>
                  <div className="text-sm sm:text-base font-bold text-[#167D78] tabular-nums">
                    {formatCurrency(activeModalProject.raisedAmount)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-stone-500">{t.target}</div>
                  <div className="text-sm sm:text-base font-bold text-stone-900 dark:text-white tabular-nums">
                    {formatCurrency(activeModalProject.targetAmount)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-stone-500">{t.beneficiaries}</div>
                  <div className="text-sm sm:text-base font-bold text-[#E6A15B] tabular-nums">
                    {activeModalProject.beneficiariesCount}
                  </div>
                </div>
              </div>

              {/* Organizational Governance & Approval Trail (Requirement 4) */}
              <div className="p-4 bg-stone-50 dark:bg-stone-900/50 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2.5 text-xs">
                <h4 className="uppercase font-bold text-[#167D78] dark:text-[#D6F36A] text-[11px] tracking-wider">
                  {language === 'bn' ? 'সাংগঠনিক প্রস্তাবনা ও প্রাতিষ্ঠানিক অনুমোদন বিবরণী' : 'Organizational Proposal & Executive Approval'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">{language === 'bn' ? 'প্রকল্প প্রস্তাবক' : 'Proposed By'}</span>
                    <span className="font-bold text-stone-900 dark:text-white">
                      {renderPersonInfo(activeModalProject.proposedBy, language === 'bn' ? 'কার্যনির্বাহী পরিষদ' : 'Executive Council')}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">{language === 'bn' ? 'চূড়ান্ত অনুমোদনকারী' : 'Approved By'}</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {renderPersonInfo(activeModalProject.approvedBy, language === 'bn' ? 'মোঃ আশরাফুল ইসলাম সুলতান (প্রতিষ্ঠাতা ও সভাপতি)' : 'Md. Ashraful Islam Sultan (Founder & President)')}
                    </span>
                  </div>
                </div>
                {activeModalProject.approvalHistory && activeModalProject.approvalHistory.length > 0 && (
                  <div className="pt-2 border-t border-stone-200 dark:border-stone-800 space-y-1">
                    <span className="text-[10px] text-stone-400 font-bold uppercase">{language === 'bn' ? 'অনুমোদন লগ ও সিদ্ধান্তের ইতিহাস:' : 'Approval History Trail:'}</span>
                    {activeModalProject.approvalHistory.map((hist, hIdx) => (
                      <div key={hIdx} className="text-[11px] text-stone-600 dark:text-stone-300 flex items-center justify-between">
                        <span>• {hist.userName} ({hist.role}) - <strong className="text-emerald-600 capitalize">{hist.action}</strong></span>
                        <span className="font-mono text-[10px] text-stone-400">{hist.timestamp}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Milestones / Impact Updates */}
              <div>
                <h4 className="text-xs uppercase font-bold text-stone-400 mb-3">
                  {language === 'bn' ? 'মাঠপর্যায়ের সর্বশেষ আপডেট' : 'Verified Field Milestones'}
                </h4>
                <div className="space-y-3">
                  {activeModalProject.impactUpdates.map((update, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-700/60">
                      <CheckCircle2 className="w-4 h-4 text-[#167D78] shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-semibold text-stone-400 block mb-0.5">{update.date}</span>
                        <p className="text-stone-800 dark:text-stone-200">
                          {language === 'bn' ? update.textBn : update.textEn}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer CTA */}
            <div className="p-4 bg-stone-50 dark:bg-[#0e2130] border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <span className="text-xs text-stone-500 dark:text-stone-400">
                {language === 'bn' ? 'সকল অনুদানে সাথে সাথে ই-রসিদ প্রদান করা হয়' : 'Official receipt issued instantly'}
              </span>
              <button
                onClick={() => {
                  const p = activeModalProject;
                  setActiveModalProject(null);
                  onSelectProjectForDonation(p);
                }}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#167D78] hover:bg-[#102B3F] rounded-lg transition-colors cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 fill-current text-[#D6F36A]" />
                <span>{t.donateThis}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
