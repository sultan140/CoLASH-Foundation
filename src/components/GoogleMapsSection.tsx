import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  ExternalLink,
  Copy,
  Check,
  Phone,
  Settings,
  Info,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { Language, MapConfig } from '../types';

interface GoogleMapsSectionProps {
  mapConfig: MapConfig;
  language: Language;
  onOpenAdminLocation?: () => void;
  onToast: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const GoogleMapsSection: React.FC<GoogleMapsSectionProps> = ({
  mapConfig,
  language,
  onOpenAdminLocation,
  onToast,
}) => {
  const [copied, setCopied] = useState(false);

  const isPlaceholder = !mapConfig.address || mapConfig.address.includes('[এখানে CoLASH Foundation-এর সম্পূর্ণ ঠিকানা দিন]');

  // Determine query string for Google Maps Embed and Directions
  const effectiveAddress = isPlaceholder 
    ? 'Kamalganj, Moulvibazar, Sylhet, Bangladesh' 
    : mapConfig.address;

  const embedUrl = mapConfig.customEmbedUrl && mapConfig.customEmbedUrl.startsWith('https://')
    ? mapConfig.customEmbedUrl
    : `https://maps.google.com/maps?q=${encodeURIComponent(effectiveAddress)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  const directionsUrl = mapConfig.directionsUrl || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(effectiveAddress)}`;
  const viewMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(effectiveAddress)}`;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(mapConfig.address);
    setCopied(true);
    onToast(
      'success',
      language === 'bn' ? 'ঠিকানা কপি করা হয়েছে' : 'Address Copied',
      mapConfig.address
    );
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="location-map" className="py-16 bg-white dark:bg-[#0b1722] border-t border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#167D78] dark:text-emerald-400 mb-2">
              <Compass className="w-4 h-4 animate-spin-slow" />
              <span>{language === 'bn' ? 'ভৌগোলিক অবস্থান ও মানচিত্র' : 'Geographical Location & Map'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#102B3F] dark:text-stone-100">
              {language === 'bn' ? 'ফাউন্ডেশনের অফিস ও গুগল ম্যাপ' : 'Foundation Office & Google Maps'}
            </h2>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
              {language === 'bn'
                ? 'সরাসরি যোগাযোগ, পরিদর্শন অথবা যেকোনো মানবিক সহায়তার জন্য আমাদের অবস্থান দেখুন'
                : 'Find our official location for direct correspondence, field visits, or assistance'}
            </p>
          </div>

          {onOpenAdminLocation && (
            <button
              onClick={onOpenAdminLocation}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors cursor-pointer self-start md:self-auto"
              title={language === 'bn' ? 'অ্যাডমিন থেকে ঠিকানা সম্পাদনা করুন' : 'Edit address in admin'}
            >
              <Settings className="w-3.5 h-3.5 text-stone-500" />
              <span>{language === 'bn' ? 'ঠিকানা ও ম্যাপ সেটিংস' : 'Map Settings'}</span>
            </button>
          )}
        </div>

        {/* Address Banner / State Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Address Info Column */}
          <div className="lg:col-span-1 flex flex-col justify-between bg-stone-50 dark:bg-[#101e2b] p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#E65100]" />
                  {language === 'bn' ? 'অফিস ঠিকানা' : 'Office Address'}
                </span>
                {isPlaceholder ? (
                  <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                    {language === 'bn' ? 'সম্পাদনাযোগ্য প্লেসহোল্ডার' : 'Editable Placeholder'}
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    {language === 'bn' ? 'যাচাইকৃত' : 'Verified'}
                  </span>
                )}
              </div>

              {/* Main Address Display */}
              <div className="mb-4">
                <p className={`text-base font-semibold leading-relaxed ${
                  isPlaceholder 
                    ? 'text-amber-800 dark:text-amber-300 font-mono bg-amber-100/60 dark:bg-amber-900/30 p-3 rounded-xl border border-amber-300 dark:border-amber-700/60' 
                    : 'text-[#102B3F] dark:text-stone-100'
                }`}>
                  {mapConfig.address}
                </p>
                {isPlaceholder && (
                  <p className="mt-2 text-xs text-stone-500 dark:text-stone-400 flex items-start gap-1.5 leading-normal">
                    <Info className="w-3.5 h-3.5 mt-0.5 text-stone-400 shrink-0" />
                    <span>
                      {language === 'bn'
                        ? 'এটি নির্ধারিত স্থানধারক ঠিকানা। অ্যাডমিন ড্যাশবোর্ডে গিয়ে যেকোনো সময় সঠিক ঠিকানা ও সরাসরি গুগল ম্যাপ লিংক আপডেট করা যাবে।'
                        : 'This is the configurable placeholder address. Administrators can update the official address anytime via the Admin Dashboard.'}
                    </span>
                  </p>
                )}
              </div>

              {/* Landmark / Sub-location */}
              <div className="space-y-2 pt-3 border-t border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-300">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-700 dark:text-stone-300">{language === 'bn' ? 'লক্ষণীয় স্থান:' : 'Landmark:'}</span>
                  <span>{language === 'bn' ? mapConfig.landmarkBn : mapConfig.landmarkEn}</span>
                </div>
                {mapConfig.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#167D78]" />
                    <span className="font-bold">{language === 'bn' ? 'হটলাইন:' : 'Hotline:'}</span>
                    <a href={`tel:${mapConfig.phone.split('/')[0].trim()}`} className="text-[#167D78] hover:underline">
                      {mapConfig.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-800 flex flex-col gap-2.5">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#167D78] hover:bg-[#126864] text-white text-xs font-bold shadow-sm transition-all hover:shadow cursor-pointer active:scale-95"
              >
                <Navigation className="w-4 h-4" />
                <span>{language === 'bn' ? 'দিকনির্দেশনা পান (Directions)' : 'Get Directions'}</span>
              </a>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={viewMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-semibold transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'গুগল ম্যাপ' : 'Google Maps'}</span>
                </a>

                <button
                  onClick={handleCopyAddress}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied') : (language === 'bn' ? 'ঠিকানা কপি' : 'Copy')}</span>
                </button>
              </div>
            </div>

          </div>

          {/* Interactive Map Embed Column */}
          <div className="lg:col-span-2 relative rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-sm min-h-[360px] sm:min-h-[420px] bg-stone-100 dark:bg-stone-900">
            <iframe
              title="CoLASH Foundation Office Location Map"
              src={embedUrl}
              className="w-full h-full min-h-[360px] sm:min-h-[420px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />

            {/* Floating Quick Action over map */}
            <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/95 dark:bg-[#102B3F]/95 backdrop-blur-md text-[#102B3F] dark:text-white text-xs font-bold shadow-md hover:bg-white dark:hover:bg-[#102B3F] transition-all"
              >
                <Navigation className="w-3.5 h-3.5 text-[#167D78]" />
                <span>{language === 'bn' ? 'রুট ম্যাপ' : 'Route'}</span>
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
