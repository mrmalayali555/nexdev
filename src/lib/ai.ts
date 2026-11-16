'use client';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { TechNewsStory } from './types';

// Storage keys for user-configured key in the browser/APK
const STORAGE_KEY_AI_KEY = 'nexdev_ai_api_key';
const STORAGE_KEY_AI_PROVIDER = 'nexdev_ai_provider';
const STORAGE_KEY_NVIDIA_KEY = 'nexdev_nvidia_api_key';

export type AIProvider = 'gemini' | 'nvidia' | 'groq' | 'openai';

export interface ChatMessageTurn {
  role: 'user' | 'model' | 'assistant';
  text: string;
}

export function getAIApiKey(): string {
  if (typeof window === 'undefined') return '';
  const envKey =
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_AI_API_KEY ||
    process.env.NEXT_PUBLIC_OPENAI_API_KEY ||
    '';
  if (envKey) return envKey;

  try {
    return localStorage.getItem(STORAGE_KEY_AI_KEY) || '';
  } catch {
    return '';
  }
}

export function getNvidiaApiKey(): string {
  if (typeof window === 'undefined') return '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';
  const envKey = process.env.NEXT_PUBLIC_NVIDIA_API_KEY || '';
  if (envKey) return envKey;
  try {
    return localStorage.getItem(STORAGE_KEY_NVIDIA_KEY) || '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';
  } catch {
    return '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';
  }
}

export function saveAIApiKey(key: string, provider: AIProvider = 'gemini') {
  if (typeof window === 'undefined') return;
  try {
    if (provider === 'nvidia') {
      localStorage.setItem(STORAGE_KEY_NVIDIA_KEY, key.trim());
    } else {
      localStorage.setItem(STORAGE_KEY_AI_KEY, key.trim());
    }
    localStorage.setItem(STORAGE_KEY_AI_PROVIDER, provider);
  } catch (e) {
    console.error('Failed to save AI key:', e);
  }
}

export function isAIConfigured(): boolean {
  return getAIApiKey().length > 0 || getNvidiaApiKey().length > 0;
}

/**
 * Universal Dual-Engine AI Caller with Multi-turn Memory:
 * 1. Primary: Google Gemini (gemini-flash-lite-latest / gemini-flash-latest)
 * 2. Automatic Backup Failover: NVIDIA NIM (nemotron-3-nano-omni-30b-a3b-reasoning)
 */
export async function askAICoach(
  prompt: string,
  context?: string,
  history?: ChatMessageTurn[]
): Promise<string> {
  const geminiKey = getAIApiKey();
  const nvidiaKey = getNvidiaApiKey();

  if (!geminiKey && !nvidiaKey) {
    throw new Error(
      'AI API token not found. Please add NEXT_PUBLIC_GEMINI_API_KEY or NEXT_PUBLIC_NVIDIA_API_KEY to your environment variables.'
    );
  }

  const systemInstruction = `You are NexDev AI, an advanced, highly intelligent personal development, tech, and performance coach (just like ChatGPT).
IMPORTANT MEMORY AND KNOWLEDGE INSTRUCTIONS:
1. FULL CONVERSATION MEMORY: You have complete access to the full conversation history. When the user asks "do you have our chat history?" or refers back to earlier messages, ALWAYS confirm with confidence and accurately reference or summarize the topics previously discussed (e.g., Nvidia, CEOs, habits, etc.). NEVER say "I don't have memory" or "I don't retain memory between sessions".
2. DIRECT ANSWERS WITHOUT DEFLECTION: You are deeply knowledgeable about technology, artificial intelligence developments, tech companies, and industry leaders/CEOs (such as Jensen Huang of Nvidia, Satya Nadella of Microsoft, Sam Altman of OpenAI, Dario Amodei of Anthropic). When the user asks about tech news, current events, or a CEO, answer the question thoroughly, factually, and directly first! Do NOT deflect or brush off tech questions.
3. ACTIONABLE & MOTIVATING: In addition to tech knowledge, you specialize in James Clear Atomic Habits, milestone breakdown, and daily momentum. Keep responses concise, engaging, structured, and easy to skim with bullet points and emojis.`;

  // 1. Try Google Gemini with full multi-turn history
  if (geminiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const modelsToTry = ['gemini-flash-lite-latest', 'gemini-flash-latest'];

      // Build clean alternating contents array (Gemini requires strict user/model alternation)
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      const addTurn = (role: 'user' | 'model', text: string) => {
        if (!text || !text.trim()) return;
        const last = contents[contents.length - 1];
        if (last && last.role === role) {
          last.parts[0].text += `\n\n${text.trim()}`;
        } else {
          contents.push({ role, parts: [{ text: text.trim() }] });
        }
      };

      if (context) {
        addTurn('user', `User Context & Progress:\n${context}`);
        addTurn('model', 'Understood. I have your progress context in mind.');
      }

      if (Array.isArray(history) && history.length > 0) {
        // Feed up to 16 past turns for deep ChatGPT-like continuity
        const recentHistory = history.slice(-16);
        for (const item of recentHistory) {
          const role = item.role === 'model' || item.role === 'assistant' ? 'model' : 'user';
          addTurn(role, item.text);
        }
      }

      // Append current user prompt
      addTurn('user', prompt);

      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction,
          });

          const result = await model.generateContent({ contents });
          const responseText = result.response.text();
          if (responseText && responseText.trim().length > 0) {
            return responseText;
          }
        } catch (innerErr: any) {
          console.warn(`Gemini (${modelName}) failed, trying fallback:`, innerErr?.message || innerErr);
        }
      }
    } catch (geminiErr: any) {
      console.warn('Gemini primary engine encountered error, falling back to NVIDIA NIM:', geminiErr?.message || geminiErr);
    }
  }

  // 2. Automatic Seamless Fallback to NVIDIA NIM Multi-Model Fleet (Mistral Large + Llama 3.3 + Nemotron)
  if (nvidiaKey) {
    console.log('⚡ Serving request via backup engine: NVIDIA NIM Multi-Model Fleet...');
    try {
      return await callNvidiaNIM(prompt, nvidiaKey, context, history);
    } catch (nvidiaErr: any) {
      console.error('NVIDIA backup engine error:', nvidiaErr);
      throw new Error(`Both Gemini and NVIDIA backup encountered an error: ${nvidiaErr?.message}`);
    }
  }

  throw new Error('All AI endpoints failed. Please check your API keys.');
}

/**
 * NVIDIA NIM Multi-Engine Caller with 3-Model Failover:
 * 1. mistralai/mistral-large-4-1t-a52b (High reasoning, fast execution)
 * 2. meta/llama-3.3-70b-instruct (Ultra-reliable 70B parameter powerhouse)
 * 3. nvidia/nemotron-3-nano-omni-30b-a3b-reasoning (High precision reasoning)
 */
async function callNvidiaNIM(
  prompt: string,
  apiKey: string,
  context?: string,
  history?: ChatMessageTurn[]
): Promise<string> {
  const invokeUrl = 'https://integrate.api.nvidia.com/v1/chat/completions';

  const messages: Array<{ role: string; content: string }> = [
    {
      role: 'system',
      content:
        'You are NexDev AI, an advanced conversational companion and performance coach with full conversational memory (like ChatGPT). You accurately remember and reference all previous chat messages. When asked if you have chat history, confirm with confidence and summarize past topics. You are deeply knowledgeable in technology, AI developments, tech news, and CEOs (like Jensen Huang of Nvidia), alongside habit building and goals. Answer directly without deflecting.',
    },
  ];

  if (context) {
    messages.push({
      role: 'user',
      content: `User Context / Current Progress:\n${context}`,
    });
    messages.push({
      role: 'assistant',
      content: 'Understood. I will use your progress context to guide my advice.',
    });
  }

  if (Array.isArray(history) && history.length > 0) {
    const recent = history.slice(-16);
    for (const h of recent) {
      messages.push({
        role: h.role === 'model' ? 'assistant' : h.role,
        content: h.text,
      });
    }
  }

  messages.push({
    role: 'user',
    content: prompt,
  });

  const nimModels = [
    'mistralai/mistral-large-4-1t-a52b',
    'meta/llama-3.3-70b-instruct',
    'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning',
  ];

  const keysToTry = [
    apiKey,
    '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',
    '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',
  ].filter(Boolean);
  const uniqueKeys = Array.from(new Set(keysToTry));

  let lastError: any = null;

  for (const currentKey of uniqueKeys) {
    for (const modelName of nimModels) {
      try {
        const res = await fetch(invokeUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${currentKey}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            model: modelName,
            messages,
            max_tokens: 2048,
            temperature: 0.6,
            top_p: 0.95,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const choice = data.choices?.[0]?.message;
          const text = choice?.content || choice?.reasoning_content;
          if (text && text.trim().length > 0) {
            return text;
          }
        } else {
          const errorText = await res.text();
          console.warn(`NIM Model ${modelName} returned HTTP ${res.status}: ${errorText}`);
          lastError = new Error(`NIM ${modelName} HTTP ${res.status}: ${errorText}`);
        }
      } catch (err: any) {
        console.warn(`NIM Model ${modelName} network error:`, err?.message || err);
        lastError = err;
      }
    }
  }

  throw lastError || new Error('All NVIDIA NIM models failed.');
}

/**
 * Generate a dynamic, unique AI motivational quote
 */
export async function generateAIQuote(): Promise<{ text: string; author: string }> {
  const prompt = `Generate a fresh, original, deeply inspiring and punchy motivational quote suitable for a high-performing builder, developer, and habit creator. 
It can be from a legendary thinker, athlete, inventor, or an impactful original aphorism.
Return ONLY a valid JSON object in this format:
{"text": "Quote here without quotation marks", "author": "Author Name"}
Do NOT wrap in markdown code blocks or add any other text.`;

  try {
    const raw = await askAICoach(prompt);
    const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (parsed.text && parsed.author) {
      return {
        text: String(parsed.text).trim(),
        author: String(parsed.author).trim(),
      };
    }
  } catch (err) {
    console.warn('AI quote JSON parse error:', err);
  }

  // Fallback high-impact quotes
  const fallbacks = [
    { text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.', author: 'Will Durant' },
    { text: 'Small disciplines repeated with consistency every day lead to great achievements gained slowly over time.', author: 'John C. Maxwell' },
    { text: 'You do not rise to the level of your goals. You fall to the level of your systems.', author: 'James Clear' },
    { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
    { text: 'Energy flows where attention goes.', author: 'Tony Robbins' },
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

/**
 * Structural story extractor that deterministically detects numbered stories
 * like "## **1. Title**", "1. Title", "## 1. Title" or markdown headers.
 */
function splitStoriesDeterministically(rawText: string): Omit<TechNewsStory, 'id' | 'createdAt' | 'read'>[] {
  if (!rawText || !rawText.trim()) return [];
  const text = rawText.trim();

  // Extract global date if present (e.g. "Monday, 16 November 2026")
  const dateMatch = text.match(
    /(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)[,\s]+(?:\d{1,2}\s+[A-Za-z]+|\w+\s+\d{1,2})[,\s]+\d{4}/i
  );
  const globalDate = dateMatch
    ? dateMatch[0]
    : new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

  // Match numbered story headings like "## **1. Title**" or "1. Title"
  const numberedPattern = /(?:^|\n)(?:#{1,4}\s*)?(?:\*{1,2})?(\d+)[\.\)]\s*(?:\*{1,2})?\s*([^\n\r]+)/g;
  const matches: { index: number; num: number; title: string }[] = [];
  let match: RegExpExecArray | null;

  while ((match = numberedPattern.exec(text)) !== null) {
    const rawNum = parseInt(match[1], 10);
    let title = match[2].replace(/\*{2,}/g, '').replace(/\[.*?\]\(.*?\)/g, '').trim();
    title = title.replace(/^[#*_`\s]+|[#*_`\s]+$/g, '').trim();

    if (
      title.length >= 8 &&
      rawNum >= 1 &&
      rawNum <= 30 &&
      !title.toLowerCase().startsWith('the financial picture') &&
      !title.toLowerCase().startsWith('what are students') &&
      !title.toLowerCase().startsWith('how does it work') &&
      !title.toLowerCase().startsWith('some interesting')
    ) {
      if (
        matches.length === 0 ||
        rawNum === matches[matches.length - 1].num + 1 ||
        rawNum > matches[matches.length - 1].num
      ) {
        matches.push({ index: match.index, num: rawNum, title });
      }
    }
  }

  // If >= 2 numbered stories found, split deterministically!
  if (matches.length >= 2) {
    const stories: Omit<TechNewsStory, 'id' | 'createdAt' | 'read'>[] = [];
    for (let i = 0; i < matches.length; i++) {
      const current = matches[i];
      const next = matches[i + 1];
      const startIdx = current.index;

      let endIdx = next ? next.index : text.length;

      // Filter out footer sections at the end of the newsletter
      if (!next) {
        const footerMatch = text
          .slice(startIdx)
          .search(/(?:^|\n)#{1,3}\s*(?:Today's|Three concepts|My assessment|Related links|Subscribe)/i);
        if (footerMatch > 200) {
          endIdx = startIdx + footerMatch;
        }
      }

      const chunk = text.slice(startIdx, endIdx).trim();
      const lines = chunk.split('\n').map((l) => l.trim()).filter(Boolean);

      // Extract Category: Look for metadata tags like "AI · Startups · Global finance"
      let category = 'Technology';
      for (const line of lines.slice(1, 6)) {
        if (
          (line.includes('·') ||
            line.includes('•') ||
            line.includes('|') ||
            line.toLowerCase().includes('ai') ||
            line.toLowerCase().includes('startup')) &&
          !line.startsWith('#') &&
          !line.startsWith('!') &&
          !line.startsWith('[') &&
          line.length < 60
        ) {
          category = line.replace(/[*_#`]/g, '').trim();
          break;
        }
      }

      // Extract Summary: find first substantive paragraph that isn't the category
      let summary = '';
      for (const line of lines.slice(1)) {
        if (
          !line.startsWith('#') &&
          !line.startsWith('[') &&
          !line.startsWith('!') &&
          !line.startsWith('|') &&
          !line.startsWith('-') &&
          line !== category &&
          !line.includes('·') &&
          !line.includes('•') &&
          !line.toLowerCase().includes('latest prospectus') &&
          !line.toLowerCase().includes('announced:') &&
          !line.toLowerCase().includes('registration') &&
          !line.toLowerCase().includes('reuters investigation') &&
          !line.toLowerCase().includes('concluded:') &&
          line.length > 25
        ) {
          summary = line.replace(/\[.*?\]\(.*?\)/g, '').replace(/[*_#`]/g, '').trim();
          if (summary.length > 220) summary = summary.slice(0, 217) + '...';
          break;
        }
      }

      const urlMatch = chunk.match(/https?:\/\/[^\s\)\"\'<>]+/);
      const sourceUrl = urlMatch ? urlMatch[0] : undefined;

      stories.push({
        title: current.title,
        category: category || 'Technology',
        summary: summary || current.title,
        fullContent: chunk,
        sourceUrl,
        date: globalDate,
      });
    }

    return stories;
  }

  // Fallback: Check for Markdown H2 headers (## Title)
  const h2Pattern = /(?:^|\n)##\s+([^\n\r]+)/g;
  const h2Matches: { index: number; title: string }[] = [];
  let h2Match: RegExpExecArray | null;
  while ((h2Match = h2Pattern.exec(text)) !== null) {
    const h2Title = h2Match[1].replace(/[*_#`]/g, '').trim();
    if (h2Title.length > 10) {
      h2Matches.push({ index: h2Match.index, title: h2Title });
    }
  }

  if (h2Matches.length >= 2) {
    const stories: Omit<TechNewsStory, 'id' | 'createdAt' | 'read'>[] = [];
    for (let i = 0; i < h2Matches.length; i++) {
      const current = h2Matches[i];
      const next = h2Matches[i + 1];
      const chunk = text.slice(current.index, next ? next.index : text.length).trim();
      stories.push({
        title: current.title,
        category: 'Tech Briefing',
        summary: chunk.slice(0, 180).replace(/[*_#`\[\]]/g, '') + '...',
        fullContent: chunk,
        date: globalDate,
      });
    }
    return stories;
  }

  return [];
}

/**
 * Parse raw tech news briefings into structured stories
 */
export async function parseNewsBriefing(
  rawText: string
): Promise<Omit<TechNewsStory, 'id' | 'createdAt' | 'read'>[]> {
  if (!rawText || !rawText.trim()) return [];

  // Step 1: Pre-split structural stories (Guaranteed to separate numbered articles!)
  const preSplit = splitStoriesDeterministically(rawText);

  if (preSplit.length >= 2) {
    console.log(`✅ Deterministically identified ${preSplit.length} distinct news stories.`);

    // Step 2: Lightweight AI polish of categories & takeaways (Super fast, small prompt, zero syntax error risk)
    try {
      const titlesPayload = preSplit.map((s, idx) => ({ id: idx, title: s.title, snippet: s.summary }));
      const prompt = `Refine and polish the category and 1-sentence executive summary for these tech news stories. Return ONLY a JSON array of objects: [{"id": 0, "category": "AI · Finance", "summary": "One punchy sentence."}, ...].
Stories:
${JSON.stringify(titlesPayload)}`;

      const raw = await askAICoach(prompt);
      const jsonMatch = raw.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (jsonMatch) {
        const polished = JSON.parse(jsonMatch[0]);
        if (Array.isArray(polished)) {
          for (const p of polished) {
            if (typeof p.id === 'number' && preSplit[p.id]) {
              if (p.category) preSplit[p.id].category = String(p.category);
              if (p.summary) preSplit[p.id].summary = String(p.summary);
            }
          }
        }
      }
    } catch (aiErr) {
      console.warn('AI polish skipped, using extracted metadata:', aiErr);
    }

    return preSplit;
  }

  // Step 3: If no structural headers were found, perform full LLM semantic extraction
  try {
    const prompt = `You are an expert news editor. Split this text into distinct news stories. Return ONLY a valid JSON array matching this format:
[
  {
    "title": "Compelling headline",
    "category": "Category",
    "summary": "1-2 sentence executive takeaway",
    "fullContent": "Full article text",
    "date": "Today's date"
  }
]
Text:
${rawText.slice(0, 10000)}`;

    const raw = await askAICoach(prompt);
    const jsonMatch = raw.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item) => ({
          title: String(item.title || 'Tech Story'),
          category: String(item.category || 'Technology'),
          summary: String(item.summary || item.title || ''),
          fullContent: String(item.fullContent || item.summary || ''),
          sourceUrl: item.sourceUrl ? String(item.sourceUrl) : undefined,
          date: String(
            item.date ||
              new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
          ),
        }));
      }
    }
  } catch (err) {
    console.error('Full LLM parsing failed:', err);
  }

  // Final fallback: split by double line breaks if long, or return 1 cleaned story
  const paragraphs = rawText.split(/\n\s*\n/).filter((p) => p.trim().length > 100);
  if (paragraphs.length >= 2) {
    return paragraphs.map((p, idx) => ({
      title: p.slice(0, 60).replace(/[*_#`]/g, '').trim() + '...',
      category: 'Tech Briefing',
      summary: p.slice(0, 150).replace(/[*_#`]/g, '').trim() + '...',
      fullContent: p.trim(),
      date: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    }));
  }

  return [
    {
      title: 'Imported Tech Briefing',
      category: 'Tech Briefing',
      summary: rawText.slice(0, 160).replace(/[*_#`]/g, '').trim() + '...',
      fullContent: rawText,
      date: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    },
  ];
}

/**
 * AI Deep Dive & Grounded Analysis for a Tech News Story
 */
export async function deepDiveStory(
  title: string,
  summary: string,
  fullContent: string
): Promise<string> {
  const prompt = `Conduct a comprehensive, high-value "Deep Dive / Know More" analysis for the following tech story:

Title: ${title}
Summary: ${summary}
Content:
${fullContent}

Provide an insightful, forward-looking analysis organized with clean markdown headers and bullet points:
### 🎯 Executive Core Takeaway
(1-2 concise, powerful sentences capturing the essence)

### 🔬 Technical & Architectural Significance
(Deep dive into the underlying tech, algorithms, infrastructure, or models involved)

### 📈 Market & Ecosystem Implications
(What this means for software engineers, startups, enterprise adoption, and the global tech landscape)

### ⚡ Strategic Outlook & What to Watch Next
(Key upcoming milestones, counter-risks, or tests to monitor in the coming months)

Make it authoritative, crisp, and intellectually stimulating.`;

  return askAICoach(prompt);
}

/**
 * Helper to suggest 3-5 milestones for a goal
 */
export async function suggestMilestonesForGoal(
  goalTitle: string,
  goalDescription?: string
): Promise<string[]> {
  const prompt = `Break down this goal into 3 to 4 sequential, realistic milestone checkpoints. Return ONLY a JSON array of strings, for example: ["Milestone 1", "Milestone 2", "Milestone 3"]. Do not include markdown codeblocks or other commentary.
Goal Title: ${goalTitle}
${goalDescription ? `Description: ${goalDescription}` : ''}`;

  try {
    const raw = await askAICoach(prompt);
    const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((m: any) => (typeof m === 'object' ? m.title || m.milestone || JSON.stringify(m) : String(m).trim()));
    }
    return [
      `Define initial action plan for ${goalTitle}`,
      `Reach 50% milestone checkpoint`,
      `Final review and completion`,
    ];
  } catch (err) {
    console.warn('AI milestone parsing fallback:', err);
    return [
      `Kickoff: First action for ${goalTitle}`,
      `Midway progress milestone`,
      `Final review & completion`,
    ];
  }
}

/**
 * Helper for daily coaching advice based on habits and stats
 */
export async function getDailyCoachingTip(habitNames: string[], longestStreak: number): Promise<string> {
  const prompt = `Give me a 2-sentence punchy, high-energy coaching tip for today. 
My current habits are: ${habitNames.slice(0, 4).join(', ')}. 
My best streak is: ${longestStreak} days.
Make it inspiring and actionable.`;

  return askAICoach(prompt);
}
