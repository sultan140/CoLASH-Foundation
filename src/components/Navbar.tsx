import React, { useState } from 'react';
import { Heart, Globe, Moon, Sun, ShieldCheck, Menu, X, User, Search, Send, Phone, ScanLine } from 'lucide-react';
import { Language, ThemeMode, WebsiteCustomConfig } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { MagneticButton } from './common/MagneticButton';

interface NavbarProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: ThemeMode;
  toggleTheme: () => void;
  onOpenDonate: () => void;
  onOpenPortal: () => void;
  onOpenAdmin: () => void;
  onOpenSearch: () => void;
  onOpenScanner?: () => void;
  activeSection: string;
  onNavigateSection: (sectionId: string) => void;
  websiteConfig?: WebsiteCustomConfig;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  setLanguage,
  theme,
  toggleTheme,
  onOpenDonate,
  onOpenPortal,
  onOpenAdmin,
  onOpenSearch,
  onOpenScanner,
  activeSection,
  onNavigateSection,
  websiteConfig
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = TRANSLATIONS[language];

  // Restored full navigation links as separate pages
  const navLinks = [
    { id: 'home', label: language === 'bn' ? 'হোম' : 'Home' },
    { id: 'about', label: language === 'bn' ? 'পরিচিতি' : 'About' },
    { id: 'committee', label: language === 'bn' ? 'বর্তমান কমিটি' : 'Committee' },
    { id: 'committee-history', label: language === 'bn' ? 'পুরোনো কমিটি' : 'Past Committees' },
    { id: 'advisors', label: language === 'bn' ? 'উপদেষ্টামণ্ডলী' : 'Advisors' },
    { id: 'members', label: language === 'bn' ? 'সদস্যবৃন্দ' : 'Members' },
    { id: 'womens-team', label: language === 'bn' ? 'উইমেন্স টিম' : "Women's Team" },
    { id: 'activities', label: language === 'bn' ? 'কার্যক্রম' : 'Activities' },
    { id: 'notices', label: language === 'bn' ? 'বিজ্ঞপ্তি' : 'Notices' },
    { id: 'applications', label: language === 'bn' ? 'আবেদন' : 'Applications' },
    { id: 'contact', label: language === 'bn' ? 'যোগাযোগ' : 'Contact' },
  ];

  // Helper to accurately match active link across hyphenated and underscore IDs
  const isLinkActive = (id: string) => {
    if (activeSection === id) return true;
    if (id === 'committee-history' && (activeSection === 'committee_history' || activeSection === 'committee-history')) return true;
    if (id === 'womens-team' && (activeSection === 'womens_team' || activeSection === 'womens-team')) return true;
    if (id === 'contact' && (activeSection === 'contact_location' || activeSection === 'contact')) return true;
    return false;
  };

  return (
    <>
      {/* Top Notification Trust Strip */}
      <div className="no-print bg-[#102B3F] text-[#F5F3ED] text-[11px] sm:text-xs py-1.5 px-3 sm:px-6 border-b border-[#167D78]/30 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate min-w-0">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#D6F36A] shrink-0"></span>
            <span className="font-medium truncate">{t.heroBadge}</span>
            <span className="hidden md:inline text-white/30">|</span>
            <a
              href={`tel:${(websiteConfig?.hotline || '01646-475348').replace(/[^0-9+]/g, '')}`}
              className="hidden md:inline-flex items-center gap-1 font-mono text-[#D6F36A] hover:underline shrink-0"
            >
              <span>{language === 'bn' ? 'হটলাইন:' : 'Hotline:'} {websiteConfig?.hotline || '01646-475348'}</span>
            </a>
          </div>
          <div className="flex items-center gap-2 sm:gap-3.5 shrink-0 text-[11px] sm:text-xs">
            {/* Social Links */}
            <div className="hidden sm:flex items-center gap-2 pr-1 border-r border-white/20">
              <a
                href="https://www.facebook.com/CoLASHFoundation"
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-300 hover:text-[#1877F2] transition-colors p-0.5"
                title="Facebook: CoLASHFoundation"
                aria-label="Facebook"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://www.instagram.com/colashfoundation"
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-300 hover:text-[#E4405F] transition-colors p-0.5"
                title="Instagram: colashfoundation"
                aria-label="Instagram"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>

            <button
              onClick={onOpenAdmin}
              className="hover:text-[#D6F36A] transition-colors flex items-center gap-1 cursor-pointer btn-icon-interaction"
              title="Foundation Governance"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#D6F36A]" />
              <span className="hidden sm:inline">{t.btnAdmin}</span>
            </button>
            <span className="text-white/30">|</span>
            <button
              onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
              className="flex items-center gap-1 hover:text-[#D6F36A] transition-colors cursor-pointer font-medium btn-icon-interaction"
              aria-label="Switch language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'English' : 'বাংলা'}</span>
            </button>
            <span className="text-white/30">|</span>
            <button
              onClick={toggleTheme}
              className="hover:text-[#D6F36A] transition-colors cursor-pointer p-0.5 btn-icon-interaction"
              aria-label="Toggle dark/light theme"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 rotate-0 transition-transform" /> : <Moon className="w-3.5 h-3.5 rotate-0 transition-transform" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Top Bar: Clean unified responsive layout */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0c1a24]/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4 lg:gap-8 w-full">
          
          {/* Zone 1: Brand Wordmark / Logo */}
          <button
            onClick={() => onNavigateSection('home')}
            className="flex items-center gap-2 sm:gap-3 shrink min-w-0 group text-left cursor-pointer"
          >
            <img
              src={websiteConfig?.logoUrl || '/src/assets/images/colash_official_logo_1792483287868.jpg'}
              alt="CoLASH Logo"
              className="w-9 h-9 sm:w-11 sm:h-11 object-contain rounded-xl shadow-sm shrink-0 group-hover:scale-105 transition-transform bg-white/10 p-0.5 border border-stone-200 dark:border-stone-700"
            />
            <div className="leading-tight min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-base sm:text-xl font-black tracking-tight text-[#102B3F] dark:text-white truncate">
                  {websiteConfig ? (language === 'bn' ? websiteConfig.siteTitleBn : websiteConfig.siteTitleEn) : 'COLASH'}
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.5 rounded bg-[#167D78]/15 text-[#167D78] dark:text-[#D6F36A] uppercase tracking-wider shrink-0">
                  {language === 'bn' ? 'মৌলভীবাজার' : 'Sylhet'}
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-[#167D78] dark:text-[#D6F36A] tracking-normal block truncate max-w-[140px] xs:max-w-[180px] sm:max-w-[240px]">
                {websiteConfig ? (language === 'bn' ? websiteConfig.siteSubtitleBn : websiteConfig.siteSubtitleEn) : (language === 'bn' ? 'মানবতার জন্য আলো এবং সেবার বলয়' : 'Circle of Light & Service for Humanity')}
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden xl:flex items-center gap-3.5 text-xs font-bold text-stone-700 dark:text-stone-200">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => onNavigateSection(link.id)}
                className={`transition-colors whitespace-nowrap shrink-0 py-1 relative cursor-pointer ${
                  isLinkActive(link.id)
                    ? 'text-[#167D78] dark:text-[#D6F36A]'
                    : 'text-stone-600 dark:text-stone-300 hover:text-[#167D78] dark:hover:text-[#D6F36A]'
                }`}
              >
                <span>{link.label}</span>
                {isLinkActive(link.id) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#167D78] dark:bg-[#D6F36A] rounded-full" />
                )}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              onClick={onOpenSearch}
              className="p-1.5 sm:p-2 text-stone-600 dark:text-stone-300 hover:text-[#167D78] dark:hover:text-[#D6F36A] hover:bg-stone-100 dark:hover:bg-stone-800/60 rounded-lg transition-colors cursor-pointer btn-icon-interaction"
              aria-label="Search causes and reports"
              title="Search causes and reports"
            >
              <Search className="w-4 h-4" />
            </button>

            {onOpenScanner && (
              <button
                type="button"
                onClick={onOpenScanner}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-[#102B3F] dark:text-[#D6F36A] bg-[#D6F36A]/35 dark:bg-[#167D78]/25 hover:bg-[#167D78] hover:text-white border border-[#167D78]/30 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                aria-label={language === 'bn' ? 'ক্যামেরা দিয়ে আইডি স্ক্যান' : 'Scan ID with Camera'}
                title={language === 'bn' ? 'ক্যামেরা দিয়ে সদস্য আইডি স্ক্যান ও যাচাই করুন' : 'Scan member ID QR with camera'}
              >
                <ScanLine className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{language === 'bn' ? 'ID স্ক্যান' : 'Scan ID'}</span>
              </button>
            )}

            <button
              onClick={onOpenPortal}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#102B3F] dark:text-stone-200 border border-stone-300 dark:border-stone-700 hover:border-[#167D78] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 btn-outline-interaction"
            >
              <User className="w-3.5 h-3.5 text-[#167D78] dark:text-[#D6F36A]" />
              <span>{t.navPortal}</span>
            </button>

            <MagneticButton
              onClick={onOpenDonate}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold text-white bg-[#167D78] hover:bg-[#102B3F] dark:hover:bg-[#135955] rounded-lg shadow-sm hover:shadow transition-all cursor-pointer whitespace-nowrap shrink-0 btn-primary-interaction"
            >
              <Heart className="w-3.5 h-3.5 fill-current text-[#D6F36A]" />
              <span className="hidden xs:inline">{t.btnDonate}</span>
            </MagneticButton>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-1.5 sm:p-2 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg cursor-pointer btn-icon-interaction"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-white dark:bg-[#0c1a24] border-b border-stone-200 dark:border-stone-800 px-4 py-4 shadow-xl transition-all w-full">
            <div className="flex flex-col gap-2.5 text-xs font-semibold text-stone-700 dark:text-stone-200">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateSection(link.id);
                  }}
                  className={`text-left py-1.5 transition-colors cursor-pointer ${
                    isLinkActive(link.id)
                      ? 'text-[#167D78] dark:text-[#D6F36A] font-bold'
                      : 'hover:text-[#167D78] dark:hover:text-[#D6F36A]'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex flex-col gap-2.5">
                {onOpenScanner && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenScanner();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-[#102B3F] dark:text-[#D6F36A] bg-[#D6F36A]/35 dark:bg-[#167D78]/25 border border-[#167D78]/30 rounded-lg cursor-pointer"
                  >
                    <ScanLine className="w-4 h-4" />
                    <span>{language === 'bn' ? 'ক্যামেরা দিয়ে QR / ID স্ক্যান' : 'Scan Member ID (Camera)'}</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenPortal();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-[#102B3F] dark:text-stone-200 border border-stone-300 dark:border-stone-700 rounded-lg"
                >
                  <User className="w-4 h-4 text-[#167D78]" />
                  <span>{t.navPortal}</span>
                </button>
                <MagneticButton
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenDonate();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-white bg-[#167D78] rounded-lg shadow btn-primary-interaction"
                >
                  <Heart className="w-4 h-4 fill-current text-[#D6F36A]" />
                  <span>{t.btnDonate}</span>
                </MagneticButton>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
