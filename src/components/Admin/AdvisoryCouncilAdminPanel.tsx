import React, { useState, useRef } from 'react';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Search,
  Upload,
  Calendar,
  Sparkles,
  Award,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Building2,
  Phone,
  Mail,
  Save,
  X
} from 'lucide-react';
import { AdvisoryCouncilMember, AdminUser, Language } from '../../types';

interface AdvisoryCouncilAdminPanelProps {
  currentAdmin: AdminUser | null;
  language: Language;
  advisors: AdvisoryCouncilMember[];
  onUpdateAdvisors: (advisors: AdvisoryCouncilMember[]) => void;
  onToast: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
}

export const AdvisoryCouncilAdminPanel: React.FC<AdvisoryCouncilAdminPanelProps> = ({
  currentAdmin,
  language,
  advisors,
  onUpdateAdvisors,
  onToast
}) => {
  const isSuperAdmin = currentAdmin?.role === 'super_admin';
  const hasPermission = isSuperAdmin || Boolean(currentAdmin?.permissions.canManageAdvisors);

  const [activeTab, setActiveTab] = useState<'all' | 'current' | 'former'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdvisor, setEditingAdvisor] = useState<AdvisoryCouncilMember | null>(null);

  // Photo file upload ref
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [advisorPhotoPreview, setAdvisorPhotoPreview] = useState<string>('');

  // Filtered advisors
  const displayedAdvisors = advisors.filter(adv => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = !q ||
      adv.nameBn.toLowerCase().includes(q) ||
      adv.nameEn.toLowerCase().includes(q) ||
      adv.roleBn.toLowerCase().includes(q) ||
      adv.roleEn.toLowerCase().includes(q) ||
      (adv.organizationBn && adv.organizationBn.toLowerCase().includes(q));

    const matchesStatus =
      activeTab === 'all' ||
      (activeTab === 'current' && adv.status === 'current') ||
      (activeTab === 'former' && adv.status === 'former');

    return matchesQuery && matchesStatus;
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      onToast('error', language === 'bn' ? 'ছবির সাইজ অনেক বড়' : 'Image too large', language === 'bn' ? 'সর্বোচ্চ ২ মেগাবাইট সাইজের ছবি দিন।' : 'Maximum 2MB allowed.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setAdvisorPhotoPreview(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAdvisorSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!hasPermission) {
      onToast('error', language === 'bn' ? 'অনুমতি নেই' : 'Permission Denied');
      return;
    }

    const formData = new FormData(e.currentTarget);
    const nameBn = (formData.get('nameBn') as string).trim();
    const nameEn = (formData.get('nameEn') as string).trim();
    const roleBn = (formData.get('roleBn') as string).trim();
    const roleEn = (formData.get('roleEn') as string).trim();
    const organizationBn = (formData.get('organizationBn') as string).trim();
    const organizationEn = (formData.get('organizationEn') as string).trim();
    const joinedDate = (formData.get('joinedDate') as string).trim();
    const exitDate = (formData.get('exitDate') as string).trim();
    const status = (formData.get('status') as 'current' | 'former') || 'current';
    const phone = (formData.get('phone') as string).trim();
    const email = (formData.get('email') as string).trim();
    const bioBn = (formData.get('bioBn') as string).trim();
    const bioEn = (formData.get('bioEn') as string).trim();
    const imageUrl = advisorPhotoPreview || (formData.get('imageUrl') as string).trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';

    if (!nameBn || !roleBn) {
      onToast('error', language === 'bn' ? 'উপদেষ্টার নাম ও পদবি আবশ্যক' : 'Name and title required');
      return;
    }

    if (editingAdvisor) {
      const updated = advisors.map(a => {
        if (a.id === editingAdvisor.id) {
          return {
            ...a,
            nameBn,
            nameEn: nameEn || nameBn,
            roleBn,
            roleEn: roleEn || roleBn,
            organizationBn,
            organizationEn: organizationEn || organizationBn,
            joinedDate: joinedDate || a.joinedDate,
            exitDate: exitDate || undefined,
            status,
            phone,
            email,
            bioBn,
            bioEn: bioEn || bioBn,
            image: imageUrl
          };
        }
        return a;
      });

      onUpdateAdvisors(updated);
      onToast('success', language === 'bn' ? 'উপদেষ্টার তথ্য সফলভাবে হালনাগাদ করা হয়েছে' : 'Advisor updated successfully');
    } else {
      const newAdvisor: AdvisoryCouncilMember = {
        id: `adv-${Date.now().toString().slice(-6)}`,
        nameBn,
        nameEn: nameEn || nameBn,
        roleBn,
        roleEn: roleEn || roleBn,
        organizationBn,
        organizationEn: organizationEn || organizationBn,
        joinedDate: joinedDate || '২০২৬-০৩-০৭',
        exitDate: exitDate || undefined,
        status,
        phone,
        email,
        bioBn,
        bioEn: bioEn || bioBn,
        image: imageUrl
      };

      const updated = [newAdvisor, ...advisors];
      onUpdateAdvisors(updated);
      onToast('success', language === 'bn' ? 'নতুন উপদেষ্টা সফলভাবে যুক্ত হয়েছেন' : 'New advisor added');
    }

    setIsModalOpen(false);
    setEditingAdvisor(null);
    setAdvisorPhotoPreview('');
  };

  const handleDeleteAdvisor = (id: string) => {
    if (!hasPermission) {
      onToast('error', language === 'bn' ? 'অনুমতি নেই' : 'Permission Denied');
      return;
    }

    const target = advisors.find(a => a.id === id);
    if (!target) return;

    if (target.status === 'former' && !isSuperAdmin) {
      onToast('error', language === 'bn' ? 'সাবেক উপদেষ্টার ঐতিহাসিক রেকর্ড শুধুমাত্র Super Admin মুছতে পারবেন।' : 'Only Super Admin can delete former advisor archive.');
      return;
    }

    if (!window.confirm(language === 'bn' ? `আপনি কি নিশ্চিতভাবে "${target.nameBn}"-এর তথ্য মুছে ফেলতে চান?` : `Are you sure you want to delete ${target.nameEn || target.nameBn}?`)) {
      return;
    }

    const updated = advisors.filter(a => a.id !== id);
    onUpdateAdvisors(updated);
    onToast('info', language === 'bn' ? 'উপদেষ্টার তথ্য তালিকা থেকে বাদ দেওয়া হয়েছে।' : 'Advisor record removed.');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#102B3F] to-[#1D4ED8] text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#D6F36A] text-xs font-bold uppercase tracking-wider mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'উপদেষ্টামণ্ডলী পরিচালনা কেন্দ্র' : 'Advisory Council Management'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black">
            {language === 'bn' ? 'বর্তমান ও সাবেক উপদেষ্টামণ্ডলীর আর্কাইভ' : 'Current & Emeritus Advisory Council'}
          </h3>
          <p className="text-xs sm:text-sm text-stone-200 mt-1 max-w-2xl">
            {language === 'bn'
              ? 'উপদেষ্টামণ্ডলীর বর্তমান ও সাবেক সদস্যদের নাম, ছবি, পদবি, প্রতিষ্ঠান, যোগদানের তারিখ ও বিদায়ের তথ্য সহজে যোগ ও সম্পাদন করুন।'
              : 'Manage respected current and emeritus advisors with full profiles, appointments, institution affiliations, and historic terms.'}
          </p>
        </div>

        {hasPermission && (
          <button
            onClick={() => {
              setEditingAdvisor(null);
              setAdvisorPhotoPreview('');
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#D6F36A] hover:bg-[#c5e458] text-[#102B3F] font-bold text-xs cursor-pointer shadow-sm flex items-center gap-2 shrink-0 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'bn' ? 'নতুন উপদেষ্টা যোগ করুন' : 'Add New Advisor'}</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0c1a24] p-3 rounded-2xl border border-stone-200 dark:border-stone-800">
        <div className="inline-flex p-1 bg-stone-100 dark:bg-stone-800 rounded-xl">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#102B3F] text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            {language === 'bn' ? `সকল উপদেষ্টা (${advisors.length})` : `All (${advisors.length})`}
          </button>
          <button
            onClick={() => setActiveTab('current')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'current'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-[#D6F36A]" />
            <span>{language === 'bn' ? `বর্তমান (${advisors.filter(a => a.status === 'current').length})` : `Current (${advisors.filter(a => a.status === 'current').length})`}</span>
          </button>
          <button
            onClick={() => setActiveTab('former')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'former'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>{language === 'bn' ? `সাবেক / মরহুম (${advisors.filter(a => a.status === 'former').length})` : `Former / Emeritus (${advisors.filter(a => a.status === 'former').length})`}</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'bn' ? 'নাম, পদবি বা প্রতিষ্ঠান দিয়ে খুঁজুন...' : 'Search advisors...'}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#167D78]"
          />
        </div>
      </div>

      {/* Advisors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayedAdvisors.map((advisor) => (
          <div
            key={advisor.id}
            className="p-5 bg-white dark:bg-[#0c1a24] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs hover:border-[#167D78] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 shrink-0 relative">
                  <img
                    src={advisor.image}
                    alt={language === 'bn' ? advisor.nameBn : advisor.nameEn}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';
                    }}
                  />
                  {advisor.status === 'current' ? (
                    <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0c1a24]" title="Active" />
                  ) : (
                    <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-amber-500 border-2 border-white dark:border-[#0c1a24]" title="Former" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    {advisor.status === 'current' ? (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                        {language === 'bn' ? 'বর্তমান উপদেষ্টা' : 'Current'}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                        {language === 'bn' ? 'সাবেক / ইমেরিটাস' : 'Former'}
                      </span>
                    )}
                  </div>

                  <h5 className="font-extrabold text-sm text-[#102B3F] dark:text-white leading-tight">
                    {language === 'bn' ? advisor.nameBn : advisor.nameEn}
                  </h5>

                  <span className="text-xs font-bold text-[#167D78] dark:text-[#D6F36A] block mt-0.5">
                    {language === 'bn' ? advisor.roleBn : advisor.roleEn}
                  </span>

                  {advisor.organizationBn && (
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 block mt-0.5 line-clamp-1">
                      {language === 'bn' ? advisor.organizationBn : advisor.organizationEn}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed mb-3 line-clamp-3">
                {language === 'bn' ? advisor.bioBn : advisor.bioEn}
              </p>

              <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 text-[11px] space-y-1">
                <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#167D78]" />
                    <span>{language === 'bn' ? 'যোগদান:' : 'Joined:'}</span>
                  </span>
                  <span className="font-mono font-semibold text-stone-700 dark:text-stone-300">{advisor.joinedDate}</span>
                </div>

                {advisor.exitDate && (
                  <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" />
                      <span>{language === 'bn' ? 'বিদায় / মেয়াদান্ত:' : 'Tenure End:'}</span>
                    </span>
                    <span className="font-mono font-semibold text-stone-700 dark:text-stone-300">{advisor.exitDate}</span>
                  </div>
                )}

                {(advisor.phone || advisor.email) && (
                  <div className="pt-1 border-t border-stone-200/50 dark:border-stone-800/80 flex items-center justify-between text-stone-400 text-[10px]">
                    {advisor.phone && <span>📞 {advisor.phone}</span>}
                    {advisor.email && <span className="truncate max-w-[150px]">✉️ {advisor.email}</span>}
                  </div>
                )}
              </div>
            </div>

            {hasPermission && (
              <div className="flex items-center justify-end gap-1 pt-3 mt-3 border-t border-stone-100 dark:border-stone-800">
                <button
                  onClick={() => {
                    setEditingAdvisor(advisor);
                    setAdvisorPhotoPreview(advisor.image);
                    setIsModalOpen(true);
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer flex items-center gap-1"
                >
                  <Edit className="w-3 h-3 text-[#167D78]" />
                  <span>{language === 'bn' ? 'সম্পাদন' : 'Edit'}</span>
                </button>
                <button
                  onClick={() => handleDeleteAdvisor(advisor.id)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{language === 'bn' ? 'মুছুন' : 'Delete'}</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {displayedAdvisors.length === 0 && (
        <div className="p-12 text-center bg-stone-50 dark:bg-stone-900/40 rounded-2xl border border-stone-200 dark:border-stone-800">
          <Award className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <h5 className="font-bold text-stone-700 dark:text-stone-300 text-sm">
            {language === 'bn' ? 'কোনো উপদেষ্টার রেকর্ড পাওয়া যায়নি' : 'No advisor records found'}
          </h5>
          <p className="text-xs text-stone-400 mt-1">
            {language === 'bn' ? 'ফিল্টার পরিবর্তন করুন বা নতুন উপদেষ্টা যোগ করুন।' : 'Try changing filters or add a new advisor.'}
          </p>
        </div>
      )}

      {/* CREATE / EDIT ADVISOR MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0c1a24] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setEditingAdvisor(null);
                setAdvisorPhotoPreview('');
              }}
              className="absolute top-4 right-4 p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h4 className="text-lg font-bold text-[#102B3F] dark:text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#167D78]" />
              <span>
                {editingAdvisor
                  ? (language === 'bn' ? 'উপদেষ্টার তথ্য সম্পাদন' : 'Edit Advisor Details')
                  : (language === 'bn' ? 'নতুন উপদেষ্টা যোগ করুন' : 'Add New Advisor')}
              </span>
            </h4>

            <form onSubmit={handleSaveAdvisorSubmit} className="space-y-4">
              {/* Photo Upload */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  {language === 'bn' ? 'উপদেষ্টার ছবি (Photo Upload or URL)' : 'Advisor Photo'}
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shrink-0">
                    <img
                      src={advisorPhotoPreview || editingAdvisor?.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-stone-200 dark:border-stone-700"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#167D78]" />
                      <span>{language === 'bn' ? 'ছবি আপলোড করুন' : 'Upload photo'}</span>
                    </button>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <input
                      type="text"
                      name="imageUrl"
                      value={advisorPhotoPreview || editingAdvisor?.image || ''}
                      onChange={(e) => setAdvisorPhotoPreview(e.target.value)}
                      placeholder={language === 'bn' ? 'বা ছবির লিংক লিখুন...' : 'Or enter image URL...'}
                      className="w-full px-2.5 py-1 text-xs rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {language === 'bn' ? 'নাম (বাংলা)' : 'Name (Bangla)'} *
                  </label>
                  <input
                    type="text"
                    name="nameBn"
                    defaultValue={editingAdvisor?.nameBn || ''}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {language === 'bn' ? 'নাম (English)' : 'Name (English)'}
                  </label>
                  <input
                    type="text"
                    name="nameEn"
                    defaultValue={editingAdvisor?.nameEn || ''}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {language === 'bn' ? 'উপদেষ্টা পদবি (বাংলা)' : 'Advisor Role (Bangla)'} *
                  </label>
                  <input
                    type="text"
                    name="roleBn"
                    defaultValue={editingAdvisor?.roleBn || ''}
                    placeholder="যেমন: প্রধান উপদেষ্টা, আইনি উপদেষ্টা"
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {language === 'bn' ? 'পদবি (English)' : 'Advisor Role (English)'}
                  </label>
                  <input
                    type="text"
                    name="roleEn"
                    defaultValue={editingAdvisor?.roleEn || ''}
                    placeholder="e.g. Chief Advisor"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {language === 'bn' ? 'প্রতিষ্ঠান / পরিচিতি (বাংলা)' : 'Affiliation (Bangla)'}
                  </label>
                  <input
                    type="text"
                    name="organizationBn"
                    defaultValue={editingAdvisor?.organizationBn || ''}
                    placeholder="যেমন: সাবেক অধ্যক্ষ, কমলগঞ্জ কলেজ"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {language === 'bn' ? 'প্রতিষ্ঠান (English)' : 'Affiliation (English)'}
                  </label>
                  <input
                    type="text"
                    name="organizationEn"
                    defaultValue={editingAdvisor?.organizationEn || ''}
                    placeholder="e.g. Former Principal, Kamalganj College"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {language === 'bn' ? 'যোগদানের তারিখ' : 'Joining Date'}
                  </label>
                  <input
                    type="text"
                    name="joinedDate"
                    defaultValue={editingAdvisor?.joinedDate || '২০২৬-০৩-০৭'}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {language === 'bn' ? 'বিদায়ের তারিখ (যদি থাকে)' : 'Exit Date (if former)'}
                  </label>
                  <input
                    type="text"
                    name="exitDate"
                    defaultValue={editingAdvisor?.exitDate || ''}
                    placeholder="যেমন: ২০২৫-১১-২০"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {language === 'bn' ? 'অবস্থা (Status)' : 'Status'}
                  </label>
                  <select
                    name="status"
                    defaultValue={editingAdvisor?.status || 'current'}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white cursor-pointer"
                  >
                    <option value="current">বর্তমান উপদেষ্টা (Current)</option>
                    <option value="former">সাবেক / ইমেরিটাস (Former)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {language === 'bn' ? 'মোবাইল' : 'Phone'}
                  </label>
                  <input
                    type="text"
                    name="phone"
                    defaultValue={editingAdvisor?.phone || ''}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {language === 'bn' ? 'ইমেইল' : 'Email'}
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingAdvisor?.email || ''}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  {language === 'bn' ? 'পরিচিতি ও উপদেশনামার সংক্ষেপ (Bio)' : 'Bio / Guidance Note'}
                </label>
                <textarea
                  name="bioBn"
                  rows={2}
                  defaultValue={editingAdvisor?.bioBn || ''}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#167D78] hover:bg-[#126863] rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'উপদেষ্টা সংরক্ষণ' : 'Save Advisor'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
