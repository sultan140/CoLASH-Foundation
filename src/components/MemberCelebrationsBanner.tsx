import React, { useState, useEffect, useRef } from 'react';
import { Cake, Sparkles, Heart, PartyPopper, Calendar, X } from 'lucide-react';
import { GeneralMember, Language } from '../types';

interface MemberCelebrationsBannerProps {
  birthdayMembers: GeneralMember[];
  language: Language;
  onSelectMember?: (member: GeneralMember) => void;
  onToast?: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
}

const MONTH_NAMES: Record<number, { bn: string; en: string }> = {
  1: { bn: 'জানুয়ারি', en: 'January' },
  2: { bn: 'ফেব্রুয়ারি', en: 'February' },
  3: { bn: 'মার্চ', en: 'March' },
  4: { bn: 'এপ্রিল', en: 'April' },
  5: { bn: 'মে', en: 'May' },
  6: { bn: 'জুন', en: 'June' },
  7: { bn: 'জুলাই', en: 'July' },
  8: { bn: 'আগস্ট', en: 'August' },
  9: { bn: 'সেপ্টেম্বর', en: 'September' },
  10: { bn: 'অক্টোবর', en: 'October' },
  11: { bn: 'নভেম্বর', en: 'November' },
  12: { bn: 'ডিসেম্বর', en: 'December' },
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  shape: 'rect' | 'circle' | 'star';
  life: number;
  maxLife: number;
}

export const MemberCelebrationsBanner: React.FC<MemberCelebrationsBannerProps> = ({
  birthdayMembers,
  language,
  onSelectMember,
  onToast
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [sentWishes, setSentWishes] = useState<Record<string, boolean>>({});
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bannerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  const now = new Date();
  const currentMonthNum = now.getMonth() + 1;
  const monthName = MONTH_NAMES[currentMonthNum] || { bn: 'চলতি মাস', en: 'This Month' };

  // Confetti / Sparkle Particle Generator
  const createParticles = (originX?: number, originY?: number, count = 38) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check prefers-reduced-motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const width = canvas.width;
    const height = canvas.height;
    const colors = [
      '#F59E0B', // Amber
      '#167D78', // CoLASH Teal
      '#D6F36A', // CoLASH Lime
      '#EC4899', // Pink
      '#3B82F6', // Blue
      '#F43F5E', // Rose
      '#FBBF24', // Gold
      '#10B981', // Emerald
    ];

    const shapes: ('rect' | 'circle' | 'star')[] = ['rect', 'circle', 'star'];
    const newParticles: Particle[] = [];

    const startX = originX !== undefined ? originX : width / 2;
    const startY = originY !== undefined ? originY : (height > 60 ? 30 : height / 2);

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
      const speed = 1.2 + Math.random() * 3.8;
      newParticles.push({
        x: originX !== undefined ? startX : Math.random() * width,
        y: originY !== undefined ? startY : Math.random() * (height * 0.4),
        vx: (Math.cos(angle) * speed) * (originX !== undefined ? 1 : 0.6),
        vy: originY !== undefined ? (Math.sin(angle) * speed) - 1.5 : Math.random() * 1.5 + 0.5,
        size: Math.random() * 5 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
        opacity: 1,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        life: 0,
        maxLife: 70 + Math.floor(Math.random() * 50)
      });
    }

    particlesRef.current = [...particlesRef.current, ...newParticles];
  };

  // Canvas loop
  useEffect(() => {
    if (isDismissed || birthdayMembers.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      if (bannerRef.current && canvas) {
        const rect = bannerRef.current.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initial celebratory sparkle burst on appear
    const initialTimer = setTimeout(() => {
      createParticles(undefined, undefined, 42);
    }, 250);

    const drawStar = (cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number, color: string, alpha: number) => {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);

      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const activeParticles: Particle[] = [];

      for (let i = 0; i < particlesRef.current.length; i++) {
        const p = particlesRef.current[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // Gentle gravity
        p.vx *= 0.99; // Air drag
        p.rotation += p.rotationSpeed;

        const progress = p.life / p.maxLife;
        p.opacity = Math.max(0, 1 - Math.pow(progress, 1.8));

        if (p.opacity > 0.01 && p.y < canvas.height + 20) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = p.opacity;

          if (p.shape === 'rect') {
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.6);
          } else if (p.shape === 'circle') {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.shape === 'star') {
            drawStar(0, 0, 4, p.size * 0.9, p.size * 0.35, p.color, p.opacity);
          }
          ctx.restore();
          activeParticles.push(p);
        }
      }

      particlesRef.current = activeParticles;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      clearTimeout(initialTimer);
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDismissed, birthdayMembers.length]);

  if (isDismissed || birthdayMembers.length === 0) {
    return null;
  }

  const handleSendWish = (e: React.MouseEvent, member: GeneralMember) => {
    e.stopPropagation();
    setSentWishes(prev => ({ ...prev, [member.id]: true }));

    // Trigger local particle burst around the clicked button
    if (bannerRef.current) {
      const bannerRect = bannerRef.current.getBoundingClientRect();
      const clickX = e.clientX - bannerRect.left;
      const clickY = e.clientY - bannerRect.top;
      createParticles(clickX, clickY, 26);
    }

    if (onToast) {
      onToast(
        'success',
        language === 'bn' ? 'শুভ জন্মদিন পাঠানো হয়েছে! 🎉' : 'Birthday Wishes Sent! 🎂',
        language === 'bn'
          ? `${member.nameBn} কে কোলাশ পরিবারের পক্ষ থেকে জন্মদিনের উষ্ণ শুভেচ্ছা পৌঁছে দেওয়া হয়েছে।`
          : `Warm birthday wishes sent to ${member.nameEn} on behalf of CoLASH family.`
      );
    }
  };

  return (
    <div
      ref={bannerRef}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/15 via-teal-500/10 to-rose-500/15 dark:from-amber-950/40 dark:via-teal-950/30 dark:to-rose-950/40 border border-amber-300/80 dark:border-amber-700/60 p-4 sm:p-5 shadow-sm transition-all mb-6 group"
    >
      {/* Interactive Celebration Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10 w-full h-full"
      />

      {/* Ambient background glows & sparkles */}
      <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-gradient-to-br from-amber-400/25 to-teal-400/25 rounded-full blur-2xl pointer-events-none animate-pulse" />
      <div className="absolute -left-6 -top-6 w-28 h-28 bg-gradient-to-br from-rose-400/25 to-amber-400/25 rounded-full blur-2xl pointer-events-none animate-pulse" />

      {/* Floating decorative sparkle stars */}
      <span className="absolute top-3 right-16 text-amber-400 text-xs animate-bounce opacity-70 pointer-events-none">✦</span>
      <span className="absolute bottom-2 left-1/3 text-teal-400 text-[10px] animate-pulse opacity-60 pointer-events-none">✧</span>
      <span className="absolute top-1/2 right-1/4 text-rose-400 text-xs opacity-50 pointer-events-none">★</span>

      {/* Header */}
      <div className="relative z-20 flex items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-amber-400 text-white flex items-center justify-center shadow-md shrink-0 ring-2 ring-amber-300/60 dark:ring-amber-600/60 animate-bounce">
              <Cake className="w-4 h-4" />
            </div>
            {/* Twinkle dot */}
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm sm:text-base font-extrabold text-stone-900 dark:text-white flex items-center gap-1.5">
                <span>{language === 'bn' ? 'সদস্য উৎসব ও জন্মদিন' : 'Member Celebrations'}</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/90 text-amber-900 dark:text-amber-200 border border-amber-300/80 dark:border-amber-700 shadow-2xs">
                  <Sparkles className="w-3 h-3 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>{language === 'bn' ? monthName.bn : monthName.en}</span>
                </span>
              </h4>

              {/* Instant celebratory burst trigger */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  createParticles(undefined, undefined, 35);
                }}
                className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 underline decoration-dotted flex items-center gap-0.5 cursor-pointer ml-1"
                title={language === 'bn' ? 'কনফেটি উড়ান' : 'Celebrate!'}
              >
                <span>🎉</span>
                <span className="hidden md:inline">{language === 'bn' ? 'উৎসব উদযাপন' : 'Celebrate'}</span>
              </button>
            </div>
            <p className="text-[11px] sm:text-xs text-stone-600 dark:text-stone-300 mt-0.5">
              {language === 'bn'
                ? `চলতি ${monthName.bn} মাসে কোলাশ পরিবারের ${birthdayMembers.length} জন সম্মানিত সদস্যের জন্মদিন। তাঁদের জানাই প্রাণঢালা অভিনন্দন!`
                : `Celebrating ${birthdayMembers.length} CoLASH community member${birthdayMembers.length > 1 ? 's' : ''} born in ${monthName.en}!`}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsDismissed(true)}
          className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer shrink-0"
          title={language === 'bn' ? 'লুকিয়ে রাখুন' : 'Dismiss'}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Celebrants Grid */}
      <div className="relative z-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {birthdayMembers.map((member) => {
          const hasSent = Boolean(sentWishes[member.id]);
          const day = member.birthDay || (member.dateOfBirth ? parseInt(member.dateOfBirth.split('-')[2] || '1', 10) : null);
          const dayDisplay = day
            ? language === 'bn'
              ? `${day.toLocaleString('bn-BD')} ${monthName.bn}`
              : `${monthName.en} ${day}`
            : (language === 'bn' ? monthName.bn : monthName.en);

          return (
            <div
              key={member.id}
              onClick={() => onSelectMember && onSelectMember(member)}
              className="group/card p-3 rounded-xl bg-white/90 dark:bg-stone-900/90 hover:bg-white dark:hover:bg-stone-900 border border-stone-200/90 dark:border-stone-800 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-2.5"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                    alt={member.nameEn}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400/80 dark:ring-amber-500/80 group-hover/card:ring-teal-500 transition-all"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center text-[9px] shadow-xs">
                    🎂
                  </div>
                </div>

                <div className="min-w-0">
                  <h5 className="font-bold text-xs text-stone-900 dark:text-white truncate group-hover/card:text-[#167D78] dark:group-hover/card:text-[#D6F36A] transition-colors">
                    {language === 'bn' ? member.nameBn : member.nameEn}
                  </h5>
                  <div className="flex items-center gap-1.5 text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                    <span className="font-semibold text-amber-700 dark:text-amber-300 font-mono flex items-center gap-0.5">
                      <Calendar className="w-2.5 h-2.5" />
                      <span>{dayDisplay}</span>
                    </span>
                    <span>·</span>
                    <span className="truncate">{member.district}</span>
                  </div>
                </div>
              </div>

              {/* Wish Button with interactive confetti burst */}
              <button
                type="button"
                onClick={(e) => handleSendWish(e, member)}
                className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                  hasSent
                    ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-300 border border-rose-300/80 shadow-2xs'
                    : 'bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/70 dark:hover:bg-amber-900/70 text-amber-800 dark:text-amber-200 border border-amber-300/80 hover:scale-105 active:scale-95 shadow-2xs'
                }`}
                title={language === 'bn' ? 'জন্মদিনের শুভেচ্ছা পাঠান' : 'Send Birthday Wish'}
              >
                {hasSent ? (
                  <>
                    <Heart className="w-3 h-3 fill-rose-500 text-rose-500 animate-ping" style={{ animationIterationCount: 2 }} />
                    <span className="hidden sm:inline text-[10px]">{language === 'bn' ? 'শুভেচ্ছা গেছে' : 'Sent'}</span>
                  </>
                ) : (
                  <>
                    <PartyPopper className="w-3 h-3 text-amber-600 dark:text-amber-300" />
                    <span className="hidden sm:inline text-[10px]">{language === 'bn' ? 'শুভেচ্ছা' : 'Wish'}</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
