import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { requireApiAuth, checkRateLimit } from '@/lib/apiAuth';

export const dynamic = 'force-dynamic';

const NVIDIA_INVOKE_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

const DEFAULT_NVIDIA_KEYS = [
  process.env.NVIDIA_API_KEY,
  process.env.NVIDIA_BACKUP_API_KEY,
].filter(Boolean) as string[];

const NIM_MODELS = [
  'mistralai/mistral-large-4-1t-a52b',
  'meta/llama-3.3-70b-instruct',
  'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning',
];

const SYSTEM_COACH_INSTRUCTION = `You are NexDev AI — a world-class conversational AI assistant and personal performance coach (comparable to ChatGPT or Claude). You are brilliant, knowledgeable, articulate, and deeply helpful.

CORE CAPABILITIES:
1. FULL CONVERSATION MEMORY: You have complete access to the conversation history provided. When the user refers to earlier messages, confirm and reference them accurately.
2. DEEP KNOWLEDGE & DIRECT ANSWERS: You are an expert in technology, AI developments, startups, tech companies, and their leaders (Jensen Huang/NVIDIA, Sam Altman/OpenAI, Dario Amodei/Anthropic, Satya Nadella/Microsoft, Sundar Pichai/Google, etc.). When asked about tech news, current events, industry trends, or any factual topic — answer THOROUGHLY, ACCURATELY, and DIRECTLY first.
3. PERSONAL GROWTH EXPERTISE: You specialize in James Clear's Atomic Habits methodology, habit stacking, milestone breakdown, streak psychology, and daily routines.
4. FORMATTING: Write detailed, structured responses using markdown (bold, bullet points, numbered lists).`;

async function callNvidiaServer(
  messages: Array<{ role: string; content: string }>,
  customKey?: string,
  temperature = 0.6
): Promise<string> {
  const keysToTry = customKey ? [customKey, ...DEFAULT_NVIDIA_KEYS] : DEFAULT_NVIDIA_KEYS;
  const uniqueKeys = Array.from(new Set(keysToTry));

  let lastError: unknown = null;

  for (const apiKey of uniqueKeys) {
    for (const model of NIM_MODELS) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000);

        const res = await fetch(NVIDIA_INVOKE_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            model,
            messages,
            max_tokens: 4096,
            temperature,
            top_p: 0.95,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          const choice = data.choices?.[0]?.message;
          const text = choice?.content || choice?.reasoning_content;
          if (text && text.trim().length > 0) {
            return text.trim();
          }
        } else {
          const errText = await res.text().catch(() => '');
          lastError = new Error(`NVIDIA model ${model} HTTP ${res.status}: ${errText.slice(0, 150)}`);
        }
      } catch (err: unknown) {
        lastError = err;
      }
    }
  }

  throw lastError || new Error('All NVIDIA NIM models failed');
}

export async function POST(req: Request) {
  const authError = requireApiAuth(req);
  if (authError) return authError;

  const rateError = checkRateLimit(req, 'ai', 30, 60_000);
  if (rateError) return rateError;

  try {
    const body = await req.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    const { action = 'chat', prompt, context, history, text, title, summary, fullContent, apiKey } = body;

    // 1. CHAT ACTION
    if (action === 'chat') {
      if (!prompt || typeof prompt !== 'string' || !prompt.trim() || prompt.length > 8000) {
        return NextResponse.json({ error: 'Prompt is required (max 8000 characters)' }, { status: 400 });
      }

      const messages: Array<{ role: string; content: string }> = [
        { role: 'system', content: SYSTEM_COACH_INSTRUCTION },
      ];

      if (typeof context === 'string' && context.length > 0) {
        messages.push({
          role: 'user',
          content: `User Context / Current Progress:\n${context.slice(0, 15000)}`,
        });
        messages.push({
          role: 'assistant',
          content: 'Understood. I have your progress context in mind.',
        });
      }

      if (Array.isArray(history) && history.length > 0) {
        const recent = history.slice(-20);
        for (const h of recent) {
          messages.push({
            role: h.role === 'model' || h.role === 'assistant' ? 'assistant' : 'user',
            content: h.text,
          });
        }
      }

      const lastMsg = messages[messages.length - 1];
      if (!lastMsg || lastMsg.role !== 'user' || lastMsg.content !== prompt.trim()) {
        messages.push({
          role: 'user',
          content: prompt.trim(),
        });
      }

      // First try NVIDIA NIM server-to-server (proven ultra-fast & high reasoning)
      try {
        const reply = await callNvidiaServer(messages, apiKey, 0.7);
        return NextResponse.json({ success: true, text: reply, provider: 'nvidia-nim' });
      } catch (nimErr: unknown) {
        console.warn('NVIDIA server-side error, attempting Gemini fallback:', nimErr instanceof Error ? nimErr.message : nimErr);
      }

      // Gemini fallback if key available
      const geminiKey = process.env.GEMINI_API_KEY || (typeof apiKey === 'string' ? apiKey : '');
      if (geminiKey) {
        try {
          const genAI = new GoogleGenerativeAI(geminiKey);
          for (const mName of ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash-lite']) {
            try {
              const model = genAI.getGenerativeModel({ model: mName });
              const contents = messages
                .filter((m) => m.role !== 'system')
                .map((m) => ({
                  role: m.role === 'assistant' ? 'model' : 'user',
                  parts: [{ text: m.content }],
                }));
              const res = await model.generateContent({ contents });
              const textRes = res.response.text();
              if (textRes) {
                return NextResponse.json({ success: true, text: textRes, provider: 'gemini' });
              }
            } catch {
              continue;
            }
          }
        } catch (gErr: unknown) {
          console.warn('Gemini fallback error:', gErr instanceof Error ? gErr.message : gErr);
        }
      }

      return NextResponse.json(
        { error: 'All AI engines failed to generate response. Please try again in a moment.' },
        { status: 500 }
      );
    }

    // 2. DEEP DIVE ACTION
    if (action === 'deepdive') {
      if (typeof title !== 'string' || typeof fullContent !== 'string' || !title.trim() || !fullContent.trim()) {
        return NextResponse.json({ error: 'Title and fullContent are required.' }, { status: 400 });
      }
      const safeTitle = title.slice(0, 500);
      const safeSummary = typeof summary === 'string' ? summary.slice(0, 4000) : '';
      const safeContent = fullContent.slice(0, 30000);

      const messages = [
        {
          role: 'system',
          content:
            'You are a senior tech analyst, venture capitalist, and software architect. Provide a grounded, high-signal, deeply informative deep-dive breakdown of the tech news article provided. Structure your response into: 1. Executive Summary & Core Signal, 2. Technical Architecture & Engineering Significance, 3. Market Impact & Competitive Landscape, 4. Strategic Outlook. Use crisp markdown with bullet points.',
        },
        {
          role: 'user',
          content: `Headline: ${safeTitle}\nSummary: ${safeSummary}\nFull Article:\n${safeContent}`,
        },
      ];

      const reply = await callNvidiaServer(messages, apiKey, 0.5);
      return NextResponse.json({ success: true, text: reply });
    }

    // 3. QUOTE ACTION
    if (action === 'quote') {
      const messages = [
        {
          role: 'system',
          content:
            'You are an inspiring mentor and performance philosopher. Generate ONE unique, powerful, concise motivational quote about habits, discipline, building, and personal growth. Return ONLY valid JSON in format: {"text": "quote text here", "author": "Author or Thinker Name"}. No markdown backticks or commentary.',
        },
        {
          role: 'user',
          content: 'Generate today\'s motivational insight.',
        },
      ];

      const reply = await callNvidiaServer(messages, apiKey, 0.8);
      let quoteObj = { text: reply, author: 'NexDev Wisdom' };
      try {
        const cleaned = reply.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (parsed.text && parsed.author) {
          quoteObj = parsed;
        }
      } catch {}

      return NextResponse.json({ success: true, quote: quoteObj });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: unknown) {
    console.error('API /api/ai Route Error:', error);
    return NextResponse.json(
      { error: 'Internal AI Server Error' },
      { status: 500 }
    );
  }
}
