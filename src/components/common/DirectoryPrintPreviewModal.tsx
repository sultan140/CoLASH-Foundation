import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  Printer,
  Eye,
  LayoutGrid,
  Table as TableIcon,
  ZoomIn,
  ZoomOut,
  AlertTriangle,
  CheckCircle2,
  Droplets,
  MapPin,
  Ruler,
  FileText
} from 'lucide-react';
import { Language } from '../../types';

export interface PrintPreviewMemberItem {
  id: string;
  slNo: number;
  membershipId: string;
  nameBn: string;
  nameEn: string;
  roleBn: string;
  roleEn: string;
  bloodGroup?: string;
  district?: string;
  joinedDate?: string;
  joiningYear?: string | number;
  statusLabelBn?: string;
  statusLabelEn?: string;
  image?: string;
}

interface DirectoryPrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerPrint: () => void;
  language: Language;
  members: PrintPreviewMemberItem[];
  titleBn?: string;
  titleEn?: string;
  filterSummaryBn?: string;
  filterSummaryEn?: string;
  initialView?: 'grid' | 'table';
  onViewChange?: (view: 'grid' | 'table') => void;
}

type PaperSize = 'a4-portrait' | 'a4-landscape' | 'letter-portrait';

export const DirectoryPrintPreviewModal: React.FC<DirectoryPrintPreviewModalProps> = ({
  isOpen,
  onClose,
  onTriggerPrint,
  language,
  members,
  titleBn = 'কোলাশ ফাউন্ডেশন — নিবন্ধিত সদস্য ডিরেক্টরি',
  titleEn = 'CoLASH Foundation — Official Registered Member Directory',
  filterSummaryBn,
  filterSummaryEn,
  initialView = 'grid',
  onViewChange,
}) => {
  const [paperSize, setPaperSize] = useState<PaperSize>('a4-portrait');
  const [previewView, setPreviewView] = useState<'grid' | 'table'>(initialView);
  const [gridColumns, setGridColumns] = useState<1 | 2 | 3>(2);
  const [showMarginGuides, setShowMarginGuides] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(0.85);

  useEffect(() => {
    setPreviewView(initialView);
  }, [initialView, isOpen]);

  // Adjust recommended column count automatically when paper orientation flips
  useEffect(() => {
    if (paperSize === 'a4-landscape') {
      setGridColumns(3);
    } else {
      setGridColumns(2);
    }
  }, [paperSize]);

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

  const paperDimensions = useMemo(() => {
    switch (paperSize) {
      case 'a4-landscape':
        return { widthMm: 297, heightMm: 210, label: 'A4 Landscape (297 × 210 mm)', rowsPerPage: 10, cardsPerRow: gridColumns };
      case 'letter-portrait':
        return { widthMm: 216, heightMm: 279, label: 'US Letter (8.5 × 11 in)', rowsPerPage: 13, cardsPerRow: gridColumns };
      case 'a4-portrait':
      default:
        return { widthMm: 210, heightMm: 297, label: 'A4 Portrait (210 × 297 mm)', rowsPerPage: 14, cardsPerRow: gridColumns };
    }
  }, [paperSize, gridColumns]);

  // Paginate items realistically to simulate multi-page paper output
  const paginatedChunks = useMemo(() => {
    if (members.length === 0) return [[]];
    const itemsPerPage =
      previewView === 'grid'
        ? paperSize === 'a4-landscape'
          ? gridColumns * 2
          : gridColumns * 4
        : paperDimensions.rowsPerPage;

    const pages: PrintPreviewMemberItem[][] = [];
    for (let i = 0; i < members.length; i += itemsPerPage) {
      pages.push(members.slice(i, i + itemsPerPage));
    }
    return pages;
  }, [members, previewView, paperSize, gridColumns, paperDimensions.rowsPerPage]);

  // Detect potential layout issues to help users inspect before browser print
  const layoutDiagnostics = useMemo(() => {
    const warnings: string[] = [];
    if (previewView === 'grid' && paperSize !== 'a4-landscape' && gridColumns >= 3) {
      warnings.push(
        language === 'bn'
          ? 'পোর্ট্রেট কাগজে ৩ কলাম দিলে কার্ডের লেখা সংকুচিত হতে পারে (২ কলাম বা ল্যান্ডস্কেপ সুপারিশকৃত)।'
          : '3 columns on portrait paper may crowd card details (2 columns or Landscape recommended).'
      );
    }
    const longRoleCount = members.filter(m => (m.roleBn?.length || 0) > 42 || (m.roleEn?.length || 0) > 42).length;
    if (longRoleCount > 0 && previewView === 'table') {
      warnings.push(
        language === 'bn'
          ? `${longRoleCount}টি রেকর্ডে দীর্ঘ পদবি/বিবরণ রয়েছে — টেবিল ভিউতে একাধিক লাইনে র‍্যাপ হবে।`
          : `${longRoleCount} record(s) have long role titles that will wrap across lines in Table mode.`
      );
    }
    if (members.length === 0) {
      warnings.push(
        language === 'bn'
          ? 'বর্তমান ফিল্টারে কোনো সদস্য নেই — প্রিন্ট করলে খালি তালিকা দেখাবে।'
          : 'No members match active filters — printed output will be empty.'
      );
    }
    return warnings;
  }, [previewView, paperSize, gridColumns, members, language]);

  if (!isOpen) return null;

  const handleViewSwitch = (nextView: 'grid' | 'table') => {
    setPreviewView(nextView);
    if (onViewChange) onViewChange(nextView);
  };

  const handlePrintFromPreview = () => {
    onClose();
    // Defer slightly so the preview backdrop unmounts cleanly before browser print dialog captures
    window.setTimeout(() => {
      onTriggerPrint();
    }, 80);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={language === 'bn' ? 'সদস্য ডিরেক্টরি প্রিন্ট প্রিভিউ' : 'Member Directory Print Preview'}
      className="no-print fixed inset-0 z-[70] bg-slate-900/90 backdrop-blur-sm flex flex-col overflow-hidden"
    >
      {/* Sticky Top Control Bar */}
      <div className="bg-[#0c1a24] border-b border-slate-700/80 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-lg shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#167D78] text-[#D6F36A] flex items-center justify-center shrink-0">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold tracking-tight">
                {language === 'bn' ? 'প্রিন্ট প্রিভিউ মোড (কাগজের লেআউট সিমুলেশন)' : 'Print Preview Mode'}
              </h3>
              <span className="text-[10px] font-mono bg-white/10 text-[#D6F36A] px-2 py-0.5 rounded-full">
                {paginatedChunks.length} {language === 'bn' ? 'পৃষ্ঠা' : paginatedChunks.length === 1 ? 'Page' : 'Pages'} · {members.length}{' '}
                {language === 'bn' ? 'সদস্য' : 'Members'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              {language === 'bn'
                ? 'ব্রাউজার প্রিন্ট কমান্ড দেওয়ার আগে কাগজে গ্রিড ও মার্জিন কেমন দেখাবে তা যাচাই করুন'
                : 'Inspect paper margins, grid breaks, and text wrapping before launching browser print'}
            </p>
          </div>
        </div>

        {/* Simulation Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Paper Size Selector */}
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5">
            <FileText className="w-3.5 h-3.5 text-[#D6F36A]" />
            <select
              value={paperSize}
              onChange={(e) => setPaperSize(e.target.value as PaperSize)}
              aria-label={language === 'bn' ? 'কাগজের মাপ' : 'Paper size'}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
            >
              <option value="a4-portrait" className="bg-slate-900">A4 Portrait</option>
              <option value="a4-landscape" className="bg-slate-900">A4 Landscape</option>
              <option value="letter-portrait" className="bg-slate-900">US Letter</option>
            </select>
          </div>

          {/* Grid / Table Toggle */}
          <div className="flex items-center bg-slate-800 border border-slate-700 p-0.5 rounded-xl">
            <button
              type="button"
              onClick={() => handleViewSwitch('grid')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                previewView === 'grid'
                  ? 'bg-[#167D78] text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'গ্রিড' : 'Grid'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleViewSwitch('table')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                previewView === 'table'
                  ? 'bg-[#167D78] text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'টেবিল' : 'Table'}</span>
            </button>
          </div>

          {/* Column Test Toggle (Grid View) */}
          {previewView === 'grid' && (
            <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-xl px-2 py-1">
              <span className="text-[10px] text-slate-400 pr-1">
                {language === 'bn' ? 'কলাম:' : 'Cols:'}
              </span>
              {([1, 2, 3] as const).map((cols) => (
                <button
                  key={cols}
                  type="button"
                  onClick={() => setGridColumns(cols)}
                  className={`w-6 h-6 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                    gridColumns === cols
                      ? 'bg-[#D6F36A] text-[#102B3F]'
                      : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {cols}
                </button>
              ))}
            </div>
          )}

          {/* Margin Guides Toggle */}
          <button
            type="button"
            onClick={() => setShowMarginGuides((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              showMarginGuides
                ? 'bg-amber-500/20 border-amber-400/50 text-amber-200'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title={language === 'bn' ? 'প্রিন্ট মার্জিন গাইড দেখান/লুকান' : 'Toggle print margin guides'}
          >
            <Ruler className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{language === 'bn' ? 'মার্জিন গাইড' : 'Guides'}</span>
          </button>

          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-xl px-1.5 py-1">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.55, Number((z - 0.1).toFixed(2))))}
              className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 cursor-pointer"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] w-11 text-center text-slate-200">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(1.15, Number((z + 0.1).toFixed(2))))}
              className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 cursor-pointer"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Print Action */}
          <button
            type="button"
            onClick={handlePrintFromPreview}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#D6F36A] hover:bg-lime-300 text-[#102B3F] font-extrabold text-xs shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'এখনই প্রিন্ট করুন' : 'Print Now'}</span>
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors cursor-pointer"
            aria-label={language === 'bn' ? 'প্রিভিউ বন্ধ করুন' : 'Close Preview'}
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'bn' ? 'বন্ধ করুন' : 'Exit'}</span>
          </button>
        </div>
      </div>

      {/* Layout Diagnostics Strip */}
      <div
        className={`px-4 py-2 text-xs border-b shrink-0 flex flex-wrap items-center justify-between gap-2 ${
          layoutDiagnostics.length > 0
            ? 'bg-amber-950/70 border-amber-700/60 text-amber-100'
            : 'bg-emerald-950/60 border-emerald-800/60 text-emerald-100'
        }`}
      >
        <div className="flex items-center gap-2">
          {layoutDiagnostics.length > 0 ? (
            <>
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{layoutDiagnostics[0]}</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {language === 'bn'
                  ? `লেআউট যাচাই সম্পন্ন: ${paperDimensions.label}-এ কোনো ওভারফ্লো বা কাটা পড়ার ঝুঁকি পাওয়া যায়নি।`
                  : `Layout check passed: Clean fit on ${paperDimensions.label} with 12mm printable margins.`}
              </span>
            </>
          )}
        </div>
        <span className="font-mono text-[11px] opacity-80">
          {paperDimensions.label} · Margin: 12mm
        </span>
      </div>

      {/* Simulated Paper Desk Canvas */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 flex flex-col items-center gap-8">
        {paginatedChunks.map((pageMembers, pageIdx) => (
          <div
            key={`preview-page-${pageIdx}`}
            style={{
              width: `${paperDimensions.widthMm}mm`,
              minHeight: `${paperDimensions.heightMm}mm`,
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              marginBottom: zoom < 1 ? `calc((${zoom} - 1) * ${paperDimensions.heightMm}mm + 16px)` : '16px',
            }}
            className="bg-white text-slate-900 shadow-[0_20px_60px_rgba(0,0,0,0.45)] border border-slate-300 relative shrink-0 transition-transform duration-150"
          >
            {/* Optional 12mm Printable Margin Guide Overlay */}
            {showMarginGuides && (
              <div
                aria-hidden="true"
                style={{ inset: '12mm 12mm 14mm 12mm' }}
                className="pointer-events-none absolute border border-dashed border-sky-400/70 z-10"
              >
                <span className="absolute -top-4 left-0 text-[9px] font-mono text-sky-600 bg-white/90 px-1 rounded">
                  12mm Printable Area Boundary · Page {pageIdx + 1}/{paginatedChunks.length}
                </span>
              </div>
            )}

            {/* Simulated Printable Area */}
            <div style={{ padding: '12mm 12mm 14mm 12mm' }} className="flex flex-col justify-between h-full">
              <div>
                {/* Official Paper Header */}
                <div className="border-b-2 border-[#102B3F] pb-2.5 mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-[13pt] font-black text-[#102B3F] leading-tight">
                      {language === 'bn' ? titleBn : titleEn}
                    </h4>
                    <p className="text-[8.5pt] text-slate-600 mt-0.5">
                      {language === 'bn'
                        ? filterSummaryBn || `মোট প্রদর্শিত সদস্য: ${members.length} জন`
                        : filterSummaryEn || `Total Members Shown: ${members.length}`}
                    </p>
                  </div>
                  <div className="text-right text-[8pt] font-mono text-slate-600 shrink-0">
                    <div className="font-bold text-[#102B3F]">Reg No: DH-9842/2021</div>
                    <div>{new Date().toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}</div>
                  </div>
                </div>

                {/* Empty state */}
                {pageMembers.length === 0 ? (
                  <div className="py-16 text-center border border-dashed border-slate-300 rounded-lg text-slate-500 text-xs">
                    {language === 'bn' ? 'প্রিন্ট করার মতো কোনো সদস্য পাওয়া যায়নি।' : 'No members to display on this sheet.'}
                  </div>
                ) : previewView === 'grid' ? (
                  /* Simulated Paper Grid Layout */
                  <div
                    style={{
                      gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
                    }}
                    className="grid gap-3"
                  >
                    {pageMembers.map((member) => (
                      <div
                        key={member.id}
                        className="border border-slate-400 rounded-md p-2.5 bg-white text-slate-900 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="w-5 h-5 rounded-full bg-[#102B3F] text-white flex items-center justify-center text-[9px] font-bold font-mono">
                              {language === 'bn' ? member.slNo.toLocaleString('bn-BD') : member.slNo}
                            </span>
                            <div className="flex items-center gap-1">
                              {member.bloodGroup && (
                                <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-300 font-bold text-[9px] inline-flex items-center gap-0.5">
                                  <Droplets className="w-2.5 h-2.5" />
                                  <span>{member.bloodGroup}</span>
                                </span>
                              )}
                              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-300 font-semibold text-[8.5px]">
                                {language === 'bn'
                                  ? member.statusLabelBn || 'সক্রিয়'
                                  : member.statusLabelEn || 'Active'}
                              </span>
                            </div>
                          </div>

                          <h5 className="font-bold text-[10.5pt] text-[#102B3F] leading-snug">
                            {language === 'bn' ? member.nameBn : member.nameEn}
                          </h5>
                          <div className="text-[8.5pt] font-mono text-slate-600 mt-0.5">
                            <span className="font-bold text-[#0f766e]">{member.membershipId}</span>
                            {member.joiningYear ? ` · ${language === 'bn' ? 'যোগদান:' : 'Joined:'} ${member.joiningYear}` : ''}
                          </div>

                          <div className="mt-2 p-1.5 rounded bg-slate-50 border border-slate-200">
                            <span className="text-[7.5pt] uppercase font-bold text-slate-500 block">
                              {language === 'bn' ? 'দায়িত্ব / ভূমিকা' : 'Role / Scope'}
                            </span>
                            <p className="text-[8.5pt] font-medium text-slate-800 leading-snug">
                              {language === 'bn' ? member.roleBn : member.roleEn}
                            </p>
                          </div>
                        </div>

                        <div className="pt-1.5 mt-2 border-t border-slate-200 flex items-center justify-between text-[8pt] text-slate-600">
                          <span className="inline-flex items-center gap-1 truncate">
                            <MapPin className="w-2.5 h-2.5 text-[#0f766e] shrink-0" />
                            <span>{member.district || (language === 'bn' ? 'ঢাকা' : 'Dhaka')}</span>
                          </span>
                          <span className="font-mono">{member.joinedDate || ''}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Simulated Paper Table Layout */
                  <table className="w-full border-collapse text-[8.5pt] leading-snug">
                    <thead>
                      <tr className="bg-slate-200 text-[#102B3F]">
                        <th className="border border-slate-400 px-2 py-1.5 text-center font-bold w-8">#</th>
                        <th className="border border-slate-400 px-2 py-1.5 text-left font-bold">
                          {language === 'bn' ? 'সদস্যের নাম' : 'Member Name'}
                        </th>
                        <th className="border border-slate-400 px-2 py-1.5 text-left font-bold">
                          {language === 'bn' ? 'আইডি' : 'ID'}
                        </th>
                        <th className="border border-slate-400 px-2 py-1.5 text-left font-bold">
                          {language === 'bn' ? 'রক্ত' : 'Blood'}
                        </th>
                        <th className="border border-slate-400 px-2 py-1.5 text-left font-bold">
                          {language === 'bn' ? 'জেলা' : 'District'}
                        </th>
                        <th className="border border-slate-400 px-2 py-1.5 text-left font-bold">
                          {language === 'bn' ? 'দায়িত্ব' : 'Role'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageMembers.map((member, rIdx) => (
                        <tr key={member.id} className={rIdx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                          <td className="border border-slate-300 px-2 py-1.5 text-center font-mono font-bold">
                            {language === 'bn' ? member.slNo.toLocaleString('bn-BD') : member.slNo}
                          </td>
                          <td className="border border-slate-300 px-2 py-1.5 font-bold text-[#102B3F]">
                            {language === 'bn' ? member.nameBn : member.nameEn}
                          </td>
                          <td className="border border-slate-300 px-2 py-1.5 font-mono">
                            {member.membershipId}
                          </td>
                          <td className="border border-slate-300 px-2 py-1.5 font-bold text-rose-700">
                            {member.bloodGroup || '—'}
                          </td>
                          <td className="border border-slate-300 px-2 py-1.5">
                            {member.district || '—'}
                          </td>
                          <td className="border border-slate-300 px-2 py-1.5">
                            {language === 'bn' ? member.roleBn : member.roleEn}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Paper Sheet Footer */}
              <div className="pt-3 mt-4 border-t border-slate-300 flex items-center justify-between text-[8pt] text-slate-500 font-mono">
                <span>CoLASH Foundation · Circle of Light and Service for Humanity</span>
                <span>
                  {language === 'bn'
                    ? `পৃষ্ঠা ${(pageIdx + 1).toLocaleString('bn-BD')} / ${paginatedChunks.length.toLocaleString('bn-BD')}`
                    : `Page ${pageIdx + 1} of ${paginatedChunks.length}`}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
