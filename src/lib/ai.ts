'use client';

import { GoogleGenerativeAI } from '@google/generative-ai';

// Storage keys for user-configured key in the browser/APK
const STORAGE_KEY_AI_KEY = 'nexdev_ai_api_key';
const STORAGE_KEY_AI_PROVIDER = 'nexdev_ai_provider';
const STORAGE_KEY_NVIDIA_KEY = 'nexdev_nvidia_api_key';

export type AIProvider = 'gemini' | 'nvidia' | 'groq' | 'openai';

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
  if (typeof window === 'undefined') return '';
  const envKey = process.env.NEXT_PUBLIC_NVIDIA_API_KEY || '';
  if (envKey) return envKey;
  try {
    return localStorage.getItem(STORAGE_KEY_NVIDIA_KEY) || '';
  } catch {
    return '';
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
 * Universal Dual-Engine AI Caller:
 * 1. Primary: Google Gemini (gemini-flash-lite-latest / gemini-flash-latest)
 * 2. Automatic Backup Failover: NVIDIA NIM (nemotron-3-nano-omni-30b-a3b-reasoning)
 */
export async function askAICoach(prompt: string, context?: string): Promise<string> {
  const geminiKey = getAIApiKey();
  const nvidiaKey = getNvidiaApiKey();

  if (!geminiKey && !nvidiaKey) {
    throw new Error(
      'AI API token not found. Please add NEXT_PUBLIC_GEMINI_API_KEY or NEXT_PUBLIC_NVIDIA_API_KEY to your Vercel Environment Variables.'
    );
  }

  const fullPrompt = context
    ? `User Context / Current Progress:\n${context}\n\nTask / Question:\n${prompt}`
    : prompt;

  const systemInstruction =
    'You are NexDev AI Coach, a supportive, concise, and hyper-actionable personal growth mentor. You specialize in habit building (James Clear Atomic Habits style), realistic goal milestone breakdown, and positive psychology. Keep responses concise, motivating, and easy to skim with emojis and bullet points.';

  // 1. Try Google Gemini first if key is present
  if (geminiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const modelsToTry = ['gemini-flash-lite-latest', 'gemini-flash-latest'];

      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction,
          });

          const result = await model.generateContent(fullPrompt);
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

  // 2. Automatic Seamless Fallback to NVIDIA NIM
  if (nvidiaKey) {
    console.log('⚡ Serving request via backup engine: NVIDIA NIM (Nemotron)...');
    try {
      return await callNvidiaNIM(fullPrompt, nvidiaKey);
    } catch (nvidiaErr: any) {
      console.error('NVIDIA backup engine error:', nvidiaErr);
      throw new Error(`Both Gemini and NVIDIA backup encountered an error: ${nvidiaErr?.message}`);
    }
  }

  throw new Error('All AI endpoints failed. Please check your API keys.');
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

/**
 * NVIDIA NIM Engine Caller
 * Model: nvidia/nemotron-3-nano-omni-30b-a3b-reasoning
 */
async function callNvidiaNIM(prompt: string, apiKey: string): Promise<string> {
  const invokeUrl = 'https://integrate.api.nvidia.com/v1/chat/completions';

  const res = await fetch(invokeUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning',
      messages: [
        {
          role: 'system',
          content:
            'You are NexDev AI, a personal growth and habit coach. Give concise, motivating, actionable advice with bullet points.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 1024,
      temperature: 0.6,
      top_p: 0.95,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`NVIDIA NIM HTTP ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  const choice = data.choices?.[0]?.message;
  return choice?.content || choice?.reasoning_content || 'No response generated from NVIDIA NIM.';
}
