import React, { useState } from 'react';
import { Droplets, Phone, MessageSquare, MapPin, Search, X, Check, AlertCircle, Heart, Share2 } from 'lucide-react';
import { GeneralMember, Language } from '../../types';

interface UrgentBloodModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: GeneralMember[];
  language: Language;
}

export const UrgentBloodModal: React.FC<UrgentBloodModalProps> = ({
  isOpen,
  onClose,
  members,
  language
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  // Distinct districts
  const districts = Array.from(new Set(members.map(m => m.district).filter(Boolean)));

  const filteredMembers = members.filter(m => {
    const matchesGroup = selectedGroup === 'all' || m.bloodGroup === selectedGroup;
    const matchesDistrict = selectedDistrict === 'all' || m.district === selectedDistrict;
    const matchesSearch = !searchQuery ||
      m.nameBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.district.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGroup && matchesDistrict && matchesSearch;
  });

  const handleCopyPhone = (phone: string, id: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0c1a24] rounded-3xl max-w-2xl w-full border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-[#102B3F] p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shadow-xs">
              <Droplets className="w-6 h-6 text-rose-200 fill-rose-200 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-2">
                <span>{language === 'bn' ? 'জরুরি রক্তদাতা ডিরেক্টরি' : 'Emergency Blood Donor Network'}</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/80 text-[10px] font-bold uppercase tracking-wider">
                  24/7 Helpline
                </span>
              </h3>
              <p className="text-[11px] text-rose-100">
                {language === 'bn' ? 'কোলাশ ফাউন্ডেশনের নিবন্ধিত স্বেচ্ছাসেবক ও রক্তদাতা নেটওয়ার্ক' : 'CoLASH Verified Blood Donors & Volunteer Registry'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls */}
        <div className="p-4 sm:p-5 bg-stone-50 dark:bg-stone-900/60 border-b border-stone-200 dark:border-stone-800 space-y-3 shrink-0">
          {/* Blood Group Chips */}
          <div>
            <label className="text-[11px] font-bold text-stone-500 dark:text-stone-400 block mb-1.5">
              {language === 'bn' ? 'রক্তের গ্রুপ নির্বাচন করুন:' : 'Select Blood Group:'}
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedGroup('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedGroup === 'all'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-rose-400'
                }`}
              >
                {language === 'bn' ? 'সকল গ্রুপ' : 'All Groups'}
              </button>
              {bloodGroups.map(bg => (
                <button
                  key={bg}
                  onClick={() => setSelectedGroup(bg)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    selectedGroup === bg
                      ? 'bg-rose-600 text-white shadow-xs scale-105'
                      : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-rose-400'
                  }`}
                >
                  <Droplets className="w-3 h-3 fill-rose-500 text-rose-500" />
                  <span>{bg}</span>
                </button>
              ))}
            </div>
          </div>

          {/* District Dropdown and Search */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="sm:w-1/2">
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm text-stone-800 dark:text-stone-200 focus:outline-hidden focus:border-rose-500 cursor-pointer"
              >
                <option value="all">{language === 'bn' ? 'সকল জেলা' : 'All Districts'}</option>
                {districts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'bn' ? 'নাম বা জেলা দিয়ে খুঁজুন...' : 'Search donor name or district...'}
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-hidden focus:border-rose-500"
              />
            </div>
          </div>
        </div>

        {/* Donors List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
            <span>
              {language === 'bn'
                ? `উপলব্ধ রক্তদাতা: ${filteredMembers.length} জন`
                : `Available Donors: ${filteredMembers.length}`}
            </span>
            <span className="text-rose-600 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'জরুরি প্রয়োজনে সরাসরি কল করুন' : 'Direct calling enabled'}</span>
            </span>
          </div>

          {filteredMembers.length === 0 ? (
            <div className="text-center py-12 text-stone-400 space-y-2">
              <Droplets className="w-10 h-10 mx-auto text-stone-300" />
              <p className="text-sm font-semibold">
                {language === 'bn' ? 'এই ক্যাটাগরিতে কোনো রক্তদাতা পাওয়া যায়নি।' : 'No blood donors found for this criteria.'}
              </p>
              <p className="text-xs">
                {language === 'bn' ? 'অন্য গ্রুপ বা জেলা নির্বাচন করে অনুসন্ধান করুন।' : 'Try selecting a different blood group or district.'}
              </p>
            </div>
          ) : (
            filteredMembers.map((donor) => {
              const defaultPhone = '01646-475348';
              const donorPhone = defaultPhone;
              const cleanPhone = donorPhone.replace(/[^0-9]/g, '');
              const waLink = `https://wa.me/88${cleanPhone}?text=${encodeURIComponent(`আসসালামু আলাইকুম। কোলাশ ফাউন্ডেশন ব্লাড ডিরেক্টরি থেকে জরুরি প্রয়োজনে যোগাযোগ করছি। রোগীর রক্তের গ্রুপ: ${donor.bloodGroup}`)}`;

              return (
                <div
                  key={donor.id}
                  className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-rose-300 dark:hover:border-rose-700 shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={donor.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                        alt={donor.nameEn}
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-rose-500/60"
                      />
                      <span className="absolute -bottom-1 -right-1 px-1 py-0.2 rounded bg-rose-600 text-white text-[9px] font-black">
                        {donor.bloodGroup}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-sm text-[#102B3F] dark:text-white flex items-center gap-2">
                        <span>{language === 'bn' ? donor.nameBn : donor.nameEn}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-500">
                          {donor.membershipId}
                        </span>
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3 text-rose-500" />
                          <span>{donor.district}</span>
                        </span>
                        <span>·</span>
                        <span>{language === 'bn' ? donor.roleBn : donor.roleEn}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <a
                      href={`tel:${donorPhone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
                      title="Direct Phone Call"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'সরাসরি কল' : 'Call'}</span>
                    </a>

                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
                      title="Send WhatsApp Message"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleCopyPhone(donorPhone, donor.id)}
                      className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
                      title="Copy Number"
                    >
                      {copiedId === donor.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-stone-100 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500 shrink-0">
          <span>জরুরি প্রয়োজনে কেন্দ্রীয় হটলাইন: <strong>01646-475348</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs cursor-pointer"
          >
            {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
