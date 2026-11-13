import React, { useState } from 'react';
import {
  FileText,
  Send,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Shield,
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  ChevronRight,
  Filter,
  Download,
  Printer
} from 'lucide-react';
import { Language, PublicApplication, PublicApplicationType, PublicApplicationStatus } from '../../types';

interface PublicApplicationSectionProps {
  language: Language;
  applications: PublicApplication[];
  onSubmitApplication: (app: PublicApplication) => void;
  onToast: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
  initialTrackingId?: string;
}

export const PublicApplicationSection: React.FC<PublicApplicationSectionProps> = ({
  language,
  applications,
  onSubmitApplication,
  onToast,
  initialTrackingId = ''
}) => {
  const [activeTab, setActiveTab] = useState<'submit' | 'track'>('submit');

  // Submit Form States
  const [category, setCategory] = useState<PublicApplicationType>('message');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [district, setDistrict] = useState('মৌলভীবাজার');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachmentName, setAttachmentName] = useState('');

  // Math Captcha for Spam Prevention
  const [num1, setNum1] = useState(() => Math.floor(Math.random() * 8) + 2);
  const [num2, setNum2] = useState(() => Math.floor(Math.random() * 8) + 1);
  const [captchaInput, setCaptchaInput] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Hidden honeypot for bot detection

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<PublicApplication | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Tracking Search States
  const [searchTrackingId, setSearchTrackingId] = useState(initialTrackingId);
  const [trackedResult, setTrackedResult] = useState<PublicApplication | null>(() => {
    if (initialTrackingId) {
      return applications.find(a => a.trackingId.toLowerCase() === initialTrackingId.trim().toLowerCase()) || null;
    }
    return null;
  });
  const [trackingSearched, setTrackingSearched] = useState(Boolean(initialTrackingId));
  const [trackError, setTrackError] = useState<string | null>(null);

  // Regenerate Captcha
  const refreshCaptcha = () => {
    setNum1(Math.floor(Math.random() * 8) + 2);
    setNum2(Math.floor(Math.random() * 8) + 1);
    setCaptchaInput('');
  };

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check
    if (honeypot) {
      return; // Silently reject bots
    }

    // Validation
    if (!name.trim()) {
      setFormError(language === 'bn' ? 'অনুগ্রহ করে আপনার নাম লিখুন।' : 'Please enter your name.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setFormError(language === 'bn' ? 'সঠিক মোবাইল নম্বর প্রদান করুন (কমপক্ষে ১০ ডিজিট)।' : 'Please provide a valid phone number.');
      return;
    }
    if (!subject.trim()) {
      setFormError(language === 'bn' ? 'আবেদন বা বার্তার বিষয় উল্লেখ করুন।' : 'Please enter a subject.');
      return;
    }
    if (!message.trim() || message.trim().length < 15) {
      setFormError(language === 'bn' ? 'অনুগ্রহ করে বিস্তারিত বার্তা লিখুন (কমপক্ষে ১৫ অক্ষর)।' : 'Please write detailed message (at least 15 chars).');
      return;
    }

    // Captcha validation
    if (parseInt(captchaInput, 10) !== num1 + num2) {
      setFormError(language === 'bn' ? 'স্প্যাম প্রতিরোধ ক্যাপচা উত্তর সঠিক নয়। পুনরায় চেষ্টা করুন।' : 'Security math captcha answer is incorrect.');
      refreshCaptcha();
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    // Generate Prefix based on category
    let prefix = 'APP';
    if (category === 'complaint') prefix = 'CMP';
    else if (category === 'message') prefix = 'MSG';
    else if (category === 'feedback') prefix = 'FBK';
    else if (category === 'aid_request') prefix = 'AID';

    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const trackingId = `COLASH-${prefix}-2026-${randomDigits}`;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newApp: PublicApplication = {
      id: `pub-${Date.now()}`,
      trackingId,
      category,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      district: district.trim(),
      subject: subject.trim(),
      message: message.trim(),
      attachmentName: attachmentName.trim() || undefined,
      createdAt: nowStr,
      updatedAt: nowStr,
      status: 'pending'
    };

    setTimeout(() => {
      onSubmitApplication(newApp);
      setIsSubmitting(false);
      setSubmittedApp(newApp);
      setSearchTrackingId(newApp.trackingId);
      onToast(
        'success',
        language === 'bn' ? 'আবেদন সফলভাবে গৃহীত হয়েছে!' : 'Application Submitted Successfully!',
        `${language === 'bn' ? 'আপনার ট্র্যাকিং আইডি:' : 'Tracking ID:'} ${newApp.trackingId}`
      );
    }, 500);
  };

  // Handle Tracking Search
  const handleTrackSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setTrackError(null);

    const query = searchTrackingId.trim();
    if (!query) {
      setTrackError(language === 'bn' ? 'অনুগ্রহ করে আপনার ট্র্যাকিং আইডি লিখুন।' : 'Please enter your Tracking ID.');
      return;
    }

    const found = applications.find(
      a => a.trackingId.toLowerCase() === query.toLowerCase() || a.phone.includes(query)
    );

    setTrackingSearched(true);
    if (found) {
      setTrackedResult(found);
      onToast(
        'info',
        language === 'bn' ? 'আবেদনের তথ্য পাওয়া গেছে' : 'Application Found',
        `ID: ${found.trackingId}`
      );
    } else {
      setTrackedResult(null);
      setTrackError(
        language === 'bn'
          ? 'এই ট্র্যাকিং আইডির কোনো আবেদন পাওয়া যায়নি। অনুগ্রহ করে সঠিক আইডি লিখুন।'
          : 'No application found with this tracking ID. Please check and try again.'
      );
    }
  };

  // Copy tracking ID
  const copyTrackingId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
    onToast('info', language === 'bn' ? 'ট্র্যাকিং আইডি কপি হয়েছে' : 'Tracking ID Copied', id);
  };

  // Category labels helper
  const getCategoryBadge = (cat: PublicApplicationType) => {
    switch (cat) {
      case 'complaint':
        return {
          label: language === 'bn' ? 'অভিযোগ' : 'Complaint',
          color: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300'
        };
      case 'feedback':
        return {
          label: language === 'bn' ? 'পরামর্শ / মতামত' : 'Feedback',
          color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300'
        };
      case 'aid_request':
        return {
          label: language === 'bn' ? 'ত্রাণ ও সাহায্য' : 'Aid Request',
          color: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300'
        };
      case 'volunteer':
        return {
          label: language === 'bn' ? 'সদস্য / ভলান্টিয়ার' : 'Membership',
          color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300'
        };
      case 'application':
        return {
          label: language === 'bn' ? 'সাধারণ আবেদন' : 'Application',
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300'
        };
      default:
        return {
          label: language === 'bn' ? 'সাধারণ বার্তা' : 'Message',
          color: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-300'
        };
    }
  };

  // Status labels helper
  const getStatusBadge = (status: PublicApplicationStatus) => {
    switch (status) {
      case 'resolved':
        return {
          label: language === 'bn' ? 'সমাধানকৃত / উত্তর প্রদান করা হয়েছে' : 'Resolved / Answered',
          color: 'bg-emerald-500 text-white',
          step: 4
        };
      case 'in_progress':
        return {
          label: language === 'bn' ? 'প্রক্রিয়াধীন' : 'In Progress',
          color: 'bg-blue-500 text-white',
          step: 3
        };
      case 'under_review':
        return {
          label: language === 'bn' ? 'পর্যালোচনাধীন' : 'Under Review',
          color: 'bg-amber-500 text-white',
          step: 2
        };
      case 'closed':
        return {
          label: language === 'bn' ? 'সমাপ্ত' : 'Closed',
          color: 'bg-stone-500 text-white',
          step: 4
        };
      default:
        return {
          label: language === 'bn' ? 'অপেক্ষমাণ' : 'Pending',
          color: 'bg-yellow-500 text-stone-900',
          step: 1
        };
    }
  };

  return (
    <section id="applications" className="py-12 sm:py-16 bg-stone-50/70 dark:bg-[#071017] border-t border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#167D78]/10 text-[#167D78] dark:text-[#D6F36A] text-xs font-bold uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'উন্মুক্ত নাগরিক সেবা ও অভিযোগ পোর্টাল' : 'Public Application & Message Portal'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#102B3F] dark:text-white tracking-tight">
            {language === 'bn' ? 'পাবলিক মেসেজ, অভিযোগ ও আবেদন সিস্টেম' : 'Public Messages, Complaints & Applications'}
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-2">
            {language === 'bn'
              ? 'লগইন ছাড়াই যে কেউ বার্তা, অভিযোগ, পরামর্শ বা সহায়তার আবেদন পাঠাতে পারেন। ইউনিক ট্র্যাকিং আইডি দিয়ে যেকোনো সময় সরাসরি উত্তর ও অগ্রগতি দেখা যাবে।'
              : 'Anyone can submit messages, complaints, suggestions or aid applications without login. Track status and official admin responses anytime with your Tracking ID.'}
          </p>
        </div>

        {/* Tab Switcher: Submit New vs Track Status */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 rounded-2xl bg-white dark:bg-[#0c1a24] border border-stone-200 dark:border-stone-800 shadow-sm">
            <button
              onClick={() => setActiveTab('submit')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'submit'
                  ? 'bg-[#167D78] text-white shadow-md'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>{language === 'bn' ? 'নতুন আবেদন / মেসেজ পাঠান' : 'Submit Message / Application'}</span>
            </button>

            <button
              onClick={() => setActiveTab('track')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'track'
                  ? 'bg-[#167D78] text-white shadow-md'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>{language === 'bn' ? 'ট্র্যাকিং আইডি দিয়ে খুঁজুন' : 'Track Application Status'}</span>
              <span className="px-1.5 py-0.5 rounded-full bg-[#D6F36A] text-[#102B3F] text-[10px] font-extrabold">
                {language === 'bn' ? 'লগইন ছাড়া' : 'No Login'}
              </span>
            </button>
          </div>
        </div>

        {/* ========================================================== */}
        {/* TAB 1: SUBMIT NEW APPLICATION */}
        {/* ========================================================== */}
        {activeTab === 'submit' && (
          <div className="max-w-3xl mx-auto">
            {submittedApp ? (
              /* SUBMISSION SUCCESS CARD WITH TRACKING ID */
              <div className="bg-white dark:bg-[#0c1a24] rounded-2xl border border-emerald-300 dark:border-emerald-800/80 p-6 sm:p-8 shadow-xl text-center space-y-6 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div className="space-y-2">
                  <span className="text-xs uppercase font-extrabold text-emerald-600 tracking-wider">
                    {language === 'bn' ? 'আবেদন সফলভাবে সংরক্ষিত হয়েছে' : 'Successfully Submitted'}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white">
                    {language === 'bn' ? 'আপনার আবেদন ও বার্তা গ্রহণ করা হয়েছে' : 'Your Application Has Been Received'}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-lg mx-auto">
                    {language === 'bn'
                      ? 'নিচের ট্র্যাকিং আইডিটি সংরক্ষণ করে রাখুন। আমাদের অ্যাডমিন টিম দ্রুত আপনার বিষয়টি পর্যালোচনা করে উত্তর প্রদান করবেন।'
                      : 'Please save your unique Tracking ID below. You can use it anytime to view admin responses and status updates.'}
                  </p>
                </div>

                {/* TRACKING ID DISPLAY BOX */}
                <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 max-w-md mx-auto space-y-3">
                  <div className="text-xs font-bold text-stone-500 uppercase tracking-widest">
                    {language === 'bn' ? 'ইউনিক ট্র্যাকিং আইডি' : 'Official Tracking ID'}
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <span className="font-mono text-lg sm:text-xl font-black text-[#167D78] dark:text-[#D6F36A] tracking-wider select-all">
                      {submittedApp.trackingId}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyTrackingId(submittedApp.trackingId)}
                      className="p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 text-stone-700 dark:text-stone-300 cursor-pointer transition-colors shadow-xs"
                      title={language === 'bn' ? 'আইডি কপি করুন' : 'Copy Tracking ID'}
                    >
                      {copiedId ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="text-[11px] text-stone-500">
                    {language === 'bn' ? 'তারিখ ও সময়:' : 'Submitted on:'} {submittedApp.createdAt}
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setTrackedResult(submittedApp);
                      setSearchTrackingId(submittedApp.trackingId);
                      setTrackingSearched(true);
                      setActiveTab('track');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#167D78] text-white hover:bg-[#126863] text-xs font-bold cursor-pointer transition-all shadow-md flex items-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    <span>{language === 'bn' ? 'এখনই স্ট্যাটাস ট্র্যাক করুন' : 'Track This Application'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setSubmittedApp(null);
                      setSubject('');
                      setMessage('');
                      setName('');
                      setPhone('');
                      setEmail('');
                      refreshCaptcha();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 text-xs font-bold cursor-pointer transition-colors"
                  >
                    {language === 'bn' ? 'আরেকটি আবেদন পাঠান' : 'Submit Another Application'}
                  </button>
                </div>
              </div>
            ) : (
              /* APPLICATION SUBMISSION FORM */
              <div className="bg-white dark:bg-[#0c1a24] rounded-2xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 shadow-xl">
                <form onSubmit={handleSubmit} className="space-y-6 text-xs sm:text-sm">

                  {/* Honeypot field (hidden from genuine users) */}
                  <input
                    type="text"
                    name="website_hp"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    style={{ display: 'none' }}
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  {/* Category Selection Tabs */}
                  <div>
                    <label className="block text-xs font-extrabold text-stone-800 dark:text-stone-200 uppercase tracking-wider mb-2">
                      {language === 'bn' ? 'আবেদনের ধরন বা ক্যাটাগরি নির্বাচন করুন *' : 'Select Category *'}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'message' as PublicApplicationType, labelBn: 'সাধারণ বার্তা / মেসেজ', labelEn: 'General Message' },
                        { id: 'complaint' as PublicApplicationType, labelBn: 'অভিযোগ দাখিল', labelEn: 'Complaint' },
                        { id: 'feedback' as PublicApplicationType, labelBn: 'পরামর্শ ও মতামত', labelEn: 'Suggestion / Feedback' },
                        { id: 'aid_request' as PublicApplicationType, labelBn: 'ত্রাণ / চিকিৎসা সাহায্য', labelEn: 'Aid / Relief Request' },
                        { id: 'application' as PublicApplicationType, labelBn: 'দাপ্তরিক সাধারণ আবেদন', labelEn: 'Official Application' },
                        { id: 'volunteer' as PublicApplicationType, labelBn: 'স্বেচ্ছাসেবক হিসেবে যোগদান', labelEn: 'Volunteer Interest' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setCategory(item.id)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            category === item.id
                              ? 'border-[#167D78] bg-[#167D78]/10 text-[#167D78] dark:text-[#D6F36A] font-bold shadow-xs'
                              : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 text-stone-700 dark:text-stone-300 bg-stone-50/50 dark:bg-stone-900/40'
                          }`}
                        >
                          <span className="text-xs">{language === 'bn' ? item.labelBn : item.labelEn}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Personal Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                        {language === 'bn' ? 'আপনার পূর্ণ নাম *' : 'Full Name *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={language === 'bn' ? 'যেমন: মোঃ আব্দুল করিম' : 'e.g. John Doe'}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#167D78]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                        {language === 'bn' ? 'মোবাইল নম্বর (যোগাযোগের জন্য) *' : 'Phone Number *'}
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="017XX-XXXXXX"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#167D78]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                        {language === 'bn' ? 'ইমেইল (ঐচ্ছিক - উত্তরের নোটিফিকেশনের জন্য)' : 'Email (Optional - for response)'}
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#167D78]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                        {language === 'bn' ? 'জেলা / উপজেলা / এলাকা' : 'District / Area'}
                      </label>
                      <input
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder={language === 'bn' ? 'যেমন: কমলগঞ্জ, মৌলভীবাজার' : 'Kamalganj, Moulvibazar'}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#167D78]"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      {language === 'bn' ? 'আবেদনের বিষয় / শিরোনাম *' : 'Subject / Title *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder={language === 'bn' ? 'আবেদনের স্পষ্ট বিষয় লিখুন' : 'Brief subject of your request'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#167D78]"
                    />
                  </div>

                  {/* Detailed Message */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      {language === 'bn' ? 'বিস্তারিত বার্তা বা আবেদনের বিবরণ *' : 'Detailed Message or Statement *'}
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={
                        language === 'bn'
                          ? 'আপনার সমস্যা, সহায়তার প্রয়োজন, অভিযোগের ঘটনা বা প্রস্তাবনা পরিষ্কারভাবে তুলে ধরুন...'
                          : 'Please describe your request, aid need, complaint, or feedback in detail...'
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#167D78]"
                    ></textarea>
                  </div>

                  {/* Document / File Reference (Optional) */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      {language === 'bn' ? 'সংযুক্ত নথিপত্র / রেফারেন্স নম্বর (যদি থাকে)' : 'Document Reference (If any)'}
                    </label>
                    <input
                      type="text"
                      value={attachmentName}
                      onChange={(e) => setAttachmentName(e.target.value)}
                      placeholder={language === 'bn' ? 'যেমন: জাতীয় পরিচয়পত্র নম্বর / মেডিকেল সার্টিফিকেট / ওয়ার্ড মেম্বার সুপারিশ' : 'e.g. NID Number / Medical Prescription / Recommendation ref'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#167D78]"
                    />
                  </div>

                  {/* Math Captcha for Spam Security */}
                  <div className="p-4 rounded-xl bg-stone-100 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#167D78] dark:text-[#D6F36A]" />
                      <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                        {language === 'bn' ? 'স্প্যাম প্রতিরোধ প্রশ্ন:' : 'Spam Security Check:'}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-800 font-mono font-bold text-stone-900 dark:text-white border border-stone-300 dark:border-stone-700 text-sm">
                        {num1} + {num2} = ?
                      </span>
                      <button
                        type="button"
                        onClick={refreshCaptcha}
                        className="p-1 text-stone-400 hover:text-stone-600 transition-colors"
                        title={language === 'bn' ? 'নতুন অংক আনুন' : 'Refresh Math'}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="w-32">
                      <input
                        type="number"
                        required
                        value={captchaInput}
                        onChange={(e) => setCaptchaInput(e.target.value)}
                        placeholder={language === 'bn' ? 'যোগফল লিখুন' : 'Answer'}
                        className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white text-center font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#167D78]"
                      />
                    </div>
                  </div>

                  {/* Form Error Notice */}
                  {formError && (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-[11px] text-stone-500">
                      {language === 'bn'
                        ? '🔒 কোনো পাসওয়ার্ড বা লগইনের প্রয়োজন নেই। সম্পূর্ণ বিনামূল্যে সেবা।'
                        : '🔒 100% free service. No registration or password required.'}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3 rounded-xl bg-[#167D78] hover:bg-[#126863] text-white font-extrabold text-xs sm:text-sm transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{language === 'bn' ? 'জমা হচ্ছে...' : 'Submitting...'}</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>{language === 'bn' ? 'আবেদন জমা দিন ও ট্র্যাকিং আইডি নিন' : 'Submit & Get Tracking ID'}</span>
                        </>
                      )}
                    </button>
                  </div>

                </form>
              </div>
            )}
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 2: TRACK APPLICATION BY ID */}
        {/* ========================================================== */}
        {activeTab === 'track' && (
          <div className="max-w-3xl mx-auto space-y-6">

            {/* Tracking Search Input Card */}
            <div className="bg-white dark:bg-[#0c1a24] rounded-2xl border border-stone-200 dark:border-stone-800 p-6 sm:p-7 shadow-lg">
              <form onSubmit={handleTrackSearch} className="space-y-4">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  {language === 'bn' ? 'আপনার ইউনিক ট্র্যাকিং আইডি বা মোবাইল নম্বর দিন' : 'Enter Your Tracking ID or Phone Number'}
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      value={searchTrackingId}
                      onChange={(e) => setSearchTrackingId(e.target.value)}
                      placeholder={language === 'bn' ? 'যেমন: COLASH-APP-2026-89412 অথবা 01718...' : 'e.g. COLASH-APP-2026-89412 or 01718...'}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#167D78]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-[#167D78] hover:bg-[#126863] text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    <span>{language === 'bn' ? 'অবস্থা দেখুন' : 'Track Status'}</span>
                  </button>
                </div>

                {trackError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{trackError}</span>
                  </div>
                )}

                {/* Sample Test IDs for instant testing */}
                <div className="pt-2 flex items-center gap-2 flex-wrap text-[11px] text-stone-500">
                  <span>{language === 'bn' ? 'পরীক্ষামূলক আইডি:' : 'Try Sample ID:'}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTrackingId('COLASH-APP-2026-89412');
                      const found = applications.find(a => a.trackingId === 'COLASH-APP-2026-89412');
                      setTrackedResult(found || null);
                      setTrackingSearched(true);
                    }}
                    className="font-mono text-[#167D78] dark:text-[#D6F36A] hover:underline cursor-pointer font-bold"
                  >
                    COLASH-APP-2026-89412 (সাহায্যের আবেদন)
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTrackingId('COLASH-MSG-2026-11409');
                      const found = applications.find(a => a.trackingId === 'COLASH-MSG-2026-11409');
                      setTrackedResult(found || null);
                      setTrackingSearched(true);
                    }}
                    className="font-mono text-[#167D78] dark:text-[#D6F36A] hover:underline cursor-pointer font-bold"
                  >
                    COLASH-MSG-2026-11409 (উইমেন্স টিম বার্তা)
                  </button>
                </div>
              </form>
            </div>

            {/* TRACKED APPLICATION RESULT CARD */}
            {trackedResult && (
              <div className="bg-white dark:bg-[#0c1a24] rounded-2xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 shadow-xl space-y-6 animate-fade-in">

                {/* Header Strip with Tracking ID and Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
                  <div>
                    <div className="text-xs uppercase font-extrabold text-stone-400">
                      {language === 'bn' ? 'আবেদনের রেফারেন্স নম্বর' : 'Application Tracking Reference'}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-xl font-black text-[#102B3F] dark:text-white">
                        {trackedResult.trackingId}
                      </span>
                      <button
                        onClick={() => copyTrackingId(trackedResult.trackingId)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                        title={language === 'bn' ? 'কপি করুন' : 'Copy'}
                      >
                        {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getCategoryBadge(trackedResult.category).color}`}>
                      {getCategoryBadge(trackedResult.category).label}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${getStatusBadge(trackedResult.status).color}`}>
                      {getStatusBadge(trackedResult.status).label}
                    </span>
                  </div>
                </div>

                {/* Status Progress Stepper */}
                <div className="py-2">
                  <div className="text-xs font-extrabold text-stone-500 uppercase tracking-wider mb-3">
                    {language === 'bn' ? 'অগ্রগতির পর্যায়ক্রম (Progress Stepper)' : 'Application Journey'}
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    {[
                      { stepNum: 1, titleBn: '১. জমা গ্রহণ', titleEn: 'Submitted' },
                      { stepNum: 2, titleBn: '২. যাচাইকরণ', titleEn: 'Review' },
                      { stepNum: 3, titleBn: '৩. তদন্ত / প্রক্রিয়া', titleEn: 'In Progress' },
                      { stepNum: 4, titleBn: '৪. নিষ্পত্তি / উত্তর', titleEn: 'Resolved' }
                    ].map((step) => {
                      const currentStep = getStatusBadge(trackedResult.status).step;
                      const isComplete = currentStep >= step.stepNum;
                      const isCurrent = currentStep === step.stepNum;

                      return (
                        <div key={step.stepNum} className="space-y-1.5">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isComplete ? 'bg-[#167D78]' : 'bg-stone-200 dark:bg-stone-800'
                            }`}
                          ></div>
                          <div
                            className={`font-bold text-[11px] ${
                              isCurrent
                                ? 'text-[#167D78] dark:text-[#D6F36A]'
                                : isComplete
                                ? 'text-stone-700 dark:text-stone-300'
                                : 'text-stone-400'
                            }`}
                          >
                            {language === 'bn' ? step.titleBn : step.titleEn}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Application Details Summary */}
                <div className="p-4 sm:p-5 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 space-y-3">
                  <div className="text-xs font-bold text-stone-500 uppercase">
                    {language === 'bn' ? 'আবেদনের বিবরণ' : 'Submitted Information'}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-stone-900 dark:text-white">
                      {trackedResult.subject}
                    </h4>
                    <p className="text-xs text-stone-700 dark:text-stone-300 mt-1.5 whitespace-pre-line leading-relaxed">
                      {trackedResult.message}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex flex-wrap gap-4 text-[11px] text-stone-500">
                    <div><strong>আবেদনকারী:</strong> {trackedResult.name}</div>
                    <div><strong>এলাকা:</strong> {trackedResult.district}</div>
                    <div><strong>জমা দেওয়া হয়েছে:</strong> {trackedResult.createdAt}</div>
                    {trackedResult.attachmentName && (
                      <div><strong>রেফারেন্স:</strong> {trackedResult.attachmentName}</div>
                    )}
                  </div>
                </div>

                {/* ==================================================== */}
                {/* OFFICIAL ADMIN RESPONSE (CRITICAL REQUIREMENT) */}
                {/* ==================================================== */}
                {trackedResult.adminReply ? (
                  <div className="p-5 sm:p-6 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>{language === 'bn' ? 'কোলাশ ফাউন্ডেশনের অফিসিয়াল উত্তর ও সিদ্ধান্ত' : 'Official Secretariat Decision & Reply'}</span>
                      </div>
                      {trackedResult.repliedAt && (
                        <span className="text-[11px] text-stone-500 font-mono">
                          {trackedResult.repliedAt}
                        </span>
                      )}
                    </div>

                    <div className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 whitespace-pre-line leading-relaxed font-medium p-3 rounded-xl bg-white/80 dark:bg-[#0c1a24]/80 border border-emerald-200 dark:border-emerald-900">
                      {trackedResult.adminReply}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                      <div>
                        {language === 'bn' ? 'অনুমোদিত স্বাক্ষর:' : 'Authorized By:'} <strong>{trackedResult.repliedBy || 'কোলাশ ফাউন্ডেশন সেন্ট্রাল অ্যাডমিন'}</strong>
                      </div>
                      {trackedResult.email && (
                        <div className="text-emerald-700 dark:text-emerald-400 font-medium">
                          ✉️ {language === 'bn' ? 'ইমেইলেও নোটিফিকেশন পাঠানো হয়েছে' : 'Email notification sent'}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-3">
                    <Clock className="w-5 h-5 shrink-0 text-amber-600" />
                    <div>
                      <strong>{language === 'bn' ? 'আবেদনটি পর্যালোচনাধীন রয়েছে' : 'Application is Under Review'}</strong>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                        {language === 'bn'
                          ? 'আমাদের দায়িত্বপ্রাপ্ত অ্যাডমিন টিম দ্রুত আপনার তথ্যাদি যাচাই করে এখানে অফিসিয়াল উত্তর প্রকাশ করবেন।'
                          : 'Our designated administrative team is evaluating your submission. Check back soon for official updates.'}
                      </p>
                    </div>
                  </div>
                )}

              </div>
            )}

            {trackingSearched && !trackedResult && !trackError && (
              <div className="p-8 text-center bg-white dark:bg-[#0c1a24] rounded-2xl border border-stone-200 dark:border-stone-800 text-stone-500 space-y-2">
                <HelpCircle className="w-8 h-8 mx-auto text-stone-400" />
                <p className="text-xs">
                  {language === 'bn' ? 'কোনো ফলাফল পাওয়া যায়নি।' : 'No application record found.'}
                </p>
              </div>
            )}

          </div>
        )}

      </div>
    </section>
  );
};
