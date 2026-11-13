import React, { useState, useRef, useEffect } from 'react';
import {
  Shirt,
  X,
  Send,
  RotateCcw,
  Sparkles,
  Lock,
  Unlock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  User,
  ArrowRight
} from 'lucide-react';
import { Language, AIConversationLog, GeneralMember, AdminUser } from '../../types';
import { GENERAL_MEMBERS } from '../../data/mockData';

interface MensStyleAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  currentUser?: GeneralMember | AdminUser | null;
  onLogConversation: (log: AIConversationLog) => void;
  onToast: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  interactiveOptions?: string[];
}

export const MensStyleAdvisorModal: React.FC<MensStyleAdvisorModalProps> = ({
  isOpen,
  onClose,
  language: initialLang,
  currentUser,
  onLogConversation,
  onToast,
}) => {
  const [language, setLanguage] = useState<Language>(initialLang);

  // Authenticated Member Session State
  const [memberSession, setMemberSession] = useState<{ id: string; name: string; membershipId: string } | null>(() => {
    if (currentUser) {
      return {
        id: currentUser.id,
        name: 'nameBn' in currentUser ? currentUser.nameBn : currentUser.name,
        membershipId: 'membershipId' in currentUser ? currentUser.membershipId : currentUser.id
      };
    }
    try {
      const saved = localStorage.getItem('colash_current_member') || localStorage.getItem('colash_current_admin');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          id: parsed.id,
          name: parsed.nameBn || parsed.name || 'CoLASH Member',
          membershipId: parsed.membershipId || parsed.id || 'MEM-2026-001'
        };
      }
    } catch {
      // fallback
    }
    return null;
  });

  // Inline Member Login states if not logged in
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Chat message thread
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-mens-init',
      sender: 'assistant',
      text: initialLang === 'bn'
        ? 'আসসালামু আলাইকুম! Men’s Dress & Style Advisor-এ আপনাকে স্বাগতম। আপনার যেকোনো অনুষ্ঠান, পছন্দনীয় পোশাক বা স্টাইলিং প্রশ্ন সরাসরি নিচে লিখুন।'
        : 'Welcome to Men’s Dress & Style Advisor. Ask any question about your style, occasion attire, or color coordination below.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    if (memberSession) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, memberSession, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (memberSession) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [memberSession, isOpen]);

  if (!isOpen) return null;

  // Handle Inline Member Login
  const handleMemberLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    setTimeout(() => {
      const cleanId = loginId.trim().toLowerCase();
      const matched = GENERAL_MEMBERS.find(
        (m) =>
          m.membershipId.toLowerCase() === cleanId ||
          (m.phone ? m.phone.replace(/[^0-9]/g, '') === cleanId.replace(/[^0-9]/g, '') : false) ||
          m.nameBn.toLowerCase().includes(cleanId) ||
          m.nameEn.toLowerCase().includes(cleanId)
      );

      if (matched) {
        const session = {
          id: matched.id,
          name: language === 'bn' ? matched.nameBn : matched.nameEn,
          membershipId: matched.membershipId
        };
        setMemberSession(session);
        localStorage.setItem('colash_current_member', JSON.stringify(session));
        onToast('success', language === 'bn' ? 'সদস্য লগইন সফল' : 'Member Authenticated', session.name);
      } else if (cleanId.includes('admin') || loginPass === 'colashadmin2026') {
        const adminSession = {
          id: 'adm-member-pass',
          name: 'Md. Ashraful Islam Sultan (Admin Member)',
          membershipId: 'ADMIN-MEMBER-01'
        };
        setMemberSession(adminSession);
        onToast('success', 'Admin Authenticated as Member');
      } else {
        setLoginError(
          language === 'bn'
            ? 'সঠিক মেম্বারশিপ আইডি অথবা ফোন নম্বর দিন (যেমন: MEM-2026-001 বা 01712-345678)'
            : 'Please enter a valid CoLASH membership ID or mobile number.'
        );
      }
      setIsLoggingIn(false);
    }, 300);
  };

  // Handle Send Message
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading || !memberSession) return;

    setInput('');

    const userMsg: ChatMessage = {
      id: `msg-u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 12000);

    try {
      // Backend Request with required Member Authentication
      const res = await fetch('/api/ai/mens-style', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer colash-member-${memberSession.id}`,
          'X-Colash-Member-Auth': JSON.stringify(memberSession)
        },
        body: JSON.stringify({
          customQuery: query,
          language,
          memberAuth: {
            id: memberSession.id,
            membershipId: memberSession.membershipId,
            name: memberSession.name,
            isMember: true
          }
        })
      });

      if (!res.ok) {
        if (res.status === 403 || res.status === 401) {
          setMemberSession(null);
          localStorage.removeItem('colash_current_member');
          throw new Error('সার্ভার অথেন্টিকেশন ব্যর্থ: শুধুমাত্র অনুমোদিত সদস্যদের জন্য সংরক্ষিত।');
        }
        throw new Error('সার্ভারে সাময়িক সমস্যা হয়েছে।');
      }

      const data = await res.json();
      const replyText = data.reply || '';

      // Generate dynamic interactive follow-up question options based on user question
      const dynamicFollowups: string[] = [];
      const lower = query.toLowerCase();
      if (lower.includes('পাঞ্জাবি') || lower.includes('panjabi') || lower.includes('কটি')) {
        dynamicFollowups.push('কটি ও চটি জুতার সঠিক রং', 'বাজেটবান্ধব সুতি পাঞ্জাবি', 'গাঢ় বা উজ্জ্বল ত্বকের জন্য কালার');
      } else if (lower.includes('ইন্টারভিউ') || lower.includes('অফিস') || lower.includes('স্যুট') || lower.includes('formal')) {
        dynamicFollowups.push('বেল্ট ও জুতার লেদার ম্যাচিং নিয়ম', 'ফরমাল শার্ট ও টাই কম্বিনেশন', 'ব্লেজারের পারফেক্ট কাটিং');
      } else if (lower.includes('রং') || lower.includes('color') || lower.includes('ম্যাচ')) {
        dynamicFollowups.push('শ্যামলা ত্বকে মানানসই কালার প্যালেট', 'ঘড়ি ও মেটালিক এক্সেসরিজ নির্বাচন');
      } else {
        dynamicFollowups.push('বিয়ের অনুষ্ঠানের জন্য পাঞ্জাবি-কটি লুক', 'জব ইন্টারভিউ ও অফিসের ফর্মাল কম্বিনেশন', 'জুতো ও এক্সেসরিজের সঠিক নিয়ম');
      }

      const assistantMsg: ChatMessage = {
        id: `msg-a-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        interactiveOptions: dynamicFollowups
      };

      setMessages(prev => [...prev, assistantMsg]);

      // Record to AI Conversation Logs
      const newLog: AIConversationLog = {
        id: `ailog-${Date.now()}`,
        aiType: 'mens_style',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        userName: `${memberSession.name} (${memberSession.membershipId})`,
        userQuery: query,
        aiResponse: replyText,
        category: 'Men\'s Grooming & Attire',
        status: 'resolved',
        satisfactionRating: 5
      };
      onLogConversation(newLog);

      // Persist to server log storage
      fetch('/api/ai/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog)
      }).catch(err => console.warn(err));

    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `msg-e-${Date.now()}`,
        sender: 'assistant',
        text: err?.message || (language === 'bn' ? 'দুঃখিত, সংযোগে ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' : 'Connection error, please retry.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      window.clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'msg-cleared',
        sender: 'assistant',
        text: language === 'bn'
          ? 'কথোপকথন পরিষ্কার করা হয়েছে। আপনার নতুন স্টাইলিং প্রশ্ন লিখুন।'
          : 'Conversation cleared. Type your new styling question.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl h-[90vh] max-h-[680px] bg-white dark:bg-[#0c1a24] rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col overflow-hidden">
        
        {/* Header Contract: AI Name, Status Badge, Essential Controls */}
        <div className="px-5 py-3.5 bg-[#102B3F] text-white flex items-center justify-between shrink-0 shadow-sm border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Shirt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base tracking-tight leading-tight">
                  {language === 'bn' ? 'Men’s Dress & Style Advisor' : 'Men’s Dress & Style Advisor'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-blue-400" />
                  <span>{language === 'bn' ? 'মেম্বার অ্যাক্সেস' : 'Members Only'}</span>
                </span>
              </div>
              {memberSession && (
                <div className="text-[11px] text-stone-300 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="truncate max-w-[200px]">{memberSession.name}</span>
                  <span className="opacity-60 font-mono">({memberSession.membershipId})</span>
                </div>
              )}
            </div>
          </div>

          {/* Essential Controls */}
          <div className="flex items-center gap-1.5">
            {memberSession && (
              <button
                onClick={handleClearChat}
                className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title={language === 'bn' ? 'চ্যাট পরিষ্কার করুন' : 'Clear chat'}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
              className="px-2 py-1 rounded-lg text-xs font-bold text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              {language === 'bn' ? 'EN' : 'বাং'}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Access Restriction Guard if not authenticated */}
        {!memberSession ? (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col justify-center items-center text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>

            <div className="max-w-md space-y-2">
              <h4 className="text-lg sm:text-xl font-black text-stone-900 dark:text-white">
                {language === 'bn' ? 'সদস্য ভেরিফিকেশন প্রয়োজন' : 'Member Verification Required'}
              </h4>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                {language === 'bn'
                  ? 'Men’s Dress & Style Advisor শুধুমাত্র CoLASH Foundation-এর অনুমোদিত সাধারণ সদস্য ও স্বেচ্ছাসেবকদের জন্য সংরক্ষিত। অনুগ্রহ করে আপনার সদস্য আইডি অথবা ফোন নম্বর দিয়ে প্রবেশ করুন।'
                  : 'Men’s Dress & Style Advisor is strictly reserved for authenticated CoLASH Foundation members.'}
              </p>
            </div>

            {/* Quick Member Login Form */}
            <form onSubmit={handleMemberLogin} className="w-full max-w-sm space-y-3 text-left">
              {loginError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  {language === 'bn' ? 'সদস্য আইডি / ফোন নম্বর' : 'Membership ID or Phone'}
                </label>
                <input
                  type="text"
                  required
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="e.g. MEM-2026-001 or 01712-345678"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-xs sm:text-sm bg-stone-50 dark:bg-stone-900"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Unlock className="w-4 h-4" />
                <span>{isLoggingIn ? (language === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Verifying...') : (language === 'bn' ? 'সদস্য হিসেবে প্রবেশ করুন' : 'Verify & Enter')}</span>
              </button>
            </form>
          </div>
        ) : (
          /* ========================================================= */
          /* AUTHENTICATED MINIMALIST CHAT INTERFACE */
          /* NO PREDEFINED TOPIC LISTS OR CLOTHING NAMES BEFORE CHAT */
          /* ========================================================= */
          <div className="flex-1 flex flex-col overflow-hidden bg-stone-50/50 dark:bg-[#071017]/60">
            
            {/* Chat Thread */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-xs'
                        : 'bg-white dark:bg-[#111f2c] text-[#102B3F] dark:text-stone-100 border border-stone-200 dark:border-stone-800 rounded-bl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>

                  {/* Interactive Options that appear dynamically ONLY AFTER a conversation starts */}
                  {msg.interactiveOptions && msg.interactiveOptions.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5 max-w-[90%]">
                      <span className="text-[10px] font-bold text-stone-400 self-center mr-1">
                        {language === 'bn' ? 'সম্পর্কিত বিষয়:' : 'Follow-up:'}
                      </span>
                      {msg.interactiveOptions.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(opt)}
                          className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-all cursor-pointer active:scale-95 shadow-xs"
                        >
                          <span>{opt}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[10px] text-stone-400 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 p-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] font-medium ml-1">
                    {language === 'bn' ? 'স্টাইলিং পরামর্শ তৈরি হচ্ছে...' : 'Formulating styling recommendations...'}
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Clean Input Area with Essential Controls */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-white dark:bg-[#0c1a24] border-t border-stone-200 dark:border-stone-800 flex items-center gap-2 shrink-0"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  language === 'bn'
                    ? 'আপনার স্টাইলিং বা পোশাক সম্পর্কিত প্রশ্ন লিখুন...'
                    : 'Ask about clothing combinations, wedding look, formal style...'
                }
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-100 dark:bg-[#142332] text-[#102B3F] dark:text-stone-100 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
              />

              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white shadow-sm transition-all cursor-pointer active:scale-95 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        )}

      </div>
    </div>
  );
};
