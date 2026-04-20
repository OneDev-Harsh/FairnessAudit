'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles, ChevronRight } from 'lucide-react';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

interface FloatingChatbotProps {
  step: string;
  context: any;
}

export function FloatingChatbot({ step, context }: FloatingChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load suggestions and initial message when step changes
  useEffect(() => {
    async function loadSuggestions() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
        const res = await fetch(`${baseUrl}/chat/suggestions/${step}`);
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      } catch (error) {
        console.error('Failed to load suggestions', error);
      }
    }

    const greetings: Record<string, string> = {
      upload: "I can help you understand your data. Not sure which columns are sensitive or what to upload?",
      mapping: "Correct mapping is the foundation of a good audit. Need help deciding which columns are which?",
      analyze: "I've analyzed the fairness results. Want me to explain what these scores mean for your model?",
      explain: "We're looking 'under the hood' now. Ask me about SHAP values or those proxy warnings.",
      mitigate: "Mitigation is about balance. I can help you decide which algorithm is best for your use case.",
      report: "Your audit is complete! I can help you interpret the final report or suggest next steps.",
    };

    setMessages([
      { role: 'ai', content: greetings[step] || "How can I help you with your fairness audit today?" }
    ]);
    loadSuggestions();
  }, [step]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (query?: string) => {
    const text = query || input.trim();
    if (!text || loading) return;

    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
      const response = await fetch(`${baseUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text,
          report_context: context,
          step: step
        })
      });

      if (!response.ok) throw new Error('Failed to get response');
      
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-[380px] h-[550px] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-[var(--bg-primary)] border-b border-[var(--border-color)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                  <Bot size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">AI Consultant</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Step: {step}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
            >
              {messages.map((msg, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={idx} 
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-white/40 border border-white/5'}`}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`p-3 rounded-2xl max-w-[85%] text-sm leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-[var(--bg-primary)] border border-[var(--border-color)] text-white/80'}`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 text-white/40">
                    <Bot size={16} />
                  </div>
                  <div className="p-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-white/40 flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    <span className="text-xs font-medium">Analyzing...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions */}
            {messages.length < 3 && suggestions.length > 0 && (
              <div className="px-4 py-2 flex flex-wrap gap-2 mb-2">
                {suggestions.map(s => (
                  <button 
                    key={s}
                    onClick={() => handleSend(s)}
                    className="text-[10px] bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-white/60 hover:text-white px-2.5 py-1.5 rounded-full transition-all flex items-center gap-1"
                  >
                    <Sparkles size={10} className="text-indigo-400" />
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-4 bg-[var(--bg-primary)] border-t border-[var(--border-color)]">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask a question..."
                  className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                  disabled={loading}
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={loading || !input.trim()}
                  className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 ${isOpen ? 'bg-white text-indigo-600 rotate-90' : 'bg-indigo-600 text-white'}`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[var(--bg-primary)]" />
        )}
      </motion.button>
    </div>
  );
}
