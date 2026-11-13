import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { MagneticButton } from './common/MagneticButton';

interface ContactSectionProps {
  language: Language;
  onToast: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ language, onToast }) => {
  const t = TRANSLATIONS[language];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setFormError(language === 'bn' ? 'অনুগ্রহ করে আপনার নাম লিখুন।' : 'Please enter your name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError(language === 'bn' ? 'সঠিক ইমেইল ঠিকানা প্রদান করুন।' : 'Please provide a valid email.');
      return;
    }
    if (!message.trim() || message.trim().length < 10) {
      setFormError(language === 'bn' ? 'অনুগ্রহ করে অন্তত ১০ অক্ষরের বিস্তারিত বার্তা লিখুন।' : 'Please enter a message with at least 10 characters.');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      onToast(
        'success',
        language === 'bn' ? 'বার্তা সফলভাবে পাঠানো হয়েছে!' : 'Message Sent Successfully!',
        language === 'bn' ? 'আমাদের প্রতিনিধি দ্রুত আপনার সাথে যোগাযোগ করবেন।' : 'Our secretariat team will contact you shortly.'
      );
    }, 600);
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setSubmitted(false);
    setFormError(null);
  };

  return (
    <section id="contact" className="py-14 sm:py-20 bg-stone-50/90 dark:bg-[#071017] border-t border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Direct Info & Hotlines */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="text-xs uppercase tracking-widest font-bold text-[#167D78] dark:text-[#D6F36A] mb-1.5">
                {language === 'bn' ? 'যোগাযোগ ও সহায়তা' : 'Direct Assistance'}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#102B3F] dark:text-white tracking-tight">
                {language === 'bn' ? 'আমাদের সাথে যোগাযোগ করুন' : 'Get in Touch with CoLASH'}
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-400 mt-2">
                {language === 'bn'
                  ? 'যেকোনো মানবিক সহায়তা, স্বেচ্ছাসেবী অংশীদারিত্ব, সিএসআর অনুদান বা তথ্যের জন্য সরাসরি আমাদের দপ্তরে যোগাযোগ করতে পারেন।'
                  : 'For humanitarian inquiries, emergency relief assistance, CSR partnerships, or member support.'}
              </p>
            </div>

            <div className="space-y-4 text-xs text-stone-700 dark:text-stone-300">
              <div className="p-4 rounded-xl bg-white dark:bg-[#0c1a24] border border-stone-200 dark:border-stone-800 flex items-start gap-3 shadow-xs">
                <MapPin className="w-5 h-5 text-[#167D78] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#102B3F] dark:text-white mb-0.5">{t.headOffice}</h4>
                  <p className="text-stone-500 leading-relaxed">{t.address}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-[#0c1a24] border border-stone-200 dark:border-stone-800 flex items-start gap-3 shadow-xs">
                <Phone className="w-5 h-5 text-[#E6A15B] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#102B3F] dark:text-white mb-0.5">{t.hotline}</h4>
                  <div className="font-mono text-stone-700 dark:text-stone-300 space-y-0.5 text-xs">
                    <a href="tel:+8801646475348" className="hover:text-[#167D78] dark:hover:text-[#D6F36A] transition-colors block font-bold">
                      +880 1646-475348 (01646-475348)
                    </a>
                    <a href="tel:+8801308241288" className="hover:text-[#167D78] dark:hover:text-[#D6F36A] transition-colors block">
                      +880 1308-241288
                    </a>
                  </div>
                  <span className="text-[10px] text-stone-400 mt-1 block">২৪ ঘণ্টা জরুরি মানবিক যোগাযোগ, দুর্যোগ ত্রাণ ও রক্তদান সমন্বয়</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-[#0c1a24] border border-stone-200 dark:border-stone-800 flex items-start gap-3 shadow-xs">
                <Mail className="w-5 h-5 text-[#167D78] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#102B3F] dark:text-white mb-0.5">{t.emailUs}</h4>
                  <div className="font-mono text-stone-600 dark:text-stone-400 space-y-0.5 text-xs">
                    <a href="mailto:ashraful46475348@gmail.com" className="hover:text-[#167D78] dark:hover:text-[#D6F36A] transition-colors block font-semibold">
                      ashraful46475348@gmail.com
                    </a>
                    <a href="mailto:info@colash.org" className="hover:text-[#167D78] dark:hover:text-[#D6F36A] transition-colors block text-stone-400">
                      info@colash.org
                    </a>
                  </div>
                </div>
              </div>

              {/* Social Media Connect Box */}
              <div className="p-4 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-2.5">
                  {language === 'bn' ? 'অফিসিয়াল সোশ্যাল প্ল্যাটফর্ম' : 'Official Social Channels'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <a
                    href="https://www.facebook.com/CoLASHFoundation"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-white dark:bg-[#0c1a24] border border-stone-200 dark:border-stone-800 hover:border-[#1877F2] flex items-center gap-2.5 text-xs font-bold text-stone-800 dark:text-stone-100 hover:text-[#1877F2] transition-colors shadow-xs group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center shrink-0 group-hover:bg-[#1877F2] group-hover:text-white transition-colors">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </div>
                    <div>
                      <span className="block leading-tight">Facebook Page</span>
                      <span className="text-[10px] font-normal text-stone-400">@CoLASHFoundation</span>
                    </div>
                  </a>

                  <a
                    href="https://www.instagram.com/colashfoundation"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-white dark:bg-[#0c1a24] border border-stone-200 dark:border-stone-800 hover:border-[#E4405F] flex items-center gap-2.5 text-xs font-bold text-stone-800 dark:text-stone-100 hover:text-[#E4405F] transition-colors shadow-xs group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#E4405F]/10 text-[#E4405F] flex items-center justify-center shrink-0 group-hover:bg-[#E4405F] group-hover:text-white transition-colors">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </div>
                    <div>
                      <span className="block leading-tight">Instagram</span>
                      <span className="text-[10px] font-normal text-stone-400">@colashfoundation</span>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Working Contact Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0c1a24] border border-stone-200 dark:border-stone-800 shadow-sm">
              {submitted ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#102B3F] dark:text-white">
                      {language === 'bn' ? 'আপনার বার্তা সফলভাবে গৃহীত হয়েছে!' : 'Message Dispatched Successfully!'}
                    </h3>
                    <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 leading-relaxed">
                      {language === 'bn'
                        ? 'আমাদের দায়িত্বপ্রাপ্ত কর্মকর্তা বার্তাটি পর্যালোচনা করে ২৪ ঘণ্টার মধ্যে আপনার ইমেইলে উত্তর প্রদান করবেন।'
                        : 'Our secretariat team has received your query and will reply within 24 hours.'}
                    </p>
                  </div>
                  <button
                    onClick={handleReset}
                    className="px-5 py-2 text-xs font-bold text-white bg-[#167D78] hover:bg-[#102B3F] rounded-xl transition-colors cursor-pointer"
                  >
                    {language === 'bn' ? 'আরেকটি বার্তা লিখুন' : 'Send Another Message'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <h3 className="text-lg font-bold text-[#102B3F] dark:text-white mb-2">
                    {language === 'bn' ? 'সরাসরি বার্তা পাঠান' : 'Send an Official Inquiry'}
                  </h3>

                  {formError && (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center gap-2 text-rose-700 dark:text-rose-300">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                        {language === 'bn' ? 'আপনার নাম *' : 'Your Name *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          setFormError(null);
                        }}
                        placeholder={language === 'bn' ? 'যেমন: মোহাম্মদ আশরাফ' : 'e.g. John Doe'}
                        className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#167D78]"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                        {language === 'bn' ? 'ইমেইল ঠিকানা *' : 'Email Address *'}
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setFormError(null);
                        }}
                        placeholder="user@example.com"
                        className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#167D78]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                      {language === 'bn' ? 'বিষয়' : 'Subject'}
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder={language === 'bn' ? 'যেমন: বন্যা ত্রাণ কার্যক্রমে স্বেচ্ছাসেবা বা সিএসআর অংশীদারিত্ব' : 'e.g. Flood Relief CSR Inquiry'}
                      className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#167D78]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                      {language === 'bn' ? 'বার্তা *' : 'Message *'}
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        setFormError(null);
                      }}
                      placeholder={language === 'bn' ? 'আপনার বার্তা বিস্তারিত লিখুন...' : 'Write your detailed message here...'}
                      className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#167D78]"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <MagneticButton
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-6 py-2.5 font-bold text-white bg-[#167D78] hover:bg-[#102B3F] rounded-xl shadow-md btn-primary-interaction group"
                    >
                      <Send className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      <span>
                        {isSubmitting
                          ? (language === 'bn' ? 'পাঠানো হচ্ছে...' : 'Sending...')
                          : (language === 'bn' ? 'বার্তা প্রেরণ করুন' : 'Send Message')}
                      </span>
                    </MagneticButton>
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
