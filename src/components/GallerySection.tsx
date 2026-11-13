import React, { useState, useEffect } from 'react';
import { Camera, Maximize2, X, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Language } from '../types';

interface GallerySectionProps {
  language: Language;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ language }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  const photos = [
    {
      id: 'g-1',
      url: '/src/assets/images/hero_humanitarian_care_1792170805861.jpg',
      titleBn: 'কুড়িগ্রামের দুর্গম চরাঞ্চলে শিশু ও বয়োবৃদ্ধদের মাঝে খাদ্য ও পুষ্টি সামগ্রী বিতরণ',
      titleEn: 'Distribution of nutritional food kits to children and village elders in remote Kurigram char',
      locationBn: 'উলিপুর, কুড়িগ্রাম',
      locationEn: 'Ulipur, Kurigram',
      category: 'relief'
    },
    {
      id: 'g-2',
      url: '/src/assets/images/education_support_project_1792170806647.jpg',
      titleBn: 'চরাঞ্চলের প্রাথমিক বিদ্যালয়ে বিনামূল্যে পাঠ্যবই ও মেধাভিত্তিক শিক্ষা উপকরণ বিতরণ',
      titleEn: 'Free textbooks and learning kits distributed to primary students in river delta schools',
      locationBn: 'গাইবান্ধা চরাঞ্চল',
      locationEn: 'Gaibandha River Islands',
      category: 'education'
    },
    {
      id: 'g-3',
      url: '/src/assets/images/emergency_flood_relief_1792170807173.jpg',
      titleBn: 'সিলেটের প্লাবিত অঞ্চলে ইঞ্জিনচালিত নৌকায় করে পানিবন্দি পরিবারের কাছে শুকনো খাবার বিতরণ',
      titleEn: 'Emergency boat deployment delivering dry rations and clean water purification packs in flood-hit Sylhet',
      locationBn: 'দোয়ারাবাজার, সুনামগঞ্জ',
      locationEn: 'Dowarabazar, Sunamganj',
      category: 'relief'
    },
    {
      id: 'g-4',
      url: '/src/assets/images/healthcare_medical_camp_1792170806394.jpg',
      titleBn: 'বিনামূল্যে ভ্রাম্যমাণ স্বাস্থ্য ক্যাম্পে অভিজ্ঞ চিকিৎসকদের দ্বারা মা ও শিশুর পরীক্ষা এবং ওষুধ প্রদান',
      titleEn: 'Compassionate medical consultation, pediatric health screening, and free prescription drugs at community health camp',
      locationBn: 'নেত্রকোনা সীমান্তবর্তী ইউনিয়ন',
      locationEn: 'Netrokona Border Union',
      category: 'health'
    }
  ];

  const categories = [
    { id: 'all', label: language === 'bn' ? 'সকল চিত্র' : 'All Photos' },
    { id: 'relief', label: language === 'bn' ? 'জরুরি ত্রাণ ও সহায়তা' : 'Emergency Relief' },
    { id: 'education', label: language === 'bn' ? 'শিক্ষা কর্মসূচি' : 'Education' },
    { id: 'health', label: language === 'bn' ? 'চিকিৎসা ক্যাম্প' : 'Medical Camps' },
  ];

  const filteredPhotos = selectedCategory === 'all'
    ? photos
    : photos.filter(p => p.category === selectedCategory);

  const activePhoto = activePhotoIndex !== null ? filteredPhotos[activePhotoIndex] : null;

  // Keyboard controls: Escape to close, ArrowRight for next, ArrowLeft for prev
  useEffect(() => {
    if (activePhotoIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActivePhotoIndex(null);
      } else if (e.key === 'ArrowRight') {
        setActivePhotoIndex((prev) => (prev !== null ? (prev + 1) % filteredPhotos.length : 0));
      } else if (e.key === 'ArrowLeft') {
        setActivePhotoIndex((prev) => (prev !== null ? (prev - 1 + filteredPhotos.length) % filteredPhotos.length : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhotoIndex, filteredPhotos.length]);

  return (
    <section id="gallery" className="py-14 sm:py-20 bg-white dark:bg-[#0c1a24] border-t border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-widest font-bold text-[#167D78] dark:text-[#D6F36A] mb-1.5">
              <Camera className="w-4 h-4" />
              <span>{language === 'bn' ? 'বাস্তব মাঠচিত্র' : 'Documentary Archive'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#102B3F] dark:text-white tracking-tight">
              {language === 'bn' ? 'ফটো ও ফিল্ড ডকুমেন্টারি গ্যালারি' : 'Field Documentary & Photo Gallery'}
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-xl">
              {language === 'bn'
                ? 'আমাদের প্রতিটি মানবিক কার্যক্রমের বাস্তব ও নিরপেক্ষ চিত্র প্রমাণ যা সমাজের পরিবর্তনকে দৃশ্যমান করে।'
                : 'Direct photographic evidence and stories from our grassroots missions across Bangladesh.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedCategory(c.id);
                  setActivePhotoIndex(null);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  selectedCategory === c.id
                    ? 'bg-white dark:bg-[#102B3F] text-[#102B3F] dark:text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Masonry / Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPhotos.map((photo, index) => (
            <div
              key={photo.id}
              onClick={() => setActivePhotoIndex(index)}
              className="group relative h-72 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 cursor-pointer shadow-xs bg-stone-100 dark:bg-stone-800 focus-visible:ring-2 focus-visible:ring-[#167D78]"
              tabIndex={0}
              role="button"
              aria-label={`View photo: ${photo.titleEn}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActivePhotoIndex(index);
                }
              }}
            >
              <img
                src={photo.url}
                alt={language === 'bn' ? photo.titleBn : photo.titleEn}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
                <div className="flex items-center gap-1 text-[11px] text-[#D6F36A] mb-1">
                  <MapPin className="w-3 h-3" />
                  <span>{language === 'bn' ? photo.locationBn : photo.locationEn}</span>
                </div>
                <h4 className="text-xs font-bold leading-snug line-clamp-2">
                  {language === 'bn' ? photo.titleBn : photo.titleEn}
                </h4>
                <div className="mt-2 flex items-center justify-between text-[10px] text-stone-300">
                  <span>{language === 'bn' ? 'বড় করে দেখতে ক্লিক করুন' : 'Click to enlarge'}</span>
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Lightbox Modal with Next/Previous & Escape */}
      {activePhoto && activePhotoIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative max-w-4xl w-full bg-[#0c1a24] rounded-2xl overflow-hidden border border-stone-700 shadow-2xl flex flex-col">
            
            {/* Top Bar with Close button */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
              <span className="text-[11px] font-mono text-white/70 bg-black/40 px-2 py-0.5 rounded">
                {activePhotoIndex + 1} / {filteredPhotos.length}
              </span>
              <button
                onClick={() => setActivePhotoIndex(null)}
                className="p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors cursor-pointer"
                title="Close (Escape)"
                aria-label="Close lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Image viewer with Next & Prev Arrow Overlays */}
            <div className="relative min-h-[300px] max-h-[70vh] bg-black flex items-center justify-center select-none">
              <img
                src={activePhoto.url}
                alt={language === 'bn' ? activePhoto.titleBn : activePhoto.titleEn}
                className="max-h-[70vh] w-auto object-contain transition-all duration-300"
              />

              {/* Prev Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePhotoIndex((prev) => (prev !== null ? (prev - 1 + filteredPhotos.length) % filteredPhotos.length : 0));
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 text-white hover:bg-white hover:text-black transition-all cursor-pointer shadow-lg"
                title="Previous (Left Arrow)"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Next Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePhotoIndex((prev) => (prev !== null ? (prev + 1) % filteredPhotos.length : 0));
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 text-white hover:bg-white hover:text-black transition-all cursor-pointer shadow-lg"
                title="Next (Right Arrow)"
                aria-label="Next photo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Caption bar */}
            <div className="p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-stone-800">
              <div>
                <div className="flex items-center gap-2 text-xs text-[#D6F36A] mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? activePhoto.locationBn : activePhoto.locationEn}</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold leading-snug">
                  {language === 'bn' ? activePhoto.titleBn : activePhoto.titleEn}
                </h3>
              </div>
              
              <div className="flex items-center gap-3 shrink-0 text-xs text-stone-400">
                <span className="hidden sm:inline">Use ← / → keys or Esc to close</span>
                <button
                  onClick={() => setActivePhotoIndex(null)}
                  className="px-4 py-2 text-xs font-bold bg-white/10 hover:bg-white/20 rounded-lg text-white cursor-pointer transition-colors"
                >
                  {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
