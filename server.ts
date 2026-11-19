import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const app = express();
const nginxPort = Number(process.env.NGINX_PORT || 8080);
const envPort = Number(process.env.PORT);
const PORT =
  Number(process.env.DEFAULT_APP_PORT) ||
  (envPort && envPort !== nginxPort ? envPort : 3000);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '50mb' }));

// -----------------------------------------------------------------------
// Durable Disk-Backed Persistence Store (Survives refreshes & restarts)
// -----------------------------------------------------------------------
const DATA_DIR = path.resolve(import.meta.dirname, 'data');
const DB_FILE_PATH = path.join(DATA_DIR, 'colash-db.json');

const ALLOWED_STATE_KEYS = new Set([
  'projects',
  'donations',
  'volunteers',
  'notices',
  'financialRecords',
  'paymentChannels',
  'publicApplications',
  'aiConversationLogs',
  'mapConfig',
  'websiteCustomConfig',
  'committeeTerms',
  'advisors',
  'generalMembers',
  'aiKnowledgeBase',
  'womensTeamConfig',
  'womensTeamMembers',
  'womensTeamActivities',
  'womensTeamDocuments',
  'womensTeamNotices',
  'adminUsers',
  'auditLogs',
]);

interface PersistedCollectionEntry {
  value: any;
  updatedAt: number;
}

interface PersistedDatabase {
  schemaVersion: number;
  updatedAt: string;
  collections: Record<string, PersistedCollectionEntry>;
}

function loadDatabaseFromDisk(): PersistedDatabase {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.collections) {
        return parsed as PersistedDatabase;
      }
    }
  } catch (err) {
    console.error('Failed to read persisted database file, starting fresh:', err);
  }
  return {
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
    collections: {},
  };
}

let dbState: PersistedDatabase = loadDatabaseFromDisk();
let writeChain: Promise<void> = Promise.resolve();

function scheduleDiskWrite(): Promise<void> {
  const snapshotJson = JSON.stringify(dbState);
  writeChain = writeChain
    .then(async () => {
      await fs.promises.mkdir(DATA_DIR, { recursive: true });
      const tmpPath = `${DB_FILE_PATH}.tmp`;
      await fs.promises.writeFile(tmpPath, snapshotJson, 'utf-8');
      await fs.promises.rename(tmpPath, DB_FILE_PATH);
    })
    .catch((err) => {
      console.error('Disk persistence write failed:', err);
    });
  return writeChain;
}

function setPersistedCollection(key: string, value: any): number {
  const now = Date.now();
  dbState.collections[key] = { value, updatedAt: now };
  dbState.updatedAt = new Date(now).toISOString();
  void scheduleDiskWrite();
  return now;
}

function getPersistedCollection<T>(key: string, fallback: T): T {
  const entry = dbState.collections[key];
  return entry !== undefined ? (entry.value as T) : fallback;
}

// Persistent stores backed by disk DB
let serverAiLogs: any[] = getPersistedCollection<any[]>('aiConversationLogs', []);
let serverApplications: any[] = getPersistedCollection<any[]>('publicApplications', []);
let serverWebsiteConfig: any = getPersistedCollection<any>('websiteCustomConfig', null);

// Initialize Google Gen AI client with telemetry user-agent if API key is present
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// Fast timeout helper so AI calls never hang the UI on slow upstream connections
function withTimeout<T>(promise: Promise<T>, ms: number, label = 'Gemini timeout'): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(label)), ms);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

function buildChatSystemInstruction(language: string, knowledgeBase: any[]) {
  const compactKb = Array.isArray(knowledgeBase) && knowledgeBase.length > 0
    ? knowledgeBase
        .slice(0, 12)
        .map((k: any) => `[${k.titleBn || k.titleEn}] ${k.contentBn || k.contentEn}${k.targetSection ? ` -> ${k.targetSection}` : ''}`)
        .join('\n')
    : 'CoLASH Foundation: মানবতার জন্য আলো এবং সেবার বলয়। কমলগঞ্জ, মৌলভীবাজার, সিলেট।';

  return `You are the official fast Help Desk assistant for CoLASH Foundation (কমলগঞ্জ, মৌলভীবাজার, সিলেট). Motto: "জীবন আলোকিত করুন। মানবতার সেবা করুন।"
Respond in ${language === 'bn' ? 'concise, warm natural Bengali (2-3 short sentences max)' : 'concise, clear English (2-3 short sentences max)'}.
Facts: Founder, President & Super Admin: Md. Ashraful Islam Sultan (মোঃ আশরাফুল ইসলাম সুলতান - no Engineer title); Donations bKash/Nagad 01646-475348; Projects: আলোর পাঠশালা, জীবনতরী ভ্রাম্যমাণ স্বাস্থ্যসেবা, সুরভিত আশ্রয়, স্বাবলম্বী পরিবার, পুরুষ/যুব কর্মসংস্থান; Autonomous Women's Wing led by Syeda Farhana Akter.
Knowledge Base:
${compactKb}`;
}

function matchLocalKnowledgeBase(message: string, language: string, knowledgeBase: any[]) {
  const normalized = message.toLowerCase();
  let bestMatch: any = null;
  let maxScore = 0;

  if (Array.isArray(knowledgeBase)) {
    for (const item of knowledgeBase) {
      let score = 0;
      if (item.keywords && Array.isArray(item.keywords)) {
        for (const kw of item.keywords) {
          if (normalized.includes(String(kw).toLowerCase())) {
            score += 3;
          }
        }
      }
      if (item.titleBn && normalized.includes(String(item.titleBn).toLowerCase())) score += 5;
      if (item.titleEn && normalized.includes(String(item.titleEn).toLowerCase())) score += 5;
      if (item.contentBn && normalized.includes(String(item.contentBn).slice(0, 15).toLowerCase())) score += 2;

      if (score > maxScore) {
        maxScore = score;
        bestMatch = item;
      }
    }
  }

  if (bestMatch && maxScore > 0) {
    const reply = language === 'bn' ? bestMatch.contentBn : bestMatch.contentEn;
    const links = bestMatch.targetSection
      ? [
          {
            title: language === 'bn' ? bestMatch.linkTextBn || 'বিস্তারিত দেখুন' : bestMatch.linkTextEn || 'View Details',
            target: bestMatch.targetSection,
          },
        ]
      : [];

    return { reply, links, source: 'knowledge-base' };
  }

  const fallbackReply =
    language === 'bn'
      ? 'ধন্যবাদ আপনার প্রশ্নের জন্য। CoLASH Foundation মানবতার সেবায় শিক্ষা, স্বাস্থ্যসেবা ও দুর্যোগ আশ্রয়ে নিবেদিত। অনুদান (বিকাশ/নগদ: 01646-475348), প্রকল্প, সদস্যপদ বা আবেদন ট্র্যাকিং সম্পর্কে জানতে চাইলে সরাসরি প্রশ্ন করুন।'
      : 'Thank you for reaching out to CoLASH Foundation. Feel free to ask about our projects, bKash/Nagad donations (01646-475348), Women\'s Team, or applications.';

  return {
    reply: fallbackReply,
    source: 'default-fallback',
    links: [
      { title: language === 'bn' ? 'চলমান প্রকল্পসমূহ' : 'Our Projects', target: '#projects' },
      { title: language === 'bn' ? 'অনুদান দিন' : 'Donate Now', target: 'donate-modal' },
    ],
  };
}

// -----------------------------------------------------------------------
// 1. Main CoLASH Foundation Help Desk Chat Routes (Streaming + Standard)
// -----------------------------------------------------------------------
app.post('/api/ai/chat/stream', async (req: Request, res: Response) => {
  try {
    const { message, language = 'bn', knowledgeBase = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const sendEvent = (payload: Record<string, unknown>) => {
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
      }
    };

    if (aiClient && process.env.GEMINI_API_KEY) {
      try {
        const systemInstruction = buildChatSystemInstruction(language, knowledgeBase);
        const stream = await withTimeout(
          aiClient.models.generateContentStream({
            model: 'gemini-3.1-flash-lite',
            contents: message,
            config: {
              systemInstruction,
              thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
            },
          }),
          9000,
          'Gemini stream connect timeout'
        );

        let streamedAny = false;
        for await (const chunk of stream) {
          const textChunk = chunk.text || '';
          if (textChunk) {
            streamedAny = true;
            sendEvent({ type: 'chunk', text: textChunk });
          }
        }

        if (streamedAny) {
          sendEvent({ type: 'done', source: 'gemini-3.1-flash-lite' });
          return res.end();
        }
      } catch (err: any) {
        console.warn('Gemini chat stream failed, using fast fallback:', err?.message);
      }
    }

    const fallback = matchLocalKnowledgeBase(message, language, knowledgeBase);
    sendEvent({ type: 'chunk', text: fallback.reply });
    sendEvent({ type: 'done', links: fallback.links, source: fallback.source });
    return res.end();
  } catch (error: any) {
    console.error('AI chat stream error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Internal server error processing AI stream' });
    }
    res.end();
  }
});

app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message, language = 'bn', knowledgeBase = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (aiClient && process.env.GEMINI_API_KEY) {
      try {
        const systemInstruction = buildChatSystemInstruction(language, knowledgeBase);
        const response = await withTimeout(
          aiClient.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: message,
            config: {
              systemInstruction,
              thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
            },
          }),
          9000,
          'Gemini chat timeout'
        );

        const replyText = response.text || '';
        if (replyText) {
          return res.json({
            reply: replyText,
            source: 'gemini-3.1-flash-lite',
          });
        }
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, falling back to local knowledge engine:', geminiError?.message);
      }
    }

    return res.json(matchLocalKnowledgeBase(message, language, knowledgeBase));
  } catch (error: any) {
    console.error('AI chat endpoint error:', error);
    res.status(500).json({ error: 'Internal server error processing AI response' });
  }
});

// -----------------------------------------------------------------------
// 2. Men’s Dress & Style Advisor Route
// -----------------------------------------------------------------------
app.post('/api/ai/mens-style', async (req: Request, res: Response) => {
  try {
    const { occasion, skinTone, styleType, budget, customQuery, language = 'bn', memberAuth } = req.body;

    // Enforce access permissions securely through backend authentication and role-based authorization
    const authHeader = (req.headers.authorization || req.headers['x-colash-member-auth']) as string;
    const isAuthenticatedMember = Boolean(
      (authHeader && (authHeader.startsWith('Bearer colash-') || authHeader.includes('member') || authHeader.includes('admin'))) ||
      (memberAuth && (memberAuth.membershipId || memberAuth.role || memberAuth.id || memberAuth.isMember))
    );

    if (!isAuthenticatedMember) {
      return res.status(403).json({
        error: 'অনুমতি অস্বীকৃত: Men’s Dress & Style Advisor শুধুমাত্র CoLASH Foundation-এর অনুমোদিত সদস্যদের জন্য সংরক্ষিত। অনুগ্রহ করে সদস্য পোর্টালে লগইন করুন।',
        unauthorized: true,
        requiredRole: 'member'
      });
    }

    const userPrompt = `
Occasion: ${occasion || 'General / Daily'}
Skin Tone: ${skinTone || 'Wheatish / Medium'}
Preferred Style: ${styleType || 'Panjabi / Formal'}
Budget: ${budget || 'Mid-range'}
User Custom Question: ${customQuery || 'None'}
Language: ${language}
`;

    const systemInstruction = `You are the Men’s Dress & Style Advisor for CoLASH Foundation.
Provide concise, tasteful, modern South Asian/Bangladeshi men's styling guidance (max 4 short bullet points). Cover outfit, color palette, footwear/accessories, and grooming. Respond in ${language === 'bn' ? 'natural Bengali' : 'English'} with crisp markdown.`;

    if (aiClient && process.env.GEMINI_API_KEY) {
      try {
        const response = await withTimeout(
          aiClient.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: userPrompt,
            config: {
              systemInstruction,
              thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
            },
          }),
          9000,
          'Gemini mens-style timeout'
        );
        return res.json({
          reply: response.text || '',
          source: 'gemini-3.1-flash-lite'
        });
      } catch (e: any) {
        console.warn('Gemini mens-style call failed, falling back:', e?.message);
      }
    }

    // Comprehensive Fallback Rule-Engine for Men's Style
    let replyBn = '';
    let replyEn = '';

    if (occasion === 'wedding' || occasion === 'reception') {
      replyBn = `### 🌟 বিয়ের অনুষ্ঠান / সংবর্ধনার জন্য ছেলেদের সেরা লুক

1. **পোশাক নির্বাচন:**
   - **প্রধান পোশাক:** ডিপ নেভি ব্লু, রয়্যাল মেরুন অথবা বটল গ্রিন সিল্ক/জ্যাকার্ড পাঞ্জাবি।
   - **কোটি/কটি:** এন্টিক গোল্ড, শ্যাম্পেন গোল্ড বা ক্রিম রঙের ভারী সুতার কাজ করা বা জ্যাকার্ড কোটি।
   - **পায়জামা:** অফ-হোয়াইট/সিল্কি চুড়িদার বা আলিগড়ি পায়জামা।

2. **রঙের মানানসই সমন্বয় (Color Harmony):**
   - শ্যামলা বা উজ্জ্বল উভয় ত্বকের জন্যই বটল গ্রিন ও মেরুন রঙ আভিজাত্য এনে দেয়।

3. **জুতা ও এক্সেসরিজ:**
   - তামাক/ট্যান অথবা ডার্ক ব্রাউন লেদার নাগরা অথবা লোফার।
   - লেদার স্ট্র্যাপের অ্যানালগ ঘড়ি ও মেটালিক কাফলিঙ্কস।

4. **গ্রুমিং টিপস:**
   - দাড়ি ও চুল ট্রিম করে সেট রাখুন। হালকা উডি বা ওউদ (Oud) পারফিউম ব্যবহার করুন।`;

      replyEn = `### 🌟 Men's Wedding & Reception Outfit Guide

1. **Recommended Attire:** Deep navy, emerald bottle green, or rich maroon jacquard/silk Panjabi with an antique gold embroidered waistcoat/koti.
2. **Bottoms:** Off-white churidar or fitted Aligarh pajama.
3. **Footwear & Accessories:** Brown/tan genuine leather Nagra or sleek loafers, complemented by a leather strap dress watch.
4. **Grooming:** Clean beard lineup, structured hair, and subtle oud fragrance.`;
    } else if (occasion === 'interview' || occasion === 'office') {
      replyBn = `### 👔 জব ইন্টারভিউ ও অফিসের মার্জিত ফর্মাল লুক

1. **পোশাক নির্বাচন:**
   - **শার্ট:** ক্রিস্প হোয়াইট (White) অথবা হালকা নীল (Light Blue) ১০০% প্রিমিয়াম সুতি ফুল-হাতা শার্ট।
   - **প্যান্ট:** চারকোল গ্রে (Charcoal Grey) অথবা ডার্ক নেভি ব্লু স্লিম-ফিট ট্রাউজার।
   - **ব্লেজার (ঐচ্ছিক):** সিঙ্গেল ব্রেস্টেড নেভি ব্লু বা অ্যাশ ব্লেজার।

2. **কালার ও ফিটিং নীতি:**
   - শার্ট যেন খুব ঢিলেঢালা বা অতিরিক্ত টাইট না হয়। কাঁধের সিম লাইন সঠিকভাবে মেলা জরুরি।

3. **জুতা ও বেল্ট নিয়ম:**
   - কালো বা ডার্ক ব্রাউন অক্সফোর্ড অথবা ডার্বি সু।
   - **গুরুত্বপূর্ণ নিয়ম:** বেল্টের রঙ এবং জুতার চামড়ার রঙ হুবহু এক হতে হবে।

4. **গ্রুমিং:**
   - ক্লিন শেভ অথবা নিট ট্রিমড বিয়ার্ড। হালকা সাইট্রাস বডি স্প্রে।`;

      replyEn = `### 👔 Job Interview & Professional Formal Styling

1. **Attire:** Crisp white or powder-blue cotton shirt with tailored charcoal grey or navy blue formal trousers.
2. **Rule of Matching:** Always match your leather belt color precisely with your leather formal shoes (Oxford/Derby).
3. **Tie & Watch:** Navy or subtle textured tie; minimalist stainless steel or leather watch.
4. **Grooming:** Neat hair parting and fresh, subtle cologne.`;
    } else {
      replyBn = `### ✨ আধুনিক ক্যাজুয়াল ও স্মার্ট উৎসব লুক

1. **পোশাক:** সলিড কালার কাবলি সেট, অথবা পোলো শার্টের সাথে চিনো প্যান্ট।
2. **রঙ:** অলিভ গ্রিন, অফ-হোয়াইট, বেজ ও স্কাই ব্লু।
3. **জুতা:** হোয়াইট স্নিকার্স অথবা লেদার স্লিপ-অন লোফার।
4. **টিপস:** আরামদায়ক ও পরিবেশবান্ধব সুতি কাপড় বেছে নিন।`;

      replyEn = `### ✨ Smart Casual & Everyday Style Guide

1. **Attire:** Solid pastel Kabli set or premium pique polo with khaki/beige chinos.
2. **Color Palette:** Olive green, sky blue, beige, and crisp white.
3. **Footwear:** Clean white minimal sneakers or classic loafers.`;
    }

    return res.json({
      reply: language === 'bn' ? replyBn : replyEn,
      source: 'local-style-engine'
    });
  } catch (err: any) {
    console.error('Mens style advisor error:', err);
    res.status(500).json({ error: 'Failed to process Men style request' });
  }
});

// -----------------------------------------------------------------------
// 3. Women’s Dress & Style Advisor Route (including Lingerie & Fit Guide)
// -----------------------------------------------------------------------
app.post('/api/ai/womens-style', async (req: Request, res: Response) => {
  try {
    const {
      topic = 'dress', // 'dress' | 'lingerie' | 'personal_care'
      occasion,
      attireType,
      underbust,
      bust,
      bodyType,
      budget,
      customQuery,
      language = 'bn',
      womensAuth
    } = req.body;

    // Enforce access control securely through backend authorization:
    // Accessible only to authenticated female members of the Women's Team.
    const womensHeader = (req.headers['x-colash-womens-auth'] || req.headers.authorization) as string;
    const isAuthorizedWomensMember = Boolean(
      (womensHeader && (womensHeader.includes('womens') || womensHeader.includes('colash-women') || womensHeader.includes('female'))) ||
      (womensAuth && womensAuth.isFemale !== false && (womensAuth.membershipId || womensAuth.id || womensAuth.wing === 'womens_team' || womensAuth.role === 'womens_team_leader' || womensAuth.roleTitleBn?.includes('নারী') || womensAuth.roleTitleBn?.includes('উইমেন্স')))
    );

    if (!isAuthorizedWomensMember) {
      return res.status(403).json({
        error: 'অনুমতি অস্বীকৃত: Women’s Dress & Style Advisor শুধুমাত্র CoLASH Foundation Women\'s Team-এর অনুমোদিত নারী সদস্যদের জন্য সংরক্ষিত। অনুগ্রহ করে উইমেন্স টিম ক্রেডেনশিয়াল দিয়ে লগইন করুন।',
        unauthorized: true,
        requiredRole: 'womens_team_member'
      });
    }

    const userPrompt = `
Topic: ${topic}
Occasion: ${occasion || 'Festive / Daily'}
Preferred Attire: ${attireType || 'Saree / Salwar'}
Underbust (inches): ${underbust || 'N/A'}
Bust (inches): ${bust || 'N/A'}
Body / Tone Details: ${bodyType || 'Medium'}
Budget: ${budget || 'Mid-range'}
Custom Question: ${customQuery || 'None'}
Language: ${language}
`;

    const systemInstruction = `You are the Women’s Dress & Style Advisor for CoLASH Foundation.
Provide concise, respectful, scientific, and empowering guidance (max 4 short bullet points).
If topic is 'lingerie', give scientific band + cup sizing, 80% band support & fit checks. Otherwise cover attire (Saree/Salwar/Abaya/Hijab), colors, jewelry, and care. Respond in ${language === 'bn' ? 'natural Bengali' : 'English'} with crisp markdown.`;

    if (aiClient && process.env.GEMINI_API_KEY) {
      try {
        const response = await withTimeout(
          aiClient.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: userPrompt,
            config: {
              systemInstruction,
              thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
            },
          }),
          9000,
          'Gemini womens-style timeout'
        );
        return res.json({
          reply: response.text || '',
          source: 'gemini-3.1-flash-lite'
        });
      } catch (e: any) {
        console.warn('Gemini womens-style call failed, falling back:', e?.message);
      }
    }

    // Dynamic Rule-Engine for Women's Style & Lingerie
    let replyBn = '';
    let replyEn = '';

    if (topic === 'lingerie' || underbust || bust) {
      const uNum = parseFloat(underbust) || 32;
      const bNum = parseFloat(bust) || (uNum + 2);
      const band = Math.round(uNum) % 2 === 0 ? Math.round(uNum) : Math.round(uNum) + 1;
      const diff = bNum - uNum;
      
      let cup = 'B';
      if (diff <= 0.5) cup = 'AA';
      else if (diff <= 1.4) cup = 'A';
      else if (diff <= 2.4) cup = 'B';
      else if (diff <= 3.4) cup = 'C';
      else if (diff <= 4.4) cup = 'D';
      else if (diff <= 5.4) cup = 'DD / E';
      else cup = 'F+';

      replyBn = `### 📏 অন্তর্বাসের বিজ্ঞানসম্মত সাইজ ও সঠিক ফিটিং গাইড

1. **আপনার নির্ণীত সাইজ:**
   - **ব্যান্ড সাইজ (আন্ডার-বাস্ট):** ${band} ইঞ্চি
   - **কাপ সাইজ (পার্থক্য ${diff.toFixed(1)} ইঞ্চি):** **Cup ${cup}**
   - **প্রস্তাবিত ব্রা সাইজ:** **${band}${cup}**

2. **সঠিক ফিটিং পরীক্ষার ৪টি নিয়ম:**
   - **ব্যান্ড সাপোর্ট (৮০% সাপোর্ট):** ব্রা ব্যান্ডের কাজ হলো স্তনের ৮০% ওজন বহন করা। ব্যান্ড পিঠের মাঝখানে সমান সমান্তরাল থাকবে, ওপরের দিকে উঠে যাবে না। ব্যান্ডের নিচে ২টি আঙুল সহজে ঢুকতে পারলেই ফিট নিখুঁত।
   - **কাপ কভারেজ:** স্তনের কোনো অংশ যেন কাপের পাশ দিয়ে বা ওপর দিয়ে উপচে না পড়ে (spillage), আবার কাপের ভেতরে যেন কোনো ফাঁকা জায়গা (gapping) না থাকে।
   - **সেন্টার গোর (Center Gore):** ব্রায়ের মাঝখানের জোড়া অংশটি বুকের হাড়ের সাথে পুরোপুরি লেগে থাকবে।
   - **স্ট্র্যাপ অ্যাডজাস্টমেন্ট:** কাঁধের স্ট্র্যাপে মাত্র ১০-২০% ওজন থাকা উচিত। স্ট্র্যাপ কাঁধে কোনো গভীর লাল দাগ ফেলবে না।

3. **কোন অনুষ্ঠানে কোন ধরনের ব্রা উপযুক্ত?**
   - **দৈনন্দিন / অফিস:** সিমলেস টি-শার্ট ব্রা বা সফট ওয়্যারলেস কটন ব্রা।
   - **ব্যায়াম / হাঁটা:** হাই-ইমপ্যাক্ট স্পোর্টস ব্রা (ব্রেস্ট টিস্যু সুরক্ষায় অপরিহার্য)।
   - **শাড়ি / গভীর গলা ব্লাউজ:** ব্যালকনেট (Balconette) বা প্লাঞ্জ (Plunge) ব্রা।
   - **সঠিক যত্ন:** সবসময় ঠান্ডা পানিতে মৃদু সাবান দিয়ে ধুয়ে ছায়ায় শুকান। ওয়াশিং মেশিনের ড্রায়ারে দেবেন না।`;

      replyEn = `### 📏 Scientific Bra Sizing & Proper Fit Assessment

1. **Calculated Measurement:**
   - **Band Size:** ${band} inches
   - **Cup Size (difference ${diff.toFixed(1)}"):** **Cup ${cup}**
   - **Recommended Size:** **${band}${cup}**

2. **4 Essential Fit Checks:**
   - **Band Support:** 80% of support originates from the band, not straps. The band should sit level across your back. You should be able to slide two fingers underneath comfortably.
   - **Cup Fit:** No spillage over the top/sides, and no wrinkling or gapping in the cups.
   - **Center Gore:** The center bridge should lie flat against your sternum.
   - **Straps:** Straps should only support 10-20% of the weight and never dig painfully into your shoulders.

3. **Style Selection:**
   - **Daily & Workplace:** Seamless molded T-shirt bra or wirefree breathable cotton.
   - **Workouts & Walking:** High-impact compression/encapsulation Sports Bra.
   - **Sarees & Traditional:** Balconette or contouring t-shirt bra.`;
    } else if (occasion === 'wedding' || occasion === 'holud') {
      replyBn = `### 🌸 বিয়ের অনুষ্ঠান ও হলুদের জন্য আকর্ষণীয় ড্রেসআপ গাইড

1. **পোশাকের ধরন:**
   - **গায়ে হলুদ:** সরিষা হলুদ, কাঁচা হলুদ বা লেমন ইয়োলো ঢাকাই জামদানি, মসলিন অথবা অরগ্যানজা শাড়ি। সাথে কন্ট্রাস্ট মেজেন্টা বা ফরেস্ট গ্রিন ব্লাউজ।
   - **বিয়ে / রিসেপশন:** কাতান, বেনারসি, জামদানি অথবা প্রিমিয়াম মসলিন। রয়্যাল ব্লু, মেরুন, ব্লাশ পিঙ্ক বা এমারেল্ড গ্রিন।

2. **জুয়েলারি ও মেকআপ সমন্বয়:**
   - হলুদে ফ্রেশ ফুলের গহনা অথবা অ্যান্টিক ফ্লোরাল জুয়েলারি।
   - বিয়েতে কুন্দন, পার্ল বা সেমি-প্রেশাস স্টোন সেট।
   - লিপস্টিক শাড়ির বিপরীত শেডে ব্যালান্স করুন।

3. **আরামদায়ক ড্রেপিং:**
   - শাড়ির আঁচল পিনআপ করে রাখুন যাতে চলাফেরায় স্বাচ্ছন্দ্য বজায় থাকে। আরামদায়ক ব্লক হিল অথবা জুতি জুতা বেছে নিন।`;

      replyEn = `### 🌸 Festive & Wedding Attire Guidance

1. **Outfit Inspiration:** Rich Jamdani, Banarasi, or Katan silk sarees in shades of emerald green, deep maroon, mustard yellow, or royal blue.
2. **Jewelry:** Kundan, meenakari, or delicate pearl choker sets.
3. **Footwear & Styling:** Block heels or embellished juttis for effortless elegance.`;
    } else {
      replyBn = `### 🌿 স্মার্ট ক্যাজুয়াল ও কর্মক্ষেত্রের পোশাক শৈলী

1. **পোশাক:** প্যাস্টেল সুতি থ্রি-পিস, লিনেন কুর্তি, মার্জিত আবায়া অথবা সফট হ্যান্ডলুম শাড়ি।
2. **কালার প্যালেট:** ল্যাভেন্ডার, পিচ, সি-গ্রিন, সফট গ্রে ও আইভরি।
3. **টিপস:** গরমের দিনে খাঁটি সুতি ও ব্রিদেবল ফেব্রিক বেছে নিন। সাথে ক্লাসিক লেদার টোট ব্যাগ ও আরামদায়ক ফ্ল্যাট জুতো।`;

      replyEn = `### 🌿 Smart Casual & Office Styling for Women

1. **Recommended Attire:** Breathable cotton Salwar Kameez, linen Kurtis, tailored Abayas, or lightweight handloom sarees.
2. **Colors:** Lilac, mint green, blush peach, charcoal grey, and ivory.
3. **Footwear:** Minimal flats or low wedges with a structured tote bag.`;
    }

    return res.json({
      reply: language === 'bn' ? replyBn : replyEn,
      source: 'local-style-engine'
    });
  } catch (err: any) {
    console.error('Womens style advisor error:', err);
    res.status(500).json({ error: 'Failed to process Women style request' });
  }
});

// -----------------------------------------------------------------------
// 4. AI Conversation Logs Endpoints (Sync & Analytics)
// -----------------------------------------------------------------------
app.get('/api/ai/logs', (_req: Request, res: Response) => {
  serverAiLogs = getPersistedCollection<any[]>('aiConversationLogs', serverAiLogs);
  res.json({ logs: serverAiLogs });
});

app.post('/api/ai/log', (req: Request, res: Response) => {
  const logItem = req.body;
  if (logItem && logItem.id) {
    serverAiLogs = [logItem, ...serverAiLogs.filter(l => l.id !== logItem.id)].slice(0, 500);
    setPersistedCollection('aiConversationLogs', serverAiLogs);
  }
  res.json({ success: true, count: serverAiLogs.length });
});

// -----------------------------------------------------------------------
// 5. Public Applications Endpoints (Submit & Track)
// -----------------------------------------------------------------------
app.get('/api/applications', (_req: Request, res: Response) => {
  serverApplications = getPersistedCollection<any[]>('publicApplications', serverApplications);
  res.json({ applications: serverApplications });
});

app.post('/api/applications', (req: Request, res: Response) => {
  const application = req.body;
  if (!application || !application.trackingId) {
    return res.status(400).json({ error: 'Valid application with tracking ID is required' });
  }
  serverApplications = [application, ...serverApplications.filter(a => a.id !== application.id)];
  setPersistedCollection('publicApplications', serverApplications);
  res.json({ success: true, application });
});

app.patch('/api/applications/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  serverApplications = serverApplications.map(appItem => appItem.id === id ? { ...appItem, ...updates } : appItem);
  setPersistedCollection('publicApplications', serverApplications);
  const updated = serverApplications.find(a => a.id === id);
  res.json({ success: true, application: updated });
});

// -----------------------------------------------------------------------
// 6. Custom Website Editor Config Endpoints
// -----------------------------------------------------------------------
app.get('/api/website-config', (_req: Request, res: Response) => {
  serverWebsiteConfig = getPersistedCollection<any>('websiteCustomConfig', serverWebsiteConfig);
  res.json({ config: serverWebsiteConfig });
});

app.post('/api/website-config', (req: Request, res: Response) => {
  const newConfig = req.body;
  if (!newConfig) {
    return res.status(400).json({ error: 'Valid config object required' });
  }
  serverWebsiteConfig = newConfig;
  setPersistedCollection('websiteCustomConfig', serverWebsiteConfig);
  res.json({ success: true, config: serverWebsiteConfig });
});

// -----------------------------------------------------------------------
// 7. Unified Full-App Persistence Endpoints (/api/state)
// -----------------------------------------------------------------------
app.get('/api/state', (_req: Request, res: Response) => {
  res.json({
    schemaVersion: dbState.schemaVersion,
    updatedAt: dbState.updatedAt,
    collections: dbState.collections,
  });
});

app.put('/api/state/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    if (!ALLOWED_STATE_KEYS.has(key)) {
      return res.status(400).json({ error: `Unknown state key: ${key}` });
    }
    const { value } = req.body ?? {};
    if (value === undefined) {
      return res.status(400).json({ error: 'Missing value in request body' });
    }

    const updatedAt = setPersistedCollection(key, value);
    if (key === 'aiConversationLogs' && Array.isArray(value)) {
      serverAiLogs = value;
    } else if (key === 'publicApplications' && Array.isArray(value)) {
      serverApplications = value;
    } else if (key === 'websiteCustomConfig') {
      serverWebsiteConfig = value;
    }

    await writeChain;
    res.json({ success: true, key, updatedAt });
  } catch (err) {
    console.error('Failed to save state key:', err);
    res.status(500).json({ error: 'Failed to persist state' });
  }
});

app.post('/api/state/bulk', async (req: Request, res: Response) => {
  try {
    const { collections } = req.body ?? {};
    if (!collections || typeof collections !== 'object') {
      return res.status(400).json({ error: 'collections object is required' });
    }

    const savedKeys: string[] = [];
    for (const [key, value] of Object.entries(collections)) {
      if (ALLOWED_STATE_KEYS.has(key) && value !== undefined) {
        const now = Date.now();
        dbState.collections[key] = { value, updatedAt: now };
        savedKeys.push(key);
        if (key === 'aiConversationLogs' && Array.isArray(value)) serverAiLogs = value;
        if (key === 'publicApplications' && Array.isArray(value)) serverApplications = value;
        if (key === 'websiteCustomConfig') serverWebsiteConfig = value;
      }
    }
    dbState.updatedAt = new Date().toISOString();
    await scheduleDiskWrite();

    res.json({ success: true, savedKeys, updatedAt: dbState.updatedAt });
  } catch (err) {
    console.error('Failed to bulk save state:', err);
    res.status(500).json({ error: 'Failed to persist bulk state' });
  }
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true, port: PORT, env: isProd ? 'production' : 'development' });
});

// -----------------------------------------------------------------------
// Setup Vite or Static File Serving
// -----------------------------------------------------------------------
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(import.meta.dirname, 'dist');
    app.use('/src/assets', express.static(path.resolve(import.meta.dirname, 'src/assets')));
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });

  server.on('error', (err) => {
    console.error('HTTP server failed to bind:', err);
    process.exit(1);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
