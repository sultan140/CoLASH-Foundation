import React, { useState } from 'react';
import {
  Smartphone,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  AlertCircle,
  ShieldCheck,
  Save,
  X,
  CreditCard
} from 'lucide-react';
import { PaymentChannel, AdminUser, Language } from '../../types';

interface PaymentChannelsAdminPanelProps {
  currentAdmin: AdminUser | null;
  language: Language;
  paymentChannels: PaymentChannel[];
  onUpdatePaymentChannels: (channels: PaymentChannel[]) => void;
  onToast: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
}

export const PaymentChannelsAdminPanel: React.FC<PaymentChannelsAdminPanelProps> = ({
  currentAdmin,
  language,
  paymentChannels,
  onUpdatePaymentChannels,
  onToast
}) => {
  const isSuperAdmin = currentAdmin?.role === 'super_admin';
  const [selectedGateway, setSelectedGateway] = useState<'all' | 'bkash' | 'nagad'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<PaymentChannel | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states
  const [gateway, setGateway] = useState<'bkash' | 'nagad'>('bkash');
  const [number, setNumber] = useState('');
  const [accountType, setAccountType] = useState<'Personal' | 'Merchant' | 'Agent'>('Personal');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [instructionBn, setInstructionBn] = useState('');
  const [instructionEn, setInstructionEn] = useState('');
  const [isActive, setIsActive] = useState(true);

  const filteredChannels = paymentChannels.filter(c =>
    selectedGateway === 'all' ? true : c.gateway === selectedGateway
  );

  const bkashCount = paymentChannels.filter(c => c.gateway === 'bkash' && c.isActive).length;
  const nagadCount = paymentChannels.filter(c => c.gateway === 'nagad' && c.isActive).length;

  const handleOpenAddModal = () => {
    setEditingChannel(null);
    setGateway(selectedGateway === 'nagad' ? 'nagad' : 'bkash');
    setNumber('');
    setAccountType('Personal');
    setAccountHolderName('');
    setInstructionBn('বিকাশ অ্যাপ বা *247# ডায়াল করে "Send Money" (সেন্ড মানি) করুন।');
    setInstructionEn('Send Money to this bKash number.');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (channel: PaymentChannel) => {
    setEditingChannel(channel);
    setGateway(channel.gateway);
    setNumber(channel.number);
    setAccountType(channel.accountType);
    setAccountHolderName(channel.accountHolderName);
    setInstructionBn(channel.instructionBn);
    setInstructionEn(channel.instructionEn || '');
    setIsActive(channel.isActive);
    setIsModalOpen(true);
  };

  const handleToggleActive = (id: string) => {
    const target = paymentChannels.find(c => c.id === id);
    if (!target) return;

    // Safety guard: ensure at least one active number exists per gateway
    const sameGatewayActive = paymentChannels.filter(c => c.gateway === target.gateway && c.isActive);
    if (target.isActive && sameGatewayActive.length <= 1) {
      onToast(
        'error',
        language === 'bn' ? 'নিষ্ক্রিয় করা সম্ভব নয়' : 'Cannot Deactivate',
        language === 'bn' ? `কমপক্ষে একটি ${target.gateway === 'bkash' ? 'বিকাশ' : 'নগদ'} নম্বর সক্রিয় থাকা আবশ্যক।` : 'At least one active number required.'
      );
      return;
    }

    const updated = paymentChannels.map(c => (c.id === id ? { ...c, isActive: !c.isActive } : c));
    onUpdatePaymentChannels(updated);
    onToast(
      'success',
      language === 'bn' ? 'স্ট্যাটাস পরিবর্তিত হয়েছে' : 'Status Updated',
      `${target.number} (${target.isActive ? 'নিষ্ক্রিয়' : 'সক্রিয়'})`
    );
  };

  const handleDeleteChannel = (id: string) => {
    const target = paymentChannels.find(c => c.id === id);
    if (!target) return;

    const sameGateway = paymentChannels.filter(c => c.gateway === target.gateway);
    if (sameGateway.length <= 1) {
      onToast(
        'error',
        language === 'bn' ? 'ডিলিট করা সম্ভব নয়' : 'Cannot Delete',
        language === 'bn' ? `প্রতিটি মাধ্যমে কমপক্ষে ১টি নম্বর থাকতে হবে।` : 'Must keep at least 1 number per gateway.'
      );
      return;
    }

    if (!window.confirm(language === 'bn' ? `আপনি কি নিশ্চিতভাবে "${target.number}" নম্বরটি মুছে ফেলতে চান?` : `Delete channel ${target.number}?`)) {
      return;
    }

    const updated = paymentChannels.filter(c => c.id !== id);
    onUpdatePaymentChannels(updated);
    onToast('info', language === 'bn' ? 'পেমেন্ট চ্যানেল মুছে ফেলা হয়েছে' : 'Payment channel deleted');
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!number.trim() || number.replace(/[^0-9]/g, '').length < 11) {
      onToast('error', language === 'bn' ? 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন' : 'Valid 11-digit phone number required');
      return;
    }
    if (!accountHolderName.trim()) {
      onToast('error', language === 'bn' ? 'হিসাবধারীর নাম আবশ্যক' : 'Account holder name required');
      return;
    }

    if (editingChannel) {
      const updated = paymentChannels.map(c => {
        if (c.id === editingChannel.id) {
          return {
            ...c,
            gateway,
            number: number.trim(),
            accountType,
            accountHolderName: accountHolderName.trim(),
            instructionBn: instructionBn.trim(),
            instructionEn: instructionEn.trim(),
            isActive
          };
        }
        return c;
      });
      onUpdatePaymentChannels(updated);
      onToast('success', language === 'bn' ? 'পেমেন্ট চ্যানেল সফলভাবে আপডেট হয়েছে' : 'Channel Updated');
    } else {
      const newChannel: PaymentChannel = {
        id: `pay-${gateway}-${Date.now().toString().slice(-4)}`,
        gateway,
        number: number.trim(),
        accountType,
        accountHolderName: accountHolderName.trim(),
        instructionBn: instructionBn.trim(),
        instructionEn: instructionEn.trim(),
        isActive,
        createdAt: new Date().toISOString().split('T')[0]
      };
      const updated = [...paymentChannels, newChannel];
      onUpdatePaymentChannels(updated);
      onToast('success', language === 'bn' ? 'নতুন পেমেন্ট নম্বর যুক্ত হয়েছে' : 'New payment number added');
    }

    setIsModalOpen(false);
    setEditingChannel(null);
  };

  const handleCopyNumber = (num: string, id: string) => {
    navigator.clipboard.writeText(num.replace(/[^0-9]/g, ''));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#102B3F] to-[#167D78] text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#D6F36A] text-xs font-bold uppercase tracking-wider mb-2">
            <Smartphone className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'ডাইনামিক মোবাইল ব্যাংকিং পেমেন্ট গেটওয়ে' : 'Dynamic Mobile Banking Gateways'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black">
            {language === 'bn' ? 'বিকাশ ও নগদ একাধিক অ্যাকাউন্ট ব্যবস্থাপনা' : 'bKash & Nagad Multi-Number Management'}
          </h3>
          <p className="text-xs sm:text-sm text-stone-200 mt-1 max-w-2xl leading-relaxed">
            {language === 'bn'
              ? 'ওয়েবসাইটের অনুদান মডালে ব্যাংক ট্রান্সফার অপশন সম্পূর্ণ বাদ দিয়ে বিকাশ ও নগদ-এর একাধিক সচল নম্বর পরিচালনা করুন। নতুন নম্বর যোগ, পরিবর্তন, সক্রিয়/নিষ্ক্রিয় ও নির্দেশনা সম্পাদনা করুন।'
              : 'Direct dynamic management of multiple bKash and Nagad payment channels. Bank options removed completely.'}
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-[#D6F36A] hover:bg-[#c5e458] text-[#102B3F] font-bold text-xs cursor-pointer shadow-sm flex items-center gap-2 shrink-0 transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'bn' ? 'নতুন পেমেন্ট নম্বর যোগ করুন' : 'Add New Number'}</span>
        </button>
      </div>

      {/* Gateway Selector Tabs & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedGateway('all')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedGateway === 'all'
                ? 'bg-[#102B3F] text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            <span>{language === 'bn' ? 'সকল মাধ্যম' : 'All Gateways'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono">
              {paymentChannels.length}
            </span>
          </button>

          <button
            onClick={() => setSelectedGateway('bkash')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedGateway === 'bkash'
                ? 'bg-[#E2136E] text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-[#E2136E] hover:bg-[#E2136E]/10'
            }`}
          >
            <span>bKash (বিকাশ)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono font-bold">
              {bkashCount} সক্রিয়
            </span>
          </button>

          <button
            onClick={() => setSelectedGateway('nagad')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedGateway === 'nagad'
                ? 'bg-[#F7941D] text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-[#F7941D] hover:bg-[#F7941D]/10'
            }`}
          >
            <span>Nagad (নগদ)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono font-bold">
              {nagadCount} সক্রিয়
            </span>
          </button>
        </div>

        <div className="text-xs text-stone-500 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{language === 'bn' ? 'রিয়েল-টাইম অনুদান গেটওয়েতে প্রতিফলিত হবে' : 'Synced live to Donation Modal'}</span>
        </div>
      </div>

      {/* Payment Channels Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredChannels.map((channel) => {
          const isCopied = copiedId === channel.id;

          return (
            <div
              key={channel.id}
              className={`p-5 rounded-2xl border transition-all ${
                channel.isActive
                  ? channel.gateway === 'bkash'
                    ? 'bg-white dark:bg-[#0c1a24] border-[#E2136E]/30 shadow-xs'
                    : 'bg-white dark:bg-[#0c1a24] border-[#F7941D]/30 shadow-xs'
                  : 'bg-stone-100/70 dark:bg-stone-900/40 border-stone-300 dark:border-stone-800 opacity-60'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                    channel.gateway === 'bkash'
                      ? 'bg-[#E2136E]/10 text-[#E2136E] border border-[#E2136E]/30'
                      : 'bg-[#F7941D]/10 text-[#F7941D] border border-[#F7941D]/30'
                  }`}>
                    {channel.gateway}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                    {channel.accountType}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleActive(channel.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                      channel.isActive
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-stone-200 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                    }`}
                  >
                    {channel.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>{channel.isActive ? (language === 'bn' ? 'সক্রিয়' : 'Active') : (language === 'bn' ? 'নিষ্ক্রিয়' : 'Inactive')}</span>
                  </button>
                </div>
              </div>

              {/* Number and Holder Name */}
              <div className="mb-3">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-xl font-black text-stone-900 dark:text-white tracking-wide">
                    {channel.number}
                  </span>
                  <button
                    onClick={() => handleCopyNumber(channel.number, channel.id)}
                    className="flex items-center gap-1 text-[11px] text-[#167D78] hover:underline cursor-pointer"
                  >
                    {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{isCopied ? 'কপি হয়েছে' : 'নম্বর কপি'}</span>
                  </button>
                </div>
                <div className="text-xs font-semibold text-stone-600 dark:text-stone-300 mt-0.5">
                  {channel.accountHolderName}
                </div>
              </div>

              {/* Instruction Box */}
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-300 mb-4 leading-relaxed">
                <strong className="block text-[10px] uppercase text-stone-400 font-bold mb-1">
                  {language === 'bn' ? 'পেমেন্ট নির্দেশনা:' : 'Payment Instruction:'}
                </strong>
                {language === 'bn' ? channel.instructionBn : (channel.instructionEn || channel.instructionBn)}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                <button
                  onClick={() => handleOpenEditModal(channel)}
                  className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5 text-[#167D78]" />
                  <span>{language === 'bn' ? 'সম্পাদনা' : 'Edit'}</span>
                </button>

                <button
                  onClick={() => handleDeleteChannel(channel.id)}
                  className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'মুছুন' : 'Delete'}</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add / Edit Channel Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0c1a24] max-w-lg w-full rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden p-6 text-xs space-y-4">
            
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <h4 className="font-extrabold text-base text-[#102B3F] dark:text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#167D78]" />
                <span>
                  {editingChannel
                    ? (language === 'bn' ? 'পেমেন্ট নম্বর সম্পাদনা' : 'Edit Payment Channel')
                    : (language === 'bn' ? 'নতুন বিকাশ / নগদ নম্বর যুক্তকরণ' : 'Add New Payment Channel')}
                </span>
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-3.5">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    {language === 'bn' ? 'মাধ্যম নির্বাচন' : 'Gateway'} *
                  </label>
                  <select
                    value={gateway}
                    onChange={(e: any) => setGateway(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white font-bold"
                  >
                    <option value="bkash">bKash (বিকাশ)</option>
                    <option value="nagad">Nagad (নগদ)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    {language === 'bn' ? 'অ্যাকাউন্টের ধরণ' : 'Account Type'} *
                  </label>
                  <select
                    value={accountType}
                    onChange={(e: any) => setAccountType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white font-bold"
                  >
                    <option value="Personal">{language === 'bn' ? 'Personal (ব্যক্তিগত)' : 'Personal'}</option>
                    <option value="Merchant">{language === 'bn' ? 'Merchant (মার্চেন্ট)' : 'Merchant'}</option>
                    <option value="Agent">{language === 'bn' ? 'Agent (এজেন্ট)' : 'Agent'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    {language === 'bn' ? 'মোবাইল নম্বর (১১ ডিজিট)' : 'Phone Number'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="01XXXXXXXXX"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    {language === 'bn' ? 'অ্যাকাউন্টধারীর নাম / ফান্ড' : 'Account Holder Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: CoLASH Official"
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  {language === 'bn' ? 'পেমেন্ট নির্দেশনা (বাংলা)' : 'Instruction (Bengali)'} *
                </label>
                <textarea
                  rows={2}
                  required
                  value={instructionBn}
                  onChange={(e) => setInstructionBn(e.target.value)}
                  placeholder="যেমন: বিকাশ অ্যাপ বা *247# ডায়াল করে Send Money করুন..."
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  {language === 'bn' ? 'Payment Instruction (English)' : 'Payment Instruction (English)'}
                </label>
                <textarea
                  rows={2}
                  value={instructionEn}
                  onChange={(e) => setInstructionEn(e.target.value)}
                  placeholder="e.g. Use Make Payment option in bKash app..."
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 accent-[#167D78] cursor-pointer"
                />
                <label htmlFor="isActiveToggle" className="font-bold text-stone-800 dark:text-stone-200 cursor-pointer">
                  {language === 'bn' ? 'এই নম্বরটি সাথে সাথে ওয়েবসাইটে সক্রিয় (Active) রাখুন' : 'Set active on public website'}
                </label>
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 cursor-pointer font-bold"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#167D78] hover:bg-[#102B3F] text-white font-bold cursor-pointer transition-colors shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4 text-[#D6F36A]" />
                  <span>{language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Channel'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
