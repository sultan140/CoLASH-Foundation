import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import QRCode from 'qrcode';
import { Printer, Download, CheckCircle2, ShieldCheck, X, FileText, Heart, Building2 } from 'lucide-react';
import { DonationRecord, Language } from '../../types';

interface DonationReceiptModalProps {
  donation: DonationRecord | null;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const DonationReceiptModal: React.FC<DonationReceiptModalProps> = ({
  donation,
  isOpen,
  onClose,
  language
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  useEffect(() => {
    if (donation && isOpen) {
      const verifyUrl = `${window.location.origin}${window.location.pathname}#verify-receipt-${donation.id}`;
      QRCode.toDataURL(verifyUrl, {
        width: 140,
        margin: 1,
        color: {
          dark: '#102B3F',
          light: '#FFFFFF'
        }
      })
        .then(setQrCodeDataUrl)
        .catch(console.error);
    }
  }, [donation, isOpen]);

  if (!isOpen || !donation) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="print-modal-backdrop fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
        <motion.div
          key={donation.id}
          initial={{ opacity: 0, y: 44, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 320, damping: 25, mass: 0.9 }}
          className="print-modal-dialog bg-white dark:bg-[#0c1a24] rounded-3xl max-w-xl w-full border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden relative"
        >
        
        {/* Top Control Bar */}
        <div className="no-print bg-stone-100 dark:bg-stone-900 px-5 py-3 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#167D78]" />
            <span className="font-bold text-xs sm:text-sm text-stone-800 dark:text-stone-200">
              {language === 'bn' ? 'অফিসিয়াল অনুদান রসিদ' : 'Official Donation Money Receipt'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#167D78] hover:bg-[#102B3F] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'প্রিন্ট / সেভ PDF' : 'Print / Save PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="print-donation-receipt p-6 sm:p-8 bg-white text-stone-900 font-sans print:p-0 relative" id="printable-money-receipt">
          
          {/* Subtle Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
            <span className="text-8xl font-black rotate-[-25deg] text-[#167D78]">CoLASH</span>
          </div>

          {/* Header */}
          <div className="border-b-2 border-[#167D78] pb-4 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-black text-xl tracking-tight text-[#102B3F]">
                  কোলাশ ফাউন্ডেশন
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#167D78]/10 text-[#167D78] font-bold">
                  মানবিক সেবা সংস্থা
                </span>
              </div>
              <p className="text-[11px] text-stone-500 max-w-sm">
                Community Leaders and Social Helpers (CoLASH) Foundation
                <br />
                ইমেইল: colash.foundation@gmail.com | হটলাইন: 01646-475348
              </p>
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100">
              <span className="receipt-badge inline-block px-3 py-1 rounded-md bg-[#102B3F] text-white font-mono font-bold text-xs mb-1">
                MONEY RECEIPT
              </span>
              <p className="text-[11px] font-mono text-stone-600">
                Receipt No: <strong className="receipt-accent text-[#167D78]">{donation.id}</strong>
              </p>
              <p className="text-[11px] text-stone-500 font-mono">
                Date: {donation.date}
              </p>
            </div>
          </div>

          {/* Receipt Body */}
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="receipt-summary-box p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2.5">
              <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                <span className="text-stone-500">{language === 'bn' ? 'অনুদানদাতার নাম' : 'Received with thanks from'}:</span>
                <span className="font-extrabold text-[#102B3F] text-base">{donation.donorName}</span>
              </div>

              <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                <span className="text-stone-500">{language === 'bn' ? 'অনুদানের খাত / উদ্দেশ্য' : 'Purpose / Fund Sector'}:</span>
                <span className="font-bold text-stone-800">{donation.purpose || 'সাধারণ কল্যাণ তহবিল'}</span>
              </div>

              <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                <span className="text-stone-500">{language === 'bn' ? 'পরিশোধ মাধ্যম ও ট্রানজেকশন' : 'Payment Method & TrxID'}:</span>
                <span className="font-mono font-semibold text-stone-800 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-xs uppercase">
                    {donation.method}
                  </span>
                  <span>{donation.phoneOrTrx || 'N/A'}</span>
                </span>
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="text-stone-600 font-bold">{language === 'bn' ? 'অনুদানের মোট পরিমাণ' : 'Total Amount Received'}:</span>
                <div className="text-right">
                  <span className="receipt-accent font-mono font-black text-xl text-[#167D78]">
                    ৳ {donation.amount.toLocaleString('en-US')} BDT
                  </span>
                </div>
              </div>
            </div>

            {/* Verification & Signatures */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-stone-200">
              
              {/* QR Code */}
              <div className="flex items-center gap-3">
                {qrCodeDataUrl && (
                  <img src={qrCodeDataUrl} alt="Verify QR" className="w-16 h-16 border border-stone-200 p-1 rounded-lg" />
                )}
                <div className="text-[10px] text-stone-500">
                  <span className="font-bold text-[#102B3F] block">Central Verified Receipt</span>
                  <span>কোলাশ সেন্ট্রাল ফান্ড ম্যানেজমেন্ট</span>
                  <span className="block font-mono text-[9px] text-emerald-600 font-bold mt-0.5">
                    ✓ Verified by Finance Secretariat
                  </span>
                </div>
              </div>

              {/* Signatures */}
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="w-32 border-b border-stone-400 mb-1">
                    <span className="font-serif italic text-[11px] text-[#167D78]">Md. Ashraful Islam Sultan</span>
                  </div>
                  <span className="text-[10px] font-bold text-stone-600 block">
                    প্রতিষ্ঠাতা ও সভাপতি
                  </span>
                  <span className="text-[9px] text-stone-400">কোলাশ ফাউন্ডেশন</span>
                </div>

                <div className="text-center">
                  <div className="w-24 border-b border-stone-400 mb-1">
                    <span className="font-serif italic text-[11px] text-[#102B3F]">Md. Shaon</span>
                  </div>
                  <span className="text-[10px] font-bold text-stone-600 block">
                    সাধারণ সম্পাদক
                  </span>
                  <span className="text-[9px] text-stone-400">কোলাশ ফাউন্ডেশন</span>
                </div>
              </div>

            </div>

            {/* Note */}
            <div className="text-[10px] text-center text-stone-400 pt-2 border-t border-stone-100">
              {language === 'bn'
                ? 'মানবিক সেবায় আপনার স্বতঃস্ফূর্ত অবদানের জন্য কোলাশ ফাউন্ডেশন কৃতজ্ঞ। এই রসিদটি স্বয়ংক্রিয়ভাবে প্রস্তুতকৃত।'
                : 'Thank you for your generous humanitarian contribution to CoLASH Foundation. This is a computer generated official receipt.'}
            </div>

          </div>

        </div>

      </motion.div>
    </div>
    </AnimatePresence>
  );
};
