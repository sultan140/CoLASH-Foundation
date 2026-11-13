import React, { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import {
  Camera,
  X,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Upload,
  ShieldCheck,
  QrCode,
  Droplets,
  MapPin,
  Search,
  SwitchCamera,
  UserCheck,
  ScanLine
} from 'lucide-react';
import { GeneralMember, TeamMember, Language } from '../../types';

export interface ScannedMemberMatch {
  membershipId: string;
  nameBn: string;
  nameEn: string;
  roleBn: string;
  roleEn: string;
  bloodGroup: string;
  district: string;
  statusLabelBn: string;
  statusLabelEn: string;
  isVerified: boolean;
  avatar?: string;
  joiningYear?: string | number;
  rawGeneralMember?: GeneralMember;
  verifiableMember: GeneralMember;
}

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  generalMembers: GeneralMember[];
  committee: TeamMember[];
  onVerifiedMemberOpen?: (member: GeneralMember) => void;
  onOpenVerificationModal?: (member: GeneralMember) => void;
  onToast?: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
}

/**
 * Extracts a CoLASH membership ID from raw QR text, hash URLs (#verify-member-CLF-001),
 * query URLs (?id=CLF-001), verification tokens (CLF-001-AUTHOFF-COLASH), or JSON payloads.
 */
export function extractMemberIdFromQrPayload(rawPayload: string): string {
  const trimmed = rawPayload.trim();
  if (!trimmed) return '';

  const stripTokenSuffix = (val: string) =>
    val.replace(/-AUTHOFF-COLASH$/i, '').trim();

  // 1. Check for #verify-member-<ID> pattern in URL or hash
  const hashMatch = trimmed.match(/#verify-member-([^?&\s]+)/i);
  if (hashMatch && hashMatch[1]) {
    try {
      return stripTokenSuffix(decodeURIComponent(hashMatch[1]));
    } catch {
      return stripTokenSuffix(hashMatch[1]);
    }
  }

  // 2. Check for URL query param (?id=..., ?memberId=...)
  const queryMatch = trimmed.match(/[?&](?:membershipId|memberId|id)=([^&\s#]+)/i);
  if (queryMatch && queryMatch[1]) {
    try {
      return stripTokenSuffix(decodeURIComponent(queryMatch[1]));
    } catch {
      return stripTokenSuffix(queryMatch[1]);
    }
  }

  // 3. Check for JSON payload
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const obj = JSON.parse(trimmed);
      const candidate = obj.membershipId || obj.memberId || obj.id;
      if (typeof candidate === 'string' && candidate.trim()) {
        return stripTokenSuffix(candidate);
      }
    } catch {
      // ignore invalid json
    }
  }

  // 4. Direct member ID pattern (e.g., CLF-001, CLF-EC-01) or token
  return stripTokenSuffix(trimmed);
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  language,
  generalMembers,
  committee,
  onVerifiedMemberOpen,
  onOpenVerificationModal,
  onToast,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastScanTimeRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraState, setCameraState] = useState<'starting' | 'active' | 'error' | 'idle'>('idle');
  const [cameraError, setCameraError] = useState<string>('');
  const [manualInput, setManualInput] = useState<string>('');
  const [autoOpenVerify, setAutoOpenVerify] = useState<boolean>(true);
  const [scanResult, setScanResult] = useState<{
    rawText: string;
    extractedId: string;
    match: ScannedMemberMatch | null;
  } | null>(null);

  const stopCamera = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const lookupMember = useCallback(
    (rawText: string): { rawText: string; extractedId: string; match: ScannedMemberMatch | null } => {
      const extractedId = extractMemberIdFromQrPayload(rawText);
      const normalized = extractedId.toLowerCase();

      // Search General Members first
      const matchedGeneral = generalMembers.find(
        (m) =>
          m.membershipId.toLowerCase() === normalized ||
          m.id.toLowerCase() === normalized
      );

      if (matchedGeneral) {
        const isApproved =
          matchedGeneral.approvalStatus === 'approved' ||
          (!matchedGeneral.approvalStatus && matchedGeneral.status === 'active');

        return {
          rawText,
          extractedId,
          match: {
            membershipId: matchedGeneral.membershipId,
            nameBn: matchedGeneral.nameBn,
            nameEn: matchedGeneral.nameEn,
            roleBn: matchedGeneral.roleBn,
            roleEn: matchedGeneral.roleEn,
            bloodGroup: matchedGeneral.bloodGroup,
            district: matchedGeneral.district,
            statusLabelBn: isApproved ? 'বৈধ ও অনুমোদিত সদস্য' : 'অনুমোদন অপেক্ষমাণ',
            statusLabelEn: isApproved ? 'Verified & Active Member' : 'Pending Approval',
            isVerified: isApproved,
            avatar: matchedGeneral.avatar,
            joiningYear: matchedGeneral.joiningYear,
            rawGeneralMember: matchedGeneral,
            verifiableMember: matchedGeneral,
          },
        };
      }

      // Search Central Executive Committee (CLF-EC-01 .. CLF-EC-16 or member.id)
      const ecIndex = committee.findIndex(
        (c, idx) =>
          `clf-ec-${(idx + 1).toString().padStart(2, '0')}` === normalized ||
          c.id.toLowerCase() === normalized
      );

      if (ecIndex !== -1) {
        const c = committee[ecIndex];
        const ecId = `CLF-EC-${(ecIndex + 1).toString().padStart(2, '0')}`;
        const verifiableCommitteeMember: GeneralMember = {
          id: c.id,
          slNo: ecIndex + 1,
          membershipId: ecId,
          nameBn: c.nameBn,
          nameEn: c.nameEn,
          roleBn: c.roleBn,
          roleEn: c.roleEn,
          bloodGroup: c.bloodGroup || 'O+',
          district: c.district || (language === 'bn' ? 'মৌলভীবাজার' : 'Moulvibazar'),
          joinedDate: c.joiningYear ? `${c.joiningYear}-01-01` : '2026-03-07',
          joiningYear: c.joiningYear || 2026,
          status: 'active',
          approvalStatus: 'approved',
          avatar: c.image,
          email: c.email,
        };

        return {
          rawText,
          extractedId,
          match: {
            membershipId: ecId,
            nameBn: c.nameBn,
            nameEn: c.nameEn,
            roleBn: c.roleBn,
            roleEn: c.roleEn,
            bloodGroup: c.bloodGroup || 'O+',
            district: c.district || (language === 'bn' ? 'মৌলভীবাজার' : 'Moulvibazar'),
            statusLabelBn: 'কেন্দ্রীয় নির্বাহী সদস্য (যাচাইকৃত)',
            statusLabelEn: 'Verified Executive Committee Member',
            isVerified: true,
            avatar: c.image,
            joiningYear: c.joiningYear,
            verifiableMember: verifiableCommitteeMember,
          },
        };
      }

      return {
        rawText,
        extractedId,
        match: null,
      };
    },
    [generalMembers, committee, language]
  );

  const handleDecodedPayload = useCallback(
    (payload: string) => {
      const resolved = lookupMember(payload);
      stopCamera();
      setCameraState('idle');

      if (resolved.match) {
        onToast?.(
          'success',
          language === 'bn' ? 'সদস্য পরিচয় নিশ্চিত হয়েছে' : 'Member Identity Verified',
          `${resolved.match.nameBn} (${resolved.match.membershipId})`
        );

        if (autoOpenVerify && onOpenVerificationModal) {
          setScanResult(resolved);
          onClose();
          onOpenVerificationModal(resolved.match.verifiableMember);
          return;
        }
      } else {
        onToast?.(
          'error',
          language === 'bn' ? 'সদস্য খুঁজে পাওয়া যায়নি' : 'Unrecognized Member QR',
          resolved.extractedId || payload
        );
      }

      setScanResult(resolved);
    },
    [lookupMember, stopCamera, onToast, language, autoOpenVerify, onOpenVerificationModal, onClose]
  );

  const startScanningLoop = useCallback(() => {
    const tick = (now: number) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (
        video &&
        canvas &&
        video.readyState >= video.HAVE_CURRENT_DATA &&
        now - lastScanTimeRef.current >= 90
      ) {
        lastScanTimeRef.current = now;
        const vw = video.videoWidth;
        const vh = video.videoHeight;
        if (vw > 0 && vh > 0) {
          // Scale down high-res feeds to <= 640px wide for fast, reliable jsQR decoding
          const scale = vw > 640 ? 640 / vw : 1;
          const width = Math.round(vw * scale);
          const height = Math.round(vh * scale);
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(video, 0, 0, width, height);
            const imageData = ctx.getImageData(0, 0, width, height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'attemptBoth',
            });
            if (code && code.data) {
              handleDecodedPayload(code.data);
              return;
            }
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [handleDecodedPayload]);

  const startCamera = useCallback(async () => {
    stopCamera();
    setScanResult(null);
    setCameraError('');
    setCameraState('starting');

    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraState('error');
      setCameraError(
        language === 'bn'
          ? 'এই ব্রাউজারে ক্যামেরা অ্যাক্সেস সমর্থিত নয় অথবা নিরাপদ সংযোগ প্রয়োজন। নিচ থেকে QR ছবি আপলোড বা আইডি লিখুন।'
          : 'Camera access is unavailable in this browser/context. Use QR image upload or manual ID verification below.'
      );
      return;
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch {
        // Fallback for webcams/devices that reject ideal facingMode or resolution constraints
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.muted = true;
        await videoRef.current.play();
      }
      setCameraState('active');
      startScanningLoop();
    } catch (err: any) {
      setCameraState('error');
      const denied = err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError';
      setCameraError(
        denied
          ? language === 'bn'
            ? 'ক্যামেরার অনুমতি পাওয়া যায়নি। ব্রাউজারে ক্যামেরা পারমিশন দিন অথবা নিচ থেকে QR কোডের ছবি আপলোড করুন।'
            : 'Camera permission was denied. Enable camera access or upload a QR code image below.'
          : language === 'bn'
            ? 'ক্যামেরা চালু করা যায়নি (কোনো ক্যামেরা পাওয়া যায়নি বা অন্য অ্যাপ ব্যবহার করছে)। QR ছবি আপলোড করেও যাচাই করতে পারেন।'
            : 'Could not start camera device. You can still upload a QR code image or paste an ID below.'
      );
    }
  }, [facingMode, language, startScanningLoop, stopCamera]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setCameraState('idle');
      setScanResult(null);
      setManualInput('');
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });
        if (code && code.data) {
          handleDecodedPayload(code.data);
        } else {
          onToast?.(
            'error',
            language === 'bn' ? 'ছবিতে কোনো QR কোড পাওয়া যায়নি' : 'No QR Code Detected',
            language === 'bn'
              ? 'অনুগ্রহ করে স্পষ্ট একটি QR কোড ইমেজ নির্বাচন করুন।'
              : 'Please upload a clear QR code image.'
          );
        }
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleManualVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    handleDecodedPayload(manualInput);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={language === 'bn' ? 'ক্যামেরা QR ও আইডি স্ক্যানার' : 'Camera QR & ID Verification Scanner'}
      className="no-print fixed inset-0 z-[75] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-[#0c1a24] max-w-lg w-full rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#102B3F] via-[#167D78] to-[#102B3F] p-5 text-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
              <ScanLine className="w-5 h-5 text-[#D6F36A]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-sm sm:text-base truncate">
                  {language === 'bn' ? 'ক্যামেরা QR আইডি ভেরিফিকেশন স্ক্যানার' : 'Camera QR ID Verification Scanner'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#D6F36A] text-[#102B3F] text-[10px] font-black uppercase">
                  {language === 'bn' ? 'লাইভ ক্যামেরা' : 'Live Camera'}
                </span>
              </div>
              <p className="text-[11px] text-teal-100/90 truncate">
                {language === 'bn'
                  ? 'সদস্যের আইডি কার্ড বা QR কোড ক্যামেরায় ধরে তাৎক্ষণিক পরিচয় যাচাই করুন'
                  : 'Point camera at any member QR badge to verify official identity'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Hidden offscreen canvas used by jsQR */}
          <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

          {/* Auto-open verification modal toggle */}
          {onOpenVerificationModal && (
            <label className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 cursor-pointer select-none">
              <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#167D78] dark:text-[#D6F36A]" />
                <span>
                  {language === 'bn'
                    ? 'স্ক্যান হওয়ার সাথে সাথে ভেরিফিকেশন কার্ড খুলবে'
                    : 'Auto-open official verification card after scan'}
                </span>
              </span>
              <input
                type="checkbox"
                checked={autoOpenVerify}
                onChange={(e) => setAutoOpenVerify(e.target.checked)}
                className="w-4 h-4 accent-[#167D78] rounded cursor-pointer"
              />
            </label>
          )}

          {/* Active Camera Viewfinder OR Result Card */}
          {!scanResult ? (
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-[4/3] border border-stone-200 dark:border-stone-800 flex items-center justify-center">
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  autoPlay
                  className={`w-full h-full object-cover ${cameraState === 'active' ? 'opacity-100' : 'opacity-0'}`}
                />

                {/* Animated Scanning Reticle */}
                {cameraState === 'active' && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="w-52 h-52 sm:w-60 sm:h-60 rounded-2xl border-2 border-[#D6F36A]/85 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] relative">
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-0.5 rounded-full bg-[#102B3F]/95 text-[#D6F36A] text-[10px] font-bold border border-[#D6F36A]/30">
                        {language === 'bn' ? 'QR কোড ক্যামেরার ভেতরে ধরুন...' : 'Align QR Code inside frame...'}
                      </span>
                      <div className="absolute inset-x-3 top-1/2 h-0.5 bg-[#D6F36A]/90 animate-pulse" />
                    </div>
                  </div>
                )}

                {cameraState === 'starting' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-2">
                    <RefreshCw className="w-7 h-7 text-[#D6F36A] animate-spin" />
                    <span className="text-xs font-semibold">
                      {language === 'bn' ? 'ক্যামেরা চালু হচ্ছে...' : 'Starting camera...'}
                    </span>
                  </div>
                )}

                {cameraState === 'error' && (
                  <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center gap-3 text-stone-200">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <p className="text-xs leading-relaxed max-w-xs">{cameraError}</p>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#167D78] hover:bg-teal-700 text-white text-xs font-bold cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'পুনরায় ক্যামেরা চালু করুন' : 'Retry Camera'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Camera Toolbar: Switch Camera & Upload Image */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setFacingMode((m) => (m === 'environment' ? 'user' : 'environment'))}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <SwitchCamera className="w-3.5 h-3.5 text-[#167D78] dark:text-[#D6F36A]" />
                  <span>
                    {facingMode === 'environment'
                      ? language === 'bn' ? 'ফ্রন্ট ক্যামেরা' : 'Switch to Front'
                      : language === 'bn' ? 'ব্যাক ক্যামেরা' : 'Switch to Rear'}
                  </span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#167D78]/10 hover:bg-[#167D78] text-[#167D78] dark:text-[#D6F36A] hover:text-white border border-[#167D78]/30 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'QR ছবি আপলোড করে স্ক্যান' : 'Scan from QR Image'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Verification Result Card */
            <div className="space-y-4">
              {scanResult.match ? (
                <div className="p-4 sm:p-5 rounded-2xl border-2 border-emerald-500/60 bg-emerald-50/70 dark:bg-emerald-950/30 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-emerald-900 dark:text-emerald-200">
                          {language === 'bn' ? scanResult.match.statusLabelBn : scanResult.match.statusLabelEn}
                        </h4>
                        <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
                          Verified ID: {scanResult.match.membershipId}
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{scanResult.match.isVerified ? 'VALID' : 'PENDING'}</span>
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-[#0c1a24] border border-emerald-200 dark:border-emerald-900 flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-xl bg-stone-100 dark:bg-stone-800 overflow-hidden shrink-0 border border-stone-200 dark:border-stone-700 flex items-center justify-center">
                      {scanResult.match.avatar ? (
                        <img
                          src={scanResult.match.avatar}
                          alt={scanResult.match.nameEn}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserCheck className="w-6 h-6 text-[#167D78]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-extrabold text-sm text-[#102B3F] dark:text-white truncate">
                        {language === 'bn' ? scanResult.match.nameBn : scanResult.match.nameEn}
                      </div>
                      <div className="text-xs font-semibold text-[#167D78] dark:text-[#D6F36A] truncate">
                        {language === 'bn' ? scanResult.match.roleBn : scanResult.match.roleEn}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px]">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800">
                          <Droplets className="w-3 h-3" />
                          {scanResult.match.bloodGroup}
                        </span>
                        <span className="inline-flex items-center gap-1 text-stone-600 dark:text-stone-300">
                          <MapPin className="w-3 h-3 text-[#167D78]" />
                          {scanResult.match.district}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#167D78] hover:bg-[#102B3F] text-white text-xs font-bold cursor-pointer transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'আরেকটি স্ক্যান করুন' : 'Scan Next ID'}</span>
                    </button>

                    {onOpenVerificationModal && (
                      <button
                        type="button"
                        onClick={() => {
                          const target = scanResult.match!.verifiableMember;
                          onClose();
                          onOpenVerificationModal(target);
                        }}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'ভেরিফিকেশন কার্ড' : 'Verification Card'}</span>
                      </button>
                    )}

                    {scanResult.match.rawGeneralMember && onVerifiedMemberOpen && (
                      <button
                        type="button"
                        onClick={() => {
                          const target = scanResult.match!.rawGeneralMember!;
                          onClose();
                          onVerifiedMemberOpen(target);
                        }}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#102B3F] hover:bg-slate-800 text-[#D6F36A] text-xs font-bold cursor-pointer transition-colors"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'পূর্ণ প্রোফাইল' : 'Full Card'}</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 sm:p-5 rounded-2xl border-2 border-rose-500/60 bg-rose-50/70 dark:bg-rose-950/30 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-sm text-rose-900 dark:text-rose-200">
                        {language === 'bn' ? 'অবৈধ বা অনিবন্ধিত QR কোড' : 'Unrecognized / Unregistered Member QR'}
                      </h4>
                      <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5 break-all">
                        {language === 'bn'
                          ? `পাঠকৃত আইডি/তথ্য (${scanResult.extractedId || scanResult.rawText}) কোলাশ সদস্য ডাটাবেসে পাওয়া যায়নি।`
                          : `Decoded payload (${scanResult.extractedId || scanResult.rawText}) does not match any registered member.`}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'পুনরায় স্ক্যান করুন' : 'Scan Again'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Manual Member ID / QR URL Quick Lookup Fallback */}
          <form onSubmit={handleManualVerify} className="pt-3 border-t border-stone-200 dark:border-stone-800 space-y-1.5">
            <label className="block text-[11px] font-bold text-stone-500 dark:text-stone-400">
              {language === 'bn'
                ? 'বিকল্প যাচাই: সদস্য আইডি বা QR লিংক পেস্ট করুন (যেমন CLF-001 বা CLF-EC-01)'
                : 'Manual Fallback: Paste QR link or Member ID (e.g. CLF-001 or CLF-EC-01)'}
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="CLF-001 or #verify-member-CLF-001"
                  className="w-full pl-8 pr-3 py-2 text-xs font-mono bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:border-[#167D78]"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-[#102B3F] hover:bg-[#167D78] text-white text-xs font-bold cursor-pointer transition-colors shrink-0"
              >
                {language === 'bn' ? 'যাচাই' : 'Verify'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
