import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import {
  QrCode,
  Copy,
  Check,
  Download,
  Share2,
  X,
  ShieldCheck,
  ExternalLink,
  Droplets,
  MapPin,
  ScanLine
} from 'lucide-react';
import { Language } from '../../types';

export interface QRGeneratorProps {
  memberId: string;
  memberName?: string;
  memberRole?: string;
  bloodGroup?: string;
  district?: string;
  language?: Language;
  isOpen?: boolean;
  onClose?: () => void;
  onVerifyNow?: (memberId: string) => void;
  onOpenScanner?: () => void;
  onToast?: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
}

export const QRGenerator: React.FC<QRGeneratorProps> = ({
  memberId,
  memberName,
  memberRole,
  bloodGroup,
  district,
  language = 'bn',
  isOpen = true,
  onClose,
  onVerifyNow,
  onOpenScanner,
  onToast
}) => {
  const [inputMemberId, setInputMemberId] = useState<string>(memberId);
  const [copied, setCopied] = useState(false);
  const canvasWrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setInputMemberId(memberId);
    setCopied(false);
  }, [memberId, isOpen]);

  useEffect(() => {
    if (!isOpen || !onClose) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanMemberId = inputMemberId.trim() || memberId || 'CLF-MEMBER';
  const shareableUrl = `${window.location.origin}${window.location.pathname}#verify-member-${encodeURIComponent(cleanMemberId)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onToast?.(
        'success',
        language === 'bn' ? 'শেয়ারযোগ্য লিংক কপি হয়েছে' : 'Shareable Link Copied',
        shareableUrl
      );
    } catch {
      onToast?.(
        'error',
        language === 'bn' ? 'কপি করা সম্ভব হয়নি' : 'Failed to copy link'
      );
    }
  };

  const handleDownloadPNG = () => {
    const canvas = canvasWrapperRef.current?.querySelector('canvas');
    if (!canvas) return;
    const pngUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = pngUrl;
    link.download = `colash-qr-${cleanMemberId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onToast?.(
      'success',
      language === 'bn' ? 'কিউআর কোড ডাউনলোড সম্পন্ন হয়েছে' : 'QR Code Downloaded',
      `colash-qr-${cleanMemberId}.png`
    );
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: memberName
            ? `${memberName} (${cleanMemberId}) — CoLASH Foundation`
            : `CoLASH Member Verification — ${cleanMemberId}`,
          text: language === 'bn'
            ? `কোলাশ ফাউন্ডেশনের অফিসিয়াল সদস্য (${cleanMemberId}) যাচাইয়ের লিংক:`
            : `Verify CoLASH Foundation official member (${cleanMemberId}):`,
          url: shareableUrl
        });
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
      }
    }
    await handleCopyLink();
  };

  const handleVerifyNow = () => {
    window.location.hash = `verify-member-${encodeURIComponent(cleanMemberId)}`;
    onClose?.();
    onVerifyNow?.(cleanMemberId);
  };

  const cardBody = (
    <div className="bg-white dark:bg-[#0c1a24] rounded-3xl max-w-md w-full border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#102B3F] via-[#167D78] to-[#102B3F] p-5 text-white flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
            <QrCode className="w-5 h-5 text-[#D6F36A]" />
          </div>
          <div className="min-w-0">
            <h3 className="font-extrabold text-sm sm:text-base truncate">
              {language === 'bn' ? 'সদস্য কিউআর কোড জেনারেটর' : 'Member QR Code Generator'}
            </h3>
            <p className="text-[11px] text-teal-100/90 font-mono truncate">
              CoLASH Foundation · Verified ID Pass
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenScanner && (
            <button
              type="button"
              onClick={() => {
                onClose?.();
                onOpenScanner();
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#D6F36A] hover:bg-white text-[#102B3F] text-[11px] font-extrabold transition-colors cursor-pointer"
              title={language === 'bn' ? 'ক্যামেরা দিয়ে QR কোড স্ক্যান করুন' : 'Open Camera QR Scanner'}
            >
              <ScanLine className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'স্ক্যান' : 'Scan'}</span>
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 sm:p-6 space-y-5">
        {/* Optional Member Meta Summary */}
        {memberName && (
          <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900/70 border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="font-bold text-sm text-[#102B3F] dark:text-white truncate">
                {memberName}
              </div>
              {memberRole && (
                <div className="text-xs text-[#167D78] dark:text-[#D6F36A] font-semibold truncate mt-0.5">
                  {memberRole}
                </div>
              )}
              {(bloodGroup || district) && (
                <div className="flex items-center gap-2 mt-1.5 text-[11px] text-stone-500 dark:text-stone-400">
                  {bloodGroup && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold border border-rose-200 dark:border-rose-800">
                      <Droplets className="w-3 h-3" />
                      {bloodGroup}
                    </span>
                  )}
                  {district && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#167D78]" />
                      {district}
                    </span>
                  )}
                </div>
              )}
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1 shrink-0">
              <ShieldCheck className="w-3 h-3" />
              <span>{language === 'bn' ? 'সক্রিয়' : 'Active'}</span>
            </span>
          </div>
        )}

        {/* Member ID Input */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
            {language === 'bn' ? 'সদস্য আইডি (Member ID)' : 'Member ID'}
          </label>
          <input
            type="text"
            value={inputMemberId}
            onChange={(e) => setInputMemberId(e.target.value)}
            placeholder="CLF-001"
            className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 font-mono font-bold text-sm text-[#102B3F] dark:text-[#D6F36A] focus:outline-hidden focus:border-[#167D78]"
          />
        </div>

        {/* QR Preview Box */}
        <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-br from-stone-50 to-teal-50/40 dark:from-stone-900 dark:to-[#0f2431] border border-stone-200 dark:border-stone-800">
          <div className="p-4 rounded-2xl bg-white shadow-md border border-stone-200">
            <QRCodeSVG
              value={shareableUrl}
              size={196}
              bgColor="#FFFFFF"
              fgColor="#102B3F"
              level="H"
              includeMargin={false}
            />
          </div>

          {/* Hidden High-Res Canvas for PNG Export */}
          <div ref={canvasWrapperRef} className="hidden" aria-hidden="true">
            <QRCodeCanvas
              value={shareableUrl}
              size={512}
              bgColor="#FFFFFF"
              fgColor="#102B3F"
              level="H"
              includeMargin={true}
            />
          </div>

          <div className="mt-3 text-center space-y-1">
            <div className="font-mono text-xs font-extrabold text-[#167D78] dark:text-[#D6F36A]">
              ID: {cleanMemberId}
            </div>
            <div className="font-mono text-[10px] text-stone-400">
              Token: {cleanMemberId}-AUTHOFF-COLASH
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 max-w-xs">
              {language === 'bn'
                ? 'এই কিউআর কোড স্ক্যান বা শেয়ার করে যেকোনো স্মার্টফোন থেকে সদস্যপদ যাচাই করা যাবে।'
                : 'Scan or share this QR code to verify membership status from any device.'}
            </p>
          </div>
        </div>

        {/* Shareable Link Copy Bar */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
          <input
            type="text"
            readOnly
            value={shareableUrl}
            className="flex-1 bg-transparent text-[11px] font-mono text-stone-600 dark:text-stone-300 px-2 focus:outline-none truncate"
          />
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-lg bg-[#167D78] hover:bg-[#102B3F] text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#D6F36A]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied') : (language === 'bn' ? 'কপি' : 'Copy')}</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleDownloadPNG}
            className="px-3.5 py-2.5 rounded-xl bg-[#102B3F] hover:bg-[#167D78] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#D6F36A]" />
            <span>{language === 'bn' ? 'PNG ডাউনলোড' : 'Download PNG'}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="px-3.5 py-2.5 rounded-xl bg-[#167D78]/10 hover:bg-[#167D78] text-[#167D78] dark:text-[#D6F36A] hover:text-white border border-[#167D78]/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'শেয়ার করুন' : 'Share QR'}</span>
          </button>

          <button
            type="button"
            onClick={handleVerifyNow}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'পরিচয় যাচাই' : 'Verify ID'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (onClose) {
    return (
      <div
        className="fixed inset-0 z-[70] overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 transition-opacity duration-200"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {cardBody}
      </div>
    );
  }

  return cardBody;
};
