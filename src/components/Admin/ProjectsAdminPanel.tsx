import React, { useState, useRef } from 'react';
import {
  FolderHeart,
  Plus,
  Edit3,
  Trash2,
  Search,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  MapPin,
  Users,
  Target,
  Sparkles,
  Save,
  X,
  Clock,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { Project, Language, AdminUser } from '../../types';
import { compressImageFile } from '../../utils/imageCompressor';

interface ProjectsAdminPanelProps {
  currentAdmin: AdminUser | null;
  language: Language;
  projects: Project[];
  onAddNewProject: (project: Project) => void;
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onToast: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
}

export const ProjectsAdminPanel: React.FC<ProjectsAdminPanelProps> = ({
  currentAdmin,
  language,
  projects,
  onAddNewProject,
  onUpdateProject,
  onDeleteProject,
  onToast
}) => {
  const isSuperAdmin = currentAdmin?.role === 'super_admin';
  const canManage = isSuperAdmin || Boolean(currentAdmin?.permissions.canManageProjects);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form State
  const [titleBn, setTitleBn] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [category, setCategory] = useState<Project['category']>('relief');
  const [targetAmount, setTargetAmount] = useState<number>(100000);
  const [raisedAmount, setRaisedAmount] = useState<number>(0);
  const [donorsCount, setDonorsCount] = useState<number>(0);
  const [beneficiariesCount, setBeneficiariesCount] = useState<number>(500);
  const [locationBn, setLocationBn] = useState('কমলগঞ্জ, মৌলভীবাজার');
  const [locationEn, setLocationEn] = useState('Kamalganj, Moulvibazar');
  const [imageUrl, setImageUrl] = useState('');
  const [descriptionBn, setDescriptionBn] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [status, setStatus] = useState<'active' | 'completed' | 'urgent'>('active');
  const [isUrgent, setIsUrgent] = useState(false);

  // Impact update input
  const [newUpdateDate, setNewUpdateDate] = useState(new Date().toISOString().split('T')[0]);
  const [newUpdateTextBn, setNewUpdateTextBn] = useState('');
  const [newUpdateTextEn, setNewUpdateTextEn] = useState('');
  const [impactUpdates, setImpactUpdates] = useState<{ date: string; textBn: string; textEn: string }[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const openAddModal = () => {
    setEditingProject(null);
    setTitleBn('');
    setTitleEn('');
    setCategory('relief');
    setTargetAmount(150000);
    setRaisedAmount(0);
    setDonorsCount(0);
    setBeneficiariesCount(500);
    setLocationBn('কমলগঞ্জ, মৌলভীবাজার');
    setLocationEn('Kamalganj, Moulvibazar');
    setImageUrl('https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80');
    setDescriptionBn('');
    setDescriptionEn('');
    setStatus('active');
    setIsUrgent(false);
    setImpactUpdates([]);
    setIsModalOpen(true);
  };

  const openEditModal = (proj: Project) => {
    setEditingProject(proj);
    setTitleBn(proj.titleBn);
    setTitleEn(proj.titleEn);
    setCategory(proj.category);
    setTargetAmount(proj.targetAmount);
    setRaisedAmount(proj.raisedAmount);
    setDonorsCount(proj.donorsCount || 0);
    setBeneficiariesCount(proj.beneficiariesCount || 0);
    setLocationBn(proj.locationBn);
    setLocationEn(proj.locationEn);
    setImageUrl(proj.image);
    setDescriptionBn(proj.descriptionBn);
    setDescriptionEn(proj.descriptionEn);
    setStatus(proj.status);
    setIsUrgent(Boolean(proj.urgent || proj.status === 'urgent'));
    setImpactUpdates(proj.impactUpdates || []);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 6 * 1024 * 1024) {
      onToast('error', language === 'bn' ? 'ফাইলের আকার বড়' : 'File too large', language === 'bn' ? 'সর্বোচ্চ ৬ মেগাবাইট সাইজের ছবি দিন।' : 'Max 6MB.');
      return;
    }

    try {
      const compressed = await compressImageFile(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.82,
        format: 'image/webp'
      });
      setImageUrl(compressed.dataUrl);
    } catch {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setImageUrl(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddImpactUpdate = () => {
    if (!newUpdateTextBn.trim()) {
      onToast('error', language === 'bn' ? 'আপডেট বিবরণ দিন' : 'Enter update text');
      return;
    }
    const newEntry = {
      date: newUpdateDate || new Date().toISOString().split('T')[0],
      textBn: newUpdateTextBn.trim(),
      textEn: newUpdateTextEn.trim() || newUpdateTextBn.trim()
    };
    setImpactUpdates([newEntry, ...impactUpdates]);
    setNewUpdateTextBn('');
    setNewUpdateTextEn('');
  };

  const handleRemoveImpactUpdate = (idx: number) => {
    setImpactUpdates(impactUpdates.filter((_, i) => i !== idx));
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) {
      onToast('error', language === 'bn' ? 'অনুমতি নেই' : 'Permission Denied');
      return;
    }

    if (!titleBn.trim()) {
      onToast('error', language === 'bn' ? 'প্রকল্পের নাম আবশ্যক' : 'Project title required');
      return;
    }

    const targetVal = Number(targetAmount) || 0;
    const raisedVal = Number(raisedAmount) || 0;

    if (editingProject) {
      const updated: Project = {
        ...editingProject,
        titleBn: titleBn.trim(),
        titleEn: titleEn.trim() || titleBn.trim(),
        category,
        targetAmount: targetVal,
        raisedAmount: raisedVal,
        donorsCount: Number(donorsCount) || 0,
        beneficiariesCount: Number(beneficiariesCount) || 0,
        locationBn: locationBn.trim(),
        locationEn: locationEn.trim() || locationBn.trim(),
        image: imageUrl || editingProject.image,
        descriptionBn: descriptionBn.trim(),
        descriptionEn: descriptionEn.trim() || descriptionBn.trim(),
        status: isUrgent ? 'urgent' : status,
        urgent: isUrgent || status === 'urgent',
        impactUpdates
      };
      onUpdateProject(updated);
      onToast('success', language === 'bn' ? 'প্রকল্প সফলভাবে হালনাগাদ করা হয়েছে!' : 'Project Updated Successfully!', updated.titleBn);
    } else {
      const newProj: Project = {
        id: `proj-${Date.now().toString().slice(-4)}`,
        titleBn: titleBn.trim(),
        titleEn: titleEn.trim() || titleBn.trim(),
        category,
        targetAmount: targetVal,
        raisedAmount: raisedVal,
        donorsCount: Number(donorsCount) || 0,
        beneficiariesCount: Number(beneficiariesCount) || 0,
        locationBn: locationBn.trim(),
        locationEn: locationEn.trim() || locationBn.trim(),
        image: imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
        descriptionBn: descriptionBn.trim(),
        descriptionEn: descriptionEn.trim() || descriptionBn.trim(),
        status: isUrgent ? 'urgent' : status,
        urgent: isUrgent || status === 'urgent',
        impactUpdates
      };
      onAddNewProject(newProj);
      onToast('success', language === 'bn' ? 'নতুন প্রকল্প সফলভাবে তৈরি হয়েছে!' : 'New Project Created!', newProj.titleBn);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (proj: Project) => {
    if (!canManage) {
      onToast('error', language === 'bn' ? 'অনুমতি নেই' : 'Permission Denied');
      return;
    }
    if (window.confirm(language === 'bn' ? `আপনি কি নিশ্চিতভাবে "${proj.titleBn}" প্রকল্পটি মুছে ফেলতে চান?` : `Delete project "${proj.titleEn}"?`)) {
      onDeleteProject(proj.id);
      onToast('info', language === 'bn' ? 'প্রকল্প মুছে ফেলা হয়েছে' : 'Project Deleted', proj.titleBn);
    }
  };

  // Filter projects
  const filteredProjects = projects.filter(p => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (statusFilter !== 'all') {
      if (statusFilter === 'urgent' && !p.urgent && p.status !== 'urgent') return false;
      if (statusFilter === 'completed' && p.status !== 'completed') return false;
      if (statusFilter === 'active' && p.status !== 'active') return false;
    }
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.titleBn.toLowerCase().includes(q) ||
      p.titleEn.toLowerCase().includes(q) ||
      p.locationBn.toLowerCase().includes(q) ||
      p.descriptionBn.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#102B3F] to-[#167D78] text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#D6F36A] text-xs font-bold uppercase tracking-wider mb-2">
            <FolderHeart className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'উদ্যোগ ও প্রকল্প পরিচালনা কেন্দ্র' : 'Initiatives & Project Management'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black">
            {language === 'bn' ? 'মানবিক প্রকল্প তৈরি, বাজেট ও তথ্য সম্পাদনা' : 'Project Editor, Budget & Live Updates'}
          </h3>
          <p className="text-xs sm:text-sm text-stone-200 mt-1 max-w-2xl leading-relaxed">
            {language === 'bn'
              ? 'ওয়েবসাইটে প্রদর্শিত সকল মানবিক প্রকল্পের নাম, ছবি, বিবরণ, বাজেট, সংগৃহীত অনুদান, জরুরি স্ট্যাটাস ও ফিল্ড আপডেট কোড ছাড়াই পরিবর্তন করুন।'
              : 'Add, edit, and update humanitarian relief projects, target budgets, raised funds, photos, and field impact updates without code.'}
          </p>
        </div>

        {canManage && (
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-[#D6F36A] hover:bg-[#c5e458] text-[#102B3F] font-bold text-xs cursor-pointer shadow-sm flex items-center gap-2 shrink-0 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'bn' ? 'নতুন প্রকল্প তৈরি করুন' : 'Create New Project'}</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0c1a24] p-3 rounded-2xl border border-stone-200 dark:border-stone-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'bn' ? 'প্রকল্পের নাম বা এলাকা দিয়ে খুঁজুন...' : 'Search projects...'}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#167D78]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white cursor-pointer"
          >
            <option value="all">{language === 'bn' ? 'সকল ক্যাটাগরি' : 'All Categories'}</option>
            <option value="relief">{language === 'bn' ? 'জরুরি ত্রাণ (Relief)' : 'Relief'}</option>
            <option value="education">{language === 'bn' ? 'শিক্ষা (Education)' : 'Education'}</option>
            <option value="health">{language === 'bn' ? 'স্বাস্থ্যসেবা (Health)' : 'Health'}</option>
            <option value="winter">{language === 'bn' ? 'শীতবস্ত্র (Winter)' : 'Winter'}</option>
            <option value="empowerment">{language === 'bn' ? 'স্বাবলম্বীকরণ (Livelihood)' : 'Livelihood'}</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white cursor-pointer"
          >
            <option value="all">{language === 'bn' ? 'সকল স্ট্যাটাস' : 'All Status'}</option>
            <option value="active">{language === 'bn' ? 'চলমান (Active)' : 'Active'}</option>
            <option value="urgent">{language === 'bn' ? 'জরুরি (Urgent)' : 'Urgent'}</option>
            <option value="completed">{language === 'bn' ? 'সম্পন্ন (Completed)' : 'Completed'}</option>
          </select>

          <span className="text-xs text-stone-500 pl-2">
            {language === 'bn' ? `মোট: ${filteredProjects.length}টি প্রকল্প` : `Total: ${filteredProjects.length}`}
          </span>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map((p) => {
          const progress = Math.min(100, Math.round((p.raisedAmount / (p.targetAmount || 1)) * 100));
          return (
            <div
              key={p.id}
              className="bg-white dark:bg-[#0c1a24] rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs hover:border-[#167D78] transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Project Image Banner */}
                <div className="relative h-44 overflow-hidden bg-stone-100 dark:bg-stone-800">
                  <img
                    src={p.image}
                    alt={p.titleBn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#102B3F]/90 text-white backdrop-blur-xs">
                      {p.category}
                    </span>
                    {(p.urgent || p.status === 'urgent') && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow-xs">
                        {language === 'bn' ? 'জরুরি' : 'Urgent'}
                      </span>
                    )}
                    {p.status === 'completed' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                        {language === 'bn' ? 'সম্পন্ন' : 'Completed'}
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] flex items-center gap-1 font-mono">
                    <MapPin className="w-3 h-3 text-[#D6F36A]" />
                    <span>{p.locationBn}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2.5">
                  <h4 className="font-extrabold text-sm text-[#102B3F] dark:text-white line-clamp-2 leading-snug">
                    {p.titleBn}
                  </h4>
                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    {p.descriptionBn}
                  </p>

                  {/* Progress bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#167D78] dark:text-[#D6F36A]">
                        ৳{p.raisedAmount.toLocaleString()}
                      </span>
                      <span className="text-stone-400 font-mono text-[11px]">
                        লক্ষ্য: ৳{p.targetAmount.toLocaleString()} ({progress}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#167D78] to-[#D6F36A] rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-100 dark:border-stone-800/80">
                    <span>উপকৃত: {p.beneficiariesCount?.toLocaleString() || 0} জন</span>
                    <span>দাতা: {p.donorsCount?.toLocaleString() || 0} জন</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {canManage && (
                <div className="p-3 bg-stone-50 dark:bg-stone-900/60 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => openEditModal(p)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-[#167D78] text-[#167D78] dark:text-[#D6F36A] text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'প্রকল্প সম্পাদনা করুন' : 'Edit Project'}</span>
                  </button>

                  <button
                    onClick={() => handleDelete(p)}
                    className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                    title={language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-[#0c1a24] rounded-2xl border border-stone-200 dark:border-stone-800">
          <p className="text-xs text-stone-500">
            {language === 'bn' ? 'কোনো প্রকল্প পাওয়া যায়নি।' : 'No projects found matching filter.'}
          </p>
        </div>
      )}

      {/* CREATE / EDIT PROJECT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0c1a24] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl max-w-2xl w-full p-6 relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h4 className="text-lg font-black text-[#102B3F] dark:text-white mb-4 flex items-center gap-2">
              <FolderHeart className="w-5 h-5 text-[#167D78]" />
              <span>
                {editingProject
                  ? (language === 'bn' ? 'প্রকল্প ও উদ্যোগ সম্পাদনা করুন' : 'Edit Humanitarian Project')
                  : (language === 'bn' ? 'নতুন মানবিক প্রকল্প তৈরি করুন' : 'Create New Humanitarian Project')}
              </span>
            </h4>

            <form onSubmit={handleSaveProject} className="space-y-4 text-xs">
              
              {/* Image Preview & Upload */}
              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2">
                <div className="flex items-center gap-4">
                  <div className="w-28 h-18 rounded-xl overflow-hidden bg-stone-200 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 shrink-0">
                    <img
                      src={imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80'}
                      alt="Project Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <div className="font-bold text-stone-800 dark:text-stone-200">
                      {language === 'bn' ? 'প্রকল্পের ব্যানার ছবি' : 'Project Banner Image'}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-[#167D78] hover:bg-[#102B3F] text-white font-bold cursor-pointer flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#D6F36A]" />
                        <span>{language === 'bn' ? 'ছবি আপলোড করুন' : 'Upload Image'}</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder={language === 'bn' ? 'অথবা সরাসরি ছবির লিংক পেস্ট করুন...' : 'Or paste image URL...'}
                      className="w-full p-2 rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Title Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                    {language === 'bn' ? 'প্রকল্পের শিরোনাম (বাংলা)' : 'Project Title (Bangla)'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={titleBn}
                    onChange={(e) => setTitleBn(e.target.value)}
                    placeholder="যেমন: চরাঞ্চলের শিশুদের শিক্ষা বৃত্তি ও স্কুল ব্যাগ"
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                    {language === 'bn' ? 'Project Title (English)' : 'Project Title (English)'}
                  </label>
                  <input
                    type="text"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    placeholder="e.g. Char Education Scholarships and Kits"
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Category, Status, Urgent Check */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                    {language === 'bn' ? 'ক্যাটাগরি' : 'Category'} *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white cursor-pointer font-bold"
                  >
                    <option value="relief">জরুরি ত্রাণ ও খাদ্য সহায়তা (Relief)</option>
                    <option value="education">শিক্ষা ও মেধা বৃত্তি (Education)</option>
                    <option value="health">ফ্রি স্বাস্থ্যসেবা ও ওষুধ (Health)</option>
                    <option value="winter">শীতবস্ত্র ও কম্বল বিতরণ (Winter)</option>
                    <option value="empowerment">মায়েদের স্বাবলম্বীকরণ (Livelihood)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                    {language === 'bn' ? 'চলমান স্ট্যাটাস' : 'Status'}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white cursor-pointer"
                  >
                    <option value="active">সক্রিয় ও চলমান (Active)</option>
                    <option value="urgent">জরুরি কার্যক্রম (Urgent)</option>
                    <option value="completed">সম্পন্ন ও সমাপ্ত (Completed)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-rose-600 dark:text-rose-400">
                    <input
                      type="checkbox"
                      checked={isUrgent}
                      onChange={(e) => setIsUrgent(e.target.checked)}
                      className="w-4 h-4 rounded text-rose-600 cursor-pointer"
                    />
                    <span>{language === 'bn' ? 'জরুরি ফান্ড হিসেবে চিহ্নিত করুন' : 'Mark as Urgent Fund'}</span>
                  </label>
                </div>
              </div>

              {/* Budgets & Counts */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                    {language === 'bn' ? 'টার্গেট বাজেট (টাকা)' : 'Target Amount (BDT)'} *
                  </label>
                  <input
                    type="number"
                    required
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                    {language === 'bn' ? 'সংগৃহীত অনুদান (টাকা)' : 'Raised Amount'}
                  </label>
                  <input
                    type="number"
                    value={raisedAmount}
                    onChange={(e) => setRaisedAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white font-mono font-bold text-[#167D78] dark:text-[#D6F36A]"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                    {language === 'bn' ? 'মোট দাতার সংখ্যা' : 'Donors Count'}
                  </label>
                  <input
                    type="number"
                    value={donorsCount}
                    onChange={(e) => setDonorsCount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                    {language === 'bn' ? 'উপকৃত মানুষের সংখ্যা' : 'Beneficiaries'}
                  </label>
                  <input
                    type="number"
                    value={beneficiariesCount}
                    onChange={(e) => setBeneficiariesCount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Location Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                    {language === 'bn' ? 'প্রকল্প এলাকা / জেলা (বাংলা)' : 'Location (Bangla)'}
                  </label>
                  <input
                    type="text"
                    value={locationBn}
                    onChange={(e) => setLocationBn(e.target.value)}
                    placeholder="কমলগঞ্জ ও শ্রীমঙ্গল, মৌলভীবাজার"
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                    {language === 'bn' ? 'Location (English)' : 'Location (English)'}
                  </label>
                  <input
                    type="text"
                    value={locationEn}
                    onChange={(e) => setLocationEn(e.target.value)}
                    placeholder="Kamalganj & Sreemangal, Moulvibazar"
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-3">
                <div>
                  <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                    {language === 'bn' ? 'প্রকল্পের বিস্তারিত বিবরণ (বাংলা)' : 'Detailed Description (Bangla)'}
                  </label>
                  <textarea
                    rows={3}
                    value={descriptionBn}
                    onChange={(e) => setDescriptionBn(e.target.value)}
                    placeholder="প্রকল্পের উদ্দেশ্য, উপকারভোগী ও বাস্তবায়নের রূপরেখা..."
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white leading-relaxed"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                    {language === 'bn' ? 'Detailed Description (English)' : 'Detailed Description (English)'}
                  </label>
                  <textarea
                    rows={2}
                    value={descriptionEn}
                    onChange={(e) => setDescriptionEn(e.target.value)}
                    placeholder="Objectives, target community, and field execution plan..."
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white leading-relaxed"
                  />
                </div>
              </div>

              {/* Field Impact Updates */}
              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#167D78]" />
                    <span>{language === 'bn' ? 'মাঠপর্যায়ের বাস্তবায়ন আপডেট (Impact Updates)' : 'Impact Updates'}</span>
                  </span>
                  <span className="text-[10px] text-stone-400">({impactUpdates.length} updates)</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="date"
                    value={newUpdateDate}
                    onChange={(e) => setNewUpdateDate(e.target.value)}
                    className="p-2 rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs text-stone-900 dark:text-white font-mono"
                  />
                  <input
                    type="text"
                    value={newUpdateTextBn}
                    onChange={(e) => setNewUpdateTextBn(e.target.value)}
                    placeholder={language === 'bn' ? 'যেমন: ১ম ধাপের ৩০০ ব্যাগ ত্রাণ সামগ্রী সফলভাবে বিতরণ করা হয়েছে' : 'Enter update note...'}
                    className="flex-1 p-2 rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs text-stone-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddImpactUpdate}
                    className="px-3 py-1.5 rounded-lg bg-[#167D78] text-white font-bold cursor-pointer hover:bg-[#102B3F] shrink-0"
                  >
                    + {language === 'bn' ? 'যোগ করুন' : 'Add'}
                  </button>
                </div>

                {impactUpdates.length > 0 && (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {impactUpdates.map((upd, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-between text-[11px]">
                        <div>
                          <span className="font-mono text-stone-400 mr-2">{upd.date}:</span>
                          <span className="text-stone-800 dark:text-stone-200 font-medium">{upd.textBn}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImpactUpdate(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 font-bold cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#167D78] hover:bg-[#102B3F] text-white font-bold cursor-pointer transition-all shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4 text-[#D6F36A]" />
                  <span>{editingProject ? (language === 'bn' ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes') : (language === 'bn' ? 'প্রকল্প তৈরি করুন' : 'Create Project')}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
