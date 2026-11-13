import React, { useState } from 'react';
import {
  MapPin,
  Save,
  RotateCcw,
  Navigation,
  ExternalLink,
  Info,
  CheckCircle2,
  Phone,
  Compass
} from 'lucide-react';
import { Language, MapConfig } from '../types';

interface LocationMapSettingsPanelProps {
  language: Language;
  mapConfig: MapConfig;
  onUpdateMapConfig: (newConfig: MapConfig) => void;
  onToast: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const LocationMapSettingsPanel: React.FC<LocationMapSettingsPanelProps> = ({
  language,
  mapConfig,
  onUpdateMapConfig,
  onToast,
}) => {
  const [address, setAddress] = useState(mapConfig.address);
  const [customEmbedUrl, setCustomEmbedUrl] = useState(mapConfig.customEmbedUrl || '');
  const [landmarkBn, setLandmarkBn] = useState(mapConfig.landmarkBn || '');
  const [landmarkEn, setLandmarkEn] = useState(mapConfig.landmarkEn || '');
  const [phone, setPhone] = useState(mapConfig.phone || '01646-475348');
  const [directionsUrl, setDirectionsUrl] = useState(mapConfig.directionsUrl || '');

  const defaultPlaceholder = '[এখানে CoLASH Foundation-এর সম্পূর্ণ ঠিকানা দিন]';

  const handleResetPlaceholder = () => {
    setAddress(defaultPlaceholder);
    onToast(
      'info',
      language === 'bn' ? 'প্লেসহোল্ডার ঠিকানা সেট করা হয়েছে' : 'Placeholder Reset',
      defaultPlaceholder
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: MapConfig = {
      address: address.trim() || defaultPlaceholder,
      customEmbedUrl: customEmbedUrl.trim() || undefined,
      landmarkBn: landmarkBn.trim(),
      landmarkEn: landmarkEn.trim(),
      phone: phone.trim(),
      directionsUrl: directionsUrl.trim() || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address.trim() || 'Kamalganj, Moulvibazar, Sylhet')}`,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    onUpdateMapConfig(updated);
    onToast(
      'success',
      language === 'bn' ? 'গুগল ম্যাপ ও ঠিকানা সফলভাবে হালনাগাদ করা হয়েছে' : 'Map & Address Updated Successfully',
      updated.address
    );
  };

  // Preview embed URL calculation
  const previewEffectiveAddress = (!address || address.includes('[এখানে CoLASH Foundation-এর সম্পূর্ণ ঠিকানা দিন]'))
    ? 'Kamalganj, Moulvibazar, Sylhet, Bangladesh'
    : address;

  const previewEmbedUrl = customEmbedUrl && customEmbedUrl.startsWith('https://')
    ? customEmbedUrl
    : `https://maps.google.com/maps?q=${encodeURIComponent(previewEffectiveAddress)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#102B3F] to-[#167D78] text-white shadow-md">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">
          <Compass className="w-4 h-4" />
          <span>{language === 'bn' ? 'গুগল ম্যাপ ও ভৌগোলিক লোকেশন কন্ট্রোল' : 'Google Maps Location Settings'}</span>
        </div>
        <h3 className="text-lg font-bold">
          {language === 'bn' ? 'ফাউন্ডেশনের অফিস ঠিকানা ও ম্যাপ কনফিগারেশন' : 'Foundation Office Address & Maps'}
        </h3>
        <p className="text-xs text-stone-200 mt-1 max-w-xl leading-relaxed">
          {language === 'bn'
            ? 'ওয়েবসাইটের নিচের Google Maps সেকশনে প্রদর্শিত ঠিকানা ও মার্কার পরিচালনা করুন। ঠিকানার স্থানধারক (Placeholder) যে কোনো সময় সঠিক অফিস ঠিকানা দিয়ে পরিবর্তন করা যাবে।'
            : 'Manage the official address, Google Maps embed, and route directions displayed on the public website.'}
        </p>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4 text-xs">
          
          {/* Address field with Reset Placeholder button */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#E65100]" />
                <span>{language === 'bn' ? 'অফিস ঠিকানা (সম্পাদনাযোগ্য প্লেসহোল্ডার) *' : 'Office Address (Editable Placeholder) *'}</span>
              </label>

              <button
                type="button"
                onClick={handleResetPlaceholder}
                className="text-[11px] font-semibold text-[#167D78] dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{language === 'bn' ? 'প্লেসহোল্ডার ঠিকানায় রিসেট করুন' : 'Reset to Placeholder'}</span>
              </button>
            </div>

            <textarea
              required
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="[এখানে CoLASH Foundation-এর সম্পূর্ণ ঠিকানা দিন]"
              className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#167D78]"
            />
            <p className="mt-1 text-[11px] text-stone-500">
              {language === 'bn'
                ? 'নোট: ঠিকানা পরিবর্তন করলে নিচের গুগল ম্যাপে রিয়েল-টাইম মার্কার ও Directions স্বয়ংক্রিয়ভাবে আপডেট হয়ে যাবে।'
                : 'Note: Updating the address automatically refreshes the Google Maps pin and navigation directions.'}
            </p>
          </div>

          {/* Optional Custom Google Maps Embed / Share URL */}
          <div>
            <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
              {language === 'bn' ? 'কাস্টম Google Maps Embed URL (ঐচ্ছিক)' : 'Custom Google Maps Embed URL (Optional)'}
            </label>
            <input
              type="text"
              value={customEmbedUrl}
              onChange={(e) => setCustomEmbedUrl(e.target.value)}
              placeholder="https://www.google.com/maps/embed?pb=..."
              className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
            />
            <span className="text-[10px] text-stone-400 mt-0.5 block">
              {language === 'bn'
                ? 'গুগল ম্যাপের "Share > Embed a map" থেকে iframe এর src লিংক বসাতে পারেন। খালি রাখলে ঠিকানা অনুযায়ী স্বয়ংক্রিয় ম্যাপ দেখানো হবে।'
                : 'Leave blank to automatically render map based on the address above.'}
            </span>
          </div>

          {/* Landmark & Hotline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                {language === 'bn' ? 'লক্ষণীয় স্থান / এরিয়া (বাংলা)' : 'Nearby Landmark (Bangla)'}
              </label>
              <input
                type="text"
                value={landmarkBn}
                onChange={(e) => setLandmarkBn(e.target.value)}
                placeholder="যেমন: কমলগঞ্জ উপজেলা পরিষদ সংলগ্ন"
                className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
              />
            </div>
            <div>
              <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
                {language === 'bn' ? 'অফিস হটলাইন / ফোন' : 'Office Hotline Phone'}
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01646-475348 / 01712-345678"
                className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
              />
            </div>
          </div>

          {/* Directions URL */}
          <div>
            <label className="font-bold block mb-1 text-stone-700 dark:text-stone-300">
              {language === 'bn' ? 'সরাসরি দিকনির্দেশনা (Directions) লিংক' : 'Direct Directions URL'}
            </label>
            <input
              type="text"
              value={directionsUrl}
              onChange={(e) => setDirectionsUrl(e.target.value)}
              placeholder="https://www.google.com/maps/dir/?api=1&destination=..."
              className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
            />
          </div>

          {/* Save Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#167D78] hover:bg-[#126864] text-white font-bold transition-all shadow-md cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <Save className="w-4 h-4 text-[#D6F36A]" />
              <span>{language === 'bn' ? 'ঠিকানা ও ম্যাপ সংরক্ষণ করুন' : 'Save Map & Address'}</span>
            </button>
          </div>

        </div>
      </form>

      {/* Live Map Preview */}
      <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
        <h4 className="font-bold text-xs text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Navigation className="w-4 h-4 text-[#167D78]" />
          <span>{language === 'bn' ? 'লাইভ প্রিভিউ (ওয়েবসাইটে যেমন দেখাবে)' : 'Live Preview (As Rendered on Site)'}</span>
        </h4>

        <div className="rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 h-[260px]">
          <iframe
            title="Google Maps Live Preview"
            src={previewEmbedUrl}
            className="w-full h-full border-0"
            loading="lazy"
          />
        </div>
      </div>

    </div>
  );
};
