import React from 'react';
import { AlertTriangle, RotateCcw, Download } from 'lucide-react';
import { LocalStorageBackupManager } from '../../utils/LocalStorageBackupManager';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'Unexpected rendering error',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('CoLASH Application ErrorBoundary caught:', error, info);
  }

  handleExportAndReset = () => {
    try {
      LocalStorageBackupManager.downloadSnapshotFile();
    } catch {
      // ignore
    }
    try {
      Object.keys(window.localStorage).forEach((key) => {
        if (key.startsWith('colash_')) {
          window.localStorage.removeItem(key);
        }
      });
    } catch {
      // ignore
    }
    window.location.hash = '#home';
    window.location.reload();
  };

  handleSimpleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F5F3ED] text-[#102B3F] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 shadow-xl p-6 sm:p-8 text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-extrabold text-[#102B3F]">
                ওয়েবসাইট রিকভারি মোড / Page Recovery
              </h1>
              <p className="text-xs text-stone-600 leading-relaxed">
                ব্রাউজারের লোকাল ক্যাশে ত্রুটির কারণে পেজটি লোড হতে সমস্যা হয়েছে। আপনার সংরক্ষিত ডাটা JSON ফাইলে ব্যাকআপ নিয়ে পেজটি রিসেট করতে পারেন।
              </p>
            </div>
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={this.handleSimpleReload}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#167D78] hover:bg-[#102B3F] text-white text-xs font-bold cursor-pointer transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>পুনরায় রিলোড করুন (Reload Page)</span>
              </button>
              <button
                type="button"
                onClick={this.handleExportAndReset}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold cursor-pointer transition-colors border border-stone-300"
              >
                <Download className="w-4 h-4 text-[#167D78]" />
                <span>JSON ব্যাকআপ নিয়ে ক্যাশ রিসেট করুন</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
