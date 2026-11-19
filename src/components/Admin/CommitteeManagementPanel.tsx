import React, { useState, useRef } from 'react';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Sparkles,
  Crown,
  Search,
  Upload,
  Image as ImageIcon,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Clock,
  History,
  Archive,
  Save,
  X,
  FileCheck2,
  Lock
} from 'lucide-react';
import { CommitteeTerm, TeamMember, AdminUser, Language } from '../../types';
import { compressImageFile } from '../../utils/imageCompressor';

interface CommitteeManagementPanelProps {
  currentAdmin: AdminUser | null;
  language: Language;
  committeeTerms: CommitteeTerm[];
  onUpdateCommitteeTerms: (terms: CommitteeTerm[]) => void;
  onToast: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
}

export const CommitteeManagementPanel: React.FC<CommitteeManagementPanelProps> = ({
  currentAdmin,
  language,
  committeeTerms,
  onUpdateCommitteeTerms,
  onToast
}) => {
  const isSuperAdmin = currentAdmin?.role === 'super_admin';
  const hasPermission = isSuperAdmin || Boolean(currentAdmin?.permissions.canManageCommittee);

  // Selected term tab
  const [selectedTermId, setSelectedTermId] = useState<string>(() => {
    const current = committeeTerms.find(t => t.isCurrent);
    return current ? current.id : (committeeTerms[0]?.id || '');
  });

  const [searchMember, setSearchMember] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modals
  const [isTermModalOpen, setIsTermModalOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<CommitteeTerm | null>(null);

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  // Security delete protection
  const [confirmDeleteTermId, setConfirmDeleteTermId] = useState<string | null>(null);
  const [confirmDeleteInput, setConfirmDeleteInput] = useState('');

  // Photo file upload ref
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [memberPhotoPreview, setMemberPhotoPreview] = useState<string>('');

  const activeTerm = committeeTerms.find(t => t.id === selectedTermId) || committeeTerms[0];

  // Category filters
  const categoryOptions = [
    { id: 'all', labelBn: 'সকল বিভাগ', labelEn: 'All Categories' },
    { id: 'executive', labelBn: 'শীর্ষ নেতৃত্ব ও প্রশাসন', labelEn: 'Executive & Admin' },
    { id: 'finance', labelBn: 'অর্থ ও হিসাব', labelEn: 'Finance' },
    { id: 'education', labelBn: 'শিক্ষা ও সংস্কৃতি', labelEn: 'Education' },
    { id: 'welfare', labelBn: 'সমাজকল্যাণ ও ত্রাণ', labelEn: 'Social Welfare' },
    { id: 'publicity', labelBn: 'প্রচার ও পরিকল্পনা', labelEn: 'Publicity' },
    { id: 'sports', labelBn: 'ক্রীড়া ও যুব উন্নয়ন', labelEn: 'Sports & Youth' }
  ];

  // Filtered members in current selected term
  const displayedMembers = (activeTerm?.members || []).filter(m => {
    const q = searchMember.toLowerCase().trim();
    const matchesSearch = !q ||
      m.nameBn.toLowerCase().includes(q) ||
      m.nameEn.toLowerCase().includes(q) ||
      m.roleBn.toLowerCase().includes(q) ||
      m.roleEn.toLowerCase().includes(q) ||
      (m.email && m.email.toLowerCase().includes(q));

    const matchesCat = selectedCategory === 'all' || m.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Photo upload handler with WebP compression
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      onToast('error', language === 'bn' ? 'ছবির সাইজ অনেক বড়' : 'Image too large', language === 'bn' ? 'সর্বোচ্চ ৫ মেগাবাইট সাইজের ছবি দিন।' : 'Maximum 5MB allowed.');
      return;
    }

    try {
      const compressed = await compressImageFile(file, {
        maxWidth: 900,
        maxHeight: 900,
        quality: 0.82,
        format: 'image/webp'
      });
      setMemberPhotoPreview(compressed.dataUrl);
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setMemberPhotoPreview(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Switch Active Current Term
  const handleSetCurrentTerm = (termId: string) => {
    if (!hasPermission) {
      onToast('error', language === 'bn' ? 'অনুমতি নেই' : 'Permission Denied', language === 'bn' ? 'আপনার বর্তমান কমিটি পরিবর্তন করার অনুমতি নেই।' : 'You do not have permission to change active committee.');
      return;
    }

    const updated = committeeTerms.map(t => ({
      ...t,
      isCurrent: t.id === termId,
      status: (t.id === termId ? 'current' : 'archived') as 'current' | 'archived'
    }));

    onUpdateCommitteeTerms(updated);
    onToast(
      'success',
      language === 'bn' ? 'বর্তমান কমিটি পরিবর্তন সম্পন্ন' : 'Active Committee Updated',
      language === 'bn' ? 'নতুন কমিটিকে কার্যকর বর্তমান পরিষদ হিসেবে নির্ধারণ করা হয়েছে।' : 'Designated term as current active council.'
    );
  };

  // Save Term (Create or Edit)
  const handleSaveTermSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!hasPermission) {
      onToast('error', language === 'bn' ? 'অনুমতি নেই' : 'Permission Denied');
      return;
    }

    const formData = new FormData(e.currentTarget);
    const titleBn = ((formData.get('termTitleBn') as string) || '').trim();
    const titleEn = ((formData.get('termTitleEn') as string) || '').trim();
    const startYear = Number(formData.get('startYear')) || new Date().getFullYear();
    const endYear = Number(formData.get('endYear')) || startYear + 2;
    const establishedDate = ((formData.get('establishedDate') as string) || '').trim();
    const descBn = ((formData.get('descriptionBn') as string) || '').trim();
    const descEn = ((formData.get('descriptionEn') as string) || '').trim() || descBn;
    const setAsCurrent = formData.get('isCurrent') === 'on';

    if (!titleBn) {
      onToast('error', language === 'bn' ? 'কমিটির শিরোনাম লিখুন' : 'Enter committee title');
      return;
    }

    try {
      if (editingTerm) {
        // Update existing
        const updated = committeeTerms.map(t => {
          if (t.id === editingTerm.id) {
            return {
              ...t,
              termTitleBn: titleBn,
              termTitleEn: titleEn || titleBn,
              startYear,
              endYear,
              establishedDate: establishedDate || t.establishedDate,
              descriptionBn: descBn,
              descriptionEn: descEn,
              isCurrent: setAsCurrent ? true : (t.isCurrent && !setAsCurrent ? false : t.isCurrent),
              status: (setAsCurrent ? 'current' : (t.status || 'archived')) as 'current' | 'archived'
            };
          }
          if (setAsCurrent && t.id !== editingTerm.id) {
            return { ...t, isCurrent: false, status: 'archived' as const };
          }
          return t;
        });

        onUpdateCommitteeTerms(updated);
        onToast('success', language === 'bn' ? 'কমিটির তথ্য হালনাগাদ সম্পন্ন' : 'Committee Term Updated');
      } else {
        // Create new term
        const newTermId = `term-${startYear}-${endYear}-${Date.now().toString().slice(-4)}`;
        const newTerm: CommitteeTerm = {
          id: newTermId,
          termTitleBn: titleBn,
          termTitleEn: titleEn || titleBn,
          startYear,
          endYear,
          establishedDate: establishedDate || `${startYear}`,
          descriptionBn: descBn,
          descriptionEn: descEn,
          isCurrent: setAsCurrent,
          status: setAsCurrent ? 'current' : 'archived',
          members: []
        };

        const updated = setAsCurrent
          ? [newTerm, ...committeeTerms.map(t => ({ ...t, isCurrent: false, status: 'archived' as const }))]
          : [...committeeTerms, newTerm];

        onUpdateCommitteeTerms(updated);
        setSelectedTermId(newTermId);
        onToast('success', language === 'bn' ? 'নতুন কমিটি তৈরি সফল হয়েছে' : 'New Committee Created');
      }

      setIsTermModalOpen(false);
      setEditingTerm(null);
    } catch (error) {
      console.error('Committee term save failed:', error);
      onToast(
        'error',
        language === 'bn' ? 'তথ্য সংরক্ষণ ব্যর্থ হয়েছে' : 'Save Failed',
        error instanceof Error ? error.message : 'আবার চেষ্টা করুন।'
      );
    }
  };

  // Member Save (Create or Edit)
  const handleSaveMemberSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!hasPermission) {
      onToast(
        'error',
        language === 'bn' ? 'অনুমতি নেই' : 'Permission Denied'
      );
      return;
    }

    const formData = new FormData(e.currentTarget);

    const nameBn = ((formData.get('nameBn') as string) || '').trim();
    const nameEn = ((formData.get('nameEn') as string) || '').trim();
    const roleBn = ((formData.get('roleBn') as string) || '').trim();
    const roleEn = ((formData.get('roleEn') as string) || '').trim();
    const category = (formData.get('category') as any) || 'executive';
    const email = ((formData.get('email') as string) || '').trim();
    const phone = ((formData.get('phone') as string) || '').trim();
    const bioBn = ((formData.get('bioBn') as string) || '').trim();
    const bioEn = ((formData.get('bioEn') as string) || '').trim();
    const isFounder = formData.get('isFounder') === 'on';

    const imageUrl =
      memberPhotoPreview ||
      ((formData.get('imageUrl') as string) || '').trim() ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';

    if (!nameBn || !roleBn) {
      onToast(
        'error',
        language === 'bn'
          ? 'সদস্যের নাম ও পদবি আবশ্যক'
          : 'Member name and role required'
      );
      return;
    }

    if (!activeTerm) {
      onToast('error', 'সমস্যা হয়েছে', 'কোনো সক্রিয় কমিটি পাওয়া যায়নি।');
      return;
    }

    try {
      let updatedMembers: TeamMember[];

      if (editingMember) {
        // Existing member update
        updatedMembers = activeTerm.members.map((m) =>
          m.id === editingMember.id
            ? {
                ...m,
                nameBn,
                nameEn: nameEn || nameBn,
                roleBn,
                roleEn: roleEn || roleBn,
                category,
                email,
                phone,
                bioBn,
                bioEn: bioEn || bioBn,
                isFounder,
                image: imageUrl
              }
            : m
        );
      } else {
        // New member creation
        const newMember: TeamMember = {
          id: `tm-${Date.now().toString().slice(-6)}`,
          nameBn,
          nameEn: nameEn || nameBn,
          roleBn,
          roleEn: roleEn || roleBn,
          category,
          email,
          phone,
          bioBn,
          bioEn: bioEn || bioBn,
          isFounder,
          image: imageUrl
        };

        updatedMembers = [...activeTerm.members, newMember];
      }

      const updatedTerms = committeeTerms.map((term) =>
        term.id === activeTerm.id
          ? { ...term, members: updatedMembers }
          : term
      );

      onUpdateCommitteeTerms(updatedTerms);

      setIsMemberModalOpen(false);
      setEditingMember(null);
      setMemberPhotoPreview('');

      onToast(
        'success',
        language === 'bn'
          ? 'তথ্য সফলভাবে সংরক্ষিত হয়েছে'
          : 'Information saved successfully',
        language === 'bn'
          ? 'কমিটি সদস্যের তথ্য আপডেট করা হয়েছে।'
          : 'Committee member information has been updated.'
      );
    } catch (error) {
      console.error('Member information save failed:', error);

      onToast(
        'error',
        language === 'bn'
          ? 'তথ্য সংরক্ষণ ব্যর্থ হয়েছে'
          : 'Save Failed',
        error instanceof Error
          ? error.message
          : 'আবার চেষ্টা করুন।'
      );
    }
  };

  // Delete Member
  const handleDeleteMember = (memberId: string) => {
    if (!hasPermission) {
      onToast('error', language === 'bn' ? 'অনুমতি নেই' : 'Permission Denied');
      return;
    }

    if (!activeTerm) return;
    const target = activeTerm.members.find(m => m.id === memberId);
    if (!window.confirm(language === 'bn' ? `আপনি কি নিশ্চিতভাবে "${target?.nameBn}"-কে এই কমিটি থেকে বাদ দিতে চান?` : `Remove ${target?.nameEn || target?.nameBn} from this committee?`)) {
      return;
    }

    const updatedMembers = activeTerm.members.filter(m => m.id !== memberId);
    const updatedTerms = committeeTerms.map(t => t.id === activeTerm.id ? { ...t, members: updatedMembers } : t);
    onUpdateCommitteeTerms(updatedTerms);
    onToast('info', language === 'bn' ? 'সদস্য অপসারিত হয়েছে' : 'Member removed from committee');
  };

  // Safe Term Deletion with confirmation
  const handleExecuteDeleteTerm = () => {
    if (!isSuperAdmin) {
      onToast('error', language === 'bn' ? 'শুধুমাত্র Super Admin কমিটি ডিলিট করতে পারবেন।' : 'Only Super Admin can delete committee term.');
      return;
    }

    if (!confirmDeleteTermId) return;
    const targetTerm = committeeTerms.find(t => t.id === confirmDeleteTermId);
    if (!targetTerm) return;

    if (targetTerm.isCurrent) {
      onToast('error', language === 'bn' ? 'চলতি সক্রিয় কমিটি মুছে ফেলা যাবে না।' : 'Cannot delete the currently active committee.');
      return;
    }

    if (confirmDeleteInput.trim() !== 'DELETE ARCHIVE') {
      onToast('error', language === 'bn' ? 'সঠিক কোড ("DELETE ARCHIVE") লিখুন।' : 'Please type exact phrase "DELETE ARCHIVE".');
      return;
    }

    const updated = committeeTerms.filter(t => t.id !== confirmDeleteTermId);
    onUpdateCommitteeTerms(updated);
    setSelectedTermId(updated[0]?.id || '');
    setConfirmDeleteTermId(null);
    setConfirmDeleteInput('');
    onToast('info', language === 'bn' ? 'কমিটি আর্কাইভ স্থায়ীভাবে মুছে ফেলা হয়েছে।' : 'Committee archive permanently removed.');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#102B3F] to-[#167D78] text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#D6F36A] text-xs font-bold uppercase tracking-wider mb-2">
            <Crown className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'কমিটি ও মেয়াদ পরিচালনা কেন্দ্র' : 'Committee & Tenure Management'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black">
            {language === 'bn' ? 'বর্তমান কমিটি, ইতিহাস ও সদস্য ব্যবস্থাপনা' : 'Governance Councils & Historical Archives'}
          </h3>
          <p className="text-xs sm:text-sm text-stone-200 mt-1 max-w-2xl">
            {language === 'bn'
              ? 'নতুন কমিটি গঠন, কমিটির কার্যকাল/মেয়াদ নির্ধারণ, সদস্যদের নাম-ছবি-পদবি সম্পাদন এবং পুরোনো কমিটির স্থায়ী সংরক্ষণাগার পরিচালনা করুন।'
              : 'Create new committees, manage executive tenures, edit member bios & photos, and securely maintain past committee archives.'}
          </p>
        </div>

        {hasPermission && (
          <button
            onClick={() => {
              setEditingTerm(null);
              setIsTermModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#D6F36A] hover:bg-[#c5e458] text-[#102B3F] font-bold text-xs cursor-pointer shadow-sm flex items-center gap-2 shrink-0 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'bn' ? 'নতুন কমিটি তৈরি করুন' : 'Create New Committee'}</span>
          </button>
        )}
      </div>

      {/* Committee Terms Switcher Bar */}
      <div className="p-4 bg-white dark:bg-[#0c1a24] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <span className="text-xs uppercase tracking-wider font-bold text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-[#167D78] dark:text-[#D6F36A]" />
            <span>{language === 'bn' ? 'কমিটির কার্যকাল / পরিষদ নির্বাচন:' : 'Select Committee Term / Council:'}</span>
          </span>

          <span className="text-xs text-stone-500 dark:text-stone-400">
            {language === 'bn' ? `মোট সংরক্ষিত কমিটি: ${committeeTerms.length}টি` : `Total Archived Terms: ${committeeTerms.length}`}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {committeeTerms.map((term) => {
            const isSelected = term.id === selectedTermId;
            return (
              <div
                key={term.id}
                className={`flex items-center gap-1 rounded-xl p-1 transition-all ${
                  isSelected
                    ? 'bg-[#102B3F] text-white shadow-sm'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
              >
                <button
                  onClick={() => setSelectedTermId(term.id)}
                  className="px-3 py-1.5 text-xs font-bold cursor-pointer flex items-center gap-2"
                >
                  {term.isCurrent ? (
                    <span className="px-1.5 py-0.5 rounded bg-[#D6F36A] text-[#102B3F] text-[10px] font-black uppercase">
                      {language === 'bn' ? 'বর্তমান' : 'Active'}
                    </span>
                  ) : (
                    <Archive className="w-3 h-3 text-amber-500" />
                  )}
                  <span>{language === 'bn' ? term.termTitleBn : term.termTitleEn}</span>
                  <span className="text-[10px] opacity-75 font-mono">({term.members.length})</span>
                </button>

                {hasPermission && (
                  <button
                    onClick={() => {
                      setEditingTerm(term);
                      setIsTermModalOpen(true);
                    }}
                    title={language === 'bn' ? 'মেয়াদ ও তথ্য সম্পাদন' : 'Edit Term'}
                    className={`p-1.5 rounded-lg cursor-pointer ${
                      isSelected ? 'hover:bg-white/20 text-white' : 'hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-600 dark:text-stone-300'
                    }`}
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Selected Term Header Card */}
      {activeTerm && (
        <div className="p-5 bg-stone-50 dark:bg-stone-900/60 rounded-2xl border border-stone-200 dark:border-stone-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-lg font-extrabold text-[#102B3F] dark:text-white">
                {language === 'bn' ? activeTerm.termTitleBn : activeTerm.termTitleEn}
              </h4>
              {activeTerm.isCurrent ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{language === 'bn' ? 'কার্যকর বর্তমান কমিটি' : 'Currently Active Council'}</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-xs font-bold flex items-center gap-1">
                  <Archive className="w-3 h-3" />
                  <span>{language === 'bn' ? 'সংরক্ষিত সাবেক কমিটি' : 'Archived Past Committee'}</span>
                </span>
              )}
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-400">
              {language === 'bn' ? activeTerm.descriptionBn : activeTerm.descriptionEn}
            </p>

            <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-3 pt-1">
              <span>{language === 'bn' ? `কার্যকাল: ${activeTerm.startYear} - ${activeTerm.endYear}` : `Tenure: ${activeTerm.startYear} - ${activeTerm.endYear}`}</span>
              {activeTerm.establishedDate && (
                <>
                  <span>•</span>
                  <span>{language === 'bn' ? `প্রতিষ্ঠা/অনুমোদন: ${activeTerm.establishedDate}` : `Formed: ${activeTerm.establishedDate}`}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {!activeTerm.isCurrent && hasPermission && (
              <button
                onClick={() => handleSetCurrentTerm(activeTerm.id)}
                className="px-3.5 py-2 rounded-xl bg-[#167D78] hover:bg-[#126863] text-white font-bold text-xs cursor-pointer shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Crown className="w-3.5 h-3.5 text-[#D6F36A]" />
                <span>{language === 'bn' ? 'এই কমিটিকে বর্তমান পরিষদ করুন' : 'Set as Current Active'}</span>
              </button>
            )}

            {hasPermission && (
              <button
                onClick={() => {
                  setEditingMember(null);
                  setMemberPhotoPreview('');
                  setIsMemberModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-[#102B3F] hover:bg-[#1a3f5c] text-white font-bold text-xs cursor-pointer shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-[#D6F36A]" />
                <span>{language === 'bn' ? 'সদস্য যুক্ত করুন' : 'Add Member'}</span>
              </button>
            )}

            {!activeTerm.isCurrent && isSuperAdmin && (
              <button
                onClick={() => setConfirmDeleteTermId(activeTerm.id)}
                className="px-3 py-2 rounded-xl border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-bold text-xs cursor-pointer flex items-center gap-1 transition-colors"
                title={language === 'bn' ? 'পুরোনো আর্কাইভ স্থায়ীভাবে ডিলিট' : 'Permanently Delete Archive'}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'আর্কাইভ মুছুন' : 'Delete Archive'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Member Search & Category Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0c1a24] p-3 rounded-2xl border border-stone-200 dark:border-stone-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchMember}
            onChange={(e) => setSearchMember(e.target.value)}
            placeholder={language === 'bn' ? 'নাম, পদবি বা ইমেইল দিয়ে খুঁজুন...' : 'Search members...'}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#167D78]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {categoryOptions.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-[#102B3F] text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              {language === 'bn' ? cat.labelBn : cat.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayedMembers.map((member) => (
          <div
            key={member.id}
            className="p-4 bg-white dark:bg-[#0c1a24] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs hover:border-[#167D78] transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="relative w-full h-44 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 mb-3 border border-stone-200 dark:border-stone-700">
                <img
                  src={member.image}
                  alt={language === 'bn' ? member.nameBn : member.nameEn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';
                  }}
                />
                {member.isFounder && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-[#D6F36A] text-[#102B3F] text-[10px] font-black uppercase shadow-xs">
                    {language === 'bn' ? 'প্রতিষ্ঠাতা' : 'Founder'}
                  </span>
                )}
                {member.category && (
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[#D6F36A] text-[10px] font-semibold">
                    {member.category}
                  </span>
                )}
              </div>

              <h5 className="font-extrabold text-sm text-[#102B3F] dark:text-white leading-tight">
                {language === 'bn' ? member.nameBn : member.nameEn}
              </h5>
              <span className="text-xs font-bold text-[#167D78] dark:text-[#D6F36A] block mt-0.5">
                {language === 'bn' ? member.roleBn : member.roleEn}
              </span>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1.5 line-clamp-2">
                {language === 'bn' ? member.bioBn : member.bioEn}
              </p>

              {(member.email || member.phone) && (
                <div className="mt-2 pt-2 border-t border-stone-100 dark:border-stone-800/80 text-[10px] text-stone-400 space-y-0.5">
                  {member.phone && <div>📞 {member.phone}</div>}
                  {member.email && <div className="truncate">✉️ {member.email}</div>}
                </div>
              )}
            </div>

            {hasPermission && (
              <div className="flex items-center justify-end gap-1 pt-3 mt-3 border-t border-stone-100 dark:border-stone-800">
                <button
                  onClick={() => {
                    setEditingMember(member);
                    setMemberPhotoPreview(member.image);
                    setIsMemberModalOpen(true);
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer flex items-center gap-1"
                >
                  <Edit className="w-3 h-3 text-[#167D78]" />
                  <span>{language === 'bn' ? 'সম্পাদন' : 'Edit'}</span>
                </button>
                <button
                  onClick={() => handleDeleteMember(member.id)}
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

      {displayedMembers.length === 0 && (
        <div className="p-12 text-center bg-stone-50 dark:bg-stone-900/40 rounded-2xl border border-stone-200 dark:border-stone-800">
          <Users className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <h5 className="font-bold text-stone-700 dark:text-stone-300 text-sm">
            {language === 'bn' ? 'এই ক্যাটাগরিতে কোনো সদস্য পাওয়া যায়নি' : 'No members found in this category'}
          </h5>
          <p className="text-xs text-stone-400 mt-1">
            {language === 'bn' ? 'ফিল্টার পরিবর্তন করুন বা নতুন সদস্য যোগ করুন।' : 'Change filter or add a member.'}
          </p>
        </div>
      )}

      {/* CREATE / EDIT COMMITTEE TERM MODAL */}
      {isTermModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0c1a24] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl max-w-lg w-full p-6 relative">
            <button
              onClick={() => {
                setIsTermModalOpen(false);
                setEditingTerm(null);
              }}
              className="absolute top-4 right-4 p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h4 className="text-lg font-bold text-[#102B3F] dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#167D78]" />
              <span>
                {editingTerm
                  ? (language === 'bn' ? 'কমিটির কার্যকাল ও তথ্য সম্পাদন' : 'Edit Committee Term')
                  : (language === 'bn' ? 'নতুন কমিটি তৈরি করুন' : 'Create New Committee')}
              </span>
            </h4>

            <form onSubmit={handleSaveTermSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  {language === 'bn' ? 'কমিটির শিরোনাম (বাংলা)' : 'Committee Title (Bangla)'} *
                </label>
                <input
                  type="text"
                  name="termTitleBn"
                  defaultValue={editingTerm?.termTitleBn || 'কার্যনির্বাহী পরিষদ (২০২৮-২০৩০)'}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  {language === 'bn' ? 'কমিটির শিরোনাম (English)' : 'Committee Title (English)'}
                </label>
                <input
                  type="text"
                  name="termTitleEn"
                  defaultValue={editingTerm?.termTitleEn || 'Executive Council (2028-2030)'}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {language === 'bn' ? 'শুরুর বছর' : 'Start Year'} *
                  </label>
                  <input
                    type="number"
                    name="startYear"
                    defaultValue={editingTerm?.startYear || 2028}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {language === 'bn' ? 'সমাপ্তির বছর' : 'End Year'} *
                  </label>
                  <input
                    type="number"
                    name="endYear"
                    defaultValue={editingTerm?.endYear || 2030}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  {language === 'bn' ? 'অনুমোদন / কার্যকর তারিখ' : 'Approval / Established Date'}
                </label>
                <input
                  type="text"
                  name="establishedDate"
                  defaultValue={editingTerm?.establishedDate || '০৭-০৩-২০২৮'}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  {language === 'bn' ? 'বিবরণ / লক্ষ্য ও উদ্দেশ্য' : 'Description / Mission Note'}
                </label>
                <textarea
                  name="descriptionBn"
                  rows={2}
                  defaultValue={editingTerm?.descriptionBn || 'কোলাশ ফাউন্ডেশনের অনুমোদিত কার্যনির্বাহী পরিষদ।'}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isCurrent"
                  name="isCurrent"
                  defaultChecked={editingTerm?.isCurrent || false}
                  className="rounded text-[#167D78] focus:ring-[#167D78]"
                />
                <label htmlFor="isCurrent" className="text-xs font-bold text-stone-700 dark:text-stone-300 cursor-pointer">
                  {language === 'bn' ? 'এই কমিটিকে বর্তমান কার্যকর পরিষদ হিসেবে চিহ্নিত করুন' : 'Mark as current active council'}
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsTermModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#167D78] hover:bg-[#126863] rounded-xl shadow-xs cursor-pointer"
                >
                  {language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Committee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MEMBER MODAL */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0c1a24] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsMemberModalOpen(false);
                setEditingMember(null);
                setMemberPhotoPreview('');
              }}
              className="absolute top-4 right-4 p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h4 className="text-lg font-bold text-[#102B3F] dark:text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#167D78]" />
              <span>
                {editingMember
                  ? (language === 'bn' ? 'কমিটি সদস্যের তথ্য সম্পাদন' : 'Edit Member Details')
                  : (language === 'bn' ? 'নতুন কমিটি সদস্য যোগ করুন' : 'Add Committee Member')}
              </span>
            </h4>

            <form onSubmit={handleSaveMemberSubmit} className="space-y-4">
              {/* Photo Upload Section */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  {language === 'bn' ? 'সদস্যের ছবি (Photo Upload or URL)' : 'Member Photo'}
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shrink-0">
                    <img
                      src={memberPhotoPreview || editingMember?.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
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
                      <span>{language === 'bn' ? 'কম্পিউটার/মোবাইল থেকে ছবি আপলোড' : 'Upload from device'}</span>
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
                      value={memberPhotoPreview || editingMember?.image || ''}
                      onChange={(e) => setMemberPhotoPreview(e.target.value)}
                      placeholder={language === 'bn' ? 'বা ছবির সরাসরি লিংক পেস্ট করুন...' : 'Or paste image URL...'}
                      className="w-full px-2.5 py-1 text-xs rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {language === 'bn' ? 'সদস্যের নাম (বাংলা)' : 'Name (Bangla)'} *
                  </label>
                  <input
                    type="text"
                    name="nameBn"
                    defaultValue={editingMember?.nameBn || ''}
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
                    defaultValue={editingMember?.nameEn || ''}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {language === 'bn' ? 'পদবি (বাংলা)' : 'Role / Designation (Bangla)'} *
                  </label>
                  <input
                    type="text"
                    name="roleBn"
                    defaultValue={editingMember?.roleBn || ''}
                    placeholder="যেমন: সহ-সভাপতি, অর্থ সম্পাদক"
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {language === 'bn' ? 'পদবি (English)' : 'Role / Designation (English)'}
                  </label>
                  <input
                    type="text"
                    name="roleEn"
                    defaultValue={editingMember?.roleEn || ''}
                    placeholder="e.g. Vice President"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {language === 'bn' ? 'বিভাগ / ক্যাটাগরি' : 'Department / Wing'}
                  </label>
                  <select
                    name="category"
                    defaultValue={editingMember?.category || 'executive'}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white cursor-pointer"
                  >
                    <option value="executive">শীর্ষ নেতৃত্ব ও প্রশাসন (Executive)</option>
                    <option value="finance">অর্থ ও হিসাব (Finance)</option>
                    <option value="education">শিক্ষা ও সংস্কৃতি (Education)</option>
                    <option value="welfare">সমাজকল্যাণ ও ত্রাণ (Social Welfare)</option>
                    <option value="publicity">প্রচার ও পরিকল্পনা (Publicity)</option>
                    <option value="sports">ক্রীড়া ও যুব উন্নয়ন (Sports & Youth)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {language === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}
                  </label>
                  <input
                    type="text"
                    name="phone"
                    defaultValue={editingMember?.phone || ''}
                    placeholder="01712-XXXXXX"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  {language === 'bn' ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={editingMember?.email || ''}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  {language === 'bn' ? 'সংক্ষিপ্ত পরিচিতি ও অবদান (Bio)' : 'Bio / Contribution'}
                </label>
                <textarea
                  name="bioBn"
                  rows={2}
                  defaultValue={editingMember?.bioBn || ''}
                  placeholder="কোলাশ ফাউন্ডেশনে দায়িত্ব ও সামাজিক কাজের বিবরণ..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isFounder"
                  name="isFounder"
                  defaultChecked={editingMember?.isFounder || false}
                  className="rounded text-[#167D78] focus:ring-[#167D78]"
                />
                <label htmlFor="isFounder" className="text-xs font-bold text-stone-700 dark:text-stone-300 cursor-pointer">
                  {language === 'bn' ? 'প্রতিষ্ঠাতা সদস্য হিসেবে চিহ্নিত করুন' : 'Mark as Founder Member'}
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#167D78] hover:bg-[#126863] rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'তথ্য সংরক্ষণ' : 'Save Details'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE ARCHIVED TERM MODAL */}
      {confirmDeleteTermId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0c1a24] rounded-2xl border border-red-300 dark:border-red-900 shadow-2xl max-w-md w-full p-6 relative">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mb-3 mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h4 className="text-center text-base font-bold text-stone-900 dark:text-white">
              {language === 'bn' ? 'কমিটি আর্কাইভ স্থায়ীভাবে মুছে ফেলার সতর্কতা' : 'Permanent Committee Deletion'}
            </h4>
            <p className="text-center text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
              {language === 'bn'
                ? 'ঐতিহাসিক রেকর্ড সুরক্ষার অংশ হিসেবে কমিটি মুছে ফেলা অত্যন্ত সংবেদনশীল। নিশ্চিত করতে নিচের বক্সে হুবহু "DELETE ARCHIVE" লিখুন:'
                : 'To protect institutional records, deleting a past council requires typing "DELETE ARCHIVE" below:'}
            </p>

            <div className="my-4">
              <input
                type="text"
                value={confirmDeleteInput}
                onChange={(e) => setConfirmDeleteInput(e.target.value)}
                placeholder="DELETE ARCHIVE"
                className="w-full px-3 py-2 text-xs font-mono font-bold text-center uppercase rounded-xl bg-stone-50 dark:bg-stone-900 border border-red-300 dark:border-red-700 text-stone-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setConfirmDeleteTermId(null);
                  setConfirmDeleteInput('');
                }}
                className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl cursor-pointer"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={handleExecuteDeleteTerm}
                disabled={confirmDeleteInput.trim() !== 'DELETE ARCHIVE'}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl cursor-pointer shadow-xs"
              >
                {language === 'bn' ? 'স্থায়ীভাবে ডিলিট' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
