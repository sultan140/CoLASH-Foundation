import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { FIREBASE_PROJECT_ID, FIRESTORE_DATABASE_ID } from '../../firebase';

interface FirebaseErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
  isQuotaError: boolean;
}

export class FirebaseErrorBoundary extends React.Component<
  { children: React.ReactNode },
  FirebaseErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
      isQuotaError: false,
    };
  }

  static getDerivedStateFromError(error: Error): FirebaseErrorBoundaryState {
    const msg = error?.message || 'Unexpected application error';
    const isQuotaError =
      msg.includes('Quota exceeded') ||
      msg.includes('resource-exhausted');
    return {
      hasError: true,
      errorMessage: msg,
      isQuotaError,
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Application ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      const upgradeUrl = `https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/firestore/databases/${FIRESTORE_DATABASE_ID}/data?openUpgradeDialog=true`;
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] dark:bg-[#08151f] p-6">
          <div className="max-w-lg w-full bg-white dark:bg-[#0c1a24] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xl p-6 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-[#102B3F] dark:text-white">
              {this.state.isQuotaError
                ? 'দৈনিক ক্লাউড ডাটাবেস সীমা অতিক্রম করেছে'
                : 'সাময়িক কারিগরি ত্রুটি হয়েছে'}
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed break-words">
              {this.state.isQuotaError
                ? 'ফ্রি-টিয়ার Firestore দৈনিক রিড/রাইট কোটা পূর্ণ হয়েছে। আগামীকাল কোটা রিসেট হবে অথবা প্ল্যান আপগ্রেড করতে পারেন।'
                : 'তথ্য লোড বা সংরক্ষণের সময় একটি সমস্যা হয়েছে। পেজটি রিলোড করে আবার চেষ্টা করুন।'}
            </p>
            {this.state.isQuotaError && (
              <a
                href={upgradeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-xs font-semibold text-[#167D78] underline"
              >
                Firebase Console-এ বিস্তারিত দেখুন
              </a>
            )}
            <div className="pt-2">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#167D78] hover:bg-[#126863] text-white text-xs font-bold cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>পুনরায় লোড করুন</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
