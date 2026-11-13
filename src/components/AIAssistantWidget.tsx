import React, { useState, useRef, useEffect } from 'react';
import {
  Headset,
  X,
  Send,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Compass,
  HeartHandshake,
  Users,
  FileText,
  MapPin,
  ChevronDown
} from 'lucide-react';
import { Language, AIKnowledgeItem, AIChatMessage } from '../types';

interface AIAssistantWidgetProps {
  language: Language;
  knowledgeBase: AIKnowledgeItem[];
  onNavigateSection: (sectionId: string) => void;
  onOpenDonate: () => void;
  onOpenVolunteer: () => void;
  onOpenPortal: () => void;
  onOpenWomensTeam: () => void;
}

export const AIAssistantWidget: React.FC<AIAssistantWidgetProps> = ({
  language,
  knowledgeBase,
  onNavigateSection,
  onOpenDonate,
  onOpenVolunteer,
  onOpenPortal,
  onOpenWomensTeam,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: language === 'bn'
        ? 'আসসালামু আলাইকুম! CoLASH Foundation সহায়তা ডেস্কে (Help Desk) আপনাকে স্বাগতম। অনুদান, সদস্যপদ, প্রকল্প বা যেকোনো বিষয়ে প্রশ্ন করতে পারেন।'
        : 'Welcome to CoLASH Foundation Help Desk. How can we assist you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Helper to dynamically suggest interactive options only after the user starts a conversation
  const generateFollowups = (q: string, lang: Language): string[] => {
    const lower = q.toLowerCase();
    if (lang === 'bn') {
      if (lower.includes('দান') || lower.includes('টাকা') || lower.includes('বিকাশ') || lower.includes('ফান্ড')) {
        return ['বিকাশ ও নগদ অনুদান নম্বর', 'রশিদ ও ট্যাক্স ছাড়ের সনদ', 'চলমান প্রকল্প সহায়তা'];
      }
      if (lower.includes('সদস্য') || lower.includes('কমিটি') || lower.includes('মেম্বার')) {
        return ['সদস্য পদের যোগ্যতা ও ফি', 'অনলাইন সদস্য আবেদন ফরম', 'কার্যনির্বাহী কমিটি তালিকা'];
      }
      if (lower.includes('উইমেন্স') || lower.includes('নারী') || lower.includes('টিম')) {
        return ['উইমেন্স টিমের লক্ষ্য ও কার্যক্রম', 'উইমেন্স টিমের সদস্য নিবন্ধন', 'উইমেন্স ড্রেস অ্যান্ড স্টাইল অ্যাডভাইজর'];
      }
      if (lower.includes('প্রকল্প') || lower.includes('কার্যক্রম') || lower.includes('রিলিফ') || lower.includes('বন্যা')) {
        return ['চলমান ৫টি মানবিক প্রকল্প', 'ভবিষ্যৎ কর্মপরিকল্পনা', 'স্বেচ্ছাসেবক হিসেবে যোগদান'];
      }
      return ['অনুদানের বিকাশ ও নগদ নম্বর', 'চলমান ৫টি মানবিক প্রকল্প', 'স্বেচ্ছাসেবক আবেদন ফরম'];
    } else {
      if (lower.includes('donat') || lower.includes('fund') || lower.includes('bkash')) {
        return ['bKash & Nagad donation numbers', 'Donation receipt & certificate', 'Support active projects'];
      }
      if (lower.includes('member') || lower.includes('committee')) {
        return ['Membership criteria & fees', 'Online member application', 'Executive committee list'];
      }
      if (lower.includes('women') || lower.includes('wing')) {
        return ['Women\'s Team objectives', 'Women\'s Team membership', 'Women\'s Style Advisor'];
      }
      return ['How to donate via bKash/Nagad', 'Ongoing humanitarian projects', 'Volunteer application form'];
    }
  };

  // Action link click handler
  const handleActionClick = (target: string) => {
    if (target === 'donate-modal') {
      onOpenDonate();
    } else if (target === 'volunteer-modal') {
      onOpenVolunteer();
    } else if (target === 'member-portal') {
      onOpenPortal();
    } else if (target === '#womens-team' || target === 'womens-team') {
      onOpenWomensTeam();
    } else if (target.startsWith('#')) {
      onNavigateSection(target.replace('#', ''));
    }
  };

  // Send message with live SSE streaming for near-instant first-token response
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: AIChatMessage = {
      id: `msg-u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const assistantMsgId = `msg-a-${Date.now() + 1}`;
    const followups = generateFollowups(query, language);
    const extractedLinks = extractLinksFromQuery(query);

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Send only compact KB summary fields to keep payload small and fast
    const compactKnowledge = knowledgeBase.map((k) => ({
      titleBn: k.titleBn,
      titleEn: k.titleEn,
      contentBn: k.contentBn,
      contentEn: k.contentEn,
      category: k.category,
      targetSection: k.targetSection,
      linkTextBn: k.linkTextBn,
      linkTextEn: k.linkTextEn,
      keywords: k.keywords,
    }));

    const controller = new AbortController();
    const abortTimer = window.setTimeout(() => controller.abort(), 12000);

    try {
      const res = await fetch('/api/ai/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: query,
          language,
          knowledgeBase: compactKnowledge,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Stream unavailable (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedText = '';
      let streamLinks: any[] | undefined;
      let bubbleCreated = false;

      const upsertAssistantBubble = (text: string, done: boolean, links?: any[]) => {
        if (!bubbleCreated) {
          bubbleCreated = true;
          setIsLoading(false);
          setMessages((prev) => [
            ...prev,
            {
              id: assistantMsgId,
              sender: 'assistant',
              text,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              links: done ? (links && links.length > 0 ? links : extractedLinks) : undefined,
              interactiveOptions: done ? followups : undefined,
            },
          ]);
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? {
                    ...m,
                    text,
                    links: done ? (links && links.length > 0 ? links : extractedLinks) : m.links,
                    interactiveOptions: done ? followups : m.interactiveOptions,
                  }
                : m
            )
          );
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const block of lines) {
          const dataLine = block
            .split('\n')
            .find((l) => l.startsWith('data: '));
          if (!dataLine) continue;

          try {
            const evt = JSON.parse(dataLine.slice(6));
            if (evt.type === 'chunk' && evt.text) {
              accumulatedText += evt.text;
              upsertAssistantBubble(accumulatedText, false);
            } else if (evt.type === 'done') {
              if (Array.isArray(evt.links)) streamLinks = evt.links;
              upsertAssistantBubble(
                accumulatedText || (language === 'bn' ? 'তথ্য পাওয়া গেছে।' : 'Information retrieved.'),
                true,
                streamLinks
              );
            }
          } catch {
            // ignore malformed SSE packet
          }
        }
      }

      if (accumulatedText && !bubbleCreated) {
        upsertAssistantBubble(accumulatedText, true, streamLinks);
      } else if (!accumulatedText) {
        const fallbackResponse = generateLocalResponse(query, knowledgeBase, language);
        setMessages((prev) => [...prev, fallbackResponse]);
      } else {
        upsertAssistantBubble(accumulatedText, true, streamLinks);
      }
    } catch (error) {
      console.warn('Stream chat fallback to fast in-browser matching:', error);
      const fallbackResponse = generateLocalResponse(query, knowledgeBase, language);
      setMessages((prev) => {
        const hasBubble = prev.some((m) => m.id === assistantMsgId);
        return hasBubble
          ? prev.map((m) => (m.id === assistantMsgId ? fallbackResponse : m))
          : [...prev, fallbackResponse];
      });
    } finally {
      window.clearTimeout(abortTimer);
      setIsLoading(false);
    }
  };

  // Local matching generator if backend route is unreachable
  const generateLocalResponse = (
    query: string,
    kb: AIKnowledgeItem[],
    lang: Language
  ): AIChatMessage => {
    const q = query.toLowerCase();
    let best: AIKnowledgeItem | null = null;
    let max = 0;

    for (const item of kb) {
      let score = 0;
      item.keywords?.forEach((k) => {
        if (q.includes(k.toLowerCase())) score += 3;
      });
      if (item.titleBn && q.includes(item.titleBn.toLowerCase())) score += 4;
      if (item.titleEn && q.includes(item.titleEn.toLowerCase())) score += 4;
      if (score > max) {
        max = score;
        best = item;
      }
    }

    const followups = generateFollowups(query, lang);

    if (best && max > 0) {
      return {
        id: `msg-a-${Date.now()}`,
        sender: 'assistant',
        text: lang === 'bn' ? best.contentBn : best.contentEn,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        links: best.targetSection ? [
          {
            title: lang === 'bn' ? (best.linkTextBn || 'পেজে সরাসরি যান') : (best.linkTextEn || 'Go to Page Section'),
            target: best.targetSection,
          },
        ] : [],
        interactiveOptions: followups,
      };
    }

    return {
      id: `msg-a-${Date.now()}`,
      sender: 'assistant',
      text: lang === 'bn'
        ? 'CoLASH Foundation মানবতার সেবায় কাজ করে। আমাদের অনুদান নম্বর বিকাশ/নগদ: 01646-475348। চলমান ৫টি প্রকল্পের বিস্তারিত নিচের লিংকে গিয়ে দেখতে পারেন।'
        : 'CoLASH Foundation is dedicated to humanitarian service. You can donate via bKash/Nagad at 01646-475348. Check our ongoing projects below.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      links: [
        { title: lang === 'bn' ? 'চলমান প্রকল্পসমূহ' : 'View Projects', target: '#projects' },
        { title: lang === 'bn' ? 'অনুদানের ফর্ম' : 'Donation Form', target: 'donate-modal' },
      ],
      interactiveOptions: followups,
    };
  };

  const extractLinksFromQuery = (q: string) => {
    const lower = q.toLowerCase();
    const links: any[] = [];
    if (lower.includes('দান') || lower.includes('donate') || lower.includes('টাকা') || lower.includes('বিকাশ')) {
      links.push({ title: language === 'bn' ? 'অনুদান দিন' : 'Donate Now', target: 'donate-modal' });
    }
    if (lower.includes('প্রকল্প') || lower.includes('project')) {
      links.push({ title: language === 'bn' ? 'প্রকল্পসমূহ দেখুন' : 'Explore Projects', target: '#projects' });
    }
    if (lower.includes('উইমেন্স') || lower.includes('women') || lower.includes('নারী')) {
      links.push({ title: language === 'bn' ? 'উইমেন্স টিম সেকশন' : 'Women\'s Team Wing', target: '#womens-team' });
    }
    if (lower.includes('স্বেচ্ছাসেবক') || lower.includes('volunteer')) {
      links.push({ title: language === 'bn' ? 'স্বেচ্ছাসেবক আবেদন' : 'Volunteer Application', target: 'volunteer-modal' });
    }
    if (lower.includes('ঠিকানা') || lower.includes('ম্যাপ') || lower.includes('map') || lower.includes('location')) {
      links.push({ title: language === 'bn' ? 'গুগল ম্যাপে লোকেশন' : 'Google Map Location', target: '#location-map' });
    }
    return links;
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'msg-welcome-new',
        sender: 'assistant',
        text: language === 'bn'
          ? 'কথোপকথন পরিষ্কার করা হয়েছে। CoLASH Foundation সহায়তা ডেস্কে যেকোনো তথ্য জানতে প্রশ্ন করুন।'
          : 'Conversation cleared. How may CoLASH Help Desk assist you today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="no-print fixed bottom-6 right-6 z-40">
        {!isOpen && (
          <button
            onClick={() => {
              setIsOpen(true);
              setTimeout(() => inputRef.current?.focus(), 150);
            }}
            aria-label="Open CoLASH Help Desk"
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#167D78] via-[#126864] to-[#102B3F] text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer border border-emerald-400/30"
          >
            {/* Pulsing ring indicator */}
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
            </span>

            <div className="flex items-center gap-1.5 font-bold text-sm tracking-wide">
              <Headset className="w-5 h-5 text-emerald-200 group-hover:rotate-12 transition-transform duration-300" />
              <span>{language === 'bn' ? 'সহায়তা ডেস্ক' : 'Help Desk'}</span>
            </div>

            <span className="hidden sm:inline-block text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-medium">
              24/7
            </span>
          </button>
        )}
      </div>

      {/* CoLASH Help Desk Chat Drawer / Window */}
      {isOpen && (
        <div className="no-print fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[95vw] sm:w-[420px] max-w-[420px] h-[580px] max-h-[85vh] flex flex-col bg-white dark:bg-[#0c1824] rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="px-4 py-3.5 bg-[#102B3F] text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#167D78] flex items-center justify-center text-white shadow-inner">
                <Headset className="w-4 h-4 text-emerald-200" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm leading-none">
                    {language === 'bn' ? 'CoLASH সহায়তা ডেস্ক' : 'CoLASH Help Desk'}
                  </h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.2 rounded font-semibold">
                    {language === 'bn' ? 'লাইভ' : '24/7'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-300 mt-0.5">
                  {language === 'bn' ? '২৪/৭ সদস্য ও নাগরিক সহায়তা কেন্দ্র' : '24/7 Member & Citizen Support Center'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title={language === 'bn' ? 'চ্যাট পরিষ্কার করুন' : 'Clear chat'}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title={language === 'bn' ? 'বন্ধ করুন' : 'Close'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/60 dark:bg-[#09121b]/60">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-[#167D78] text-white rounded-br-xs'
                      : 'bg-white dark:bg-[#111f2c] text-[#102B3F] dark:text-stone-100 border border-stone-200 dark:border-stone-800 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>

                {/* Direct Action Links (if provided by AI response) */}
                {msg.links && msg.links.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5 max-w-[90%]">
                    {msg.links.map((link, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleActionClick(link.target)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-[#167D78] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        <span>{link.title}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Interactive Question / Topic Follow-ups (Generated only after conversation starts) */}
                {msg.interactiveOptions && msg.interactiveOptions.length > 0 && (
                  <div className="mt-2.5 space-y-1.5 max-w-[95%]">
                    <p className="text-[10px] uppercase font-bold text-stone-500 dark:text-stone-400 tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#167D78]" />
                      <span>{language === 'bn' ? 'সম্পর্কিত প্রশ্নসমূহ:' : 'Follow-up questions:'}</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.interactiveOptions.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => handleSendMessage(opt)}
                          disabled={isLoading}
                          className="text-left text-xs px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-[#102B3F] dark:text-stone-200 hover:text-[#167D78] dark:hover:text-emerald-300 border border-stone-200 dark:border-stone-700 hover:border-emerald-300 transition-all cursor-pointer shadow-2xs active:scale-95"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <span className="text-[10px] text-stone-400 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 p-2">
                <div className="w-2 h-2 rounded-full bg-[#167D78] animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#167D78] animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-[#167D78] animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] font-medium ml-1">
                  {language === 'bn' ? 'সহায়তা ডেস্ক উত্তর প্রস্তুত করছে...' : 'Help Desk is preparing your response...'}
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>


          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white dark:bg-[#0c1824] border-t border-stone-200 dark:border-stone-800 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                language === 'bn'
                  ? 'সহায়তা ডেস্কে আপনার যেকোনো প্রশ্ন লিখুন...'
                  : 'Ask CoLASH Help Desk anything...'
              }
              className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-100 dark:bg-[#142332] text-[#102B3F] dark:text-stone-100 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-[#167D78] transition-all"
            />

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 rounded-xl bg-[#167D78] hover:bg-[#126864] disabled:opacity-40 disabled:hover:bg-[#167D78] text-white shadow-sm transition-all cursor-pointer active:scale-95 shrink-0"
              title={language === 'bn' ? 'বার্তা পাঠান' : 'Send message'}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
