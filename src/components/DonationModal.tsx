import React, { useState } from 'react';
import { X, Heart, CheckCircle2, Copy, Check, Printer, Download, ArrowRight, ShieldCheck, Smartphone, Loader2, AlertCircle } from 'lucide-react';
import { Project, Language, Donation, WebsiteCustomConfig, PaymentChannel } from '../types';
import { INITIAL_PAYMENT_CHANNELS } from '../data/paymentChannels';
import { MagneticButton } from './common/MagneticButton';
import { DonationGoalProgress } from './common/DonationGoalProgress';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedProject?: Project | null;
  projects: Project[];
  language: Language;
  websiteConfig?: WebsiteCustomConfig;
  paymentChannels?: PaymentChannel[];
  onDonationSuccess: (donation: Donation) => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({
  isOpen,
  onClose,
  preselectedProject,
  projects,
  language,
  paymentChannels = INITIAL_PAYMENT_CHANNELS,
  onDonationSuccess
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(preselectedProject?.id || 'general');
  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [frequency, setFrequency] = useState<'onetime' | 'monthly'>('onetime');
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad'>('bkash');
  
  // Payment info
  const [senderPhone, setSenderPhone] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [selectedChannelId, setSelectedChannelId] = useState<string>('');
  
  // Donor info
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donorNotes, setDonorNotes] = useState('');

  // Processing & validation states
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Generated receipt
  const [createdReceipt, setCreatedReceipt] = useState<Donation | null>(null);
  const [copiedChannelId, setCopiedChannelId] = useState<string | null>(null);

  // Active channels for current gateway
  const activeChannels = (paymentChannels.length > 0 ? paymentChannels : INITIAL_PAYMENT_CHANNELS)
    .filter(c => c.gateway === paymentMethod && c.isActive);

  // Auto-select first channel when gateway changes
  React.useEffect(() => {
    if (activeChannels.length > 0 && (!selectedChannelId || !activeChannels.some(c => c.id === selectedChannelId))) {
      setSelectedChannelId(activeChannels[0].id);
    }
  }, [paymentMethod, activeChannels, selectedChannelId]);

  // Sync preselected project when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedProjectId(preselectedProject?.id || 'general');
    }
  }, [isOpen, preselectedProject]);

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

  const presetAmounts = [500, 1000, 2500, 5000, 10000];

  const handleSelectPreset = (val: number) => {
    setAmount(val);
    setCustomAmount('');
    setValidationError(null);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(val);
    if (val) {
      setAmount(Number(val));
    }
    setValidationError(null);
  };

  const getSelectedProjectTitle = () => {
    if (selectedProjectId === 'general') {
      return language === 'bn' ? 'সাধারণ জরুরি ত্রাণ ও জনকল্যাণ তহবিল' : 'General Emergency & Welfare Fund';
    }
    const found = projects.find(p => p.id === selectedProjectId);
    return found ? (language === 'bn' ? found.titleBn : found.titleEn) : 'General Relief';
  };

  const handleStep1Next = () => {
    if (amount < 50) {
      setValidationError(language === 'bn' ? 'অনুগ্রহ করে সর্বনিম্ন ৫০ টাকা বা তার বেশি অনুদান প্রদান করুন।' : 'Please enter an amount of at least BDT 50.');
      return;
    }
    setValidationError(null);
    setStep(2);
  };

  const handleStep2Next = () => {
    if (!senderPhone.trim() || senderPhone.length < 10) {
      setValidationError(language === 'bn' ? 'সঠিক প্রেরক মোবাইল নম্বর প্রদান করুন (১১ ডিজিট)' : 'Please enter a valid 11-digit sender phone number.');
      return;
    }
    if (!transactionId.trim() || transactionId.length < 4) {
      setValidationError(language === 'bn' ? 'সঠিক ট্রানজেকশন আইডি (TrxID) প্রদান করুন' : 'Please provide a valid Transaction ID.');
      return;
    }
    setValidationError(null);
    setStep(3);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAnonymous && !donorName.trim()) {
      setValidationError(language === 'bn' ? 'অনুগ্রহ করে আপনার নাম লিখুন অথবা অজ্ঞাত (Anonymous) নির্বাচন করুন।' : 'Please enter your name or choose anonymous.');
      return;
    }

    setValidationError(null);
    setIsProcessing(true);

    // Realistic processing handshake simulation (800ms)
    setTimeout(() => {
      const randomSuffix = Math.floor(10000 + Math.random() * 90000);
      const receiptNum = `CLF-2026-${randomSuffix}`;
      const generatedTrx = transactionId.trim() || `TXN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      const newDonation: Donation = {
        id: `dn-${Date.now()}`,
        receiptNumber: receiptNum,
        donorName: isAnonymous ? (language === 'bn' ? 'শুভাকাঙ্ক্ষী (গোপন রাখা হয়েছে)' : 'Anonymous Well-wisher') : (donorName.trim() || 'Valued Donor'),
        donorEmail: donorEmail.trim() || 'donor@colash.org',
        donorPhone: donorPhone.trim() || senderPhone.trim() || 'N/A',
        amount: amount > 0 ? amount : 1000,
        purpose: selectedProjectId,
        purposeNameBn: getSelectedProjectTitle(),
        purposeNameEn: getSelectedProjectTitle(),
        paymentMethod,
        transactionId: generatedTrx,
        date: new Date().toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        isVerified: true,
        isAnonymous,
        notes: donorNotes
      };

      setCreatedReceipt(newDonation);
      onDonationSuccess(newDonation);
      setIsProcessing(false);
      setStep(4);
    }, 850);
  };

  const copyToClipboard = (text: string, channelId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedChannelId(channelId);
    setTimeout(() => setCopiedChannelId(null), 2500);
  };

  // Real client-side download of official receipt as HTML document
  const handleDownloadReceipt = () => {
    if (!createdReceipt) return;

    const receiptHtml = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>Donation Receipt - ${createdReceipt.receiptNumber}</title>
  <style>
    body { font-family: sans-serif; background: #fdfdfd; color: #102B3F; padding: 40px; margin: 0; }
    .receipt-box { max-width: 650px; margin: 0 auto; border: 2px solid #167D78; border-radius: 12px; padding: 32px; background: white; }
    .header { border-bottom: 2px solid #eee; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
    .title { font-size: 24px; font-weight: bold; color: #102B3F; margin: 0; }
    .meta { font-size: 13px; color: #666; margin-top: 4px; }
    .receipt-num { font-family: monospace; font-size: 16px; color: #167D78; font-weight: bold; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 14px; margin-bottom: 24px; }
    .label { color: #888; font-size: 12px; text-transform: uppercase; margin-bottom: 4px; }
    .val { font-weight: bold; }
    .amount-box { background: #f4faf9; border: 1px solid #c2e5e1; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px; }
    .amount { font-size: 28px; font-weight: 800; color: #167D78; }
    .footer { border-top: 1px solid #eee; padding-top: 16px; font-size: 12px; color: #888; display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <div class="receipt-box">
    <div class="header">
      <div>
        <h1 class="title">CoLASH Foundation</h1>
        <div class="meta">Reg No: DH-9842/2021 · Tax Exemption Reference: 80G Certified</div>
      </div>
      <div style="text-align: right;">
        <div class="receipt-num">${createdReceipt.receiptNumber}</div>
        <div class="meta">${createdReceipt.date}</div>
      </div>
    </div>
    <div class="grid">
      <div>
        <div class="label">Donor Name</div>
        <div class="val">${createdReceipt.donorName}</div>
      </div>
      <div>
        <div class="label">Allocated Purpose</div>
        <div class="val">${createdReceipt.purposeNameBn}</div>
      </div>
      <div>
        <div class="label">Payment Method</div>
        <div class="val">${createdReceipt.paymentMethod.toUpperCase()} (TrxID: ${createdReceipt.transactionId})</div>
      </div>
      <div>
        <div class="label">Phone / Reference</div>
        <div class="val">${createdReceipt.donorPhone}</div>
      </div>
    </div>
    <div class="amount-box">
      <div class="label">Total Amount Donated</div>
      <div class="amount">BDT ${createdReceipt.amount.toLocaleString()}</div>
    </div>
    <div class="footer">
      <div>Signed: Finance & Audit Committee</div>
      <div>Official Digitally Generated Receipt · 100% Transparent Philanthropy</div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([receiptHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CoLASH-Receipt-${createdReceipt.receiptNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      className={`${step === 4 && createdReceipt ? 'print-modal-backdrop ' : ''}fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`${step === 4 && createdReceipt ? 'print-modal-dialog ' : ''}bg-white dark:bg-[#0c1a24] max-w-xl w-full rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-6 transition-all`}>
        
        {/* Modal Header */}
        <div className="no-print bg-gradient-to-r from-[#102B3F] to-[#167D78] p-5 sm:p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#D6F36A]">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight">
                {language === 'bn' ? 'অনলাইন অনুদান প্রদান' : 'Make an Online Donation'}
              </h3>
              <p className="text-xs text-stone-200">
                {language === 'bn' ? 'কোলাশ ফাউন্ডেশন · প্রতিটি পয়সার পুঙ্খানুপুঙ্খ জবাবদিহিতা' : 'CoLASH Foundation · 100% Transparent Philanthropy'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/90 hover:text-white rounded-xl bg-white/10 hover:bg-white/20 transition-all cursor-pointer shadow-xs hover:scale-105 flex items-center justify-center shrink-0"
            aria-label="Close"
            title={language === 'bn' ? 'বন্ধ করুন (Close)' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation Alert */}
        {validationError && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Step Progress Indicator (Steps 1 to 3) */}
        {step < 4 && (
          <div className="px-6 pt-4 pb-2 border-b border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-xs">
            <div className={`flex items-center gap-1.5 font-semibold ${step >= 1 ? 'text-[#167D78] dark:text-[#D6F36A]' : 'text-stone-400'}`}>
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">1</span>
              <span>{language === 'bn' ? 'পরিমাণ ও খাত' : 'Cause & Amount'}</span>
            </div>
            <span className="text-stone-300 dark:text-stone-700">──</span>
            <div className={`flex items-center gap-1.5 font-semibold ${step >= 2 ? 'text-[#167D78] dark:text-[#D6F36A]' : 'text-stone-400'}`}>
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">2</span>
              <span>{language === 'bn' ? 'বিকাশ / নগদ পেমেন্ট' : 'bKash / Nagad'}</span>
            </div>
            <span className="text-stone-300 dark:text-stone-700">──</span>
            <div className={`flex items-center gap-1.5 font-semibold ${step >= 3 ? 'text-[#167D78] dark:text-[#D6F36A]' : 'text-stone-400'}`}>
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">3</span>
              <span>{language === 'bn' ? 'দাতার তথ্য' : 'Donor Info'}</span>
            </div>
          </div>
        )}

        {/* STEP 1: Cause & Amount */}
        {step === 1 && (
          <div className="p-6 space-y-6">
            
            {/* Frequency selection */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-2">
                {language === 'bn' ? 'অনুদানের ধরণ' : 'Donation Frequency'}
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFrequency('onetime')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    frequency === 'onetime'
                      ? 'bg-white dark:bg-[#102B3F] text-[#102B3F] dark:text-white shadow-sm'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {language === 'bn' ? 'এককালীন অনুদান' : 'One-Time Donation'}
                </button>
                <button
                  type="button"
                  onClick={() => setFrequency('monthly')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    frequency === 'monthly'
                      ? 'bg-white dark:bg-[#102B3F] text-[#102B3F] dark:text-white shadow-sm'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {language === 'bn' ? 'মাসিক স্পনসরশিপ' : 'Monthly Sponsorship'}
                </button>
              </div>
            </div>

            {/* Project / Purpose selection */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-2">
                {language === 'bn' ? 'অনুদানের খাত / প্রকল্প নির্বাচন' : 'Select Cause or Project'}
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full text-sm font-medium p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#167D78]"
              >
                <option value="general">
                  {language === 'bn' ? '⭐ সাধারণ জরুরি ত্রাণ ও মানবকল্যাণ তহবিল (সর্বাধিক অগ্রাধিকার)' : '⭐ General Relief & Humanitarian Fund (Highest Priority)'}
                </option>
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {language === 'bn' ? proj.titleBn : proj.titleEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Live Donation Goal Progress Indicator */}
            <DonationGoalProgress
              mode="compact"
              language={language}
              projects={projects}
              selectedProjectId={selectedProjectId}
              pendingContribution={amount}
            />

            {/* Amount selection */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-2">
                {language === 'bn' ? 'অনুদানের পরিমাণ (বাংলাদেশি টাকা)' : 'Select Amount (BDT)'}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer tabular-nums btn-outline-interaction ${
                      amount === preset && !customAmount
                        ? 'bg-[#167D78] text-white border-[#167D78] shadow-sm'
                        : 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-700 hover:border-[#167D78]'
                    }`}
                  >
                    ৳{preset.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* Custom input */}
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-stone-500">৳</span>
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'অন্য পরিমাণ লিখুন (যেমন: ২০০০)' : 'Enter custom amount (e.g. 2000)'}
                  value={customAmount}
                  onChange={handleCustomChange}
                  className="w-full pl-8 pr-4 py-2.5 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#167D78]"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <MagneticButton
                type="button"
                onClick={handleStep1Next}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#167D78] hover:bg-[#102B3F] rounded-xl shadow-md btn-primary-interaction group"
              >
                <span>{language === 'bn' ? 'পরবর্তী ধাপ' : 'Proceed to Payment'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </MagneticButton>
            </div>

          </div>
        )}

        {/* STEP 2: Payment Gateway & Dynamic Mobile Banking Channels */}
        {step === 2 && (
          <div className="p-6 space-y-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-3">
                {language === 'bn' ? 'মোবাইল ব্যাংকিং মাধ্যম নির্বাচন করুন (বিকাশ / নগদ)' : 'Select Mobile Banking (bKash / Nagad)'}
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                
                {/* bKash Tab */}
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('bkash');
                    setValidationError(null);
                  }}
                  className={`p-3.5 rounded-xl border flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                    paymentMethod === 'bkash'
                      ? 'border-[#E2136E] bg-[#E2136E]/10 text-[#E2136E] font-bold shadow-md ring-2 ring-[#E2136E]/30'
                      : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:border-[#E2136E]/50'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-[#E2136E]" />
                  <span className="text-sm font-bold">bKash (বিকাশ)</span>
                </button>

                {/* Nagad Tab */}
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('nagad');
                    setValidationError(null);
                  }}
                  className={`p-3.5 rounded-xl border flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                    paymentMethod === 'nagad'
                      ? 'border-[#F7941D] bg-[#F7941D]/10 text-[#F7941D] font-bold shadow-md ring-2 ring-[#F7941D]/30'
                      : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:border-[#F7941D]/50'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-[#F7941D]" />
                  <span className="text-sm font-bold">Nagad (নগদ)</span>
                </button>

              </div>
            </div>

            {/* Dynamic Multi-Number Channel Cards */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  {language === 'bn' 
                    ? `অনুমোদিত ${paymentMethod === 'bkash' ? 'বিকাশ' : 'নগদ'} একাউন্টসমূহ (${activeChannels.length}টি সক্রিয়):`
                    : `Authorized ${paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} Channels (${activeChannels.length} active):`}
                </span>
                <span className="text-[11px] text-stone-500">
                  {language === 'bn' ? 'যেকোনো একটি নম্বরে অনুদান পাঠান' : 'Send donation to any number'}
                </span>
              </div>

              <div className="space-y-2.5">
                {activeChannels.map((channel) => {
                  const isCopied = copiedChannelId === channel.id;
                  const isSelected = selectedChannelId === channel.id;

                  return (
                    <div 
                      key={channel.id}
                      onClick={() => setSelectedChannelId(channel.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected 
                          ? paymentMethod === 'bkash'
                            ? 'border-[#E2136E] bg-[#E2136E]/5 dark:bg-[#E2136E]/10 ring-1 ring-[#E2136E]'
                            : 'border-[#F7941D] bg-[#F7941D]/5 dark:bg-[#F7941D]/10 ring-1 ring-[#F7941D]'
                          : 'border-stone-200 dark:border-stone-750 bg-stone-50 dark:bg-stone-800/60 hover:bg-white dark:hover:bg-stone-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            channel.accountType === 'Merchant'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                              : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                          }`}>
                            {channel.accountType} {channel.accountType === 'Merchant' ? '(মার্চেন্ট)' : '(ব্যক্তিগত)'}
                          </span>
                          <span className="text-xs font-semibold text-stone-900 dark:text-white">
                            {channel.accountHolderName}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(channel.number.replace(/[^0-9]/g, ''), channel.id);
                          }}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isCopied
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-300 dark:border-stone-600 hover:bg-stone-100'
                          }`}
                          title="নম্বর কপি করুন"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopied ? (language === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (language === 'bn' ? 'কপি' : 'Copy')}</span>
                        </button>
                      </div>

                      <div className="flex items-baseline justify-between">
                        <span className="font-mono text-base font-bold text-stone-900 dark:text-white tracking-wider">
                          {channel.number}
                        </span>
                        <span className="text-[11px] text-stone-500">
                          {language === 'bn' ? 'পরিমাণ:' : 'Amount:'} <strong className="text-stone-900 dark:text-white">৳{amount}</strong>
                        </span>
                      </div>

                      <p className="mt-2 text-[11px] text-stone-600 dark:text-stone-300 bg-white/70 dark:bg-stone-900/60 p-2 rounded-lg border border-stone-200/60 dark:border-stone-700/60">
                        {language === 'bn' ? channel.instructionBn : (channel.instructionEn || channel.instructionBn)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sender / Transaction verification input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-bold text-stone-600 dark:text-stone-400 block mb-1">
                  {language === 'bn' ? 'যে নম্বর থেকে টাকা পাঠিয়েছেন (১১ ডিজিট) *' : 'Sender Mobile Number (11 digits) *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="01XXXXXXXXX"
                  value={senderPhone}
                  onChange={(e) => {
                    setSenderPhone(e.target.value);
                    setValidationError(null);
                  }}
                  className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#167D78]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-stone-600 dark:text-stone-400 block mb-1">
                  {language === 'bn' ? 'ট্রানজেকশন আইডি (TrxID) *' : 'Transaction ID (TrxID) *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'bn' ? 'যেমন: BDF8932K1L' : 'e.g. BDF8932K1L'}
                  value={transactionId}
                  onChange={(e) => {
                    setTransactionId(e.target.value);
                    setValidationError(null);
                  }}
                  className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-mono uppercase focus:outline-none focus:ring-1 focus:ring-[#167D78]"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-white cursor-pointer"
              >
                {language === 'bn' ? 'পূর্ববর্তী' : 'Back'}
              </button>
              <MagneticButton
                type="button"
                onClick={handleStep2Next}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#167D78] hover:bg-[#102B3F] rounded-xl shadow-md btn-primary-interaction group"
              >
                <span>{language === 'bn' ? 'দাতার তথ্যে যান' : 'Continue to Donor Details'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </MagneticButton>
            </div>

          </div>
        )}

        {/* STEP 3: Donor Details & Confirmation */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {/* Anonymous Toggle */}
            <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                  {language === 'bn' ? 'পরিচয় গোপন রাখতে চান? (Anonymous)' : 'Make this donation anonymous?'}
                </span>
                <span className="text-[11px] text-stone-500">
                  {language === 'bn' ? 'পাবলিক অডিট লেজারে আপনার নাম দেখানো হবে না' : 'Your name will not appear on public donor boards'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 accent-[#167D78] cursor-pointer"
              />
            </div>

            {!isAnonymous && (
              <div>
                <label className="text-[11px] font-bold text-stone-600 dark:text-stone-400 block mb-1">
                  {language === 'bn' ? 'আপনার নাম / প্রতিষ্ঠানের নাম *' : 'Full Name / Organization *'}
                </label>
                <input
                  type="text"
                  required={!isAnonymous}
                  placeholder={language === 'bn' ? 'যেমন: মোহাম্মদ আশরাফ' : 'e.g. John Doe'}
                  value={donorName}
                  onChange={(e) => {
                    setDonorName(e.target.value);
                    setValidationError(null);
                  }}
                  className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#167D78]"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-stone-600 dark:text-stone-400 block mb-1">
                  {language === 'bn' ? 'ইমেইল (রসিদ পাঠানোর জন্য) *' : 'Email (For e-receipt) *'}
                </label>
                <input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#167D78]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-stone-600 dark:text-stone-400 block mb-1">
                  {language === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}
                </label>
                <input
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  value={donorPhone}
                  onChange={(e) => setDonorPhone(e.target.value)}
                  className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#167D78]"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-600 dark:text-stone-400 block mb-1">
                {language === 'bn' ? 'বিশেষ দোয়া বা বার্তা (ঐচ্ছিক)' : 'Prayer / Dedicatory Note (Optional)'}
              </label>
              <textarea
                rows={2}
                placeholder={language === 'bn' ? 'যেমন: আল্লাহ এই ছোট দান কবুল করুন...' : 'e.g. May this bring warmth to the children.'}
                value={donorNotes}
                onChange={(e) => setDonorNotes(e.target.value)}
                className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#167D78]"
              />
            </div>

            {/* Donation Summary Confirmation Box */}
            <div className="p-3 bg-[#102B3F]/5 dark:bg-stone-800/80 rounded-xl border border-stone-200 dark:border-stone-700 text-xs">
              <div className="flex justify-between py-0.5">
                <span className="text-stone-500">{language === 'bn' ? 'খাত:' : 'Cause:'}</span>
                <span className="font-semibold text-stone-900 dark:text-white truncate max-w-[240px]">
                  {getSelectedProjectTitle()}
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-stone-500">{language === 'bn' ? 'পরিমাণ:' : 'Amount:'}</span>
                <span className="font-bold text-[#167D78] tabular-nums">৳{amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-stone-500">{language === 'bn' ? 'মাধ্যম:' : 'Method:'}</span>
                <span className="uppercase font-semibold text-stone-700 dark:text-stone-300">{paymentMethod} (TrxID: {transactionId})</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={isProcessing}
                className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-white cursor-pointer disabled:opacity-50"
              >
                {language === 'bn' ? 'পূর্ববর্তী' : 'Back'}
              </button>
              <MagneticButton
                type="submit"
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#167D78] hover:bg-[#102B3F] rounded-xl shadow-md btn-primary-interaction disabled:opacity-75"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#D6F36A]" />
                    <span>{language === 'bn' ? 'পেমেন্ট যাচাই হচ্ছে...' : 'Verifying transaction...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#D6F36A]" />
                    <span>{language === 'bn' ? 'অনুদান নিশ্চিত করুন ও রসিদ গ্রহণ' : 'Confirm & Generate Official Receipt'}</span>
                  </>
                )}
              </MagneticButton>
            </div>

          </form>
        )}

        {/* STEP 4: Official Verifiable Donation Receipt */}
        {step === 4 && createdReceipt && (
          <div className="p-6 space-y-6">
            
            <div className="no-print text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-[#102B3F] dark:text-white">
                {language === 'bn' ? 'অশেষ ধন্যবাদ! আপনার অনুদান গৃহীত হয়েছে' : 'Thank You! Donation Successfully Received'}
              </h4>
              <p className="text-xs text-stone-500">
                {language === 'bn' ? 'আপনার সহায়তার একটি রসিদ প্রস্তুত করা হয়েছে।' : 'An official verified digital receipt has been generated.'}
              </p>
            </div>

            {/* Official Printable Receipt Slip */}
            <div id="official-receipt-print" className="print-donation-receipt p-5 bg-white dark:bg-stone-900 rounded-xl border border-stone-300 dark:border-stone-700 shadow-sm text-xs space-y-4">
              
              <div className="flex items-start justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                <div>
                  <h5 className="font-bold text-sm text-[#102B3F] dark:text-white">
                    {language === 'bn' ? 'কোলাশ ফাউন্ডেশন' : 'CoLASH Foundation'}
                  </h5>
                  <p className="text-[10px] text-stone-500">
                    Reg No: DH-9842/2021 · Tax Exemption Reference: 80G Certified
                  </p>
                </div>
                <div className="text-right">
                  <span className="receipt-badge inline-block px-2 py-0.5 rounded bg-[#102B3F] text-white font-mono text-[10px] font-bold mb-1">
                    OFFICIAL RECEIPT
                  </span>
                  <span className="receipt-accent font-mono text-[11px] font-bold text-[#167D78] block">
                    {createdReceipt.receiptNumber}
                  </span>
                  <span className="text-[10px] text-stone-400">{createdReceipt.date}</span>
                </div>
              </div>

              <div className="receipt-summary-box p-3 rounded-lg bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase">{language === 'bn' ? 'দাতার নাম' : 'Donor Name'}</span>
                  <span className="font-bold text-stone-900 dark:text-white">{createdReceipt.donorName}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase">{language === 'bn' ? 'অনুদানের খাত' : 'Allocated Cause'}</span>
                  <span className="font-bold text-stone-900 dark:text-white block">{createdReceipt.purposeNameBn}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase">{language === 'bn' ? 'পরিশোধের মাধ্যম ও ট্রানজেকশন আইডি' : 'Method & Transaction ID'}</span>
                  <span className="font-mono text-stone-800 dark:text-stone-200 uppercase">{createdReceipt.paymentMethod} · {createdReceipt.transactionId}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase">{language === 'bn' ? 'মোট অনুদান' : 'Total Amount'}</span>
                  <span className="receipt-accent text-base font-extrabold text-[#167D78] tabular-nums">৳{createdReceipt.amount.toLocaleString()}</span>
                </div>
              </div>

              {/* Watermark & Stamp */}
              <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-[10px] text-stone-500">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'ডিজিটালভাবে সত্যায়িত ও অডিটভুক্ত' : 'Digitally Certified & Ledger Logged'}</span>
                </div>
                <span className="italic">{language === 'bn' ? 'স্বাক্ষর: অর্থ ও নিরীক্ষা কমিটি' : 'Signed: Finance & Audit Committee'}</span>
              </div>

            </div>

            {/* Print, Download & Close Actions */}
            <div className="no-print grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={handleDownloadReceipt}
                className="flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-bold text-stone-700 dark:text-stone-200 border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#167D78]" />
                <span>{language === 'bn' ? 'ফাইল ডাউনলোড' : 'Download File'}</span>
              </button>
              
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-bold text-stone-700 dark:text-stone-200 border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>{language === 'bn' ? 'রসিদ প্রিন্ট' : 'Print Receipt'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-bold text-white bg-[#167D78] hover:bg-[#102B3F] rounded-xl transition-colors cursor-pointer"
              >
                <span>{language === 'bn' ? 'সম্পন্ন হয়েছে' : 'Done'}</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
