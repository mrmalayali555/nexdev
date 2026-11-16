'use client';

import { GoogleGenerativeAI } from '@google/generative-ai';

// Storage key for user-configured key in the browser/APK
const STORAGE_KEY_AI_KEY = 'nexdev_ai_api_key';
const STORAGE_KEY_AI_PROVIDER = 'nexdev_ai_provider';

export type AIProvider = 'gemini' | 'groq' | 'nvidia' | 'openai';

export function getAIApiKey(): string {
  if (typeof window === 'undefined') return '';
  // 1. First check environment variables (set in Vercel or .env.local)
  const envKey =
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_AI_API_KEY ||
    process.env.NEXT_PUBLIC_OPENAI_API_KEY ||
    '';
  if (envKey) return envKey;

  // 2. Otherwise check locally stored key from settings
  try {
    return localStorage.getItem(STORAGE_KEY_AI_KEY) || '';
  } catch {
    return '';
  }
}

export function saveAIApiKey(key: string, provider: AIProvider = 'gemini') {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_AI_KEY, key.trim());
    localStorage.setItem(STORAGE_KEY_AI_PROVIDER, provider);
  } catch (e) {
    console.error('Failed to save AI key:', e);
  }
}

export function isAIConfigured(): boolean {
  return getAIApiKey().length > 0;
}

/**
 * Universal AI Caller
 * Defaults to Google Gemini (gemini-flash-lite-latest / gemini-flash-latest)
 * with graceful fallback to OpenAI/Groq/NVIDIA compatible formats.
 */
export async function askAICoach(prompt: string, context?: string): Promise<string> {
  const apiKey = getAIApiKey();
  if (!apiKey) {
    throw new Error(
      'AI API token not found. Please add NEXT_PUBLIC_GEMINI_API_KEY to your Vercel Environment Variables or paste it into AI Settings.'
    );
  }

  const provider =
    (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY_AI_PROVIDER)) ||
    (process.env.NEXT_PUBLIC_OPENAI_API_KEY ? 'openai' : 'gemini');

  if (provider === 'openai' || provider === 'groq' || provider === 'nvidia') {
    return callOpenAICompatible(prompt, context, apiKey, provider);
  }

  const fullPrompt = context
    ? `User Context / Current Progress:\n${context}\n\nTask / Question:\n${prompt}`
    : prompt;

  const systemInstruction =
    'You are NexDev AI Coach, a supportive, concise, and hyper-actionable personal growth mentor. You specialize in habit building (James Clear Atomic Habits style), realistic goal milestone breakdown, and positive psychology. Keep responses concise, motivating, and easy to skim with emojis and bullet points.';

  const genAI = new GoogleGenerativeAI(apiKey);

  // Try gemini-flash-lite-latest first for lightning speed and highest availability
  const modelsToTry = ['gemini-flash-lite-latest', 'gemini-flash-latest', 'gemini-3.8-flash'];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction,
      });

      const result = await model.generateContent(fullPrompt);
      const response = result.response;
      return response.text();
    } catch (err: any) {
      console.warn(`Model ${modelName} call failed, trying next:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error('Failed to generate response with Gemini.');
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
      return parsed.map((m) => String(m).trim());
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

/**
 * Fallback caller for Groq / NVIDIA / OpenAI compatible endpoints
 */
async function callOpenAICompatible(
  prompt: string,
  context: string | undefined,
  apiKey: string,
  provider: string
): Promise<string> {
  const baseURL =
    provider === 'groq'
      ? 'https://api.groq.com/openai/v1/chat/completions'
      : provider === 'nvidia'
      ? 'https://integrate.api.nvidia.com/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions';

  const modelName =
    provider === 'groq'
      ? 'llama-3.3-70b-versatile'
      : provider === 'nvidia'
      ? 'meta/llama-3.3-70b-instruct'
      : 'gpt-4o-mini';

  const messages = [
    {
      role: 'system',
      content:
        'You are NexDev AI, a personal development coach. Give concise, direct, inspiring advice.',
    },
    {
      role: 'user',
      content: context ? `${context}\n\n${prompt}` : prompt,
    },
  ];

  const res = await fetch(baseURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelName,
      messages,
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`AI API request failed (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'No response generated.';
}
