'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Key,
  Trash2,
  Copy,
  Check,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { askAICoach, getAIApiKey, saveAIApiKey, isAIConfigured, AIProvider, ChatMessageTurn } from '@/lib/ai';
import { triggerHaptic } from '@/lib/haptics';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

const STORAGE_CHAT_KEY = 'nexdev_chat_history';

const DEFAULT_WELCOME_MESSAGE: Message = {
  id: 'welcome',
  sender: 'ai',
  text: "👋 Hey there! I'm your **NexDev AI Coach** — think of me as a brilliant friend who knows tech, habits, and personal growth inside out.\n\nI can help you with:\n- 🧠 **Tech & AI knowledge** — latest developments, companies, industry analysis\n- 🌱 **Habit building** — atomic habits, streak psychology, daily routines\n- 🎯 **Goal breaking** — milestones, accountability, progress tracking\n- ⚡ **Overcoming blocks** — procrastination, motivation, mindset\n\nWhat's on your mind today?",
  timestamp: 'Just now',
};

const PROMPT_SUGGESTIONS = [
  { icon: '🌱', label: 'Atomic habit plan', prompt: 'Help me design an atomic 2-minute habit to start learning TypeScript daily.' },
  { icon: '🎯', label: 'Break down a goal', prompt: 'Break down my goal of running a 10K endurance run into realistic milestones.' },
  { icon: '⚡', label: 'Beat procrastination', prompt: "I'm procrastinating on deep work today. Give me a 3-step psychological kickstart." },
  { icon: '🚀', label: 'Tech & Career roadmap', prompt: "What are the most impactful software engineering skills to master for AI agents in 2026?" },
];

/**
 * Simple markdown-like renderer for chat messages.
 * Handles bold, italic, headers, bullet points, links, and code blocks.
 */
function renderMarkdown(text: string): React.ReactNode {
  // Split by code blocks first
  const parts = text.split(/(```[\s\S]*?```)/g);

  return parts.map((part, partIdx) => {
    // Code block
    if (part.startsWith('```') && part.endsWith('```')) {
      const code = part.slice(3, -3).replace(/^\w+\n/, ''); // strip language identifier
      return (
        <pre key={partIdx} className="bg-black/40 border border-white/10 rounded-xl p-3 my-2 overflow-x-auto text-[11px] sm:text-xs font-mono text-emerald-300">
          <code>{code.trim()}</code>
        </pre>
      );
    }

    // Process inline markdown
    const lines = part.split('\n');
    return lines.map((line, lineIdx) => {
      const key = `${partIdx}-${lineIdx}`;

      // Empty line = spacing
      if (!line.trim()) {
        return <div key={key} className="h-2" />;
      }

      // Headers
      if (line.startsWith('### ')) {
        return <h3 key={key} className="text-sm font-bold text-purple-300 mt-3 mb-1">{processInline(line.slice(4))}</h3>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={key} className="text-sm font-bold text-purple-200 mt-3 mb-1">{processInline(line.slice(3))}</h2>;
      }
      if (line.startsWith('# ')) {
        return <h1 key={key} className="text-base font-bold text-white mt-3 mb-1">{processInline(line.slice(2))}</h1>;
      }

      // Bullet points
      if (line.match(/^\s*[-*•]\s/)) {
        const content = line.replace(/^\s*[-*•]\s/, '');
        return (
          <div key={key} className="flex items-start gap-2 pl-1 my-0.5">
            <span className="text-purple-400 mt-0.5 shrink-0">•</span>
            <span>{processInline(content)}</span>
          </div>
        );
      }

      // Numbered list
      if (line.match(/^\s*\d+[.)]\s/)) {
        const numMatch = line.match(/^\s*(\d+)[.)]\s(.*)/);
        if (numMatch) {
          return (
            <div key={key} className="flex items-start gap-2 pl-1 my-0.5">
              <span className="text-purple-400 font-bold shrink-0 min-w-[1.2rem]">{numMatch[1]}.</span>
              <span>{processInline(numMatch[2])}</span>
            </div>
          );
        }
      }

      // Regular paragraph
      return <p key={key} className="my-0.5">{processInline(line)}</p>;
    });
  });
}

/** Process inline markdown: **bold**, *italic*, `code`, [links](url) */
function processInline(text: string): React.ReactNode {
  // Split by inline patterns
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let idx = 0;

  while (remaining.length > 0) {
    // Bold: **text**
    const boldMatch = remaining.match(/^([\s\S]*?)\*\*([\s\S]+?)\*\*([\s\S]*)/);
    if (boldMatch) {
      if (boldMatch[1]) parts.push(<span key={idx++}>{boldMatch[1]}</span>);
      parts.push(<strong key={idx++} className="font-bold text-white">{boldMatch[2]}</strong>);
      remaining = boldMatch[3];
      continue;
    }

    // Inline code: `code`
    const codeMatch = remaining.match(/^([\s\S]*?)`([^`]+)`([\s\S]*)/);
    if (codeMatch) {
      if (codeMatch[1]) parts.push(<span key={idx++}>{codeMatch[1]}</span>);
      parts.push(<code key={idx++} className="bg-white/10 px-1.5 py-0.5 rounded text-[11px] font-mono text-emerald-300">{codeMatch[2]}</code>);
      remaining = codeMatch[3];
      continue;
    }

    // Links: [text](url)
    const linkMatch = remaining.match(/^([\s\S]*?)\[([^\]]+)\]\(([^)]+)\)([\s\S]*)/);
    if (linkMatch) {
      if (linkMatch[1]) parts.push(<span key={idx++}>{linkMatch[1]}</span>);
      parts.push(
        <a key={idx++} href={linkMatch[3]} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
          {linkMatch[2]}
        </a>
      );
      remaining = linkMatch[4];
      continue;
    }

    // No more patterns found
    parts.push(<span key={idx++}>{remaining}</span>);
    break;
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

export default function AICoachPage() {
  const [messages, setMessages] = useState<Message[]>([DEFAULT_WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [providerInput, setProviderInput] = useState<AIProvider>('gemini');
  const [hasKey, setHasKey] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Restore persistent conversation history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CHAT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to restore chat history:', e);
    }

    setHasKey(isAIConfigured());
    setApiKeyInput(getAIApiKey());
  }, []);

  // Save conversation history whenever messages change
  const saveChatHistory = (newMessages: Message[]) => {
    try {
      localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(newMessages));
    } catch (e) {
      console.warn('Failed to save chat history:', e);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (userPromptText?: string) => {
    const textToSend = userPromptText || input;
    if (!textToSend.trim() || loading) return;

    triggerHaptic('medium');
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    saveChatHistory(updatedMessages);
    setInput('');
    setLoading(true);

    // Auto-resize textarea back to 1 row
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    try {
      // Build structured ChatMessageTurn history for deep multi-turn memory
      // Exclude the welcome message from history sent to AI
      const historyTurns: ChatMessageTurn[] = updatedMessages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : ('model' as const),
          text: m.text,
        }));

      const reply = await askAICoach(
        textToSend.trim(),
        undefined,
        historyTurns
      );

      const aiMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
      triggerHaptic('success');
    } catch (err: any) {
      const errorMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: `⚠️ **Unable to connect to AI Coach**\n\n${err?.message || 'Please check your API key in Settings.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...updatedMessages, errorMessage]);
      triggerHaptic('warning');
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm('Clear entire AI coach chat history?')) {
      triggerHaptic('medium');
      setMessages([DEFAULT_WELCOME_MESSAGE]);
      localStorage.removeItem(STORAGE_CHAT_KEY);
    }
  };

  const handleSaveApiKey = () => {
    triggerHaptic('success');
    saveAIApiKey(apiKeyInput.trim(), providerInput);
    setHasKey(isAIConfigured());
    setShowSettings(false);
  };

  const copyToClipboard = (id: string, text: string) => {
    triggerHaptic('light');
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-4xl mx-auto pb-24 md:pb-6">
      {/* Top Bar Header */}
      <div className="flex items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#0c1022]/80 via-[#070914]/80 to-[#05070e] border border-white/[0.08] backdrop-blur-2xl mb-4 shrink-0 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-400/20 to-transparent pointer-events-none" />
        <div className="flex items-center gap-3">
          <Link
            href="/"
            onClick={() => triggerHaptic('light')}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>

          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <Bot size={20} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                NexDev AI Coach
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Dual-Engine • Gemini Flash + NVIDIA NIM</span>
            </p>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5 transition-all text-xs font-semibold flex items-center gap-1.5"
            title="Configure AI Keys"
          >
            <Key size={14} />
            <span className="hidden sm:inline">Keys</span>
          </button>

          <button
            onClick={handleClearHistory}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-red-400 border border-white/5 transition-all text-xs font-semibold flex items-center gap-1.5"
            title="Clear Chat History"
          >
            <Trash2 size={14} />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Settings Panel (Collapsible) */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4 shrink-0"
          >
            <div className="p-4 sm:p-5 rounded-3xl bg-purple-950/40 border border-purple-500/30 backdrop-blur-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-purple-400" />
                  <span>Configure API Provider</span>
                </span>
                <span className="text-[10px] text-gray-400">Keys stored locally in browser</span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setProviderInput('gemini')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    providerInput === 'gemini'
                      ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                      : 'bg-white/5 text-gray-400 border-white/10'
                  }`}
                >
                  Google Gemini (Default)
                </button>
                <button
                  type="button"
                  onClick={() => setProviderInput('nvidia')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    providerInput === 'nvidia'
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                      : 'bg-white/5 text-gray-400 border-white/10'
                  }`}
                >
                  NVIDIA NIM (Mistral)
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder={`Enter your ${providerInput === 'gemini' ? 'Gemini' : 'NVIDIA'} API Key...`}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
                <button
                  onClick={handleSaveApiKey}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md"
                >
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-1 mb-3">
        {messages.map((message) => {
          const isUser = message.sender === 'user';
          const isCopied = copiedId === message.id;

          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white ${
                  isUser
                    ? 'bg-gradient-to-tr from-purple-500 to-blue-500 shadow-md shadow-purple-500/20'
                    : 'bg-gradient-to-tr from-purple-900 to-indigo-900 border border-purple-500/30 text-purple-300'
                }`}
              >
                {isUser ? <User size={15} /> : <Sparkles size={15} />}
              </div>

              {/* Message Bubble */}
              <div
                className={`group relative max-w-[85%] sm:max-w-[78%] rounded-3xl p-4 sm:p-5 shadow-lg leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white rounded-tr-sm'
                    : 'bg-white/[0.04] border border-white/10 text-gray-200 rounded-tl-sm backdrop-blur-xl'
                }`}
              >
                <div className="text-xs sm:text-sm font-sans leading-relaxed">
                  {isUser ? (
                    <span className="whitespace-pre-wrap">{message.text}</span>
                  ) : (
                    renderMarkdown(message.text)
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 mt-2.5 pt-2 border-t border-white/10 text-[10px] text-gray-400">
                  <span>{message.timestamp}</span>

                  <button
                    onClick={() => copyToClipboard(message.id, message.text)}
                    className="opacity-0 group-hover:opacity-100 hover:text-white transition-opacity flex items-center gap-1"
                    title="Copy message"
                  >
                    {isCopied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Typing indicator */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 text-gray-400 text-xs py-2"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles size={14} className="animate-spin" />
            </div>
            <div className="flex items-center gap-1 bg-white/[0.04] border border-white/10 px-3.5 py-2 rounded-2xl">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0.4s]" />
              <span className="text-[11px] text-gray-400 ml-1.5 font-medium">Thinking...</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Prompt Suggestion Chips */}
      {messages.length <= 3 && !loading && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 pt-1 -mx-2 px-2 touch-pan-x shrink-0">
          {PROMPT_SUGGESTIONS.map((item) => (
            <button
              key={item.label}
              onClick={() => handleSend(item.prompt)}
              className="px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-gray-300 hover:text-white whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Chat Input Bar */}
      <div className="shrink-0 p-2 sm:p-2.5 rounded-3xl bg-gradient-to-br from-[#0c1022]/90 via-[#070914]/90 to-[#05070e] border border-white/[0.1] backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.7)]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-end gap-2"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about habits, goals, tech news, or life..."
            disabled={loading}
            rows={1}
            className="flex-1 bg-transparent px-3 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none disabled:opacity-50 resize-none overflow-hidden"
            style={{ minHeight: '2.5rem', maxHeight: '7.5rem' }}
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-white flex items-center justify-center shrink-0 shadow-lg shadow-purple-600/30 transition-all"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
