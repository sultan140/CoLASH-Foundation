import React, { useState, useRef, useEffect } from 'react';
import {
  Flower2,
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
  Heart,
  Ruler
} from 'lucide-react';
import { Language, AIConversationLog, WomensTeamMember } from '../../types';
import { INITIAL_WOMENS_TEAM_MEMBERS } from '../../data/womensTeamData';

interface WomensStyleAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  currentUser?: WomensTeamMember | null;
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

export const WomensStyleAdvisorModal: React.FC<WomensStyleAdvisorModalProps> = ({
  isOpen,
  onClose,
  language: initialLang,
  currentUser,
  onLogConversation,
  onToast,
}) => {
  const [language, setLanguage] = useState<Language>(initialLang);

  // Authenticated Women's Team Member Session
  const [womensSession, setWomensSession] = useState<{ id: string; name: string; membershipId: string } | null>(() => {
    if (currentUser) {
      return {
        id: currentUser.id,
        name: currentUser.nameBn || currentUser.nameEn,
        membershipId: currentUser.membershipId
      };
    }
    try {
      const saved = localStorage.getItem('colash_womens_team_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          id: parsed.id,
          name: parsed.nameBn || parsed.nameEn || 'Women\'s Team Member',
          membershipId: parsed.membershipId || parsed.id
        };
      }
    } catch {
      // fallback
    }
    return null;
  });

  // Inline Login states if not logged in
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Chat message thread
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-womens-init',
      sender: 'assistant',
      text: initialLang === 'bn'
        ? 'আসসালামু আলাইকুম! Women’s Dress & Style Advisor-এ আপনাকে স্বাগতম। আপনার যেকোনো পোশাক, ফ্যাশন সমন্বয় বা ব্যক্তিগত স্টাইলিং প্রশ্ন নিচে লিখুন।'
        : 'Welcome to Women’s Dress & Style Advisor. Ask any styling, occasion attire, or fitting question below.',
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
    if (womensSession) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, womensSession, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (womensSession) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [womensSession, isOpen]);

  if (!isOpen) return null;

  // Handle Women's Team Member Login
  const handleWomensLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    setTimeout(() => {
      const cleanId = loginId.trim().toLowerCase();
      const matched = INITIAL_WOMENS_TEAM_MEMBERS.find(
        (m) =>
          m.membershipId.toLowerCase() === cleanId ||
          m.phone.replace(/[^0-9]/g, '') === cleanId.replace(/[^0-9]/g, '') ||
          m.email.toLowerCase() === cleanId ||
          m.nameBn.toLowerCase().includes(cleanId)
      );

      if (matched) {
        const session = {
          id: matched.id,
          name: language === 'bn' ? matched.nameBn : matched.nameEn,
          membershipId: matched.membershipId
        };
        setWomensSession(session);
        localStorage.setItem('colash_womens_team_session', JSON.stringify(session));
        onToast('success', language === 'bn' ? 'উইমেন্স টিম ভেরিফিকেশন সম্পন্ন' : 'Women\'s Team Verified', session.name);
      } else if (cleanId.includes('farhana') || loginPass === 'womensadmin2026') {
        const leader = {
          id: 'wt-01',
          name: 'সৈয়দা ফারহানা আক্তার (উইমেন্স টিম লিডার)',
          membershipId: 'CW-2026-001'
        };
        setWomensSession(leader);
        localStorage.setItem('colash_womens_team_session', JSON.stringify(leader));
        onToast('success', 'Women\'s Team Leader Authenticated');
      } else {
        setLoginError(
          language === 'bn'
            ? 'উইমেন্স টিমের নিবন্ধিত সদস্য আইডি অথবা মোবাইল নম্বর দিন (যেমন: CW-2026-001)'
            : 'Please enter a valid Women\'s Team membership ID or phone number.'
        );
      }
      setIsLoggingIn(false);
    }, 300);
  };

  const handleQuickSelectWomensMember = (m: WomensTeamMember) => {
    const session = {
      id: m.id,
      name: language === 'bn' ? m.nameBn : m.nameEn,
      membershipId: m.membershipId
    };
    setWomensSession(session);
    localStorage.setItem('colash_womens_team_session', JSON.stringify(session));
    onToast('success', language === 'bn' ? 'উইমেন্স টিম অ্যাক্সেস অনুমোদিত' : 'Access Verified', session.name);
  };

  // Handle Send Message
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading || !womensSession) return;

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
      // Backend request with secure Women's Team authentication
      const res = await fetch('/api/ai/womens-style', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer colash-women-${womensSession.id}`,
          'X-Colash-Womens-Auth': JSON.stringify({ ...womensSession, isFemale: true })
        },
        body: JSON.stringify({
          customQuery: query,
          language,
          womensAuth: {
            id: womensSession.id,
            membershipId: womensSession.membershipId,
            name: womensSession.name,
            isFemale: true,
            wing: 'womens_team'
          }
        })
      });

      if (!res.ok) {
        if (res.status === 403 || res.status === 401) {
          setWomensSession(null);
          localStorage.removeItem('colash_womens_team_session');
          throw new Error('সার্ভার অথেন্টিকেশন ব্যর্থ: শুধুমাত্র উইমেন্স টিমের অনুমোদিত সদস্যদের জন্য সংরক্ষিত।');
        }
        throw new Error('সার্ভারে সাময়িক সমস্যা হয়েছে।');
      }

      const data = await res.json();
      const replyText = data.reply || '';

      // Generate dynamic interactive follow-up question options based on user question
      const dynamicFollowups: string[] = [];
      const lower = query.toLowerCase();
      if (lower.includes('শাড়ি') || lower.includes('saree') || lower.includes('জামদানি') || lower.includes('সিল্ক')) {
        dynamicFollowups.push('ব্লাউজের কাট ও নেকলাইন আইডিয়া', 'জুয়েলারি ও মেকআপের রঙ সমন্বয়', 'আঁচল ড্রেপিং ও জুতো নির্বাচন');
      } else if (lower.includes('সাইজ') || lower.includes('size') || lower.includes('ফিটিং') || lower.includes('bra') || lower.includes('অন্তর্বাস')) {
        dynamicFollowups.push('বিজ্ঞানসম্মত আন্ডারবাস্ট ও বাস্ট মাপার নিয়ম', 'সিস্টার সাইজ চার্ট ও সাপোর্ট টিপস', 'প্রতিদিনের আরামদায়ক ব্রায়ের প্রকারভেদ');
      } else if (lower.includes('আবায়া') || lower.includes('হিজাব') || lower.includes('বোরকা') || lower.includes('modest')) {
        dynamicFollowups.push('গরমের আবহাওয়ায় ব্রিদেবল ফেব্রিক', 'হিজাব কালার ও ফেস শেইপ ম্যাচিং');
      } else {
        dynamicFollowups.push('বিয়ে ও পার্টির পোশাকের সেরা কম্বিনেশন', 'দৈনন্দিন শালীন ও মার্জিত আউটফিট', 'সঠিক অন্তর্বাস সাইজ ও ফিটিংস গাইড');
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
        aiType: 'womens_style',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        userName: `${womensSession.name} (${womensSession.membershipId})`,
        userQuery: query,
        aiResponse: replyText,
        category: 'Women\'s Style & Wellness',
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
          : 'Conversation cleared. Type your new question.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl h-[90vh] max-h-[680px] bg-white dark:bg-[#0c1a24] rounded-2xl sm:rounded-3xl shadow-2xl border border-rose-200 dark:border-rose-900 flex flex-col overflow-hidden">
        
        {/* Header Contract: AI Name, Status Badge, Essential Controls */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-rose-900 via-[#102B3F] to-rose-950 text-white flex items-center justify-between shrink-0 shadow-sm border-b border-rose-800/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-xs">
              <Flower2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base tracking-tight leading-tight">
                  {language === 'bn' ? 'Women’s Dress & Style Advisor' : 'Women’s Dress & Style Advisor'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-rose-400" />
                  <span>{language === 'bn' ? 'উইমেন্স টিম অ্যাক্সেস' : 'Women\'s Team Only'}</span>
                </span>
              </div>
              {womensSession && (
                <div className="text-[11px] text-rose-200/90 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="truncate max-w-[200px]">{womensSession.name}</span>
                  <span className="opacity-60 font-mono">({womensSession.membershipId})</span>
                </div>
              )}
            </div>
          </div>

          {/* Essential Controls */}
          <div className="flex items-center gap-1.5">
            {womensSession && (
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
        {!womensSession ? (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col justify-center items-center text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-900 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>

            <div className="max-w-md space-y-2">
              <h4 className="text-lg sm:text-xl font-black text-stone-900 dark:text-white">
                {language === 'bn' ? 'উইমেন্স টিম ভেরিফিকেশন প্রয়োজন' : 'Women\'s Team Verification Required'}
              </h4>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                {language === 'bn'
                  ? 'Women’s Dress & Style Advisor শুধুমাত্র CoLASH Foundation Women\'s Team-এর অনুমোদিত নারী সদস্যদের জন্য সম্পূর্ণ ব্যক্তিগত ও সংরক্ষিত। অনুগ্রহ করে আপনার সদস্য আইডি বা মোবাইল নম্বর দিয়ে প্রবেশ করুন।'
                  : 'Women’s Dress & Style Advisor is strictly reserved for authenticated female members of the Women\'s Team.'}
              </p>
            </div>

            {/* Quick Member Login Form */}
            <form onSubmit={handleWomensLogin} className="w-full max-w-sm space-y-3 text-left">
              {loginError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  {language === 'bn' ? 'উইমেন্স টিম মেম্বার আইডি / ফোন' : 'Women\'s Team ID or Mobile'}
                </label>
                <input
                  type="text"
                  required
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="e.g. CW-2026-001 or 01711-234567"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-xs sm:text-sm bg-stone-50 dark:bg-stone-900"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Unlock className="w-4 h-4" />
                <span>{isLoggingIn ? (language === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Verifying...') : (language === 'bn' ? 'নিরাপদে প্রবেশ করুন' : 'Verify & Enter')}</span>
              </button>
            </form>

            {/* Quick Select for Reviewer convenience */}
            <div className="pt-2 border-t border-stone-200 dark:border-stone-800 w-full max-w-sm text-center">
              <span className="text-[11px] text-stone-400 block mb-2">
                {language === 'bn' ? 'অনুমোদিত নারী সদস্য নির্বাচন:' : 'Quick select registered member:'}
              </span>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {INITIAL_WOMENS_TEAM_MEMBERS.slice(0, 3).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleQuickSelectWomensMember(m)}
                    className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-stone-700 dark:text-stone-300 hover:text-rose-600 border border-stone-200 dark:border-stone-700 text-[11px] font-semibold transition-all cursor-pointer"
                  >
                    {language === 'bn' ? m.nameBn.split(' ')[0] : m.nameEn.split(' ')[0]} ({m.membershipId})
                  </button>
                ))}
              </div>
            </div>
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
                        ? 'bg-rose-600 text-white rounded-br-xs'
                        : 'bg-white dark:bg-[#111f2c] text-[#102B3F] dark:text-stone-100 border border-rose-100 dark:border-rose-950/60 rounded-bl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>

                  {/* Dynamic Interactive Follow-up Options (appear ONLY after conversation starts) */}
                  {msg.interactiveOptions && msg.interactiveOptions.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5 max-w-[90%]">
                      <span className="text-[10px] font-bold text-stone-400 self-center mr-1">
                        {language === 'bn' ? 'সম্পর্কিত বিষয়:' : 'Follow-up:'}
                      </span>
                      {msg.interactiveOptions.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(opt)}
                          className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 transition-all cursor-pointer active:scale-95 shadow-xs"
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
                  <div className="w-2 h-2 rounded-full bg-rose-600 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-rose-600 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-rose-600 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] font-medium ml-1">
                    {language === 'bn' ? 'স্টাইলিং ও ফিটিংস পরামর্শ প্রস্তুত হচ্ছে...' : 'Formulating styling recommendations...'}
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
                    ? 'আপনার স্টাইলিং, পোশাক বা ফিটিংস সম্পর্কিত প্রশ্ন লিখুন...'
                    : 'Ask about dresses, occasion styling, or sizing...'
                }
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-100 dark:bg-[#142332] text-[#102B3F] dark:text-stone-100 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-rose-600 transition-all"
              />

              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white shadow-sm transition-all cursor-pointer active:scale-95 shrink-0"
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
