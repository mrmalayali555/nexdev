'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Key,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ArrowUp,
} from 'lucide-react';
import { askAICoach, getAIApiKey, saveAIApiKey, isAIConfigured, AIProvider, ChatMessageTurn } from '@/lib/ai';
import { triggerHaptic } from '@/lib/haptics';
import { renderInlineMarkdown } from '@/components/ui/SafeMarkdown';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

interface AICoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  contextSummary?: string;
}

const STORAGE_CHAT_KEY = 'nexdev_chat_history';

const DEFAULT_WELCOME_MESSAGE: Message = {
  id: 'welcome',
  sender: 'ai',
  text: "👋 Hey there! I'm your **NexDev Growth Coach**.\n\nI can help you build atomic habits, break big goals into achievable milestones, bounce back from broken streaks, and optimize your daily routines. What would you like to achieve today?",
  timestamp: 'Just now',
};

export default function AICoachModal({
  isOpen,
  onClose,
  contextSummary,
}: AICoachModalProps) {
  const [messages, setMessages] = useState<Message[]>([DEFAULT_WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [providerInput, setProviderInput] = useState<AIProvider>('gemini');
  const [hasKey, setHasKey] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

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
  }, []);

  // Save conversation history whenever messages change
  const saveChatHistory = (newMessages: Message[]) => {
    try {
      localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(newMessages));
    } catch (e) {
      console.warn('Failed to save chat history:', e);
    }
  };

  useEffect(() => {
    let focusTimer: ReturnType<typeof setTimeout> | undefined;
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const configured = isAIConfigured();
      setHasKey(configured);
      setApiKeyInput(getAIApiKey());
      focusTimer = setTimeout(() => inputRef.current?.focus(), 300);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      if (focusTimer) clearTimeout(focusTimer);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    triggerHaptic('light');

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: Message = {
      id: `${Date.now()}-user`,
      sender: 'user',
      text: text.trim(),
      timestamp: timeStr,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    saveChatHistory(updatedMessages);

    if (!textToSend) setInput('');
    setLoading(true);

    try {
      // Pass full conversation history for true multi-turn memory
      const historyTurns: ChatMessageTurn[] = updatedMessages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          text: m.text,
        }));

      // Remove the last item as it will be sent as current prompt
      const pastHistory = historyTurns.slice(0, -1);

      const aiReply = await askAICoach(text.trim(), contextSummary, pastHistory);
      const aiMsg: Message = {
        id: `${Date.now()}-ai`,
        sender: 'ai',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const finalMessages = [...updatedMessages, aiMsg];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
      triggerHaptic('success');
    } catch (err: any) {
      console.error('AI Coach Error:', err);
      const errMsg: Message = {
        id: `${Date.now()}-err`,
        sender: 'ai',
        text: `⚠️ **Unable to complete coaching response**: ${err?.message || 'Check your internet connection or API token'}.\n\nTap the **API Key** settings above to enter your free Gemini or Groq token.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      const finalMessages = [...updatedMessages, errMsg];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
      triggerHaptic('warning');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    triggerHaptic('light');
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    triggerHaptic('medium');
    const freshMessages: Message[] = [
      {
        id: `welcome-${Date.now()}`,
        sender: 'ai',
        text: "✨ Chat cleared. What habit, goal, or mindset shift can I assist you with now?",
        timestamp: 'Just now',
      },
    ];
    setMessages(freshMessages);
    try {
      localStorage.removeItem(STORAGE_CHAT_KEY);
    } catch (e) {
      // ignore
    }
  };

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;
    saveAIApiKey(apiKeyInput.trim(), providerInput);
    setHasKey(true);
    setShowSettings(false);
    triggerHaptic('success');
  };

  const quickPrompts = [
    { label: '🎯 Break Down Goal', prompt: 'Help me break down a major goal into 3 practical, weekly milestones.' },
    { label: '⚡ 21-Day Habit', prompt: 'Design an atomic daily habit routine using the 21-day challenge method.' },
    { label: '🔥 Streak Recovery', prompt: 'I missed my habit yesterday. How do I prevent losing motivation and get back on track?' },
    { label: '🧘 Morning Mindfulness', prompt: 'Give me a 5-minute morning mindfulness and intention-setting routine.' },
    { label: '🧠 Overcoming Procrastination', prompt: 'I keep delaying my key tasks. Give me a 2-minute actionable technique to start.' },
  ];

  const inlineClasses = {
    bold: 'text-white font-semibold',
    italic: 'text-purple-200',
    code: 'px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-mono text-xs',
    link: 'text-blue-400 hover:text-blue-300 underline underline-offset-2',
  };

  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-2 text-sm leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1.5" />;

          // Header bullet
          if (line.startsWith('### ')) {
            return (
              <h4 key={idx} className="text-sm font-bold text-purple-200 mt-2">
                {renderInlineMarkdown(line.replace('### ', ''), inlineClasses)}
              </h4>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h3 key={idx} className="text-base font-extrabold text-white mt-2.5">
                {renderInlineMarkdown(line.replace('## ', ''), inlineClasses)}
              </h3>
            );
          }

          // Bullet points
          if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            const content = line.trim().substring(2);
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0" />
                <span>{renderInlineMarkdown(content, inlineClasses)}</span>
              </div>
            );
          }

          // Numbered lists
          const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-xs font-bold text-purple-400 shrink-0 mt-0.5">
                  {numMatch[1]}.
                </span>
                <span>{renderInlineMarkdown(numMatch[2], inlineClasses)}</span>
              </div>
            );
          }

          return <p key={idx}>{renderInlineMarkdown(line, inlineClasses)}</p>;
        })}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-hidden flex flex-col justify-end sm:justify-center items-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl"
            onClick={onClose}
          />

          {/* Modal / Drawer Dialog */}
          <motion.div
            initial={{ opacity: 0, y: 120, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 120, scale: 0.96 }}
            transition={{ type: 'spring', damping: 28, stiffness: 340 }}
            className="relative z-10 w-full sm:max-w-2xl h-[90dvh] sm:h-[720px] flex flex-col rounded-t-[32px] sm:rounded-3xl bg-[#090d16] border-t sm:border border-white/10 shadow-2xl shadow-purple-950/40 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Drag Indicator Handle */}
            <div className="sm:hidden flex justify-center pt-3 pb-1.5 cursor-grab">
              <div className="w-12 h-1.5 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <Sparkles size={20} className="text-white fill-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 border-2 border-[#090d16]" />
                  </span>
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-white flex items-center gap-2 leading-tight">
                    <span>NexDev AI Coach</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      PRO
                    </span>
                  </h2>
                  <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
                    <span className="text-emerald-400 font-medium">Dual-Engine</span>
                    <span>•</span>
                    <span className="text-gray-500">Gemini Flash + NIM Failover</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleClearChat}
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors active:scale-95"
                  title="Clear conversation"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors active:scale-95 ${
                    showSettings
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
                  }`}
                  title="API Key Configuration"
                >
                  <Key size={16} />
                </button>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors active:scale-95 ml-1"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Token Configuration Banner */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-[#0d121f] border-b border-purple-500/20 px-5 py-4"
                >
                  <form onSubmit={handleSaveKey} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Key size={14} className="text-purple-400" />
                        AI Token Configuration
                      </span>
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-purple-300 hover:text-purple-200 flex items-center gap-1 underline"
                      >
                        Get Free Gemini Key <ExternalLink size={11} />
                      </a>
                    </div>
                    <p className="text-xs text-gray-400">
                      Keys are automatically loaded from <code className="text-purple-300">.env.local</code> / Vercel. You can also paste an override below:
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <select
                        value={providerInput}
                        onChange={(e) => setProviderInput(e.target.value as AIProvider)}
                        className="bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      >
                        <option value="gemini" className="bg-gray-900 text-white">Google Gemini (Recommended / Free)</option>
                        <option value="nvidia" className="bg-gray-900 text-white">NVIDIA NIM (Free Credits)</option>
                        <option value="groq" className="bg-gray-900 text-white">Groq (Llama 3.3 / Free)</option>
                        <option value="openai" className="bg-gray-900 text-white">OpenAI / OpenRouter</option>
                      </select>
                      <input
                        type="password"
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        placeholder="Paste API Key here..."
                        className="flex-1 px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-gray-500 text-xs focus:outline-none focus:border-purple-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold active:scale-95 transition-all shadow-md"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat Messages Feed */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto no-scrollbar space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-end gap-2.5 ${
                    msg.sender === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  {/* Sender Avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mb-1 ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md'
                        : 'bg-white/10 border border-white/10 text-purple-300'
                    }`}
                  >
                    {msg.sender === 'user' ? <User size={15} /> : <Bot size={15} />}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`group relative p-4 rounded-2xl max-w-[85%] sm:max-w-[78%] transition-all ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white rounded-br-none shadow-lg shadow-purple-600/20'
                        : 'bg-white/[0.04] border border-white/10 text-gray-200 rounded-bl-none shadow-lg backdrop-blur-md'
                    }`}
                  >
                    {/* Message Body */}
                    {msg.sender === 'user' ? (
                      <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                        {msg.text}
                      </div>
                    ) : (
                      renderFormattedText(msg.text)
                    )}

                    {/* Footer Info: Timestamp & Copy Button */}
                    <div className="mt-2.5 flex items-center justify-between text-[10px] text-gray-400 gap-2">
                      <span>{msg.timestamp}</span>
                      {msg.sender === 'ai' && (
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.text)}
                          className="opacity-60 hover:opacity-100 flex items-center gap-1 transition-opacity text-[10px]"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check size={11} className="text-emerald-400" />
                              <span className="text-emerald-400 font-semibold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={11} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Thinking Indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 max-w-xs text-purple-300"
                >
                  <div className="flex space-x-1.5">
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                  </div>
                  <span className="text-xs font-medium">Analyzing routines & formulating guidance...</span>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Carousel */}
            <div className="px-4 py-2.5 border-t border-white/5 bg-black/30 overflow-x-auto no-scrollbar flex items-center gap-2">
              {quickPrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(item.prompt)}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 border border-white/10 text-xs text-gray-300 font-medium whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5"
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Bottom Input Field Container */}
            <div className="p-3.5 sm:p-5 border-t border-white/10 bg-[#090d16]/95 backdrop-blur-xl pb-[max(0.85rem,env(safe-area-inset-bottom))]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2.5"
              >
                <div className="flex-1 relative flex items-center">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask your coach anything (habits, goals, routines)..."
                    disabled={loading}
                    className="w-full pl-4 pr-10 py-3 rounded-2xl bg-white/[0.06] border border-white/10 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-purple-500/50 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 disabled:opacity-30 disabled:scale-100 flex items-center justify-center text-white shrink-0 active:scale-90 transition-all shadow-lg shadow-purple-600/30 hover:brightness-110"
                  aria-label="Send message"
                >
                  <ArrowUp size={18} className="stroke-[2.5]" />
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
