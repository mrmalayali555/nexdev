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
  Flame,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { askAICoach, getAIApiKey, saveAIApiKey, isAIConfigured, AIProvider } from '@/lib/ai';
import { triggerHaptic } from '@/lib/haptics';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

interface AICoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  contextSummary?: string;
}

export default function AICoachModal({
  isOpen,
  onClose,
  contextSummary,
}: AICoachModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "👋 Hey there! I'm your **NexDev AI Coach**.\n\nI can help you break down difficult goals into realistic milestones, design atomic habit routines, or give personalized advice on your streaks. What are we conquering today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [providerInput, setProviderInput] = useState<AIProvider>('gemini');
  const [hasKey, setHasKey] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const configured = isAIConfigured();
      setHasKey(configured);
      setApiKeyInput(getAIApiKey());
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    triggerHaptic('light');

    const userMsg: Message = {
      id: `${Date.now()}-user`,
      sender: 'user',
      text: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const aiReply = await askAICoach(text.trim(), contextSummary);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-ai`,
          sender: 'ai',
          text: aiReply,
        },
      ]);
      triggerHaptic('success');
    } catch (err: any) {
      console.error('AI Coach Error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-err`,
          sender: 'ai',
          text: `⚠️ **Unable to connect**: ${err?.message || 'Check your API token'}.\n\nTap the **API Key Settings** icon above to configure your free Gemini or Groq key.`,
        },
      ]);
      triggerHaptic('warning');
    } finally {
      setLoading(false);
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
    '🎯 Break down my goal into 3 milestones',
    '⚡ Suggest 3 daily habits for productivity',
    '🔥 How do I bounce back if I missed a day?',
    '🧘 Give me a morning mindfulness routine',
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
            onClick={onClose}
          />

          {/* Modal / Bottom Sheet */}
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="pointer-events-auto w-full sm:max-w-xl h-[88vh] sm:h-[680px] flex flex-col rounded-t-[32px] sm:rounded-3xl bg-gray-950/95 backdrop-blur-2xl border-t sm:border border-purple-500/30 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag Handle on mobile */}
              <div className="sm:hidden flex justify-center pt-3 pb-1">
                <div className="w-12 h-1.5 rounded-full bg-white/20" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-purple-950/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 via-indigo-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <Sparkles size={18} className="text-white fill-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-white flex items-center gap-1.5 leading-none">
                      <span>NexDev AI Coach</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase">
                        AI
                      </span>
                    </h2>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {hasKey ? '● Connected & Ready' : '○ Needs API Key'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    title="Configure AI API Token"
                  >
                    <Key size={16} />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Settings Dropdown View */}
              {showSettings && (
                <div className="p-4 bg-purple-950/40 border-b border-purple-500/20">
                  <form onSubmit={handleSaveKey} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Key size={14} className="text-purple-400" />
                        AI Token Configuration
                      </span>
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-purple-300 hover:text-purple-200 flex items-center gap-1 underline font-medium"
                      >
                        Get Free Gemini Key <ExternalLink size={11} />
                      </a>
                    </div>
                    <p className="text-[11px] text-gray-300 leading-relaxed">
                      You can add <code className="text-purple-300 font-mono">NEXT_PUBLIC_GEMINI_API_KEY</code> in your Vercel Dashboard, or paste your token below (saved locally in your app):
                    </p>

                    <div className="flex gap-2">
                      <select
                        value={providerInput}
                        onChange={(e) => setProviderInput(e.target.value as AIProvider)}
                        className="bg-white/10 border border-white/15 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="gemini" className="bg-gray-900 text-white">Google Gemini (Recommended / Free)</option>
                        <option value="groq" className="bg-gray-900 text-white">Groq (Llama 3.3 / Free)</option>
                        <option value="nvidia" className="bg-gray-900 text-white">NVIDIA NIM (Free Credits)</option>
                        <option value="openai" className="bg-gray-900 text-white">OpenAI / OpenRouter</option>
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        placeholder="Paste your API key here (AIzaSy... / gsk_...)"
                        className="flex-1 px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-gray-500 text-xs focus:outline-none focus:border-purple-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold active:scale-95 transition-all shadow-md shadow-purple-500/20"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Chat Messages Feed */}
              <div className="flex-1 p-4 overflow-y-auto no-scrollbar space-y-3.5">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${
                      msg.sender === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        msg.sender === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gradient-to-tr from-purple-500 to-blue-500 text-white'
                      }`}
                    >
                      {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[85%] ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none'
                          : 'bg-white/[0.05] border border-white/10 text-gray-200 rounded-tl-none'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex items-center gap-2 text-xs text-purple-300 p-2">
                    <RefreshCw size={14} className="animate-spin text-purple-400" />
                    <span>NexDev AI is thinking...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts Carousel */}
              <div className="overflow-x-auto no-scrollbar flex items-center gap-2 px-4 py-2 border-t border-white/5 bg-black/20 touch-pan-x">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    disabled={loading}
                    className="px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 border border-white/10 text-[11px] text-gray-300 font-medium whitespace-nowrap shrink-0 transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <div className="p-3.5 sm:p-4 border-t border-white/10 bg-gray-950">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      hasKey
                        ? 'Ask for coaching, habits, or milestones...'
                        : 'Tap 🔑 above or enter Gemini token to chat...'
                    }
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 text-xs sm:text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="w-10 h-10 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 disabled:opacity-40 flex items-center justify-center text-white shrink-0 active:scale-90 transition-transform shadow-md shadow-purple-500/25"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

