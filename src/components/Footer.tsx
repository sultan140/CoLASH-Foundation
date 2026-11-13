import React, { useState } from 'react';
import { Heart, MapPin, Phone, Mail, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Language, WebsiteCustomConfig } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface FooterProps {
  language: Language;
  onOpenDonate: () => void;
  onOpenVolunteer: () => void;
  onOpenAdmin: () => void;
  websiteConfig?: WebsiteCustomConfig;
}

export const Footer: React.FC<FooterProps> = ({
  language,
  onOpenDonate,
  onOpenVolunteer,
  onOpenAdmin,
  websiteConfig
}) => {
  const [subscribedEmail, setSubscribedEmail] = useState('');
  const [subscribedSuccess, setSubscribedSuccess] = useState(false);

  const t = TRANSLATIONS[language];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (subscribedEmail) {
      setSubscribedSuccess(true);
      setSubscribedEmail('');
    }
  };

  return (
    <footer className="bg-[#102B3F] text-stone-300 pt-16 pb-10 border-t border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-800">
          
          {/* Col 1 & 2: Brand & Mission (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={websiteConfig?.logoUrl || '/src/assets/images/colash_official_logo_1792483287868.jpg'}
                alt="CoLASH Logo"
                className="w-12 h-12 object-contain rounded-xl shadow-md shrink-0 bg-white/10 p-0.5"
              />
              <div>
                <span className="text-xl font-bold text-white block">
                  {websiteConfig ? (language === 'bn' ? websiteConfig.siteTitleBn : websiteConfig.siteTitleEn) : 'COLASH FOUNDATION'}
                </span>
                <span className="text-[11px] text-[#D6F36A] tracking-normal font-semibold block">
                  {language === 'bn' ? 'মানবতার জন্য আলো এবং সেবার বলয়' : 'Circle of Light and Service for Humanity'}
                </span>
              </div>
            </div>

            <div className="italic text-xs text-[#D6F36A] font-serif">
              “{t.sloganBn}” <span className="font-sans not-italic text-stone-400 text-[11px]">({t.sloganEn})</span>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed max-w-sm">
              {websiteConfig?.footerAboutBn || (language === 'bn'
                ? 'সিলেট বিভাগ, মৌলভীবাজার জেলার কমলগঞ্জ উপজেলায় জনকল্যাণমূলক ও মানবতার সেবায় কাজ করার উদ্দেশ্যে ০৭-০৩-২০২৬ খ্রিস্টাব্দে প্রতিষ্ঠিত। COLASH একটি সম্পূর্ণ অসাম্প্রদায়িক, অরাজনৈতিক, অলাভজনক, স্বেচ্ছাসেবী, সামাজিক, গণতান্ত্রিক ও জনকল্যাণমুখী সংগঠন।'
                : 'Founded on 07 March 2026 in Kamalganj Upazila, Moulvibazar District, Sylhet Division for public welfare and selfless humanitarian service. Fully non-communal, non-political, non-profit, and democratic.')}
            </p>

            <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-white font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#D6F36A]" />
                <span>{language === 'bn' ? 'সাংবিধানিক স্বাতন্ত্র্য ও আইনি রূপরেখা' : 'Statutory Framework & Independence'}</span>
              </div>
              <p className="text-[11px] text-stone-300 leading-relaxed">
                {language === 'bn'
                  ? 'কোনো অঙ্গসংগঠন নেই এবং অন্য কোনো সংগঠনের অংশ নয়। "স্বেচ্ছাসেবী সমাজকল্যাণ সংস্থা (নিবন্ধন ও নিয়ন্ত্রণ) অধ্যাদেশ, ১৯৬১" অনুযায়ী নিবন্ধনের উদ্যোগ প্রক্রিয়াধীন। বাংলাদেশের সকল আইন ও নীতিমালার প্রতি শতভাগ দায়বদ্ধ।'
                  : 'Independent entity with zero sub-wings. Regulatory registration underway under the Voluntary Social Welfare Agencies Ordinance, 1961 in full compliance with Bangladesh law.'}
              </p>
            </div>

            {/* Official Social Media Channels */}
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
                {language === 'bn' ? 'অফিসিয়াল সোশ্যাল মিডিয়া' : 'Official Social Channels'}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={websiteConfig?.facebookUrl || "https://www.facebook.com/CoLASHFoundation"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1877F2]/15 hover:bg-[#1877F2] text-white border border-[#1877F2]/40 transition-colors text-xs font-semibold group cursor-pointer"
                  title="Follow CoLASH Foundation on Facebook"
                >
                  <svg className="w-4 h-4 fill-current text-[#1877F2] group-hover:text-white transition-colors" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Facebook</span>
                </a>

                <a
                  href={websiteConfig?.instagramUrl || "https://www.instagram.com/colashfoundation"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#E4405F]/15 hover:bg-[#E4405F] text-white border border-[#E4405F]/40 transition-colors text-xs font-semibold group cursor-pointer"
                  title="Follow CoLASH Foundation on Instagram"
                >
                  <svg className="w-4 h-4 fill-current text-[#E4405F] group-hover:text-white transition-colors" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>Instagram</span>
                </a>

                {websiteConfig?.youtubeUrl && (
                  <a
                    href={websiteConfig.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600/15 hover:bg-red-600 text-white border border-red-500/40 transition-colors text-xs font-semibold group cursor-pointer"
                    title="Subscribe to CoLASH YouTube Channel"
                  >
                    <span>YouTube</span>
                  </a>
                )}

                {websiteConfig?.linkedinUrl && (
                  <a
                    href={websiteConfig.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-700/15 hover:bg-blue-700 text-white border border-blue-600/40 transition-colors text-xs font-semibold group cursor-pointer"
                    title="Connect on LinkedIn"
                  >
                    <span>LinkedIn</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Col 3: Quick Navigation */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              {language === 'bn' ? 'দ্রুত লিঙ্ক' : 'Navigation'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#about" className="hover:text-[#D6F36A] transition-colors">{t.navAbout}</a>
              </li>
              <li>
                <a href="#womens-team" className="text-rose-300 hover:text-white font-medium transition-colors">
                  {language === 'bn' ? 'উইমেন্স টিম (অঙ্গসংগঠন)' : "Women's Team (Wing)"}
                </a>
              </li>
              <li>
                <a href="#projects" className="hover:text-[#D6F36A] transition-colors">{t.navProjects}</a>
              </li>
              <li>
                <a href="#transparency" className="hover:text-[#D6F36A] transition-colors">{t.navTransparency}</a>
              </li>
              <li>
                <a href="#events" className="hover:text-[#D6F36A] transition-colors">{t.navEvents}</a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-[#D6F36A] transition-colors">{language === 'bn' ? 'ফটো গ্যালারি' : 'Photo Archive'}</a>
              </li>
              <li>
                <button
                  onClick={onOpenVolunteer}
                  className="hover:text-[#D6F36A] transition-colors text-left cursor-pointer"
                >
                  {t.btnVolunteer}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Official Banking & Aid Info (Dynamically configured) */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              {t.bankAccounts}
            </h4>
            <div className="text-xs space-y-2.5 text-stone-300">
              <div>
                <strong className="text-white block">{websiteConfig?.bankName || 'Dutch-Bangla Bank PLC'}</strong>
                <span className="font-mono text-stone-300">
                  A/C: {websiteConfig?.bankAccountNumber || '107.110.458921'}
                </span>
                {websiteConfig?.bankBranch && (
                  <div className="text-[11px] text-stone-400">শাখা: {websiteConfig.bankBranch}</div>
                )}
                {websiteConfig?.bankRouting && (
                  <div className="text-[10px] text-stone-400 font-mono">Routing: {websiteConfig.bankRouting}</div>
                )}
              </div>
              <div>
                <strong className="text-white block">bKash (বিকাশ)</strong>
                <span className="font-mono text-[#D6F36A] font-bold">{websiteConfig?.bkashNumber || '01646-475348'} (Ref: COLASH)</span>
              </div>
              <div>
                <strong className="text-white block">Nagad (নগদ)</strong>
                <span className="font-mono text-[#E6A15B] font-bold">{websiteConfig?.nagadNumber || '01308-241288'}</span>
              </div>
              {websiteConfig?.rocketNumber && (
                <div>
                  <strong className="text-white block">Rocket (রকেট)</strong>
                  <span className="font-mono text-purple-300 font-bold">{websiteConfig.rocketNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Col 5: Contact & Newsletter */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              {t.contactTitle}
            </h4>
            <div className="space-y-2.5 text-xs text-stone-300 mb-5">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#167D78] shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed">
                  {websiteConfig?.addressBn || t.address}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#167D78] shrink-0" />
                <div className="font-mono space-y-0.5">
                  <a href={`tel:${websiteConfig?.hotline || '+8801646475348'}`} className="hover:text-[#D6F36A] transition-colors block">
                    {websiteConfig?.hotline || '+880 1646-475348'}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#167D78] shrink-0" />
                <a href={`mailto:${websiteConfig?.contactEmail || 'contact@colash.org'}`} className="hover:text-[#D6F36A] transition-colors">
                  {websiteConfig?.contactEmail || 'contact@colash.org'}
                </a>
              </div>
            </div>

            {/* Newsletter form */}
            <div>
              <span className="text-[11px] font-semibold text-white block mb-1">
                {language === 'bn' ? 'ত্রাণ ও অডিট নিউজলেটার' : 'Impact Newsletter'}
              </span>
              {subscribedSuccess ? (
                <div className="flex items-center gap-1.5 text-[11px] text-[#D6F36A]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'সফলভাবে সাবস্ক্রাইব হয়েছে!' : 'Subscribed successfully!'}</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-1.5">
                  <input
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={subscribedEmail}
                    onChange={(e) => setSubscribedEmail(e.target.value)}
                    className="w-full text-xs p-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#D6F36A]"
                  />
                  <button
                    type="submit"
                    className="p-2 bg-[#167D78] hover:bg-[#D6F36A] hover:text-[#102B3F] text-white rounded-lg transition-colors cursor-pointer"
                    aria-label="Subscribe"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>

          </div>

        </div>

        {/* Bottom Bar: Copyright & Admin Trigger */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div>
            {websiteConfig?.footerCopyrightBn || t.footerRights}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onOpenAdmin}
              className="hover:text-white transition-colors cursor-pointer text-stone-400 text-xs"
            >
              {language === 'bn' ? 'ফাউন্ডেশন অ্যাডমিন' : 'Foundation Admin Console'}
            </button>
            <span>·</span>
            <span>{websiteConfig?.regNumberBn || 'Tax Exemption 80G Certified'}</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
